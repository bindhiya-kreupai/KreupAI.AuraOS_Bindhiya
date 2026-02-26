/**
 * @module fmlaService
 * @description FMLA (Family and Medical Leave Act) management — eligibility checks,
 *   leave requests, usage tracking, notices, and compliance reporting.
 * @project AURA HCM Platform
 * @section 22.3 — FMLA Management
 *
 * Legal References:
 *  FMLA: 29 U.S.C. § 2601 et seq. — Family and Medical Leave Act of 1993
 *  FMLA Regulations: 29 C.F.R. Part 825
 *  Eligibility: 12 months employed + 1,250 hours in past 12 months + 50 employees within 75 miles
 *  Entitlement: 12 workweeks per 12-month period (26 weeks for military caregiver)
 *  Qualifying Reasons: 29 U.S.C. § 2612(a)(1) — serious health condition, family care,
 *    birth/adoption, military family leave (qualifying exigency/caregiver)
 *  Notice: 29 C.F.R. § 825.300 — Employer must provide Eligibility Notice within 5 business days
 *  Designation Notice: 29 C.F.R. § 825.301 — within 5 business days of sufficient information
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type FMLAReason =
  | 'serious_health_condition_employee'
  | 'serious_health_condition_family'
  | 'birth_adoption'
  | 'military_qualifying_exigency'
  | 'military_caregiver';

export type FMLALeaveType = 'continuous' | 'intermittent' | 'reduced_schedule';
export type FMLAStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'active'
  | 'exhausted'
  | 'completed'
  | 'withdrawn';
export type FMLAYearMethod = 'calendar' | 'rolling_forward' | 'rolling_backward' | 'fixed';
export type NoticeStatus = 'issued' | 'pending' | 'overdue';

export interface FMLAEligibilityResult {
  employeeId: string;
  isEligible: boolean;
  criteriaChecks: EligibilityCriterion[];
  militaryEligible: boolean;
  availableWeeks: number;
  ineligibilityReasons: string[];
}

export interface EligibilityCriterion {
  criterion: string;
  required: string;
  actual: string;
  met: boolean;
}

export interface FMLARequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reason: FMLAReason;
  leaveType: FMLALeaveType;
  status: FMLAStatus;
  requestDate: string;
  startDate: string;
  endDate?: string;
  intermittentPattern?: string;
  totalWeeksRequested: number;
  totalWeeksApproved?: number;
  weeksUsed: number;
  medicalCertificationRequired: boolean;
  medicalCertificationReceived: boolean;
  medicalCertificationDue?: string;
  eligibilityNoticeIssued: boolean;
  eligibilityNoticeDate?: string;
  designationNoticeIssued: boolean;
  designationNoticeDate?: string;
  approvedBy?: string;
  denialReason?: string;
  notes?: string;
  familyMemberRelationship?: string;
  militaryMemberName?: string;
}

export interface FMLAUsage {
  employeeId: string;
  yearMethod: FMLAYearMethod;
  yearStart: string;
  yearEnd: string;
  totalEntitlement: number; // weeks
  weeksUsed: number;
  weeksRemaining: number;
  hoursUsed: number;
  hoursRemaining: number;
  usageHistory: FMLAUsagePeriod[];
}

export interface FMLAUsagePeriod {
  requestId: string;
  startDate: string;
  endDate: string;
  type: FMLALeaveType;
  weeksCharged: number;
  reason: string;
}

export interface FMLADesignationNotice {
  requestId: string;
  employeeId: string;
  employeeName: string;
  isDesignated: boolean;
  reason: string;
  approved: boolean;
  totalLeaveApproved: string;
  certificationRequired: boolean;
  certificationDue?: string;
  intermittentFrequency?: string;
  fitnessForDutyRequired: boolean;
  issuedDate: string;
}

export interface FMLAEligibilityNotice {
  employeeId: string;
  employeeName: string;
  isEligible: boolean;
  ineligibilityReason?: string;
  certificationRequired: boolean;
  certificationDue?: string;
  issuedDate: string;
  responseRequired: boolean;
  responseDeadline?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_FMLA_REQUESTS: FMLARequest[] = [
  {
    id: 'fmla-001',
    employeeId: 'emp-0445',
    employeeName: 'Sara Mitchell',
    department: 'Technology',
    reason: 'birth_adoption',
    leaveType: 'continuous',
    status: 'approved',
    requestDate: '2026-01-10',
    startDate: '2026-02-15',
    endDate: '2026-05-09',
    totalWeeksRequested: 12,
    totalWeeksApproved: 12,
    weeksUsed: 1.7,
    medicalCertificationRequired: false,
    medicalCertificationReceived: false,
    eligibilityNoticeIssued: true,
    eligibilityNoticeDate: '2026-01-13',
    designationNoticeIssued: true,
    designationNoticeDate: '2026-01-16',
    approvedBy: 'Sarah Johnson (HR Head)',
    notes: 'Parental leave for newborn daughter',
  },
  {
    id: 'fmla-002',
    employeeId: 'emp-0521',
    employeeName: 'Tom Chen',
    department: 'Finance',
    reason: 'serious_health_condition_employee',
    leaveType: 'intermittent',
    status: 'active',
    requestDate: '2026-01-20',
    startDate: '2026-02-01',
    intermittentPattern: 'Up to 2 days per week, scheduled in advance',
    totalWeeksRequested: 6,
    totalWeeksApproved: 6,
    weeksUsed: 2.5,
    medicalCertificationRequired: true,
    medicalCertificationReceived: true,
    eligibilityNoticeIssued: true,
    eligibilityNoticeDate: '2026-01-23',
    designationNoticeIssued: true,
    designationNoticeDate: '2026-01-27',
    approvedBy: 'Sarah Johnson (HR Head)',
  },
  {
    id: 'fmla-003',
    employeeId: 'emp-0612',
    employeeName: 'Maria Santos',
    department: 'HR',
    reason: 'serious_health_condition_family',
    leaveType: 'reduced_schedule',
    status: 'pending',
    requestDate: '2026-02-22',
    startDate: '2026-03-01',
    totalWeeksRequested: 8,
    weeksUsed: 0,
    medicalCertificationRequired: true,
    medicalCertificationReceived: false,
    medicalCertificationDue: '2026-03-08',
    eligibilityNoticeIssued: true,
    eligibilityNoticeDate: '2026-02-25',
    designationNoticeIssued: false,
    familyMemberRelationship: 'Parent (serious medical condition)',
    notes: "Awaiting medical certification for parent's cancer treatment",
  },
  {
    id: 'fmla-004',
    employeeId: 'emp-0710',
    employeeName: 'Derek Johnson',
    department: 'Operations',
    reason: 'military_qualifying_exigency',
    leaveType: 'intermittent',
    status: 'denied',
    requestDate: '2026-01-05',
    startDate: '2026-01-15',
    totalWeeksRequested: 3,
    weeksUsed: 0,
    medicalCertificationRequired: false,
    medicalCertificationReceived: false,
    eligibilityNoticeIssued: true,
    eligibilityNoticeDate: '2026-01-08',
    designationNoticeIssued: true,
    designationNoticeDate: '2026-01-10',
    denialReason: 'Employee does not meet 12-month employment requirement (8 months employed)',
    militaryMemberName: 'Spouse — National Guard activation',
  },
  {
    id: 'fmla-005',
    employeeId: 'emp-0815',
    employeeName: 'Lisa Wong',
    department: 'Marketing',
    reason: 'serious_health_condition_employee',
    leaveType: 'continuous',
    status: 'completed',
    requestDate: '2025-10-01',
    startDate: '2025-10-15',
    endDate: '2026-01-06',
    totalWeeksRequested: 12,
    totalWeeksApproved: 12,
    weeksUsed: 12,
    medicalCertificationRequired: true,
    medicalCertificationReceived: true,
    eligibilityNoticeIssued: true,
    eligibilityNoticeDate: '2025-10-03',
    designationNoticeIssued: true,
    designationNoticeDate: '2025-10-07',
    approvedBy: 'Sarah Johnson (HR Head)',
  },
  {
    id: 'fmla-006',
    employeeId: 'emp-0901',
    employeeName: 'James Carter',
    department: 'Sales',
    reason: 'military_caregiver',
    leaveType: 'continuous',
    status: 'active',
    requestDate: '2026-02-01',
    startDate: '2026-02-10',
    totalWeeksRequested: 26,
    totalWeeksApproved: 26,
    weeksUsed: 2.1,
    medicalCertificationRequired: true,
    medicalCertificationReceived: true,
    eligibilityNoticeIssued: true,
    eligibilityNoticeDate: '2026-02-04',
    designationNoticeIssued: true,
    designationNoticeDate: '2026-02-07',
    approvedBy: 'Sarah Johnson (HR Head)',
    militaryMemberName: 'Sibling — veteran with serious injury',
    notes: 'Military caregiver leave — 26-week entitlement per 29 U.S.C. § 2612(a)(3)',
  },
  {
    id: 'fmla-007',
    employeeId: 'emp-1002',
    employeeName: 'Rachel Kim',
    department: 'Product',
    reason: 'birth_adoption',
    leaveType: 'continuous',
    status: 'active',
    requestDate: '2026-02-10',
    startDate: '2026-02-20',
    totalWeeksRequested: 12,
    totalWeeksApproved: 12,
    weeksUsed: 0.7,
    medicalCertificationRequired: false,
    medicalCertificationReceived: false,
    eligibilityNoticeIssued: true,
    eligibilityNoticeDate: '2026-02-12',
    designationNoticeIssued: true,
    designationNoticeDate: '2026-02-14',
    approvedBy: 'Sarah Johnson (HR Head)',
  },
  {
    id: 'fmla-008',
    employeeId: 'emp-1102',
    employeeName: 'Marcus Brown',
    department: 'Engineering',
    reason: 'serious_health_condition_family',
    leaveType: 'intermittent',
    status: 'exhausted',
    requestDate: '2025-03-01',
    startDate: '2025-03-10',
    totalWeeksRequested: 12,
    totalWeeksApproved: 12,
    weeksUsed: 12,
    medicalCertificationRequired: true,
    medicalCertificationReceived: true,
    eligibilityNoticeIssued: true,
    eligibilityNoticeDate: '2025-03-03',
    designationNoticeIssued: true,
    designationNoticeDate: '2025-03-06',
    approvedBy: 'Sarah Johnson (HR Head)',
    notes: 'FMLA entitlement fully exhausted for 2025 calendar year',
    familyMemberRelationship: 'Spouse',
  },
];

const FMLA_USAGE_MAP: Record<string, FMLAUsage> = {
  'emp-0445': {
    employeeId: 'emp-0445',
    yearMethod: 'calendar',
    yearStart: '2026-01-01',
    yearEnd: '2026-12-31',
    totalEntitlement: 12,
    weeksUsed: 1.7,
    weeksRemaining: 10.3,
    hoursUsed: 68,
    hoursRemaining: 412,
    usageHistory: [
      {
        requestId: 'fmla-001',
        startDate: '2026-02-15',
        endDate: '',
        type: 'continuous',
        weeksCharged: 1.7,
        reason: 'Parental leave',
      },
    ],
  },
  'emp-0521': {
    employeeId: 'emp-0521',
    yearMethod: 'calendar',
    yearStart: '2026-01-01',
    yearEnd: '2026-12-31',
    totalEntitlement: 12,
    weeksUsed: 2.5,
    weeksRemaining: 9.5,
    hoursUsed: 100,
    hoursRemaining: 380,
    usageHistory: [
      {
        requestId: 'fmla-002',
        startDate: '2026-02-01',
        endDate: '',
        type: 'intermittent',
        weeksCharged: 2.5,
        reason: 'Serious health condition',
      },
    ],
  },
};

// ── Service Class ──────────────────────────────────────────────────────────────

export class FMLAService {
  private static delay(ms = 400): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /** Check FMLA eligibility for employee */
  static async checkEligibility(employeeId: string): Promise<FMLAEligibilityResult> {
    await this.delay(500);

    // Mock eligibility data
    const mockData: Record<
      string,
      { months: number; hoursLast12: number; nearbyEmployees: number }
    > = {
      'emp-0445': { months: 36, hoursLast12: 1820, nearbyEmployees: 88 },
      'emp-0521': { months: 28, hoursLast12: 1920, nearbyEmployees: 88 },
      'emp-0612': { months: 14, hoursLast12: 1560, nearbyEmployees: 88 },
      'emp-0710': { months: 8, hoursLast12: 980, nearbyEmployees: 88 },
    };

    const data = mockData[employeeId] ?? { months: 24, hoursLast12: 1400, nearbyEmployees: 88 };
    const c1 = data.months >= 12;
    const c2 = data.hoursLast12 >= 1250;
    const c3 = data.nearbyEmployees >= 50;

    const criteria: EligibilityCriterion[] = [
      {
        criterion: 'Employed 12+ months',
        required: '12 months',
        actual: `${data.months} months`,
        met: c1,
      },
      {
        criterion: '1,250 hours worked in past 12 months',
        required: '1,250 hours',
        actual: `${data.hoursLast12} hours`,
        met: c2,
      },
      {
        criterion: '50+ employees within 75 miles of worksite',
        required: '50 employees',
        actual: `${data.nearbyEmployees} employees`,
        met: c3,
      },
    ];

    const isEligible = c1 && c2 && c3;

    return {
      employeeId,
      isEligible,
      criteriaChecks: criteria,
      militaryEligible: isEligible,
      availableWeeks: isEligible ? 12 : 0,
      ineligibilityReasons: criteria
        .filter((c) => !c.met)
        .map((c) => `${c.criterion}: requires ${c.required}, has ${c.actual}`),
    };
  }

  /** Request FMLA leave */
  static async requestFMLALeave(data: Partial<FMLARequest>): Promise<FMLARequest> {
    await this.delay(700);
    const request: FMLARequest = {
      id: `fmla-${Date.now()}`,
      employeeId: data.employeeId ?? '',
      employeeName: data.employeeName ?? '',
      department: data.department ?? '',
      reason: data.reason ?? 'serious_health_condition_employee',
      leaveType: data.leaveType ?? 'continuous',
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      startDate: data.startDate ?? '',
      endDate: data.endDate,
      intermittentPattern: data.intermittentPattern,
      totalWeeksRequested: data.totalWeeksRequested ?? 12,
      weeksUsed: 0,
      medicalCertificationRequired: data.reason !== 'birth_adoption',
      medicalCertificationReceived: false,
      medicalCertificationDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      eligibilityNoticeIssued: false,
      designationNoticeIssued: false,
      notes: data.notes,
    };
    MOCK_FMLA_REQUESTS.push(request);
    return request;
  }

  /** Get FMLA requests with optional filters */
  static async getFMLARequests(filters?: {
    status?: FMLAStatus;
    employeeId?: string;
    department?: string;
  }): Promise<FMLARequest[]> {
    await this.delay(400);
    let requests = [...MOCK_FMLA_REQUESTS];
    if (filters?.status) requests = requests.filter((r) => r.status === filters.status);
    if (filters?.employeeId) requests = requests.filter((r) => r.employeeId === filters.employeeId);
    if (filters?.department) requests = requests.filter((r) => r.department === filters.department);
    return requests;
  }

  /** Approve FMLA request */
  static async approveFMLA(requestId: string): Promise<FMLARequest> {
    await this.delay(500);
    const idx = MOCK_FMLA_REQUESTS.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error('Request not found');
    MOCK_FMLA_REQUESTS[idx] = {
      ...MOCK_FMLA_REQUESTS[idx],
      status: 'approved',
      totalWeeksApproved: MOCK_FMLA_REQUESTS[idx].totalWeeksRequested,
      designationNoticeIssued: true,
      designationNoticeDate: new Date().toISOString().split('T')[0],
    };
    return MOCK_FMLA_REQUESTS[idx];
  }

  /** Track FMLA usage for an employee */
  static async trackFMLAUsage(employeeId: string): Promise<FMLAUsage> {
    await this.delay(300);
    return (
      FMLA_USAGE_MAP[employeeId] ?? {
        employeeId,
        yearMethod: 'calendar',
        yearStart: '2026-01-01',
        yearEnd: '2026-12-31',
        totalEntitlement: 12,
        weeksUsed: 0,
        weeksRemaining: 12,
        hoursUsed: 0,
        hoursRemaining: 480,
        usageHistory: [],
      }
    );
  }

  /** Get remaining FMLA for employee */
  static async getRemainingFMLA(
    employeeId: string
  ): Promise<{ weeksRemaining: number; hoursRemaining: number; percentUsed: number }> {
    await this.delay(200);
    const usage = await this.trackFMLAUsage(employeeId);
    return {
      weeksRemaining: usage.weeksRemaining,
      hoursRemaining: usage.hoursRemaining,
      percentUsed: parseFloat(((usage.weeksUsed / usage.totalEntitlement) * 100).toFixed(1)),
    };
  }

  /** Generate designation notice */
  static async generateDesignationNotice(requestId: string): Promise<FMLADesignationNotice> {
    await this.delay(500);
    const request = MOCK_FMLA_REQUESTS.find((r) => r.id === requestId);
    if (!request) throw new Error('Request not found');
    return {
      requestId,
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      isDesignated: request.status === 'approved',
      reason:
        request.status === 'approved'
          ? 'Qualifies as FMLA-qualifying leave per 29 U.S.C. § 2612'
          : 'Does not qualify',
      approved: request.status === 'approved',
      totalLeaveApproved: `${request.totalWeeksApproved ?? 0} weeks`,
      certificationRequired: request.medicalCertificationRequired,
      certificationDue: request.medicalCertificationDue,
      intermittentFrequency: request.intermittentPattern,
      fitnessForDutyRequired: true,
      issuedDate: new Date().toISOString().split('T')[0],
    };
  }

  /** Generate eligibility notice */
  static async generateEligibilityNotice(employeeId: string): Promise<FMLAEligibilityNotice> {
    await this.delay(400);
    const eligibility = await this.checkEligibility(employeeId);
    return {
      employeeId,
      employeeName: 'Employee',
      isEligible: eligibility.isEligible,
      ineligibilityReason: eligibility.ineligibilityReasons.join('; '),
      certificationRequired: true,
      certificationDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issuedDate: new Date().toISOString().split('T')[0],
      responseRequired: true,
      responseDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  }
}
