import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Clock, Ghost } from "lucide-react";
import type { PostListItem } from "@/features/posts/schema/posts.schema";
import { getPostCover } from "../../utils/post-cover";

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffInSeconds < 60) return "刚刚";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  return d
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

interface TalkPageProps {
  posts: PostListItem[];
  hasNextPage: boolean;
  onLoadMore: () => void;
}

export function TalkPage({ posts, hasNextPage, onLoadMore }: TalkPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.trim().toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.summary || "").toLowerCase().includes(q),
    );
  }, [posts, searchQuery]);

  const renderCover = (post: PostListItem) => {
    const cover = getPostCover(post.slug, null, 400, 250);
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative group flex-shrink-0">
        <img
          src={cover}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 md:mb-4">
          云端杂谈
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium italic opacity-80 flex items-center justify-center gap-1.5">
          <span className="text-indigo-500">✨</span>
          " 在代码之外记录生活的碎片 "
        </p>
      </div>

      {/* Search */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-lg group">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-20 pointer-events-none" />
          <input
            type="text"
            placeholder="搜寻被遗忘的思绪..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl px-5 py-3.5 pl-14 text-sm text-slate-800 dark:text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Talk entries */}
      {filteredPosts.length > 0 ? (
        <div className="flex flex-col gap-5">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to="/post/$slug"
              params={{ slug: post.slug }}
              className="group flex flex-col md:flex-row gap-4 md:gap-6 bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 dark:border-white/10 p-5 md:p-6 transition-all hover:shadow-2xl hover:scale-[1.01] xh-animate-in"
            >
              {/* Cover */}
              <div className="md:w-64 lg:w-80 shrink-0">
                {renderCover(post)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h2>
                  {post.summary && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  {post.publishedAt && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      <Clock size={11} />
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
                    {post.publishedAt
                      ? timeAgo(post.publishedAt)
                      : timeAgo(post.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex flex-col items-center text-center px-10 py-16 bg-white/40 dark:bg-slate-800/30 backdrop-blur-3xl rounded-[40px] border border-white/30 dark:border-white/10 shadow-xl max-w-lg">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
              <Ghost
                size={40}
                className="text-indigo-500 relative z-10"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {searchQuery ? "没找到相关内容" : "杂谈空空如也"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {searchQuery ? "尝试换个关键词搜索" : "还没有记录下任何碎片呢"}
            </p>
          </div>
        </div>
      )}

      {/* Load more */}
      {hasNextPage && !searchQuery && (
        <button
          onClick={onLoadMore}
          className="xh-glass p-4 text-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2 rounded-2xl"
        >
          加载更多
        </button>
      )}
    </div>
  );
}
