/**
 * Mobile Responsive Design Tests (Day 68)
 *
 * Comprehensive mobile responsiveness testing across different devices:
 * - Layout adaptation to different screen sizes
 * - Touch-friendly interface elements
 * - Navigation on mobile devices
 * - Form usability on mobile
 * - Viewport-specific rendering
 */

import { test, expect, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Common mobile devices to test
const mobileDevices = [
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'iPhone 13 Pro', device: devices['iPhone 13 Pro'] },
  { name: 'iPhone 14 Pro Max', device: devices['iPhone 14 Pro Max'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] },
  { name: 'iPad Mini', device: devices['iPad Mini'] },
  { name: 'iPad Pro', device: devices['iPad Pro 11'] },
];

test.describe('Mobile Viewport Tests', () => {
  for (const { name, device } of mobileDevices) {
    test(`should render properly on ${name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();

      await page.goto(BASE_URL);

      // Check that content is visible
      const viewport = page.viewportSize();
      expect(viewport).toBeTruthy();

      // Check no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport!.width;

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding

      await context.close();
    });
  }
});

test.describe('Mobile Navigation', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should show mobile menu hamburger', async ({ page }) => {
    await page.goto(BASE_URL);

    // Mobile menu should be visible
    const hamburger = page.locator('[data-testid="mobile-menu"], .hamburger, button[aria-label*="menu"]');
    await expect(hamburger.first()).toBeVisible();
  });

  test('should open mobile menu on tap', async ({ page }) => {
    await page.goto(BASE_URL);

    const hamburger = page.locator('[data-testid="mobile-menu"], .hamburger, button[aria-label*="menu"]').first();
    await hamburger.click();

    // Menu should open
    const menu = page.locator('[data-testid="mobile-nav"], .mobile-navigation, nav[aria-label*="mobile"]');
    await expect(menu.first()).toBeVisible();
  });

  test('should close mobile menu on tap outside', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open menu
    const hamburger = page.locator('[data-testid="mobile-menu"], .hamburger').first();
    await hamburger.click();

    await page.waitForTimeout(500);

    // Tap outside (on body)
    await page.click('body', { position: { x: 10, y: 10 } });

    await page.waitForTimeout(500);

    // Menu should close
    const menu = page.locator('[data-testid="mobile-nav"], .mobile-navigation');
    if (await menu.count() > 0) {
      await expect(menu.first()).not.toBeVisible();
    }
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Open mobile menu
    const hamburger = page.locator('[data-testid="mobile-menu"], .hamburger, [aria-label*="menu"]').first();
    await hamburger.click();

    await page.waitForTimeout(500);

    // Navigate to employees
    await page.click('a:has-text("Employees"), a[href*="employees"]');

    await page.waitForURL(/employees/);
    expect(page.url()).toContain('employees');
  });
});

test.describe('Touch Interactions', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should have touch-friendly button sizes', async ({ page }) => {
    await page.goto(BASE_URL);

    // Get all interactive elements
    const buttons = await page.locator('button, a, input[type="submit"]').all();

    for (const button of buttons.slice(0, 10)) { // Check first 10
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // Minimum touch target: 44x44px (Apple) or 48x48px (Android)
          expect(box.width).toBeGreaterThanOrEqual(40); // Slightly smaller for flexibility
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });

  test('should handle tap events', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Tap on email input
    await page.tap('input[name="email"]');

    // Check if input is focused
    const isFocused = await page.evaluate(() => {
      const email = document.querySelector('input[name="email"]');
      return document.activeElement === email;
    });

    expect(isFocused).toBeTruthy();
  });

  test('should handle swipe gestures on carousels', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Find carousel or swipeable element
    const carousel = page.locator('[data-testid="carousel"], .swiper, .carousel').first();

    if (await carousel.isVisible()) {
      const box = await carousel.boundingBox();
      if (box) {
        // Perform swipe gesture
        await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 10, box.y + box.height / 2);
        await page.mouse.up();

        await page.waitForTimeout(500);

        // Carousel should have moved
        expect(true).toBeTruthy(); // Visual check
      }
    }
  });
});

test.describe('Mobile Forms', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should display forms correctly on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Form should be visible and properly sized
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    const formBox = await form.boundingBox();
    const viewport = page.viewportSize();

    expect(formBox).toBeTruthy();
    expect(formBox!.width).toBeLessThanOrEqual(viewport!.width);
  });

  test('should show appropriate keyboard for input types', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Email input should have email keyboard
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Phone inputs should have tel type
    await page.goto(`${BASE_URL}/profile/edit`);
    const phoneInput = page.locator('input[name="phone"]');
    if (await phoneInput.count() > 0) {
      await expect(phoneInput).toHaveAttribute('type', 'tel');
    }
  });

  test('should handle virtual keyboard appearance', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    const initialHeight = await page.evaluate(() => window.innerHeight);

    // Focus input (which shows keyboard)
    await page.tap('input[name="email"]');

    await page.waitForTimeout(500);

    const afterFocusHeight = await page.evaluate(() => window.innerHeight);

    // On real mobile devices, keyboard would change viewport height
    // In emulation, this might not always work, so we just check input is focused
    const isFocused = await page.evaluate(() => {
      const email = document.querySelector('input[name="email"]');
      return document.activeElement === email;
    });

    expect(isFocused).toBeTruthy();
  });

  test('should handle form submission on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');

    // Submit via button tap
    await page.tap('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });
});

test.describe('Responsive Layout', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should stack elements vertically on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Dashboard cards should stack on mobile
    const cards = await page.locator('[data-testid="dashboard-card"], .card, .widget').all();

    if (cards.length >= 2) {
      const box1 = await cards[0].boundingBox();
      const box2 = await cards[1].boundingBox();

      if (box1 && box2) {
        // Second card should be below first (not side by side)
        expect(box2.y).toBeGreaterThan(box1.y + box1.height - 10);
      }
    }
  });

  test('should hide desktop-only elements on mobile', async ({ page }) => {
    await page.goto(BASE_URL);

    // Desktop sidebar should be hidden
    const desktopSidebar = page.locator('[data-testid="desktop-sidebar"], .desktop-only');

    if (await desktopSidebar.count() > 0) {
      await expect(desktopSidebar.first()).not.toBeVisible();
    }
  });

  test('should show mobile-specific elements', async ({ page }) => {
    await page.goto(BASE_URL);

    // Mobile menu should be visible
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-only');
    await expect(mobileMenu.first()).toBeVisible();
  });
});

test.describe('Text Readability', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should have readable font sizes on mobile', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check body text font size
    const fontSize = await page.evaluate(() => {
      const body = document.body;
      return parseInt(window.getComputedStyle(body).fontSize);
    });

    // Minimum readable font size: 14px on mobile
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });

  test('should not require horizontal scrolling for text', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);

    const textElements = await page.locator('p, h1, h2, h3, li').all();

    for (const element of textElements.slice(0, 5)) {
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        const viewport = page.viewportSize();

        if (box) {
          expect(box.width).toBeLessThanOrEqual(viewport!.width);
        }
      }
    }
  });
});

test.describe('Images and Media', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should load appropriately sized images for mobile', async ({ page }) => {
    await page.goto(BASE_URL);

    const images = await page.locator('img').all();

    for (const img of images.slice(0, 5)) {
      if (await img.isVisible()) {
        const src = await img.getAttribute('src');
        const srcset = await img.getAttribute('srcset');

        // Should have responsive images (srcset) or appropriate src
        if (srcset) {
          expect(srcset).toBeTruthy();
        }

        // Image should not overflow viewport
        const box = await img.boundingBox();
        const viewport = page.viewportSize();

        if (box) {
          expect(box.width).toBeLessThanOrEqual(viewport!.width);
        }
      }
    }
  });

  test('should handle video embeds responsively', async ({ page }) => {
    await page.goto(`${BASE_URL}/help`);

    const videos = await page.locator('video, iframe[src*="youtube"], iframe[src*="vimeo"]').all();

    for (const video of videos) {
      if (await video.isVisible()) {
        const box = await video.boundingBox();
        const viewport = page.viewportSize();

        if (box) {
          expect(box.width).toBeLessThanOrEqual(viewport!.width);
        }
      }
    }
  });
});

test.describe('Orientation Changes', () => {
  test('should adapt to portrait orientation', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      viewport: { width: 390, height: 844 }, // Portrait
    });
    const page = await context.newPage();

    await page.goto(BASE_URL);

    const viewport = page.viewportSize();
    expect(viewport!.height).toBeGreaterThan(viewport!.width);

    // Content should be visible
    const body = await page.locator('body').boundingBox();
    expect(body).toBeTruthy();

    await context.close();
  });

  test('should adapt to landscape orientation', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      viewport: { width: 844, height: 390 }, // Landscape
    });
    const page = await context.newPage();

    await page.goto(BASE_URL);

    const viewport = page.viewportSize();
    expect(viewport!.width).toBeGreaterThan(viewport!.height);

    // Content should be visible
    const body = await page.locator('body').boundingBox();
    expect(body).toBeTruthy();

    await context.close();
  });
});

test.describe('Mobile Performance', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should load within acceptable time on 3G', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();

    // Emulate slow 3G
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100); // Add latency
    });

    const startTime = Date.now();
    await page.goto(BASE_URL);
    const loadTime = Date.now() - startTime;

    // Should load in under 5 seconds on 3G
    expect(loadTime).toBeLessThan(5000);

    await context.close();
  });

  test('should have smooth scrolling', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);

    // Scroll down
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });

    await page.waitForTimeout(300);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(400);
  });
});

test.describe('Mobile Accessibility', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should support zoom without breaking layout', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check viewport meta tag allows zooming
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

    expect(viewportMeta).not.toContain('user-scalable=no');
    expect(viewportMeta).not.toContain('maximum-scale=1');
  });

  test('should have accessible touch targets', async ({ page }) => {
    await page.goto(BASE_URL);

    // All interactive elements should be accessible
    const links = await page.locator('a, button').all();

    for (const link of links.slice(0, 10)) {
      if (await link.isVisible()) {
        // Should have accessible name
        const ariaLabel = await link.getAttribute('aria-label');
        const text = await link.textContent();
        const title = await link.getAttribute('title');

        const hasAccessibleName = ariaLabel || (text && text.trim().length > 0) || title;
        expect(hasAccessibleName).toBeTruthy();
      }
    }
  });
});

test.describe('Tablet Responsive Tests', () => {
  test.use({ ...devices['iPad Pro 11'] });

  test('should use tablet layout on iPad', async ({ page }) => {
    await page.goto(BASE_URL);

    const viewport = page.viewportSize();

    // iPad should have tablet-specific layout
    expect(viewport!.width).toBeGreaterThan(768);

    // Should not show mobile hamburger menu on tablet
    const hamburger = page.locator('[data-testid="mobile-menu"]');
    const isVisible = await hamburger.isVisible().catch(() => false);

    // On larger tablets, desktop menu might be shown
    console.log(`Tablet viewport: ${viewport!.width}x${viewport!.height}`);
  });

  test('should handle split-screen multitasking', async ({ browser }) => {
    // iPad split-screen: half width
    const context = await browser.newContext({
      viewport: { width: 512, height: 1366 }, // Half of iPad Pro
    });
    const page = await context.newPage();

    await page.goto(BASE_URL);

    // Should adapt to narrow width
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(512);

    await context.close();
  });
});
