/**
 * Licenses API Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/licenses/route';
import { GET as getById, PUT, DELETE } from '@/app/api/licenses/[id]/route';
import { setupTestDb, teardownTestDb, resetDatabase } from '@/__tests__/helpers';
import { mockUsers, mockLicenses } from '@/__tests__/fixtures';
import { generateAccessToken } from '@/lib/auth/jwt';
import type { PrismaClient } from '@prisma/client';

describe('Licenses API Integration Tests', () => {
  let prisma: PrismaClient;
  let adminToken: string;

  beforeAll(async () => {
    prisma = await setupTestDb();
    await resetDatabase(prisma);

    adminToken = generateAccessToken({
      userId: mockUsers.admin.id,
      email: mockUsers.admin.email,
      tenantId: mockUsers.admin.tenantId,
      sessionId: 'session-1',
    });
  });

  afterAll(async () => {
    await teardownTestDb(prisma);
  });

  describe('GET /api/licenses', () => {
    it('should list all licenses for tenant', async () => {
      const request = new NextRequest('http://localhost:3000/api/licenses', {
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
    });

    it('should filter licenses by status', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/licenses?status=Active',
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
      expect(data.data.every((license: any) => license.status === 'Active')).toBe(
        true
      );
    });

    it('should filter licenses by type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/licenses?type=Professional',
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
      expect(
        data.data.every((license: any) => license.type === 'Professional')
      ).toBe(true);
    });

    it('should paginate results', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/licenses?page=1&limit=2',
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
      expect(data.data.length).toBeLessThanOrEqual(2);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(2);
    });

    it('should enforce tenant isolation', async () => {
      const request = new NextRequest('http://localhost:3000/api/licenses', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(
        data.data.every(
          (license: any) => license.tenantId === mockUsers.admin.tenantId
        )
      ).toBe(true);
    });
  });

  describe('GET /api/licenses/:id', () => {
    it('should get license by ID', async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/licenses/${mockLicenses.active.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await getById(request, {
        params: { id: mockLicenses.active.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockLicenses.active.id);
      expect(data.data.type).toBe(mockLicenses.active.type);
    });

    it('should return 404 for non-existent license', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/licenses/non-existent-id',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await getById(request, { params: { id: 'non-existent-id' } });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/licenses', () => {
    it('should create new license with valid data', async () => {
      const newLicense = {
        tenantId: mockUsers.admin.tenantId,
        type: 'Professional' as const,
        totalSeats: 50,
        usedSeats: 0,
        status: 'Active' as const,
        expiresAt: new Date('2026-12-31').toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newLicense),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.totalSeats).toBe(50);
      expect(data.data.type).toBe('Professional');

      // Verify license was created
      const createdLicense = await prisma.license.findUnique({
        where: { id: data.data.id },
      });
      expect(createdLicense).toBeDefined();
    });

    it('should return 400 for invalid license type', async () => {
      const invalidLicense = {
        tenantId: mockUsers.admin.tenantId,
        type: 'InvalidType',
        totalSeats: 50,
        usedSeats: 0,
        status: 'Active',
        expiresAt: new Date('2026-12-31').toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(invalidLicense),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 for used seats exceeding total seats', async () => {
      const invalidLicense = {
        tenantId: mockUsers.admin.tenantId,
        type: 'Professional' as const,
        totalSeats: 10,
        usedSeats: 20, // More than total
        status: 'Active' as const,
        expiresAt: new Date('2026-12-31').toISOString(),
      };

      const request = new NextRequest('http://localhost:3000/api/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(invalidLicense),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/licenses/:id', () => {
    it('should update license with valid data', async () => {
      const updates = {
        totalSeats: 150,
        status: 'Active' as const,
      };

      const request = new NextRequest(
        `http://localhost:3000/api/licenses/${mockLicenses.active.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const response = await PUT(request, {
        params: { id: mockLicenses.active.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalSeats).toBe(150);
    });

    it('should update expired license to active', async () => {
      const updates = {
        status: 'Active' as const,
        expiresAt: new Date('2027-12-31').toISOString(),
      };

      const request = new NextRequest(
        `http://localhost:3000/api/licenses/${mockLicenses.expired.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const response = await PUT(request, {
        params: { id: mockLicenses.expired.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.status).toBe('Active');
    });

    it('should return 404 for non-existent license', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/licenses/non-existent-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ totalSeats: 100 }),
        }
      );

      const response = await PUT(request, { params: { id: 'non-existent-id' } });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/licenses/:id', () => {
    it('should delete license', async () => {
      // Create a license to delete
      const licenseToDelete = await prisma.license.create({
        data: {
          tenantId: mockUsers.admin.tenantId,
          type: 'Trial',
          totalSeats: 5,
          usedSeats: 0,
          status: 'Active',
          expiresAt: new Date('2026-01-31'),
        },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/licenses/${licenseToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await DELETE(request, {
        params: { id: licenseToDelete.id },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify license was deleted
      const deletedLicense = await prisma.license.findUnique({
        where: { id: licenseToDelete.id },
      });
      expect(deletedLicense).toBeNull();
    });
  });

  describe('License Capacity Checks', () => {
    it('should identify licenses at full capacity', async () => {
      const request = new NextRequest('http://localhost:3000/api/licenses', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      const fullLicenses = data.data.filter(
        (license: any) => license.usedSeats >= license.totalSeats
      );

      expect(fullLicenses.length).toBeGreaterThan(0);
    });

    it('should identify licenses with available seats', async () => {
      const request = new NextRequest('http://localhost:3000/api/licenses', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      const availableLicenses = data.data.filter(
        (license: any) => license.usedSeats < license.totalSeats
      );

      expect(availableLicenses.length).toBeGreaterThan(0);
    });
  });
});
