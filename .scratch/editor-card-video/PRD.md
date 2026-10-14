# PRD：编辑器卡片与视频嵌入

Status: Done

## 背景

blog 的 Tiptap 编辑器此前只有段落、标题、引用、代码块、表格、图片、公式，
**没有卡片和视频能力**（blog2 有，但那是另一套 Markdown 组件实现，无法直接复用）。

作者需要在文章里插入：

1. **链接卡片** —— 比裸链接更醒目的推荐位（emoji + 标题 + 描述 + 链接）
2. **视频嵌入** —— B站 / YouTube 外链播放

## 范围

**做**：

- `linkCard` 块级节点（attrs：emoji / title / description / href / site）
- `videoEmbed` 块级节点（attrs：src / provider / videoId / title）
- 工具栏两个按钮 + 独立插入弹窗
- 前台渲染（`content-renderer` 的 `nodeMapping`）
- Markdown 导入导出无损往返
- CSP `frame-src` 放行播放器域名（仅 B站 / YouTube）
- 中英文文案

**不做**（明确排除）：

- 自托管视频上传（占 R2 与带宽）
- 卡片拖拽排序、卡片主题化配置
- 除 B站/YouTube 外的视频平台

## 设计要点

### 为什么新增独立弹窗而不是扩展既有 `InsertModal`

既有 `InsertModal` 承担 LINK/IMAGE，且与媒体库选择器耦合。
卡片/视频只需几个纯文本字段，混进去会让两条流程互相牵制。
故新建 `insert-card-video-modal.tsx`。

### 为什么卡片视图与前台组件分开写

编辑器视图含编辑/删除操作，前台组件只做展示。
复用会导致管理端交互被打进公开页面，且难以分别优化。

### 安全设计

- **链接协议白名单**：卡片的 href 走 `normalizeLinkHref`（与正文链接同一套规则），
  拒绝 `javascript:` / `data:` 等伪协议。
- **视频链接解析白名单**：`parseVideoUrl` 用域名后缀**精确匹配**
  （`host === suffix || host.endsWith("." + suffix)`），
  因此 `bilibili.com.evil.com` 这类钓鱼域名会被拒绝。
- **解析失败不插入**：避免生成指向无效地址的 iframe（白屏）。
- **CSP 最小放开**：`frame-src` 只列播放器域名，而非整个 `https:`。
- **HTML 属性转义**：序列化时 `escapeAttr`，防止标题里的 `"` 截断属性。

### 三个接线点（少改一处就会出现半残功能）

| # | 文件 | 作用 |
|---|---|---|
| 1 | `src/features/posts/editor/config.ts` | 注册节点 + 工具栏 + 弹窗 |
| 2 | `.../xinghui/components/content/content-renderer.tsx` | 前台渲染 |
| 3 | `.../import-export/utils/markdown-{serializer,parser}.ts` | 导入导出 |

> 特别提醒：`markdown-parser.ts` 使用的是一份**独立**的扩展列表，
> 新节点必须也加进去，否则导入时数据被静默丢弃。

## 验收证据

| 项 | 结果 |
|---|---|
| 视频解析测试 | `parse-video-url.test.ts` 22 个通过（含伪协议、钓鱼域名、缺 id 拒绝） |
| 往返测试 | `card-video-roundtrip.test.ts` 12 个通过（含转义、emoji、HTML 注入） |
| 测试有效性验证 | 故意移除 `escapeAttr` → 2 个转义测试精确失败（证明测试非空转） |
| 类型检查 | `tsc --noEmit` 0 错误 |
| 代码规范 | `biome check` 0 问题 |
| 构建 | `vite build` 成功 |
| 全量测试 | 382 个通过（node 190 + 集成 192） |

## 后续可选项

- 视频支持更多平台（需同步 `parse-video-url.ts` 与 `csp.ts` 的 `frame-src`）
- 卡片支持 OG 元数据自动抓取（当前需手填标题/描述）
