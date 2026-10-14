import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { deriveSiteName } from "@/features/posts/editor/extensions/link-card";
import { normalizeLinkHref } from "@/lib/links/normalize-link-href";
import { m } from "@/paraglide/messages";

export type CardVideoModalType = "CARD" | "VIDEO" | null;

interface InsertCardVideoModalProps {
  type: CardVideoModalType;
  onClose: () => void;
  /** 卡片提交：返回最终属性，由调用方写入编辑器。 */
  onCardSubmit: (attrs: {
    emoji: string;
    title: string;
    description: string;
    href: string;
    site: string;
  }) => void;
  /** 视频提交：返回原始链接，由调用方解析并决定是否插入。 */
  onVideoSubmit: (src: string, title: string) => boolean;
}

/**
 * 卡片 / 视频的插入弹窗。
 *
 * 与既有的 InsertModal（LINK/IMAGE）分开实现：那边耦合了媒体库选择器，
 * 而卡片与视频只需要几个纯文本字段，混在一起会让两条流程互相牵制。
 */
export function InsertCardVideoModal({
  type,
  onClose,
  onCardSubmit,
  onVideoSubmit,
}: InsertCardVideoModalProps) {
  const [emoji, setEmoji] = useState("📌");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [href, setHref] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [error, setError] = useState("");

  // 每次打开重置，避免上一次的输入残留。
  useEffect(() => {
    if (!type) return;
    setEmoji("📌");
    setTitle("");
    setDescription("");
    setHref("");
    setVideoSrc("");
    setVideoTitle("");
    setError("");
  }, [type]);

  // Esc 关闭
  useEffect(() => {
    if (!type) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [type, onClose]);

  if (!type) return null;

  const submit = () => {
    if (type === "CARD") {
      // 用与正文链接相同的协议白名单，避免把 javascript: 写进卡片。
      const safe = normalizeLinkHref(href);
      if (!href.trim() || !safe) {
        setError(m.editor_card_error_href());
        return;
      }
      onCardSubmit({
        emoji: emoji || "📌",
        title: title.trim(),
        description: description.trim(),
        href: href.trim(),
        site: deriveSiteName(href.trim()),
      });
      onClose();
      return;
    }

    const ok = onVideoSubmit(videoSrc, videoTitle.trim());
    if (!ok) {
      setError(m.editor_video_error_url());
      return;
    }
    onClose();
  };

  const isCard = type === "CARD";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-xl bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-medium">
          {isCard ? m.editor_card_modal_title() : m.editor_video_modal_title()}
        </h3>
        <p className="text-xs text-muted-foreground">
          {isCard ? m.editor_card_modal_hint() : m.editor_video_modal_hint()}
        </p>

        {isCard ? (
          <>
            <div className="flex gap-2">
              <input
                aria-label={m.editor_card_field_emoji()}
                className="w-14 rounded-md border border-border bg-background px-2 py-1.5 text-center text-lg"
                maxLength={4}
                onChange={(e) => setEmoji(e.target.value)}
                value={emoji}
              />
              <input
                aria-label={m.editor_card_field_title()}
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                onChange={(e) => setTitle(e.target.value)}
                placeholder={m.editor_card_field_title()}
                value={title}
              />
            </div>
            <input
              aria-label={m.editor_card_field_href()}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs"
              onChange={(e) => setHref(e.target.value)}
              placeholder="https://example.com"
              value={href}
            />
            <textarea
              aria-label={m.editor_card_field_description()}
              className="w-full resize-y rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              onChange={(e) => setDescription(e.target.value)}
              placeholder={m.editor_card_field_description()}
              rows={2}
              value={description}
            />
          </>
        ) : (
          <>
            <input
              aria-label={m.editor_video_field_url()}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs"
              onChange={(e) => setVideoSrc(e.target.value)}
              placeholder="https://www.bilibili.com/video/BV..."
              value={videoSrc}
            />
            <input
              aria-label={m.editor_video_field_title()}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder={m.editor_video_field_title()}
              value={videoTitle}
            />
          </>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
            onClick={onClose}
            type="button"
          >
            {m.editor_insert_cancel()}
          </button>
          <button
            className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground"
            onClick={submit}
            type="button"
          >
            {isCard ? m.editor_card_confirm() : m.editor_video_confirm()}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
