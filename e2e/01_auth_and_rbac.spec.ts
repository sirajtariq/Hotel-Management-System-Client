import { test, expect } from '@playwright/test';
import { loginAs, USER_CREDENTIALS } from './helpers/auth';

test.describe('01. Authentication & Multi-Tenant RBAC Security Boundaries', () => {

  test('1.1 Valid Login Flow for Tenant Admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', USER_CREDENTIALS.tenant_admin.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.tenant_admin.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);

    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
  });

  test('1.2 Invalid Credentials Error Handling', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wronguser@hotel.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Toast or form error alert
    await expect(page.locator('text=Authentication Error').or(page.locator('.text-rose-800')).first()).toBeVisible({ timeout: 8000 });
    expect(page.url()).toContain('/login');
  });

  test('1.3 RBAC Navigation Filtering for Receptionist Staff', async ({ page }) => {
    await loginAs(page, 'receptionist');

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    // Permitted items
    await expect(sidebar.locator('a', { hasText: 'Dashboard' })).toBeVisible();
    await expect(sidebar.locator('a', { hasText: 'Bookings' })).toBeVisible();
    await expect(sidebar.locator('a', { hasText: 'Rooms' })).toBeVisible();

    // Forbidden items
    await expect(sidebar.locator('a', { hasText: 'Roles & Access' })).toHaveCount(0);
  });

  test('1.4 Direct Route Protection & Access Denied Redirection', async ({ page }) => {
    await loginAs(page, 'receptionist');

    // Attempt direct navigation to forbidden /roles
    await page.goto('/roles');

    // Should redirect back to /dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('1.5 Platform SuperAdmin Login & Tenant Impersonation Flow', async ({ page }) => {
    await loginAs(page, 'superadmin');

    // Navigate to /tenants if on dashboard
    if (!page.url().includes('/tenants')) {
      await page.goto('/tenants');
    }

    await page.waitForURL('**/tenants', { timeout: 10000 });
    await expect(page.locator('main h1, h1.text-xl').first()).toBeVisible();

    // Impersonate first tenant
    const impersonateBtn = page.locator('button', { hasText: /Login as Tenant|Impersonate/i }).first();
    if (await impersonateBtn.isVisible()) {
      await impersonateBtn.click();
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      expect(page.url()).toContain('/dashboard');
    }
  });

});
