import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import * as MomentsData from "@/features/moments/data/moments.data";
import { defineMcpTool } from "../../../service/mcp-tool";
import { McpMomentsListInputSchema, McpMomentsListOutputSchema } from "../schema/mcp-moments.schema";
import { serializeMcpMoment } from "../service/mcp-moments.service";

const REQUIRED_SCOPES: OAuthScopeRequest = { posts: ["read"] };

export const momentsListTool = defineMcpTool({
  name: "moments_list",
  description: "List moments (shuo-shuo / microblog posts) with pagination.",
  requiredScopes: REQUIRED_SCOPES,
  inputSchema: McpMomentsListInputSchema,
  outputSchema: McpMomentsListOutputSchema,
  async handler(args, context) {
    const offset = args.offset ?? 0;
    const limit = args.limit ?? 20;
    const items = await MomentsData.getAll(context.db, { limit, offset });
    const total = await MomentsData.count(context.db);
    return {
      content: [{ type: "text", text: JSON.stringify({ items: items.map(serializeMcpMoment), total }, null, 2) }],
      structuredContent: { items: items.map(serializeMcpMoment), total },
    };
  },
});
