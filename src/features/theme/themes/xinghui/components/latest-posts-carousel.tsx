import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";
import type { PostItem } from "@/features/posts/schema/posts.schema";

interface LatestPostsCarouselProps {
  posts: PostItem[];
}

export function LatestPostsCarousel({ posts }: LatestPostsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => setCurrentIndex((i) => (i === 0 ? posts.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === posts.length - 1 ? 0 : i + 1));

  if (posts.length === 0) return null;

  const post = posts[currentIndex];

  return (
    <div className="xh-glass xh-glass-hover p-5 flex flex-col h-full min-h-[280px] relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          📝 最新文章
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-slate-400 font-mono min-w-[3ch] text-center">
            {currentIndex + 1}/{posts.length}
          </span>
          <button
            onClick={next}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Post content */}
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        className="flex-1 flex flex-col justify-between group/link"
      >
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors">
            {post.title}
          </h4>
          {post.summary && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {post.summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 dark:text-slate-500">
          <Clock size={12} />
          <span>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
              : "未发布"}
          </span>
          {post.readTimeInMinutes && (
            <>
              <span>·</span>
              <span>{post.readTimeInMinutes} 分钟</span>
            </>
          )}
        </div>
      </Link>

      {/* View all link */}
      <Link
        to="/posts"
        className="mt-4 text-center text-xs font-medium text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
      >
        查看全部文章 →
      </Link>
    </div>
  );
}
