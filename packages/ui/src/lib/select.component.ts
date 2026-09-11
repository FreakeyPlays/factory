import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: "lib-select",
  template: `
    <select
      [disabled]="disabled()"
      (change)="onChange($event)"
      class="w-full rounded border p-2 disabled:opacity-50"
    >
      @for (option of options(); track option.value) {
        <option [value]="option.value" [selected]="option.value === value()">
          {{ option.label }}
        </option>
      }
    </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent {
  readonly options = input<readonly SelectOption[]>([]);
  readonly disabled = input<boolean>(false);
  readonly value = model<string>("");

  protected onChange(event: Event): void {
    this.value.set((event.target as HTMLSelectElement).value);
  }
}
