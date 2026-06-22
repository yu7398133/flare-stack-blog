import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import type { PhotoItem } from "@/features/theme/contract/pages";

interface LatestPhotosCarouselProps {
  photos: PhotoItem[];
  interval?: number;
  initialDelay?: number;
}

export function LatestPhotosCarousel({ photos, interval = 9000, initialDelay = 6000 }: LatestPhotosCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const goTo = useCallback(
    (idx: number) => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(idx);
        indexRef.current = idx;
        setFade(true);
      }, 300);
    },
    [],
  );

  useEffect(() => {
    if (photos.length <= 1) return;
    const startTimer = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const next = (indexRef.current + 1) % photos.length;
        goTo(next);
      }, interval);
    }, initialDelay);
    return () => {
      clearTimeout(startTimer);
      clearInterval(intervalRef.current);
    };
  }, [photos.length, goTo, interval, initialDelay]);

  if (photos.length === 0) {
    return (
      <Link
        to="/photowall"
        className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden relative group min-h-[200px] sm:min-h-[220px] flex-shrink-0 flex items-center justify-center"
      >
        <span className="text-4xl">📸</span>
      </Link>
    );
  }

  const photo = photos[currentIndex];

  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden transition-all duration-700 hover:scale-[1.02] relative group min-h-[200px] sm:min-h-[220px] flex-shrink-0">
      {/* Full-cover background image with fade transition */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-700"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50 group-hover:bg-black/10 transition-colors duration-500" />
      </div>

      {/* Clickable link */}
      <Link
        to="/photowall"
        className="absolute inset-0 z-20"
        aria-label="查看照片墙"
      />

      {/* Text content at bottom */}
      <div className="relative z-10 flex flex-col justify-end p-4 sm:p-6 w-full h-full pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-pink-500/80 backdrop-blur-lg rounded-full text-[10px] text-white font-black uppercase tracking-widest shadow-lg">
            Photo Wall
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-md">
          {photo.title || "照片墙"}
        </h3>
        {photo.description && (
          <p className="text-white/90 text-sm sm:text-base line-clamp-1 drop-shadow-md">
            {photo.description}
          </p>
        )}
      </div>

      {/* Dots indicator */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 right-6 z-30 flex gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndex
                  ? "w-6 bg-pink-400 shadow-sm shadow-pink-400/50"
                  : "w-2 bg-white/70 hover:bg-white shadow-sm"
              }`}
              aria-label="跳转"
            />
          ))}
        </div>
      )}
    </div>
  );
}
