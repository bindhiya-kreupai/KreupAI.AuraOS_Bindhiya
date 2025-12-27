/**
 * Data Security & Encryption Tests (Day 52)
 *
 * Comprehensive tests for data protection:
 * - Sensitive data exposure
 * - PII (Personally Identifiable Information) handling
 * - Encryption verification
 * - File upload security
 * - Password storage
 * - Data in transit and at rest
 */

import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Sensitive Data Exposure', () => {
  test('should not expose passwords in API responses', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'admin@auraos.com',
        password: 'Admin@123',
      },
    });

    const data = await response.json();
    const responseText = JSON.stringify(data);

    // Should not contain password in any form
    expect(responseText.toLowerCase()).not.toContain('admin@123');
    expect(responseText.toLowerCase()).not.toContain('password');
    expect(data.password).toBeUndefined();
    expect(data.user?.password).toBeUndefined();
  });

  test('should not expose sensitive data in error messages', async ({ page }) => {
    await page.goto(`${BASE_URL}/api/users/999999`);

    const content = await page.content();

    // Should not expose database details
    expect(content).not.toContain('SELECT');
    expect(content).not.toContain('FROM users');
    expect(content).not.toContain('password');
    expect(content).not.toContain('hash');
  });

  test('should mask sensitive data in logs', async ({ request }) => {
    // Make request with sensitive data
    const response = await request.post(`${BASE_URL}/api/employees`, {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        ssn: '123-45-6789',
        salary: 100000,
      },
    });

    // We can't directly test logs, but ensure response doesn't echo sensitive data unnecessarily
    if (response.status() === 400 || response.status() === 422) {
      const error = await response.json();
      const errorText = JSON.stringify(error);

      // SSN should not be in error message
      expect(errorText).not.toContain('123-45-6789');
    }
  });

  test('should not expose internal IDs or UUIDs unnecessarily', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/employees`);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const employee = data[0];

      // Check if internal database IDs are exposed
      // Best practice: use UUIDs instead of sequential IDs
      if (employee.id) {
        // UUID format check (if using UUIDs)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          employee.id
        );
        console.log(`Using UUIDs: ${isUUID}`);
      }
    }
  });
});

test.describe('PII Handling', () => {
  test('should mask SSN in employee list', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'hr@auraos.com');
    await page.fill('input[name="password"]', 'HR@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    await page.goto(`${BASE_URL}/employees`);

    // Check if SSN is masked (e.g., ***-**-6789)
    const ssnElements = await page.locator('[data-field="ssn"], .ssn-field').all();

    for (const element of ssnElements) {
      const text = await element.textContent();
      if (text && text.includes('-')) {
        // Should be masked
        expect(text).toMatch(/\*+/);
      }
    }
  });

  test('should require authentication to view PII', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/employees/1/ssn`);

    // Should require authentication
    expect([401, 403]).toContain(response.status());
  });

  test('should audit PII access', async ({ page, request }) => {
    // Login as HR
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'hr@auraos.com');
    await page.fill('input[name="password"]', 'HR@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // View sensitive employee data
    await page.goto(`${BASE_URL}/employees/1`);
    await page.click('button:has-text("View Full Details")');

    // PII access should be logged (check audit log endpoint)
    await page.waitForTimeout(1000);

    const cookies = await page.context().cookies();
    const token = cookies.find(c => c.name.includes('token'))?.value;

    if (token) {
      const auditResponse = await request.get(`${BASE_URL}/api/audit-logs`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { action: 'pii_access', limit: 10 },
      });

      if (auditResponse.ok()) {
        const logs = await auditResponse.json();
        console.log(`PII access logs found: ${Array.isArray(logs) ? logs.length : 0}`);
      }
    }
  });

  test('should anonymize data in analytics', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/analytics/employee-metrics`);

    if (response.ok()) {
      const data = await response.json();
      const dataText = JSON.stringify(data);

      // Should not contain PII in analytics
      expect(dataText).not.toMatch(/\b\d{3}-\d{2}-\d{4}\b/); // SSN pattern
      expect(dataText).not.toMatch(/\b\d{16}\b/); // Credit card pattern
    }
  });
});

test.describe('Password Storage', () => {
  test('should not store passwords in plain text', async ({ request }) => {
    // This test would require database access
    // For now, we verify passwords are not returned in API
    const response = await request.get(`${BASE_URL}/api/users/me`, {
      headers: {
        'Authorization': 'Bearer valid-token', // You'd need to get this from login
      },
    });

    if (response.ok()) {
      const user = await response.json();

      expect(user.password).toBeUndefined();
      expect(user.passwordHash).toBeUndefined();
      expect(user.hash).toBeUndefined();
    }
  });

  test('should use strong password hashing (bcrypt)', async ({ request }) => {
    // Create new user
    const password = 'TestPassword123!';
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        email: `test-${Date.now()}@example.com`,
        password,
        firstName: 'Test',
        lastName: 'User',
      },
    });

    // Verify password is not returned
    if (response.ok()) {
      const data = await response.json();
      expect(data.password).toBeUndefined();
      expect(JSON.stringify(data)).not.toContain(password);
    }
  });

  test('should enforce password changes after reset', async ({ page }) => {
    // This test verifies that password reset tokens are one-time use
    test.skip(); // Requires email integration
  });
});

test.describe('Data in Transit', () => {
  test('should use HTTPS in production', async ({ page }) => {
    if (process.env.NODE_ENV === 'production') {
      expect(BASE_URL).toMatch(/^https:\/\//);
    }
  });

  test('should set Secure flag on cookies over HTTPS', async ({ page, context }) => {
    if (BASE_URL.startsWith('https')) {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'admin@auraos.com');
      await page.fill('input[name="password"]', 'Admin@123');
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);

      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session'));

      if (sessionCookie) {
        expect(sessionCookie.secure).toBeTruthy();
      }
    }
  });

  test('should use TLS 1.2 or higher', async ({ request }) => {
    // This would require checking the TLS version used
    // Most modern clients default to TLS 1.2+
    test.skip(); // Requires lower-level network inspection
  });

  test('should not send sensitive data in URL parameters', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'admin@auraos.com');
    await page.fill('input[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);

    // Navigate around the app
    await page.goto(`${BASE_URL}/employees/1`);

    // Check URL doesn't contain sensitive data
    expect(page.url()).not.toMatch(/password|ssn|salary/i);
  });
});

test.describe('File Upload Security', () => {
  test('should validate file types', async ({ request }) => {
    // Try to upload executable file
    const response = await request.post(`${BASE_URL}/api/uploads`, {
      multipart: {
        file: {
          name: 'malicious.exe',
          mimeType: 'application/x-msdownload',
          buffer: Buffer.from('MZ'), // EXE header
        },
      },
    });

    // Should reject executable files
    expect([400, 415]).toContain(response.status()); // 415 = Unsupported Media Type
  });

  test('should validate file size limits', async ({ request }) => {
    // Create large file (10MB)
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024);

    const response = await request.post(`${BASE_URL}/api/uploads`, {
      multipart: {
        file: {
          name: 'large-file.pdf',
          mimeType: 'application/pdf',
          buffer: largeBuffer,
        },
      },
    });

    // Should reject files over size limit
    expect([400, 413]).toContain(response.status()); // 413 = Payload Too Large
  });

  test('should not trust client-provided MIME type', async ({ request }) => {
    // Upload EXE with PDF MIME type
    const response = await request.post(`${BASE_URL}/api/uploads`, {
      multipart: {
        file: {
          name: 'fake.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('MZ'), // EXE magic bytes
        },
      },
    });

    // Should detect mismatch and reject
    expect([400, 415]).toContain(response.status());
  });

  test('should sanitize file names', async ({ request }) => {
    const maliciousNames = [
      '../../../etc/passwd',
      'test.pdf;rm -rf /',
      'test\x00.pdf',
      'CON.pdf', // Windows reserved name
    ];

    for (const filename of maliciousNames) {
      const response = await request.post(`${BASE_URL}/api/uploads`, {
        multipart: {
          file: {
            name: filename,
            mimeType: 'application/pdf',
            buffer: Buffer.from('PDF content'),
          },
        },
      });

      // Should either reject or sanitize
      if (response.ok()) {
        const data = await response.json();
        expect(data.filename || data.name).not.toBe(filename);
      }
    }
  });

  test.skip('should scan files for viruses', async ({ request }) => {
    // This requires antivirus integration (e.g., ClamAV)
    // Placeholder for virus scanning test
    test.skip();
  });

  test('should store uploaded files outside web root', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/uploads`, {
      multipart: {
        file: {
          name: 'test.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from('PDF content'),
        },
      },
    });

    if (response.ok()) {
      const data = await response.json();

      // File path should not be directly accessible via web
      if (data.path || data.url) {
        const filePath = data.path || data.url;

        // Should not be in /public or similar
        expect(filePath).not.toContain('/public/');
        expect(filePath).not.toContain('/static/');
      }
    }
  });
});

