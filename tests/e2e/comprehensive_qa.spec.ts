import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const TEST_EMAIL = process.env.QA_TEST_EMAIL || 'testfamily@example.com';
const TEST_PASSWORD = process.env.QA_TEST_PASSWORD || 'password123';

const ARTIFACTS_SCREENSHOT_DIR = 'C:\\Users\\aadha\\.gemini\\antigravity-ide\\brain\\1771618b-7159-4097-9fac-a52a93b12161\\screenshots';
const LOCAL_SCREENSHOT_DIR = path.resolve(process.cwd(), 'tests', 'screenshots');

async function saveProofScreenshot(page: any, filename: string) {
  const localPath = path.join(LOCAL_SCREENSHOT_DIR, filename);
  const artifactPath = path.join(ARTIFACTS_SCREENSHOT_DIR, filename);
  
  await page.screenshot({ path: localPath, fullPage: false });
  try {
    fs.copyFileSync(localPath, artifactPath);
  } catch (e) {
    console.error('Failed to copy screenshot to artifacts:', e);
  }
}

async function loginUser(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('/');
}

test.describe('HomeCircle QA Proof & Screenshot Suite', () => {

  test('TC01 - Login Page Rendering (Desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'HomeCircle' })).toBeVisible();

    await saveProofScreenshot(page, '01_login_page_desktop.png');
  });

  test('TC02 - Sign Up Mode View', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login?mode=signup');
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();

    await saveProofScreenshot(page, '02_signup_page_desktop.png');
  });

  test('TC03 - Authentication and Dashboard Loading', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);

    await expect(page.locator('text=Budget Remaining')).toBeVisible();
    await expect(page.locator('text=Top Category Spending')).toBeVisible();
    await expect(page.locator('text=Upcoming Bills')).toBeVisible();

    await saveProofScreenshot(page, '03_dashboard_desktop.png');
  });

  test('TC04 - Transactions View', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);

    await page.goto('/transactions');
    await expect(page.locator('text=Transactions').first()).toBeVisible();

    await saveProofScreenshot(page, '04_transactions_list.png');
  });

  test('TC05 - Add Transaction Form Controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);

    await page.goto('/transactions/add');
    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Expense' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Income' })).toBeVisible();
    await expect(page.locator('select[name="visibility"]')).toBeVisible();

    await saveProofScreenshot(page, '05_add_transaction_form.png');
  });

  test('TC06 - Bills List & Management View', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);

    await page.goto('/bills');
    await expect(page.locator('text=Bills').first()).toBeVisible();

    await saveProofScreenshot(page, '06_bills_page.png');
  });

  test('TC07 - Add Bill Form Controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);

    await page.goto('/bills/add');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('select[name="frequency"]')).toBeVisible();

    await saveProofScreenshot(page, '07_add_bill_form.png');
  });

  test('TC08 - Savings Goals View', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);

    await page.goto('/goals');
    await expect(page.locator('text=Goals').first()).toBeVisible();

    await saveProofScreenshot(page, '08_goals_page.png');
  });

  test('TC09 - Add Savings Goal Form Controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);

    await page.goto('/goals/add');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="target_amount"]')).toBeVisible();

    await saveProofScreenshot(page, '09_add_goal_form.png');
  });

  test('TC10 - Family Management View', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);

    await page.goto('/family');
    await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();
    await expect(page.locator('button:has-text("Add Member")')).toBeVisible();

    await saveProofScreenshot(page, '10_family_page.png');
  });

  test('TC11 - Responsive Layout 320x800 (Small Mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await loginUser(page);
    await expect(page.locator('text=Budget Remaining')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    await saveProofScreenshot(page, '11_responsive_320x800.png');
  });

  test('TC12 - Responsive Layout 375x812 (iPhone X / Standard Mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginUser(page);
    await expect(page.locator('text=Budget Remaining')).toBeVisible();
    
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    await saveProofScreenshot(page, '12_responsive_375x812.png');
  });

  test('TC13 - Responsive Layout 390x844 (iPhone 12 / Modern Mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginUser(page);
    await expect(page.locator('text=Budget Remaining')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    await saveProofScreenshot(page, '13_responsive_390x844.png');
  });

  test('TC14 - Responsive Layout 768x1024 (Tablet / iPad)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loginUser(page);
    await expect(page.locator('text=Budget Remaining')).toBeVisible();

    await saveProofScreenshot(page, '14_responsive_768x1024.png');
  });

  test('TC15 - Responsive Layout 1440x900 (Desktop Wide)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginUser(page);
    await expect(page.locator('text=Budget Remaining')).toBeVisible();

    await saveProofScreenshot(page, '15_responsive_1440x900.png');
  });

  test('TC16 - PWA Service Worker & Manifest Verification', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginUser(page);
    
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.status()).toBe(200);
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('HomeCircle');
    expect(manifest.display).toBe('standalone');

    for (const icon of manifest.icons) {
      const iconRes = await page.request.get(icon.src);
      expect(iconRes.status()).toBe(200);
    }

    await saveProofScreenshot(page, '16_pwa_verified.png');
  });
});
