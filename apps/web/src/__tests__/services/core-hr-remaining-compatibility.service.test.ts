import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AnniversaryService,
  AssetService,
  AutoNumberService,
  CostCenterService,
  IDCardService,
} from '@/app/dashboard/core-hr/services';

describe('core-HR remaining compatibility methods', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('updates cost centers through the base route with id in the request body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ costCenter: { id: 'cc-1', code: 'FIN-001', name: 'Finance' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const costCenter = await CostCenterService.updateCostCenter('cc-1', { costCenterName: 'Finance' } as any);

    expect(costCenter.costCenterId).toBe('cc-1');
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/cost-centers');
    expect(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)).toBe(
      JSON.stringify({ id: 'cc-1', costCenterName: 'Finance' })
    );
  });

  it('generates and deactivates ID cards through the current route contract', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            card: {
              id: 'card-1',
              employeeId: 'emp-1',
              cardNumber: 'ID-001',
              cardType: 'EMPLOYEE',
              issueDate: '2026-03-22T00:00:00.000Z',
              expiryDate: '2027-03-22T00:00:00.000Z',
              employee: { firstName: 'Jane', lastName: 'Doe' },
            },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            card: {
              id: 'card-1',
              employeeId: 'emp-1',
              cardNumber: 'ID-001',
              cardType: 'EMPLOYEE',
              issueDate: '2026-03-22T00:00:00.000Z',
              expiryDate: '2027-03-22T00:00:00.000Z',
              status: 'REVOKED',
              employee: { firstName: 'Jane', lastName: 'Doe' },
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const generated = await IDCardService.generateCard('emp-1', 'employee');
    const deactivated = await IDCardService.deactivateCard('card-1');

    expect(generated.employeeName).toBe('Jane Doe');
    expect(generated.cardType).toBe('employee');
    expect(deactivated.isActive).toBe(false);
  });

  it('returns counts and no-op behavior for anniversary compatibility methods', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ anniversaries: [{ employeeId: 'emp-1', employeeName: 'Jane Doe', anniversaryDate: '2026-04-10T00:00:00.000Z' }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const count = await AnniversaryService.generateAnniversaries(2026);
    await expect(AnniversaryService.sendNotifications('ann-1')).resolves.toBeUndefined();

    expect(count).toBe(1);
  });

  it('creates auto-number sequences locally for hook compatibility', async () => {
    const sequence = await AutoNumberService.createSequence({
      entityType: 'asset',
      prefix: 'AST',
      numberLength: 5,
      currentNumber: 12,
      sequenceName: 'Asset Sequence',
    });

    expect(sequence).toMatchObject({
      entityType: 'asset',
      prefix: 'AST',
      currentNumber: 12,
      numberLength: 5,
      sequenceName: 'Asset Sequence',
    });
  });

  it('maps asset updates and employee asset retrieval into dashboard assets', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            asset: {
              id: 'asset-1',
              assetCode: 'LAP-001',
              assetName: 'MacBook Pro',
              assetType: 'LAPTOP',
              status: 'AVAILABLE',
              condition: 'GOOD',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            assignments: [
              {
                id: 'asg-1',
                assetId: 'asset-1',
                employeeId: 'emp-1',
                assignedDate: '2026-03-22T00:00:00.000Z',
                conditionAtAssignment: 'good',
                assignedBy: 'user-1',
                status: 'ACTIVE',
                asset: { assetCode: 'LAP-001', assetName: 'MacBook Pro' },
                employee: { firstName: 'Jane', lastName: 'Doe' },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

    const updated = await AssetService.updateAsset('asset-1', { status: 'available' } as any);
    const employeeAssets = await AssetService.getEmployeeAssets('emp-1');

    expect(updated).toMatchObject({
      assetId: 'asset-1',
      assetTag: 'LAP-001',
      assetType: 'laptop',
      status: 'available',
    });
    expect(employeeAssets[0]).toMatchObject({
      assetId: 'asset-1',
      assetTag: 'LAP-001',
      assignedTo: 'emp-1',
      assignedToName: 'Jane Doe',
      status: 'assigned',
    });
  });
});