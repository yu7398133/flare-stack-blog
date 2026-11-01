import { blogConfig } from "@/blog.config";
import {
  checkEndpointHealth,
  type EndpointReport,
} from "@/features/theme/background-health";

/**
 * 每天跑一次的随机图巡检。
 *
 * 之所以放在自己的 Worker 里而不是外面单独挂一个探测器：随机图配置本来就随
 * 这个项目走（blog.config.ts 的 homeBg），判定依赖的也是项目内的约定，外挂
 * 探测器会变成第二份真相。代价是只写日志，修复动作仍由人决定。
 */

/** 巡检的端点：主题实际的 homeBg，外加同源备用端点，便于对比谁先坏 */
export function resolveCheckEndpoints(): string[] {
  const primary = blogConfig.theme.xinghui.homeBg;
  const endpoints = new Set<string>();
  if (primary) endpoints.add(primary);
  endpoints.add("https://www.loliapi.com/acg/pc/");
  endpoints.add("https://www.loliapi.com/acg/pe/");
  return [...endpoints];
}

export interface HealthSummary {
  checkedAt: string;
  overall: "healthy" | "degraded" | "dead";
  reports: EndpointReport[];
}

export function summarize(reports: EndpointReport[]): HealthSummary {
  const overall = reports.some((r) => r.classification === "dead")
    ? "dead"
    : reports.some((r) => r.classification === "degraded")
      ? "degraded"
      : "healthy";
  return { checkedAt: new Date().toISOString(), overall, reports };
}

export async function runBackgroundHealthCheck(): Promise<HealthSummary> {
  const endpoints = resolveCheckEndpoints();
  const reports: EndpointReport[] = [];
  for (const endpoint of endpoints) {
    reports.push(await checkEndpointHealth(endpoint));
  }
  const summary = summarize(reports);

  // 结构化单行 JSON，Workers Logs 里可直接按 overall 过滤或建告警
  console.log(
    JSON.stringify({
      event: "random-image-healthcheck",
      overall: summary.overall,
      checkedAt: summary.checkedAt,
      reports: summary.reports.map((r) => ({
        endpoint: r.endpoint,
        classification: r.classification,
        passed: r.passed,
        failed: r.failed,
        failureRate: Number(r.failureRate.toFixed(2)),
        samples: r.samples.filter((s) => s.reason !== null).slice(0, 3),
      })),
    }),
  );

  return summary;
}
