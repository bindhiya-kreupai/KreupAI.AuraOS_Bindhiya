import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TimesheetService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard timesheet service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps weekly timesheet responses into dashboard timesheets', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'ts-1',
              employeeId: 'emp-1',
              employeeName: 'Jane Doe',
              weekEnding: '2026-03-22',
              totalHours: 40,
              regularHours: 40,
              overtimeHours: 0,
              status: 'APPROVED',
              entries: [
                {
                  date: '2026-03-16',
                  checkIn: '2026-03-16T09:00:00.000Z',
                  checkOut: '2026-03-16T18:00:00.000Z',
                  hours: 8,
                  status: 'PRESENT',
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await TimesheetService.getTimesheets();

    expect(result[0]).toMatchObject({
      id: 'ts-1',
      employeeId: 'emp-1',
      employeeName: 'Jane Doe',
      weekEnding: '2026-03-22',
      totalHours: 40,
      status: 'APPROVED',
      entries: [
        expect.objectContaining({
          date: '2026-03-16',
          hours: 8,
          status: 'PRESENT',
        }),
      ],
    });
  });

  it('submits timesheets without placeholder employee ids', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'ts-2',
            employeeId: 'emp-1',
            weekEnding: '2026-03-22',
            totalHours: 8,
            regularHours: 8,
            overtimeHours: 0,
            status: 'PENDING',
            entries: [
              { date: '2026-03-22', hours: 8, status: 'PRESENT' },
            ],
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await TimesheetService.submitTimesheet({
      employeeId: 'current-user',
      weekEnding: '2026-03-22',
      entries: [
        { date: '2026-03-22', hours: 8, status: 'PRESENT', checkIn: null, checkOut: null },
      ],
    });

    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(body).toMatchObject({
      weekEnding: '2026-03-22',
      entries: [expect.objectContaining({ date: '2026-03-22', hours: 8, status: 'PRESENT' })],
    });
    expect(body.employeeId).toBeUndefined();
    expect(result).toMatchObject({ id: 'ts-2', status: 'PENDING', totalHours: 8 });
  });
});