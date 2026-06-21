/**
 * Shared post cover image utilities.
 *
 * Priority:
 *   1. Explicit cover field from post metadata
 *   2. Anime random image from API (same URL used across all pages)
 *
 * Uses anime random image API so the same article URL is consistent
 * across homepage, archive, and post detail pages.
 */

/**
 * Generate an anime cover image URL from a post slug.
 * Uses a hash to pick from a fixed pool of anime images for consistency.
 */
export function getPostCoverBySlug(slug: string, _width = 800, _height = 500): string {
  // Simple hash to get a deterministic index
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % 1000;
  return `https://t.mwm.moe/fj/?${idx}`;
}

/**
 * Get the cover image for a post.
 * Returns the explicit cover if set, otherwise an anime random image.
 */
export function getPostCover(
  slug: string,
  cover?: string | null,
  width = 800,
  height = 500,
): string {
  if (cover && cover.trim()) return cover;
  return getPostCoverBySlug(slug, width, height);
}
