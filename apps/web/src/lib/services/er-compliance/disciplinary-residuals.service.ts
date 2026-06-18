/**
 * EPIC-26 Employee Relations / Disciplinary — residual closures.
 *
 * Four pure evaluators (plus letter generator):
 *
 *   1. evaluateEvidenceChainOfCustody — every evidence item must have an
 *      unbroken custody chain from seizure through hearing. Surfaces
 *      gaps, signature-missing transfers, and hand-off > 24h delays.
 *
 *   2. evaluateHearingNoticeCompleteness — hearing-notice template must
 *      include all required elements (date, time, venue, allegations,
 *      right-to-representation, right-to-respond, etc.). Returns missing
 *      element list with bilingual reasons.
 *
 *   3. evaluateAppealSlaCadence — appeals must be acknowledged within
 *      N days and resolved within M days. Returns breached & at-risk.
 *
 *   4. generateDisciplinaryLetter — given action type + facts, produce
 *      a bilingual letter body. Pure template; no DB.
 *
 * No new Prisma models needed.
 */

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// ============================================================================
// 1. Evidence chain-of-custody
// ============================================================================

export interface CustodyTransfer {
  fromUserId: string;
  toUserId: string;
  transferredAt: Date;
  /** Signed acknowledgement by recipient. */
  signedByRecipient: boolean;
  /** Optional note explaining the transfer. */
  note?: string;
}

export interface EvidenceItem {
  evidenceId: string;
  /** When the evidence was first seized / captured. */
  seizedAt: Date;
  /** Who collected the evidence (seizing officer). */
  seizedBy: string;
  /** Where it is now stored, or 'HEARING_PRESENTED'. */
  currentCustodian: string;
  transfers: CustodyTransfer[];
}

export type CustodyFailureCode =
  | 'NO_INITIAL_SIGNATURE'
  | 'UNSIGNED_TRANSFER'
  | 'CUSTODY_GAP'
  | 'HAND_OFF_DELAYED'
  | 'CUSTODIAN_MISMATCH';

export interface CustodyFailure {
  evidenceId: string;
  code: CustodyFailureCode;
  description: string;
  descriptionAr: string;
  severity: Severity;
}

export interface CustodyReport {
  totals: {
    evidenceCount: number;
    itemsWithFailures: number;
    failures: number;
    integrityPct: number;
  };
  failures: CustodyFailure[];
}

const HAND_OFF_MAX_HOURS = 24;

