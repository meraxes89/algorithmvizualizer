# 🏛️ IMPROVEMENT V2 — Maintainability & Scalability Masterplan

> **Goal:** Turn this repo into a codebase strangers can navigate in an afternoon and extend in minutes.
> **North-star test:** _A developer who has never seen this repo adds a new algorithm in ~30 minutes without touching the engine, sound, scrubbing, or docs — and cannot break anything else while doing it._
> **Status:** Phases 0–6 complete — this PR carries the full programme; see [`execution_tracker.md`](execution_tracker.md) for the item-level ledger. The first tagged release is the one remaining open item and is deliberately blocked until this PR merges (a tag must not point at an unmerged feature branch). Successor to [`docs/archive/improvement_v1.md`](docs/archive/improvement_v1.md) (performance) — this plan is about *architecture, safety, and documentation*.

---

## 0. Locked Decisions (approved)

| # | Decision | Choice | Rationale |
| :-: | :--- | :--- | :--- |
| 1 | Type safety | **Incremental TypeScript** | `tsconfig` up front with `allowJs` + `checkJs` + `strict`; new files are `.ts/.tsx`; hot files (core contract, registry, one algorithm per family) converted deliberately. Step-schema types double as living documentation. |
| 2 | Testing depth | **All-in** | Unit golden-trace tests + property-based tests for algorithms, component tests (Testing Library) for visualizers, Playwright e2e in desktop CI, axe-core a11y checks, bundle-size budget. "Nothing left behind." |
| 3 | Execution | **Phased delivery** | Each phase lands only when its acceptance criteria and the full verification gate pass. |
| 4 | Source of truth for process | This file + `execution_tracker.md` | `execution_tracker.md` stays the per-item status ledger; this file owns the strategy. |

**Environment constraints honored:** dev happens on-device (Termux/Android) — pnpm, Vitest, husky run locally; **Playwright and its browsers run in CI only (ubuntu, Node 24)**. CI lives in GitHub Actions (repo has `github` + `origin` GitLab remotes; GitHub workflow `.github/workflows/deploy.yml` is the pipeline to extend).

---

## 1. Problems This Plan Eliminates (from the full audit of 2026-10-22)

### Architectural
1. **No algorithm is single-sourced.** BFS exists in ~5 bodies (dead `algorithms/pathfinding/bfs.js`, two inline copies in `PathFindingVisualizer.jsx`, `raceTraces.js`, `GraphAlgorithms.js`, toy in `MicroViz.jsx`). Bubble sort ×3. Each copy has its own step schema — the real reason nothing can be generalized.
2. **The algorithm layer imports React state.** `src/algorithms/sorting/*` drive `setState` callbacks directly from inside the algorithm. That coupling is what prevents testing, reuse, and scrubbing.
3. **Four hardcoded copies of navigation truth** (Navbar, BottomDock, CommandPalette, CategoriesPage/tab bars). Adding an algorithm means editing 5+ disconnected files.
4. **Two design languages.** Tokenized "Paper Studio" pages vs legacy raw-hex chrome (BottomDock, CommandPalette, Toast, OnboardingTour, ComparisonMode, all tree visualizers — 269 hardcoded hexes total).
5. **~2,000+ lines of confirmed dead code** (items §7 of the audit): `RecursionVisualizer.jsx`, `nQueens.js`, `towerOfHanoi.js`, tree re-export shims + duplicate `avl.js`, unreachable `algorithmData.js` sections, unused imports/props.

