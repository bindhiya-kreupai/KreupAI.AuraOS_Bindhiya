import { describe, it, expect } from 'vitest';
import {
  DEFAULT_APPROVAL_MATRIX,
  matchApprovalRule,
  buildApproverChain,
  advanceLevel,
  type ApprovalMatrixRule,
} from '../approval-matrix.service';

describe('matchApprovalRule — EPIC-20 matrix selection', () => {
  it('SICK always picks the SICK_ANY rule', () => {
    const r = matchApprovalRule(DEFAULT_APPROVAL_MATRIX, {
      leaveType: 'SICK',
      totalDays: 1,
    });
    expect(r.id).toBe('SICK_ANY');
  });

  it('ANNUAL <= 7 days picks ANNUAL_LE_7 (1 level)', () => {
    const r = matchApprovalRule(DEFAULT_APPROVAL_MATRIX, {
      leaveType: 'ANNUAL',
      totalDays: 5,
    });
    expect(r.id).toBe('ANNUAL_LE_7');
    expect(r.levels).toHaveLength(1);
  });

  it('ANNUAL 8-15 days picks ANNUAL_8_15 (2 levels)', () => {
    const r = matchApprovalRule(DEFAULT_APPROVAL_MATRIX, {
      leaveType: 'ANNUAL',
      totalDays: 10,
    });
    expect(r.id).toBe('ANNUAL_8_15');
    expect(r.levels).toHaveLength(2);
  });

  it('ANNUAL > 15 days picks ANNUAL_GT_15 (3 levels)', () => {
    const r = matchApprovalRule(DEFAULT_APPROVAL_MATRIX, {
      leaveType: 'ANNUAL',
      totalDays: 21,
    });
    expect(r.id).toBe('ANNUAL_GT_15');
    expect(r.levels).toHaveLength(3);
  });

  it('UNPAID > 3 days requires HR_DIRECTOR', () => {
    const r = matchApprovalRule(DEFAULT_APPROVAL_MATRIX, {
      leaveType: 'UNPAID',
      totalDays: 5,
    });
    expect(r.levels.map((l) => l.role)).toEqual(['LINE_MANAGER', 'HR_DIRECTOR']);
  });

  it('Unknown leave type falls through to DEFAULT', () => {
    const r = matchApprovalRule(DEFAULT_APPROVAL_MATRIX, {
      leaveType: 'TIME_OFF_IN_LIEU',
      totalDays: 1,
    });
    expect(r.id).toBe('DEFAULT');
  });

  it('honours a country gate', () => {
    const matrix: ApprovalMatrixRule[] = [
      {
        id: 'UAE_SICK',
        leaveType: 'SICK',
        country: 'UAE',
        levels: [{ level: 1, role: 'HR_DIRECTOR' }],
      },
      ...DEFAULT_APPROVAL_MATRIX,
    ];
    const uae = matchApprovalRule(matrix, { leaveType: 'SICK', country: 'UAE', totalDays: 1 });
    const ksa = matchApprovalRule(matrix, { leaveType: 'SICK', country: 'KSA', totalDays: 1 });
    expect(uae.id).toBe('UAE_SICK');
    expect(ksa.id).toBe('SICK_ANY');
  });
});

describe('buildApproverChain', () => {
  it('sorts by level and treats missing required as required', () => {
    const chain = buildApproverChain({
      id: 'X',
      levels: [
        { level: 2, role: 'DEPARTMENT_HEAD' },
        { level: 1, role: 'LINE_MANAGER', required: true },
      ],
    });
    expect(chain.map((l) => l.level)).toEqual([1, 2]);
    expect(chain[1].required).toBe(true);
  });
});

describe('advanceLevel', () => {
  const chain = [
    { level: 1, role: 'LINE_MANAGER' as const, required: true },
    { level: 2, role: 'DEPARTMENT_HEAD' as const, required: true },
    { level: 3, role: 'HR_DIRECTOR' as const, required: true },
  ];

  it('returns next=2 from level 1', () => {
    expect(advanceLevel(chain, 1)).toEqual({ final: false, next: 2 });
  });

  it('returns next=3 from level 2', () => {
    expect(advanceLevel(chain, 2)).toEqual({ final: false, next: 3 });
  });

  it('returns final=true from level 3', () => {
    expect(advanceLevel(chain, 3)).toEqual({ final: true });
  });

  it('skips non-required levels', () => {
    const c = [
      { level: 1, role: 'LINE_MANAGER' as const, required: true },
      { level: 2, role: 'DEPARTMENT_HEAD' as const, required: false },
      { level: 3, role: 'HR_DIRECTOR' as const, required: true },
    ];
    expect(advanceLevel(c, 1)).toEqual({ final: false, next: 3 });
  });

  it('returns final immediately when no required level remains', () => {
    const c = [
      { level: 1, role: 'LINE_MANAGER' as const, required: true },
      { level: 2, role: 'DEPARTMENT_HEAD' as const, required: false },
    ];
    expect(advanceLevel(c, 1)).toEqual({ final: true });
  });
});
