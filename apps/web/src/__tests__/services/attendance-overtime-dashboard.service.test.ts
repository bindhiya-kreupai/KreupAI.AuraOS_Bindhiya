import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OvertimeService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard overtime service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps overtime requests from the nested base route response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            overtime: [
              {
                id: 'ot-1',
                employeeId: 'emp-1',
                employeeName: 'Jane Doe',
                overtimeDate: '2026-03-22T00:00:00.000Z',
                startTime: '2026-03-22T18:00:00.000Z',
                endTime: '2026-03-22T20:00:00.000Z',
                totalHours: 2,
                overtimeType: 'WEEKEND',
                reason: 'Release support',
                status: 'APPROVED',
                createdAt: '2026-03-22T20:30:00.000Z',
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await OvertimeService.getOvertimeRequests({ employeeId: 'current-user-id' });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/attendance/overtime');
    expect(requestUrl).not.toContain('employeeId=current-user-id');
    expect(result).toEqual([
      expect.objectContaining({
        id: 'ot-1',
        employeeId: 'emp-1',
        employeeName: 'Jane Doe',
        requestedHours: 2,
        overtimeType: 'weekend',
        status: 'approved',
      }),
    ]);
  });

  it('submits overtime requests through the base route with normalized payloads', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'ot-2',
            employeeId: 'emp-1',
            overtimeDate: '2026-03-22T00:00:00.000Z',
            totalHours: 3,
            status: 'PENDING',
            createdAt: '2026-03-22T20:30:00.000Z',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await OvertimeService.submitOvertimeRequest({
      employeeId: 'current-user',
      date: '2026-03-22',
      reason: 'Month-end processing',
      overtimeMinutes: 180,
    } as any);

    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(body).toMatchObject({
      date: '2026-03-22',
      reason: 'Month-end processing',
      overtimeMinutes: 180,
    });
    expect(body.employeeId).toBeUndefined();
    expect(result).toMatchObject({ id: 'ot-2', requestedHours: 3, status: 'pending' });
  });
});