export function evaluateEvidenceChainOfCustody(evidence: EvidenceItem[]): CustodyReport {
  const failures: CustodyFailure[] = [];
  const breached = new Set<string>();
  for (const item of evidence) {
    // Build the implied custody trail: seizedBy → transfers... → expected last toUserId == currentCustodian
    const trail = [item.seizedBy, ...item.transfers.map((t) => t.toUserId)];
    const expectedFinal = trail[trail.length - 1];

    // 1. Each transfer must be signed.
    for (const t of item.transfers) {
      if (!t.signedByRecipient) {
        failures.push({
          evidenceId: item.evidenceId,
          code: 'UNSIGNED_TRANSFER',
          description: `Transfer from ${t.fromUserId} to ${t.toUserId} not signed by recipient`,
          descriptionAr: `النقل من ${t.fromUserId} إلى ${t.toUserId} غير موقع من المستلم`,
          severity: 'HIGH',
        });
        breached.add(item.evidenceId);
      }
    }

    // 2. Custody must be contiguous: each transfer.fromUserId must equal the previous holder.
    let holder = item.seizedBy;
    for (const t of item.transfers) {
      if (t.fromUserId !== holder) {
        failures.push({
          evidenceId: item.evidenceId,
          code: 'CUSTODY_GAP',
          description: `Custody gap: expected from ${holder}, got ${t.fromUserId}`,
          descriptionAr: `فجوة حضانة: المتوقع من ${holder} والمستلم ${t.fromUserId}`,
          severity: 'CRITICAL',
        });
        breached.add(item.evidenceId);
      }
      holder = t.toUserId;
    }

    // 3. currentCustodian must match the last transfer recipient (or seizedBy when no transfers).
    if (expectedFinal !== item.currentCustodian) {
      failures.push({
        evidenceId: item.evidenceId,
        code: 'CUSTODIAN_MISMATCH',
        description: `Current custodian ${item.currentCustodian} does not match last trail entry ${expectedFinal}`,
        descriptionAr: `الحارس الحالي ${item.currentCustodian} لا يطابق آخر سجل ${expectedFinal}`,
        severity: 'HIGH',
      });
      breached.add(item.evidenceId);
    }

    // 4. Hand-off delay: first transfer must occur within HAND_OFF_MAX_HOURS of seizure
    //    when transfers exist.
    if (item.transfers.length > 0) {
      const delta =
        (item.transfers[0].transferredAt.getTime() - item.seizedAt.getTime()) / (3600 * 1000);
      if (delta > HAND_OFF_MAX_HOURS) {
        failures.push({
          evidenceId: item.evidenceId,
          code: 'HAND_OFF_DELAYED',
          description: `Initial hand-off ${delta.toFixed(1)}h after seizure (max ${HAND_OFF_MAX_HOURS}h)`,
          descriptionAr: `أول تسليم بعد ${delta.toFixed(1)} ساعة (الحد ${HAND_OFF_MAX_HOURS})`,
          severity: 'MEDIUM',
        });
        breached.add(item.evidenceId);
      }
    } else if (item.seizedBy !== item.currentCustodian) {
      failures.push({
        evidenceId: item.evidenceId,
        code: 'NO_INITIAL_SIGNATURE',
        description: 'Evidence appears to have moved without any signed transfer',
        descriptionAr: 'الدليل انتقل بدون أي توقيع نقل',
        severity: 'CRITICAL',
      });
      breached.add(item.evidenceId);
    }
  }
  const count = evidence.length;
  const integrityPct = count === 0 ? 100 : Math.round(((count - breached.size) / count) * 100);
  return {
    totals: {
      evidenceCount: count,
      itemsWithFailures: breached.size,
      failures: failures.length,
      integrityPct,
    },
    failures,
  };
}

// ============================================================================
// 2. Hearing-notice template completeness
// ============================================================================

export interface HearingNotice {
  noticeId: string;
  /** Hearing date. */
  hearingDate?: Date;
  /** Hearing time HH:MM. */
  hearingTime?: string;
  venue?: string;
  /** Bilingual list of allegations. */
  allegations?: Array<{ en: string; ar: string }>;
  /** Whether the right to representation is stated. */
  rightToRepresentation?: boolean;
  /** Whether the right to respond in writing is stated. */
  rightToRespondInWriting?: boolean;
  /** Whether the right to call witnesses is stated. */
  rightToCallWitnesses?: boolean;
  /** Minimum notice period in days afforded. */
  noticePeriodDays?: number;
  /** Whether the notice has been served (bilingual delivery). */
  servedBilingually?: boolean;
}

export type HearingNoticeIssueCode =
  | 'MISSING_DATE'
  | 'MISSING_TIME'
  | 'MISSING_VENUE'
  | 'MISSING_ALLEGATIONS'
  | 'MISSING_RIGHT_REPRESENTATION'
  | 'MISSING_RIGHT_RESPOND'
  | 'MISSING_RIGHT_WITNESSES'
  | 'INSUFFICIENT_NOTICE_PERIOD'
  | 'NOT_BILINGUAL';

export interface HearingNoticeIssue {
  code: HearingNoticeIssueCode;
  description: string;
  descriptionAr: string;
  severity: Severity;
}

export interface HearingNoticeReport {
  pass: boolean;
  completenessPct: number;
  issues: HearingNoticeIssue[];
}

/**
 * Minimum notice period in days. KSA Labour Law / UAE Labour Law set
 * employer-discretion windows; we set a conservative 3-day floor that
 * matches the most common GCC HR-policy floor.
 */
