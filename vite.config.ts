import fs from "node:fs";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { z } from "zod";
import packageJson from "./package.json";

import {
  DEFAULT_THEME,
  themeNames,
  themes,
} from "./src/features/theme/registry";

const buildEnvSchema = z.object({
  // 回退值必须是注册表里真实存在的主题名。曾写作 "default"，
  // 但 registry 中并无该主题 → @theme alias 指向不存在的目录，
  // 未设 THEME 时构建必然失败（ENOENT themes/default）。
  //
  // .catch() 同时覆盖"未设置"与"设了非法值"两种情况：都回退到
  // DEFAULT_THEME，并在下面显式告知，避免静默使用意外的主题。
  THEME: z.enum(themeNames).catch(DEFAULT_THEME),
});

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const buildEnv = buildEnvSchema.parse(env);

  // 显式提示回退，不静默。CI 里没有这条日志也能跑，但排查主题相关问题时
  // 能直接看出"为什么构建用的是 xinghui"。
  const requestedTheme = env.THEME?.trim();
  if (requestedTheme && requestedTheme !== buildEnv.THEME) {
    console.warn(
      `[theme] THEME="${requestedTheme}" 不是已注册主题，已回退到 "${buildEnv.THEME}"。` +
        `可用主题：${themeNames.join(", ")}。`,
    );
  }

  const themeDir = path.resolve(
    __dirname,
    `src/features/theme/themes/${buildEnv.THEME}`,
  );

  // 早失败：主题目录不存在时抛出具名错误，而不是让 rollup 报
  // 一句难懂的 "Could not load .../themes/xxx: ENOENT"。
  if (!fs.existsSync(themeDir)) {
    throw new Error(
      `THEME="${buildEnv.THEME}" 在 src/features/theme/themes/ 下不存在。` +
        `可用主题：${themeNames.join(", ")}。` +
        `请设置 THEME 环境变量，或检查 src/features/theme/registry.ts。`,
    );
  }

  return {
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
      __THEME_NAME__: JSON.stringify(buildEnv.THEME),
      __THEME_CONFIG__: JSON.stringify(themes[buildEnv.THEME]),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@theme": themeDir,
      },
    },
    plugins: [
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        strategy: ["cookie", "preferredLanguage", "baseLocale"],
        cookieName: "LOCALE",
      }),
      cloudflare({
        viteEnvironment: {
          name: "ssr",
        },
      }),
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      devtools(),
      tanstackStart({
        importProtection: {
          enabled: false,
        },
      }),
      viteReact(),
    ],
  };
});

export default config;
