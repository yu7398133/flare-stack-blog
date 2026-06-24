import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import { McpApiHandler } from "@/features/mcp/api/mcp-api-handler";
import { createWorkersOAuthProviderOptions } from "@/features/oauth-provider/oauth-provider.config";
import { appWorkerHandler } from "./app-handler";

let oauthProvider: OAuthProvider<Env> | null = null;

function getOAuthProvider() {
  if (oauthProvider) {
    return oauthProvider;
  }

  oauthProvider = new OAuthProvider(
    createWorkersOAuthProviderOptions({
      apiHandlers: {
        "/mcp": McpApiHandler,
      },
      defaultHandler: appWorkerHandler,
    }),
  );

  return oauthProvider;
}

export function handleRootRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Only route to OAuthProvider for actual MCP, OAuth, and well-known paths.
  // Prevents OAuthProvider startsWith match intercepting normal blog URLs.
  if (
    path === "/mcp" ||
    path.startsWith("/mcp/") ||
    path.startsWith("/oauth/") ||
    path.startsWith("/.well-known/")
  ) {
    return getOAuthProvider().fetch(request, env, ctx);
  }

  return appWorkerHandler.fetch(request, env, ctx);
}
