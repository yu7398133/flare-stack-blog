import { Link, useRouteContext, useMatchRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Sun, Moon, RefreshCw } from "lucide-react";
import type { NavOption, UserInfo } from "@/features/theme/contract/layouts";

interface NavbarProps {
  navOptions: NavOption[];
  onMenuClick: () => void;
  user?: UserInfo;
  isLoading: boolean;
  onRefreshBg?: () => void;
}

export function Navbar({ navOptions, onMenuClick, user, isLoading, onRefreshBg }: NavbarProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(stored === "dark" || (!stored && prefersDark));
  }, []);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

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

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      if (currentY < 10) {
        setVisible(true);
      } else if (delta > 8) {
        setVisible(false);
      } else if (delta < -8) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const hasBg = !!siteConfig.theme.xinghui?.homeBg;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="xh-glass mx-0 mt-0 border-t-0 border-x-0 h-16" style={{ borderRadius: 0 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-black text-slate-800 dark:text-white tracking-tighter hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
          >
            {siteConfig.author}
            <span className="text-indigo-500 mx-1">の</span>
            宝藏之地
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navOptions.map((opt) => (
              <NavLinkItem key={opt.id} to={opt.to} label={opt.label} />
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            {/* Refresh background */}
            {hasBg && onRefreshBg && (
              <button
                onClick={onRefreshBg}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
                title="换一张背景"
              >
                <RefreshCw size={17} />
              </button>
            )}

            {/* Night mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
              title={isDark ? "切换到日间模式" : "切换到夜间模式"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User / Login */}
            {!isLoading && (
              user ? (
                <Link
                  to="/admin"
                  className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white/50 hover:border-indigo-400 transition-colors"
                >
                  {(siteConfig.theme.xinghui?.userAvatar || siteConfig.theme.xinghui?.avatar || user.image) ? (
                    <img src={siteConfig.theme.xinghui?.userAvatar || siteConfig.theme.xinghui?.avatar || user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
                >
                  登录
                </Link>
              )
            )}

            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLinkItem({ to, label }: { to: string; label: string }) {
  const matchRoute = useMatchRoute();
  const isActive = matchRoute({ to, fuzzy: to === "/" });
  return (
    <Link
      to={to}
      className={`relative py-1.5 text-[15px] font-bold transition-colors ${
        isActive
          ? "text-indigo-500 dark:text-indigo-400"
          : "text-slate-700 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400"
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
      )}
    </Link>
  );
}
