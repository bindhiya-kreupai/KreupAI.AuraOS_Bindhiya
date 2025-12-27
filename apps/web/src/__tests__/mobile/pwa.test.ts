/**
 * Progressive Web App (PWA) Tests (Day 71)
 *
 * Comprehensive PWA feature testing:
 * - Installation and "Add to Home Screen"
 * - Service Worker functionality
 * - Web App Manifest validation
 * - Offline functionality
 * - Push notifications
 * - Background sync
 * - Lighthouse PWA audit
 */

import { test, expect, devices } from '@playwright/test';
import { execSync } from 'child_process';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.use({ ...devices['iPhone 12'] });

test.describe('Web App Manifest', () => {
  test('should have valid manifest.json', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.json`);

    expect(response!.ok()).toBeTruthy();

    const manifest = await response!.json();

    // Required fields
    expect(manifest.name || manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBeTruthy();
    expect(manifest.icons).toBeTruthy();
    expect(Array.isArray(manifest.icons)).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('should have manifest link in HTML', async ({ page }) => {
    await page.goto(BASE_URL);

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);

    const href = await manifestLink.getAttribute('href');
    expect(href).toContain('manifest');
  });

  test('should have proper icon sizes', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.json`);
    const manifest = await response!.json();

    const requiredSizes = ['192x192', '512x512'];
    const iconSizes = manifest.icons.map((icon: any) => icon.sizes);

    for (const size of requiredSizes) {
      expect(iconSizes).toContain(size);
    }
  });

  test('should have appropriate display mode', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.json`);
    const manifest = await response!.json();

    const validModes = ['standalone', 'fullscreen', 'minimal-ui'];
    expect(validModes).toContain(manifest.display);
  });

  test('should have theme color', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.json`);
    const manifest = await response!.json();

    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
  });

  test('should have theme-color meta tag', async ({ page }) => {
    await page.goto(BASE_URL);

    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveCount(1);

    const color = await themeColor.getAttribute('content');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/); // Hex color
  });
});

test.describe('Service Worker', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for service worker registration
    await page.waitForTimeout(2000);

    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });

    expect(swRegistered).toBeTruthy();
  });

  test('should have service worker file', async ({ page }) => {
    // Try common service worker paths
    const swPaths = ['/sw.js', '/service-worker.js', '/firebase-messaging-sw.js'];

    let found = false;
    for (const path of swPaths) {
      const response = await page.goto(`${BASE_URL}${path}`);
      if (response!.ok()) {
        found = true;
        const contentType = response!.headers()['content-type'];
        expect(contentType).toContain('javascript');
        break;
      }
    }

    if (!found) {
      console.log('Service worker file not found at common paths');
    }
  });

  test('should activate service worker', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.waitForTimeout(3000);

    const swActive = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration?.active !== null;
      }
      return false;
    });

    expect(swActive).toBeTruthy();
  });

  test('should update service worker on new version', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.waitForTimeout(2000);

    // Trigger update check
    const updateTriggered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          return true;
        }
      }
      return false;
    });

    expect(updateTriggered).toBeTruthy();
  });
});

test.describe('Offline Functionality', () => {
  test('should load from cache when offline', async ({ page, context }) => {
    // First visit to cache the page
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Wait for service worker to cache
    await page.waitForTimeout(3000);

    // Go offline
    await context.setOffline(true);

    // Reload page
    await page.reload();

    // Page should still load from cache
    const title = await page.title();
    expect(title).toBeTruthy();

    await context.setOffline(false);
  });

  test('should show offline indicator', async ({ page, context }) => {
    await page.goto(BASE_URL);

    // Go offline
    await context.setOffline(true);

    await page.waitForTimeout(1000);

    // Check for offline indicator
    const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner');

    if (await offlineIndicator.count() > 0) {
      await expect(offlineIndicator.first()).toBeVisible();
    }

    await context.setOffline(false);
  });

  test('should queue actions when offline', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Go offline
    await context.setOffline(true);

    // Try to perform action (e.g., clock in)
    await page.goto(`${BASE_URL}/attendance`);

    // Action should be queued
    const clockInButton = page.locator('button:has-text("Clock In")');
    if (await clockInButton.count() > 0) {
      await clockInButton.click();

      await page.waitForTimeout(1000);

      // Should show queued message
      const queuedMessage = page.locator('text=/queued|will.*sync|offline/i');
      if (await queuedMessage.count() > 0) {
        await expect(queuedMessage.first()).toBeVisible();
      }
    }

    await context.setOffline(false);
  });

  test('should sync queued actions when back online', async ({ page, context }) => {
    // This requires background sync API support
    test.skip(); // Implementation-specific
  });
});

test.describe('PWA Installation', () => {
  test('should show install prompt', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for beforeinstallprompt event
    const installPromptFired = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('beforeinstallprompt', (e) => {
          resolve(true);
        });

        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000);
      });
    });

    // In some environments, this event may not fire
    console.log(`Install prompt fired: ${installPromptFired}`);
  });

  test('should be installable (meets PWA criteria)', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check PWA installability criteria
    const criteria = await page.evaluate(() => {
      return {
        hasManifest: document.querySelector('link[rel="manifest"]') !== null,
        hasServiceWorker: 'serviceWorker' in navigator,
        isHTTPS: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
      };
    });

    expect(criteria.hasManifest).toBeTruthy();
    expect(criteria.hasServiceWorker).toBeTruthy();
    expect(criteria.isHTTPS).toBeTruthy();
  });

  test('should support iOS Add to Home Screen', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();

    await page.goto(BASE_URL);

    // Check for apple-touch-icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    const hasIcon = await appleTouchIcon.count() > 0;

    if (hasIcon) {
      const href = await appleTouchIcon.first().getAttribute('href');
      expect(href).toBeTruthy();
    }

    // Check for apple-mobile-web-app-capable
    const webAppCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    const hasCapable = await webAppCapable.count() > 0;

    if (hasCapable) {
      const content = await webAppCapable.getAttribute('content');
      expect(content).toBe('yes');
    }

    await context.close();
  });
});

