import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('02. Property Hierarchy & Room Inventory Matrix E2E', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'tenant_admin');
  });

  test('2.1 Property Creation Workflow', async ({ page }) => {
    await page.goto('/properties');
    await expect(page.locator('h1, h2').last()).toContainText(/Properties|Property|Administration/i);

    // Click Add Property button
    const addBtn = page.locator('button', { hasText: 'Add New Property' }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Fill Modal form fields matching Zod schema
    await page.fill('input[name="name"]', 'E2E Grand Palace');
    await page.fill('input[name="code"]', 'E2E-GP');
    await page.fill('input[name="city"]', 'Lahore');
    await page.fill('input[name="address"]', '123 E2E Boulevard');

    // Submit modal
    await page.click('button[type="submit"]:has-text("Register Property")');

    // Assert new property appears in grid
    await expect(page.locator('text="E2E Grand Palace"').first()).toBeVisible({ timeout: 10000 });
  });

  test('2.2 Room Inventory & Live Housekeeping Workflow', async ({ page }) => {
    await page.goto('/rooms');
    await expect(page.locator('h1').last()).toContainText(/Rooms|Matrix/i);

    // Verify seeded rooms #101 or #102 are displayed with status badge
    await expect(page.locator('text="101"').or(page.locator('text="102"')).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text="AVAILABLE"').or(page.locator('text="Available"')).first()).toBeVisible({ timeout: 10000 });
  });

});
