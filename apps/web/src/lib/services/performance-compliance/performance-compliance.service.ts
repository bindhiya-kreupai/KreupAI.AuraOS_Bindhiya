/**
 * EPIC-25 Performance compliance — three audit-flagged 🟡 sub-stories:
 *
 *  S-DIST   — forced-distribution detection (curve drift, manager skew)
 *  S-CALIB  — calibration-meeting evidence freshness vs cadence
 *  S-RATING — bilingual rating dictionary lookup
 *
 * Pure evaluators with bilingual reason text. No new Prisma models;
 * persistence is the caller's responsibility (AuditLog for calibration
 * evidence, existing PerformanceReview model for ratings).
 */

export type ComplianceOutcome = 'PASS' | 'WARN' | 'FAIL';

export interface BilingualReason {
  code: string;
  en: string;
  ar: string;
}

// =============================================================================
// S-DIST — Forced-distribution detection
// =============================================================================

export interface RatingDistribution {
  /** Rating label (e.g. "EXCEEDS", "MEETS"). */
  rating: string;
  count: number;
}

export interface DistributionTarget {
  rating: string;
  /** Expected share 0..1. */
  expectedShare: number;
  /** Tolerance band around expected share (default 0.05). */
  toleranceAbs?: number;
}

export interface DistributionInput {
  /** Actual rating counts across the reviewed population. */
  observed: RatingDistribution[];
  /** Mandated distribution (e.g. 10/70/20). */
  target: DistributionTarget[];
  /** Optional per-manager view to detect manager-level skew. */
  perManager?: Array<{ managerId: string; distribution: RatingDistribution[] }>;
}

export interface DistributionDeviation {
  rating: string;
  observedShare: number;
  expectedShare: number;
  deltaAbs: number;
  reason: BilingualReason;
}

export interface DistributionVerdict {
  outcome: ComplianceOutcome;
  deviations: DistributionDeviation[];
  managerOutliers: Array<{ managerId: string; deviationCount: number; reason: BilingualReason }>;
  summary: BilingualReason;
}

function totalCount(rows: RatingDistribution[]): number {
  return rows.reduce((s, r) => s + r.count, 0);
}

export function detectForcedDistribution(input: DistributionInput): DistributionVerdict {
  const total = totalCount(input.observed);
  const observedShares = new Map<string, number>();
  for (const r of input.observed) {
    observedShares.set(r.rating, total === 0 ? 0 : r.count / total);
  }
  const deviations: DistributionDeviation[] = [];
  for (const t of input.target) {
    const tol = t.toleranceAbs ?? 0.05;
    const observedShare = observedShares.get(t.rating) ?? 0;
    const deltaAbs = Math.abs(observedShare - t.expectedShare);
    if (deltaAbs > tol) {
      deviations.push({
        rating: t.rating,
        observedShare: round3(observedShare),
        expectedShare: t.expectedShare,
        deltaAbs: round3(deltaAbs),
        reason: {
          code: 'DIST_BAND_DRIFT',
          en: `Rating "${t.rating}" observed at ${(observedShare * 100).toFixed(1)}% vs expected ${(t.expectedShare * 100).toFixed(1)}%.`,
          ar: `التقييم "${t.rating}" بنسبة ${(observedShare * 100).toFixed(1)}% مقابل المتوقع ${(t.expectedShare * 100).toFixed(1)}%.`,
        },
      });
    }
  }

  const managerOutliers: DistributionVerdict['managerOutliers'] = [];
  if (input.perManager) {
    for (const mgr of input.perManager) {
      const mgrTotal = totalCount(mgr.distribution);
      let count = 0;
      for (const t of input.target) {
        const row = mgr.distribution.find((d) => d.rating === t.rating);
        const share = mgrTotal === 0 ? 0 : (row?.count ?? 0) / mgrTotal;
        const tol = (t.toleranceAbs ?? 0.05) * 2; // manager-level looser
        if (Math.abs(share - t.expectedShare) > tol) count++;
      }
      if (count >= 2) {
        managerOutliers.push({
          managerId: mgr.managerId,
          deviationCount: count,
          reason: {
            code: 'MANAGER_DIST_SKEW',
            en: `Manager ${mgr.managerId} deviates from target distribution on ${count} bands — calibration review needed.`,
            ar: `المدير ${mgr.managerId} ينحرف عن التوزيع المستهدف في ${count} نطاقات — يلزم مراجعة المعايرة.`,
          },
        });
      }
    }
  }

  const failBands = deviations.filter((d) => d.deltaAbs > 0.15).length;
  const outcome: ComplianceOutcome =
    failBands > 0 || managerOutliers.length >= 3
      ? 'FAIL'
      : deviations.length > 0 || managerOutliers.length > 0
        ? 'WARN'
        : 'PASS';
  const summary: BilingualReason =
    outcome === 'PASS'
      ? {
          code: 'DIST_ON_TARGET',
          en: 'Rating distribution sits within mandated band tolerances.',
          ar: 'توزيع التقييمات ضمن النطاقات المسموحة.',
        }
      : outcome === 'WARN'
        ? {
            code: 'DIST_DRIFT_WARN',
            en: `Distribution drift detected on ${deviations.length} band(s); review with HR.`,
            ar: `تم رصد انحراف في ${deviations.length} نطاق(ات)؛ يلزم مراجعة الموارد البشرية.`,
          }
        : {
            code: 'DIST_DRIFT_FAIL',
            en: 'Material distribution breach — calibration sign-off required before ratings lock.',
            ar: 'انحراف جوهري في التوزيع — يلزم اعتماد المعايرة قبل تثبيت التقييمات.',
          };
  return { outcome, deviations, managerOutliers, summary };
}

