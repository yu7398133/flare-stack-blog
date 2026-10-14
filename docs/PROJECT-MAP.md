# 项目图谱（PROJECT-MAP）

> 目的：**一眼看懂这个博客的骨架，出问题时知道去哪找。**
>
> 这不是 API 手册，而是导航图。每节都给出「改这里会影响什么」。
> 配合 `docs/adr/`（架构决策原因）与 `docs/theme-guide.md`（主题开发）使用。

---

## 1. 一句话架构

**TanStack Start（React 19 SSR）跑在 Cloudflare Workers 上，数据存 D1（SQLite），
文件存 R2，缓存与限流靠 KV + Durable Object；部署由 GitHub Actions 在 push 到 main 时自动完成。**

```
浏览器
  │
  ├─ HTML 页面 ──→ Cloudflare Worker ──→ TanStack Router (SSR)
  │                                        └─ D1（内容） / R2（媒体） / KV（缓存）
  │
  └─ /mcp ─────→ OAuthProvider ──→ MCP Server（给 AI 客户端读写博客）
```

**技术栈与版本**（`package.json`）

| 层 | 选型 | 版本 |
|---|---|---|
| 框架 | TanStack Start + Router | `^1.168.6` |
| UI | React | `^19.2.6` |
| 运行时 | Cloudflare Workers + Wrangler | `^4.92.0` |
| 数据库 | Drizzle ORM + D1 | `^0.45.2` |
| 富文本 | Tiptap | `^3.20.0` |
| 构建 | Vite | `^7.1.7` |
| 独立 API | Hono | `^4.10.8` |
| 认证 | better-auth | `1.5.5` |
| 校验 | Zod | `^4.1.13` |
| i18n | Paraglide | — |
| 代码质量 | Biome（lint + format） | — |

---

## 2. 请求是怎么进来的（worker 入口）

**关键文件：`src/lib/worker/root-handler.ts`** — 所有请求的第一道分发。

```
请求进入
  │
  ├─ path 是 /mcp、/mcp/*、/oauth/*、/.well-known/*
  │     └─→ OAuthProvider.fetch() ─→ MCP Server
  │         （注意：这条路径**绕过** Hono 中间件栈）
  │
  └─ 其它所有路径
        └─→ appWorkerHandler.fetch()
              ├─ /api/admin/*  → Hono 路由（自带 adminGuardMiddleware）
              └─ 其余          → TanStack Router SSR
```

> ⚠️ **改动注意**：`root-handler.ts` 的判断顺序决定了 MCP 与博客页面谁先接管。
> 若要新增顶层路径，先确认它是否会被 OAuthProvider 的 `startsWith` 误吞。

---

## 3. 三个「防线的位置」（安全相关，最常查）

这个项目有**两套独立的鉴权机制**，混淆它们是最容易出事故的地方：

| 机制 | 位置 | 适用范围 | 怎么判断有没有保护 |
|---|---|---|---|
| `adminMiddleware` | `src/lib/middlewares.ts` | **server function**（`createServerFn`） | 搜 `.middleware([adminMiddleware])` |
| `adminGuardMiddleware` | `src/lib/hono/middlewares.ts` | **独立挂载的 Hono 路由** | 搜 `app.use(..., adminGuardMiddleware)` |

**为什么必须记住这一点**：server function 的中间件**不会**作用到 Hono 路由上。
`/api/admin/{photos,moments,projects}` 曾因此完全无鉴权（匿名可读写删生产数据），
现已修复并有回归测试守护：

- `src/features/admin-api-auth.integration.test.ts` — 真实请求验证 401/403/200
- `src/features/admin-api-auth.guard.test.ts` — 静态扫描，防止**新增 API 忘加鉴权**

> 📌 **新增任何 admin API 后**，上面的守卫测试会失败并指出文件——这是刻意的。

其它安全共识：

- 链接协议白名单：`src/lib/links/normalize-link-href.ts`（拒绝 `javascript:` 等）
- CSP 单一来源：`src/lib/csp.ts`（`src/routes/_public/route.tsx` 引用它）
- 限流：Durable Object `RATE_LIMITER`，见 `src/lib/do/rate-limiter.ts`

