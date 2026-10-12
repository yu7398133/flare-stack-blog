import type { JSONContent } from "@tiptap/react";
import { slugify } from "@/features/posts/utils/content";

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Article bodies may use `#` through `####`.
 *
 * A body `#` renders at 28px, a step below the 32px post title, so a section
 * heading never competes with the title above it. Levels below 1 clamp up to 1
 * and anything past `####` clamps down to 4 to match the editor's `levels`
 * option.
 *
 * Applied at render time rather than only in the editor, because documents
 * written before this rule — or imported through the MCP API — never passed
 * through an editor toolbar.
 */
export function clampHeadingLevel(level: unknown): 1 | 2 | 3 | 4 {
  const value = Number(level);
  if (!Number.isFinite(value) || value < 1) return 1;
  if (value > 4) return 4;
  return value as 1 | 2 | 3 | 4;
}

export function generateTableOfContents(
  content: JSONContent | undefined | null,
) {
  if (!content || !content.content) return [];

  const headings: Array<TableOfContentsItem> = [];

  content.content.forEach((node) => {
    if (node.type === "heading") {
      const level = clampHeadingLevel(node.attrs?.level);
      const text = getNodeText(node);
      const id = slugify(text);

      if (text) {
        headings.push({ id, text, level });
      }
    }
  });

  return headings;
}

function getNodeText(node: JSONContent): string {
  if (node.text) return node.text;
  if (node.content) {
    return node.content.map(getNodeText).join("");
  }
  return "";
}
