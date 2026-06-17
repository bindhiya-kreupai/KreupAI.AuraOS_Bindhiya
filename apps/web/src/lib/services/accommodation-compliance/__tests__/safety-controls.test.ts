import { describe, it, expect } from 'vitest';
import {
  evaluateHygiene,
  evaluateFireSafety,
  evaluateFoodSafety,
} from '../safety-controls.service';

describe('evaluateHygiene — EPIC-23 S05', () => {
  it('returns EXCELLENT for a clean unit at full ratios', () => {
    const v = evaluateHygiene({
      occupants: 8,
      toiletFixtures: 2,
      showerFixtures: 2,
      cleanlinessScore: 5,
      pestEvidence: false,
      beddingPoor: false,
    });
    expect(v.pass).toBe(true);
    expect(v.score).toBe(100);
    expect(v.band).toBe('EXCELLENT');
  });

  it('fails CRITICAL on pest evidence', () => {
    const v = evaluateHygiene({
      occupants: 4,
      toiletFixtures: 2,
      showerFixtures: 2,
      cleanlinessScore: 4,
      pestEvidence: true,
      beddingPoor: false,
    });
    expect(v.pass).toBe(false);
    expect(v.failures.some((f) => f.severity === 'CRITICAL')).toBe(true);
  });

  it('flags TOILET_FIXTURE_RATIO when occupants exceed 1:8', () => {
    const v = evaluateHygiene({
      occupants: 20,
      toiletFixtures: 2, // 10:1 ratio
      showerFixtures: 4,
      cleanlinessScore: 4,
      pestEvidence: false,
      beddingPoor: false,
    });
    expect(v.failures.some((f) => f.code === 'TOILET_FIXTURE_RATIO')).toBe(true);
  });

  it('flags CLEANLINESS_BELOW_3 for low scores', () => {
    const v = evaluateHygiene({
      occupants: 4,
      toiletFixtures: 2,
      showerFixtures: 2,
      cleanlinessScore: 1,
      pestEvidence: false,
      beddingPoor: false,
    });
    expect(v.failures.some((f) => f.code === 'CLEANLINESS_BELOW_3')).toBe(true);
    expect(v.pass).toBe(false); // CRITICAL severity
  });
});

describe('evaluateFireSafety — EPIC-23 S08', () => {
  it('returns EXCELLENT when every control is green', () => {
    const v = evaluateFireSafety({
      smokeDetectorsWorking: true,
      fireExtinguisherWithinDate: true,
      emergencyExitsClear: true,
      fireDrillLast6Months: true,
      fireAlarmTestedMonthly: true,
      exitBlocked: false,
    });
    expect(v.score).toBe(100);
    expect(v.band).toBe('EXCELLENT');
  });

  it('fails CRITICAL on broken smoke detectors', () => {
    const v = evaluateFireSafety({
      smokeDetectorsWorking: false,
      fireExtinguisherWithinDate: true,
      emergencyExitsClear: true,
      fireDrillLast6Months: true,
      fireAlarmTestedMonthly: true,
      exitBlocked: false,
    });
    expect(v.pass).toBe(false);
    expect(v.failures[0].code).toBe('SMOKE_DETECTORS');
  });

  it('flags EXIT_BLOCKED with CRITICAL severity', () => {
    const v = evaluateFireSafety({
      smokeDetectorsWorking: true,
      fireExtinguisherWithinDate: true,
      emergencyExitsClear: true,
      fireDrillLast6Months: true,
      fireAlarmTestedMonthly: true,
      exitBlocked: true,
    });
    expect(v.pass).toBe(false);
    expect(v.failures.find((f) => f.code === 'EXIT_BLOCKED')?.severity).toBe('CRITICAL');
  });
});

describe('evaluateFoodSafety — EPIC-23 S07', () => {
  it('returns EXCELLENT for a fully compliant kitchen', () => {
    const v = evaluateFoodSafety({
      coldStorageTempOk: true,
      hotHoldingTempOk: true,
      handlersHealthCardsValid: true,
      pestControlQuarterly: true,
      pestEvidenceInPrep: false,
      sanitationScore: 5,
    });
    expect(v.score).toBe(100);
    expect(v.band).toBe('EXCELLENT');
  });

  it('CRITICALly fails on cold-storage temp breach', () => {
    const v = evaluateFoodSafety({
      coldStorageTempOk: false,
      hotHoldingTempOk: true,
      handlersHealthCardsValid: true,
      pestControlQuarterly: true,
      pestEvidenceInPrep: false,
      sanitationScore: 4,
    });
    expect(v.pass).toBe(false);
    expect(v.failures.find((f) => f.code === 'COLD_STORAGE_TEMP')?.severity).toBe('CRITICAL');
  });

  it('CRITICALly fails on pest in prep area', () => {
    const v = evaluateFoodSafety({
      coldStorageTempOk: true,
      hotHoldingTempOk: true,
      handlersHealthCardsValid: true,
      pestControlQuarterly: true,
      pestEvidenceInPrep: true,
      sanitationScore: 4,
    });
    expect(v.pass).toBe(false);
    expect(v.failures.find((f) => f.code === 'PEST_IN_PREP_AREA')).toBeTruthy();
  });

  it('flags HEALTH_CARD_EXPIRED + PEST_CONTROL_OVERDUE at HIGH severity', () => {
    const v = evaluateFoodSafety({
      coldStorageTempOk: true,
      hotHoldingTempOk: true,
      handlersHealthCardsValid: false,
      pestControlQuarterly: false,
      pestEvidenceInPrep: false,
      sanitationScore: 4,
    });
    expect(v.failures.find((f) => f.code === 'HEALTH_CARD_EXPIRED')?.severity).toBe('HIGH');
    expect(v.failures.find((f) => f.code === 'PEST_CONTROL_OVERDUE')?.severity).toBe('HIGH');
    expect(v.pass).toBe(true); // no CRITICAL → pass even with HIGH failures
  });
});
