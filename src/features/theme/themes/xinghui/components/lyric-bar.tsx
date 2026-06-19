"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";
import { useMusic } from "./music-provider";

export function LyricBar() {
  const { isPlaying, currentLyric, currentSong } = useMusic();
  const [displayedLyric, setDisplayedLyric] = useState("");

  useEffect(() => {
    setDisplayedLyric("");
    let i = 0;
    const targetText = currentLyric || "";
    if (!targetText) return;

    const typingInterval = setInterval(() => {
      if (i <= targetText.length) {
        setDisplayedLyric(targetText.slice(0, i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentLyric]);

  if (!currentSong) return null;

  const waves = [
    { color: "bg-indigo-400", delay: "0ms" },
    { color: "bg-purple-400", delay: "200ms" },
    { color: "bg-indigo-500", delay: "400ms" },
    { color: "bg-purple-500", delay: "100ms" },
    { color: "bg-indigo-300", delay: "300ms" },
  ];

  return (
    <div className="xh-glass px-5 py-4 flex items-center justify-between h-16 group hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
      {/* Audio wave visualization */}
      <div className="flex items-end justify-center gap-1 h-8 w-16">
        {waves.map((wave, index) => (
          <div
            key={index}
            className={`w-1.5 rounded-t-sm transition-all duration-500 ease-out ${
              isPlaying
                ? `${wave.color} xh-wave-bar`
                : "h-1 bg-slate-400 dark:bg-slate-600"
            }`}
            style={{
              animationDelay: wave.delay,
              height: isPlaying ? undefined : "4px",
            }}
          />
        ))}
      </div>

      {/* Lyric display */}
      <div className="flex-1 px-6 flex justify-center items-center overflow-hidden">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wider truncate">
          {displayedLyric}
          <span className="inline-block w-[2px] h-4 bg-indigo-400 align-middle ml-0.5 xh-cursor" />
        </p>
      </div>

      {/* Music icon */}
      <div className="w-16 flex justify-end">
        <Music
          size={18}
          className={`text-indigo-400/50 transition-all duration-500 ${
            isPlaying ? "text-indigo-400" : ""
          }`}
        />
      </div>
    </div>
  );
}
