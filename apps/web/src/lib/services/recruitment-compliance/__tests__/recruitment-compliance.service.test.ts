import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire prisma client surface used by the service barrel.
// Each test rebinds whichever delegate methods it needs via the fakes below.
vi.mock('@aura/database', () => ({
  prisma: {
    recruitmentCase: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    recruitmentCandidateScreening: { findUnique: vi.fn(), upsert: vi.fn(), findMany: vi.fn() },
    recruitmentBgvCase: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
    recruitmentBgvCheck: { findMany: vi.fn(), upsert: vi.fn() },
    recruitmentImmigrationEligibility: { findUnique: vi.fn(), upsert: vi.fn() },
    recruitmentScreeningCriteria: { upsert: vi.fn(), findMany: vi.fn() },
    recruitmentCandidateConsent: { create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    recruitmentAuditChecklist: { upsert: vi.fn(), findMany: vi.fn() },
    recruitmentRisk: { upsert: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  },
}));

import { prisma } from '@aura/database';
import {
  recruitmentCaseService,
  candidateScreeningService,
  bgvCaseService,
  bgvCheckService,
  immigrationEligibilityService,
  candidateConsentService,
  RiskRegisterService,
  riskRegisterService,
} from '../index';

const fakePrisma = prisma as unknown as any;
const auth = { tenantId: 't1', userId: 'u1' };

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// S01 — stage-gate FSM
// ---------------------------------------------------------------------------

describe('RecruitmentCaseService.transition (S01 FSM)', () => {
  function arrangeCase(currentStage: string) {
    fakePrisma.recruitmentCase.findFirst.mockResolvedValue({
      id: 'case-1',
      tenantId: 't1',
      vacancyId: 'v1',
      candidateId: 'cand-1',
      ownerId: 'u1',
      currentStage,
      status: 'OPEN',
      slaDays: 30,
      openedAt: new Date(),
    });
    fakePrisma.recruitmentCase.update.mockImplementation(async (args: any) => ({
      id: 'case-1',
      currentStage: args.data.currentStage,
      status: args.data.status,
    }));
  }

  it('rejects an invalid transition (APPLIED → OFFERED)', async () => {
    arrangeCase('APPLIED');
    await expect(recruitmentCaseService.transition('case-1', 'OFFERED', auth)).rejects.toThrow(
      /invalid transition/i
    );
  });

  it('blocks APPLIED → SCREENED when no PASS screening exists', async () => {
    arrangeCase('APPLIED');
    fakePrisma.recruitmentCandidateScreening.findUnique.mockResolvedValue(null);
    await expect(recruitmentCaseService.transition('case-1', 'SCREENED', auth)).rejects.toThrow(
      /SCREENED gate/
    );
  });

  it('allows APPLIED → SCREENED when a PASS CandidateScreening exists', async () => {
    arrangeCase('APPLIED');
    fakePrisma.recruitmentCandidateScreening.findUnique.mockResolvedValue({ outcome: 'PASS' });
    const out = await recruitmentCaseService.transition('case-1', 'SCREENED', auth);
    expect(out.currentStage).toBe('SCREENED');
  });

  it('blocks INTERVIEWED → OFFERED when BGV not PASSED', async () => {
    arrangeCase('INTERVIEWED');
    fakePrisma.recruitmentBgvCase.findUnique.mockResolvedValue({ status: 'IN_PROGRESS' });
    await expect(recruitmentCaseService.transition('case-1', 'OFFERED', auth)).rejects.toThrow(
      /OFFERED gate.*BgvCase/
    );
  });

  it('blocks INTERVIEWED → OFFERED when immigration is INELIGIBLE', async () => {
    arrangeCase('INTERVIEWED');
    fakePrisma.recruitmentBgvCase.findUnique.mockResolvedValue({ status: 'PASSED' });
    fakePrisma.recruitmentImmigrationEligibility.findUnique.mockResolvedValue({
      eligibility: 'INELIGIBLE',
    });
    await expect(recruitmentCaseService.transition('case-1', 'OFFERED', auth)).rejects.toThrow(
      /ELIGIBLE/
    );
  });

  it('allows INTERVIEWED → OFFERED when all gates pass', async () => {
    arrangeCase('INTERVIEWED');
    fakePrisma.recruitmentBgvCase.findUnique.mockResolvedValue({ status: 'PASSED' });
    fakePrisma.recruitmentImmigrationEligibility.findUnique.mockResolvedValue({
      eligibility: 'ELIGIBLE',
    });
    const out = await recruitmentCaseService.transition('case-1', 'OFFERED', auth);
    expect(out.currentStage).toBe('OFFERED');
    expect(out.status).toBe('OPEN');
  });

  it('marks terminal transitions (HIRED / REJECTED / WITHDRAWN) as CLOSED', async () => {
    arrangeCase('APPLIED');
    const out = await recruitmentCaseService.transition('case-1', 'REJECTED', auth);
    expect(out.status).toBe('CLOSED');
  });
});

// ---------------------------------------------------------------------------
// S06 — bias-aware screening
// ---------------------------------------------------------------------------

describe('CandidateScreeningService (S06)', () => {
  it('rejects KNOCKOUT outcome without a knockoutReason', async () => {
    await expect(
      candidateScreeningService.record(
        { caseId: 'c1', candidateId: 'cand-1', score: 0, outcome: 'KNOCKOUT' },
        auth
      )
    ).rejects.toThrow(/knockoutReason/);
  });

  it('persists protectedFactors so bias-flagged rows can be reviewed', async () => {
    fakePrisma.recruitmentCandidateScreening.upsert.mockResolvedValue({
      id: 'cs-1',
      outcome: 'PASS',
      protectedFactors: ['nationality'],
    });
    const out = await candidateScreeningService.record(
      {
        caseId: 'c1',
        candidateId: 'cand-1',
        score: 0.8,
        outcome: 'PASS',
        protectedFactors: ['nationality'],
      },
      auth
    );
    expect(out.protectedFactors).toContain('nationality');
    expect(fakePrisma.recruitmentCandidateScreening.upsert).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// S10 — BGV
// ---------------------------------------------------------------------------

describe('BgvCaseService.refreshStatus + BgvCheckService.addOrUpdate (S10)', () => {
  it('sets BGV case to PASSED only when all checks PASS or WAIVED', async () => {
    fakePrisma.recruitmentBgvCheck.findMany.mockResolvedValue([
      { result: 'PASS' },
      { result: 'WAIVED' },
      { result: 'PASS' },
    ]);
    fakePrisma.recruitmentBgvCase.update.mockImplementation(async (a: any) => ({
      id: 'b1',
      ...a.data,
    }));

    const out = await bgvCaseService.refreshStatus('b1', auth);
    expect(out?.status).toBe('PASSED');
  });

  it('sets BGV case to FAILED if any check FAILs', async () => {
    fakePrisma.recruitmentBgvCheck.findMany.mockResolvedValue([
      { result: 'PASS' },
      { result: 'FAIL' },
    ]);
    fakePrisma.recruitmentBgvCase.update.mockImplementation(async (a: any) => ({
      id: 'b1',
      ...a.data,
    }));

    const out = await bgvCaseService.refreshStatus('b1', auth);
    expect(out?.status).toBe('FAILED');
    expect(out?.blockedReason).toMatch(/failed/);
  });

  it('addOrUpdate sets completedAt only on terminal result and re-refreshes the parent', async () => {
    fakePrisma.recruitmentBgvCheck.upsert.mockResolvedValue({ id: 'check-1', result: 'PASS' });
    fakePrisma.recruitmentBgvCheck.findMany.mockResolvedValue([{ result: 'PASS' }]);
    fakePrisma.recruitmentBgvCase.update.mockResolvedValue({ id: 'b1', status: 'PASSED' });

    const out = await bgvCheckService.addOrUpdate(
      { bgvCaseId: 'b1', checkType: 'EMPLOYMENT', result: 'PASS' },
      auth
    );
    expect(out.result).toBe('PASS');
    expect(fakePrisma.recruitmentBgvCheck.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ completedAt: expect.any(Date) }),
      })
    );
  });
});

// ---------------------------------------------------------------------------
// S11 — immigration eligibility derivation
// ---------------------------------------------------------------------------

describe('ImmigrationEligibilityService.checkAndRecord (S11)', () => {
  it('derives INELIGIBLE when banStatus = BANNED', async () => {
    fakePrisma.recruitmentImmigrationEligibility.upsert.mockImplementation(async (a: any) => ({
      ...a.create,
    }));
    const out = await immigrationEligibilityService.checkAndRecord(
      {
        caseId: 'c1',
        candidateId: 'cand-1',
        countryCode: 'AE',
        nationality: 'XX',
        banStatus: 'BANNED',
      },
      auth
    );
    expect(out.eligibility).toBe('INELIGIBLE');
  });

  it('derives CONDITIONAL when NOC required but not yet received', async () => {
    fakePrisma.recruitmentImmigrationEligibility.upsert.mockImplementation(async (a: any) => ({
      ...a.create,
    }));
    const out = await immigrationEligibilityService.checkAndRecord(
      {
        caseId: 'c1',
        candidateId: 'cand-1',
        countryCode: 'AE',
        nationality: 'IN',
        banStatus: 'CLEAR',
        nocRequired: true,
        nocReceived: false,
      },
      auth
    );
    expect(out.eligibility).toBe('CONDITIONAL');
  });

  it('derives ELIGIBLE when banStatus CLEAR and NOC not required', async () => {
    fakePrisma.recruitmentImmigrationEligibility.upsert.mockImplementation(async (a: any) => ({
      ...a.create,
    }));
    const out = await immigrationEligibilityService.checkAndRecord(
      {
        caseId: 'c1',
        candidateId: 'cand-1',
        countryCode: 'AE',
        nationality: 'IN',
        banStatus: 'CLEAR',
      },
      auth
    );
    expect(out.eligibility).toBe('ELIGIBLE');
  });

  it('derives PENDING when banStatus UNKNOWN', async () => {
    fakePrisma.recruitmentImmigrationEligibility.upsert.mockImplementation(async (a: any) => ({
      ...a.create,
    }));
    const out = await immigrationEligibilityService.checkAndRecord(
      { caseId: 'c1', candidateId: 'cand-1', countryCode: 'AE', nationality: 'IN' },
      auth
    );
    expect(out.eligibility).toBe('PENDING');
  });
});

// ---------------------------------------------------------------------------
// S14 — consent + retention
// ---------------------------------------------------------------------------

describe('CandidateConsentService.dueForDisposal (S14)', () => {
  it('returns only consents past retention and not withdrawn', async () => {
    const longAgo = new Date(Date.now() - 400 * 86_400_000); // 400 days ago
    const recent = new Date(Date.now() - 30 * 86_400_000);
    fakePrisma.recruitmentCandidateConsent.findMany.mockResolvedValue([
      { id: 'a', consentedAt: longAgo, retentionDays: 365 }, // due
      { id: 'b', consentedAt: recent, retentionDays: 365 }, // not due
      { id: 'c', consentedAt: longAgo, retentionDays: 730 }, // not due — 2y retention
    ]);

    const due = await candidateConsentService.dueForDisposal('t1');
    expect(due.map((d) => d.id)).toEqual(['a']);
  });
});

// ---------------------------------------------------------------------------
// S16 — risk-band derivation
// ---------------------------------------------------------------------------

describe('RiskRegisterService.deriveBand + raise (S16)', () => {
  it('derives bands at L × I boundaries', () => {
    expect(RiskRegisterService.deriveBand(1, 2)).toBe('LOW'); // 2
    expect(RiskRegisterService.deriveBand(2, 2)).toBe('MEDIUM'); // 4
    expect(RiskRegisterService.deriveBand(3, 3)).toBe('HIGH'); // 9
    expect(RiskRegisterService.deriveBand(5, 4)).toBe('CRITICAL'); // 20
  });

  it('rejects out-of-range likelihood / impact', async () => {
    await expect(
      riskRegisterService.raise({ code: 'r1', description: 'x', likelihood: 0, impact: 3 }, auth)
    ).rejects.toThrow(/1\.\.5/);
    await expect(
      riskRegisterService.raise({ code: 'r1', description: 'x', likelihood: 3, impact: 9 }, auth)
    ).rejects.toThrow(/1\.\.5/);
  });

  it('stores the derived band on a raised risk', async () => {
    fakePrisma.recruitmentRisk.upsert.mockImplementation(async (a: any) => ({ ...a.create }));
    const r = await riskRegisterService.raise(
      { code: 'r1', description: 'x', likelihood: 4, impact: 4 },
      auth
    );
    expect(r.band).toBe('CRITICAL');
  });
});
