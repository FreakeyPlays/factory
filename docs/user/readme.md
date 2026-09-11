# User Guide

Factory currently sends individual prompts to installed Agent CLIs. For setup
and launch instructions, see the [README](../../README.md#installation).

## Send a prompt

1. Install and sign in to Codex or Claude Code on the machine running Factory's
   server. The CLI must be available on its `PATH`.
2. Open Factory, select the agent, and enter a prompt within the displayed byte limit.
3. Select **Send**. The form is disabled while the agent runs; the completed reply
   appears under **Answer**.

Each request starts a fresh conversation and replaces the previous displayed
answer. Replies appear when complete; there is no streamed output or saved chat
history yet. The current integration runs Codex in read-only mode and Claude Code
with tools disabled, so this is a prompt interface rather than a repository editing
workflow.

## If a request fails

- **CLI could not start:** check its installation and the server's `PATH`.
- **Agent exited with an error:** read the displayed message and check the CLI's
  sign-in state before retrying.
- **Backend unavailable:** restart Factory. For local web use, ensure both the
  frontend and server are running as described in the README.
- **Agent timed out:** the server stops requests after two minutes. Try a smaller
  prompt or retry after checking the CLI.
