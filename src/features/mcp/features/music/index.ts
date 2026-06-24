import type { McpToolDefinition } from "../../service/mcp-tool";
import { musicAddPlaylistTool } from "./tools/music-add-playlist.tool";
import { musicAddSongTool } from "./tools/music-add-song.tool";
import { musicListTool } from "./tools/music-list.tool";
import { musicRemovePlaylistTool } from "./tools/music-remove-playlist.tool";
import { musicRemoveSongTool } from "./tools/music-remove-song.tool";

export const mcpMusicTools: McpToolDefinition[] = [
  musicListTool,
  musicAddSongTool,
  musicRemoveSongTool,
  musicAddPlaylistTool,
  musicRemovePlaylistTool,
];
