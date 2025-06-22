import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });
  
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait for navigation after form submission
  await page.waitForTimeout(2000);
  
  // Check if we got an error message
  const errorMsg = page.locator('.text-red-600');
  if (await errorMsg.isVisible()) {
    const errorText = await errorMsg.textContent();
    throw new Error(`Login failed: ${errorText}`);
  }
  
  // Wait for either direct admin page or redirect endpoint
  try {
    await Promise.race([
      page.waitForURL('/admin', { timeout: 15000 }),
      page.waitForURL('/api/auth/redirect', { timeout: 15000 })
    ]);
    
    // If we're at redirect endpoint, wait for final admin destination
    if (page.url().includes('/api/auth/redirect')) {
      await page.waitForURL('/admin', { timeout: 10000 });
    }
  } catch (error) {
    console.log(`Current URL after login attempt: ${page.url()}`);
    console.log(`Browser: ${page.context().browser()?.browserType().name()}`);
    
    // For webkit, try waiting a bit longer
    if (page.context().browser()?.browserType().name() === 'webkit') {
      await page.waitForTimeout(3000);
      if (page.url().includes('/admin') || page.url() === 'http://localhost:3000/admin') {
        return; // Success
      }
    }
    throw new Error(`Login navigation failed: ${error}`);
  }
}

export async function loginAsInstructor(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });
  
  await page.fill('input[name="email"]', 'instructor@test.com');
  await page.fill('input[name="password"]', 'instructor123');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(2000);
  
  const errorMsg = page.locator('.text-red-600');
  if (await errorMsg.isVisible()) {
    const errorText = await errorMsg.textContent();
    throw new Error(`Login failed: ${errorText}`);
  }
  
  try {
    await Promise.race([
      page.waitForURL('/admin', { timeout: 15000 }),
      page.waitForURL('/api/auth/redirect', { timeout: 15000 })
    ]);
    
    if (page.url().includes('/api/auth/redirect')) {
      await page.waitForURL('/admin', { timeout: 10000 });
    }
  } catch (error) {
    console.log(`Current URL after login attempt: ${page.url()}`);
    console.log(`Browser: ${page.context().browser()?.browserType().name()}`);
    
    if (page.context().browser()?.browserType().name() === 'webkit') {
      await page.waitForTimeout(3000);
      if (page.url().includes('/admin') || page.url() === 'http://localhost:3000/admin') {
        return;
      }
    }
    throw new Error(`Login navigation failed: ${error}`);
  }
}

export async function loginAsLearner(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });
  
  await page.fill('input[name="email"]', 'learner@test.com');
  await page.fill('input[name="password"]', 'learner123');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(2000);
  
  const errorMsg = page.locator('.text-red-600');
  if (await errorMsg.isVisible()) {
    const errorText = await errorMsg.textContent();
    throw new Error(`Login failed: ${errorText}`);
  }
  
  try {
    await Promise.race([
      page.waitForURL('/', { timeout: 15000 }),
      page.waitForURL('/api/auth/redirect', { timeout: 15000 })
    ]);
    
    if (page.url().includes('/api/auth/redirect')) {
      await page.waitForURL('/', { timeout: 10000 });
    }
  } catch (error) {
    console.log(`Current URL after login attempt: ${page.url()}`);
    console.log(`Browser: ${page.context().browser()?.browserType().name()}`);
    
    if (page.context().browser()?.browserType().name() === 'webkit') {
      await page.waitForTimeout(3000);
      if (page.url() === 'http://localhost:3000/' || page.url() === 'http://localhost:3000') {
        return;
      }
    }
    throw new Error(`Login navigation failed: ${error}`);
  }
}

export async function logout(page: Page) {
  // Look for actual logout elements that exist
  const userMenu = page.locator('button').filter({ hasText: 'ログアウト' }).or(
    page.locator('a').filter({ hasText: 'ログアウト' })
  );
  
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.waitForURL('/login', { timeout: 5000 });
  } else {
    // If no logout button found, just go to login page
    await page.goto('/login');
  }
}

export async function ensureLoggedOut(page: Page) {
  await page.goto('/login');
  // Clear any existing session
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}