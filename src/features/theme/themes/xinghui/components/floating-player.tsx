"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { useMusic } from "./music-provider";

export function FloatingPlayer() {
  const location = useLocation();
  const {
    currentSong, isPlaying, togglePlay, nextSong, currentLyric, isLoading,
  } = useMusic();
  const [isMounted, setIsMounted] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const moved = useRef(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted || isLoading || !currentSong) return null;

  // Hide on home page and music page
  const isHidden = location.pathname === "/" || location.pathname === "/music";

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    moved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true;
    setPos({
      x: dragStart.current.px + dx,
      y: dragStart.current.py + dy,
    });
  };

  const handlePointerUp = () => { setDragging(false); };

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    if (moved.current) { e.stopPropagation(); return; }
    action();
  };

  return (
    <div
      className="fixed z-[9999] transition-all duration-300"
      style={{
        bottom: isHidden ? "-80px" : "24px",
        right: "24px",
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        opacity: isHidden ? 0 : 1,
        pointerEvents: isHidden ? "none" : "auto",
      }}
    >
      <div
        className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl p-2 pr-4 rounded-full cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Spinning disc */}
        <div
          className="w-10 h-10 rounded-full border border-white/50 shadow-sm flex-shrink-0 overflow-hidden relative pointer-events-none"
          style={{
            animation: "spin 6s linear infinite",
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        >
          <img src={currentSong.cover} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-inner" />
        </div>

        {/* Song info */}
        <div className="flex flex-col w-32 max-w-[120px] overflow-hidden pointer-events-none">
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {currentSong.title}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {currentLyric || currentSong.artist}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 ml-1">
          <button
            onClick={(e) => handleClick(e, togglePlay)}
            className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
          >
            {isPlaying ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button
            onClick={(e) => handleClick(e, nextSong)}
            className="text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
