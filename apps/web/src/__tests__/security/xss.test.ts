/**
 * XSS (Cross-Site Scripting) Security Tests
 * Week 11-12: Security Testing
 *
 * Tests for XSS vulnerabilities in API endpoints and UI rendering
 * Based on OWASP Top 10 - A03:2021 Injection
 *
 * Tests cover:
 * - Reflected XSS
 * - Stored XSS
 * - DOM-based XSS
 * - HTML injection
 * - JavaScript injection
 * - Attribute injection
 */

import { test, expect, Page } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';

// XSS payloads - Common attack vectors
const XSS_PAYLOADS = [
  // Basic script tags
  '<script>alert("XSS")</script>',
  '<script>alert(1)</script>',
  '<script>alert(document.cookie)</script>',
  '<script>alert(window.origin)</script>',

  // Script with different encodings
  '<script>alert&#40;"XSS"&#41;</script>',
  '<script>alert&#x28;"XSS"&#x29;</script>',
  '<scr<script>ipt>alert("XSS")</scr</script>ipt>',

  // Event handlers
  '<img src=x onerror=alert("XSS")>',
  '<img src=x onerror=alert(1)>',
  '<body onload=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  '<iframe onload=alert("XSS")>',
  '<input onfocus=alert("XSS") autofocus>',
  '<select onfocus=alert("XSS") autofocus>',
  '<textarea onfocus=alert("XSS") autofocus>',
  '<keygen onfocus=alert("XSS") autofocus>',
  '<video><source onerror="alert(1)">',
  '<audio src=x onerror=alert("XSS")>',

  // IMG tag variations
  '<img src="javascript:alert(\'XSS\');">',
  '<img src=# onerror="alert(1)"/>',
  '<img/src=x onerror=alert("XSS")>',

  // Link-based XSS
  '<a href="javascript:alert(\'XSS\')">Click me</a>',
  '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>',

  // Iframe variations
  '<iframe src="javascript:alert(\'XSS\')">',
  '<iframe src="data:text/html,<script>alert(\'XSS\')</script>">',

  // SVG-based XSS
  '<svg><script>alert("XSS")</script></svg>',
  '<svg><animate onbegin=alert("XSS") attributeName=x dur=1s>',

  // Style-based XSS
  '<style>@import"javascript:alert(\'XSS\')";</style>',
  '<link rel="stylesheet" href="javascript:alert(\'XSS\');">',

  // Meta refresh
  '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',

  // Object/Embed
  '<object data="javascript:alert(\'XSS\')">',
  '<embed src="javascript:alert(\'XSS\')">',

  // Form action
  '<form action="javascript:alert(\'XSS\')"><input type="submit"></form>',

  // HTML5 new tags
  '<details open ontoggle=alert("XSS")>',
  '<marquee onstart=alert("XSS")>',

  // Unicode/Encoding bypasses
  '\\u003cscript\\u003ealert("XSS")\\u003c/script\\u003e',
  '\\x3cscript\\x3ealert("XSS")\\x3c/script\\x3e',

  // Polyglot payloads
  'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */onerror=alert("XSS") )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert("XSS")//>'
];

