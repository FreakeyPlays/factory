import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ButtonComponent } from "./button.component";

describe("Button", () => {
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput("label", "Click me");
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render the label", () => {
    const button = (fixture.nativeElement as HTMLElement).querySelector("button");
    expect(button?.textContent?.trim()).toBe("Click me");
  });

  it("should reflect disabled state", async () => {
    fixture.componentRef.setInput("disabled", true);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector("button");
    expect(button?.disabled).toBe(true);
  });

  it("should reflect button type", async () => {
    fixture.componentRef.setInput("type", "submit");
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector("button");
    expect(button?.type).toBe("submit");
  });

  it("should default to outline styling", () => {
    const button = (fixture.nativeElement as HTMLElement).querySelector("button");
    expect(button?.className).toContain("border");
  });
});
