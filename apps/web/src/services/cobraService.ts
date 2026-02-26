/**
 * @module cobraService
 * @description COBRA (Consolidated Omnibus Budget Reconciliation Act) continuation coverage —
 *   qualifying events, election periods, premium tracking, notice generation, and compliance audit.
 * @project AURA HCM Platform
 * @section 18.2 — COBRA Management
 *
 * Legal References:
 *  COBRA: 26 U.S.C. § 4980B; 29 U.S.C. §§ 1161-1168; 42 U.S.C. §§ 300bb-1 to 300bb-8
 *  Qualifying Events: ERISA § 603 — termination, reduction of hours, divorce, Medicare, dependent loss, bankruptcy
 *  Notice Deadlines: Employer — 30 days to notify plan administrator; Plan Administrator — 14 days
 *    to send election notice; Employee — 60 days to elect; First premium due — 45 days after election
 *  Duration: Termination/reduction 18 months; Divorce/dependent/Medicare 36 months; Disability 29 months
 *  Premium: Cannot exceed 102% of group rate (100% cost + 2% admin); disabled individuals 150% in months 19-29
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type CobraQualifyingEvent =
  | 'TERMINATION'
  | 'REDUCTION_OF_HOURS'
  | 'DIVORCE_LEGAL_SEPARATION'
  | 'MEDICARE_ENTITLEMENT'
  | 'DEPENDENT_LOSS_OF_STATUS'
  | 'EMPLOYER_BANKRUPTCY'
  | 'DEATH_OF_EMPLOYEE';

export type CobraStatus =
  | 'ELIGIBLE'
  | 'NOTICE_PENDING'
  | 'NOTICE_SENT'
  | 'ELECTED'
  | 'ACTIVE'
  | 'GRACE_PERIOD'
  | 'EXPIRED'
  | 'DECLINED'
  | 'CONVERTED';

export type CobraNoticeType =
  | 'INITIAL_NOTICE'
  | 'ELECTION_NOTICE'
  | 'UNAVAILABILITY_NOTICE'
  | 'EARLY_TERMINATION_NOTICE'
  | 'PREMIUM_INCREASE_NOTICE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'GRACE_PERIOD' | 'RETURNED';

export interface CobraQualifyingEventDetail {
  eventType: CobraQualifyingEvent;
  label: string;
  description: string;
  maxDurationMonths: number;
  coversBeneficiary: 'EMPLOYEE' | 'DEPENDENTS' | 'BOTH';
  employerNotifyDays: number; // Days employer has to notify plan administrator
  electionDays: number; // Days beneficiary has to elect COBRA
}

export interface CobraEnrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  qualifyingEvent: CobraQualifyingEvent;
  qualifyingEventDate: string;
  qualifyingEventId: string;
  status: CobraStatus;
  employerNotifyDate: string | null;
  adminNotifyDate: string | null;
  electionDeadline: string;
  electionDate: string | null;
  coverageStartDate: string | null;
  coverageEndDate: string | null;
  maxDurationMonths: number;
  electedPlans: CobraElectedPlan[];
  totalMonthlyPremium: number;
  beneficiaries: CobraBeneficiary[];
  payments: CobraPayment[];
  notices: CobraNoticeRecord[];
  notes: string;
  createdAt: string;
}

export interface CobraElectedPlan {
  planId: string;
  planName: string;
  planType: string;
  carrier: string;
  coverageLevel: string;
  originalMonthlyPremium: number;
  cobraMonthlyPremium: number; // originalPremium * 1.02
  effectiveDate: string;
}

export interface CobraBeneficiary {
  name: string;
  relationship: string;
  dateOfBirth: string;
  isElecting: boolean;
}

export interface CobraPayment {
  id: string;
  period: string; // YYYY-MM
  dueDate: string;
  amount: number;
  paidDate: string | null;
  status: PaymentStatus;
  paymentMethod: string | null;
  confirmationNumber: string | null;
  lateFeeApplied: number;
}

export interface CobraNoticeRecord {
  id: string;
  noticeType: CobraNoticeType;
  sentDate: string;
  deliveryMethod: 'EMAIL' | 'CERTIFIED_MAIL' | 'FIRST_CLASS_MAIL' | 'ELECTRONIC';
  recipient: string;
  recipientAddress: string;
  deliveryConfirmed: boolean;
  confirmationNumber: string | null;
  generatedBy: string;
}

export interface CobraTimeline {
  eventId: string;
  qualifyingEventDate: string;
  deadlines: CobraDeadline[];
  isCompliant: boolean;
  violations: string[];
}

export interface CobraDeadline {
  label: string;
  dueDate: string;
  completedDate: string | null;
  isOverdue: boolean;
  isCompleted: boolean;
  description: string;
  legalReference: string;
}

export interface CobraComplianceAudit {
  auditDate: string;
  totalEligibleEvents: number;
  noticesIssuedOnTime: number;
  noticesLate: number;
  electionsMade: number;
  activeEnrollees: number;
  expiredCoverage: number;
  violations: CobraViolation[];
  complianceScore: number; // 0-100
  recommendations: string[];
}

export interface CobraViolation {
  enrollmentId: string;
  employeeName: string;
  violationType: string;
  dueDate: string;
  currentDate: string;
  daysLate: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  potentialPenalty: string;
}

export interface CobraNoticeData {
  enrollmentId: string;
  employeeName: string;
  employeeAddress: string;
  qualifyingEvent: string;
  qualifyingEventDate: string;
  electionDeadline: string;
  availablePlans: CobraElectedPlan[];
  firstPaymentDue: string; // 45 days after election
  planAdministratorName: string;
  planAdministratorPhone: string;
  planAdministratorAddress: string;
  generatedDate: string;
}

export interface CobraFilters {
  status?: CobraStatus[];
  qualifyingEvent?: CobraQualifyingEvent[];
  startDate?: string;
  endDate?: string;
  department?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const QUALIFYING_EVENT_DETAILS: CobraQualifyingEventDetail[] = [
  {
    eventType: 'TERMINATION',
    label: 'Voluntary/Involuntary Termination',
    description: 'Employee termination (other than gross misconduct)',
    maxDurationMonths: 18,
    coversBeneficiary: 'BOTH',
    employerNotifyDays: 30,
    electionDays: 60,
  },
  {
    eventType: 'REDUCTION_OF_HOURS',
    label: 'Reduction of Hours',
    description: 'Reduction in work hours causing loss of coverage eligibility',
    maxDurationMonths: 18,
    coversBeneficiary: 'BOTH',
    employerNotifyDays: 30,
    electionDays: 60,
  },
  {
    eventType: 'DIVORCE_LEGAL_SEPARATION',
    label: 'Divorce or Legal Separation',
    description: 'Divorce or legal separation from covered employee',
    maxDurationMonths: 36,
    coversBeneficiary: 'DEPENDENTS',
    employerNotifyDays: 30,
    electionDays: 60,
  },
  {
    eventType: 'MEDICARE_ENTITLEMENT',
    label: 'Medicare Entitlement',
    description: 'Employee becomes entitled to Medicare benefits',
    maxDurationMonths: 36,
    coversBeneficiary: 'DEPENDENTS',
    employerNotifyDays: 30,
    electionDays: 60,
  },
  {
    eventType: 'DEPENDENT_LOSS_OF_STATUS',
    label: 'Dependent Loss of Status',
    description: 'Child loses dependent status (age-out, marriage, etc.)',
    maxDurationMonths: 36,
    coversBeneficiary: 'DEPENDENTS',
    employerNotifyDays: 30,
    electionDays: 60,
  },
  {
    eventType: 'EMPLOYER_BANKRUPTCY',
    label: 'Employer Bankruptcy',
    description: 'Employer files for Chapter 11 bankruptcy protection',
    maxDurationMonths: 36,
    coversBeneficiary: 'BOTH',
    employerNotifyDays: 30,
    electionDays: 60,
  },
  {
    eventType: 'DEATH_OF_EMPLOYEE',
    label: 'Death of Covered Employee',
    description: 'Death of the covered employee',
    maxDurationMonths: 36,
    coversBeneficiary: 'DEPENDENTS',
    employerNotifyDays: 30,
    electionDays: 60,
  },
];

const MOCK_COBRA_ENROLLMENTS: CobraEnrollment[] = [
  {
    id: 'cobra-001',
    employeeId: 'emp-029',
    employeeName: 'Raj Patel',
    employeeEmail: 'raj.patel@example.com',
    department: 'Operations',
    qualifyingEvent: 'TERMINATION',
    qualifyingEventDate: '2026-02-14',
    qualifyingEventId: 'qe-001',
    status: 'NOTICE_SENT',
    employerNotifyDate: '2026-02-15',
    adminNotifyDate: '2026-02-20',
    electionDeadline: '2026-04-21',
    electionDate: null,
    coverageStartDate: null,
    coverageEndDate: null,
    maxDurationMonths: 18,
    electedPlans: [],
    totalMonthlyPremium: 0,
    beneficiaries: [
      {
        name: 'Preethi Patel',
        relationship: 'Spouse',
        dateOfBirth: '1988-06-12',
        isElecting: false,
      },
      { name: 'Arjun Patel', relationship: 'Child', dateOfBirth: '2014-03-25', isElecting: false },
    ],
    payments: [],
    notices: [
      {
        id: 'ntc-001',
        noticeType: 'ELECTION_NOTICE',
        sentDate: '2026-02-20',
        deliveryMethod: 'CERTIFIED_MAIL',
        recipient: 'Raj Patel',
        recipientAddress: '42 Marina Vista, Dubai, UAE',
        deliveryConfirmed: true,
        confirmationNumber: 'USPS-2026-001122',
        generatedBy: 'HR Admin',
      },
    ],
    notes: 'Voluntary resignation — full COBRA election packet mailed',
    createdAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'cobra-002',
    employeeId: 'emp-040',
    employeeName: 'Sarah Kim',
    employeeEmail: 'sarah.kim@example.com',
    department: 'Technology',
    qualifyingEvent: 'TERMINATION',
    qualifyingEventDate: '2025-12-15',
    qualifyingEventId: 'qe-002',
    status: 'ACTIVE',
    employerNotifyDate: '2025-12-16',
    adminNotifyDate: '2025-12-20',
    electionDeadline: '2026-02-13',
    electionDate: '2026-01-10',
    coverageStartDate: '2026-01-01',
    coverageEndDate: '2027-07-01',
    maxDurationMonths: 18,
    electedPlans: [
      {
        planId: 'h-gold',
        planName: 'Balanced Choice (Gold)',
        planType: 'Medical',
        carrier: 'Blue Cross Blue Shield',
        coverageLevel: 'Employee Only',
        originalMonthlyPremium: 657,
        cobraMonthlyPremium: 670.14,
        effectiveDate: '2026-01-01',
      },
    ],
    totalMonthlyPremium: 670.14,
    beneficiaries: [],
    payments: [
      {
        id: 'cpay-001',
        period: '2026-01',
        dueDate: '2026-02-24',
        amount: 670.14,
        paidDate: '2026-01-28',
        status: 'PAID',
        paymentMethod: 'Bank Transfer',
        confirmationNumber: 'BANK-2026-0128',
        lateFeeApplied: 0,
      },
      {
        id: 'cpay-002',
        period: '2026-02',
        dueDate: '2026-02-28',
        amount: 670.14,
        paidDate: null,
        status: 'PENDING',
        paymentMethod: null,
        confirmationNumber: null,
        lateFeeApplied: 0,
      },
    ],
    notices: [
      {
        id: 'ntc-002',
        noticeType: 'ELECTION_NOTICE',
        sentDate: '2025-12-20',
        deliveryMethod: 'EMAIL',
        recipient: 'Sarah Kim',
        recipientAddress: 'sarah.kim@example.com',
        deliveryConfirmed: true,
        confirmationNumber: 'EMAIL-2025-1220-001',
        generatedBy: 'COBRA System',
      },
    ],
    notes: 'COBRA active — medical only elected',
    createdAt: '2025-12-16T09:00:00Z',
  },
  {
    id: 'cobra-003',
    employeeId: 'emp-090',
    employeeName: 'Priya Iyer',
    employeeEmail: 'priya.iyer@example.com',
    department: 'Product',
    qualifyingEvent: 'TERMINATION',
    qualifyingEventDate: '2026-02-28',
    qualifyingEventId: 'qe-003',
    status: 'ELIGIBLE',
    employerNotifyDate: null,
    adminNotifyDate: null,
    electionDeadline: '2026-04-29',
    electionDate: null,
    coverageStartDate: null,
    coverageEndDate: null,
    maxDurationMonths: 18,
    electedPlans: [],
    totalMonthlyPremium: 0,
    beneficiaries: [],
    payments: [],
    notices: [],
    notes: 'Pending initial notice generation',
    createdAt: '2026-02-28T17:00:00Z',
  },
  {
    id: 'cobra-004',
    employeeId: 'emp-055',
    employeeName: 'Diana Chen',
    employeeEmail: 'diana.chen@example.com',
    department: 'Finance',
    qualifyingEvent: 'DIVORCE_LEGAL_SEPARATION',
    qualifyingEventDate: '2026-01-08',
    qualifyingEventId: 'qe-004',
    status: 'ACTIVE',
    employerNotifyDate: '2026-01-10',
    adminNotifyDate: '2026-01-15',
    electionDeadline: '2026-03-08',
    electionDate: '2026-01-22',
    coverageStartDate: '2026-01-08',
    coverageEndDate: '2029-01-08',
    maxDurationMonths: 36,
    electedPlans: [
      {
        planId: 'h-gold',
        planName: 'Balanced Choice (Gold)',
        planType: 'Medical',
        carrier: 'Blue Cross Blue Shield',
        coverageLevel: 'Family',
        originalMonthlyPremium: 1550,
        cobraMonthlyPremium: 1581,
        effectiveDate: '2026-01-08',
      },
    ],
    totalMonthlyPremium: 1581,
    beneficiaries: [
      { name: 'Mei Chen', relationship: 'Child', dateOfBirth: '2012-07-19', isElecting: true },
      { name: 'Kevin Chen', relationship: 'Child', dateOfBirth: '2015-02-04', isElecting: true },
    ],
    payments: [
      {
        id: 'cpay-003',
        period: '2026-01',
        dueDate: '2026-03-08',
        amount: 1581,
        paidDate: '2026-02-15',
        status: 'PAID',
        paymentMethod: 'Credit Card',
        confirmationNumber: 'CC-2026-0215',
        lateFeeApplied: 0,
      },
    ],
    notices: [],
    notes: '36-month coverage — divorce qualifying event',
    createdAt: '2026-01-10T10:00:00Z',
  },
];

// ── Helper Functions ───────────────────────────────────────────────────────────

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

// ── Service Functions ──────────────────────────────────────────────────────────

/**
 * Get all available COBRA qualifying event types with regulatory details.
 */
