import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.QA_TEST_EMAIL || 'qa@homecircle.test';
const TEST_PASSWORD = process.env.QA_TEST_PASSWORD || 'QaTestPassword123!';

test.describe('Bills Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('/');
  });

  test('Add recurring bill', async ({ page }) => {
    await page.goto('/bills/add');
    
    await page.fill('input[name="name"]', 'QA Monthly Bill');
    await page.fill('input[name="amount"]', '1200');
    await page.fill('input[name="next_due_date"]', '2026-12-01');
    await page.selectOption('select[name="frequency"]', 'monthly');

    await page.click('button:has-text("Save Bill")');

    await page.waitForURL('/bills');
    await expect(page.locator('text=QA Monthly Bill').first()).toBeVisible();
  });

  test('Add one-time bill', async ({ page }) => {
    await page.goto('/bills/add');
    
    await page.fill('input[name="name"]', 'QA One-Time Bill');
    await page.fill('input[name="amount"]', '500');
    await page.fill('input[name="next_due_date"]', '2026-12-15');
    await page.selectOption('select[name="frequency"]', 'one-time');

    await page.click('button:has-text("Save Bill")');

    await page.waitForURL('/bills');
    await expect(page.locator('text=QA One-Time Bill').first()).toBeVisible();
  });
});
