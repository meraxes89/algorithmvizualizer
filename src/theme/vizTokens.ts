/**
 * The visualization token contract.
 *
 * The values live in `src/index.css` so the same colours work in
 * Tailwind classes, inline styles and SVG. Canvas and WebGL cannot parse
 * `var(...)`, so those paths call `readVizColors()` (or `useVizColors`)
 * and receive the resolved values.
 *
 * `viz` returns CSS references for anything that accepts a colour; it is
 * the preferred form because it follows a theme change with no re-render.
 */

const TOKEN = {
  canvas: '--viz-canvas',
  canvasDot: '--viz-canvas-dot',
  surface: '--viz-surface',
  surface2: '--viz-surface-2',
  surface3: '--viz-surface-3',
  edge: '--viz-edge',
  ink: '--viz-ink',
  inkMuted: '--viz-ink-muted',
  muted: '--viz-muted',
  nodeText: '--viz-node-text',
  onBright: '--viz-on-bright',
  node: '--viz-node',
  shadow: '--viz-shadow',
  overlay: '--viz-overlay',
  grid: '--viz-grid',

  idle: '--viz-idle',
  default: '--viz-default',
  infoText: '--viz-info-text',
  active: '--viz-active',
  compare: '--viz-compare',
  swap: '--viz-swap',
  sorted: '--viz-sorted',
  sortedStrong: '--viz-sorted-strong',
  visited: '--viz-visited',
  path: '--viz-path',
  pivot: '--viz-pivot',
  pivotStrong: '--viz-pivot-strong',
  warning: '--viz-warning',
  danger: '--viz-danger',
  dangerStrong: '--viz-danger-strong',
  wall: '--viz-wall',
  start: '--viz-start',
  end: '--viz-end',

  nodeDefaultFrom: '--viz-node-default-from',
  nodeDefaultTo: '--viz-node-default-to',
  nodeActiveFrom: '--viz-node-active-from',
  nodeActiveTo: '--viz-node-active-to',
  nodeFoundFrom: '--viz-node-found-from',
  nodeFoundTo: '--viz-node-found-to',
  nodeVisitedFrom: '--viz-node-visited-from',
  nodeVisitedTo: '--viz-node-visited-to',
  nodeDeleteFrom: '--viz-node-delete-from',
  nodeDeleteTo: '--viz-node-delete-to',
  nodeWarnFrom: '--viz-node-warn-from',
  nodeWarnTo: '--viz-node-warn-to',
  nodePivotFrom: '--viz-node-pivot-from',
  nodePivotTo: '--viz-node-pivot-to',
  nodeDefaultSoft: '--viz-node-default-soft',
  nodeActiveSoft: '--viz-node-active-soft',
  nodeFoundSoft: '--viz-node-found-soft',
  nodeVisitedSoft: '--viz-node-visited-soft',
  nodeDeleteSoft: '--viz-node-delete-soft',
  nodePivotSoft: '--viz-node-pivot-soft',

  threeBg: '--viz-3d-bg',
  threeGridCenter: '--viz-3d-grid-center',
  threeGridLine: '--viz-3d-grid-line',
  threeLight: '--viz-3d-light',
  threeSky: '--viz-3d-sky',
  threeGround: '--viz-3d-ground',
  threeGroundGrid: '--viz-3d-ground-grid',
  threeBuilding: '--viz-3d-building',
  threeNode: '--viz-3d-node',
} as const;

export type VizColorName = keyof typeof TOKEN;
export type VizColors = Record<VizColorName, string>;

const NAMES = Object.keys(TOKEN) as VizColorName[];

/** CSS references, for inline styles, SVG and Tailwind arbitraries. */
export const viz = Object.fromEntries(
  NAMES.map((name) => [name, `var(${TOKEN[name]})`])
) as VizColors;

function emptyColors(): VizColors {
  return Object.fromEntries(NAMES.map((name) => [name, ''])) as VizColors;
}

/**
 * Resolved values, for canvas and WebGL. Call after the theme class is on
 * `<html>`; `useVizColors()` handles that and re-reads on a theme change.
 */
export function readVizColors(): VizColors {
  if (typeof document === 'undefined') return emptyColors();

  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    NAMES.map((name) => [name, style.getPropertyValue(TOKEN[name]).trim()])
  ) as VizColors;
}
