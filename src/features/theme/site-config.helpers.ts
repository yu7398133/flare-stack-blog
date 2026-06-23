import type { SiteConfig } from "@/features/config/site-config.schema";

// if the theme doesn't have a preload image, return an empty array
// Skip random/dynamic image APIs (e.g. loliapi.com/acg/pc/) since preloading
// them is wasteful — each request returns a different image.
export function getThemePreloadImages(siteConfig: SiteConfig): Array<string> {
  const homeBg = siteConfig.theme.xinghui.homeBg;
  if (!homeBg) return [];
  // Skip URLs that look like random-image APIs (contain query strings or known patterns)
  try {
    const url = new URL(homeBg);
    // If the path has no extension or ends with /, it's likely a dynamic/random endpoint
    const path = url.pathname;
    if (path.endsWith("/") || !path.match(/\.\w{2,5}$/)) {
      return [];
    }
  } catch {
    // Not a valid URL, treat as static
  }
  return [homeBg];
}
