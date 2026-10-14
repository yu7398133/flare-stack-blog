import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  parseArgs,
  resolveVerificationPlan,
} from "../../scripts/safe-d1-migrate/main.ts";

/**
 * 生产迁移的安全闸门。`bun run deploy` 每次 push 都会执行它，而它有
 * 3 个不可回滚的迁移（删列、删表）。这里覆盖两处最贵的判断：
 *
 * 1. `resolveVerificationPlan` —— 迁移前识别库状态。它选择「这是全新库，
 *    跳过验证」还是「这是已有库，迁移后必须逐表核对行数」。判错方向的
 *    代价不对称：把已有库当新库会跳过验证，数据被删了也不会报警。
 * 2. `parseArgs` —— 目标（remote/local）解析。误判为 remote 会对着
 *    生产库执行，误判为 local 则以为迁移成功而线上没变。
 */

describe("safe-d1-migrate", () => {
  describe("resolveVerificationPlan", () => {
    it("三张表都不存在时判为全新库，跳过验证", () => {
      const plan = resolveVerificationPlan({
        hasPosts: false,
        hasComments: false,
        hasD1Migrations: false,
      });
      expect(plan.kind).toBe("fresh");
    });

    it("posts 与 comments 都在时判为已有库，必须验证", () => {
      const plan = resolveVerificationPlan({
        hasPosts: true,
        hasComments: true,
        hasD1Migrations: true,
      });
      expect(plan.kind).toBe("verify");
    });

    it("只剩 d1_migrations 而没有业务表时拒绝迁移", () => {
      // 有迁移记录却没有业务表，说明 schema 与迁移历史不一致
      // （迁移跑过，表却不见了）。此时按「全新库」跳过验证是危险的：
      // 后面重新执行迁移会在一个状态不明的库上跑。
      expect(() =>
        resolveVerificationPlan({
          hasPosts: false,
          hasComments: false,
          hasD1Migrations: true,
        }),
      ).toThrow(/Unexpected database schema state/);
    });

    it("只存在一半业务表时拒绝迁移并说明发现了什么", () => {
      // 这是保护性失败：半残的 schema 说明有人手工改过库，
      // 此时任何自动判断都可能造成更大的破坏，必须人工介入。
      expect(() =>
        resolveVerificationPlan({
          hasPosts: true,
          hasComments: false,
          hasD1Migrations: true,
        }),
      ).toThrow(/Unexpected database schema state/);

      expect(() =>
        resolveVerificationPlan({
          hasPosts: false,
          hasComments: true,
          hasD1Migrations: true,
        }),
      ).toThrow(/posts=false, comments=true/);
    });

    it("把判定依据的原始表信息一并带回，便于日志取证", () => {
      const tables = {
        hasPosts: true,
        hasComments: true,
        hasD1Migrations: false,
      };
      expect(resolveVerificationPlan(tables).tables).toEqual(tables);
    });
  });

  describe("parseArgs", () => {
    it("默认迁移远程 DB 库并开启自动回滚", () => {
      expect(parseArgs([])).toEqual({
        autoRollback: true,
        database: "DB",
        persistTo: undefined,
        target: "remote",
        withExport: false,
      });
    });

    it("--local 切换为目标本地库", () => {
      expect(parseArgs(["--local"]).target).toBe("local");
    });

    it("裸参数被当作数据库绑定名", () => {
      expect(parseArgs(["MY_DB"]).database).toBe("MY_DB");
    });

    it("--db 与裸参数同时出现时，后者按命令行顺序生效", () => {
      expect(parseArgs(["--db", "FIRST", "SECOND"]).database).toBe("SECOND");
      expect(parseArgs(["SECOND", "--db", "FIRST"]).database).toBe("FIRST");
    });

    it("--local 与 --remote 同时出现时以最后一个为准", () => {
      expect(parseArgs(["--local", "--remote"]).target).toBe("remote");
      expect(parseArgs(["--remote", "--local"]).target).toBe("local");
    });

    it("--persist-to 解析为绝对路径，默认相对当前工作目录", () => {
      expect(
        parseArgs(["--local", "--persist-to", ".wrangler/state"]).persistTo,
      ).toBe(path.resolve(process.cwd(), ".wrangler/state"));
      const absolute = path.resolve(process.cwd(), "custom");
      expect(parseArgs(["--persist-to", absolute]).persistTo).toBe(absolute);
    });

    it("--no-rollback 关闭自动回滚，--with-export 开启导出", () => {
      const parsed = parseArgs(["--no-rollback", "--with-export"]);
      expect(parsed.autoRollback).toBe(false);
      expect(parsed.withExport).toBe(true);
    });

    it("--db 或 --persist-to 缺少取值时报错，而不是静默使用默认值", () => {
      // 静默回退到默认库是最危险的失败模式：用户以为在迁移 MY_DB，
      // 实际动的是 DB。
      expect(() => parseArgs(["--db"])).toThrow(/Missing value for --db/);
      expect(() => parseArgs(["--persist-to"])).toThrow(
        /Missing value for --persist-to/,
      );
    });

    it("无法识别的选项被忽略，不影响已解析的结果", () => {
      const parsed = parseArgs(["--unknown-flag", "--local"]);
      expect(parsed.target).toBe("local");
      expect(parsed.database).toBe("DB");
    });
  });
});
