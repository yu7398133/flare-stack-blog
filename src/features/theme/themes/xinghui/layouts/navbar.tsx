import { Link, useRouteContext } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type { NavOption, UserInfo } from "@/features/theme/contract/layouts";

interface NavbarProps {
  navOptions: NavOption[];
  onMenuClick: () => void;
  user?: UserInfo;
  isLoading: boolean;
}

export function Navbar({ navOptions, onMenuClick, user, isLoading }: NavbarProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="xh-glass mx-auto max-w-6xl mt-4 px-6 py-3 flex items-center justify-between">
        {/* Logo / Site Name */}
        <Link
          to="/"
          className="text-lg font-bold text-slate-800 dark:text-white tracking-wider hover:opacity-80 transition-opacity"
        >
          ⚡ {siteConfig.title}
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navOptions.map((opt) => (
            <Link
              key={opt.id}
              to={opt.to}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
              activeProps={{
                className:
                  "px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-white/10",
              }}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* User / Login */}
          {!isLoading && (
            user ? (
              <Link
                to="/user/profile"
                className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white/50 hover:border-indigo-400 transition-colors"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
              >
                登录
              </Link>
            )
          )}

          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
