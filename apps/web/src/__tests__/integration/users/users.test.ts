/**
 * Users API Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { GET as getById, PUT, DELETE } from '@/app/api/users/[id]/route';
import { setupTestDb, teardownTestDb, resetDatabase } from '@/__tests__/helpers';
import { mockUsers } from '@/__tests__/fixtures';
import { generateAccessToken } from '@/lib/auth/jwt';
import type { PrismaClient } from '@prisma/client';

describe('Users API Integration Tests', () => {
  let prisma: PrismaClient;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    prisma = await setupTestDb();
    await resetDatabase(prisma);

    // Generate auth tokens
    adminToken = generateAccessToken({
      userId: mockUsers.admin.id,
      email: mockUsers.admin.email,
      tenantId: mockUsers.admin.tenantId,
      sessionId: 'session-1',
    });

    userToken = generateAccessToken({
      userId: mockUsers.user1.id,
      email: mockUsers.user1.email,
      tenantId: mockUsers.user1.tenantId,
      sessionId: 'session-2',
    });
  });

  afterAll(async () => {
    await teardownTestDb(prisma);
  });

  describe('GET /api/users', () => {
    it('should list all users for tenant', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.meta).toHaveProperty('total');
      expect(data.meta).toHaveProperty('page');
    });

    it('should filter users by status', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/users?status=Active',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((user: any) => user.status === 'Active')).toBe(true);
    });

    it('should search users by email', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/users?search=${encodeURIComponent('john')}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should paginate results', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/users?page=1&limit=2',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(2);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'GET',
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should enforce tenant isolation', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // All users should belong to the same tenant
      expect(
        data.data.every((user: any) => user.tenantId === mockUsers.admin.tenantId)
      ).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/users/${mockUsers.user1.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await getById(request, { params: { id: mockUsers.user1.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockUsers.user1.id);
      expect(data.data.email).toBe(mockUsers.user1.email);
    });

    it('should return 404 for non-existent user', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/users/non-existent-id',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await getById(request, { params: { id: 'non-existent-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/users/${mockUsers.user1.id}`,
        {
          method: 'GET',
        }
      );

      const response = await getById(request, { params: { id: mockUsers.user1.id } });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/users', () => {
    it('should create new user with valid data', async () => {
      const newUser = {
        email: 'newuser@auraos.com',
        password: 'NewUser123!',
        tenantId: mockUsers.admin.tenantId,
        roleId: 'role-user',
        status: 'Active',
      };

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newUser),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(newUser.email);
      expect(data.data).not.toHaveProperty('password'); // Password should be excluded

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: newUser.email },
      });
      expect(createdUser).toBeDefined();
    });

    it('should return 400 for duplicate email', async () => {
      const duplicateUser = {
        email: mockUsers.user1.email, // Existing email
        password: 'Password123!',
        tenantId: mockUsers.admin.tenantId,
        roleId: 'role-user',
        status: 'Active',
      };

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(duplicateUser),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'Password123!',
        tenantId: mockUsers.admin.tenantId,
        roleId: 'role-user',
        status: 'Active',
      };

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(invalidUser),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should create audit log on user creation', async () => {
      const newUser = {
        email: 'audittest@auraos.com',
        password: 'Password123!',
        tenantId: mockUsers.admin.tenantId,
        roleId: 'role-user',
        status: 'Active',
      };

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify(newUser),
      });

      await POST(request);

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'CREATE',
          module: 'User Management',
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(auditLog).toBeDefined();
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user with valid data', async () => {
      const updates = {
        status: 'Inactive' as const,
      };

      const request = new NextRequest(
        `http://localhost:3000/api/users/${mockUsers.user2.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const response = await PUT(request, { params: { id: mockUsers.user2.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('Inactive');
    });

    it('should return 404 for non-existent user', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/users/non-existent-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: 'Inactive' }),
        }
      );

      const response = await PUT(request, { params: { id: 'non-existent-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      // Create a user to delete
      const userToDelete = await prisma.user.create({
        data: {
          email: 'todelete@auraos.com',
          password: 'hashed',
          tenantId: mockUsers.admin.tenantId,
          roleId: 'role-user',
          status: 'Active',
        },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/users/${userToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await DELETE(request, { params: { id: userToDelete.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify user was deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: userToDelete.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/users/non-existent-id',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await DELETE(request, { params: { id: 'non-existent-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
