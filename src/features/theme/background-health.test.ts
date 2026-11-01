import { describe, expect, it } from "vitest";
import type { EndpointReport } from "./background-health";
import {
  classifyHealth,
  evaluateSample,
  HEALTH_DEFAULTS,
} from "./background-health";
import { summarize } from "./background-health.cron";

const minBytes = HEALTH_DEFAULTS.minBytes;
const good = {
  status: 200,
  contentType: "image/webp",
  contentLength: 200_000,
  error: null,
};

describe("evaluateSample", () => {
  it("正常图片算通过", () => {
    expect(evaluateSample(good, minBytes)).toEqual({ ok: true, reason: null });
  });

  // 实测失效图的表现：302 跳到图床后返回 404 + text/html + 130 字节
  it("404 判为 bad-status", () => {
    expect(evaluateSample({ ...good, status: 404 }, minBytes)).toEqual({
      ok: false,
      reason: "bad-status",
    });
  });

  it("200 但返回 html 不算图片", () => {
    expect(
      evaluateSample({ ...good, contentType: "text/html" }, minBytes),
    ).toEqual({ ok: false, reason: "bad-content-type" });
  });

  it("过小的响应视为错误页", () => {
    expect(evaluateSample({ ...good, contentLength: 130 }, minBytes)).toEqual({
      ok: false,
      reason: "too-small",
    });
  });

  it("缺 content-length 不能放行", () => {
    expect(evaluateSample({ ...good, contentLength: null }, minBytes)).toEqual({
      ok: false,
      reason: "too-small",
    });
  });

  it("请求异常优先判定", () => {
    expect(
      evaluateSample({ ...good, status: 0, error: "aborted" }, minBytes),
    ).toEqual({ ok: false, reason: "request-error" });
  });
});

describe("classifyHealth", () => {
  it("零失败为 healthy", () => {
    expect(classifyHealth(0, 10)).toBe("healthy");
  });

  it("少量失败为 degraded", () => {
    expect(classifyHealth(2, 10)).toBe("degraded");
  });

  it("失败率达到阈值为 dead", () => {
    expect(classifyHealth(3, 10)).toBe("dead");
  });

  it("零样本不算健康", () => {
    expect(classifyHealth(0, 0)).toBe("dead");
  });
});

describe("summarize", () => {
  const make = (
    classification: EndpointReport["classification"],
  ): EndpointReport => ({
    endpoint: "https://example.com/acg/",
    total: 10,
    passed: 10,
    failed: 0,
    failureRate: 0,
    classification,
    samples: [],
  });

  it("全健康时 overall 为 healthy", () => {
    expect(summarize([make("healthy"), make("healthy")]).overall).toBe(
      "healthy",
    );
  });

  it("有 degraded 时 overall 为 degraded", () => {
    expect(summarize([make("healthy"), make("degraded")]).overall).toBe(
      "degraded",
    );
  });

  it("只要有一个 dead，overall 就是 dead", () => {
    expect(summarize([make("degraded"), make("dead")]).overall).toBe("dead");
  });
});
