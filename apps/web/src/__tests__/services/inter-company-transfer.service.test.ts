import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InterCompanyTransferService } from '@/app/dashboard/core-hr/services';

describe('InterCompanyTransferService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps transfer records from the v1 HR transfers API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'transfer-1',
              employeeId: 'emp-1',
              employee: { firstName: 'Jane', lastName: 'Doe' },
              fromCompanyId: 'company-a',
              fromCompany: { name: 'Aura Dubai' },
              toCompanyId: 'company-b',
              toCompany: { name: 'Aura Riyadh' },
              transferType: 'SECONDMENT',
              effectiveDate: '2026-03-25T00:00:00.000Z',
              status: 'APPROVED',
              requestedBy: 'mgr-1',
              approvedBy: 'hr-1',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const transfers = await InterCompanyTransferService.getAllTransfers();

    expect(transfers).toHaveLength(1);
    expect(transfers[0]).toMatchObject({
      transferId: 'transfer-1',
      employeeId: 'emp-1',
      employeeName: 'Jane Doe',
      fromCompanyName: 'Aura Dubai',
      toCompanyName: 'Aura Riyadh',
      transferType: 'secondment',
      status: 'approved',
      requestedBy: 'mgr-1',
      approvedBy: 'hr-1',
    });
    expect(transfers[0]?.effectiveDate).toBeInstanceOf(Date);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/v1/hr/transfers');
  });

  it('posts supported transfer fields and maps the created transfer response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            id: 'transfer-2',
            employeeId: 'emp-2',
            employeeName: 'Alex Smith',
            fromCompanyId: 'company-a',
            fromCompanyName: 'Aura Dubai',
            toCompanyId: 'company-c',
            toCompanyName: 'Aura Mumbai',
            transferType: 'PROJECT_BASED',
            effectiveDate: '2026-04-01T00:00:00.000Z',
            status: 'PENDING',
            requestedBy: 'mgr-9',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const created = await InterCompanyTransferService.initiateTransfer({
      employeeId: 'emp-2',
      fromCompanyId: 'company-a',
      toCompanyId: 'company-c',
      effectiveDate: new Date('2026-04-01T00:00:00.000Z'),
      transferType: 'project_based',
      employeeName: 'Ignored Name',
      fromCompanyName: 'Ignored From',
      toCompanyName: 'Ignored To',
      status: 'approved',
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/v1/hr/transfers');
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
    expect(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)).toBe(
      JSON.stringify({
        employeeId: 'emp-2',
        fromCompanyId: 'company-a',
        toCompanyId: 'company-c',
        effectiveDate: new Date('2026-04-01T00:00:00.000Z'),
        transferType: 'PROJECT_BASED',
      })
    );

    expect(created).toMatchObject({
      transferId: 'transfer-2',
      employeeName: 'Alex Smith',
      transferType: 'project_based',
      status: 'pending',
      toCompanyName: 'Aura Mumbai',
    });
  });
});
