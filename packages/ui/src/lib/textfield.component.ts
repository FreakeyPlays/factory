import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";

@Component({
  selector: "lib-textfield",
  template: `
    <input
      [type]="type()"
      [disabled]="disabled()"
      [placeholder]="placeholder()"
      [required]="required()"
      [attr.maxlength]="maxlength() ?? null"
      [value]="value()"
      (input)="onInput($event)"
      class="w-full rounded border p-2 disabled:opacity-50"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextfieldComponent {
  readonly type = input<string>("text");
  readonly placeholder = input<string>("");
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly maxlength = input<number | null>(null);
  readonly value = model<string>("");

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
