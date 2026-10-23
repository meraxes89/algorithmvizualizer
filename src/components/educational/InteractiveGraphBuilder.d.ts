/**
 * Type surface for the not-yet-ported graph builder.
 *
 * `InteractiveGraphBuilder.jsx` is grandfathered JS; this declaration is the
 * typed boundary so importing it from TypeScript does not drag the whole
 * file under `checkJs`. Delete it when the builder converts to `.tsx`.
 */
import type { ComponentType } from 'react';

/** The graph shape the builder takes in and reports back. */
export type BuilderGraph = {
  vertices?: readonly {
    id: number;
    label: string;
    x: number;
    y: number;
  }[];
  edges?: readonly {
    from: number;
    to: number;
    weight: number;
  }[];
  isDirected?: boolean;
};

declare const InteractiveGraphBuilder: ComponentType<{
  isOpen: boolean;
  initialGraph?: BuilderGraph;
  onGraphChange?: (graph: BuilderGraph) => void;
}>;

export default InteractiveGraphBuilder;
