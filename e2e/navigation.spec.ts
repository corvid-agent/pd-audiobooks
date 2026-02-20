import { test, expect } from '@playwright/test';
import { mockLibriVoxAPI, dismissOnboarding } from './helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockLibriVoxAPI(page);
  });

  test('should navigate to home', async ({ page }) => {
    await page.goto('/home');
    await dismissOnboarding(page);
    await expect(page.locator('.hero')).toBeVisible();
  });

  test('should navigate to browse', async ({ page }) => {
    await page.goto('/browse');
    await dismissOnboarding(page);
    await expect(page.locator('.browse__search-input')).toBeVisible();
  });

  test('should navigate to library', async ({ page }) => {
    await page.goto('/library');
    await dismissOnboarding(page);
    await expect(page.locator('.library__tabs')).toBeVisible();
  });

  test('should navigate to stats', async ({ page }) => {
    await page.goto('/stats');
    await dismissOnboarding(page);
    await expect(page.locator('.stats__card').first()).toBeVisible();
  });

  test('should navigate to about', async ({ page }) => {
    await page.goto('/about');
    await dismissOnboarding(page);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
