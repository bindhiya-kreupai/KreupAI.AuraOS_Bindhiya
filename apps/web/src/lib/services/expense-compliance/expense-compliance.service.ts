/**
 * EPIC-27 Travel / Expense compliance — three audit-flagged 🟡 sub-stories:
 *
 *  S-EXCEPT   — policy-exception approval cadence (max days an exception
 *               can sit unreviewed before auto-escalation)
 *  S-DUPE     — duplicate-receipt detection (same vendor + date + amount)
 *  S-PERDIEM  — per-diem cap evaluator (country + city tier × days)
 *
 * Pure evaluators with bilingual reason text. No new Prisma models;
 * persistence on the existing Expense + ExpenseApproval models is the
 * caller's job. The API consumes these for read-only decisions.
 */

export type ComplianceOutcome = 'PASS' | 'WARN' | 'FAIL';

export interface BilingualReason {
  code: string;
  en: string;
  ar: string;
}

// =============================================================================
// S-EXCEPT — Policy-exception approval cadence
// =============================================================================

export interface PolicyException {
  exceptionId: string;
  raisedAt: Date;
  /** Latest decision timestamp (undefined when still pending). */
  decidedAt?: Date;
  /** Maximum days an exception can remain pending before escalation. */
  slaDays: number;
}

export interface ExceptionCadenceVerdict {
  exceptionId: string;
  ageDays: number;
  outcome: ComplianceOutcome;
  reason: BilingualReason;
}

/**
 * Pure evaluator. WARN within the second half of SLA, FAIL when overdue.
 * Already-decided exceptions PASS. Cap age at 9999 days to be safe.
 */
export function evaluatePolicyExceptionCadence(
  exception: PolicyException,
  asOf: Date = new Date()
): ExceptionCadenceVerdict {
  if (exception.decidedAt) {
    const days = Math.max(
      0,
      Math.floor(
        (exception.decidedAt.getTime() - exception.raisedAt.getTime()) / (24 * 3600 * 1000)
      )
    );
    return {
      exceptionId: exception.exceptionId,
      ageDays: days,
      outcome: 'PASS',
      reason: {
        code: 'EXC_DECIDED',
        en: `Exception decided ${days} day(s) after being raised.`,
        ar: `تم البت في الاستثناء بعد ${days} يوم من رفعه.`,
      },
    };
  }
  const ageDays = Math.min(
    9999,
    Math.max(0, Math.floor((asOf.getTime() - exception.raisedAt.getTime()) / (24 * 3600 * 1000)))
  );
  if (ageDays > exception.slaDays) {
    return {
      exceptionId: exception.exceptionId,
      ageDays,
      outcome: 'FAIL',
      reason: {
        code: 'EXC_OVERDUE',
        en: `Exception pending ${ageDays} day(s), exceeds SLA of ${exception.slaDays}. Auto-escalate to L2.`,
        ar: `الاستثناء معلق منذ ${ageDays} يوم، يتجاوز اتفاقية مستوى الخدمة ${exception.slaDays}. تصعيد تلقائي للمستوى الثاني.`,
      },
    };
  }
  if (ageDays * 2 > exception.slaDays) {
    return {
      exceptionId: exception.exceptionId,
      ageDays,
      outcome: 'WARN',
      reason: {
        code: 'EXC_SLA_HALF_GONE',
        en: `Exception is ${ageDays}d old of ${exception.slaDays}d SLA — nudge approver.`,
        ar: `مرّ ${ageDays} يوم من ${exception.slaDays} يوم لاتفاقية الخدمة — يلزم تذكير المعتمِد.`,
      },
    };
  }
  return {
    exceptionId: exception.exceptionId,
    ageDays,
    outcome: 'PASS',
    reason: {
      code: 'EXC_ON_TRACK',
      en: `Exception within SLA (${ageDays}d of ${exception.slaDays}d).`,
      ar: `الاستثناء ضمن اتفاقية الخدمة (${ageDays} من ${exception.slaDays} يوم).`,
    },
  };
}

// =============================================================================
// S-DUPE — Duplicate receipt detection
// =============================================================================

export interface ReceiptRecord {
  receiptId: string;
  employeeId: string;
  vendor: string;
  /** Local date string YYYY-MM-DD or ISO date — only the day portion is used. */
  date: string;
  amount: number;
  currency: string;
}

export interface DuplicateGroup {
  vendor: string;
  date: string;
  amount: number;
  currency: string;
  receiptIds: string[];
  reason: BilingualReason;
}

export interface DuplicateDetectionVerdict {
  outcome: ComplianceOutcome;
  duplicates: DuplicateGroup[];
  summary: BilingualReason;
}

function dayPart(d: string): string {
  return d.length >= 10 ? d.substring(0, 10) : d;
}

/**
 * Detect receipts with identical vendor + day + amount + currency for the
 * same employee. Exact-match detection (no fuzzy matching) is intentional —
 * the caller-friendly explicit signal is more actionable than fuzzy.
 */
