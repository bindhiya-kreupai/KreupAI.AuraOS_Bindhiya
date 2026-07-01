// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

const mockCount = vi.fn();
const mockCreate = vi.fn();
const mockFindMany = vi.fn();

vi.mock('@aura/database', () => ({
  prisma: {
    complianceFramework: {
      count: (...a: unknown[]) => mockCount(...a),
      create: (...a: unknown[]) => mockCreate(...a),
      findMany: (...a: unknown[]) => mockFindMany(...a),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { GET } from '@/app/api/v1/compliance/frameworks/route';

function makeReq(permissions: string[] = ['compliance/frameworks:read']) {
  return [
    { url: 'http://x/api/v1/compliance/frameworks' } as any,
    { user: { userId: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('GET /api/v1/compliance/frameworks', () => {
  beforeEach(() => {
    mockCount.mockReset();
    mockCreate.mockReset();
    mockFindMany.mockReset();
  });

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq([]);
    const res = await GET(req, ctx);
    expect(res.status).toBe(403);
  });

  it('seeds defaults when tenant has zero frameworks, then returns a bare array', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({});
    mockFindMany.mockResolvedValue([
      {
        id: 'fw-1',
        code: 'soc2',
        name: 'SOC 2',
        fullName: 'System and Organization Controls 2',
        description: 'desc',
        version: 'Type II',
        status: 'in-progress',
        readinessScore: 83,
        nextAuditDate: new Date('2026-04-01T00:00:00Z'),
        controls: [{ id: 'c1', status: 'compliant', category: 'X', code: 'CC1.1', name: 'n' }],
      },
    ]);

    const [req, ctx] = makeReq();
    const res = await GET(req, ctx);
    const json = await res.json();

    expect(res.status).toBe(200);
    // Seeding invoked (3 default frameworks).
    expect(mockCreate).toHaveBeenCalledTimes(3);
    // Bare array — not wrapped in {success,data}.
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].id).toBe('fw-1');
    expect(json[0].totalControls).toBe(1);
  });

  it('does NOT seed when frameworks already exist', async () => {
    mockCount.mockResolvedValue(2);
    mockFindMany.mockResolvedValue([]);

    const [req, ctx] = makeReq();
    const res = await GET(req, ctx);

    expect(res.status).toBe(200);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