### Verified runtime bugs (P0)
6. `SortingVisualizer.jsx:344` uses `<RotateCcw/>` not imported → ReferenceError crash in default 2D view.
7. `SearchingVisualizer` calls `algorithm(…, setSearchRange, speed)` but `linearSearch.js` takes 5 params → linear search runs instantly (pacing broken).
8. `StepControls.jsx:7` reads `SPEED_PRESETS.NORMAL` (doesn't exist) → "2x" chip sets speed `undefined`.
9. `InteractiveGraphBuilder` fires `onGraphChange({nodes:[],edges:[]})` on mount + every parent re-render → opening the builder wipes the current graph.
10. `animate-in / zoom-in / slide-in-from-*` classes used without the `tailwindcss-animate` plugin → produce zero CSS (SoundControls popover, PlaygroundPage modals).
11. `AnimatePresence` exit transitions never play (keyed `<Routes>` is a child of unkeyed `<Suspense>`).

### Hygiene
12. Dual lockfiles committed (`package-lock.json` stale + canonical `pnpm-lock.yaml`) — dev trap.
13. No lint, no tests, no typecheck, no CI beyond the deploy workflow; no `engines` field.
14. README oversells capabilities the code does not have (worst possible first contribution experience).
15. ~75% of educational components lack ARIA/focus management; `prompt()`/`alert()` inside GraphVisualizer.

---

## 2. Target Architecture

```
src/
├── core/                      # framework-agnostic contracts & engine (TS)
│   ├── steps.ts               # — THE step schema (discriminated unions per family)
│   ├── playback.ts            # — play/pause/step/seek/speed engine (rAF, tab-aware)
│   └── events.ts              # — typed step-event bus (sound, confetti, favicon subscribe)
├── algorithms/                # PURE. NO React imports. ONE implementation per algorithm.
│   ├── sorting/
│   │   └── merge-sort/
│   │       ├── merge-sort.ts  #   function* mergeSort(input): Generator<SortStep>
│   │       └── merge-sort.test.ts
│   ├── searching/… graph/… trees/… recursion/… dp/…
│   └── index.ts               # barrel; each category has its own mini-registry
├── registry/
│   ├── algorithms.ts          # single registration point: id, family, generator, meta,
│   │                          #   complexities, pseudocode, code snippets, status
│   └── families.ts            # family → route, accent, icon
├── hooks/                     # usePlayback, useTheme, useStepTrace (thin wrappers)
├── data/                      # long-form content only (docs copy, quiz bank, onboarding)
├── components/
│   ├── ui/                    # primitives: PageShell, Button, Tabs, Toast, Input, Sheet…
│   ├── visualizers/           # dumb renderers per family: consume (input, currentStep)
│   │   ├── sorting/…
│   │   └── …
│   └── shell/                 # Navbar, BottomDock, CommandPalette, Cursor, Toast host…
├── pages/                     # thin: family config + PageShell + Visualizer composition
├── dev/                       # /_dev gallery route (primitives + one visualizer per family)
└── styles | index.css         # Paper tokens + semantic viz-state tokens
```

### The Step Trace Contract (`core/steps.ts`)

```ts
// Illustrative — finalized in Phase 2
type SortStep =
  | { t: 'set-array'; array: readonly number[]; note?: string }
  | { t: 'compare'; i: number; j: number }
  | { t: 'swap';    i: number; j: number }
  | { t: 'mark';    i: number; state: 'sorted' | 'pivot' }
  | { t: 'done' };

type SearchStep = …;
type PathStep  = …; // { visit: [r, c] } | { wall: … } | { head: … } | …
type GraphStep = …;  type TreeOpStep = …;  type RecursionStep = …;  type DPStep = …;
```

Rules (enforced by ESLint + reviewed in PRs):
- **R1** Generators are pure and synchronous: `function*(input): Generator<Step>`. No `setTimeout`, no React, no DOM, no timers.
- **R2** Playback (`usePlayback`) owns time: speed, play/pause, step±, seek, auto-pause on `visibilitychange`, rAF batching. All 10 visualizers share it.
- **R3** Side effects are subscribers: `soundEngine`, `confettiHelper`, `animatedFavicon` listen to step events — never passed into algorithm code.
- **R4** Visualizers are dumb: props `(input, step, stepIndex)` → render. They own zero scheduling.
- **R5** One implementation per algorithm. Arena, pages, 3D, toys all consume the same registry entries.

### The Golden Path — "add an algorithm" (target ≤30 min)

1. `src/algorithms/<family>/<name>.ts`: write the generator (~30–80 lines), + golden trace test + property test (sorted/permutation/termination invariants).
2. Register in `src/registry/algorithms.ts` (family, meta, complexities, pseudocode, snippets, status).
3. Done: tab, Command Palette, Categories page, deep link (`/sorting?algo=<id>`), arena eligibility, coverage table all derive automatically. Visualizer needs code only if the family lacks the step types used.
   *Dogfood proof during Phase 3:* Heap Sort, Jump Search, Fibonacci-DP land through this path.

### "Add a family/category" path

1. `registry/families.ts` entry (accent, icon, route) → route in `App.jsx` route map (explicit, finite).
2. `PageShell` template + one visualizer shell extending the shared playback engine.
3. ADR note if a new step schema family is introduced.

---

## 3. Testing Strategy (all-in, structured by layer)

| Layer | Tool | What | Where it runs |
| :-- | :-- | :-- | :-- |
| **Golden traces** | Vitest | Snapshot each algorithm's full step trace on fixed inputs; trace length, step-type histogram, final state asserted | Local + CI |
| **Property tests** | Vitest + fast-check | Output correctness invariants: sorting = permutation(sorted input); search finds existing targets / returns −1, pathfinding reaches `end` on solvable mazes; maze generators always solvable; AVL balan曾ce… | Local + CI |
| **Registry integrity** | Vitest | Every registry entry resolves (generator loads, ids unique, meta complete, snippets compile strings) | Local + CI |
| **Playback engine** | Vitest | Speed math, seek, auto-pause on hidden tab (fake timers) | Local + CI |
| **Component** | Testing Library + jsdom | Visualizer render from a fixed step; play/pause/step controls; tab switching; palette open/navigate; tab a11y (`role=tablist`) | Local + CI |
| **E2E smoke** | Playwright (chromium) | Crawl all 13 routes; run one algorithm per family end-to-end; complete a quiz; Arena race; Playground JS executor (local eval only — never network) | **CI only** |
| **E2E a11y** | axe (via Playwright) | Route-level violations report; blocking list starts empty & stays empty | CI only |
| **Perf guard** | CI bundle-size check | Per-chunk budget (priced from current dist: three, monaco, framer-motion, lucide + main). Growth fails the PR. | CI only |

Mocking policy: Monaco (CDN), Pyodide, Wandbox remote executors are **mocked/stubbed** — no test depends on the network.
Sound is muted in tests via engine stub. Canvas/3D components excluded from coverage targets initially (render smoke only).
Coverage gate on first ship: **≥85% statements/branches on `src/algorithms` + `src/core` + `src/registry`**; app shell excluded from the gate.

---

## 4. CI Pipeline (GitHub Actions)

```yaml
jobs:
  checks:        # PR + main:  lint → typecheck → unit+component (coverage gate)
  e2e:           # PR + main:  playwright chromium (e2e + axe) — desktop-only
  build-guard:   # PR + main:  vite build → chunk-size budget check
  deploy-pages:  # main only:  existing workflow, now gated on checks passing
```

Dev-environment tasks (all runnable in Termux): `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm test: comps` · `pnpm build` · `pnpm size`. E2E stays `pnpm test:e2e` (CI-only).

---

## 5. Execution Phases

> Ordering rule: **each phase leaves the app fully working.** Family-by-family ports land as separate PRs; no long-lived rewrite branch.

### Phase 0 — Stop the bleeding · effort: 1 session
Fix bugs #6–#11. Delete all dead code (§1.5 list). Remove stale `package-lock.json`. Add `engines` (node ≥ 24 / pnpm ≥ 12), `.editorconfig`, `.nvmrc`. Unify `soundEngine` export; de-collide `data/treeAlgorithms.js` export name. Remove unused imports (`Settings2` etc.). Acceptance: zero known bugs, `grep`-verified dead-code list empty, README bugs section gone (docs rewrite comes later; README stays as-is for now).

### Phase 1 — Safety net · effort: 1–2 sessions
TS config (`strict`, `allowJs/checkJs`, path aliases `@core @registry @algorithms @components @hooks @data` with matching vite `resolve.alias`); ESLint **flat** config with **layer-boundary rules** (`src/algorithms/**` must not import React/DOM — enforced, not aspirational; `import/no-cycle`; no-restricted-imports for `react` inside algorithms, and eslint rule blocking new plain `.js` files in `src/` except configs); Prettier; husky + lint-staged; Vitest wired with jsdom + coverage; CI `checks` job live on every PR. Acceptance: CI green on main; boundary ruleblocks itself (bad import fails the lint).

### Phase 2 — Core contract & engine (the centerpiece) · effort: 4–6 sessions
1. Write `core/steps.ts` (typed ADR first), `core/playback.ts`, `core/events.ts` + unit tests.
2. Port family-by-family, **one algorithm family per PR, tests included, old code deleted in the same PR**:
   sorting → searching → pathfinding (+ maze) → graph → trees/BST/AVL/heap → segment/trie → recursion engines → DP → arena composition.
3. During ports: `PathFindingVisualizer`'s two inline copies and `raceTraces.js` die; Arena races the registry (educational fix: real weighted Dijkstra); StepControls becomes universal (scrubbing everywhere); sound/confetti/favicon re-wired as subscribers.
4. Acceptance per port: golden traces pass, component smoke passes, old implementation gone (verified by grep in PR template), visual parity spot-check on `/dev` gallery.

### Phase 3 — Registry drives the app · effort: 2 sessions
Extract every hardcoded nav/tab/palette list into `registry`; derive Navbar items, BottomDock, CommandPalette entries, CategoriesPage cards, page tab bars, quiz pool eligibility from it. Deep-linkable algorithm selection via query params. **Dogfood:** add Heap Sort, Jump Search, Fibonacci-DP via the golden path end-to-end (this validates the entire contract). Acceptance: adding a registry entry requires **zero** edits outside `src/registry` + the algorithm file itself.

### Phase 4 — Design system completion · effort: 2–3 sessions
Semantic viz-token block (`--viz-compare/swap/visited/path/start/end/wall…`) replacing `COLORS` and the 269 scattered hexes (grep-driven sweep, tree visualizers first); migrate legacy chrome (BottomDock, CommandPalette, Toast, OnboardingTour, ComparisonMode) to tokens; `/_dev` gallery route (dumb, tokenized, no Storybook dependency); `prompt()`/`alert()` retired in GraphVisualizer; a11y pass wired to the CI axe gate (focus traps, `aria-live` toasts, keyboard nav in palette & dropdowns, skip-link). Acceptance: axe blocking list empty; hex sweep count outside token files = 0 (enforced by lint-regex in CI).

### Phase 5 — Docs for strangers · effort: 1–2 sessions
Rewrite `README.md` to describe reality honestly (current oversell is a contributor-repellant). Write `docs/ARCHITECTURE.md` (layer map, data flow, **Step Trace Contract reference** − the single most-shared doc), `docs/CONTRIBUTING.md` (golden path recipe + coding rules + perf rules), 5–6 ADRs (generators over callbacks; registry over hardcoding; incremental TS; pnpm; class-dark-mode; playback engine) into `docs/adr/`. Move the four legacy plan/tracker docs to `docs/archive/` with a pointer from root. Acceptance: a reviewer who has never read the code can answer "where do I add X?" in ≤2 doc clicks.

### Phase 6 — Continuous hardening · effort: 1 session, then ongoing · **complete in this PR**
Deduplicate lockfile policy in docs; dependabot/renovate on; hot files migrate to real TS strictness (registry, core, one algorithm per family); raise coverage gate gradually; optional Lighthouse CI on the deploy preview; release tagging (semver tags + GitHub releases; no changesets needed at this size).

**Delivered:** ADR 0004 is the canonical toolchain/lockfile policy; Dependabot groups weekly updates; the coverage gate ratcheted 85 → 86 → 87 (measured: 93.2% statements, 87.41% branches, 92.37% functions); `TowerOfHanoiVisualizer`, `animationHelpers` and — chosen by churn — `GraphVisualizer` ported to strict TypeScript with `.d.ts` boundary shims so grandfathered files stay out of the checked graph; the Lighthouse route-budget job runs on every PR; `MotionConfig reducedMotion="user"` closes the reduced-motion audit across the framer layer; educational metadata is unified into the family registries (`algorithmData.js` deleted); component smoke tests cover all 11 step families; `docs/RELEASING.md` holds the release procedure. The first tagged release waits for merge by policy. The 3D screenshot regression stays a follow-up: WebGL parity in CI is flaky, and the scenes have route-level and reduced-motion coverage.

**Total: ~12–17 focused sessions** to "professional repo" end state.

---

## 6. Definition of Done (whole plan)

- [x] One implementation per algorithm; registry entry surfaces it in 5+ UIs with zero extra edits — the Phase 3 dogfood (Heap Sort, Jump Search, Fibonacci-DP) proved the path, and the metadata now travels with the registry entry as a required field
- [x] `src/algorithms` contains zero React/DOM imports — enforced by CI since Phase 1
- [x] `lint + typecheck + test + e2e + build` green on every PR; failing any blocks merge — the checks, build/bundle-budget, a11y and Lighthouse jobs all gate the PR
- [x] Golden traces + property tests cover 100% of registered algorithms; coverage gate ≥ 85% on `algorithms/core/registry` — now ≥ 87%, measured at 93.2% statements
- [x] Visualizers all share one playback engine (no `setInterval`/`setTimeout` chains in pages/components) — closed in Phase 2; the favicon, confetti and arena race timer remain by design
- [x] Zero hardcoded hexes outside token files; legacy chrome eliminated — enforced by the ESLint `no-restricted-syntax` rule
- [x] All routes axe-clean without an exceptions list — 30 axe scans + 3 keyboard flows in CI
- [x] README describes reality; ARCHITECTURE/CONTRIBUTING/ADR docs live; legacy trackers archived — Phase 5, and the docs were updated in the same commits as the Phase 6 changes they describe
- [x] Dead code list (§1.5) empty; proof = grep + PR deletions — the §1.5 list died in the family ports; `algorithmData.js` (with its unreachable sections) died in the metadata unification

## 7. Anti-goals (explicitly not doing)

- No state-management library (React state + the engine suffices); no UI framework swap; no Storybook/turborepo/monorepo tooling; no premature abstraction of visualizer "themes"; no rewriting the 3D visualizers beyond what the engine requires; no feature removal — every user-visible capability survives the refactor.

## 8. Risk Register

| Risk | Likelihood | Mitigation |
| :--- | :--: | :--- |
| Phase 2 feels like a big-bang rewrite | High | Family-by-family PRs, app always working, old code deleted per PR (grep-enforced), golden traces freeze behavior before porting |
| TS incremental turns into permanent JS | Medium | ESLint rule armies against new `.js` files in `src/`; TS conversion bundled with each family port |
| Playwright flaky (canvas/animations, remote deps) | Medium | CI-only e2e; deterministic fixed inputs; `prefers-reduced-motion` forced in tests; network mocking policy; mark remote-executor flows out for e2e |
| Trace refactor changes pacing/behavior users know | Medium | Golden-trace snapshots pin behavior before each port; visual parity check via `/dev` gallery |
| Docs drift again | Medium | README/ARCHITECTURE written against the contract; ADRами discipline; docs updated in the same PR as contract changes (PR template checkbox) |
| Dual remotes (GitHub + GitLab) diverge | Low | Decide primary remote during Phase 1; mirror policy written down |

## 9. Change Log

- **2026-10-22** — Authored from the full-repo audit; decisions locked (incremental TS; all-in testing; plan-only status).
- **2026-10-23** — Phase 6 completed in PR #2: churn-based `GraphVisualizer` port, metadata unification into the family registries, component tests for all 11 step families, the reduced-motion audit, the Lighthouse route-budget job, and the coverage gate at 87%. Definition of Done ticked with evidence; the first tagged release remains blocked on merge.
