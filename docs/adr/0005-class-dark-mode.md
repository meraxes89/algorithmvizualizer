# ADR 0005 — Class-based dark mode and design tokens

- **Status:** Accepted
- **Date:** 2026-10-22
- **Phase:** improvement_v2, Phase 4 (theme architecture and accessibility)
- **Supersedes:** nothing

## Context

The application has two visual identities that must stay in sync: a warm paper-and-ink light theme and a midnight dark theme. Colours appear in four rendering environments:

- Tailwind utility classes and ordinary DOM styles;
- inline SVG attributes;
- Canvas 2D drawing code;
- Three.js materials and WebGL scene setup.

Before the token pass, colours were assembled from a mix of Tailwind classes, raw hex strings and hard-coded palettes in canvas components. That made dark mode inconsistent: a component could look correct in one renderer and wrong in another. It also made a theme change a search-and-replace exercise rather than a token change.

Two constraints shaped the solution:

1. **The user choice is explicit.** A system-preference-only media query is not enough; the app needs a persistent light/dark toggle.
2. **Canvas and WebGL cannot read CSS variables directly.** They need resolved colour values, updated when the theme changes.

## Decision

Use a **class-based theme** with a shared token layer.

1. Tailwind is configured with `darkMode: 'class'`. The `dark` class lives on `<html>`.

2. An inline script in `index.html` sets the initial class from `localStorage` (`av-theme`) or the system preference before React boots. This avoids a flash of the wrong theme.

3. `ThemeProvider` owns the React state. It toggles the class, persists the choice, and uses the View Transitions API for a circular reveal where the browser supports it. The transition is progressive enhancement; the theme still switches without it.

4. Canonical colour values live in `src/index.css`:
   - chrome tokens such as `--paper-*`, `--ink-*`, `--accent*` and `--line-*`;
   - visualization tokens such as `--viz-canvas`, `--viz-compare`, `--viz-swap`, `--viz-visited` and `--viz-path`.

   `:root` holds the light values and `.dark` overrides them.

5. Three access paths cover the renderers:
   - CSS, inline styles and SVG use `viz.*` or `var(--viz-*)`, so the browser resolves the current theme automatically;
   - Canvas 2D uses `readVizColors()` or `useCanvasPalette()` to obtain resolved values;
   - Three.js uses `useVizColors()` and rebuilds its materials when the theme class changes.

6. Raw hex colours are allowed only in `src/theme/**` and `src/index.css`. ESLint rejects them elsewhere.

7. The development gallery at `/_dev` renders every state token and both bar renderers side by side, in both themes.

## Consequences

### Good

- One class toggle updates every CSS-driven surface.
- Canvas and WebGL get the same palette through an explicit bridge instead of maintaining a second hard-coded colour table.
- Light and dark values sit next to each other in one file, which makes contrast review practical.
- The boot script removes the most visible theme bug: a light flash before a saved dark preference loads.
- The hex rule makes it obvious when a new colour bypasses the system.

### Bad

- Canvas and WebGL colours are resolved values, so they need an observer and a re-render when the class changes. A component that forgets the hook will keep the old palette.
- The theme depends on JavaScript for the toggle (the boot script handles the initial paint, but changing themes requires the provider).
- WebGL scenes may need to rebuild materials rather than just change a uniform; that is more expensive than a CSS variable update.
- The View Transitions API is not available in every browser, so the reveal is intentionally optional.

### Neutral

- `AccentColorManager` writes route-specific accent variables on the same root element. Those overrides coexist with the theme tokens and are restored when the route changes.
- Fonts are loaded separately from the colour tokens; this ADR does not cover typography.

## Alternatives considered

**Use a media-query-only dark mode.**

Rejected. It would remove the user toggle and make screenshots and accessibility checks depend on the operating system setting. The product needs an explicit choice.

**Keep colours in Tailwind classes only.**

Rejected. Tailwind classes cannot paint a canvas or a WebGL material. The application has too much custom rendering for that to be the only layer.

**Maintain a JavaScript palette and a CSS palette.**

Rejected. Two palettes drift. A single CSS source with a resolver keeps canvas and DOM values aligned.

**Use a CSS-in-JS theme provider for everything.**

Rejected. It would add runtime and a large migration for a design that Tailwind and CSS variables already express well.

**Read CSS variables from every canvas draw call.**

Rejected. `getComputedStyle` in a draw loop is unnecessary work. Read once per theme change and cache the resolved values.

## References

- `src/index.css` — canonical light and dark token values
- `src/theme/vizTokens.ts` — token names and the CSS/canvas/WebGL bridge
- `src/hooks/useVizColors.ts` — theme observer for resolved colours
- `src/utils/useCanvasPalette.js` — 2D palette observer
- `src/context/ThemeContext.jsx` — theme state, persistence and the view transition
- `src/components/AccentColorManager.jsx` — route-level accent overrides
- `index.html` — the pre-paint theme boot script
- `tailwind.config.js` — `darkMode: 'class'`
- `src/pages/DevGallery.tsx` — the visual token gallery
- `improvement_v2.md` Phase 4
