import type { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { getCommentExtensions } from "@/features/comments/components/editor/config";

interface ImageAttrs {
  src: string;
  alt?: string | null;
  width?: number | string;
  height?: number | string;
}

function InlineImage({ src, alt, width, height }: { src: string; alt: string; width?: number; height?: number }) {
  return (
    <figure className="my-4">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className="rounded-xl max-w-full h-auto border border-white/20 dark:border-white/10"
      />
      {alt && alt !== "blog image" && (
        <figcaption className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

export function renderCommentReact(content: JSONContent | null) {
  if (!content) return null;
  return renderToReactElement({
    extensions: getCommentExtensions(),
    content,
    options: {
      nodeMapping: {
        image: ({ node }) => {
          const attrs = node.attrs as ImageAttrs;
          const alt =
            (attrs.alt && attrs.alt !== "null" ? attrs.alt : null) ||
            "comment image";
          const width =
            typeof attrs.width === "string" ? parseInt(attrs.width) : attrs.width;
          const height =
            typeof attrs.height === "string" ? parseInt(attrs.height) : attrs.height;

          return (
            <InlineImage
              src={attrs.src}
              alt={alt}
              width={width || undefined}
              height={height || undefined}
            />
          );
        },
      },
    },
  });
}
