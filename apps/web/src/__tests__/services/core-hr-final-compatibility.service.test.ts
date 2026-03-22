import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ConfirmationService,
  DocumentService,
  EmployeeService,
  ExitService,
  ProbationService,
} from '@/app/dashboard/core-hr/services';

describe('core-HR final compatibility methods', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('terminates employees through the employee by-id route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ employee: { id: 'emp-1', status: 'terminated' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const employee = await EmployeeService.terminateEmployee('emp-1', '2026-03-22', 'Resigned');

    expect(employee).toMatchObject({ id: 'emp-1', status: 'terminated' });
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/employees/emp-1');
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ method: 'PUT' });
  });

  it('supports document verification as a non-throwing compatibility method', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ documents: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(DocumentService.verifyDocument('doc-1', 'user-1')).resolves.toBeUndefined();
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/documents?id=doc-1');
  });

  it('maps probation records and supports extend workflow compatibility', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            records: [
              {
                id: 'prob-1',
                employeeId: 'emp-1',
                startDate: '2026-01-01T00:00:00.000Z',
                endDate: '2026-03-31T00:00:00.000Z',
                status: 'ACTIVE',
                employee: { firstName: 'Jane', lastName: 'Doe', department: 'Engineering' },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            record: {
              id: 'prob-1',
              employeeId: 'emp-1',
              startDate: '2026-01-01T00:00:00.000Z',
              endDate: '2026-03-31T00:00:00.000Z',
              extendedEndDate: '2026-04-30T00:00:00.000Z',
              status: 'EXTENDED',
              employee: { firstName: 'Jane', lastName: 'Doe', department: 'Engineering' },
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const record = await ProbationService.getEmployeeProbation('emp-1');
    const extended = await ProbationService.extendProbation('prob-1', 30, 'Needs more time');

    expect(record).toMatchObject({
      recordId: 'prob-1',
      employeeName: 'Jane Doe',
      department: 'Engineering',
      status: 'ongoing',
    });
    expect(extended).toMatchObject({ recordId: 'prob-1', status: 'extended' });
  });

  it('maps confirmation letters and exposes the ConfirmationService alias', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            letters: [
              {
                id: 'letter-1',
                employeeId: 'emp-1',
                status: 'APPROVED',
                content: 'Confirmed',
                createdAt: '2026-03-20T00:00:00.000Z',
                issuedAt: '2026-03-22T00:00:00.000Z',
                employee: { firstName: 'Jane', lastName: 'Doe' },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            letter: {
              id: 'letter-2',
              employeeId: 'emp-2',
              status: 'DRAFT',
              content: 'Draft',
              createdAt: '2026-03-22T00:00:00.000Z',
              employee: { firstName: 'John', lastName: 'Smith' },
            },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const confirmations = await ConfirmationService.getAllConfirmations();
    const generated = await ConfirmationService.generateLetter('emp-2', { subject: 'Confirmation' });

    expect(confirmations[0]).toMatchObject({
      letterId: 'letter-1',
      employeeName: 'Jane Doe',
      status: 'approved',
    });
    expect(generated).toMatchObject({
      letterId: 'letter-2',
      employeeName: 'John Smith',
      status: 'draft',
    });
  });

  it('supports exit clearance and settlement compatibility through base exit updates', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            exit: {
              id: 'exit-1',
              employeeId: 'emp-1',
              exitType: 'RESIGNATION',
              lastWorkingDate: '2026-03-31T00:00:00.000Z',
              status: 'PROCESSING',
              employee: { firstName: 'Jane', lastName: 'Doe' },
              clearances: [],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            exit: {
              id: 'exit-1',
              employeeId: 'emp-1',
              exitType: 'RESIGNATION',
              lastWorkingDate: '2026-03-31T00:00:00.000Z',
              status: 'COMPLETED',
              employee: { firstName: 'Jane', lastName: 'Doe' },
              clearances: [],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const updated = await ExitService.updateClearanceItem('exit-1', 'item-1', 'completed', 'manager-1');
    const settled = await ExitService.completeFinalSettlement('exit-1', { netPayable: 1000 });

    expect(updated.status).toBe('in_progress');
    expect(settled.status).toBe('completed');
  });
});