// =============================================================================
// S-CALIB — Calibration-meeting evidence
// =============================================================================

export interface CalibrationEvidence {
  cycleId: string;
  /** When the calibration meeting actually occurred. */
  meetingAt: Date;
  /** Quorum attendees (must include at least one HR observer + 2 panel members). */
  attendees: Array<{ userId: string; role: 'HR_OBSERVER' | 'PANEL' | 'SPONSOR' }>;
  /** Minute reference (document id) — must be present. */
  minuteRef?: string;
  /** Whether the manager rating distribution was actually discussed. */
  distributionReviewed: boolean;
}

export interface CalibrationCheckInput {
  cycleStartDate: Date;
  cycleEndDate: Date;
  /** Cadence in days within which a calibration must happen (e.g. before close). */
  requiredByDays: number;
  evidence?: CalibrationEvidence;
  asOf?: Date;
}

export interface CalibrationVerdict {
  outcome: ComplianceOutcome;
  daysToClose: number;
  reasons: BilingualReason[];
}

export function checkCalibrationEvidence(input: CalibrationCheckInput): CalibrationVerdict {
  const asOf = input.asOf ?? new Date();
  const reasons: BilingualReason[] = [];
  const daysToClose = Math.ceil(
    (input.cycleEndDate.getTime() - asOf.getTime()) / (24 * 3600 * 1000)
  );

  if (!input.evidence) {
    reasons.push({
      code: 'CALIB_NO_EVIDENCE',
      en: 'No calibration evidence recorded for this cycle.',
      ar: 'لا يوجد دليل معايرة مسجل لهذه الدورة.',
    });
    const outcome: ComplianceOutcome = daysToClose <= input.requiredByDays ? 'FAIL' : 'WARN';
    return { outcome, daysToClose, reasons };
  }

  const ev = input.evidence;
  if (!ev.minuteRef) {
    reasons.push({
      code: 'CALIB_NO_MINUTE',
      en: 'Calibration minute reference missing.',
      ar: 'مرجع محضر المعايرة مفقود.',
    });
  }
  const hrObservers = ev.attendees.filter((a) => a.role === 'HR_OBSERVER').length;
  const panel = ev.attendees.filter((a) => a.role === 'PANEL').length;
  if (hrObservers < 1) {
    reasons.push({
      code: 'CALIB_NO_HR_OBSERVER',
      en: 'No HR observer attended the calibration meeting.',
      ar: 'لم يحضر أي مراقب من الموارد البشرية اجتماع المعايرة.',
    });
  }
  if (panel < 2) {
    reasons.push({
      code: 'CALIB_QUORUM_LOW',
      en: `Calibration panel had ${panel} members; minimum is 2.`,
      ar: `لجنة المعايرة ضمت ${panel} أعضاء؛ الحد الأدنى 2.`,
    });
  }
  if (!ev.distributionReviewed) {
    reasons.push({
      code: 'CALIB_DIST_NOT_REVIEWED',
      en: 'Rating distribution was not reviewed in the calibration meeting.',
      ar: 'لم تتم مراجعة توزيع التقييمات في اجتماع المعايرة.',
    });
  }
  if (ev.meetingAt < input.cycleStartDate || ev.meetingAt > input.cycleEndDate) {
    reasons.push({
      code: 'CALIB_OUT_OF_WINDOW',
      en: 'Calibration meeting fell outside the active cycle window.',
      ar: 'وقع اجتماع المعايرة خارج نافذة الدورة النشطة.',
    });
  }

  let outcome: ComplianceOutcome = 'PASS';
  if (reasons.some((r) => r.code === 'CALIB_NO_MINUTE' || r.code === 'CALIB_NO_HR_OBSERVER')) {
    outcome = 'FAIL';
  } else if (reasons.length > 0) {
    outcome = 'WARN';
  } else {
    reasons.push({
      code: 'CALIB_EVIDENCE_OK',
      en: 'Calibration evidence complete and within cycle window.',
      ar: 'دليل المعايرة مكتمل وضمن نافذة الدورة.',
    });
  }
  return { outcome, daysToClose, reasons };
}

