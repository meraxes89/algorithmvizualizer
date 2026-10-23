# Archive

This folder holds historical planning documents. They are kept for context, not maintained. They may describe behaviour, files or performance claims that no longer match the application.

| Document | What it recorded |
| :--- | :--- |
| [improvement_v1.md](improvement_v1.md) | The earlier performance-engineering plan, including the audit that motivated the later architecture work |
| [extreme_ui_ux_proposal.md](extreme_ui_ux_proposal.md) | The original glassmorphism and cinematic-interaction design proposal |
| [applied.md](applied.md) | The implementation ledger for that design proposal |

## Why these documents are here

They are useful when tracing how the current design and performance work evolved, but they are not the source of truth for how the application works today. Use [ARCHITECTURE.md](../ARCHITECTURE.md) for the current structure, [CONTRIBUTING.md](../CONTRIBUTING.md) for the workflow, and the [ADR index](../adr/README.md) for the decisions that replaced the earlier plans.

## Active planning documents

The two planning documents that are still updated remain at the repository root:

- [`improvement_v2.md`](../../improvement_v2.md) — the current phased roadmap
- [`execution_tracker.md`](../../execution_tracker.md) — the item-level status ledger

They are not archived yet because later phases still update them. When the improvement programme closes, they can move here as a final record. Keeping the working ledger at the root also avoids breaking the links in the pull-request history while the programme is active.