export async function getCobraEligibleEvents(): Promise<CobraQualifyingEventDetail[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...QUALIFYING_EVENT_DETAILS];
}

/**
 * Initiate COBRA process for an employee on a qualifying event.
 * Starts the 60-day election window from notice date (employer must notify within 30 days).
 */
export async function initiateCobraEvent(
  employeeId: string,
  eventType: CobraQualifyingEvent,
  qualifyingEventDate: string,
  beneficiaries: CobraBeneficiary[] = []
): Promise<CobraEnrollment> {
  await new Promise((r) => setTimeout(r, 300));

  const eventDetail = QUALIFYING_EVENT_DETAILS.find((e) => e.eventType === eventType);
  if (!eventDetail) throw new Error(`Unknown qualifying event type: ${eventType}`);

  const _employerNotifyDeadline = addDays(qualifyingEventDate, eventDetail.employerNotifyDays);
  // Election deadline = 60 days after qualifying event notice is sent to employee
  // Assume employer notifies on qualifying event date, admin sends notice within 14 days
  const adminNotifyDate = addDays(qualifyingEventDate, 14);
  const electionDeadline = addDays(adminNotifyDate, 60);

  const newEnrollment: CobraEnrollment = {
    id: `cobra-${Date.now()}`,
    employeeId,
    employeeName: 'Employee Name',
    employeeEmail: 'employee@company.com',
    department: 'Unknown',
    qualifyingEvent: eventType,
    qualifyingEventDate,
    qualifyingEventId: `qe-${Date.now()}`,
    status: 'ELIGIBLE',
    employerNotifyDate: null,
    adminNotifyDate: null,
    electionDeadline,
    electionDate: null,
    coverageStartDate: null,
    coverageEndDate: null,
    maxDurationMonths: eventDetail.maxDurationMonths,
    electedPlans: [],
    totalMonthlyPremium: 0,
    beneficiaries,
    payments: [],
    notices: [],
    notes: `COBRA initiated for ${eventDetail.label} on ${qualifyingEventDate}`,
    createdAt: new Date().toISOString(),
  };

  MOCK_COBRA_ENROLLMENTS.push(newEnrollment);
  return newEnrollment;
}

