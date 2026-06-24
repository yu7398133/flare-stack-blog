import * as ConfigService from "@/features/config/service/config.service";
import type { McpToolContext } from "../../../service/mcp.types";

interface MusicSong {
  id: string;
  audioUrl?: string;
  vip?: boolean;
}

function normalizeSong(
  entry: string | { id: string; audioUrl?: string; vip?: boolean },
): MusicSong {
  if (typeof entry === "string") {
    return { id: entry };
  }
  return { id: entry.id, audioUrl: entry.audioUrl, vip: entry.vip };
}

export async function getMusicConfig(context: McpToolContext): Promise<{
  songs: MusicSong[];
  playlists: string[];
}> {
  const config = await ConfigService.getSiteConfig(context);
  const xinghui = config.theme.xinghui;
  const songs = (xinghui.musicIds ?? []).map(normalizeSong);
  const playlists = xinghui.musicPlaylistIds ?? [];
  return { songs, playlists };
}

export async function addSong(
  context: McpToolContext,
  input: { id: string; audioUrl?: string; vip?: boolean },
): Promise<{ songs: MusicSong[]; playlists: string[] }> {
  const systemConfig = await ConfigService.getSystemConfig(context);

  const musicIds =
    systemConfig.site?.theme?.xinghui?.musicIds?.map(normalizeSong) ?? [];

  // Check for duplicate
  if (musicIds.some((s) => s.id === input.id)) {
    throw new Error(`Song with ID "${input.id}" is already configured.`);
  }

  const newEntry: MusicSong = { id: input.id };
  if (input.audioUrl !== undefined) newEntry.audioUrl = input.audioUrl;
  if (input.vip !== undefined) newEntry.vip = input.vip;
  musicIds.push(newEntry);

  const updatedConfig = {
    ...systemConfig,
    site: {
      ...systemConfig.site,
      theme: {
        ...systemConfig.site?.theme,
        xinghui: {
          ...systemConfig.site?.theme?.xinghui,
          musicIds: musicIds as (
            | string
            | { id: string; audioUrl?: string; vip?: boolean }
          )[],
        },
      },
    },
  };

  await ConfigService.updateSystemConfig(context, updatedConfig);
  return { songs: musicIds, playlists: systemConfig.site?.theme?.xinghui?.musicPlaylistIds ?? [] };
}

export async function removeSong(
  context: McpToolContext,
  input: { id: string },
): Promise<{ songs: MusicSong[]; playlists: string[] }> {
  const systemConfig = await ConfigService.getSystemConfig(context);

  const musicIds =
    systemConfig.site?.theme?.xinghui?.musicIds?.map(normalizeSong) ?? [];

  const index = musicIds.findIndex((s) => s.id === input.id);
  if (index === -1) {
    throw new Error(`Song with ID "${input.id}" is not in the configuration.`);
  }

  musicIds.splice(index, 1);

  const updatedConfig = {
    ...systemConfig,
    site: {
      ...systemConfig.site,
      theme: {
        ...systemConfig.site?.theme,
        xinghui: {
          ...systemConfig.site?.theme?.xinghui,
          musicIds: musicIds as (
            | string
            | { id: string; audioUrl?: string; vip?: boolean }
          )[],
        },
      },
    },
  };

  await ConfigService.updateSystemConfig(context, updatedConfig);
  return { songs: musicIds, playlists: systemConfig.site?.theme?.xinghui?.musicPlaylistIds ?? [] };
}

export async function addPlaylist(
  context: McpToolContext,
  input: { playlistId: string },
): Promise<{ songs: MusicSong[]; playlists: string[] }> {
  const systemConfig = await ConfigService.getSystemConfig(context);

  const playlistIds =
    systemConfig.site?.theme?.xinghui?.musicPlaylistIds ?? [];

  if (playlistIds.includes(input.playlistId)) {
    throw new Error(
      `Playlist ID "${input.playlistId}" is already configured.`,
    );
  }

  const updatedPlaylistIds = [...playlistIds, input.playlistId];

  const updatedConfig = {
    ...systemConfig,
    site: {
      ...systemConfig.site,
      theme: {
        ...systemConfig.site?.theme,
        xinghui: {
          ...systemConfig.site?.theme?.xinghui,
          musicPlaylistIds: updatedPlaylistIds,
        },
      },
    },
  };

  await ConfigService.updateSystemConfig(context, updatedConfig);
  const songs =
    systemConfig.site?.theme?.xinghui?.musicIds?.map(normalizeSong) ?? [];
  return { songs, playlists: updatedPlaylistIds };
}

export async function removePlaylist(
  context: McpToolContext,
  input: { playlistId: string },
): Promise<{ songs: MusicSong[]; playlists: string[] }> {
  const systemConfig = await ConfigService.getSystemConfig(context);

  const playlistIds =
    systemConfig.site?.theme?.xinghui?.musicPlaylistIds ?? [];

  const index = playlistIds.indexOf(input.playlistId);
  if (index === -1) {
    throw new Error(
      `Playlist ID "${input.playlistId}" is not in the configuration.`,
    );
  }

  const updatedPlaylistIds = playlistIds.toSpliced(index, 1);

  const updatedConfig = {
    ...systemConfig,
    site: {
      ...systemConfig.site,
      theme: {
        ...systemConfig.site?.theme,
        xinghui: {
          ...systemConfig.site?.theme?.xinghui,
          musicPlaylistIds: updatedPlaylistIds,
        },
      },
    },
  };

  await ConfigService.updateSystemConfig(context, updatedConfig);
  const songs =
    systemConfig.site?.theme?.xinghui?.musicIds?.map(normalizeSong) ?? [];
  return { songs, playlists: updatedPlaylistIds };
}
