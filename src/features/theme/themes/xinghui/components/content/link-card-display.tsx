import { ExternalLink } from "lucide-react";
import { normalizeLinkHref } from "@/lib/links/normalize-link-href";

/**
 * 前台（发布态）链接卡片。
 *
 * 与编辑器视图分开：这里没有编辑/删除操作，只做展示，
 * 从而避免把管理端交互打进公开页面。href 同样经过协议白名单。
 */
export function LinkCardDisplay({
  emoji,
  title,
  description,
  href,
  site,
}: {
  emoji?: string | null;
  title?: string | null;
  description?: string | null;
  href?: string | null;
  site?: string | null;
}) {
  const safeHref = normalizeLinkHref(href ?? "");
  const displayTitle = title || href || "链接";
  const displaySite = site || "";

  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-2xl">
        {emoji || "📌"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">
            {displayTitle}
          </span>
          {displaySite && (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {displaySite}
            </span>
          )}
          {safeHref && (
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
        </span>
        {description && (
          <span className="mt-1 block text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </>
  );

  const baseClass =
    "my-6 flex gap-4 rounded-xl border border-border bg-card p-4 no-underline";

  // href 非法时退化为非链接卡片，绝不输出可点击的危险地址。
  if (!safeHref) {
    return <div className={baseClass}>{inner}</div>;
  }

  return (
    <a
      className={`${baseClass} transition-colors hover:border-primary/40`}
      href={safeHref}
      rel="noopener noreferrer"
      target="_blank"
    >
      {inner}
    </a>
  );
}
