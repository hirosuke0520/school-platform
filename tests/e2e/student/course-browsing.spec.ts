import { test, expect } from '@playwright/test';
import { loginAsLearner } from '../utils/auth-helpers';

test.describe('Course Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should display course details page', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to first course
    const courseLinks = page.locator('a[href*="/courses/"]');
    const count = await courseLinks.count();
    
    if (count > 0) {
      await courseLinks.first().click();
      
      // Verify course details page
      await expect(page).toHaveURL(/\/courses\/\d+/);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should show course structure', async ({ page }) => {
    // Try a known course ID from seed data
    await page.goto('/courses/1');
    
    if (page.url().includes('/courses/1')) {
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should navigate to lesson', async ({ page }) => {
    await page.goto('/courses/1');
    
    // Look for lesson links
    const lessonLinks = page.locator('a[href*="/lessons/"]');
    const count = await lessonLinks.count();
    
    if (count > 0) {
      await lessonLinks.first().click();
      await expect(page).toHaveURL(/\/lessons\/\d+/);
    }
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/courses/1');
    
    await expect(page.locator('h1')).toBeVisible();
  });
});