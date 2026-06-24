import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import { defineMcpTool } from "../../../service/mcp-tool";
import {
  McpMusicAddSongInputSchema,
  McpMusicListOutputSchema,
} from "../schema/mcp-music.schema";
import { addSong } from "../service/mcp-music.service";

const MUSIC_ADD_SONG_REQUIRED_SCOPES: OAuthScopeRequest = {
  "posts": ["write"],
};

export const musicAddSongTool = defineMcpTool({
  name: "music_add_song",
  description:
    "Add a Netease Cloud Music song ID to the music configuration.",
  requiredScopes: MUSIC_ADD_SONG_REQUIRED_SCOPES,
  inputSchema: McpMusicAddSongInputSchema,
  outputSchema: McpMusicListOutputSchema,
  async handler(args, context) {
    const result = await addSong(context, args);

    return {
      content: [
        {
          type: "text",
          text: `Added song "${args.id}" to music configuration.\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      structuredContent: result,
    };
  },
});
