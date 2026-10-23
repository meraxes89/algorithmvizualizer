# ADR 0002 — Registry over hardcoded navigation

- **Status:** Accepted
- **Date:** 2026-10-22
- **Phase:** improvement_v2, Phase 3 (the registry drives the app)
- **Supersedes:** nothing

## Context

The same algorithm was named in several unrelated places:

- the desktop navigation and the mobile menu
- the category grid at `/algorithms`
- each family page's tab list
- the command palette
- the arena lineups and home-page suggestions

Before the registry, adding an algorithm meant editing each surface that should know about it. Forgetting one produced a listing with no page, a page with no tab, or a command-palette entry that opened nothing. The lists were also the easiest place for an id or display name to drift.

There was a second constraint: the application shell is in the initial bundle. Importing every algorithm generator into the shell to derive the lists would pull the algorithms, and their dependencies, into that bundle before the user chose a page.

## Decision

Use two registries with different responsibilities.

1. **Family registries are the source of truth for implementations.** The sorting, searching, pathfinding, graph and dynamic-programming families each expose a small array next to their algorithms, for example `sortingAlgorithms`, `searchingAlgorithms`, `graphAlgorithms` and `dpAlgorithms`. Each entry carries the stable id, display name, generator and any family-specific requirements.

2. **The app registry is display-only.** `src/registry/index.ts` contains the seven navigation families, their routes, listings, groups and operations, plus the three tools. It does not import generators. The shell, category grid and command palette read this registry. Tree and recursion operations also live here; the five families with implementation registries build their page tabs from those registries directly.

3. **A test keeps the two lists honest.** `registry.test.ts` compares the app registry's ids and names against the family registries for every family that has one. Tree operations are checked against their expected list, and recursion entries are checked against `recursionAlgorithmsData`.

4. **Selection is URL state.** `useParamSelection` reads `?algo=` and `?op=` from the query string and falls back to the first entry. Deep links are therefore normal routes, not a separate state store.

The registry is deliberately display-only. The duplication is the price of keeping the shell bundle small, and the test is the mechanism that makes the duplication safe.

## Consequences

### Good

- For the five families with an implementation registry, adding an algorithm means one implementation entry and one display entry. It then appears in navigation, the category grid and the palette, and its page tab appears from the family registry, without editing each surface. Tree and recursion pages also have a small page-level operation mapping; those are called out in the contributing guide.
- The registry test catches renamed ids and names before a reviewer does.
- The shell does not import algorithm code, so opening the app does not download every family.
- Deep links such as `/sorting?algo=heapSort` work from the palette, the address bar and external links.

### Bad

- The display list is a second copy. It can drift unless the test is run, and the test itself has to be updated when a family's shape changes.
- Some metadata is still outside the registry: long-form descriptions live in `src/data/`, and the arena and home page keep local presentation lists.
- A registry entry can describe a route or operation that the page does not implement. The test checks ids and names, not that the page renders every operation correctly.

### Neutral

- The registry is a plain TypeScript module, not a generated artefact. At the current size, generation would add build complexity without removing a meaningful amount of work.

## Alternatives considered

**Import the family registries directly into the shell.**
Rejected. The shell is in the initial chunk. Importing all family registries would bring the generators and their dependencies into that chunk, defeating the route-level code splitting.

**Generate the app registry at build time.**
Rejected for now. It would remove the second edit, but it adds a build step and a generation format for roughly forty entries. The test covers the failure mode that matters today.

**Keep separate hardcoded lists.**
Rejected. It was the original failure mode: every new surface added another place to forget.

**Put everything, including generators, in one megastore.**
Rejected. It couples display metadata to implementation code and makes bundle boundaries harder to see.

## References

- `src/registry/index.ts` — the display registry
- `src/registry/registry.test.ts` — drift checks and dogfood assertions
- `src/algorithms/*/index.ts` — family registries
- `src/hooks/useParamSelection.ts` — URL-backed selection
- `src/components/CommandPalette.jsx`, `src/components/Navbar.jsx` — consumers
- `improvement_v2.md` Phase 3
