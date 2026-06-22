import { Hono } from "hono";

const NETEASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Referer: "https://music.163.com/",
};

type SongResult = {
  id: string;
  name?: string;
  artist?: string;
  author?: string;
  cover?: string;
  pic?: string;
  url?: string;
  lrc?: string;
  error?: string;
  fee?: number;
};

/**
 * Fetch track IDs from a Netease playlist
 */
async function fetchPlaylistTrackIds(
  playlistId: string,
): Promise<string[]> {
  try {
    const res = await fetch(
      `https://music.163.com/api/playlist/detail?id=${playlistId}`,
      {
        headers: NETEASE_HEADERS,
        signal: AbortSignal.timeout(10000),
      },
    );
    const data = (await res.json()) as Record<string, unknown>;
    const result = data.result as Record<string, unknown> | undefined;
    const tracks = (result?.tracks ?? data.playlist?.tracks) as
      | Array<Record<string, unknown>>
      | undefined;

    if (!tracks || !Array.isArray(tracks)) {
      console.warn(`[api/music] Playlist ${playlistId}: no tracks found`);
      return [];
    }

    return tracks
      .map((t) => String(t.id ?? ""))
      .filter(Boolean);
  } catch (error) {
    console.error(
      `[api/music] Failed to fetch playlist ${playlistId}:`,
      error,
    );
    return [];
  }
}

/**
 * Fetch details for a single song by ID
 */
async function fetchSongDetail(songId: string): Promise<SongResult> {
  try {
    const [detailRes, lrcRes] = await Promise.all([
      fetch(
        `https://music.163.com/api/song/detail/?id=${songId}&ids=[${songId}]`,
        {
          headers: NETEASE_HEADERS,
          signal: AbortSignal.timeout(8000),
        },
      ),
      fetch(
        `https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`,
        {
          headers: NETEASE_HEADERS,
          signal: AbortSignal.timeout(8000),
        },
      ).catch(() => null),
    ]);

    const detail = await detailRes.json();
    const song = (detail as Record<string, unknown>).songs as
      | Array<Record<string, unknown>>
      | undefined;

    if (!song?.[0]) {
      return { id: songId, error: "not_found" };
    }

    const songData = song[0];
    const artists = songData.artists as
      | Array<Record<string, string>>
      | undefined;
    const album = songData.album as Record<string, unknown> | undefined;

    let lrcText = "";
    if (lrcRes && lrcRes.ok) {
      try {
        const lrcData = (await lrcRes.json()) as Record<string, unknown>;
        const lrc = lrcData.lrc as Record<string, string> | undefined;
        lrcText = lrc?.lyric || "";
      } catch {
        /* lyrics are optional */
      }
    }

    const artistName = artists?.[0]?.name || "未知歌手";

    return {
      id: songId,
      name: (songData.name as string) || "未知歌曲",
      artist: artistName,
      author: artistName,
      cover: (album?.picUrl as string) || "",
      pic: (album?.picUrl as string) || "",
      url: `https://music.163.com/song/media/outer/url?id=${songId}.mp3`,
      lrc: lrcText,
      fee: songData.fee as number,
    };
  } catch (error) {
    console.error(`[api/music] Failed to fetch song ${songId}:`, error);
    return { id: songId, error: String(error) };
  }
}

const musicRoute = new Hono<{ Bindings: Env }>().get("/", async (c) => {
  const ids = c.req.query("ids") ?? "";
  const playlistIds = c.req.query("playlistIds") ?? "";

  const directIds = ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  // Resolve playlists to track IDs
  let playlistTrackIds: string[] = [];
  if (playlistIds) {
    const pIds = playlistIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const results = await Promise.all(
      pIds.map((pid) => fetchPlaylistTrackIds(pid)),
    );
    playlistTrackIds = results.flat();
  }

  // Merge: playlist tracks first, then direct IDs (deduped)
  const seen = new Set<string>();
  const allIds: string[] = [];
  for (const id of [...playlistTrackIds, ...directIds]) {
    if (!seen.has(id)) {
      seen.add(id);
      allIds.push(id);
    }
  }

  if (allIds.length === 0) {
    return c.json({ error: "No valid song IDs or playlists" }, 400);
  }

  // Limit to 100 songs to prevent abuse
  const limitedIds = allIds.slice(0, 100);

  const results = await Promise.all(
    limitedIds.map((songId) => fetchSongDetail(songId)),
  );

  return c.json(results);
});

export default musicRoute;
