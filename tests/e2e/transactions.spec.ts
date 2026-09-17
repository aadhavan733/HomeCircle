import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.QA_TEST_EMAIL || 'qa@homecircle.test';
const TEST_PASSWORD = process.env.QA_TEST_PASSWORD || 'QaTestPassword123!';

test.describe('Transaction Workflows', () => {
  // Authenticate before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('/');
  });

  test('Add income', async ({ page }) => {
    // Navigate to Add Transaction
    await page.goto('/transactions/add');
    
    // Select Income
    await page.click('text=Income');

    // Fill form
    await page.fill('input[name="amount"]', '5000');
    // Select a category if it exists, or type custom
    await page.selectOption('select[name="category_id"]', 'other');
    await page.fill('input[name="custom_category_name"]', 'QA Test Income');
    await page.fill('textarea[name="note"]', 'Automated test income');

    // Submit
    await page.click('button:has-text("Save Record")');

    // Wait for redirect back to dashboard or transactions
    await page.waitForURL('/');
    
    // Verify it shows up
    // Note: since the dashboard might be complex, we can also check the Transactions page
    await page.goto('/transactions');
    await expect(page.locator('text=QA Test Income').first()).toBeVisible();
    await expect(page.locator('text=5000').first()).toBeVisible();
  });

  test('Add shared expense', async ({ page }) => {
    await page.goto('/transactions/add');
    
    // Default is Expense
    await page.fill('input[name="amount"]', '100');
    await page.selectOption('select[name="category_id"]', 'other');
    await page.fill('input[name="custom_category_name"]', 'QA Shared Expense');
    
    // Visibility is 'shared' by default
    await page.selectOption('select[name="visibility"]', 'shared');
    
    await page.fill('textarea[name="note"]', 'Automated test shared expense');
    await page.click('button:has-text("Save Record")');

    await page.waitForURL('/');
    
    await page.goto('/transactions');
    await expect(page.locator('text=QA Shared Expense').first()).toBeVisible();
  });

  test('Add personal expense', async ({ page }) => {
    await page.goto('/transactions/add');
    
    await page.fill('input[name="amount"]', '50');
    await page.selectOption('select[name="category_id"]', 'other');
    await page.fill('input[name="custom_category_name"]', 'QA Personal Expense');
    
    // Change visibility to personal
    await page.selectOption('select[name="visibility"]', 'personal');
    
    await page.fill('textarea[name="note"]', 'Automated test personal expense');
    await page.click('button:has-text("Save Record")');

    await page.waitForURL('/');
    
    await page.goto('/transactions');
    await expect(page.locator('text=QA Personal Expense').first()).toBeVisible();
  });
});
