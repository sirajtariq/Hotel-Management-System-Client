import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('06. Multi-Tab Financial Intelligence & CSV Export E2E', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'tenant_admin');
  });

  test('6.1 Financial Reports Page Load & Tab Navigation', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('h1').last()).toContainText(/Financial Intelligence|Accounting/i);

    // Verify 6 tabs exist
    await expect(page.locator('button', { hasText: 'P&L Statement' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Revenue & Sales' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Expense Analysis' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Hospitality KPIs' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Restaurant & F&B' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Tax & Receivables' }).first()).toBeVisible();
  });

  test('6.2 Switch Through Financial Tabs', async ({ page }) => {
    await page.goto('/reports');

    // Click Revenue & Sales tab
    await page.click('button:has-text("Revenue & Sales")');
    await page.waitForTimeout(500);

    // Click Hospitality KPIs tab
    await page.click('button:has-text("Hospitality KPIs")');
    await page.waitForTimeout(500);

    // Click P&L Statement tab
    await page.click('button:has-text("P&L Statement")');
    await page.waitForTimeout(500);

    // Export CSV button visible
    await expect(page.locator('button', { hasText: /Export CSV|CSV/i }).first()).toBeVisible();
  });

});
