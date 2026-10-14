import type { JSONContent } from "@tiptap/react";
import { extractImageKey } from "@/features/media/utils/media.utils";

/**
 * JSONContent → Markdown 转换器
 *
 * 直接遍历 TipTap JSONContent AST，不依赖 ProseMirror schema 和 extensions，
 * 避免 server 端引入浏览器依赖。
 */

/**
 * 转义写入 HTML 属性的值。
 *
 * 卡片/视频节点以 `data-*` 属性承载内容，若标题里含 `"` 而不转义，
 * 会提前闭合属性并破坏整段 HTML（导出后再导入就还原不回来）。
 */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
export function jsonContentToMarkdown(
  doc: JSONContent,
  options?: {
    /** 将图片 src 重写为相对路径 */
    rewriteImageSrc?: (src: string) => string;
  },
): string {
  if (doc.type !== "doc" || !doc.content) return "";

  const lines = doc.content
    .map((node) => serializeNode(node, options))
    .join("");

  // 清理：去掉开头空行，收缩连续空行为最多两个换行
  return (
    lines
      .replace(/^\n+/, "")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd() + "\n"
  );
}

function serializeNode(
  node: JSONContent,
  options?: { rewriteImageSrc?: (src: string) => string },
  listDepth = 0,
): string {
  switch (node.type) {
    case "paragraph":
      return `\n${serializeInline(node.content, options)}\n`;

    case "heading": {
      const level = node.attrs?.level ?? 1;
      const hashes = "#".repeat(level);
      return `\n${hashes} ${serializeInline(node.content, options)}\n`;
    }

    case "codeBlock": {
      const lang = node.attrs?.language || "";
      const code = node.content?.map((n) => n.text ?? "").join("") ?? "";
      return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
    }

    case "blockquote": {
      const inner = (node.content ?? [])
        .map((child) => serializeNode(child, options, listDepth))
        .join("")
        .trim();
      const quoted = inner
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      return `\n${quoted}\n`;
    }

    case "bulletList":
      return `\n${(node.content ?? [])
        .map((item) => serializeListItem(item, "-", 0, options, listDepth))
        .join("")}`;

    case "orderedList": {
      const start = Number(node.attrs?.start ?? 1);
      return `\n${(node.content ?? [])
        .map((item, i) =>
          serializeListItem(item, `${start + i}.`, 0, options, listDepth),
        )
        .join("")}`;
    }

    case "image": {
      const src = node.attrs?.src ?? "";
      const alt = node.attrs?.alt ?? "";
      const finalSrc = options?.rewriteImageSrc
        ? options.rewriteImageSrc(src)
        : src;
      return `\n![${alt}](${finalSrc})\n`;
    }

    case "table":
      return `\n${serializeTable(node, options)}\n`;

    case "horizontalRule":
      return "\n---\n";

    case "hardBreak":
      return "\n";

    case "blockMath": {
      const attrs = node.attrs as { latex?: string } | undefined;
      const latex = attrs?.latex ?? "";
      if (!latex.trim()) return "";
      return `\n$$\n${latex}\n$$\n`;
    }

    /**
     * 链接卡片与视频嵌入序列化为 HTML 元素（与 blockMath 同一机制）：
     * marked 会把这些标签原样透传，再由节点的 parseHTML 还原，
     * 因此导出再导入是无损的。属性值必须转义，否则标题里的引号
     * 会截断属性、破坏 HTML。
     */
    case "linkCard": {
      const attrs = node.attrs as Record<string, string> | undefined;
      if (!attrs?.href) {
        // 没有链接的卡片降级为纯文本，避免导出无意义标签
        return attrs?.title ? `\n${attrs.title}\n` : "";
      }
      return `\n<div data-link-card="true" data-emoji="${escapeAttr(attrs.emoji ?? "")}" data-title="${escapeAttr(attrs.title ?? "")}" data-description="${escapeAttr(attrs.description ?? "")}" data-href="${escapeAttr(attrs.href)}" data-site="${escapeAttr(attrs.site ?? "")}"></div>\n`;
    }

    case "videoEmbed": {
      const attrs = node.attrs as Record<string, string> | undefined;
      if (!attrs?.src) return "";
      return `\n<div data-video-embed="true" data-src="${escapeAttr(attrs.src)}" data-provider="${escapeAttr(attrs.provider ?? "")}" data-video-id="${escapeAttr(attrs.videoId ?? "")}" data-title="${escapeAttr(attrs.title ?? "")}"></div>\n`;
    }

    default:
      // 未知块级节点：尝试递归子节点
      if (node.content) {
        return (node.content ?? [])
          .map((child) => serializeNode(child, options, listDepth))
          .join("");
      }
      return serializeInline(node.content, options);
  }
}

