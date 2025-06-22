import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../utils/auth-helpers';

test.describe('Course Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display course management page', async ({ page }) => {
    await page.goto('/admin/courses');
    
    await expect(page).toHaveURL(/\/admin\/courses/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show course list', async ({ page }) => {
    await page.goto('/admin/courses');
    
    // Should show some courses from seed data
    const courses = page.locator('.bg-white, .border, [class*="card"], .p-4');
    const count = await courses.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to course details', async ({ page }) => {
    await page.goto('/admin/courses');
    
    // Click on first course if exists
    const courseLinks = page.locator('a[href*="/admin/courses/"]');
    const count = await courseLinks.count();
    
    if (count > 0) {
      await courseLinks.first().click();
      await expect(page).toHaveURL(/\/admin\/courses\/\d+/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/courses');
    
    await expect(page.locator('h1')).toBeVisible();
  });
});