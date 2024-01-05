import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";
import path from "path";
export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      globals: true,
      restoreMocks: true,
      environment: "jsdom",
    },
  })
);