/**
 * Get COBRA notices with optional filters.
 */
export async function getCobraNotices(filters?: {
  deliveryMethod?: string;
  noticeType?: CobraNoticeType;
  startDate?: string;
}): Promise<CobraNoticeRecord[]> {
  await new Promise((r) => setTimeout(r, 200));
  const allNotices: CobraNoticeRecord[] = [];
  for (const enrollment of MOCK_COBRA_ENROLLMENTS) {
    for (const notice of enrollment.notices) {
      if (filters?.noticeType && notice.noticeType !== filters.noticeType) continue;
      if (filters?.deliveryMethod && notice.deliveryMethod !== filters.deliveryMethod) continue;
      if (filters?.startDate && notice.sentDate < filters.startDate) continue;
      allNotices.push(notice);
    }
  }
  return allNotices;
}

/**
 * Generate COBRA election notice data for a qualifying event.
 */
export async function generateCobraNotice(enrollmentId: string): Promise<CobraNoticeData> {
  await new Promise((r) => setTimeout(r, 300));

  const enrollment = MOCK_COBRA_ENROLLMENTS.find((e) => e.id === enrollmentId);
  if (!enrollment) throw new Error(`Enrollment ${enrollmentId} not found`);

  const eventDetail = QUALIFYING_EVENT_DETAILS.find(
    (e) => e.eventType === enrollment.qualifyingEvent
  );
  const firstPaymentDue = addDays(enrollment.electionDeadline, 45);

  const noticeData: CobraNoticeData = {
    enrollmentId,
    employeeName: enrollment.employeeName,
    employeeAddress: '123 Employee Street, City, State 00000',
    qualifyingEvent: eventDetail?.label ?? enrollment.qualifyingEvent,
    qualifyingEventDate: enrollment.qualifyingEventDate,
    electionDeadline: enrollment.electionDeadline,
    availablePlans: [
      {
        planId: 'h-gold',
        planName: 'Balanced Choice (Gold) — Medical',
        planType: 'Medical',
        carrier: 'Blue Cross Blue Shield',
        coverageLevel: 'Family',
        originalMonthlyPremium: 1550,
        cobraMonthlyPremium: 1581,
        effectiveDate: enrollment.qualifyingEventDate,
      },
      {
        planId: 'd-gold',
        planName: 'Comprehensive Dental',
        planType: 'Dental',
        carrier: 'Delta Dental',
        coverageLevel: 'Family',
        originalMonthlyPremium: 160,
        cobraMonthlyPremium: 163.2,
        effectiveDate: enrollment.qualifyingEventDate,
      },
    ],
    firstPaymentDue,
    planAdministratorName: 'KreupAI Benefits Administration',
    planAdministratorPhone: '1-800-555-0100',
    planAdministratorAddress: 'PO Box 10000, Benefits City, BC 00001',
    generatedDate: new Date().toISOString().slice(0, 10),
  };

  // Record notice as sent
  const notice: CobraNoticeRecord = {
    id: `ntc-${Date.now()}`,
    noticeType: 'ELECTION_NOTICE',
    sentDate: new Date().toISOString().slice(0, 10),
    deliveryMethod: 'EMAIL',
    recipient: enrollment.employeeName,
    recipientAddress: enrollment.employeeEmail,
    deliveryConfirmed: false,
    confirmationNumber: null,
    generatedBy: 'COBRA System',
  };
  enrollment.notices.push(notice);
  enrollment.adminNotifyDate = new Date().toISOString().slice(0, 10);
  enrollment.status = 'NOTICE_SENT';

  return noticeData;
}

