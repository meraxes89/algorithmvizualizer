import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Every user-facing route, scanned with axe's default rule set.
 *
 * The tour is marked as seen before the app boots: it is a first-visit
 * overlay and would otherwise sit on top of every page during the scan.
 * The event-bus sound engine is silent in headless Chromium.
 */
const ROUTES = [
  ['home', '/'],
  ['categories', '/algorithms'],
  ['sorting', '/sorting'],
  ['searching', '/searching'],
  ['pathfinding', '/pathfinding'],
  ['graph', '/graph'],
  ['trees', '/trees'],
  ['recursion', '/recursion'],
  ['dp', '/dp'],
  ['playground', '/playground'],
  ['arena', '/arena'],
  ['quiz', '/quiz'],
  ['dev gallery', '/_dev'],
  ['not found', '/this-route-does-not-exist'],
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  });
});

for (const [name, path] of ROUTES) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${name} (${theme}) is axe-clean`, async ({ page }) => {
      await page.addInitScript((value) => {
        localStorage.setItem('av-theme', value);
      }, theme);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const results = await new AxeBuilder({ page }).analyze();
      const violations = results.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.map((node) => node.target.join(' ')),
      }));

      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });
  }
}

test('command palette is axe-clean when open', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Search algorithms' })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(' ')),
  }));

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});

test('mobile navigation is axe-clean when open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('button', { name: 'Close navigation' })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(' ')),
  }));

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});
