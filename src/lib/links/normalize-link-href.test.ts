import { describe, expect, it } from "vitest";
import { normalizeLinkHref } from "./normalize-link-href";

/**
 * 链接协议白名单。
 *
 * 原实现用 `/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//` 放行任意 scheme，
 * 于是 `javascript://alert(1)` 原样通过并最终渲染成 <a href>，
 * 点击即在该站点上下文执行脚本（存储型 XSS）。
 */
describe("normalizeLinkHref", () => {
  describe("rejects dangerous schemes", () => {
    it.each([
      "javascript://alert(1)",
      "javascript://%0aalert(1)",
      "JaVaScRiPt://alert(1)",
      "data://text/html,<script>alert(1)</script>",
      "vbscript://msgbox(1)",
      "file:///etc/passwd",
    ])("rejects %s", (input) => {
      const result = normalizeLinkHref(input);

      expect(result).not.toMatch(/^javascript:/i);
      expect(result).not.toMatch(/^data:/i);
      expect(result).not.toMatch(/^vbscript:/i);
      expect(result).not.toMatch(/^file:/i);
    });
  });

  describe("keeps friendly protocols usable", () => {
    it.each([
      "https://example.com",
      "http://example.com",
      "mailto:someone@example.com",
      "tel:+8613800000000",
    ])("keeps %s", (input) => {
      expect(normalizeLinkHref(input)).toBe(input);
    });

    it("keeps site-relative paths and anchors", () => {
      expect(normalizeLinkHref("/posts/hello")).toBe("/posts/hello");
      expect(normalizeLinkHref("#section")).toBe("#section");
    });

    it("prefixes bare hosts with https", () => {
      expect(normalizeLinkHref("example.com")).toBe("https://example.com");
      expect(normalizeLinkHref("www.example.com")).toBe(
        "https://www.example.com",
      );
    });

    it("returns an empty string for blank input", () => {
      expect(normalizeLinkHref("   ")).toBe("");
    });
  });
});
