/**
 * EPIC-06 pre-joining + joining-day checklist engine.
 *
 * Closes the audit gaps "Pre-joining checklist missing" and
 * "joining-day formalities missing" for EPIC-06 Onboarding.
 *
 * The classic enterprise onboarding flow is two staged checklists:
 *
 *   Pre-joining (T-30 days .. T-1):
 *     - candidate signs offer
 *     - background verification clears
 *     - work permit / visa filed
 *     - medical fitness uploaded
 *     - bank account opened
 *     - laptop / equipment requested
 *     - team-introduction email scheduled
 *
 *   Joining-day (T0):
 *     - employee ID issued
 *     - email + SSO access provisioned
 *     - parking pass / building access enabled
 *     - HR induction session attended
 *     - policy acknowledgements signed (POLICY_HUB)
 *     - IT induction attended
 *     - line-manager 1:1 scheduled
 *
 * Each item carries an owner role + a due date computed from the
 * joining date. The service exposes:
 *
 *   buildChecklist(joiningDate, options?) — pure helper that returns
 *   the full ordered list with computed due dates.
 *
 *   completionSummary(items) — pure roll-up: counts done / pending /
 *   overdue per stage + an overall % complete.
 *
 * No schema change required — items can be persisted into the
 * existing `onboardingCase.metadata` JSON column.
 */

export type OnboardingStage = 'PRE_JOINING' | 'JOINING_DAY' | 'POST_JOINING';

export type OnboardingOwnerRole =
  | 'HR_BUSINESS_PARTNER'
  | 'RECRUITER'
  | 'IT_HELPDESK'
  | 'FACILITIES'
  | 'PRO_GOVT_RELATIONS'
  | 'LINE_MANAGER'
  | 'CANDIDATE';

export interface OnboardingItemTemplate {
  code: string;
  stage: OnboardingStage;
  label: string;
  labelAr: string;
  owner: OnboardingOwnerRole;
  /** Days relative to joining date (negative = before, 0 = on, positive = after). */
  daysFromJoining: number;
  /** Higher = more important; UI sorts by stage then severity desc. */
  severity: 'BLOCKER' | 'HIGH' | 'NORMAL';
  /** True when the item must be done before the candidate may be marked JOINED. */
  blocksOnJoin: boolean;
}

export interface OnboardingItem extends OnboardingItemTemplate {
  dueDate: Date;
  status: 'PENDING' | 'DONE' | 'SKIPPED';
  completedAt?: Date;
  completedBy?: string;
}

export const DEFAULT_PRE_JOINING_TEMPLATE: OnboardingItemTemplate[] = [
  {
    code: 'OFFER_SIGNED',
    stage: 'PRE_JOINING',
    label: 'Candidate signs offer letter',
    labelAr: 'توقيع المرشح على خطاب العرض',
    owner: 'CANDIDATE',
    daysFromJoining: -30,
    severity: 'BLOCKER',
    blocksOnJoin: true,
  },
  {
    code: 'BGV_CLEARED',
    stage: 'PRE_JOINING',
    label: 'Background verification cleared',
    labelAr: 'إكمال التحقق من الخلفية',
    owner: 'RECRUITER',
    daysFromJoining: -21,
    severity: 'BLOCKER',
    blocksOnJoin: true,
  },
  {
    code: 'VISA_FILED',
    stage: 'PRE_JOINING',
    label: 'Work permit / visa filed',
    labelAr: 'تقديم تصريح العمل / التأشيرة',
    owner: 'PRO_GOVT_RELATIONS',
    daysFromJoining: -21,
    severity: 'BLOCKER',
    blocksOnJoin: true,
  },
  {
    code: 'MEDICAL_FITNESS',
    stage: 'PRE_JOINING',
    label: 'Medical fitness certificate uploaded',
    labelAr: 'رفع شهادة اللياقة الطبية',
    owner: 'CANDIDATE',
    daysFromJoining: -14,
    severity: 'BLOCKER',
    blocksOnJoin: true,
  },
  {
    code: 'BANK_ACCOUNT',
    stage: 'PRE_JOINING',
    label: 'Bank account opened (for payroll)',
    labelAr: 'فتح حساب مصرفي (للراتب)',
    owner: 'CANDIDATE',
    daysFromJoining: -7,
    severity: 'HIGH',
    blocksOnJoin: false,
  },
  {
    code: 'EQUIPMENT_REQUEST',
    stage: 'PRE_JOINING',
    label: 'Laptop / equipment requested',
    labelAr: 'طلب جهاز / معدات',
    owner: 'IT_HELPDESK',
    daysFromJoining: -5,
    severity: 'HIGH',
    blocksOnJoin: false,
  },
  {
    code: 'TEAM_INTRO_EMAIL',
    stage: 'PRE_JOINING',
    label: 'Team-introduction email scheduled',
    labelAr: 'جدولة بريد التعريف بالفريق',
    owner: 'HR_BUSINESS_PARTNER',
    daysFromJoining: -2,
    severity: 'NORMAL',
    blocksOnJoin: false,
  },
];

