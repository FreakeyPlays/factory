import type { Meta, StoryObj } from "@storybook/angular-vite";

import { TextfieldComponent } from "./textfield.component";

const meta: Meta<TextfieldComponent> = {
  title: "UI/Textfield",
  component: TextfieldComponent,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter text...",
    disabled: false,
    type: "text",
  },
};

export default meta;

type Story = StoryObj<TextfieldComponent>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
