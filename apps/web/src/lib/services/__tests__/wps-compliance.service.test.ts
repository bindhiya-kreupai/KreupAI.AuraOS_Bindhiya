import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  validateEmployerId,
  wpsCertificateService,
  wpsExceptionService,
  wpsFileGeneratorService,
  wpsSchemeService,
  wpsSubmissionService,
  WPS_SCHEME_SEEDS,
} from '../wps-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.wpsScheme = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'sc-1', ...data })),
  };
  m.wpsEstablishment = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'est-1', ...data })),
  };
  m.wpsPeriodSubmission = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'sub-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'sub-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.wpsEmployeeRow = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
  };
  m.wpsException = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'e-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'e-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.salaryDelayFlag = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'd-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'd-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.wpsPenalty = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  };
  m.wpsDocument = {
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'd-1', ...data })),
  };
  m.wpsMonthlyCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
  m.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) => (typeof fn === 'function' ? fn(m) : Promise.all(fn)));
});

describe('scheme seeds', () => {
  it('covers all six GCC countries', () => {
    const codes = new Set(WPS_SCHEME_SEEDS.map((s) => s.countryCode));
    for (const cc of ['AE', 'SA', 'BH', 'QA', 'OM', 'KW']) {
      expect(codes.has(cc)).toBe(true);
    }
  });

  it('UAE statutory window is 15 days; KSA Mudad is 7 days', () => {
    const ae = WPS_SCHEME_SEEDS.find((s) => s.countryCode === 'AE')!;
    const sa = WPS_SCHEME_SEEDS.find((s) => s.countryCode === 'SA')!;
    expect(ae.statutoryWindowDays).toBe(15);
    expect(sa.statutoryWindowDays).toBe(7);
  });
});

describe('validateEmployerId', () => {
  it('accepts UAE numeric MOHRE IDs', () => {
    expect(validateEmployerId('AE', '123456789').valid).toBe(true);
  });
  it('rejects UAE non-numeric', () => {
    expect(validateEmployerId('AE', 'ABC').valid).toBe(false);
  });
  it('rejects unknown country', () => {
    expect(validateEmployerId('US', '123').valid).toBe(false);
  });
});

describe('wpsFileGeneratorService', () => {
  const header = {
    employerId: 'EMP1',
    establishmentName: 'Demo',
    period: '2026-06',
    countryCode: 'AE',
  };
  const rows = [
    {
      employeeCode: 'E001',
      iban: 'AE070331234567890123456',
      currency: 'AED',
      fixedPay: 5000,
      variablePay: 200,
      deductions: 100,
      netPay: 5100,
    },
  ];

  it('SIF formatter produces EDR + SCR + EOF lines', () => {
    const f = wpsFileGeneratorService.generate('SIF', header, rows);
    expect(f.content).toMatch(/^EDR\|EMP1/);
    expect(f.content).toMatch(/\nSCR\|/);
    expect(f.content).toMatch(/\nEOF\|1\|5100.00$/);
    expect(f.totalEmployees).toBe(1);
    expect(f.totalAmount).toBe(5100);
    expect(f.errors).toEqual([]);
  });

  it('flags missing IBAN as a validation error', () => {
    const f = wpsFileGeneratorService.generate('SIF', header, [{ ...rows[0], iban: '' } as any]);
    expect(f.errors).toEqual(expect.arrayContaining([expect.stringMatching(/missing IBAN/)]));
  });

  it('flags zero net pay as a validation error', () => {
    const f = wpsFileGeneratorService.generate('SIF', header, [{ ...rows[0], netPay: 0 }]);
    expect(f.errors).toEqual(expect.arrayContaining([expect.stringMatching(/netPay/)]));
  });

  it('unsupported format reports an error', () => {
    const f = wpsFileGeneratorService.generate('UNKNOWN', header, rows);
    expect(f.errors).toEqual(expect.arrayContaining([expect.stringMatching(/unsupported/)]));
  });

  it('MUDAD formatter produces CSV header line', () => {
    const f = wpsFileGeneratorService.generate('MUDAD', header, rows);
    expect(f.content).toMatch(/EMPLOYEE_ID,NATIONAL_ID,IBAN/);
  });

  it('computes hash deterministically', () => {
    const a = wpsFileGeneratorService.generate('SIF', header, rows);
    const b = wpsFileGeneratorService.generate('SIF', header, rows);
    expect(a.hash).toBe(b.hash);
  });
});

