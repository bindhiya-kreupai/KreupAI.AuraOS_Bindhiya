// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

const { policyMock } = vi.hoisted(() => ({
  policyMock: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('@aura/database', () => ({
  prisma: { dataRetentionPolicy: policyMock },
}));

vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), info: vi.fn() } }));

import { GET, PUT } from '@/app/api/security/data-retention/route';

function ctx(permissions: string[]) {
  return { user: { userId: 'u1', tenantId: 't1' }, permissions } as any;
}

function req(body?: unknown, url = 'http://x/api/security/data-retention') {
  return { json: async () => body, url } as any;
}

describe('GET /api/security/data-retention', () => {
  beforeEach(() => {
    policyMock.findMany.mockReset();
    policyMock.upsert.mockReset();
  });

  it('403 when permission missing', async () => {
    const res = await GET(req(), ctx([]));
    expect(res.status).toBe(403);
  });

  it('seeds defaults when tenant has none', async () => {
    policyMock.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 'p1', category: 'audit-logs', retentionDays: 365, action: 'archive' },
      ]);
    policyMock.upsert.mockResolvedValue({});
    const res = await GET(req(), ctx(['security/retention:read']));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(policyMock.upsert).toHaveBeenCalledTimes(5);
    expect(json.data).toHaveLength(1);
  });
});

describe('PUT /api/security/data-retention', () => {
  beforeEach(() => {
    policyMock.findMany.mockReset();
    policyMock.upsert.mockReset();
  });

  it('400 when policies missing', async () => {
    const res = await PUT(req({}), ctx(['security/retention:update']));
    expect(res.status).toBe(400);
  });

  it('upserts each policy scoped by tenant', async () => {
    policyMock.upsert.mockResolvedValue({});
    policyMock.findMany.mockResolvedValue([]);
    const res = await PUT(
      req({
        policies: [
          { category: 'audit-logs', retentionDays: 400, action: 'archive', isActive: true },
        ],
      }),
      ctx(['security/retention:update'])
    );
    expect(res.status).toBe(200);
    expect(policyMock.upsert.mock.calls[0][0].where.tenantId_category.tenantId).toBe('t1');
  });
});
