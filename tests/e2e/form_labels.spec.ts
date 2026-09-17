import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.QA_TEST_EMAIL || 'testfamily@example.com';
const TEST_PASSWORD = process.env.QA_TEST_PASSWORD || 'password123';

async function performLogin(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('/', { timeout: 15000 });
}

test.describe('BUG-002: Form Label Associations & Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await performLogin(page);
  });

  test('AddTransactionForm: clicking labels focuses associated fields', async ({ page }) => {
    await page.goto('/transactions/add');

    // 1. Amount label
    const amountLabel = page.locator('label[for="tx-amount"]');
    await expect(amountLabel).toBeVisible();
    await amountLabel.click();
    await expect(page.locator('#tx-amount')).toBeFocused();

    // 2. Category label
    const categoryLabel = page.locator('label[for="tx-category"]');
    await expect(categoryLabel).toBeVisible();
    await categoryLabel.click();
    await expect(page.locator('#tx-category')).toBeFocused();

    // 3. Date label
    const dateLabel = page.locator('label[for="tx-date"]');
    await expect(dateLabel).toBeVisible();
    await dateLabel.click();
    await expect(page.locator('#tx-date')).toBeFocused();

    // 4. Visibility label
    const visibilityLabel = page.locator('label[for="tx-visibility"]');
    await expect(visibilityLabel).toBeVisible();
    await visibilityLabel.click();
    await expect(page.locator('#tx-visibility')).toBeFocused();

    // 5. Note label
    const noteLabel = page.locator('label[for="tx-note"]');
    await expect(noteLabel).toBeVisible();
    await noteLabel.click();
    await expect(page.locator('#tx-note')).toBeFocused();
    await page.screenshot({ path: 'tests/screenshots/labels_01_transaction_focus.png' });
  });

  test('AddBillPage: clicking labels focuses associated fields', async ({ page }) => {
    await page.goto('/bills/add');

    // 1. Bill Name label
    const nameLabel = page.locator('label[for="bill-name"]');
    await expect(nameLabel).toBeVisible();
    await nameLabel.click();
    await expect(page.locator('#bill-name')).toBeFocused();

    // 2. Amount label
    const amountLabel = page.locator('label[for="bill-amount"]');
    await expect(amountLabel).toBeVisible();
    await amountLabel.click();
    await expect(page.locator('#bill-amount')).toBeFocused();

    // 3. Frequency label
    const freqLabel = page.locator('label[for="bill-frequency"]');
    await expect(freqLabel).toBeVisible();
    await freqLabel.click();
    await expect(page.locator('#bill-frequency')).toBeFocused();

    // 4. Next Due Date label
    const dueDateLabel = page.locator('label[for="bill-next-due-date"]');
    await expect(dueDateLabel).toBeVisible();
    await dueDateLabel.click();
    await expect(page.locator('#bill-next-due-date')).toBeFocused();
    await page.screenshot({ path: 'tests/screenshots/labels_02_bills_focus.png' });
  });

  test('AddGoalPage: clicking labels focuses associated fields', async ({ page }) => {
    await page.goto('/goals/add');

    // 1. Goal Name label
    const nameLabel = page.locator('label[for="goal-name"]');
    await expect(nameLabel).toBeVisible();
    await nameLabel.click();
    await expect(page.locator('#goal-name')).toBeFocused();

    // 2. Target Amount label
    const amountLabel = page.locator('label[for="goal-target-amount"]');
    await expect(amountLabel).toBeVisible();
    await amountLabel.click();
    await expect(page.locator('#goal-target-amount')).toBeFocused();

    // 3. Target Date label
    const dateLabel = page.locator('label[for="goal-target-date"]');
    await expect(dateLabel).toBeVisible();
    await dateLabel.click();
    await expect(page.locator('#goal-target-date')).toBeFocused();

    // 4. Visibility label
    const visibilityLabel = page.locator('label[for="goal-visibility"]');
    await expect(visibilityLabel).toBeVisible();
    await visibilityLabel.click();
    await expect(page.locator('#goal-visibility')).toBeFocused();
    await page.screenshot({ path: 'tests/screenshots/labels_03_goals_focus.png' });
  });
});
