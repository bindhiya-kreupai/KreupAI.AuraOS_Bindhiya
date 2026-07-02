// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

const { exitClearance, exitRequest } = vi.hoisted(() => ({
  exitClearance: {
    findFirst: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  exitRequest: {
    update: vi.fn(),
  },
}));

vi.mock('@aura/database', () => ({
  prisma: { exitClearance, exitRequest },
}));

import { PATCH } from '@/app/api/offboarding/clearances/[id]/route';

const AUTH = { user: { userId: 'u1', tenantId: 't1', employeeId: 'emp1' } };

function req(url: string, body?: unknown) {
  return {
    url,
    json: async () => body,
  } as any;
}

describe('PATCH /api/offboarding/clearances/[id]', () => {
  beforeEach(() => {
    exitClearance.findFirst.mockReset();
    exitClearance.update.mockReset();
    exitClearance.findMany.mockReset();
    exitRequest.update.mockReset();
  });

  it('approves a clearance, sets clearedBy, and recomputes parent status', async () => {
    exitClearance.findFirst.mockResolvedValue({
      id: 'c1',
      exitRequestId: 'r1',
      exitRequest: { tenantId: 't1' },
    });
    exitClearance.update.mockResolvedValue({
      id: 'c1',
      exitRequestId: 'r1',
      department: 'IT',
      description: 'Return laptop',
      status: 'APPROVED',
      clearedBy: 'emp1',
      clearedAt: new Date('2026-07-02T00:00:00Z'),
      notes: null,
    });
    exitClearance.findMany.mockResolvedValue([{ status: 'APPROVED' }]);
    exitRequest.update.mockResolvedValue({});

    const res = await PATCH(
      req('http://x/api/offboarding/clearances/c1', { status: 'approved' }),
      AUTH
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.clearance.status).toBe('approved');
    expect(json.clearanceStatus).toBe('COMPLETED');
    expect(exitClearance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'c1' },
        data: expect.objectContaining({ status: 'APPROVED', clearedBy: 'emp1' }),
      })
    );
    expect(exitRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { clearanceStatus: 'COMPLETED' } })
    );
  });

  it('returns bilingual 404 when clearance is not in the tenant', async () => {
    exitClearance.findFirst.mockResolvedValue(null);

    const res = await PATCH(
      req('http://x/api/offboarding/clearances/missing', { status: 'approved' }),
      AUTH
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.message).toBeTruthy();
    expect(json.messageAr).toBeTruthy();
  });

  it('rejects an invalid status with a bilingual 400', async () => {
    exitClearance.findFirst.mockResolvedValue({
      id: 'c1',
      exitRequestId: 'r1',
      exitRequest: { tenantId: 't1' },
    });

    const res = await PATCH(
      req('http://x/api/offboarding/clearances/c1', { status: 'bogus' }),
      AUTH
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.messageAr).toBeTruthy();
    expect(exitClearance.update).not.toHaveBeenCalled();
  });
});
