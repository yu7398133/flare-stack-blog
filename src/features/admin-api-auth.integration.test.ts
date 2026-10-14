import { env } from "cloudflare:workers";
import type { Hono } from "hono";
import {
  createMockAdminSession,
  createMockExecutionCtx,
} from "tests/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import adminMomentsRoute from "@/features/moments/api/hono/admin-moments.route";
import adminPhotosRoute from "@/features/photos/api/hono/admin-photos.route";
import adminProjectsRoute from "@/features/projects/api/hono/admin-projects.route";

/**
 * 回归防护：/api/admin/{photos,moments,projects} 曾完全无鉴权。
 *
 * 这三个 Hono 路由树只挂了 baseMiddleware（仅注入 db/auth 到上下文，
 * 不做任何 session 校验），导致匿名用户可读、可写、可删生产数据。
 * 线上实测过 GET 返回 200 + 真实数据，而同一前缀下的 /api/admin/export
 * 正确返回 401。
 *
 * 每个路由必须自行校验 session 与 role，因为这些路由是独立挂载的
 * （src/lib/hono/routes.ts:166-168），不经过 server function 的
 * adminMiddleware。
 */

/** 伪造 auth：getSession 返回给定 session（null = 未登录）。 */
function stubAuthWithSession(session: unknown) {
  return {
    api: {
      getSession: vi.fn(async () => session),
    },
    handler: vi.fn(),
  };
}

type GetAuth = typeof import("@/lib/auth/auth.server").getAuth;

/** 把 getAuth 替换成返回指定 session 的假实现。 */
async function mockSession(session: unknown) {
  const authServer = await import("@/lib/auth/auth.server");
  vi.spyOn(authServer, "getAuth").mockReturnValue(
    stubAuthWithSession(session) as unknown as ReturnType<GetAuth>,
  );
}

/** 发一个真实请求；ExecutionContext 必须传入，否则 route 内部取上下文会抛错。 */
function callRoute(
  route: Hono<{ Bindings: Env }>,
  path: string,
  init?: RequestInit,
) {
  return route.request(path, init, env, createMockExecutionCtx());
}

const ADMIN_ROUTES: Array<{
  name: string;
  route: Hono<{ Bindings: Env }>;
}> = [
  {
    name: "photos",
    route: adminPhotosRoute as unknown as Hono<{ Bindings: Env }>,
  },
  {
    name: "moments",
    route: adminMomentsRoute as unknown as Hono<{ Bindings: Env }>,
  },
  {
    name: "projects",
    route: adminProjectsRoute as unknown as Hono<{ Bindings: Env }>,
  },
];

describe("Admin Hono API authentication", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe.each(ADMIN_ROUTES)("/api/admin/$name", ({ route }) => {
    it("rejects an anonymous GET with 401", async () => {
      await mockSession(null);

      const res = await callRoute(route, "/", { method: "GET" });

      expect(res.status).toBe(401);
    });

    it("rejects an anonymous POST write with 401", async () => {
      await mockSession(null);

      const res = await callRoute(route, "/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "unauthorized write" }),
      });

      expect(res.status).toBe(401);
    });

    it("rejects an anonymous DELETE with 401", async () => {
      await mockSession(null);

      const res = await callRoute(route, "/1", { method: "DELETE" });

      expect(res.status).toBe(401);
    });

    it("rejects an authenticated non-admin with 403", async () => {
      await mockSession({
        user: { id: "u1", email: "user@example.com", role: "user" },
        session: { id: "s1" },
      });

      const res = await callRoute(route, "/", { method: "GET" });

      expect(res.status).toBe(403);
    });

    it("lets an admin through to the handler", async () => {
      await mockSession(createMockAdminSession());

      const res = await callRoute(route, "/", { method: "GET" });

      // 守卫不能吞掉正常请求：管理员必须被放行到业务处理器。
      expect(res.status).toBe(200);
    });
  });
});
