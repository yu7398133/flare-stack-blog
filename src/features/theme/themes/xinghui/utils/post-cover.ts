/**
 * Shared post cover image utilities.
 *
 * Priority:
 *   1. Explicit cover field from post metadata
 *   2. Deterministic random image seeded by slug (picsum.photos)
 *
 * The seeded approach ensures the same article always gets the same
 * image across homepage, archive, and post detail pages.
 * The image only changes when the CDN cache is purged.
 */

/**
 * Generate a deterministic cover image URL from a post slug.
 * Uses picsum.photos with a seed so the same slug always produces the same image.
 */
export function getPostCoverBySlug(slug: string, width = 800, height = 500): string {
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/${width}/${height}`;
}

/**
 * Get the cover image for a post.
 * Returns the explicit cover if set, otherwise a deterministic random image.
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
