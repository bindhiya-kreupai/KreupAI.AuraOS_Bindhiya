import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CompOffManagementService, WFHService } from '@/app/dashboard/attendance/services';

describe('attendance management action services', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('routes WFH approve and reject through the base work-from-home endpoint', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'wfh-1',
              employeeId: 'emp-1',
              startDate: '2026-03-22',
              endDate: '2026-03-22',
              reason: 'Approved request',
              status: 'APPROVED',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'wfh-1',
              employeeId: 'emp-1',
              startDate: '2026-03-22',
              endDate: '2026-03-22',
              reason: 'Rejected request',
              status: 'REJECTED',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    await WFHService.approveWFHRequest('wfh-1', 'mgr-1', 'Looks good');
    await WFHService.rejectWFHRequest('wfh-1', 'mgr-1', 'Coverage issue');

    const approveBody = JSON.parse(String((vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit).body));
    const rejectBody = JSON.parse(String((vi.mocked(fetch).mock.calls[1]?.[1] as RequestInit).body));

    expect(approveBody).toEqual({ action: 'approve', id: 'wfh-1', approverId: 'mgr-1', comments: 'Looks good' });
    expect(rejectBody).toEqual({ action: 'reject', id: 'wfh-1', approverId: 'mgr-1', reason: 'Coverage issue' });
  });

  it('routes comp-off management request and approvals through the base endpoint', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: { id: 'co-1', status: 'PENDING' } }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: { id: 'co-1', status: 'APPROVED' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, data: { id: 'co-1', status: 'CANCELLED' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    await CompOffManagementService.requestCompOffCredit({
      employeeId: 'current-user-id',
      date: '2026-03-22',
      hours: 8,
      reason: 'Weekend release',
    });
    await CompOffManagementService.approveCompOff('co-1', 'mgr-1', 'Approved');
    await CompOffManagementService.rejectCompOff('co-1', 'mgr-1', 'Not eligible');

    const requestBody = JSON.parse(String((vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit).body));
    const approveBody = JSON.parse(String((vi.mocked(fetch).mock.calls[1]?.[1] as RequestInit).body));
    const rejectBody = JSON.parse(String((vi.mocked(fetch).mock.calls[2]?.[1] as RequestInit).body));

    expect(requestBody).toEqual({ action: 'request', date: '2026-03-22', hours: 8, reason: 'Weekend release' });
    expect(approveBody).toEqual({ action: 'approve', id: 'co-1', approverId: 'mgr-1', comments: 'Approved' });
    expect(rejectBody).toEqual({ action: 'reject', id: 'co-1', approverId: 'mgr-1', reason: 'Not eligible' });
  });
});
