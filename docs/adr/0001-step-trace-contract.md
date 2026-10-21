# ADR 0001 — The Step Trace Contract

- **Status:** Accepted
- **Date:** 2026-10-22
- **Phase:** improvement_v2, Phase 2 (core contract & engine)
- **Supersedes:** nothing

## Context

Every algorithm in this repo is written as a callback-driven function that
reaches out into React state and mutates it as it goes:

```js
export async function bubbleSort(array, updateArray, setComparingIndices, ...) {
  setComparingIndices([j, j + 1]);
  await new Promise(resolve => setTimeout(resolve, speed));
  ...
}
```

That shape has a cost that is easy to underestimate until you try to change
something:

1. **It cannot be tested.** The only way to observe a bubble sort is to
   supply four state setters and watch what they are called with. There is
   no value to assert on, only a sequence of side effects.
2. **It cannot be scrubbed.** The visualisation is whatever the callbacks
   happened to leave in state. You cannot jump to step 300, because step
   300 only ever existed as a side effect.
3. **It cannot be reused.** The same algorithm cannot drive the sorting page,
   the Arena race, and a toy preview, because each of those needs a
   different set of callbacks. This is why BFS exists in five places in
   this repo and bubble sort in three.
4. **It owns its own time.** Every one of the ten visualizers has its own
   `setTimeout` chain, so play, pause, speed and step behave differently in
   each of them.

The audit behind `improvement_v2.md` also found that the same algorithm is
reimplemented several times over, each copy with its own step shape. That
is not a discipline problem, it is a consequence of the shape: if the only
way to consume an algorithm is "give it my callbacks", then two consumers
with different needs means two implementations.

## Decision

**Algorithms become pure generators that yield typed steps. A step is the
only thing an algorithm says about itself.**

```ts
function* bubbleSort(input: readonly number[]): Generator<SortStep, void, undefined>
```

Three rules follow, and they are enforced by ESLint rather than by review
(see `eslint.config.js`):

- **R1 — algorithms are pure and synchronous.** No React, no DOM, no
  timers, no `setState`. `src/algorithms/**` may not import React and may
  not reference `document`, `window`, `navigator` or browser storage. The
  linter fails the build if it does.
- **R2 — the playback engine owns time.** `core/playback.ts` is the only
  place that decides when a step happens. All ten visualizers drive it
  through `hooks/usePlayback.ts`.
- **R3 — side effects are subscribers.** The sound engine, the confetti
  burst and the animated favicon listen to `core/events.ts`. They are never
  passed into an algorithm.
- **R4 — visualizers are dumb.** A visualizer is a function of
  `(input, currentStep)`. It never folds deltas, never knows what came
  before, and can render any step of a trace on its own.
- **R5 — one implementation per algorithm.** Every surface reads the same
  registry entry.

### A step carries the whole view

Each step is a discriminated union of two things:

```ts
{ family: 'sorting', t: 'compare', view: SortView }
```

- `t` says **what happened** — this is the semantic payload. The sound
  engine reacts to it, the event bus publishes it, the "now doing…" line
  reads it.
- `view` carries **the complete visual state after that event** — this is
  the render payload.

The obvious alternative is to make steps *deltas* (`{ t: 'swap', i, j }`)
and have something fold them into state. We rejected that:

- A delta step is not renderable on its own, so R4 breaks: either the
  visualizer folds (not dumb) or the engine folds, and the engine would
  need a reducer per family, re-implemented seven times.
- Folding is also what makes scrubbing expensive. With full-state steps,
  "seek to step N" is "render step N" — an array lookup.
- The states are small. A sorted array of 40 numbers, a list of cell
  references, a map of vertex states. The existing implementations already
  copy the array on every step (`updateArray([...arr])`), so this is not a
  new cost.

The cost of the choice is repetition inside a trace, and the benefit is that
every visualizer becomes a pure function and every trace becomes a golden
fixture.

### Every step carries its family

`family` is a discriminant of its own, not just `t`.

Several families legitimately use the same words — `done` appears in all
seven, `visit` in three, `path` in two. If `t` were the only discriminant,
`AnyStep` would not be a sound discriminated union, and a runtime check
like "is this a sorting step?" could not be written without guessing.

With `family` as a discriminant, `switch (step.family)` narrows soundly
and `isStepOfFamily` is exact. It also makes a trace self-describing: a
golden-trace file says what every step is without needing the registry to
interpret it.

## Consequences

**Good**

- Algorithms become testable on their own: a test asserts the trace, not a
  pile of mock callbacks. A golden trace freezes the behaviour before a
  port, and a property test asserts the invariant the algorithm is supposed
  to have (a sort is a permutation of its input, a search finds a target
  that is present, a maze is solvable).
- The visualizers collapse to rendering. The `setTimeout` chains, the
  per-component speed handling and the hand-rolled step logic all go away.
- One implementation per algorithm becomes possible, because a generator has
  no opinion about who is listening.
- The step schema doubles as the documentation of what an algorithm does,
  and it is type-checked.

**Bad**

- Traces are larger than they need to be, because each step repeats the
  state.
- A step schema has to be designed before the first algorithm is ported, and
  a wrong schema means touching every step of every ported algorithm. The
  schema is therefore expected to change during Phase 2; the golden traces
  are what make that change safe.
- Adding a family means adding a view type and a step union to
  `core/steps.ts`, not just writing a new algorithm.

**Neutral**

- The `t` values are per family and not globally unique (`done` is shared).
  Consumers that care about the difference work within a family, where the
  discriminant is unambiguous.

## Alternatives considered

**Keep the callbacks, add tests around them.**
Rejected. The callback shape is the reason the algorithms cannot be reused,
scrubbed or compared against each other. Testing it does not fix the
underlying problem, and the five-copies-of-BFS problem survives.

**Deltas plus a per-family reducer in the engine.**
Rejected for the reasons above: it breaks R4, it multiplies the reducer
work by the number of families, and it makes seeking a fold rather than a
lookup.

**A state-machine library (XState, or a custom interpreter).**
Rejected as unnecessary. The state we need is "a list of steps and a
position in it", which is a list and a number. A library would add a
dependency and a vocabulary without removing any real complexity.

**Immutable persistent state snapshots.**
Rejected. The states are small enough to copy, and copying is what the
existing implementations already do.

## References

- `improvement_v2.md` §2 (target architecture) and §5 Phase 2 (execution
  phases)
- `src/core/steps.ts` — the contract
- `src/core/playback.ts` — the engine
- `src/core/events.ts` — the event bus
- `src/hooks/usePlayback.ts` — the React binding
- `eslint.config.js` — the boundary rules that enforce R1
