import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  visaExitCaseService,
  visaExitProActionService,
  visaExitGraceService,
  visaExitEvidenceService,
  visaExitCertificateService,
  VISA_EXIT_CONSTANTS,
} from '../visa-exit-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.visaExitCase = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'case-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'case-1', ...data })),
  };
  m.visaExitProAction = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'a-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'a-1', ...data })),
  };
  m.visaExitGrace = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'g-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'g-1', ...data })),
  };
  m.visaExitEvidence = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'e-1', ...data })),
  };
  m.visaExitCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
});

describe('visaExitCaseService.open', () => {
  it('creates a case with OPEN status and seeds default PRO actions', async () => {
    await visaExitCaseService.open(
      {
        employeeId: 'e-1',
        countryCode: 'UAE',
        scenario: 'RESIGNATION',
        lastWorkingDate: new Date('2026-06-30'),
      },
      auth
    );
    const callCase = m.visaExitCase.create.mock.calls[0][0];
    expect(callCase.data.status).toBe('OPEN');
    expect(callCase.data.absconding).toBe(false);
    expect(m.visaExitProAction.create).toHaveBeenCalledTimes(
      VISA_EXIT_CONSTANTS.PRO_ACTIONS_BY_SCENARIO.DEFAULT.length
    );
  });
  it('seeds ABSCONDING action set with absconding flag', async () => {
    await visaExitCaseService.open(
      { employeeId: 'e-1', countryCode: 'UAE', scenario: 'ABSCONDING' },
      auth
    );
    const callCase = m.visaExitCase.create.mock.calls[0][0];
    expect(callCase.data.absconding).toBe(true);
    expect(callCase.data.abscondingReportedAt).toBeInstanceOf(Date);
    expect(m.visaExitProAction.create).toHaveBeenCalledTimes(
      VISA_EXIT_CONSTANTS.PRO_ACTIONS_BY_SCENARIO.ABSCONDING.length
    );
  });
});

describe('visaExitGraceService', () => {
  it('uses country default days when not overridden', async () => {
    await visaExitGraceService.start(
      {
        caseId: 'case-1',
        grantedAt: new Date('2026-06-01'),
        graceType: 'POST_CANCELLATION',
        countryCode: 'UAE',
      },
      auth
    );
    const call = m.visaExitGrace.upsert.mock.calls[0][0];
    expect(call.create.daysGranted).toBe(30);
  });
  it('uses 60 days for KSA default', async () => {
    await visaExitGraceService.start(
      {
        caseId: 'case-1',
        grantedAt: new Date('2026-06-01'),
        graceType: 'EXIT_RE_ENTRY',
        countryCode: 'KSA',
      },
      auth
    );
    const call = m.visaExitGrace.upsert.mock.calls[0][0];
    expect(call.create.daysGranted).toBe(60);
  });
  it('throws when extending non-existent grace', async () => {
    m.visaExitGrace.findUnique = vi.fn().mockResolvedValue(null);
    await expect(visaExitGraceService.extend('case-x', 30, auth)).rejects.toThrow(
      /no grace record/
    );
  });
  it('extends grace by adding days and incrementing extensionCount', async () => {
    m.visaExitGrace.findUnique = vi
      .fn()
      .mockResolvedValue({ expiresAt: new Date('2026-07-01'), daysGranted: 30, extensionCount: 0 });
    await visaExitGraceService.extend('case-1', 14, auth);
    const call = m.visaExitGrace.update.mock.calls[0][0];
    expect(call.data.daysGranted).toBe(44);
    expect(call.data.extensionCount).toBe(1);
  });
});

describe('visaExitCertificateService', () => {
  it('gates when overdue PRO actions exist', async () => {
    m.visaExitProAction.count = vi.fn().mockResolvedValue(3);
    const cert = await visaExitCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/overdue PRO action/);
  });
  it('gates when grace expiring within 7 days', async () => {
    m.visaExitGrace.count = vi.fn().mockResolvedValue(2);
    const cert = await visaExitCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/grace expiry/);
  });
  it('refuses to sign while gated', async () => {
    m.visaExitCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 overdue PRO action(s)' });
    await expect(visaExitCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});

describe('visaExitEvidenceService', () => {
  it('captures evidence with capturedBy from auth', async () => {
    await visaExitEvidenceService.capture(
      { caseId: 'case-1', portal: 'GDRFA', evidenceType: 'EXIT_STAMP' },
      auth
    );
    const call = m.visaExitEvidence.create.mock.calls[0][0];
    expect(call.data.capturedBy).toBe('user-1');
  });
});

describe('visaExitProActionService', () => {
  it('marks COMPLETED with completedBy + completedAt', async () => {
    await visaExitProActionService.complete('a-1', 'done', auth);
    const call = m.visaExitProAction.update.mock.calls[0][0];
    expect(call.data.status).toBe('COMPLETED');
    expect(call.data.completedBy).toBe('user-1');
    expect(call.data.completedAt).toBeInstanceOf(Date);
  });
});