/**
 * Get COBRA enrollments with optional filters.
 */
export async function getCobraEnrollments(filters?: CobraFilters): Promise<CobraEnrollment[]> {
  await new Promise((r) => setTimeout(r, 250));
  let results = [...MOCK_COBRA_ENROLLMENTS];

  if (filters?.status?.length) {
    results = results.filter((e) => filters.status!.includes(e.status));
  }
  if (filters?.qualifyingEvent?.length) {
    results = results.filter((e) => filters.qualifyingEvent!.includes(e.qualifyingEvent));
  }
  if (filters?.department) {
    results = results.filter((e) => e.department === filters.department);
  }
  if (filters?.startDate) {
    results = results.filter((e) => e.qualifyingEventDate >= filters.startDate!);
  }
  if (filters?.endDate) {
    results = results.filter((e) => e.qualifyingEventDate <= filters.endDate!);
  }

  return results;
}

/**
 * Process a COBRA premium payment for an active enrollee.
 */
export async function processCobraPremium(
  enrollmentId: string,
  payment: { period: string; amount: number; paymentMethod: string }
): Promise<CobraPayment> {
  await new Promise((r) => setTimeout(r, 300));

  const enrollment = MOCK_COBRA_ENROLLMENTS.find((e) => e.id === enrollmentId);
  if (!enrollment) throw new Error(`Enrollment ${enrollmentId} not found`);
  if (enrollment.status !== 'ACTIVE' && enrollment.status !== 'GRACE_PERIOD') {
    throw new Error('Cannot process payment for non-active COBRA enrollment');
  }

  const cobraPayment: CobraPayment = {
    id: `cpay-${Date.now()}`,
    period: payment.period,
    dueDate: new Date().toISOString().slice(0, 10),
    amount: payment.amount,
    paidDate: new Date().toISOString().slice(0, 10),
    status: 'PAID',
    paymentMethod: payment.paymentMethod,
    confirmationNumber: `CONF-${Date.now()}`,
    lateFeeApplied: 0,
  };

  enrollment.payments.push(cobraPayment);
  if (enrollment.status === 'GRACE_PERIOD') {
    enrollment.status = 'ACTIVE';
  }

  return cobraPayment;
}

