/**
 * EPIC-10 payroll cut-off + period-lock enforcement.
 *
 * Closes two audit gaps for EPIC-10 Payroll:
 *   - "No cut-off enforcement"
 *   - "No period-lock immutability"
 *
 * Two related controls:
 *
 *  1. CUT-OFF: each pay period has a cut-off date (typically 25th of
 *     the prior month). After the cut-off but before payroll runs,
 *     attendance regularizations, leave applications, and salary
 *     changes that would alter the period's payroll output MUST be
 *     blocked or routed to maker-checker.
 *
 *  2. PERIOD LOCK: once payroll has been processed + WPS released
 *     for a period, the period is LOCKED. No retroactive change to
 *     attendance / leave / salary for that period is allowed without
 *     a senior override (with justification + audit log).
 *
 * Pure helper `evaluateChangeAgainstPeriod(input)` returns a typed
 * verdict the caller (leave service, attendance service, payroll
 * service) uses to gate the operation. Storage-driven helpers wrap
 * this in lookups against the existing PayrollRun rows.
 *
 * No schema change required.
 */

export type PeriodStatus = 'OPEN' | 'CUT_OFF' | 'LOCKED' | 'PROCESSED';

export interface PeriodConfig {
  /** YYYY-MM period identifier. */
  period: string;
  /** Date AFTER which retroactive changes need maker-checker. */
  cutOffDate: Date;
  /** Date the payroll was processed (period becomes LOCKED). */
  processedAt?: Date;
  /** WPS / GOSI release date (period becomes PROCESSED/IMMUTABLE). */
  releasedAt?: Date;
}

export type ChangeType =
  | 'ATTENDANCE_REGULARIZATION'
  | 'LEAVE_APPLICATION'
  | 'LEAVE_CANCELLATION'
  | 'SALARY_CHANGE'
  | 'NEW_HIRE'
  | 'TERMINATION'
  | 'EXPENSE_CLAIM';

export interface ChangeInput {
  changeType: ChangeType;
  period: PeriodConfig;
  /** Date the change is being applied. */
  appliedAt: Date;
  /** Role of the actor making the change. */
  actorRole?: string;
  /** True iff the actor supplied a justification (gates force-paths). */
  hasJustification?: boolean;
}

export type GateVerdictReason =
  | 'OPEN_NO_GATE'
  | 'POST_CUT_OFF_REQUIRES_MAKER_CHECKER'
  | 'PERIOD_LOCKED_REQUIRES_OVERRIDE'
  | 'PERIOD_PROCESSED_BLOCKED'
  | 'JUSTIFICATION_MISSING'
  | 'ACTOR_ROLE_INSUFFICIENT';

export interface PeriodGateVerdict {
  allow: boolean;
  reason: GateVerdictReason;
  reasonEn: string;
  reasonAr: string;
  periodStatus: PeriodStatus;
  requiresJustification: boolean;
  requiresSeniorApproval: boolean;
}

const REASON: Record<GateVerdictReason, { en: string; ar: string }> = {
  OPEN_NO_GATE: {
    en: 'Period is OPEN — change allowed without gating',
    ar: 'الفترة مفتوحة - يُسمح بالتغيير دون شروط',
  },
  POST_CUT_OFF_REQUIRES_MAKER_CHECKER: {
    en: 'Change is after the period cut-off — maker-checker approval required',
    ar: 'التغيير بعد موعد الإغلاق - يتطلب موافقة المراقب',
  },
  PERIOD_LOCKED_REQUIRES_OVERRIDE: {
    en: 'Period is LOCKED (payroll processed) — senior override + written justification required',
    ar: 'الفترة مقفلة (تم معالجة الرواتب) - تتطلب موافقة الإدارة العليا ومبرراً مكتوباً',
  },
  PERIOD_PROCESSED_BLOCKED: {
    en: 'Period is PROCESSED + WPS released — no retroactive changes allowed (request an off-cycle adjustment instead)',
    ar: 'الفترة مكتملة وتم إرسال WPS - لا يُسمح بالتغيير الرجعي (اطلب تسوية خارج الدورة)',
  },
  JUSTIFICATION_MISSING: {
    en: 'Force-change requires a written justification',
    ar: 'يتطلب التغيير القسري مبرراً مكتوباً',
  },
  ACTOR_ROLE_INSUFFICIENT: {
    en: 'Override is allowed only for PAYROLL_DIRECTOR or HR_DIRECTOR',
    ar: 'التجاوز مسموح فقط لمدير الرواتب أو مدير الموارد البشرية',
  },
};

