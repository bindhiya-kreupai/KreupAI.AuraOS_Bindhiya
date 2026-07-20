// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

vi.mock('@aura/database', () => ({
  prisma: {
    feedback360Nomination: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { GET, POST } from '@/app/api/performance/nominations/route';
import { prisma } from '@aura/database';

const db = prisma as unknown as any;

function makeReq(body: unknown, url = 'http://x/api/performance/nominations') {
  return [
    { json: async () => body, url } as any,
    { user: { userId: 'u1', employeeId: 'e1', tenantId: 't1' } } as any,
  ] as const;
}

describe('GET /api/performance/nominations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists only the current nominator, tenant-scoped', async () => {
    db.feedback360Nomination.findMany.mockResolvedValue([{ id: 'n1', nomineeName: 'Sara' }]);
    const [req, ctx] = makeReq(undefined);
    const res = await GET(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.items).toHaveLength(1);
    expect(db.feedback360Nomination.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1', nominatorId: 'e1', isDeleted: false },
      })
    );
  });
});

describe('POST /api/performance/nominations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enforces the 5-nomination cap (409, bilingual)', async () => {
    db.feedback360Nomination.count.mockResolvedValue(5);
    const [req, ctx] = makeReq({ nomineeName: 'Sixth Peer' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(409);
    expect(json.error.messageAr).toBeTruthy();
    expect(db.feedback360Nomination.create).not.toHaveBeenCalled();
  });

  it('creates a nomination bound to the authenticated nominator', async () => {
    db.feedback360Nomination.count.mockResolvedValue(2);
    db.feedback360Nomination.create.mockResolvedValue({ id: 'n2', nomineeName: 'Ravi' });
    const [req, ctx] = makeReq({ nomineeName: 'Ravi' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.item.nomineeName).toBe('Ravi');
    expect(db.feedback360Nomination.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 't1', nominatorId: 'e1' }),
      })
    );
  });
});
