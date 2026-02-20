import { test, expect } from '@playwright/test';
import { mockLibriVoxAPI, dismissOnboarding } from './helpers';

test.describe('Player', () => {
  test('should show book detail page', async ({ page }) => {
    await mockLibriVoxAPI(page);
    await page.goto('/audiobook/1');
    await dismissOnboarding(page);
    await expect(
      page.locator('.detail__title').or(page.locator('h1, h2').first())
    ).toBeVisible();
  });

  test('should show chapters list', async ({ page }) => {
    await mockLibriVoxAPI(page);
    await page.goto('/audiobook/1');
    await dismissOnboarding(page);
    await expect(page.locator('.chapter-item').first()).toBeVisible();
  });

  test('should have play button', async ({ page }) => {
    await mockLibriVoxAPI(page);
    await page.goto('/audiobook/1');
    await dismissOnboarding(page);
    await expect(
      page.locator('.btn-primary', { hasText: /play|resume/i })
    ).toBeVisible();
  });
});
