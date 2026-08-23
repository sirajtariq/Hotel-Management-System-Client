import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('05. Expenses & Staff Management E2E Workflow', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'tenant_admin');
  });

  test('5.1 Expenses Page Load & Export CSV Action', async ({ page }) => {
    await page.goto('/expenses');
    await expect(page.locator('h1').last()).toContainText(/Expenses|Operating/i);

    // Verify summary cards visible
    await expect(page.locator('text=Log New Expense').or(page.locator('button:has-text("Log New Expense")')).first()).toBeVisible();

    // Export CSV button
    const exportBtn = page.locator('button:has-text("Export CSV")').first();
    await expect(exportBtn).toBeVisible();
  });

  test('5.2 Staff Roster & Payroll Directory', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('h1').last()).toContainText(/Staff|Directory|Roster/i);

    // Summary cards visible (Payroll total, accounts count)
    await expect(page.locator('text=Monthly Payroll Total').first()).toBeVisible({ timeout: 10000 });

    // Register Staff Member button
    const registerBtn = page.locator('button', { hasText: 'Register Staff Member' }).first();
    await expect(registerBtn).toBeVisible();
  });

});
