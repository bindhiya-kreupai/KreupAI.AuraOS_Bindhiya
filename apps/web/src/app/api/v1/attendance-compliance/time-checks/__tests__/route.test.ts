// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  withEnhancedAuth: (handler: any) => handler,
}));

// Mock the maker-checker so the route doesn't hit the DB
vi.mock('@/lib/services/attendance-compliance/time-compliance.service', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    timesheetMakerCheckerService: {
      submit: vi.fn(async () => ({
        timesheetId: 't1',
        status: 'SUBMITTED',
        proposedBy: 'u1',
        proposedAt: new Date(),
      })),
      approve: vi.fn(async () => ({
        timesheetId: 't1',
        status: 'APPROVED',
        proposedBy: 'u1',
        approvedBy: 'u2',
        approvedAt: new Date(),
      })),
      reject: vi.fn(async () => ({
        timesheetId: 't1',
        status: 'REJECTED',
        proposedBy: 'u1',
        rejectedBy: 'u2',
        rejectedAt: new Date(),
        rejectionReason: 'r',
      })),
      findOne: vi.fn(async () => null),
    },
  };
});

import { POST } from '@/app/api/v1/attendance-compliance/time-checks/route';

function makeReq(body: unknown, permissions: string[] = ['attendance:read']) {
  return [
    { json: async () => body, url: 'http://x/api' } as any,
    { user: { id: 'u1', tenantId: 't1' }, permissions } as any,
  ] as const;
}

describe('POST /api/v1/attendance-compliance/time-checks', () => {
  it('403 without permission', async () => {
    const [req, ctx] = makeReq(
      {
        action: 'overtimeCap',
        window: { weekHours: 1, monthHours: 1 },
        caps: { weeklySoftHours: 8, weeklyHardHours: 12, monthlyHardHours: 60 },
      },
      []
    );
    const res = await POST(req, ctx);
    expect(res.status).toBe(403);
  });

  it('400 on invalid action', async () => {
    const [req, ctx] = makeReq({ action: 'bogus' });
    const res = await POST(req, ctx);
    expect(res.status).toBe(400);
  });

  it('200 on overtimeCap evaluation', async () => {
    const [req, ctx] = makeReq({
      action: 'overtimeCap',
      window: { weekHours: 14, monthHours: 30 },
      caps: { weeklySoftHours: 8, weeklyHardHours: 12, monthlyHardHours: 60 },
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('FAIL');
  });

  it('200 on submitTimesheet', async () => {
    const [req, ctx] = makeReq({ action: 'submitTimesheet', timesheetId: 't1' });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.state.status).toBe('SUBMITTED');
  });

  it('200 on fraudScan with normal punches → PASS', async () => {
    const [req, ctx] = makeReq({
      action: 'fraudScan',
      punches: [
        {
          punchId: 'p1',
          employeeId: 'e1',
          capturedAt: '2026-06-01T08:00:00Z',
          deviceId: 'd1',
          matchConfidence: 0.92,
        },
      ],
    });
    const res = await POST(req, ctx);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.verdict.outcome).toBe('PASS');
  });
});
