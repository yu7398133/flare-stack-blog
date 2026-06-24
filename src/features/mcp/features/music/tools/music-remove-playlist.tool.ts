import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import { defineMcpTool } from "../../../service/mcp-tool";
import {
  McpMusicRemovePlaylistInputSchema,
  McpMusicListOutputSchema,
} from "../schema/mcp-music.schema";
import { removePlaylist } from "../service/mcp-music.service";

const MUSIC_REMOVE_PLAYLIST_REQUIRED_SCOPES: OAuthScopeRequest = {
  "posts": ["write"],
};

export const musicRemovePlaylistTool = defineMcpTool({
  name: "music_remove_playlist",
  description:
    "Remove a Netease Cloud Music playlist ID from the music configuration.",
  requiredScopes: MUSIC_REMOVE_PLAYLIST_REQUIRED_SCOPES,
  inputSchema: McpMusicRemovePlaylistInputSchema,
  outputSchema: McpMusicListOutputSchema,
  async handler(args, context) {
    const result = await removePlaylist(context, args);

    return {
      content: [
        {
          type: "text",
          text: `Removed playlist "${args.playlistId}" from music configuration.\n${JSON.stringify(result, null, 2)}`,
        },
      ],
      structuredContent: result,
    };
  },
});
