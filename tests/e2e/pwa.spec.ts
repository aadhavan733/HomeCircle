import { test, expect } from '@playwright/test';

test.describe('PWA Validation', () => {
  test('manifest exists and is valid', async ({ request }) => {
    const response = await request.get('/manifest.json');
    expect(response.status()).toBe(200);
    const manifest = await response.json();

    expect(manifest.name).toBe('HomeCircle');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');

    // Check for required icons
    const icon192 = manifest.icons.find((i: any) => i.sizes === '192x192');
    const icon512 = manifest.icons.find((i: any) => i.sizes === '512x512');
    const maskable = manifest.icons.find((i: any) => i.purpose === 'maskable' || i.purpose === 'any maskable');

    expect(icon192).toBeDefined();
    expect(icon512).toBeDefined();
    expect(maskable).toBeDefined();
  });

  test('icon URLs return HTTP 200', async ({ request }) => {
    const response = await request.get('/manifest.json');
    const manifest = await response.json();

    for (const icon of manifest.icons) {
      const iconResp = await request.get(icon.src);
      expect(iconResp.status()).toBe(200);
    }
  });

  test('service worker registers', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the service worker to be registered
    const isServiceWorkerRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    });

    expect(isServiceWorkerRegistered).toBeTruthy();
  });
});
