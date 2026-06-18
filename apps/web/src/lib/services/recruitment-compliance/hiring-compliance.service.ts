/**
 * EPIC-22 Recruitment compliance — three pure evaluators that close the
 * three audit-flagged 🟡 sub-stories:
 *
 *  S-BIAS  — candidate-bias detection on shortlist (demographic skew)
 *  S-PAY   — equal-pay band check on offer (compa-ratio vs band)
 *  S-NAT   — nationalization quota gating on hire (won't dip below floor)
 *
 * No new Prisma models. Each evaluator takes typed input and returns a
 * typed verdict carrying bilingual (en/ar) reason text. Persistence
 * (audit-log decision capture) is the caller's responsibility — these
 * are pure decisions consumed by the recruitment-compliance API layer.
 */

export type ComplianceOutcome = 'PASS' | 'WARN' | 'FAIL';

export interface BilingualReason {
  code: string;
  en: string;
  ar: string;
}

// =============================================================================
// S-BIAS — Candidate bias detection on shortlist
// =============================================================================

export type Demographic = 'gender' | 'nationality' | 'ageBand';

export interface ShortlistCandidate {
  candidateId: string;
  /** Lower-cased category labels, e.g. gender:"male"|"female", nationality:"AE"|"IN". */
  attributes: Partial<Record<Demographic, string>>;
}

export interface ShortlistBiasInput {
  applicantPool: ShortlistCandidate[];
  shortlist: ShortlistCandidate[];
  /** Max absolute deviation between pool share and shortlist share before a flag. */
  toleranceAbs?: number;
}

export interface BiasFlag {
  dimension: Demographic;
  category: string;
  poolShare: number;
  shortlistShare: number;
  deltaAbs: number;
  reason: BilingualReason;
}

export interface ShortlistBiasVerdict {
  outcome: ComplianceOutcome;
  flags: BiasFlag[];
  summary: BilingualReason;
}

function shares(rows: ShortlistCandidate[], dim: Demographic): Map<string, number> {
  const m = new Map<string, number>();
  let total = 0;
  for (const r of rows) {
    const v = r.attributes?.[dim];
    if (!v) continue;
    m.set(v, (m.get(v) ?? 0) + 1);
    total += 1;
  }
  if (total === 0) return m;
  for (const [k, v] of m) m.set(k, v / total);
  return m;
}

/**
 * Pure evaluator. Compares applicant-pool demographic shares to
 * shortlist shares across gender / nationality / ageBand. Flags any
 * category where the shortlist deviates by more than `toleranceAbs`
 * (default 0.2). Returns WARN with ≥1 flag, FAIL with ≥3, else PASS.
 */
export function detectShortlistBias(input: ShortlistBiasInput): ShortlistBiasVerdict {
  const tol = input.toleranceAbs ?? 0.2;
  const flags: BiasFlag[] = [];
  for (const dim of ['gender', 'nationality', 'ageBand'] as Demographic[]) {
    const pool = shares(input.applicantPool, dim);
    const sl = shares(input.shortlist, dim);
    const keys = new Set<string>([...pool.keys(), ...sl.keys()]);
    for (const k of keys) {
      const poolShare = pool.get(k) ?? 0;
      const shortlistShare = sl.get(k) ?? 0;
      const deltaAbs = Math.abs(poolShare - shortlistShare);
      if (deltaAbs > tol) {
        flags.push({
          dimension: dim,
          category: k,
          poolShare: Math.round(poolShare * 1000) / 1000,
          shortlistShare: Math.round(shortlistShare * 1000) / 1000,
          deltaAbs: Math.round(deltaAbs * 1000) / 1000,
          reason: {
            code: `BIAS_${dim.toUpperCase()}_SKEW`,
            en: `Shortlist share for ${dim}="${k}" deviates by ${(deltaAbs * 100).toFixed(1)}% from applicant pool.`,
            ar: `حصة القائمة المختصرة لـ "${k}" تنحرف بنسبة ${(deltaAbs * 100).toFixed(1)}% عن مجموع المتقدمين.`,
          },
        });
      }
    }
  }
  const outcome: ComplianceOutcome =
    flags.length >= 3 ? 'FAIL' : flags.length > 0 ? 'WARN' : 'PASS';
  const summary: BilingualReason =
    outcome === 'PASS'
      ? {
          code: 'BIAS_PASS',
          en: 'No statistically meaningful demographic skew between applicant pool and shortlist.',
          ar: 'لا يوجد انحراف ديموغرافي ذو دلالة بين المتقدمين والقائمة المختصرة.',
        }
      : outcome === 'WARN'
        ? {
            code: 'BIAS_WARN',
            en: `Shortlist deviates from applicant-pool composition on ${flags.length} dimension(s).`,
            ar: `تنحرف القائمة المختصرة عن تركيبة المتقدمين في ${flags.length} بُعداً.`,
          }
        : {
            code: 'BIAS_FAIL',
            en: `Material shortlist bias across ${flags.length} dimensions — escalate to D&I review.`,
            ar: `انحياز جوهري في القائمة المختصرة عبر ${flags.length} أبعاد — يجب التصعيد لمراجعة التنوع والشمول.`,
          };
  return { outcome, flags, summary };
}