const MIN_NOTICE_PERIOD_DAYS = 3;

export function evaluateHearingNoticeCompleteness(notice: HearingNotice): HearingNoticeReport {
  const issues: HearingNoticeIssue[] = [];
  const push = (code: HearingNoticeIssueCode, en: string, ar: string, sev: Severity) =>
    issues.push({ code, description: en, descriptionAr: ar, severity: sev });

  if (!notice.hearingDate)
    push('MISSING_DATE', 'Hearing date missing', 'تاريخ الجلسة مفقود', 'CRITICAL');
  if (!notice.hearingTime) push('MISSING_TIME', 'Hearing time missing', 'وقت الجلسة مفقود', 'HIGH');
  if (!notice.venue) push('MISSING_VENUE', 'Hearing venue missing', 'مكان الجلسة مفقود', 'HIGH');
  if (!notice.allegations || notice.allegations.length === 0)
    push('MISSING_ALLEGATIONS', 'Allegations not stated', 'لم تُذكر الاتهامات', 'CRITICAL');
  if (!notice.rightToRepresentation)
    push(
      'MISSING_RIGHT_REPRESENTATION',
      'Right to representation not stated',
      'حق التمثيل غير مذكور',
      'HIGH'
    );
  if (!notice.rightToRespondInWriting)
    push(
      'MISSING_RIGHT_RESPOND',
      'Right to respond in writing not stated',
      'حق الرد كتابياً غير مذكور',
      'MEDIUM'
    );
  if (!notice.rightToCallWitnesses)
    push(
      'MISSING_RIGHT_WITNESSES',
      'Right to call witnesses not stated',
      'حق استدعاء الشهود غير مذكور',
      'MEDIUM'
    );
  if (
    typeof notice.noticePeriodDays !== 'number' ||
    notice.noticePeriodDays < MIN_NOTICE_PERIOD_DAYS
  ) {
    push(
      'INSUFFICIENT_NOTICE_PERIOD',
      `Notice period < ${MIN_NOTICE_PERIOD_DAYS} days`,
      `فترة الإشعار أقل من ${MIN_NOTICE_PERIOD_DAYS} أيام`,
      'HIGH'
    );
  }
  if (!notice.servedBilingually)
    push(
      'NOT_BILINGUAL',
      'Notice not served bilingually (en + ar)',
      'الإشعار لم يُسلم بالعربية والإنجليزية',
      'MEDIUM'
    );

  const expectedItems = 9;
  const passed = expectedItems - issues.length;
  const completenessPct = Math.round((passed / expectedItems) * 100);
  const noCritical = !issues.some((i) => i.severity === 'CRITICAL');
  return { pass: noCritical && completenessPct >= 80, completenessPct, issues };
}

// ============================================================================
// 3. Appeal SLA cadence
// ============================================================================

export type AppealStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'WITHDRAWN';

export interface AppealRecord {
  appealId: string;
  employeeId: string;
  filedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  status: AppealStatus;
}

export interface AppealSlaInput {
  appeals: AppealRecord[];
  /** Acknowledge SLA — default 3 days. */
  ackDays?: number;
  /** Resolution SLA — default 21 days. */
  resolveDays?: number;
  asOf: Date;
}

export type AppealBreachCode = 'ACK_BREACH' | 'ACK_AT_RISK' | 'RESOLVE_BREACH' | 'RESOLVE_AT_RISK';

export interface AppealBreach {
  appealId: string;
  code: AppealBreachCode;
  daysElapsed: number;
  sla: number;
  description: string;
  descriptionAr: string;
  severity: Severity;
}

export interface AppealSlaReport {
  totals: {
    appealsChecked: number;
    breaches: number;
    atRisk: number;
    compliancePct: number;
  };
  breaches: AppealBreach[];
}

const AT_RISK_BUFFER_DAYS = 1;

