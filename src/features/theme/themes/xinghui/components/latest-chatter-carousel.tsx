import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";

interface ChatterItem {
  id: number;
  content: string;
  createdAt: string;
  mood: string | null;
  location: string | null;
}

interface LatestChatterCarouselProps {
  chatters: ChatterItem[];
}

export function LatestChatterCarousel({
  chatters,
}: LatestChatterCarouselProps) {
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
    goToSlide((currentIndex + 1) % chatters.length);
  }, [currentIndex, chatters.length, goToSlide]);

  useEffect(() => {
    if (chatters.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, chatters.length]);

  if (chatters.length === 0) {
    return (
      <div className="xh-glass p-6 h-full flex items-center justify-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          暂无说说
        </p>
      </div>
    );
  }

  const chatter = chatters[currentIndex];

  return (
    <div className="xh-glass p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-mono text-pink-500 dark:text-pink-400 uppercase tracking-widest">
          💬 Chatter
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-pink-500/30 to-transparent" />
      </div>

      {/* Content */}
      <Link to="/moments" className="flex-1 flex flex-col justify-center group">
        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-4 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {chatter.content}
        </p>
        <div className="flex items-center gap-2 mt-3">
          {chatter.mood && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
              {chatter.mood}
            </span>
          )}
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {new Date(chatter.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
      </Link>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {chatters.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-6 bg-pink-500"
                : "w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
