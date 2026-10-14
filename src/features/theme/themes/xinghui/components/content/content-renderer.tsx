import type { JSONContent } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { useMemo } from "react";
import { MathFormula } from "@/components/content/math-formula";
import { extensions } from "@/features/posts/editor/config";
import { CodeBlock } from "./code-block";
import { ImageDisplay } from "./image-display";
import { LinkCardDisplay } from "./link-card-display";
import { VideoEmbedDisplay } from "./video-embed-display";

export function ContentRenderer({ content }: { content: JSONContent | null }) {
  const rendered = useMemo(() => {
    if (!content) return null;
    return renderToReactElement({
      extensions,
      content,
      options: {
        nodeMapping: {
          image: ({ node }) => {
            const attrs = node.attrs as {
              src: string;
              alt?: string | null;
              width?: number | string;
              height?: number | string;
            };
            const alt =
              (attrs.alt && attrs.alt !== "null" ? attrs.alt : null) ||
              "blog image";
            const width =
              typeof attrs.width === "string"
                ? parseInt(attrs.width)
                : attrs.width;
            const height =
              typeof attrs.height === "string"
                ? parseInt(attrs.height)
                : attrs.height;
            return (
              <ImageDisplay
                src={attrs.src}
                alt={alt}
                width={width || undefined}
                height={height || undefined}
              />
            );
          },
          codeBlock: ({ node }) => {
            const code = node.textContent || "";
            const attrs = node.attrs as {
              language?: string | null;
              highlightedHtml?: string;
            };
            return (
              <CodeBlock
                code={code}
                language={attrs.language || null}
                highlightedHtml={attrs.highlightedHtml}
              />
            );
          },
          tableCell: ({ node, children }) => {
            const attrs = node.attrs as {
              colspan?: number;
              rowspan?: number;
              style?: string;
            };
            return (
              <td
                colSpan={attrs.colspan}
                rowSpan={attrs.rowspan}
                style={attrs.style ? { width: attrs.style } : undefined}
              >
                {children}
              </td>
            );
          },
          tableHeader: ({ node, children }) => {
            const attrs = node.attrs as {
              colspan?: number;
              rowspan?: number;
              style?: string;
            };
            return (
              <th
                colSpan={attrs.colspan}
                rowSpan={attrs.rowspan}
                style={attrs.style ? { width: attrs.style } : undefined}
              >
                {children}
              </th>
            );
          },
          inlineMath: ({ node }) => {
            const latex = (node.attrs as { latex?: string }).latex ?? "";
            return <MathFormula latex={latex} mode="inline" />;
          },
          blockMath: ({ node }) => {
            const latex = (node.attrs as { latex?: string }).latex ?? "";
            return <MathFormula latex={latex} mode="block" />;
          },
          linkCard: ({ node }) => {
            const attrs = node.attrs as {
              emoji?: string;
              title?: string;
              description?: string;
              href?: string;
              site?: string;
            };
            return (
              <LinkCardDisplay
                description={attrs.description}
                emoji={attrs.emoji}
                href={attrs.href}
                site={attrs.site}
                title={attrs.title}
              />
            );
          },
          videoEmbed: ({ node }) => {
            const attrs = node.attrs as {
              src?: string;
              provider?: string;
              videoId?: string;
              title?: string;
            };
            return (
              <VideoEmbedDisplay
                provider={attrs.provider}
                src={attrs.src}
                title={attrs.title}
                videoId={attrs.videoId}
              />
            );
          },
        },
      },
    });
  }, [content]);

  if (!content) return null;
  return <div>{rendered}</div>;
}
