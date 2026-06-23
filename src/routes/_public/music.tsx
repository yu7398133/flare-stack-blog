import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { useMusic } from "../../features/theme/themes/xinghui/components/music-provider";
import {
  Disc3,
  Repeat,
  Shuffle,
  RefreshCcw,
  Volume2,
  VolumeX,
  Search,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_public/music")({
  component: MusicPage,
});

function formatTime(time: number) {
  if (!time || isNaN(time)) return "0:00";
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function MusicPage() {
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
    playSong,
    setVolume,
    toggleMute,
    togglePlayMode,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<"lyrics" | "playlist">("lyrics");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

  const parsedLyrics = useMemo(() => {
    if (!currentSong) return [];
    if (Array.isArray(currentSong.lyrics) && currentSong.lyrics.length > 0) {
      return currentSong.lyrics;
    }
    return [];
  }, [currentSong]);

  const activeLyricIndex = useMemo(() => {
    if (!parsedLyrics.length) return -1;
    let idx =
      parsedLyrics.findIndex((l: { time: number }) => l.time > currentTime) -
      1;
    if (idx === -2) idx = parsedLyrics.length - 1;
    return Math.max(0, idx);
  }, [currentTime, parsedLyrics]);

  useEffect(() => {
    if (
      activeLyricRef.current &&
      lyricContainerRef.current &&
      activeTab === "lyrics"
    ) {
      const container = lyricContainerRef.current;
      const activeItem = activeLyricRef.current;
      const scrollTarget =
        activeItem.offsetTop -
        container.offsetHeight / 2 +
        activeItem.offsetHeight / 2;
      container.scrollTo({ top: scrollTarget, behavior: "smooth" });
    }
  }, [activeLyricIndex, activeTab]);

  const filteredPlaylist = useMemo(() => {
    if (!searchQuery.trim()) return playlist;
    const q = searchQuery.toLowerCase();
    return playlist.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q),
    );
  }, [playlist, searchQuery]);

  const songCover =
    currentSong?.cover ||
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop";

  const getPlayModeIcon = () => {
    switch (playMode) {
      case "loop":
        return <Repeat size={18} className="text-slate-500 hover:text-indigo-500 md:w-5 md:h-5" />;
      case "single":
        return <RefreshCcw size={18} className="text-indigo-500 md:w-5 md:h-5" />;
      case "random":
        return <Shuffle size={18} className="text-slate-500 hover:text-indigo-500 md:w-5 md:h-5" />;
      default:
        return <Repeat size={18} className="text-slate-500 md:w-5 md:h-5" />;
    }
  };

  if (isLoading || !currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Disc3 size={48} className="text-indigo-500 animate-spin" />
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono tracking-widest">
          唤醒音频引擎中...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 relative z-10">
      {/* Background blur */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-[-10%] bg-cover bg-center transition-all duration-1000 blur-[50px] opacity-40 dark:opacity-20 saturate-150"
          style={{ backgroundImage: `url(${songCover})` }}
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <div className="xh-animate-in mb-4 md:mb-8">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-widest mb-2 md:mb-4">
          云端乐律
        </h1>
        <p className="text-xs md:text-base text-slate-600 dark:text-slate-400 font-medium tracking-wider">
          在代码的缝隙中寻找灵魂的共鸣
        </p>
      </div>

      {/* Main: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 md:h-[calc(100vh-320px)] md:min-h-[600px] md:max-h-[720px]">
        {/* ====== Left: Player ====== */}
        <div className="lg:col-span-5 xh-glass p-6 md:p-10 flex flex-col min-h-[460px] md:min-h-0">
          <div className="flex-1 flex flex-col items-center justify-center py-4 md:py-0">
            {/* Cover disc */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-64 lg:h-64 flex-shrink-0 mb-6 md:mb-10">
              <div
                className={`absolute inset-0 m-auto w-[85%] h-[85%] bg-indigo-500/25 blur-[35px] rounded-full transition-all duration-1000 ${isPlaying ? "opacity-90 scale-105" : "opacity-20 scale-100"}`}
              />
              <div className="absolute inset-0 m-auto w-[90%] h-[90%] rounded-full shadow-[0_0_40px_-5px_rgba(99,102,241,0.4)]" />
              <div
                className={`absolute inset-0 w-full h-full rounded-full border-4 md:border-[6px] border-white/80 dark:border-slate-600/80 shadow-2xl overflow-hidden ${isPlaying ? "xh-rotating-disc" : "xh-rotating-disc xh-rotating-disc-paused"}`}
              >
                <img
                  src={songCover}
                  alt="cover"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 m-auto w-10 h-10 md:w-12 md:h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-inner border border-slate-300 dark:border-slate-700" />
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-20"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.4), transparent, rgba(255,255,255,0.4), transparent)",
                  }}
                />
              </div>
            </div>

            {/* Song info */}
            <div className="w-full text-center px-2 md:px-4 mb-2 md:mb-6">
              <h2 className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white truncate tracking-tight">
                {currentSong.title}
              </h2>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 truncate mt-1 md:mt-2 tracking-widest">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full mb-4 md:mb-6 px-1 md:px-3">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="w-full h-1 md:h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #4f46e5 ${progress}%, rgba(0,0,0,0.15) 0)`,
              }}
            />
            <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-1 md:px-2 lg:px-4">
            <button
              onClick={togglePlayMode}
              className="p-2 text-base hover:scale-110 transition-transform"
            >
              {getPlayModeIcon()}
            </button>
            <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
              <button
                onClick={prevSong}
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition-transform hover:scale-110"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:scale-105 shadow-xl shadow-indigo-500/40"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                  <svg className="w-5 h-5 md:w-8 md:h-8 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button
                onClick={nextSong}
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition-transform hover:scale-110"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
              </button>
            </div>
            <div
              className="relative"
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              {showVolumeSlider && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full px-3 py-2 border border-white/40">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20 h-1 appearance-none rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #4f46e5 ${(isMuted ? 0 : volume) * 100}%, rgba(0,0,0,0.15) 0)`,
                    }}
                  />
                </div>
              )}
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                onDoubleClick={toggleMute}
                className={`p-2 rounded-full transition-all ${showVolumeSlider ? "bg-indigo-500 text-white shadow-lg" : "text-slate-500 hover:text-indigo-500"}`}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} className="md:w-5 md:h-5" />
                ) : (
                  <Volume2 size={18} className="md:w-5 md:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ====== Right: Lyrics / Playlist ====== */}
        <div className="lg:col-span-7 xh-glass flex flex-col overflow-hidden h-[450px] md:h-auto md:min-h-0">
          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-1 p-1 mt-4 md:mt-6 mx-auto bg-white/50 dark:bg-slate-900/50 rounded-full shadow-inner border border-white/40 w-48 md:w-64 shrink-0">
            <button
              onClick={() => setActiveTab("lyrics")}
              className={`flex-1 py-1.5 md:py-2 rounded-full font-black text-xs md:text-[13px] transition-all ${activeTab === "lyrics" ? "bg-indigo-500 text-white shadow-md" : "text-slate-500"}`}
            >
              歌词
            </button>
            <button
              onClick={() => setActiveTab("playlist")}
              className={`flex-1 py-1.5 md:py-2 rounded-full font-black text-xs md:text-[13px] transition-all ${activeTab === "playlist" ? "bg-indigo-500 text-white shadow-md" : "text-slate-500"}`}
            >
              歌单
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 relative mt-2 flex flex-col overflow-hidden">
            {activeTab === "lyrics" ? (
              <div className="absolute inset-0 flex flex-col h-full animate-in fade-in duration-300">
                {/* Top/bottom fade */}
                <div className="absolute top-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-white/40 dark:from-slate-800/60 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-t from-white/40 dark:from-slate-800/60 to-transparent z-10 pointer-events-none" />

                <div
                  ref={lyricContainerRef}
                  className="h-full overflow-y-auto xh-scrollbar scroll-smooth px-4 md:px-6"
                >
                  <div className="py-[30vh] md:py-[35vh] flex flex-col gap-4 md:gap-6 text-center lg:px-10">
                    {parsedLyrics.length > 0 ? (
                      parsedLyrics.map(
                        (
                          line: { time: number; text: string },
                          index: number,
                        ) => {
                          const isActive = index === activeLyricIndex;
                          return (
                            <div
                              key={index}
                              ref={isActive ? activeLyricRef : null}
                              className={`transition-all duration-700 cursor-pointer px-2 md:px-4 rounded-2xl ${isActive ? "opacity-100 scale-105 py-2 md:py-3 bg-white/10" : "opacity-20 hover:opacity-40"}`}
                              onClick={() =>
                                handleSeek({
                                  target: {
                                    value: String(
                                      (line.time / (duration || 1)) * 100,
                                    ),
                                  },
                                } as React.ChangeEvent<HTMLInputElement>)
                              }
                            >
                              <p
                                className={`font-black tracking-tight leading-relaxed transition-all duration-700 ${isActive ? "text-lg md:text-2xl text-indigo-600 dark:text-indigo-400" : "text-sm md:text-lg text-slate-700 dark:text-slate-300"}`}
                                style={
                                  isActive
                                    ? {
                                        textShadow:
                                          "0 0 20px rgba(99,102,241,0.15)",
                                      }
                                    : {}
                                }
                              >
                                {line.text}
                              </p>
                            </div>
                          );
                        },
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-3 md:gap-4">
                        <Disc3 size={32} className="text-indigo-500/40 animate-spin" />
                        <p className="text-base md:text-xl font-black text-indigo-500 animate-pulse">
                          {currentLyric || "正在捕获灵魂旋律..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 px-4 md:px-8 pb-4 md:pb-8 pt-2 md:pt-4 animate-in fade-in duration-300 flex flex-col">
                {/* Search */}
                <div className="relative w-full max-w-md mx-auto group mb-4 md:mb-8 shrink-0">
                  <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-focus-within:bg-indigo-500/10 transition-all rounded-full" />
                  <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="搜索音轨..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 md:h-12 pl-10 md:pl-12 pr-10 md:pr-12 bg-white/30 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-full text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-inner transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-black/10 rounded-full transition-colors"
                    >
                      <X size={14} className="text-slate-500" />
                    </button>
                  )}
                </div>

                {/* Song list */}
                <div className="flex-1 overflow-y-auto xh-scrollbar pr-2 flex flex-col gap-2 md:gap-2.5">
                  {filteredPlaylist.map((song) => {
                    const idx = playlist.findIndex((s) => s.id === song.id);
                    const active = song.id === currentSong.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(idx)}
                        className={`group flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer transition-all border ${active ? "bg-white/60 dark:bg-slate-700/80 shadow-md border-indigo-500/30" : "border-transparent hover:bg-white/30 dark:hover:bg-slate-700/40"}`}
                      >
                        <div className="flex items-center gap-3 md:gap-4 w-[85%]">
                          <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-lg md:rounded-xl overflow-hidden shadow-sm">
                            <img
                              src={song.cover}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            {active && isPlaying && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="flex gap-[3px] items-end h-2 md:h-3">
                                  <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
                                  <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:200ms]" />
                                  <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:400ms]" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col truncate">
                            <span
                              className={`text-sm md:text-[15px] font-black truncate ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"}`}
                            >
                              {song.title}
                            </span>
                            <span className="text-[10px] md:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {song.artist}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
