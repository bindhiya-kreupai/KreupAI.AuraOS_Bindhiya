// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

vi.mock('@aura/database', () => ({
  prisma: {
    enrollmentWindow: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { GET, POST } from '@/app/api/benefits/enrollment-windows/route';
import { prisma } from '@aura/database';

const db = prisma as unknown as any;

function makeReq(body: unknown, url = 'http://x/api/benefits/enrollment-windows') {
  return [
    { json: async () => body, url } as any,
    { user: { userId: 'u1', tenantId: 't1' } } as any,
  ] as const;
}

describe('GET /api/benefits/enrollment-windows', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns tenant-scoped windows in {success,data} shape', async () => {
    db.enrollmentWindow.findMany.mockResolvedValue([
      { id: 'w1', windowName: 'Open Enrollment 2026', isActive: true },
    ]);
    const [req, ctx] = makeReq(undefined);
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    // Tenant isolation enforced in the where clause.
    expect(db.enrollmentWindow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 't1', isDeleted: false }),
      })
    );
  });
});

describe('POST /api/benefits/enrollment-windows', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 with bilingual error on invalid payload', async () => {
    const [req, ctx] = makeReq({ windowName: '' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.message).toBeTruthy();
    expect(json.messageAr).toBeTruthy();
  });

  it('rejects an end date before start date', async () => {
    const [req, ctx] = makeReq({
      windowName: 'Bad Window',
      windowType: 'OPEN_ENROLLMENT',
      planYear: 2026,
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2026-05-01T00:00:00.000Z',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.messageAr).toBeTruthy();
  });

  it('creates a window scoped to the tenant', async () => {
    db.enrollmentWindow.create.mockResolvedValue({ id: 'w9', windowName: 'OE 2026' });
    const [req, ctx] = makeReq({
      windowName: 'OE 2026',
      windowType: 'OPEN_ENROLLMENT',
      planYear: 2026,
      startDate: '2026-05-01T00:00:00.000Z',
      endDate: '2026-06-01T00:00:00.000Z',
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(db.enrollmentWindow.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 't1', createdBy: 'u1' }),
      })
    );
  });
});
