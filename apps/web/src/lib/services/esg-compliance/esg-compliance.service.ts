/**
 * EPIC-30 — ESG / Sustainability evaluators.
 *
 * Closes the partial sub-stories called out in the GCC compliance
 * audit (2026-06-17) for EPIC-30: workforce diversity metric pack,
 * carbon-per-employee evaluator, governance disclosure checker.
 *
 * Each evaluator is a pure function returning a typed verdict with
 * bilingual reason text. No new Prisma models — reports are computed
 * on demand from input arrays.
 */

// =============================================================================
// S-ESG-01 — Workforce diversity metric pack
// =============================================================================

export interface DiversityEmployee {
  employeeId: string;
  gender: 'M' | 'F' | 'O' | 'UNDISCLOSED';
  /** Nationality code (GCC convention — ISO-3166 alpha-3 preferred). */
  nationality: string;
  /** Age bracket bucket — 'U30' | '30-50' | 'O50'. */
  ageBracket: 'U30' | '30-50' | 'O50';
  /** True if employee is classified as a person with disability. */
  isPwd?: boolean;
  /** Job level — 'EXEC' | 'MANAGER' | 'PROFESSIONAL' | 'OPERATIONAL'. */
  jobLevel: 'EXEC' | 'MANAGER' | 'PROFESSIONAL' | 'OPERATIONAL';
}

export interface DiversityReport {
  totals: {
    headcount: number;
    femalePct: number;
    nationalsPct: number;
    pwdPct: number;
    femaleInLeadershipPct: number;
  };
  byGender: Record<string, number>;
  byNationality: Record<string, number>;
  byAgeBracket: Record<string, number>;
  byJobLevel: Record<string, number>;
  flags: Array<{ code: string; en: string; ar: string }>;
}

export interface DiversityThresholds {
  /** Minimum % female overall (e.g. 0.30). */
  minFemalePct?: number;
  /** Minimum % nationals (Saudization-style). */
  minNationalsPct?: number;
  /** Minimum % PwD. */
  minPwdPct?: number;
  /** Minimum % women in leadership (EXEC + MANAGER). */
  minFemaleInLeadershipPct?: number;
  /** Country code used to identify "nationals" — defaults to 'SAU'. */
  nationalCountry?: string;
}