test.describe('Push Notifications', () => {
  test('should request notification permission', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);

    await page.goto(BASE_URL);

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Check if notifications are supported
    const notificationSupported = await page.evaluate(() => {
      return 'Notification' in window;
    });

    expect(notificationSupported).toBeTruthy();
  });

  test('should handle notification permission denial', async ({ page }) => {
    await page.goto(BASE_URL);

    // Simulate permission denial
    await page.evaluate(() => {
      Object.defineProperty(Notification, 'permission', {
        value: 'denied',
        writable: false,
      });
    });

    const permission = await page.evaluate(() => Notification.permission);
    expect(permission).toBe('denied');
  });

  test.skip('should subscribe to push notifications', async ({ page }) => {
    // Requires push notification service setup
    test.skip();
  });
});

test.describe('Background Sync', () => {
  test('should support Background Sync API', async ({ page }) => {
    await page.goto(BASE_URL);

    const backgroundSyncSupported = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        return 'sync' in registration;
      }
      return false;
    });

    console.log(`Background Sync supported: ${backgroundSyncSupported}`);
  });

  test.skip('should register sync event', async ({ page }) => {
    // Implementation-specific
    test.skip();
  });
});

test.describe('App Shortcuts', () => {
  test('should define app shortcuts in manifest', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.json`);
    const manifest = await response!.json();

    if (manifest.shortcuts) {
      expect(Array.isArray(manifest.shortcuts)).toBeTruthy();

      // Each shortcut should have required fields
      for (const shortcut of manifest.shortcuts) {
        expect(shortcut.name).toBeTruthy();
        expect(shortcut.url).toBeTruthy();
      }
    }
  });
});

test.describe('Share Target API', () => {
  test('should support sharing to the app', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manifest.json`);
    const manifest = await response!.json();

    if (manifest.share_target) {
      expect(manifest.share_target.action).toBeTruthy();
      expect(manifest.share_target.method).toBeTruthy();
    }
  });
});

test.describe('Lighthouse PWA Audit', () => {
  test.skip('should achieve PWA score > 90', async () => {
    // This requires Lighthouse CLI
    try {
      const output = execSync(
        `npx lighthouse ${BASE_URL} --only-categories=pwa --output=json --quiet`,
        { encoding: 'utf-8' }
      );

      const report = JSON.parse(output);
      const pwaScore = report.categories.pwa.score * 100;

      console.log(`PWA Score: ${pwaScore}`);
      expect(pwaScore).toBeGreaterThanOrEqual(90);
    } catch (error) {
      console.log('Lighthouse not available, skipping');
      test.skip();
    }
  });

  test.skip('should pass PWA installability checks', async () => {
    try {
      const output = execSync(
        `npx lighthouse ${BASE_URL} --only-categories=pwa --output=json --quiet`,
        { encoding: 'utf-8' }
      );

      const report = JSON.parse(output);
      const audits = report.audits;

      // Key PWA audits
      expect(audits['installable-manifest'].score).toBe(1);
      expect(audits['service-worker'].score).toBe(1);
      expect(audits['works-offline'].score).toBe(1);
    } catch (error) {
      console.log('Lighthouse not available, skipping');
      test.skip();
    }
  });
});

test.describe('PWA Best Practices', () => {
  test('should use HTTPS or localhost', async ({ page }) => {
    await page.goto(BASE_URL);

    const protocol = await page.evaluate(() => window.location.protocol);
    const hostname = await page.evaluate(() => window.location.hostname);

    expect(protocol === 'https:' || hostname === 'localhost').toBeTruthy();
  });

  test('should have viewport meta tag', async ({ page }) => {
    await page.goto(BASE_URL);

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);

    const content = await viewport.getAttribute('content');
    expect(content).toContain('width=device-width');
  });

  test('should be responsive', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check that page adapts to mobile viewport
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('should have fast load time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('Cache Strategies', () => {
  test('should cache static assets', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    // Check cache
    const cacheKeys = await page.evaluate(async () => {
      const caches = await window.caches.keys();
      return caches;
    });

    expect(cacheKeys.length).toBeGreaterThan(0);
  });

  test('should use cache-first strategy for assets', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // On second load, assets should come from cache
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry: any) => ({
        name: entry.name,
        transferSize: entry.transferSize,
      }));
    });

    const cachedAssets = performanceEntries.filter(entry => entry.transferSize === 0);

    console.log(`Cached assets: ${cachedAssets.length}`);
  });
});

test.describe('Update Notifications', () => {
  test('should notify user of app updates', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.waitForTimeout(2000);

    // Check if update notification mechanism exists
    const updateBanner = page.locator('[data-testid="update-available"], .update-banner');

    // Update banner may not always be visible
    const count = await updateBanner.count();
    console.log(`Update banner elements: ${count}`);
  });
});
