import { Link, useRouteContext, useMatchRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import type { NavOption, UserInfo } from "@/features/theme/contract/layouts";

interface NavbarProps {
  navOptions: NavOption[];
  onMenuClick: () => void;
  user?: UserInfo;
  isLoading: boolean;
}

export function Navbar({ navOptions, onMenuClick, user, isLoading }: NavbarProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });
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

  // Hide on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      // Always show at top
      if (currentY < 10) {
        setVisible(true);
      } else if (delta > 8) {
        // Scrolling down → hide
        setVisible(false);
      } else if (delta < -8) {
        // Scrolling up → show
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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Full-width glass bar */}
      <div className="xh-glass mx-0 mt-0 border-t-0 border-x-0" style={{ borderRadius: 0 }}>
        {/* Inner container — centered content */}
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Site Name */}
        <Link
          to="/"
          className="text-xl font-black text-slate-800 dark:text-white tracking-tighter hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
        >
          {siteConfig.author}
          <span className="text-indigo-500 mx-1">の</span>
          宝藏之地
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-4">
          {navOptions.map((opt) => (
            <Link
              key={opt.id}
              to={opt.to}
              className="relative py-1.5 text-[15px] font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              activeProps={{
                className:
                  "relative py-1.5 text-[15px] font-bold text-indigo-600 dark:text-indigo-400 transition-colors",
              }}
            >
              {opt.label}
              <LinkIndicator to={opt.to} />
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Night mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
            title={isDark ? "切换到日间模式" : "切换到夜间模式"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User / Login */}
          {!isLoading && (
            user ? (
              <Link
                to="/profile"
                className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white/50 hover:border-indigo-400 transition-colors"
              >
                {(siteConfig.theme.xinghui?.navAvatar || user.image) ? (
                  <img src={siteConfig.theme.xinghui?.navAvatar || user.image} alt={user.name} className="w-full h-full object-cover" />
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
      </div>
    </nav>
  );
}

function LinkIndicator({ to }: { to: string }) {
  const matchRoute = useMatchRoute();
  const isActive = matchRoute({ to, fuzzy: to === "/" });
  if (!isActive) return null;
  return (
    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
  );
}
