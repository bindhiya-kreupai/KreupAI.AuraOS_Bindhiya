/**
 * @module positionManagementService
 * @description Position Management — full lifecycle position control with org hierarchy,
 *   budget tracking, headcount planning, and reporting chain management.
 * @project AURA HCM Platform
 * @section 10.2 — Position Management
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

export interface PositionFilters {
  departmentId?: string;
  status?: PositionStatus;
  type?: PositionType;
  gradeMin?: string;
  gradeMax?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PositionIncumbent {
  employeeId: string;
  employeeCode: string;
  name: string;
  startDate: string;
  salary: number;
  avatarInitials: string;
}

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
  incumbent: PositionIncumbent | null;
  reportingToId: string | null;
  reportingToTitle: string | null;
  reportingToName: string | null;
  location: string;
  annualBudget: number;
  actualCost: number;
  headcountBudgetYear: number;
  daysVacant: number | null;
  frozenReason: string | null;
  requiredBy: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PositionDetail extends Position {
  reportingChain: Array<{ id: string; title: string; incumbentName: string | null }>;
  directReports: Array<{
    id: string;
    title: string;
    incumbentName: string | null;
    status: PositionStatus;
  }>;
  jobDescription: string;
  requiredCompetencies: string[];
  budgetHistory: Array<{ year: number; approved: number; actual: number }>;
}

export interface DepartmentBudget {
  departmentId: string;
  department: string;
  approvedHeadcount: number;
  filledPositions: number;
  vacantPositions: number;
  frozenPositions: number;
  approvedBudget: number;
  actualCost: number;
  variance: number;
  variancePercent: number;
  utilizationPercent: number;
}

export interface OrgNode {
  id: string;
  positionCode: string;
  title: string;
  incumbentId: string | null;
  incumbentName: string | null;
  incumbentAvatar: string | null;
  department: string;
  grade: string;
  status: PositionStatus;
  children: OrgNode[];
}

export interface PositionHistoryEntry {
  id: string;
  positionId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
  reason: string;
}

export interface CreatePositionData {
  title: string;
  departmentId: string;
  grade: string;
  jobFamily: string;
  type: PositionType;
  reportingToId?: string;
  location: string;
  annualBudget: number;
  headcountBudgetYear: number;
  requiredBy?: string;
  notes?: string;
  jobDescription?: string;
  requiredCompetencies?: string[];
}

export interface UpdatePositionData extends Partial<CreatePositionData> {
  status?: PositionStatus;
  frozenReason?: string;
}

export interface PositionListResult {
  positions: Position[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_POSITIONS: Position[] = [
  {
    id: 'POS-001',
    code: 'POS-CEO-001',
    title: 'Chief Executive Officer',
    departmentId: 'DEPT-EXEC',
    department: 'Executive',
    grade: 'E1',
    jobFamily: 'Executive Leadership',
    status: 'Filled',
    type: 'Permanent',
    incumbent: {
      employeeId: 'EMP-001',
      employeeCode: 'EMP001',
      name: 'Ahmad Al-Rashidi',
      startDate: '2018-01-15',
      salary: 450000,
      avatarInitials: 'AR',
    },
    reportingToId: null,
    reportingToTitle: null,
    reportingToName: null,
    location: 'Dubai HQ',
    annualBudget: 500000,
    actualCost: 450000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    requiredBy: null,
    notes: 'Executive leadership position',
    createdAt: '2018-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'POS-002',
    code: 'POS-CHRO-001',
    title: 'Chief Human Resources Officer',
    departmentId: 'DEPT-HR',
    department: 'Human Resources',
    grade: 'E2',
    jobFamily: 'HR Leadership',
    status: 'Filled',
    type: 'Permanent',
    incumbent: {
      employeeId: 'EMP-002',
      employeeCode: 'EMP002',
      name: 'Fatima Al-Zahra',
      startDate: '2019-03-01',
      salary: 360000,
      avatarInitials: 'FZ',
    },
    reportingToId: 'POS-001',
    reportingToTitle: 'Chief Executive Officer',
    reportingToName: 'Ahmad Al-Rashidi',
    location: 'Dubai HQ',
    annualBudget: 400000,
    actualCost: 360000,
    headcountBudgetYear: 2026,
    daysVacant: null,
    frozenReason: null,
    requiredBy: null,
    notes: '',
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'POS-003',
    code: 'POS-HRBP-002',
    title: 'HR Business Partner',
    departmentId: 'DEPT-HR',
    department: 'Human Resources',
    grade: 'M3',
    jobFamily: 'HR Business Partnering',
    status: 'Vacant',
    type: 'Permanent',
    incumbent: null,
    reportingToId: 'POS-002',
    reportingToTitle: 'Chief Human Resources Officer',
    reportingToName: 'Fatima Al-Zahra',
    location: 'Riyadh Office',
    annualBudget: 180000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: 45,
    frozenReason: null,
    requiredBy: '2026-03-31',
    notes: 'Urgent hire needed for KSA expansion',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
  },
  {
    id: 'POS-004',
    code: 'POS-FIN-003',
    title: 'Senior Financial Analyst',
    departmentId: 'DEPT-FIN',
    department: 'Finance',
    grade: 'P4',
    jobFamily: 'Finance & Accounting',
    status: 'Frozen',
    type: 'Permanent',
    incumbent: null,
    reportingToId: 'POS-005',
    reportingToTitle: 'Finance Manager',
    reportingToName: 'Khalid Ibrahim',
    location: 'Dubai HQ',
    annualBudget: 150000,
    actualCost: 0,
    headcountBudgetYear: 2026,
    daysVacant: 120,
    frozenReason: 'Budget review pending for Q1 2026',
    requiredBy: null,
    notes: 'On hold pending cost review',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-12-01T08:00:00Z',
  },
];

const MOCK_HISTORY: PositionHistoryEntry[] = [
  {
    id: 'H001',
    positionId: 'POS-003',
    field: 'status',
    oldValue: 'Filled',
    newValue: 'Vacant',
    changedBy: 'Fatima Al-Zahra',
    changedAt: '2025-12-15T10:30:00Z',
    reason: 'Incumbent resigned',
  },
  {
    id: 'H002',
    positionId: 'POS-003',
    field: 'annualBudget',
    oldValue: '160000',
    newValue: '180000',
    changedBy: 'Fatima Al-Zahra',
    changedAt: '2026-01-05T09:00:00Z',
    reason: 'Market adjustment for KSA',
  },
  {
    id: 'H003',
    positionId: 'POS-004',
    field: 'status',
    oldValue: 'Vacant',
    newValue: 'Frozen',
    changedBy: 'Ahmad Al-Rashidi',
    changedAt: '2025-12-01T14:00:00Z',
    reason: 'Budget freeze Q4 2025',
  },
];

// ── Service Functions ─────────────────────────────────────────────────────────

export async function getPositions(filters: PositionFilters = {}): Promise<PositionListResult> {
  await new Promise((r) => setTimeout(r, 300));
  let results = [...MOCK_POSITIONS];
  if (filters.departmentId)
    results = results.filter((p) => p.departmentId === filters.departmentId);
  if (filters.status) results = results.filter((p) => p.status === filters.status);
  if (filters.type) results = results.filter((p) => p.type === filters.type);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (p) => p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    );
  }
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const total = results.length;
  const paginated = results.slice((page - 1) * pageSize, page * pageSize);
  return { positions: paginated, total, page, pageSize };
}

export async function getPosition(id: string): Promise<PositionDetail> {
  await new Promise((r) => setTimeout(r, 200));
  const pos = MOCK_POSITIONS.find((p) => p.id === id) ?? MOCK_POSITIONS[0];
  return {
    ...pos,
    reportingChain: [
      { id: 'POS-001', title: 'Chief Executive Officer', incumbentName: 'Ahmad Al-Rashidi' },
    ],
    directReports: [
      { id: 'POS-003', title: 'HR Business Partner', incumbentName: null, status: 'Vacant' },
    ],
    jobDescription:
      'Responsible for strategic HR function across the organization, driving talent management, employee engagement, and organizational development initiatives.',
    requiredCompetencies: [
      'Strategic Thinking',
      'Leadership',
      'Change Management',
      'Business Acumen',
      'Communication',
    ],
    budgetHistory: [
      { year: 2024, approved: 380000, actual: 355000 },
      { year: 2025, approved: 400000, actual: 360000 },
      { year: 2026, approved: 400000, actual: 90000 },
    ],
  };
}

export async function createPosition(data: CreatePositionData): Promise<Position> {
  await new Promise((r) => setTimeout(r, 400));
  const id = `POS-${String(Date.now()).slice(-4)}`;
  const code = `POS-${data.departmentId.replace('DEPT-', '')}-${String(Date.now()).slice(-3)}`;
  return {
    id,
    code,
    ...data,
    department: 'New Department',
    status: 'Proposed',
    incumbent: null,
    reportingToTitle: null,
    reportingToName: null,
    reportingToId: data.reportingToId ?? null,
    actualCost: 0,
    daysVacant: null,
    frozenReason: null,
    notes: data.notes ?? '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updatePosition(id: string, data: UpdatePositionData): Promise<Position> {
  await new Promise((r) => setTimeout(r, 300));
  const existing = MOCK_POSITIONS.find((p) => p.id === id) ?? MOCK_POSITIONS[0];
  return { ...existing, ...data, updatedAt: new Date().toISOString() };
}

export async function getPositionBudget(departmentId?: string): Promise<DepartmentBudget[]> {
  await new Promise((r) => setTimeout(r, 250));
  const budgets: DepartmentBudget[] = [
    {
      departmentId: 'DEPT-HR',
      department: 'Human Resources',
      approvedHeadcount: 12,
      filledPositions: 9,
      vacantPositions: 2,
      frozenPositions: 1,
      approvedBudget: 2400000,
      actualCost: 1980000,
      variance: 420000,
      variancePercent: 17.5,
      utilizationPercent: 75,
    },
    {
      departmentId: 'DEPT-FIN',
      department: 'Finance',
      approvedHeadcount: 8,
      filledPositions: 7,
      vacantPositions: 0,
      frozenPositions: 1,
      approvedBudget: 1600000,
      actualCost: 1450000,
      variance: 150000,
      variancePercent: 9.4,
      utilizationPercent: 87.5,
    },
    {
      departmentId: 'DEPT-TECH',
      department: 'Technology',
      approvedHeadcount: 25,
      filledPositions: 22,
      vacantPositions: 3,
      frozenPositions: 0,
      approvedBudget: 5500000,
      actualCost: 5100000,
      variance: 400000,
      variancePercent: 7.3,
      utilizationPercent: 88,
    },
    {
      departmentId: 'DEPT-OPS',
      department: 'Operations',
      approvedHeadcount: 40,
      filledPositions: 38,
      vacantPositions: 2,
      frozenPositions: 0,
      approvedBudget: 4800000,
      actualCost: 4620000,
      variance: 180000,
      variancePercent: 3.75,
      utilizationPercent: 95,
    },
  ];
  if (departmentId) return budgets.filter((b) => b.departmentId === departmentId);
  return budgets;
}

export async function getOrgChart(_rootId?: string): Promise<OrgNode> {
  await new Promise((r) => setTimeout(r, 350));
  return {
    id: 'POS-001',
    positionCode: 'POS-CEO-001',
    title: 'Chief Executive Officer',
    incumbentId: 'EMP-001',
    incumbentName: 'Ahmad Al-Rashidi',
    incumbentAvatar: 'AR',
    department: 'Executive',
    grade: 'E1',
    status: 'Filled',
    children: [
      {
        id: 'POS-002',
        positionCode: 'POS-CHRO-001',
        title: 'Chief Human Resources Officer',
        incumbentId: 'EMP-002',
        incumbentName: 'Fatima Al-Zahra',
        incumbentAvatar: 'FZ',
        department: 'Human Resources',
        grade: 'E2',
        status: 'Filled',
        children: [
          {
            id: 'POS-003',
            positionCode: 'POS-HRBP-002',
            title: 'HR Business Partner',
            incumbentId: null,
            incumbentName: null,
            incumbentAvatar: null,
            department: 'Human Resources',
            grade: 'M3',
            status: 'Vacant',
            children: [],
          },
        ],
      },
      {
        id: 'POS-CFO-001',
        positionCode: 'POS-CFO-001',
        title: 'Chief Financial Officer',
        incumbentId: 'EMP-010',
        incumbentName: 'Khalid Ibrahim',
        incumbentAvatar: 'KI',
        department: 'Finance',
        grade: 'E2',
        status: 'Filled',
        children: [
          {
            id: 'POS-004',
            positionCode: 'POS-FIN-003',
            title: 'Senior Financial Analyst',
            incumbentId: null,
            incumbentName: null,
            incumbentAvatar: null,
            department: 'Finance',
            grade: 'P4',
            status: 'Frozen',
            children: [],
          },
        ],
      },
    ],
  };
}

export async function getPositionHistory(id: string): Promise<PositionHistoryEntry[]> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_HISTORY.filter((h) => h.positionId === id);
}