/**
 * Get the full COBRA timeline with key deadlines for a qualifying event.
 */
export async function getCobraTimeline(enrollmentId: string): Promise<CobraTimeline> {
  await new Promise((r) => setTimeout(r, 200));

  const enrollment = MOCK_COBRA_ENROLLMENTS.find((e) => e.id === enrollmentId);
  if (!enrollment) throw new Error(`Enrollment ${enrollmentId} not found`);

  const qeDate = enrollment.qualifyingEventDate;
  const employerDeadline = addDays(qeDate, 30);
  const adminDeadline = addDays(employerDeadline, 14); // 14 days after employer notifies
  const electionDeadline = addDays(adminDeadline, 60); // 60 days for employee to elect
  const firstPaymentDue = enrollment.electionDate
    ? addDays(enrollment.electionDate, 45)
    : addDays(electionDeadline, 45); // 45 days after election to pay first premium

  const deadlines: CobraDeadline[] = [
    {
      label: 'Qualifying Event Occurs',
      dueDate: qeDate,
      completedDate: qeDate,
      isOverdue: false,
      isCompleted: true,
      description: `${enrollment.qualifyingEvent} qualifying event occurred`,
      legalReference: 'ERISA § 603',
    },
    {
      label: 'Employer Notifies Plan Administrator',
      dueDate: employerDeadline,
      completedDate: enrollment.employerNotifyDate,
      isOverdue: isOverdue(employerDeadline) && !enrollment.employerNotifyDate,
      isCompleted: !!enrollment.employerNotifyDate,
      description: 'Employer must notify plan administrator within 30 days of qualifying event',
      legalReference: 'ERISA § 606(a)(2); 29 C.F.R. § 2590.606-2',
    },
    {
      label: 'Administrator Sends Election Notice',
      dueDate: adminDeadline,
      completedDate: enrollment.adminNotifyDate,
      isOverdue: isOverdue(adminDeadline) && !enrollment.adminNotifyDate,
      isCompleted: !!enrollment.adminNotifyDate,
      description:
        'Plan administrator must send COBRA election notice within 14 days of employer notification',
      legalReference: 'ERISA § 606(c); 29 C.F.R. § 2590.606-4',
    },
    {
      label: 'Employee Election Deadline',
      dueDate: electionDeadline,
      completedDate: enrollment.electionDate,
      isOverdue: isOverdue(electionDeadline) && !enrollment.electionDate,
      isCompleted: !!enrollment.electionDate,
      description: 'Qualified beneficiary has 60 days from notice to elect COBRA coverage',
      legalReference: 'ERISA § 605; 29 C.F.R. § 2590.605-1',
    },
    {
      label: 'First Premium Payment Due',
      dueDate: firstPaymentDue,
      completedDate: enrollment.payments.find((p) => p.status === 'PAID')?.paidDate ?? null,
      isOverdue:
        isOverdue(firstPaymentDue) && !enrollment.payments.some((p) => p.status === 'PAID'),
      isCompleted: enrollment.payments.some((p) => p.status === 'PAID'),
      description: 'First COBRA premium must be paid within 45 days of election date',
      legalReference: 'ERISA § 602(3); 29 C.F.R. § 2590.606-5',
    },
  ];

  const violations = deadlines
    .filter((d) => d.isOverdue && !d.isCompleted)
    .map((d) => `OVERDUE: ${d.label} — was due ${d.dueDate}`);

  return {
    eventId: enrollmentId,
    qualifyingEventDate: qeDate,
    deadlines,
    isCompliant: violations.length === 0,
    violations,
  };
}

