import { WorkerEntrypoint } from "cloudflare:workers";
import { createMcpHandler } from "agents/mcp";
import { createOAuthPrincipalFromProps } from "@/features/oauth-provider/service/oauth-provider.service";
import { getDb } from "@/lib/db";
import { createMcpServer } from "../service/mcp.server";
import {
  applyMcpOriginPolicy,
  createInvalidOriginResponse,
  isAllowedMcpOrigin,
} from "../utils/mcp-origin";

type OAuthProps = Record<string, unknown>;

function getOAuthProps(ctx: ExecutionContext): OAuthProps {
  const maybeContext = ctx as ExecutionContext & { props?: OAuthProps };
  return maybeContext.props ?? {};
}

/**
 * MCP 端点限流标识。
 *
 * /mcp 由 OAuthProvider 保护（必须有 OAuth token），但此前没有任何速率
 * 限制：持 token 的客户端可无限触发工具调用，而工具会打 DB、跑 AI
 * 分析、写 Workflow，成本与配额都由本站承担。
 *
 * 优先用 OAuth 主体（clientId / userId）计数，使同一 token 的滥用不会
 * 挤占其他客户端的配额；无法识别主体时回退到客户端 IP。
 */
function createMcpRateLimitIdentifier(
  request: Request,
  props: OAuthProps,
): string {
  const clientId =
    typeof props.clientId === "string" ? props.clientId : undefined;
  const userId = typeof props.userId === "string" ? props.userId : undefined;
  const principal = clientId ?? userId;
  if (principal) return `mcp:principal:${principal}`;

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "unknown";
  return `mcp:ip:${ip}`;
}

/** MCP 每分钟允许的请求数。工具调用成本高，取较保守的值。 */
const MCP_RATE_LIMIT = { capacity: 60, interval: "1m" } as const;

export class McpApiHandler extends WorkerEntrypoint<Env> {
  async fetch(request: Request) {
    if (!isAllowedMcpOrigin(request)) {
      return createInvalidOriginResponse();
    }

    const executionCtx = this.ctx as ExecutionContext;
    const authProps = getOAuthProps(executionCtx);

    const limiterId = this.env.RATE_LIMITER.idFromName(
      createMcpRateLimitIdentifier(request, authProps),
    );
    const limitResult =
      await this.env.RATE_LIMITER.get(limiterId).checkLimit(MCP_RATE_LIMIT);

    if (!limitResult.allowed) {
      return new Response(
        JSON.stringify({
          code: "RATE_LIMITED",
          message: "Too Many Requests",
          retryAfterMs: limitResult.retryAfterMs,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(limitResult.retryAfterMs / 1000)),
          },
        },
      );
    }

    const db = getDb(this.env);
    const server = await createMcpServer({
      db,
      env: this.env,
      executionCtx,
      principal: createOAuthPrincipalFromProps(authProps),
    });

    const response = await createMcpHandler(
      server as unknown as Parameters<typeof createMcpHandler>[0],
      {
        authContext: {
          props: authProps,
        },
        route: "/mcp",
      },
    )(request, this.env, executionCtx);

    return applyMcpOriginPolicy(request, response);
  }
}
