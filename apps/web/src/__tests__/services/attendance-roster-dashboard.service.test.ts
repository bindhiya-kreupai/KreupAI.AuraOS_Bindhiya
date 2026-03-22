import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RosterService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard roster service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps roster API rows into weekly employee grid entries', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'roster-1',
              employeeId: 'emp-1',
              employeeName: 'Jane Doe',
              shiftId: 'shift-1',
              shiftName: 'General Shift',
              shiftTime: '09:00 - 18:00',
              startDate: '2026-03-24',
              endDate: '2026-03-30',
              isRecurring: true,
              recurringDays: [1, 2, 3, 4, 5],
              status: 'ACTIVE',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await RosterService.getRosters();

    expect(result).toEqual([
      expect.objectContaining({
        employeeId: 'emp-1',
        employeeName: 'Jane Doe',
        role: 'General Shift',
        shifts: ['G', 'G', 'G', 'G', 'G', 'WO', 'WO'],
      }),
    ]);
  });

  it('submits roster assignment writes through the base roster route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'roster-2',
            employeeId: 'emp-2',
            shiftId: 'shift-2',
            startDate: '2026-03-25',
            endDate: '2026-03-25',
            status: 'ACTIVE',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await RosterService.assignShiftToEmployee({
      employeeId: 'emp-2',
      shiftId: 'shift-2',
      date: '2026-03-25',
    });

    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(requestUrl).toContain('/api/attendance/roster');
    expect(requestInit.method).toBe('POST');
    expect(body).toEqual({
      employeeId: 'emp-2',
      shiftId: 'shift-2',
      startDate: '2026-03-25',
      endDate: '2026-03-25',
    });
  });
});
