import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AttendanceAnalyticsService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard exceptions service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps nested exception responses into page-friendly rows', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            exceptions: [
              {
                id: 'ex-1',
                employeeId: 'emp-1',
                employeeName: 'Jane Doe',
                date: '2026-03-22',
                type: 'LATE_ARRIVAL',
                checkIn: '2026-03-22T09:20:00.000Z',
                checkOut: '2026-03-22T18:00:00.000Z',
                status: 'PENDING',
                isRegularized: false,
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await AttendanceAnalyticsService.getExceptions();

    expect(result).toEqual([
      expect.objectContaining({
        id: 'ex-1',
        emp: 'Jane Doe',
        type: 'Late Arrival',
        expected: '09:00',
        actual: '09:20',
        status: 'Pending',
      }),
    ]);
  });

  it('resolves exceptions through the base exceptions route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'ex-2',
            employeeId: 'emp-2',
            employeeName: 'John Doe',
            date: '2026-03-22',
            type: 'ABSENT',
            checkIn: null,
            checkOut: null,
            status: 'APPROVED',
            isRegularized: true,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await AttendanceAnalyticsService.resolveException('ex-2', 'regularize');
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(body).toEqual({ id: 'ex-2', action: 'regularize' });
    expect(result).toMatchObject({
      id: 'ex-2',
      emp: 'John Doe',
      type: 'Absent',
      status: 'Regularized',
    });
  });
});
