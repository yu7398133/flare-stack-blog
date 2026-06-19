import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { VerifyEmailPageProps } from "@/features/theme/contract/pages";

export function VerifyEmailPage({ status, error }: VerifyEmailPageProps) {
  if (status === "ANALYZING") {
    return (
      <div className="text-center space-y-4 py-8">
        <Loader2 className="w-16 h-16 text-indigo-500 mx-auto animate-spin" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">验证中...</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">正在验证你的邮箱</p>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="text-center space-y-4 py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">验证失败</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{error || "链接无效或已过期"}</p>
        <Link to="/login" className="inline-block text-sm text-indigo-500 hover:text-indigo-600 font-medium">
          返回登录
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4 py-8">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">验证成功！</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">你的邮箱已验证</p>
      <Link to="/login" className="inline-block text-sm text-indigo-500 hover:text-indigo-600 font-medium">
        去登录
      </Link>
    </div>
  );
}
