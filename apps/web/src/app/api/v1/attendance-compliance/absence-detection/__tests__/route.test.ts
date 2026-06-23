// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/attendance-compliance/absence-detection.service', () => ({
  detectDayAbsence: vi.fn(),
  summariseVerdicts: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

import { POST } from '@/app/api/v1/attendance-compliance/absence-detection/route';
import {
  detectDayAbsence,
  summariseVerdicts,
} from '@/lib/services/attendance-compliance/absence-detection.service';

const detectMock = detectDayAbsence as unknown as ReturnType<typeof vi.fn>;
const summariseMock = summariseVerdicts as unknown as ReturnType<typeof vi.fn>;

function makeReq(body: unknown, permissions: string[] = ['attendance:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/attendance-compliance/absence-detection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission missing', async () => {
    const [req, ctx] = makeReq({}, []);
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('returns 400 on empty days array', async () => {
    const [req, ctx] = makeReq({ days: [] });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('returns 200 with verdicts + summary', async () => {
    detectMock.mockReturnValue({ kind: 'UNAUTHORISED_ABSENCE', employeeId: 'e1' });
    summariseMock.mockReturnValue({ total: 1, unauthorised: 1 });
    const [req, ctx] = makeReq({
      days: [
        {
          employeeId: 'e1',
          date: '2026-06-10T00:00:00.000Z',
          isScheduled: true,
          isHoliday: false,
          isWeekoff: false,
          hasApprovedLeave: false,
        },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdicts).toHaveLength(1);
    expect(json.data.summary.unauthorised).toBe(1);
    expect(detectMock).toHaveBeenCalledWith(
      expect.objectContaining({ employeeId: 'e1', isScheduled: true })
    );
  });
});
