// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

const upsertMock = vi.fn();

vi.mock('@aura/database', () => ({
  prisma: {
    autoNumberSequence: {
      upsert: (...args: any[]) => upsertMock(...args),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

import { PUT } from '@/app/api/core-hr/auto-numbers/route';

function makeReq(body: unknown, permissions: string[] = ['core-hr/auto-numbers:update']) {
  return [
    { json: async () => body, url: 'http://x/api/core-hr/auto-numbers' } as any,
    { user: { tenantId: 't1', userId: 'u1' }, permissions } as any,
  ] as const;
}

describe('PUT /api/core-hr/auto-numbers', () => {
  beforeEach(() => {
    upsertMock.mockReset();
  });

  it('403 when missing update permission', async () => {
    const [req, ctx] = makeReq({ entityType: 'employee' }, []);
    const res = await PUT(req, ctx);
    expect(res.status).toBe(403);
  });

  it('400 with bilingual error when entityType missing', async () => {
    const [req, ctx] = makeReq({ prefix: 'EMP-' });
    const res = await PUT(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error.message).toBeTruthy();
    // The bilingual message rides along in details via the shared validationError helper.
    expect(json.error.details.messageAr).toBeTruthy();
  });

  it('upserts scoped by tenant + entityType and returns 200', async () => {
    upsertMock.mockResolvedValue({
      id: 'seq1',
      entityType: 'employee',
      prefix: 'EMP-',
      padLength: 4,
      currentNumber: 41,
    });
    const [req, ctx] = makeReq({
      entityType: 'employee',
      prefix: 'EMP-',
      padLength: 4,
      currentNumber: 41,
    });
    const res = await PUT(req, ctx);
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledTimes(1);
    const arg = upsertMock.mock.calls[0][0];
    expect(arg.where).toEqual({
      tenantId_entityType: { tenantId: 't1', entityType: 'employee' },
    });
    expect(arg.update.prefix).toBe('EMP-');
    expect(arg.update.updatedBy).toBe('u1');
  });
});
