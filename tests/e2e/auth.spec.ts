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

test.describe('BUG-001: Authentication, Sign Out, and Session Protection', () => {
  test('Successful login and dashboard load', async ({ page }) => {
    await performLogin(page);

    // Check if key dashboard elements are visible
    await expect(page.locator('text=HomeCircle').locator('visible=true').first()).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/01_dashboard_loaded.png' });

    // Verify FAB exists
    await expect(page.getByLabel('Add options')).toBeVisible();
  });

  test('Login -> Logout redirects to /login and clears session', async ({ page }) => {
    await performLogin(page);
    await page.waitForSelector('text=Recent Transactions', { state: 'visible', timeout: 10000 }).catch(() => {});
    await page.screenshot({ path: 'tests/screenshots/auth_01_dashboard_sidebar.png' });

    // Navigate to Family settings where Sign Out is available for all viewports
    await page.goto('/family');
    await expect(page.getByRole('button', { name: 'Sign Out' }).first()).toBeVisible();
    await page.waitForSelector('text=Account', { state: 'visible', timeout: 10000 }).catch(() => {});
    await page.screenshot({ path: 'tests/screenshots/auth_02_family_account_card.png' });

    // Click Sign Out
    await page.click('button:has-text("Sign Out")');

    // Should be redirected to /login
    await page.waitForURL('**/login**', { timeout: 15000 });
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/auth_03_logged_out_redirect.png' });
  });

  test('Logout -> Refresh keeps user on /login', async ({ page }) => {
    await performLogin(page);

    // Perform sign out
    await page.goto('/family');
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL('**/login**', { timeout: 15000 });

    // Refresh the page
    await page.reload();
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('Logout -> Browser Back does not expose protected content', async ({ page }) => {
    await performLogin(page);

    // Go to transactions page
    await page.goto('/transactions');
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible();

    // Go to family and sign out
    await page.goto('/family');
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL('**/login**', { timeout: 15000 });

    // Click browser back
    await page.goBack();
    await page.waitForURL('**/login**', { timeout: 10000 });

    // Protected content must not be accessible; middleware keeps or redirects to /login
    expect(page.url()).toContain('/login');
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('Logout -> Direct access to protected routes redirects to /login', async ({ page }) => {
    await performLogin(page);

    // Sign out
    await page.goto('/family');
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL('**/login**', { timeout: 15000 });

    // Test /transactions
    await page.goto('/transactions');
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

    // Test /bills
    await page.goto('/bills');
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

    // Test /bill (singular alias)
    await page.goto('/bill');
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

    // Test /goals
    await page.goto('/goals');
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

    // Test /family
    await page.goto('/family');
    await page.waitForURL('**/login**', { timeout: 10000 });
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });
});
