"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

// LRC lyric parser
function parseLrc(lrcText: string) {
  if (!lrcText || lrcText.length > 30000) return [];

  const lines = lrcText.split(/\r?\n/);
  const result: { time: number; text: string }[] = [];

  for (const line of lines) {
    const matches = [...line.matchAll(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g)];
    if (matches.length > 0) {
      const text = line
        .replace(/\[\d{2,}:\d{2}(?:\.\d{2,3})?\]/g, "")
        .trim()
        .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "");

      if (text) {
        for (const match of matches) {
          const min = parseInt(match[1]);
          const sec = parseInt(match[2]);
          const ms = match[3] ? parseInt(match[3]) : 0;
          const divisor = match[3] && match[3].length === 3 ? 1000 : 100;
          const time = min * 60 + sec + ms / divisor;
          result.push({ time, text });
        }
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

type PlayMode = "loop" | "single" | "random";

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  lyrics: { time: number; text: string }[];
}

interface MusicContextType {
  playlist: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentLyric: string;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  playMode: PlayMode;

  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playSong: (index: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  togglePlayMode: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}

interface MusicProviderProps {
  children: ReactNode;
  musicIds: string[];
}

export function MusicProvider({ children, musicIds }: MusicProviderProps) {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState("正在连接...");
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("loop");

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Fetch music data
  useEffect(() => {
    let isMounted = true;

    const fetchMusicData = async () => {
      try {
        const res = await fetch(`/api/music?ids=${musicIds.join(",")}`);
        const rawResults = await res.json();

        const mergedPlaylist = (rawResults as Array<Record<string, unknown>>)
          .filter((song) => song && song.url && !song.error)
          .map(
            (song): Song => ({
              id: (song.id as string) || Math.random().toString(),
              title: (song.name as string) || "未知歌曲",
              artist:
                (song.artist as string) ||
                (song.author as string) ||
                "未知歌手",
              cover:
                (song.cover as string) ||
                (song.pic as string) ||
                "",
              src: `/api/music/proxy/${song.id}`,
              lyrics: song.lrc ? parseLrc(song.lrc as string) : [],
            }),
          );

        if (isMounted) {
          if (mergedPlaylist.length > 0) {
            setPlaylist(mergedPlaylist);
          } else {
            setCurrentLyric("暂无可用歌曲");
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setCurrentLyric("加载失败");
          setIsLoading(false);
        }
      }
    };

    if (musicIds.length > 0) {
      fetchMusicData();
    } else {
      setIsLoading(false);
      setCurrentLyric("未配置歌曲");
    }

    return () => {
      isMounted = false;
    };
  }, [musicIds]);

  // Update lyrics when song changes
  useEffect(() => {
    if (playlist.length === 0) return;
    const song = playlist[currentIndex];
    if (song) {
      setLyrics(song.lyrics);
      setCurrentLyric(song.lyrics[0]?.text || "♪ ♫ ♬");
    }
  }, [currentIndex, playlist]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);

      // Find current lyric
      const current = audio.currentTime;
      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (current >= lyrics[i].time) {
          setCurrentLyric(lyrics[i].text);
          break;
        }
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      if (playMode === "single") {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    const onError = () => {
      setCurrentLyric("播放失败");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [lyrics, playMode]);

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playlist.length === 0) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentIndex, playlist]);

  // Volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (playlist.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (playlist.length === 0) return;
    let nextIndex: number;
    if (playMode === "random") {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  };

  const prevSong = () => {
    if (playlist.length === 0) return;
    const prevIndex =
      (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const value = parseFloat(e.target.value);
    audio.currentTime = (value / 100) * audio.duration;
    setProgress(value);
  };

  const playSong = (index: number) => {
    if (index < 0 || index >= playlist.length) return;
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const setVolume = (value: number) => {
    setVolumeState(value);
    setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const togglePlayMode = () => {
    const modes: PlayMode[] = ["loop", "single", "random"];
    const currentIdx = modes.indexOf(playMode);
    setPlayMode(modes[(currentIdx + 1) % modes.length]);
  };

  const currentSong = playlist[currentIndex] || null;

  return (
    <MusicContext.Provider
      value={{
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
      }}
    >
      {children}
      {/* Hidden audio element */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.src}
          preload="auto"
          crossOrigin="anonymous"
        />
      )}
    </MusicContext.Provider>
  );
}
