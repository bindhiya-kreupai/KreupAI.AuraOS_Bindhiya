/**
 * SQL Injection Security Tests
 * Week 11-12: Security Testing
 *
 * Tests for SQL injection vulnerabilities in API endpoints
 * Based on OWASP Top 10 - A03:2021 Injection
 *
 * Tests cover:
 * - Classic SQL injection
 * - Blind SQL injection
 * - Time-based SQL injection
 * - Union-based SQL injection
 * - Error-based SQL injection
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3006/api/v1';

// SQL injection payloads - Common attack vectors
const SQL_INJECTION_PAYLOADS = [
  // Classic SQLi
  "' OR '1'='1",
  "' OR '1'='1' --",
  "' OR '1'='1' /*",
  "admin' --",
  "admin' #",
  "admin'/*",
  "' or 1=1--",
  "' or 1=1#",
  "' or 1=1/*",
  "') or '1'='1--",
  "') or ('1'='1--",

  // Union-based SQLi
  "' UNION SELECT NULL--",
  "' UNION SELECT NULL, NULL--",
  "' UNION SELECT NULL, NULL, NULL--",
  "' UNION ALL SELECT NULL--",

  // Time-based blind SQLi
  "'; WAITFOR DELAY '00:00:05'--",
  "'; SELECT SLEEP(5)--",
  "1'; SELECT pg_sleep(5)--",

  // Boolean-based blind SQLi
  "' AND '1'='1",
  "' AND '1'='2",
  "1' AND '1'='1",
  "1' AND '1'='2",

  // Error-based SQLi
  "'",
  "''",
  "';",
  "\"",
  "/",
  "//",
  "\\",

  // Tautology-based
  "1' OR '1' = '1",
  "1' OR 1 -- -",
  "1' OR 1=1-- -",
  "1' OR 1=1#",

  // Stacked queries
  "'; DROP TABLE users--",
  "'; DELETE FROM users WHERE '1'='1",
  "'; UPDATE users SET password='hacked' WHERE '1'='1",

  // PostgreSQL specific
  "1'; SELECT version()--",
  "1'; SELECT current_database()--",
];

test.describe('SQL Injection Security Tests', () => {
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

  test.describe('Employee API - SQL Injection Tests', () => {
    test('should prevent SQL injection in employee search query', async ({ request }) => {
      for (const payload of SQL_INJECTION_PAYLOADS.slice(0, 10)) {
        const response = await request.get(`${API_URL}/employees?search=${encodeURIComponent(payload)}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        // Should not return 500 (server error) or expose database errors
        expect(response.status()).not.toBe(500);

        const body = await response.text();

        // Should not contain SQL error messages
        expect(body.toLowerCase()).not.toContain('sql');
        expect(body.toLowerCase()).not.toContain('syntax error');
        expect(body.toLowerCase()).not.toContain('mysql');
        expect(body.toLowerCase()).not.toContain('postgresql');
        expect(body.toLowerCase()).not.toContain('ora-');
        expect(body.toLowerCase()).not.toContain('pg_');
        expect(body.toLowerCase()).not.toContain('sqlite');
        expect(body.toLowerCase()).not.toContain('odbc');
        expect(body.toLowerCase()).not.toContain('microsoft sql');

        // Should return empty results or proper error, not dump database
        if (response.ok()) {
          const data = await response.json();
          expect(Array.isArray(data.data)).toBe(true);
          // Should not return all users (common SQLi result)
          expect(data.data.length).toBeLessThan(1000);
        }
      }
    });

    test('should prevent SQL injection in employee filter parameters', async ({ request }) => {
      const filterParams = [
        { department: "' OR '1'='1" },
        { position: "admin' --" },
        { status: "' UNION SELECT NULL--" },
        { location: "'; DROP TABLE employees--" },
      ];

      for (const params of filterParams) {
        const queryString = new URLSearchParams(params as any).toString();
        const response = await request.get(`${API_URL}/employees?${queryString}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        expect(response.status()).not.toBe(500);

        const body = await response.text();
        expect(body.toLowerCase()).not.toContain('sql');
        expect(body.toLowerCase()).not.toContain('syntax error');
      }
    });

    test('should prevent SQL injection in employee ID parameter', async ({ request }) => {
      const maliciousIds = [
        "1' OR '1'='1",
        "1'; DROP TABLE employees--",
        "1' UNION SELECT NULL--",
        "1' AND SLEEP(5)--",
      ];

      for (const id of maliciousIds) {
        const response = await request.get(`${API_URL}/employees/${encodeURIComponent(id)}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        // Should return 404 (not found) or 400 (bad request), not 500
        expect([400, 404]).toContain(response.status());

        const body = await response.text();
        expect(body.toLowerCase()).not.toContain('sql');
      }
    });

    test('should prevent SQL injection in employee creation', async ({ request }) => {
      const maliciousEmployee = {
        employeeCode: "EMP-' OR '1'='1--",
        firstName: "'; DROP TABLE employees--",
        lastName: "' UNION SELECT NULL--",
        email: "test@example.com",
        department: "' OR 1=1--",
      };

      const response = await request.post(`${API_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: maliciousEmployee,
      });

      // Should either reject or sanitize, not execute SQL
      const body = await response.text();
      expect(body.toLowerCase()).not.toContain('sql');
      expect(body.toLowerCase()).not.toContain('syntax error');

      // If successful, verify data was properly escaped
      if (response.status() === 201) {
        const data = await response.json();
        expect(data.data.firstName).toBe(maliciousEmployee.firstName); // Stored as-is, not executed
      }
    });
  });

  test.describe('Authentication API - SQL Injection Tests', () => {
    test('should prevent SQL injection in login email field', async ({ request }) => {
      const maliciousEmails = [
        "admin@example.com' OR '1'='1",
        "admin@example.com' --",
        "' OR 1=1--",
        "admin'/*",
        "'; DROP TABLE users--",
      ];

      for (const email of maliciousEmails) {
        const response = await request.post(`${API_URL}/auth/login`, {
          data: {
            email,
            password: 'anypassword',
          },
        });

        // Should not authenticate with SQL injection
        expect(response.status()).toBe(401);

        const body = await response.text();
        expect(body.toLowerCase()).not.toContain('sql');
        expect(body.toLowerCase()).not.toContain('syntax error');
      }
    });

    test('should prevent SQL injection in login password field', async ({ request }) => {
      const maliciousPasswords = [
        "' OR '1'='1",
        "password' OR '1'='1' --",
        "' UNION SELECT NULL--",
      ];

      for (const password of maliciousPasswords) {
        const response = await request.post(`${API_URL}/auth/login`, {
          data: {
            email: 'admin@e2etest.com',
            password,
          },
        });

        // Should not authenticate with SQL injection
        expect(response.status()).toBe(401);

        const body = await response.text();
        expect(body.toLowerCase()).not.toContain('sql');
      }
    });
  });

  test.describe('Payroll API - SQL Injection Tests', () => {
    test('should prevent SQL injection in payslip filters', async ({ request }) => {
      const response = await request.get(
        `${API_URL}/payroll/payslips?employeeId=${"' OR '1'='1"}&month=${"' OR '1'='1"}&year=2024`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status()).not.toBe(500);

      const body = await response.text();
      expect(body.toLowerCase()).not.toContain('sql');
      expect(body.toLowerCase()).not.toContain('syntax error');
    });

    test('should prevent SQL injection in payslip ID', async ({ request }) => {
      const maliciousIds = [
        "1' OR '1'='1",
        "1'; SELECT * FROM payslips--",
      ];

      for (const id of maliciousIds) {
        const response = await request.get(`${API_URL}/payroll/payslips/${encodeURIComponent(id)}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        expect([400, 404]).toContain(response.status());

        const body = await response.text();
        expect(body.toLowerCase()).not.toContain('sql');
      }
    });
  });

  test.describe('Reports API - SQL Injection Tests', () => {
    test('should prevent SQL injection in report filters', async ({ request }) => {
      const response = await request.get(
        `${API_URL}/reports?type=${"' OR '1'='1"}&status=${"' UNION SELECT NULL--"}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status()).not.toBe(500);

      const body = await response.text();
      expect(body.toLowerCase()).not.toContain('sql');
    });
  });

  test.describe('Leave Management API - SQL Injection Tests', () => {
    test('should prevent SQL injection in leave application filters', async ({ request }) => {
      const response = await request.get(
        `${API_URL}/leave/applications?employeeId=${"' OR '1'='1"}&status=${"admin' --"}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status()).not.toBe(500);

      const body = await response.text();
      expect(body.toLowerCase()).not.toContain('sql');
    });
  });

  test.describe('Time-based SQL Injection Tests', () => {
    test('should not be vulnerable to time-based blind SQL injection', async ({ request }) => {
      const timeBasedPayloads = [
        "'; WAITFOR DELAY '00:00:05'--",
        "'; SELECT SLEEP(5)--",
        "1'; SELECT pg_sleep(5)--",
      ];

      for (const payload of timeBasedPayloads) {
        const startTime = Date.now();

        const response = await request.get(`${API_URL}/employees?search=${encodeURIComponent(payload)}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          timeout: 10000, // 10 second timeout
        });

        const duration = Date.now() - startTime;

        // Should respond quickly, not delay for 5 seconds
        expect(duration).toBeLessThan(3000); // Should respond in <3s

        expect(response.status()).not.toBe(500);
      }
    });
  });

  test.describe('Second-Order SQL Injection Tests', () => {
    test('should prevent second-order SQL injection via stored data', async ({ request }) => {
      // Create employee with malicious data
      const maliciousData = {
        employeeCode: `EMP-${Date.now()}`,
        firstName: "'; DROP TABLE employees--",
        lastName: "' OR '1'='1",
        email: `test.${Date.now()}@example.com`,
        phone: '+1234567890',
      };

      const createResponse = await request.post(`${API_URL}/employees`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: maliciousData,
      });

      if (createResponse.status() === 201) {
        const createdEmployee = await createResponse.json();
        const employeeId = createdEmployee.data.id;

        // Retrieve the employee - malicious data should be escaped
        const getResponse = await request.get(`${API_URL}/employees/${employeeId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        expect(getResponse.ok()).toBe(true);

        const body = await getResponse.text();
        expect(body.toLowerCase()).not.toContain('sql');
        expect(body.toLowerCase()).not.toContain('syntax error');

        // Cleanup
        await request.delete(`${API_URL}/employees/${employeeId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
      }
    });
  });

  test.describe('Error Message Disclosure Tests', () => {
    test('should not expose database structure in error messages', async ({ request }) => {
      const response = await request.get(`${API_URL}/employees?invalidParam=${"' OR '1'='1"}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const body = await response.text();

      // Should not expose table names
      expect(body.toLowerCase()).not.toContain('employees');
      expect(body.toLowerCase()).not.toContain('users');
      expect(body.toLowerCase()).not.toContain('table');
      expect(body.toLowerCase()).not.toContain('column');

      // Should not expose database technology
      expect(body.toLowerCase()).not.toContain('postgresql');
      expect(body.toLowerCase()).not.toContain('prisma');
      expect(body.toLowerCase()).not.toContain('sequelize');
    });
  });
});
