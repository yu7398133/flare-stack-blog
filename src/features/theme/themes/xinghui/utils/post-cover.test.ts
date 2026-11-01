import { describe, expect, it } from "vitest";
import {
  COVER_POOL,
  coverUrlAt,
  getPostCover,
  getPostCoverBySlug,
  getPostCoverCandidates,
} from "./post-cover";

/**
 * 图床 eo-img.loliapi.cn 的编号池大量永久 404（实测 697 个里 396 个打不开），
 * 所以封面必须从实测白名单里挑，且失败时要有候选可换。
 */
describe("COVER_POOL", () => {
  it("白名单非空且无重复", () => {
    expect(COVER_POOL.length).toBeGreaterThan(0);
    expect(new Set(COVER_POOL).size).toBe(COVER_POOL.length);
  });

  it("编号都在图床合法范围内（1..697）", () => {
    for (const idx of COVER_POOL) {
      expect(idx).toBeGreaterThanOrEqual(1);
      expect(idx).toBeLessThanOrEqual(697);
    }
  });
});

describe("getPostCoverBySlug", () => {
  it("同一 slug 始终得到同一张图", () => {
    const a = getPostCoverBySlug("hello-world");
    const b = getPostCoverBySlug("hello-world");
    expect(a).toBe(b);
  });

  it("不同 slug 会分散到不同图（不是全站一张）", () => {
    const urls = new Set(
      ["a", "b", "c", "d", "e", "f", "g", "h"].map(getPostCoverBySlug),
    );
    expect(urls.size).toBeGreaterThan(1);
  });

  it("生成的 URL 指向白名单里的编号", () => {
    const url = getPostCoverBySlug("some-post");
    const m = url.match(/img(\d+)\.webp$/);
    expect(m).not.toBeNull();
    expect(COVER_POOL).toContain(Number(m?.[1]));
  });
});

describe("getPostCoverCandidates", () => {
  it("返回指定数量的候选且都不同于首选", () => {
    const primary = getPostCoverBySlug("x");
    const cands = getPostCoverCandidates("x", 3);
    expect(cands).toHaveLength(3);
    expect(cands).not.toContain(primary);
  });

  it("候选之间互不重复", () => {
    const cands = getPostCoverCandidates("y", 3);
    expect(new Set(cands).size).toBe(cands.length);
  });

  it("池子不够大时循环取，不会产生 undefined", () => {
    const cands = getPostCoverCandidates("z", COVER_POOL.length + 5);
    expect(cands.every((u) => typeof u === "string" && u.length > 0)).toBe(
      true,
    );
  });
});

describe("getPostCover", () => {
  it("显式封面优先于随机池", () => {
    expect(getPostCover("s", "https://cdn.example.com/a.webp")).toBe(
      "https://cdn.example.com/a.webp",
    );
  });

  it("显式封面为空白时回退到池子", () => {
    expect(getPostCover("s", "   ")).toBe(getPostCoverBySlug("s"));
  });
});

describe("coverUrlAt", () => {
  it("拼出图床地址", () => {
    expect(coverUrlAt(42)).toBe("https://eo-img.loliapi.cn/i/pc/img42.webp");
  });
});
