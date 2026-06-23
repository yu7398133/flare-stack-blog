import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useSystemSetting } from "@/features/config/hooks/use-system-setting";
import { Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/music/")({
  ssr: false,
  component: MusicAdminPage,
  loader: () => ({ title: "音乐管理" }),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

interface SongInfo {
  id: string;
  name: string;
  artist: string;
  cover: string;
  fee?: number;
}

type MusicIdEntry = string | { id: string; audioUrl?: string; vip?: boolean };

function MusicAdminPage() {
  const { settings, isLoading: configLoading, saveSettings } = useSystemSetting();
  const [newId, setNewId] = useState("");
  const [newAudioUrl, setNewAudioUrl] = useState("");
  const [newVip, setNewVip] = useState(false);
  const [newPlaylistId, setNewPlaylistId] = useState("");
  const [saving, setSaving] = useState(false);

  // Local state for all editable fields
  const [localMusicIds, setLocalMusicIds] = useState<MusicIdEntry[]>([]);
  const [localPlaylistIds, setLocalPlaylistIds] = useState<string[]>([]);
  const [localResolverUrl, setLocalResolverUrl] = useState("");
  const hasInitialized = useRef(false);

  // Sync from settings on first load
  useEffect(() => {
    if (settings && !hasInitialized.current) {
      hasInitialized.current = true;
      setLocalMusicIds((settings.site?.theme?.xinghui?.musicIds ?? []) as MusicIdEntry[]);
      setLocalPlaylistIds(settings.site?.theme?.xinghui?.musicPlaylistIds ?? []);
      setLocalResolverUrl(settings.site?.theme?.xinghui?.musicResolverUrl ?? "");
    }
  }, [settings]);

  // Compute derived values from local state
  const musicIds: string[] = localMusicIds.map((item) =>
    typeof item === "string" ? item : item.id,
  );

  const audioUrlMap: Record<string, string> = Object.fromEntries(
    localMusicIds
      .filter((item): item is { id: string; audioUrl?: string } =>
        typeof item !== "string" && !!item.audioUrl,
      )
      .map((item) => [item.id, item.audioUrl!]),
  );

  const vipMap: Record<string, boolean> = Object.fromEntries(
    localMusicIds
      .filter((item): item is { id: string; vip?: boolean } =>
        typeof item !== "string" && !!item.vip,
      )
      .map((item) => [item.id, true]),
  );

  // Check if local state differs from saved settings
  const isDirty = (() => {
    if (!settings) return false;
    const savedMusicIds = JSON.stringify(settings.site?.theme?.xinghui?.musicIds ?? []);
    const savedPlaylistIds = JSON.stringify(settings.site?.theme?.xinghui?.musicPlaylistIds ?? []);
    const savedResolverUrl = settings.site?.theme?.xinghui?.musicResolverUrl ?? "";
    return (
      savedMusicIds !== JSON.stringify(localMusicIds) ||
      savedPlaylistIds !== JSON.stringify(localPlaylistIds) ||
      savedResolverUrl !== localResolverUrl
    );
  })();

  const { data: songs, isLoading: songsLoading } = useQuery<SongInfo[]>({
    queryKey: ["admin", "music-info", musicIds.join(","), localPlaylistIds.join(",")],
    queryFn: async () => {
      if (musicIds.length === 0 && localPlaylistIds.length === 0) return [];
      const params = new URLSearchParams();
      if (musicIds.length > 0) params.set("ids", musicIds.join(","));
      if (localPlaylistIds.length > 0) params.set("playlistIds", localPlaylistIds.join(","));
      const res = await fetch(`/api/music?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data as Array<Record<string, unknown>>)
        .filter((s) => s && !s.error)
        .map((s) => ({
          id: String(s.id),
          name: String(s.name || s.title || "未知"),
          artist: String(s.artist || s.author || "未知"),
          cover: String(s.cover || s.pic || ""),
          fee: s.fee as number | undefined,
        }));
    },
    enabled: musicIds.length > 0 || localPlaylistIds.length > 0,
  });

  // Unified save
  const handleSave = useCallback(async () => {
    if (!settings || saving) return;
    setSaving(true);
    try {
      await saveSettings({
        data: {
          ...settings,
          site: {
            ...settings.site,
            theme: {
              ...settings.site?.theme,
              xinghui: {
                ...settings.site?.theme?.xinghui,
                musicIds: localMusicIds,
                musicPlaylistIds: localPlaylistIds,
                musicResolverUrl: localResolverUrl,
              },
            },
          },
        },
      });
      toast.success("已保存");
    } catch (err) {
      console.error("[admin/music] save failed:", err);
      toast.error("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }, [settings, saving, saveSettings, localMusicIds, localPlaylistIds, localResolverUrl]);

  // --- Local-only operations ---

  const handleAdd = () => {
    const id = newId.trim();
    if (!id) return toast.error("请输入歌曲ID");
    if (musicIds.includes(id)) return toast.error("该歌曲已存在");
    const audioUrl = newAudioUrl.trim();
    const entry: MusicIdEntry = audioUrl ? { id, audioUrl } : newVip ? { id, vip: true } : id;
    setLocalMusicIds((prev) => [...prev, entry]);
    setNewId("");
    setNewAudioUrl("");
    setNewVip(false);
  };

  const handleRemove = (id: string) => {
    if (!confirm("确定移除这首歌曲?")) return;
    setLocalMusicIds((prev) =>
      prev.filter((item) => (typeof item === "string" ? item !== id : item.id !== id)),
    );
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    setLocalMusicIds((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const handleMoveDown = (idx: number) => {
    setLocalMusicIds((prev) => {
      if (idx >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  const handleToggleVip = (id: string) => {
    setLocalMusicIds((prev) =>
      prev.map((item) => {
        if (typeof item === "string") {
          return item === id ? { id, vip: true } : item;
        }
        if (item.id === id) {
          return { ...item, vip: !item.vip };
        }
        return item;
      }),
    );
  };

  const handleAddPlaylist = () => {
    const id = newPlaylistId.trim();
    if (!id) return toast.error("请输入歌单ID");
    if (localPlaylistIds.includes(id)) return toast.error("该歌单已存在");
    setLocalPlaylistIds((prev) => [...prev, id]);
    setNewPlaylistId("");
  };

  const handleRemovePlaylist = (id: string) => {
    if (!confirm("确定移除这个歌单?")) return;
    setLocalPlaylistIds((prev) => prev.filter((i) => i !== id));
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header with save button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/30 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">
            音乐管理
          </h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Music · {localPlaylistIds.length} 个歌单 · {songs?.length ?? 0} 首歌曲
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty || configLoading}
          className="hidden sm:flex h-11 px-8 items-center gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all font-mono text-[11px] uppercase tracking-[0.2em] font-medium disabled:opacity-50 shadow-lg shadow-foreground/5"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          {saving ? "保存中..." : "应用修改"}
        </button>
      </div>

      {/* Music resolver API */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">音乐解析 API</h3>
        <p className="text-xs text-muted-foreground">
          部署 music-resolver Worker 后，填入其地址，即可自动解析 VIP 歌曲的真实播放链接
        </p>
        <p className="text-[11px] font-mono text-muted-foreground">
          音频源优先级：自定义音频源 > 解析 API（仅 VIP 歌曲） > 网易云直链
        </p>
        <p className="text-[11px] font-mono text-muted-foreground">
          VIP 歌曲会自动尝试通过解析 API 获取可播放地址；非 VIP 歌曲直接使用网易云直链。
        </p>
        <div className="flex gap-3">
          <input
            value={localResolverUrl}
            onChange={(e) => setLocalResolverUrl(e.target.value)}
            placeholder="https://your-music-resolver.workers.dev"
            className="flex-1 bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
          />
        </div>
        {localResolverUrl && (
          <p className="text-[11px] text-emerald-500 font-mono">
            ✓ 已配置：{localResolverUrl}
          </p>
        )}
      </div>

      {/* Playlist section */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">歌单管理</h3>
        <p className="text-xs text-muted-foreground">
          输入网易云音乐歌单ID（从歌单页URL获取，如 music.163.com/playlist?id=<b>9157541613</b>），歌单内所有歌曲会自动加载
        </p>
        <div className="flex gap-3">
          <input
            value={newPlaylistId}
            onChange={(e) => setNewPlaylistId(e.target.value)}
            placeholder="歌单ID，如 9157541613"
            className="flex-1 bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleAddPlaylist()}
          />
          <button
            onClick={handleAddPlaylist}
            disabled={configLoading}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            添加歌单
          </button>
        </div>
        {localPlaylistIds.length > 0 && (
          <div className="space-y-2 mt-4">
            {localPlaylistIds.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between border border-border/30 p-3 group hover:border-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📋</span>
                  <span className="text-sm font-mono">歌单 {id}</span>
                  <a
                    href={`https://music.163.com/playlist?id=${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    查看
                  </a>
                </div>
                <button
                  onClick={() => handleRemovePlaylist(id)}
                  className="text-xs font-mono text-muted-foreground hover:text-destructive px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add individual song */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">添加单曲</h3>
        <p className="text-xs text-muted-foreground">
          输入网易云音乐歌曲ID（从歌曲页URL获取，如 music.163.com/song?id=<b>1809646618</b>）
        </p>
        <div className="flex gap-3">
          <input
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="歌曲ID，如 1809646618"
            className="flex-1 bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <input
            value={newAudioUrl}
            onChange={(e) => setNewAudioUrl(e.target.value)}
            placeholder="自定义音频源（可选，留空用网易云）"
            className="flex-1 bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <label className="flex items-center gap-2 px-3 border border-border/30 cursor-pointer hover:border-foreground/30 transition-colors">
            <input
              type="checkbox"
              checked={newVip}
              onChange={(e) => setNewVip(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs font-mono">VIP</span>
          </label>
          <button
            onClick={handleAdd}
            disabled={configLoading}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            添加
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          勾选 VIP：该歌曲将通过解析 API 获取真实播放链接，无需自定义音频源
        </p>
      </div>

      {/* Song list */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">
          播放列表 · {songs?.length ?? 0} 首
        </h3>
        {configLoading || songsLoading ? (
          <div className="text-center text-muted-foreground text-xs font-mono py-20">
            加载中...
          </div>
        ) : !songs || songs.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs font-mono py-20">
            暂无歌曲，请添加歌单或单曲
          </div>
        ) : (
          <div className="space-y-3">
            {songs.map((song) => {
              const isDirectSong = musicIds.includes(song.id);
              const hasCustomAudio = !!audioUrlMap[song.id];
              const isVip = !!vipMap[song.id] || song.fee === 1;
              return (
                <div
                  key={song.id}
                  className="border border-border/30 p-4 group hover:border-foreground/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0">
                      {song.cover ? (
                        <img
                          src={song.cover}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          🎵
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-bold truncate">
                        {song.name}
                        {hasCustomAudio && (
                          <span className="ml-2 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            自定义源
                          </span>
                        )}
                        {isVip && !hasCustomAudio && (
                          <span className="ml-2 text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            VIP
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {song.artist}
                      </p>
                    </div>
                    {isDirectSong && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleVip(song.id)}
                          className={`text-xs font-mono px-2 py-1 transition-colors ${
                            isVip
                              ? "text-amber-500 hover:text-amber-600 bg-amber-500/10"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {isVip ? "VIP ✓" : "VIP"}
                        </button>
                        <button
                          onClick={() => {
                            const idx = localMusicIds.findIndex((item) =>
                              typeof item === "string" ? item === song.id : item.id === song.id,
                            );
                            if (idx > 0) handleMoveUp(idx);
                          }}
                          className="text-xs font-mono text-muted-foreground hover:text-foreground px-1"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => {
                            const idx = localMusicIds.findIndex((item) =>
                              typeof item === "string" ? item === song.id : item.id === song.id,
                            );
                            if (idx < localMusicIds.length - 1) handleMoveDown(idx);
                          }}
                          className="text-xs font-mono text-muted-foreground hover:text-foreground px-1"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleRemove(song.id)}
                          className="text-xs font-mono text-muted-foreground hover:text-destructive px-2 ml-2"
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating save button for mobile */}
      {isDirty && (
        <div className="fixed bottom-8 right-6 z-50 sm:hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-14 w-14 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-2xl flex items-center justify-center p-0"
          >
            {saving ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Check size={24} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
