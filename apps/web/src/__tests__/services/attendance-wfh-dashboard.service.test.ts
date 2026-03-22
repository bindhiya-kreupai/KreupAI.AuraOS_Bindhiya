import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WFHService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard WFH service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps work-from-home requests from the real base route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'wfh-1',
              employeeId: 'emp-1',
              employeeName: 'Jane Doe',
              startDate: '2026-03-24',
              endDate: '2026-03-25',
              reason: 'Focused work',
              status: 'APPROVED',
              isRecurring: false,
              requestedAt: '2026-03-20T08:00:00.000Z',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await WFHService.getWFHRequests({ employeeId: 'current-user-id' });
    const requestUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);

    expect(requestUrl).toContain('/api/attendance/work-from-home');
    expect(requestUrl).not.toContain('employeeId=current-user-id');
    expect(result).toEqual([
      expect.objectContaining({
        id: 'wfh-1',
        employeeId: 'emp-1',
        employeeName: 'Jane Doe',
        startDate: '2026-03-24',
        endDate: '2026-03-25',
        numberOfDays: 2,
        status: 'approved',
      }),
    ]);
  });

  it('derives WFH summary from approved requests in the requested month', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              id: 'wfh-2',
              employeeId: 'emp-1',
              startDate: '2026-03-10',
              endDate: '2026-03-11',
              reason: 'Deep work',
              status: 'APPROVED',
            },
            {
              id: 'wfh-3',
              employeeId: 'emp-1',
              startDate: '2026-03-20',
              endDate: '2026-03-20',
              reason: 'Personal',
              status: 'PENDING',
            },
            {
              id: 'wfh-4',
              employeeId: 'emp-1',
              startDate: '2026-04-01',
              endDate: '2026-04-01',
              reason: 'Next month',
              status: 'APPROVED',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await WFHService.getWFHSummary('current-user-id', '2026-03');

    expect(result).toEqual({
      totalDays: 24,
      usedDays: 2,
      remainingDays: 22,
      pendingDays: 1,
    });
  });
});
