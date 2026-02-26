/**
 * @module exitService
 * @description Exit Management — full employee separation lifecycle including resignation,
 *   termination, retirement, end-of-contract. Covers clearance tracking, exit interviews,
 *   experience letter generation, and F&F settlement linkage.
 * @project AURA HCM Platform
 * @section 10.5 — Exit Management
 * @legal UAE Labour Law Federal Decree-Law No. 33 of 2021 — Article 44 (termination),
 *   Article 51 (end of service gratuity); KSA Labour Law Articles 74-85 (contract termination)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ExitType =
  | 'Resignation'
  | 'Termination'
  | 'Retirement'
  | 'End of Contract'
  | 'Mutual Separation'
  | 'Redundancy'
  | 'Death in Service';

export type ExitStatus =
  | 'Initiated'
  | 'Notice Period'
  | 'Clearance In Progress'
  | 'Exit Interview Pending'
  | 'Final Settlement Pending'
  | 'Completed'
  | 'Cancelled';

export type ClearanceItemStatus = 'Pending' | 'Cleared' | 'Blocked' | 'NA';

export interface ExitProcess {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  grade: string;
  location: string;
  exitType: ExitType;
  status: ExitStatus;
  initiatedDate: string;
  resignationDate: string | null;
  lastWorkingDay: string;
  noticePeriodDays: number;
  noticePeriodServed: number;
  exitReason: string;
  exitReasonCategory: ExitReasonCategory;
  managerId: string;
  managerName: string;
  hrOwnerId: string;
  hrOwnerName: string;
  clearanceItems: ClearanceItem[];
  exitInterview: ExitInterview | null;
  experienceLetterGenerated: boolean;
  relievingLetterGenerated: boolean;
  ffsReference: string | null; // Full & Final Settlement reference
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ExitReasonCategory =
  | 'Better Opportunity'
  | 'Compensation'
  | 'Work-Life Balance'
  | 'Relocation'
  | 'Personal/Family'
  | 'Career Change'
  | 'Company Culture'
  | 'Management'
  | 'Contract End'
  | 'Performance'
  | 'Retirement'
  | 'Health'
  | 'Other';

export interface ClearanceItem {
  id: string;
  exitId: string;
  department: string;
  departmentCode: string;
  itemTitle: string;
  description: string;
  responsiblePersonId: string;
  responsiblePersonName: string;
  status: ClearanceItemStatus;
  clearedDate: string | null;
  blockReason: string;
  resolution: string;
  isMandatory: boolean;
  order: number;
}

export interface ExitInterview {
  exitId: string;
  conductedBy: string;
  conductedDate: string | null;
  format: 'In-Person' | 'Online' | 'Written';
  responses: ExitInterviewResponse[];
  overallSatisfactionScore: number; // 1-5
  wouldRecommendEmployer: boolean | null;
  openComments: string;
  isCompleted: boolean;
}

export interface ExitInterviewResponse {
  questionId: string;
  question: string;
  rating: number | null; // 1-5
  comment: string;
  category: string;
}

export interface ExitAnalytics {
  totalExitsYTD: number;
  activeExits: number;
  turnoverRate: number;
  avgTenureAtExit: number; // months
  avgExitProcessingDays: number;
  byExitType: { type: ExitType; count: number; percentage: number }[];
  byReasonCategory: { category: ExitReasonCategory; count: number; percentage: number }[];
  byDepartment: { department: string; count: number; turnoverRate: number }[];
  monthlyTrend: { month: string; exits: number }[];
  pendingClearanceItems: number;
  exitInterviewCompletionRate: number;
}

export interface ExitFilters {
  status?: ExitStatus[];
  exitType?: ExitType[];
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const EXIT_INTERVIEW_QUESTIONS = [
  {
    questionId: 'q1',
    question: 'How satisfied were you with your role and responsibilities?',
    category: 'Role',
  },
  {
    questionId: 'q2',
    question: 'How would you rate your relationship with your direct manager?',
    category: 'Management',
  },
  {
    questionId: 'q3',
    question: 'How satisfied were you with your total compensation and benefits?',
    category: 'Compensation',
  },
  {
    questionId: 'q4',
    question: 'How would you rate the company culture and work environment?',
    category: 'Culture',
  },
  {
    questionId: 'q5',
    question: 'How well did the company support your career development?',
    category: 'Career Development',
  },
];

function buildClearanceItems(exitId: string): ClearanceItem[] {
  return [
    {
      id: `ci-${exitId}-it`,
      exitId,
      department: 'IT',
      departmentCode: 'IT',
      itemTitle: 'Laptop & Equipment Return',
      description:
        'Return company laptop, charger, peripherals, and any other IT equipment issued.',
      responsiblePersonId: 'emp-050',
      responsiblePersonName: 'IT Helpdesk',
      status: 'Pending',
      clearedDate: null,
      blockReason: '',
      resolution: '',
      isMandatory: true,
      order: 1,
    },
    {
      id: `ci-${exitId}-access`,
      exitId,
      department: 'IT',
      departmentCode: 'IT',
      itemTitle: 'System Access Revocation',
      description: 'Revoke all system, email, VPN, and application access on last working day.',
      responsiblePersonId: 'emp-050',
      responsiblePersonName: 'IT Security',
      status: 'Pending',
      clearedDate: null,
      blockReason: '',
      resolution: '',
      isMandatory: true,
      order: 2,
    },
    {
      id: `ci-${exitId}-fin`,
      exitId,
      department: 'Finance',
      departmentCode: 'FIN',
      itemTitle: 'Outstanding Advances & Loans',
      description: 'Clear all pending salary advances, expense claims, and outstanding loans.',
      responsiblePersonId: 'emp-034',
      responsiblePersonName: 'Preethi Reddy',
      status: 'Pending',
      clearedDate: null,
      blockReason: '',
      resolution: '',
      isMandatory: true,
      order: 3,
    },
    {
      id: `ci-${exitId}-hr`,
      exitId,
      department: 'HR',
      departmentCode: 'HR',
      itemTitle: 'HR Documents Submission',
      description: 'Submit all company documents, ID card, access badge, and business cards.',
      responsiblePersonId: 'emp-012',
      responsiblePersonName: 'Sara Mohammed',
      status: 'Pending',
      clearedDate: null,
      blockReason: '',
      resolution: '',
      isMandatory: true,
      order: 4,
    },
    {
      id: `ci-${exitId}-admin`,
      exitId,
      department: 'Admin',
      departmentCode: 'ADM',
      itemTitle: 'Keys & Parking Pass',
      description: 'Return office keys, parking permit, and locker keys.',
      responsiblePersonId: 'emp-060',
      responsiblePersonName: 'Admin Team',
      status: 'Pending',
      clearedDate: null,
      blockReason: '',
      resolution: '',
      isMandatory: false,
      order: 5,
    },
    {
      id: `ci-${exitId}-mgr`,
      exitId,
      department: 'Manager',
      departmentCode: 'MGR',
      itemTitle: 'Knowledge Handover',
      description:
        'Complete handover of ongoing projects, documentation, and client relationships.',
      responsiblePersonId: 'emp-004',
      responsiblePersonName: 'Direct Manager',
      status: 'Pending',
      clearedDate: null,
      blockReason: '',
      resolution: '',
      isMandatory: true,
      order: 6,
    },
  ];
}

function buildExitInterview(exitId: string): ExitInterview {
  return {
    exitId,
    conductedBy: 'Sara Mohammed',
    conductedDate: null,
    format: 'In-Person',
    responses: EXIT_INTERVIEW_QUESTIONS.map((q) => ({
      ...q,
      rating: null,
      comment: '',
    })),
    overallSatisfactionScore: 0,
    wouldRecommendEmployer: null,
    openComments: '',
    isCompleted: false,
  };
}

const MOCK_EXIT_PROCESSES: ExitProcess[] = [
  {
    id: 'exit-001',
    employeeId: 'emp-016',
    employeeCode: 'EMP016',
    employeeName: 'Layla Hassan',
    department: 'Marketing',
    designation: 'Marketing Manager',
    grade: 'M2',
    location: 'Dubai HQ',
    exitType: 'Resignation',
    status: 'Clearance In Progress',
    initiatedDate: '2026-02-01',
    resignationDate: '2026-02-01',
    lastWorkingDay: '2026-03-01',
    noticePeriodDays: 30,
    noticePeriodServed: 24,
    exitReason:
      'Accepted a leadership role at another company offering significantly higher compensation.',
    exitReasonCategory: 'Better Opportunity',
    managerId: 'emp-005',
    managerName: 'Fatima Al-Hassan',
    hrOwnerId: 'emp-012',
    hrOwnerName: 'Sara Mohammed',
    clearanceItems: buildClearanceItems('exit-001').map((ci, i) => ({
      ...ci,
      status: i < 2 ? 'Cleared' : 'Pending',
      clearedDate: i < 2 ? '2026-02-20' : null,
    })),
    exitInterview: buildExitInterview('exit-001'),
    experienceLetterGenerated: false,
    relievingLetterGenerated: false,
    ffsReference: null,
    notes: '',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-20',
  },
  {
    id: 'exit-002',
    employeeId: 'emp-029',
    employeeCode: 'EMP029',
    employeeName: 'Raj Patel',
    department: 'Operations',
    designation: 'Operations Analyst',
    grade: 'IC2',
    location: 'Dubai HQ',
    exitType: 'Termination',
    status: 'Final Settlement Pending',
    initiatedDate: '2026-01-15',
    resignationDate: null,
    lastWorkingDay: '2026-02-14',
    noticePeriodDays: 30,
    noticePeriodServed: 30,
    exitReason: 'Termination due to continued performance issues after PIP failure.',
    exitReasonCategory: 'Performance',
    managerId: 'emp-006',
    managerName: 'Suresh Kumar',
    hrOwnerId: 'emp-012',
    hrOwnerName: 'Sara Mohammed',
    clearanceItems: buildClearanceItems('exit-002').map((ci) => ({
      ...ci,
      status: 'Cleared' as ClearanceItemStatus,
      clearedDate: '2026-02-14',
    })),
    exitInterview: {
      ...buildExitInterview('exit-002'),
      conductedDate: '2026-02-12',
      isCompleted: true,
      overallSatisfactionScore: 2,
      wouldRecommendEmployer: false,
      openComments: 'Communication on expectations could have been clearer from management.',
      responses: EXIT_INTERVIEW_QUESTIONS.map((q, i) => ({
        ...q,
        rating: [2, 2, 3, 3, 2][i],
        comment: '',
      })),
    },
    experienceLetterGenerated: true,
    relievingLetterGenerated: false,
    ffsReference: 'FFS-2026-014',
    notes: 'FFS calculation in progress. Gratuity per UAE Labour Law computed.',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-20',
  },
  {
    id: 'exit-003',
    employeeId: 'emp-099',
    employeeCode: 'EMP099',
    employeeName: 'James Fitzgerald',
    department: 'Technology',
    designation: 'Principal Engineer',
    grade: 'IC6',
    location: 'Dubai HQ',
    exitType: 'End of Contract',
    status: 'Completed',
    initiatedDate: '2025-11-01',
    resignationDate: null,
    lastWorkingDay: '2025-12-31',
    noticePeriodDays: 60,
    noticePeriodServed: 60,
    exitReason: 'Fixed-term contract concluded.',
    exitReasonCategory: 'Contract End',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    hrOwnerId: 'emp-012',
    hrOwnerName: 'Sara Mohammed',
    clearanceItems: buildClearanceItems('exit-003').map((ci) => ({
      ...ci,
      status: 'Cleared' as ClearanceItemStatus,
      clearedDate: '2025-12-31',
    })),
    exitInterview: {
      ...buildExitInterview('exit-003'),
      conductedDate: '2025-12-20',
      isCompleted: true,
      overallSatisfactionScore: 4,
      wouldRecommendEmployer: true,
      openComments: 'Great team, exciting work. Enjoyed the project.',
      responses: EXIT_INTERVIEW_QUESTIONS.map((q, i) => ({
        ...q,
        rating: [4, 4, 3, 4, 5][i],
        comment: '',
      })),
    },
    experienceLetterGenerated: true,
    relievingLetterGenerated: true,
    ffsReference: 'FFS-2025-112',
    notes: 'Completed. All documents issued.',
    createdAt: '2025-11-01',
    updatedAt: '2026-01-05',
  },
  {
    id: 'exit-004',
    employeeId: 'emp-070',
    employeeCode: 'EMP070',
    employeeName: 'Mohammed Al-Qassim',
    department: 'Finance',
    designation: 'Senior Financial Analyst',
    grade: 'IC4',
    location: 'Riyadh',
    exitType: 'Resignation',
    status: 'Notice Period',
    initiatedDate: '2026-02-15',
    resignationDate: '2026-02-15',
    lastWorkingDay: '2026-03-14',
    noticePeriodDays: 30,
    noticePeriodServed: 10,
    exitReason: 'Relocating to family in Jeddah. Personal reasons.',
    exitReasonCategory: 'Relocation',
    managerId: 'emp-034',
    managerName: 'Preethi Reddy',
    hrOwnerId: 'emp-012',
    hrOwnerName: 'Sara Mohammed',
    clearanceItems: buildClearanceItems('exit-004'),
    exitInterview: buildExitInterview('exit-004'),
    experienceLetterGenerated: false,
    relievingLetterGenerated: false,
    ffsReference: null,
    notes: 'KSA — GOSI deregistration required on last working day.',
    createdAt: '2026-02-15',
    updatedAt: '2026-02-15',
  },
  {
    id: 'exit-005',
    employeeId: 'emp-080',
    employeeCode: 'EMP080',
    employeeName: 'Sunita Verma',
    department: 'Human Resources',
    designation: 'HR Coordinator',
    grade: 'IC2',
    location: 'Dubai HQ',
    exitType: 'Retirement',
    status: 'Clearance In Progress',
    initiatedDate: '2026-01-20',
    resignationDate: '2026-01-20',
    lastWorkingDay: '2026-03-31',
    noticePeriodDays: 60,
    noticePeriodServed: 36,
    exitReason: 'Retirement after 22 years of service.',
    exitReasonCategory: 'Retirement',
    managerId: 'emp-002',
    managerName: 'Priya Sharma',
    hrOwnerId: 'emp-012',
    hrOwnerName: 'Sara Mohammed',
    clearanceItems: buildClearanceItems('exit-005').map((ci, i) => ({
      ...ci,
      status: i < 3 ? 'Cleared' : ('Pending' as ClearanceItemStatus),
      clearedDate: i < 3 ? '2026-02-28' : null,
    })),
    exitInterview: buildExitInterview('exit-005'),
    experienceLetterGenerated: false,
    relievingLetterGenerated: false,
    ffsReference: null,
    notes: 'Long service award and retirement function to be arranged.',
    createdAt: '2026-01-20',
    updatedAt: '2026-02-20',
  },
  {
    id: 'exit-006',
    employeeId: 'emp-040',
    employeeCode: 'EMP040',
    employeeName: 'Sarah Kim',
    department: 'Technology',
    designation: 'Senior Software Engineer',
    grade: 'IC4',
    location: 'Singapore',
    exitType: 'Mutual Separation',
    status: 'Completed',
    initiatedDate: '2025-11-15',
    resignationDate: '2025-11-15',
    lastWorkingDay: '2025-12-15',
    noticePeriodDays: 30,
    noticePeriodServed: 30,
    exitReason: 'Mutual separation agreement — role restructured.',
    exitReasonCategory: 'Career Change',
    managerId: 'emp-004',
    managerName: 'David Chen',
    hrOwnerId: 'emp-012',
    hrOwnerName: 'Sara Mohammed',
    clearanceItems: buildClearanceItems('exit-006').map((ci) => ({
      ...ci,
      status: 'Cleared' as ClearanceItemStatus,
      clearedDate: '2025-12-15',
    })),
    exitInterview: {
      ...buildExitInterview('exit-006'),
      conductedDate: '2025-12-10',
      isCompleted: true,
      overallSatisfactionScore: 3,
      wouldRecommendEmployer: true,
      openComments: 'Good experience overall. Company going through changes.',
      responses: EXIT_INTERVIEW_QUESTIONS.map((q, i) => ({
        ...q,
        rating: [3, 4, 3, 3, 3][i],
        comment: '',
      })),
    },
    experienceLetterGenerated: true,
    relievingLetterGenerated: true,
    ffsReference: 'FFS-2025-098',
    notes: 'Completed.',
    createdAt: '2025-11-15',
    updatedAt: '2025-12-20',
  },
  {
    id: 'exit-007',
    employeeId: 'emp-085',
    employeeCode: 'EMP085',
    employeeName: 'Khaled Al-Mansouri',
    department: 'Sales',
    designation: 'Sales Executive',
    grade: 'IC3',
    location: 'Abu Dhabi',
    exitType: 'Resignation',
    status: 'Initiated',
    initiatedDate: '2026-02-22',
    resignationDate: '2026-02-22',
    lastWorkingDay: '2026-03-22',
    noticePeriodDays: 30,
    noticePeriodServed: 3,
    exitReason: 'Family business opportunity.',
    exitReasonCategory: 'Personal/Family',
    managerId: 'emp-008',
    managerName: 'Anita Nair',
    hrOwnerId: 'emp-012',
    hrOwnerName: 'Sara Mohammed',
    clearanceItems: buildClearanceItems('exit-007'),
    exitInterview: buildExitInterview('exit-007'),
    experienceLetterGenerated: false,
    relievingLetterGenerated: false,
    ffsReference: null,
    notes: '',
    createdAt: '2026-02-22',
    updatedAt: '2026-02-22',
  },
  {
    id: 'exit-008',
    employeeId: 'emp-090',
    employeeCode: 'EMP090',
    employeeName: 'Priya Iyer',
    department: 'Product',
    designation: 'Product Manager',
    grade: 'M1',
    location: 'Dubai HQ',
    exitType: 'Resignation',
    status: 'Exit Interview Pending',
    initiatedDate: '2026-01-30',
    resignationDate: '2026-01-30',
    lastWorkingDay: '2026-02-28',
    noticePeriodDays: 30,
    noticePeriodServed: 26,
    exitReason: 'Joining a startup as co-founder.',
    exitReasonCategory: 'Career Change',
    managerId: 'emp-007',
    managerName: 'Kavita Singh',
    hrOwnerId: 'emp-012',
    hrOwnerName: 'Sara Mohammed',
    clearanceItems: buildClearanceItems('exit-008').map((ci) => ({
      ...ci,
      status: 'Cleared' as ClearanceItemStatus,
      clearedDate: '2026-02-25',
    })),
    exitInterview: buildExitInterview('exit-008'),
    experienceLetterGenerated: false,
    relievingLetterGenerated: false,
    ffsReference: null,
    notes: 'Exit interview scheduled for Feb 27.',
    createdAt: '2026-01-30',
    updatedAt: '2026-02-22',
  },
];

// ── Service ────────────────────────────────────────────────────────────────────

export class ExitService {
  /**
   * Initiate an exit process for an employee.
   */
  static async initiateExit(employeeId: string, data: Partial<ExitProcess>): Promise<ExitProcess> {
    await new Promise((r) => setTimeout(r, 200));
    const process: ExitProcess = {
      id: `exit-${Date.now()}`,
      employeeId,
      employeeCode: data.employeeCode ?? 'EMP???',
      employeeName: data.employeeName ?? 'Unknown Employee',
      department: data.department ?? '',
      designation: data.designation ?? '',
      grade: data.grade ?? '',
      location: data.location ?? '',
      exitType: data.exitType ?? 'Resignation',
      status: 'Initiated',
      initiatedDate: new Date().toISOString().slice(0, 10),
      resignationDate:
        data.exitType === 'Resignation' ? new Date().toISOString().slice(0, 10) : null,
      lastWorkingDay:
        data.lastWorkingDay ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      noticePeriodDays: data.noticePeriodDays ?? 30,
      noticePeriodServed: 0,
      exitReason: data.exitReason ?? '',
      exitReasonCategory: data.exitReasonCategory ?? 'Other',
      managerId: data.managerId ?? '',
      managerName: data.managerName ?? '',
      hrOwnerId: data.hrOwnerId ?? 'emp-012',
      hrOwnerName: 'Sara Mohammed',
      clearanceItems: buildClearanceItems(`exit-${Date.now()}`),
      exitInterview: buildExitInterview(`exit-${Date.now()}`),
      experienceLetterGenerated: false,
      relievingLetterGenerated: false,
      ffsReference: null,
      notes: data.notes ?? '',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    MOCK_EXIT_PROCESSES.push(process);
    return process;
  }

  /**
   * Get list of exit processes with optional filters.
   */
  static async getExitProcesses(filters?: ExitFilters): Promise<ExitProcess[]> {
    await new Promise((r) => setTimeout(r, 200));
    let result = [...MOCK_EXIT_PROCESSES];

    if (filters?.status?.length) {
      result = result.filter((e) => filters.status!.includes(e.status));
    }
    if (filters?.exitType?.length) {
      result = result.filter((e) => filters.exitType!.includes(e.exitType));
    }
    if (filters?.department) {
      result = result.filter((e) => e.department === filters.department);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.employeeName.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q)
      );
    }

    return result.sort(
      (a, b) => new Date(b.initiatedDate).getTime() - new Date(a.initiatedDate).getTime()
    );
  }

  /**
   * Get full exit process detail.
   */
  static async getExitProcess(id: string): Promise<ExitProcess | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_EXIT_PROCESSES.find((e) => e.id === id) ?? null;
  }

  /**
   * Get clearance checklist for an exit process.
   */
  static async getClearanceChecklist(exitId: string): Promise<ClearanceItem[]> {
    await new Promise((r) => setTimeout(r, 200));
    const process = MOCK_EXIT_PROCESSES.find((e) => e.id === exitId);
    if (!process) return [];
    return process.clearanceItems.sort((a, b) => a.order - b.order);
  }

  /**
   * Update the status of a clearance item.
   */
  static async updateClearanceItem(
    itemId: string,
    status: ClearanceItemStatus,
    notes?: string
  ): Promise<ClearanceItem> {
    await new Promise((r) => setTimeout(r, 200));
    for (const process of MOCK_EXIT_PROCESSES) {
      const item = process.clearanceItems.find((ci) => ci.id === itemId);
      if (item) {
        item.status = status;
        if (status === 'Cleared') item.clearedDate = new Date().toISOString().slice(0, 10);
        if (notes) item.resolution = notes;
        return item;
      }
    }
    throw new Error(`Clearance item ${itemId} not found`);
  }

  /**
   * Submit or update exit interview responses.
   */
  static async submitExitInterview(
    exitId: string,
    responses: ExitInterviewResponse[],
    overallScore: number,
    wouldRecommend: boolean,
    openComments: string
  ): Promise<ExitInterview> {
    await new Promise((r) => setTimeout(r, 200));
    const process = MOCK_EXIT_PROCESSES.find((e) => e.id === exitId);
    if (!process) throw new Error(`Exit process ${exitId} not found`);

    if (!process.exitInterview) {
      process.exitInterview = buildExitInterview(exitId);
    }

    process.exitInterview.responses = responses;
    process.exitInterview.overallSatisfactionScore = overallScore;
    process.exitInterview.wouldRecommendEmployer = wouldRecommend;
    process.exitInterview.openComments = openComments;
    process.exitInterview.conductedDate = new Date().toISOString().slice(0, 10);
    process.exitInterview.isCompleted = true;

    // Advance status if interview was pending
    if (process.status === 'Exit Interview Pending') {
      process.status = 'Final Settlement Pending';
    }

    return process.exitInterview;
  }

  /**
   * Get exit analytics — turnover rates, reasons, department breakdown.
   */
  static async getExitAnalytics(): Promise<ExitAnalytics> {
    await new Promise((r) => setTimeout(r, 200));

    const all = MOCK_EXIT_PROCESSES;
    const active = all.filter((e) => !['Completed', 'Cancelled'].includes(e.status));

    const typeCounts: Record<string, number> = {};
    const reasonCounts: Record<string, number> = {};
    const deptCounts: Record<string, number> = {};

    for (const e of all) {
      typeCounts[e.exitType] = (typeCounts[e.exitType] ?? 0) + 1;
      reasonCounts[e.exitReasonCategory] = (reasonCounts[e.exitReasonCategory] ?? 0) + 1;
      deptCounts[e.department] = (deptCounts[e.department] ?? 0) + 1;
    }

    const byExitType = Object.entries(typeCounts).map(([type, count]) => ({
      type: type as ExitType,
      count,
      percentage: Math.round((count / all.length) * 100),
    }));

    const byReasonCategory = Object.entries(reasonCounts).map(([category, count]) => ({
      category: category as ExitReasonCategory,
      count,
      percentage: Math.round((count / all.length) * 100),
    }));

    const byDepartment = Object.entries(deptCounts).map(([department, count]) => ({
      department,
      count,
      turnoverRate: Math.round((count / 30) * 100), // approx dept headcount
    }));

    const interviewsCompleted = all.filter((e) => e.exitInterview?.isCompleted).length;

    return {
      totalExitsYTD: all.length,
      activeExits: active.length,
      turnoverRate: 8.5,
      avgTenureAtExit: 28,
      avgExitProcessingDays: 22,
      byExitType,
      byReasonCategory,
      byDepartment,
      monthlyTrend: [
        { month: 'Sep 2025', exits: 2 },
        { month: 'Oct 2025', exits: 1 },
        { month: 'Nov 2025', exits: 3 },
        { month: 'Dec 2025', exits: 2 },
        { month: 'Jan 2026', exits: 2 },
        { month: 'Feb 2026', exits: 3 },
      ],
      pendingClearanceItems: all
        .flatMap((e) => e.clearanceItems)
        .filter((ci) => ci.status === 'Pending' || ci.status === 'Blocked').length,
      exitInterviewCompletionRate:
        all.length > 0 ? Math.round((interviewsCompleted / all.length) * 100) : 0,
    };
  }

  /**
   * Generate experience / relieving letter (returns a mock document reference).
   * @legal Relieving letter is legally required in UAE under Federal Decree-Law No. 33 of 2021
   */
  static async generateExperienceLetter(
    exitId: string,
    type: 'experience' | 'relieving' = 'experience'
  ): Promise<{ documentId: string; url: string; generatedAt: string }> {
    await new Promise((r) => setTimeout(r, 300));
    const process = MOCK_EXIT_PROCESSES.find((e) => e.id === exitId);
    if (!process) throw new Error(`Exit process ${exitId} not found`);

    if (type === 'experience') process.experienceLetterGenerated = true;
    if (type === 'relieving') process.relievingLetterGenerated = true;

    return {
      documentId: `DOC-${type.toUpperCase()}-${Date.now()}`,
      url: `/api/documents/exit/${exitId}/${type}-letter.pdf`,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get exit interview questions template.
   */
  static getExitInterviewQuestions(): typeof EXIT_INTERVIEW_QUESTIONS {
    return EXIT_INTERVIEW_QUESTIONS;
  }
}
