/**
 * LeaveService — unit tests against the actual class API.
 *
 * Targets `src/lib/services/leave.service.ts`. Tests use prisma mocks
 * via vi.mock('@aura/database') because the service imports `prisma`
 * from that workspace package.
 *
 * Coverage focus (Packet 1 / #49):
 *   - findAllRequests / findRequestById (read path, tenant filter)
 *   - createRequest / updateRequest / deleteRequest
 *   - approveRequest happy path + balance deduction
 *   - rejectRequest / cancelRequest with balance restore
 *   - getRequestStatistics aggregation
 *   - Policy CRUD + delete-with-balances guard
 *   - Balance adjustment math
 *   - Cross-tenant bleed: findRequestById enforces tenantId scoping
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeaveService } from '../../leave.service';

// Mock prisma where the service actually imports it from.
vi.mock('@aura/database', () => {
  const make = () => ({
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    deleteMany: vi.fn(),
  });
  return {
    prisma: {
      leaveRequest: make(),
      leaveBalance: make(),
      leavePolicy: make(),
      leaveEncashment: make(),
    },
  };
});

// Re-import after mock so we can read the spies.
import { prisma } from '@aura/database';

const TENANT_A = 'tenant-A';
const TENANT_B = 'tenant-B';

const baseLeaveRequest = {
  id: 'lr-1',
  tenantId: TENANT_A,
  employeeId: 'emp-1',
  leaveTypeId: 'lt-1',
  policyId: 'lp-1',
  startDate: new Date('2026-07-01'),
  endDate: new Date('2026-07-03'),
  totalDays: 3,
  status: 'PENDING',
  reason: 'Family vacation - long planned',
  balanceDeducted: false,
  balanceId: null,
  appliedAt: new Date('2026-06-20'),
};

const baseBalance = {
  id: 'bal-1',
  tenantId: TENANT_A,
  employeeId: 'emp-1',
  policyId: 'lp-1',
  leaveYear: 2026,
  openingBalance: 21,
  accrued: 0,
  taken: 5,
  adjusted: 0,
  encashed: 0,
  carriedForward: 0,
  lapsed: 0,
  currentBalance: 16,
};

describe('LeaveService.findAllRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated leave requests filtered by tenant', async () => {
    (prisma.leaveRequest.count as any).mockResolvedValue(2);
    (prisma.leaveRequest.findMany as any).mockResolvedValue([
      baseLeaveRequest,
      { ...baseLeaveRequest, id: 'lr-2' },
    ]);

    const result = await LeaveService.findAllRequests({
      tenantId: TENANT_A,
      page: 1,
      limit: 10,
    });

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: TENANT_A }),
        skip: 0,
        take: 10,
      })
    );
  });

  it('applies status, leaveTypeId, and date range filters', async () => {
    (prisma.leaveRequest.count as any).mockResolvedValue(0);
    (prisma.leaveRequest.findMany as any).mockResolvedValue([]);

    await LeaveService.findAllRequests({
      tenantId: TENANT_A,
      status: 'APPROVED',
      leaveTypeId: 'annual',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    const call = (prisma.leaveRequest.findMany as any).mock.calls[0][0];
    expect(call.where.status).toBe('APPROVED');
    expect(call.where.leaveTypeId).toBe('annual');
    expect(call.where.startDate).toEqual({ gte: new Date('2026-01-01') });
    expect(call.where.endDate).toEqual({ lte: new Date('2026-12-31') });
  });

  it('computes pagination meta correctly', async () => {
    (prisma.leaveRequest.count as any).mockResolvedValue(125);
    (prisma.leaveRequest.findMany as any).mockResolvedValue([]);

    const result = await LeaveService.findAllRequests({
      tenantId: TENANT_A,
      page: 3,
      limit: 20,
    });

    expect(result.meta.totalPages).toBe(Math.ceil(125 / 20));
    expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 40, take: 20 })
    );
  });
});

describe('LeaveService.findRequestById — tenant isolation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes the lookup by tenantId AND id', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue(baseLeaveRequest);

    await LeaveService.findRequestById('lr-1', TENANT_A);

    expect(prisma.leaveRequest.findFirst).toHaveBeenCalledWith({
      where: { id: 'lr-1', tenantId: TENANT_A },
    });
  });

  it('returns null when another tenant tries to read', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue(null);

    const result = await LeaveService.findRequestById('lr-1', TENANT_B);

    expect(result).toBeNull();
    expect(prisma.leaveRequest.findFirst).toHaveBeenCalledWith({
      where: { id: 'lr-1', tenantId: TENANT_B },
    });
  });
});

describe('LeaveService.createRequest', () => {
  beforeEach(() => vi.clearAllMocks());

  it('coerces startDate/endDate to Date and persists', async () => {
    (prisma.leaveRequest.create as any).mockResolvedValue(baseLeaveRequest);

    await LeaveService.createRequest({
      tenantId: TENANT_A,
      employeeId: 'emp-1',
      leaveTypeId: 'lt-1',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-03'),
      totalDays: 3,
      reason: 'Family vacation - long planned',
    });

    const data = (prisma.leaveRequest.create as any).mock.calls[0][0].data;
    expect(data.startDate).toBeInstanceOf(Date);
    expect(data.endDate).toBeInstanceOf(Date);
    expect(data.reason).toBe('Family vacation - long planned');
  });

  it('rejects requests with too-short reason (zod min(10))', async () => {
    await expect(
      LeaveService.createRequest({
        tenantId: TENANT_A,
        employeeId: 'emp-1',
        leaveTypeId: 'lt-1',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-03'),
        totalDays: 3,
        reason: 'short',
      })
    ).rejects.toThrow();

    expect(prisma.leaveRequest.create).not.toHaveBeenCalled();
  });
});

describe('LeaveService.approveRequest', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when request not found', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue(null);

    await expect(
      LeaveService.approveRequest('missing', TENANT_A, 'manager-1')
    ).rejects.toThrow('Leave request not found');
  });

  it('throws when request is not PENDING', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue({
      ...baseLeaveRequest,
      status: 'APPROVED',
    });

    await expect(
      LeaveService.approveRequest('lr-1', TENANT_A, 'manager-1')
    ).rejects.toThrow('Leave request already processed');
  });

  it('approves and deducts balance', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue(baseLeaveRequest);
    (prisma.leaveRequest.update as any)
      .mockResolvedValueOnce({ ...baseLeaveRequest, status: 'APPROVED' })
      .mockResolvedValueOnce({ ...baseLeaveRequest, balanceDeducted: true });
    (prisma.leaveBalance.findFirst as any).mockResolvedValue(baseBalance);
    (prisma.leaveBalance.update as any).mockResolvedValue({ ...baseBalance, taken: 8, currentBalance: 13 });

    await LeaveService.approveRequest('lr-1', TENANT_A, 'manager-1');

    // Status update
    const statusUpdate = (prisma.leaveRequest.update as any).mock.calls[0][0];
    expect(statusUpdate.data.status).toBe('APPROVED');
    expect(statusUpdate.data.approvedBy).toBe('manager-1');
    expect(statusUpdate.data.approvedAt).toBeInstanceOf(Date);

    // Balance deduction
    const balanceUpdate = (prisma.leaveBalance.update as any).mock.calls[0][0];
    expect(balanceUpdate.data.taken).toBe(8); // was 5 + 3
    expect(balanceUpdate.data.currentBalance).toBe(13); // was 16 - 3

    // Second update marks deducted
    const deductedFlag = (prisma.leaveRequest.update as any).mock.calls[1][0];
    expect(deductedFlag.data.balanceDeducted).toBe(true);
    expect(deductedFlag.data.balanceId).toBe('bal-1');
  });

  it('skips balance deduction when no policyId is on request', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue({
      ...baseLeaveRequest,
      policyId: null,
    });
    (prisma.leaveRequest.update as any).mockResolvedValue({});

    await LeaveService.approveRequest('lr-1', TENANT_A, 'manager-1');

    expect(prisma.leaveBalance.findFirst).not.toHaveBeenCalled();
    expect(prisma.leaveBalance.update).not.toHaveBeenCalled();
  });

  it('skips balance deduction when balance already deducted', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue({
      ...baseLeaveRequest,
      balanceDeducted: true,
    });
    (prisma.leaveRequest.update as any).mockResolvedValue({});

    await LeaveService.approveRequest('lr-1', TENANT_A, 'manager-1');

    expect(prisma.leaveBalance.findFirst).not.toHaveBeenCalled();
  });
});

describe('LeaveService.rejectRequest', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when request not found', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue(null);
    await expect(
      LeaveService.rejectRequest('x', TENANT_A, 'manager-1', 'Insufficient documentation')
    ).rejects.toThrow('Leave request not found');
  });

  it('records the rejection with reason and rejectedBy', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue(baseLeaveRequest);
    (prisma.leaveRequest.update as any).mockResolvedValue({});

    await LeaveService.rejectRequest('lr-1', TENANT_A, 'manager-1', 'Insufficient documentation');

    const update = (prisma.leaveRequest.update as any).mock.calls[0][0];
    expect(update.data.status).toBe('REJECTED');
    expect(update.data.rejectedBy).toBe('manager-1');
    expect(update.data.rejectionReason).toBe('Insufficient documentation');
    expect(update.data.rejectedAt).toBeInstanceOf(Date);
  });

  it('refuses to reject an already-processed request', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue({ ...baseLeaveRequest, status: 'APPROVED' });
    await expect(
      LeaveService.rejectRequest('lr-1', TENANT_A, 'manager-1', 'too late')
    ).rejects.toThrow('Leave request already processed');
  });
});

describe('LeaveService.cancelRequest', () => {
  beforeEach(() => vi.clearAllMocks());

  it('refuses to cancel a request in invalid state', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue({ ...baseLeaveRequest, status: 'REJECTED' });
    await expect(
      LeaveService.cancelRequest('lr-1', TENANT_A, 'emp-1', 'changed my mind')
    ).rejects.toThrow('Cannot cancel');
  });

  it('restores balance when cancelling an approved request', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue({
      ...baseLeaveRequest,
      status: 'APPROVED',
      balanceDeducted: true,
      balanceId: 'bal-1',
    });
    (prisma.leaveBalance.findUnique as any).mockResolvedValue({ ...baseBalance, taken: 8, currentBalance: 13 });
    (prisma.leaveBalance.update as any).mockResolvedValue({});
    (prisma.leaveRequest.update as any).mockResolvedValue({});

    await LeaveService.cancelRequest('lr-1', TENANT_A, 'emp-1', 'changed plans');

    const balanceUpdate = (prisma.leaveBalance.update as any).mock.calls[0][0];
    expect(balanceUpdate.data.taken).toBe(5); // 8 - 3
    expect(balanceUpdate.data.currentBalance).toBe(16); // 13 + 3

    const requestUpdate = (prisma.leaveRequest.update as any).mock.calls[0][0];
    expect(requestUpdate.data.status).toBe('CANCELLED');
    expect(requestUpdate.data.balanceDeducted).toBe(false);
  });

  it('does NOT touch balance for PENDING cancellation', async () => {
    (prisma.leaveRequest.findFirst as any).mockResolvedValue({
      ...baseLeaveRequest,
      status: 'PENDING',
      balanceDeducted: false,
    });
    (prisma.leaveRequest.update as any).mockResolvedValue({});

    await LeaveService.cancelRequest('lr-1', TENANT_A, 'emp-1', 'never mind');

    expect(prisma.leaveBalance.findUnique).not.toHaveBeenCalled();
    expect(prisma.leaveBalance.update).not.toHaveBeenCalled();
  });
});

describe('LeaveService.getRequestStatistics', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aggregates request counts and total approved days', async () => {
    (prisma.leaveRequest.count as any)
      .mockResolvedValueOnce(20) // total
      .mockResolvedValueOnce(3) // pending
      .mockResolvedValueOnce(15) // approved
      .mockResolvedValueOnce(1) // rejected
      .mockResolvedValueOnce(1); // cancelled
    (prisma.leaveRequest.findMany as any).mockResolvedValue([
      { totalDays: 3 },
      { totalDays: 5 },
      { totalDays: 2 },
    ]);

    const stats = await LeaveService.getRequestStatistics(TENANT_A);

    expect(stats.total).toBe(20);
    expect(stats.pending).toBe(3);
    expect(stats.approved).toBe(15);
    expect(stats.rejected).toBe(1);
    expect(stats.cancelled).toBe(1);
    expect(stats.totalDaysTaken).toBe(10);
  });
});

describe('LeaveService.deletePolicy', () => {
  beforeEach(() => vi.clearAllMocks());

  it('refuses to delete a policy with existing balances', async () => {
    (prisma.leaveBalance.count as any).mockResolvedValue(3);

    await expect(
      LeaveService.deletePolicy('lp-1', TENANT_A)
    ).rejects.toThrow('Cannot delete policy with existing balances');

    expect(prisma.leavePolicy.delete).not.toHaveBeenCalled();
  });

  it('deletes policy when no balances reference it', async () => {
    (prisma.leaveBalance.count as any).mockResolvedValue(0);
    (prisma.leavePolicy.delete as any).mockResolvedValue({ id: 'lp-1' });

    await LeaveService.deletePolicy('lp-1', TENANT_A);

    expect(prisma.leavePolicy.delete).toHaveBeenCalledWith({ where: { id: 'lp-1' } });
  });
});

describe('LeaveService.adjustBalance', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when balance not found', async () => {
    (prisma.leaveBalance.findFirst as any).mockResolvedValue(null);
    await expect(
      LeaveService.adjustBalance('missing', TENANT_A, 5, 'bonus')
    ).rejects.toThrow('Balance not found');
  });

  it('adds positive adjustment to balance', async () => {
    (prisma.leaveBalance.findFirst as any).mockResolvedValue(baseBalance);
    (prisma.leaveBalance.update as any).mockResolvedValue({});

    await LeaveService.adjustBalance('bal-1', TENANT_A, 5, 'tenure bonus');

    const update = (prisma.leaveBalance.update as any).mock.calls[0][0];
    expect(update.data.adjusted).toBe(5);
    expect(update.data.currentBalance).toBe(21); // 16 + 5
  });

  it('handles negative adjustment (correction)', async () => {
    (prisma.leaveBalance.findFirst as any).mockResolvedValue({ ...baseBalance, adjusted: 2, currentBalance: 18 });
    (prisma.leaveBalance.update as any).mockResolvedValue({});

    await LeaveService.adjustBalance('bal-1', TENANT_A, -3, 'correction');

    const update = (prisma.leaveBalance.update as any).mock.calls[0][0];
    expect(update.data.adjusted).toBe(-1); // 2 - 3
    expect(update.data.currentBalance).toBe(15); // 18 - 3
  });
});

describe('LeaveService.findAllBalances', () => {
  beforeEach(() => vi.clearAllMocks());

  it('parses leaveYear filter as integer', async () => {
    (prisma.leaveBalance.count as any).mockResolvedValue(0);
    (prisma.leaveBalance.findMany as any).mockResolvedValue([]);

    await LeaveService.findAllBalances({
      tenantId: TENANT_A,
      leaveYear: '2026',
    });

    const where = (prisma.leaveBalance.findMany as any).mock.calls[0][0].where;
    expect(where.leaveYear).toBe(2026);
  });

  it('filters by employeeId + policyId', async () => {
    (prisma.leaveBalance.count as any).mockResolvedValue(0);
    (prisma.leaveBalance.findMany as any).mockResolvedValue([]);

    await LeaveService.findAllBalances({
      tenantId: TENANT_A,
      employeeId: 'emp-1',
      policyId: 'lp-1',
    });

    const where = (prisma.leaveBalance.findMany as any).mock.calls[0][0].where;
    expect(where.employeeId).toBe('emp-1');
    expect(where.policyId).toBe('lp-1');
  });
});

describe('LeaveService.getBalanceByEmployee', () => {
  beforeEach(() => vi.clearAllMocks());

  it('defaults leaveYear to current year', async () => {
    (prisma.leaveBalance.findMany as any).mockResolvedValue([]);

    await LeaveService.getBalanceByEmployee(TENANT_A, 'emp-1');

    const where = (prisma.leaveBalance.findMany as any).mock.calls[0][0].where;
    expect(where.leaveYear).toBe(new Date().getFullYear());
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.employeeId).toBe('emp-1');
  });

  it('respects explicit leaveYear', async () => {
    (prisma.leaveBalance.findMany as any).mockResolvedValue([]);

    await LeaveService.getBalanceByEmployee(TENANT_A, 'emp-1', 2025);

    const where = (prisma.leaveBalance.findMany as any).mock.calls[0][0].where;
    expect(where.leaveYear).toBe(2025);
  });
});
