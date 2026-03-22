import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApprovalService } from '@/services/approvalService';

describe('ApprovalService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps manager approvals API responses into unified approval requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          approvals: [
            {
              requestId: 'leave-1',
              requestType: 'leave',
              requestTitle: 'Leave Request - Jane Doe',
              requestDate: '2026-03-21T00:00:00.000Z',
              requestedBy: 'emp-1',
              requestedByName: 'Jane Doe',
              requestedByDepartment: 'Engineering',
              approvalStatus: 'pending',
              priority: 'medium',
              dueDate: '2026-03-25T00:00:00.000Z',
              currentApproverLevel: 1,
              totalApproverLevels: 1,
              details: {
                leaveType: 'Annual',
                startDate: '2026-03-24T00:00:00.000Z',
                endDate: '2026-03-25T00:00:00.000Z',
                totalDays: 2,
                reason: 'Vacation',
              },
              comments: [],
              history: [
                {
                  id: 'leave-history-1',
                  action: 'submitted',
                  by: 'emp-1',
                  byName: 'Jane Doe',
                  date: '2026-03-21T00:00:00.000Z',
                },
              ],
              attachments: [],
            },
          ],
          summary: { total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 1, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const approvals = await ApprovalService.getRequests();

    expect(approvals).toHaveLength(1);
    expect(approvals[0]).toMatchObject({
      id: 'leave-1',
      type: 'leave',
      title: 'Leave Request - Jane Doe',
      requestedByName: 'Jane Doe',
      requestedByDept: 'Engineering',
      status: 'pending',
    });
    expect(approvals[0].details).toMatchObject({
      leaveType: 'Annual',
      totalDays: 2,
      reason: 'Vacation',
    });
  });

  it('approves through the manager approvals API and refetches the updated request', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            approvals: [
              {
                requestId: 'ot-1',
                requestType: 'overtime',
                requestTitle: 'Overtime Request - John Doe',
                requestDate: '2026-03-21T00:00:00.000Z',
                requestedBy: 'emp-2',
                requestedByName: 'John Doe',
                requestedByDepartment: 'Support',
                approvalStatus: 'pending',
                details: {
                  overtimeDate: '2026-03-20T00:00:00.000Z',
                  totalHours: 4,
                  overtimeType: 'WEEKEND',
                  reason: 'Quarter close',
                },
              },
            ],
            summary: { total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 1, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: 'Request approved successfully', messageAr: 'تمت الموافقة على الطلب بنجاح' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            approvals: [
              {
                requestId: 'ot-1',
                requestType: 'overtime',
                requestTitle: 'Overtime Request - John Doe',
                requestDate: '2026-03-21T00:00:00.000Z',
                requestedBy: 'emp-2',
                requestedByName: 'John Doe',
                requestedByDepartment: 'Support',
                approvalStatus: 'approved',
                history: [
                  {
                    id: 'ot-history-1',
                    action: 'submitted',
                    by: 'emp-2',
                    byName: 'John Doe',
                    date: '2026-03-21T00:00:00.000Z',
                  },
                  {
                    id: 'ot-history-2',
                    action: 'approved',
                    by: 'mgr-user-1',
                    byName: 'Manager One',
                    date: '2026-03-22T00:00:00.000Z',
                  },
                ],
                details: {
                  overtimeDate: '2026-03-20T00:00:00.000Z',
                  totalHours: 4,
                  overtimeType: 'WEEKEND',
                  reason: 'Quarter close',
                },
              },
            ],
            summary: { total: 0, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const approved = await ApprovalService.approve('ot-1', 'Looks good');

    expect(approved.status).toBe('approved');
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3);
    expect(vi.mocked(fetch).mock.calls[1]?.[0]).toContain('/api/manager/approvals');
  });

  it('posts approval comments through the manager approvals API', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            approvals: [
              {
                requestId: 'exit-1',
                requestType: 'exit',
                requestTitle: 'Exit Request - Alex Doe',
                requestDate: '2026-03-21T00:00:00.000Z',
                requestedBy: 'emp-3',
                requestedByName: 'Alex Doe',
                requestedByDepartment: 'Operations',
                approvalStatus: 'pending',
                details: {
                  exitType: 'RESIGNATION',
                  resignationDate: '2026-03-21T00:00:00.000Z',
                  lastWorkingDate: '2026-04-20T00:00:00.000Z',
                  reason: 'Relocation',
                },
              },
            ],
            summary: { total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 1, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: 'Comment added successfully', messageAr: 'تمت إضافة التعليق بنجاح' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    await ApprovalService.addComment('exit-1', 'Please attach final handover details.');

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fetch).mock.calls[1]?.[1]).toMatchObject({ method: 'POST' });
    expect(String(vi.mocked(fetch).mock.calls[1]?.[1]?.body)).toContain('comment');
  });

  it('maps attendance regularization approvals into unified approval requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          approvals: [
            {
              requestId: 'att-1',
              requestType: 'attendance',
              requestTitle: 'Attendance Regularization - Jane Doe',
              requestDate: '2026-03-21T00:00:00.000Z',
              requestedBy: 'emp-1',
              requestedByName: 'Jane Doe',
              requestedByDepartment: 'Engineering',
              approvalStatus: 'pending',
              priority: 'medium',
              dueDate: '2026-03-22T00:00:00.000Z',
              details: {
                attendanceDate: '2026-03-20T00:00:00.000Z',
                regularizationType: 'MISSED_PUNCH',
                requestedClockIn: '2026-03-20T09:05:00.000Z',
                requestedClockOut: '2026-03-20T18:10:00.000Z',
                reason: 'Biometric device was offline.',
              },
              comments: [],
              history: [],
              attachments: [],
            },
          ],
          summary: { total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 1, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const approvals = await ApprovalService.getRequests();

    expect(approvals).toHaveLength(1);
    expect(approvals[0]).toMatchObject({
      id: 'att-1',
      type: 'attendance',
      title: 'Attendance Regularization - Jane Doe',
      requestedByName: 'Jane Doe',
      status: 'pending',
    });
    expect(approvals[0].details).toMatchObject({
      regularizationType: 'MISSED_PUNCH',
      reason: 'Biometric device was offline.',
    });
  });

  it('maps comp-off approvals into unified approval requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          approvals: [
            {
              requestId: 'co-1',
              requestType: 'comp-off',
              requestTitle: 'Comp-Off Request - Jane Doe',
              requestDate: '2026-03-21T00:00:00.000Z',
              requestedBy: 'emp-1',
              requestedByName: 'Jane Doe',
              requestedByDepartment: 'Engineering',
              approvalStatus: 'pending',
              priority: 'medium',
              details: {
                workedDate: '2026-03-20T00:00:00.000Z',
                workedHours: 8,
                creditedDays: 1,
                expiryDate: '2026-06-20T00:00:00.000Z',
                reason: 'Weekend production release.',
                projectCode: 'REL-24',
                remainingDays: 1,
              },
              comments: [],
              history: [],
              attachments: [],
            },
          ],
          summary: { total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 1, confirmation: 0, 'shift-swap': 0 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const approvals = await ApprovalService.getRequests();

    expect(approvals).toHaveLength(1);
    expect(approvals[0]).toMatchObject({
      id: 'co-1',
      type: 'comp-off',
      title: 'Comp-Off Request - Jane Doe',
      status: 'pending',
    });
    expect(approvals[0].details).toMatchObject({
      creditedDays: 1,
      projectCode: 'REL-24',
      reason: 'Weekend production release.',
    });
  });

  it('maps confirmation approvals into unified approval requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          approvals: [
            {
              requestId: 'cf-1',
              requestType: 'confirmation',
              requestTitle: 'Confirmation Request - Jane Doe',
              requestDate: '2026-03-21T00:00:00.000Z',
              requestedBy: 'emp-1',
              requestedByName: 'Jane Doe',
              requestedByDepartment: 'Engineering',
              approvalStatus: 'pending',
              priority: 'medium',
              dueDate: '2026-04-01T00:00:00.000Z',
              details: {
                eligibleDate: '2026-04-01T00:00:00.000Z',
                requestedDate: '2026-03-21T00:00:00.000Z',
                managerApproval: 'PENDING',
                hrApproval: 'PENDING',
                newSalary: 95000,
              },
              comments: [],
              history: [],
              attachments: [],
            },
          ],
          summary: { total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 1, 'shift-swap': 0 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const approvals = await ApprovalService.getRequests();

    expect(approvals).toHaveLength(1);
    expect(approvals[0]).toMatchObject({
      id: 'cf-1',
      type: 'confirmation',
      title: 'Confirmation Request - Jane Doe',
      status: 'pending',
    });
    expect(approvals[0].details).toMatchObject({
      managerApproval: 'PENDING',
      hrApproval: 'PENDING',
      newSalary: 95000,
    });
  });

  it('maps shift swap approvals into unified approval requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          approvals: [
            {
              requestId: 'swap-1',
              requestType: 'shift-swap',
              requestTitle: 'Shift Swap Request - Jane Doe',
              requestDate: '2026-03-21T00:00:00.000Z',
              requestedBy: 'emp-1',
              requestedByName: 'Jane Doe',
              requestedByDepartment: 'Engineering',
              approvalStatus: 'pending',
              priority: 'medium',
              dueDate: '2026-03-25T00:00:00.000Z',
              details: {
                requestorDate: '2026-03-25T00:00:00.000Z',
                swapWithDate: '2026-03-26T00:00:00.000Z',
                requestorShiftId: 'shift-a',
                swapWithShiftId: 'shift-b',
                swapWithId: 'emp-2',
                peerApproval: 'APPROVED',
                managerApproval: 'PENDING',
                reason: 'Medical appointment coverage.',
              },
              comments: [],
              history: [],
              attachments: [],
            },
          ],
          summary: { total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 1 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const approvals = await ApprovalService.getRequests();

    expect(approvals).toHaveLength(1);
    expect(approvals[0]).toMatchObject({
      id: 'swap-1',
      type: 'shift-swap',
      title: 'Shift Swap Request - Jane Doe',
      status: 'pending',
    });
    expect(approvals[0].details).toMatchObject({
      peerApproval: 'APPROVED',
      managerApproval: 'PENDING',
      reason: 'Medical appointment coverage.',
    });
  });

  it('maps expense approvals into unified approval requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          approvals: [
            {
              requestId: 'exp-1',
              requestType: 'expense',
              requestTitle: 'Expense Claim - Jane Doe',
              requestDate: '2026-03-21T00:00:00.000Z',
              requestedBy: 'emp-1',
              requestedByName: 'Jane Doe',
              requestedByDepartment: 'Engineering',
              approvalStatus: 'pending',
              priority: 'high',
              details: {
                expenseDate: '2026-03-20T00:00:00.000Z',
                expenseCategory: 'TRAVEL',
                totalAmount: 1450.75,
                currency: 'USD',
                businessPurpose: 'Client site visit',
                description: 'Taxi and accommodation',
                receiptUrl: 'https://example.com/receipt.pdf',
              },
              comments: [],
              history: [],
              attachments: [{ id: 'exp-1-receipt', name: 'Receipt', size: 'Attached', type: 'receipt' }],
            },
          ],
          summary: { total: 1, expense: 1, 'employment-history': 0, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const approvals = await ApprovalService.getRequests();

    expect(approvals).toHaveLength(1);
    expect(approvals[0]).toMatchObject({
      id: 'exp-1',
      type: 'expense',
      title: 'Expense Claim - Jane Doe',
      status: 'pending',
    });
    expect(approvals[0].details).toMatchObject({
      expenseCategory: 'TRAVEL',
      totalAmount: 1450.75,
      businessPurpose: 'Client site visit',
    });
  });

  it('maps employment history approvals into unified approval requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          approvals: [
            {
              requestId: 'eh-1',
              requestType: 'employment-history',
              requestTitle: 'PROMOTION - Jane Doe',
              requestDate: '2026-03-21T00:00:00.000Z',
              requestedBy: 'emp-1',
              requestedByName: 'Jane Doe',
              requestedByDepartment: 'Engineering',
              approvalStatus: 'pending',
              priority: 'high',
              details: {
                changeType: 'PROMOTION',
                effectiveDate: '2026-04-01T00:00:00.000Z',
                reason: 'Strong review cycle performance',
                previousDepartment: 'Engineering',
                newDepartment: 'Engineering',
                previousGrade: 'G6',
                newGrade: 'G7',
                previousSalary: 90000,
                newSalary: 105000,
                previousEmploymentType: 'FULL_TIME',
                newEmploymentType: 'FULL_TIME',
              },
              comments: [],
              history: [],
              attachments: [],
            },
          ],
          summary: { total: 1, expense: 0, 'employment-history': 1, 'inter-company-transfer': 0, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const approvals = await ApprovalService.getRequests();

    expect(approvals).toHaveLength(1);
    expect(approvals[0]).toMatchObject({
      id: 'eh-1',
      type: 'employment-history',
      title: 'PROMOTION - Jane Doe',
      status: 'pending',
    });
    expect(approvals[0].details).toMatchObject({
      changeType: 'PROMOTION',
      newGrade: 'G7',
      newSalary: 105000,
    });
  });

  it('maps inter-company transfer approvals into unified approval requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          approvals: [
            {
              requestId: 'trf-1',
              requestType: 'inter-company-transfer',
              requestTitle: 'Inter-Company Transfer - Jane Doe',
              requestDate: '2026-03-21T00:00:00.000Z',
              requestedBy: 'emp-1',
              requestedByName: 'Jane Doe',
              requestedByDepartment: 'Engineering',
              approvalStatus: 'pending',
              priority: 'high',
              details: {
                transferType: 'PERMANENT',
                effectiveDate: '2026-04-15T00:00:00.000Z',
                fromCompanyId: 'COMP-1',
                fromCompanyName: 'Aura Dubai',
                toCompanyId: 'COMP-2',
                toCompanyName: 'Aura Riyadh',
                requestedBy: 'user-2',
                status: 'PENDING',
              },
              comments: [],
              history: [],
              attachments: [],
            },
          ],
          summary: { total: 1, expense: 0, 'employment-history': 0, 'inter-company-transfer': 1, leave: 0, overtime: 0, exit: 0, attendance: 0, 'comp-off': 0, confirmation: 0, 'shift-swap': 0 },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const approvals = await ApprovalService.getRequests();

    expect(approvals).toHaveLength(1);
    expect(approvals[0]).toMatchObject({
      id: 'trf-1',
      type: 'inter-company-transfer',
      title: 'Inter-Company Transfer - Jane Doe',
      status: 'pending',
    });
    expect(approvals[0].details).toMatchObject({
      transferType: 'PERMANENT',
      fromCompanyName: 'Aura Dubai',
      toCompanyName: 'Aura Riyadh',
    });
  });
});