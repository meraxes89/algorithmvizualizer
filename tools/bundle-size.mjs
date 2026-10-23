#!/usr/bin/env node
// tools/bundle-size.mjs
//
// Fails when a built chunk grows past its budget. Prices are the current
// production sizes plus a little headroom, so the budget catches a real
// regression without failing the PR over a couple of kilobytes.
//
// Usage: pnpm build && pnpm size

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.cwd(), 'dist/assets');
const BUDGET_FILE = path.resolve(process.cwd(), 'tools/bundle-budget.json');

if (!fs.existsSync(DIST)) {
  console.error('dist/assets not found — run `pnpm build` first.');
  process.exit(1);
}

const budgets = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));

const files = fs.readdirSync(DIST).filter((f) => f.endsWith('.js') || f.endsWith('.css'));

// Map a built file back to the chunk name it was emitted for, e.g.
// "three-OLgnuCNn.js" -> "three.js". The extension is kept so the
// app's JS and CSS entry chunks are budgeted separately.
const chunkOf = (file) => file.replace(/-[A-Za-z0-9_-]{8}(\.(js|css))$/, '$1');

const sizes = new Map();
for (const file of files) {
  const chunk = chunkOf(file);
  const size = fs.statSync(path.join(DIST, file)).size;
  sizes.set(chunk, Math.max(sizes.get(chunk) ?? 0, size));
}

let failed = false;
const rows = [];

for (const [chunk, size] of [...sizes.entries()].sort((a, b) => b[1] - a[1])) {
  const budget = budgets[chunk];
  const kb = size / 1024;
  if (budget === undefined) {
    rows.push({ chunk, kb, budget: '-', status: 'new' });
    continue;
  }
  const over = size > budget;
  if (over) failed = true;
  rows.push({
    chunk,
    kb,
    budget: (budget / 1024).toFixed(1),
    status: over ? 'OVER' : 'ok',
  });
}

const pad = (v, n) => String(v).padEnd(n);
console.log(pad('chunk', 34) + pad('size (kB)', 12) + pad('budget (kB)', 14) + 'status');
console.log('-'.repeat(70));
for (const r of rows) {
  console.log(pad(r.chunk, 34) + pad(r.kb.toFixed(1), 12) + pad(r.budget, 14) + r.status);
}

if (failed) {
  console.error('\nBundle budget exceeded.');
  process.exit(1);
}
console.log('\nBundle budget OK.');