// =============================================================================
// S-PAY — Equal-pay band check on offer
// =============================================================================

export interface PayBand {
  grade: string;
  min: number;
  mid: number;
  max: number;
  currency: string;
}

export interface PeerSnapshot {
  employeeId: string;
  grade: string;
  /** Same currency as the band. */
  salary: number;
  gender?: string;
  nationality?: string;
}

export interface EqualPayInput {
  offerCandidate: { gender?: string; nationality?: string };
  offerSalary: number;
  band: PayBand;
  peers: PeerSnapshot[];
}

export interface EqualPayVerdict {
  outcome: ComplianceOutcome;
  compaRatio: number;
  bandPosition: 'BELOW_MIN' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'ABOVE_MAX';
  peerMedianSameGroup?: number;
  peerMedianOtherGroup?: number;
  gapPct?: number;
  reasons: BilingualReason[];
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[m - 1] + sorted[m]) / 2 : sorted[m];
}

/**
 * Pure equal-pay evaluator. Checks band-position + compa-ratio + peer-median gap
 * by candidate's gender (or nationality if gender absent). WARN at 10% gap, FAIL at 20%.
 */
export function checkEqualPay(input: EqualPayInput): EqualPayVerdict {
  const reasons: BilingualReason[] = [];
  const { band, offerSalary } = input;
  const compaRatio = band.mid > 0 ? Math.round((offerSalary / band.mid) * 1000) / 1000 : 0;
  let bandPosition: EqualPayVerdict['bandPosition'];
  if (offerSalary < band.min) bandPosition = 'BELOW_MIN';
  else if (offerSalary > band.max) bandPosition = 'ABOVE_MAX';
  else {
    const r = (offerSalary - band.min) / Math.max(1, band.max - band.min);
    bandPosition = r < 0.25 ? 'Q1' : r < 0.5 ? 'Q2' : r < 0.75 ? 'Q3' : 'Q4';
  }
  if (bandPosition === 'BELOW_MIN') {
    reasons.push({
      code: 'OFFER_BELOW_BAND_MIN',
      en: `Offer salary ${offerSalary} is below band minimum ${band.min} for grade ${band.grade}.`,
      ar: `راتب العرض ${offerSalary} أقل من الحد الأدنى للنطاق ${band.min} للدرجة ${band.grade}.`,
    });
  } else if (bandPosition === 'ABOVE_MAX') {
    reasons.push({
      code: 'OFFER_ABOVE_BAND_MAX',
      en: `Offer salary ${offerSalary} exceeds band maximum ${band.max} for grade ${band.grade}.`,
      ar: `راتب العرض ${offerSalary} يتجاوز الحد الأعلى للنطاق ${band.max} للدرجة ${band.grade}.`,
    });
  }

  // Peer comparison: split peers in same grade by candidate's group attribute.
  const sameGradePeers = input.peers.filter((p) => p.grade === band.grade);
  const groupAttr: 'gender' | 'nationality' = input.offerCandidate.gender
    ? 'gender'
    : 'nationality';
  const candidateGroup =
    groupAttr === 'gender' ? input.offerCandidate.gender : input.offerCandidate.nationality;
  let peerMedianSameGroup: number | undefined;
  let peerMedianOtherGroup: number | undefined;
  let gapPct: number | undefined;
  if (candidateGroup && sameGradePeers.length >= 2) {
    const sameGroup = sameGradePeers
      .filter((p) => (groupAttr === 'gender' ? p.gender : p.nationality) === candidateGroup)
      .map((p) => p.salary);
    const otherGroup = sameGradePeers
      .filter((p) => (groupAttr === 'gender' ? p.gender : p.nationality) !== candidateGroup)
      .map((p) => p.salary);
    peerMedianSameGroup = median(sameGroup);
    peerMedianOtherGroup = median(otherGroup);
    if (
      peerMedianSameGroup !== undefined &&
      peerMedianOtherGroup !== undefined &&
      peerMedianOtherGroup > 0
    ) {
      const gap = (peerMedianOtherGroup - offerSalary) / peerMedianOtherGroup;
      gapPct = Math.round(gap * 1000) / 1000;
      if (Math.abs(gap) >= 0.2) {
        reasons.push({
          code: 'EQUAL_PAY_GAP_MATERIAL',
          en: `Offer is ${(gap * 100).toFixed(1)}% off the median salary of peers in a different ${groupAttr} group.`,
          ar: `يبتعد العرض بنسبة ${(gap * 100).toFixed(1)}% عن متوسط رواتب الزملاء في مجموعة ${groupAttr} مختلفة.`,
        });
      } else if (Math.abs(gap) >= 0.1) {
        reasons.push({
          code: 'EQUAL_PAY_GAP_MODERATE',
          en: `Moderate ${(gap * 100).toFixed(1)}% pay gap vs other ${groupAttr} group — review before offer release.`,
          ar: `فجوة أجور معتدلة (${(gap * 100).toFixed(1)}%) مقارنة بمجموعة ${groupAttr} الأخرى — راجع قبل إصدار العرض.`,
        });
      }
    }
  }

  let outcome: ComplianceOutcome = 'PASS';
  if (
    reasons.some((r) => r.code === 'EQUAL_PAY_GAP_MATERIAL' || r.code === 'OFFER_BELOW_BAND_MIN')
  ) {
    outcome = 'FAIL';
  } else if (reasons.length > 0) {
    outcome = 'WARN';
  }
  if (outcome === 'PASS') {
    reasons.push({
      code: 'EQUAL_PAY_PASS',
      en: 'Offer sits within band and aligns with peer median for the candidate group.',
      ar: 'العرض ضمن النطاق ومتسق مع متوسط رواتب مجموعة المرشح.',
    });
  }
  return {
    outcome,
    compaRatio,
    bandPosition,
    peerMedianSameGroup,
    peerMedianOtherGroup,
    gapPct,
    reasons,
  };
}

