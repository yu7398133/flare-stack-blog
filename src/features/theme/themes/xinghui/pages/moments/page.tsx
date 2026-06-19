import { useState } from "react";
import { Heart, MapPin, Smile, ChevronDown } from "lucide-react";
import { useRouteContext } from "@tanstack/react-router";
import type { MomentsPageProps } from "@/features/theme/contract/pages";

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".");
}

export function MomentsPage({ moments, total, hasNextPage, onLoadMore, onLike }: MomentsPageProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const sortedMoments = [...moments].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? -diff : diff;
  });

  const handleLike = (id: number) => {
    if (likedIds.has(id)) return;
    setLikedIds(new Set([...likedIds, id]));
    onLike(id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          说说
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
          生活动态 "在代码之外捕捉瞬间的温度"
        </p>
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => setSortOrder("newest")}
            className={`text-xs font-medium transition-colors ${sortOrder === "newest" ? "text-indigo-500" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"}`}
          >
            最新
          </button>
          <button
            onClick={() => setSortOrder("oldest")}
            className={`text-xs font-medium transition-colors ${sortOrder === "oldest" ? "text-indigo-500" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"}`}
          >
            最早
          </button>
        </div>
      </div>

      {/* Moments list */}
      <div className="flex flex-col gap-4">
        {sortedMoments.map((moment) => {
          const images: string[] = (() => {
            try {
              return moment.images ? JSON.parse(moment.images) : [];
            } catch {
              return [];
            }
          })();

          return (
            <div key={moment.id} className="xh-glass xh-glass-hover p-5">
              {/* User info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {siteConfig.author?.charAt(0)}
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{siteConfig.author}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">{formatDate(moment.createdAt)}</span>
                </div>
              </div>

              {/* Content */}
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {moment.content}
              </p>

              {/* Images */}
              {images.length > 0 && (
                <div className={`grid gap-2 mt-3 ${
                  images.length === 1 ? "grid-cols-1" :
                  images.length === 2 ? "grid-cols-2" :
                  "grid-cols-3"
                }`}>
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="rounded-xl object-cover w-full h-auto max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/30 dark:border-slate-700/30">
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                  {moment.mood && (
                    <span className="flex items-center gap-1">
                      <Smile size={12} />
                      {moment.mood}
                    </span>
                  )}
                  {moment.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {moment.location}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleLike(moment.id)}
                  className={`flex items-center gap-1 text-xs transition-all ${
                    likedIds.has(moment.id)
                      ? "text-red-500"
                      : "text-slate-400 dark:text-slate-500 hover:text-red-400"
                  }`}
                >
                  <Heart size={14} fill={likedIds.has(moment.id) ? "currentColor" : "none"} />
                  <span>{moment.likes + (likedIds.has(moment.id) ? 1 : 0)}</span>
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
          className="xh-glass p-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
        >
          <ChevronDown size={16} />
          加载更多
        </button>
      )}

      {moments.length === 0 && (
        <div className="xh-glass p-12 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">暂无说说</p>
        </div>
      )}
    </div>
  );
}
