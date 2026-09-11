import { defineConfig, mergeConfig } from "vite-plus";
import baseConfig from "../../vite.config.ts";

export default mergeConfig(
  baseConfig,
  defineConfig({
    run: {
      tasks: {
        sidecar: {
          command: "bun scripts/prepare-sidecar.ts",
          dependsOn: ["@factory/server#build"],
          env: ["TAURI_ENV_TARGET_TRIPLE"],
          output: ["src-tauri/sidecar/**"],
        },
        "tauri:check": {
          command: "vp run tauri:fmt && vp run tauri:lint && vp run tauri:test",
          dependsOn: ["@factory/client#sidecar"],
          cache: false,
        },
      },
    },
  }),
);
