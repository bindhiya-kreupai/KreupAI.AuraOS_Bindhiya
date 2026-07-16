import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, DELETE } from '@/app/api/sessions/route';
import { DELETE as DeleteSession } from '@/app/api/sessions/[id]/route';
import { setupTestDb, teardownTestDb, resetDatabase } from '@/__tests__/helpers';
import {
  createTestTenant,
  createTestUser,
  createTestRole,
  createTestPermission,
  assignRoleToUser,
  cleanupTestData,
} from '@/__tests__/helpers/test-utils';
import { generateAccessToken } from '@/lib/auth/jwt';
import { generateDeviceFingerprint } from '@/lib/auth/device-fingerprint.service';
import type { PrismaClient } from '@prisma/client';

describe('Session Management API', () => {
  let db: PrismaClient;
  let tenant: Awaited<ReturnType<typeof createTestTenant>>;
  let adminUser: Awaited<ReturnType<typeof createTestUser>>;
  let adminToken: string;
  let adminSession: any;

  beforeAll(async () => {
    db = await setupTestDb();
    await resetDatabase(db);

    tenant = await createTestTenant('Session Test Tenant', 'SESSION_TEST');

    adminUser = await createTestUser('session-admin@test.com', 'Admin123!', tenant.id, {
      status: 'Active',
    });

    const adminRole = await createTestRole('ADMIN', 'Administrator', tenant.id);
    const permRead = await createTestPermission('sessions', 'read');
    const permDelete = await createTestPermission('sessions', 'delete');
    const permManage = await createTestPermission('sessions', 'manage');

    await db.rolePermission.createMany({
      data: [
        { roleId: adminRole.id, permissionId: permRead.id },
        { roleId: adminRole.id, permissionId: permDelete.id },
        { roleId: adminRole.id, permissionId: permManage.id },
      ],
    });

    await assignRoleToUser(adminUser.id, adminRole.id, tenant.id);

    adminSession = await db.userSession.create({
      data: {
        userId: adminUser.id,
        ipAddress: '127.0.0.1',
        device: 'Test Browser/1.0',
        browser: 'Test Browser',
        deviceFingerprint: generateDeviceFingerprint('Test Browser/1.0', '127.0.0.1').hash,
        location: 'Test City',
        status: 'Active',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    adminToken = generateAccessToken({
      userId: adminUser.id,
      email: adminUser.email,
      tenantId: tenant.id,
      sessionId: adminSession.id,
    });
  });

  afterAll(async () => {
    await cleanupTestData();
    await teardownTestDb(db);
  });

  beforeEach(async () => {
    const extraSessions = await db.userSession.findMany({
      where: { userId: adminUser.id, id: { not: adminSession.id } },
    });
    if (extraSessions.length > 0) {
      await db.userSession.deleteMany({
        where: { id: { in: extraSessions.map((s: any) => s.id) } },
      });
    }
  });

  describe('GET /api/sessions', () => {
    it('should list sessions with isCurrent marking', async () => {
      await db.userSession.createMany({
        data: [
          {
            userId: adminUser.id,
            ipAddress: '192.168.1.1',
            device: 'Extra 1',
            browser: 'Extra 1',
            deviceFingerprint: 'fp1',
            status: 'Active',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          {
            userId: adminUser.id,
            ipAddress: '10.0.0.1',
            device: 'Extra 2',
            browser: 'Extra 2',
            deviceFingerprint: 'fp2',
            status: 'Active',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(3);

      const current = data.data.find((s: any) => s.isCurrent === true);
      expect(current).toBeDefined();
      expect(current.id).toBe(adminSession.id);
      expect(current.location).toBe('Test City');

      const nonCurrent = data.data.filter((s: any) => s.isCurrent === false);
      expect(nonCurrent.length).toBeGreaterThanOrEqual(2);
    });

    it('should include deviceFingerprint in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      const session = data.data.find((s: any) => s.id === adminSession.id);
      expect(session).toBeDefined();
      expect(session).toHaveProperty('deviceFingerprint');
      expect(session.deviceFingerprint).toBeTruthy();
    });

    it('should return only own sessions for users without sessions:manage', async () => {
      const regularUser = await createTestUser('rbac-user@test.com', 'Password123!', tenant.id, {
        status: 'Active',
      });
      const regularSession = await db.userSession.create({
        data: {
          userId: regularUser.id,
          ipAddress: '10.0.0.99',
          device: 'Regular',
          browser: 'Regular',
          status: 'Active',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      const regularToken = generateAccessToken({
        userId: regularUser.id,
        email: regularUser.email,
        tenantId: tenant.id,
        sessionId: regularSession.id,
      });

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'GET',
        headers: { Authorization: `Bearer ${regularToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(1);
      expect(data.data[0].userId).toBe(regularUser.id);
    });

    it('should return 401 without auth token', async () => {
      const request = new NextRequest('http://localhost:3000/api/sessions', { method: 'GET' });
      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/sessions (revoke all except current)', () => {
    it('should revoke other sessions and keep current active', async () => {
      await db.userSession.createMany({
        data: [
          {
            userId: adminUser.id,
            ipAddress: '192.168.1.2',
            device: 'ToRevoke1',
            browser: 'ToRevoke1',
            deviceFingerprint: 'fp-r1',
            status: 'Active',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          {
            userId: adminUser.id,
            ipAddress: '192.168.1.3',
            device: 'ToRevoke2',
            browser: 'ToRevoke2',
            deviceFingerprint: 'fp-r2',
            status: 'Active',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.revokedCount).toBe(2);

      const stillActive = await db.userSession.findUnique({
        where: { id: adminSession.id },
        select: { status: true },
      });
      expect(stillActive?.status).toBe('Active');

      const revokedCount = await db.userSession.count({
        where: { userId: adminUser.id, status: 'Revoked' },
      });
      expect(revokedCount).toBe(2);
    });
  });

  describe('DELETE /api/sessions/[id]', () => {
    it('should revoke a specific session', async () => {
      const target = await db.userSession.create({
        data: {
          userId: adminUser.id,
          ipAddress: '10.0.0.50',
          device: 'Target',
          browser: 'Target',
          deviceFingerprint: 'fp-target',
          status: 'Active',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const request = new NextRequest(`http://localhost:3000/api/sessions/${target.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const response = await DeleteSession(request, { params: { id: target.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const revoked = await db.userSession.findUnique({
        where: { id: target.id },
        select: { status: true },
      });
      expect(revoked?.status).toBe('Revoked');
    });

    it('should block revoking own current session', async () => {
      const request = new NextRequest(`http://localhost:3000/api/sessions/${adminSession.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const response = await DeleteSession(request, { params: { id: adminSession.id } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Cannot revoke your own current session');
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const request = new NextRequest(`http://localhost:3000/api/sessions/${fakeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const response = await DeleteSession(request, { params: { id: fakeId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('Device Fingerprinting', () => {
    it('should generate consistent hash for same input', () => {
      const fp1 = generateDeviceFingerprint('Chrome/120', '192.168.1.1');
      const fp2 = generateDeviceFingerprint('Chrome/120', '192.168.1.1');
      expect(fp1.hash).toBe(fp2.hash);
    });

    it('should generate different hashes for different UAs', () => {
      const fp1 = generateDeviceFingerprint('Chrome/120', '192.168.1.1');
      const fp2 = generateDeviceFingerprint('Firefox/120', '192.168.1.1');
      expect(fp1.hash).not.toBe(fp2.hash);
    });
  });

  describe('Expired Sessions', () => {
    it('should not list expired sessions as active', async () => {
      await db.userSession.create({
        data: {
          userId: adminUser.id,
          ipAddress: '10.0.0.77',
          device: 'Expired',
          browser: 'Expired',
          deviceFingerprint: 'fp-expired',
          status: 'Expired',
          expiresAt: new Date(Date.now() - 1000),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/sessions', {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const response = await GET(request);
      const data = await response.json();

      const expiredInResponse = data.data.filter((s: any) => s.status === 'Expired');
      expect(expiredInResponse.length).toBe(0);
    });
  });
});
