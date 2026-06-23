import { describe, it, expect } from 'vitest';
import { evaluateTransition, isTransitionAllowed, type CaseSnapshot } from '../stage-gate.service';

function snap(overrides: Partial<CaseSnapshot> = {}): CaseSnapshot {
  return {
    caseId: 'C1',
    candidateId: 'X1',
    currentStage: 'APPLIED',
    countryCode: 'AE',
    ...overrides,
  };
}

describe('isTransitionAllowed — EPIC-04 state machine', () => {
  it('APPLIED → SCREENED is allowed', () => {
    expect(isTransitionAllowed('APPLIED', 'SCREENED')).toBe(true);
  });
  it('APPLIED → BGV is NOT allowed (skip-stage)', () => {
    expect(isTransitionAllowed('APPLIED', 'BGV')).toBe(false);
  });
  it('JOINING is terminal', () => {
    expect(isTransitionAllowed('JOINING', 'OFFER')).toBe(false);
  });
});

describe('evaluateTransition — gate checks', () => {
  it('refuses skip-stage transition', () => {
    const v = evaluateTransition(snap({ currentStage: 'APPLIED' }), 'BGV');
    expect(v.allow).toBe(false);
    expect(v.failures[0].code).toBe('TRANSITION_NOT_ALLOWED');
  });

  it('allows REJECTED without gate checks', () => {
    const v = evaluateTransition(snap({ currentStage: 'BGV' }), 'REJECTED');
    expect(v.allow).toBe(true);
  });

  it('refuses SCREENED → INTERVIEWED when screening score below pass mark', () => {
    const v = evaluateTransition(
      snap({ currentStage: 'SCREENED', screeningScore: 40, screeningPassMark: 60 }),
      'INTERVIEWED'
    );
    expect(v.allow).toBe(false);
    expect(v.failures.find((f) => f.code === 'SCREENING_NOT_PASSED')).toBeTruthy();
  });

  it('allows SCREENED → INTERVIEWED with sufficient score', () => {
    const v = evaluateTransition(
      snap({ currentStage: 'SCREENED', screeningScore: 80, screeningPassMark: 60 }),
      'INTERVIEWED'
    );
    expect(v.allow).toBe(true);
  });

  it('refuses on BIAS_REVIEW_FAILED for forward step', () => {
    const v = evaluateTransition(
      snap({
        currentStage: 'SCREENED',
        screeningScore: 80,
        screeningPassMark: 60,
        biasReviewPassed: false,
      }),
      'INTERVIEWED'
    );
    expect(v.allow).toBe(false);
    expect(v.failures.find((f) => f.code === 'BIAS_REVIEW_FAILED')).toBeTruthy();
  });

  it('refuses INTERVIEWED → BGV when rounds incomplete', () => {
    const v = evaluateTransition(
      snap({
        currentStage: 'INTERVIEWED',
        interviewRoundsCompleted: 1,
        interviewRequiredRounds: 3,
      }),
      'BGV'
    );
    expect(v.allow).toBe(false);
    expect(v.failures.find((f) => f.code === 'INTERVIEW_INCOMPLETE')).toBeTruthy();
  });

  it('refuses BGV → OFFER when BGV not PASSED', () => {
    const v = evaluateTransition(snap({ currentStage: 'BGV', bgvStatus: 'IN_PROGRESS' }), 'OFFER');
    expect(v.allow).toBe(false);
    expect(v.failures.find((f) => f.code === 'BGV_NOT_PASSED')).toBeTruthy();
  });

  it('allows BGV → OFFER when BGV is WAIVED', () => {
    const v = evaluateTransition(
      snap({ currentStage: 'BGV', bgvStatus: 'WAIVED', immigrationEligible: true }),
      'OFFER'
    );
    expect(v.allow).toBe(true);
  });

  it('refuses BGV → OFFER when immigration ineligible', () => {
    const v = evaluateTransition(
      snap({ currentStage: 'BGV', bgvStatus: 'PASSED', immigrationEligible: false }),
      'OFFER'
    );
    expect(v.allow).toBe(false);
    expect(v.failures.find((f) => f.code === 'IMMIGRATION_NOT_ELIGIBLE')).toBeTruthy();
  });

  it('emits bilingual failure descriptions', () => {
    const v = evaluateTransition(snap({ currentStage: 'BGV', bgvStatus: 'IN_PROGRESS' }), 'OFFER');
    expect(v.failures[0].descriptionAr.length).toBeGreaterThan(0);
    expect(v.failures[0].description).not.toBe(v.failures[0].descriptionAr);
  });
});
