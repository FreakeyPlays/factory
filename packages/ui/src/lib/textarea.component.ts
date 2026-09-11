import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";

@Component({
  selector: "lib-textarea",
  template: `
    <textarea
      [disabled]="disabled()"
      [placeholder]="placeholder()"
      [required]="required()"
      [rows]="rows()"
      [attr.maxlength]="maxlength() ?? null"
      [value]="value()"
      (input)="onInput($event)"
      class="w-full rounded border p-3 disabled:opacity-50"
    ></textarea>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent {
  readonly placeholder = input<string>("");
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly rows = input<number>(4);
  readonly maxlength = input<number | null>(null);
  readonly value = model<string>("");

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }
}
