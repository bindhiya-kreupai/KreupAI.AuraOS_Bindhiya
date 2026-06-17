import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  eosbAccrualService,
  eosbCalculationService,
  eosbCertificateService,
  eosbDisputeService,
} from '../eosb-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.eosbCalculation = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({ _sum: { netPayable: 0 }, _count: { _all: 0 } }),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
  m.eosbAccrual = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({ _sum: { accruedGratuity: 0 }, _count: { _all: 0 } }),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'a-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'a-1', ...data })),
  };
  m.eosbDispute = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'd-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'd-1', ...data })),
  };
  m.eosbCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('EosbCalculationService.finalize', () => {
  it('runs calculator and persists result with DRAFT status', async () => {
    const r = await eosbCalculationService.finalize(
      {
        employeeId: 'e-1',
        countryCode: 'AE',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-12-31'),
        basicSalary: 10000,
        terminationType: 'RESIGNATION',
      },
      auth
    );
    expect(m.eosbCalculation.upsert).toHaveBeenCalled();
    const call = m.eosbCalculation.upsert.mock.calls[0][0];
    expect(call.create.status).toBe('DRAFT');
    expect(call.create.currency).toBe('AED');
    expect(Number(call.create.gratuityAmount)).toBeGreaterThan(0);
  });
  it('subtracts social-insurance offset from net payable', async () => {
    await eosbCalculationService.finalize(
      {
        employeeId: 'e-1',
        countryCode: 'AE',
        joiningDate: new Date('2020-01-01'),
        lastWorkingDate: new Date('2024-12-31'),
        basicSalary: 10000,
        terminationType: 'END_OF_CONTRACT',
        socialInsuranceOffset: 5000,
      },
      auth
    );
    const call = m.eosbCalculation.upsert.mock.calls[0][0];
    expect(call.create.netPayable).toBe(Math.max(0, call.create.gratuityAmount - 5000));
    expect(call.create.socialInsuranceOffset).toBe(5000);
  });
});

describe('EosbAccrualService.snapshot', () => {
  it('computes delta against prior period when prior exists', async () => {
    m.eosbAccrual.findUnique = vi.fn().mockResolvedValue({ accruedGratuity: 1000 });
    await eosbAccrualService.snapshot(
      {
        employeeId: 'e-1',
        period: '2026-06',
        countryCode: 'AE',
        joiningDate: new Date('2024-01-01'),
        basicSalary: 10000,
      },
      auth
    );
    const call = m.eosbAccrual.upsert.mock.calls[0][0];
    expect(call.create.monthDelta).toBe(call.create.accruedGratuity - 1000);
  });
});

describe('EosbDisputeService', () => {
  it('raises a dispute with OPEN status', async () => {
    const r = await eosbDisputeService.raise(
      {
        employeeId: 'e-1',
        subject: 'wrong salary basis',
        currency: 'AED',
        category: 'SALARY_BASIS',
      },
      auth
    );
    expect(r.status).toBe('OPEN');
  });
  it('sets resolvedAt on RESOLVED transition', async () => {
    await eosbDisputeService.transition('d-1', 'RESOLVED', 'paid difference', auth);
    const call = m.eosbDispute.update.mock.calls[0][0];
    expect(call.data.status).toBe('RESOLVED');
    expect(call.data.resolvedAt).not.toBeNull();
  });
  it('does not set resolvedAt on UNDER_REVIEW transition', async () => {
    await eosbDisputeService.transition('d-1', 'UNDER_REVIEW', undefined, auth);
    const call = m.eosbDispute.update.mock.calls[0][0];
    expect(call.data.status).toBe('UNDER_REVIEW');
    expect(call.data.resolvedAt).toBeNull();
  });
});

describe('EosbCertificateService', () => {
  it('refuses to sign when open disputes gate the certificate', async () => {
    m.eosbCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'cert-1', gatingReason: 'Blocked: 1 open dispute(s)' });
    await expect(eosbCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
  it('gates when there are unsettled calculations', async () => {
    m.eosbCalculation.count = vi.fn().mockResolvedValue(3);
    const cert = await eosbCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/unsettled calculation/);
  });
});
