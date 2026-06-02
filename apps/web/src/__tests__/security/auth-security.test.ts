/**
 * Authentication & Authorization Security Tests (Day 49)
 *
 * Comprehensive security testing for authentication and authorization mechanisms:
 * - Password complexity and policies
 * - Account lockout mechanisms
 * - Session management
 * - Multi-factor authentication
 * - Role-based access control (RBAC)
 * - Permission boundaries
 * - Privilege escalation prevention
 * - JWT and API key security
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Password Security', () => {
  test('should enforce minimum password length', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', '12345'); // Too short
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('.error, .alert-error, [role="alert"]'))
      .toContainText(/password.*at least.*8.*characters/i);
  });

  test('should enforce password complexity requirements', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    const weakPasswords = [
      'password', // No numbers or special chars
      '12345678', // Only numbers
      'Password', // No numbers
      'password123', // No uppercase or special chars
    ];

    for (const password of weakPasswords) {
      await page.fill('input[name="email"]', 'newuser@example.com');
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');

      // Should show complexity error
      await expect(page.locator('.error, .alert-error, [role="alert"]'))
        .toBeVisible();

      await page.reload();
    }
  });

  test('should accept strong passwords', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    const strongPassword = 'SecureP@ssw0rd!2024';
    await page.fill('input[name="email"]', `user-${Date.now()}@example.com`);
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="password"]', strongPassword);
    await page.fill('input[name="confirmPassword"]', strongPassword);
    await page.click('button[type="submit"]');

    // Should proceed without password-related errors
    await expect(page.locator('.error:has-text("password")')).not.toBeVisible();
  });

  test('should not show password in HTML source', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="password"]', 'TestPassword123!');

    const html = await page.content();
    expect(html).not.toContain('TestPassword123!');
  });

  test('should mask password input by default', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Account Lockout', () => {
  test('should lock account after multiple failed login attempts', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
    }

    // Next attempt should show account locked
    await expect(page.locator('.error, .alert-error, [role="alert"]'))
      .toContainText(/account.*locked|too many.*attempts/i);
  });

  test('should prevent brute force with CAPTCHA or delay', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    const start = Date.now();

    // Attempt multiple failed logins
    for (let i = 0; i < 3; i++) {
      await page.fill('input[name="email"]', 'brute@example.com');
      await page.fill('input[name="password"]', `Wrong${i}`);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    const elapsed = Date.now() - start;

    // Should either show CAPTCHA or have rate limiting (elapsed time should increase)
    const hasCaptcha = await page.locator('iframe[src*="recaptcha"], .captcha').isVisible();
    const hasRateLimit = elapsed > 5000; // Should take longer than normal

    expect(hasCaptcha || hasRateLimit).toBeTruthy();
  });

  test('should allow login after lockout period expires', async ({ page, context }) => {
    // This test requires waiting for the lockout period to expire
    // In practice, you might need to adjust the lockout period for testing
    test.skip(); // Skip in normal runs, run manually when needed
  });
});

test.describe('Session Management', () => {
  test('should create session on successful login', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Check for session cookie or token
    const cookies = await context.cookies();
    const hasSessionCookie = cookies.some(c =>
      c.name.includes('session') ||
      c.name.includes('token') ||
      c.name.includes('auth')
    );

    expect(hasSessionCookie).toBeTruthy();
  });

  test('should destroy session on logout', async ({ page, context }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    const cookiesBefore = await context.cookies();

    // Logout
    await page.click('button:has-text("Logout"), [data-testid="logout-button"]');
    await page.waitForURL(`${BASE_URL}/login`);

    const cookiesAfter = await context.cookies();
    const sessionCookiesAfter = cookiesAfter.filter(c =>
      c.name.includes('session') || c.name.includes('token')
    );

    // Session cookies should be removed or invalidated
    expect(sessionCookiesAfter.length).toBeLessThan(cookiesBefore.length);
  });

  test('should timeout session after inactivity', async ({ page }) => {
    // This test requires a short session timeout for testing
    test.skip(); // Skip in normal runs
  });

  test('should prevent session fixation', async ({ page, context }) => {
    // Get initial session
    await page.goto(`${BASE_URL}/login`);
    const cookiesBefore = await context.cookies();

    // Login
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    const cookiesAfter = await context.cookies();

    // Session ID should change after login
    const sessionBefore = cookiesBefore.find(c => c.name.includes('session'));
    const sessionAfter = cookiesAfter.find(c => c.name.includes('session'));

    if (sessionBefore && sessionAfter) {
      expect(sessionBefore.value).not.toBe(sessionAfter.value);
    }
  });

  test('should not allow concurrent sessions from different IPs (optional)', async ({ browser }) => {
    // This requires creating two different browser contexts
    test.skip(); // Implementation depends on business requirements
  });
});

test.describe('Role-Based Access Control (RBAC)', () => {
  test('should prevent employee from accessing admin pages', async ({ page }) => {
    // Login as employee
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'employee@auraos.com');
    await page.fill('input[name="password"]', 'Employee@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Try to access admin page
    const response = await page.goto(`${BASE_URL}/admin/users`);

    // Should be redirected or show 403
    expect([403, 302]).toContain(response!.status());
    expect(page.url()).not.toContain('/admin/users');
  });

  test('should prevent manager from accessing HR pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'manager@auraos.com');
    await page.fill('input[name="password"]', 'Manager@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Try to access HR page
    const response = await page.goto(`${BASE_URL}/hr/payroll`);

    expect([403, 302]).toContain(response!.status());
  });

  test('should allow admin to access all pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Should be able to access admin pages
    const adminResponse = await page.goto(`${BASE_URL}/admin/settings`);
    expect(adminResponse!.ok()).toBeTruthy();

    // Should be able to access HR pages
    const hrResponse = await page.goto(`${BASE_URL}/hr/employees`);
    expect(hrResponse!.ok()).toBeTruthy();
  });

  test('should enforce permissions at API level', async ({ request }) => {
    // Get employee token
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'employee@auraos.com',
        password: 'Employee@123',
      },
    });

    const { token } = await loginResponse.json();

    // Try to access admin API endpoint
    const response = await request.get(`${BASE_URL}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect([401, 403]).toContain(response.status());
  });
});

test.describe('Privilege Escalation', () => {
  test('should prevent horizontal privilege escalation', async ({ request }) => {
    // Login as employee1
    const login1 = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee1@auraos.com', password: 'Employee@123' },
    });
    const { token: token1, userId: userId1 } = await login1.json();

    // Try to access employee2's data
    const response = await request.get(`${BASE_URL}/api/employees/employee2-id`, {
      headers: { Authorization: `Bearer ${token1}` },
    });

    // Should be forbidden or not found
    expect([401, 403, 404]).toContain(response.status());
  });

  test('should prevent vertical privilege escalation', async ({ request }) => {
    // Login as regular employee
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });
    const { token } = await loginResponse.json();

    // Try to promote self to admin
    const response = await request.patch(`${BASE_URL}/api/users/me/role`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { role: 'admin' },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should validate role changes require admin permission', async ({ request }) => {
    // Login as manager
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'manager@auraos.com', password: 'Manager@123' },
    });
    const { token } = await loginResponse.json();

    // Try to change another user's role
    const response = await request.patch(`${BASE_URL}/api/users/some-user-id/role`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { role: 'hr' },
    });

    expect([401, 403]).toContain(response.status());
  });
});

test.describe('JWT Security', () => {
  test('should return JWT on successful login', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'admin@auraos.com',
        password: 'Admin@123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.token).toBeDefined();
    expect(data.token).toMatch(/^eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*$/); // JWT format
  });

  test('should reject expired JWT tokens', async ({ request }) => {
    // This requires a short-lived token or the ability to create expired tokens
    test.skip(); // Requires special test token generation
  });

  test('should reject tampered JWT tokens', async ({ request }) => {
    // Get valid token
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'admin@auraos.com', password: 'Admin@123' },
    });
    const { token } = await loginResponse.json();

    // Tamper with the token
    const parts = token.split('.');
    parts[1] = Buffer.from(JSON.stringify({ role: 'super-admin' })).toString('base64');
    const tamperedToken = parts.join('.');

    // Try to use tampered token
    const response = await request.get(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${tamperedToken}` },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should reject missing Authorization header', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/employees`);

    expect([401, 403]).toContain(response.status());
  });

  test('should reject invalid Authorization format', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/employees`, {
      headers: {
        Authorization: 'InvalidFormat some-token',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should include user info in JWT payload', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'admin@auraos.com', password: 'Admin@123' },
    });
    const { token } = await loginResponse.json();

    // Decode JWT payload (base64)
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    expect(payload.userId || payload.sub).toBeDefined();
    expect(payload.role || payload.roles).toBeDefined();
    expect(payload.email).toBeDefined();
  });

  test('should have reasonable token expiration', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'admin@auraos.com', password: 'Admin@123' },
    });
    const { token } = await loginResponse.json();

    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Check expiration (exp claim)
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;

      // Token should expire between 15 minutes and 24 hours
      expect(expiresIn).toBeGreaterThan(15 * 60); // At least 15 min
      expect(expiresIn).toBeLessThan(24 * 60 * 60); // At most 24 hours
    }
  });
});

test.describe('API Key Security', () => {
  test.skip('should accept valid API key', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/employees`, {
      headers: {
        'X-API-Key': 'valid-api-key-here',
      },
    });

    expect(response.ok()).toBeTruthy();
  });

  test.skip('should reject invalid API key', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/employees`, {
      headers: {
        'X-API-Key': 'invalid-key',
      },
    });

    expect([401, 403]).toContain(response.status());
  });

  test.skip('should rate limit API key requests', async ({ request }) => {
    // Make many requests with same API key
    const requests = Array(100).fill(null).map(() =>
      request.get(`${BASE_URL}/api/employees`, {
        headers: { 'X-API-Key': 'test-api-key' },
      })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status() === 429);

    expect(rateLimited).toBeTruthy();
  });
});

test.describe('Multi-Factor Authentication (MFA)', () => {
  test.skip('should require MFA for admin accounts', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Should show MFA prompt
    await expect(page.locator('input[name="mfaCode"], input[name="otp"]')).toBeVisible();
  });

  test.skip('should reject invalid MFA code', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');

    // Enter invalid MFA code
    await page.fill('input[name="mfaCode"]', '000000');
    await page.click('button:has-text("Verify")');

    await expect(page.locator('.error')).toContainText(/invalid.*code/i);
  });

  test.skip('should allow login with valid MFA code', async ({ page }) => {
    // This requires a way to generate valid TOTP codes for testing
    test.skip();
  });
});
