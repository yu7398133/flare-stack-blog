import { describe, expect, it } from "vitest";
import {
  createAuthError,
  createPermissionError,
  createRateLimitError,
  createTurnstileError,
  parseRequestError,
} from "@/lib/errors/request-errors";

/**
 * 这些错误是 admin/authed server function 的鉴权命脉：
 * 中间件抛出它们，客户端靠 parseRequestError 判断「该跳登录」还是「没权限」。
 * 此前零覆盖，协议一旦不对称（如改前缀、改字段名）会在运行时静默降级为
 * UNKNOWN，前端就再也分不清 401 与 403。
 */
describe("request-errors 协议", () => {
  describe("编码-解码对称性", () => {
    it("createAuthError 编码后能被解析回 UNAUTHENTICATED", () => {
      expect(parseRequestError(createAuthError())).toEqual({
        code: "UNAUTHENTICATED",
      });
    });

    it("createPermissionError 编码后能被解析回 PERMISSION_DENIED", () => {
      expect(parseRequestError(createPermissionError())).toEqual({
        code: "PERMISSION_DENIED",
      });
    });

    it("createRateLimitError 保留 retryAfterMs", () => {
      expect(parseRequestError(createRateLimitError(1500))).toEqual({
        code: "RATE_LIMITED",
        retryAfterMs: 1500,
      });
    });

    it("createTurnstileError 默认 detail 为 VERIFY_FAILED", () => {
      expect(parseRequestError(createTurnstileError())).toEqual({
        code: "TURNSTILE_FAILED",
        detail: "VERIFY_FAILED",
      });
    });

    it("createTurnstileError 可指定 MISSING_TOKEN", () => {
      expect(parseRequestError(createTurnstileError("MISSING_TOKEN"))).toEqual({
        code: "TURNSTILE_FAILED",
        detail: "MISSING_TOKEN",
      });
    });
  });

  describe("异常输入的降级行为", () => {
    it("普通 Error 降级为 UNKNOWN 并保留原始消息", () => {
      const result = parseRequestError(new Error("boom"));
      expect(result.code).toBe("UNKNOWN");
      expect(result).toMatchObject({ message: "boom" });
    });

    it("前缀正确但 JSON 损坏时降级为 UNKNOWN（不抛异常）", () => {
      const result = parseRequestError(
        new Error("__REQ_ERR__:{ this is not json"),
      );
      expect(result.code).toBe("UNKNOWN");
    });

    it("前缀正确但 payload 不符合 schema 时降级为 UNKNOWN", () => {
      const result = parseRequestError(
        new Error('__REQ_ERR__:{"v":1,"error":{"code":"NOT_A_REAL_CODE"}}'),
      );
      expect(result.code).toBe("UNKNOWN");
    });

    it("版本号不匹配时降级为 UNKNOWN", () => {
      const result = parseRequestError(
        new Error('__REQ_ERR__:{"v":2,"error":{"code":"UNAUTHENTICATED"}}'),
      );
      expect(result.code).toBe("UNKNOWN");
    });

    it("retryAfterMs 为负数时降级为 UNKNOWN（schema 拒绝）", () => {
      const result = parseRequestError(
        new Error(
          '__REQ_ERR__:{"v":1,"error":{"code":"RATE_LIMITED","retryAfterMs":-1}}',
        ),
      );
      expect(result.code).toBe("UNKNOWN");
    });

    it("null / undefined 不会崩溃", () => {
      expect(parseRequestError(null).code).toBe("UNKNOWN");
      expect(parseRequestError(undefined).code).toBe("UNKNOWN");
    });

    it("字符串输入也能处理", () => {
      expect(parseRequestError("plain string").code).toBe("UNKNOWN");
    });
  });

  describe("安全契约：鉴权错误必须可区分", () => {
    it("未登录与无权限解析出不同的 code（否则前端无法区分 401/403）", () => {
      const auth = parseRequestError(createAuthError());
      const perm = parseRequestError(createPermissionError());
      expect(auth.code).not.toBe(perm.code);
    });

    it("错误消息前缀不会泄露到解析结果中", () => {
      const result = parseRequestError(createAuthError());
      expect(JSON.stringify(result)).not.toContain("__REQ_ERR__");
    });
  });
});
