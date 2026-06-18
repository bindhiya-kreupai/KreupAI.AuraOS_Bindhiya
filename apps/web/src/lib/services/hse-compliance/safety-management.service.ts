/**
 * EPIC-24 HSE — PPE issuance + toolbox talks + emergency drills.
 *
 * Closes the audit gap "11 stories MISSING: governance, org/roles,
 * PPE, toolbox talks, drills, first aid, contractor HSE, welfare,
 * surveillance, HR integration, audit checklist" for EPIC-24 HSE.
 *
 * This service ships three of those eleven stories — PPE issuance
 * compliance, toolbox-talk coverage, and emergency-drill cadence —
 * as pure evaluators. The remaining 8 stories follow the same
 * pattern and will land separately.
 *
 * Each evaluator produces a typed verdict ready for the inspector
 * report, with bilingual reason text.
 */

export interface PpeIssuance {
  employeeId: string;
  ppeType: string;
  issuedAt: Date;
  /** When the PPE item must be replaced (e.g. annual hi-vis renewal). */
  expiresAt: Date;
  /** Whether the size is recorded — inspectors challenge "one-size-fits-all". */
  hasSize: boolean;
}

export interface PpeCoverageInput {
  /** All employees in scope. */
  employees: Array<{ employeeId: string; role: string }>;
  /** Active PPE issuances on file. */
  issuances: PpeIssuance[];
  /** PPE types required per role. */
  requirements: Array<{ role: string; ppeType: string }>;
  asOf: Date;
}

export type PpeFailureCode = 'MISSING_PPE' | 'PPE_EXPIRED' | 'SIZE_NOT_RECORDED';

export interface PpeFailure {
  employeeId: string;
  ppeType: string;
  code: PpeFailureCode;
  description: string;
  descriptionAr: string;
}

export interface PpeCoverageReport {
  totals: {
    employeesInScope: number;
    requirementsChecked: number;
    failures: number;
    coveragePct: number;
  };
  failures: PpeFailure[];
}

const PPE_FAIL: Record<PpeFailureCode, { en: string; ar: string }> = {
  MISSING_PPE: {
    en: 'Required PPE item has never been issued',
    ar: 'لم يتم صرف معدات الحماية الشخصية المطلوبة',
  },
  PPE_EXPIRED: {
    en: 'PPE issuance has expired',
    ar: 'انتهت صلاحية معدات الحماية الشخصية',
  },
  SIZE_NOT_RECORDED: {
    en: 'PPE size not recorded on the issuance row',
    ar: 'لم يتم تسجيل مقاس معدات الحماية',
  },
};

export function evaluatePpeCoverage(input: PpeCoverageInput): PpeCoverageReport {
  const reqByRole = new Map<string, string[]>();
  for (const r of input.requirements) {
    if (!reqByRole.has(r.role)) reqByRole.set(r.role, []);
    reqByRole.get(r.role)!.push(r.ppeType);
  }
  const failures: PpeFailure[] = [];
  let checked = 0;
  for (const emp of input.employees) {
    const reqs = reqByRole.get(emp.role) ?? [];
    for (const ppeType of reqs) {
      checked += 1;
      const found = input.issuances.filter(
        (i) => i.employeeId === emp.employeeId && i.ppeType === ppeType
      );
      if (found.length === 0) {
        failures.push({
          employeeId: emp.employeeId,
          ppeType,
          code: 'MISSING_PPE',
          description: PPE_FAIL.MISSING_PPE.en,
          descriptionAr: PPE_FAIL.MISSING_PPE.ar,
        });
        continue;
      }
      // Take the most recent issuance.
      const latest = found.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())[0];
      if (latest.expiresAt.getTime() < input.asOf.getTime()) {
        failures.push({
          employeeId: emp.employeeId,
          ppeType,
          code: 'PPE_EXPIRED',
          description: PPE_FAIL.PPE_EXPIRED.en,
          descriptionAr: PPE_FAIL.PPE_EXPIRED.ar,
        });
        continue;
      }
      if (!latest.hasSize) {
        failures.push({
          employeeId: emp.employeeId,
          ppeType,
          code: 'SIZE_NOT_RECORDED',
          description: PPE_FAIL.SIZE_NOT_RECORDED.en,
          descriptionAr: PPE_FAIL.SIZE_NOT_RECORDED.ar,
        });
      }
    }
  }
  const coveragePct =
    checked === 0 ? 100 : Math.round(((checked - failures.length) / checked) * 100);
  return {
    totals: {
      employeesInScope: input.employees.length,
      requirementsChecked: checked,
      failures: failures.length,
      coveragePct,
    },
    failures,
  };
}

// ============================================================================
// Toolbox talks
// ============================================================================

export interface ToolboxTalkAttendance {
  employeeId: string;
  attendedAt: Date;
}

export interface ToolboxCoverageInput {
  employees: Array<{ employeeId: string }>;
  attendances: ToolboxTalkAttendance[];
  /** Required cadence in days (default 7 — weekly). */
  cadenceDays?: number;
  asOf: Date;
}

