import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { LinkCardView } from "./link-card-view";

export interface LinkCardAttrs {
  emoji: string;
  title: string;
  description: string;
  href: string;
  /** 来源站名，用于卡片角标；留空时由 href 推导。 */
  site: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    linkCard: {
      /** 插入一张链接卡片。 */
      insertLinkCard: (attrs: Partial<LinkCardAttrs>) => ReturnType;
    };
  }
}

/** 从 URL 推导展示用站名；解析失败返回空串（由视图兜底显示域名）。 */
export function deriveSiteName(href: string): string {
  try {
    const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)
      ? href
      : `https://${href}`;
    const host = new URL(withProtocol).hostname.toLowerCase();
    return host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export const LinkCardExtension = Node.create({
  name: "linkCard",
  group: "block",
  atom: true, // 整体不可编辑内部结构，避免富文本污染卡片字段
  draggable: true,

  addAttributes() {
    return {
      emoji: { default: "📌" },
      title: { default: "" },
      description: { default: "" },
      href: { default: "" },
      site: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-link-card]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            emoji: el.getAttribute("data-emoji") ?? "📌",
            title: el.getAttribute("data-title") ?? "",
            description: el.getAttribute("data-description") ?? "",
            href: el.getAttribute("data-href") ?? "",
            site: el.getAttribute("data-site") ?? "",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as LinkCardAttrs;
    return [
      "div",
      mergeAttributes({
        "data-link-card": "true",
        "data-emoji": attrs.emoji,
        "data-title": attrs.title,
        "data-description": attrs.description,
        "data-href": attrs.href,
        "data-site": attrs.site,
      }),
      [
        "a",
        { href: attrs.href, target: "_blank", rel: "noopener noreferrer" },
        `${attrs.emoji} ${attrs.title}`,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkCardView);
  },

  addCommands() {
    return {
      insertLinkCard:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              emoji: attrs.emoji ?? "📌",
              title: attrs.title ?? "",
              description: attrs.description ?? "",
              href: attrs.href ?? "",
              site: attrs.site ?? deriveSiteName(attrs.href ?? ""),
            },
          }),
    };
  },
});
