import { definePreview } from "@storybook/angular-vite";
import addonVis from "storybook-addon-vis";

import "./styles.css";

const preview = definePreview({
  addons: [addonVis({ auto: true })],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
});

export default preview;
