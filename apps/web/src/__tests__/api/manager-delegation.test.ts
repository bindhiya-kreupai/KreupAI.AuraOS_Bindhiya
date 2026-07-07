import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1' },
  employeeId: 'mgr-1',
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@aura/database', () => ({
  prisma: {
    userDelegation: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { GET, POST, DELETE } from '@/app/api/manager/delegation/route';

describe('manager delegation API', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns delegate candidates scoped to the tenant, excluding self', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'u2', firstName: 'Jane', lastName: 'Doe', email: 'jane@acme.io' },
    ]);

    const req = new NextRequest('http://localhost/api/manager/delegation?candidates=true&q=ja');
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.candidates).toHaveLength(1);
    expect(body.candidates[0]).toMatchObject({ id: 'u2', name: 'Jane Doe', email: 'jane@acme.io' });

    const where = prismaMock.user.findMany.mock.calls[0][0].where;
    expect(where.tenantId).toBe('tenant-1');
    expect(where.id).toEqual({ not: 'user-1' });
  });

  it('lists delegations scoped to the authenticated manager only', async () => {
    prismaMock.userDelegation.findMany.mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api/manager/delegation?managerId=someone-else');
    await GET(req as any);

    const where = prismaMock.userDelegation.findMany.mock.calls[0][0].where;
    expect(where.delegatorId).toBe('user-1');
    expect(where.isDeleted).toBe(false);
    expect(where.delegator).toEqual({ tenantId: 'tenant-1' });
  });

  it('rejects self-delegation with a bilingual error', async () => {
    const req = new NextRequest('http://localhost/api/manager/delegation', {
      method: 'POST',
      body: JSON.stringify({
        delegateId: 'user-1',
        scope: 'All Approvals',
        startDate: '2026-07-01',
        endDate: '2026-07-10',
      }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.messageAr).toBeTruthy();
    expect(prismaMock.userDelegation.create).not.toHaveBeenCalled();
  });

  it('creates a delegation after validating the delegate belongs to the tenant', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'u2' });
    prismaMock.userDelegation.create.mockResolvedValue({ id: 'del-1' });

    const req = new NextRequest('http://localhost/api/manager/delegation', {
      method: 'POST',
      body: JSON.stringify({
        delegateId: 'u2',
        scope: 'Leave',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'u2', tenantId: 'tenant-1' },
      select: { id: true },
    });
    const data = prismaMock.userDelegation.create.mock.calls[0][0].data;
    expect(data.delegatorId).toBe('user-1');
    expect(data.delegateeId).toBe('u2');
  });

  it('soft-deletes (revokes) a delegation owned by the manager', async () => {
    prismaMock.userDelegation.findFirst.mockResolvedValue({ id: 'del-1' });
    prismaMock.userDelegation.update.mockResolvedValue({ id: 'del-1' });

    const req = new NextRequest('http://localhost/api/manager/delegation?id=del-1', {
      method: 'DELETE',
    });

    const res = await DELETE(req as any);
    expect(res.status).toBe(200);
    const data = prismaMock.userDelegation.update.mock.calls[0][0].data;
    expect(data.isDeleted).toBe(true);
    expect(data.status).toBe('Revoked');
  });

  it('returns 404 when revoking a delegation the manager does not own', async () => {
    prismaMock.userDelegation.findFirst.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/manager/delegation?id=other', {
      method: 'DELETE',
    });

    const res = await DELETE(req as any);
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.messageAr).toBeTruthy();
    expect(prismaMock.userDelegation.update).not.toHaveBeenCalled();
  });
});
