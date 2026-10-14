import { describe, expect, it } from "vitest";
import { parseWranglerJson } from "./parse-wrangler-json.ts";

/**
 * wrangler CLI 会把进度条、警告和 AN 提示混在 stdout 里，`--json` 也不能
 * 保证输出是纯 JSON。迁移脚本依赖它拿到 D1 的 Time Travel bookmark —— 拿不到
 * 就无法在验证失败时回滚。这里锁定「从噪声里挖出 JSON」的行为。
 */
describe("parseWranglerJson", () => {
  it("解析纯 JSON 对象与数组", () => {
    expect(parseWranglerJson<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
    expect(parseWranglerJson<number[]>("[1,2]")).toEqual([1, 2]);
  });

  it("容忍首尾空白与换行", () => {
    expect(parseWranglerJson<{ a: number }>('\n\n  {"a":1}  \n')).toEqual({
      a: 1,
    });
  });

  it("跳过前置噪声，取最后一个可解析的 JSON", () => {
    // 取最后一个而非第一个：wrangler 常先打印一条进度 JSON，
    // 真正的结果在后面。
    const output = [
      "⛅️ wrangler 4.92.0",
      '{"stage":"starting"}',
      "Total Upload: 1.2 KiB",
      '{"bookmark":"00000001-00000002"}',
    ].join("\n");

    expect(parseWranglerJson<{ bookmark: string }>(output)).toEqual({
      bookmark: "00000001-00000002",
    });
  });

  it("在行首出现 JSON 才可以作为候选，避免截断正文中的花括号", () => {
    // 正文里的 `{` 不是 JSON 起点，如果从那里开始截取会解析失败，
    // 于是回退到更靠前的真正候选。
    const output = ["some log {not json}", '{"ok":true}'].join("\n");
    expect(parseWranglerJson<{ ok: boolean }>(output)).toEqual({ ok: true });
  });

  it("无输出时抛出明确错误而不是返回 undefined", () => {
    // 返回 undefined 会让调用方在后面某处才崩，丢失「wrangler 没输出」
    // 这个真正的原因。
    expect(() => parseWranglerJson("")).toThrow(/no JSON output/);
    expect(() => parseWranglerJson("   \n  ")).toThrow(/no JSON output/);
  });

  it("完全不含 JSON 时抛错并带上原始输出便于排查", () => {
    expect(() => parseWranglerJson("just a plain log line")).toThrow(
      /Failed to parse Wrangler JSON output[\s\S]*just a plain log line/,
    );
  });

  it("处理嵌套结构", () => {
    const output = 'log\n{"result":[{"results":[{"count":42}]}]}';
    expect(
      parseWranglerJson<{
        result: Array<{ results: Array<{ count: number }> }>;
      }>(output),
    ).toEqual({ result: [{ results: [{ count: 42 }] }] });
  });
});
