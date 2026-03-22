import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RegularizationService } from '@/app/dashboard/attendance/services';

describe('attendance dashboard regularization service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps manager regularization requests from the request endpoint response shape', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            requests: [
              {
                id: 'reg-1',
                employeeId: 'emp-1',
                employeeName: 'Jane Doe',
                date: '2026-03-22',
                type: 'MISSED_PUNCH',
                requestedClockIn: '2026-03-22T09:00:00.000Z',
                requestedClockOut: '2026-03-22T18:00:00.000Z',
                reason: 'Missed scan',
                status: 'PENDING',
                createdAt: '2026-03-23T00:00:00.000Z',
              },
            ],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const records = await RegularizationService.getRegularizations({ status: 'PENDING' });

    expect(records[0]).toMatchObject({
      id: 'reg-1',
      employeeName: 'Jane Doe',
      regularizationType: 'missed_punch',
      status: 'pending',
      requestedIn: '2026-03-22T09:00:00.000Z',
      requestedOut: '2026-03-22T18:00:00.000Z',
    });
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/attendance/regularization-request?status=PENDING');
  });

  it('normalizes submission payload aliases and maps the created regularization response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'reg-2',
            employeeId: 'emp-2',
            date: '2026-03-22T00:00:00.000Z',
            regularizationType: 'EARLY_OUT',
            requestedClockIn: '2026-03-22T08:55:00.000Z',
            requestedClockOut: '2026-03-22T17:00:00.000Z',
            reason: 'Medical appointment',
            status: 'PENDING',
            createdAt: '2026-03-23T00:00:00.000Z',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const record = await RegularizationService.submitRegularization({
      employeeId: 'current-user',
      date: '2026-03-22',
      type: 'Early Out' as any,
      requestedInTime: '2026-03-22T08:55:00.000Z' as any,
      requestedOutTime: '2026-03-22T17:00:00.000Z' as any,
      reason: 'Medical appointment',
    } as any);

    const requestInit = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));

    expect(body).toMatchObject({
      action: 'submit',
      regularizationType: 'EARLY_OUT',
      requestedClockIn: '2026-03-22T08:55:00.000Z',
      requestedClockOut: '2026-03-22T17:00:00.000Z',
      reason: 'Medical appointment',
    });
    expect(body.employeeId).toBeUndefined();
    expect(record).toMatchObject({
      id: 'reg-2',
      regularizationType: 'early_departure',
      status: 'pending',
    });
  });

  it('posts approval and rejection actions to the base regularization endpoint', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'reg-3',
              employeeId: 'emp-3',
              date: '2026-03-22T00:00:00.000Z',
              regularizationType: 'LATE_IN',
              reason: 'Traffic',
              status: 'APPROVED',
              approvedBy: 'mgr-1',
              approvedAt: '2026-03-23T10:00:00.000Z',
              createdAt: '2026-03-23T00:00:00.000Z',
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
              id: 'reg-4',
              employeeId: 'emp-4',
              date: '2026-03-22T00:00:00.000Z',
              regularizationType: 'WRONG_PUNCH',
              reason: 'Wrong terminal',
              status: 'REJECTED',
              approvedBy: 'mgr-2',
              rejectionReason: 'Insufficient details',
              createdAt: '2026-03-23T00:00:00.000Z',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const approved = await RegularizationService.approveRegularization('reg-3', 'current-user', 'Approved');
    const rejected = await RegularizationService.rejectRegularization('reg-4', 'mgr-2', 'Insufficient details');

    const approveBody = JSON.parse(String((vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit).body));
    const rejectBody = JSON.parse(String((vi.mocked(fetch).mock.calls[1]?.[1] as RequestInit).body));

    expect(approveBody).toMatchObject({
      action: 'approve',
      regularizationId: 'reg-3',
      comments: 'Approved',
    });
    expect(approveBody.approverId).toBeUndefined();
    expect(rejectBody).toMatchObject({
      action: 'reject',
      regularizationId: 'reg-4',
      approverId: 'mgr-2',
      comments: 'Insufficient details',
    });
    expect(approved.status).toBe('approved');
    expect(rejected.status).toBe('rejected');
  });
});