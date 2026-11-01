import { useMemo, useState } from "react";
import {
  getPostCoverBySlug,
  getPostCoverCandidates,
} from "../utils/post-cover";

interface PostCoverImageProps {
  slug: string;
  /** 显式封面（文章自带），有值时不再走随机池 */
  cover?: string | null;
  className?: string;
  referrerPolicy?: "no-referrer" | "origin" | "no-referrer-when-downgrade";
}

const MAX_FALLBACKS = 3;

/**
 * 文章封面，失败自动换下一张。
 *
 * 图床（eo-img.loliapi.cn）的封面池里有大量永久 404，且连存活编号也会间歇性
 * 返回 404，所以静态 src 必然出现破图。这里在 onError 时按 slug 的候选序列
 * 换图，换满上限后隐藏图片让底色兜底，不再无限重试。
 */
export function PostCoverImage({
  slug,
  cover,
  className,
  referrerPolicy,
}: PostCoverImageProps) {
  const candidates = useMemo(() => {
    if (cover?.trim()) return [];
    return getPostCoverCandidates(slug, MAX_FALLBACKS);
  }, [slug, cover]);

  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const src = useMemo(() => {
    if (cover?.trim()) return cover;
    if (attempt === 0) return getPostCoverBySlug(slug);
    return candidates[attempt - 1];
  }, [slug, cover, attempt, candidates]);

  if (failed || !src) return null;

  return (
    <img
      src={src}
      alt=""
      className={className}
      referrerPolicy={referrerPolicy}
      onError={() => {
        // 显式封面坏了没有备用来源，直接放弃；随机池按候选序列往下换
        if (cover?.trim() || attempt >= MAX_FALLBACKS) {
          setFailed(true);
          return;
        }
        setAttempt((n) => n + 1);
      }}
    />
  );
}
