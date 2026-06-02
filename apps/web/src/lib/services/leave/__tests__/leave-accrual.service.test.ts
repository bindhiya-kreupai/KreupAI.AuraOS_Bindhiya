/**
 * LeaveAccrualService — narrow unit tests against the public API.
 *
 * Targets `src/lib/services/leave/leave-accrual.service.ts`.
 * The service depends on private prisma-backed helpers
 * (getActiveEmployees, getLeavePolicies, getEmployee,
 * getPolicyForEmployee, getCurrentBalance). We exercise the public
 * methods by spying on these private statics so the inner logic
 * (eligibility math, accrual aggregation, error path) is reached
 * without standing up a database.
 *
 * Packet 1 / #49 — Leave accrual + encashment.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LeaveAccrualService } from '../leave-accrual.service';

const TENANT_A = 'tenant-A';

const baseEmployee: any = {
  id: 'emp-1',
  name: 'Jane Doe',
  countryCode: 'AE',
  basicSalary: 9000,
  grossSalary: 12000,
  joiningDate: new Date('2022-01-01'),
};

const baseMonthlyPolicy: any = {
  leaveTypeCode: 'ANNUAL',
  countryCode: 'AE',
  accrualType: 'MONTHLY',
  accrualRate: 2.5,
  maxBalance: 30,
  carryForward: { isAllowed: true, maxDays: 5 },
  encashment: {
    isAllowed: true,
    triggers: ['YEAR_END', 'ON_RESIGNATION'],
    maxDays: 30,
    minBalanceToRetain: 5,
    basis: 'BASIC',
    encashmentRate: 100,
  },
};

describe('LeaveAccrualService.processMonthlyAccrual', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns COMPLETED when all employees accrue cleanly', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getActiveEmployees').mockResolvedValue([baseEmployee]);
    vi.spyOn(LeaveAccrualService as any, 'getLeavePolicies').mockResolvedValue([baseMonthlyPolicy]);
    vi.spyOn(LeaveAccrualService as any, 'calculateEmployeeAccrual').mockResolvedValue({
      employeeId: 'emp-1',
      leaveTypeCode: 'ANNUAL',
      accrued: 2.5,
      newBalance: 12.5,
    });
    vi.spyOn(LeaveAccrualService as any, 'updateLeaveBalance').mockResolvedValue(undefined);

    const run = await LeaveAccrualService.processMonthlyAccrual({
      tenantId: TENANT_A,
      processDate: new Date('2026-06-01'),
    });

    expect(run.status).toBe('COMPLETED');
    expect(run.totalEmployees).toBe(1);
    expect(run.totalAccrued).toBe(2.5);
    expect(run.errors).toEqual([]);
  });

  it('marks PARTIAL when more successes than failures', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getActiveEmployees').mockResolvedValue([
      baseEmployee,
      { ...baseEmployee, id: 'emp-2', name: 'John' },
      { ...baseEmployee, id: 'emp-3', name: 'Bob' },
    ]);
    vi.spyOn(LeaveAccrualService as any, 'getLeavePolicies').mockResolvedValue([baseMonthlyPolicy]);
    vi.spyOn(LeaveAccrualService as any, 'calculateEmployeeAccrual')
      .mockResolvedValueOnce({ employeeId: 'emp-1', leaveTypeCode: 'ANNUAL', accrued: 2.5, newBalance: 12.5 })
      .mockResolvedValueOnce({ employeeId: 'emp-2', leaveTypeCode: 'ANNUAL', accrued: 2.5, newBalance: 12.5 })
      .mockRejectedValueOnce(new Error('Bad data'));
    vi.spyOn(LeaveAccrualService as any, 'updateLeaveBalance').mockResolvedValue(undefined);

    const run = await LeaveAccrualService.processMonthlyAccrual({
      tenantId: TENANT_A,
      processDate: new Date('2026-06-01'),
    });

    expect(run.status).toBe('PARTIAL');
    expect(run.errors).toHaveLength(1);
    expect(run.errors[0].employeeId).toBe('emp-3');
    expect(run.errors[0].message).toBe('Bad data');
  });

  it('marks FAILED when ALL employees error', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getActiveEmployees').mockResolvedValue([baseEmployee]);
    vi.spyOn(LeaveAccrualService as any, 'getLeavePolicies').mockResolvedValue([baseMonthlyPolicy]);
    vi.spyOn(LeaveAccrualService as any, 'calculateEmployeeAccrual').mockRejectedValue(new Error('Bad'));

    const run = await LeaveAccrualService.processMonthlyAccrual({
      tenantId: TENANT_A,
      processDate: new Date('2026-06-01'),
    });

    expect(run.status).toBe('FAILED');
    expect(run.errors).toHaveLength(1);
  });

  it('skips policies that do not match the employee country', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getActiveEmployees').mockResolvedValue([baseEmployee]);
    vi.spyOn(LeaveAccrualService as any, 'getLeavePolicies').mockResolvedValue([
      { ...baseMonthlyPolicy, countryCode: 'IN' }, // wrong country
    ]);
    const calcSpy = vi
      .spyOn(LeaveAccrualService as any, 'calculateEmployeeAccrual')
      .mockResolvedValue({});

    await LeaveAccrualService.processMonthlyAccrual({
      tenantId: TENANT_A,
      processDate: new Date('2026-06-01'),
    });

    expect(calcSpy).not.toHaveBeenCalled();
  });

  it('skips non-MONTHLY policies', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getActiveEmployees').mockResolvedValue([baseEmployee]);
    vi.spyOn(LeaveAccrualService as any, 'getLeavePolicies').mockResolvedValue([
      { ...baseMonthlyPolicy, accrualType: 'ANNUAL' },
    ]);
    const calcSpy = vi
      .spyOn(LeaveAccrualService as any, 'calculateEmployeeAccrual')
      .mockResolvedValue({});

    await LeaveAccrualService.processMonthlyAccrual({
      tenantId: TENANT_A,
      processDate: new Date('2026-06-01'),
    });

    expect(calcSpy).not.toHaveBeenCalled();
  });
});

describe('LeaveAccrualService.calculateEncashment', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('throws when employee not found', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getEmployee').mockResolvedValue(null);

    await expect(
      LeaveAccrualService.calculateEncashment('missing', 'ANNUAL' as any, 10, 'YEAR_END' as any)
    ).rejects.toThrow('Employee not found');
  });

  it('throws when encashment is not allowed by policy', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getEmployee').mockResolvedValue(baseEmployee);
    vi.spyOn(LeaveAccrualService as any, 'getPolicyForEmployee').mockResolvedValue({
      ...baseMonthlyPolicy,
      encashment: { ...baseMonthlyPolicy.encashment, isAllowed: false },
    });

    await expect(
      LeaveAccrualService.calculateEncashment('emp-1', 'ANNUAL' as any, 10, 'YEAR_END' as any)
    ).rejects.toThrow('Encashment not allowed');
  });

  it('throws when trigger is not allowed by the policy', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getEmployee').mockResolvedValue(baseEmployee);
    vi.spyOn(LeaveAccrualService as any, 'getPolicyForEmployee').mockResolvedValue({
      ...baseMonthlyPolicy,
      encashment: { ...baseMonthlyPolicy.encashment, triggers: ['YEAR_END'] },
    });

    await expect(
      LeaveAccrualService.calculateEncashment('emp-1', 'ANNUAL' as any, 10, 'ON_RESIGNATION' as any)
    ).rejects.toThrow('Encashment not allowed for trigger');
  });

  it('calculates eligible days respecting minBalanceToRetain', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getEmployee').mockResolvedValue(baseEmployee);
    vi.spyOn(LeaveAccrualService as any, 'getPolicyForEmployee').mockResolvedValue(baseMonthlyPolicy);
    vi.spyOn(LeaveAccrualService as any, 'getCurrentBalance').mockResolvedValue(20);

    const result = await LeaveAccrualService.calculateEncashment(
      'emp-1',
      'ANNUAL' as any,
      18,
      'YEAR_END' as any
    );

    // 20 - 5 (minRetention) = 15 max encashable
    expect(result.currentBalance).toBe(20);
    expect(result.minRetention).toBe(5);
    expect(result.maxEncashable).toBe(15);
    expect(result.eligibleDays).toBe(15);
  });

  it('calculates daily rate from BASIC salary', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getEmployee').mockResolvedValue(baseEmployee);
    vi.spyOn(LeaveAccrualService as any, 'getPolicyForEmployee').mockResolvedValue({
      ...baseMonthlyPolicy,
      encashment: { ...baseMonthlyPolicy.encashment, basis: 'BASIC', encashmentRate: 100 },
    });
    vi.spyOn(LeaveAccrualService as any, 'getCurrentBalance').mockResolvedValue(15);

    const result = await LeaveAccrualService.calculateEncashment('emp-1', 'ANNUAL' as any, 10, 'YEAR_END' as any);

    // basicSalary=9000, dailyRate = 9000/30 = 300
    expect(result.dailyRate).toBe(300);
    expect(result.basis).toBe('BASIC');
    expect(result.basisAmount).toBe(9000);
  });

  it('calculates daily rate from GROSS salary when policy says so', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getEmployee').mockResolvedValue(baseEmployee);
    vi.spyOn(LeaveAccrualService as any, 'getPolicyForEmployee').mockResolvedValue({
      ...baseMonthlyPolicy,
      encashment: { ...baseMonthlyPolicy.encashment, basis: 'GROSS', encashmentRate: 100 },
    });
    vi.spyOn(LeaveAccrualService as any, 'getCurrentBalance').mockResolvedValue(15);

    const result = await LeaveAccrualService.calculateEncashment('emp-1', 'ANNUAL' as any, 10, 'YEAR_END' as any);

    // grossSalary=12000, dailyRate = 12000/30 = 400
    expect(result.dailyRate).toBe(400);
    expect(result.basis).toBe('GROSS');
  });

  it('applies encashmentRate percentage to the daily rate', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getEmployee').mockResolvedValue(baseEmployee);
    vi.spyOn(LeaveAccrualService as any, 'getPolicyForEmployee').mockResolvedValue({
      ...baseMonthlyPolicy,
      encashment: { ...baseMonthlyPolicy.encashment, basis: 'BASIC', encashmentRate: 50 },
    });
    vi.spyOn(LeaveAccrualService as any, 'getCurrentBalance').mockResolvedValue(15);

    const result = await LeaveAccrualService.calculateEncashment('emp-1', 'ANNUAL' as any, 10, 'YEAR_END' as any);

    // 9000/30 = 300, then * 50% = 150
    expect(result.dailyRate).toBe(150);
  });

  it('returns 0 eligible days when balance is below minRetention', async () => {
    vi.spyOn(LeaveAccrualService as any, 'getEmployee').mockResolvedValue(baseEmployee);
    vi.spyOn(LeaveAccrualService as any, 'getPolicyForEmployee').mockResolvedValue(baseMonthlyPolicy);
    vi.spyOn(LeaveAccrualService as any, 'getCurrentBalance').mockResolvedValue(3);

    const result = await LeaveAccrualService.calculateEncashment('emp-1', 'ANNUAL' as any, 10, 'YEAR_END' as any);

    expect(result.eligibleDays).toBe(0);
    expect(result.totalAmount).toBe(0);
  });
});
