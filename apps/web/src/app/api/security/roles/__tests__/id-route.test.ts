import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1', employeeId: 'emp-1' },
  permissions: ['security/roles:update', 'security/roles:delete'],
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));

vi.mock('@aura/database', () => ({
  prisma: {
    role: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    rolePermission: {
      updateMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    permission: { upsert: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import { PUT, DELETE } from '../[id]/route';

describe('security/roles/[id] route', () => {
  const p = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a tenant-scoped role and returns shaped payload', async () => {
    p.role.findFirst
      .mockResolvedValueOnce({ id: 'r1', tenantId: 'tenant-1', isDeleted: false, isSystem: false })
      .mockResolvedValueOnce({
        id: 'r1',
        name: 'Editor',
        description: 'Can edit',
        isSystem: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: [],
        _count: { userRoles: 3 },
      });
    p.role.update.mockResolvedValue({ id: 'r1' });

    const req = new NextRequest('http://localhost/api/security/roles/r1', {
      method: 'PUT',
      body: JSON.stringify({ roleName: 'Editor', description: 'Can edit' }),
    });
    const res = await PUT(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.roleName).toBe('Editor');
    expect(json.data.assignedUsers).toBe(3);
    expect(p.role.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'r1' } }));
  });

  it('returns 404 when role not found in tenant', async () => {
    p.role.findFirst.mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/security/roles/missing', {
      method: 'PUT',
      body: JSON.stringify({ roleName: 'X' }),
    });
    const res = await PUT(req as any);
    expect(res.status).toBe(404);
  });

  it('blocks deletion of system roles', async () => {
    p.role.findFirst.mockResolvedValueOnce({
      id: 'sys',
      tenantId: 'tenant-1',
      isDeleted: false,
      isSystem: true,
    });
    const req = new NextRequest('http://localhost/api/security/roles/sys', { method: 'DELETE' });
    const res = await DELETE(req as any);
    expect(res.status).toBe(400);
    expect(p.role.update).not.toHaveBeenCalled();
  });

  it('soft-deletes a custom role', async () => {
    p.role.findFirst.mockResolvedValueOnce({
      id: 'r2',
      tenantId: 'tenant-1',
      isDeleted: false,
      isSystem: false,
    });
    p.role.update.mockResolvedValue({ id: 'r2' });
    const req = new NextRequest('http://localhost/api/security/roles/r2', { method: 'DELETE' });
    const res = await DELETE(req as any);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.deleted).toBe(true);
    expect(p.role.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isDeleted: true }) })
    );
  });
});
