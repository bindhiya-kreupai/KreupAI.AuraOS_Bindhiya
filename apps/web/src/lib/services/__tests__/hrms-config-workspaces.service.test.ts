import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  hrmsConfigRegistryService,
  hrmsConfigCertificateService,
  hrmsConnectorService,
  hrmsImplementationService,
  hrmsMigrationService,
  HRMS_WORKSPACES,
  findWorkspaceByDomain,
} from '../hrms-config';

const prismaMock = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'maker-1' };

beforeEach(() => {
  prismaMock.hrmsConfigObject = {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cfg-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cfg-1', ...data })),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    count: vi.fn().mockResolvedValue(0),
  };
  prismaMock.hrmsConfigCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  prismaMock.hrmsImplementationChecklist = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'imp-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'imp-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  prismaMock.hrmsConfigConnector = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'con-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'con-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  prismaMock.hrmsConfigMigration = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'mig-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'mig-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  prismaMock.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) =>
      typeof fn === 'function' ? fn(prismaMock) : Promise.all(fn)
    );
});

describe('HRMS workspace descriptors', () => {
  it('exposes 22 per-domain workspaces (S03–S20 + S24, with S07 split into 4 sub-domains)', () => {
    expect(HRMS_WORKSPACES.length).toBe(22);
  });
  it('every workspace cites its story ID', () => {
    for (const w of HRMS_WORKSPACES) {
      expect(w.storyId).toMatch(/^EPIC-34-S/);
    }
  });
  it('findWorkspaceByDomain resolves known domain codes', () => {
    expect(findWorkspaceByDomain('LEAVE')?.storyId).toBe('EPIC-34-S12');
    expect(findWorkspaceByDomain('NOT_REAL')).toBeNull();
  });
});

describe('HrmsConfigRegistryService.createDraft + submit', () => {
  it('creates DRAFT with version=1 when no prior exists', async () => {
    const result = await hrmsConfigRegistryService.createDraft(
      {
        domainCode: 'LEAVE',
        objectType: 'POLICY',
        objectKey: 'annual-leave-uae',
        label: 'UAE Annual Leave Policy',
        effectiveFrom: new Date('2026-09-01'),
        payload: { days: 30 },
        rationale: 'Decree-Law 33/2021 Art. 29',
        sourceReference: 'https://example.test/decree',
      },
      auth
    );
    expect(result.version).toBe(1);
    expect(result.status).toBe('DRAFT');
    expect(result.requestedBy).toBe('maker-1');
  });

  it('bumps version when prior exists', async () => {
    prismaMock.hrmsConfigObject.findFirst = vi.fn().mockResolvedValue({ version: 3 });
    const result = await hrmsConfigRegistryService.createDraft(
      {
        domainCode: 'LEAVE',
        objectType: 'POLICY',
        objectKey: 'annual-leave-uae',
        label: 'UAE Annual Leave Policy v4',
        effectiveFrom: new Date('2027-01-01'),
        payload: { days: 32 },
        rationale: 'r',
        sourceReference: 's',
      },
      auth
    );
    expect(result.version).toBe(4);
  });

  it('submit requires rationale + sourceReference', async () => {
    prismaMock.hrmsConfigObject.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'cfg-1', tenantId: 'tenant-1', status: 'DRAFT', rationale: null });
    await expect(hrmsConfigRegistryService.submit('cfg-1', auth)).rejects.toThrow(
      /rationale and sourceReference required/
    );
  });
});

describe('HrmsConfigRegistryService.approve — maker-checker', () => {
  it('refuses approval when approver equals requester', async () => {
    prismaMock.hrmsConfigObject.findUnique = vi.fn().mockResolvedValue({
      id: 'cfg-1',
      tenantId: 'tenant-1',
      status: 'PENDING_APPROVAL',
      requestedBy: 'maker-1',
      effectiveFrom: new Date('2026-09-01'),
    });
    await expect(
      hrmsConfigRegistryService.approve('cfg-1', { tenantId: 'tenant-1', userId: 'maker-1' })
    ).rejects.toThrow(/approver must differ from requester/);
  });

  it('approves and retires any prior ACTIVE for same (domain, objectKey, scope)', async () => {
    prismaMock.hrmsConfigObject.findUnique = vi.fn().mockResolvedValue({
      id: 'cfg-2',
      tenantId: 'tenant-1',
      domainCode: 'LEAVE',
      objectKey: 'annual-leave-uae',
      scope: 'COUNTRY',
      scopeRef: 'AE',
      status: 'PENDING_APPROVAL',
      requestedBy: 'maker-1',
      effectiveFrom: new Date('2027-01-01'),
    });
    const result = await hrmsConfigRegistryService.approve('cfg-2', {
      tenantId: 'tenant-1',
      userId: 'checker-1',
    });
    expect(prismaMock.hrmsConfigObject.updateMany).toHaveBeenCalled();
    expect(result.status).toBe('ACTIVE');
    expect(result.approvedBy).toBe('checker-1');
  });
});

