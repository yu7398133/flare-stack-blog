import { createFileRoute } from "@tanstack/react-router";
import { CloudPlayer } from "../../features/theme/themes/xinghui/components/cloud-player";
import { LyricBar } from "../../features/theme/themes/xinghui/components/lyric-bar";

export const Route = createFileRoute("/_public/music")({
  component: MusicRoute,
});

function MusicRoute() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          音乐灵境
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          用音乐记录每一个瞬间
        </p>
      </div>

      {/* Player */}
      <div className="xh-glass p-6">
        <CloudPlayer />
      </div>

      {/* Lyrics */}
      <div className="xh-glass p-4">
        <LyricBar />
      </div>
    </div>
  );
}
