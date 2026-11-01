import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
  test: {
    environment: "node",
    // .mjs：scripts/check-random-images.mjs 是纯 JS 探活脚本，逻辑测试同目录同名
    include: [
      "src/**/*.test.ts",
      "scripts/**/*.test.ts",
      "scripts/**/*.test.mjs",
    ],
    exclude: ["**/*.integration.test.ts"],
  },
});
