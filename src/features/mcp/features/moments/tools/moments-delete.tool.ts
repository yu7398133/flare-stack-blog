import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import * as MomentsData from "@/features/moments/data/moments.data";
import { defineMcpTool } from "../../../service/mcp-tool";
import { McpMomentDeleteInputSchema } from "../schema/mcp-moments.schema";

const REQUIRED_SCOPES: OAuthScopeRequest = { posts: ["write"] };

export const momentsDeleteTool = defineMcpTool({
  name: "moments_delete",
  description: "Delete a moment (shuo-shuo / microblog post) by ID.",
  requiredScopes: REQUIRED_SCOPES,
  inputSchema: McpMomentDeleteInputSchema,
  async handler(args, context) {
    const existing = await MomentsData.getById(context.db, args.id);
    if (!existing) {
      return { content: [{ type: "text", text: `Moment ${args.id} not found` }], isError: true };
    }
    await MomentsData.remove(context.db, args.id);
    return { content: [{ type: "text", text: `Deleted moment ${args.id}` }], structuredContent: { deleted: true, id: args.id } };
  },
});
