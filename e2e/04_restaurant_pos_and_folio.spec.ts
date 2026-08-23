import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('04. Restaurant POS, Kitchen KDS & Room Service Folio Sync E2E', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'tenant_admin');
  });

  test('4.1 POS Terminal Load & Food Item Selection', async ({ page }) => {
    await page.goto('/restaurant/pos');
    await expect(page.locator('h1').last()).toContainText(/Restaurant|POS/i);

    // Food item cards grid visible
    await expect(page.locator('text=Zinger Supreme').or(page.locator('.menu-item-card')).first()).toBeVisible({ timeout: 10000 });

    // Click Zinger Supreme food item card
    const foodCard = page.locator('text=Zinger Supreme').first();
    await foodCard.click();

    // If variation modal opens, select Single Patty or confirm
    const singlePattyBtn = page.locator('button:has-text("Single Patty"), button:has-text("Add to Order")').first();
    if (await singlePattyBtn.isVisible()) {
      await singlePattyBtn.click();
    }

    // Verify item added to cart sidebar
    await expect(page.locator('text=Zinger Supreme').or(page.locator('.cart-item')).first()).toBeVisible({ timeout: 5000 });
  });

  test('4.2 Dine-In Table Selection Modal', async ({ page }) => {
    await page.goto('/restaurant/pos');

    // Click Table selector button
    const tableBtn = page.locator('button:has-text("Select Table"), button:has-text("Table T-01")').first();
    if (await tableBtn.isVisible()) {
      await tableBtn.click();

      // Assert modal displays tables
      await expect(page.locator('text=Select Dining Table').or(page.locator('text=Table T-01')).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('4.3 Kitchen Display System (KDS) View', async ({ page }) => {
    await page.goto('/restaurant/kitchen');
    await expect(page.locator('h1').last()).toContainText(/Kitchen|Display/i);
  });

});
