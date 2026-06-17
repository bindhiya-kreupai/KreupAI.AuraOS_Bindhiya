import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PROTECTION_CONFIG,
  computeProtectionWindow,
  buildAdverseActionVerdict,
} from '../retaliation-protection.service';

const RAISED = new Date('2026-04-01T00:00:00Z');

describe('computeProtectionWindow — EPIC-25 retaliation guard', () => {
  it('returns inactive when no grievance exists', () => {
    const w = computeProtectionWindow(null, DEFAULT_PROTECTION_CONFIG);
    expect(w.active).toBe(false);
  });

  it('returns active within the 90-day default window', () => {
    const w = computeProtectionWindow(
      {
        id: 'g1',
        caseNumber: 'C-1',
        raisedAt: RAISED,
        status: 'OPEN',
        isWhistleblower: false,
      },
      DEFAULT_PROTECTION_CONFIG,
      new Date('2026-05-15T00:00:00Z')
    );
    expect(w.active).toBe(true);
    expect(w.caseNumber).toBe('C-1');
    expect(w.expiresAt!.toISOString()).toBe(
      new Date(RAISED.getTime() + 90 * 24 * 3600 * 1000).toISOString()
    );
  });

  it('extends the window by 90 extra days for whistleblowers', () => {
    const w = computeProtectionWindow(
      {
        id: 'g2',
        caseNumber: 'C-2',
        raisedAt: RAISED,
        status: 'OPEN',
        isWhistleblower: true,
      },
      DEFAULT_PROTECTION_CONFIG,
      new Date('2026-08-15T00:00:00Z')
    );
    expect(w.active).toBe(true);
    expect(w.expiresAt!.toISOString()).toBe(
      new Date(RAISED.getTime() + 180 * 24 * 3600 * 1000).toISOString()
    );
  });

  it('returns inactive once the window expires', () => {
    const w = computeProtectionWindow(
      {
        id: 'g3',
        caseNumber: 'C-3',
        raisedAt: RAISED,
        status: 'RESOLVED',
        isWhistleblower: false,
      },
      DEFAULT_PROTECTION_CONFIG,
      new Date('2026-09-01T00:00:00Z') // > 90 days after raisedAt
    );
    expect(w.active).toBe(false);
    expect(w.caseId).toBe('g3'); // we still expose which case last ran
  });
});

describe('buildAdverseActionVerdict', () => {
  it('passes through when employee is NOT under protection', () => {
    const v = buildAdverseActionVerdict(
      { active: false },
      'DISCIPLINARY_ACTION',
      DEFAULT_PROTECTION_CONFIG
    );
    expect(v.underProtection).toBe(false);
    expect(v.requiresJustification).toBe(false);
    expect(v.requiresHrDirectorSignOff).toBe(false);
  });

  it('requires justification + HR Director sign-off when under regular protection', () => {
    const v = buildAdverseActionVerdict(
      {
        active: true,
        caseId: 'g',
        caseNumber: 'C',
        raisedAt: RAISED,
        expiresAt: new Date('2026-07-01'),
        isWhistleblower: false,
      },
      'TERMINATION',
      DEFAULT_PROTECTION_CONFIG
    );
    expect(v.underProtection).toBe(true);
    expect(v.requiresJustification).toBe(true);
    expect(v.requiresHrDirectorSignOff).toBe(true);
    expect(v.reasonAr.length).toBeGreaterThan(0);
  });

  it('flags whistleblower protection in the reason text', () => {
    const v = buildAdverseActionVerdict(
      {
        active: true,
        caseId: 'g',
        caseNumber: 'C',
        raisedAt: RAISED,
        expiresAt: new Date('2026-09-01'),
        isWhistleblower: true,
      },
      'DEMOTION',
      DEFAULT_PROTECTION_CONFIG
    );
    expect(v.underProtection).toBe(true);
    expect(v.reason).toMatch(/[Ww]histleblower/);
  });

  it('respects the exemptActions list (returns pass-through)', () => {
    const config = {
      ...DEFAULT_PROTECTION_CONFIG,
      exemptActions: ['NEGATIVE_PERFORMANCE_REVIEW' as const],
    };
    const v = buildAdverseActionVerdict(
      {
        active: true,
        caseId: 'g',
        caseNumber: 'C',
        raisedAt: RAISED,
        expiresAt: new Date('2026-07-01'),
      },
      'NEGATIVE_PERFORMANCE_REVIEW',
      config
    );
    expect(v.underProtection).toBe(false);
  });

  it('bilingual reason is present on every verdict', () => {
    const v = buildAdverseActionVerdict(
      { active: false },
      'DISCIPLINARY_ACTION',
      DEFAULT_PROTECTION_CONFIG
    );
    expect(v.reason.length).toBeGreaterThan(0);
    expect(v.reasonAr.length).toBeGreaterThan(0);
    expect(v.reason).not.toBe(v.reasonAr);
  });
});
