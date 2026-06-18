import { describe, it, expect } from 'vitest';
import {
  detectShortlistBias,
  checkEqualPay,
  evaluateNationalizationGate,
  type ShortlistCandidate,
  type PeerSnapshot,
  type PayBand,
} from '../hiring-compliance.service';

describe('EPIC-22-S-BIAS — detectShortlistBias', () => {
  const balancedPool: ShortlistCandidate[] = [
    { candidateId: 'c1', attributes: { gender: 'male', nationality: 'AE' } },
    { candidateId: 'c2', attributes: { gender: 'female', nationality: 'AE' } },
    { candidateId: 'c3', attributes: { gender: 'male', nationality: 'IN' } },
    { candidateId: 'c4', attributes: { gender: 'female', nationality: 'IN' } },
  ];

  it('returns PASS with bilingual summary when shortlist mirrors pool', () => {
    const v = detectShortlistBias({ applicantPool: balancedPool, shortlist: balancedPool });
    expect(v.outcome).toBe('PASS');
    expect(v.flags).toHaveLength(0);
    expect(v.summary.en.length).toBeGreaterThan(0);
    expect(v.summary.ar.length).toBeGreaterThan(0);
  });

  it('flags WARN when one dimension skews beyond tolerance', () => {
    // Pool varies only on gender — shortlist all-male skews gender alone.
    const genderOnlyPool: ShortlistCandidate[] = [
      { candidateId: 'c1', attributes: { gender: 'male' } },
      { candidateId: 'c2', attributes: { gender: 'female' } },
      { candidateId: 'c3', attributes: { gender: 'male' } },
      { candidateId: 'c4', attributes: { gender: 'female' } },
    ];
    const skewed: ShortlistCandidate[] = [
      { candidateId: 'c1', attributes: { gender: 'male' } },
      { candidateId: 'c3', attributes: { gender: 'male' } },
    ];
    const v = detectShortlistBias({ applicantPool: genderOnlyPool, shortlist: skewed });
    expect(v.outcome).toBe('WARN');
    expect(v.flags.some((f) => f.dimension === 'gender')).toBe(true);
  });

  it('FAIL when 3+ category flags fire', () => {
    const ageHeavyPool: ShortlistCandidate[] = [
      { candidateId: 'c1', attributes: { gender: 'male', nationality: 'AE', ageBand: '20-29' } },
      { candidateId: 'c2', attributes: { gender: 'female', nationality: 'IN', ageBand: '30-39' } },
      { candidateId: 'c3', attributes: { gender: 'male', nationality: 'PK', ageBand: '40-49' } },
      { candidateId: 'c4', attributes: { gender: 'female', nationality: 'EG', ageBand: '50+' } },
    ];
    const skewed: ShortlistCandidate[] = [
      { candidateId: 'c1', attributes: { gender: 'male', nationality: 'AE', ageBand: '20-29' } },
    ];
    const v = detectShortlistBias({ applicantPool: ageHeavyPool, shortlist: skewed });
    expect(v.outcome).toBe('FAIL');
    expect(v.flags.length).toBeGreaterThanOrEqual(3);
  });

  it('respects custom toleranceAbs', () => {
    const genderOnlyPool: ShortlistCandidate[] = [
      { candidateId: 'c1', attributes: { gender: 'male' } },
      { candidateId: 'c2', attributes: { gender: 'female' } },
    ];
    const skewed: ShortlistCandidate[] = [{ candidateId: 'c1', attributes: { gender: 'male' } }];
    const v = detectShortlistBias({
      applicantPool: genderOnlyPool,
      shortlist: skewed,
      toleranceAbs: 0.9,
    });
    expect(v.outcome).toBe('PASS');
  });
});

