import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language: string | null;
  highlightedHtml?: string;
}

/**
 * Code-block chrome matching upstream (du2333/flare-stack-blog): rounded card,
 * a language badge that yields to a hover copy button, a thin scrollbar and a
 * transparent Shiki <pre> so the card background shows through.
 *
 * Upstream styles against a `--fuwari-*` variable set this fork never defines,
 * so the same look is re-expressed with this fork's Tailwind v4 tokens
 * (`--color-card`, `--color-border`, `--color-primary`) rather than copied.
 *
 * The card surface is spelled `bg-white dark:bg-card` rather than plain
 * `bg-card`: this theme expresses light mode by leaving <html> class-less, so
 * the `html.light { --color-card: … }` override never matches and `--color-card`
 * keeps its dark `@theme` default. An explicit `dark:` pair is what the rest of
 * the theme already relies on and works in all three modes.
 */
export function CodeBlock({ code, language, highlightedHtml }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="not-prose group relative my-6 max-w-full">
      <div className="shiki-frame shiki-mount relative overflow-hidden rounded-xl border border-black/10 bg-white dark:border-border dark:bg-card transition-colors">
        {/* Language badge — yields to the copy button on hover */}
        <div className="pointer-events-none absolute right-2 top-2 z-10 rounded-lg bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold uppercase text-primary transition-opacity duration-300 group-hover:opacity-0">
          {language || "plaintext"}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "已复制" : "复制代码"}
          className={cn(
            "absolute right-2 top-2 z-20 flex size-8 items-center justify-center rounded-lg border border-transparent text-black/50 dark:text-muted-foreground opacity-0 transition-all duration-300",
            "group-hover:opacity-100 hover:border-black/10 hover:bg-black/5 hover:text-black/80 dark:hover:border-border dark:hover:bg-muted dark:hover:text-foreground",
            copied &&
              "scale-110 text-green-500 opacity-100 hover:text-green-500",
          )}
        >
          {copied ? (
            <Check className="size-4" strokeWidth={2.5} />
          ) : (
            <Copy className="size-4" strokeWidth={2.5} />
          )}
        </button>

        {highlightedHtml ? (
          <div
            className="custom-scrollbar overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="custom-scrollbar m-0 overflow-x-auto px-5 py-4">
            <code className="font-mono text-sm leading-relaxed">{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