function serializeListItem(
  item: JSONContent,
  marker: string,
  _offset: number,
  options?: { rewriteImageSrc?: (src: string) => string },
  depth = 0,
): string {
  const indent = "  ".repeat(depth);
  const children = item.content ?? [];

  const parts: Array<string> = [];
  for (const child of children) {
    if (child.type === "paragraph") {
      parts.push(serializeInline(child.content, options));
    } else if (child.type === "bulletList") {
      const nested = (child.content ?? [])
        .map((sub) => serializeListItem(sub, "-", 0, options, depth + 1))
        .join("");
      parts.push(nested);
    } else if (child.type === "orderedList") {
      const start = Number(child.attrs?.start ?? 1);
      const nested = (child.content ?? [])
        .map((sub, i) =>
          serializeListItem(sub, `${start + i}.`, 0, options, depth + 1),
        )
        .join("");
      parts.push(nested);
    } else {
      parts.push(serializeNode(child, options, depth));
    }
  }

  // 第一个部分作为列表项内容，后续嵌套列表直接拼接
  const first = parts[0] ?? "";
  const rest = parts.slice(1).join("");
  return `${indent}${marker} ${first.trim()}\n${rest}`;
}

function serializeInline(
  content: Array<JSONContent> | undefined,
  options?: { rewriteImageSrc?: (src: string) => string },
): string {
  if (!content) return "";
  return content.map((node) => serializeInlineNode(node, options)).join("");
}

function serializeInlineNode(
  node: JSONContent,
  options?: { rewriteImageSrc?: (src: string) => string },
): string {
  if (node.type === "text") {
    let text = node.text ?? "";
    // Apply marks in order
    for (const mark of node.marks ?? []) {
      text = applyMark(mark, text);
    }
    return text;
  }

  if (node.type === "image") {
    const src = node.attrs?.src ?? "";
    const alt = node.attrs?.alt ?? "";
    const finalSrc = options?.rewriteImageSrc
      ? options.rewriteImageSrc(src)
      : src;
    return `![${alt}](${finalSrc})`;
  }

  if (node.type === "hardBreak") {
    return "  \n";
  }

  if (node.type === "inlineMath") {
    const attrs = node.attrs as { latex?: string } | undefined;
    const latex = attrs?.latex ?? "";
    if (!latex.trim()) return "";
    return `$${latex}$`;
  }

  return "";
}

function applyMark(
  mark: { type: string; attrs?: Record<string, unknown> },
  text: string,
): string {
  switch (mark.type) {
    case "bold":
      return `**${text}**`;
    case "italic":
      return `_${text}_`;
    case "strike":
      return `~~${text}~~`;
    case "code":
      return `\`${text}\``;
    case "underline":
      return `<u>${text}</u>`;
    case "link":
      return `[${text}](${mark.attrs?.href ?? ""})`;
    default:
      return text;
  }
}

// --- Table serialization ---

function serializeTable(
  table: JSONContent,
  options?: { rewriteImageSrc?: (src: string) => string },
): string {
  const rows = table.content ?? [];
  if (rows.length === 0) return "";

  const serializedRows = rows.map((row) =>
    (row.content ?? []).map((cell) =>
      serializeInline(cell.content?.[0]?.content, options).trim(),
    ),
  );

  // Determine column count from first row
  const colCount = serializedRows[0]?.length ?? 0;
  if (colCount === 0) return "";

  const lines: Array<string> = [];

  // Header row
  lines.push(`| ${serializedRows[0].join(" | ")} |`);
  lines.push(`| ${Array(colCount).fill("---").join(" | ")} |`);

  // Data rows
  for (let i = 1; i < serializedRows.length; i++) {
    lines.push(`| ${serializedRows[i].join(" | ")} |`);
  }

  return lines.join("\n");
}

/**
 * 将图片 src 重写为导出 ZIP 中的相对路径
 * /images/uuid.jpg?quality=80 → ./images/uuid.jpg
 */
export function makeExportImageRewriter(): (src: string) => string {
  return (src: string) => {
    const key = extractImageKey(src);
    if (key) {
      return `./images/${key}`;
    }
    // 非本站图片（外链），保留原始 URL
    return src;
  };
}
