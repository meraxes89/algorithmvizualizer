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
  view: { vertices: {}, edges: {}, path: [], queue: [], stack: [] },
};

const event = (index = 0, total = 1) => ({
  family: 'sorting' as const,
  step: sortStep,
  index,
  total,
  source: 'test',
  meta: {},
});

describe('StepEventBus', () => {
  it('delivers an event to the handlers of its own family', () => {
    const bus = new StepEventBus();
    const sorting = vi.fn();
    const graph = vi.fn();

    bus.on('sorting', sorting);
    bus.on('graph', graph);

    bus.emit(event());

    expect(sorting).toHaveBeenCalledTimes(1);
    expect(graph).not.toHaveBeenCalled();
  });

  it('carries the step, the index, the total, the source and the metadata', () => {
    const bus = new StepEventBus();
    const handler = vi.fn();

    bus.on('sorting', handler);
    bus.emit({ ...event(7, 42), source: 'sorting-page', meta: { algorithm: 'Bubble Sort' } });

    expect(handler).toHaveBeenCalledWith({
      family: 'sorting',
      step: sortStep,
      index: 7,
      total: 42,
      source: 'sorting-page',
      meta: { algorithm: 'Bubble Sort' },
    });
  });

  it('unsubscribes when the returned function is called', () => {
    const bus = new StepEventBus();
    const handler = vi.fn();

    const unsubscribe = bus.on('sorting', handler);
    bus.emit(event());
    unsubscribe();
    bus.emit(event(1, 2));

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

    expect(() => bus.emit(event())).not.toThrow();

    expect(second).toHaveBeenCalledTimes(1);
  });

  it('delivers to every family when subscribed with onAny', () => {
    const bus = new StepEventBus();
    const any = vi.fn();

    bus.onAny(any);
    bus.emit(event());
    bus.emit({
      family: 'graph',
      step: graphStep,
      index: 1,
      total: 2,
      source: 'test',
      meta: {},
    });

    expect(any).toHaveBeenCalledTimes(2);
  });

  it('ignores an emit when nobody is listening', () => {
    const bus = new StepEventBus();
    expect(() => bus.emit(event())).not.toThrow();
  });

  it('drops every subscription on clear', () => {
    const bus = new StepEventBus();
    bus.on('sorting', vi.fn());
    bus.on('graph', vi.fn());

    expect(bus.handlerCount('sorting')).toBe(1);
    expect(bus.handlerCount('graph')).toBe(1);

    bus.clear();

    expect(bus.handlerCount('sorting')).toBe(0);
    expect(bus.handlerCount('graph')).toBe(0);
  });
});

describe('publishStep', () => {
  it('publishes on the shared bus with a default source and metadata', () => {
    const handler = vi.fn();
    const unsubscribe = stepBus.on('sorting', handler);

    publishStep('sorting', sortStep, 3, 10);

    expect(handler).toHaveBeenCalledWith({
      family: 'sorting',
      step: sortStep,
      index: 3,
      total: 10,
      source: 'unknown',
      meta: {},
    });

    unsubscribe();
  });

  it('publishes with an explicit source and metadata', () => {
    const handler = vi.fn();
    const unsubscribe = stepBus.on('sorting', handler);

    publishStep('sorting', sortStep, 0, 1, 'sorting-page', { algorithm: 'Quick Sort' });

    expect(handler).toHaveBeenCalledWith({
      family: 'sorting',
      step: sortStep,
      index: 0,
      total: 1,
      source: 'sorting-page',
      meta: { algorithm: 'Quick Sort' },
    });

    unsubscribe();
  });
});
