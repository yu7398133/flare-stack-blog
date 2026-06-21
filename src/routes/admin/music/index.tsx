import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
}

function MusicAdminPage() {
  const queryClient = useQueryClient();
  const { settings, isLoading: configLoading, saveSettings } = useSystemSetting();
  const [newId, setNewId] = useState("");

  const musicIds: string[] =
    settings?.site?.theme?.xinghui?.musicIds ?? [];

  // Fetch song info from NetEase API
  const { data: songs, isLoading: songsLoading } = useQuery<SongInfo[]>({
    queryKey: ["admin", "music-info", musicIds.join(",")],
    queryFn: async () => {
      if (musicIds.length === 0) return [];
      const res = await fetch(`/api/music?ids=${musicIds.join(",")}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data as Array<Record<string, unknown>>)
        .filter((s) => s && !s.error)
        .map((s) => ({
          id: String(s.id),
          name: String(s.name || s.title || "未知"),
          artist: String(s.artist || s.author || "未知"),
          cover: String(s.cover || s.pic || ""),
        }));
    },
    enabled: musicIds.length > 0,
  });

  const updateMusicIds = async (newIds: string[]) => {
    if (!settings) return;
    await saveSettings({
      ...settings,
      site: {
        ...settings.site,
        theme: {
          ...settings.site?.theme,
          xinghui: {
            ...settings.site?.theme?.xinghui,
            musicIds: newIds,
          },
        },
      },
    });
    toast.success("音乐列表已更新");
  };

  const handleAdd = () => {
    const id = newId.trim();
    if (!id) return toast.error("请输入歌曲ID");
    if (musicIds.includes(id)) return toast.error("该歌曲已存在");
    updateMusicIds([...musicIds, id]);
    setNewId("");
  };

  const handleRemove = (id: string) => {
    if (!confirm("确定移除这首歌曲?")) return;
    updateMusicIds(musicIds.filter((i) => i !== id));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...musicIds];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    updateMusicIds(arr);
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= musicIds.length - 1) return;
    const arr = [...musicIds];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    updateMusicIds(arr);
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
            Music · 共 {musicIds.length} 首
          </p>
        </div>
      </div>

      {/* Add song */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">添加歌曲</h3>
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
          <button
            onClick={handleAdd}
            disabled={configLoading}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            添加
          </button>
        </div>
      </div>

      {/* Song list */}
      {configLoading || songsLoading ? (
        <div className="text-center text-muted-foreground text-xs font-mono py-20">
          加载中...
        </div>
      ) : musicIds.length === 0 ? (
        <div className="text-center text-muted-foreground text-xs font-mono py-20">
          暂无歌曲，请添加网易云音乐ID
        </div>
      ) : (
        <div className="space-y-3">
          {musicIds.map((id, idx) => {
            const info = songs?.find((s) => s.id === id);
            return (
              <div
                key={id}
                className="border border-border/30 p-4 group hover:border-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0">
                    {info?.cover ? (
                      <img
                        src={info.cover}
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
                      {info?.name || `ID: ${id}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {info?.artist || ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 px-1"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === musicIds.length - 1}
                      className="text-xs font-mono text-muted-foreground hover:text-foreground disabled:opacity-30 px-1"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleRemove(id)}
                      className="text-xs font-mono text-muted-foreground hover:text-destructive px-2 ml-2"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
