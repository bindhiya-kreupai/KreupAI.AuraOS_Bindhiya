import { describe, expect, it } from 'vitest';
import {
  evaluateIgaWageProtection,
  evaluateLmraPermitCalendar,
  evaluateSioObligations,
  type LmraPermitInput,
} from '../bahrain-permit-calendar.service';

const asOf = new Date(Date.UTC(2026, 5, 1)); // 1 June 2026

function permit(daysFromNow: number, opts: Partial<LmraPermitInput> = {}): LmraPermitInput {
  return {
    permitId: opts.permitId ?? `P-${daysFromNow}`,
    employeeId: opts.employeeId ?? `E-${daysFromNow}`,
    expiresAt: new Date(asOf.getTime() + daysFromNow * 86400000),
    renewalLodged: opts.renewalLodged,
  };
}

describe('EPIC-15 LMRA work-permit calendar', () => {
  it('marks permits beyond 90-day window as ACTIVE', () => {
    const r = evaluateLmraPermitCalendar({ permits: [permit(180)], asOf });
    expect(r.rows[0].status).toBe('ACTIVE');
  });

  it('uses 90-day renewal window', () => {
    const r = evaluateLmraPermitCalendar({ permits: [permit(60)], asOf });
    expect(r.rows[0].status).toBe('RENEWAL_WINDOW_OPEN');
  });

  it('marks 30-day due-soon window', () => {
    const r = evaluateLmraPermitCalendar({ permits: [permit(15)], asOf });
    expect(r.rows[0].status).toBe('DUE_SOON');
  });

  it('charges BHD 5/day for the first 30 days overdue', () => {
    const r = evaluateLmraPermitCalendar({ permits: [permit(-10)], asOf });
    expect(r.rows[0].status).toBe('OVERDUE');
    expect(r.rows[0].estimatedPenaltyBhd).toBe(50);
  });

  it('charges BHD 10/day from day 31 onwards', () => {
    const r = evaluateLmraPermitCalendar({ permits: [permit(-60)], asOf });
    expect(r.rows[0].status).toBe('PENALTY_HIGH');
    // 30 * 5 + 30 * 10 = 150 + 300 = 450
    expect(r.rows[0].estimatedPenaltyBhd).toBe(450);
  });

  it('triggers MANDATORY_EXIT after 120 days', () => {
    const r = evaluateLmraPermitCalendar({ permits: [permit(-150)], asOf });
    expect(r.rows[0].status).toBe('MANDATORY_EXIT');
    expect(r.mandatoryExitTriggered).toBe(true);
  });

  it('marks lodged renewals as ACTIVE even close to expiry', () => {
    const r = evaluateLmraPermitCalendar({
      permits: [permit(3, { renewalLodged: true })],
      asOf,
    });
    expect(r.rows[0].status).toBe('ACTIVE');
  });
});

describe('EPIC-15 SIO contribution obligation calendar', () => {
  it('emits wage filing + settlement rows per input', () => {
    const r = evaluateSioObligations([{ wageMonth: new Date(Date.UTC(2026, 3, 1)) }]);
    expect(r.rows).toHaveLength(2);
  });

  it('places wage filing on day 15 of following month', () => {
    const r = evaluateSioObligations([{ wageMonth: new Date(Date.UTC(2026, 3, 1)) }]);
    const wage = r.rows.find((x) => x.kind === 'WAGE_FILING')!;
    expect(wage.statutoryDeadline.toISOString().slice(0, 10)).toBe('2026-05-15');
  });

  it('marks satisfied obligations as OK', () => {
    const r = evaluateSioObligations([
      {
        wageMonth: new Date(Date.UTC(2026, 3, 1)),
        wageFiled: true,
        contributionSettled: true,
        asOf: new Date(Date.UTC(2027, 0, 1)),
      },
    ]);
    expect(r.rows.every((x) => x.severity === 'OK' && x.satisfied)).toBe(true);
  });

  it('uses Bahrain weekend Fri/Sat shift', () => {
    // 15 Aug 2025 is Friday → must shift to Sun 17 Aug.
    const jul2025 = { wageMonth: new Date(Date.UTC(2025, 6, 1)) };
    const r = evaluateSioObligations([jul2025]);
    const wage = r.rows.find((x) => x.kind === 'WAGE_FILING')!;
    expect(wage.statutoryDeadline.toISOString().slice(0, 10)).toBe('2025-08-15');
    expect(wage.effectiveDeadline.toISOString().slice(0, 10)).toBe('2025-08-17');
  });
});

