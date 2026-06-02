/**
 * Business Logic Security Tests (Day 54)
 *
 * Tests for business logic vulnerabilities specific to AuraOS HCM:
 * - Payroll manipulation prevention
 * - Leave balance tampering
 * - Attendance fraud prevention
 * - Multi-tenancy isolation
 * - Workflow bypass prevention
 * - Time-based attacks
 * - Race conditions
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Payroll Security', () => {
  test('should prevent salary manipulation via API', async ({ request }) => {
    // Login as employee
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'employee@auraos.com',
        password: 'Employee@123',
      },
    });

    const { token } = await loginResponse.json();

    // Try to update own salary
    const response = await request.patch(`${BASE_URL}/api/employees/me`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        salary: 1000000, // Try to set high salary
      },
    });

    // Should be forbidden
    expect([400, 403]).toContain(response.status());
  });

  test('should prevent payroll calculation tampering', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Try to manipulate payroll calculation
    const response = await request.post(`${BASE_URL}/api/payroll/calculate`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        employeeId: 'me',
        baseSalary: 999999, // Manipulated value
        deductions: 0,
      },
    });

    expect([400, 403]).toContain(response.status());
  });

  test('should prevent unauthorized payslip access', async ({ request }) => {
    // Employee 1 login
    const login1 = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee1@auraos.com', password: 'Employee@123' },
    });

    const { token: token1 } = await login1.json();

    // Try to access employee 2's payslip
    const response = await request.get(`${BASE_URL}/api/payroll/payslips/employee2-id`, {
      headers: { Authorization: `Bearer ${token1}` },
    });

    expect([403, 404]).toContain(response.status());
  });

  test('should validate payroll dates are in valid range', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'hr@auraos.com', password: 'HR@123' },
    });

    const { token } = await loginResponse.json();

    // Try to create payroll for future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);

    const response = await request.post(`${BASE_URL}/api/payroll/runs`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        payPeriod: futureDate.toISOString(),
        companyId: 'company-1',
      },
    });

    expect([400, 422]).toContain(response.status());
  });

  test('should prevent duplicate payroll runs for same period', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'hr@auraos.com', password: 'HR@123' },
    });

    const { token } = await loginResponse.json();

    const payPeriod = '2024-01-01';

    // Create first payroll run
    await request.post(`${BASE_URL}/api/payroll/runs`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { payPeriod, companyId: 'company-1' },
    });

    // Try to create duplicate
    const response = await request.post(`${BASE_URL}/api/payroll/runs`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { payPeriod, companyId: 'company-1' },
    });

    expect([400, 409]).toContain(response.status()); // 409 = Conflict
  });
});

test.describe('Leave Balance Manipulation', () => {
  test('should prevent negative leave balance bypass', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Try to apply for more leave than available
    const response = await request.post(`${BASE_URL}/api/leave/applications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        leaveTypeId: 'casual-leave',
        startDate: '2024-02-01',
        endDate: '2024-02-28', // 28 days (likely more than balance)
        reason: 'Personal',
      },
    });

    if (response.status() === 201) {
      // If it was accepted, balance should be checked
      const balanceResponse = await request.get(`${BASE_URL}/api/leave/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const balance = await balanceResponse.json();
      expect(balance.casual).toBeGreaterThanOrEqual(0); // Should not go negative
    } else {
      // Should reject if insufficient balance
      expect([400, 422]).toContain(response.status());
    }
  });

  test('should prevent leave accrual tampering', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Try to manually add leave balance
    const response = await request.patch(`${BASE_URL}/api/leave/balance`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        leaveTypeId: 'casual-leave',
        balance: 100, // Set high balance
      },
    });

    expect([403, 405]).toContain(response.status()); // 405 = Method Not Allowed
  });

  test('should validate leave dates are not in the past', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Try to apply for leave in the past
    const response = await request.post(`${BASE_URL}/api/leave/applications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        leaveTypeId: 'casual-leave',
        startDate: '2020-01-01',
        endDate: '2020-01-02',
        reason: 'Test',
      },
    });

    expect([400, 422]).toContain(response.status());
  });

  test('should prevent unauthorized leave approvals', async ({ request }) => {
    // Login as employee (not manager)
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Try to approve own leave
    const response = await request.patch(`${BASE_URL}/api/leave/applications/1/approve`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([403, 404]).toContain(response.status());
  });
});

test.describe('Attendance Fraud Prevention', () => {
  test('should prevent backdating attendance', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Try to mark attendance for past date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30); // 30 days ago

    const response = await request.post(`${BASE_URL}/api/attendance/clock-in`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        clockInTime: pastDate.toISOString(),
      },
    });

    // Should reject or require special approval
    expect([400, 403, 422]).toContain(response.status());
  });

  test('should prevent duplicate clock-in without clock-out', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Clock in
    await request.post(`${BASE_URL}/api/attendance/clock-in`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Try to clock in again without clock-out
    const response = await request.post(`${BASE_URL}/api/attendance/clock-in`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([400, 409]).toContain(response.status());
  });

  test.skip('should verify GPS location for attendance', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Try to clock in with fake GPS coordinates
    const response = await request.post(`${BASE_URL}/api/attendance/clock-in`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        latitude: 0, // Invalid coordinates
        longitude: 0,
      },
    });

    expect([400, 422]).toContain(response.status());
  });

  test('should prevent attendance regularization abuse', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Try to regularize attendance for many days
    const promises = [];
    for (let i = 1; i <= 30; i++) {
      promises.push(
        request.post(`${BASE_URL}/api/attendance/regularization`, {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            date: `2024-01-${i.toString().padStart(2, '0')}`,
            reason: 'Forgot to mark',
          },
        })
      );
    }

    const responses = await Promise.all(promises);
    const successful = responses.filter(r => r.ok()).length;

    // Should have limit on regularizations
    expect(successful).toBeLessThan(30);
  });
});

test.describe('Multi-Tenancy Isolation', () => {
  test('should prevent cross-tenant data access', async ({ request }) => {
    // Login to tenant 1
    const login1 = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'user@tenant1.com', password: 'Password@123' },
    });

    const { token: token1 } = await login1.json();

    // Try to access tenant 2's data
    const response = await request.get(`${BASE_URL}/api/employees`, {
      headers: {
        Authorization: `Bearer ${token1}`,
        'X-Tenant-ID': 'tenant-2', // Try to override tenant
      },
    });

    // Should only return tenant 1's data or reject
    if (response.ok()) {
      const data = await response.json();
      // Verify all employees belong to tenant 1
      if (Array.isArray(data)) {
        data.forEach(employee => {
          expect(employee.tenantId).not.toBe('tenant-2');
        });
      }
    }
  });

  test('should validate tenant ID in all operations', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'user@tenant1.com', password: 'Password@123' },
    });

    const { token } = await loginResponse.json();

    // Try to create employee for different tenant
    const response = await request.post(`${BASE_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@tenant2.com',
        tenantId: 'tenant-2', // Different tenant
      },
    });

    expect([400, 403]).toContain(response.status());
  });

  test('should prevent tenant enumeration', async ({ request }) => {
    // Try to access non-existent tenant
    const response = await request.get(`${BASE_URL}/api/tenants/non-existent-tenant`);

    // Should return same error as forbidden to prevent enumeration
    expect([403, 404]).toContain(response.status());
  });
});

test.describe('Workflow Bypass Prevention', () => {
  test('should enforce approval workflow sequence', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Create leave application
    const createResponse = await request.post(`${BASE_URL}/api/leave/applications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        leaveTypeId: 'casual-leave',
        startDate: '2024-03-01',
        endDate: '2024-03-02',
        reason: 'Personal',
      },
    });

    if (createResponse.ok()) {
      const application = await createResponse.json();

      // Try to skip to final approval without manager approval
      const finalApprovalResponse = await request.patch(
        `${BASE_URL}/api/leave/applications/${application.id}/final-approve`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      expect([400, 403]).toContain(finalApprovalResponse.status());
    }
  });

  test('should prevent status manipulation', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Try to directly set application status to approved
    const response = await request.patch(`${BASE_URL}/api/leave/applications/1`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        status: 'APPROVED', // Try to bypass approval
      },
    });

    expect([400, 403]).toContain(response.status());
  });

  test('should validate workflow permissions at each step', async ({ request }) => {
    // Login as employee
    const empLogin = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token: empToken } = await empLogin.json();

    // Try to perform manager action
    const response = await request.patch(`${BASE_URL}/api/leave/applications/1/approve`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });

    expect([403, 404]).toContain(response.status());
  });
});

test.describe('Time-Based Attacks', () => {
  test('should prevent time-of-check to time-of-use (TOCTOU) race conditions', async ({
    request,
  }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Make concurrent requests to apply for leave (testing race condition)
    const promises = Array(10)
      .fill(null)
      .map(() =>
        request.post(`${BASE_URL}/api/leave/applications`, {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            leaveTypeId: 'casual-leave',
            startDate: '2024-03-01',
            endDate: '2024-03-05', // 5 days
            reason: 'Personal',
          },
        })
      );

    const responses = await Promise.all(promises);
    const successful = responses.filter(r => r.ok()).length;

    // Should only allow valid applications based on available balance
    expect(successful).toBeLessThanOrEqual(1); // Only one should succeed
  });

  test('should use database transactions for critical operations', async ({ request }) => {
    // This is more of a code review check
    // Ensure that salary updates, balance deductions use transactions
    test.skip(); // Requires code inspection
  });
});

test.describe('Rate Limiting & Resource Exhaustion', () => {
  test('should rate limit expensive operations', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    // Make many concurrent report generation requests
    const promises = Array(50)
      .fill(null)
      .map(() =>
        request.post(`${BASE_URL}/api/reports/generate`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { type: 'payroll-summary' },
        })
      );

    const responses = await Promise.all(promises);
    const rateLimited = responses.some(r => r.status() === 429);

    expect(rateLimited).toBeTruthy();
  });

  test('should limit concurrent sessions per user', async ({ request }) => {
    // This requires multiple browser contexts
    test.skip(); // Implementation depends on requirements
  });
});

test.describe('Business Logic Edge Cases', () => {
  test('should handle zero and negative numbers correctly', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'hr@auraos.com', password: 'HR@123' },
    });

    const { token } = await loginResponse.json();

    // Try to set negative salary
    const response = await request.post(`${BASE_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        salary: -50000, // Negative salary
      },
    });

    expect([400, 422]).toContain(response.status());
  });

  test('should prevent integer overflow in calculations', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'hr@auraos.com', password: 'HR@123' },
    });

    const { token } = await loginResponse.json();

    // Try to set extremely large number
    const response = await request.post(`${BASE_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        salary: Number.MAX_SAFE_INTEGER + 1,
      },
    });

    expect([400, 422]).toContain(response.status());
  });

  test('should validate business rule constraints', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'hr@auraos.com', password: 'HR@123' },
    });

    const { token } = await loginResponse.json();

    // Try to set joining date in future
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const response = await request.post(`${BASE_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        joiningDate: futureDate.toISOString(),
      },
    });

    expect([400, 422]).toContain(response.status());
  });
});

test.describe('Idempotency', () => {
  test('should handle duplicate requests idempotently', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { email: 'employee@auraos.com', password: 'Employee@123' },
    });

    const { token } = await loginResponse.json();

    const idempotencyKey = crypto.randomUUID();

    // Make same request twice with same idempotency key
    const response1 = await request.post(`${BASE_URL}/api/leave/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': idempotencyKey,
      },
      data: {
        leaveTypeId: 'casual-leave',
        startDate: '2024-03-01',
        endDate: '2024-03-02',
        reason: 'Personal',
      },
    });

    const response2 = await request.post(`${BASE_URL}/api/leave/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': idempotencyKey,
      },
      data: {
        leaveTypeId: 'casual-leave',
        startDate: '2024-03-01',
        endDate: '2024-03-02',
        reason: 'Personal',
      },
    });

    // Both should succeed or second should return same result
    if (response1.ok() && response2.ok()) {
      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.id).toBe(data2.id); // Same resource
    }
  });
});
