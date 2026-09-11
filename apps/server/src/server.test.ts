import type { Subprocess } from "bun";
import { chmod, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { AGENT_ENDPOINT, PROMPT_MAX_BYTES, PROMPT_RANGE_MESSAGE } from "@factory/contracts/agent";

const modes = [
  { shutdown: "signal", watch: false },
  { shutdown: "stdin", watch: false },
  { shutdown: "eof", watch: false },
  ...(process.env["FACTORY_SERVER_EXE"] ? [] : [{ shutdown: "signal", watch: true }]),
];

describe.each(modes)("HTTP server (shutdown: $shutdown, watch: $watch)", ({ shutdown, watch }) => {
  const sidecar = shutdown !== "signal";
  let child: Subprocess<"pipe", "pipe", "pipe">;
  let directory: string;
  let url: string;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "factory-server-"));
    // A deterministic installed CLI replacement; tests never invoke a real agent.
    await Bun.write(
      join(directory, "codex"),
      `#!/usr/bin/env bun
const prompt = await Bun.stdin.text();
if (prompt === "wait-for-shutdown") {
  await Bun.write("child.pid", String(process.pid));
  setInterval(() => {}, 1000);
} else console.log(prompt);
`,
    );
    await chmod(join(directory, "codex"), 0o755);
    await Bun.write(join(directory, "claude"), '#!/bin/sh\nprintf "login required" >&2\nexit 7\n');
    await chmod(join(directory, "claude"), 0o755);
    child = Bun.spawn(
      [
        process.env["FACTORY_SERVER_EXE"] ?? "bun",
        ...(watch ? ["--watch"] : []),
        ...(process.env["FACTORY_SERVER_EXE"]
          ? []
          : [new URL("./bin.ts", import.meta.url).pathname]),
        ...(sidecar ? ["--sidecar"] : []),
      ],
      {
        cwd: directory,
        env: { ...process.env, PORT: "0", PATH: `${directory}${delimiter}${process.env["PATH"]}` },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    url = await (async () => {
      const reader = child.stdout.pipeThrough(new TextDecoderStream()).getReader();
      let output = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) throw new Error(`Server exited before ready: ${await child.exited}`);
          output += value;
          if (sidecar && output.includes("\n")) {
            const ready = JSON.parse(output.split("\n")[0]) as { url: string };
            return ready.url;
          }
          const match = /listening on (http:\/\/[^\s]+)/.exec(output);
          if (match) return match[1];
        }
      } finally {
        reader.releaseLock();
      }
    })();
  });

  afterAll(async () => {
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill("SIGTERM");
      await child.exited;
    }
    if (directory) await rm(directory, { recursive: true, force: true });
  });

  const post = (body: string) =>
    fetch(new URL(AGENT_ENDPOINT, url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

  it("serves the shared request and answer contract", async () => {
    const prompt = "--help\n$(literal) ä";
    const response = await post(JSON.stringify({ agent: "codex", prompt }));
    expect(response.status).toBe(200);
    expect(await response.json()).toBe(prompt);
  });

  it.each([" ", "ä".repeat(8001)])(
    "rejects invalid input through the shared schema",
    async (prompt) => {
      const response = await post(JSON.stringify({ agent: "codex", prompt }));
      expect(response.status).toBe(400);
      expect(await response.json()).toBe(PROMPT_RANGE_MESSAGE);
    },
  );

  it("survives a CLI exiting before reading a large prompt", async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await post(JSON.stringify({ agent: "claude", prompt: "x".repeat(12_000) }));
      expect(await response.json()).toContain("Agent exited with 7: login required");
      expect((await fetch(new URL("/health", url))).status).toBe(200);
    }
    expect(
      await (await post(JSON.stringify({ agent: "codex", prompt: "still running" }))).json(),
    ).toBe("still running");
  });

  it("rejects oversized request bodies", async () => {
    const response = await post(" ".repeat(PROMPT_MAX_BYTES * 6 + 1025));
    expect(response.status).toBe(413);
  });

  it("rejects malformed JSON and unknown agents", async () => {
    for (const body of ["{", JSON.stringify({ agent: "unknown", prompt: "Hello" })]) {
      const response = await post(body);
      expect(response.status).toBe(400);
      expect(typeof (await response.json())).toBe("string");
    }
  });

  it("distinguishes unknown routes and unsupported methods", async () => {
    expect((await fetch(new URL("/missing", url))).status).toBe(404);
    for (const method of ["GET", "HEAD", "PUT", "PATCH", "DELETE"]) {
      const response = await fetch(new URL(`${AGENT_ENDPOINT}?source=test`, url), { method });
      expect(response.status).toBe(405);
      expect(response.headers.get("Allow")).toBe("POST");
    }
  });

  it.each([
    "tauri://localhost",
    "http://tauri.localhost",
    "https://tauri.localhost",
    "http://localhost:1420",
  ])("allows JSON requests from %s", async (origin) => {
    const endpoint = new URL(AGENT_ENDPOINT, url);
    const preflight = await fetch(endpoint, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("Access-Control-Allow-Origin")).toBe(origin);
    expect(preflight.headers.get("Access-Control-Allow-Methods")).toBe("POST");
    expect(preflight.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
    for (const prompt of ["Hello", " "]) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: JSON.stringify({ agent: "codex", prompt }),
      });
      expect(response.status).toBe(prompt.trim() ? 200 : 400);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
      expect(response.headers.get("Vary")).toBe("Origin");
    }
  });

  it("allows the localhost server's own origin", async () => {
    const response = await fetch(new URL(AGENT_ENDPOINT, url), {
      method: "POST",
      headers: { Origin: url, "Content-Type": "application/json" },
      body: JSON.stringify({ agent: "codex", prompt: "same origin" }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toBe("same origin");
  });

  it("rejects matching foreign Host and Origin headers", async () => {
    for (const method of ["OPTIONS", "POST"]) {
      const response = await fetch(new URL(AGENT_ENDPOINT, url), {
        method,
        headers: {
          Host: "untrusted.example:4318",
          Origin: "http://untrusted.example:4318",
          "Content-Type": "application/json",
        },
        ...(method === "POST" ? { body: JSON.stringify({ agent: "codex", prompt: "Hello" }) } : {}),
      });
      expect(response.status).toBe(403);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    }
  });

  it("rejects foreign origins before executing agent requests", async () => {
    for (const method of ["OPTIONS", "POST"]) {
      const response = await fetch(new URL(AGENT_ENDPOINT, url), {
        method,
        headers: { Origin: "https://untrusted.example", "Content-Type": "application/json" },
        ...(method === "POST" ? { body: JSON.stringify({ agent: "codex", prompt: "Hello" }) } : {}),
      });
      expect(response.status).toBe(403);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    }
  });

  it("stops active CLI requests when the parent shuts down", async () => {
    const response = post(JSON.stringify({ agent: "codex", prompt: "wait-for-shutdown" }));
    let pid = 0;
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      const file = Bun.file(join(directory, "child.pid"));
      if (await file.exists()) {
        pid = Number(await file.text());
        if (pid > 0) break;
      }
      await Bun.sleep(10);
    }
    expect(pid).toBeGreaterThan(0);
    if (shutdown === "eof") await child.stdin.end();
    else if (shutdown === "stdin") {
      await child.stdin.write("shutdown\n");
      await child.stdin.flush();
    } else child.kill(watch ? "SIGINT" : "SIGTERM");
    expect(await (await response).json()).toBe("Agent request cancelled.");
    expect(await child.exited).toBe(0);
    expect(() => process.kill(pid, 0)).toThrow();
  });
});
