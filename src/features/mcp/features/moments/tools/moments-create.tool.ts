import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import * as MomentsData from "@/features/moments/data/moments.data";
import { defineMcpTool } from "../../../service/mcp-tool";
import { McpMomentCreateInputSchema, McpMomentSchema } from "../schema/mcp-moments.schema";
import { serializeMcpMoment } from "../service/mcp-moments.service";

const REQUIRED_SCOPES: OAuthScopeRequest = { posts: ["write"] };

export const momentsCreateTool = defineMcpTool({
  name: "moments_create",
  description: "Create a new moment (shuo-shuo / microblog post).",
  requiredScopes: REQUIRED_SCOPES,
  inputSchema: McpMomentCreateInputSchema,
  outputSchema: McpMomentSchema,
  async handler(args, context) {
    const moment = await MomentsData.create(context.db, {
      content: args.content,
      images: args.images ?? null,
      mood: args.mood ?? null,
      location: args.location ?? null,
      visibility: (args.visibility ?? "public") as "public" | "private",
      likes: 0,
    });
    return {
      content: [{ type: "text", text: `Created moment ${moment.id}` }],
      structuredContent: serializeMcpMoment(moment),
    };
  },
});
