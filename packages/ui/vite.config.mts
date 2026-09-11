import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { storybookAngularVitest } from "@storybook/angular-vite/vitest";
import { storybookVis } from "storybook-addon-vis/vitest-plugin";
import { defineConfig, defineProject } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

const dirname = import.meta.dirname;
const storybookConfigDir = `${dirname}/.storybook`;

export default defineConfig({
  test: {
    coverage: {
      exclude: [".storybook/**", "src/**/*.stories.ts"],
    },
    projects: [
      defineProject({
        root: dirname,
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            screenshotFailures: false,
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
        plugins: [
          storybookAngularVitest(),
          storybookTest({
            configDir: storybookConfigDir,
          }),
          storybookVis({
            snapshotRootDir: ({ platform }) => `${storybookConfigDir}/__vis__/${platform}`,
          }),
        ],
      }),
    ],
  },
});