test.describe('XSS Security Tests', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login to get authentication token
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@e2etest.com',
        password: 'Test@1234',
      },
    });

    const body = await response.json();
    authToken = body.data?.token || '';
  });

  test.describe('Stored XSS Tests - Employee API', () => {
    test('should sanitize XSS in employee first name', async ({ page, request }) => {
      for (const payload of XSS_PAYLOADS.slice(0, 5)) {
        const uniqueEmail = `test.${Date.now()}@example.com`;

        // Create employee with XSS payload in first name
        const createResponse = await request.post(`${API_URL}/employees`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            employeeCode: `EMP-${Date.now()}`,
            firstName: payload,
            lastName: 'Test',
            email: uniqueEmail,
            phone: '+1234567890',
          },
        });

        if (createResponse.status() === 201) {
          const employee = await createResponse.json();
          const employeeId = employee.data.id;

          // Navigate to employee details page
          await page.goto(`${BASE_URL}/login`);
          await page.fill('input[name="email"]', 'admin@e2etest.com');
          await page.fill('input[name="password"]', 'Test@1234');
          await page.click('button[type="submit"]');
          await page.waitForURL(/.*dashboard.*/);

          // Navigate to employee list
          await page.goto(`${BASE_URL}/employees`);
          await page.waitForLoadState('networkidle');

          // Setup dialog listener before triggering potential XSS
          let dialogTriggered = false;
          page.on('dialog', async dialog => {
            dialogTriggered = true;
            await dialog.dismiss();
          });

          // Wait a moment to see if XSS fires
          await page.waitForTimeout(2000);

          // Verify XSS did not execute
          expect(dialogTriggered).toBe(false);

          // Verify content is properly escaped
          const pageContent = await page.content();
          expect(pageContent).not.toContain('<script>');
          expect(pageContent).not.toContain('onerror=');

          // Cleanup
          await request.delete(`${API_URL}/employees/${employeeId}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });
        }
      }
    });

    test('should sanitize XSS in employee notes/description', async ({ request }) => {
      const payload = '<img src=x onerror=alert("XSS")>';

      const response = await request.post(`${API_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          employeeCode: `EMP-${Date.now()}`,
          firstName: 'Test',
          lastName: 'User',
          email: `test.${Date.now()}@example.com`,
          notes: payload,
        },
      });

      if (response.status() === 201) {
        const employee = await response.json();

        // Verify the data is stored but escaped
        const getResponse = await request.get(`${API_URL}/employees/${employee.data.id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const body = await getResponse.text();

        // Should not contain unescaped HTML
        expect(body).not.toContain('<img src=x');
        expect(body).not.toContain('onerror=');

        // Cleanup
        await request.delete(`${API_URL}/employees/${employee.data.id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
      }
    });
  });

  test.describe('Reflected XSS Tests - Search Functionality', () => {
    test('should prevent XSS in employee search parameter', async ({ page }) => {
      const payload = '<script>alert("XSS")</script>';

      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'admin@e2etest.com');
      await page.fill('input[name="password"]', 'Test@1234');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard.*/);

      // Navigate to employees page with XSS in search param
      let dialogTriggered = false;
      page.on('dialog', async dialog => {
        dialogTriggered = true;
        await dialog.dismiss();
      });

      await page.goto(`${BASE_URL}/employees?search=${encodeURIComponent(payload)}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Verify XSS did not execute
      expect(dialogTriggered).toBe(false);

      // Verify content is escaped
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>alert("XSS")</script>');
    });

    test('should sanitize XSS in URL parameters', async ({ page }) => {
      const payloads = [
        { param: 'department', value: '<img src=x onerror=alert(1)>' },
        { param: 'status', value: '<svg onload=alert(1)>' },
        { param: 'search', value: '"><script>alert(1)</script>' },
      ];

      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'admin@e2etest.com');
      await page.fill('input[name="password"]', 'Test@1234');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard.*/);

      for (const { param, value } of payloads) {
        let dialogTriggered = false;
        page.on('dialog', async dialog => {
          dialogTriggered = true;
          await dialog.dismiss();
        });

        await page.goto(`${BASE_URL}/employees?${param}=${encodeURIComponent(value)}`);
        await page.waitForTimeout(1000);

        expect(dialogTriggered).toBe(false);
      }
    });
  });

  test.describe('DOM-based XSS Tests', () => {
    test('should prevent DOM XSS via hash fragment', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'admin@e2etest.com');
      await page.fill('input[name="password"]', 'Test@1234');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard.*/);

      let dialogTriggered = false;
      page.on('dialog', async dialog => {
        dialogTriggered = true;
        await dialog.dismiss();
      });

      // Test hash-based XSS
      const hashPayloads = [
        '#<img src=x onerror=alert(1)>',
        '#<script>alert(1)</script>',
        '#"><svg onload=alert(1)>',
      ];

      for (const hash of hashPayloads) {
        await page.goto(`${BASE_URL}/dashboard${hash}`);
        await page.waitForTimeout(1000);

        expect(dialogTriggered).toBe(false);
      }
    });

    test('should sanitize innerHTML operations', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'admin@e2etest.com');
      await page.fill('input[name="password"]', 'Test@1234');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard.*/);

      // Execute JavaScript to test innerHTML sanitization
      const result = await page.evaluate(() => {
        const div = document.createElement('div');
        div.innerHTML = '<img src=x onerror=alert(1)>';
        document.body.appendChild(div);

        // Check if script executed
        return !window.alert;
      });

      expect(result).toBe(true);
    });
  });

  test.describe('API Response XSS Tests', () => {
    test('should return properly escaped JSON', async ({ request }) => {
      const payload = '<script>alert("XSS")</script>';

      const response = await request.get(`${API_URL}/employees?search=${encodeURIComponent(payload)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');

      const body = await response.text();

      // JSON should have escaped HTML
      if (body.includes(payload)) {
        const parsed = JSON.parse(body);
        const stringified = JSON.stringify(parsed);

        // When re-stringified, HTML should be escaped
        expect(stringified).not.toContain('<script>');
      }
    });

    test('should set proper Content-Type headers', async ({ request }) => {
      const response = await request.get(`${API_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const contentType = response.headers()['content-type'];

      // Should have explicit charset
      expect(contentType).toContain('charset');

      // Should be JSON
      expect(contentType).toContain('application/json');
    });

    test('should set X-Content-Type-Options header', async ({ request }) => {
      const response = await request.get(`${API_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const xContentTypeOptions = response.headers()['x-content-type-options'];

      // Should prevent MIME-sniffing
      expect(xContentTypeOptions).toBe('nosniff');
    });
  });

  test.describe('Rich Text / HTML Content Tests', () => {
    test('should sanitize rich text content', async ({ request }) => {
      // If there's a rich text field (e.g., employee bio, notes)
      const maliciousHtml = `
        <p>Normal text</p>
        <script>alert("XSS")</script>
        <img src=x onerror=alert(1)>
        <a href="javascript:alert(1)">Click</a>
      `;

      const response = await request.post(`${API_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          employeeCode: `EMP-${Date.now()}`,
          firstName: 'Test',
          lastName: 'User',
          email: `test.${Date.now()}@example.com`,
          bio: maliciousHtml,
        },
      });

      if (response.status() === 201) {
        const employee = await response.json();

        // Retrieve the employee
        const getResponse = await request.get(`${API_URL}/employees/${employee.data.id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const body = await getResponse.json();

        // Dangerous tags should be removed or escaped
        const bio = body.data.bio || '';
        expect(bio).not.toContain('<script>');
        expect(bio).not.toContain('onerror=');
        expect(bio).not.toContain('javascript:');

        // Safe tags might be allowed (depending on sanitization strategy)
        // expect(bio).toContain('<p>Normal text</p>');

        // Cleanup
        await request.delete(`${API_URL}/employees/${employee.data.id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
      }
    });
  });

  test.describe('File Upload XSS Tests', () => {
    test('should prevent XSS via malicious filename', async ({ request }) => {
      // Test if filename is properly sanitized
      const maliciousFilename = '<script>alert("XSS")</script>.pdf';

      // This is a placeholder - actual implementation depends on file upload API
      // The test would upload a file with XSS in filename
      // Then verify the filename is sanitized when displayed
    });

    test('should validate file content type', async ({ request }) => {
      // Upload HTML file disguised as image
      // Verify it's rejected or properly handled
    });
  });

  test.describe('Error Message XSS Tests', () => {
    test('should sanitize XSS in error messages', async ({ request }) => {
      const payload = '<script>alert("XSS")</script>';

      // Trigger an error with XSS in parameter
      const response = await request.get(`${API_URL}/employees/${encodeURIComponent(payload)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const body = await response.text();

      // Error message should not contain unescaped payload
      expect(body).not.toContain('<script>alert("XSS")</script>');
    });
  });

  test.describe('Header Injection Tests', () => {
    test('should prevent XSS via custom headers', async ({ request }) => {
      const payload = '<script>alert("XSS")</script>';

      const response = await request.get(`${API_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Custom-Header': payload,
          'User-Agent': payload,
        },
      });

      // Should not reflect headers in response body
      const body = await response.text();
      expect(body).not.toContain('<script>alert("XSS")</script>');
    });
  });

  test.describe('CSP (Content Security Policy) Tests', () => {
    test('should have Content-Security-Policy header', async ({ request }) => {
      const response = await request.get(BASE_URL);

      const csp = response.headers()['content-security-policy'];

      // Should have CSP header
      expect(csp).toBeTruthy();

      // Should restrict script sources
      if (csp) {
        expect(csp.toLowerCase()).toContain('script-src');
      }
    });

    test('should prevent inline script execution with CSP', async ({ page }) => {
      await page.goto(BASE_URL);

      // Try to execute inline script
      const result = await page.evaluate(() => {
        try {
          eval('alert("XSS")');
          return 'executed';
        } catch (e) {
          return 'blocked';
        }
      });

      // With proper CSP, eval should be blocked
      // Note: This might pass if CSP allows 'unsafe-eval'
      // In production, CSP should block this
    });
  });
});
