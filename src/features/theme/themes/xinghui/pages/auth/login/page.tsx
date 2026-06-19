import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { GithubIcon } from "@/components/common/brand-icon";
import type { LoginPageProps } from "@/features/theme/contract/pages";

export function LoginPage({
  isEmailConfigured,
  loginForm,
  socialLogin,
  turnstileElement,
}: LoginPageProps) {
  const {
    register,
    errors,
    handleSubmit,
    loginStep,
    isSubmitting,
    turnstilePending,
  } = loginForm;

  const { isLoading: socialIsLoading, handleGithubLogin } = socialLogin;
  const isFormDisabled = isSubmitting || loginStep !== "IDLE" || turnstilePending;

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {isEmailConfigured ? "欢迎回来" : "登录"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isEmailConfigured ? "登录你的账户" : "使用第三方账号登录"}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {isEmailConfigured && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                邮箱
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="your@email.com"
                autoComplete="username"
                disabled={isFormDisabled}
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all disabled:opacity-50"
              />
              {errors.email && (
                <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">密码</label>
                <Link to="/forgot-password" className="text-xs text-indigo-500 hover:text-indigo-600">
                  忘记密码？
                </Link>
              </div>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isFormDisabled}
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all disabled:opacity-50"
              />
              {errors.password && (
                <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isFormDisabled}
              className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loginStep === "VERIFYING" ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "登录"
              )}
            </button>
          </form>
        )}

        {isEmailConfigured && (
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-slate-200/50 dark:border-slate-700/50" />
            <span className="mx-4 text-xs text-slate-400">或</span>
            <div className="flex-1 border-t border-slate-200/50 dark:border-slate-700/50" />
          </div>
        )}

        <button
          type="button"
          onClick={handleGithubLogin}
          disabled={socialIsLoading}
          className="w-full py-3 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-sm hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {socialIsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GithubIcon size={16} />
          )}
          <span>{socialIsLoading ? "连接中..." : "使用 GitHub 登录"}</span>
        </button>

        {turnstileElement}

        {isEmailConfigured && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            还没有账号？{" "}
            <Link to="/register" className="text-indigo-500 hover:text-indigo-600 font-medium">
              立即注册
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
