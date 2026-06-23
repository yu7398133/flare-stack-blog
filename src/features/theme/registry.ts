// 主题注册表 — 列出所有可用主题及其路由级配置
export const themeNames = ["xinghui"] as const;
export type ThemeName = (typeof themeNames)[number];

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
