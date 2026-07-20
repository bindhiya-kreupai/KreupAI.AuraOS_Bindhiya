import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockContext = {
  user: { tenantId: 'tenant-1', userId: 'user-1', employeeId: 'emp-1' },
  permissions: ['security/policy:read', 'security/policy:update'],
};

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => (request: Request) => handler(request, mockContext),
}));

vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));

vi.mock('@aura/database', () => ({
  prisma: {
    policyDocument: { findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
    policyAcknowledgement: { count: vi.fn() },
    employee: { count: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import { GET } from '../route';
import { POST } from '../[policyId]/remind/route';

describe('security/policy-acknowledgement routes', () => {
  const p = prisma as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists policies with stats and aggregate meta', async () => {
    p.employee.count.mockResolvedValue(10);
    p.policyDocument.findMany
      .mockResolvedValueOnce([
        {
          id: 'pol-1',
          title: 'Code of Conduct',
          category: 'HR',
          version: '1.0',
          status: 'PUBLISHED',
          effectiveDate: null,
          acknowledgementsRequired: true,
        },
      ])
      .mockResolvedValueOnce([{ id: 'pol-1' }]);
    p.policyDocument.count.mockResolvedValue(1);
    p.policyAcknowledgement.count.mockResolvedValue(7);

    const req = new NextRequest('http://localhost/api/security/policy-acknowledgement');
    const res = await GET(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data[0].acknowledgedCount).toBe(7);
    expect(json.data[0].totalRequired).toBe(10);
    expect(json.data[0].percentage).toBe(70);
    expect(json.meta.overallPct).toBe(70);
    expect(json.meta.totalPolicies).toBe(1);
  });

  it('records reminders and writes an audit log', async () => {
    p.policyDocument.findFirst.mockResolvedValue({ id: 'pol-1', title: 'Code of Conduct' });
    p.employee.count.mockResolvedValue(10);
    p.policyAcknowledgement.count.mockResolvedValue(4);
    p.auditLog.create.mockResolvedValue({ id: 'log-1' });

    const req = new NextRequest(
      'http://localhost/api/security/policy-acknowledgement/pol-1/remind',
      { method: 'POST' }
    );
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.sent).toBe(6);
    expect(p.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', action: 'SETTINGS_UPDATED' }),
      })
    );
  });

  it('forbids without permission', async () => {
    mockContext.permissions = [];
    const req = new NextRequest('http://localhost/api/security/policy-acknowledgement');
    const res = await GET(req as any);
    expect(res.status).toBe(403);
    mockContext.permissions = ['security/policy:read', 'security/policy:update'];
  });
});