// =============================================================================
// S-RATING — Bilingual rating dictionary
// =============================================================================

export interface RatingDefinition {
  code: string;
  /** 1..N where N is the top rating. Used for ordering. */
  ordinal: number;
  label: { en: string; ar: string };
  description: { en: string; ar: string };
  /** Whether this rating is eligible for merit / bonus payouts. */
  meritEligible: boolean;
}

/**
 * Default 5-band dictionary covering GCC-typical performance ratings.
 * Tenants can supply overrides via configuration.
 */
export const DEFAULT_RATING_DICTIONARY: RatingDefinition[] = [
  {
    code: 'EXCEPTIONAL',
    ordinal: 5,
    label: { en: 'Exceptional', ar: 'استثنائي' },
    description: {
      en: 'Consistently surpasses every objective and demonstrably elevates the team.',
      ar: 'يتجاوز جميع الأهداف باستمرار ويرفع مستوى الفريق بشكل واضح.',
    },
    meritEligible: true,
  },
  {
    code: 'EXCEEDS',
    ordinal: 4,
    label: { en: 'Exceeds', ar: 'يفوق' },
    description: {
      en: 'Exceeds most objectives and shows strong impact.',
      ar: 'يتجاوز معظم الأهداف ويظهر تأثيراً قوياً.',
    },
    meritEligible: true,
  },
  {
    code: 'MEETS',
    ordinal: 3,
    label: { en: 'Meets', ar: 'يحقق' },
    description: {
      en: 'Achieves all role objectives at the expected level.',
      ar: 'يحقق جميع أهداف الوظيفة بالمستوى المتوقع.',
    },
    meritEligible: true,
  },
  {
    code: 'PARTIALLY_MEETS',
    ordinal: 2,
    label: { en: 'Partially meets', ar: 'يحقق جزئياً' },
    description: {
      en: 'Misses some objectives — improvement plan recommended.',
      ar: 'يخفق في بعض الأهداف — يُوصى بخطة تحسين.',
    },
    meritEligible: false,
  },
  {
    code: 'BELOW',
    ordinal: 1,
    label: { en: 'Below expectations', ar: 'دون التوقعات' },
    description: {
      en: 'Falls below role expectations — PIP required.',
      ar: 'أقل من توقعات الوظيفة — تلزم خطة تحسين أداء رسمية.',
    },
    meritEligible: false,
  },
];

export function resolveRating(
  code: string,
  dict: RatingDefinition[] = DEFAULT_RATING_DICTIONARY
): RatingDefinition | null {
  return dict.find((d) => d.code === code) ?? null;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
