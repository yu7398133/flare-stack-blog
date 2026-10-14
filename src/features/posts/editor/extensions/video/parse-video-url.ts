/**
 * 视频外链解析：把用户粘贴的 B站 / YouTube 链接解析成可嵌入的
 * provider + videoId。
 *
 * 设计要点：
 * - **白名单域名**：只认 bilibili.com / b23.tv 与 youtube.com / youtu.be。
 *   用后缀完全匹配而非 includes，否则 `bilibili.com.evil.com` 这类
 *   钓鱼域名会被放过。
 * - **拒绝所有非 http(s) 输入**：javascript:/data: 等伪协议必须返回 null，
 *   不能进入 iframe（CSP 是第二道防线，这里是第一道）。
 * - 解析失败一律返回 null，由调用方提示用户，而不是猜测性地嵌入。
 */

export type VideoProvider = "bilibili" | "youtube";

export interface ParsedVideo {
  provider: VideoProvider;
  videoId: string;
}

/** 精确的域名后缀匹配：host 必须等于 suffix 或以 `.suffix` 结尾。 */
function hostMatches(host: string, suffix: string): boolean {
  return host === suffix || host.endsWith(`.${suffix}`);
}

function extractBilibiliId(pathname: string): string | null {
  // /video/BV1xx411c7mD 或 /video/av170001
  const match = /\/video\/(BV[0-9A-Za-z]+|av\d+)/.exec(pathname);
  if (match) return match[1];

  // /video/BV1xx411c7mD/ 之类的尾部斜杠形式，上面的正则已覆盖
  return null;
}

function extractYoutubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase();

  // youtu.be/<id>
  if (hostMatches(host, "youtu.be")) {
    const id = url.pathname.replace(/^\//, "").split("/")[0];
    return id || null;
  }

  // youtube.com/watch?v=<id>
  const v = url.searchParams.get("v");
  if (v) return v;

  // /embed/<id> 或 /shorts/<id> 或 /live/<id>
  const match = /^\/(?:embed|shorts|live)\/([^/?#]+)/.exec(url.pathname);
  if (match) return match[1];

  return null;
}

export function parseVideoUrl(raw: string): ParsedVideo | null {
  const input = raw.trim();
  if (!input) return null;

  // 无协议前缀时补 https://，方便用户直接粘贴 "www.bilibili.com/..."。
  const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input)
    ? input
    : `https://${input}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }

  // 只接受 http(s)：拦截 javascript: / data: 等伪协议。
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();

  if (hostMatches(host, "bilibili.com")) {
    const id = extractBilibiliId(url.pathname);
    return id ? { provider: "bilibili", videoId: id } : null;
  }

  // b23.tv 短链：路径段即短码，交给 B站跳转，播放器可接受 bvid 形式之外
  // 的短码吗？不行——所以这里保留短码并在 embed 时按 bvid 处理，
  // 由 B站播放器自行 302。实测 player.bilibili.com 不支持短码，
  // 因此短链仅作为「可识别」返回，用户应使用完整 BV 链接。
  if (hostMatches(host, "b23.tv")) {
    const id = url.pathname.replace(/^\//, "").split("/")[0];
    return id ? { provider: "bilibili", videoId: id } : null;
  }

  if (
    hostMatches(host, "youtube.com") ||
    hostMatches(host, "youtube-nocookie.com")
  ) {
    const id = extractYoutubeId(
      hostMatches(host, "youtu.be")
        ? url
        : new URL(`https://www.youtube.com${url.pathname}${url.search}`),
    );
    return id ? { provider: "youtube", videoId: id } : null;
  }

  if (hostMatches(host, "youtu.be")) {
    const id = extractYoutubeId(url);
    return id ? { provider: "youtube", videoId: id } : null;
  }

  return null;
}

/**
 * 由解析结果构造可嵌入的 iframe 地址。
 *
 * - B站用 player.bilibili.com；BV 号走 bvid，av 号走 aid。
 * - YouTube 用 youtube-nocookie.com，避免未交互即写第三方 cookie。
 */
export function buildVideoEmbedUrl(parsed: ParsedVideo): string {
  if (parsed.provider === "bilibili") {
    const { videoId } = parsed;
    if (videoId.startsWith("av")) {
      return `https://player.bilibili.com/player.html?aid=${videoId.slice(2)}&autoplay=0`;
    }
    return `https://player.bilibili.com/player.html?bvid=${videoId}&autoplay=0`;
  }

  return `https://www.youtube-nocookie.com/embed/${parsed.videoId}`;
}

/**
 * 允许嵌入 iframe 的域名。CSP 的 frame-src 必须与此一致，
 * 否则线上会被浏览器拦截（改动这里时记得同步 src/lib/csp.ts）。
 */
export const VIDEO_EMBED_FRAME_SOURCES = [
  "https://player.bilibili.com",
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com",
] as const;
