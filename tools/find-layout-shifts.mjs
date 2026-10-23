// Finds the exact nodes that shift on the home route using the
// browser's own Layout Instability API (sources + node identity).
import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://localhost:4173/';
const waitMs = Number(process.argv[3] || 6000);

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();

await page.addInitScript(() => {
  window.__shifts = [];
  const describe = (node) => {
    if (!node) return '(null)';
    let el = node.nodeType === 1 ? node : node.parentElement;
    if (!el) return '(no element)';
    const tag = el.tagName.toLowerCase();
    const cls = (el.className && typeof el.className === 'string') ? el.className : '';
    return `${tag}${cls ? '.' + cls.split(/\s+/).slice(0, 4).join('.') : ''} | "${(el.textContent || '').trim().slice(0, 40)}"`;
  };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__shifts.push({
        value: entry.value,
        time: Math.round(entry.startTime),
        sources: entry.sources.map((s) => ({
          node: describe(s.node),
          prev: [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height],
          curr: [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height],
        })),
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
});

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(waitMs);

const shifts = await page.evaluate(() => window.__shifts);
let total = 0;
for (const s of shifts) {
  total += s.value;
  console.log(`\n=== shift ${s.value.toFixed(4)} @ ${s.time}ms ===`);
  for (const src of s.sources.slice(0, 6)) {
    console.log(`  ${src.node}`);
    console.log(`     prev [${src.prev.join(', ')}] -> curr [${src.curr.join(', ')}]`);
  }
}
console.log(`\nTOTAL CLS: ${total.toFixed(4)} across ${shifts.length} events`);

await browser.close();