export function evaluateAppealSlaCadence(input: AppealSlaInput): AppealSlaReport {
  const ackDays = input.ackDays ?? 3;
  const resolveDays = input.resolveDays ?? 21;
  const breaches: AppealBreach[] = [];
  const breachedIds = new Set<string>();
  const atRiskIds = new Set<string>();

  for (const a of input.appeals) {
    if (a.status === 'WITHDRAWN') continue;

    // Ack SLA — applies until acknowledged.
    if (!a.acknowledgedAt) {
      const days = Math.floor((input.asOf.getTime() - a.filedAt.getTime()) / (24 * 3600 * 1000));
      if (days > ackDays) {
        breaches.push({
          appealId: a.appealId,
          code: 'ACK_BREACH',
          daysElapsed: days,
          sla: ackDays,
          description: `Appeal not acknowledged in ${days}d (SLA ${ackDays}d)`,
          descriptionAr: `لم يتم الإقرار بالطعن خلال ${days} يوم (الحد ${ackDays})`,
          severity: 'HIGH',
        });
        breachedIds.add(a.appealId);
      } else if (days >= ackDays - AT_RISK_BUFFER_DAYS) {
        breaches.push({
          appealId: a.appealId,
          code: 'ACK_AT_RISK',
          daysElapsed: days,
          sla: ackDays,
          description: `Appeal acknowledge SLA at risk (${days}/${ackDays}d)`,
          descriptionAr: `الإقرار في خطر (${days}/${ackDays} يوم)`,
          severity: 'MEDIUM',
        });
        atRiskIds.add(a.appealId);
      }
    }

    // Resolve SLA — applies until resolved.
    if (!a.resolvedAt) {
      const days = Math.floor((input.asOf.getTime() - a.filedAt.getTime()) / (24 * 3600 * 1000));
      if (days > resolveDays) {
        breaches.push({
          appealId: a.appealId,
          code: 'RESOLVE_BREACH',
          daysElapsed: days,
          sla: resolveDays,
          description: `Appeal not resolved in ${days}d (SLA ${resolveDays}d)`,
          descriptionAr: `لم يُحل الطعن خلال ${days} يوم (الحد ${resolveDays})`,
          severity: 'CRITICAL',
        });
        breachedIds.add(a.appealId);
      } else if (days >= resolveDays - AT_RISK_BUFFER_DAYS) {
        breaches.push({
          appealId: a.appealId,
          code: 'RESOLVE_AT_RISK',
          daysElapsed: days,
          sla: resolveDays,
          description: `Appeal resolve SLA at risk (${days}/${resolveDays}d)`,
          descriptionAr: `الحل في خطر (${days}/${resolveDays} يوم)`,
          severity: 'MEDIUM',
        });
        atRiskIds.add(a.appealId);
      }
    }
  }

  const checked = input.appeals.filter((a) => a.status !== 'WITHDRAWN').length;
  const compliancePct =
    checked === 0 ? 100 : Math.round(((checked - breachedIds.size) / checked) * 100);
  return {
    totals: {
      appealsChecked: checked,
      breaches: breachedIds.size,
      atRisk: atRiskIds.size,
      compliancePct,
    },
    breaches,
  };
}

// ============================================================================
// 4. Disciplinary letter generator
// ============================================================================

export type LetterActionType =
  | 'VERBAL_WARNING'
  | 'WRITTEN_WARNING'
  | 'FINAL_WRITTEN_WARNING'
  | 'SUSPENSION'
  | 'SALARY_DEDUCTION'
  | 'DEMOTION'
  | 'TERMINATION'
  | 'TERMINATION_FOR_CAUSE';

export interface DisciplinaryLetterInput {
  actionType: LetterActionType;
  employeeName: string;
  employeeNameAr?: string;
  employeeId: string;
  misconductSummary: string;
  misconductSummaryAr?: string;
  effectiveDate: Date;
  /** Suspension days (when actionType === SUSPENSION). */
  suspensionDays?: number;
  /** Salary deduction % (when actionType === SALARY_DEDUCTION). */
  salaryDeductionPct?: number;
  /** Issuing manager. */
  issuedBy: string;
  /** Country / labour-law reference (e.g. 'UAE Federal Decree 33/2021 §39'). */
  legalReference?: string;
}