// =============================================================================
// S-NAT — Nationalization quota gating on hire
// =============================================================================

export interface NationalizationGateInput {
  currentNationals: number;
  currentTotal: number;
  /** Required minimum nationals ratio (0..1). */
  requiredRatio: number;
  /** Is the candidate considered a "national" for this country's quota? */
  candidateIsNational: boolean;
  /** Optional grace buffer — how many points below floor still PASS without grace. */
  graceBufferPct?: number;
}

export interface NationalizationGateVerdict {
  outcome: ComplianceOutcome;
  currentRatio: number;
  projectedRatio: number;
  requiredRatio: number;
  reason: BilingualReason;
}

/**
 * Pure quota-gate evaluator. Hiring a non-national must not move the
 * nationalization ratio below floor; hiring a national always passes.
 */
export function evaluateNationalizationGate(
  input: NationalizationGateInput
): NationalizationGateVerdict {
  const grace = input.graceBufferPct ?? 0;
  const currentTotal = Math.max(0, input.currentTotal);
  const currentRatio = currentTotal === 0 ? 0 : input.currentNationals / currentTotal;
  const projectedNationals = input.currentNationals + (input.candidateIsNational ? 1 : 0);
  const projectedTotal = currentTotal + 1;
  const projectedRatio = projectedNationals / projectedTotal;
  const floorWithGrace = Math.max(0, input.requiredRatio - grace);

  if (input.candidateIsNational) {
    return {
      outcome: 'PASS',
      currentRatio: round3(currentRatio),
      projectedRatio: round3(projectedRatio),
      requiredRatio: input.requiredRatio,
      reason: {
        code: 'NAT_HIRE_INCREASES_RATIO',
        en: `Hire is a national — projected ratio ${(projectedRatio * 100).toFixed(1)}% strengthens compliance.`,
        ar: `التعيين لمواطن — النسبة المتوقعة ${(projectedRatio * 100).toFixed(1)}% تعزز الامتثال.`,
      },
    };
  }
  if (projectedRatio < floorWithGrace) {
    return {
      outcome: 'FAIL',
      currentRatio: round3(currentRatio),
      projectedRatio: round3(projectedRatio),
      requiredRatio: input.requiredRatio,
      reason: {
        code: 'NAT_HIRE_BREACHES_FLOOR',
        en: `Hiring this non-national would drop nationalization ratio to ${(projectedRatio * 100).toFixed(1)}%, below the ${(input.requiredRatio * 100).toFixed(1)}% required.`,
        ar: `سيؤدي التعيين إلى انخفاض نسبة التوطين إلى ${(projectedRatio * 100).toFixed(1)}%، أقل من ${(input.requiredRatio * 100).toFixed(1)}% المطلوبة.`,
      },
    };
  }
  if (projectedRatio < input.requiredRatio) {
    return {
      outcome: 'WARN',
      currentRatio: round3(currentRatio),
      projectedRatio: round3(projectedRatio),
      requiredRatio: input.requiredRatio,
      reason: {
        code: 'NAT_HIRE_NEAR_FLOOR',
        en: `Projected ratio ${(projectedRatio * 100).toFixed(1)}% within grace buffer but below required ${(input.requiredRatio * 100).toFixed(1)}%.`,
        ar: `النسبة المتوقعة ${(projectedRatio * 100).toFixed(1)}% ضمن حدود السماح لكن أقل من ${(input.requiredRatio * 100).toFixed(1)}% المطلوبة.`,
      },
    };
  }
  return {
    outcome: 'PASS',
    currentRatio: round3(currentRatio),
    projectedRatio: round3(projectedRatio),
    requiredRatio: input.requiredRatio,
    reason: {
      code: 'NAT_HIRE_WITHIN_QUOTA',
      en: `Non-national hire keeps ratio at ${(projectedRatio * 100).toFixed(1)}%, above required floor.`,
      ar: `تعيين غير المواطن يبقي النسبة عند ${(projectedRatio * 100).toFixed(1)}%، فوق الحد المطلوب.`,
    },
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
