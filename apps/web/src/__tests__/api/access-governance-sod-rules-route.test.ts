import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1' },
  permissions: ['access-governance:read', 'access-governance:create'],
  params: {},
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@aura/database', () => ({
  prisma: {
    sodRule: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@aura/database';
import { GET, POST } from '@/app/api/v1/access-governance/sod-rules/route';

describe('access-governance sod-rules route', () => {
  const prismaMock = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists tenant-scoped SoD rules mapped to the service shape', async () => {
    prismaMock.sodRule.findMany.mockResolvedValue([
      {
        id: 'rule-1',
        name: 'Payroll Create & Approve',
        description: 'desc',
        category: 'permission-permission',
        riskLevel: 'critical',
        conflictingRoles: {
          entityA: 'payroll.create',
          entityB: 'payroll.approve',
          rationale: 'SOX',
        },
        isActive: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        createdBy: 'compliance-admin',
        violations: [{ id: 'v1' }],
      },
    ]);

    const request = new NextRequest('http://localhost/api/v1/access-governance/sod-rules');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(payload)).toBe(true);
    expect(payload[0]).toMatchObject({
      id: 'rule-1',
      conflictType: 'permission-permission',
      severity: 'critical',
      entityA: 'payroll.create',
      entityB: 'payroll.approve',
      activeViolations: 1,
      isActive: true,
    });
    expect(prismaMock.sodRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', isDeleted: false }),
      })
    );
  });

  it('seeds default rules when the tenant has none', async () => {
    prismaMock.sodRule.findMany
      .mockResolvedValueOnce([]) // first read: empty -> triggers seed
      .mockResolvedValueOnce([
        {
          id: 'seed-1',
          name: 'Payroll Create & Payroll Approve',
          category: 'permission-permission',
          riskLevel: 'critical',
          conflictingRoles: {
            entityA: 'payroll.create',
            entityB: 'payroll.approve',
            rationale: '',
          },
          isActive: true,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          violations: [],
        },
      ]);
    prismaMock.sodRule.create.mockResolvedValue({});

    const request = new NextRequest('http://localhost/api/v1/access-governance/sod-rules');
    const response = await GET(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(prismaMock.sodRule.create).toHaveBeenCalledTimes(2);
    expect(payload).toHaveLength(1);
  });

  it('creates a tenant-scoped SoD rule from CreateSoDRuleInput', async () => {
    prismaMock.sodRule.create.mockResolvedValue({
      id: 'rule-9',
      name: 'New Rule',
      description: 'd',
      category: 'role-role',
      riskLevel: 'high',
      conflictingRoles: { entityA: 'A', entityB: 'B', rationale: 'r' },
      isActive: true,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      createdBy: 'user-1',
    });

    const request = new NextRequest('http://localhost/api/v1/access-governance/sod-rules', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Rule',
        description: 'd',
        conflictType: 'role-role',
        severity: 'high',
        entityA: 'A',
        entityB: 'B',
        rationale: 'r',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({ id: 'rule-9', entityA: 'A', entityB: 'B', severity: 'high' });
    expect(prismaMock.sodRule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', createdBy: 'user-1' }),
      })
    );
  });

  it('returns 403 when read permission is missing', async () => {
    mockContext.permissions = [];
    const request = new NextRequest('http://localhost/api/v1/access-governance/sod-rules');
    const response = await GET(request as any);
    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error.code).toBe('E4030');
    mockContext.permissions = ['access-governance:read', 'access-governance:create'];
  });
});
