import type { SiteConfig } from "@/features/config/site-config.schema";

// if the theme doesn't have a preload image, return an empty array
export function getThemePreloadImages(siteConfig: SiteConfig): Array<string> {
  return siteConfig.theme.xinghui.homeBg
    ? [siteConfig.theme.xinghui.homeBg]
    : [];
}