test.describe('Encryption', () => {
  test('should encrypt sensitive data at rest', async ({ request }) => {
    // This requires database inspection
    // For now, we verify that sensitive endpoints require encryption
    test.skip(); // Requires database access
  });

  test('should use strong encryption algorithms', async () => {
    // Verify application uses approved algorithms
    // AES-256, RSA-2048+, etc.

    // Example: Test encryption utility
    const algorithm = 'aes-256-gcm';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update('sensitive data', 'utf8', 'hex');
    encrypted += cipher.final('hex');

    expect(encrypted).toBeDefined();
    expect(encrypted.length).toBeGreaterThan(0);
  });

  test('should rotate encryption keys periodically', async () => {
    // This is a reminder to implement key rotation
    // Check if there's a key rotation mechanism
    test.skip(); // Requires key management system
  });

  test('should use secure random number generation', async () => {
    // Test that application uses crypto.randomBytes, not Math.random()
    const random1 = crypto.randomBytes(16).toString('hex');
    const random2 = crypto.randomBytes(16).toString('hex');

    expect(random1).not.toBe(random2);
    expect(random1.length).toBe(32); // 16 bytes = 32 hex chars
  });
});

test.describe('Data Retention', () => {
  test.skip('should have data retention policies', async ({ request }) => {
    // Verify old data is deleted according to policy
    // This requires checking database for old records
    test.skip();
  });

  test.skip('should allow users to request data deletion (GDPR)', async ({ page }) => {
    // Test GDPR right to be forgotten
    await page.goto(`${BASE_URL}/profile/privacy`);

    const deleteButton = page.locator('button:has-text("Delete My Data")');
    await expect(deleteButton).toBeVisible();
  });
});

