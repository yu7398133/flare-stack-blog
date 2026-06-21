import { useState } from "react";
import { Heart, MapPin, Smile, ChevronDown, MessageCircle, Clock } from "lucide-react";
import { useRouteContext } from "@tanstack/react-router";
import type { MomentsPageProps } from "@/features/theme/contract/pages";

function formatDate(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;

  return d
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");
}

function formatFullDate(date: Date | string) {
  const d = new Date(date);
  return d
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/\//g, ".");
}

export function MomentsPage({
  moments,
  total,
  hasNextPage,
  onLoadMore,
  onLike,
}: MomentsPageProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const sortedMoments = [...moments].sort((a, b) => {
    const diff =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? -diff : diff;
  });

  const handleLike = (id: number) => {
    if (likedIds.has(id)) return;
    setLikedIds(new Set([...likedIds, id]));
    onLike(id);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-wider mb-2">
              云端杂谈
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              生活动态 — 在代码之外捕捉瞬间的温度
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <MessageCircle size={14} />
            <span className="font-mono font-bold">{total ?? moments.length}</span>
            <span>条</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-200/30 dark:border-slate-700/30">
          <button
            onClick={() => setSortOrder("newest")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              sortOrder === "newest"
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white/50 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500"
            }`}
          >
            最新
          </button>
          <button
            onClick={() => setSortOrder("oldest")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              sortOrder === "oldest"
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white/50 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500"
            }`}
          >
            最早
          </button>
        </div>
      </div>

      {/* Moments list */}
      <div className="flex flex-col gap-5">
        {sortedMoments.map((moment, idx) => {
          const images: string[] = (() => {
            try {
              return moment.images ? JSON.parse(moment.images) : [];
            } catch {
              return [];
            }
          })();

          const isExpanded = expandedIds.has(moment.id);
          const contentLen = moment.content?.length ?? 0;
          const shouldTruncate = contentLen > 200 && !isExpanded;

          return (
            <div
              key={moment.id}
              className="xh-glass xh-glass-hover p-5 sm:p-6 xh-animate-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* User info row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 p-0.5 shadow-md flex-shrink-0">
                  <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-800 flex items-center justify-center text-sm font-black text-indigo-500">
                    {siteConfig.author?.charAt(0) ?? "?"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {siteConfig.author}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <Clock size={10} />
                    <span title={formatFullDate(moment.createdAt)}>
                      {formatDate(moment.createdAt)}
                    </span>
                  </div>
                </div>
                {moment.mood && (
                  <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
                    <Smile size={12} />
                    {moment.mood}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {shouldTruncate
                    ? moment.content.slice(0, 200) + "..."
                    : moment.content}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() => toggleExpand(moment.id)}
                    className="text-indigo-500 text-xs font-bold mt-1 hover:underline"
                  >
                    展开全文
                  </button>
                )}
                {isExpanded && contentLen > 200 && (
                  <button
                    onClick={() => toggleExpand(moment.id)}
                    className="text-indigo-500 text-xs font-bold mt-1 hover:underline"
                  >
                    收起
                  </button>
                )}
              </div>

              {/* Images */}
              {images.length > 0 && (
                <div
                  className={`grid gap-2 mb-4 ${
                    images.length === 1
                      ? "grid-cols-1"
                      : images.length === 2
                        ? "grid-cols-2"
                        : images.length === 4
                          ? "grid-cols-2"
                          : "grid-cols-3"
                  }`}
                >
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className={`rounded-2xl object-cover w-full cursor-pointer hover:opacity-90 transition-opacity ${
                        images.length === 1 ? "max-h-96" : "h-auto max-h-64"
                      }`}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {/* Meta footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200/30 dark:border-slate-700/30">
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                  {moment.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {moment.location}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleLike(moment.id)}
                  className={`flex items-center gap-1.5 text-xs transition-all px-3 py-1.5 rounded-xl ${
                    likedIds.has(moment.id)
                      ? "text-red-500 bg-red-50 dark:bg-red-500/10"
                      : "text-slate-400 dark:text-slate-500 hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-500/10"
                  }`}
                >
                  <Heart
                    size={14}
                    fill={likedIds.has(moment.id) ? "currentColor" : "none"}
                  />
                  <span className="font-bold">
                    {moment.likes + (likedIds.has(moment.id) ? 1 : 0)}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasNextPage && (
        <button
          onClick={onLoadMore}
          className="xh-glass p-4 text-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2 rounded-2xl"
        >
          <ChevronDown size={16} />
          加载更多
        </button>
      )}

      {moments.length === 0 && (
        <div className="xh-glass p-12 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            暂无说说，去写一条吧 →
          </p>
        </div>
      )}
    </div>
  );
}
