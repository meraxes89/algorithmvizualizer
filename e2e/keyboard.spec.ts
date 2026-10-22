import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  });
});

test('command palette traps focus and closes on Escape', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Search algorithms' });
  const input = page.getByRole('combobox', { name: 'Search algorithms' });
  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();

  await input.fill('sort');
  const clear = page.getByRole('button', { name: 'Clear search' });
  await expect(clear).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(clear).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('listbox', { name: 'Matching algorithms' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('algorithm menu opens from the keyboard and closes on Escape', async ({ page }) => {
  await page.goto('/');

  const trigger = page.getByRole('button', { name: 'Algorithms' });
  const menu = page.locator('#algorithms-menu');

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();
});

test('mobile navigation button exposes its state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const open = page.getByRole('button', { name: 'Open navigation' });
  await open.click();
  const close = page.getByRole('button', { name: 'Close navigation' });
  await expect(close).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu')).toBeVisible();

  await close.click();
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
});
