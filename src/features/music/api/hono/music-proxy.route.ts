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

  const customUrl = c.req.query("url");
  const url = customUrl
    ? decodeURIComponent(customUrl)
    : `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;
  const rangeHeader = c.req.header("range");

  try {
    const fetchHeaders: Record<string, string> = {
      ...NETEASE_HEADERS,
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    // Follow redirects manually, converting HTTP to HTTPS
    let currentUrl = url;
    let res: Response | null = null;
    for (let i = 0; i < 5; i++) {
      res = await fetch(currentUrl, {
        headers: fetchHeaders,
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) break;
        currentUrl = location.startsWith("http")
          ? location
          : new URL(location, currentUrl).href;
        if (currentUrl.startsWith("http://")) {
          currentUrl = currentUrl.replace("http://", "https://");
        }
        continue;
      }
      break;
    }

    if (!res || (!res.ok && res.status !== 206)) {
      return c.text("Failed to fetch audio", 502);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      return c.text("Failed to fetch audio", 502);
    }

    const contentLength = res.headers.get("content-length");
    const contentRange = res.headers.get("content-range");

    const headers: Record<string, string> = {
      "Content-Type": contentType || "audio/mpeg",
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
    };

    if (contentLength) {
      headers["Content-Length"] = contentLength;
    }
    if (contentRange) {
      headers["Content-Range"] = contentRange;
    }

    return new Response(res.body, {
      status: rangeHeader ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error(`[api/music/proxy] Failed to proxy song ${songId}:`, error);
    return c.text("Audio proxy error", 502);
  }
});

export default musicProxyRoute;
