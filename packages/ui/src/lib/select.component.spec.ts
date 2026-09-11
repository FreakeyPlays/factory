import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SelectComponent } from "./select.component";

describe("SelectComponent", () => {
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    fixture.componentRef.setInput("options", [
      { value: "codex", label: "Codex" },
      { value: "claude", label: "Claude Code" },
    ]);
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render options from input", () => {
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll("option");
    expect(options.length).toBe(2);
    expect(options[0].value).toBe("codex");
    expect(options[0].textContent?.trim()).toBe("Codex");
    expect(options[1].value).toBe("claude");
    expect(options[1].textContent?.trim()).toBe("Claude Code");
  });

  it("should reflect disabled input on native select", async () => {
    fixture.componentRef.setInput("disabled", true);
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector("select");
    expect(select?.disabled).toBe(true);
  });

  it("should read value from native select and emit change", () => {
    const select = (fixture.nativeElement as HTMLElement).querySelector("select")!;
    let emitted = "";
    fixture.componentInstance.value.subscribe((val) => {
      emitted = val;
    });

    select.value = "claude";
    select.dispatchEvent(new Event("change"));
    expect(fixture.componentInstance.value()).toBe("claude");
    expect(emitted).toBe("claude");
  });

  it("should mark the option matching a programmatic value", async () => {
    fixture.componentRef.setInput("value", "claude");
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector("select")!;
    expect(select.value).toBe("claude");
  });
});
