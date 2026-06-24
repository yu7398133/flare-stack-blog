import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import { defineMcpTool } from "../../../service/mcp-tool";
import {
  McpMusicRemoveSongInputSchema,
  McpMusicListOutputSchema,
} from "../schema/mcp-music.schema";
import { removeSong } from "../service/mcp-music.service";

const MUSIC_REMOVE_SONG_REQUIRED_SCOPES: OAuthScopeRequest = {
  "posts": ["write"],
};

export const musicRemoveSongTool = defineMcpTool({
  name: "music_remove_song",
  description:
    "Remove a Netease Cloud Music song ID from the music configuration.",
  requiredScopes: MUSIC_REMOVE_SONG_REQUIRED_SCOPES,
  inputSchema: McpMusicRemoveSongInputSchema,
  outputSchema: McpMusicListOutputSchema,
  async handler(args, context) {
    const result = await removeSong(context, args);

    return {
      content: [
        {
          type: "text",
          text: `Removed song "${args.id}" from music configuration.\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      structuredContent: result,
    };
  },
});
