# Architecture Decision Records

An Architecture Decision Record (ADR) captures a decision that is expensive to reverse, the context that made it necessary, and the consequences the team accepted. ADRs are here so a future contributor can understand **why** the code looks the way it does without reconstructing the history from pull requests.

## Index

| ADR | Decision | Status | Read it when |
| :--- | :--- | :--- | :--- |
| [0001](0001-step-trace-contract.md) | Algorithms yield typed steps; playback and side effects stay outside the algorithm | Accepted | You are writing or reviewing an algorithm, a step type or an event subscriber |
| [0002](0002-registry-over-hardcoding.md) | Family registries own implementations; a display-only app registry drives navigation | Accepted | You are adding an algorithm, a page or a navigation surface |
| [0003](0003-incremental-typescript.md) | Strict TypeScript on the typed surface, with new files required to be TypeScript | Accepted | You are touching a legacy `.jsx` file or adding a module |
| [0004](0004-pnpm.md) | pnpm 12 is the only package manager; one lockfile and an explicit build-script allowlist | Accepted | You are changing dependencies, CI or local setup |
| [0005](0005-class-dark-mode.md) | Class-based dark mode with CSS tokens and a resolver for canvas/WebGL | Accepted | You are adding a colour, a token, a canvas or a 3D scene |
| [0006](0006-playback-engine.md) | One framework-agnostic playback engine owns time for every visualizer | Accepted | You are adding a visualizer, a transport control or a timing behaviour |

## Conventions

- **Accepted ADRs are records, not living documents.** If a decision changes, add a new ADR that supersedes the old one and update the index. Do not rewrite the context of an accepted decision.
- **One decision per record.** If a proposal contains two independent choices, split it.
- **Write for a future reader.** Include the alternatives that were considered; the rejected options are often the most useful part.
- **Link the code and the plan.** A reference section should point to the files that implement the decision and, where relevant, the phase that introduced it.
- **Update the index and the architecture guide** when an ADR is added or superseded.

## Template

Copy [TEMPLATE.md](TEMPLATE.md) to the next number. Use a short, descriptive title, and keep the status line honest: `Proposed`, `Accepted`, `Superseded by ADR NNNN` or `Deprecated`.

## Superseded records

None yet.
