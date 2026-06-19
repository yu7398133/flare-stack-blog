import { Link } from "@tanstack/react-router";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { RegisterPageProps } from "@/features/theme/contract/pages";

export function RegisterPage({ isEmailConfigured: _isEmailConfigured, registerForm, turnstileElement }: RegisterPageProps) {
  const { register, errors, handleSubmit, isSubmitting, isSuccess } = registerForm;

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">注册成功！</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          请检查你的邮箱进行验证
        </p>
        <Link to="/login" className="inline-block text-sm text-indigo-500 hover:text-indigo-600 font-medium">
          返回登录
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">创建账号</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">注册一个新账户</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">用户名</label>
          <input
            {...register("name")}
            placeholder="你的昵称"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all disabled:opacity-50"
          />
          {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">邮箱</label>
          <input
            type="email"
            {...register("email")}
            placeholder="your@email.com"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all disabled:opacity-50"
          />
          {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">密码</label>
          <input
            type="password"
            {...register("password")}
            placeholder="••••••••"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all disabled:opacity-50"
          />
          {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">确认密码</label>
          <input
            type="password"
            {...register("confirmPassword")}
            placeholder="••••••••"
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all disabled:opacity-50"
          />
          {errors.confirmPassword && <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword.message}</span>}
        </div>

        <div className="pt-2">{turnstileElement}</div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "注册"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        已有账号？{" "}
        <Link to="/login" className="text-indigo-500 hover:text-indigo-600 font-medium">
          去登录
        </Link>
      </p>
    </div>
  );
}
