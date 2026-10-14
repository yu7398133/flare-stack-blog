import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { normalizeLinkHref } from "@/lib/links/normalize-link-href";
import { deriveSiteName } from ".";

/**
 * 编辑器内的链接卡片视图。
 *
 * 安全：href 经过 normalizeLinkHref 的协议白名单，拒绝 javascript:/data:
 * 等伪协议（与正文链接走同一套校验，避免两处规则漂移）。
 */
export function LinkCardView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const attrs = node.attrs as {
    emoji?: string;
    title?: string;
    description?: string;
    href?: string;
    site?: string;
  };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    emoji: attrs.emoji ?? "📌",
    title: attrs.title ?? "",
    description: attrs.description ?? "",
    href: attrs.href ?? "",
  });

  const safeHref = normalizeLinkHref(attrs.href ?? "");
  const site = attrs.site || deriveSiteName(attrs.href ?? "");

  const save = () => {
    updateAttributes({
      emoji: draft.emoji || "📌",
      title: draft.title,
      description: draft.description,
      href: draft.href,
      site: deriveSiteName(draft.href),
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <NodeViewWrapper className="my-6" data-testid="link-card-editor">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex gap-2">
            <input
              aria-label="卡片图标"
              className="w-14 rounded-md border border-border bg-background px-2 py-1.5 text-center text-lg"
              maxLength={4}
              onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
              value={draft.emoji}
            />
            <input
              aria-label="卡片标题"
              className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="标题"
              value={draft.title}
            />
          </div>
          <input
            aria-label="卡片链接"
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs"
            onChange={(e) => setDraft({ ...draft, href: e.target.value })}
            placeholder="https://example.com"
            value={draft.href}
          />
          <textarea
            aria-label="卡片描述"
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            placeholder="描述（可选）"
            rows={2}
            value={draft.description}
          />
          <div className="flex justify-end gap-2">
            <button
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
              onClick={() => setEditing(false)}
              type="button"
            >
              取消
            </button>
            <button
              className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground"
              onClick={save}
              type="button"
            >
              保存
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="my-6" data-testid="link-card">
      <div
        className={`group relative flex gap-4 rounded-xl border bg-card p-4 transition-colors ${
          selected ? "border-primary" : "border-border hover:border-primary/40"
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-2xl">
          {attrs.emoji || "📌"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-foreground">
              {attrs.title || "未命名卡片"}
            </span>
            {site && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {site}
              </span>
            )}
          </div>
          {attrs.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {attrs.description}
            </p>
          )}
        </div>

        {/* 编辑期操作区：不随点击冒泡到编辑器 */}
        <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {safeHref && (
            <a
              className="rounded p-1.5 text-muted-foreground hover:bg-accent"
              href={safeHref}
              rel="noopener noreferrer"
              target="_blank"
              title="在新标签打开"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            className="rounded p-1.5 text-muted-foreground hover:bg-accent"
            onClick={() => {
              setDraft({
                emoji: attrs.emoji ?? "📌",
                title: attrs.title ?? "",
                description: attrs.description ?? "",
                href: attrs.href ?? "",
              });
              setEditing(true);
            }}
            title="编辑卡片"
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => deleteNode()}
            title="删除卡片"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
