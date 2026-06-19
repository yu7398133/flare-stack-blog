import { Link } from "@tanstack/react-router";
import { X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import type { NavOption, UserInfo } from "@/features/theme/contract/layouts";

interface MobileMenuProps {
  navOptions: NavOption[];
  isOpen: boolean;
  onClose: () => void;
  user?: UserInfo;
  logout: () => Promise<void>;
}

export function MobileMenu({ navOptions, isOpen, onClose, user, logout }: MobileMenuProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu panel */}
      <div className="absolute right-0 top-0 bottom-0 w-72 xh-glass rounded-l-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="self-end w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-all mb-6"
        >
          <X size={18} />
        </button>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/50">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-white text-sm">{user.name}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <div className="flex flex-col gap-1 flex-1">
          {navOptions.map((opt) => (
            <Link
              key={opt.id}
              to={opt.to}
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
              activeProps={{
                className:
                  "px-4 py-3 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-white/10",
              }}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Night mode toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{isDark ? "日间模式" : "夜间模式"}</span>
        </button>

        {/* Auth actions */}
        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          {user ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all"
            >
              退出登录
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="block w-full px-4 py-3 rounded-xl text-sm font-medium text-center text-indigo-600 dark:text-indigo-400 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
            >
              登录 / 注册
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
