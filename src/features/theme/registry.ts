// 主题注册表 — 列出所有可用主题及其路由级配置
export const themeNames = ["xinghui"] as const;
export type ThemeName = (typeof themeNames)[number];

/**
 * 未设置 THEME 环境变量时使用的回退主题。
 *
 * 必须是 themeNames 中真实存在的名字 —— vite.config.ts 用它构造
 * `@theme` 的 alias 路径，指向不存在的主题会让构建以 ENOENT 失败。
 * tsconfig.json 的 `@theme` paths 也必须与之一致（类型检查不读运行时
 * 环境变量，只能指向同一个默认主题）。
 */
export const DEFAULT_THEME: ThemeName = "xinghui";

/**
 * 路由级主题配置（viewTransition / pendingMs）
 * 通过 vite.config.ts 的 `define` 注入为全局常量 __THEME_CONFIG__
 */
export interface ThemeRouterConfig {
  viewTransition: boolean;
  pendingMs?: number;
}

export const themes: Record<ThemeName, ThemeRouterConfig> = {
  xinghui: {
    viewTransition: true,
    pendingMs: 0,
  },
};
