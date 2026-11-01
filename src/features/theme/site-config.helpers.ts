import type { SiteConfig } from "@/features/config/site-config.schema";

/**
 * 判定一个背景图 URL 是否为「每次请求返回不同图」的随机端点。
 *
 * 前端兜底与 scripts/check-random-images.mjs 都依赖这个判定：只有随机端点
 * 失败才值得重试，静态图失败重试只会放大 404。两处各自猜会漂移，故收敛于此。
 */
export function isRandomImageEndpoint(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    // 无扩展名或以 / 结尾，说明返回的不是某个具体文件，而是动态生成的内容
    return path.endsWith("/") || !path.match(/\.\w{2,5}$/);
  } catch {
    // 非法 URL 当作静态处理，交由调用方按原样使用
    return false;
  }
}

// if the theme doesn't have a preload image, return an empty array
// Skip random/dynamic image APIs (e.g. loliapi.com/acg/pc/) since preloading
// them is wasteful — each request returns a different image.
export function getThemePreloadImages(siteConfig: SiteConfig): Array<string> {
  const homeBg = siteConfig.theme.xinghui.homeBg;
  if (!homeBg) return [];
  if (isRandomImageEndpoint(homeBg)) return [];
  return [homeBg];
}
