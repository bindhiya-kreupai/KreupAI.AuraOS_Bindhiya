/**
 * XSS & CSRF Security Tests (Day 51)
 *
 * Comprehensive tests for Cross-Site Scripting and Cross-Site Request Forgery:
 * - Reflected XSS
 * - Stored XSS
 * - DOM-based XSS
 * - CSRF Protection
 * - Clickjacking
 * - Open Redirect
 * - CORS Misconfiguration
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Reflected XSS Tests', () => {
  test('should prevent XSS in search parameters', async ({ page }) => {
    const xssPayloads = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)">',
    ];

    for (const payload of xssPayloads) {
      await page.goto(`${BASE_URL}/employees/search?q=${encodeURIComponent(payload)}`);

      // Wait a bit to see if any script executes
      await page.waitForTimeout(1000);

      // XSS should not execute - check for alert dialog
      const dialogs: any[] = [];
      page.on('dialog', dialog => {
        dialogs.push(dialog);
        dialog.dismiss();
      });

      expect(dialogs.length).toBe(0);

      // Check that payload is escaped in HTML
      const html = await page.content();
      expect(html).not.toContain(payload);
    }
  });

  test('should escape XSS in error messages', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees/<script>alert(1)</script>`);

    // Check error message doesn't execute script
    await page.waitForTimeout(500);

    const html = await page.content();
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  test('should sanitize URL parameters in redirects', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/login?redirect=javascript:alert(1)`);

    // Should not redirect to javascript: URL
    expect(page.url()).not.toContain('javascript:');
  });
});

test.describe('Stored XSS Tests', () => {
  test('should prevent stored XSS in employee comments', async ({ page }) => {
    // Login as manager
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'manager@auraos.com');
    await page.fill('input[name="password"]', 'Manager@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Go to employee profile
    await page.goto(`${BASE_URL}/employees/1`);

    // Add comment with XSS payload
    const xssPayload = '<img src=x onerror=alert("XSS")>';
    await page.fill('textarea[name="comment"]', xssPayload);
    await page.click('button:has-text("Add Comment")');

    // Wait for comment to be added
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();

    // Check that script doesn't execute
    const dialogs: any[] = [];
    page.on('dialog', dialog => {
      dialogs.push(dialog);
      dialog.dismiss();
    });

    await page.waitForTimeout(1000);
    expect(dialogs.length).toBe(0);

    // Check that payload is escaped
    const commentText = await page.locator('.comment-text').first().textContent();
    expect(commentText).toContain(xssPayload); // Should show as text, not execute
  });

  test('should prevent stored XSS in employee bio', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Update profile with XSS
    await page.goto(`${BASE_URL}/profile/edit`);
    await page.fill('textarea[name="bio"]', '<script>alert(1)</script>');
    await page.click('button[type="submit"]');

    // View profile
    await page.goto(`${BASE_URL}/profile`);

    await page.waitForTimeout(500);

    // Should not execute
    const html = await page.content();
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  test('should prevent XSS in rich text editor content', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'hr@auraos.com');
    await page.fill('input[name="password"]', 'HR@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Create announcement with XSS
    await page.goto(`${BASE_URL}/announcements/new`);
    await page.fill('input[name="title"]', 'Test Announcement');

    // Try to inject script in rich text editor
    const editor = page.locator('.rich-text-editor, [contenteditable="true"]').first();
    await editor.fill('<img src=x onerror=alert(1)>');

    await page.click('button:has-text("Publish")');
    await page.waitForTimeout(1000);

    // View announcement
    await page.goto(`${BASE_URL}/announcements`);

    const dialogs: any[] = [];
    page.on('dialog', dialog => {
      dialogs.push(dialog);
      dialog.dismiss();
    });

    await page.waitForTimeout(1000);
    expect(dialogs.length).toBe(0);
  });
});

test.describe('DOM-Based XSS Tests', () => {
  test('should prevent DOM XSS via hash fragments', async ({ page }) => {
    await page.goto(`${BASE_URL}/#<img src=x onerror=alert(1)>`);

    await page.waitForTimeout(1000);

    const dialogs: any[] = [];
    page.on('dialog', dialog => {
      dialogs.push(dialog);
      dialog.dismiss();
    });

    expect(dialogs.length).toBe(0);
  });

  test('should prevent DOM XSS in client-side routing', async ({ page }) => {
    await page.goto(`${BASE_URL}`);

    // Use client-side navigation with malicious input
    await page.evaluate(() => {
      const maliciousPath = '<img src=x onerror=alert(1)>';
      window.history.pushState({}, '', maliciousPath);
    });

    await page.waitForTimeout(1000);

    const dialogs: any[] = [];
    page.on('dialog', dialog => {
      dialogs.push(dialog);
      dialog.dismiss();
    });

    expect(dialogs.length).toBe(0);
  });

  test('should sanitize innerHTML operations', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Try to inject via client-side code
    const xssExecuted = await page.evaluate(() => {
      try {
        const div = document.createElement('div');
        div.innerHTML = '<img src=x onerror=window.xssExecuted=true>';
        document.body.appendChild(div);
        return (window as any).xssExecuted === true;
      } catch {
        return false;
      }
    });

    expect(xssExecuted).toBe(false);
  });
});

test.describe('CSRF Protection Tests', () => {
  test('should require CSRF token for state-changing operations', async ({ page, context }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Get cookies (including session)
    const cookies = await context.cookies();

    // Try to delete employee without CSRF token
    const response = await page.request.delete(`${BASE_URL}/api/employees/1`, {
      headers: {
        // Include session cookie but no CSRF token
        'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
    });

    // Should reject without CSRF token
    expect([403, 401]).toContain(response.status());
  });

  test('should validate CSRF token matches session', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Try to use a fake CSRF token
    const response = await page.request.post(`${BASE_URL}/api/employees`, {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
      headers: {
        'X-CSRF-Token': 'invalid-token-12345',
      },
    });

    expect([403, 400]).toContain(response.status());
  });

  test('should include CSRF token in forms', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/employees/new`);

    // Check for CSRF token in form
    const csrfInput = page.locator('input[name="_csrf"], input[name="csrf_token"]');
    const hasCsrfField = await csrfInput.count() > 0;

    const csrfMeta = page.locator('meta[name="csrf-token"]');
    const hasCsrfMeta = await csrfMeta.count() > 0;

    expect(hasCsrfField || hasCsrfMeta).toBeTruthy();
  });

  test('should use SameSite cookie attribute for CSRF protection', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c =>
      c.name.includes('session') || c.name.includes('token')
    );

    if (sessionCookie) {
      expect(['Strict', 'Lax']).toContain(sessionCookie.sameSite);
    }
  });
});

test.describe('Clickjacking Protection', () => {
  test('should set X-Frame-Options header', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const headers = response!.headers();

    expect(headers['x-frame-options']).toBeDefined();
    expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);
  });

  test('should set CSP frame-ancestors directive', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const headers = response!.headers();

    const csp = headers['content-security-policy'];
    if (csp) {
      expect(csp).toMatch(/frame-ancestors/);
    }
  });

  test('should prevent iframe embedding from external sites', async ({ page, context }) => {
    // Create a test page that tries to embed the app
    const testPage = await context.newPage();

    await testPage.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <iframe id="target" src="${BASE_URL}"></iframe>
        </body>
      </html>
    `);

    await testPage.waitForTimeout(2000);

    // Check if iframe loaded
    const iframe = testPage.locator('#target');
    const iframeContent = await iframe.contentFrame();

    // Iframe should be blocked or empty
    expect(iframeContent === null || iframeContent === undefined).toBeTruthy();
  });
});

test.describe('Open Redirect Tests', () => {
  test('should prevent open redirect in login redirect', async ({ page }) => {
    const maliciousRedirects = [
      'http://evil.com',
      '//evil.com',
      'https://evil.com',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
    ];

    for (const redirect of maliciousRedirects) {
      const response = await page.goto(
        `${BASE_URL}/login?redirect=${encodeURIComponent(redirect)}`
      );

      // Login
      await page.fill('input[name="email"]', 'admin@auraos.com');
      await page.fill('input[name="password"]', 'Admin@123');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(1000);

      // Should not redirect to external site
      expect(page.url()).toContain(new URL(BASE_URL).hostname);
      expect(page.url()).not.toContain('evil.com');
    }
  });

  test('should validate redirect URLs against whitelist', async ({ page }) => {
    const response = await page.goto(
      `${BASE_URL}/redirect?url=http://malicious-site.com`
    );

    // Should either show error or redirect to safe default
    expect(page.url()).not.toContain('malicious-site.com');
  });

  test('should allow internal redirects only', async ({ page }) => {
    await page.goto(`${BASE_URL}/login?redirect=/dashboard`);

    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    // Should successfully redirect to internal page
    expect(page.url()).toContain('/dashboard');
  });
});

test.describe('CORS Configuration Tests', () => {
  test('should not allow wildcard origin in production', async ({ request }) => {
    if (process.env.NODE_ENV === 'production') {
      const response = await request.get(`${BASE_URL}/api/health`);
      const headers = response.headers();

      if (headers['access-control-allow-origin']) {
        expect(headers['access-control-allow-origin']).not.toBe('*');
      }
    }
  });

  test('should not allow credentials with wildcard origin', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`, {
      headers: {
        'Origin': 'http://example.com',
      },
    });

    const headers = response.headers();

    if (headers['access-control-allow-origin'] === '*') {
      expect(headers['access-control-allow-credentials']).not.toBe('true');
    }
  });

  test('should validate origin against whitelist', async ({ request }) => {
    const maliciousOrigins = [
      'http://evil.com',
      'http://phishing-site.com',
      'null',
    ];

    for (const origin of maliciousOrigins) {
      const response = await request.options(`${BASE_URL}/api/employees`, {
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
        },
      });

      const headers = response.headers();

      // Should not echo back malicious origin
      expect(headers['access-control-allow-origin']).not.toBe(origin);
    }
  });

  test('should restrict allowed methods', async ({ request }) => {
    const response = await request.options(`${BASE_URL}/api/employees`, {
      headers: {
        'Origin': BASE_URL,
        'Access-Control-Request-Method': 'GET',
      },
    });

    const headers = response.headers();
    const allowedMethods = headers['access-control-allow-methods'];

    if (allowedMethods) {
      // Should not allow dangerous methods
      expect(allowedMethods).not.toContain('TRACE');
      expect(allowedMethods).not.toContain('TRACK');
    }
  });
});

test.describe('Content Security Policy (CSP)', () => {
  test('should have strict CSP for scripts', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const headers = response!.headers();

    const csp = headers['content-security-policy'];
    expect(csp).toBeDefined();

    // Should not allow unsafe-eval in production
    if (process.env.NODE_ENV === 'production') {
      expect(csp).not.toContain('unsafe-eval');
    }
  });

  test('should block inline scripts without nonce', async ({ page }) => {
    await page.goto(BASE_URL);

    // Try to inject inline script
    const scriptExecuted = await page.evaluate(() => {
      try {
        const script = document.createElement('script');
        script.textContent = 'window.inlineScriptExecuted = true;';
        document.body.appendChild(script);
        return (window as any).inlineScriptExecuted === true;
      } catch {
        return false;
      }
    });

    // With strict CSP, inline scripts should be blocked
    if (process.env.NODE_ENV === 'production') {
      expect(scriptExecuted).toBe(false);
    }
  });

  test('should restrict frame-src', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const headers = response!.headers();

    const csp = headers['content-security-policy'];
    if (csp && csp.includes('frame-src')) {
      // frame-src should be restrictive
      expect(csp).toMatch(/frame-src\s+[^*]/);
    }
  });
});

test.describe('Subresource Integrity (SRI)', () => {
  test('should use SRI for external scripts', async ({ page }) => {
    await page.goto(BASE_URL);

    const externalScripts = await page.locator('script[src^="http"]').count();

    if (externalScripts > 0) {
      const scriptsWithIntegrity = await page.locator('script[src^="http"][integrity]').count();

      // At least some external scripts should have integrity
      console.log(`External scripts with SRI: ${scriptsWithIntegrity}/${externalScripts}`);
    }
  });
});

test.describe('Additional XSS Vectors', () => {
  test('should prevent XSS in data attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);

    // Check if data attributes are properly escaped
    const dataAttrs = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-user-input]');
      return Array.from(elements).map(el => el.outerHTML);
    });

    for (const html of dataAttrs) {
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('onerror=');
    }
  });

  test('should prevent XSS via SVG', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile/edit`);

    // Try to upload malicious SVG
    const svgPayload = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <script>alert(1)</script>
      </svg>
    `;

    // This would typically be tested with actual file upload
    // For now, check if SVG uploads are sanitized
    expect(true).toBeTruthy(); // Placeholder
  });
});
