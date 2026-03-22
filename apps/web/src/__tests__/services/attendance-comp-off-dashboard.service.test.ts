import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CompOffService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard comp-off service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps nested comp-off responses from the attendance API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            compOffs: [
              {
                id: 'co-1',
                employeeId: 'emp-1',
                employeeName: 'Jane Doe',
                workDate: '2026-03-20',
                workHours: 8,
                reason: 'Weekend release support',
                status: 'approved',
                expiryDate: '2026-06-20',
                balance: 1,
                used: 0,
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await CompOffService.getCompOffs();

    expect(result).toEqual([
      expect.objectContaining({
        id: 'co-1',
        employeeId: 'emp-1',
        employeeName: 'Jane Doe',
        workDate: '2026-03-20',
        workHours: 8,
        status: 'APPROVED',
        balance: 1,
      }),
    ]);
  });

  it('derives summary from the base comp-off endpoint for self-service requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            summary: {
              total: 1.5,
              earned: 2,
              used: 0.5,
              pending: 1,
              expiring: 0,
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await CompOffService.getCompOffSummary('current-user-id');

    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/attendance/comp-off');
    expect(requestUrl).not.toContain('employeeId=current-user-id');
    expect(result).toMatchObject({
      total: 1.5,
      earned: 2,
      used: 0.5,
      pending: 1,
      expiring: 0,
      totalEarned: 2,
      totalUsed: 0.5,
      balance: 1.5,
    });
  });

  it('submits comp-off payloads with route-compatible field names', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'co-2',
            employeeId: 'emp-1',
            workDate: '2026-03-21',
            workHours: 4,
            reason: 'Holiday maintenance',
            status: 'PENDING',
            balance: 0.5,
            used: 0,
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await CompOffService.submitCompOff({
      employeeId: 'current-user-id',
      date: '2026-03-21',
      hours: 4,
      reason: 'Holiday maintenance',
    });

    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(body).toEqual({
      workDate: '2026-03-21',
      workHours: 4,
      reason: 'Holiday maintenance',
    });
    expect(result).toMatchObject({
      id: 'co-2',
      workDate: '2026-03-21',
      workHours: 4,
      balance: 0.5,
      status: 'PENDING',
    });
  });
});
