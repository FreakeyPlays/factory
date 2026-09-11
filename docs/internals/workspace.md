# Workspace

A bun workspace driven by [vite-plus](https://vite.plus) (`vp`).

## apps

- `apps/client` (`@factory/client`): a shared Angular UI for the web and Tauri desktop clients. A mobile client is planned.
- `apps/server` (`@factory/server`): TypeScript HTTP server running on Bun, bundled with `vp pack`. Imports the shared Effect contracts directly. Tauri ships it as a compiled Bun sidecar; see [Architecture](architecture.md).

## packages

- `packages/ui` (`@factory/ui`): reusable Angular component library.
- `packages/contracts` (`@factory/contracts`): shared Effect schemas and derived types. Anything both a client and the backend must agree on belongs here, including the wire constants (`AGENT_ENDPOINT`) that name where a request goes.
- `packages/shared` (`@factory/shared`): framework-independent behavior derived from those contracts, currently validating agent input and reading agent replies.

## Other top-level directories

- `scripts/`: release versioning and workspace cleanup tooling.
- `docs/`: this documentation tree.

## Import conventions

`@factory/shared` and `@factory/contracts` currently export `./agent`, with no root export. Import the explicit subpath. `@factory/ui` exports its root public API. Files that are not exported are implementation details.

See [Architecture](architecture.md) for runtime boundaries and planned responsibilities.
