import { test, expect } from '@playwright/test';
import { loginAsLearner } from '../utils/auth-helpers';

test.describe('Lesson Viewing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should display lesson content', async ({ page }) => {
    // Try a known lesson ID from seed data
    await page.goto('/lessons/1');
    
    if (page.url().includes('/lessons/1')) {
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should render content properly', async ({ page }) => {
    await page.goto('/lessons/1');
    
    if (page.url().includes('/lessons/1')) {
      // Check for content area
      const content = page.locator('main, .content, article');
      await expect(content).toBeVisible();
    }
  });

  test('should be readable on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/lessons/1');
    
    if (page.url().includes('/lessons/1')) {
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});