export const DEFAULT_JOINING_DAY_TEMPLATE: OnboardingItemTemplate[] = [
  {
    code: 'EMPLOYEE_ID',
    stage: 'JOINING_DAY',
    label: 'Employee ID issued',
    labelAr: 'إصدار رقم الموظف',
    owner: 'HR_BUSINESS_PARTNER',
    daysFromJoining: 0,
    severity: 'BLOCKER',
    blocksOnJoin: true,
  },
  {
    code: 'EMAIL_SSO',
    stage: 'JOINING_DAY',
    label: 'Email + SSO access provisioned',
    labelAr: 'تفعيل البريد الإلكتروني وصلاحيات الدخول',
    owner: 'IT_HELPDESK',
    daysFromJoining: 0,
    severity: 'BLOCKER',
    blocksOnJoin: true,
  },
  {
    code: 'BUILDING_ACCESS',
    stage: 'JOINING_DAY',
    label: 'Parking pass + building access enabled',
    labelAr: 'تفعيل تصريح الدخول والموقف',
    owner: 'FACILITIES',
    daysFromJoining: 0,
    severity: 'HIGH',
    blocksOnJoin: false,
  },
  {
    code: 'HR_INDUCTION',
    stage: 'JOINING_DAY',
    label: 'HR induction session attended',
    labelAr: 'حضور جلسة التعريف من الموارد البشرية',
    owner: 'HR_BUSINESS_PARTNER',
    daysFromJoining: 0,
    severity: 'HIGH',
    blocksOnJoin: false,
  },
  {
    code: 'POLICY_ACKS',
    stage: 'JOINING_DAY',
    label: 'Mandatory policy acknowledgements signed',
    labelAr: 'توقيع إقرارات السياسات الإلزامية',
    owner: 'CANDIDATE',
    daysFromJoining: 0,
    severity: 'BLOCKER',
    blocksOnJoin: true,
  },
  {
    code: 'IT_INDUCTION',
    stage: 'JOINING_DAY',
    label: 'IT induction attended (security + tools)',
    labelAr: 'حضور جلسة تعريف تقنية المعلومات (الأمان والأدوات)',
    owner: 'IT_HELPDESK',
    daysFromJoining: 0,
    severity: 'NORMAL',
    blocksOnJoin: false,
  },
  {
    code: 'MANAGER_1ON1',
    stage: 'JOINING_DAY',
    label: 'Line-manager 1:1 scheduled',
    labelAr: 'جدولة لقاء فردي مع المدير المباشر',
    owner: 'LINE_MANAGER',
    daysFromJoining: 0,
    severity: 'NORMAL',
    blocksOnJoin: false,
  },
];

/**
 * Pure helper: build the full ordered checklist for a joining date.
 */
export function buildChecklist(
  joiningDate: Date,
  options: {
    preJoiningTemplate?: OnboardingItemTemplate[];
    joiningDayTemplate?: OnboardingItemTemplate[];
  } = {}
): OnboardingItem[] {
  const pre = options.preJoiningTemplate ?? DEFAULT_PRE_JOINING_TEMPLATE;
  const day = options.joiningDayTemplate ?? DEFAULT_JOINING_DAY_TEMPLATE;
  const items: OnboardingItem[] = [...pre, ...day].map((t) => {
    const due = new Date(joiningDate);
    due.setDate(due.getDate() + t.daysFromJoining);
    return { ...t, dueDate: due, status: 'PENDING' };
  });
  // Sort by stage (PRE first), then by daysFromJoining asc, then severity desc.
  const sevWeight = { BLOCKER: 3, HIGH: 2, NORMAL: 1 } as const;
  items.sort((a, b) => {
    if (a.stage !== b.stage) return a.stage === 'PRE_JOINING' ? -1 : 1;
    if (a.daysFromJoining !== b.daysFromJoining) return a.daysFromJoining - b.daysFromJoining;
    return sevWeight[b.severity] - sevWeight[a.severity];
  });
  return items;
}

export interface CompletionSummary {
  total: number;
  done: number;
  skipped: number;
  pending: number;
  overdue: number;
  blockersDone: number;
  blockersTotal: number;
  pctComplete: number;
  pctBlockersComplete: number;
  canJoin: boolean;
  byStage: Record<OnboardingStage, { total: number; done: number; pending: number }>;
}

export function completionSummary(
  items: OnboardingItem[],
  asOf: Date = new Date()
): CompletionSummary {
  const summary: CompletionSummary = {
    total: items.length,
    done: 0,
    skipped: 0,
    pending: 0,
    overdue: 0,
    blockersDone: 0,
    blockersTotal: 0,
    pctComplete: 0,
    pctBlockersComplete: 0,
    canJoin: true,
    byStage: {
      PRE_JOINING: { total: 0, done: 0, pending: 0 },
      JOINING_DAY: { total: 0, done: 0, pending: 0 },
      POST_JOINING: { total: 0, done: 0, pending: 0 },
    },
  };
  for (const i of items) {
    summary.byStage[i.stage].total += 1;
    if (i.status === 'DONE') {
      summary.done += 1;
      summary.byStage[i.stage].done += 1;
    } else if (i.status === 'SKIPPED') {
      summary.skipped += 1;
    } else {
      summary.pending += 1;
      summary.byStage[i.stage].pending += 1;
      if (i.dueDate.getTime() < asOf.getTime()) summary.overdue += 1;
    }
    if (i.blocksOnJoin) {
      summary.blockersTotal += 1;
      if (i.status === 'DONE') summary.blockersDone += 1;
      else summary.canJoin = false;
    }
  }
  summary.pctComplete =
    summary.total > 0 ? Math.round(((summary.done + summary.skipped) / summary.total) * 100) : 0;
  summary.pctBlockersComplete =
    summary.blockersTotal > 0
      ? Math.round((summary.blockersDone / summary.blockersTotal) * 100)
      : 100;
  return summary;
}
