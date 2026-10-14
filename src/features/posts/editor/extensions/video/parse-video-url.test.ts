import { describe, expect, it } from "vitest";
import {
  buildVideoEmbedUrl,
  parseVideoUrl,
} from "@/features/posts/editor/extensions/video/parse-video-url";

/**
 * 视频嵌入只支持外链（B站 / YouTube），所以「能不能把用户粘贴的链接
 * 正确解析成 provider + videoId」是整个功能的第一道关口：
 * 解析错了 iframe 就指向无效地址（白屏），解析放太松会把任意 URL
 * 塞进 iframe（安全问题，CSP 只是第二道防线）。
 */
describe("parseVideoUrl", () => {
  describe("B站", () => {
    it("解析 BV 号完整链接", () => {
      expect(
        parseVideoUrl("https://www.bilibili.com/video/BV1xx411c7mD"),
      ).toEqual({
        provider: "bilibili",
        videoId: "BV1xx411c7mD",
      });
    });

    it("解析带 query 的 BV 链接（如 ?p=2）", () => {
      expect(
        parseVideoUrl("https://www.bilibili.com/video/BV1xx411c7mD?p=2"),
      ).toEqual({
        provider: "bilibili",
        videoId: "BV1xx411c7mD",
      });
    });

    it("解析 av 号链接", () => {
      expect(parseVideoUrl("https://www.bilibili.com/video/av170001")).toEqual({
        provider: "bilibili",
        videoId: "av170001",
      });
    });

    it("接受不带协议前缀的 bilibili 链接", () => {
      expect(parseVideoUrl("www.bilibili.com/video/BV1xx411c7mD")).toEqual({
        provider: "bilibili",
        videoId: "BV1xx411c7mD",
      });
    });

    it("解析 B站短链 b23.tv", () => {
      expect(parseVideoUrl("https://b23.tv/abcdefg")).toEqual({
        provider: "bilibili",
        videoId: "abcdefg",
      });
    });
  });

  describe("YouTube", () => {
    it("解析 watch?v= 形式", () => {
      expect(
        parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      ).toEqual({
        provider: "youtube",
        videoId: "dQw4w9WgXcQ",
      });
    });

    it("解析 youtu.be 短链", () => {
      expect(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toEqual({
        provider: "youtube",
        videoId: "dQw4w9WgXcQ",
      });
    });

    it("解析 /embed/ 形式", () => {
      expect(
        parseVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ"),
      ).toEqual({
        provider: "youtube",
        videoId: "dQw4w9WgXcQ",
      });
    });

    it("解析 /shorts/ 形式", () => {
      expect(
        parseVideoUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
      ).toEqual({
        provider: "youtube",
        videoId: "dQw4w9WgXcQ",
      });
    });

    it("watch 链接带额外参数也能解析", () => {
      expect(
        parseVideoUrl(
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLabc&t=30s",
        ),
      ).toEqual({
        provider: "youtube",
        videoId: "dQw4w9WgXcQ",
      });
    });
  });

  describe("拒绝无效输入（安全与健壮性）", () => {
    it("空字符串返回 null", () => {
      expect(parseVideoUrl("")).toBeNull();
    });

    it("只有空白字符返回 null", () => {
      expect(parseVideoUrl("   ")).toBeNull();
    });

    it("不支持的平台返回 null", () => {
      expect(parseVideoUrl("https://vimeo.com/123456")).toBeNull();
    });

    it("javascript: 伪协议返回 null（不能进 iframe）", () => {
      expect(parseVideoUrl("javascript://alert(1)")).toBeNull();
    });

    it("data: 伪协议返回 null", () => {
      expect(
        parseVideoUrl("data://text/html,<script>alert(1)</script>"),
      ).toBeNull();
    });

    it("域名像但后缀不同的钓鱼站返回 null", () => {
      expect(
        parseVideoUrl("https://bilibili.com.evil.com/video/BV1xx411c7mD"),
      ).toBeNull();
      expect(parseVideoUrl("https://fake-youtube.com/watch?v=abc")).toBeNull();
    });

    it("B站链接但缺少 video id 返回 null", () => {
      expect(parseVideoUrl("https://www.bilibili.com/video/")).toBeNull();
    });

    it("YouTube 链接但缺少 v 参数返回 null", () => {
      expect(
        parseVideoUrl("https://www.youtube.com/watch?list=PLabc"),
      ).toBeNull();
    });

    it("普通网址返回 null", () => {
      expect(parseVideoUrl("https://example.com/page")).toBeNull();
    });
  });

  describe("输出可用于构造 iframe 地址", () => {
    it("B站结果能拼出 player.bilibili.com 的 embed 地址", () => {
      const parsed = parseVideoUrl(
        "https://www.bilibili.com/video/BV1xx411c7mD",
      );
      expect(parsed).not.toBeNull();
      expect(buildVideoEmbedUrl(parsed!)).toBe(
        "https://player.bilibili.com/player.html?bvid=BV1xx411c7mD&autoplay=0",
      );
    });

    it("YouTube 结果能拼出 youtube-nocookie 的 embed 地址", () => {
      const parsed = parseVideoUrl("https://youtu.be/dQw4w9WgXcQ");
      expect(parsed).not.toBeNull();
      expect(buildVideoEmbedUrl(parsed!)).toBe(
        "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
      );
    });

    it("B站 av 号拼出的地址使用 aid 参数", () => {
      const parsed = parseVideoUrl("https://www.bilibili.com/video/av170001");
      expect(parsed).not.toBeNull();
      expect(buildVideoEmbedUrl(parsed!)).toBe(
        "https://player.bilibili.com/player.html?aid=170001&autoplay=0",
      );
    });
  });
});
