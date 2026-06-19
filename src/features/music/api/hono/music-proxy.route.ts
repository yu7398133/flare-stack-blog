import { Hono } from "hono";

const NETEASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Referer: "https://music.163.com/",
};

const musicProxyRoute = new Hono<{ Bindings: Env }>().get("/:id", async (c) => {
  const songId = c.req.param("id");
  if (!songId) {
    return c.text("Missing song ID", 400);
  }

  const url = `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;

  try {
    const res = await fetch(url, {
      headers: NETEASE_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return c.text("Failed to fetch audio", 502);
    }

    const contentType = res.headers.get("content-type") || "audio/mpeg";
    const contentLength = res.headers.get("content-length");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
    };

    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }

    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(`[api/music/proxy] Failed to proxy song ${songId}:`, error);
    return c.text("Audio proxy error", 502);
  }
});

export default musicProxyRoute;
