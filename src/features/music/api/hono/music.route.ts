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
};

const musicRoute = new Hono<{ Bindings: Env }>().get("/", async (c) => {
  const ids = c.req.query("ids");
  if (!ids) {
    return c.json({ error: "Missing ids parameter" }, 400);
  }

  const songIds = ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (songIds.length === 0) {
    return c.json({ error: "No valid song IDs" }, 400);
  }

  // Limit to 50 songs to prevent abuse
  const limitedIds = songIds.slice(0, 50);

  const results: SongResult[] = await Promise.all(
    limitedIds.map(async (songId): Promise<SongResult> => {
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
        };
      } catch (error) {
        console.error(`[api/music] Failed to fetch song ${songId}:`, error);
        return { id: songId, error: String(error) };
      }
    }),
  );

  return c.json(results);
});

export default musicRoute;
