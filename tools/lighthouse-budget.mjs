// Asserts the Lighthouse category scores from a JSON report against the
// budgets below. Run after `lighthouse --output=json` in CI (see the
// lighthouse job in .github/workflows/checks.yml); fails with a per-
// category table when any category is under budget.
//
// The accessibility, best-practices and SEO categories are deterministic
// on a static route, so they gate tightly. Performance varies with the
// shared runner's two cores, so its floor is deliberately generous —
// the bundle-size budget is the real performance guard.

import { readFile } from 'node:fs/promises';
import { argv, exit } from 'node:process';

const BUDGETS = {
  performance: 75,
  accessibility: 90,
  'best-practices': 85,
  seo: 90,
};

const reportPath = argv[2];
if (!reportPath) {
  console.error('usage: node tools/lighthouse-budget.mjs <lighthouse-report.json>');
  exit(2);
}

let report;
try {
  report = JSON.parse(await readFile(reportPath, 'utf8'));
} catch (error) {
  console.error(`could not read the Lighthouse report: ${error.message}`);
  exit(2);
}

const scores = Object.fromEntries(
  Object.entries(BUDGETS).map(([category, budget]) => {
    const score = report.categories?.[category]?.score;
    return [category, { score: score ?? 0, budget }];
  })
);

console.log('category         score   budget   status');
console.log('-------------------------------------------');

let failed = false;
for (const [category, { score, budget }] of Object.entries(scores)) {
  const percent = Math.round(score * 100);
  const ok = percent >= budget;
  if (!ok) failed = true;
  console.log(
    `${category.padEnd(16)} ${String(percent).padStart(3)}     ${String(budget).padStart(3)}      ${
      ok ? 'ok' : 'FAIL'
    }`
  );
}

if (failed) {
  console.error('Lighthouse budgets failed.');
  exit(1);
}

console.log('Lighthouse budgets OK.');
