#!/usr/bin/env node
// 随机图端点的定时探活：loliapi 这类源单张图会 404，只有反复采样才能看出整体是否还活着。
// 纯 Node 内置能力实现，不引入依赖；逻辑与 CLI 分离，便于被 vitest 直接导入测试。
import { pathToFileURL } from "node:url";

export const DEFAULT_ENDPOINTS = [
  "https://www.loliapi.com/acg/pc/",
  "https://www.loliapi.com/acg/pe/",
];

export const DEFAULT_OPTIONS = {
  samples: 10,
  timeoutMs: 15_000,
  minBytes: 10_240,
  degradedThreshold: 0.3,
};

const EXIT_CODE = { healthy: 0, degraded: 1, dead: 2 };

export function classifyFailures(failCount, total, degradedThreshold) {
  if (total <= 0) return "dead";
  if (failCount <= 0) return "healthy";
  return failCount / total >= degradedThreshold ? "dead" : "degraded";
}

// 逐条判定一次请求是否算成功；失败必须留下可诊断的证据（状态码 / content-type / 原因）。
export function evaluateSample(sample, options) {
  const { status, contentType, contentLength, error } = sample;
  if (error) return { ok: false, reason: "request-error" };
  if (status < 200 || status >= 300) return { ok: false, reason: "bad-status" };
  if (!(contentType ?? "").toLowerCase().startsWith("image/")) {
    return { ok: false, reason: "bad-content-type" };
  }
  if (contentLength === null || contentLength < options.minBytes) {
    return { ok: false, reason: "too-small" };
  }
  return { ok: true, reason: null };
}

async function probeOnce(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "blog-bg-healthcheck/1.0" },
    });
    // 只需要响应头；立刻取消，避免把整张图读进内存（每次 10 张会白烧流量）
    const contentType = res.headers.get("content-type");
    const rawLength = res.headers.get("content-length");
    const contentLength = rawLength === null ? null : Number(rawLength);
    try {
      await res.body?.cancel();
    } catch {
      // 已经被消费/关闭，忽略
    }
    return {
      ok: true,
      status: res.status,
      contentType,
      contentLength: Number.isFinite(contentLength) ? contentLength : null,
    };
  } catch (err) {
    return {
      ok: true,
      status: 0,
      contentType: null,
      contentLength: null,
      error:
        err?.name === "AbortError" ? "timeout" : String(err?.message ?? err),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkEndpoint(url, options) {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const samples = [];
  for (let i = 0; i < merged.samples; i += 1) {
    // _t 打散边缘缓存，否则 10 次采样会命中同一张缓存图，失去采样意义
    const probeUrl = new URL(url);
    probeUrl.searchParams.set("_t", String(Date.now() + i));
    const raw = await probeOnce(probeUrl.toString(), merged);
    const verdict = evaluateSample(raw, merged);
    samples.push({
      url: probeUrl.toString(),
      status: raw.status ?? 0,
      contentType: raw.contentType ?? null,
      contentLength: raw.contentLength ?? null,
      ok: verdict.ok,
      reason: verdict.reason,
      error: raw.error ?? null,
    });
  }

  const failures = samples.filter((s) => !s.ok);
  const classification = classifyFailures(
    failures.length,
    samples.length,
    merged.degradedThreshold,
  );
  return {
    endpoint: url,
    classification,
    total: samples.length,
    passed: samples.length - failures.length,
    failed: failures.length,
    failureRate: samples.length ? failures.length / samples.length : 1,
    // 失败样本只留前 3 条，报告里足够定位问题又不至于淹没输出
    failureSamples: failures.slice(0, 3),
  };
}

export function exitCodeFor(reports) {
  let code = EXIT_CODE.healthy;
  for (const report of reports) {
    if (report.classification === "dead") return EXIT_CODE.dead;
    if (report.classification === "degraded") code = EXIT_CODE.degraded;
  }
  return code;
}

function parseArgs(argv) {
  const endpoints = [];
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--endpoint" || arg === "-e") {
      if (next) endpoints.push(next);
      i += 1;
    } else if (arg === "--samples") {
      options.samples = Number(next);
      i += 1;
    } else if (arg === "--timeout-ms") {
      options.timeoutMs = Number(next);
      i += 1;
    } else if (arg === "--min-bytes") {
      options.minBytes = Number(next);
      i += 1;
    } else if (arg === "--degraded-threshold") {
      options.degradedThreshold = Number(next);
      i += 1;
    } else if (arg === "--json-only") {
      options.jsonOnly = true;
    }
  }
  const envEndpoints = (process.env.LOLIAPI_ENDPOINTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    endpoints:
      endpoints.length > 0
        ? endpoints
        : envEndpoints.length > 0
          ? envEndpoints
          : DEFAULT_ENDPOINTS,
    options,
  };
}

function printHuman(report) {
  const label = report.classification.toUpperCase();
  console.log(
    `[${label}] ${report.endpoint}  pass=${report.passed}/${report.total} fail=${report.failed} rate=${(report.failureRate * 100).toFixed(0)}%`,
  );
  for (const sample of report.failureSamples) {
    console.log(
      `  - status=${sample.status} content-type=${sample.contentType ?? "none"} bytes=${sample.contentLength ?? "none"} reason=${sample.reason}${sample.error ? ` error=${sample.error}` : ""}`,
    );
    console.log(`    ${sample.url}`);
  }
}

export async function main(argv) {
  const { endpoints, options } = parseArgs(argv);
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const reports = [];
  for (const endpoint of endpoints) {
    reports.push(await checkEndpoint(endpoint, merged));
  }

  if (!options.jsonOnly) {
    console.log(
      `random-image healthcheck: ${reports.length} endpoint(s), samples=${merged.samples}, timeout=${merged.timeoutMs}ms, minBytes=${merged.minBytes}`,
    );
    for (const report of reports) printHuman(report);
  }

  const code = exitCodeFor(reports);
  const payload = {
    checkedAt: new Date().toISOString(),
    options: merged,
    exitCode: code,
    summary: {
      healthy: reports.filter((r) => r.classification === "healthy").length,
      degraded: reports.filter((r) => r.classification === "degraded").length,
      dead: reports.filter((r) => r.classification === "dead").length,
    },
    reports,
  };
  console.log(JSON.stringify(payload, null, 2));
  return code;
}

// 仅在被直接执行时跑 CLI；被 import 时只导出纯函数
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error("healthcheck crashed:", err);
      process.exit(2);
    });
}
