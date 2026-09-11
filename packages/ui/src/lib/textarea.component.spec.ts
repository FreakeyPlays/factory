import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TextareaComponent } from "./textarea.component";

describe("TextareaComponent", () => {
  let fixture: ComponentFixture<TextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
    fixture.componentRef.setInput("placeholder", "Enter prompt...");
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render placeholder and rows", async () => {
    fixture.componentRef.setInput("rows", 6);
    await fixture.whenStable();
    const textarea = (fixture.nativeElement as HTMLElement).querySelector("textarea");
    expect(textarea?.placeholder).toBe("Enter prompt...");
    expect(textarea?.rows).toBe(6);
  });

  it("should reflect disabled state", async () => {
    fixture.componentRef.setInput("disabled", true);
    await fixture.whenStable();
    const textarea = (fixture.nativeElement as HTMLElement).querySelector("textarea");
    expect(textarea?.disabled).toBe(true);
  });

  it("should read value from native textarea and emit change", () => {
    const textarea = (fixture.nativeElement as HTMLElement).querySelector("textarea")!;
    let emitted = "";
    fixture.componentInstance.value.subscribe((val) => {
      emitted = val;
    });

    textarea.value = "Explain Rust modules";
    textarea.dispatchEvent(new Event("input"));
    expect(fixture.componentInstance.value()).toBe("Explain Rust modules");
    expect(emitted).toBe("Explain Rust modules");
  });

  it("should render a programmatic value into the native textarea", async () => {
    fixture.componentRef.setInput("value", "set from the parent");
    await fixture.whenStable();
    const textarea = (fixture.nativeElement as HTMLElement).querySelector("textarea");
    expect(textarea?.value).toBe("set from the parent");
  });

  it("should reflect maxlength attribute", async () => {
    fixture.componentRef.setInput("maxlength", 100);
    await fixture.whenStable();
    const textarea = (fixture.nativeElement as HTMLElement).querySelector("textarea");
    expect(textarea?.getAttribute("maxlength")).toBe("100");
  });
});
