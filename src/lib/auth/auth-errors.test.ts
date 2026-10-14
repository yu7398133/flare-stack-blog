import { describe, expect, it } from "vitest";
import {
  getForgotPasswordAuthErrorMessage,
  getLoginAuthErrorMessage,
  getRegisterAuthErrorMessage,
  getResetPasswordAuthErrorMessage,
  isEmailNotVerifiedError,
} from "@/lib/auth/auth-errors";

/**
 * 登录/注册/找回密码的错误码 → 文案映射。
 *
 * 这里出错不会抛异常，只会「显示错误的提示」：把「密码错误」显示成
 * 「用户不存在」，或在未知错误码上返回 undefined 让界面**静默无提示**——
 * 用户点了登录、什么都没发生，也看不到原因。此前该文件零覆盖。
 */

/** 只实现被测代码真正会调用的键，任何缺失的键都会立刻抛错。 */
function createMessages(overrides: Record<string, unknown> = {}) {
  const called: Array<string> = [];
  const make = (name: string) => (params?: Record<string, string>) => {
    called.push(params ? `${name}(${JSON.stringify(params)})` : name);
    return `[${name}]`;
  };
  const messages = new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        if (overrides[prop]) return overrides[prop];
        return make(prop);
      },
    },
  );
  return { messages, called };
}

describe("auth-errors", () => {
  describe("登录错误", () => {
    it("邮箱未验证给出专用提示", () => {
      const { messages } = createMessages();
      expect(
        getLoginAuthErrorMessage(
          { code: "EMAIL_NOT_VERIFIED" },
          messages as never,
        ),
      ).toBe("[login_error_email_not_verified]");
    });

    it("凭据错误统一提示为「邮箱或密码错误」", () => {
      const { messages } = createMessages();
      expect(
        getLoginAuthErrorMessage(
          { code: "INVALID_EMAIL_OR_PASSWORD" },
          messages as never,
        ),
      ).toBe("[login_error_invalid_credentials]");
    });

    it("用户不存在时也提示「邮箱或密码错误」，不泄露账号是否存在", () => {
      const { messages } = createMessages();
      // 这是刻意的：区分「用户不存在」与「密码错误」等于给攻击者一个
      // 枚举已注册邮箱的接口。
      expect(
        getLoginAuthErrorMessage({ code: "USER_NOT_FOUND" }, messages as never),
      ).toBe("[login_error_invalid_credentials]");
    });

    it("密码错误给出通用密码提示（此处不涉及账号枚举）", () => {
      const { messages } = createMessages();
      expect(
        getLoginAuthErrorMessage(
          { code: "INVALID_PASSWORD" },
          messages as never,
        ),
      ).toBe("[auth_error_invalid_password]");
    });
  });

  describe("限流错误", () => {
    it("按 retryAfterMs 换算为秒并向上取整", () => {
      const { messages, called } = createMessages();
      // 用 1100ms：向上取整得 2 秒，四舍五入得 1 秒 —— 只有 ceil 才安全，
      // 报少了会让用户在仍被限流时就重试。
      getLoginAuthErrorMessage(
        { code: "RATE_LIMITED", retryAfterMs: 1100 },
        messages as never,
      );
      expect(called).toContain(
        'request_error_rate_limited_desc({"seconds":"2"})',
      );
    });

    it("缺失或非法的 retryAfterMs 回退为 60 秒", () => {
      const { messages, called } = createMessages();
      getLoginAuthErrorMessage({ code: "RATE_LIMITED" }, messages as never);
      getLoginAuthErrorMessage(
        { code: "RATE_LIMITED", retryAfterMs: null },
        messages as never,
      );
      // login 分支会先把兜底文案作为实参求值（JS 参数求值顺序），
      // 所以这里只挑出真正决定「几秒后重试」的那次调用。
      expect(
        called.filter((c) => c.startsWith("request_error_rate_limited_desc")),
      ).toEqual([
        'request_error_rate_limited_desc({"seconds":"60"})',
        'request_error_rate_limited_desc({"seconds":"60"})',
      ]);
    });

    it("retryAfterMs 为 0 时至少报 1 秒，避免出现「0 秒后重试」", () => {
      const { messages, called } = createMessages();
      getLoginAuthErrorMessage(
        { code: "RATE_LIMITED", retryAfterMs: 0 },
        messages as never,
      );
      expect(called).toContain(
        'request_error_rate_limited_desc({"seconds":"1"})',
      );
    });
  });

  describe("Turnstile 错误", () => {
    it("缺少 token 与校验失败给出同一条人话提示", () => {
      const { messages } = createMessages();
      expect(
        getLoginAuthErrorMessage(
          { code: "TURNSTILE_MISSING_TOKEN" },
          messages as never,
        ),
      ).toBe("[turnstile_error_failed_desc]");
      expect(
        getLoginAuthErrorMessage(
          { code: "TURNSTILE_VERIFICATION_FAILED" },
          messages as never,
        ),
      ).toBe("[turnstile_error_failed_desc]");
    });
  });

  describe("注册与找回密码", () => {
    it("注册时邮箱已被占用给出专用提示", () => {
      const { messages } = createMessages();
      expect(
        getRegisterAuthErrorMessage(
          { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" },
          messages as never,
        ),
      ).toBe("[auth_error_user_already_exists]");
    });

    it("找回密码与注册共用同一套通用映射", () => {
      const { messages } = createMessages();
      expect(
        getForgotPasswordAuthErrorMessage(
          { code: "RATE_LIMITED" },
          messages as never,
        ),
      ).toBe("[request_error_rate_limited_desc]");
    });

    it("重置密码把「令牌无效」换成更贴合场景的文案", () => {
      const { messages } = createMessages();
      expect(
        getResetPasswordAuthErrorMessage(
          { code: "INVALID_TOKEN" },
          messages as never,
        ),
      ).toBe("[reset_password_toast_failed_desc]");
    });
  });

  describe("未知与空输入必须安全退化", () => {
    it("空、undefined 与未知错误码都返回 undefined 而不是抛错", () => {
      const { messages } = createMessages();
      for (const input of [
        undefined,
        null,
        {},
        { code: null },
        { code: "SOMETHING_NEW" },
      ]) {
        expect(
          getLoginAuthErrorMessage(input, messages as never),
        ).toBeUndefined();
        expect(
          getRegisterAuthErrorMessage(input, messages as never),
        ).toBeUndefined();
      }
    });

    it("未知错误码不会误用自定义错误分支", () => {
      const { messages, called } = createMessages();
      getRegisterAuthErrorMessage(
        { code: "BRAND_NEW_CODE" },
        messages as never,
      );
      expect(called).toEqual([]);
    });
  });

  describe("isEmailNotVerifiedError", () => {
    it("只认这一个错误码", () => {
      expect(isEmailNotVerifiedError({ code: "EMAIL_NOT_VERIFIED" })).toBe(
        true,
      );
      expect(isEmailNotVerifiedError({ code: "INVALID_PASSWORD" })).toBe(false);
      expect(isEmailNotVerifiedError(undefined)).toBe(false);
    });
  });
});
