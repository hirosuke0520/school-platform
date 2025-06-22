import { test, expect } from '@playwright/test';
import { loginAsLearner } from '../utils/auth-helpers';

test.describe('Student Dashboard (Simplified)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsLearner(page);
  });

  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h2')).toContainText('おかえりなさい');
    await expect(page).toHaveURL('/');
  });

  test('should display course list', async ({ page }) => {
    await page.goto('/');
    
    // Should show some courses
    const courses = page.locator('.course-card, .bg-white.p-4, .border, [class*="card"]');
    const count = await courses.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to course details', async ({ page }) => {
    await page.goto('/');
    
    // Click on first course link if exists
    const courseLinks = page.locator('a[href*="/courses/"]');
    const count = await courseLinks.count();
    
    if (count > 0) {
      await courseLinks.first().click();
      await expect(page).toHaveURL(/\/courses\/\d+/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h2')).toBeVisible();
  });
});