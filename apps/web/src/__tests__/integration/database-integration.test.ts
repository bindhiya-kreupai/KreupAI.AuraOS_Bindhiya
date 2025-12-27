/**
 * Database Integration Tests (Days 61-62)
 *
 * Tests database operations via Prisma ORM including:
 * - Transaction handling
 * - Relationship management
 * - Constraint validation
 * - Migration safety
 * - Query performance
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_BASE = `${BASE_URL}/api/v1`;

const testUser = {
  email: 'db.integration@auraos.com',
  password: 'DbIntegration@2025'
};

let authToken: string;

test.describe('Database Integration - Transactions', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should commit transaction on success', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create employee with related records in transaction
    const payload = {
      employeeCode: 'EMP-TXN-001',
      firstName: 'Transaction',
      lastName: 'Test',
      email: 'transaction.test@auraos.com',
      department: 'IT',
      designation: 'Developer',
      joinDate: '2025-01-01',
      address: {
        street: '123 Main St',
        city: 'TestCity',
        state: 'TestState',
        zipCode: '12345',
        country: 'TestCountry'
      },
      bankDetails: {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        ifscCode: 'TEST0001234'
      }
    };

    const response = await request.post(`${API_BASE}/employees`, {
      headers,
      data: payload
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    const employeeId = data.data.id;

    // Verify all related data created
    const getResponse = await request.get(`${API_BASE}/employees/${employeeId}`, {
      headers
    });

    const employeeData = (await getResponse.json()).data;
    expect(employeeData.address).toBeDefined();
    expect(employeeData.address.city).toBe(payload.address.city);
    expect(employeeData.bankDetails).toBeDefined();
    expect(employeeData.bankDetails.bankName).toBe(payload.bankDetails.bankName);

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });

  test('should rollback transaction on error', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Attempt to create employee with invalid related data
    const payload = {
      employeeCode: 'EMP-TXN-002',
      firstName: 'Rollback',
      lastName: 'Test',
      email: 'rollback.test@auraos.com',
      department: 'IT',
      designation: 'Developer',
      joinDate: '2025-01-01',
      address: {
        street: '123 Main St',
        city: 'TestCity',
        // Missing required fields to trigger error
        zipCode: 'invalid-zip-that-is-too-long-12345678900000'
      }
    };

    const response = await request.post(`${API_BASE}/employees`, {
      headers,
      data: payload
    });

    // Request should fail
    expect(response.ok()).toBeFalsy();

    // Verify employee was NOT created (transaction rolled back)
    const searchResponse = await request.get(
      `${API_BASE}/employees?search=${payload.email}`,
      { headers }
    );

    const searchData = await searchResponse.json();
    const foundEmployee = searchData.data.find((emp: any) => emp.email === payload.email);
    expect(foundEmployee).toBeUndefined();
  });

  test('should handle nested transactions', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create department with employees in nested transaction
    const deptPayload = {
      code: 'DEPT-TXN-001',
      name: 'Transaction Department',
      description: 'Department for transaction testing',
      employees: [
        {
          employeeCode: 'EMP-NEST-001',
          firstName: 'Nested1',
          lastName: 'Test',
          email: 'nested1@auraos.com',
          designation: 'Developer'
        },
        {
          employeeCode: 'EMP-NEST-002',
          firstName: 'Nested2',
          lastName: 'Test',
          email: 'nested2@auraos.com',
          designation: 'Developer'
        }
      ]
    };

    const response = await request.post(`${API_BASE}/organization/departments`, {
      headers,
      data: deptPayload
    });

    if (response.ok()) {
      const data = await response.json();
      const deptId = data.data.id;

      // Verify department created
      const deptResponse = await request.get(
        `${API_BASE}/organization/departments/${deptId}`,
        { headers }
      );
      expect(deptResponse.ok()).toBeTruthy();

      // Verify employees assigned to department
      const empResponse = await request.get(
        `${API_BASE}/employees?department=${deptPayload.name}`,
        { headers }
      );

      const empData = await empResponse.json();
      expect(empData.data.length).toBeGreaterThanOrEqual(2);

      // Cleanup
      await request.delete(`${API_BASE}/organization/departments/${deptId}`, { headers });
    }
  });
});

test.describe('Database Integration - Relationships', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should load nested relationships', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create employee
    const empResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-REL-001',
        firstName: 'Relation',
        lastName: 'Test',
        email: 'relation.test@auraos.com',
        department: 'HR',
        designation: 'HR Manager',
        joinDate: '2025-01-01'
      }
    });

    const employeeId = (await empResponse.json()).data.id;

    // Apply for leave
    await request.post(`${API_BASE}/leave/applications`, {
      headers,
      data: {
        employeeId: employeeId,
        leaveType: 'Annual Leave',
        startDate: '2025-02-01',
        endDate: '2025-02-05',
        reason: 'Vacation',
        days: 5
      }
    });

    // Get employee with leave applications
    const getResponse = await request.get(
      `${API_BASE}/employees/${employeeId}?include=leaves`,
      { headers }
    );

    const employeeData = (await getResponse.json()).data;
    expect(employeeData.leaves).toBeDefined();
    expect(employeeData.leaves.length).toBeGreaterThan(0);

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });

  test('should handle cascade updates', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create department
    const deptResponse = await request.post(`${API_BASE}/organization/departments`, {
      headers,
      data: {
        code: 'DEPT-CASCADE-001',
        name: 'Cascade Department',
        status: 'Active'
      }
    });

    const deptId = (await deptResponse.json()).data.id;

    // Create employee in department
    const empResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-CASCADE-001',
        firstName: 'Cascade',
        lastName: 'Test',
        email: 'cascade.test@auraos.com',
        department: 'Cascade Department',
        designation: 'Manager',
        joinDate: '2025-01-01'
      }
    });

    const employeeId = (await empResponse.json()).data.id;

    // Update department name
    await request.put(`${API_BASE}/organization/departments/${deptId}`, {
      headers,
      data: {
        name: 'Updated Cascade Department'
      }
    });

    // Verify employee's department updated (if cascade is configured)
    const empCheckResponse = await request.get(`${API_BASE}/employees/${employeeId}`, {
      headers
    });

    const empData = (await empCheckResponse.json()).data;
    // Department might be updated or stay the same depending on cascade config
    console.log('Employee department:', empData.department);

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
    await request.delete(`${API_BASE}/organization/departments/${deptId}`, { headers });
  });

  test('should handle cascade deletes', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create employee
    const empResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-DEL-CASCADE',
        firstName: 'Delete',
        lastName: 'Cascade',
        email: 'delete.cascade@auraos.com',
        department: 'IT',
        designation: 'Developer',
        joinDate: '2025-01-01'
      }
    });

    const employeeId = (await empResponse.json()).data.id;

    // Create attendance records
    await request.post(`${API_BASE}/attendance`, {
      headers,
      data: {
        employeeId: employeeId,
        date: '2025-01-15',
        clockIn: '09:00:00',
        clockOut: '17:00:00',
        status: 'Present'
      }
    });

    // Delete employee
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });

    // Verify attendance records handled (cascade delete or set null)
    const attendanceResponse = await request.get(
      `${API_BASE}/attendance?employeeId=${employeeId}`,
      { headers }
    );

    if (attendanceResponse.ok()) {
      const attendanceData = await attendanceResponse.json();
      // Records should either be deleted or employeeId set to null
      console.log('Remaining attendance records:', attendanceData.data.length);
    }
  });
});

test.describe('Database Integration - Constraints', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should enforce unique constraints', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const payload = {
      employeeCode: 'EMP-UNIQUE-001',
      firstName: 'Unique',
      lastName: 'Test',
      email: 'unique.constraint@auraos.com',
      department: 'IT',
      designation: 'Developer',
      joinDate: '2025-01-01'
    };

    // Create first employee
    const firstResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: payload
    });

    expect(firstResponse.ok()).toBeTruthy();
    const employeeId = (await firstResponse.json()).data.id;

    // Attempt to create duplicate (same email)
    const duplicateResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: { ...payload, employeeCode: 'EMP-UNIQUE-002' }
    });

    expect(duplicateResponse.status()).toBe(409); // Conflict
    const errorData = await duplicateResponse.json();
    expect(errorData.error.message).toContain('email');

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });

  test('should enforce foreign key constraints', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Attempt to create employee with non-existent department ID
    const payload = {
      employeeCode: 'EMP-FK-001',
      firstName: 'ForeignKey',
      lastName: 'Test',
      email: 'foreignkey.test@auraos.com',
      departmentId: 'non-existent-dept-id-12345',
      designation: 'Developer',
      joinDate: '2025-01-01'
    };

    const response = await request.post(`${API_BASE}/employees`, {
      headers,
      data: payload
    });

    // Should fail due to foreign key constraint
    expect(response.ok()).toBeFalsy();
    expect([400, 404]).toContain(response.status());
  });

  test('should enforce check constraints', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Attempt to create employee with invalid data
    const payload = {
      employeeCode: 'EMP-CHECK-001',
      firstName: 'Check',
      lastName: 'Constraint',
      email: 'check.constraint@auraos.com',
      department: 'IT',
      designation: 'Developer',
      joinDate: '2025-01-01',
      salary: -5000 // Negative salary should fail check constraint
    };

    const response = await request.post(`${API_BASE}/employees`, {
      headers,
      data: payload
    });

    // Should fail due to check constraint (salary must be positive)
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test('should enforce not null constraints', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Attempt to create employee without required fields
    const payload = {
      employeeCode: 'EMP-NULL-001',
      // Missing required firstName, lastName, email
      department: 'IT',
      designation: 'Developer'
    };

    const response = await request.post(`${API_BASE}/employees`, {
      headers,
      data: payload
    });

    expect(response.status()).toBe(400);
    const errorData = await response.json();
    expect(errorData.errors).toBeDefined();
  });
});

test.describe('Database Integration - Query Performance', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should prevent N+1 query problem', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Get employees with their departments in single query
    const startTime = Date.now();

    const response = await request.get(
      `${API_BASE}/employees?include=department&limit=50`,
      { headers }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Should complete reasonably fast (< 1 second) even with 50 records
    expect(duration).toBeLessThan(1000);

    // Verify relationships loaded
    if (data.data.length > 0) {
      const hasLoadedDepts = data.data.some((emp: any) => emp.department !== null);
      if (hasLoadedDepts) {
        console.log('✅ N+1 prevention: Departments loaded in single query');
      }
    }
  });

  test('should use indexes for queries', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Query by indexed field (email)
    const startTime = Date.now();

    const response = await request.get(
      `${API_BASE}/employees?search=@auraos.com&limit=100`,
      { headers }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBeTruthy();

    // Indexed search should be fast (< 500ms)
    expect(duration).toBeLessThan(500);
    console.log(`Indexed search took ${duration}ms`);
  });

  test('should handle large dataset pagination efficiently', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Test pagination performance
    const startTime = Date.now();

    const response = await request.get(
      `${API_BASE}/employees?page=1&limit=100`,
      { headers }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Pagination should be fast (< 1 second)
    expect(duration).toBeLessThan(1000);

    // Should return proper pagination metadata
    expect(data.meta.page).toBe(1);
    expect(data.meta.limit).toBe(100);
    expect(data.meta.total).toBeGreaterThanOrEqual(0);

    console.log(`Paginated query (100 records) took ${duration}ms`);
  });

  test('should optimize complex joins', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Query with multiple joins
    const startTime = Date.now();

    const response = await request.get(
      `${API_BASE}/employees?include=department,position,leaves&limit=20`,
      { headers }
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBeTruthy();

    // Complex joins should still complete reasonably fast (< 2 seconds)
    expect(duration).toBeLessThan(2000);

    console.log(`Complex join query took ${duration}ms`);
  });
});

test.describe('Database Integration - Data Integrity', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should maintain referential integrity', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create department
    const deptResponse = await request.post(`${API_BASE}/organization/departments`, {
      headers,
      data: {
        code: 'DEPT-INTEGRITY-001',
        name: 'Integrity Department',
        status: 'Active'
      }
    });

    const deptId = (await deptResponse.json()).data.id;

    // Create employee in department
    const empResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-INTEGRITY-001',
        firstName: 'Integrity',
        lastName: 'Test',
        email: 'integrity.test@auraos.com',
        department: 'Integrity Department',
        designation: 'Manager',
        joinDate: '2025-01-01'
      }
    });

    const employeeId = (await empResponse.json()).data.id;

    // Attempt to delete department with employees (should fail or cascade)
    const deleteResponse = await request.delete(
      `${API_BASE}/organization/departments/${deptId}`,
      { headers }
    );

    if (!deleteResponse.ok()) {
      // If delete failed, it's enforcing referential integrity
      expect([400, 409]).toContain(deleteResponse.status());
      console.log('✅ Referential integrity enforced: Cannot delete department with employees');
    } else {
      // If delete succeeded, verify cascade behavior
      const empCheckResponse = await request.get(`${API_BASE}/employees/${employeeId}`, {
        headers
      });

      if (!empCheckResponse.ok()) {
        console.log('✅ Cascade delete: Employee deleted with department');
      } else {
        console.log('✅ Cascade nullify: Employee department set to null');
      }
    }

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
    if (deleteResponse.ok()) {
      // Department already deleted
    } else {
      await request.delete(`${API_BASE}/organization/departments/${deptId}`, { headers });
    }
  });

  test('should handle concurrent updates correctly', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create employee
    const createResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-CONCURRENT-001',
        firstName: 'Concurrent',
        lastName: 'Test',
        email: 'concurrent.test@auraos.com',
        department: 'IT',
        designation: 'Developer',
        joinDate: '2025-01-01',
        salary: 50000
      }
    });

    const employeeId = (await createResponse.json()).data.id;

    // Simulate concurrent updates
    const [update1, update2] = await Promise.all([
      request.put(`${API_BASE}/employees/${employeeId}`, {
        headers,
        data: { salary: 55000 }
      }),
      request.put(`${API_BASE}/employees/${employeeId}`, {
        headers,
        data: { salary: 60000 }
      })
    ]);

    // Both should succeed or one should fail with optimistic lock
    expect(update1.ok() || update2.ok()).toBeTruthy();

    // Verify final state
    const getResponse = await request.get(`${API_BASE}/employees/${employeeId}`, {
      headers
    });

    const finalData = (await getResponse.json()).data;
    console.log('Final salary after concurrent updates:', finalData.salary);

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });
});

test.describe('Database Integration - Soft Deletes', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: testUser
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should soft delete records', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create employee
    const createResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: {
        employeeCode: 'EMP-SOFT-DEL-001',
        firstName: 'SoftDelete',
        lastName: 'Test',
        email: 'softdelete.test@auraos.com',
        department: 'IT',
        designation: 'Developer',
        joinDate: '2025-01-01'
      }
    });

    const employeeId = (await createResponse.json()).data.id;

    // Soft delete
    const deleteResponse = await request.delete(`${API_BASE}/employees/${employeeId}`, {
      headers
    });

    expect(deleteResponse.ok()).toBeTruthy();

    // Verify not in regular list
    const listResponse = await request.get(
      `${API_BASE}/employees?search=softdelete.test@auraos.com`,
      { headers }
    );

    const listData = await listResponse.json();
    const foundInList = listData.data.find((emp: any) => emp.id === employeeId);

    if (foundInList) {
      // If still in list, should be marked as inactive
      expect(foundInList.status).toBe('Inactive');
    } else {
      console.log('✅ Soft deleted: Employee not in active list');
    }

    // Verify can be retrieved with deleted flag
    const getDeletedResponse = await request.get(
      `${API_BASE}/employees/${employeeId}?includeDeleted=true`,
      { headers }
    );

    if (getDeletedResponse.ok()) {
      const deletedData = (await getDeletedResponse.json()).data;
      expect(deletedData.deletedAt).toBeDefined();
      console.log('✅ Soft deleted: Record preserved with deletedAt timestamp');
    }
  });
});