---

## 4. 数据流：内容存在哪、缓存怎么失效

```
作者在后台编辑
  │
  ├─ contentJson（Tiptap JSON）─→ D1 表 posts.contentJson
  │                                   │
  │                                   └─ 发布时快照 ─→ posts.publicContentJson
  │                                        （ADR-0002：公开内容与编辑内容分离）
  │
  └─ 发布动作 ─→ cache_version 自增 ─→ KV 缓存 key 失效 ─→ CDN 清除
```

**为什么要分离 `contentJson` 与 `publicContentJson`**：详见 `docs/adr/0002-separate-public-content-snapshots.md`。

| 要改什么 | 去哪 |
|---|---|
| 表结构 | `src/lib/db/schema/*.table.ts` → `bun db:generate` → `bun db:migrate` |
| 数据读写 | `src/features/<域>/data/*.data.ts` |
| 业务逻辑 | `src/features/<域>/service/*.service.ts` |
| 缓存 | `src/features/cache/` |

> ⚠️ **迁移是每次 push 都会跑生产库的**（见第 6 节），改动 schema 要单独提交、单独验证。

---

## 5. 功能域地图（改功能先看这里）

每个功能域都遵循同一套分层，**按层定位就不会迷路**：

```
src/features/<域>/
  ├─ api/        ← server function（前端调用的入口）
  ├─ service/    ← 业务逻辑
  ├─ data/       ← 数据库读写
  ├─ schema/     ← Zod 校验
  ├─ queries/    ← React Query 封装（前端缓存）
  ├─ hooks/      ← React hooks
  └─ components/ ← UI
```

| 功能域 | 职责 | 关键文件 |
|---|---|---|
| `posts` | 文章/说说、编辑器、版本快照 | `editor/config.ts`（Tiptap 扩展注册） |
| `media` | 图片视频上传、媒体库 | `service/media.service.ts` |
| `comments` | 评论、审核、AI 过滤 | `workflows/`（异步） |
| `moments` | 动态 | `api/hono/admin-moments.route.ts` |
| `photos` | 照片墙 | `api/hono/admin-photos.route.ts` |
| `projects` | 项目展示 | `api/hono/admin-projects.route.ts` |
| `friend-links` | 友链 + 邮件通知 | 限流 3 次/小时 |
| `import-export` | Markdown/HTML 导入导出 | `utils/markdown-*.ts` |
| `mcp` | 给 AI 客户端读写博客 | `api/mcp-api-handler.ts` |
| `theme` | 主题契约与实现 | `contract/` + `themes/xinghui/` |
| `config` | 站点配置 | `site-config.schema.ts` |
| `auth` / `oauth-clients` | 登录、OAuth | `lib/auth/` |
| `dashboard` / `ai` / `email` / `cache` | 辅助能力 | — |

---

## 6. 部署链路（push 之后发生了什么）

**关键：`git push origin main` 就是发布动作。**

```
push main
  │
  └─→ .github/workflows/deploy.yml
        │
        ├─【quality 门禁】bun ci → i18n:compile → lint → tsc → test
        │     └─ 任一步失败 ─→ 部署中止（不会污染线上）
        │
        └─ needs: quality 通过后
              ├─ bun run wrangler:prepare（生成 wrangler.jsonc）
              ├─ bun run build（generate-manifest + vite build）
              ├─ bun run deploy
              │     ├─ bun db:migrate  ⚠️ 直连生产 D1
              │     └─ wrangler deploy
              └─ CDN 缓存清除
```

**必须知道的三件事**：

1. **`bun run deploy` 内含 `db:migrate`** —— push 会执行生产库迁移。
   改 schema 时单独提交，便于出问题时回滚定位。
2. **构建需要 `THEME` 环境变量**。本地不设也能构建（会回落到默认主题并警告），
   线上由 GitHub Variable `vars.THEME` 提供。
3. **存在不可逆迁移**（`0001` 删列、`0005`/`0008` 删表）。`scripts/safe-d1-migrate/`
   有保护与幂等处理，但删数据的迁移仍需人工确认。

同步的 `ci.yml` 也在 push 到 main 时跑一遍 lint/tsc/test/build，作为第二道网。

