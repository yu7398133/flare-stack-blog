import { useState, useEffect } from "react";
import { useRouteContext } from "@tanstack/react-router";

interface SiteDashboardProps {
  momentsCount: number;
  photosCount: number;
  projectsCount: number;
}

export function SiteDashboard({
  momentsCount,
  photosCount,
  projectsCount,
}: SiteDashboardProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [timeStr, setTimeStr] = useState("");
  const [uptimeStr, setUptimeStr] = useState("");

  // Read buildDate from config, fallback to 2026-01-01
  const buildDate =
    siteConfig.theme.xinghui?.buildDate || "2026-01-01T00:00:00";
  const START_DATE = new Date(buildDate).getTime();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      const diff = now.getTime() - START_DATE;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setUptimeStr(`${days}天 ${hours}小时`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [START_DATE]);

  const badges = [
    { name: "TanStack Start", color: "text-blue-500" },
    { name: "Cloudflare", color: "text-orange-500" },
    { name: "React", color: "text-cyan-500" },
    { name: "D1 + R2 + KV", color: "text-amber-500" },
  ];

  const stats = [
    { label: "说说", value: momentsCount, icon: "💬" },
    { label: "照片", value: photosCount, icon: "📸" },
    { label: "项目", value: projectsCount, icon: "🚀" },
  ];

  return (
    <div className="xh-glass overflow-hidden flex flex-col md:flex-row items-stretch h-auto md:h-20 group">
      {/* Left: Flip clock */}
      <div className="bg-slate-900 dark:bg-black text-white px-6 py-3 md:py-0 flex items-center justify-center font-mono text-2xl md:text-3xl font-black tracking-widest shadow-inner relative overflow-hidden group-hover:text-indigo-400 transition-colors shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        {timeStr || "00:00:00"}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/50" />
      </div>

      {/* Middle: Status info */}
      <div className="flex-1 px-4 py-3 md:py-0 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
        {/* Running time */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>
            系统已稳定运行：
            <span className="text-indigo-600 dark:text-indigo-400 font-black">
              {uptimeStr}
            </span>
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-1">
              <span>{s.icon}</span>
              <span className="font-black">{s.value}</span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tech badges */}
        <div className="hidden md:flex gap-1.5">
          {badges.map((b) => (
            <span
              key={b.name}
              className="px-2 py-0.5 bg-white/50 dark:bg-slate-700/50 rounded text-[10px] font-mono border border-white/40 dark:border-slate-600"
            >
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
