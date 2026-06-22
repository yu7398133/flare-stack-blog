import { useRouteContext } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContentRenderer } from "../../components/content/content-renderer";

export function AboutPage() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [activeTab, setActiveTab] = useState<"intro" | "activity">("intro");



  // Fetch all posts for activity timeline
  const { data: postsData } = useQuery({
    queryKey: ["about-posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts?limit=100");
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });

  // Fetch moments for activity
  const { data: momentsData } = useQuery({
    queryKey: ["about-moments"],
    queryFn: async () => {
      const res = await fetch("/api/moments?limit=100");
      if (!res.ok) return { items: [] };
      return res.json();
    },
  });

  const activities = useMemo(() => {
    const items: Array<{
      id: string;
      type: "文章" | "说说";
      title: string;
      date: string;
      url: string;
    }> = [];

    for (const post of postsData?.items ?? []) {
      items.push({
        id: `post-${post.id}`,
        type: "文章",
        title: post.title,
        date: post.publishedAt || post.createdAt,
        url: `/post/${post.slug}`,
      });
    }
    for (const m of momentsData?.items ?? []) {
      items.push({
        id: `moment-${m.id}`,
        type: "说说",
        title: m.content.slice(0, 30),
        date: m.createdAt,
        url: "/moments",
      });
    }
    return items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [postsData, momentsData]);

  // GitHub-style heatmap
  const { weeks, activityMap } = useMemo(() => {
    const today = new Date();
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeksArr: Date[][] = [];
    let currentWeek: Date[] = [];
    const curr = new Date(startDate);

    while (curr <= endDate) {
      currentWeek.push(new Date(curr));
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
      curr.setDate(curr.getDate() + 1);
    }
    if (currentWeek.length > 0) weeksArr.push(currentWeek);

    const map: Record<string, number> = {};
    activities.forEach((a) => {
      const d = new Date(a.date);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        map[key] = (map[key] || 0) + 1;
      }
    });

    return { weeks: weeksArr, activityMap: map };
  }, [activities]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/50";
    if (count === 1) return "bg-green-300 dark:bg-green-900/80";
    if (count === 2) return "bg-green-400 dark:bg-green-700/80";
    if (count === 3) return "bg-green-500 dark:bg-green-600";
    return "bg-green-600 dark:bg-green-500";
  };

  const getTypeColor = (type: string) => {
    if (type === "文章") return "text-indigo-600 dark:text-indigo-400";
    if (type === "说说") return "text-pink-600 dark:text-pink-400";
    return "text-slate-500 dark:text-slate-400";
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const coverImage =
    siteConfig.theme.xinghui?.homeBg ||
    "https://bu.dusays.com/2026/03/24/69c23dc278c78.jpg";

  return (
    <div className="rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden transition-colors duration-700 relative xh-animate-in">
      {/* Cover image */}
      <div className="w-full h-40 sm:h-48 md:h-64 relative bg-slate-200 dark:bg-slate-700 overflow-hidden group">
        <img
          src={coverImage}
          alt=""
          className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      <div className="px-5 sm:px-8 md:px-16 pb-10 md:pb-16 relative">
        {/* Avatar */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden -mt-12 md:-mt-16 relative z-20 bg-white">
          <img
            src={siteConfig.theme.xinghui?.avatar || "/images/avatar.png"}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Header + Tabs */}
        <div className="mt-4 md:mt-6 mb-6 md:mb-8 relative flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-1 md:mb-3">
              关于我
            </h1>
            <p className="text-sm md:text-lg text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase">
              Hello World, I'm {siteConfig.author}
            </p>
          </div>

          <div className="flex items-center w-full md:w-auto gap-1 bg-white/50 dark:bg-slate-900/50 p-1 md:p-1.5 rounded-xl md:rounded-2xl shadow-inner border border-white/40 dark:border-white/5">
            <button
              onClick={() => setActiveTab("intro")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all duration-300 ${
                activeTab === "intro"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-slate-500 hover:text-indigo-500"
              }`}
            >
              自我介绍
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all duration-300 ${
                activeTab === "activity"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-slate-500 hover:text-indigo-500"
              }`}
            >
              动态 ({activities.length})
            </button>
          </div>
        </div>

        {/* Intro tab */}
        {activeTab === "intro" && (
          <div className="xh-prose prose prose-slate dark:prose-invert prose-base md:prose-lg max-w-none">
            {siteConfig.theme.xinghui?.aboutContent ? (
              <ContentRenderer content={siteConfig.theme.xinghui.aboutContent} />
            ) : (
              <div className="space-y-4">
                <p className="text-base text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
                  {siteConfig.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["React", "TypeScript", "TailwindCSS", "Cloudflare", "TanStack", "Hono", "Drizzle ORM"].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 bg-white/50 dark:bg-white/10 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10"
                      >
                        {tech}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity tab */}
        {activeTab === "activity" && (
          <div className="space-y-8">
            {/* GitHub-style heatmap */}
            <div className="bg-white/40 dark:bg-slate-900/40 rounded-2xl p-4 md:p-6 border border-white/40 dark:border-white/10">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                活跃贡献 ({activities.length} 条记录)
              </h3>
              <div className="overflow-x-auto xh-scrollbar">
                <div className="min-w-[700px]">
                  {/* Month labels */}
                  <div className="flex gap-[4px] text-[10px] text-slate-400 mb-1 h-4">
                    {weeks.map((week, idx) => {
                      const firstDay = week[0];
                      const isFirstWeekOfMonth = firstDay.getDate() <= 7;
                      return (
                        <div
                          key={idx}
                          className="w-[11px] md:w-[13px] shrink-0 relative"
                        >
                          {isFirstWeekOfMonth && (
                            <span className="absolute left-0 whitespace-nowrap z-10">
                              {firstDay.toLocaleString("en-US", {
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Heatmap cells */}
                  <div className="flex gap-[4px]">
                    {weeks.map((week, i) => (
                      <div key={i} className="flex flex-col gap-[4px]">
                        {week.map((day, j) => {
                          const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                          const count = activityMap[dateKey] || 0;
                          return (
                            <div
                              key={j}
                              title={`${dateKey}: ${count} 次更新`}
                              className={`w-[11px] h-[11px] md:w-[13px] md:h-[13px] rounded-[3px] transition-colors duration-300 hover:ring-2 hover:ring-indigo-500/50 ${getColorClass(count)}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-2 text-[10px] md:text-xs font-bold text-slate-500">
                Less
                <div className="w-[11px] h-[11px] rounded-[3px] bg-slate-100 dark:bg-slate-800/50" />
                <div className="w-[11px] h-[11px] rounded-[3px] bg-green-300 dark:bg-green-900/80" />
                <div className="w-[11px] h-[11px] rounded-[3px] bg-green-400 dark:bg-green-700/80" />
                <div className="w-[11px] h-[11px] rounded-[3px] bg-green-500 dark:bg-green-600" />
                <div className="w-[11px] h-[11px] rounded-[3px] bg-green-600 dark:bg-green-500" />
                More
              </div>
            </div>

            {/* Activity timeline */}
            <div className="relative pl-6 md:pl-8 border-l-2 border-indigo-500/20 dark:border-indigo-400/20 space-y-6">
              {activities.map((act) => (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-[31px] md:-left-[39px] top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-full group-hover:scale-125 transition-transform duration-300 z-10" />
                  <a
                    href={act.url}
                    className="flex flex-col md:flex-row md:items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm hover:shadow-lg transition-all group-hover:-translate-y-1 block relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <img
                        src={
                          siteConfig.theme.xinghui?.avatar ||
                          "/images/avatar.png"
                        }
                        alt=""
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm shrink-0"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 dark:text-slate-200 text-sm">
                            {siteConfig.author}
                          </span>
                          <span
                            className={`text-xs font-bold ${getTypeColor(act.type)}`}
                          >
                            {act.type === "说说"
                              ? "发布了 说说"
                              : `更新了 ${act.type}`}
                          </span>
                        </div>
                        <div className="text-[10px] md:hidden font-mono text-slate-400 mt-0.5">
                          {formatDate(act.date)}
                        </div>
                      </div>
                    </div>
                    {act.type !== "说说" && (
                      <>
                        <div className="hidden md:block w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm md:text-base font-black text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            《{act.title}》
                          </div>
                        </div>
                      </>
                    )}
                    <div className="hidden md:block text-[11px] font-mono text-slate-400 shrink-0 ml-auto bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded-md">
                      {formatDate(act.date)}
                    </div>
                  </a>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-slate-500 text-sm font-bold">
                  暂无活动记录...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