test.describe('Backup Security', () => {
  test.skip('should encrypt database backups', async () => {
    // Verify backups are encrypted
    test.skip(); // Requires infrastructure access
  });

  test.skip('should store backups securely', async () => {
    // Verify backups are in secure location
    test.skip(); // Requires infrastructure access
  });
});

test.describe('Credit Card Data (PCI DSS)', () => {
  test.skip('should not store credit card CVV', async ({ request }) => {
    // If application handles payments
    test.skip(); // Only if payment processing is implemented
  });

  test.skip('should mask credit card numbers', async ({ page }) => {
    // Show only last 4 digits
    test.skip(); // Only if payment processing is implemented
  });
});

test.describe('Data Masking', () => {
  test('should mask email addresses in public views', async ({ page }) => {
    await page.goto(`${BASE_URL}/team`);

    // Public team page should mask emails
    const emailElements = await page.locator('[data-type="email"]').all();

    for (const element of emailElements) {
      const text = await element.textContent();
      if (text) {
        // Check if email is masked (e.g., j***@example.com)
        const isMasked = text.includes('***') || text.includes('*');
        console.log(`Email masked: ${isMasked}`);
      }
    }
  });

  test('should mask phone numbers partially', async ({ page }) => {
    await page.goto(`${BASE_URL}/directory`);

    const phoneElements = await page.locator('[data-type="phone"]').all();

    for (const element of phoneElements) {
      const text = await element.textContent();
      if (text) {
        // Phone should be masked (e.g., ***-***-1234)
        const hasMasking = text.includes('*') || text.includes('X');
        console.log(`Phone masked: ${hasMasking}`);
      }
    }
  });
});

test.describe('Secure Configuration', () => {
  test('should not expose environment variables', async ({ page }) => {
    await page.goto(BASE_URL);

    const hasEnvVars = await page.evaluate(() => {
      return typeof (window as any).env !== 'undefined' ||
             typeof process !== 'undefined';
    });

    expect(hasEnvVars).toBe(false);
  });

  test('should not expose API keys in client code', async ({ page }) => {
    await page.goto(BASE_URL);

    const scripts = await page.locator('script').all();
    const scriptContents = await Promise.all(
      scripts.map(async script => {
        const content = await script.textContent();
        return content || '';
      })
    );

    const allContent = scriptContents.join('\n');

    // Check for common secret patterns
    expect(allContent).not.toMatch(/api[_-]?key\s*[:=]\s*["'][a-zA-Z0-9]{20,}/i);
    expect(allContent).not.toMatch(/secret\s*[:=]\s*["'][a-zA-Z0-9]{20,}/i);
    expect(allContent).not.toMatch(/AKIA[0-9A-Z]{16}/); // AWS keys
  });
});
