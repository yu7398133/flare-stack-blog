import { useEffect, useState } from "react";

export function SiteDashboard() {
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

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
      setDateStr(
        now.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          weekday: "short",
        }),
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="xh-glass overflow-hidden flex flex-col sm:flex-row items-stretch transition-colors h-auto sm:h-16">
      {/* Clock */}
      <div className="bg-slate-900 dark:bg-black text-white px-6 py-3 sm:py-0 flex items-center justify-center font-mono text-xl sm:text-2xl font-black tracking-widest relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        {timeStr || "00:00:00"}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/50" />
      </div>

      {/* Info bar */}
      <div className="flex-1 px-6 py-3 sm:py-0 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{dateStr}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded-md text-[10px] border border-white/40 dark:border-slate-600">
            React
          </span>
          <span className="px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded-md text-[10px] border border-white/40 dark:border-slate-600">
            Cloudflare
          </span>
          <span className="px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded-md text-[10px] border border-white/40 dark:border-slate-600">
            TailwindCSS
          </span>
        </div>
      </div>
    </div>
  );
}
