import { Loader2, Bell, BellOff, LogOut, Key, User } from "lucide-react";
import type { ProfilePageProps } from "@/features/theme/contract/pages";

export function ProfilePage({
  user,
  profileForm,
  passwordForm,
  notification,
  logout,
}: ProfilePageProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Profile card */}
      <div className="xh-glass p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/50"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{user.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            {user.role && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                {user.role}
              </span>
            )}
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={profileForm.handleSubmit} className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User size={18} />
            个人资料
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              用户名
            </label>
            <input
              {...profileForm.register("name")}
              className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all"
            />
            {profileForm.errors.name && (
              <span className="text-xs text-red-500 mt-1 block">{profileForm.errors.name.message}</span>
            )}
          </div>
          <button
            type="submit"
            disabled={profileForm.isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {profileForm.isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "保存"
            )}
          </button>
        </form>
      </div>

      {/* Password form */}
      {passwordForm && (
        <div className="xh-glass p-6 md:p-8">
          <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Key size={18} />
              修改密码
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                当前密码
              </label>
              <input
                type="password"
                {...passwordForm.register("currentPassword")}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                新密码
              </label>
              <input
                type="password"
                {...passwordForm.register("newPassword")}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                确认新密码
              </label>
              <input
                type="password"
                {...passwordForm.register("confirmPassword")}
                className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/40 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white text-sm transition-all"
              />
              {passwordForm.errors.confirmPassword && (
                <span className="text-xs text-red-500 mt-1 block">
                  {passwordForm.errors.confirmPassword.message}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={passwordForm.isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {passwordForm.isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "修改密码"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Notification toggle */}
      <div className="xh-glass p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {notification.enabled ? (
            <Bell size={18} className="text-indigo-500" />
          ) : (
            <BellOff size={18} className="text-slate-400" />
          )}
          <div>
            <p className="font-medium text-slate-800 dark:text-white text-sm">邮件通知</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {notification.enabled ? "已开启" : "已关闭"}
            </p>
          </div>
        </div>
        <button
          onClick={notification.toggle}
          disabled={notification.isPending}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            notification.enabled
              ? "bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-600/50"
              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20"
          }`}
        >
          {notification.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : notification.enabled ? (
            "关闭"
          ) : (
            "开启"
          )}
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="xh-glass p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all text-sm font-medium"
      >
        <LogOut size={16} />
        <span>退出登录</span>
      </button>
    </div>
  );
}
