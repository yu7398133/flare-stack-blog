import { useState, useEffect } from "react";
import { useRouteContext } from "@tanstack/react-router";

interface SiteDashboardProps {
  momentsCount: number;
  photosCount: number;
  projectsCount: number;
}

const TECH_BADGES = [
  { name: "TanStack", color: "text-orange-500", svg: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>' },
  { name: "Hono", color: "text-orange-400", svg: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>' },
  { name: "Cloudflare", color: "text-amber-500", svg: '<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>' },
  { name: "D1", color: "text-blue-500", svg: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>' },
];

export function SiteDashboard({
  momentsCount,
  photosCount,
  projectsCount,
}: SiteDashboardProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [timeStr, setTimeStr] = useState("");
  const [uptimeStr, setUptimeStr] = useState("");

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

  const stats = [
    { label: "杂谈", value: momentsCount, icon: "✨" },
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

      {/* Middle & Right: Status info */}
      <div className="flex-1 px-6 py-3 md:py-0 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300">
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

        {/* Tech stack badges — matching reference site size */}
        <div className="hidden md:flex gap-1.5">
          {TECH_BADGES.map((badge) => (
            <span
              key={badge.name}
              className="px-2.5 py-1.5 bg-white/50 dark:bg-slate-700/50 rounded-lg shadow-sm flex items-center gap-1.5 border border-white/40 dark:border-slate-600 text-[11px] font-bold"
            >
              <svg
                className={`w-4 h-4 ${badge.color}`}
                fill="currentColor"
                viewBox="0 0 24 24"
                dangerouslySetInnerHTML={{ __html: badge.svg }}
              />
              {badge.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
