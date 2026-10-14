import {
  buildVideoEmbedUrl,
  type ParsedVideo,
} from "@/features/posts/editor/extensions/video/parse-video-url";

/**
 * 前台（发布态）视频嵌入：16:9 自适应容器 + iframe。
 *
 * 只在 provider/videoId 合法时渲染 iframe；否则退化为指向原链接的文本，
 * 避免在公开页面留下空白或指向任意地址的 iframe。
 * loading="lazy" 让首屏不被第三方播放器拖慢。
 */
export function VideoEmbedDisplay({
  src,
  provider,
  videoId,
  title,
}: {
  src?: string | null;
  provider?: string | null;
  videoId?: string | null;
  title?: string | null;
}) {
  const parsed: ParsedVideo | null =
    (provider === "bilibili" || provider === "youtube") && videoId
      ? { provider, videoId }
      : null;

  if (!parsed) {
    if (!src) return null;
    return (
      <p className="my-6">
        <a href={src} rel="noopener noreferrer" target="_blank">
          {src}
        </a>
      </p>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-video w-full">
        <iframe
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          src={buildVideoEmbedUrl(parsed)}
          title={title || "视频"}
        />
      </div>
    </div>
  );
}
