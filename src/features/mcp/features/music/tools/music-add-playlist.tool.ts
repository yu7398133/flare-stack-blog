import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import { defineMcpTool } from "../../../service/mcp-tool";
import {
  McpMusicAddPlaylistInputSchema,
  McpMusicListOutputSchema,
} from "../schema/mcp-music.schema";
import { addPlaylist } from "../service/mcp-music.service";

const MUSIC_ADD_PLAYLIST_REQUIRED_SCOPES: OAuthScopeRequest = {
  "posts": ["write"],
};

export const musicAddPlaylistTool = defineMcpTool({
  name: "music_add_playlist",
  description:
    "Add a Netease Cloud Music playlist ID to the music configuration.",
  requiredScopes: MUSIC_ADD_PLAYLIST_REQUIRED_SCOPES,
  inputSchema: McpMusicAddPlaylistInputSchema,
  outputSchema: McpMusicListOutputSchema,
  async handler(args, context) {
    const result = await addPlaylist(context, args);

    return {
      content: [
        {
          type: "text",
          text: `Added playlist "${args.playlistId}" to music configuration.\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      structuredContent: result,
    };
  },
});
