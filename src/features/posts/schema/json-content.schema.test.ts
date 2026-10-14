import { describe, expect, it } from "vitest";
import {
  JsonContentSchema,
  NullableJsonContentSchema,
} from "@/features/posts/schema/json-content.schema";

/**
 * contentJson 的存储契约。
 *
 * 服务端用它校验编辑器提交的 JSON 再落库。它必须对**未知节点类型保持开放**：
 * 编辑器每加一个块级节点（如 linkCard / videoEmbed），如果这里的 `type`
 * 被收紧成枚举，旧文章读得出来、新文章却存不进去——而且报错发生在保存那一刻，
 * 用户刚写完的内容会丢。
 *
 * 这组测试把「开放式」钉死：往 schema 里塞一个现在还不存在的节点类型，
 * 必须照样通过。
 */
describe("json-content.schema", () => {
  it("接受任意的未知节点类型", () => {
    const result = JsonContentSchema.safeParse({
      type: "doc",
      content: [{ type: "someFutureNode", attrs: { anything: "goes" } }],
    });
    expect(result.success).toBe(true);
  });

  it("接受卡片节点及其全部属性", () => {
    const result = JsonContentSchema.safeParse({
      type: "doc",
      content: [
        {
          type: "linkCard",
          attrs: {
            emoji: "🧪",
            title: "标题",
            description: "描述",
            href: "https://example.com",
            site: "example.com",
          },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("接受视频嵌入节点及其全部属性", () => {
    const result = JsonContentSchema.safeParse({
      type: "doc",
      content: [
        {
          type: "videoEmbed",
          attrs: {
            src: "https://www.bilibili.com/video/BV1GJ411x7h7",
            provider: "bilibili",
            videoId: "BV1GJ411x7h7",
            title: "测试视频",
          },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("属性里允许嵌套结构与 null（编辑器会存空描述）", () => {
    const result = JsonContentSchema.safeParse({
      type: "doc",
      content: [
        {
          type: "linkCard",
          attrs: {
            description: null,
            nested: { deep: { value: [1, "two", true, null] } },
          },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("接受普通文本与标记，不误伤既有内容", () => {
    const result = JsonContentSchema.safeParse({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "hello", marks: [{ type: "bold" }] }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("拒绝同时带 text 与 content 的节点", () => {
    // 唯一的语义约束：这在 Tiptap 里是非法结构，放过去会在渲染时炸。
    const result = JsonContentSchema.safeParse({
      type: "text",
      text: "hello",
      content: [{ type: "text", text: "world" }],
    });
    expect(result.success).toBe(false);
  });

  it("允许 null 内容（草稿尚未写入正文）", () => {
    expect(NullableJsonContentSchema.safeParse(null).success).toBe(true);
    expect(NullableJsonContentSchema.safeParse(undefined).success).toBe(false);
  });
});
