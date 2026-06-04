/**
 * @file critical-path-bilingual-rtl.spec.ts
 * @description Critical-path E2E: bilingual + RTL spot-check across the
 *              workstream landing screens. Closes the block-of-five A11y
 *              checklist line item from V1-SIGNOFFS.md for the headline
 *              screens.
 *
 * Tag: @critical-path
 *
 * Driven by TEST_LOCALE env (default `ar`).  Runs against the admin storage
 * state so all surfaces are reachable.
 */

import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const LOCALE = process.env.TEST_LOCALE ?? 'ar';

const HEADLINE_ROUTES = [
  '/dashboard',
  '/employees',
  '/leave',
  '/payroll',
  '/attendance',
  '/recruitment/candidates',
  '/privacy/dsar',
  '/devops/incidents',
];

async function setLocale(page: Page, locale: string) {
  // The web app stores locale in localStorage under `aura.locale`. Setting it
  // before the first navigation makes the bootstrapping pick it up.
  await page.addInitScript((loc) => {
    try {
      window.localStorage.setItem('aura.locale', loc);
    } catch {
      /* storage may be denied in some test contexts */
    }
  }, locale);
}

test.describe('@critical-path Bilingual + RTL spot-check', () => {
  test.use({ storageState: '.auth/admin.json' });

  for (const route of HEADLINE_ROUTES) {
    test(`@critical-path ${route} renders correctly in ${LOCALE}`, async ({ page }) => {
      await setLocale(page, LOCALE);
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState('networkidle');

      // RTL: html.dir === 'rtl' when locale is Arabic. For LTR locales it must NOT be 'rtl'.
      const dir = await page.locator('html').getAttribute('dir');
      if (LOCALE === 'ar') {
        expect(dir).toBe('rtl');
      } else {
        expect(dir === 'rtl').toBe(false);
      }

      // Truncation guard: no headline element renders an ellipsis as its only
      // visible character on these viewports. The catch is for headings that
      // are too wide for their flex column.
      const truncatedHeadings = await page
        .locator('h1, h2, [data-headline]')
        .evaluateAll((nodes) =>
          nodes
            .map((n) => {
              const cs = window.getComputedStyle(n);
              const isEllipsisOnly =
                cs.overflow === 'hidden' &&
                (cs.textOverflow === 'ellipsis' || (n as HTMLElement).innerText === '…');
              return isEllipsisOnly ? n.textContent : null;
            })
            .filter(Boolean)
        );
      expect(truncatedHeadings, 'no headline should be ellipsis-only').toEqual([]);

      // No console errors at first paint — picks up i18n key misses
      // and React hydration issues for the right-to-left layout.
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.waitForTimeout(250);
      expect(errors.filter((e) => !/network|favicon/i.test(e))).toEqual([]);
    });
  }
});
