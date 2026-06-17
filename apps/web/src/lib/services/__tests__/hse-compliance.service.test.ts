import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  hseRiskService,
  hseIncidentService,
  hsePermitService,
  hseTrainingService,
  hseCertificateService,
  calculateRiskScore,
  riskBand,
  calculateLtifr,
} from '../hse-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.hseRiskAssessment = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
  };
  m.hseIncident = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'i-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'i-1', ...data })),
  };
  m.hsePermitToWork = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'p-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'p-1', ...data })),
  };
  m.hseTrainingRecord = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 't-1', ...data })),
  };
  m.hseCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('calculateRiskScore', () => {
  it('multiplies likelihood by severity', () => {
    expect(calculateRiskScore(3, 4)).toBe(12);
    expect(calculateRiskScore(5, 5)).toBe(25);
    expect(calculateRiskScore(1, 1)).toBe(1);
  });
  it('clamps inputs to 1-5 range', () => {
    expect(calculateRiskScore(10, 10)).toBe(25);
    expect(calculateRiskScore(0, 0)).toBe(1);
  });
});

describe('riskBand', () => {
  it('returns CRITICAL for 20+', () => {
    expect(riskBand(20)).toBe('CRITICAL');
    expect(riskBand(25)).toBe('CRITICAL');
  });
  it('returns HIGH for 12-19', () => {
    expect(riskBand(12)).toBe('HIGH');
    expect(riskBand(19)).toBe('HIGH');
  });
  it('returns MEDIUM for 6-11', () => {
    expect(riskBand(6)).toBe('MEDIUM');
    expect(riskBand(11)).toBe('MEDIUM');
  });
  it('returns LOW for 1-5', () => {
    expect(riskBand(5)).toBe('LOW');
    expect(riskBand(1)).toBe('LOW');
  });
});

describe('calculateLtifr', () => {
  it('computes LTIFR per million worked hours', () => {
    expect(calculateLtifr(2, 1_000_000)).toBe(2);
    expect(calculateLtifr(5, 500_000)).toBe(10);
  });
  it('returns 0 when no hours worked', () => {
    expect(calculateLtifr(5, 0)).toBe(0);
  });
});

describe('hseRiskService.upsert', () => {
  it('derives inherentRisk and residualRisk from inputs', async () => {
    await hseRiskService.upsert(
      { title: 't', category: 'PHYSICAL', likelihood: 4, severity: 5 },
      auth
    );
    const call = m.hseRiskAssessment.create.mock.calls[0][0];
    expect(call.data.inherentRisk).toBe(20);
    expect(call.data.residualRisk).toBe(20);
  });
  it('uses residual L/S when provided', async () => {
    await hseRiskService.upsert(
      {
        title: 't',
        category: 'FIRE',
        likelihood: 4,
        severity: 5,
        residualLikelihood: 2,
        residualSeverity: 3,
      },
      auth
    );
    const call = m.hseRiskAssessment.create.mock.calls[0][0];
    expect(call.data.inherentRisk).toBe(20);
    expect(call.data.residualRisk).toBe(6);
  });
});

describe('hsePermitService', () => {
  it('issues permit with PPE checklist and isolations defaults', async () => {
    await hsePermitService.issue(
      {
        permitNumber: 'PTW-001',
        workType: 'HOT_WORK',
        location: 'Bay 7',
        startAt: new Date(),
        endAt: new Date(Date.now() + 8 * 3600 * 1000),
      },
      auth
    );
    const call = m.hsePermitToWork.upsert.mock.calls[0][0];
    expect(call.create.ppeChecklistJson).toEqual([]);
    expect(call.create.isolationsJson).toEqual([]);
  });
});

describe('hseTrainingService.record', () => {
  it('derives validUntil from validityMonths', async () => {
    const completedAt = new Date('2026-01-01');
    await hseTrainingService.record(
      {
        employeeId: 'e-1',
        trainingCode: 'CODE',
        trainingType: 'INDUCTION',
        completedAt,
        validityMonths: 12,
      },
      auth
    );
    const call = m.hseTrainingRecord.create.mock.calls[0][0];
    expect(call.data.validUntil).toBeInstanceOf(Date);
    const expected = new Date(completedAt);
    expected.setMonth(expected.getMonth() + 12);
    expect((call.data.validUntil as Date).toISOString().slice(0, 7)).toBe(
      expected.toISOString().slice(0, 7)
    );
  });
});

describe('hseCertificateService', () => {
  it('gates when fatalities exist', async () => {
    m.hseIncident.count = vi
      .fn()
      .mockResolvedValueOnce(0) // incidentsOpen
      .mockResolvedValueOnce(0) // LTI
      .mockResolvedValueOnce(2); // fatalities
    const cert = await hseCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/FATALITY/);
  });
  it('gates when training expired', async () => {
    m.hseTrainingRecord.count = vi.fn().mockResolvedValueOnce(5).mockResolvedValueOnce(0);
    const cert = await hseCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/expired training/);
  });
  it('refuses to sign while gated', async () => {
    m.hseCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 FATALITY incident(s)' });
    await expect(hseCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
