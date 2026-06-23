import { describe, it, expect } from 'vitest';
import { alignSioLmra, type AlignmentRecord } from '../lmra-alignment.service';

const r = (
  cpr: string,
  wage: number,
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE'
): AlignmentRecord => ({
  cpr,
  fullName: `Worker-${cpr}`,
  declaredWageBhd: wage,
  status,
});

describe('alignSioLmra — EPIC-15-S11', () => {
  it('perfect alignment when both lists match exactly', () => {
    const rep = alignSioLmra({
      sioRecords: [r('A', 300), r('B', 400)],
      lmraRecords: [r('A', 300), r('B', 400)],
    });
    expect(rep.onlyInSio).toEqual([]);
    expect(rep.onlyInLmra).toEqual([]);
    expect(rep.wageMismatch).toEqual([]);
    expect(rep.statusMismatch).toEqual([]);
    expect(rep.summary.alignmentPct).toBe(100);
  });

  it('flags onlyInSio when LMRA does not see a worker', () => {
    const rep = alignSioLmra({
      sioRecords: [r('A', 300), r('B', 400)],
      lmraRecords: [r('A', 300)],
    });
    expect(rep.onlyInSio.map((x) => x.cpr)).toEqual(['B']);
    expect(rep.summary.onlyInSio).toBe(1);
  });

  it('flags onlyInLmra when SIO does not see a worker', () => {
    const rep = alignSioLmra({
      sioRecords: [r('A', 300)],
      lmraRecords: [r('A', 300), r('C', 200)],
    });
    expect(rep.onlyInLmra.map((x) => x.cpr)).toEqual(['C']);
    expect(rep.summary.onlyInLmra).toBe(1);
  });

  it('flags wageMismatch when difference exceeds tolerance', () => {
    const rep = alignSioLmra({
      sioRecords: [r('A', 300)],
      lmraRecords: [r('A', 350)],
    });
    expect(rep.wageMismatch).toHaveLength(1);
    expect(rep.wageMismatch[0].delta).toBe(-50);
  });

  it('does NOT flag wageMismatch when difference is within tolerance', () => {
    const rep = alignSioLmra({
      sioRecords: [r('A', 300.5)],
      lmraRecords: [r('A', 300)],
      wageToleranceBhd: 1.0,
    });
    expect(rep.wageMismatch).toEqual([]);
  });

  it('flags statusMismatch when status diverges', () => {
    const rep = alignSioLmra({
      sioRecords: [r('A', 300, 'ACTIVE')],
      lmraRecords: [r('A', 300, 'INACTIVE')],
    });
    expect(rep.statusMismatch).toHaveLength(1);
    expect(rep.statusMismatch[0].sioStatus).toBe('ACTIVE');
    expect(rep.statusMismatch[0].lmraStatus).toBe('INACTIVE');
  });

  it('computes alignmentPct from total mismatches', () => {
    const rep = alignSioLmra({
      sioRecords: [r('A', 300), r('B', 400), r('C', 500)],
      lmraRecords: [r('A', 300), r('B', 999)], // B mismatch, C only-in-sio
    });
    // total=3; aligned = 3 - 1 onlyInSio - 0 onlyInLmra - 1 wageMismatch = 1.
    expect(rep.summary.alignmentPct).toBeCloseTo(33.33, 1);
  });
});