describe('HrmsConfigRegistryService.resolveActive — scope priority', () => {
  it('picks LEGAL_ENTITY scope over COUNTRY over GLOBAL', async () => {
    const now = new Date('2026-10-01');
    prismaMock.hrmsConfigObject.findMany = vi.fn().mockResolvedValue([
      {
        id: 'g',
        scope: 'GLOBAL',
        country: null,
        legalEntityId: null,
        effectiveFrom: new Date('2026-01-01'),
      },
      {
        id: 'c',
        scope: 'COUNTRY',
        country: 'AE',
        legalEntityId: null,
        effectiveFrom: new Date('2026-06-01'),
      },
      {
        id: 'l',
        scope: 'LEGAL_ENTITY',
        country: 'AE',
        legalEntityId: 'le-1',
        effectiveFrom: new Date('2026-05-01'),
      },
    ]);
    const result = await hrmsConfigRegistryService.resolveActive(
      { domainCode: 'LEAVE', objectKey: 'k', country: 'AE', legalEntityId: 'le-1', at: now },
      'tenant-1'
    );
    expect(result.id).toBe('l');
  });

  it('falls back to GLOBAL when no entity / country match', async () => {
    prismaMock.hrmsConfigObject.findMany = vi.fn().mockResolvedValue([
      {
        id: 'g',
        scope: 'GLOBAL',
        country: null,
        legalEntityId: null,
        effectiveFrom: new Date('2026-01-01'),
      },
    ]);
    const result = await hrmsConfigRegistryService.resolveActive(
      { domainCode: 'LEAVE', objectKey: 'k' },
      'tenant-1'
    );
    expect(result.id).toBe('g');
  });
});

describe('HrmsConfigCertificateService — gating', () => {
  it('marks cert as GATED when there are pending approvals', async () => {
    prismaMock.hrmsConfigObject.count = vi
      .fn()
      // total
      .mockResolvedValueOnce(10)
      // active
      .mockResolvedValueOnce(8)
      // pendingApproval
      .mockResolvedValueOnce(2);
    prismaMock.hrmsConfigObject.findMany = vi
      .fn()
      .mockResolvedValueOnce([]) // distinct domains
      .mockResolvedValue([]);
    const result = await hrmsConfigCertificateService.generate(
      { period: '2026-09', certificateType: 'MONTHLY' },
      auth
    );
    expect(result.status).toBe('GATED');
    expect(result.gatingReason).toMatch(/MAKER_CHECKER_PENDING/);
  });

  it('refuses to sign while gated', async () => {
    prismaMock.hrmsConfigCertificate.findUnique = vi.fn().mockResolvedValue({
      id: 'cert-1',
      gatingReason: 'MAKER_CHECKER_PENDING(2)',
    });
    await expect(
      hrmsConfigCertificateService.sign({ period: '2026-09', certificateType: 'MONTHLY' }, auth)
    ).rejects.toThrow(/certificate is gated/);
  });

  it('signs when gating reason is null', async () => {
    prismaMock.hrmsConfigCertificate.findUnique = vi.fn().mockResolvedValue({
      id: 'cert-2',
      gatingReason: null,
    });
    const result = await hrmsConfigCertificateService.sign(
      { period: '2026-09', certificateType: 'MONTHLY' },
      auth
    );
    expect(result.status).toBe('SIGNED');
    expect(result.signedBy).toBe('maker-1');
  });

  it('GO_LIVE certificate also gates on open mandatory checklist items', async () => {
    prismaMock.hrmsConfigObject.count = vi
      .fn()
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(0);
    prismaMock.hrmsImplementationChecklist.count = vi.fn().mockResolvedValue(3);
    prismaMock.hrmsConfigObject.findMany = vi.fn().mockResolvedValueOnce([]);
    const result = await hrmsConfigCertificateService.generate(
      { period: '2026-09', certificateType: 'GO_LIVE' },
      auth
    );
    expect(result.gatingReason).toMatch(/IMPLEMENTATION_OPEN/);
  });
});

describe('HrmsConnectorService rotation', () => {
  it('markRotated sets lastRotatedAt + 90-day rotationDueAt', async () => {
    const result = await hrmsConnectorService.markRotated('QIWA-001', auth);
    expect(result.lastRotatedAt).toBeInstanceOf(Date);
    expect(result.rotationDueAt).toBeInstanceOf(Date);
    const diff =
      (result.rotationDueAt as Date).getTime() - (result.lastRotatedAt as Date).getTime();
    expect(diff).toBe(90 * 24 * 60 * 60 * 1000);
  });
});

describe('HrmsImplementationService seed', () => {
  it('returns created codes for the default seed', async () => {
    const result = await hrmsImplementationService.seed(auth);
    expect(result.created.length).toBeGreaterThan(0);
  });
});

describe('HrmsMigrationService failingCount', () => {
  it('counts FAILED + validationsPassed=false rows', async () => {
    prismaMock.hrmsConfigMigration.count = vi.fn().mockResolvedValue(2);
    expect(await hrmsMigrationService.failingCount('tenant-1')).toBe(2);
  });
});
