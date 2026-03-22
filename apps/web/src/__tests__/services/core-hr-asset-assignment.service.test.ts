import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AssetAssignmentService, AssetService } from '@/app/dashboard/core-hr/services';

describe('core-HR asset assignment services', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('assigns assets through the asset-assignments route and maps the response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          assignment: {
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
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const assignment = await AssetService.assignAsset('asset-1', 'emp-1', 'Jane Doe');

    expect(assignment).toMatchObject({
      assignmentId: 'asg-1',
      assetTag: 'LAP-001',
      assetName: 'MacBook Pro',
      employeeName: 'Jane Doe',
      condition: 'good',
      status: 'active',
    });
    expect(assignment.assignmentDate).toBeInstanceOf(Date);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/asset-assignments');
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
  });

  it('maps assignment lists returned by the asset-assignments route', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          assignments: [
            {
              id: 'asg-2',
              assetId: 'asset-2',
              employeeId: 'emp-2',
              assignedDate: '2026-03-22T00:00:00.000Z',
              expectedReturnDate: '2026-04-22T00:00:00.000Z',
              conditionAtAssignment: 'excellent',
              assignedBy: 'user-2',
              status: 'ACTIVE',
              asset: { assetCode: 'MON-001', assetName: 'Monitor' },
              employee: { firstName: 'Alex', lastName: 'Smith' },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const assignments = await AssetAssignmentService.getAllAssignments();

    expect(assignments).toHaveLength(1);
    expect(assignments[0]).toMatchObject({
      assignmentId: 'asg-2',
      assetTag: 'MON-001',
      employeeName: 'Alex Smith',
      condition: 'excellent',
      status: 'active',
    });
    expect(assignments[0]?.assignmentDate).toBeInstanceOf(Date);
    expect(assignments[0]?.expectedReturnDate).toBeInstanceOf(Date);
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/core-hr/asset-assignments');
  });
});