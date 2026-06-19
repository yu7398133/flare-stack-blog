import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { NavOption, UserInfo } from "@/features/theme/contract/layouts";

interface UserLayoutProps {
  isAuthenticated: boolean;
  navOptions: NavOption[];
  user?: UserInfo;
  isSessionLoading: boolean;
  logout: () => Promise<void>;
  children: React.ReactNode;
}

export function UserLayout({
  isAuthenticated,
  navOptions: _navOptions,
  user,
  isSessionLoading: _isSessionLoading,
  logout,
  children,
}: UserLayoutProps) {
  if (!isAuthenticated) {
    return (
      <div className="xh-page-bg min-h-screen flex items-center justify-center">
        <div className="xh-glass p-8 text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-4">请先登录</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="xh-page-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 pt-8">
        {/* User header */}
        <div className="xh-glass p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.image && (
              <img
                src={user.image}
                alt={user.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white/50"
              />
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">{user?.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
          >
            <LogOut size={16} />
            <span>退出</span>
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
