import { describe, it, expect } from 'vitest';
import {
  evaluateContractorAccommodationParity,
  evaluateWaterQualityCadence,
  reduceWelfareGrievanceTrail,
  type AccommodationProfile,
  type WaterQualityTest,
} from '../welfare-ops.service';

const SUBMITTED_AT = new Date('2026-06-10T00:00:00Z');
const REVIEWED_AT = new Date('2026-06-12T00:00:00Z');
const NOW = new Date('2026-06-17T00:00:00Z');

describe('EPIC-23 welfare grievance maker-checker — reduceWelfareGrievanceTrail', () => {
  it('returns null on empty trail', () => {
    expect(reduceWelfareGrievanceTrail([])).toBeNull();
  });

  it('reduces SUBMITTED state from proposal row', () => {
    const r = reduceWelfareGrievanceTrail([
      {
        timestamp: SUBMITTED_AT,
        metadata: {
          grievanceId: 'g1',
          status: 'SUBMITTED',
          submittedBy: 'u-worker',
          submittedAt: SUBMITTED_AT.toISOString(),
          details: 'Sewage backup not fixed for 3 days',
          category: 'HYGIENE',
        },
      },
    ])!;
    expect(r.status).toBe('SUBMITTED');
    expect(r.submittedBy).toBe('u-worker');
    expect(r.category).toBe('HYGIENE');
  });

  it('reduces APPROVED trail', () => {
    const r = reduceWelfareGrievanceTrail([
      {
        timestamp: REVIEWED_AT,
        metadata: {
          grievanceId: 'g1',
          status: 'APPROVED',
          reviewedBy: 'u-warden',
          reviewedAt: REVIEWED_AT.toISOString(),
        },
      },
      {
        timestamp: SUBMITTED_AT,
        metadata: {
          grievanceId: 'g1',
          status: 'SUBMITTED',
          submittedBy: 'u-worker',
          submittedAt: SUBMITTED_AT.toISOString(),
          details: 'Sewage backup',
          category: 'HYGIENE',
        },
      },
    ])!;
    expect(r.status).toBe('APPROVED');
    expect(r.reviewedBy).toBe('u-warden');
    expect(r.submittedBy).toBe('u-worker');
  });

  it('reduces REJECTED trail with reason', () => {
    const r = reduceWelfareGrievanceTrail([
      {
        timestamp: REVIEWED_AT,
        metadata: {
          grievanceId: 'g1',
          status: 'REJECTED',
          reviewedBy: 'u-warden',
          reviewedAt: REVIEWED_AT.toISOString(),
          reason: 'Already fixed',
        },
      },
      {
        timestamp: SUBMITTED_AT,
        metadata: {
          grievanceId: 'g1',
          status: 'SUBMITTED',
          submittedBy: 'u-worker',
          submittedAt: SUBMITTED_AT.toISOString(),
          details: 'old',
          category: 'HYGIENE',
        },
      },
    ])!;
    expect(r.status).toBe('REJECTED');
    expect(r.rejectionReason).toBe('Already fixed');
  });
});

