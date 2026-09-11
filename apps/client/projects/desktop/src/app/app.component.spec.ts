import { TestBed } from "@angular/core/testing";
import { PROMPT_MAX_BYTES } from "@factory/contracts/agent";
import { AgentService } from "./features/agents/agent.service";
import { AppComponent } from "./app.component";

describe("Agent example", () => {
  const ask = vi.fn<AgentService["ask"]>();

  beforeEach(async () => {
    ask.mockReset();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: AgentService, useValue: { ask } satisfies Pick<AgentService, "ask"> }],
    }).compileComponents();
  });

  async function submit() {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const textarea = element.querySelector("textarea")!;
    textarea.value = "Hello agent";
    textarea.dispatchEvent(new Event("input"));
    await fixture.whenStable();
    const event = new Event("submit", { bubbles: true, cancelable: true });
    element.querySelector("form")!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    await fixture.whenStable();
    return element;
  }

  it("sends the prompt through the interface and renders the answer", async () => {
    ask.mockResolvedValue("Hello from the agent");
    const element = await submit();
    expect(ask).toHaveBeenCalledExactlyOnceWith({ agent: "codex", prompt: "Hello agent" });
    expect(element.querySelector("pre")?.textContent).toBe("Hello from the agent");
  });

  it("shows backend errors and re-enables submission", async () => {
    ask.mockRejectedValue(new Error("CLI not installed"));
    const element = await submit();
    expect(element.querySelector('[role="alert"]')?.textContent).toBe("CLI not installed");
    expect(element.querySelector("button")?.disabled).toBe(false);
  });

  it("preserves form semantics and the selected agent through the shared controls", async () => {
    let finish!: (value: string) => void;
    const response = new Promise<string>((resolve) => {
      finish = resolve;
    });
    ask.mockReturnValue(response);
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const select = element.querySelector("lib-select select")! as HTMLSelectElement;
    const textarea = element.querySelector("lib-textarea textarea")! as HTMLTextAreaElement;
    const button = element.querySelector("lib-button button")! as HTMLButtonElement;
    const form = element.querySelector("form")!;

    expect(select.labels?.[0]?.textContent).toContain("Agent");
    expect(textarea.labels?.[0]?.textContent).toContain("Prompt");
    expect(textarea.required).toBe(true);
    expect(form.checkValidity()).toBe(false);
    expect(button.type).toBe("submit");

    select.value = "claude";
    select.dispatchEvent(new Event("change"));
    textarea.value = "Explain modules";
    textarea.dispatchEvent(new Event("input"));
    expect(form.checkValidity()).toBe(true);
    button.click();
    await fixture.whenStable();

    expect(ask).toHaveBeenCalledExactlyOnceWith({ agent: "claude", prompt: "Explain modules" });
    expect(select.disabled).toBe(true);
    expect(textarea.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain("Waiting for agent…");

    finish("Done");
    await response;
    await fixture.whenStable();
    expect(select.disabled).toBe(false);
    expect(textarea.disabled).toBe(false);
    expect(button.disabled).toBe(false);
    expect(button.textContent?.trim()).toBe("Send");
    expect(select.value).toBe("claude");
    expect(textarea.value).toBe("Explain modules");
    expect(element.querySelector("pre")?.textContent).toBe("Done");
  });

  it("prevents duplicate requests while waiting", async () => {
    let finish!: (value: string) => void;
    ask.mockReturnValue(
      new Promise<string>((resolve) => {
        finish = resolve;
      }),
    );
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.prompt.set("Hello");
    const first = fixture.componentInstance.send(new SubmitEvent("submit"));
    await fixture.componentInstance.send(new SubmitEvent("submit"));
    expect(ask).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.pending()).toBe(true);
    finish("Done");
    await first;
    expect(fixture.componentInstance.pending()).toBe(false);
  });

  it("counts the prompt in UTF-8 bytes, not UTF-16 units", async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const textarea = element.querySelector("textarea")!;

    // Four characters, but eight bytes: an attribute-based limit would miscount these.
    textarea.value = "\u00e4\u00f6\u00fc\u00df";
    textarea.dispatchEvent(new Event("input"));
    await fixture.whenStable();
    expect(fixture.componentInstance.promptBytes()).toBe(8);
    expect(fixture.componentInstance.overBudget()).toBe(false);

    textarea.value = "a".repeat(PROMPT_MAX_BYTES + 1);
    textarea.dispatchEvent(new Event("input"));
    await fixture.whenStable();
    expect(fixture.componentInstance.overBudget()).toBe(true);
    const button = element.querySelector("lib-button button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
