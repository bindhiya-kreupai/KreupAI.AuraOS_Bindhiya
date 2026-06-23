// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/holidays-compliance/leave-overlap.service', () => ({
  detectLeaveHolidayOverlap: vi.fn(),
  leaveTotalDays: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/holidays-compliance/leave-overlap/route';
import {
  detectLeaveHolidayOverlap,
  leaveTotalDays,
} from '@/lib/services/holidays-compliance/leave-overlap.service';

const detectMock = detectLeaveHolidayOverlap as unknown as ReturnType<typeof vi.fn>;
const totalsMock = leaveTotalDays as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['leave:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/holidays-compliance/leave-overlap', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on invalid input (bad date)', async () => {
    const [req, ctx] = makeReq({
      leave: { startDate: 'not-a-date', endDate: 'also-not' },
      holidays: [],
    });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with result + totalDays on valid input', async () => {
    detectMock.mockReturnValue({
      adjustedLeaveDays: 4,
      holidayDays: 1,
      provisionalDays: 0,
      requiresRerunOnConfirmation: false,
    });
    totalsMock.mockReturnValue(5);
    const [req, ctx] = makeReq({
      leave: { startDate: '2026-06-01T00:00:00.000Z', endDate: '2026-06-05T00:00:00.000Z' },
      holidays: [
        {
          date: '2026-06-05T00:00:00.000Z',
          label: 'Eid',
          holidayClass: 'PUBLIC',
          state: 'CONFIRMED',
        },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.totalDays).toBe(5);
    expect(json.data.result.adjustedLeaveDays).toBe(4);
  });
});