export interface DisciplinaryLetter {
  subject: string;
  subjectAr: string;
  body: string;
  bodyAr: string;
  signOffBlock: string;
}

const ACTION_HEADINGS: Record<LetterActionType, { en: string; ar: string }> = {
  VERBAL_WARNING: { en: 'Verbal Warning', ar: 'إنذار شفهي' },
  WRITTEN_WARNING: { en: 'Written Warning', ar: 'إنذار خطي' },
  FINAL_WRITTEN_WARNING: { en: 'Final Written Warning', ar: 'إنذار خطي نهائي' },
  SUSPENSION: { en: 'Suspension Notice', ar: 'إشعار تعليق' },
  SALARY_DEDUCTION: { en: 'Salary Deduction Notice', ar: 'إشعار خصم من الراتب' },
  DEMOTION: { en: 'Demotion Notice', ar: 'إشعار تخفيض رتبة' },
  TERMINATION: { en: 'Notice of Termination', ar: 'إشعار إنهاء خدمة' },
  TERMINATION_FOR_CAUSE: { en: 'Termination for Cause', ar: 'إنهاء بسبب وجيه' },
};

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function generateDisciplinaryLetter(input: DisciplinaryLetterInput): DisciplinaryLetter {
  const heading = ACTION_HEADINGS[input.actionType];
  const eff = fmtDate(input.effectiveDate);
  const nameAr = input.employeeNameAr ?? input.employeeName;
  const summaryAr = input.misconductSummaryAr ?? input.misconductSummary;
  const legal = input.legalReference ?? 'as per applicable labour law and HR policy';
  const legalAr = input.legalReference
    ? input.legalReference
    : 'وفقاً للقانون المعمول به وسياسة الموارد البشرية';

  let extraEn = '';
  let extraAr = '';
  if (input.actionType === 'SUSPENSION' && input.suspensionDays) {
    extraEn = ` You will be suspended for ${input.suspensionDays} day(s).`;
    extraAr = ` ستُعلَّق عن العمل لمدة ${input.suspensionDays} يوم.`;
  } else if (input.actionType === 'SALARY_DEDUCTION' && input.salaryDeductionPct) {
    extraEn = ` A ${input.salaryDeductionPct}% deduction will be applied to your salary.`;
    extraAr = ` سيتم خصم ${input.salaryDeductionPct}% من راتبك.`;
  }

  const subject = `${heading.en} — ${input.employeeName} (${input.employeeId})`;
  const subjectAr = `${heading.ar} — ${nameAr} (${input.employeeId})`;

  const body = `Dear ${input.employeeName},

Following review of the incident described as "${input.misconductSummary}", the company has decided to issue the following disciplinary action: ${heading.en}, effective ${eff}.${extraEn}

This decision is made ${legal}. You have the right to appeal in writing within the period set out in the HR policy. Failure to comply with this notice may result in further disciplinary measures up to and including termination of employment.

This notice is issued in accordance with our maker-checker disciplinary process and will be filed in your personnel record.`;

  const bodyAr = `عزيزي/عزيزتي ${nameAr},

بعد مراجعة الواقعة الموصوفة بـ "${summaryAr}"، قررت الشركة إصدار الإجراء التأديبي التالي: ${heading.ar}، يسري اعتباراً من ${eff}.${extraAr}

هذا القرار صادر ${legalAr}. لك الحق في تقديم طعن خطي خلال الفترة المحددة في سياسة الموارد البشرية. عدم الالتزام بهذا الإشعار قد يؤدي إلى إجراءات تأديبية أخرى تصل إلى إنهاء العمل.

تم إصدار هذا الإشعار وفق عملية الموافقة بنظام صانع/مراجع وسيُحفظ في ملفك الشخصي.`;

  const signOffBlock = `Sincerely / مع تحياتنا,
${input.issuedBy}
Human Resources / إدارة الموارد البشرية`;

  return { subject, subjectAr, body, bodyAr, signOffBlock };
}
