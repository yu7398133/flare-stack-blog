/**
 * Shared post cover image utilities.
 *
 * Priority:
 *   1. Explicit cover field from post metadata
 *   2. Anime image from the loliapi cover pool, picked deterministically by slug
 *
 * 这个图床的编号池里大量编号是永久 404（实测 697 个里 396 个打不开），
 * 而且连存活的编号也会间歇性返回 404。所以：
 *   - 只从实测可用的白名单里挑，避免一上来就撞死图；
 *   - 同时给出候选序列，渲染层失败时可换下一张，而不是留个破图。
 */

const COVER_CDN = "https://eo-img.loliapi.cn/i/pc/img";

/**
 * 实测可用（连续两次探测均 200）的编号白名单。
 * 生成方式：对 1..697 逐个探测，连续失败两次才判死，存活的收入本表。
 * 图床调整后需要重新采集，不要手工增删。
 */
export const COVER_POOL: readonly number[] = [
  2, 4, 5, 6, 7, 8, 9, 10, 14, 16, 18, 19, 20, 23, 27, 30, 32, 33, 34, 37, 40,
  42, 43, 45, 47, 48, 49, 50, 51, 54, 58, 60, 61, 62, 63, 65, 66, 67, 68, 71,
  73, 74, 76, 79, 84, 85, 86, 91, 93, 95, 96, 97, 103, 104, 107, 108, 110, 111,
  113, 118, 119, 120, 121, 124, 126, 127, 128, 129, 132, 133, 134, 135, 137,
  138, 139, 140, 143, 144, 145, 148, 149, 150, 151, 154, 155, 156, 157, 158,
  160, 161, 165, 166, 167, 168, 169, 170, 171, 174, 177, 178, 179, 180, 182,
  184, 185, 186, 187, 188, 190, 191, 192, 193, 195, 197, 198, 201, 202, 203,
  204, 205, 207, 210, 211, 212, 214, 216, 221, 223, 224, 227, 229, 235, 236,
  237, 238, 239, 240, 242, 243, 244, 246, 247, 249, 253, 254, 256, 257, 259,
  260, 262, 264, 265, 267, 269, 275, 281, 282, 284, 286, 290, 291, 292, 296,
  297, 301, 302, 303, 304, 305, 306, 307, 309, 310, 311, 312, 314, 315, 319,
  322, 324, 325, 328, 330, 331, 332, 336, 338, 339, 340, 342, 344, 345, 347,
  348, 351, 352, 357, 359, 362, 364, 365, 366, 367, 369, 371, 372, 376, 377,
  383, 384, 386, 387, 391, 393, 394, 403, 404, 414, 420, 421, 424, 425, 428,
  429, 434, 437, 438, 443, 447, 449, 451, 453, 457, 458, 459, 462, 465, 466,
  470, 474, 475, 476, 478, 481, 483, 484, 487, 488, 489, 492, 493, 494, 495,
  505, 506, 507, 509, 515, 516, 520, 521, 522, 523, 524, 525, 528, 529, 532,
  533, 534, 539, 540, 541, 544, 546, 548, 551, 552, 555, 556, 558, 559, 563,
  565, 568, 571, 572, 573, 575, 577, 578, 580, 587, 589, 590, 593, 601, 607,
  610, 613, 614, 620, 622, 625, 626, 627, 629, 630, 631, 637, 639, 640, 650,
  655, 657, 658, 664, 666, 667, 671, 675, 677, 678, 681, 683, 685, 686, 687,
  688, 689, 690, 691, 692, 693, 694, 695,
];

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function coverUrlAt(idx: number): string {
  return `${COVER_CDN}${idx}.webp`;
}

/**
 * 生成该文章的首选封面。
 * 同一个 slug 在首页、归档、详情页始终拿到同一张，避免每次跳转都换图。
 */
export function getPostCoverBySlug(slug: string): string {
  const pick = hashSlug(slug) % COVER_POOL.length;
  return coverUrlAt(COVER_POOL[pick]);
}

/**
 * 失败时可依次尝试的候选封面（首选之外的后续几张）。
 * 图床会间歇性 404，换一张比显示破图体面；数量有上限，避免打请求风暴。
 */
export function getPostCoverCandidates(slug: string, count = 3): string[] {
  const start = hashSlug(slug) % COVER_POOL.length;
  const out: string[] = [];
  for (let i = 1; i <= count; i++) {
    out.push(coverUrlAt(COVER_POOL[(start + i) % COVER_POOL.length]));
  }
  return out;
}

/**
 * Get the cover image for a post.
 * Returns the explicit cover if set, otherwise the deterministic pool image.
 */
export function getPostCover(slug: string, cover?: string | null): string {
  if (cover && cover.trim()) return cover;
  return getPostCoverBySlug(slug);
}
