import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

export type ButtonType = "button" | "submit" | "reset";
export type ButtonVariant = "secondary" | "outline";

@Component({
  selector: "lib-button",
  template: `
    <button [type]="type()" [disabled]="disabled()" [class]="classes()">
      {{ label() }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly label = input.required<string>();
  readonly type = input<ButtonType>("button");
  readonly disabled = input<boolean>(false);
  readonly variant = input<ButtonVariant>("outline");

  protected readonly classes = computed(() => {
    const base = "w-full rounded disabled:opacity-50";
    switch (this.variant()) {
      case "outline":
        return `${base} border px-4 py-2`;
      case "secondary":
        return `${base} bg-gray-600 px-3 py-1.5 text-white`;
    }
  });
}
