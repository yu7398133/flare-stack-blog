import { Link } from "@tanstack/react-router";
import { Loader2, XCircle } from "lucide-react";
import type { ResetPasswordPageProps } from "@/features/theme/contract/pages";

export function ResetPasswordPage({ resetPasswordForm, token, error }: ResetPasswordPageProps) {
  const { register, errors, handleSubmit, isSubmitting } = resetPasswordForm;

  if (error) {
    return (
      <div className="text-center space-y-4 py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">链接无效</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <Link to="/forgot-password" className="inline-block text-sm text-indigo-500 hover:text-indigo-600 font-medium">
          重新申请
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center space-y-4 py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">缺少令牌</h2>
        <Link to="/forgot-password" className="inline-block text-sm text-indigo-500 hover:text-indigo-600 font-medium">
          重新申请
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">重置密码</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">设置你的新密码</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">新密码</label>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "重置密码"}
        </button>
      </form>
    </div>
  );
}