describe('EPIC-23 water-quality cadence — evaluateWaterQualityCadence', () => {
  it('flags NEVER_TESTED for every parameter on empty input', () => {
    const r = evaluateWaterQualityCadence({ tests: [], asOf: NOW });
    expect(r.failures.length).toBe(5);
    expect(r.failures.every((f) => f.code === 'NEVER_TESTED')).toBe(true);
    expect(r.totals.coveragePct).toBe(0);
  });

  it('flags OVERDUE when last test is older than cadence', () => {
    const tests: WaterQualityTest[] = [
      {
        parameter: 'RESIDUAL_CHLORINE',
        testedAt: new Date('2026-05-01'),
        certifiedLab: false,
        passed: true,
      },
    ];
    const r = evaluateWaterQualityCadence({ tests, asOf: NOW });
    const f = r.failures.find((x) => x.parameter === 'RESIDUAL_CHLORINE')!;
    expect(f.code).toBe('OVERDUE');
  });

  it('flags NOT_CERTIFIED when lab cert required but missing', () => {
    const tests: WaterQualityTest[] = [
      {
        parameter: 'MICROBIOLOGICAL',
        testedAt: new Date('2026-06-15'),
        certifiedLab: false,
        passed: true,
      },
    ];
    const r = evaluateWaterQualityCadence({ tests, asOf: NOW });
    const f = r.failures.find((x) => x.parameter === 'MICROBIOLOGICAL')!;
    expect(f.code).toBe('NOT_CERTIFIED');
  });

  it('flags LAST_TEST_FAILED', () => {
    const tests: WaterQualityTest[] = [
      {
        parameter: 'MICROBIOLOGICAL',
        testedAt: new Date('2026-06-15'),
        certifiedLab: true,
        passed: false,
      },
    ];
    const r = evaluateWaterQualityCadence({ tests, asOf: NOW });
    const f = r.failures.find((x) => x.parameter === 'MICROBIOLOGICAL')!;
    expect(f.code).toBe('LAST_TEST_FAILED');
    expect(r.totals.failed).toBe(1);
  });

  it('passes when all parameters are recent, certified, and pass', () => {
    const recent = new Date('2026-06-16');
    const tests: WaterQualityTest[] = [
      { parameter: 'MICROBIOLOGICAL', testedAt: recent, certifiedLab: true, passed: true },
      { parameter: 'TDS', testedAt: recent, certifiedLab: false, passed: true },
      { parameter: 'RESIDUAL_CHLORINE', testedAt: recent, certifiedLab: false, passed: true },
      { parameter: 'PH', testedAt: recent, certifiedLab: false, passed: true },
      { parameter: 'HEAVY_METALS', testedAt: recent, certifiedLab: true, passed: true },
    ];
    const r = evaluateWaterQualityCadence({ tests, asOf: NOW });
    expect(r.failures.length).toBe(0);
    expect(r.totals.coveragePct).toBe(100);
  });

  it('respects caller cadence override', () => {
    const tests: WaterQualityTest[] = [
      {
        parameter: 'TDS',
        testedAt: new Date('2026-01-01'),
        certifiedLab: false,
        passed: true,
      },
    ];
    const r = evaluateWaterQualityCadence({
      tests,
      cadence: { TDS: 365 },
      asOf: NOW,
    });
    expect(r.failures.find((f) => f.parameter === 'TDS')?.code).not.toBe('OVERDUE');
  });
});

describe('EPIC-23 contractor accommodation parity — evaluateContractorAccommodationParity', () => {
  const principal: AccommodationProfile = {
    label: 'PRINCIPAL',
    occupants: 10,
    floorAreaM2: 100,
    hygieneScore: 80,
    fireScore: 90,
    acProvided: true,
    messProvided: true,
  };

  it('passes when contractor matches principal', () => {
    const r = evaluateContractorAccommodationParity({
      principal,
      contractors: [{ ...principal, label: 'CTR_A' }],
    });
    expect(r.gaps.length).toBe(0);
    expect(r.totals.parityPct).toBe(100);
  });

  it('flags SPACE_PER_PERSON when contractor is below tolerance', () => {
    const r = evaluateContractorAccommodationParity({
      principal,
      contractors: [{ ...principal, label: 'CTR_A', occupants: 20 }], // 5m²/person vs 10
    });
    expect(r.gaps.some((g) => g.code === 'SPACE_PER_PERSON')).toBe(true);
  });

  it('flags HYGIENE_GAP', () => {
    const r = evaluateContractorAccommodationParity({
      principal,
      contractors: [{ ...principal, label: 'CTR_A', hygieneScore: 50 }],
    });
    expect(r.gaps.some((g) => g.code === 'HYGIENE_GAP')).toBe(true);
  });

  it('flags FIRE_GAP with CRITICAL severity', () => {
    const r = evaluateContractorAccommodationParity({
      principal,
      contractors: [{ ...principal, label: 'CTR_A', fireScore: 60 }],
    });
    const gap = r.gaps.find((g) => g.code === 'FIRE_GAP')!;
    expect(gap.severity).toBe('CRITICAL');
  });

  it('flags NO_AC and NO_MESS when principal has them but contractor does not', () => {
    const r = evaluateContractorAccommodationParity({
      principal,
      contractors: [{ ...principal, label: 'CTR_A', acProvided: false, messProvided: false }],
    });
    expect(r.gaps.some((g) => g.code === 'NO_AC')).toBe(true);
    expect(r.gaps.some((g) => g.code === 'NO_MESS')).toBe(true);
  });

  it('counts distinct contractors with gaps in parityPct', () => {
    const r = evaluateContractorAccommodationParity({
      principal,
      contractors: [
        { ...principal, label: 'CTR_A', hygieneScore: 50 }, // gap
        { ...principal, label: 'CTR_B' }, // no gap
      ],
    });
    expect(r.totals.contractorsWithGaps).toBe(1);
    expect(r.totals.parityPct).toBe(50);
  });

  it('respects tolerance fraction', () => {
    // 10% tolerance default — contractor 75 hygiene vs 80 principal: 75 < 80*0.9=72 ? no, 75>=72 → no gap
    const r = evaluateContractorAccommodationParity({
      principal,
      contractors: [{ ...principal, label: 'CTR_A', hygieneScore: 75 }],
    });
    expect(r.gaps.some((g) => g.code === 'HYGIENE_GAP')).toBe(false);
  });
});
