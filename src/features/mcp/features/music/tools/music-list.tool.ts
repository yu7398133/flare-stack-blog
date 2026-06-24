import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import { defineMcpTool } from "../../../service/mcp-tool";
import { McpMusicListOutputSchema } from "../schema/mcp-music.schema";
import { getMusicConfig } from "../service/mcp-music.service";

const MUSIC_LIST_REQUIRED_SCOPES: OAuthScopeRequest = {
  "posts": ["write"],
};

export const musicListTool = defineMcpTool({
  name: "music_list",
  description:
    "List current music configuration including individual song entries and playlist IDs.",
  requiredScopes: MUSIC_LIST_REQUIRED_SCOPES,
  outputSchema: McpMusicListOutputSchema,
  handler: async (context) => {
    const result = await getMusicConfig(context);

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
