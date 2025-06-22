import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../utils/auth-helpers';

test.describe('Admin Dashboard (Simplified)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.locator('h1').last()).toContainText('ダッシュボード');
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should show navigation links', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for actual navigation links that exist
    await expect(page.locator('a[href="/admin"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/courses"]')).toBeVisible();
    await expect(page.locator('a[href="/admin/users"]')).toBeVisible();
  });

  test('should navigate to course management', async ({ page }) => {
    await page.goto('/admin');
    
    await page.click('a[href="/admin/courses"]');
    await expect(page).toHaveURL('/admin/courses');
  });

  test('should navigate to user management', async ({ page }) => {
    await page.goto('/admin');
    
    await page.click('a[href="/admin/users"]');
    await expect(page).toHaveURL('/admin/users');
  });

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin');
    
    await expect(page.locator('h1').last()).toBeVisible();
  });
});