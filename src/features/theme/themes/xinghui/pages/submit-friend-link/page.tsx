import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  Loader2,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { Turnstile } from "@/components/common/turnstile";
import type {
  MyFriendLink,
  SubmitFriendLinkPageProps,
} from "@/features/theme/contract/pages";

function StatusBadge({ status }: { status: MyFriendLink["status"] }) {
  const styles = {
    approved: "bg-green-500/10 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  };
  const icons = { approved: CheckCircle2, rejected: XCircle, pending: Clock };
  const labels = { approved: "已通过", rejected: "已拒绝", pending: "审核中" };
  const Icon = icons[status];

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      <Icon className="w-3.5 h-3.5" />
      {labels[status]}
    </span>
  );
}

export function SubmitFriendLinkPage({ myLinks, form }: SubmitFriendLinkPageProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          🔗 申请友链
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          提交你的站点信息，审核通过后将展示在友链页面
        </p>
        <Link
          to="/friend-links"
          className="inline-flex items-center gap-2 mt-4 text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400"
        >
          <LinkIcon className="w-4 h-4" />
          查看友链列表
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 xh-glass p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-500" />
            填写站点信息
          </h2>

          <form onSubmit={form.handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                站点名称 <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("siteName")}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all"
                placeholder="我的博客"
              />
              {form.errors.siteName && (
                <p className="mt-1.5 text-sm text-red-500">{form.errors.siteName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                站点地址 <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("siteUrl")}
                type="url"
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all"
                placeholder="https://example.com"
              />
              {form.errors.siteUrl && (
                <p className="mt-1.5 text-sm text-red-500">{form.errors.siteUrl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                站点描述
              </label>
              <input
                {...form.register("description")}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all"
                placeholder="一个有趣的博客"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                联系邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("contactEmail")}
                type="email"
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all"
                placeholder="you@example.com"
              />
              {form.errors.contactEmail && (
                <p className="mt-1.5 text-sm text-red-500">{form.errors.contactEmail.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Turnstile {...form.turnstileProps} />
            </div>

            <button
              type="submit"
              disabled={form.isSubmitting}
              className="w-full py-3 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {form.isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "提交申请"
              )}
            </button>
          </form>
        </div>

        {/* My submissions */}
        <div className="lg:col-span-2 xh-glass p-6 md:p-8 self-start">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            我的提交
          </h2>
          <div className="space-y-4">
            {myLinks.length > 0 ? (
              myLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-4 rounded-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/5"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white truncate text-sm">
                      {link.siteName}
                    </h3>
                    <StatusBadge status={link.status} />
                  </div>
                  <a
                    href={link.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-indigo-500 transition-colors truncate block"
                  >
                    {link.siteUrl}
                  </a>
                  {link.status === "rejected" && link.rejectionReason && (
                    <div className="mt-2 p-2 rounded-lg bg-red-500/10 text-xs text-red-500">
                      拒绝原因：{link.rejectionReason}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
                暂无提交记录
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
