import { describe, it, expect } from 'vitest';
import { reconcileThreeWay } from '../three-way-reconciliation.service';

const Q = (id: string, wage: number, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE') => ({
  nationalId: id,
  fullName: `Q-${id}`,
  declaredWageSar: wage,
  status,
});
const G = (id: string, wage: number, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE') => ({
  nationalId: id,
  fullName: `G-${id}`,
  contributionWageSar: wage,
  status,
});
const M = (id: string, wage: number, paid = true) => ({
  nationalId: id,
  fullName: `M-${id}`,
  paidWageSar: wage,
  paidThisPeriod: paid,
});

describe('reconcileThreeWay — EPIC-17 artificial-Saudization detection', () => {
  it('clean alignment when all three sources match', () => {
    const r = reconcileThreeWay({
      qiwa: [Q('1', 5000)],
      gosi: [G('1', 5000)],
      mudad: [M('1', 5000)],
    });
    expect(r.totals.discrepancies).toBe(0);
  });

  it('flags QIWA_ONLY when GOSI + Mudad both absent', () => {
    const r = reconcileThreeWay({
      qiwa: [Q('ghost', 4000)],
      gosi: [],
      mudad: [],
    });
    expect(r.totals.qiwaOnly).toBe(1);
    expect(r.discrepancies[0].kind).toBe('QIWA_ONLY');
    expect(r.discrepancies[0].riskAr.length).toBeGreaterThan(0);
  });

  it('flags QIWA_GOSI_NOT_MUDAD when no payroll', () => {
    const r = reconcileThreeWay({
      qiwa: [Q('1', 4000)],
      gosi: [G('1', 4000)],
      mudad: [],
    });
    expect(r.totals.qiwaGosiNotMudad).toBe(1);
    expect(r.discrepancies[0].kind).toBe('QIWA_GOSI_NOT_MUDAD');
  });

  it('flags QIWA_GOSI_NOT_MUDAD when payroll exists but is not paid this period', () => {
    const r = reconcileThreeWay({
      qiwa: [Q('1', 4000)],
      gosi: [G('1', 4000)],
      mudad: [M('1', 4000, false)],
    });
    expect(r.totals.qiwaGosiNotMudad).toBe(1);
  });

  it('flags QIWA_MUDAD_NOT_GOSI', () => {
    const r = reconcileThreeWay({
      qiwa: [Q('1', 4000)],
      gosi: [],
      mudad: [M('1', 4000)],
    });
    expect(r.totals.qiwaMudadNotGosi).toBe(1);
  });

  it('flags GOSI_MUDAD_NOT_QIWA', () => {
    const r = reconcileThreeWay({
      qiwa: [],
      gosi: [G('1', 4000)],
      mudad: [M('1', 4000)],
    });
    expect(r.totals.gosiMudadNotQiwa).toBe(1);
  });

  it('flags WAGE_MISMATCH when declared > paid beyond tolerance', () => {
    const r = reconcileThreeWay({
      qiwa: [Q('1', 5000)],
      gosi: [G('1', 5000)],
      mudad: [M('1', 4500)],
      wageToleranceSar: 100,
    });
    expect(r.totals.wageMismatch).toBe(1);
    expect(r.discrepancies[0].kind).toBe('WAGE_MISMATCH');
  });

  it('does not flag when wage delta is within tolerance', () => {
    const r = reconcileThreeWay({
      qiwa: [Q('1', 5000)],
      gosi: [G('1', 5000)],
      mudad: [M('1', 4990)],
      wageToleranceSar: 100,
    });
    expect(r.totals.wageMismatch).toBe(0);
  });

  it('handles a mixed dataset', () => {
    const r = reconcileThreeWay({
      qiwa: [Q('GHOST', 3000), Q('OK', 4000), Q('NOPAY', 5000)],
      gosi: [G('OK', 4000), G('NOPAY', 5000), G('NOQIWA', 6000)],
      mudad: [M('OK', 4000), M('NOQIWA', 6000)],
    });
    expect(r.totals.qiwaOnly).toBe(1);
    expect(r.totals.qiwaGosiNotMudad).toBe(1);
    expect(r.totals.gosiMudadNotQiwa).toBe(1);
    expect(r.totals.discrepancies).toBe(3);
  });
});