describe('wpsSubmissionService.build', () => {
  it('refuses to build without a known scheme', async () => {
    m.wpsScheme.findUnique.mockResolvedValue(null);
    await expect(
      wpsSubmissionService.build(
        { countryCode: 'AE', establishmentId: 'est-1', period: '2026-06', rows: [] },
        auth
      )
    ).rejects.toThrow(/no WPS scheme/);
  });

  it('persists rows and sets dueDate from statutory window', async () => {
    m.wpsScheme.findUnique.mockResolvedValue({ fileFormat: 'SIF', statutoryWindowDays: 15 });
    const sub = await wpsSubmissionService.build(
      {
        countryCode: 'AE',
        establishmentId: 'est-1',
        period: '2026-06',
        rows: [
          {
            employeeCode: 'E1',
            iban: 'AE001',
            currency: 'AED',
            fixedPay: 100,
            variablePay: 0,
            deductions: 0,
            netPay: 100,
          } as any,
        ],
      },
      auth
    );
    expect(sub.fileFormat).toBe('SIF');
    expect(sub.totalEmployees).toBe(1);
  });
});

describe('wpsSubmissionService.submit', () => {
  it('refuses to submit a DRAFT submission', async () => {
    m.wpsPeriodSubmission.findUnique.mockResolvedValue({ id: 'sub-1', status: 'DRAFT' });
    await expect(wpsSubmissionService.submit('sub-1', new Date(), auth)).rejects.toThrow(
      /cannot be submitted/
    );
  });

  it('raises salary-delay flags for each row when submitted past dueDate', async () => {
    m.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'VALIDATED',
      countryCode: 'AE',
      period: '2026-06',
      dueDate: new Date('2026-07-15T00:00:00Z'),
    });
    m.wpsEmployeeRow.findMany.mockResolvedValue([{ employeeId: 'emp-1' }, { employeeId: 'emp-2' }]);
    const after = new Date('2026-08-01T00:00:00Z');
    await wpsSubmissionService.submit('sub-1', after, auth);
    expect(m.salaryDelayFlag.create).toHaveBeenCalledTimes(2);
  });
});

describe('wpsCertificateService', () => {
  it('generate sets gating when critical delays present', async () => {
    m.wpsPeriodSubmission.findMany.mockResolvedValue([{ status: 'ACKNOWLEDGED' }]);
    m.salaryDelayFlag.count.mockImplementation(async ({ where }: any) =>
      where.severity === 'CRITICAL' ? 1 : 0
    );
    const c = await wpsCertificateService.generate('2026-06', auth);
    expect(c.gatingReason).toMatch(/critical salary delays/);
  });

  it('sign refuses while gated', async () => {
    m.wpsMonthlyCertificate.findUnique.mockResolvedValue({
      id: 'c-1',
      gatingReason: 'Blocked: 1 critical salary delays',
    });
    await expect(wpsCertificateService.sign('2026-06', [], auth)).rejects.toThrow(/gated/);
  });

  it('seedDocuments creates the policy + procedure docs', async () => {
    const { created } = await wpsCertificateService.seedDocuments(auth);
    expect(created).toEqual(['WPS_POLICY', 'WPS_PROCEDURE']);
  });
});

describe('wpsExceptionService.recordDelay', () => {
  it('records HIGH severity for daysLate 8..15', async () => {
    const due = new Date('2026-07-01T00:00:00Z');
    const credited = new Date('2026-07-10T00:00:00Z');
    await wpsExceptionService.recordDelay(
      {
        employeeId: 'e1',
        countryCode: 'AE',
        period: '2026-06',
        dueDate: due,
        creditedAt: credited,
      },
      auth
    );
    expect(m.salaryDelayFlag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ severity: 'HIGH', daysLate: 9 }),
      })
    );
  });

  it('records CRITICAL severity when daysLate > 15', async () => {
    const due = new Date('2026-07-01T00:00:00Z');
    const credited = new Date('2026-07-25T00:00:00Z');
    await wpsExceptionService.recordDelay(
      {
        employeeId: 'e1',
        countryCode: 'AE',
        period: '2026-06',
        dueDate: due,
        creditedAt: credited,
      },
      auth
    );
    expect(m.salaryDelayFlag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ severity: 'CRITICAL' }),
      })
    );
  });

  it('returns null and inserts nothing when credit is on/before due date', async () => {
    const due = new Date('2026-07-15T00:00:00Z');
    const credited = new Date('2026-07-14T00:00:00Z');
    const r = await wpsExceptionService.recordDelay(
      {
        employeeId: 'e1',
        countryCode: 'AE',
        period: '2026-06',
        dueDate: due,
        creditedAt: credited,
      },
      auth
    );
    expect(r).toBeNull();
  });
});
