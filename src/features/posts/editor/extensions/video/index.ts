import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import {
  buildVideoEmbedUrl,
  type ParsedVideo,
  parseVideoUrl,
} from "./parse-video-url";
import { VideoEmbedView } from "./video-embed-view";

export interface VideoEmbedAttrs {
  /** 用户粘贴的原始链接，保留以便重新编辑。 */
  src: string;
  provider: "bilibili" | "youtube" | "";
  videoId: string;
  title: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoEmbed: {
      /** 插入视频嵌入；链接无法识别时返回 false，不插入任何内容。 */
      insertVideoEmbed: (attrs: { src: string; title?: string }) => ReturnType;
    };
  }
}

export const VideoEmbedExtension = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: "" },
      provider: { default: "" },
      videoId: { default: "" },
      title: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-video-embed]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            src: el.getAttribute("data-src") ?? "",
            provider: el.getAttribute("data-provider") ?? "",
            videoId: el.getAttribute("data-video-id") ?? "",
            title: el.getAttribute("data-title") ?? "",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as VideoEmbedAttrs;
    const parsed: ParsedVideo | null =
      attrs.provider && attrs.videoId
        ? { provider: attrs.provider, videoId: attrs.videoId }
        : null;
    const embedUrl = parsed ? buildVideoEmbedUrl(parsed) : null;

    return [
      "div",
      mergeAttributes({
        "data-video-embed": "true",
        "data-src": attrs.src,
        "data-provider": attrs.provider,
        "data-video-id": attrs.videoId,
        "data-title": attrs.title,
      }),
      ...(embedUrl
        ? [
            [
              "iframe",
              {
                src: embedUrl,
                title: attrs.title || "视频",
                allowfullscreen: "true",
                loading: "lazy",
              },
            ],
          ]
        : [["a", { href: attrs.src }, attrs.src || "视频"]]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedView);
  },

  addCommands() {
    return {
      insertVideoEmbed:
        ({ src, title }) =>
        ({ commands }) => {
          const parsed = parseVideoUrl(src);
          // 解析失败不插入：避免生成指向无效地址的 iframe（白屏）。
          if (!parsed) return false;

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: src.trim(),
              provider: parsed.provider,
              videoId: parsed.videoId,
              title: title ?? "",
            },
          });
        },
    };
  },
});
