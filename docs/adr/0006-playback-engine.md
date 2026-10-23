# ADR 0006 — The playback engine owns time

- **Status:** Accepted
- **Date:** 2026-10-22
- **Phase:** improvement_v2, Phase 2 (core contract and engine)
- **Supersedes:** nothing
- **Related:** [ADR 0001](0001-step-trace-contract.md)

## Context

The original visualizers each owned their own timing loop. A typical implementation awaited a `setTimeout` inside the algorithm, called React state setters as it went, and used a separate path for single-step and speed changes. The consequences were predictable:

- speed meant something different on each page;
- pause and single-step raced with the algorithm's own loop;
- seeking to a position was not possible because the visual state only existed as a side effect;
- tests had to use fake timers and observe state setters rather than a value;
- comparison mode and the arena needed their own copies of the same logic.

ADR 0001 established that algorithms should yield steps instead of calling callbacks. This ADR records the separate decision about **who advances those steps**.

## Decision

Use one framework-agnostic playback engine for every visualizer.

1. **`Playback` lives in `src/core/playback.ts`.** It holds a materialised trace, a current index and an elapsed-time accumulator. It advances on `requestAnimationFrame`.

2. **Time is based on elapsed milliseconds, not on a frame count.** The engine accumulates the time since the last frame and advances when the configured per-step duration has elapsed. The same speed therefore produces the same result on a 60 Hz and a 120 Hz display.

3. **The browser is injectable.** `PlaybackEnv` supplies `now`, `requestAnimationFrame`, `cancelAnimationFrame`, `isHidden` and `onVisibilityChange`. Tests use a fake environment and a hand-driven clock.

4. **The engine owns the transport.** `play`, `pause`, `toggle`, `next`, `previous`, `seek`, `reset` and `setSpeed` are one implementation. Seeking clamps to the trace and does not stop a running playback. Pressing play at the end restarts from the first step.

5. **The engine protects the user's attention.** It pauses when the document becomes hidden and caps catch-up advancement after a long frame, so a stalled tab does not skip most of the trace.

6. **`usePlayback` is a thin React binding.** It creates and destroys the engine, mirrors the index and play state into React, and exposes the transport. It does not reimplement timing.

7. **The trace is materialised before playback.** `collectSteps` drains the generator into an array. Seeking is then an index lookup, and a golden test can snapshot the whole run.

The arena is a deliberate exception: it advances several racers on a shared interval because the race is about simultaneous progress. Decorative animations such as confetti and the animated favicon are also outside playback time.

## Consequences

### Good

- Play, pause, single-step, speed and seeking behave the same wherever the controls are exposed; the set of visible controls still varies by page.
- Algorithm tests do not need timers or a browser.
- The playback engine has one set of edge cases to test: end of trace, empty trace, hidden tab, long frame, seek while playing.
- Comparison mode can create two engines with separate `source` identifiers and event streams.
- The 3D and canvas renderers receive steps through the same mechanism as the DOM renderers.

### Bad

- The whole trace must be generated before playback starts. A hypothetical streaming algorithm would need a different design.
- The engine uses requestAnimationFrame, so its advancement is tied to the browser's frame schedule; the accumulator smooths this but does not make it a real-time scheduler.
- The React binding must keep its state in sync without causing an extra engine per render. That is why the hook lives in one place and is tested directly.
- A contributor who adds a new visualizer must remember to use the hook rather than a local timer.

### Neutral

- `speed` is expressed as milliseconds between steps. `0` means one step per frame, which is useful for demonstration and testing.
- The engine publishes steps through the typed event bus. That is a separate decision in ADR 0001, but in practice the two are used together.

## Alternatives considered

**Leave timers in each visualizer.**

Rejected. It produced inconsistent controls, duplicated edge-case handling and untestable timing.

**Use a generic state-machine or animation library.**

Rejected. The engine is small, has no framework dependency and needs precise control over the step boundary. A library would add weight without removing a meaningful amount of code.

**Advance on `setInterval`.**

Rejected. Intervals drift, do not align with painting and behave poorly when a tab is backgrounded. requestAnimationFrame plus an accumulator is the right tool for visual playback.

**Stream steps directly from the generator.**

Rejected for now. It would reduce memory, but it would make seeking and golden traces harder, and the current trace sizes are small. Revisit only if a real algorithm makes trace memory a measured problem.

**Put playback in a web worker.**

Rejected. The rendering still happens on the main thread, and message passing would add complexity without improving the visible frame rate for these workloads.

## References

- `src/core/playback.ts` — the engine, `PlaybackEnv`, `browserEnv` and `collectSteps`
- `src/core/playback.test.ts` — transport, timing and edge-case coverage
- `src/hooks/usePlayback.ts` — the React binding
- `src/test/fakeEnv.ts` — deterministic clock used by tests
- `src/core/events.ts` — step publishing
- `src/pages/ArenaPage.jsx` — the shared race timer exception
- [ADR 0001](0001-step-trace-contract.md) — generators, steps and the event bus
- `improvement_v2.md` Phase 2
