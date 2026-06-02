/**
 * API Integration Tests (Days 59-60)
 *
 * Tests comprehensive API endpoint interactions including:
 * - Authentication flow
 * - CRUD operations with data consistency
 * - Pagination and filtering
 * - Error handling across endpoints
 * - Cross-endpoint data integrity
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const API_BASE = `${BASE_URL}/api/v1`;

// Test user credentials
const testUser = {
  email: 'integration.test@auraos.com',
  password: 'IntegrationTest@2025',
  firstName: 'Integration',
  lastName: 'Tester'
};

let authToken: string;
let testEmployeeId: string;
let testDepartmentId: string;

test.describe('API Integration Tests - Authentication Flow', () => {
  test('should complete full authentication workflow', async ({ request }) => {
    // Step 1: Login
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();

    expect(loginData.success).toBe(true);
    expect(loginData.data.accessToken).toBeDefined();
    expect(loginData.data.refreshToken).toBeDefined();
    expect(loginData.data.user.email).toBe(testUser.email);

    authToken = loginData.data.accessToken;
    const refreshToken = loginData.data.refreshToken;

    // Step 2: Use access token for authenticated request
    const meResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    expect(meResponse.ok()).toBeTruthy();
    const meData = await meResponse.json();
    expect(meData.data.email).toBe(testUser.email);

    // Step 3: Refresh token
    const refreshResponse = await request.post(`${API_BASE}/auth/refresh`, {
      data: {
        refreshToken
      }
    });

    expect(refreshResponse.ok()).toBeTruthy();
    const refreshData = await refreshResponse.json();
    expect(refreshData.data.accessToken).toBeDefined();
    expect(refreshData.data.accessToken).not.toBe(authToken);

    const newToken = refreshData.data.accessToken;

    // Step 4: Use new token for request
    const verifyNewTokenResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${newToken}`
      }
    });

    expect(verifyNewTokenResponse.ok()).toBeTruthy();

    // Step 5: Logout
    const logoutResponse = await request.post(`${API_BASE}/auth/logout`, {
      headers: {
        Authorization: `Bearer ${newToken}`
      }
    });

    expect(logoutResponse.ok()).toBeTruthy();

    // Step 6: Verify token invalidated
    const afterLogoutResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${newToken}`
      }
    });

    expect(afterLogoutResponse.status()).toBe(401);
  });

  test('should handle token expiration and refresh cycle', async ({ request }) => {
    // Login to get fresh tokens
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    const { accessToken, refreshToken } = (await loginResponse.json()).data;

    // Simulate token about to expire - use refresh token
    const refreshResponse = await request.post(`${API_BASE}/auth/refresh`, {
      data: { refreshToken }
    });

    expect(refreshResponse.ok()).toBeTruthy();
    const newTokens = (await refreshResponse.json()).data;
    expect(newTokens.accessToken).toBeDefined();
    expect(newTokens.refreshToken).toBeDefined();

    // New token should work
    const meResponse = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${newTokens.accessToken}` }
    });

    expect(meResponse.ok()).toBeTruthy();
  });
});

test.describe('API Integration Tests - Employee CRUD Operations', () => {
  test.beforeAll(async ({ request }) => {
    // Get auth token
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should complete full CRUD lifecycle for employee', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // CREATE: Create new employee
    const createPayload = {
      employeeCode: 'EMP-INT-001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe.integration@auraos.com',
      phone: '+1234567890',
      dateOfBirth: '1990-01-15',
      gender: 'Male',
      joinDate: '2025-01-01',
      department: 'Engineering',
      designation: 'Software Engineer',
      employmentType: 'Full-time',
      status: 'Active'
    };

    const createResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: createPayload
    });

    expect(createResponse.ok()).toBeTruthy();
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);
    expect(createData.data.employeeCode).toBe(createPayload.employeeCode);
    expect(createData.data.email).toBe(createPayload.email);

    testEmployeeId = createData.data.id;

    // READ: Get employee by ID
    const getResponse = await request.get(`${API_BASE}/employees/${testEmployeeId}`, {
      headers
    });

    expect(getResponse.ok()).toBeTruthy();
    const getData = await getResponse.json();
    expect(getData.data.id).toBe(testEmployeeId);
    expect(getData.data.firstName).toBe(createPayload.firstName);
    expect(getData.data.lastName).toBe(createPayload.lastName);

    // UPDATE: Update employee
    const updatePayload = {
      phone: '+0987654321',
      designation: 'Senior Software Engineer',
      department: 'Engineering'
    };

    const updateResponse = await request.put(`${API_BASE}/employees/${testEmployeeId}`, {
      headers,
      data: updatePayload
    });

    expect(updateResponse.ok()).toBeTruthy();
    const updateData = await updateResponse.json();
    expect(updateData.data.phone).toBe(updatePayload.phone);
    expect(updateData.data.designation).toBe(updatePayload.designation);

    // Verify update persisted
    const verifyResponse = await request.get(`${API_BASE}/employees/${testEmployeeId}`, {
      headers
    });

    const verifyData = await verifyResponse.json();
    expect(verifyData.data.phone).toBe(updatePayload.phone);
    expect(verifyData.data.designation).toBe(updatePayload.designation);

    // DELETE: Soft delete employee
    const deleteResponse = await request.delete(`${API_BASE}/employees/${testEmployeeId}`, {
      headers
    });

    expect(deleteResponse.ok()).toBeTruthy();

    // Verify deletion (should return 404 or marked as deleted)
    const afterDeleteResponse = await request.get(`${API_BASE}/employees/${testEmployeeId}`, {
      headers
    });

    // Should either be 404 or status changed to "Inactive"
    if (afterDeleteResponse.ok()) {
      const deletedData = await afterDeleteResponse.json();
      expect(deletedData.data.status).toBe('Inactive');
    } else {
      expect(afterDeleteResponse.status()).toBe(404);
    }
  });

  test('should verify data consistency across related endpoints', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create employee
    const employee = {
      employeeCode: 'EMP-INT-002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith.integration@auraos.com',
      department: 'HR',
      designation: 'HR Manager',
      joinDate: '2025-01-01',
      status: 'Active'
    };

    const createResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: employee
    });

    const employeeId = (await createResponse.json()).data.id;

    // Verify employee appears in list
    const listResponse = await request.get(`${API_BASE}/employees?search=${employee.email}`, {
      headers
    });

    const listData = await listResponse.json();
    const foundEmployee = listData.data.find((emp: any) => emp.id === employeeId);
    expect(foundEmployee).toBeDefined();
    expect(foundEmployee.email).toBe(employee.email);

    // Verify employee appears in department query
    const deptResponse = await request.get(`${API_BASE}/employees?department=${employee.department}`, {
      headers
    });

    const deptData = await deptResponse.json();
    const foundInDept = deptData.data.find((emp: any) => emp.id === employeeId);
    expect(foundInDept).toBeDefined();

    // Cleanup
    await request.delete(`${API_BASE}/employees/${employeeId}`, { headers });
  });
});

test.describe('API Integration Tests - Pagination & Filtering', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: { email: testUser.email, password: testUser.password }
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should handle pagination correctly', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Get first page
    const page1Response = await request.get(`${API_BASE}/employees?page=1&limit=10`, {
      headers
    });

    expect(page1Response.ok()).toBeTruthy();
    const page1Data = await page1Response.json();

    expect(page1Data.data).toBeInstanceOf(Array);
    expect(page1Data.data.length).toBeLessThanOrEqual(10);
    expect(page1Data.meta.page).toBe(1);
    expect(page1Data.meta.limit).toBe(10);
    expect(page1Data.meta.total).toBeGreaterThanOrEqual(0);

    // Get second page
    const page2Response = await request.get(`${API_BASE}/employees?page=2&limit=10`, {
      headers
    });

    const page2Data = await page2Response.json();
    expect(page2Data.meta.page).toBe(2);

    // Verify no overlap between pages
    const page1Ids = page1Data.data.map((emp: any) => emp.id);
    const page2Ids = page2Data.data.map((emp: any) => emp.id);
    const intersection = page1Ids.filter((id: string) => page2Ids.includes(id));
    expect(intersection.length).toBe(0);
  });

  test('should apply filters correctly', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Filter by status
    const activeResponse = await request.get(`${API_BASE}/employees?status=Active`, {
      headers
    });

    const activeData = await activeResponse.json();
    expect(activeData.data.every((emp: any) => emp.status === 'Active')).toBe(true);

    // Filter by department
    const deptResponse = await request.get(`${API_BASE}/employees?department=Engineering`, {
      headers
    });

    const deptData = await deptResponse.json();
    expect(deptData.data.every((emp: any) => emp.department === 'Engineering')).toBe(true);

    // Combined filters
    const combinedResponse = await request.get(
      `${API_BASE}/employees?status=Active&department=Engineering&limit=5`,
      { headers }
    );

    const combinedData = await combinedResponse.json();
    expect(combinedData.data.every((emp: any) =>
      emp.status === 'Active' && emp.department === 'Engineering'
    )).toBe(true);
    expect(combinedData.data.length).toBeLessThanOrEqual(5);
  });

  test('should preserve filters across pagination', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Page 1 with filter
    const page1Response = await request.get(
      `${API_BASE}/employees?status=Active&page=1&limit=5`,
      { headers }
    );

    const page1Data = await page1Response.json();
    expect(page1Data.data.every((emp: any) => emp.status === 'Active')).toBe(true);

    // Page 2 with same filter
    const page2Response = await request.get(
      `${API_BASE}/employees?status=Active&page=2&limit=5`,
      { headers }
    );

    const page2Data = await page2Response.json();
    expect(page2Data.data.every((emp: any) => emp.status === 'Active')).toBe(true);
  });

  test('should handle sorting', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Sort by name ascending
    const ascResponse = await request.get(
      `${API_BASE}/employees?sortBy=firstName&sortOrder=asc&limit=10`,
      { headers }
    );

    const ascData = await ascResponse.json();
    const ascNames = ascData.data.map((emp: any) => emp.firstName);
    const sortedAsc = [...ascNames].sort();
    expect(ascNames).toEqual(sortedAsc);

    // Sort by name descending
    const descResponse = await request.get(
      `${API_BASE}/employees?sortBy=firstName&sortOrder=desc&limit=10`,
      { headers }
    );

    const descData = await descResponse.json();
    const descNames = descData.data.map((emp: any) => emp.firstName);
    const sortedDesc = [...descNames].sort().reverse();
    expect(descNames).toEqual(sortedDesc);
  });
});

test.describe('API Integration Tests - Error Handling', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: { email: testUser.email, password: testUser.password }
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should return 400 for invalid input', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const invalidPayload = {
      employeeCode: 'EMP-001',
      // Missing required fields
      email: 'invalid-email' // Invalid email format
    };

    const response = await request.post(`${API_BASE}/employees`, {
      headers,
      data: invalidPayload
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
  });

  test('should return 401 for unauthorized requests', async ({ request }) => {
    const response = await request.get(`${API_BASE}/employees`);
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('should return 401 for invalid token', async ({ request }) => {
    const response = await request.get(`${API_BASE}/employees`, {
      headers: { Authorization: 'Bearer invalid-token-12345' }
    });

    expect(response.status()).toBe(401);
  });

  test('should return 404 for non-existent resources', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await request.get(`${API_BASE}/employees/non-existent-id-123`, {
      headers
    });

    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('should return 409 for duplicate email', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const payload = {
      employeeCode: 'EMP-DUP-001',
      firstName: 'Duplicate',
      lastName: 'Test',
      email: 'duplicate.test@auraos.com',
      department: 'IT',
      designation: 'Developer',
      joinDate: '2025-01-01'
    };

    // Create first employee
    await request.post(`${API_BASE}/employees`, {
      headers,
      data: payload
    });

    // Try to create duplicate
    const duplicateResponse = await request.post(`${API_BASE}/employees`, {
      headers,
      data: { ...payload, employeeCode: 'EMP-DUP-002' }
    });

    expect(duplicateResponse.status()).toBe(409);
    const data = await duplicateResponse.json();
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('email');
  });
});

test.describe('API Integration Tests - Organization Structure', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: { email: testUser.email, password: testUser.password }
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should manage department lifecycle', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create department
    const createResponse = await request.post(`${API_BASE}/organization/departments`, {
      headers,
      data: {
        code: 'DEPT-INT-001',
        name: 'Integration Test Department',
        description: 'Department for integration testing',
        status: 'Active'
      }
    });

    expect(createResponse.ok()).toBeTruthy();
    const deptData = (await createResponse.json()).data;
    testDepartmentId = deptData.id;

    // Get department
    const getResponse = await request.get(`${API_BASE}/organization/departments/${testDepartmentId}`, {
      headers
    });

    expect(getResponse.ok()).toBeTruthy();
    const getData = await getResponse.json();
    expect(getData.data.name).toBe('Integration Test Department');

    // Update department
    const updateResponse = await request.put(`${API_BASE}/organization/departments/${testDepartmentId}`, {
      headers,
      data: {
        name: 'Updated Integration Department',
        description: 'Updated description'
      }
    });

    expect(updateResponse.ok()).toBeTruthy();

    // Delete department
    const deleteResponse = await request.delete(`${API_BASE}/organization/departments/${testDepartmentId}`, {
      headers
    });

    expect(deleteResponse.ok()).toBeTruthy();
  });

  test('should handle hierarchical organization structure', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Create parent department
    const parentResponse = await request.post(`${API_BASE}/organization/departments`, {
      headers,
      data: {
        code: 'PARENT-DEPT',
        name: 'Parent Department',
        status: 'Active'
      }
    });

    const parentId = (await parentResponse.json()).data.id;

    // Create child department
    const childResponse = await request.post(`${API_BASE}/organization/departments`, {
      headers,
      data: {
        code: 'CHILD-DEPT',
        name: 'Child Department',
        parentId,
        status: 'Active'
      }
    });

    expect(childResponse.ok()).toBeTruthy();
    const childData = (await childResponse.json()).data;
    expect(childData.parentId).toBe(parentId);

    // Get org chart
    const orgChartResponse = await request.get(`${API_BASE}/organization/org-chart`, {
      headers
    });

    expect(orgChartResponse.ok()).toBeTruthy();
    const orgChart = await orgChartResponse.json();
    expect(orgChart.data).toBeInstanceOf(Array);

    // Cleanup
    await request.delete(`${API_BASE}/organization/departments/${childData.id}`, { headers });
    await request.delete(`${API_BASE}/organization/departments/${parentId}`, { headers });
  });
});

test.describe('API Integration Tests - Response Format Consistency', () => {
  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: { email: testUser.email, password: testUser.password }
    });
    authToken = (await loginResponse.json()).data.accessToken;
  });

  test('should return consistent success response format', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await request.get(`${API_BASE}/employees?limit=1`, { headers });
    const data = await response.json();

    // Verify standard response structure
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data.success).toBe(true);
  });

  test('should return consistent error response format', async ({ request }) => {
    const response = await request.get(`${API_BASE}/employees/invalid-id`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const data = await response.json();

    // Verify standard error structure
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('error');
    expect(data.success).toBe(false);
    expect(data.error).toHaveProperty('message');
  });

  test('should include proper metadata in list responses', async ({ request }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    const response = await request.get(`${API_BASE}/employees?page=1&limit=10`, { headers });
    const data = await response.json();

    expect(data).toHaveProperty('meta');
    expect(data.meta).toHaveProperty('page');
    expect(data.meta).toHaveProperty('limit');
    expect(data.meta).toHaveProperty('total');
    expect(data.meta).toHaveProperty('totalPages');
  });
});
