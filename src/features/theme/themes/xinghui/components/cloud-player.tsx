"use client";

import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useMusic } from "./music-provider";

const formatTime = (time: number) => {
  if (!time || isNaN(time)) return "00:00";
  const m = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export function CloudPlayer() {
  const {
    playlist,
    currentSong,
    isPlaying,
    progress,
    currentTime,
    duration,
    currentLyric,
    isLoading,
    volume,
    isMuted,
    playMode,
    togglePlay,
    nextSong,
    prevSong,
    handleSeek,
    setVolume,
    toggleMute,
    togglePlayMode,
  } = useMusic();

  const [displayedLyric, setDisplayedLyric] = useState("");

  // Typing effect for lyrics
  useEffect(() => {
    let i = 0;
    setDisplayedLyric("");
    const target = currentLyric || "";
    if (!target) return;

    const typingInterval = setInterval(() => {
      if (i <= target.length) {
        setDisplayedLyric(target.slice(0, i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentLyric]);

  if (isLoading) {
    return (
      <div className="xh-glass p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-slate-800 dark:text-white font-bold tracking-widest animate-pulse text-sm">
          CONNECTING...
        </span>
      </div>
    );
  }

  if (playlist.length === 0 || !currentSong) {
    return (
      <div className="xh-glass p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
        <div className="w-16 h-16 mb-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-inner opacity-50">
          <Play className="w-8 h-8 text-slate-400" />
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-bold tracking-widest text-xs uppercase">
          No Music
        </span>
      </div>
    );
  }

  const playModeIcon =
    playMode === "single" ? (
      <Repeat1 size={14} />
    ) : playMode === "random" ? (
      <Shuffle size={14} />
    ) : (
      <Repeat size={14} />
    );

  return (
    <div className="xh-glass xh-glass-hover p-6 flex flex-col justify-between h-full min-h-[280px] relative overflow-hidden group">
      {/* Decorative glow */}
      <div
        className={`absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 blur-[50px] rounded-full transition-opacity duration-1000 ${
          isPlaying ? "opacity-100" : "opacity-30"
        }`}
      />

      {/* Top: Album art + Info */}
      <div className="flex items-center gap-5 relative z-10 mb-4">
        {/* Spinning disc */}
        <div
          className={`w-20 h-20 rounded-full border-2 border-white/50 shadow-lg flex-shrink-0 overflow-hidden relative ${
            isPlaying ? "xh-spin-slow" : ""
          }`}
          style={{
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        >
          {currentSong.cover ? (
            <img
              src={currentSong.cover}
              alt="cover"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-300 shadow-inner" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-800 dark:text-white truncate">
            {currentSong.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {currentSong.artist}
          </p>
        </div>
      </div>

      {/* Lyric line */}
      <div className="relative z-10 mb-4 px-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate italic">
          {displayedLyric}
          <span className="inline-block w-[2px] h-3 bg-indigo-400 align-middle ml-0.5 xh-cursor" />
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mb-3">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayMode}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
            title={playMode}
          >
            {playModeIcon}
          </button>
          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevSong}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <button
            onClick={nextSong}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Volume slider (desktop only) */}
        <div className="hidden sm:flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
