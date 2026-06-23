/**
 * EPIC-17 Nitaqat — three-way Qiwa × GOSI × Mudad reconciliation.
 *
 * Closes the audit gap "No Qiwa × GOSI × Mudad reconciliation
 * (artificial-Saudization detection broken)" for EPIC-17 Saudization.
 *
 * Saudi MoL inspectors compare three registers monthly:
 *   - Qiwa: declared total + Saudi headcount per establishment.
 *   - GOSI: contribution-paying Saudi headcount.
 *   - Mudad: payroll-actually-paid Saudi headcount (WPS evidence).
 *
 * Discrepancies between the three indicate "artificial Saudization":
 *
 *   QIWA only (declared but no GOSI + no payroll)
 *     → "ghost" Saudi listed only on the establishment roster.
 *
 *   QIWA + GOSI but NOT Mudad (paying SI but no payroll)
 *     → "SI-only" Saudi — likely fictitious; high inspector risk.
 *
 *   QIWA + Mudad but NOT GOSI (payroll but no SI)
 *     → SI compliance gap; inspector penalty risk.
 *
 *   GOSI + Mudad but NOT QIWA
 *     → unreported Saudi worker; Nitaqat band may be understated.
 *
 *   Wage mismatch (declared SAR > paid SAR by > tolerance)
 *     → declared wage inflated; common artificial-Saudization pattern.
 *
 * This service produces a typed reconciliation report. Pure helper,
 * no IO — the DB-driven wrapper that fetches the three snapshots is
 * a thin shell on top.
 */

