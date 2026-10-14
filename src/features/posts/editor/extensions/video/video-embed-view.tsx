import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  buildVideoEmbedUrl,
  type ParsedVideo,
  parseVideoUrl,
} from "./parse-video-url";

/**
 * 编辑器内的视频嵌入视图：16:9 容器内渲染 iframe。
 *
 * 仅在 provider/videoId 合法时才构造嵌入地址；否则显示提示条，
 * 让用户知道该节点已失效而不是留下一片空白。
 */
export function VideoEmbedView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const attrs = node.attrs as {
    src?: string;
    provider?: "bilibili" | "youtube" | "";
    videoId?: string;
    title?: string;
  };
  const [editing, setEditing] = useState(false);
  const [draftSrc, setDraftSrc] = useState(attrs.src ?? "");
  const [draftTitle, setDraftTitle] = useState(attrs.title ?? "");
  const [error, setError] = useState("");

  const parsed: ParsedVideo | null =
    attrs.provider && attrs.videoId
      ? { provider: attrs.provider, videoId: attrs.videoId }
      : null;
  const embedUrl = parsed ? buildVideoEmbedUrl(parsed) : null;

  const save = () => {
    const next = parseVideoUrl(draftSrc);
    if (!next) {
      setError("无法识别该链接，仅支持 B站 与 YouTube");
      return;
    }
    updateAttributes({
      src: draftSrc.trim(),
      provider: next.provider,
      videoId: next.videoId,
      title: draftTitle,
    });
    setError("");
    setEditing(false);
  };

  return (
    <NodeViewWrapper className="my-6" data-testid="video-embed">
      <div
        className={`group relative overflow-hidden rounded-xl border bg-card ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {editing ? (
          <div className="space-y-3 p-4">
            <input
              aria-label="视频链接"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs"
              onChange={(e) => setDraftSrc(e.target.value)}
              placeholder="https://www.bilibili.com/video/BV..."
              value={draftSrc}
            />
            <input
              aria-label="视频标题"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="标题（可选）"
              value={draftTitle}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
                onClick={() => setEditing(false)}
                type="button"
              >
                取消
              </button>
              <button
                className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                onClick={save}
                type="button"
              >
                保存
              </button>
            </div>
          </div>
        ) : embedUrl ? (
          <div className="relative aspect-video w-full">
            <iframe
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              src={embedUrl}
              title={attrs.title || "视频"}
            />
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            视频链接无效或不受支持（仅支持 B站 与 YouTube）
          </div>
        )}

        {/* 操作区浮层：避免遮挡 iframe 交互 */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className="rounded bg-background/90 p-1.5 text-muted-foreground shadow hover:bg-accent"
            onClick={() => {
              setDraftSrc(attrs.src ?? "");
              setDraftTitle(attrs.title ?? "");
              setError("");
              setEditing(true);
            }}
            title="编辑视频"
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="rounded bg-background/90 p-1.5 text-muted-foreground shadow hover:bg-destructive/10 hover:text-destructive"
            onClick={() => deleteNode()}
            title="删除视频"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
