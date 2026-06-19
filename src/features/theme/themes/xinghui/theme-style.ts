import type { CSSProperties } from "react";
import type { SiteConfig } from "@/features/config/site-config.schema";

/**
 * Xinghui theme — Glassmorphism style CSS custom properties.
 */
export function getXinghuiThemeStyle(_siteConfig: SiteConfig): CSSProperties {
  return {
    "--xh-glass-bg": "rgba(255, 255, 255, 0.4)",
    "--xh-glass-bg-dark": "rgba(30, 41, 59, 0.5)",
    "--xh-glass-border": "rgba(255, 255, 255, 0.4)",
    "--xh-glass-border-dark": "rgba(255, 255, 255, 0.1)",
    "--xh-blur": "12px",
    "--xh-radius": "1.5rem",
    "--xh-radius-sm": "0.75rem",
    "--xh-shadow": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "--xh-primary": "#6366f1",
    "--xh-primary-light": "#818cf8",
    "--xh-accent": "#a78bfa",
  } as CSSProperties;
}
