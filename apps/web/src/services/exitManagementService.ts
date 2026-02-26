/**
 * @module exitManagementService
 * @description Exit Management — full separation lifecycle, clearance tracking,
 *   exit interviews, analytics, and F&F settlement linkage.
 * @project AURA HCM Platform
 * @section 10.5 — Exit Management
 * @legal UAE Labour Law Federal Decree-Law No. 33 of 2021 — Article 44, 51
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

export interface ExitFilters {
  type?: ExitType;
  status?: ExitStatus;
  departmentId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ExitRecord {
  id: string;
  exitNumber: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  exitType: ExitType;
  status: ExitStatus;
  initiationDate: string;
  lastWorkingDate: string;
  noticePeriodDays: number;
  clearancePercent: number;
  exitInterviewDone: boolean;
  settlementAmount: number | null;
  createdAt: string;
}

export interface ClearanceItem {
  id: string;
  department: string;
  responsible: string;
  description: string;
  status: ClearanceItemStatus;
  completedAt: string | null;
  remarks: string;
  isMandatory: boolean;
}

export interface ExitDetail extends ExitRecord {
  managerName: string;
  hrAssigned: string;
  noticePeriodStart: string;
  noticePeriodEnd: string;
  resignationLetter: string | null;
  exitReason: string;
  clearanceChecklist: ClearanceItem[];
  interviewSubmitted: boolean;
  finalSettlementDate: string | null;
}

export interface ExitInterviewQuestion {
  id: string;
  category: string;
  question: string;
  type: 'text' | 'rating' | 'multiple_choice';
  options?: string[];
  required: boolean;
}

export interface ExitAnalytics {
  totalExits: number;
  byType: Record<ExitType, number>;
  byDepartment: Array<{ department: string; count: number; rate: number }>;
  byTenure: Array<{ range: string; count: number; percent: number }>;
  byReason: Array<{ reason: string; count: number; percent: number }>;
  avgNoticePeriodDays: number;
  avgTenureYears: number;
  monthlyTrend: Array<{ month: string; count: number }>;
  voluntaryRate: number;
  involuntaryRate: number;
}

export interface InitiateExitData {
  employeeId: string;
  exitType: ExitType;
  lastWorkingDate: string;
  exitReason: string;
  noticePeriodDays?: number;
  managerNotes?: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const CLEARANCE_TEMPLATE: Omit<ClearanceItem, 'id' | 'status' | 'completedAt' | 'remarks'>[] = [
  {
    department: 'IT',
    responsible: 'IT Admin',
    description: 'Return laptop, access badge, and peripherals',
    isMandatory: true,
  },
  {
    department: 'IT',
    responsible: 'IT Admin',
    description: 'Revoke all system accesses and active sessions',
    isMandatory: true,
  },
  {
    department: 'Finance',
    responsible: 'Finance Manager',
    description: 'Clear all outstanding advances and expenses',
    isMandatory: true,
  },
  {
    department: 'Finance',
    responsible: 'Payroll Team',
    description: 'Final salary and gratuity calculation approved',
    isMandatory: true,
  },
  {
    department: 'HR',
    responsible: 'HR Admin',
    description: 'Return company ID card and access card',
    isMandatory: true,
  },
  {
    department: 'HR',
    responsible: 'HR BP',
    description: 'Complete exit interview',
    isMandatory: false,
  },
  {
    department: 'Facilities',
    responsible: 'Admin Officer',
    description: 'Return parking permit and locker key',
    isMandatory: false,
  },
  {
    department: 'Legal',
    responsible: 'Legal Counsel',
    description: 'NDA and non-compete acknowledgement signed',
    isMandatory: true,
  },
  {
    department: 'Direct Manager',
    responsible: 'Line Manager',
    description: 'Knowledge transfer and handover documentation',
    isMandatory: true,
  },
  {
    department: 'HR',
    responsible: 'HR Admin',
    description: 'Generate experience and relieving letters',
    isMandatory: false,
  },
];

const MOCK_EXITS: ExitRecord[] = [
  {
    id: 'EXIT-001',
    exitNumber: 'EX-2026-0001',
    employeeId: 'EMP-101',
    employeeCode: 'EMP101',
    employeeName: 'Mohammed Al-Farsi',
    department: 'Technology',
    designation: 'Senior Software Engineer',
    exitType: 'Resignation',
    status: 'Clearance In Progress',
    initiationDate: '2026-02-01',
    lastWorkingDate: '2026-03-01',
    noticePeriodDays: 30,
    clearancePercent: 60,
    exitInterviewDone: false,
    settlementAmount: null,
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'EXIT-002',
    exitNumber: 'EX-2026-0002',
    employeeId: 'EMP-205',
    employeeCode: 'EMP205',
    employeeName: 'Priya Nair',
    department: 'Finance',
    designation: 'Financial Analyst',
    exitType: 'End of Contract',
    status: 'Exit Interview Pending',
    initiationDate: '2026-01-15',
    lastWorkingDate: '2026-02-28',
    noticePeriodDays: 30,
    clearancePercent: 90,
    exitInterviewDone: false,
    settlementAmount: null,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'EXIT-003',
    exitNumber: 'EX-2025-0089',
    employeeId: 'EMP-088',
    employeeCode: 'EMP088',
    employeeName: 'Carlos Mendez',
    department: 'Operations',
    designation: 'Operations Manager',
    exitType: 'Retirement',
    status: 'Completed',
    initiationDate: '2025-11-01',
    lastWorkingDate: '2025-12-31',
    noticePeriodDays: 60,
    clearancePercent: 100,
    exitInterviewDone: true,
    settlementAmount: 125000,
    createdAt: '2025-11-01T08:00:00Z',
  },
];

const EXIT_INTERVIEW_QUESTIONS: ExitInterviewQuestion[] = [
  {
    id: 'Q01',
    category: 'Reason for Leaving',
    question: 'What is your primary reason for leaving?',
    type: 'multiple_choice',
    options: [
      'Better opportunity',
      'Compensation',
      'Work environment',
      'Career growth',
      'Personal reasons',
      'Relocation',
      'Other',
    ],
    required: true,
  },
  {
    id: 'Q02',
    category: 'Job Satisfaction',
    question: 'How satisfied were you with your role and responsibilities?',
    type: 'rating',
    required: true,
  },
  {
    id: 'Q03',
    category: 'Management',
    question: 'How would you rate your relationship with your direct manager?',
    type: 'rating',
    required: true,
  },
  {
    id: 'Q04',
    category: 'Work Environment',
    question: 'How would you describe the work culture at this company?',
    type: 'text',
    required: false,
  },
  {
    id: 'Q05',
    category: 'Compensation',
    question: 'How satisfied were you with your total compensation package?',
    type: 'rating',
    required: true,
  },
  {
    id: 'Q06',
    category: 'Career Development',
    question: 'Did you feel you had sufficient career development opportunities?',
    type: 'multiple_choice',
    options: ['Yes, fully', 'Somewhat', 'Not really', 'No'],
    required: true,
  },
  {
    id: 'Q07',
    category: 'Company Feedback',
    question: 'What did the company do well?',
    type: 'text',
    required: false,
  },
  {
    id: 'Q08',
    category: 'Company Feedback',
    question: 'What could the company improve?',
    type: 'text',
    required: false,
  },
  {
    id: 'Q09',
    category: 'Recommendation',
    question: 'Would you recommend this company as a place to work?',
    type: 'multiple_choice',
    options: ['Definitely yes', 'Probably yes', 'Not sure', 'Probably no', 'Definitely no'],
    required: true,
  },
  {
    id: 'Q10',
    category: 'Rehire',
    question: 'Would you consider returning to work here in the future?',
    type: 'multiple_choice',
    options: ['Yes', 'Maybe', 'No'],
    required: false,
  },
];

// ── Service Functions ─────────────────────────────────────────────────────────

export async function getExits(
  filters: ExitFilters = {}
): Promise<{ exits: ExitRecord[]; total: number }> {
  await new Promise((r) => setTimeout(r, 300));
  let results = [...MOCK_EXITS];
  if (filters.type) results = results.filter((e) => e.exitType === filters.type);
  if (filters.status) results = results.filter((e) => e.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (e) => e.employeeName.toLowerCase().includes(q) || e.exitNumber.toLowerCase().includes(q)
    );
  }
  return { exits: results, total: results.length };
}

export async function getExit(id: string): Promise<ExitDetail> {
  await new Promise((r) => setTimeout(r, 200));
  const base = MOCK_EXITS.find((e) => e.id === id) ?? MOCK_EXITS[0];
  const checklist: ClearanceItem[] = CLEARANCE_TEMPLATE.map((tmpl, idx) => ({
    id: `CLR-${String(idx + 1).padStart(3, '0')}`,
    ...tmpl,
    status: idx < 4 ? 'Cleared' : idx === 4 ? 'Pending' : 'Pending',
    completedAt: idx < 4 ? '2026-02-10T11:00:00Z' : null,
    remarks: '',
  }));
  return {
    ...base,
    managerName: 'Tariq Hassan',
    hrAssigned: 'Fatima Al-Zahra',
    noticePeriodStart: '2026-02-01',
    noticePeriodEnd: '2026-03-01',
    resignationLetter: 'uploads/resignation/EMP101_resignation.pdf',
    exitReason: 'Better career opportunity at another firm',
    clearanceChecklist: checklist,
    interviewSubmitted: false,
    finalSettlementDate: null,
  };
}

export async function initiateExit(data: InitiateExitData): Promise<ExitRecord> {
  await new Promise((r) => setTimeout(r, 500));
  const year = new Date().getFullYear();
  const exitNumber = `EX-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  return {
    id: `EXIT-${Date.now()}`,
    exitNumber,
    employeeId: data.employeeId,
    employeeCode: 'EMP999',
    employeeName: 'New Exit Employee',
    department: 'Unknown',
    designation: 'Unknown',
    exitType: data.exitType,
    status: 'Initiated',
    initiationDate: new Date().toISOString().split('T')[0],
    lastWorkingDate: data.lastWorkingDate,
    noticePeriodDays: data.noticePeriodDays ?? 30,
    clearancePercent: 0,
    exitInterviewDone: false,
    settlementAmount: null,
    createdAt: new Date().toISOString(),
  };
}

export async function updateExitStatus(id: string, status: ExitStatus): Promise<ExitRecord> {
  await new Promise((r) => setTimeout(r, 250));
  const base = MOCK_EXITS.find((e) => e.id === id) ?? MOCK_EXITS[0];
  return { ...base, status };
}

export async function getClearanceChecklist(
  _exitId: string
): Promise<{ checklist: ClearanceItem[]; completionPercent: number }> {
  await new Promise((r) => setTimeout(r, 200));
  const checklist: ClearanceItem[] = CLEARANCE_TEMPLATE.map((tmpl, idx) => ({
    id: `CLR-${String(idx + 1).padStart(3, '0')}`,
    ...tmpl,
    status: idx < 6 ? 'Cleared' : 'Pending',
    completedAt: idx < 6 ? '2026-02-15T10:00:00Z' : null,
    remarks: '',
  }));
  const cleared = checklist.filter((c) => c.status === 'Cleared').length;
  const completionPercent = Math.round((cleared / checklist.length) * 100);
  return { checklist, completionPercent };
}

export async function updateClearanceItem(
  exitId: string,
  itemId: string,
  status: ClearanceItemStatus,
  remarks?: string
): Promise<ClearanceItem> {
  await new Promise((r) => setTimeout(r, 200));
  const tmpl = CLEARANCE_TEMPLATE[0];
  return {
    id: itemId,
    ...tmpl,
    status,
    completedAt: status === 'Cleared' ? new Date().toISOString() : null,
    remarks: remarks ?? '',
  };
}

export async function getExitInterviewQuestions(): Promise<ExitInterviewQuestion[]> {
  await new Promise((r) => setTimeout(r, 150));
  return EXIT_INTERVIEW_QUESTIONS;
}

export async function submitExitInterview(
  _exitId: string,
  _answers: Record<string, string | number>
): Promise<{ success: boolean; submittedAt: string }> {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, submittedAt: new Date().toISOString() };
}

export async function getExitAnalytics(): Promise<ExitAnalytics> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    totalExits: 47,
    byType: {
      Resignation: 28,
      Termination: 7,
      Retirement: 4,
      'End of Contract': 5,
      'Mutual Separation': 2,
      Redundancy: 1,
      'Death in Service': 0,
    },
    byDepartment: [
      { department: 'Technology', count: 14, rate: 8.5 },
      { department: 'Sales', count: 12, rate: 11.2 },
      { department: 'Operations', count: 9, rate: 5.8 },
      { department: 'Finance', count: 6, rate: 4.3 },
      { department: 'HR', count: 4, rate: 6.1 },
      { department: 'Other', count: 2, rate: 2.9 },
    ],
    byTenure: [
      { range: '< 1 Year', count: 10, percent: 21.3 },
      { range: '1-3 Years', count: 18, percent: 38.3 },
      { range: '3-5 Years', count: 11, percent: 23.4 },
      { range: '5-10 Years', count: 6, percent: 12.8 },
      { range: '10+ Years', count: 2, percent: 4.3 },
    ],
    byReason: [
      { reason: 'Better opportunity', count: 18, percent: 38.3 },
      { reason: 'Compensation', count: 9, percent: 19.1 },
      { reason: 'Career growth', count: 8, percent: 17.0 },
      { reason: 'Work environment', count: 5, percent: 10.6 },
      { reason: 'Relocation', count: 4, percent: 8.5 },
      { reason: 'Other', count: 3, percent: 6.4 },
    ],
    avgNoticePeriodDays: 28.5,
    avgTenureYears: 3.2,
    monthlyTrend: [
      { month: 'Sep 2025', count: 4 },
      { month: 'Oct 2025', count: 5 },
      { month: 'Nov 2025', count: 3 },
      { month: 'Dec 2025', count: 6 },
      { month: 'Jan 2026', count: 7 },
      { month: 'Feb 2026', count: 5 },
    ],
    voluntaryRate: 72.3,
    involuntaryRate: 27.7,
  };
}
