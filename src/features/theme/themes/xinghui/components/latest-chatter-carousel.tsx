import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import { getPostCover } from "../utils/post-cover";

interface LatestChatterCarouselProps {
  posts: PostItem[];
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function LatestChatterCarousel({ posts }: LatestChatterCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const goTo = useCallback(
    (idx: number) => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(idx);
        setFade(true);
      }, 300);
    },
    [],
  );

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => {
      goTo((currentIndex + 1) % posts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, posts.length, goTo]);

  if (posts.length === 0) {
    return (
      <div className="w-full h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 flex items-center justify-center min-h-[220px]">
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          暂无杂谈，去看看吧 →
        </p>
      </div>
    );
  }

  const post = posts[currentIndex];

  return (
    <div className="w-full h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden relative group min-h-[220px] flex flex-col">
      {/* Clickable link */}
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        className="absolute inset-0 z-20"
        aria-label={`查看杂谈: ${post.title}`}
      />

      {/* Full-cover background image with fade transition */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-700"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <img
          src={getPostCover(post.slug, post.cover)}
          alt=""
          className="w-full h-full object-cover opacity-80 dark:opacity-60 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />
      </div>

      {/* Text content */}
      <div className="relative z-10 flex flex-col justify-center p-6 md:p-8 h-full pointer-events-none w-full md:w-[85%]">
        <div className="flex items-end gap-2 mb-2">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 shadow-sm">
            Records
          </span>
          {post.publishedAt && (
            <span className="text-[11px] font-mono text-slate-300 drop-shadow-md">
              {formatDate(post.publishedAt)}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors line-clamp-1 drop-shadow-md">
          {post.title}
        </h3>
        {post.summary && (
          <p className="text-sm text-slate-300 font-medium leading-relaxed drop-shadow-md line-clamp-2">
            {post.summary}
          </p>
        )}
      </div>

      {/* Dots indicator */}
      {posts.length > 1 && (
        <div className="absolute bottom-5 right-6 z-30 flex gap-2">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${
                i === currentIndex
                  ? "w-6 bg-indigo-400"
                  : "w-2 bg-white/40 hover:bg-white/80"
              }`}
              aria-label="跳转"
            />
          ))}
        </div>
      )}
    </div>
  );
}
