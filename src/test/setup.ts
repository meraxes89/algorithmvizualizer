import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom does not implement Element.scrollIntoView, and several
// visualizers auto-scroll their step log to the newest entry.
// The no-op covers every component test instead of one stub per file.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Unmount anything a component test rendered, so state never leaks
// between test cases.
afterEach(() => {
  cleanup();
});
