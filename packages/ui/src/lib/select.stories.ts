import type { Meta, StoryObj } from "@storybook/angular-vite";

import { SelectComponent } from "./select.component";

const meta: Meta<SelectComponent> = {
  title: "UI/Select",
  component: SelectComponent,
  tags: ["autodocs"],
  args: {
    options: [
      { value: "codex", label: "Codex" },
      { value: "claude", label: "Claude Code" },
    ],
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<SelectComponent>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