export function evaluateDiversityMetrics(
  employees: DiversityEmployee[],
  thresholds: DiversityThresholds = {}
): DiversityReport {
  const headcount = employees.length;
  const byGender: Record<string, number> = {};
  const byNationality: Record<string, number> = {};
  const byAgeBracket: Record<string, number> = {};
  const byJobLevel: Record<string, number> = {};
  let female = 0;
  let nationals = 0;
  let pwd = 0;
  let femaleLeadership = 0;
  let leadership = 0;
  const nat = (thresholds.nationalCountry ?? 'SAU').toUpperCase();
  for (const e of employees) {
    byGender[e.gender] = (byGender[e.gender] ?? 0) + 1;
    byNationality[e.nationality] = (byNationality[e.nationality] ?? 0) + 1;
    byAgeBracket[e.ageBracket] = (byAgeBracket[e.ageBracket] ?? 0) + 1;
    byJobLevel[e.jobLevel] = (byJobLevel[e.jobLevel] ?? 0) + 1;
    if (e.gender === 'F') female += 1;
    if (e.nationality.toUpperCase() === nat) nationals += 1;
    if (e.isPwd) pwd += 1;
    if (e.jobLevel === 'EXEC' || e.jobLevel === 'MANAGER') {
      leadership += 1;
      if (e.gender === 'F') femaleLeadership += 1;
    }
  }
  const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10);
  const femalePct = pct(female, headcount);
  const nationalsPct = pct(nationals, headcount);
  const pwdPct = pct(pwd, headcount);
  const femaleInLeadershipPct = pct(femaleLeadership, leadership);

  const flags: Array<{ code: string; en: string; ar: string }> = [];
  if (thresholds.minFemalePct !== undefined && femalePct < thresholds.minFemalePct * 100) {
    flags.push({
      code: 'FEMALE_PCT_BELOW_TARGET',
      en: `Female representation ${femalePct}% is below target ${(thresholds.minFemalePct * 100).toFixed(1)}%`,
      ar: `نسبة تمثيل الإناث ${femalePct}% أقل من المستهدف`,
    });
  }
  if (thresholds.minNationalsPct !== undefined && nationalsPct < thresholds.minNationalsPct * 100) {
    flags.push({
      code: 'NATIONALS_PCT_BELOW_TARGET',
      en: `Nationals ${nationalsPct}% below target ${(thresholds.minNationalsPct * 100).toFixed(1)}%`,
      ar: `نسبة المواطنين ${nationalsPct}% أقل من المستهدف`,
    });
  }
  if (thresholds.minPwdPct !== undefined && pwdPct < thresholds.minPwdPct * 100) {
    flags.push({
      code: 'PWD_PCT_BELOW_TARGET',
      en: `Persons-with-disability ${pwdPct}% below target ${(thresholds.minPwdPct * 100).toFixed(1)}%`,
      ar: `نسبة ذوي الإعاقة ${pwdPct}% أقل من المستهدف`,
    });
  }
  if (
    thresholds.minFemaleInLeadershipPct !== undefined &&
    femaleInLeadershipPct < thresholds.minFemaleInLeadershipPct * 100
  ) {
    flags.push({
      code: 'FEMALE_LEADERSHIP_BELOW_TARGET',
      en: `Female-in-leadership ${femaleInLeadershipPct}% below target ${(thresholds.minFemaleInLeadershipPct * 100).toFixed(1)}%`,
      ar: `نسبة الإناث في القيادة ${femaleInLeadershipPct}% أقل من المستهدف`,
    });
  }

  return {
    totals: {
      headcount,
      femalePct,
      nationalsPct,
      pwdPct,
      femaleInLeadershipPct,
    },
    byGender,
    byNationality,
    byAgeBracket,
    byJobLevel,
    flags,
  };
}

// =============================================================================
// S-ESG-02 — Carbon-per-employee evaluator
// =============================================================================

export interface CarbonInput {
  /** Headcount used as the denominator. */
  headcount: number;
  /** Reporting period — used in the report only. */
  periodLabel?: string;
  /** Scope 1 emissions (tCO2e) — owned/controlled (fleet, generators, etc.). */
  scope1: number;
  /** Scope 2 emissions (tCO2e) — purchased electricity, heating. */
  scope2: number;
  /** Scope 3 emissions (tCO2e) — value chain. Optional. */
  scope3?: number;
  /** Industry intensity benchmark — tCO2e per FTE. Optional. */
  benchmarkPerFte?: number;
}

export interface CarbonReport {
  periodLabel?: string;
  totalEmissionsTco2e: number;
  perEmployeeTco2e: number;
  scope1Pct: number;
  scope2Pct: number;
  scope3Pct: number;
  intensityBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'NO_BENCHMARK';
  vsBenchmarkPct: number | null;
  reason: { en: string; ar: string };
}

