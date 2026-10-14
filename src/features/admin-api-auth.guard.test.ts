import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * 守卫测试：所有 admin server function 必须挂鉴权中间件。
 *
 * 背景（真实事故）：/api/admin/{photos,moments,projects} 三个 Hono 路由
 * 曾完全没有 session 校验，匿名即可读写删生产数据（线上实测 200 + 真实数据）。
 * 根因是「新增 API 时忘了加鉴权」这类人为疏漏，而中间件是唯一防线
 * （service 层不做权限校验，见 src/lib/middlewares.ts 的 adminMiddleware）。
 *
 * 这个测试用**静态扫描**覆盖这一风险：凡是位于 admin API 文件中的
 * createServerFn，都必须出现 adminMiddleware（或显式的公开豁免注释）。
 * 因为中间件本身依赖 TanStack 请求上下文、难以低成本地单元测试，
 * 静态守卫是这里性价比最高、且能真正防住回归的手段。
 */

const REPO_ROOT = path.resolve(__dirname, "../..");

/** 认定为 admin API 的文件：路径含 admin 且是 api 层。 */
function findAdminApiFiles(): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "paraglide") {
          continue;
        }
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      if (/\.test\.|\.integration\.test\./.test(entry.name)) continue;
      // admin 的 API 层文件：xxx.admin.api.ts 或 admin-*.route.ts
      const isAdminApi =
        /\.admin\.api\.ts$/.test(entry.name) ||
        /^admin-.*\.route\.ts$/.test(entry.name);
      if (isAdminApi) results.push(full);
    }
  }

  walk(path.join(REPO_ROOT, "src"));
  return results;
}

describe("Admin API 鉴权守卫（静态扫描）", () => {
  const files = findAdminApiFiles();

  it("应能发现 admin API 文件（防止扫描规则失效导致测试形同虚设）", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("每个 admin server function 都必须挂 adminMiddleware", () => {
    const violations: string[] = [];

    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      const rel = path.relative(REPO_ROOT, file);

      // 统计 createServerFn 调用数
      const serverFnCount = (src.match(/createServerFn\s*\(/g) ?? []).length;
      if (serverFnCount === 0) continue;

      // 显式豁免：文件顶部声明无需鉴权（必须是刻意的，并说明理由）
      if (/@public-admin-api\b/.test(src)) continue;

      const middlewareCount = (src.match(/adminMiddleware/g) ?? []).length;

      if (middlewareCount === 0) {
        violations.push(
          `${rel}: 有 ${serverFnCount} 个 createServerFn，但完全没有 adminMiddleware`,
        );
      }
    }

    expect(violations).toEqual([]);
  });

  it("Hono 的 admin 路由必须把 adminGuardMiddleware 真正挂到 app.use 上", () => {
    const violations: string[] = [];

    for (const file of files) {
      if (!/\.route\.ts$/.test(file)) continue; // 只看 Hono 路由
      const src = fs.readFileSync(file, "utf8");
      const rel = path.relative(REPO_ROOT, file);

      if (/@public-admin-api\b/.test(src)) continue;

      // 关键：不能只判断字符串出现过——import 语句里也会出现
      // adminGuardMiddleware。必须确认它出现在 app.use(...) 的调用中，
      // 否则「import 了但忘了挂」这种最常见的疏漏会被漏掉（已验证会被漏掉）。
      const usesGuard = /app\.use\([^)]*adminGuardMiddleware[^)]*\)/.test(src);

      if (!usesGuard) {
        violations.push(
          `${rel}: adminGuardMiddleware 未出现在任何 app.use(...) 调用中`,
        );
      }
    }

    expect(violations).toEqual([]);
  });

  it("Hono 的 admin 路由必须挂 adminGuardMiddleware（避免只 import 不挂载）", () => {
    const violations: string[] = [];

    for (const file of files) {
      if (!/\.route\.ts$/.test(file)) continue;
      const src = fs.readFileSync(file, "utf8");
      const rel = path.relative(REPO_ROOT, file);

      if (/@public-admin-api\b/.test(src)) continue;

      // 每个 app.use 挂中间件时，baseMiddleware 之后必须跟守卫。
      const useLines = src
        .split("\n")
        .filter((line) => /app\.use\(/.test(line));

      const hasUnprotected = useLines.some(
        (line) => !line.includes("adminGuardMiddleware"),
      );

      if (useLines.length > 0 && hasUnprotected) {
        violations.push(`${rel}: 存在未挂守卫的 app.use 中间件链`);
      }
    }

    expect(violations).toEqual([]);
  });
});
