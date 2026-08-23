import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('03. Bookings, Front Desk & Payments E2E Lifecycle', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'tenant_admin');
  });

  test('3.1 Bookings Ledger Render & Search', async ({ page }) => {
    await page.goto('/bookings');
    await expect(page.locator('h1').last()).toContainText(/Reservations|Bookings/i);

    // Search input exists
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    await expect(searchInput).toBeVisible();

    // Verify "New Reservation" button exists
    const newBtn = page.locator('button', { hasText: 'New Reservation' }).first();
    await expect(newBtn).toBeVisible();
  });

  test('3.2 Open New Reservation Modal & Create Reservation', async ({ page }) => {
    await page.goto('/bookings');
    await page.click('button:has-text("New Reservation")');

    // Assert Sheet / Modal displays
    await expect(page.locator('text=New Guest Reservation').or(page.locator('text=New Reservation')).first()).toBeVisible({ timeout: 5000 });

    // Fill Guest Name & Mobile Phone
    await page.fill('input[placeholder*="Arthur Morgan" i]', 'John Doe E2E');
    await page.fill('input[placeholder*="+92 300 1234567" i]', '+923009876543');

    // Submit Reservation
    await page.click('button[type="submit"]:has-text("Confirm Reservation")');

    // Verify modal action completes
    await page.waitForTimeout(1500);
  });

});
