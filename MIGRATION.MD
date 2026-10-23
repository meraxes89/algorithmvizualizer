# MIGRATION — the story of `feat/theme-architecture`

> **What this is:** the narrative of [PR #2](https://github.com/meraxes89/algorithmvizualizer/pull/2) —
> what this branch does to the project, how a loose JavaScript app became a typed, contract-driven
> one, and every decision along the way, told in the order the **61 commits** actually landed.
>
> **Companions:** [`improvement_v2.md`](improvement_v2.md) owns the strategy,
> [`execution_tracker.md`](execution_tracker.md) owns the per-item ledger, and the PR #2 comment
> thread is the play-by-play. This file is the one you read first — on either side of the merge.

---

## The branch in one paragraph

`main` is a working demo that nobody can safely change: 110 untyped source files, five copies of
BFS, three copies of bubble sort, algorithms that reach into React state, four hand-maintained
copies of the navigation, 269 hardcoded hex colours, ~2 000 lines of dead code, six known
runtime crashes, zero tests, zero lint, and a CI file that only knows how to deploy.

This branch is the same product rebuilt on a spine: **algorithms are pure generators that yield
typed steps, one playback engine owns all time, one registry drives every surface, two token
families own every colour, and four CI jobs enforce all of it.** The demo became a system. The
numbers at the end: 376 tests from zero, 93.2% statement coverage behind a ratcheting 87% gate,
0 lint errors, a clean typecheck, per-chunk bundle budgets, an axe accessibility sweep on 28
route/theme combinations, and Lighthouse budgets in CI — all green on the final commit.

The rest of this document is how it happened, phase by phase, decision by decision.

---

## Chapter 1 — The diagnosis: `main`, autopsied

The branch begins with an audit, not a commit. On 2026-10-22 the full codebase was itemized, and
the audit is the reason this PR exists — every phase traces back to a numbered finding. The
worst items:

1. **No algorithm is single-sourced.** BFS existed in ~5 bodies: a dead `algorithms/pathfinding/bfs.js`,
   two inline copies inside `PathFindingVisualizer.jsx`, one in `raceTraces.js`, one in the
   953-line `GraphAlgorithms.js`, plus a toy copy in `MicroViz.jsx`. Bubble sort lived three
   times. Every copy had its own step schema — which is the real reason nothing could be
   generalized, tested, or scrubbed.
2. **The algorithm layer imported React.** `src/algorithms/sorting/*` drove `setState` callbacks
   directly from inside the algorithm. Nothing could be unit-tested without a browser, and
   "pause" or "seek" was impossible because there was no timeline — only `setTimeout` chains.
3. **Navigation truth was hardcoded four times.** Navbar, BottomDock, CommandPalette and the
   categories page each kept their own lists. Adding one algorithm meant editing five or more
   disconnected files and hoping nothing drifted. (It had: a link to the nonexistent "Grid
   Paths", Jump Search missing from the grid, three of eight graph algorithms listed.)
4. **Two design languages.** Tokenized "Paper Studio" pages next to legacy chrome full of raw
   hex literals — 269 of them across the tree visualizers, docks, palettes and toasts.
5. **~2 000+ lines of confirmed dead code.** `RecursionVisualizer.jsx`, `nQueens.js`,
   `towerOfHanoi.js`, duplicate `avl.js`, tree re-export shims, unreachable `algorithmData.js`
   sections.
6. **Six verified P0 runtime bugs** (audit items 6–11) — any one of which a first-time
   contributor would hit within minutes. Details in the next chapter.
7. **No safety net at all.** No ESLint, no tests, no typecheck, no CI beyond a deploy workflow,
   a stale `package-lock.json` sitting next to the canonical `pnpm-lock.yaml`, no `engines`
   field — and a README that oversold features the code did not have. The worst possible
   first-contribution experience: the map lies, and there are no guardrails.

That list is the "bloated and unmaintainable" feeling, itemized. The plan
([`improvement_v2.md`](improvement_v2.md), committed as `3cbbc75` **before** the work, with the
per-item ledger `0522701`) set one north-star for everything that followed:

> _A developer who has never seen this repo adds a new algorithm in ~30 minutes without touching
> the engine, sound, scrubbing, or docs — and cannot break anything else while doing it._

Every phase lands only when its acceptance criteria and the full verification gate pass. That is
the meta-decision the whole story rests on: **strategy file + item ledger + phased delivery.**

---

## Chapter 2 — Stop the bleeding (Phase 0)

> **13 commits · 51 files · +448 −98 · production build green after every single commit**

The first night was triage. The six P0 crashes, each a small story of its own:

- **#6** `SortingVisualizer` rendered `<RotateCcw/>` without importing it — a `ReferenceError`
  crash in the **default 2D view** of the flagship page (`82d33e5`). A scripted sweep confirmed
  it was the only missing JSX import of its kind. It was not the last crash of that class — see
  Phase 1.
- **#7** `SearchingVisualizer` called `algorithm(…, setSearchRange, speed)` with six arguments
  while `linearSearch` accepted five. `setSearchRange` landed in the `speed` slot, `setTimeout`
  coerced a function to `NaN`, clamped it to `0` — and **linear search ran instantly**, no
  pacing at all (`f320f9d`). The fix gave `linearSearch` the same signature as `binarySearch`
  and used `setSearchRange` for what it was named for.
- **#8** the "2x" chip read `SPEED_PRESETS.NORMAL`, a key that does not exist, so the chip set
  playback speed to `undefined` (`7d131aa`). Pointed at `SPEED_PRESETS.MEDIUM`.
- **#9** the graph builder was a three-defect trap: `onGraphChange` was an inline arrow in the
  effect dependencies so it re-fired on every render, the parent closed the modal **inside the
  handler**, and the builder emitted `{ nodes }` while the parent read `{ vertices }` — so
  opening the builder wiped the graph it was opened to edit (`206775c`). The fix seeds the
  builder from the live graph, holds the callback in a ref, reports only real divergence, and
  emits the shape the parent actually reads.
- **#10** `animate-in`, `fade-in`, `zoom-in`, `slide-in-from-*` — animation classes with no
  plugin behind them. They compiled to **zero CSS**; the sound popover and the Playground modals
  appeared with no transition at all (`ce4008a`). Decision recorded: install the real
  `tailwindcss-animate` plugin rather than hand-rolling utilities, so Phase 4 has a plugin to
  standardize on.
- **#11** `AnimatePresence` tracked an **unkeyed `<Suspense>`** child, so it never saw the route
  change and exit transitions never played (`f5dedcb`). The key moved onto the boundary — with
  the behaviour change flagged for review: with `mode="wait"`, the next chunk now loads after
  the 0.3 s exit.

Then hygiene, in the same breath: the `soundEngine` export unified (`04c74e4`), the colliding
`algorithmData` export renamed (`9f3bfa1`), 45 dead symbols and 27 redundant `import React`
lines removed (`45d339d`), `engines` + `.nvmrc` + `.editorconfig` declaring the toolchain
(`f063622`), and the GitHub-primary / GitLab-mirror remote policy written down (`22f41e8`).

The dead-code purge and the stale `package-lock.json` were **deliberately deferred** — not
forgotten — to land with the family ports that made them dead, so every deletion in this PR is
paired with the replacement that obsoleted it.

---

## Chapter 3 — The safety net before the trapeze (Phase 1)

> **8 commits · CI run [39671048032](https://github.com/meraxes89/algorithmvizualizer/actions/runs/39671048032) green · lint · typecheck · tests · build + bundle budget**

The order here is the decision: **net first, refactor second.** Every later phase edits
hundreds of files; this phase is what makes that survivable.

- **TypeScript, incremental and strict** (`9ebc954`, reasoned in [ADR 0003](docs/adr/0003-incremental-typescript.md)):
  `strict` from day one, with `allowJs` + `checkJs` — new files are `.ts`/`.tsx`, hot files
  convert deliberately, one at a time. This was **measured, not guessed**: full `checkJs` today
  would report 104 errors in the 9 remaining `.js` files and 1 511 across the `.jsx` layer. A
  gate that fails on files the migration has not reached protects nothing, so the rule is
  per-file: **a file joins the checked graph the day it converts.**
- **ESLint with layer boundaries** (`9ebc954`): React and the DOM are un-importable inside
  `src/algorithms`; `src/core` and `src/algorithms` may not reach into the untyped layers;
  `import/no-cycle` holds the module graph acyclic. These are lint rules, not review discipline —
  and the acceptance test was that **the rule blocks itself**: a React import inside
  algorithms, a `document` reference there, and a brand-new plain `.js` file under `src/` were
  each confirmed to fail the lint.
- **The ratchet** (`9ebc954`): a local rule, `no-legacy-js-file`, blocks **new** `.js`/`.jsx`
  under `src/`. The 107 pre-existing files are grandfathered in
  [`.eslint-legacy-allowlist.json`](.eslint-legacy-allowlist.json) — a list that only shrinks.
  The migration boundary can move one way.
- **Vitest + jsdom + a coverage gate** (`922b659`), with the first algorithm (merge sort)
  converted to TypeScript to prove the whole pipeline: config, aliases, test runner, gate.
- **husky pre-commit + lint-staged** (`fcf0517`), and **CI on every PR** (`05d31e1`):
  lint → typecheck → tests-with-coverage, plus a build job with a **per-chunk bundle budget**
  (`tools/bundle-size.mjs`). The deploy workflow is now gated on the checks workflow via
  `workflow_run` — nothing deploys that did not pass the gate.

The net paid for itself within hours. **The linter's very first run found 35 errors — and one
of them was another live crash:** `SortingVisualizer` called `useMemo` and `useCallback` without
importing them, a `ReferenceError` on every render (`72f763f`). The same class of bug as the
`RotateCcw` crash, found by a machine one day after a human sweep proved it "wasn't there."
That is the entire argument for Phase 1 in one anecdote. The other 34 errors were genuinely
dead code and are gone (`50699d7`).

---

## Chapter 4 — The contract at the center (Phase 2)

> **22 commits · mid-flight audit closed · bundle re-priced (`fb97885`) · blocker fixes (`3466683`)**

This is the phase that made the branch an architecture instead of a cleanup.

### The contract

One design decision, [ADR 0001](docs/adr/0001-step-trace-contract.md), commit `2a879de`:

**An algorithm is a generator. It receives an input, yields typed steps, and never knows what
is drawing it.**

```
input ──► generator ──► step stream ──► trace[] ──► playback ──► current step.view
                                                          └──► step events (sound engine)
```

A step is `{ family, t, view }`:

- `t` is the event — `compare`, `swap`, `visit`, `done` — and `family` is a discriminant of its
  own, because event names repeat across families and the union narrows correctly only with
  both.
- `view` carries the **complete visual state after the event, not a delta**. The deliberate
  cost is repeated state inside a trace; the payoff is that `seek(n)` is an array lookup and
  any step renders in isolation. That single choice is what made scrubbing, golden tests and
  comparison mode possible later.
- The stream is collected into an array once (`collectSteps`). Materialized traces, on purpose:
  constant-time seek, snapshot-testable, inspectable. Current state sizes are small and the
  trade was written down rather than discovered.

### The engine

[ADR 0006](docs/adr/0006-playback-engine.md): **playback owns all time, everywhere** (`2a879de`).
`core/playback.ts` advances with `requestAnimationFrame` and accumulates elapsed time so speed
does not depend on the display's refresh rate. Play, pause, next, previous, seek, reset, speed,
auto-pause on a hidden tab, a catch-up budget so one long frame cannot fast-forward the trace.
The browser globals are injectable (`PlaybackEnv`) — the engine's tests hand-crank a fake clock,
no fake timers, no DOM. `usePlayback` is the deliberately thin React binding. The typed event
bus (`core/events.ts`) is how side effects subscribe: the sound engine **listens** to steps now
instead of being passed into algorithm code.

### The ports

Then nine families were ported, one commit each, deleting their old selves as they went —
verified by grep, not by memory:

| Family | Commit | What died |
| :-- | :-: | :-- |
| sorting | `92bb435` | 5 callback modules, proxy setters, the `setTimeout` chains |
| searching | `92ea357` | 2 callback modules |
| pathfinding | `49aafa3` | 4 callback modules **and the 6 inline copies inside the visualizer** |
| graph | `474b66d` | the 953-line `GraphAlgorithms.js` and the visualizer's private table |
| the arena | `d3d516b` | `raceTraces.js` and its **nine** private algorithm copies |
| trees (BST/AVL/heap) | `e895c6c`, `8c64051`, `7755a57`, `3ccb1ec` | `bstOperations.js`, `avlOperations.js`, `heapOperations.js`, `traversals.js`, the orphan `avl.js` |
| segment tree / trie | `7755a57`, `3ccb1ec` | `segmentTreeOperations.js`, `trieOperations.js` |
| recursion + boards | `b6165ed`, `0dc8d16` | `engine.js`, `gridEngine.js`, the dead `nQueens.js` / `towerOfHanoi.js` |
| dynamic programming | `9086385` | per-component table snapshots — the table lives in the generator now |

Two ports deserve their own lines: the **maze generator** stayed out of playback on purpose
(`80b601b`) — a maze is built in one synchronous pass; the *search* is what gets animated —
and the **Tower of Hanoi** became the `puzzle` family, so the last two components that still
owned private timers (`GraphVisualizer`, `TowerOfHanoiVisualizer`) went through the playback
engine too. After Phase 2, the only `setInterval`s left in the codebase are decorative (favicon,
confetti, the arena's shared race clock) — each one recorded as such.

### The golden path, dogfooded before it was documented

Heap Sort and Jump Search were added **the way a stranger is supposed to add an algorithm**
(`d3d516b`): a generator and its test, one line in the family registry, the metadata — and they
appeared on the sorting page, the searching page and the arena with zero further edits. Then
Fibonacci-DP did it again on the DP page, whose tabs now build from the registry (`9086385`).
Three mid-PR dogfoods are the proof that the 30-minute promise is real, not aspirational.

### What the safety net caught during the port

This is the part no plan can schedule, and the reason the net came first:

- insertion sort **wrote the array on a `mark` step instead of a `swap` step** — caught by the
  property test that asserts the array only changes on swaps.
- **the BST delete left the in-order successor pointing at itself** — the tree silently became
  a cycle and the in-order walk never ended. Caught by the delete property test, fixed in the
  port (`e895c6c`).
- the subsets trace **pushed two pseudo-call frames per level and popped one**, so the drawn
  call stack grew faster than the real recursion depth; the decisions became their own step
  kind (`b6165ed`).
- A* expanded the whole grid because ties broke arbitrarily; `GridNode.weight` had no lower
  bound, so a zero weight quietly broke the shortest-path guarantee — `weightOf()` clamps it
  in one place for both Dijkstra and A* (`3466683`).

### The mid-flight audit

With the families ported, an audit of the branch flagged four blockers. All closed in one
commit, each with a test pinning it (`3466683`):

1. **`usePlayback` dropped `onFinish`, and the tick loop skipped the final `advance()`** — so
   no run in the entire app had ever called `onFinish` or paused itself at the end. The
   confetti and the completion toast never fired; `isPlaying` stayed `true` forever. Two bugs,
   one symptom, both now pinned.
2. `FAMILIES` in the event bus listed 7 of the 11 step families, so `onAny` silently skipped
   the rest. The list is now a `Record<StepFamily, true>` — adding a family without updating
   the bus **stops compiling**.
3. the sound subscriber played every `sorting` event regardless of which playback instance
   published it — comparison mode doubled every note. The source is instance-scoped; only the
   left instance is audible.
4. `SortingVisualizer` had been passing `onFinish` to a hook with no such option — and nothing
   caught it **because the `.jsx` file sits outside the checked graph.** Recorded as the
   standing argument for why the TypeScript migration runs file-by-file: the bug lived
   exactly where no checker reads.

---

## Chapter 5 — One source of truth (Phase 3)

> **1 commit · `edef2cc` · CI run [39762148034](https://github.com/meraxes89/algorithmvizualizer/actions/runs/39762148034) green**

With algorithms single-sourced, the last hardcoded truth was navigation. [ADR 0002](docs/adr/0002-registry-over-hardcoding.md)
landed as one commit: **the registry drives the app.**

Two layers, on purpose:

- `src/algorithms/<family>/index.ts` — the implementation registries (unchanged from Phase 2).
- `src/registry/index.ts` — the **display** registry: families, ids, names, routes, groups. It
  deliberately imports **no generators**, because the navbar and palette live in the initial
  bundle and importing the family registries there would ship every algorithm on first load.

The drift problem is solved by a test, not by vigilance: `registry.test.ts` compares ids and
names across both layers, so they cannot diverge silently. Every hardcoded copy of the truth —
navbar dropdown, mobile drawer, the category grid (with its phantom "Grid Paths" and missing
Jump Search), the command palette — now derives from it, and the palette deep-links to the
algorithm, not just the family page. Selection lives in the URL (`?algo=heapSort`, `?op=inOrder`)
written with `replace: true`, so the back button walks pages, not every tab the user tried.

The dogfooded rule became law: an algorithm is added in **two registry edits** (family + display),
and the test fails if you forget one.

---

## Chapter 6 — One design language, and a gate that cannot be argued with (Phase 4)

> **4 commits (`89ca53e`, `efd1c87`) · 68 files · +1 930 −803 · CI run [39783243026](https://github.com/meraxes89/algorithmvizualizer/actions/runs/39783243026) green incl. the new a11y job**

Two token families in `src/index.css` ([ADR 0005](docs/adr/0005-class-dark-mode.md): class-based
dark mode — the user's choice beats the system's guess): **chrome tokens** for surfaces, ink
and accents, **visualization tokens** (`--viz-compare`, `--viz-visited`, `--viz-canvas`, …) for
algorithm state. Three sanctioned ways to read a colour, because canvas cannot parse
`var(--…)` and Three.js rebuilds on theme change: `var()` for CSS/SVG, resolved values for
Canvas 2D, the `useVizColors` hook for 3D. A lazy `/_dev` gallery shows every token in both
themes so they can be eyeballed in one place.

And the rule that ended the hex era: **raw hex literals are banned outside `src/theme/` and
`index.css`, enforced by an ESLint rule** that catches strings and template literals. 269 → 0,
and it cannot regress. A contrast pass darkened the inks and accents to AA. The last
`prompt()`/`alert()` flow in the graph editor was retired for an inline weight input plus
toasts — the fix class for a whole category of UX crashes.

Accessibility got the same treatment as theming: semantics, focus management and labels for
the palette, navbar, toasts, skip link and every icon-only button — and then a **CI job**:
Playwright + axe scanning all 14 routes in light **and** dark, the open command palette, the
open mobile navigation, plus three keyboard flows. **No exception list** — axe defaults only.
The first sweep found real issues; `efd1c87` closed them and the run went green. One
environment constraint is honoured rather than skipped: the dev host is Termux/Android, where
Playwright cannot run — so Ubuntu CI is the executor, and the e2e suite belongs to the gate.

---

## Chapter 7 — The map for strangers (Phase 5)

> **2 commits · CI run [39801326403](https://github.com/meraxes89/algorithmvizualizer/actions/runs/39801326403) green**

Now that the territory was worth mapping, the docs were written for someone who has never
opened the repo:

- **`README.md` rewritten around reality** — the live app, what is actually inside each family,
  the verification commands, and a direct line: _adding an algorithm? read the contributor
  guide._ The overselling is gone; the first contribution no longer starts with a lie.
- **`docs/ARCHITECTURE.md`** — the 60-second data-flow model, the layer map with its enforced
  dependency direction, the step-contract reference, the extension table ("you want to add X →
  start here"), a glossary, and — deliberately — a **known boundaries** section, so mid-migration
  edges read as recorded decisions instead of surprises.
- **`docs/CONTRIBUTING.md`** — the golden path from generator to registry to page, the exact
  two-edit rule, the enforced boundaries, and a PR checklist.
- **Six ADRs** (`0001` step contract, `0002` registry, `0003` incremental TypeScript, `0004`
  pnpm, `0005` class dark mode, `0006` playback owns time), an index, and a template so every
  future decision has a home. Superseded plans were **archived, not deleted**
  (`docs/archive/improvement_v1.md`, `extreme_ui_ux_proposal.md`, `applied.md`).
- A pull-request template with a verification matrix, so the next contributor inherits the
  gate instead of guessing at it. A link-and-anchor audit across 13 maintained docs found zero
  missing targets.

---

## Chapter 8 — Hardening, and the payoff (Phase 6)

> **11 commits · final CI run [39909458985](https://github.com/meraxes89/algorithmvizualizer/actions/runs/39909458985) on `2e4ff00` — all four jobs green**

The last phase is the one that never ends; it just gets a ledger. Its decisions:

**Churn decides the next port** (`32b2cc1`). Not vibes, not file order — data: across the PR's
history, `GraphVisualizer` had been touched 8 times, the most-edited unported visualizer. It
was ported from `.jsx` to strict `.tsx` with a nine-test suite, and the port introduced
`.d.ts` boundary shims (`Toast`, `InteractiveGraphBuilder`, `confettiHelper`) so the strict
file does not drag grandfathered imports into the checked graph. The strict pass immediately
surfaced latent falsy-id bugs the untyped version had hidden for its whole life: the target
selector's "None" aliased **node 0** (`Number('') === 0`), and node id `0` fell through every
`||` guard. `TowerOfHanoiVisualizer` and `animationHelpers` had converted the same way in the
batch before (`39e4afd`).

**Writing tests is how you find dead tabs** (`fcfa621`, `e2bd9ff`). The smoke suites for AVL and
Heap could not even mount: both components crashed **on every render** — an auto-scroll effect
listed `logs` in its dependencies above the `const logs = useMemo(...)` that defines it. A
temporal dead zone `ReferenceError`; the AVL and Heap tabs were dead in production, invisible
to the axe sweep because it scans routes in their default state. Fixed with the seeded-canvas
regression the Phase 2 tree port had introduced. After this batch, **all 11 step families have
component suites** — and the suites are written through a dynamic-import loader so they exercise
the real `.jsx` components without pulling the legacy layer into `tsc`.

**Metadata became part of the registry, and the drift died** (`78b60a8`). The 1 128-line
`algorithmData.js` was deleted; educational content moved into typed `meta` modules colocated
with the family registries, as a **required** field — registry and metadata cannot diverge any
more, and a `metadata.test.ts` pins completeness for every entry. The move exposed what the
old table had been hiding: **BFS, DFS and Dijkstra had no educational content at all**, Jump
Search's panel was showing Linear Search's copy (a ternary lookup could never reach it), and
Heap Sort's code viewer was empty (a hand-keyed name map never listed it). The dead `trees`
section — four entries, zero consumers — died with the file.

**Motion respects the user** (`c113e72`). The CSS guard and the 3D queries existed; the gap
was framer-motion's JS-driven motion across 14 files. One `MotionConfig reducedMotion="user"`
at the app root covers all of them. The playback engine is deliberately exempt — stepping an
algorithm is the product, not decoration.

**The ratchet only turns one way** (`0c2703d`). The coverage gate went 85% → 86% → 87%, and the
measured numbers after the batch are 93.2% statements / 87.41% branches / 92.37% functions.
A port raises the gate; nothing lowers it.

**Lighthouse in CI, with the preset chosen with evidence** (`ea80145`, `2e4ff00`). The first
run scored **performance 51** — mobile emulation throttling a 2-core shared runner 4×. Same
build, desktop preset: **90**. The decision, recorded with the numbers: the product is a
desktop-first visualizer, the e2e suite runs desktop Chromium, so the job uses the desktop
preset; a11y/best-practices/SEO gate tightly at 90/85/90 and performance floors at a
deliberately generous 75 — _the bundle-size budget is the real performance guard_. Reports
upload as artifacts, and the first report's finding — **CLS 0.417 on the home route** — was
recorded as a performance follow-up, not silently absorbed.

**Releases got a procedure** (`39e4afd`, `b02b531`): Dependabot with weekly grouped updates,
`docs/RELEASING.md` with semver and rollback rules — and the one deliberately open item in
`improvement_v2.md`: **the first tagged release is blocked until this PR merges**, because a
tag must not point at an unmerged feature branch.

---

## The TypeScript migration, exactly where it stands

The strategy ([ADR 0003](docs/adr/0003-incremental-typescript.md)) was never "rewrite
everything" — it was **strict from day one, incremental forever**:

- `tsconfig` runs `strict`; new source files are `.ts`/`.tsx` by rule (the ratchet blocks new
  legacy files); a file is `checkJs`-checked **the day it converts**.
- The **typed surface** is complete and strict: `src/core` (the contract, the engine, the bus),
  all of `src/algorithms` (every family, pure, generator-based), `src/registry`, `src/hooks`,
  `src/theme`, the maze generator, `animationHelpers`, and the ported components
  (`SortingBars`, `SearchingBars`, `GraphVisualizer`, `TowerOfHanoiVisualizer`, the dev
  gallery). Branch totals: **117 `.ts` + 22 `.tsx` files.**
- The **legacy surface** is fenced, not forgotten: 60 `.jsx` + 18 `.js` files, grandfathered in
  the allowlist, which has already begun shrinking (every port prunes its entry). `tsc` and the
  coverage gate apply to the typed surface; each port pulls its file into the gate.
- The fence has one gate, and it only opens inward. The measured cost of flipping `checkJs` on
  everything today (104 + 1 511 errors) is the standing justification for the per-file rule —
  and the `onFinish` bug, which lived exactly where no checker read, is the standing
  justification for finishing the migration file by file, chosen by churn.

So: **the engine room is fully typed; the remaining work is the visualizer shell**, and the
process for consuming it already exists and has run successfully four times.

---

## How well is it now? The receipts

What a contributor actually faces, before and after:

| The question you'd ask | On `main` | On this branch |
| :-- | :-- | :-- |
| Will my change break something? | Nothing will tell you. | **376 tests / 57 files** (from 0), lint **0 errors** (23 warnings, all in grandfathered files), clean typecheck, coverage gate 87% measuring 93.2%, per-chunk bundle budget, axe sweep on 14 routes × 2 themes + 2 overlays, Lighthouse budgets — four CI jobs, all green on `2e4ff00`. |
| Where does an algorithm live? | BFS in ~5 places, bubble sort ×3. | **Exactly once**: a pure, typed generator under `src/algorithms/<family>/` — no React, no timers, enforced by lint. |
| Who owns playback? | A `setTimeout` chain per component. | One engine, one clock, everywhere. The remaining intervals are decorative and recorded. |
| How do I add an algorithm? | Edit 5+ disconnected files and hope. | The ~30-minute golden path, dogfooded three times mid-PR: generator + test, one registry line, required metadata — pages, arena, palette and nav appear on their own. |
| How do I find my way around? | A README that oversells; no docs. | README (honest) → ARCHITECTURE (60-second model) → CONTRIBUTING (golden path) → 6 ADRs for the why; tracker for the status. |
| Can I theme or restyle it? | 269 hardcoded hexes. | Two token families, one file, **0 hex outside `src/theme`** (enforced), `/_dev` gallery in both themes. |
| Is it accessible? | ~75% of components lacked ARIA; `prompt()` dialogs. | Keyboard-operable palette/navbar with focus management, labels everywhere, `aria-live` toasts — **axe-clean on 30 scans, no exception list**, reduced-motion honoured. |
| What are the numbers? | 110 untyped source files, 23 451 src LOC, 5 docs. | **61 commits · 276 files · +27 107/−13 164.** 139 typed files + 78 fenced legacy; src LOC 33 775 — the growth **is** the tests, the types and the metadata. 19 maintained docs. |

And the honest ledger of what is **not** done — recorded, not hidden:

- The legacy visualizer shell (60 `.jsx`) still awaits porting — by churn, one hot file at a
  time; the ratchet guarantees the boundary only shrinks.
- Known boundaries (in ARCHITECTURE.md): two source lists for navigation (kept in sync by test),
  metadata unified for three of the families, arena/home local lists, playground's remote
  engines and remaining native dialogs, confetti/favicon not yet on the event bus.
- Open follow-ups: universal `StepControls` scrubbing, 3D screenshot regression (WebGL parity
  in CI is notoriously flaky; route loading + reduced-motion guards cover it today), the
  Lighthouse-flagged CLS 0.417 on the home route, and the first tagged release — blocked on
  merge by policy.

---

## Appendix — every decision, and the commit that made it

| # | Decision | The choice, and why | Commit(s) |
| :-: | :-- | :-- | :-- |
| 1 | Strategy before work | Masterplan + per-item ledger committed before the code; phases land only through the gate. | `3cbbc75`, `0522701` |
| 2 | Crash triage first | Fix the six P0 runtime bugs before touching architecture — no refactor on top of a burning demo. | `82d33e5`…`f5dedcb` |
| 3 | Real plugin, not hand-rolled | Install `tailwindcss-animate` rather than faking the utilities, so Phase 4 standardizes on a real plugin. | `ce4008a` |
| 4 | Key the Suspense boundary | Exit transitions need a keyed child; the `mode="wait"` behaviour change was flagged, not hidden. | `f5dedcb` |
| 5 | One package manager | pnpm only (ADR 0004); `engines` + `.nvmrc` declare it; the stale `package-lock.json` dies. | `f063622` |
| 6 | Net before trapeze | Tooling phase before any mass refactor. | `9ebc954`, `05d31e1` |
| 7 | Incremental TypeScript | `strict` + `allowJs`; new files typed; hot files convert deliberately (ADR 0003). | `9ebc954` |
| 8 | `checkJs` measured, not enabled | 104 + 1 511 measured errors → per-file rule: a file is checked when it converts. | `9ebc954` |
| 9 | Boundaries as lint rules | React/DOM un-importable in `src/algorithms`; no cycles; the rule was proven to block itself. | `9ebc954`, `3b8fe95` |
| 10 | The legacy ratchet | No new `.js`/`.jsx` under `src/`; 107 files grandfathered in a shrinking allowlist. | `9ebc954` |
| 11 | Tests all-in | Unit golden + property (fast-check) + component + hook + e2e axe + bundle budget. | `922b659`, `9abc1c2` |
| 12 | CI gates deploys | lint → typecheck → coverage → build+budget, then deploy via `workflow_run`. | `05d31e1` |
| 13 | Algorithms are generators | Pure, synchronous, no React/timers/DOM (R1) — the contract's first rule. | `2a879de` |
| 14 | Whole-view steps, materialized traces | `seek(n)` is an array lookup; any step renders in isolation (ADR 0001). | `2a879de` |
| 15 | `family` as its own discriminant | Event names repeat across families; the union needs both to narrow. | `2a879de` |
| 16 | Playback owns all time | rAF + accumulated time, injectable env, hidden-tab pause (ADR 0006). | `2a879de` |
| 17 | Effects are subscribers | The sound engine listens to the typed bus; nothing reactive is passed into algorithms (R3). | `2a879de` |
| 18 | One implementation per algorithm | The arena races the registry; nine private copies die (R5). | `d3d516b` |
| 19 | Dogfood the golden path | Heap Sort, Jump Search, Fibonacci-DP added as a stranger would, mid-PR, as proof. | `d3d516b`, `9086385` |
| 20 | Construction ≠ animation | The maze is built in one pass, typed and untraced; the search animates. | `80b601b` |
| 21 | Audit mid-flight | External audit of the branch; four blockers closed with pinning tests. | `3466683` |
| 22 | Make additions a compile error | `FAMILIES` became `Record<StepFamily, true>`; the bus can't silently skip a family. | `3466683` |
| 23 | Instance-scoped sound | Comparison mode no longer doubles the notes. | `3466683` |
| 24 | Registry over hardcoding | One display registry feeds navbar, grid, palette, tabs, deep links (ADR 0002). | `edef2cc` |
| 25 | Two registry layers | Display imports no generators — protects the initial bundle; a drift test keeps them in sync. | `edef2cc` |
| 26 | Deep links with `replace` | The back button walks pages, not tabs. | `edef2cc` |
| 27 | Class-based dark mode | User choice beats media-query guess (ADR 0005); two token families; `/_dev` gallery. | `89ca53e` |
| 28 | Hex ban | 0 raw hex outside `src/theme` + `index.css`, enforced by lint on strings and templates. | `89ca53e` |
| 29 | Three ways to read a colour | `var()` for CSS/SVG, resolved values for canvas, `useVizColors` for 3D — each for a real reason. | `89ca53e` |
| 30 | Retire `prompt()`/`alert()` | Inline input + toasts in the graph editor. | `89ca53e` |
| 31 | a11y as a blocking gate | Playwright + axe on 14 routes × 2 themes + overlays + keyboard flows; **no exception list**; CI-only Playwright honours the Termux constraint. | `89ca53e`, `efd1c87` |
| 32 | Docs for strangers | Honest README, ARCHITECTURE, CONTRIBUTING, 6 ADRs + template; superseded docs archived, not deleted. | `e16463b` |
| 33 | Churn decides ports | The next file to convert is the most-edited one — data, not vibes. | `32b2cc1` |
| 34 | `.d.ts` boundary shims | A strict port must not drag grandfathered files into the checked graph. | `32b2cc1` |
| 35 | Metadata is registry data | Required, typed `meta` field; drift (missing BFS/DFS/Dijkstra content, wrong Jump Search panel) becomes impossible. | `78b60a8` |
| 36 | The coverage ratchet | 85 → 86 → 87; ports raise it, nothing lowers it. | `0c2703d` |
| 37 | Lighthouse in the desktop preset | First run: 51 (mobile emulation, 4× throttle on 2 cores) vs 90 desktop — preset chosen with evidence; perf floor generous, bundle budget is the real guard; CLS 0.417 recorded as a follow-up. | `ea80145`, `2e4ff00` |
| 38 | Reduced motion, centralized | One `MotionConfig reducedMotion="user"` covers 14 framer-motion files; playback exempt — stepping is the product. | `c113e72` |
| 39 | Tests must not widen the type graph | Component suites load legacy `.jsx` through a dynamic-import loader, keeping `tsc` clean. | `fcfa621` |
| 40 | Releases wait for merge | A tag must not point at an unmerged feature branch; RELEASING.md + Dependabot landed anyway. | `39e4afd`, `b02b531` |
| 41 | Every found bug gets a pinning test | The safety-net culture: `onFinish`, BST cycle, AVL/Heap TDZ crash, falsy node ids — each closed with the test that found it. | throughout |

---

## Epilogue

`main` is a demo you can run. This branch is a project you can join: one contract at the
center, one engine for time, one registry for truth, one file for colour, a gate that runs on
every PR, and a map written for people who have never been here.

The story does not end at the merge — the remaining `.jsx` shell, the recorded follow-ups and
the coverage ratchet are the next chapters, and the process for writing them (churn first, net
always on, ledger up to date) is already in place. That is the difference between a codebase
that is merely alive and one that is maintainable: not the absence of problems, but the
presence of a system for ending them.

---

_Migration record for PR #2 (`feat/theme-architecture`), written against `2e4ff00` —
the commit whose CI run [39909458985](https://github.com/meraxes89/algorithmvizualizer/actions/runs/39909458985)
is fully green across checks, build/bundle budget, the axe a11y sweep and the Lighthouse
budgets. Numbers cited throughout are from `improvement_v2.md`, `execution_tracker.md`, the
PR #2 phase comments, and `git` itself._