describe('EPIC-15 IGA wage-protection check', () => {
  const mayMonth = new Date(Date.UTC(2026, 4, 1));

  it('marks not-yet-due rows', () => {
    const r = evaluateIgaWageProtection({
      rows: [
        {
          employeeId: 'E1',
          wageMonth: mayMonth,
          expectedAmountBhd: 500,
        },
      ],
      asOf: new Date(Date.UTC(2026, 5, 5)), // before deadline 10 June
    });
    expect(r.rows[0].status).toBe('NOT_YET_DUE');
  });

  it('flags MISSING_CREDIT when not credited and past deadline', () => {
    const r = evaluateIgaWageProtection({
      rows: [
        {
          employeeId: 'E1',
          wageMonth: mayMonth,
          expectedAmountBhd: 500,
        },
      ],
      asOf: new Date(Date.UTC(2026, 5, 20)),
    });
    expect(r.rows[0].status).toBe('MISSING_CREDIT');
    expect(r.escalate).toBe(true);
  });

  it('flags WARN at +3 days late and BLOCK at +10 days late', () => {
    const r1 = evaluateIgaWageProtection({
      rows: [
        {
          employeeId: 'E1',
          wageMonth: mayMonth,
          expectedAmountBhd: 500,
          creditedAmountBhd: 500,
          creditedAt: new Date(Date.UTC(2026, 5, 15)), // 5 days late
        },
      ],
      asOf: new Date(Date.UTC(2026, 5, 15)),
    });
    expect(r1.rows[0].status).toBe('WARN');
    const r2 = evaluateIgaWageProtection({
      rows: [
        {
          employeeId: 'E1',
          wageMonth: mayMonth,
          expectedAmountBhd: 500,
          creditedAmountBhd: 500,
          creditedAt: new Date(Date.UTC(2026, 5, 25)), // 15 days late
        },
      ],
      asOf: new Date(Date.UTC(2026, 5, 25)),
    });
    expect(r2.rows[0].status).toBe('BLOCK');
    expect(r2.escalate).toBe(true);
  });

  it('detects shortfall above tolerance', () => {
    const r = evaluateIgaWageProtection({
      rows: [
        {
          employeeId: 'E1',
          wageMonth: mayMonth,
          expectedAmountBhd: 1000,
          creditedAmountBhd: 950, // 5% shortfall
          creditedAt: new Date(Date.UTC(2026, 5, 8)),
        },
      ],
      asOf: new Date(Date.UTC(2026, 5, 8)),
      shortfallTolerancePct: 1,
    });
    expect(r.rows[0].status).toBe('WARN');
    expect(r.rows[0].shortfallBhd).toBe(50);
  });

  it('marks on-time + correct amount as OK', () => {
    const r = evaluateIgaWageProtection({
      rows: [
        {
          employeeId: 'E1',
          wageMonth: mayMonth,
          expectedAmountBhd: 500,
          creditedAmountBhd: 500,
          creditedAt: new Date(Date.UTC(2026, 5, 8)),
        },
      ],
      asOf: new Date(Date.UTC(2026, 5, 8)),
    });
    expect(r.rows[0].status).toBe('OK');
  });

  it('emits bilingual messages', () => {
    const r = evaluateIgaWageProtection({
      rows: [{ employeeId: 'E1', wageMonth: mayMonth, expectedAmountBhd: 500 }],
      asOf: new Date(Date.UTC(2026, 5, 25)),
    });
    expect(r.rows[0].reason.length).toBeGreaterThan(0);
    expect(r.rows[0].reasonAr).toMatch(/[؀-ۿ]/);
  });
});