export interface QiwaRecord {
  nationalId: string;
  fullName?: string;
  declaredWageSar: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface GosiRecord {
  nationalId: string;
  fullName?: string;
  contributionWageSar: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MudadRecord {
  nationalId: string;
  fullName?: string;
  paidWageSar: number;
  paidThisPeriod: boolean;
}

export interface ReconciliationInput {
  qiwa: QiwaRecord[];
  gosi: GosiRecord[];
  mudad: MudadRecord[];
  wageToleranceSar?: number;
}

export type DiscrepancyKind =
  | 'QIWA_ONLY'
  | 'QIWA_GOSI_NOT_MUDAD'
  | 'QIWA_MUDAD_NOT_GOSI'
  | 'GOSI_MUDAD_NOT_QIWA'
  | 'WAGE_MISMATCH';

export interface Discrepancy {
  kind: DiscrepancyKind;
  nationalId: string;
  fullName?: string;
  qiwaWage?: number;
  gosiWage?: number;
  mudadWage?: number;
  /** Plain-English risk explanation. */
  risk: string;
  /** Arabic risk explanation. */
  riskAr: string;
}

export interface ReconciliationReport {
  totals: {
    qiwa: number;
    gosi: number;
    mudad: number;
    discrepancies: number;
    qiwaOnly: number;
    qiwaGosiNotMudad: number;
    qiwaMudadNotGosi: number;
    gosiMudadNotQiwa: number;
    wageMismatch: number;
  };
  discrepancies: Discrepancy[];
}

const RISK_TEXT: Record<DiscrepancyKind, { en: string; ar: string }> = {
  QIWA_ONLY: {
    en: 'Declared on Qiwa but no GOSI contributions and no payroll — likely ghost Saudization',
    ar: 'مُعلن في قِوى ولكن بدون اشتراكات تأمينات أو رواتب - سعودة وهمية محتملة',
  },
  QIWA_GOSI_NOT_MUDAD: {
    en: 'GOSI contributions paid but no payroll via Mudad — high artificial-Saudization risk',
    ar: 'اشتراكات تأمينات بدون رواتب عبر مدد - خطر سعودة صورية مرتفع',
  },
  QIWA_MUDAD_NOT_GOSI: {
    en: 'Payroll paid but no GOSI registration — Social Insurance compliance gap',
    ar: 'صرف رواتب بدون تسجيل في التأمينات - فجوة امتثال',
  },
  GOSI_MUDAD_NOT_QIWA: {
    en: 'Working with GOSI + payroll but not on Qiwa — establishment under-reporting Saudi headcount',
    ar: 'موظف نشط (تأمينات + مدد) دون تسجيل في قِوى - نقص في الإبلاغ',
  },
  WAGE_MISMATCH: {
    en: 'Declared wage exceeds paid wage beyond tolerance — possible declared-wage inflation',
    ar: 'الأجر المعلَن يتجاوز الأجر المدفوع بأكثر من المسموح به - احتمال تضخيم الأجر',
  },
};

export function reconcileThreeWay(input: ReconciliationInput): ReconciliationReport {
  const tol = input.wageToleranceSar ?? 100;
  const qiwa = new Map(input.qiwa.map((r) => [r.nationalId, r]));
  const gosi = new Map(input.gosi.map((r) => [r.nationalId, r]));
  const mudad = new Map(input.mudad.map((r) => [r.nationalId, r]));

  const allIds = new Set<string>([...qiwa.keys(), ...gosi.keys(), ...mudad.keys()]);
  const discrepancies: Discrepancy[] = [];

  let qiwaOnly = 0;
  let qiwaGosiNotMudad = 0;
  let qiwaMudadNotGosi = 0;
  let gosiMudadNotQiwa = 0;
  let wageMismatch = 0;

  for (const id of allIds) {
    const q = qiwa.get(id);
    const g = gosi.get(id);
    const m = mudad.get(id);

    if (q && !g && !m) {
      qiwaOnly += 1;
      discrepancies.push({
        kind: 'QIWA_ONLY',
        nationalId: id,
        fullName: q.fullName,
        qiwaWage: q.declaredWageSar,
        risk: RISK_TEXT.QIWA_ONLY.en,
        riskAr: RISK_TEXT.QIWA_ONLY.ar,
      });
      continue;
    }
    if (q && g && (!m || !m.paidThisPeriod)) {
      qiwaGosiNotMudad += 1;
      discrepancies.push({
        kind: 'QIWA_GOSI_NOT_MUDAD',
        nationalId: id,
        fullName: q.fullName ?? g.fullName,
        qiwaWage: q.declaredWageSar,
        gosiWage: g.contributionWageSar,
        risk: RISK_TEXT.QIWA_GOSI_NOT_MUDAD.en,
        riskAr: RISK_TEXT.QIWA_GOSI_NOT_MUDAD.ar,
      });
      continue;
    }
    if (q && m && !g) {
      qiwaMudadNotGosi += 1;
      discrepancies.push({
        kind: 'QIWA_MUDAD_NOT_GOSI',
        nationalId: id,
        fullName: q.fullName ?? m.fullName,
        qiwaWage: q.declaredWageSar,
        mudadWage: m.paidWageSar,
        risk: RISK_TEXT.QIWA_MUDAD_NOT_GOSI.en,
        riskAr: RISK_TEXT.QIWA_MUDAD_NOT_GOSI.ar,
      });
      continue;
    }
    if (!q && g && m) {
      gosiMudadNotQiwa += 1;
      discrepancies.push({
        kind: 'GOSI_MUDAD_NOT_QIWA',
        nationalId: id,
        fullName: g.fullName ?? m.fullName,
        gosiWage: g.contributionWageSar,
        mudadWage: m.paidWageSar,
        risk: RISK_TEXT.GOSI_MUDAD_NOT_QIWA.en,
        riskAr: RISK_TEXT.GOSI_MUDAD_NOT_QIWA.ar,
      });
      continue;
    }
    // All three present — check wage mismatch.
    if (q && g && m) {
      const delta = q.declaredWageSar - m.paidWageSar;
      if (Math.abs(delta) > tol) {
        wageMismatch += 1;
        discrepancies.push({
          kind: 'WAGE_MISMATCH',
          nationalId: id,
          fullName: q.fullName,
          qiwaWage: q.declaredWageSar,
          gosiWage: g.contributionWageSar,
          mudadWage: m.paidWageSar,
          risk: RISK_TEXT.WAGE_MISMATCH.en,
          riskAr: RISK_TEXT.WAGE_MISMATCH.ar,
        });
      }
    }
  }

  return {
    totals: {
      qiwa: qiwa.size,
      gosi: gosi.size,
      mudad: mudad.size,
      discrepancies: discrepancies.length,
      qiwaOnly,
      qiwaGosiNotMudad,
      qiwaMudadNotGosi,
      gosiMudadNotQiwa,
      wageMismatch,
    },
    discrepancies,
  };
}
