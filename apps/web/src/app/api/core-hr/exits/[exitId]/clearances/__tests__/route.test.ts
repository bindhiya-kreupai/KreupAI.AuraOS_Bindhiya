// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

const exitFindFirst = vi.fn();
const clearanceUpdate = vi.fn();
const clearanceFindMany = vi.fn();
const exitUpdate = vi.fn();

vi.mock('@/lib/database', () => ({
  prisma: {
    exitRequest: {
      findFirst: (...a: any[]) => exitFindFirst(...a),
      update: (...a: any[]) => exitUpdate(...a),
    },
    exitClearance: {
      update: (...a: any[]) => clearanceUpdate(...a),
      findMany: (...a: any[]) => clearanceFindMany(...a),
    },
  },
}));

import { PATCH } from '@/app/api/core-hr/exits/[exitId]/clearances/route';

function makeReq(body: unknown, exitId = 'exit1') {
  return [
    { json: async () => body } as any,
    { user: { tenantId: 't1', userId: 'u1' }, params: { exitId } } as any,
  ] as const;
}

describe('PATCH /api/core-hr/exits/[exitId]/clearances', () => {
  beforeEach(() => {
    exitFindFirst.mockReset();
    clearanceUpdate.mockReset();
    clearanceFindMany.mockReset();
    exitUpdate.mockReset();
  });

  it('404 when the exit is not in tenant', async () => {
    exitFindFirst.mockResolvedValue(null);
    const [req, ctx] = makeReq({ clearanceId: 'c1', status: 'COMPLETED' });
    const res = await PATCH(req, ctx);
    expect(res.status).toBe(404);
  });

  it('marks item complete and recomputes overall status to COMPLETED', async () => {
    exitFindFirst.mockResolvedValue({
      id: 'exit1',
      clearances: [{ id: 'c1', status: 'PENDING', notes: null }],
    });
    clearanceUpdate.mockResolvedValue({});
    clearanceFindMany.mockResolvedValue([{ id: 'c1', status: 'COMPLETED' }]);
    exitUpdate.mockResolvedValue({ id: 'exit1', clearanceStatus: 'COMPLETED', clearances: [] });

    const [req, ctx] = makeReq({ clearanceId: 'c1', status: 'COMPLETED' });
    const res = await PATCH(req, ctx);
    expect(res.status).toBe(200);

    // Clearance was cleared with the acting user + timestamp.
    const updateArg = clearanceUpdate.mock.calls[0][0];
    expect(updateArg.data.clearedBy).toBe('u1');
    expect(updateArg.data.clearedAt).toBeInstanceOf(Date);

    // Overall exit status recomputed to COMPLETED.
    const exitArg = exitUpdate.mock.calls[0][0];
    expect(exitArg.data.clearanceStatus).toBe('COMPLETED');
  });

  it('400 with bilingual error on invalid status', async () => {
    const [req, ctx] = makeReq({ clearanceId: 'c1', status: 'BOGUS' });
    const res = await PATCH(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.messageAr).toBeTruthy();
  });
});
