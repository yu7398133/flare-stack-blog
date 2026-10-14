/**
 * 站点唯一的 CSP 定义来源。
 *
 * 此前同一份策略在两处各写一遍（src/lib/hono/middlewares.ts 的
 * cspMiddleware 与 src/routes/_public/route.tsx 的 headers），且已经漂移：
 * 路由那份缺少 style-src-elem，font-src 也少了两个域名，实际生效的是
 * 中间件那份（线上响应可证）。路由那份是死代码。
 *
 * 任何改动都只改这里，两处引用者自动同步。
 */
export const CSP_DIRECTIVES = [
  "default-src 'self'",
  // unsafe-inline：TanStack Start 的 SSR 会在 HTML 中内联启动脚本与
  // 流式渲染所需的 script，移除会导致首屏白屏。改用 nonce 需要 SSR
  // 框架配合，属后续专项。
  // unsafe-eval：全仓已无 eval()/new Function 调用，保留仅为第三方
  // 运行时兜底；如确认无影响可再收紧。
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://music-resolver.chenyusc.eu.org https://ncmusic-api.chenyusc.eu.org",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' https://fonts.gstatic.com https://fonts.gstatic.font.im https://cdn.jsdelivr.net data:",
  "connect-src 'self' https: wss:",
  "media-src 'self' https: http:",
  // 视频嵌入节点需要 iframe。只放开受支持的播放器域名，而不是整个 https:
  // ——后者会让 frame-src 失去意义。此处必须与
  // src/features/posts/editor/extensions/video/parse-video-url.ts 的
  // VIDEO_EMBED_FRAME_SOURCES 保持一致，改一处就要改另一处。
  "frame-src https://player.bilibili.com https://www.youtube-nocookie.com https://www.youtube.com",
].join("; ");
