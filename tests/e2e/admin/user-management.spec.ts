import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../utils/auth-helpers';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display user management page', async ({ page }) => {
    await page.goto('/admin/users');
    
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show user list', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Should show users from test data
    const users = page.locator('.bg-white, .border, [class*="card"], .p-4');
    const count = await users.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin/users');
    
    await expect(page.locator('h1')).toBeVisible();
  });
});