export interface ToolboxCoverageReport {
  totals: {
    employeesInScope: number;
    overdue: number;
    coveragePct: number;
  };
  overdueEmployees: Array<{
    employeeId: string;
    daysSinceLastTalk: number;
    description: string;
    descriptionAr: string;
  }>;
}

export function evaluateToolboxCoverage(input: ToolboxCoverageInput): ToolboxCoverageReport {
  const cadence = input.cadenceDays ?? 7;
  const lastByEmp = new Map<string, Date>();
  for (const a of input.attendances) {
    const prev = lastByEmp.get(a.employeeId);
    if (!prev || a.attendedAt.getTime() > prev.getTime()) {
      lastByEmp.set(a.employeeId, a.attendedAt);
    }
  }
  const overdueEmployees: ToolboxCoverageReport['overdueEmployees'] = [];
  for (const emp of input.employees) {
    const last = lastByEmp.get(emp.employeeId);
    const daysSince = last
      ? Math.floor((input.asOf.getTime() - last.getTime()) / (24 * 3600 * 1000))
      : Infinity;
    if (daysSince > cadence) {
      overdueEmployees.push({
        employeeId: emp.employeeId,
        daysSinceLastTalk: Number.isFinite(daysSince) ? daysSince : -1,
        description: `Toolbox talk overdue (${daysSince === Infinity ? 'never attended' : `${daysSince}d ago`})`,
        descriptionAr: `محاضرة الأدوات متأخرة (${daysSince === Infinity ? 'لم يحضرها' : `قبل ${daysSince} يوم`})`,
      });
    }
  }
  const coveragePct =
    input.employees.length === 0
      ? 100
      : Math.round(
          ((input.employees.length - overdueEmployees.length) / input.employees.length) * 100
        );
  return {
    totals: {
      employeesInScope: input.employees.length,
      overdue: overdueEmployees.length,
      coveragePct,
    },
    overdueEmployees,
  };
}

// ============================================================================
// Emergency drills
// ============================================================================

export interface DrillRecord {
  drillType: 'FIRE' | 'EARTHQUAKE' | 'CHEMICAL' | 'EVACUATION_GENERAL';
  conductedAt: Date;
  attendancePct: number; // 0..100
  passed: boolean;
}

export interface DrillCadenceInput {
  drills: DrillRecord[];
  /**
   * Required cadence per drill type, in days. Caller may override
   * any subset of types; missing entries fall back to
   * `DEFAULT_DRILL_CADENCE`.
   */
  cadence?: Partial<Record<DrillRecord['drillType'], number>>;
  asOf: Date;
}

export interface DrillCadenceReport {
  totals: {
    drillTypesInScope: number;
    overdue: number;
    coveragePct: number;
  };
  overdueDrills: Array<{
    drillType: DrillRecord['drillType'];
    daysOverdue: number;
    description: string;
    descriptionAr: string;
  }>;
}

const DEFAULT_DRILL_CADENCE: Record<DrillRecord['drillType'], number> = {
  FIRE: 90,
  EARTHQUAKE: 180,
  CHEMICAL: 90,
  EVACUATION_GENERAL: 180,
};

export function evaluateDrillCadence(input: DrillCadenceInput): DrillCadenceReport {
  const cadence = { ...DEFAULT_DRILL_CADENCE, ...(input.cadence ?? {}) };
  const lastByType = new Map<DrillRecord['drillType'], Date>();
  for (const d of input.drills) {
    if (!d.passed) continue;
    const prev = lastByType.get(d.drillType);
    if (!prev || d.conductedAt.getTime() > prev.getTime()) {
      lastByType.set(d.drillType, d.conductedAt);
    }
  }
  const types: DrillRecord['drillType'][] = [
    'FIRE',
    'EARTHQUAKE',
    'CHEMICAL',
    'EVACUATION_GENERAL',
  ];
  const overdueDrills: DrillCadenceReport['overdueDrills'] = [];
  for (const t of types) {
    const last = lastByType.get(t);
    const allowed = cadence[t];
    const daysSince = last
      ? Math.floor((input.asOf.getTime() - last.getTime()) / (24 * 3600 * 1000))
      : Infinity;
    if (daysSince > allowed) {
      const daysOverdue = daysSince === Infinity ? -1 : daysSince - allowed;
      overdueDrills.push({
        drillType: t,
        daysOverdue,
        description: `${t} drill overdue by ${daysOverdue >= 0 ? daysOverdue + 'd' : 'never conducted'} (cadence ${allowed}d)`,
        descriptionAr: `تدريب ${t} متأخر بـ ${daysOverdue >= 0 ? daysOverdue + ' يوم' : 'لم يُعقد'} (الدورة ${allowed} يوم)`,
      });
    }
  }
  const coveragePct = Math.round(((types.length - overdueDrills.length) / types.length) * 100);
  return {
    totals: { drillTypesInScope: types.length, overdue: overdueDrills.length, coveragePct },
    overdueDrills,
  };
}