/**
 * Run a compliance audit across all COBRA events to identify violations and late notices.
 */
export async function checkCobraCompliance(): Promise<CobraComplianceAudit> {
  await new Promise((r) => setTimeout(r, 400));

  const today = new Date().toISOString().slice(0, 10);
  const violations: CobraViolation[] = [];

  for (const enrollment of MOCK_COBRA_ENROLLMENTS) {
    const employerDeadline = addDays(enrollment.qualifyingEventDate, 30);
    const adminDeadline = addDays(employerDeadline, 14);

    if (!enrollment.employerNotifyDate && isOverdue(employerDeadline)) {
      const daysLate = Math.floor(
        (new Date(today).getTime() - new Date(employerDeadline).getTime()) / 86400000
      );
      violations.push({
        enrollmentId: enrollment.id,
        employeeName: enrollment.employeeName,
        violationType: 'LATE_EMPLOYER_NOTIFICATION',
        dueDate: employerDeadline,
        currentDate: today,
        daysLate,
        severity: daysLate > 30 ? 'CRITICAL' : daysLate > 14 ? 'HIGH' : 'MEDIUM',
        potentialPenalty: 'Up to $110/day IRS excise tax (26 U.S.C. § 4980B)',
      });
    }

    if (enrollment.employerNotifyDate && !enrollment.adminNotifyDate && isOverdue(adminDeadline)) {
      const daysLate = Math.floor(
        (new Date(today).getTime() - new Date(adminDeadline).getTime()) / 86400000
      );
      violations.push({
        enrollmentId: enrollment.id,
        employeeName: enrollment.employeeName,
        violationType: 'LATE_ELECTION_NOTICE',
        dueDate: adminDeadline,
        currentDate: today,
        daysLate,
        severity: daysLate > 14 ? 'HIGH' : 'MEDIUM',
        potentialPenalty: 'Up to $110/day IRS excise tax per qualified beneficiary',
      });
    }
  }

  const active = MOCK_COBRA_ENROLLMENTS.filter((e) => e.status === 'ACTIVE').length;
  const noticesOnTime = MOCK_COBRA_ENROLLMENTS.filter(
    (e) => e.adminNotifyDate && e.adminNotifyDate <= addDays(e.qualifyingEventDate, 44)
  ).length;

  const complianceScore = Math.max(
    0,
    100 -
      violations.reduce(
        (s, v) => s + (v.severity === 'CRITICAL' ? 20 : v.severity === 'HIGH' ? 10 : 5),
        0
      )
  );

  return {
    auditDate: today,
    totalEligibleEvents: MOCK_COBRA_ENROLLMENTS.length,
    noticesIssuedOnTime: noticesOnTime,
    noticesLate: violations.filter((v) => v.violationType === 'LATE_ELECTION_NOTICE').length,
    electionsMade: MOCK_COBRA_ENROLLMENTS.filter((e) => !!e.electionDate).length,
    activeEnrollees: active,
    expiredCoverage: MOCK_COBRA_ENROLLMENTS.filter((e) => e.status === 'EXPIRED').length,
    violations,
    complianceScore,
    recommendations: [
      'Automate employer-to-administrator notification within 14 days of qualifying event',
      'Enable electronic notice delivery with tracking confirmation',
      'Set up premium payment reminders at 30, 15, and 7 days before due date',
      'Conduct quarterly COBRA compliance audits',
    ],
  };
}

// ── Named export ───────────────────────────────────────────────────────────────

export const cobraService = {
  getCobraEligibleEvents,
  initiateCobraEvent,
  getCobraNotices,
  generateCobraNotice,
  getCobraEnrollments,
  processCobraPremium,
  getCobraTimeline,
  checkCobraCompliance,
};
