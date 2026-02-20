import { test, expect } from '@playwright/test';
import { mockLibriVoxAPI, dismissOnboarding } from './helpers';

test.describe('App', () => {
  test('should load with correct title', async ({ page }) => {
    await page.goto('/');
    await dismissOnboarding(page);
    await expect(page).toHaveTitle(/Audiobook/i);
  });

  test('should show hero section on home', async ({ page }) => {
    await mockLibriVoxAPI(page);
    await page.goto('/home');
    await dismissOnboarding(page);
    await expect(page.locator('.hero')).toBeVisible();
  });

  test('should show hero title', async ({ page }) => {
    await mockLibriVoxAPI(page);
    await page.goto('/home');
    await dismissOnboarding(page);
    await expect(page.locator('.hero__title')).toBeVisible();
  });
});
