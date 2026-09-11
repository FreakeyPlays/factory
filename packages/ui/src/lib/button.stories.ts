import type { Meta, StoryObj } from "@storybook/angular-vite";

import { ButtonComponent } from "./button.component";

const meta: Meta<ButtonComponent> = {
  title: "UI/Button",
  component: ButtonComponent,
  tags: ["autodocs"],
  args: {
    label: "Button",
  },
};

export default meta;

type Story = StoryObj<ButtonComponent>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Disabled: Story = {
  args: { disabled: true, label: "Waiting for agent…" },
};

export const LongLabel: Story = {
  args: {
    label: "A considerably longer button label",
  },
};