describe('EPIC-22-S-PAY — checkEqualPay', () => {
  const band: PayBand = { grade: 'G5', min: 8000, mid: 10000, max: 12000, currency: 'AED' };
  const peers: PeerSnapshot[] = [
    { employeeId: 'e1', grade: 'G5', salary: 10000, gender: 'male' },
    { employeeId: 'e2', grade: 'G5', salary: 10500, gender: 'male' },
    { employeeId: 'e3', grade: 'G5', salary: 9500, gender: 'female' },
    { employeeId: 'e4', grade: 'G5', salary: 9800, gender: 'female' },
  ];

  it('PASS when offer is mid-band and matches peer median', () => {
    const v = checkEqualPay({
      offerCandidate: { gender: 'female' },
      offerSalary: 9700,
      band,
      peers,
    });
    expect(v.outcome).toBe('PASS');
    expect(v.compaRatio).toBeCloseTo(0.97, 2);
  });

  it('FAIL when offer below band minimum', () => {
    const v = checkEqualPay({
      offerCandidate: { gender: 'female' },
      offerSalary: 7000,
      band,
      peers,
    });
    expect(v.outcome).toBe('FAIL');
    expect(v.bandPosition).toBe('BELOW_MIN');
    expect(v.reasons.some((r) => r.code === 'OFFER_BELOW_BAND_MIN')).toBe(true);
  });

  it('WARN when offer above band max with no peer-group gap', () => {
    // Single-group peers so no comparator across gender → only the
    // "above max" warning fires.
    const v = checkEqualPay({
      offerCandidate: { gender: 'male' },
      offerSalary: 13000,
      band,
      peers: [
        { employeeId: 'e1', grade: 'G5', salary: 12500, gender: 'male' },
        { employeeId: 'e2', grade: 'G5', salary: 13200, gender: 'male' },
      ],
    });
    expect(v.outcome).toBe('WARN');
    expect(v.bandPosition).toBe('ABOVE_MAX');
  });

  it('FAIL when 20%+ gap vs peer median of other group', () => {
    const v = checkEqualPay({
      offerCandidate: { gender: 'female' },
      offerSalary: 7800,
      band,
      peers,
    });
    expect(v.outcome).toBe('FAIL');
    expect(v.reasons.some((r) => r.code === 'EQUAL_PAY_GAP_MATERIAL')).toBe(true);
  });

  it('bilingual reason text is populated', () => {
    const v = checkEqualPay({
      offerCandidate: { gender: 'female' },
      offerSalary: 9700,
      band,
      peers,
    });
    for (const r of v.reasons) {
      expect(r.en.length).toBeGreaterThan(0);
      expect(r.ar.length).toBeGreaterThan(0);
    }
  });
});

describe('EPIC-22-S-NAT — evaluateNationalizationGate', () => {
  it('PASS when candidate is national (always strengthens ratio)', () => {
    const v = evaluateNationalizationGate({
      currentNationals: 10,
      currentTotal: 100,
      requiredRatio: 0.2,
      candidateIsNational: true,
    });
    expect(v.outcome).toBe('PASS');
    expect(v.reason.code).toBe('NAT_HIRE_INCREASES_RATIO');
  });

  it('FAIL when non-national hire breaches floor', () => {
    const v = evaluateNationalizationGate({
      currentNationals: 20,
      currentTotal: 100,
      requiredRatio: 0.2,
      candidateIsNational: false,
    });
    expect(v.outcome).toBe('FAIL');
    expect(v.reason.code).toBe('NAT_HIRE_BREACHES_FLOOR');
  });

  it('PASS when non-national hire keeps ratio comfortably above floor', () => {
    const v = evaluateNationalizationGate({
      currentNationals: 50,
      currentTotal: 100,
      requiredRatio: 0.2,
      candidateIsNational: false,
    });
    expect(v.outcome).toBe('PASS');
  });

  it('WARN when projected ratio is within grace but below required', () => {
    const v = evaluateNationalizationGate({
      currentNationals: 21,
      currentTotal: 100,
      requiredRatio: 0.22,
      candidateIsNational: false,
      graceBufferPct: 0.05,
    });
    expect(v.outcome).toBe('WARN');
    expect(v.reason.code).toBe('NAT_HIRE_NEAR_FLOOR');
  });

  it('bilingual reasons populated', () => {
    const v = evaluateNationalizationGate({
      currentNationals: 20,
      currentTotal: 100,
      requiredRatio: 0.2,
      candidateIsNational: false,
    });
    expect(v.reason.en.length).toBeGreaterThan(0);
    expect(v.reason.ar.length).toBeGreaterThan(0);
  });
});
