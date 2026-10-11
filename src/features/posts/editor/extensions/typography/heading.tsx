import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/react";
import { slugify } from "@/features/posts/utils/content";
import { clampHeadingLevel } from "@/features/posts/utils/toc";

export const HeadingExtension = Heading.extend({
  renderHTML({ HTMLAttributes, node }) {
    const level = clampHeadingLevel(node.attrs.level);
    const id = slugify(node.textContent);

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { id }),
      0,
    ];
  },
});
