import { describe, expect, it } from 'vitest';
import {
  evaluateMohrePermitCalendar,
  type MohrePermitInput,
} from '../mohre-permit-calendar.service';

const asOf = new Date(Date.UTC(2026, 5, 1)); // 1 June 2026

function permit(daysFromNow: number, opts: Partial<MohrePermitInput> = {}): MohrePermitInput {
  return {
    permitId: opts.permitId ?? `P-${daysFromNow}`,
    employeeId: opts.employeeId ?? `E-${daysFromNow}`,
    expiresAt: new Date(asOf.getTime() + daysFromNow * 86400000),
    renewalLodged: opts.renewalLodged,
    cancelled: opts.cancelled,
  };
}

describe('EPIC-14 MOHRE work-permit expiry calendar', () => {
  it('marks permits beyond renewal window as ACTIVE', () => {
    const r = evaluateMohrePermitCalendar({ permits: [permit(120)], asOf });
    expect(r.rows[0].status).toBe('ACTIVE');
  });

  it('marks permits in renewal window (within 60 days) as RENEWAL_WINDOW_OPEN', () => {
    const r = evaluateMohrePermitCalendar({ permits: [permit(45)], asOf });
    expect(r.rows[0].status).toBe('RENEWAL_WINDOW_OPEN');
  });

  it('marks permits within due-soon window (≤15 days, >0) as DUE_SOON', () => {
    const r = evaluateMohrePermitCalendar({ permits: [permit(10)], asOf });
    expect(r.rows[0].status).toBe('DUE_SOON');
  });

  it('treats already-lodged renewal as ACTIVE regardless of expiry proximity', () => {
    const r = evaluateMohrePermitCalendar({
      permits: [permit(5, { renewalLodged: true })],
      asOf,
    });
    expect(r.rows[0].status).toBe('ACTIVE');
  });

  it('assigns OVERDUE band for 1-30 days past expiry with AED 100/day penalty', () => {
    const r = evaluateMohrePermitCalendar({ permits: [permit(-10)], asOf });
    expect(r.rows[0].status).toBe('OVERDUE');
    expect(r.rows[0].estimatedPenaltyAed).toBe(1000);
  });

  it('assigns PENALTY_MEDIUM band for 31-90 days past expiry', () => {
    const r = evaluateMohrePermitCalendar({ permits: [permit(-45)], asOf });
    expect(r.rows[0].status).toBe('PENALTY_MEDIUM');
    // 30 * 100 + 15 * 200 = 3000 + 3000 = 6000
    expect(r.rows[0].estimatedPenaltyAed).toBe(6000);
  });

  it('assigns PENALTY_HIGH for 91-180 days past expiry', () => {
    const r = evaluateMohrePermitCalendar({ permits: [permit(-120)], asOf });
    expect(r.rows[0].status).toBe('PENALTY_HIGH');
  });

  it('assigns COMPANY_BAN_RISK for 181+ days past expiry', () => {
    const r = evaluateMohrePermitCalendar({ permits: [permit(-200)], asOf });
    expect(r.rows[0].status).toBe('COMPANY_BAN_RISK');
    expect(r.companyBanRisk).toBe(true);
  });

  it('respects the wage-protection grace for cancelled permits', () => {
    const r1 = evaluateMohrePermitCalendar({
      permits: [permit(-5, { cancelled: true })],
      asOf,
    });
    expect(r1.rows[0].status).toBe('OVERDUE');
    const r2 = evaluateMohrePermitCalendar({
      permits: [permit(-30, { cancelled: true })],
      asOf,
    });
    expect(r2.rows[0].status).toBe('PENALTY_HIGH');
  });

  it('emits bilingual reason text', () => {
    const r = evaluateMohrePermitCalendar({ permits: [permit(-45)], asOf });
    expect(r.rows[0].reason.length).toBeGreaterThan(0);
    expect(r.rows[0].reasonAr).toMatch(/[؀-ۿ]/);
  });

  it('respects tenant overrides for renewal window + fees', () => {
    const r = evaluateMohrePermitCalendar({
      permits: [permit(-10)],
      asOf,
      feePerDayAed: { low: 50, medium: 200, high: 500 },
    });
    expect(r.rows[0].estimatedPenaltyAed).toBe(500); // 10 * 50
  });

  it('aggregates totals across permits', () => {
    const r = evaluateMohrePermitCalendar({
      permits: [permit(120), permit(10), permit(-5), permit(-200)],
      asOf,
    });
    expect(r.totals.active).toBe(1);
    expect(r.totals.dueSoon).toBe(1);
    expect(r.totals.overdue).toBe(1);
    expect(r.totals.companyBanRisk).toBe(1);
    expect(r.companyBanRisk).toBe(true);
    expect(r.totals.totalEstimatedPenaltyAed).toBeGreaterThan(0);
  });
});
