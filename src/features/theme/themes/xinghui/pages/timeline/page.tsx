import { Link } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { Calendar, Search, ArrowUp } from "lucide-react";
import type { TimelinePageProps } from "@/features/theme/contract/pages";

// Consistent image per post slug (same URL = same image across pages)
function getPostCover(slug: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/400/250`;
}
function getPostCoverLarge(slug: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/600`;
}

export function TimelinePageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="xh-glass p-6">
        <div className="h-6 w-32 xh-skeleton rounded mb-2" />
        <div className="h-4 w-24 xh-skeleton rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="xh-glass h-48 xh-skeleton" />
        ))}
      </div>
    </div>
  );
}

export function TimelinePage({ posts }: TimelinePageProps) {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "timeline">("card");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Force card mode on mobile
  useEffect(() => {
    const enforce = () => {
      if (window.innerWidth < 768) setViewMode("card");
    };
    enforce();
    window.addEventListener("resize", enforce);
    return () => window.removeEventListener("resize", enforce);
  }, []);

  // Collect all tags with counts
  const tags = useMemo(() => {
    const map = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        map.set(tag.name, (map.get(tag.name) ?? 0) + 1);
      }
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [posts]);

  // Filter posts
  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const tagMatch =
        selectedTag === "All" ||
        post.tags?.some((t) => t.name === selectedTag);
      const searchMatch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary?.toLowerCase().includes(searchQuery.toLowerCase());
      return tagMatch && searchMatch;
    });
  }, [posts, selectedTag, searchQuery]);

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowScrollTop(scrollRef.current.scrollTop > 200);
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6 text-center">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-wider mb-3">
          归档与探索
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 font-serif">
          ✨ 总计 {posts.length} 篇文章
        </p>
      </div>

      {/* Search + Tags + View toggle */}
      <div className="xh-glass p-4 flex flex-col gap-4">
        {/* Search */}
        <div className="relative max-w-lg mx-auto w-full">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="搜寻被封存的知识..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/30 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl px-6 py-3 pl-11 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>

        {/* Tags + View toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 flex-1">
            <button
              onClick={() => setSelectedTag("All")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTag === "All"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "bg-white/50 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-white"
              }`}
            >
              全部档案
            </button>
            {tags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => setSelectedTag(tag.name)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTag === tag.name
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-white/50 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-white"
                }`}
              >
                {tag.name}{" "}
                <span className="opacity-50 ml-1">{tag.count}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex bg-white/50 dark:bg-slate-900/50 p-1 rounded-2xl shadow-inner shrink-0">
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "timeline"
                  ? "bg-white dark:bg-slate-700 text-indigo-500 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              📋 时间线
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "card"
                  ? "bg-white dark:bg-slate-700 text-indigo-500 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              🔲 矩阵网格
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="xh-glass p-12 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            没有找到匹配的文章
          </p>
        </div>
      ) : viewMode === "card" ? (
        /* Card grid view */
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-[75vh] overflow-y-auto xh-scrollbar pr-1"
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((post) => (
                <Link
                  key={post.id}
                  to="/post/$slug"
                  params={{ slug: post.slug }}
                  className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300"
                >
                    <div className="relative h-28 sm:h-36 overflow-hidden">
                    <img
                      src={getPostCover(post.slug)}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-white/90 text-[10px] font-mono font-bold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1">
                        <Calendar size={10} />
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(
                              "zh-CN",
                            )
                          : ""}
                      </span>
                    </div>
                  <div className="p-3 md:p-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2 line-clamp-2 group-hover:text-indigo-500 transition-colors">
                      {post.title}
                    </h3>
                    {post.summary && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
                        {post.summary}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="text-[8px] md:text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Scroll to top */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center bg-indigo-500 text-white rounded-full shadow-lg hover:-translate-y-1 transition-all"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
      ) : (
        /* Timeline view */
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-transparent" />
          {filtered.map((post) => (
            <div key={post.id} className="mb-6 relative">
              <div className="absolute -left-5 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900" />
              <Link
                to="/post/$slug"
                params={{ slug: post.slug }}
                className="block rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-4 group hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("zh-CN")
                      : ""}
                  </span>
                  {post.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h3>
                {post.summary && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {post.summary}
                  </p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
