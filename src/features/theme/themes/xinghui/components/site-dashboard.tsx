import { useQuery } from "@tanstack/react-query";

export function SiteDashboard() {
  const { data: momentsData } = useQuery<{ total: number }>({
    queryKey: ["moments-count-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/moments?limit=1");
      return res.json();
    },
  });

  const { data: photosData } = useQuery<Array<unknown>>({
    queryKey: ["photos-count-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/photos");
      return res.json();
    },
  });

  const { data: projectsData } = useQuery<Array<unknown>>({
    queryKey: ["projects-count-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      return res.json();
    },
  });

  const chatterCount = momentsData?.total ?? 0;
  const photoCount = photosData?.length ?? 0;
  const projectCount = projectsData?.length ?? 0;
  const runningDays = Math.floor(
    (Date.now() - new Date("2026-01-01").getTime()) / (1000 * 60 * 60 * 24),
  );

  const items = [
    { label: "说说", value: chatterCount, icon: "💬" },
    { label: "照片", value: photoCount, icon: "📸" },
    { label: "项目", value: projectCount, icon: "🚀" },
    { label: "运行天数", value: runningDays, icon: "⏱️" },
  ];

  return (
    <div className="xh-glass p-4">
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <span className="text-lg font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {item.value}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="font-mono">TanStack Start</span>
          <span>•</span>
          <span className="font-mono">Cloudflare Workers</span>
          <span>•</span>
          <span className="font-mono">D1 + R2 + KV</span>
        </div>
      </div>
    </div>
  );
}
