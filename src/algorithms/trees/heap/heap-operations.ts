import type { HeapStep, HeapView, TreeLogEntry } from '@core/steps';

/**
 * A heap is an array with an invariant, not a tree of pointers, so its
 * view is an array and its highlights are indices.
 */
export class HeapTrace {
  active: number | null = null;
  comparing: number[] = [];
  swapping: number[] = [];
  log: TreeLogEntry[] = [];

  view(values: readonly number[]): HeapView {
    return {
      values: [...values],
      active: this.active,
      comparing: [...this.comparing],
      swapping: [...this.swapping],
      log: [...this.log],
    };
  }

  say(entry: TreeLogEntry): void {
    this.log.push(entry);
  }
}

/** Build a heap step. The helper keeps the object literal out of the
 * ambiguous position after `yield`. */
export const heapStep = (step: HeapStep): HeapStep => step;

/**
 * Insert a value into a heap.
 *
 * The value goes to the end and then bubbles up until the heap property
 * holds again: every parent is at least as large as its children for a
 * max-heap, and at most as large for a min-heap.
 */
export function* heapInsert(
  values: readonly number[],
  value: number,
  isMaxHeap: boolean
): Generator<HeapStep, number[], undefined> {
  const trace = new HeapTrace();
  const heap = [...values, value];
  const compare = isMaxHeap ? '>' : '<';
  const wins = (a: number, b: number) => (isMaxHeap ? a > b : a < b);

  trace.say({
    type: 'start',
    text: `Inserting ${value} into ${isMaxHeap ? 'Max' : 'Min'} Heap…`,
  });
  yield heapStep({
    family: 'heap',
    t: 'log',
    view: trace.view(heap),
    entry: trace.log[0],
  });

  let current = heap.length - 1;

  trace.say({ type: 'info', text: `Added ${value} at index ${current}.` });
  trace.active = current;
  yield heapStep({
    family: 'heap',
    t: 'log',
    view: trace.view(heap),
    entry: trace.log[trace.log.length - 1],
  });
  yield heapStep({
    family: 'heap',
    t: 'active',
    view: trace.view(heap),
    index: current,
  });

  // Bubble up.
  while (current > 0) {
    const parent = Math.floor((current - 1) / 2);

    trace.comparing = [current, parent];
    trace.say({
      type: 'compare',
      text: `Comparing node ${heap[current]} with parent ${heap[parent]}`,
    });
    yield heapStep({
      family: 'heap',
      t: 'log',
      view: trace.view(heap),
      entry: trace.log[trace.log.length - 1],
    });
    yield heapStep({
      family: 'heap',
      t: 'compare',
      view: trace.view(heap),
      indices: [current, parent],
    });

    if (wins(heap[current], heap[parent])) {
      trace.say({
        type: 'success',
        text: `${heap[current]} ${compare} ${heap[parent]}. Swapping!`,
      });
      trace.swapping = [current, parent];
      yield heapStep({
        family: 'heap',
        t: 'log',
        view: trace.view(heap),
        entry: trace.log[trace.log.length - 1],
      });
      yield heapStep({
        family: 'heap',
        t: 'swap',
        view: trace.view(heap),
        indices: [current, parent],
      });

      [heap[current], heap[parent]] = [heap[parent], heap[current]];
      current = parent;

      trace.swapping = [];
      trace.active = current;
      yield heapStep({
        family: 'heap',
        t: 'active',
        view: trace.view(heap),
        index: current,
      });
    } else {
      trace.say({ type: 'info', text: `Heap property satisfied. Stopping bubble-up.` });
      yield heapStep({
        family: 'heap',
        t: 'log',
        view: trace.view(heap),
        entry: trace.log[trace.log.length - 1],
      });
      break;
    }
  }

  trace.comparing = [];
  trace.active = null;
  trace.say({ type: 'success', text: `Insertion complete.` });
  yield heapStep({
    family: 'heap',
    t: 'log',
    view: trace.view(heap),
    entry: trace.log[trace.log.length - 1],
  });

  return heap;
}

/**
 * Take the root out of a heap.
 *
 * The root is swapped with the last element, which is then removed, and
 * the heap is sifted back down until the property holds again.
 */
