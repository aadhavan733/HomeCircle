import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.QA_TEST_EMAIL || 'qa@homecircle.test';
const TEST_PASSWORD = process.env.QA_TEST_PASSWORD || 'QaTestPassword123!';

test.describe('Savings Goals Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('/');
  });

  test('Add savings goal', async ({ page }) => {
    await page.goto('/goals/add');
    
    await page.fill('input[name="name"]', 'QA Savings Goal');
    await page.fill('input[name="target_amount"]', '10000');
    await page.fill('input[name="current_amount"]', '2000');

    await page.click('button:has-text("Save Goal")');

    await page.waitForURL('/goals');
    await expect(page.locator('text=QA Savings Goal').first()).toBeVisible();
    // Validate progress calculation conceptually (e.g. 20% or amount text)
    await expect(page.locator('text=2000').first()).toBeVisible();
  });
});
