import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import type { PostItem } from "@/features/posts/schema/posts.schema";

interface LatestPostsCarouselProps {
  posts: PostItem[];
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function getPostCover(slug: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/800/500`;
}

export function LatestPostsCarousel({ posts }: LatestPostsCarouselProps) {
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
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, posts.length, goTo]);

  if (posts.length === 0) {
    return (
      <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 h-full flex items-center justify-center min-h-[420px]">
        <p className="text-slate-400 dark:text-slate-500 text-sm">暂无文章</p>
      </div>
    );
  }

  const post = posts[currentIndex];

  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden relative group min-h-[420px] h-full flex flex-col">
      {/* Full-cover background image with fade transition */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-700"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <img
          src={post.cover || getPostCover(post.slug)}
          alt=""
          className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      {/* Clickable link */}
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        className="absolute inset-0 z-20"
        aria-label={`阅读 ${post.title}`}
      />

      {/* Text content at bottom */}
      <div className="relative z-10 flex flex-col justify-end p-6 w-full mt-auto h-full pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-indigo-500/80 backdrop-blur-lg rounded-full text-[10px] text-white font-black uppercase tracking-widest shadow-lg">
            Latest Insight
          </span>
          {post.publishedAt && (
            <span className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-[10px] text-white/90 font-mono tracking-wider">
              {formatDate(post.publishedAt)}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 group-hover:-translate-y-1 transition-transform drop-shadow-md">
          {post.title}
        </h2>
        {post.summary && (
          <p className="text-sm text-gray-300 line-clamp-3 drop-shadow-sm mb-6">
            {post.summary}
          </p>
        )}
      </div>

      {/* Dots indicator */}
      {posts.length > 1 && (
        <div className="absolute bottom-4 right-6 z-30 flex gap-2">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndex
                  ? "w-6 bg-indigo-400"
                  : "w-2 bg-white/40 hover:bg-white/80"
              }`}
              aria-label={`切换到第 ${i + 1} 篇文章`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
