import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import type { PostItem } from "@/features/posts/schema/posts.schema";

interface LatestPostsCarouselProps {
  posts: PostItem[];
}

export function LatestPostsCarousel({ posts }: LatestPostsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning],
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % posts.length);
  }, [currentIndex, posts.length, goToSlide]);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide, posts.length]);

  if (posts.length === 0) {
    return (
      <div className="xh-glass p-6 h-full flex items-center justify-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          暂无文章
        </p>
      </div>
    );
  }

  const post = posts[currentIndex];

  return (
    <div className="xh-glass overflow-hidden h-full flex flex-col relative group">
      {/* Background image */}
      {post.cover && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={post.cover}
            alt=""
            className="w-full h-full object-cover blur-md scale-110 opacity-30 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent dark:from-slate-900/80 dark:via-slate-900/40 dark:to-transparent" />
        </div>
      )}

      <div className="relative z-10 p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
            Latest Posts
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/30 to-transparent" />
        </div>

        {/* Post content */}
        <div className="flex-1 flex flex-col justify-center">
          <Link
            to="/post/$slug"
            params={{ slug: post.slug }}
            className="group/link"
          >
            <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors line-clamp-2 mb-2">
              {post.title}
            </h3>
          </Link>
          {post.summary && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
              {post.summary}
            </p>
          )}
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {posts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-6 bg-indigo-500"
                  : "w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