---

## 7. 编辑器扩展：怎么加一个新的块级节点

**新增一个节点要同时改 3 个地方**（少改一处就会出现「编辑器能看、前台不显示」或「导不出去」）：

| # | 位置 | 作用 |
|---|---|---|
| 1 | `src/features/posts/editor/config.ts` | 注册节点 + 工具栏按钮 + 插入弹窗 |
| 2 | `.../theme/xinghui/components/content/content-renderer.tsx` | 前台渲染（`nodeMapping`） |
| 3 | `.../import-export/utils/markdown-{serializer,parser}.ts` | 导入导出往返 |

**已实现的节点**（可作模板）：

- 内置：段落、标题(1-4)、引用、代码块(Shiki)、表格、图片、行内/块级公式(KaTeX)
- 自定义：
  - `linkCard` — `editor/extensions/link-card/`（链接卡片）
  - `videoEmbed` — `editor/extensions/video/`（B站/YouTube 嵌入）

**加节点时容易踩的坑**：

- 序列化到 HTML 属性时**必须转义**（`escapeAttr`），否则标题里的 `"` 会截断属性，
  往返就丢数据 —— 有测试专门守这一点（`card-video-roundtrip.test.ts`）。
- 视频嵌入需要在 `src/lib/csp.ts` 的 `frame-src` 放行域名，
  并与 `parse-video-url.ts` 的 `VIDEO_EMBED_FRAME_SOURCES` **保持同步**。
- 解析器（`markdown-parser.ts`）用的是一份**独立的**扩展列表，
  新节点必须也加进去，否则导入时数据会被静默丢弃。

---

## 8. 快速定位表（按「我想做什么」查）

| 我想…… | 去哪 |
|---|---|
| 改页面样式 | `src/features/theme/themes/xinghui/styles/` |
| 改站点名/描述/社交链接 | 后台设置页，或 `src/features/config/` |
| 加一个 API | 参照同域 `api/` 下的 `.api.ts`，**记得挂 `adminMiddleware`** |
| 改数据库表 | `src/lib/db/schema/` → `bun db:generate` |
| 改编辑器行为 | `src/features/posts/editor/config.ts` |
| 加界面文案 | `messages/zh.json` + `messages/en.json` → `bun i18n:compile` |
| 查为什么这么设计 | `docs/adr/` |
| 改部署 | `.github/workflows/deploy.yml` |
| 看错误怎么处理 | `docs/error-handling-quickstart.md` |

---

## 9. 本地开发速查

```bash
bun dev              # 开发服务器（:3000）
bun run build        # 构建（不需要 THEME，会回落到默认主题）
bun typecheck        # tsc
bun lint             # biome lint（CI 门禁之一）
bun test             # 全量测试
bun test:node        # 仅 Node 环境单测（更快）
bun i18n:compile     # 改完 messages/*.json 必须执行
bun db:migrate:local # 本地库迁移
```

> 本机（NAS）**未安装 bun**，用 `npx` 替代：`npx vitest run`、`npx tsc --noEmit`、
> `./node_modules/@biomejs/biome/bin/biome check .`

---

## 10. 这个项目的「测试守护了什么」

测试不只是覆盖率，它们是**踩过的坑的纪念碑**。改相关代码前先看对应测试：

| 测试文件 | 守护什么 |
|---|---|
| `admin-api-auth.integration.test.ts` | admin 路由真的会 401/403（曾匿名可访问） |
| `admin-api-auth.guard.test.ts` | 新增 admin API 不会忘记加鉴权 |
| `normalize-link-href.test.ts` | 链接协议白名单（曾放过 `javascript:`） |
| `markdown-parser.test.ts` | 导入时危险协议被拒 |
| `card-video-roundtrip.test.ts` | 卡片/视频导出再导入不丢字段 |
| `parse-video-url.test.ts` | 视频链接解析正确且拒绝钓鱼域名 |
| `request-errors.test.ts` | 鉴权错误协议编解码对称 |
| `posts.integration.test.ts` | 文章 CRUD、快照、缓存失效 |
| `image-rewriter.test.ts` | 导出时图片路径改写 |
