import { describe, expect, it, vi } from 'vitest';
import { Playback, collectSteps } from './playback';
import { createFakeEnv } from '../test/fakeEnv';

const steps = ['a', 'b', 'c', 'd', 'e'];

describe('Playback', () => {
  it('starts at the first step of a loaded trace', () => {
    const { env } = createFakeEnv();
    const playback = new Playback({}, env);

    playback.load(steps);

    expect(playback.currentIndex).toBe(0);
    expect(playback.total).toBe(5);
    expect(playback.currentStep).toBe('a');
    expect(playback.isPlaying).toBe(false);
  });

  it('advances one step per elapsed interval', () => {
    const fake = createFakeEnv();
    const playback = new Playback({ speed: 100 }, fake.env);

    playback.load(steps);
    playback.play();

    fake.advance(50);
    expect(playback.currentIndex).toBe(0);

    fake.advance(50);
    expect(playback.currentIndex).toBe(1);

    fake.advance(100);
    expect(playback.currentIndex).toBe(2);
  });

  it('keeps the rate independent of the frame rate', () => {
    const fake = createFakeEnv();
    const playback = new Playback({ speed: 100 }, fake.env);

    playback.load(steps);
    playback.play();

    // Ten 10ms frames is the same elapsed time as one 100ms frame.
    for (let i = 0; i < 10; i++) {
      fake.advance(10);
    }

    expect(playback.currentIndex).toBe(1);
  });

  it('advances one step per frame when the speed is zero', () => {
    const fake = createFakeEnv();
    const playback = new Playback({ speed: 0 }, fake.env);

    playback.load(steps);
    playback.play();

    fake.advance(16);
    expect(playback.currentIndex).toBe(1);

    fake.advance(16);
    expect(playback.currentIndex).toBe(2);
  });

  it('stops at the end of the trace and reports it finished', () => {
    const fake = createFakeEnv();
    const onFinish = vi.fn();
    const playback = new Playback({ speed: 0, onFinish }, fake.env);

    playback.load(steps);
    playback.play();

    for (let i = 0; i < 10; i++) {
      fake.advance(16);
    }

    expect(playback.currentIndex).toBe(4);
    expect(playback.isFinished).toBe(true);
    expect(playback.isPlaying).toBe(false);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('pauses and resumes without losing its position', () => {
    const fake = createFakeEnv();
    const playback = new Playback({ speed: 100 }, fake.env);

    playback.load(steps);
    playback.play();
    fake.advance(200);
    expect(playback.currentIndex).toBe(2);

    playback.pause();
    expect(playback.isPlaying).toBe(false);

    fake.advance(1000);
    expect(playback.currentIndex).toBe(2);

    playback.play();
    fake.advance(100);
    expect(playback.currentIndex).toBe(3);
  });

  it('steps forwards and backwards one step at a time', () => {
    const fake = createFakeEnv();
    const playback = new Playback({}, fake.env);

    playback.load(steps);
    playback.next();
    expect(playback.currentIndex).toBe(1);

    playback.next();
    expect(playback.currentIndex).toBe(2);

    playback.previous();
    expect(playback.currentIndex).toBe(1);
  });

  it('clamps seeks to the bounds of the trace', () => {
    const fake = createFakeEnv();
    const playback = new Playback({}, fake.env);

    playback.load(steps);

    playback.seek(99);
    expect(playback.currentIndex).toBe(4);

    playback.seek(-10);
    expect(playback.currentIndex).toBe(0);
  });

  it('rewinds to the start on reset', () => {
    const fake = createFakeEnv();
    const playback = new Playback({ speed: 0 }, fake.env);

    playback.load(steps);
    playback.play();
    fake.advance(16);
    fake.advance(16);
    expect(playback.currentIndex).toBe(2);

    playback.reset();
    expect(playback.currentIndex).toBe(0);
    expect(playback.isPlaying).toBe(false);
  });

  it('restarts from the beginning when play is pressed at the end', () => {
    const fake = createFakeEnv();
    const playback = new Playback({}, fake.env);

    playback.load(steps);
    playback.seek(4);
    expect(playback.isFinished).toBe(true);

    playback.play();
    expect(playback.currentIndex).toBe(0);
    expect(playback.isPlaying).toBe(true);
  });

  it('auto-pauses when the tab is hidden', () => {
    const fake = createFakeEnv();
    const playback = new Playback({ speed: 100 }, fake.env);

    playback.load(steps);
    playback.play();
    expect(playback.isPlaying).toBe(true);

    fake.setHidden(true);

    expect(playback.isPlaying).toBe(false);
  });

  it('does not resume on its own when the tab comes back', () => {
    const fake = createFakeEnv();
    const playback = new Playback({ speed: 100 }, fake.env);

    playback.load(steps);
    playback.play();
    fake.setHidden(true);
    fake.setHidden(false);

    expect(playback.isPlaying).toBe(false);
  });

  it('reports every step it moves to', () => {
    const fake = createFakeEnv();
    const onStep = vi.fn();
    const playback = new Playback({ speed: 0, onStep }, fake.env);

    playback.load(steps);
    expect(onStep).toHaveBeenCalledWith(0);

    playback.play();
    fake.advance(16);
    expect(onStep).toHaveBeenLastCalledWith(1);
  });

  it('changes speed while playing', () => {
    const fake = createFakeEnv();
    const playback = new Playback({ speed: 1000 }, fake.env);

    playback.load(steps);
    playback.play();

    fake.advance(100);
    expect(playback.currentIndex).toBe(0);

    playback.setSpeed(10);
    fake.advance(20);

    expect(playback.currentIndex).toBeGreaterThan(0);
  });

  it('stops scheduling frames once destroyed', () => {
    const fake = createFakeEnv();
    const playback = new Playback({ speed: 0 }, fake.env);

    playback.load(steps);
    playback.play();
    expect(fake.pendingFrames()).toBeGreaterThan(0);

    playback.destroy();
    expect(fake.pendingFrames()).toBe(0);
    expect(playback.isPlaying).toBe(false);
  });
});

describe('collectSteps', () => {
  it('drains a generator into an array', () => {
    function* gen() {
      yield 1;
      yield 2;
      yield 3;
    }

    expect(collectSteps(gen())).toEqual([1, 2, 3]);
  });

  it('returns an empty array for a generator that yields nothing', () => {
    function* gen() {
      // nothing
    }

    expect(collectSteps(gen())).toEqual([]);
  });
});
