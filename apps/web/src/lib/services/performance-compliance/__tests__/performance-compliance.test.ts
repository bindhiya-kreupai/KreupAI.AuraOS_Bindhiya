import { describe, it, expect } from 'vitest';
import {
  detectForcedDistribution,
  checkCalibrationEvidence,
  resolveRating,
  DEFAULT_RATING_DICTIONARY,
} from '../performance-compliance.service';

describe('EPIC-25-S-DIST — detectForcedDistribution', () => {
  const target = [
    { rating: 'EXCEEDS', expectedShare: 0.2 },
    { rating: 'MEETS', expectedShare: 0.6 },
    { rating: 'BELOW', expectedShare: 0.2 },
  ];

  it('PASS when observed sits inside tolerance bands', () => {
    const v = detectForcedDistribution({
      observed: [
        { rating: 'EXCEEDS', count: 20 },
        { rating: 'MEETS', count: 60 },
        { rating: 'BELOW', count: 20 },
      ],
      target,
    });
    expect(v.outcome).toBe('PASS');
    expect(v.deviations).toHaveLength(0);
  });

  it('WARN on moderate single-band drift', () => {
    const v = detectForcedDistribution({
      observed: [
        { rating: 'EXCEEDS', count: 30 },
        { rating: 'MEETS', count: 60 },
        { rating: 'BELOW', count: 10 },
      ],
      target,
    });
    expect(v.outcome).toBe('WARN');
    expect(v.deviations.length).toBeGreaterThan(0);
  });

  it('FAIL on material >15% band breach', () => {
    const v = detectForcedDistribution({
      observed: [
        { rating: 'EXCEEDS', count: 60 },
        { rating: 'MEETS', count: 40 },
        { rating: 'BELOW', count: 0 },
      ],
      target,
    });
    expect(v.outcome).toBe('FAIL');
  });

  it('flags manager-level outliers', () => {
    const v = detectForcedDistribution({
      observed: [
        { rating: 'EXCEEDS', count: 20 },
        { rating: 'MEETS', count: 60 },
        { rating: 'BELOW', count: 20 },
      ],
      target,
      perManager: [
        {
          managerId: 'm1',
          distribution: [
            { rating: 'EXCEEDS', count: 9 },
            { rating: 'MEETS', count: 1 },
            { rating: 'BELOW', count: 0 },
          ],
        },
      ],
    });
    expect(v.managerOutliers.some((o) => o.managerId === 'm1')).toBe(true);
  });

  it('summary is bilingual', () => {
    const v = detectForcedDistribution({
      observed: [{ rating: 'MEETS', count: 100 }],
      target: [{ rating: 'MEETS', expectedShare: 1.0 }],
    });
    expect(v.summary.en.length).toBeGreaterThan(0);
    expect(v.summary.ar.length).toBeGreaterThan(0);
  });
});

describe('EPIC-25-S-CALIB — checkCalibrationEvidence', () => {
  const cycleStart = new Date('2026-04-01');
  const cycleEnd = new Date('2026-06-30');

  it('FAIL when no evidence and close is imminent', () => {
    const v = checkCalibrationEvidence({
      cycleStartDate: cycleStart,
      cycleEndDate: cycleEnd,
      requiredByDays: 30,
      asOf: new Date('2026-06-20'),
    });
    expect(v.outcome).toBe('FAIL');
    expect(v.reasons[0].code).toBe('CALIB_NO_EVIDENCE');
  });

  it('WARN when no evidence yet but cycle still has time', () => {
    const v = checkCalibrationEvidence({
      cycleStartDate: cycleStart,
      cycleEndDate: cycleEnd,
      requiredByDays: 7,
      asOf: new Date('2026-04-10'),
    });
    expect(v.outcome).toBe('WARN');
  });

  it('FAIL when evidence missing minute reference', () => {
    const v = checkCalibrationEvidence({
      cycleStartDate: cycleStart,
      cycleEndDate: cycleEnd,
      requiredByDays: 30,
      evidence: {
        cycleId: 'PY26-Q2',
        meetingAt: new Date('2026-05-15'),
        attendees: [
          { userId: 'u1', role: 'HR_OBSERVER' },
          { userId: 'u2', role: 'PANEL' },
          { userId: 'u3', role: 'PANEL' },
        ],
        distributionReviewed: true,
      },
      asOf: new Date('2026-06-01'),
    });
    expect(v.outcome).toBe('FAIL');
    expect(v.reasons.some((r) => r.code === 'CALIB_NO_MINUTE')).toBe(true);
  });

  it('PASS when full evidence within cycle', () => {
    const v = checkCalibrationEvidence({
      cycleStartDate: cycleStart,
      cycleEndDate: cycleEnd,
      requiredByDays: 30,
      evidence: {
        cycleId: 'PY26-Q2',
        meetingAt: new Date('2026-05-15'),
        minuteRef: 'DOC-9001',
        attendees: [
          { userId: 'u1', role: 'HR_OBSERVER' },
          { userId: 'u2', role: 'PANEL' },
          { userId: 'u3', role: 'PANEL' },
        ],
        distributionReviewed: true,
      },
      asOf: new Date('2026-06-01'),
    });
    expect(v.outcome).toBe('PASS');
    expect(v.reasons[0].code).toBe('CALIB_EVIDENCE_OK');
  });

  it('flags meeting outside cycle window', () => {
    const v = checkCalibrationEvidence({
      cycleStartDate: cycleStart,
      cycleEndDate: cycleEnd,
      requiredByDays: 30,
      evidence: {
        cycleId: 'PY26-Q2',
        meetingAt: new Date('2026-01-01'),
        minuteRef: 'DOC-9001',
        attendees: [
          { userId: 'u1', role: 'HR_OBSERVER' },
          { userId: 'u2', role: 'PANEL' },
          { userId: 'u3', role: 'PANEL' },
        ],
        distributionReviewed: true,
      },
      asOf: new Date('2026-06-01'),
    });
    expect(v.reasons.some((r) => r.code === 'CALIB_OUT_OF_WINDOW')).toBe(true);
  });
});

describe('EPIC-25-S-RATING — resolveRating', () => {
  it('returns bilingual definition for known code', () => {
    const r = resolveRating('EXCEEDS');
    expect(r).not.toBeNull();
    expect(r!.label.en).toBe('Exceeds');
    expect(r!.label.ar).toBe('يفوق');
    expect(r!.meritEligible).toBe(true);
  });

  it('returns null for unknown code', () => {
    expect(resolveRating('UNKNOWN_XYZ')).toBeNull();
  });

  it('every default entry has en + ar populated', () => {
    for (const r of DEFAULT_RATING_DICTIONARY) {
      expect(r.label.en.length).toBeGreaterThan(0);
      expect(r.label.ar.length).toBeGreaterThan(0);
      expect(r.description.en.length).toBeGreaterThan(0);
      expect(r.description.ar.length).toBeGreaterThan(0);
    }
  });

  it('ordinals are unique and monotonic', () => {
    const ordinals = DEFAULT_RATING_DICTIONARY.map((r) => r.ordinal);
    expect(new Set(ordinals).size).toBe(ordinals.length);
  });
});
