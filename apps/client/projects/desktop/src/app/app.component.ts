import { Component, computed, inject, signal } from "@angular/core";
import { Agent, PROMPT_MAX_BYTES } from "@factory/contracts/agent";
import { toAgentRequest } from "@factory/shared/agent";
import { ButtonComponent, SelectComponent, TextareaComponent } from "@factory/ui";
import { AgentService } from "./features/agents/agent.service";

/** Display names for the agents the contract defines; the record type keeps this list complete. */
const AGENT_LABELS: Record<Agent, string> = { codex: "Codex", claude: "Claude Code" };

const encoder = new TextEncoder();
const format = (bytes: number) => bytes.toLocaleString("en-US");

@Component({
  selector: "app-root",
  imports: [ButtonComponent, SelectComponent, TextareaComponent],
  templateUrl: "./app.component.html",
  styles: [],
})
export class AppComponent {
  private readonly agents = inject(AgentService);
  readonly choices = Agent.literals.map((agent) => ({ value: agent, label: AGENT_LABELS[agent] }));

  readonly pending = signal(false);
  readonly answer = signal("");
  readonly error = signal("");
  readonly agent = signal<string>(Agent.literals[0]);
  readonly prompt = signal("");

  readonly promptBytes = computed(() => encoder.encode(this.prompt()).length);
  readonly overBudget = computed(() => this.promptBytes() > PROMPT_MAX_BYTES);
  readonly budget = computed(
    () => `${format(this.promptBytes())} of ${format(PROMPT_MAX_BYTES)} bytes`,
  );

  async send(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.pending()) {
      return;
    }
    this.pending.set(true);
    this.answer.set("");
    this.error.set("");
    try {
      this.answer.set(await this.agents.ask(toAgentRequest(this.agent(), this.prompt())));
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.pending.set(false);
    }
  }
}