export function* heapDelete(
  values: readonly number[],
  isMaxHeap: boolean
): Generator<HeapStep, number[], undefined> {
  const trace = new HeapTrace();
  const heap = [...values];
  const compare = isMaxHeap ? '>' : '<';
  const wins = (a: number, b: number) => (isMaxHeap ? a > b : a < b);

  if (heap.length === 0) {
    trace.say({ type: 'warn', text: 'Heap is empty. Nothing to extract.' });
    yield heapStep({
      family: 'heap',
      t: 'log',
      view: trace.view(heap),
      entry: trace.log[0],
    });
    return heap;
  }

  const rootValue = heap[0];
  trace.say({
    type: 'start',
    text: `Extracting root (${rootValue}) from ${isMaxHeap ? 'Max' : 'Min'} Heap…`,
  });
  yield heapStep({
    family: 'heap',
    t: 'log',
    view: trace.view(heap),
    entry: trace.log[0],
  });

  if (heap.length === 1) {
    trace.say({ type: 'info', text: `Removed the only element.` });
    yield heapStep({
      family: 'heap',
      t: 'log',
      view: trace.view(heap),
      entry: trace.log[trace.log.length - 1],
    });
    return [];
  }

  // Swap the root with the last element and drop it.
  const lastIndex = heap.length - 1;
  const lastValue = heap[lastIndex];

  trace.active = 0;
  trace.swapping = [0, lastIndex];
  trace.say({
    type: 'info',
    text: `Swapping root (${rootValue}) with last element (${lastValue}).`,
  });
  yield heapStep({
    family: 'heap',
    t: 'log',
    view: trace.view(heap),
    entry: trace.log[trace.log.length - 1],
  });
  yield heapStep({
    family: 'heap',
    t: 'swap',
    view: trace.view(heap),
    indices: [0, lastIndex],
  });

  heap[0] = lastValue;
  heap.pop();

  trace.swapping = [];
  trace.say({ type: 'info', text: `Root extracted. New root is ${lastValue}.` });
  yield heapStep({
    family: 'heap',
    t: 'log',
    view: trace.view(heap),
    entry: trace.log[trace.log.length - 1],
  });

  // Sift the new root back down.
  let current = 0;

  for (;;) {
    trace.active = current;
    const left = 2 * current + 1;
    const right = 2 * current + 2;
    let target = current;

    const comparing: number[] = [];
    if (left < heap.length) comparing.push(left);
    if (right < heap.length) comparing.push(right);

    if (comparing.length > 0) {
      trace.comparing = comparing;
      trace.say({
        type: 'compare',
        text: `Checking children of ${heap[current]}: ${comparing
          .map((index) => heap[index])
          .join(', ')}`,
      });
      yield heapStep({
        family: 'heap',
        t: 'log',
        view: trace.view(heap),
        entry: trace.log[trace.log.length - 1],
      });
      yield heapStep({
        family: 'heap',
        t: 'compare',
        view: trace.view(heap),
        indices: comparing,
      });
    }

    if (left < heap.length && wins(heap[left], heap[target])) {
      target = left;
    }
    if (right < heap.length && wins(heap[right], heap[target])) {
      target = right;
    }

    if (target === current) {
      trace.say({ type: 'info', text: `Heap property satisfied at index ${current}.` });
      yield heapStep({
        family: 'heap',
        t: 'log',
        view: trace.view(heap),
        entry: trace.log[trace.log.length - 1],
      });
      break;
    }

    trace.say({
      type: 'success',
      text: `${heap[target]} ${compare} ${heap[current]}. Swapping!`,
    });
    trace.swapping = [current, target];
    yield heapStep({
      family: 'heap',
      t: 'log',
      view: trace.view(heap),
      entry: trace.log[trace.log.length - 1],
    });
    yield heapStep({
      family: 'heap',
      t: 'swap',
      view: trace.view(heap),
      indices: [current, target],
    });

    [heap[current], heap[target]] = [heap[target], heap[current]];
    current = target;

    trace.swapping = [];
    yield heapStep({
      family: 'heap',
      t: 'active',
      view: trace.view(heap),
      index: current,
    });
  }

  trace.comparing = [];
  trace.active = null;
  trace.say({ type: 'success', text: `Extraction complete.` });
  yield heapStep({
    family: 'heap',
    t: 'log',
    view: trace.view(heap),
    entry: trace.log[trace.log.length - 1],
  });

  return heap;
}
