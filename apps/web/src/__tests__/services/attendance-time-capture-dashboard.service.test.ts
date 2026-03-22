import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AttendanceCheckService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard time capture service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps time capture responses into dashboard attendance checks', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            captures: [
              {
                id: 'cap-1',
                employeeId: 'emp-1',
                employeeName: 'Jane Doe',
                type: 'CHECK_IN',
                timestamp: '2026-03-22T09:00:00.000Z',
                location: {
                  latitude: 25.2048,
                  longitude: 55.2708,
                  address: 'Dubai Office HQ',
                },
                createdAt: '2026-03-22T09:00:00.000Z',
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const checks = await AttendanceCheckService.getChecks({ date: '2026-03-22' });

    expect(checks[0]).toMatchObject({
      id: 'cap-1',
      employeeId: 'emp-1',
      employeeName: 'Jane Doe',
      checkType: 'check_in',
      checkTime: '2026-03-22T09:00:00.000Z',
      location: 'Dubai Office HQ',
      latitude: 25.2048,
      longitude: 55.2708,
    });
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/attendance/time-capture?date=2026-03-22');
  });

  it('maps created captures from the time capture endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'cap-2',
            employeeId: 'emp-2',
            employeeName: 'John Smith',
            type: 'BREAK_START',
            timestamp: '2026-03-22T13:00:00.000Z',
            location: { address: 'Dubai Office HQ' },
            createdAt: '2026-03-22T13:00:00.000Z',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const check = await AttendanceCheckService.recordCheck({
      employeeId: 'current-user',
      type: 'BREAK_START' as any,
      timestamp: '2026-03-22T13:00:00.000Z' as any,
      location: { address: 'Dubai Office HQ' } as any,
    } as any);

    expect(check).toMatchObject({
      id: 'cap-2',
      checkType: 'break_start',
      location: 'Dubai Office HQ',
    });
  });
});