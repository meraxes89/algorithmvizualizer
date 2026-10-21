import { describe, expect, it, vi } from 'vitest';
import { StepEventBus, publishStep, stepBus } from './events';
import type { GraphStep, SortStep } from './steps';

const sortStep: SortStep = {
  family: 'sorting',
  t: 'compare',
  view: { array: [1, 2], comparing: [0, 1], swapping: [], sorted: [] },
};

const graphStep: GraphStep = {
  family: 'graph',
  t: 'visit',
  view: { vertices: {}, edges: {}, path: [] },
  vertex: 3,
};

describe('StepEventBus', () => {
  it('delivers an event to the handlers of its own family', () => {
    const bus = new StepEventBus();
    const sorting = vi.fn();
    const graph = vi.fn();

    bus.on('sorting', sorting);
    bus.on('graph', graph);

    bus.emit({ family: 'sorting', step: sortStep, index: 0, total: 1 });

    expect(sorting).toHaveBeenCalledTimes(1);
    expect(graph).not.toHaveBeenCalled();
  });

  it('carries the step, the index and the total', () => {
    const bus = new StepEventBus();
    const handler = vi.fn();

    bus.on('sorting', handler);
    bus.emit({ family: 'sorting', step: sortStep, index: 7, total: 42 });

    expect(handler).toHaveBeenCalledWith({
      family: 'sorting',
      step: sortStep,
      index: 7,
      total: 42,
    });
  });

  it('unsubscribes when the returned function is called', () => {
    const bus = new StepEventBus();
    const handler = vi.fn();

    const unsubscribe = bus.on('sorting', handler);
    bus.emit({ family: 'sorting', step: sortStep, index: 0, total: 1 });
    unsubscribe();
    bus.emit({ family: 'sorting', step: sortStep, index: 1, total: 2 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(bus.handlerCount('sorting')).toBe(0);
  });

  it('survives a handler that unsubscribes during delivery', () => {
    const bus = new StepEventBus();
    const second = vi.fn();
    const unsubscribeFirst = bus.on('sorting', () => {
      unsubscribeFirst();
    });
    bus.on('sorting', second);

    expect(() => bus.emit({ family: 'sorting', step: sortStep, index: 0, total: 1 })).not.toThrow();

    expect(second).toHaveBeenCalledTimes(1);
  });

  it('delivers to every family when subscribed with onAny', () => {
    const bus = new StepEventBus();
    const any = vi.fn();

    bus.onAny(any);
    bus.emit({ family: 'sorting', step: sortStep, index: 0, total: 1 });
    bus.emit({ family: 'graph', step: graphStep, index: 1, total: 2 });

    expect(any).toHaveBeenCalledTimes(2);
  });

  it('ignores an emit when nobody is listening', () => {
    const bus = new StepEventBus();
    expect(() => bus.emit({ family: 'sorting', step: sortStep, index: 0, total: 1 })).not.toThrow();
  });
});

describe('publishStep', () => {
  it('publishes on the shared bus', () => {
    const handler = vi.fn();
    const unsubscribe = stepBus.on('sorting', handler);

    publishStep('sorting', sortStep, 3, 10);

    expect(handler).toHaveBeenCalledWith({
      family: 'sorting',
      step: sortStep,
      index: 3,
      total: 10,
    });

    unsubscribe();
  });
});
