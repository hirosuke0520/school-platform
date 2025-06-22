import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsLearner, ensureLoggedOut } from '../utils/auth-helpers';

test.describe('Role-based Access Control (Simplified)', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedOut(page);
  });

  test('learner should be redirected from admin routes', async ({ page }) => {
    await loginAsLearner(page);
    
    // Try to access admin routes
    await page.goto('/admin');
    await expect(page).toHaveURL('/');
    
    await page.goto('/admin/users');
    await expect(page).toHaveURL('/');
  });

  test('admin should have access to all routes', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Admin dashboard
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('h1').last()).toContainText('ダッシュボード');
    
    // User management
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/users/);
    
    // Course management
    await page.goto('/admin/courses');
    await expect(page).toHaveURL(/\/admin\/courses/);
    
    // Student dashboard access
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('unauthenticated users should be redirected to login', async ({ page }) => {
    // Protected routes should redirect to login
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});