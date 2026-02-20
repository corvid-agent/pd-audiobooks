import { test, expect } from '@playwright/test';
import { mockLibriVoxAPI, dismissOnboarding } from './helpers';

test.describe('Browse', () => {
  test.beforeEach(async ({ page }) => {
    await mockLibriVoxAPI(page);
    await page.goto('/browse');
    await dismissOnboarding(page);
  });

  test('should show search input', async ({ page }) => {
    await expect(
      page.locator('.browse__search-input').or(page.locator('#search-input'))
    ).toBeVisible();
  });

  test('should show audiobook cards', async ({ page }) => {
    await expect(
      page.locator('app-audiobook-card, app-audiobook-grid, .card-link').first()
    ).toBeVisible();
  });

  test('should have sort/filter controls', async ({ page }) => {
    await expect(
      page.locator('.browse__select').first().or(page.locator('select').first())
    ).toBeVisible();
  });
});
