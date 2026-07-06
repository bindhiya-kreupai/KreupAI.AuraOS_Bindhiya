import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  holidayPayRuleService,
  holidayWorkApprovalService,
  holidayCompOffService,
  holidayCertificateService,
  HOLIDAY_CONSTANTS,
} from '../holidays-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.holidayPayRule = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'r-1', ...create })),
  };
  m.holidayWorkApproval = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi
      .fn()
      .mockImplementation(async ({ data }: any) => ({ id: 'wa-1', tenantId: 'tenant-1', ...data })),
    update: vi.fn().mockImplementation(async ({ where, data }: any) => ({
      id: where.id,
      tenantId: 'tenant-1',
      ...data,
    })),
  };
  m.holidayCompOff = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({ _sum: { daysAccrued: 0, daysConsumed: 0 } }),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'co-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'co-1', ...data })),
  };
  m.holidayCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  m.holiday = { count: vi.fn().mockResolvedValue(0) };
});

describe('holidayPayRuleService.seedDefaults', () => {
  it('seeds GCC default pay rules', async () => {
    const r = await holidayPayRuleService.seedDefaults(auth);
    expect(r.created.length).toBe(HOLIDAY_CONSTANTS.DEFAULT_PAY_RULES.length);
  });
});

describe('holidayWorkApprovalService.approve', () => {
  it('auto-accrues comp-off on approve when rule exists', async () => {
    m.holidayWorkApproval.update = vi.fn().mockResolvedValue({
      id: 'wa-1',
      tenantId: 'tenant-1',
      employeeId: 'e-1',
      country: 'UAE',
      holidayClass: 'NATIONAL',
      holidayDate: new Date('2026-12-02'),
      status: 'APPROVED',
    });
    m.holidayPayRule.findMany = vi.fn().mockResolvedValue([{ id: 'r-1', compOffDaysAccrued: 1 }]);
    await holidayWorkApprovalService.approve('wa-1', auth);
    expect(m.holidayCompOff.create).toHaveBeenCalled();
    const call = m.holidayCompOff.create.mock.calls[0][0];
    expect(Number(call.data.daysAccrued)).toBe(1);
    expect(call.data.expiresAt).toBeInstanceOf(Date);
  });
  it('skips comp-off creation when rule has zero accrual', async () => {
    m.holidayWorkApproval.update = vi.fn().mockResolvedValue({
      id: 'wa-1',
      tenantId: 'tenant-1',
      employeeId: 'e-1',
      country: 'UAE',
      holidayClass: 'NATIONAL',
      holidayDate: new Date('2026-12-02'),
      status: 'APPROVED',
    });
    m.holidayPayRule.findMany = vi.fn().mockResolvedValue([{ id: 'r-1', compOffDaysAccrued: 0 }]);
    await holidayWorkApprovalService.approve('wa-1', auth);
    expect(m.holidayCompOff.create).not.toHaveBeenCalled();
  });
});

describe('holidayCompOffService.consume', () => {
  it('refuses to consume more than available', async () => {
    m.holidayCompOff.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'co-1', daysAccrued: 1, daysConsumed: 0 });
    await expect(holidayCompOffService.consume('co-1', 2, auth)).rejects.toThrow(/only/);
  });
  it('flips to CONSUMED when fully drawn', async () => {
    m.holidayCompOff.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'co-1', daysAccrued: 1, daysConsumed: 0 });
    await holidayCompOffService.consume('co-1', 1, auth);
    const call = m.holidayCompOff.update.mock.calls[0][0];
    expect(call.data.status).toBe('CONSUMED');
  });
});

describe('holidayCertificateService', () => {
  it('gates when work approvals pending', async () => {
    m.holidayWorkApproval.count = vi
      .fn()
      .mockResolvedValueOnce(5) // workApprovalsTotal
      .mockResolvedValueOnce(3) // workApprovalsPending
      .mockResolvedValueOnce(1); // unapproved past-date
    const cert = await holidayCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/pending approval/);
  });
  it('gates when comp-off expiring soon', async () => {
    m.holidayCompOff.count = vi.fn().mockResolvedValue(2);
    const cert = await holidayCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/expiring/);
  });
  it('refuses to sign while gated', async () => {
    m.holidayCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 pending approval(s)' });
    await expect(holidayCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
