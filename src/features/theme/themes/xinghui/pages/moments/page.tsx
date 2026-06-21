import { useState, useMemo } from "react";
import { MapPin, MessageSquare, Clock, Search, Ghost } from "lucide-react";
import { useRouteContext } from "@tanstack/react-router";
import type { MomentsPageProps } from "@/features/theme/contract/pages";

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffInSeconds < 60) return "刚刚";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  return d
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const avatarUrl =
    siteConfig.theme.xinghui?.avatar || "/images/avatar.png";

  const processedMoments = useMemo(() => {
    let result = [...moments];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) =>
          (m.content || "").toLowerCase().includes(q) ||
          (m.location || "").toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [moments, searchQuery, sortOrder]);

  const handleLike = (id: number) => {
    if (likedIds.has(id)) return;
    setLikedIds(new Set([...likedIds, id]));
    onLike(id);
  };

  const renderImages = (images: string[]) => {
    if (!images || images.length === 0) return null;
    const count = images.length;
    const columns = count === 1 ? 1 : count === 4 ? 2 : 3;
    const maxWidth =
      count === 1 ? "80%" : count === 4 ? "280px" : "320px";

    return (
      <div className="w-full flex justify-start sm:justify-center mt-4 md:mt-6">
        <div
          className="grid gap-1.5 md:gap-2 sm:mx-auto"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            width: "100%",
            maxWidth,
          }}
        >
          {images.slice(0, 9).map((src, idx) => (
            <div
              key={idx}
              onClick={() => setLightbox({ images, index: idx })}
              className="group relative aspect-square overflow-hidden rounded-lg md:rounded-xl bg-slate-200/20 dark:bg-slate-700/20 border border-slate-200/50 dark:border-white/10 cursor-zoom-in"
            >
              <img
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              {idx === 8 && count > 9 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white backdrop-blur-[2px]">
                  <span className="text-lg md:text-xl font-black">
                    +{count - 9}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMomentCard = (moment: (typeof processedMoments)[0]) => {
    const images: string[] = (() => {
      try {
        return moment.images ? JSON.parse(moment.images as string) : [];
      } catch {
        return [];
      }
    })();

    return (
      <div
        key={moment.id}
        className="flex flex-col bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl md:rounded-[40px] shadow-lg md:shadow-xl border border-white/40 dark:border-white/10 p-5 md:p-8 transition-shadow hover:shadow-2xl overflow-hidden relative group w-full xh-animate-in"
      >
        {/* Author row */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 pb-4 md:pb-5 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl overflow-hidden shadow-sm md:shadow-md border-2 border-white dark:border-slate-700">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base md:text-lg font-black text-[#576b95] dark:text-[#7f99cc] tracking-wide">
              {siteConfig.author}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] text-slate-400 font-bold mt-0.5">
              <Clock size={10} className="md:w-3 md:h-3" />
              {timeAgo(moment.createdAt)}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-slate-800 dark:text-slate-200 text-[14px] md:text-[16px] leading-relaxed whitespace-pre-wrap font-medium break-words">
          {moment.content}
        </p>

        {/* Images */}
        {renderImages(images)}

        {/* Footer */}
        <div className="mt-4 md:mt-6 flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            {moment.location && (
              <span className="inline-flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[11px] font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 max-w-full truncate border border-indigo-500/10">
                <MapPin
                  size={10}
                  className="md:w-3 md:h-3 shrink-0"
                />
                <span className="truncate">{moment.location}</span>
              </span>
            )}
          </div>
          <button
            onClick={() => handleLike(moment.id)}
            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0 rounded-full transition-all shadow-sm ${
              likedIds.has(moment.id)
                ? "bg-red-500 text-white shadow-red-500/30"
                : "bg-white/80 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <span className="text-sm">
              {likedIds.has(moment.id) ? "❤️" : "🤍"}
            </span>
          </button>
        </div>
      </div>
    );
  };

  // Split into two columns for waterfall
  const leftMoments = processedMoments.filter((_, i) => i % 2 === 0);
  const rightMoments = processedMoments.filter((_, i) => i % 2 === 1);

  return (
    <div className="flex flex-col gap-6 md:gap-10 relative z-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 md:mb-4">
          生活动态
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium italic opacity-80 flex items-center justify-center gap-1.5">
          <span className="text-indigo-500">✨</span>
          " 在代码之外捕捉瞬间的温度 "
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col items-center gap-5 md:gap-6">
        <div className="relative w-full max-w-lg group">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-20 pointer-events-none" />
          <input
            type="text"
            placeholder="搜寻被遗忘的记忆..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-xl md:rounded-2xl px-5 py-3 md:py-4 pl-12 md:pl-14 text-sm md:text-base text-slate-800 dark:text-white shadow-lg md:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
          />
        </div>

        <div className="flex bg-white/50 dark:bg-slate-800/50 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-white/50 dark:border-white/10 shadow-sm">
          <button
            onClick={() => setSortOrder("desc")}
            className={`flex items-center gap-1.5 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-300 ${
              sortOrder === "desc"
                ? "bg-indigo-500 text-white shadow-md scale-105"
                : "text-slate-500 hover:text-indigo-500"
            }`}
          >
            最新
          </button>
          <button
            onClick={() => setSortOrder("asc")}
            className={`flex items-center gap-1.5 px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-300 ${
              sortOrder === "asc"
                ? "bg-indigo-500 text-white shadow-md scale-105"
                : "text-slate-500 hover:text-indigo-500"
            }`}
          >
            最早
          </button>
        </div>
      </div>

      {/* Moments waterfall */}
      {processedMoments.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 w-full items-start pb-16">
          <div className="flex-1 flex flex-col gap-5 md:gap-8 w-full min-w-0">
            {leftMoments.map((m) => renderMomentCard(m))}
          </div>
          <div className="flex-1 flex flex-col gap-5 md:gap-8 w-full min-w-0">
            {rightMoments.map((m) => renderMomentCard(m))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 md:py-24 min-h-[300px]">
          <div className="flex flex-col items-center text-center px-6 md:px-10 py-12 md:py-20 bg-white/40 dark:bg-slate-800/30 backdrop-blur-3xl rounded-[32px] md:rounded-[50px] border border-white/30 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] max-w-lg w-full mx-auto">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
              <Ghost
                size={32}
                className="md:w-12 md:h-12 text-indigo-500 relative z-10"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 md:mb-4 tracking-tight">
              {searchQuery ? "没找到相关记忆" : "朋友圈空空如也"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-lg leading-relaxed">
              {searchQuery
                ? "尝试精简你的搜索词，或者换个心情再次出发。"
                : "还没有记录下任何生活碎片呢。"}
            </p>
          </div>
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <button
          onClick={onLoadMore}
          className="xh-glass p-4 text-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2 rounded-2xl"
        >
          加载更多
        </button>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => setLightbox(null)}
        >
          {lightbox.images.length > 1 && (
            <>
              <button
                className="absolute left-4 md:left-12 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 border border-white/5 backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox({
                    ...lightbox,
                    index:
                      (lightbox.index -
                        1 +
                        lightbox.images.length) %
                      lightbox.images.length,
                  });
                }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 md:right-12 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 border border-white/5 backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox({
                    ...lightbox,
                    index:
                      (lightbox.index + 1) %
                      lightbox.images.length,
                  });
                }}
              >
                ›
              </button>
            </>
          )}
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12 pointer-events-none">
            <img
              src={lightbox.images[lightbox.index]}
              className="max-w-full max-h-[75vh] md:max-h-[85vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto"
              alt="fullscreen"
            />
            <div className="absolute bottom-8 md:bottom-10 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[10px] md:text-xs font-black tracking-widest border border-white/10">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
