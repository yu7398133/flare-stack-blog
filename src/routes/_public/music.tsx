import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { useMusic } from "../../features/theme/themes/xinghui/components/music-provider";

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

  // Parse lyrics from current song
  const parsedLyrics = useMemo(() => {
    if (!currentSong) return [];
    if (
      Array.isArray(currentSong.lyrics) &&
      currentSong.lyrics.length > 0
    ) {
      return currentSong.lyrics;
    }
    return [];
  }, [currentSong]);

  // Active lyric index
  const activeLyricIndex = useMemo(() => {
    if (!parsedLyrics.length) return -1;
    let idx =
      parsedLyrics.findIndex((l: { time: number }) => l.time > currentTime) -
      1;
    if (idx === -2) idx = parsedLyrics.length - 1;
    return Math.max(0, idx);
  }, [currentTime, parsedLyrics]);

  // Auto-scroll lyrics
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

  // Filter playlist
  const filteredPlaylist = useMemo(() => {
    if (!searchQuery.trim()) return playlist;
    const lowerQuery = searchQuery.toLowerCase();
    return playlist.filter(
      (song) =>
        (song.title || "").toLowerCase().includes(lowerQuery) ||
        (song.artist || "").toLowerCase().includes(lowerQuery),
    );
  }, [playlist, searchQuery]);

  const songCover =
    currentSong?.cover ||
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop";

  const getPlayModeIcon = () => {
    switch (playMode) {
      case "loop":
        return "🔁";
      case "single":
        return "🔂";
      case "random":
        return "🔀";
      default:
        return "🔁";
    }
  };

  if (isLoading || !currentSong) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-4xl xh-spin-slow">💿</div>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono tracking-widest">
          唤醒音频引擎中...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Background blur */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-[-10%] bg-cover bg-center transition-all duration-1000 blur-[50px] opacity-40 dark:opacity-20 saturate-150"
          style={{ backgroundImage: `url(${songCover})` }}
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <div className="xh-glass p-6 relative z-10">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-widest mb-1">
          云端乐律
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 tracking-wider">
          在代码的缝隙中寻找灵魂的共鸣
        </p>
      </div>

      {/* Main content: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left: Player console */}
        <div className="lg:col-span-5 xh-glass p-6 md:p-8 flex flex-col">
          {/* Cover disc */}
          <div className="flex-1 flex flex-col items-center justify-center mb-6">
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8">
              {/* Glow */}
              <div
                className={`absolute inset-0 m-auto w-[85%] h-[85%] bg-indigo-500/25 blur-[35px] rounded-full transition-all duration-1000 ${isPlaying ? "opacity-90 scale-105" : "opacity-20 scale-100"}`}
              />
              {/* Shadow ring */}
              <div className="absolute inset-0 m-auto w-[90%] h-[90%] rounded-full shadow-[0_0_40px_-5px_rgba(99,102,241,0.4)]" />
              {/* Rotating disc */}
              <div
                className={`absolute inset-0 w-full h-full rounded-full border-4 border-white/80 dark:border-slate-600/80 shadow-2xl overflow-hidden ${isPlaying ? "xh-rotating-disc" : "xh-rotating-disc xh-rotating-disc-paused"}`}
              >
                <img
                  src={songCover}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
                {/* Center hole */}
                <div className="absolute inset-0 m-auto w-10 h-10 md:w-12 md:h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-inner border border-slate-300 dark:border-slate-700" />
                {/* Vinyl grooves */}
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
            <div className="w-full text-center px-4">
              <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white truncate">
                {currentSong.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 tracking-widest">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full mb-4 px-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #4f46e5 ${progress}%, rgba(0,0,0,0.15) 0)`,
              }}
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={togglePlayMode}
              className="p-2 text-lg hover:scale-110 transition-transform"
              title={playMode}
            >
              {getPlayModeIcon()}
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={prevSong}
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-500 hover:scale-110 transition-all text-xl"
              >
                ⏮
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:scale-105 shadow-xl shadow-indigo-500/40 text-xl"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                onClick={nextSong}
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-500 hover:scale-110 transition-all text-xl"
              >
                ⏭
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
                className="p-2 text-slate-500 hover:text-indigo-500 text-lg"
              >
                {isMuted || volume === 0 ? "🔇" : "🔊"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Lyrics / Playlist */}
        <div className="lg:col-span-7 xh-glass flex flex-col overflow-hidden min-h-[500px]">
          {/* Tab switcher */}
          <div className="flex items-center justify-center gap-1 p-1 mt-4 mx-auto bg-white/50 dark:bg-slate-900/50 rounded-full shadow-inner border border-white/40 w-48">
            <button
              onClick={() => setActiveTab("lyrics")}
              className={`flex-1 py-1.5 rounded-full font-bold text-xs transition-all ${
                activeTab === "lyrics"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-slate-500"
              }`}
            >
              歌词
            </button>
            <button
              onClick={() => setActiveTab("playlist")}
              className={`flex-1 py-1.5 rounded-full font-bold text-xs transition-all ${
                activeTab === "playlist"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "text-slate-500"
              }`}
            >
              歌单
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden mt-2">
            {activeTab === "lyrics" ? (
              <div className="relative h-full">
                {/* Fade gradients */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/40 dark:from-slate-800/60 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 dark:from-slate-800/60 to-transparent z-10 pointer-events-none" />

                <div
                  ref={lyricContainerRef}
                  className="h-full overflow-y-auto xh-scrollbar scroll-smooth px-6"
                >
                  <div className="py-[30vh] flex flex-col gap-4 text-center">
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
                              className={`transition-all duration-700 cursor-pointer px-4 rounded-2xl ${
                                isActive
                                  ? "opacity-100 scale-105 py-2 bg-indigo-500/10"
                                  : "opacity-20 hover:opacity-40"
                              }`}
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
                                className={`font-bold tracking-tight transition-all duration-700 ${
                                  isActive
                                    ? "text-lg md:text-xl text-indigo-600 dark:text-indigo-400"
                                    : "text-sm md:text-base text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {line.text}
                              </p>
                            </div>
                          );
                        },
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-3xl animate-spin">💿</span>
                        <p className="text-base font-bold text-indigo-500 animate-pulse">
                          {currentLyric || "正在捕获灵魂旋律..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col px-4 pb-4">
                {/* Search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="🔍 搜索音轨..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 bg-white/30 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Playlist */}
                <div className="flex-1 overflow-y-auto xh-scrollbar flex flex-col gap-1.5">
                  {filteredPlaylist.map((song) => {
                    const originalIndex = playlist.findIndex(
                      (s) => s.id === song.id,
                    );
                    const isPlayingThis = song.id === currentSong.id;
                    return (
                      <div
                        key={song.id}
                        onClick={() => playSong(originalIndex)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          isPlayingThis
                            ? "bg-white/60 dark:bg-slate-700/80 shadow-md border-indigo-500/30"
                            : "border-transparent hover:bg-white/30 dark:hover:bg-slate-700/40"
                        }`}
                      >
                        {/* Cover */}
                        <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={song.cover}
                            alt="cover"
                            className="w-full h-full object-cover"
                          />
                          {isPlayingThis && isPlaying && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="flex gap-[3px] items-end h-2">
                                <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:200ms]" />
                                <span className="w-0.5 bg-white rounded-full animate-bounce [animation-delay:400ms]" />
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 truncate">
                          <p
                            className={`text-sm font-bold truncate ${
                              isPlayingThis
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-800 dark:text-white"
                            }`}
                          >
                            {song.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {song.artist}
                          </p>
                        </div>
                        {/* Index number */}
                        <span className="text-xs text-slate-400 font-mono w-6 text-right">
                          {originalIndex + 1}
                        </span>
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