export function evaluateCarbonPerEmployee(input: CarbonInput): CarbonReport {
  const headcount = Math.max(1, Math.floor(input.headcount));
  const scope1 = Math.max(0, input.scope1);
  const scope2 = Math.max(0, input.scope2);
  const scope3 = Math.max(0, input.scope3 ?? 0);
  const total = scope1 + scope2 + scope3;
  const perFte = Math.round((total / headcount) * 1000) / 1000;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 1000) / 10);
  let intensityBand: CarbonReport['intensityBand'] = 'NO_BENCHMARK';
  let vsBenchmarkPct: number | null = null;
  if (input.benchmarkPerFte && input.benchmarkPerFte > 0) {
    vsBenchmarkPct = Math.round((perFte / input.benchmarkPerFte - 1) * 1000) / 10;
    intensityBand =
      perFte <= input.benchmarkPerFte * 0.8
        ? 'LOW'
        : perFte <= input.benchmarkPerFte * 1.2
          ? 'MEDIUM'
          : 'HIGH';
  }
  const en =
    intensityBand === 'NO_BENCHMARK'
      ? `${perFte} tCO2e per employee — no benchmark supplied`
      : `${perFte} tCO2e per employee — intensity is ${intensityBand} vs benchmark`;
  const ar =
    intensityBand === 'NO_BENCHMARK'
      ? `${perFte} طن CO2 لكل موظف — لا يوجد مرجع`
      : `${perFte} طن CO2 لكل موظف — الكثافة ${intensityBand}`;
  return {
    periodLabel: input.periodLabel,
    totalEmissionsTco2e: Math.round(total * 1000) / 1000,
    perEmployeeTco2e: perFte,
    scope1Pct: pct(scope1),
    scope2Pct: pct(scope2),
    scope3Pct: pct(scope3),
    intensityBand,
    vsBenchmarkPct,
    reason: { en, ar },
  };
}

// =============================================================================
// S-ESG-03 — Governance disclosure checker
// =============================================================================

export interface GovernanceDisclosure {
  code: string;
  label: string;
  labelAr?: string;
  /** Disclosure is mandatory under the active framework? */
  mandatory: boolean;
  /** Whether a non-empty value/document has been filed. */
  filed: boolean;
  /** Date the disclosure was filed (used for staleness checks). */
  filedAt?: Date;
  /** Required cadence in days (e.g. 365 for annual disclosures). */
  cadenceDays?: number;
}

export interface DisclosureCheckResult {
  code: string;
  status: 'OK' | 'MISSING' | 'STALE' | 'NOT_APPLICABLE';
  en: string;
  ar: string;
}

export interface DisclosureReport {
  totals: {
    mandatory: number;
    filed: number;
    stale: number;
    missing: number;
    coveragePct: number;
  };
  results: DisclosureCheckResult[];
}

export function evaluateDisclosureChecklist(
  disclosures: GovernanceDisclosure[],
  asOf: Date = new Date()
): DisclosureReport {
  const results: DisclosureCheckResult[] = disclosures.map((d) => {
    if (!d.mandatory) {
      return {
        code: d.code,
        status: 'NOT_APPLICABLE',
        en: `${d.label} is not mandatory under the current framework`,
        ar: `${d.labelAr ?? d.label} غير إلزامي تحت الإطار الحالي`,
      };
    }
    if (!d.filed || !d.filedAt) {
      return {
        code: d.code,
        status: 'MISSING',
        en: `${d.label} disclosure has not been filed`,
        ar: `لم يتم تقديم إفصاح ${d.labelAr ?? d.label}`,
      };
    }
    if (d.cadenceDays && d.cadenceDays > 0) {
      const days = Math.floor((asOf.getTime() - d.filedAt.getTime()) / (24 * 3600 * 1000));
      if (days > d.cadenceDays) {
        return {
          code: d.code,
          status: 'STALE',
          en: `${d.label} disclosure is stale (${days}d since filing, cadence ${d.cadenceDays}d)`,
          ar: `إفصاح ${d.labelAr ?? d.label} متأخر`,
        };
      }
    }
    return {
      code: d.code,
      status: 'OK',
      en: `${d.label} disclosure is current`,
      ar: `إفصاح ${d.labelAr ?? d.label} حالي`,
    };
  });
  const mandatory = results.filter((r) => r.status !== 'NOT_APPLICABLE').length;
  const ok = results.filter((r) => r.status === 'OK').length;
  const missing = results.filter((r) => r.status === 'MISSING').length;
  const stale = results.filter((r) => r.status === 'STALE').length;
  const coveragePct = mandatory === 0 ? 100 : Math.round((ok / mandatory) * 100);
  return {
    totals: { mandatory, filed: ok, stale, missing, coveragePct },
    results,
  };
}
