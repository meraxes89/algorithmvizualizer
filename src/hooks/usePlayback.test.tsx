import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePlayback } from './usePlayback';
import { createFakeEnv } from '../test/fakeEnv';

const steps = ['a', 'b', 'c', 'd'];

describe('usePlayback', () => {
  it('starts at the first step of the trace', () => {
    const fake = createFakeEnv();
    const { result } = renderHook(() => usePlayback(steps, { env: fake.env }));

    expect(result.current.index).toBe(0);
    expect(result.current.total).toBe(4);
    expect(result.current.step).toBe('a');
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isFinished).toBe(false);
  });

  it('advances while it is playing', () => {
    const fake = createFakeEnv();
    const { result } = renderHook(() => usePlayback(steps, { env: fake.env, speed: 100 }));

    act(() => {
      result.current.play();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      fake.advance(100);
    });

    expect(result.current.index).toBe(1);
  });

  it('stops advancing when it is paused', () => {
    const fake = createFakeEnv();
    const { result } = renderHook(() => usePlayback(steps, { env: fake.env, speed: 100 }));

    act(() => {
      result.current.play();
    });
    act(() => {
      fake.advance(100);
    });
    expect(result.current.index).toBe(1);

    act(() => {
      result.current.pause();
    });
    act(() => {
      fake.advance(1000);
    });

    expect(result.current.index).toBe(1);
    expect(result.current.isPlaying).toBe(false);
  });

  it('steps forwards and backwards', () => {
    const fake = createFakeEnv();
    const { result } = renderHook(() => usePlayback(steps, { env: fake.env }));

    act(() => {
      result.current.next();
    });
    expect(result.current.index).toBe(1);

    act(() => {
      result.current.next();
    });
    expect(result.current.index).toBe(2);

    act(() => {
      result.current.previous();
    });
    expect(result.current.index).toBe(1);
  });

  it('seeks to a position in the trace', () => {
    const fake = createFakeEnv();
    const { result } = renderHook(() => usePlayback(steps, { env: fake.env }));

    act(() => {
      result.current.seek(3);
    });

    expect(result.current.index).toBe(3);
    expect(result.current.isFinished).toBe(true);
  });

  it('rewinds on reset', () => {
    const fake = createFakeEnv();
    const { result } = renderHook(() => usePlayback(steps, { env: fake.env, speed: 0 }));

    act(() => {
      result.current.play();
    });
    act(() => {
      fake.advance(16);
    });
    expect(result.current.index).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.index).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it('toggles between playing and paused', () => {
    const fake = createFakeEnv();
    const { result } = renderHook(() => usePlayback(steps, { env: fake.env }));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it('changes the playback speed', () => {
    const fake = createFakeEnv();
    const { result } = renderHook(() => usePlayback(steps, { env: fake.env, speed: 1000 }));

    expect(result.current.speed).toBe(1000);

    act(() => {
      result.current.setSpeed(50);
    });

    expect(result.current.speed).toBe(50);
  });

  it('reloads the trace when a different one is given', () => {
    const fake = createFakeEnv();
    const { result, rerender } = renderHook(
      ({ trace }: { trace: readonly string[] }) => usePlayback(trace, { env: fake.env }),
      { initialProps: { trace: steps } }
    );

    act(() => {
      result.current.seek(2);
    });
    expect(result.current.index).toBe(2);

    rerender({ trace: ['x', 'y'] });

    expect(result.current.index).toBe(0);
    expect(result.current.total).toBe(2);
  });
});
