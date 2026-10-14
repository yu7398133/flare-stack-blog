import type { JSONContent } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import { markdownToJsonContent } from "@/features/import-export/utils/markdown-parser";
import { jsonContentToMarkdown } from "@/features/import-export/utils/markdown-serializer";

/**
 * 链接卡片与视频嵌入的序列化 / 反序列化。
 *
 * 这两个节点以 `data-*` HTML 属性承载内容，所以最容易出错的不是渲染而是
 * **往返一致性**：导出成 Markdown 再导入，字段必须原样回来。
 * 属性值若不转义，标题里的引号会截断属性——这类问题在编辑器里点一下
 * 看不出来，只有往返测试能抓住。
 */

function doc(...content: Array<JSONContent>): JSONContent {
  return { type: "doc", content };
}

function cardNode(attrs: Record<string, string>): JSONContent {
  return { type: "linkCard", attrs };
}

function videoNode(attrs: Record<string, string>): JSONContent {
  return { type: "videoEmbed", attrs };
}

describe("linkCard 序列化", () => {
  it("导出为带 data-* 属性的 div", () => {
    const md = jsonContentToMarkdown(
      doc(
        cardNode({
          emoji: "📖",
          title: "前端周刊",
          description: "每周精选",
          href: "https://example.com/weekly",
          site: "example.com",
        }),
      ),
    );

    expect(md).toContain('data-link-card="true"');
    expect(md).toContain('data-emoji="📖"');
    expect(md).toContain('data-title="前端周刊"');
    expect(md).toContain('data-href="https://example.com/weekly"');
    expect(md).toContain('data-site="example.com"');
  });

  it("标题里的双引号被转义，不会截断属性", () => {
    const md = jsonContentToMarkdown(
      doc(
        cardNode({
          emoji: "📌",
          title: 'He said "hi"',
          description: "",
          href: "https://example.com",
          site: "",
        }),
      ),
    );

    expect(md).toContain("&quot;");
    expect(md).not.toContain('data-title="He said "hi""');
  });

  it("没有 href 的卡片降级为纯文本标题（不导出空标签）", () => {
    const md = jsonContentToMarkdown(
      doc(cardNode({ emoji: "📌", title: "孤立标题", href: "" })),
    );

    expect(md).not.toContain("data-link-card");
    expect(md).toContain("孤立标题");
  });

  it("既无 href 也无标题时导出为空", () => {
    const md = jsonContentToMarkdown(doc(cardNode({ href: "", title: "" })));
    expect(md.trim()).toBe("");
  });
});

describe("linkCard 往返", () => {
  it("导出再导入后所有字段一致", async () => {
    const original = doc(
      cardNode({
        emoji: "🚀",
        title: "部署指南",
        description: "从零到上线",
        href: "https://example.com/deploy",
        site: "example.com",
      }),
    );

    const md = jsonContentToMarkdown(original);
    const parsed = await markdownToJsonContent(md);
    const node = parsed.content?.find((n) => n.type === "linkCard");

    expect(node).toBeDefined();
    expect(node?.attrs?.emoji).toBe("🚀");
    expect(node?.attrs?.title).toBe("部署指南");
    expect(node?.attrs?.description).toBe("从零到上线");
    expect(node?.attrs?.href).toBe("https://example.com/deploy");
    expect(node?.attrs?.site).toBe("example.com");
  });

  it("标题含双引号时往返仍一致（转义正确性）", async () => {
    const original = doc(
      cardNode({
        emoji: "📌",
        title: 'A "quoted" title',
        description: "desc",
        href: "https://example.com",
        site: "example.com",
      }),
    );

    const md = jsonContentToMarkdown(original);
    const parsed = await markdownToJsonContent(md);
    const node = parsed.content?.find((n) => n.type === "linkCard");

    expect(node?.attrs?.title).toBe('A "quoted" title');
  });

  it("标题含 HTML 尖括号时往返仍一致", async () => {
    const original = doc(
      cardNode({
        emoji: "📌",
        title: "<script>alert(1)</script>",
        description: "",
        href: "https://example.com",
        site: "",
      }),
    );

    const md = jsonContentToMarkdown(original);
    const parsed = await markdownToJsonContent(md);
    const node = parsed.content?.find((n) => n.type === "linkCard");

    // 转义后应原样还原，且不会变成真的 script 元素
    expect(node?.attrs?.title).toBe("<script>alert(1)</script>");
  });
});

describe("videoEmbed 序列化", () => {
  it("导出为带 data-* 属性的 div", () => {
    const md = jsonContentToMarkdown(
      doc(
        videoNode({
          src: "https://www.bilibili.com/video/BV1xx411c7mD",
          provider: "bilibili",
          videoId: "BV1xx411c7mD",
          title: "演示视频",
        }),
      ),
    );

    expect(md).toContain('data-video-embed="true"');
    expect(md).toContain('data-provider="bilibili"');
    expect(md).toContain('data-video-id="BV1xx411c7mD"');
  });

  it("没有 src 的视频导出为空", () => {
    const md = jsonContentToMarkdown(doc(videoNode({ src: "" })));
    expect(md.trim()).toBe("");
  });
});

describe("videoEmbed 往返", () => {
  it("B站链接导出再导入后字段一致", async () => {
    const original = doc(
      videoNode({
        src: "https://www.bilibili.com/video/BV1xx411c7mD",
        provider: "bilibili",
        videoId: "BV1xx411c7mD",
        title: "演示视频",
      }),
    );

    const md = jsonContentToMarkdown(original);
    const parsed = await markdownToJsonContent(md);
    const node = parsed.content?.find((n) => n.type === "videoEmbed");

    expect(node).toBeDefined();
    expect(node?.attrs?.src).toBe(
      "https://www.bilibili.com/video/BV1xx411c7mD",
    );
    expect(node?.attrs?.provider).toBe("bilibili");
    expect(node?.attrs?.videoId).toBe("BV1xx411c7mD");
    expect(node?.attrs?.title).toBe("演示视频");
  });

  it("YouTube 链接导出再导入后字段一致", async () => {
    const original = doc(
      videoNode({
        src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        provider: "youtube",
        videoId: "dQw4w9WgXcQ",
        title: "",
      }),
    );

    const md = jsonContentToMarkdown(original);
    const parsed = await markdownToJsonContent(md);
    const node = parsed.content?.find((n) => n.type === "videoEmbed");

    expect(node?.attrs?.provider).toBe("youtube");
    expect(node?.attrs?.videoId).toBe("dQw4w9WgXcQ");
  });
});

describe("与其它块级节点共存", () => {
  it("卡片和视频夹在段落之间时，顺序与内容都保持", async () => {
    const original = doc(
      { type: "paragraph", content: [{ type: "text", text: "前文" }] },
      cardNode({
        emoji: "🔗",
        title: "卡片",
        description: "",
        href: "https://example.com",
        site: "example.com",
      }),
      videoNode({
        src: "https://youtu.be/dQw4w9WgXcQ",
        provider: "youtube",
        videoId: "dQw4w9WgXcQ",
        title: "",
      }),
      { type: "paragraph", content: [{ type: "text", text: "后文" }] },
    );

    const md = jsonContentToMarkdown(original);
    const parsed = await markdownToJsonContent(md);
    const types = (parsed.content ?? []).map((n) => n.type);

    expect(types).toContain("linkCard");
    expect(types).toContain("videoEmbed");
    expect(types.indexOf("linkCard")).toBeLessThan(types.indexOf("videoEmbed"));
  });
});
