import { describe, expect, it } from "vitest";
import {
  getThemePreloadImages,
  isRandomImageEndpoint,
} from "./site-config.helpers";

/**
 * 随机端点判定是唯一 owner：预加载跳过与前端的 onError 重试都读它。
 * 行为必须与搬进函数前的启发式一致，否则预加载会回归成「预加载一张随机图」。
 */
describe("isRandomImageEndpoint", () => {
  it("把以 / 结尾的路径判为随机端点", () => {
    expect(isRandomImageEndpoint("https://www.loliapi.com/acg/pc/")).toBe(true);
    expect(isRandomImageEndpoint("https://www.loliapi.com/acg/pe/")).toBe(true);
  });

  it("把没有扩展名的路径判为随机端点", () => {
    expect(isRandomImageEndpoint("https://example.com/random")).toBe(true);
    expect(isRandomImageEndpoint("https://example.com/api/bg?id=1")).toBe(true);
  });

  it("把带图片扩展名的固定路径判为静态图", () => {
    expect(isRandomImageEndpoint("https://example.com/a/bg.webp")).toBe(false);
    expect(isRandomImageEndpoint("https://example.com/a/bg.jpg?x=1")).toBe(
      false,
    );
    expect(isRandomImageEndpoint("https://example.com/a/bg.png")).toBe(false);
  });

  it("非法 URL 不抛异常且按静态处理", () => {
    expect(() => isRandomImageEndpoint("not a url")).not.toThrow();
    expect(isRandomImageEndpoint("not a url")).toBe(false);
    expect(isRandomImageEndpoint("")).toBe(false);
  });
});

describe("getThemePreloadImages", () => {
  it("随机端点不参与预加载", () => {
    const config = {
      theme: { xinghui: { homeBg: "https://www.loliapi.com/acg/pc/" } },
    } as unknown as Parameters<typeof getThemePreloadImages>[0];
    expect(getThemePreloadImages(config)).toEqual([]);
  });

  it("静态图仍然被预加载（防回归）", () => {
    const config = {
      theme: { xinghui: { homeBg: "/images/home-bg.webp" } },
    } as unknown as Parameters<typeof getThemePreloadImages>[0];
    expect(getThemePreloadImages(config)).toEqual(["/images/home-bg.webp"]);
  });
});
