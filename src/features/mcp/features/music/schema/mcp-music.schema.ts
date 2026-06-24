import { z } from "zod";

export const McpMusicSongSchema = z.object({
  id: z.string().describe("Netease Cloud Music song ID."),
  audioUrl: z
    .string()
    .optional()
    .describe("Custom audio URL override, if present."),
  vip: z
    .boolean()
    .optional()
    .describe("Whether the song requires Netease VIP."),
});

export const McpMusicAddSongInputSchema = z.object({
  id: z.string().min(1).describe("Netease Cloud Music song ID to add."),
  audioUrl: z
    .string()
    .optional()
    .describe("Optional custom audio URL override."),
  vip: z
    .boolean()
    .optional()
    .describe("Whether this song requires Netease VIP."),
});

export const McpMusicRemoveSongInputSchema = z.object({
  id: z.string().min(1).describe("Netease Cloud Music song ID to remove."),
});

export const McpMusicAddPlaylistInputSchema = z.object({
  playlistId: z
    .string()
    .min(1)
    .describe("Netease Cloud Music playlist ID to add."),
});

export const McpMusicRemovePlaylistInputSchema = z.object({
  playlistId: z
    .string()
    .min(1)
    .describe("Netease Cloud Music playlist ID to remove."),
});

export const McpMusicListOutputSchema = z.object({
  songs: z
    .array(McpMusicSongSchema)
    .describe("Configured individual song entries."),
  playlists: z
    .array(z.string())
    .describe("Configured Netease playlist IDs."),
});
