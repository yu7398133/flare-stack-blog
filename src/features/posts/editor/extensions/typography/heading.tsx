import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/react";
import { slugify } from "@/features/posts/utils/content";

export const HeadingExtension = Heading.extend({
  renderHTML({ HTMLAttributes, node }) {
    const level = node.attrs.level as 1 | 2 | 3 | 4;
    const textContent = node.textContent;
    const id = slugify(textContent);

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { id }),
      0,
    ];
  },
});
