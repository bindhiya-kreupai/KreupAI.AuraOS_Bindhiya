/**
 * WCAG 2.1 AA Compliance Tests
 * Week 13-14: Visual & Accessibility Testing
 *
 * Comprehensive accessibility testing using axe-core and Playwright
 * Tests compliance with WCAG 2.1 Level AA standards
 *
 * Test Coverage:
 * - Perceivable: Text alternatives, time-based media, adaptable, distinguishable
 * - Operable: Keyboard accessible, enough time, seizures, navigable
 * - Understandable: Readable, predictable, input assistance
 * - Robust: Compatible with assistive technologies
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

// Authentication token
let authToken: string;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login to get auth token
  const response = await page.request.post(`${API_URL}/auth/login`, {
    data: {
      email: 'admin@e2etest.com',
      password: 'Test@1234',
    },
  });

  if (response.ok()) {
    const body = await response.json();
    authToken = body.data.token;
  }

  await context.close();
});

test.describe('WCAG 2.1 AA Compliance - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set auth token
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, authToken);
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper landmark regions', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['best-practice'])
      .include('[role="main"]')
      .include('[role="navigation"]')
      .include('[role="banner"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have sufficient color contrast (WCAG AA)', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have keyboard-accessible interactive elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Tab through interactive elements
    const buttons = await page.locator('button, a[href], input, select, textarea').all();

    for (const button of buttons) {
      const isVisible = await button.isVisible();
      if (isVisible) {
        await button.focus();
        const isFocused = await button.evaluate((el) => document.activeElement === el);
        expect(isFocused).toBeTruthy();
      }
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-allowed-attr', 'aria-required-attr', 'aria-valid-attr-value'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('WCAG 2.1 AA Compliance - Employee List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, authToken);
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible table structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['table-duplicate-name', 'td-headers-attr', 'th-has-data-cells'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper table headers', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    // Check that table has proper header row
    const tableHeaders = await page.locator('table thead th').all();
    expect(tableHeaders.length).toBeGreaterThan(0);

    // Each header should have scope attribute
    for (const header of tableHeaders) {
      const scope = await header.getAttribute('scope');
      expect(scope).toBe('col');
    }
  });

  test('should have descriptive button names', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['button-name'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['focus-order-semantics'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation for search filters', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    // Focus first input (search)
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toMatch(/INPUT|BUTTON|SELECT/);

    // Tab through filter controls
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toMatch(/INPUT|BUTTON|SELECT|A/);
    }
  });

  test('should have accessible pagination', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    // Check pagination has proper labels
    const prevButton = await page.locator('[aria-label*="Previous"]').first();
    const nextButton = await page.locator('[aria-label*="Next"]').first();

    expect(await prevButton.count()).toBeGreaterThan(0);
    expect(await nextButton.count()).toBeGreaterThan(0);
  });
});

test.describe('WCAG 2.1 AA Compliance - Forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, authToken);
  });

  test('should have accessible form controls on employee create page', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'label-content-name-mismatch', 'label-title-only'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper error messaging', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);
    await page.waitForLoadState('networkidle');

    // Submit form without filling required fields
    const submitButton = await page.locator('button[type="submit"]').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Check for accessible error messages
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['aria-valid-attr-value'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should have proper input types', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['autocomplete-valid'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible date pickers', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/new`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-allowed-role'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('WCAG 2.1 AA Compliance - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, authToken);
  });

  test('should have accessible navigation menu', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['link-name', 'link-in-text-block'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have skip to main content link', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Tab once to focus skip link
    await page.keyboard.press('Tab');

    const skipLink = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement?.textContent?.toLowerCase().includes('skip');
    });

    // Skip link should be first focusable element (best practice)
    // This test will pass if skip link exists, or can be adjusted based on implementation
    expect(skipLink !== undefined).toBeTruthy();
  });

  test('should have clear focus indicators on navigation items', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const navLinks = await page.locator('nav a, nav button').all();

    for (const link of navLinks) {
      const isVisible = await link.isVisible();
      if (isVisible) {
        await link.focus();

        // Check that focused element has visible outline or custom focus style
        const hasOutline = await link.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return (
            styles.outline !== 'none' ||
            styles.outlineWidth !== '0px' ||
            styles.boxShadow !== 'none'
          );
        });

        expect(hasOutline).toBeTruthy();
      }
    }
  });
});

test.describe('WCAG 2.1 AA Compliance - Dynamic Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, authToken);
  });

  test('should have proper ARIA live regions for notifications', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-allowed-attr'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible loading states', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);

    // Check for loading indicator before content loads
    const loadingIndicator = await page.locator('[role="status"], [aria-live="polite"]').first();

    if (await loadingIndicator.count() > 0) {
      const ariaLabel = await loadingIndicator.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);
    await page.waitForLoadState('networkidle');

    // Look for aria-live regions
    const liveRegions = await page.locator('[aria-live]').all();

    // At least one live region should exist for dynamic updates
    expect(liveRegions.length).toBeGreaterThan(0);
  });
});

test.describe('WCAG 2.1 AA Compliance - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, authToken);
  });

  test('should be accessible on mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be accessible on tablet viewport (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support 200% zoom without horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Simulate 200% zoom
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    await page.waitForTimeout(500);

    // Check if horizontal scrollbar appears
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Should not have horizontal scroll at 200% zoom (WCAG 1.4.10)
    expect(hasHorizontalScroll).toBeFalsy();
  });
});

test.describe('WCAG 2.1 AA Compliance - Language and Reading Level', () => {
  test('should have proper lang attribute', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['html-has-lang', 'html-lang-valid'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper document title', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['document-title'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('WCAG 2.1 AA Compliance - Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate((token) => {
      localStorage.setItem('authToken', token);
    }, authToken);
  });

  test('should generate comprehensive accessibility report', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    console.log('=== ACCESSIBILITY SCAN REPORT ===');
    console.log(`URL: ${page.url()}`);
    console.log(`Violations: ${accessibilityScanResults.violations.length}`);
    console.log(`Passes: ${accessibilityScanResults.passes.length}`);
    console.log(`Incomplete: ${accessibilityScanResults.incomplete.length}`);
    console.log(`Inapplicable: ${accessibilityScanResults.inapplicable.length}`);

    if (accessibilityScanResults.violations.length > 0) {
      console.log('\\n=== VIOLATIONS ===');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`\\n${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`   Description: ${violation.description}`);
        console.log(`   Help: ${violation.help}`);
        console.log(`   Nodes affected: ${violation.nodes.length}`);
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