const SENIOR_ROLES = new Set(['PAYROLL_DIRECTOR', 'HR_DIRECTOR', 'COO', 'CEO']);

/**
 * Pure helper: classify the period based on its config + asOf.
 */
export function classifyPeriod(period: PeriodConfig, asOf: Date = new Date()): PeriodStatus {
  if (period.releasedAt && asOf >= period.releasedAt) return 'PROCESSED';
  if (period.processedAt && asOf >= period.processedAt) return 'LOCKED';
  if (asOf >= period.cutOffDate) return 'CUT_OFF';
  return 'OPEN';
}

/**
 * Pure helper: decide whether a proposed change against the given
 * period is allowed.
 */
export function evaluateChangeAgainstPeriod(input: ChangeInput): PeriodGateVerdict {
  const status = classifyPeriod(input.period, input.appliedAt);

  if (status === 'OPEN') {
    return {
      allow: true,
      reason: 'OPEN_NO_GATE',
      reasonEn: REASON.OPEN_NO_GATE.en,
      reasonAr: REASON.OPEN_NO_GATE.ar,
      periodStatus: status,
      requiresJustification: false,
      requiresSeniorApproval: false,
    };
  }

  if (status === 'CUT_OFF') {
    return {
      allow: true, // pass to maker-checker downstream
      reason: 'POST_CUT_OFF_REQUIRES_MAKER_CHECKER',
      reasonEn: REASON.POST_CUT_OFF_REQUIRES_MAKER_CHECKER.en,
      reasonAr: REASON.POST_CUT_OFF_REQUIRES_MAKER_CHECKER.ar,
      periodStatus: status,
      requiresJustification: false,
      requiresSeniorApproval: false,
    };
  }

  if (status === 'PROCESSED') {
    // Off-cycle adjustments are a different flow; the period itself is immutable.
    return {
      allow: false,
      reason: 'PERIOD_PROCESSED_BLOCKED',
      reasonEn: REASON.PERIOD_PROCESSED_BLOCKED.en,
      reasonAr: REASON.PERIOD_PROCESSED_BLOCKED.ar,
      periodStatus: status,
      requiresJustification: true,
      requiresSeniorApproval: true,
    };
  }

  // status === 'LOCKED' — senior override allowed.
  if (!SENIOR_ROLES.has(input.actorRole ?? '')) {
    return {
      allow: false,
      reason: 'ACTOR_ROLE_INSUFFICIENT',
      reasonEn: REASON.ACTOR_ROLE_INSUFFICIENT.en,
      reasonAr: REASON.ACTOR_ROLE_INSUFFICIENT.ar,
      periodStatus: status,
      requiresJustification: true,
      requiresSeniorApproval: true,
    };
  }
  if (!input.hasJustification) {
    return {
      allow: false,
      reason: 'JUSTIFICATION_MISSING',
      reasonEn: REASON.JUSTIFICATION_MISSING.en,
      reasonAr: REASON.JUSTIFICATION_MISSING.ar,
      periodStatus: status,
      requiresJustification: true,
      requiresSeniorApproval: true,
    };
  }

  return {
    allow: true,
    reason: 'PERIOD_LOCKED_REQUIRES_OVERRIDE',
    reasonEn: REASON.PERIOD_LOCKED_REQUIRES_OVERRIDE.en,
    reasonAr: REASON.PERIOD_LOCKED_REQUIRES_OVERRIDE.ar,
    periodStatus: status,
    requiresJustification: true,
    requiresSeniorApproval: true,
  };
}
