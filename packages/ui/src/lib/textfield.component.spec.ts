import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TextfieldComponent } from "./textfield.component";

describe("TextfieldComponent", () => {
  let fixture: ComponentFixture<TextfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextfieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextfieldComponent);
    fixture.componentRef.setInput("placeholder", "Search...");
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render placeholder and type", async () => {
    fixture.componentRef.setInput("type", "email");
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector("input");
    expect(input?.placeholder).toBe("Search...");
    expect(input?.type).toBe("email");
  });

  it("should reflect disabled state", async () => {
    fixture.componentRef.setInput("disabled", true);
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector("input");
    expect(input?.disabled).toBe(true);
  });

  it("should read value from native input and emit change", () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector("input")!;
    let emitted = "";
    fixture.componentInstance.value.subscribe((val) => {
      emitted = val;
    });

    input.value = "test input";
    input.dispatchEvent(new Event("input"));
    expect(fixture.componentInstance.value()).toBe("test input");
    expect(emitted).toBe("test input");
  });

  it("should render a programmatic value into the native input", async () => {
    fixture.componentRef.setInput("value", "set from the parent");
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector("input");
    expect(input?.value).toBe("set from the parent");
  });
});
