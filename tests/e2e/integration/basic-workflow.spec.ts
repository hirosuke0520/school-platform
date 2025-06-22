import { test, expect } from '@playwright/test';
import { loginAsLearner, loginAsAdmin } from '../utils/auth-helpers';

test.describe('Basic User Workflows', () => {
  test('complete student learning workflow', async ({ page }) => {
    // Login as learner
    await loginAsLearner(page);
    
    // Start from dashboard
    await page.goto('/');
    await expect(page.locator('h2')).toContainText('おかえりなさい');
    
    // Browse courses if available
    const courseLinks = page.locator('a[href*="/courses/"]');
    const count = await courseLinks.count();
    
    if (count > 0) {
      await courseLinks.first().click();
      await expect(page).toHaveURL(/\/courses\/\d+/);
      
      // Try to access a lesson
      const lessonLinks = page.locator('a[href*="/lessons/"]');
      const lessonCount = await lessonLinks.count();
      
      if (lessonCount > 0) {
        await lessonLinks.first().click();
        await expect(page).toHaveURL(/\/lessons\/\d+/);
      }
    }
  });

  test('admin management workflow', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);
    
    // Access admin dashboard
    await page.goto('/admin');
    await expect(page.locator('h1').last()).toContainText('ダッシュボード');
    
    // Navigate to course management
    await page.goto('/admin/courses');
    await expect(page).toHaveURL(/\/admin\/courses/);
    
    // Navigate to user management
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/users/);
    
    // Should also be able to access student view
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('responsive design across user journey', async ({ page }) => {
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    
    await loginAsLearner(page);
    
    // Dashboard on mobile
    await page.goto('/');
    await expect(page.locator('h2')).toBeVisible();
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await expect(page.locator('h2')).toBeVisible();
  });
});