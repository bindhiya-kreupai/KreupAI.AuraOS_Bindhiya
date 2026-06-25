import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  separationCaseService,
  separationClearanceService,
  separationHandoverService,
  separationExitInterviewService,
  separationCertificateService,
  isNoticeCompliant,
  SEPARATION_CONSTANTS,
} from '../separation-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.separationCase = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
  m.separationClearance = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cl-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cl-1', ...data })),
  };
  m.separationHandover = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'h-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'h-1', ...data })),
  };
  m.separationExitInterview = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'ei-1', ...create })),
  };
  m.separationCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('isNoticeCompliant', () => {
  it('returns true when buyout', () => {
    expect(isNoticeCompliant(60, 0, true)).toBe(true);
  });
  it('returns true when served >= required', () => {
    expect(isNoticeCompliant(30, 30, false)).toBe(true);
    expect(isNoticeCompliant(30, 35, false)).toBe(true);
  });
  it('returns false when short of required', () => {
    expect(isNoticeCompliant(30, 15, false)).toBe(false);
  });
});

describe('separationCaseService.open', () => {
  it('uses country default notice period', async () => {
    await separationCaseService.open(
      {
        caseNumber: 'S-1',
        employeeId: 'e-1',
        country: 'KSA',
        separationType: 'RESIGNATION',
      },
      auth
    );
    const call = m.separationCase.upsert.mock.calls[0][0];
    expect(call.create.noticeRequiredDays).toBe(60); // KSA default
  });
  it('seeds clearance checklists for HR/IT/FINANCE/SECURITY/LINE_MANAGER/ADMIN', async () => {
    await separationCaseService.open(
      {
        caseNumber: 'S-2',
        employeeId: 'e-1',
        country: 'UAE',
        separationType: 'RESIGNATION',
      },
      auth
    );
    expect(m.separationClearance.create).toHaveBeenCalledTimes(6);
    const depts = m.separationClearance.create.mock.calls.map((c: any) => c[0].data.department);
    expect(depts.sort()).toEqual(['ADMIN', 'FINANCE', 'HR', 'IT', 'LINE_MANAGER', 'SECURITY']);
  });
  it('marks death in service when type DEATH', async () => {
    await separationCaseService.open(
      {
        caseNumber: 'S-3',
        employeeId: 'e-1',
        country: 'UAE',
        separationType: 'DEATH',
      },
      auth
    );
    const call = m.separationCase.upsert.mock.calls[0][0];
    expect(call.create.deathInService).toBe(true);
  });
});

describe('separationCaseService.close', () => {
  it('refuses to close while clearances pending', async () => {
    m.separationCase.findUnique = vi.fn().mockResolvedValue({ id: 'c-1', tenantId: 'tenant-1' });
    m.separationClearance.count = vi.fn().mockResolvedValue(2);
    await expect(separationCaseService.close('c-1', auth)).rejects.toThrow(/clearance/);
  });
  it('closes when all clearances done', async () => {
    m.separationCase.findUnique = vi.fn().mockResolvedValue({ id: 'c-1', tenantId: 'tenant-1' });
    m.separationClearance.count = vi.fn().mockResolvedValue(0);
    await separationCaseService.close('c-1', auth);
    const call = m.separationCase.update.mock.calls[0][0];
    expect(call.data.status).toBe('CLOSED');
  });
});

describe('separationClearanceService.updateChecklist', () => {
  it('flips status to CLEARED when all items completed', async () => {
    m.separationClearance.findUnique = vi.fn().mockResolvedValue({ id: 'cl-1', totalItems: 4 });
    await separationClearanceService.updateChecklist('cl-1', 4, undefined, auth);
    const call = m.separationClearance.update.mock.calls[0][0];
    expect(call.data.status).toBe('CLEARED');
    expect(call.data.clearedAt).toBeInstanceOf(Date);
  });
  it('stays IN_PROGRESS when not yet complete', async () => {
    m.separationClearance.findUnique = vi.fn().mockResolvedValue({ id: 'cl-1', totalItems: 4 });
    await separationClearanceService.updateChecklist('cl-1', 2, undefined, auth);
    const call = m.separationClearance.update.mock.calls[0][0];
    expect(call.data.status).toBe('IN_PROGRESS');
    expect(call.data.clearedAt).toBeNull();
  });
});

describe('separationCertificateService', () => {
  it('gates when IT access remains open after close', async () => {
    m.separationCase.count = vi
      .fn()
      .mockResolvedValueOnce(0) // opened
      .mockResolvedValueOnce(0) // closed
      .mockResolvedValueOnce(0) // abandonment
      .mockResolvedValueOnce(3); // itAccessOpenAfterClose
    const cert = await separationCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/IT access still open/);
  });
  it('gates when clearance pending', async () => {
    m.separationClearance.count = vi.fn().mockResolvedValue(5);
    const cert = await separationCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/clearance/);
  });
  it('refuses to sign while gated', async () => {
<<<<<<< HEAD
    m.separationCertificate.findUnique = vi.fn().mockResolvedValue({
      id: 'c-1',
      gatingReason: 'Blocked: 1 closed case(s) with IT access still open',
    });
=======
    m.separationCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({
        id: 'c-1',
        gatingReason: 'Blocked: 1 closed case(s) with IT access still open',
      });
>>>>>>> 8492df9bd42d74db150a3648a1db92b18beba01c
    await expect(separationCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});

describe('SEPARATION_CONSTANTS', () => {
  it('exposes GCC notice defaults', () => {
    expect(SEPARATION_CONSTANTS.DEFAULT_NOTICE_DAYS.UAE).toBe(30);
    expect(SEPARATION_CONSTANTS.DEFAULT_NOTICE_DAYS.KSA).toBe(60);
  });
  it('exposes default clearance checklist', () => {
    expect(SEPARATION_CONSTANTS.DEFAULT_CLEARANCE_CHECKLIST.IT.length).toBeGreaterThan(0);
    expect(SEPARATION_CONSTANTS.DEFAULT_CLEARANCE_CHECKLIST.HR.length).toBeGreaterThan(0);
  });
});
