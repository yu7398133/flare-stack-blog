import { Blockquote } from "@tiptap/extension-blockquote";
import { mergeAttributes } from "@tiptap/react";

/**
 * Block quotes belong entirely to the surface stylesheet (`.xh-prose
 * blockquote`: 4px indigo rule, tinted panel, 0.875em of the body size,
 * upright). The editor previously carried its own look here — `text-lg`,
 * `italic`, a muted outline — which both contradicted the published page and,
 * because these classes land on the rendered element, outranked the
 * stylesheet that was supposed to define them. The public renderer
 * (`ContentRenderer`) and the editor share this extension, so both surfaces
 * now resolve a quote from the same rule.
 */
export const BlockQuoteExtension = Blockquote.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      "blockquote",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      // Content renders here (0 = content placeholder, must be only child)
      0,
    ];
  },
});
