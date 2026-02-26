/**
 * @module positionService
 * @description Position Control — headcount management, budget vs actual, org chart,
 *   position lifecycle (proposed → approved → filled/vacant/frozen)
 * @project AURA HCM Platform
 * @section 10.2 — Position Control
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type PositionStatus =
  | 'Filled'
  | 'Vacant'
  | 'Frozen'
  | 'Proposed'
  | 'Approved'
  | 'Eliminated';
export type PositionType = 'Permanent' | 'Contract' | 'Temporary' | 'Intern';
export type BudgetStatus = 'Within Budget' | 'Over Budget' | 'Under Budget';

export interface Position {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  department: string;
  grade: string;
  jobFamily: string;
  status: PositionStatus;
  type: PositionType;
  incumbentId: string | null;
  incumbentName: string | null;
  incumbentStartDate: string | null;
  reportingToId: string | null;
  reportingToName: string | null;
  location: string;
  annualBudget: number; // budgeted salary
  actualCost: number; // current salary if filled
  headcountBudgetYear: number;
  daysVacant: number | null;
  frozenReason: string | null;
  frozenDate: string | null;
  approvedDate: string | null;
  requiredBy: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PositionHistory {
  positionId: string;
  records: PositionHistoryRecord[];
}

export interface PositionHistoryRecord {
  id: string;
  incumbentId: string | null;
  incumbentName: string | null;
  startDate: string;
  endDate: string | null;
  action: 'Filled' | 'Vacated' | 'Transferred' | 'Promoted' | 'Terminated';
  reason: string;
}

export interface HeadcountBudget {
  departmentId: string;
  department: string;
  fiscalYear: number;
  approvedHeadcount: number;
  currentHeadcount: number;
  vacantPositions: number;
  frozenPositions: number;
  proposedPositions: number;
  budgetedCost: number;
  actualCost: number;
  variance: number; // positive = under budget
  utilizationPct: number;
  budgetStatus: BudgetStatus;
}

export interface OrgNode {
  positionId: string;
  positionTitle: string;
  positionCode: string;
  incumbentId: string | null;
  incumbentName: string | null;
  grade: string;
  status: PositionStatus;
  department: string;
  children: OrgNode[];
}

export interface PositionFilters {
  status?: PositionStatus[];
  departmentId?: string;
  type?: PositionType;
  location?: string;
  grade?: string;
  search?: string;
}

export interface CreatePositionData {
  title: string;
  departmentId: string;
  grade: string;
  jobFamily: string;
  type: PositionType;
  reportingToId: string;
  location: string;
  annualBudget: number;
  requiredBy: string;
  notes: string;
  headcountBudgetYear: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_POSITIONS: Position[] = [
  // Technology
  {
    id: 'pos-t01',
    code: 'TECH-001',
    title: 'Chief Technology Officer',
    departmentId: 'dept-001',
    department: 'Technology',
    grade: 'E1',
    jobFamily: 'Technology Leadership',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-001',
    incumbentName: 'Rahul Mehta',
    incumbentStartDate: '2021-03-01',
    reportingToId: null,
    reportingToName: 'CEO',
    location: 'Dubai HQ',
    annualBudget: 420000,
    actualCost: 398000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2021-01-01',
    requiredBy: null,
    notes: '',
    createdAt: '2021-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-t02',
    code: 'TECH-002',
    title: 'Head of Engineering',
    departmentId: 'dept-001',
    department: 'Technology',
    grade: 'D2',
    jobFamily: 'Engineering Management',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-004',
    incumbentName: 'David Chen',
    incumbentStartDate: '2022-07-01',
    reportingToId: 'pos-t01',
    reportingToName: 'Rahul Mehta',
    location: 'Dubai HQ',
    annualBudget: 280000,
    actualCost: 265000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2022-05-01',
    requiredBy: null,
    notes: '',
    createdAt: '2022-05-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-t03',
    code: 'TECH-003',
    title: 'Senior Software Engineer',
    departmentId: 'dept-001',
    department: 'Technology',
    grade: 'IC4',
    jobFamily: 'Software Engineering',
    status: 'Vacant',
    type: 'Permanent',
    incumbentId: null,
    incumbentName: null,
    incumbentStartDate: null,
    reportingToId: 'pos-t02',
    reportingToName: 'David Chen',
    location: 'Dubai HQ',
    annualBudget: 160000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: 45,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2025-12-01',
    requiredBy: '2026-03-01',
    notes: 'Actively recruiting via LinkedIn and referrals.',
    createdAt: '2025-12-01',
    updatedAt: '2026-01-15',
  },
  {
    id: 'pos-t04',
    code: 'TECH-004',
    title: 'DevOps Engineer',
    departmentId: 'dept-001',
    department: 'Technology',
    grade: 'IC3',
    jobFamily: 'Infrastructure',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-006',
    incumbentName: 'Ahmed Al-Rashid',
    incumbentStartDate: '2023-01-15',
    reportingToId: 'pos-t02',
    reportingToName: 'David Chen',
    location: 'Dubai HQ',
    annualBudget: 130000,
    actualCost: 125000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2022-11-01',
    requiredBy: null,
    notes: '',
    createdAt: '2022-11-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-t05',
    code: 'TECH-005',
    title: 'Data Scientist',
    departmentId: 'dept-001',
    department: 'Technology',
    grade: 'IC4',
    jobFamily: 'Data & Analytics',
    status: 'Frozen',
    type: 'Permanent',
    incumbentId: null,
    incumbentName: null,
    incumbentStartDate: null,
    reportingToId: 'pos-t01',
    reportingToName: 'Rahul Mehta',
    location: 'Dubai HQ',
    annualBudget: 145000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: 120,
    frozenReason: 'Hiring freeze — Q1 2026 cost optimization program',
    frozenDate: '2025-11-01',
    approvedDate: '2025-08-01',
    requiredBy: null,
    notes: 'Review freeze status in Q2 2026',
    createdAt: '2025-08-01',
    updatedAt: '2025-11-01',
  },
  {
    id: 'pos-t06',
    code: 'TECH-006',
    title: 'AI/ML Engineer',
    departmentId: 'dept-001',
    department: 'Technology',
    grade: 'IC4',
    jobFamily: 'Data & Analytics',
    status: 'Proposed',
    type: 'Permanent',
    incumbentId: null,
    incumbentName: null,
    incumbentStartDate: null,
    reportingToId: 'pos-t01',
    reportingToName: 'Rahul Mehta',
    location: 'Dubai HQ',
    annualBudget: 175000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: null,
    requiredBy: '2026-07-01',
    notes: 'Pending budget committee approval — Q2 2026',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-15',
  },
  // HR
  {
    id: 'pos-h01',
    code: 'HR-001',
    title: 'VP Human Resources',
    departmentId: 'dept-002',
    department: 'Human Resources',
    grade: 'E2',
    jobFamily: 'HR Leadership',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-002',
    incumbentName: 'Priya Sharma',
    incumbentStartDate: '2020-06-01',
    reportingToId: null,
    reportingToName: 'CEO',
    location: 'Dubai HQ',
    annualBudget: 320000,
    actualCost: 305000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2020-01-01',
    requiredBy: null,
    notes: '',
    createdAt: '2020-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-h02',
    code: 'HR-002',
    title: 'HR Business Partner',
    departmentId: 'dept-002',
    department: 'Human Resources',
    grade: 'IC4',
    jobFamily: 'HR Business Partnering',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-012',
    incumbentName: 'Sara Mohammed',
    incumbentStartDate: '2022-04-01',
    reportingToId: 'pos-h01',
    reportingToName: 'Priya Sharma',
    location: 'Dubai HQ',
    annualBudget: 120000,
    actualCost: 115000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2022-01-01',
    requiredBy: null,
    notes: '',
    createdAt: '2022-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-h03',
    code: 'HR-003',
    title: 'Talent Acquisition Specialist',
    departmentId: 'dept-002',
    department: 'Human Resources',
    grade: 'IC3',
    jobFamily: 'Talent Acquisition',
    status: 'Vacant',
    type: 'Permanent',
    incumbentId: null,
    incumbentName: null,
    incumbentStartDate: null,
    reportingToId: 'pos-h01',
    reportingToName: 'Priya Sharma',
    location: 'Dubai HQ',
    annualBudget: 95000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: 30,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2026-01-01',
    requiredBy: '2026-04-01',
    notes: 'JD shared with 3 recruitment agencies.',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-25',
  },
  // Finance
  {
    id: 'pos-f01',
    code: 'FIN-001',
    title: 'Director of Finance',
    departmentId: 'dept-003',
    department: 'Finance',
    grade: 'D1',
    jobFamily: 'Finance Leadership',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-003',
    incumbentName: 'Ahmed Al-Rashid',
    incumbentStartDate: '2019-09-01',
    reportingToId: null,
    reportingToName: 'CEO',
    location: 'Dubai HQ',
    annualBudget: 260000,
    actualCost: 248000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2019-01-01',
    requiredBy: null,
    notes: '',
    createdAt: '2019-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-f02',
    code: 'FIN-002',
    title: 'Finance Manager',
    departmentId: 'dept-003',
    department: 'Finance',
    grade: 'M2',
    jobFamily: 'Financial Management',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-034',
    incumbentName: 'Preethi Reddy',
    incumbentStartDate: '2021-02-15',
    reportingToId: 'pos-f01',
    reportingToName: 'Ahmed Al-Rashid',
    location: 'Dubai HQ',
    annualBudget: 165000,
    actualCost: 158000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2020-10-01',
    requiredBy: null,
    notes: '',
    createdAt: '2020-10-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-f03',
    code: 'FIN-003',
    title: 'Financial Analyst',
    departmentId: 'dept-003',
    department: 'Finance',
    grade: 'IC3',
    jobFamily: 'Financial Analysis',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-013',
    incumbentName: 'Omar Al-Fayyad',
    incumbentStartDate: '2020-05-01',
    reportingToId: 'pos-f02',
    reportingToName: 'Preethi Reddy',
    location: 'Dubai HQ',
    annualBudget: 105000,
    actualCost: 98000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2020-01-01',
    requiredBy: null,
    notes: '',
    createdAt: '2020-01-01',
    updatedAt: '2026-01-01',
  },
  // Marketing
  {
    id: 'pos-m01',
    code: 'MKT-001',
    title: 'Chief Marketing Officer',
    departmentId: 'dept-004',
    department: 'Marketing',
    grade: 'E2',
    jobFamily: 'Marketing Leadership',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-005',
    incumbentName: 'Fatima Al-Hassan',
    incumbentStartDate: '2022-11-01',
    reportingToId: null,
    reportingToName: 'CEO',
    location: 'Dubai HQ',
    annualBudget: 310000,
    actualCost: 295000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2022-09-01',
    requiredBy: null,
    notes: '',
    createdAt: '2022-09-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-m02',
    code: 'MKT-002',
    title: 'Marketing Manager',
    departmentId: 'dept-004',
    department: 'Marketing',
    grade: 'M2',
    jobFamily: 'Marketing Management',
    status: 'Vacant',
    type: 'Permanent',
    incumbentId: null,
    incumbentName: null,
    incumbentStartDate: null,
    reportingToId: 'pos-m01',
    reportingToName: 'Fatima Al-Hassan',
    location: 'Abu Dhabi',
    annualBudget: 150000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: 62,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2025-11-01',
    requiredBy: '2026-02-28',
    notes: 'Interviewing 4 candidates this week.',
    createdAt: '2025-11-01',
    updatedAt: '2026-02-10',
  },
  // Operations
  {
    id: 'pos-o01',
    code: 'OPS-001',
    title: 'Director of Operations',
    departmentId: 'dept-005',
    department: 'Operations',
    grade: 'D1',
    jobFamily: 'Operations Leadership',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-006',
    incumbentName: 'Suresh Kumar',
    incumbentStartDate: '2021-08-01',
    reportingToId: null,
    reportingToName: 'CEO',
    location: 'Dubai HQ',
    annualBudget: 245000,
    actualCost: 232000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2021-05-01',
    requiredBy: null,
    notes: '',
    createdAt: '2021-05-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-o02',
    code: 'OPS-002',
    title: 'Head of Customer Success',
    departmentId: 'dept-005',
    department: 'Operations',
    grade: 'D3',
    jobFamily: 'Customer Operations',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-009',
    incumbentName: 'Meera Pillai',
    incumbentStartDate: '2022-03-01',
    reportingToId: 'pos-o01',
    reportingToName: 'Suresh Kumar',
    location: 'Dubai HQ',
    annualBudget: 185000,
    actualCost: 175000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2022-01-01',
    requiredBy: null,
    notes: '',
    createdAt: '2022-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-o03',
    code: 'OPS-003',
    title: 'Operations Analyst',
    departmentId: 'dept-005',
    department: 'Operations',
    grade: 'IC2',
    jobFamily: 'Operations',
    status: 'Proposed',
    type: 'Contract',
    incumbentId: null,
    incumbentName: null,
    incumbentStartDate: null,
    reportingToId: 'pos-o01',
    reportingToName: 'Suresh Kumar',
    location: 'Remote',
    annualBudget: 70000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: null,
    requiredBy: '2026-04-01',
    notes: 'Business case submitted. Pending approval from Finance.',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-10',
  },
  // Sales
  {
    id: 'pos-s01',
    code: 'SALES-001',
    title: 'Director of Sales',
    departmentId: 'dept-008',
    department: 'Sales',
    grade: 'D1',
    jobFamily: 'Sales Leadership',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-008',
    incumbentName: 'Anita Nair',
    incumbentStartDate: '2022-02-01',
    reportingToId: null,
    reportingToName: 'CEO',
    location: 'Dubai HQ',
    annualBudget: 255000,
    actualCost: 242000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2022-01-01',
    requiredBy: null,
    notes: '',
    createdAt: '2022-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-s02',
    code: 'SALES-002',
    title: 'Enterprise Account Manager',
    departmentId: 'dept-008',
    department: 'Sales',
    grade: 'IC4',
    jobFamily: 'Enterprise Sales',
    status: 'Vacant',
    type: 'Permanent',
    incumbentId: null,
    incumbentName: null,
    incumbentStartDate: null,
    reportingToId: 'pos-s01',
    reportingToName: 'Anita Nair',
    location: 'Riyadh',
    annualBudget: 135000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: 78,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2025-11-15',
    requiredBy: '2026-02-28',
    notes: 'KSA market expansion requires this hire urgently.',
    createdAt: '2025-11-15',
    updatedAt: '2026-01-20',
  },
  // Legal
  {
    id: 'pos-l01',
    code: 'LEG-001',
    title: 'Head of Legal',
    departmentId: 'dept-006',
    department: 'Legal',
    grade: 'D2',
    jobFamily: 'Legal & Compliance',
    status: 'Vacant',
    type: 'Permanent',
    incumbentId: null,
    incumbentName: null,
    incumbentStartDate: null,
    reportingToId: null,
    reportingToName: 'CEO',
    location: 'Dubai HQ',
    annualBudget: 270000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: 105,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2025-10-01',
    requiredBy: '2026-03-31',
    notes: 'Searching for GCC-licensed legal professional. Using executive search firm.',
    createdAt: '2025-10-01',
    updatedAt: '2026-02-01',
  },
  // Product
  {
    id: 'pos-p01',
    code: 'PROD-001',
    title: 'VP Product Management',
    departmentId: 'dept-007',
    department: 'Product',
    grade: 'E2',
    jobFamily: 'Product Leadership',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-007',
    incumbentName: 'Kavita Singh',
    incumbentStartDate: '2021-10-01',
    reportingToId: null,
    reportingToName: 'CEO',
    location: 'Dubai HQ',
    annualBudget: 300000,
    actualCost: 288000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2021-08-01',
    requiredBy: null,
    notes: '',
    createdAt: '2021-08-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-p02',
    code: 'PROD-002',
    title: 'Senior Product Manager',
    departmentId: 'dept-007',
    department: 'Product',
    grade: 'M1',
    jobFamily: 'Product Management',
    status: 'Filled',
    type: 'Permanent',
    incumbentId: 'emp-031',
    incumbentName: 'Yusuf Ibrahim',
    incumbentStartDate: '2023-04-01',
    reportingToId: 'pos-p01',
    reportingToName: 'Kavita Singh',
    location: 'Dubai HQ',
    annualBudget: 155000,
    actualCost: 148000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    frozenDate: null,
    approvedDate: '2023-02-01',
    requiredBy: null,
    notes: '',
    createdAt: '2023-02-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'pos-p03',
    code: 'PROD-003',
    title: 'UX Designer',
    departmentId: 'dept-007',
    department: 'Product',
    grade: 'IC3',
    jobFamily: 'Design',
    status: 'Frozen',
    type: 'Permanent',
    incumbentId: null,
    incumbentName: null,
    incumbentStartDate: null,
    reportingToId: 'pos-p01',
    reportingToName: 'Kavita Singh',
    location: 'Dubai HQ',
    annualBudget: 110000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: 90,
    frozenReason: 'Q1 2026 hiring freeze — non-critical roles deferred',
    frozenDate: '2025-11-15',
    approvedDate: '2025-09-01',
    requiredBy: null,
    notes: 'Reassess after Q1 budget review.',
    createdAt: '2025-09-01',
    updatedAt: '2025-11-15',
  },
];

const MOCK_POSITION_HISTORY: Record<string, PositionHistoryRecord[]> = {
  'pos-t01': [
    {
      id: 'ph-001',
      incumbentId: 'emp-001',
      incumbentName: 'Rahul Mehta',
      startDate: '2021-03-01',
      endDate: null,
      action: 'Filled',
      reason: 'New hire — external recruitment',
    },
    {
      id: 'ph-002',
      incumbentId: 'emp-099',
      incumbentName: 'James Fitzgerald',
      startDate: '2018-06-01',
      endDate: '2021-02-28',
      action: 'Vacated',
      reason: 'Resigned to join competitor',
    },
  ],
  'pos-t03': [
    {
      id: 'ph-003',
      incumbentId: 'emp-040',
      incumbentName: 'Sarah Kim',
      startDate: '2023-08-01',
      endDate: '2025-12-15',
      action: 'Vacated',
      reason: 'Internal transfer to Singapore office',
    },
  ],
};

// ── Service ────────────────────────────────────────────────────────────────────

export class PositionService {
  /**
   * Get paginated/filtered position list.
   */
  static async getPositions(filters?: PositionFilters): Promise<Position[]> {
    await new Promise((r) => setTimeout(r, 200));
    let result = [...MOCK_POSITIONS];

    if (filters?.status?.length) {
      result = result.filter((p) => filters.status!.includes(p.status));
    }
    if (filters?.departmentId) {
      result = result.filter((p) => p.departmentId === filters.departmentId);
    }
    if (filters?.type) {
      result = result.filter((p) => p.type === filters.type);
    }
    if (filters?.location) {
      result = result.filter((p) =>
        p.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    if (filters?.grade) {
      result = result.filter((p) => p.grade === filters.grade);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.incumbentName?.toLowerCase().includes(q)
      );
    }

    return result;
  }

  /**
   * Get a single position by ID.
   */
  static async getPosition(id: string): Promise<Position | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_POSITIONS.find((p) => p.id === id) ?? null;
  }

  /**
   * Create a new position (Proposed status).
   */
  static async createPosition(data: CreatePositionData): Promise<Position> {
    await new Promise((r) => setTimeout(r, 200));
    const newPos: Position = {
      id: `pos-${Date.now()}`,
      code: `NEW-${Math.floor(Math.random() * 900) + 100}`,
      title: data.title,
      departmentId: data.departmentId,
      department: 'Pending',
      grade: data.grade,
      jobFamily: data.jobFamily,
      status: 'Proposed',
      type: data.type,
      incumbentId: null,
      incumbentName: null,
      incumbentStartDate: null,
      reportingToId: data.reportingToId,
      reportingToName: 'Pending',
      location: data.location,
      annualBudget: data.annualBudget,
      actualCost: 0,
      headcountBudgetYear: data.headcountBudgetYear,
      daysVacant: null,
      frozenReason: null,
      frozenDate: null,
      approvedDate: null,
      requiredBy: data.requiredBy,
      notes: data.notes,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    MOCK_POSITIONS.push(newPos);
    return newPos;
  }

  /**
   * Update position details.
   */
  static async updatePosition(id: string, data: Partial<Position>): Promise<Position> {
    await new Promise((r) => setTimeout(r, 200));
    const idx = MOCK_POSITIONS.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error(`Position ${id} not found`);
    MOCK_POSITIONS[idx] = {
      ...MOCK_POSITIONS[idx],
      ...data,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    return MOCK_POSITIONS[idx];
  }

  /**
   * Freeze a position (hiring freeze).
   */
  static async freezePosition(id: string, reason: string): Promise<Position> {
    return this.updatePosition(id, {
      status: 'Frozen',
      frozenReason: reason,
      frozenDate: new Date().toISOString().slice(0, 10),
    });
  }

  /**
   * Get headcount budget summary per department for a fiscal year.
   */
  static async getHeadcountBudget(
    departmentId?: string,
    fiscalYear: number = 2026
  ): Promise<HeadcountBudget[]> {
    await new Promise((r) => setTimeout(r, 200));

    const departments = [
      { id: 'dept-001', name: 'Technology' },
      { id: 'dept-002', name: 'Human Resources' },
      { id: 'dept-003', name: 'Finance' },
      { id: 'dept-004', name: 'Marketing' },
      { id: 'dept-005', name: 'Operations' },
      { id: 'dept-006', name: 'Legal' },
      { id: 'dept-007', name: 'Product' },
      { id: 'dept-008', name: 'Sales' },
    ];

    const depts = departmentId ? departments.filter((d) => d.id === departmentId) : departments;

    return depts.map((dept) => {
      const positions = MOCK_POSITIONS.filter(
        (p) => p.departmentId === dept.id && p.headcountBudgetYear === fiscalYear
      );
      const filled = positions.filter((p) => p.status === 'Filled');
      const vacant = positions.filter((p) => p.status === 'Vacant');
      const frozen = positions.filter((p) => p.status === 'Frozen');
      const proposed = positions.filter((p) => p.status === 'Proposed');
      const approved = positions.filter(
        (p) => p.approvedDate && p.status !== 'Eliminated' && p.status !== 'Proposed'
      );

      const budgetedCost = positions.reduce((s, p) => s + p.annualBudget, 0);
      const actualCost = filled.reduce((s, p) => s + p.actualCost, 0);
      const variance = budgetedCost - actualCost;
      const utilizationPct = budgetedCost > 0 ? Math.round((actualCost / budgetedCost) * 100) : 0;

      return {
        departmentId: dept.id,
        department: dept.name,
        fiscalYear,
        approvedHeadcount: approved.length,
        currentHeadcount: filled.length,
        vacantPositions: vacant.length,
        frozenPositions: frozen.length,
        proposedPositions: proposed.length,
        budgetedCost,
        actualCost,
        variance,
        utilizationPct,
        budgetStatus:
          variance < 0
            ? 'Over Budget'
            : variance > budgetedCost * 0.1
              ? 'Under Budget'
              : 'Within Budget',
      };
    });
  }

  /**
   * Get hierarchical org chart data.
   */
  static async getOrgChart(departmentId?: string): Promise<OrgNode[]> {
    await new Promise((r) => setTimeout(r, 200));

    const positions = departmentId
      ? MOCK_POSITIONS.filter((p) => p.departmentId === departmentId)
      : MOCK_POSITIONS;

    const posMap = new Map<string, OrgNode>(
      positions.map((p) => [
        p.id,
        {
          positionId: p.id,
          positionTitle: p.title,
          positionCode: p.code,
          incumbentId: p.incumbentId,
          incumbentName: p.incumbentName,
          grade: p.grade,
          status: p.status,
          department: p.department,
          children: [],
        },
      ])
    );

    const roots: OrgNode[] = [];
    for (const p of positions) {
      const node = posMap.get(p.id)!;
      if (!p.reportingToId || !posMap.has(p.reportingToId)) {
        roots.push(node);
      } else {
        posMap.get(p.reportingToId)!.children.push(node);
      }
    }
    return roots;
  }

  /**
   * Get historical incumbents for a position.
   */
  static async getPositionHistory(id: string): Promise<PositionHistory> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      positionId: id,
      records: MOCK_POSITION_HISTORY[id] ?? [],
    };
  }
}
