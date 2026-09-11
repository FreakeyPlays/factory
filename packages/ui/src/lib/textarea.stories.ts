import type { Meta, StoryObj } from "@storybook/angular-vite";

import { TextareaComponent } from "./textarea.component";

const meta: Meta<TextareaComponent> = {
  title: "UI/Textarea",
  component: TextareaComponent,
  tags: ["autodocs"],
  args: {
    placeholder: "Explain what a Rust module is in two sentences.",
    rows: 4,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<TextareaComponent>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
