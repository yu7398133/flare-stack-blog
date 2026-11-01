/**
 * 随机背景图端点的健康判定。
 *
 * 前端兜底只能救「这一张坏了」，救不了「源整体坏了」——loliapi 这类随机图
 * 端点实测会整批返回 404。定时巡检复用这里的纯函数，保证 Worker、CLI 脚本与
 * 测试对「健康」的定义完全一致，不会各判各的。
 */

export const HEALTH_DEFAULTS = {
  samples: 10,
  timeoutMs: 15_000,
  /** 低于此字节数的响应几乎必然是错误页而非图片 */
  minBytes: 10_240,
  /** 失败率超过这个比例即判定整源不可用 */
  degradedThreshold: 0.3,
} as const;

export type HealthClass = "healthy" | "degraded" | "dead";

export interface SampleInput {
  status: number;
  contentType: string | null;
  contentLength: number | null;
  error?: string | null;
}

export type SampleFailure =
  | "request-error"
  | "bad-status"
  | "bad-content-type"
  | "too-small";

export function evaluateSample(
  sample: SampleInput,
  minBytes: number = HEALTH_DEFAULTS.minBytes,
): { ok: true; reason: null } | { ok: false; reason: SampleFailure } {
  if (sample.error) return { ok: false, reason: "request-error" };
  if (sample.status < 200 || sample.status >= 300) {
    return { ok: false, reason: "bad-status" };
  }
  if (!(sample.contentType ?? "").toLowerCase().startsWith("image/")) {
    return { ok: false, reason: "bad-content-type" };
  }
  // 缺 content-length 不能当通过：无法证明这是张完整的图
  if (sample.contentLength === null || sample.contentLength < minBytes) {
    return { ok: false, reason: "too-small" };
  }
  return { ok: true, reason: null };
}

export function classifyHealth(
  failed: number,
  total: number,
  degradedThreshold: number = HEALTH_DEFAULTS.degradedThreshold,
): HealthClass {
  // 一个样本都没拿到不等于健康
  if (total <= 0) return "dead";
  if (failed <= 0) return "healthy";
  return failed / total >= degradedThreshold ? "dead" : "degraded";
}

export interface EndpointReport {
  endpoint: string;
  total: number;
  passed: number;
  failed: number;
  failureRate: number;
  classification: HealthClass;
  samples: Array<{
    url: string;
    status: number;
    contentType: string | null;
    contentLength: number | null;
    reason: SampleFailure | null;
    error?: string;
  }>;
}

/** 只读响应头就断开，避免把整张图读进内存白烧流量 */
async function probeOnce(
  url: string,
  timeoutMs: number,
): Promise<SampleInput & { url: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "blog-bg-healthcheck/1.0" },
    });
    const contentType = res.headers.get("content-type");
    const rawLength = res.headers.get("content-length");
    const contentLength = rawLength === null ? null : Number(rawLength);
    try {
      await res.body?.cancel();
    } catch {
      // 已被消费或关闭，忽略
    }
    return { url, status: res.status, contentType, contentLength };
  } catch (err) {
    return {
      url,
      status: 0,
      contentType: null,
      contentLength: null,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

export interface CheckOptions {
  samples?: number;
  timeoutMs?: number;
  minBytes?: number;
  degradedThreshold?: number;
}

export async function checkEndpointHealth(
  endpoint: string,
  options: CheckOptions = {},
): Promise<EndpointReport> {
  const samples = options.samples ?? HEALTH_DEFAULTS.samples;
  const timeoutMs = options.timeoutMs ?? HEALTH_DEFAULTS.timeoutMs;
  const minBytes = options.minBytes ?? HEALTH_DEFAULTS.minBytes;
  const threshold =
    options.degradedThreshold ?? HEALTH_DEFAULTS.degradedThreshold;

  const sep = endpoint.includes("?") ? "&" : "?";
  const probes = await Promise.all(
    Array.from({ length: samples }, (_, i) =>
      probeOnce(`${endpoint}${sep}_t=${Date.now()}${i}`, timeoutMs),
    ),
  );

  const results = probes.map((probe) => {
    const verdict = evaluateSample(probe, minBytes);
    return {
      url: probe.url,
      status: probe.status,
      contentType: probe.contentType,
      contentLength: probe.contentLength,
      reason: verdict.ok ? null : verdict.reason,
      ...(probe.error ? { error: probe.error } : {}),
    };
  });

  const failed = results.filter((r) => r.reason !== null).length;
  return {
    endpoint,
    total: samples,
    passed: samples - failed,
    failed,
    failureRate: samples === 0 ? 1 : failed / samples,
    classification: classifyHealth(failed, samples, threshold),
    samples: results,
  };
}