export function detectDuplicateReceipts(receipts: ReceiptRecord[]): DuplicateDetectionVerdict {
  const groups = new Map<string, ReceiptRecord[]>();
  for (const r of receipts) {
    const key = `${r.employeeId}|${r.vendor.trim().toLowerCase()}|${dayPart(r.date)}|${r.amount}|${r.currency}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const duplicates: DuplicateGroup[] = [];
  for (const [, rows] of groups) {
    if (rows.length > 1) {
      duplicates.push({
        vendor: rows[0].vendor,
        date: dayPart(rows[0].date),
        amount: rows[0].amount,
        currency: rows[0].currency,
        receiptIds: rows.map((r) => r.receiptId),
        reason: {
          code: 'DUPE_RECEIPT',
          en: `${rows.length} receipts share vendor "${rows[0].vendor}", date ${dayPart(rows[0].date)}, amount ${rows[0].amount} ${rows[0].currency}.`,
          ar: `${rows.length} إيصالات تتطابق في البائع "${rows[0].vendor}" والتاريخ ${dayPart(rows[0].date)} والقيمة ${rows[0].amount} ${rows[0].currency}.`,
        },
      });
    }
  }
  const outcome: ComplianceOutcome =
    duplicates.length === 0 ? 'PASS' : duplicates.length === 1 ? 'WARN' : 'FAIL';
  const summary: BilingualReason =
    outcome === 'PASS'
      ? {
          code: 'NO_DUPLICATES',
          en: 'No duplicate receipts detected.',
          ar: 'لا توجد إيصالات مكررة.',
        }
      : outcome === 'WARN'
        ? {
            code: 'DUPE_SINGLE',
            en: '1 duplicate group detected — confirm with employee before posting.',
            ar: 'تم رصد مجموعة مكررة واحدة — يلزم تأكيد الموظف قبل الترحيل.',
          }
        : {
            code: 'DUPE_MULTI',
            en: `${duplicates.length} duplicate groups detected — hold reimbursement.`,
            ar: `تم رصد ${duplicates.length} مجموعات مكررة — يلزم تعليق الصرف.`,
          };
  return { outcome, duplicates, summary };
}

// =============================================================================
// S-PERDIEM — Per-diem cap evaluator
// =============================================================================

export type CityTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export interface PerDiemPolicy {
  countryCode: string;
  /** Per-day cap by city tier in policy currency. */
  capsByTier: Record<CityTier, number>;
  currency: string;
}

export interface PerDiemClaimInput {
  countryCode: string;
  cityTier: CityTier;
  daysClaimed: number;
  totalClaimedAmount: number;
  /** Whether 2 meals were provided by host (reduces cap by 50%). */
  mealsProvided?: boolean;
}

export interface PerDiemVerdict {
  outcome: ComplianceOutcome;
  effectiveDailyCap: number;
  effectiveTotalCap: number;
  overspend: number;
  reason: BilingualReason;
}

export function evaluatePerDiemCap(
  input: PerDiemClaimInput,
  policy: PerDiemPolicy
): PerDiemVerdict {
  if (input.countryCode !== policy.countryCode) {
    return {
      outcome: 'FAIL',
      effectiveDailyCap: 0,
      effectiveTotalCap: 0,
      overspend: input.totalClaimedAmount,
      reason: {
        code: 'PER_DIEM_NO_POLICY',
        en: `No per-diem policy configured for country ${input.countryCode}.`,
        ar: `لا توجد سياسة بدل يومي مهيأة للدولة ${input.countryCode}.`,
      },
    };
  }
  const baseDaily = policy.capsByTier[input.cityTier] ?? 0;
  const effectiveDailyCap = input.mealsProvided ? baseDaily * 0.5 : baseDaily;
  const effectiveTotalCap = effectiveDailyCap * Math.max(0, input.daysClaimed);
  const overspend = Math.max(0, input.totalClaimedAmount - effectiveTotalCap);

  if (effectiveDailyCap === 0) {
    return {
      outcome: 'FAIL',
      effectiveDailyCap,
      effectiveTotalCap,
      overspend,
      reason: {
        code: 'PER_DIEM_TIER_NOT_SET',
        en: `No per-diem rate configured for ${input.cityTier} in ${input.countryCode}.`,
        ar: `لا يوجد سعر بدل يومي مهيأ لمستوى ${input.cityTier} في ${input.countryCode}.`,
      },
    };
  }

  if (overspend > 0) {
    const pct = (overspend / Math.max(1, effectiveTotalCap)) * 100;
    return {
      outcome: pct > 20 ? 'FAIL' : 'WARN',
      effectiveDailyCap,
      effectiveTotalCap,
      overspend: round2(overspend),
      reason: {
        code: 'PER_DIEM_OVER_CAP',
        en: `Claim exceeds policy cap by ${overspend.toFixed(2)} ${policy.currency} (${pct.toFixed(1)}%).`,
        ar: `يتجاوز المطالب الحد المسموح به بمقدار ${overspend.toFixed(2)} ${policy.currency} (${pct.toFixed(1)}%).`,
      },
    };
  }
  return {
    outcome: 'PASS',
    effectiveDailyCap,
    effectiveTotalCap,
    overspend: 0,
    reason: {
      code: 'PER_DIEM_WITHIN_CAP',
      en: `Claim within policy cap (${input.totalClaimedAmount.toFixed(2)} of ${effectiveTotalCap.toFixed(2)} ${policy.currency}).`,
      ar: `المطالب ضمن الحد (${input.totalClaimedAmount.toFixed(2)} من ${effectiveTotalCap.toFixed(2)} ${policy.currency}).`,
    },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
