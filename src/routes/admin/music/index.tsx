import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSystemSetting } from "@/features/config/hooks/use-system-setting";
import { CONFIG_KEYS } from "@/features/config/queries";

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

function MusicAdminPage() {
  const queryClient = useQueryClient();
  const { settings, isLoading: configLoading, saveSettings } = useSystemSetting();
  const [newId, setNewId] = useState("");
  const [newAudioUrl, setNewAudioUrl] = useState("");
  const [newVip, setNewVip] = useState(false);
  const [newPlaylistId, setNewPlaylistId] = useState("");
  const [saving, setSaving] = useState(false);
  const [resolverUrl, setResolverUrl] = useState("");
  const [resolverSaving, setResolverSaving] = useState(false);

  // musicIds can contain string | { id, audioUrl?, vip? }
  const rawMusicIds: Array<string | { id: string; audioUrl?: string; vip?: boolean }> =
    settings?.site?.theme?.xinghui?.musicIds ?? [];

  // Normalize to string IDs for API calls and duplicate checks
  const musicIds: string[] = rawMusicIds.map((item) =>
    typeof item === "string" ? item : item.id,
  );

  // Build a lookup map for audioUrl
  const audioUrlMap: Record<string, string> = Object.fromEntries(
    rawMusicIds
      .filter((item): item is { id: string; audioUrl?: string } =>
        typeof item !== "string" && !!item.audioUrl,
      )
      .map((item) => [item.id, item.audioUrl!]),
  );

  // Build a lookup map for vip status
  const vipMap: Record<string, boolean> = Object.fromEntries(
    rawMusicIds
      .filter((item): item is { id: string; vip?: boolean } =>
        typeof item !== "string" && !!item.vip,
      )
      .map((item) => [item.id, true]),
  );
  const musicPlaylistIds: string[] =
    settings?.site?.theme?.xinghui?.musicPlaylistIds ?? [];

  // Sync resolverUrl from settings
  useEffect(() => {
    if (settings?.site?.theme?.xinghui?.musicResolverUrl !== undefined) {
      setResolverUrl(settings.site.theme.xinghui.musicResolverUrl);
    }
  }, [settings?.site?.theme?.xinghui?.musicResolverUrl]);

  const { data: songs, isLoading: songsLoading } = useQuery<SongInfo[]>({
    queryKey: ["admin", "music-info", musicIds.join(","), musicPlaylistIds.join(",")],
    queryFn: async () => {
      if (musicIds.length === 0 && musicPlaylistIds.length === 0) return [];
      const params = new URLSearchParams();
      if (musicIds.length > 0) params.set("ids", musicIds.join(","));
      if (musicPlaylistIds.length > 0) params.set("playlistIds", musicPlaylistIds.join(","));
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
    enabled: musicIds.length > 0 || musicPlaylistIds.length > 0,
  });

  const saveThemeConfig = async (patch: Record<string, unknown>) => {
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
                ...patch,
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
  };

  const handleAdd = () => {
    const id = newId.trim();
    if (!id) return toast.error("请输入歌曲ID");
    if (musicIds.includes(id)) return toast.error("该歌曲已存在");
    const audioUrl = newAudioUrl.trim();
    const entry = audioUrl ? { id, audioUrl } : newVip ? { id, vip: true } : id;
    saveThemeConfig({ musicIds: [...rawMusicIds, entry] });
    setNewId("");
    setNewAudioUrl("");
    setNewVip(false);
  };

  const handleRemove = (id: string) => {
    if (!confirm("确定移除这首歌曲?")) return;
    saveThemeConfig({
      musicIds: rawMusicIds.filter((item) =>
        typeof item === "string" ? item !== id : item.id !== id,
      ),
    });
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...rawMusicIds];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    saveThemeConfig({ musicIds: arr });
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= rawMusicIds.length - 1) return;
    const arr = [...rawMusicIds];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    saveThemeConfig({ musicIds: arr });
  };

  const handleToggleVip = (id: string) => {
    const arr = rawMusicIds.map((item) => {
      if (typeof item === "string") {
        return item === id ? { id, vip: true } : item;
      }
      if (item.id === id) {
        return { ...item, vip: !item.vip };
      }
      return item;
    });
    saveThemeConfig({ musicIds: arr });
  };

  const handleAddPlaylist = () => {
    const id = newPlaylistId.trim();
    if (!id) return toast.error("请输入歌单ID");
    if (musicPlaylistIds.includes(id)) return toast.error("该歌单已存在");
    saveThemeConfig({ musicPlaylistIds: [...musicPlaylistIds, id] });
    setNewPlaylistId("");
  };

  const handleRemovePlaylist = (id: string) => {
    if (!confirm("确定移除这个歌单?")) return;
    saveThemeConfig({ musicPlaylistIds: musicPlaylistIds.filter((i) => i !== id) });
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/30 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">
            音乐管理
          </h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Music · {musicPlaylistIds.length} 个歌单 · {songs?.length ?? 0} 首歌曲
          </p>
        </div>
      </div>

      {/* Music resolver API */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">音乐解析 API</h3>
        <p className="text-xs text-muted-foreground">
          部署 music-resolver Worker 后，填入其地址，即可自动解析 VIP 歌曲的真实播放链接
        </p>
        <p className="text-[11px] font-mono text-muted-foreground">
          播放优先级：自定义音频源 → 解析 API → 网易云代理（默认）
        </p>
        <div className="flex gap-3">
          <input
            value={resolverUrl}
            onChange={(e) => setResolverUrl(e.target.value)}
            placeholder="https://your-music-resolver.workers.dev"
            className="flex-1 bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
          />
          <button
            onClick={() => saveThemeConfig({ musicResolverUrl: resolverUrl.trim() })}
            disabled={resolverSaving}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            {resolverSaving ? "保存中..." : "保存"}
          </button>
        </div>
        {settings?.site?.theme?.xinghui?.musicResolverUrl && (
          <p className="text-[11px] text-emerald-500 font-mono">
            ✓ 已配置：{settings.site.theme.xinghui.musicResolverUrl}
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
            disabled={configLoading || saving}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "添加歌单"}
          </button>
        </div>
        {musicPlaylistIds.length > 0 && (
          <div className="space-y-2 mt-4">
            {musicPlaylistIds.map((id) => (
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
                  disabled={saving}
                  className="text-xs font-mono text-muted-foreground hover:text-destructive px-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
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
            disabled={configLoading || saving}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "添加"}
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
                          disabled={saving}
                          className={`text-xs font-mono px-2 py-1 disabled:opacity-30 transition-colors ${
                            isVip
                              ? "text-amber-500 hover:text-amber-600 bg-amber-500/10"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {isVip ? "VIP ✓" : "VIP"}
                          {song.fee === 1 && !vipMap[song.id] && (
                            <span className="ml-1 text-[9px] opacity-60">auto</span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            const idx = rawMusicIds.findIndex((item) =>
                              typeof item === "string" ? item === song.id : item.id === song.id,
                            );
                            if (idx > 0) handleMoveUp(idx);
                          }}
                          disabled={saving}
                          className="text-xs font-mono text-muted-foreground hover:text-foreground px-1 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => {
                            const idx = rawMusicIds.findIndex((item) =>
                              typeof item === "string" ? item === song.id : item.id === song.id,
                            );
                            if (idx < rawMusicIds.length - 1) handleMoveDown(idx);
                          }}
                          disabled={saving}
                          className="text-xs font-mono text-muted-foreground hover:text-foreground px-1 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleRemove(song.id)}
                          disabled={saving}
                          className="text-xs font-mono text-muted-foreground hover:text-destructive px-2 ml-2 disabled:opacity-30"
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
    </div>
  );
}
