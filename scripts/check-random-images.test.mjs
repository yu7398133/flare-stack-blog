import { describe, expect, it } from "vitest";
import {
  classifyFailures,
  DEFAULT_ENDPOINTS,
  DEFAULT_OPTIONS,
  evaluateSample,
  exitCodeFor,
} from "./check-random-images.mjs";

/**
 * 探活脚本的判定逻辑必须能被导入测试，否则只能靠手跑命令行，
 * cron 里的退出码语义也就无从回归。
 */
describe("evaluateSample", () => {
  const opts = { ...DEFAULT_OPTIONS };

  it("2xx + image/* + 足够大 → 成功", () => {
    const verdict = evaluateSample(
      { status: 200, contentType: "image/webp", contentLength: 200_000 },
      opts,
    );
    expect(verdict.ok).toBe(true);
    expect(verdict.reason).toBeNull();
  });

  it("404（跟随后）即使有 content-type 也算失败", () => {
    const verdict = evaluateSample(
      { status: 404, contentType: "text/html", contentLength: 130 },
      opts,
    );
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toBe("bad-status");
  });

  it("非 image/ 的 content-type 算失败", () => {
    const verdict = evaluateSample(
      {
        status: 200,
        contentType: "text/html; charset=utf-8",
        contentLength: 500_000,
      },
      opts,
    );
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toBe("bad-content-type");
  });

  it("缺少 content-length 或低于下限算失败", () => {
    expect(
      evaluateSample(
        { status: 200, contentType: "image/jpeg", contentLength: null },
        opts,
      ).reason,
    ).toBe("too-small");
    expect(
      evaluateSample(
        { status: 200, contentType: "image/jpeg", contentLength: 500 },
        opts,
      ).reason,
    ).toBe("too-small");
  });

  it("请求异常（超时等）算失败", () => {
    const verdict = evaluateSample(
      { status: 0, contentType: null, contentLength: null, error: "timeout" },
      opts,
    );
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toBe("request-error");
  });
});

describe("classifyFailures", () => {
  it("0 失败是 healthy", () => {
    expect(classifyFailures(0, 10, 0.3)).toBe("healthy");
  });

  it("失败率低于阈值是 degraded", () => {
    expect(classifyFailures(1, 10, 0.3)).toBe("degraded");
    expect(classifyFailures(2, 10, 0.3)).toBe("degraded");
  });

  it("失败率达到阈值是 dead", () => {
    expect(classifyFailures(3, 10, 0.3)).toBe("dead");
    expect(classifyFailures(10, 10, 0.3)).toBe("dead");
    expect(classifyFailures(1, 2, 0.5)).toBe("dead");
  });

  it("一次采样都没成功执行时视为 dead", () => {
    expect(classifyFailures(0, 0, 0.3)).toBe("dead");
  });
});

describe("exitCodeFor", () => {
  it("全 healthy 返回 0", () => {
    expect(exitCodeFor([{ classification: "healthy" }])).toBe(0);
  });

  it("有 degraded 返回 1", () => {
    expect(
      exitCodeFor([
        { classification: "healthy" },
        { classification: "degraded" },
      ]),
    ).toBe(1);
  });

  it("有 dead 返回 2 且优先于 degraded", () => {
    expect(
      exitCodeFor([{ classification: "degraded" }, { classification: "dead" }]),
    ).toBe(2);
  });
});

describe("默认配置", () => {
  it("内置两个 loliapi 端点", () => {
    expect(DEFAULT_ENDPOINTS).toEqual([
      "https://www.loliapi.com/acg/pc/",
      "https://www.loliapi.com/acg/pe/",
    ]);
  });

  it("默认 10 次采样、10KB 下限、0.3 阈值", () => {
    expect(DEFAULT_OPTIONS.samples).toBe(10);
    expect(DEFAULT_OPTIONS.minBytes).toBe(10_240);
    expect(DEFAULT_OPTIONS.degradedThreshold).toBe(0.3);
  });
});
