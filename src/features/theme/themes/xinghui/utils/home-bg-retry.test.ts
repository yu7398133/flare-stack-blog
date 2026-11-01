import { describe, expect, it } from "vitest";
import {
  HOME_BG_MAX_RETRIES,
  resolveHomeBgFailure,
  withCacheBuster,
} from "./home-bg-retry";

/**
 * 随机图源单张 404 时应该换一张，但源整体挂掉时绝不能变成请求风暴，
 * 所以失败计数必须有硬上限；静态图路径固定，重试等于白打请求。
 */
describe("resolveHomeBgFailure", () => {
  it("随机端点在失败次数未达上限时重试", () => {
    for (let failures = 0; failures < HOME_BG_MAX_RETRIES; failures += 1) {
      const action = resolveHomeBgFailure({
        failures,
        totalRetries: failures,
        isRandom: true,
      });
      expect(action.kind).toBe("retry");
      expect(action.nextFailures).toBe(failures + 1);
      expect(action.totalRetries).toBe(failures + 1);
    }
  });

  it("连续失败达到上限后放弃且不再增加重试次数", () => {
    const action = resolveHomeBgFailure({
      failures: HOME_BG_MAX_RETRIES,
      totalRetries: HOME_BG_MAX_RETRIES,
      isRandom: true,
    });
    expect(action.kind).toBe("giveUp");
    expect(action.totalRetries).toBe(HOME_BG_MAX_RETRIES);
  });

  it("模拟源整体挂掉：无论失败多少次，实际请求次数不超过上限", () => {
    let failures = 0;
    let totalRetries = 0;
    for (let i = 0; i < 50; i += 1) {
      const action = resolveHomeBgFailure({
        failures,
        totalRetries,
        isRandom: true,
      });
      failures = action.nextFailures;
      totalRetries = action.totalRetries;
    }
    expect(totalRetries).toBe(HOME_BG_MAX_RETRIES);
  });

  it("静态图失败一次就放弃，不重试", () => {
    const action = resolveHomeBgFailure({
      failures: 0,
      totalRetries: 0,
      isRandom: false,
    });
    expect(action.kind).toBe("giveUp");
    expect(action.totalRetries).toBe(0);
  });
});

describe("withCacheBuster", () => {
  it("没有查询串时用 ? 拼接", () => {
    expect(withCacheBuster("https://a.com/bg", 1)).toBe(
      "https://a.com/bg?_t=1",
    );
  });

  it("已有查询串时用 & 拼接", () => {
    expect(withCacheBuster("https://a.com/bg?x=1", 2)).toBe(
      "https://a.com/bg?x=1&_t=2",
    );
  });
});
