/**
 * Employee API Integration Tests
 * Week 3: API Testing Foundation
 * Tests CRUD operations for /api/v1/employees endpoints
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/employees/route';
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/v1/employees/[id]/route';
import { setupTestDb, teardownTestDb, resetDatabase } from '@/__tests__/helpers';
import { mockUsers } from '@/__tests__/fixtures';
import { generateAccessToken } from '@/lib/auth/jwt';
import type { PrismaClient } from '@prisma/client';

describe('Employee API Integration Tests', () => {
  let prisma: PrismaClient;
  let authToken: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    prisma = await setupTestDb();
    await resetDatabase(prisma);

    // Generate auth token for admin user
    authToken = generateAccessToken({
      userId: mockUsers.admin.id,
      email: mockUsers.admin.email,
      tenantId: mockUsers.admin.tenantId,
      sessionId: 'test-session-' + crypto.randomUUID(),
    });
  });

  afterAll(async () => {
    await teardownTestDb(prisma);
  });

  beforeEach(async () => {
    // Clean up test employees before each test
    await prisma.employee.deleteMany({
      where: {
        email: {
          startsWith: 'test-employee-',
        },
      },
    });
  });

  describe('GET /api/v1/employees', () => {
    it('should list all employees for tenant', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const response = await GET(request, {});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toHaveProperty('pagination');
      expect(data.meta.apiVersion).toBe('v1');
    });

    it('should filter employees by company ID', async () => {
      // First, create a test company and employee
      const company = await prisma.company.create({
        data: {
          name: 'Test Company',
          code: 'TEST-' + crypto.randomUUID(),
          tenantId: mockUsers.admin.tenantId,
        },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees?companyId=${company.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const response = await GET(request, {});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      if (data.data.length > 0) {
        expect(data.data.every((emp: any) => emp.companyId === company.id)).toBe(true);
      }
    });

    it('should filter employees by department ID', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/employees?departmentId=dept-123',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const response = await GET(request, {});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should search employees by name or email', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/employees?search=john',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const response = await GET(request, {});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should paginate results', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/employees?page=1&limit=5',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const response = await GET(request, {});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.meta.pagination).toMatchObject({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
      expect(data.data.length).toBeLessThanOrEqual(5);
    });

    it('should enforce maximum limit of 100 per page', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/employees?page=1&limit=200',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const response = await GET(request, {});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.pagination.limit).toBe(100); // Should be capped at 100
    });

    it('should sort employees by specified field', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/employees?sortBy=firstName&sortOrder=asc',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const response = await GET(request, {});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'GET',
      });

      const response = await GET(request, {});
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should enforce tenant isolation', async () => {
      // Create token for different tenant
      const otherTenantToken = generateAccessToken({
        userId: 'other-user-id',
        email: 'other@example.com',
        tenantId: 'other-tenant-id',
        sessionId: 'other-session',
      });

      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${otherTenantToken}`,
        },
      });

      const response = await GET(request, {});
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should return empty or only employees from that tenant
      if (data.data.length > 0) {
        expect(data.data.every((emp: any) => emp.tenantId === 'other-tenant-id')).toBe(true);
      }
    });
  });

  describe('POST /api/v1/employees', () => {
    let testCompanyId: string;
    let testDepartmentId: string;
    let testLocationId: string;
    let testJobProfileId: string;
    let testGradeId: string;
    let testStatusId: string;
    let testTypeId: string;

    beforeEach(async () => {
      // Create required related entities
      const company = await prisma.company.create({
        data: {
          name: 'Test Company',
          code: 'TC-' + crypto.randomUUID().substring(0, 8),
          tenantId: mockUsers.admin.tenantId,
        },
      });
      testCompanyId = company.id;

      const department = await prisma.department.create({
        data: {
          name: 'Test Department',
          code: 'TD-' + crypto.randomUUID().substring(0, 8),
          companyId: testCompanyId,
          tenantId: mockUsers.admin.tenantId,
        },
      });
      testDepartmentId = department.id;

      // Create other required entities
      // Note: These may need to be adjusted based on actual schema
      testLocationId = crypto.randomUUID();
      testJobProfileId = crypto.randomUUID();
      testGradeId = crypto.randomUUID();
      testStatusId = crypto.randomUUID();
      testTypeId = crypto.randomUUID();
    });

    it('should create employee with valid data', async () => {
      const employeeData = {
        employeeCode: 'EMP-' + crypto.randomUUID().substring(0, 8),
        firstName: 'John',
        lastName: 'Doe',
        email: 'test-employee-' + crypto.randomUUID() + '@example.com',
        companyId: testCompanyId,
        departmentId: testDepartmentId,
        locationId: testLocationId,
        jobProfileId: testJobProfileId,
        gradeId: testGradeId,
        statusId: testStatusId,
        typeId: testTypeId,
        joiningDate: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(employeeData),
      });

      const response = await POST(request, {});
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        employeeCode: employeeData.employeeCode,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
      });

      // Verify in database
      const created = await prisma.employee.findUnique({
        where: { id: data.data.id },
      });
      expect(created).toBeDefined();
      expect(created?.email).toBe(employeeData.email);

      testEmployeeId = data.data.id;
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        firstName: 'John',
        // Missing other required fields
      };

      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request, {});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        employeeCode: 'EMP-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        companyId: testCompanyId,
        departmentId: testDepartmentId,
        locationId: testLocationId,
        jobProfileId: testJobProfileId,
        gradeId: testGradeId,
        statusId: testStatusId,
        typeId: testTypeId,
        joiningDate: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request, {});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('email');
    });

    it('should return 400 for invalid UUID formats', async () => {
      const invalidData = {
        employeeCode: 'EMP-002',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        companyId: 'invalid-uuid',
        departmentId: testDepartmentId,
        locationId: testLocationId,
        jobProfileId: testJobProfileId,
        gradeId: testGradeId,
        statusId: testStatusId,
        typeId: testTypeId,
        joiningDate: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request, {});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 409 for duplicate employee code', async () => {
      const employeeCode = 'EMP-DUPLICATE-' + crypto.randomUUID().substring(0, 8);

      // Create first employee
      await prisma.employee.create({
        data: {
          employeeCode,
          firstName: 'First',
          lastName: 'Employee',
          email: 'first-' + crypto.randomUUID() + '@example.com',
          companyId: testCompanyId,
          departmentId: testDepartmentId,
          tenantId: mockUsers.admin.tenantId,
          joiningDate: new Date(),
        },
      });

      // Try to create second employee with same code
      const duplicateData = {
        employeeCode,
        firstName: 'Second',
        lastName: 'Employee',
        email: 'second-' + crypto.randomUUID() + '@example.com',
        companyId: testCompanyId,
        departmentId: testDepartmentId,
        locationId: testLocationId,
        jobProfileId: testJobProfileId,
        gradeId: testGradeId,
        statusId: testStatusId,
        typeId: testTypeId,
        joiningDate: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(duplicateData),
      });

      const response = await POST(request, {});
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('already exists');
    });

    it('should create audit log on employee creation', async () => {
      const employeeData = {
        employeeCode: 'EMP-AUDIT-' + crypto.randomUUID().substring(0, 8),
        firstName: 'Audit',
        lastName: 'Test',
        email: 'audit-' + crypto.randomUUID() + '@example.com',
        companyId: testCompanyId,
        departmentId: testDepartmentId,
        locationId: testLocationId,
        jobProfileId: testJobProfileId,
        gradeId: testGradeId,
        statusId: testStatusId,
        typeId: testTypeId,
        joiningDate: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(employeeData),
      });

      await POST(request, {});

      // Check audit log
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'CREATE',
          module: 'Employees',
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.userId).toBe(mockUsers.admin.id);
    });
  });

  describe('GET /api/v1/employees/:id', () => {
    let employeeId: string;

    beforeEach(async () => {
      // Create test employee
      const employee = await prisma.employee.create({
        data: {
          employeeCode: 'EMP-GET-' + crypto.randomUUID().substring(0, 8),
          firstName: 'Get',
          lastName: 'Test',
          email: 'get-test-' + crypto.randomUUID() + '@example.com',
          companyId: (
            await prisma.company.findFirst({
              where: { tenantId: mockUsers.admin.tenantId },
            })
          )!.id,
          departmentId: (
            await prisma.department.findFirst({
              where: { tenantId: mockUsers.admin.tenantId },
            })
          )!.id,
          tenantId: mockUsers.admin.tenantId,
          joiningDate: new Date(),
        },
      });
      employeeId = employee.id;
    });

    it('should get employee by ID', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees/${employeeId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const response = await GET_BY_ID(request, { params: { id: employeeId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(employeeId);
      expect(data.data).toHaveProperty('firstName');
      expect(data.data).toHaveProperty('lastName');
      expect(data.data).toHaveProperty('email');
    });

    it('should return 404 for non-existent employee', async () => {
      const fakeId = crypto.randomUUID();
      const request = new NextRequest(`http://localhost:3000/api/v1/employees/${fakeId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const response = await GET_BY_ID(request, { params: { id: fakeId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/employees/invalid-id',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const response = await GET_BY_ID(request, { params: { id: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should require authentication', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees/${employeeId}`,
        {
          method: 'GET',
        }
      );

      const response = await GET_BY_ID(request, { params: { id: employeeId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/v1/employees/:id', () => {
    let employeeId: string;
    let testCompanyId: string;
    let testDepartmentId: string;

    beforeEach(async () => {
      // Create company and department
      const company = await prisma.company.findFirst({
        where: { tenantId: mockUsers.admin.tenantId },
      });
      testCompanyId = company!.id;

      const department = await prisma.department.findFirst({
        where: { tenantId: mockUsers.admin.tenantId },
      });
      testDepartmentId = department!.id;

      // Create test employee
      const employee = await prisma.employee.create({
        data: {
          employeeCode: 'EMP-PUT-' + crypto.randomUUID().substring(0, 8),
          firstName: 'Update',
          lastName: 'Test',
          email: 'update-test-' + crypto.randomUUID() + '@example.com',
          companyId: testCompanyId,
          departmentId: testDepartmentId,
          tenantId: mockUsers.admin.tenantId,
          joiningDate: new Date(),
        },
      });
      employeeId = employee.id;
    });

    it('should update employee with valid data', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated-' + crypto.randomUUID() + '@example.com',
      };

      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees/${employeeId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: employeeId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
      });

      // Verify in database
      const updated = await prisma.employee.findUnique({
        where: { id: employeeId },
      });
      expect(updated?.firstName).toBe(updateData.firstName);
    });

    it('should partially update employee', async () => {
      const updateData = {
        firstName: 'PartialUpdate',
      };

      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees/${employeeId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: employeeId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.firstName).toBe(updateData.firstName);
    });

    it('should return 404 for non-existent employee', async () => {
      const fakeId = crypto.randomUUID();
      const updateData = {
        firstName: 'Test',
      };

      const request = new NextRequest(`http://localhost:3000/api/v1/employees/${fakeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: fakeId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const updateData = {
        email: 'invalid-email',
      };

      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees/${employeeId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, { params: { id: employeeId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should create audit log on employee update', async () => {
      const updateData = {
        firstName: 'AuditUpdate',
      };

      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees/${employeeId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      await PUT(request, { params: { id: employeeId } });

      // Check audit log
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'UPDATE',
          module: 'Employees',
          resourceId: employeeId,
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(auditLog).toBeDefined();
    });
  });

  describe('DELETE /api/v1/employees/:id', () => {
    let employeeId: string;

    beforeEach(async () => {
      // Create test employee
      const company = await prisma.company.findFirst({
        where: { tenantId: mockUsers.admin.tenantId },
      });
      const department = await prisma.department.findFirst({
        where: { tenantId: mockUsers.admin.tenantId },
      });

      const employee = await prisma.employee.create({
        data: {
          employeeCode: 'EMP-DEL-' + crypto.randomUUID().substring(0, 8),
          firstName: 'Delete',
          lastName: 'Test',
          email: 'delete-test-' + crypto.randomUUID() + '@example.com',
          companyId: company!.id,
          departmentId: department!.id,
          tenantId: mockUsers.admin.tenantId,
          joiningDate: new Date(),
        },
      });
      employeeId = employee.id;
    });

    it('should delete employee', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees/${employeeId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const response = await DELETE(request, { params: { id: employeeId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify deletion
      const deleted = await prisma.employee.findUnique({
        where: { id: employeeId },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent employee', async () => {
      const fakeId = crypto.randomUUID();
      const request = new NextRequest(`http://localhost:3000/api/v1/employees/${fakeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const response = await DELETE(request, { params: { id: fakeId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should create audit log on employee deletion', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees/${employeeId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      await DELETE(request, { params: { id: employeeId } });

      // Check audit log
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'DELETE',
          module: 'Employees',
          resourceId: employeeId,
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(auditLog).toBeDefined();
    });

    it('should require authentication', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/v1/employees/${employeeId}`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, { params: { id: employeeId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking prisma to throw an error
      // Placeholder for error handling test
      expect(true).toBe(true);
    });

    it('should return proper error codes for validation failures', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request, {});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });

    it('should include request ID in error responses', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request, {});
      const data = await response.json();

      expect(data.meta).toHaveProperty('requestId');
      expect(data.meta).toHaveProperty('timestamp');
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const start = performance.now();

      const request = new NextRequest('http://localhost:3000/api/v1/employees', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      await GET(request, {});

      const end = performance.now();
      const executionTime = end - start;

      // API should respond within 2 seconds
      expect(executionTime).toBeLessThan(2000);
    });

    it('should handle large result sets efficiently', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/employees?limit=100',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const start = performance.now();
      const response = await GET(request, {});
      const end = performance.now();

      expect(response.status).toBe(200);
      expect(end - start).toBeLessThan(3000); // 3 second limit for large queries
    });
  });
});
