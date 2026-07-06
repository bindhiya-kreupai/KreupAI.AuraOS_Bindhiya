import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1', employeeId: 'emp-1' },
  permissions: ['security/field-security:read', 'security/field-security:update'],
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));

vi.mock('@aura/database', () => ({
  prisma: {
    fieldSecurityRule: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { GET, PUT } from '../route';

describe('security/field-security route', () => {
  const p = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('seeds default rules when a role has none', async () => {
    p.fieldSecurityRule.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: 'r1',
        roleName: 'HR Manager',
        entityType: 'Employee',
        fieldName: 'salary',
        access: 'view',
        masked: true,
      },
    ]);
    p.fieldSecurityRule.createMany.mockResolvedValue({ count: 6 });

    const req = new NextRequest(
      'http://localhost/api/security/field-security?roleName=HR%20Manager'
    );
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(p.fieldSecurityRule.createMany).toHaveBeenCalled();
    expect(json.data[0].fieldName).toBe('salary');
  });

  it('requires roleName', async () => {
    const req = new NextRequest('http://localhost/api/security/field-security');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });

  it('upserts a rule via PUT', async () => {
    p.fieldSecurityRule.upsert.mockResolvedValue({
      id: 'r1',
      roleName: 'HR Manager',
      entityType: 'Employee',
      fieldName: 'salary',
      access: 'hidden',
      masked: true,
    });

    const req = new NextRequest('http://localhost/api/security/field-security', {
      method: 'PUT',
      body: JSON.stringify({
        roleName: 'HR Manager',
        entityType: 'Employee',
        fieldName: 'salary',
        access: 'hidden',
        masked: true,
      }),
    });
    const res = await PUT(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.access).toBe('hidden');
    const call = p.fieldSecurityRule.upsert.mock.calls[0][0];
    expect(call.create.tenantId).toBe('tenant-1');
    expect(call.update.updatedBy).toBe('user-1');
  });

  it('rejects invalid access value', async () => {
    const req = new NextRequest('http://localhost/api/security/field-security', {
      method: 'PUT',
      body: JSON.stringify({
        roleName: 'HR Manager',
        entityType: 'Employee',
        fieldName: 'salary',
        access: 'nonsense',
      }),
    });
    const res = await PUT(req as any);
    expect(res.status).toBe(400);
  });
});
