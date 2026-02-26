/**
 * @module policyManagementService
 * @description HR Policy Management — policy versioning, publishing, employee acknowledgements,
 *   compliance tracking, and multi-category policy governance.
 * @project AURA HCM Platform
 * @section 10.8 — Policy Management
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type PolicyCategory =
  | 'Code of Conduct'
  | 'Leave & Attendance'
  | 'Compensation & Benefits'
  | 'Recruitment'
  | 'Health & Safety'
  | 'IT & Data Security'
  | 'Travel & Expense'
  | 'Disciplinary'
  | 'Equal Opportunity'
  | 'Environmental';

export type PolicyStatus = 'Draft' | 'Under Review' | 'Active' | 'Superseded' | 'Archived';

export interface PolicyFilters {
  category?: PolicyCategory;
  status?: PolicyStatus;
  departmentId?: string;
  requiresAcknowledgement?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PolicyVersion {
  version: string;
  publishedAt: string;
  publishedBy: string;
  changeNotes: string;
  documentUrl: string;
}

export interface Policy {
  id: string;
  code: string;
  title: string;
  category: PolicyCategory;
  status: PolicyStatus;
  currentVersion: string;
  effectiveDate: string;
  reviewDate: string;
  owner: string;
  ownerDepartment: string;
  applicableTo: string; // 'All Employees' | 'Department' | 'Grade'
  requiresAcknowledgement: boolean;
  acknowledgedCount: number;
  totalApplicable: number;
  acknowledgedPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyDetail extends Policy {
  summary: string;
  fullText: string;
  documentUrl: string;
  versionHistory: PolicyVersion[];
  relatedPolicies: Array<{ id: string; title: string; code: string }>;
  approvers: Array<{ role: string; name: string; approvedAt: string | null }>;
}

export interface AcknowledgementRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  acknowledgedAt: string | null;
  status: 'Acknowledged' | 'Pending' | 'Overdue';
  method: 'Electronic' | 'Physical' | null;
}

export interface CreatePolicyData {
  title: string;
  category: PolicyCategory;
  summary: string;
  fullText: string;
  effectiveDate: string;
  reviewDate: string;
  owner: string;
  ownerDepartment: string;
  applicableTo: string;
  requiresAcknowledgement: boolean;
  approvers?: string[];
}

export interface UpdatePolicyData extends Partial<CreatePolicyData> {
  changeNotes?: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_POLICIES: Policy[] = [
  {
    id: 'POL-001',
    code: 'POL-COC-001',
    title: 'Code of Business Conduct and Ethics',
    category: 'Code of Conduct',
    status: 'Active',
    currentVersion: '3.0',
    effectiveDate: '2025-01-01',
    reviewDate: '2026-01-01',
    owner: 'Chief Compliance Officer',
    ownerDepartment: 'Legal & Compliance',
    applicableTo: 'All Employees',
    requiresAcknowledgement: true,
    acknowledgedCount: 468,
    totalApplicable: 495,
    acknowledgedPercent: 94.5,
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'POL-002',
    code: 'POL-LA-001',
    title: 'Annual Leave Policy',
    category: 'Leave & Attendance',
    status: 'Active',
    currentVersion: '2.1',
    effectiveDate: '2024-07-01',
    reviewDate: '2025-07-01',
    owner: 'CHRO',
    ownerDepartment: 'Human Resources',
    applicableTo: 'All Employees',
    requiresAcknowledgement: true,
    acknowledgedCount: 490,
    totalApplicable: 495,
    acknowledgedPercent: 99.0,
    createdAt: '2018-07-01T00:00:00Z',
    updatedAt: '2024-07-01T00:00:00Z',
  },
  {
    id: 'POL-003',
    code: 'POL-IT-001',
    title: 'Information Security and Acceptable Use Policy',
    category: 'IT & Data Security',
    status: 'Active',
    currentVersion: '4.2',
    effectiveDate: '2025-06-01',
    reviewDate: '2026-06-01',
    owner: 'Chief Information Security Officer',
    ownerDepartment: 'Technology',
    applicableTo: 'All Employees',
    requiresAcknowledgement: true,
    acknowledgedCount: 442,
    totalApplicable: 495,
    acknowledgedPercent: 89.3,
    createdAt: '2017-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'POL-004',
    code: 'POL-HS-001',
    title: 'Workplace Health and Safety Policy',
    category: 'Health & Safety',
    status: 'Active',
    currentVersion: '2.0',
    effectiveDate: '2025-01-01',
    reviewDate: '2026-01-01',
    owner: 'Head of HSE',
    ownerDepartment: 'Operations',
    applicableTo: 'All Employees',
    requiresAcknowledgement: false,
    acknowledgedCount: 0,
    totalApplicable: 495,
    acknowledgedPercent: 0,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'POL-005',
    code: 'POL-TE-001',
    title: 'Business Travel and Expense Reimbursement Policy',
    category: 'Travel & Expense',
    status: 'Under Review',
    currentVersion: '1.3-draft',
    effectiveDate: '2025-03-01',
    reviewDate: '2026-03-01',
    owner: 'CFO',
    ownerDepartment: 'Finance',
    applicableTo: 'All Employees',
    requiresAcknowledgement: false,
    acknowledgedCount: 0,
    totalApplicable: 495,
    acknowledgedPercent: 0,
    createdAt: '2021-03-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'POL-006',
    code: 'POL-DIS-001',
    title: 'Disciplinary and Grievance Procedure',
    category: 'Disciplinary',
    status: 'Active',
    currentVersion: '2.5',
    effectiveDate: '2024-01-01',
    reviewDate: '2026-01-01',
    owner: 'CHRO',
    ownerDepartment: 'Human Resources',
    applicableTo: 'All Employees',
    requiresAcknowledgement: true,
    acknowledgedCount: 480,
    totalApplicable: 495,
    acknowledgedPercent: 97.0,
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const MOCK_ACKNOWLEDGEMENTS: AcknowledgementRecord[] = [
  {
    employeeId: 'EMP-001',
    employeeCode: 'EMP001',
    employeeName: 'Ahmad Al-Rashidi',
    department: 'Executive',
    designation: 'CEO',
    acknowledgedAt: '2025-01-05T10:00:00Z',
    status: 'Acknowledged',
    method: 'Electronic',
  },
  {
    employeeId: 'EMP-002',
    employeeCode: 'EMP002',
    employeeName: 'Fatima Al-Zahra',
    department: 'Human Resources',
    designation: 'CHRO',
    acknowledgedAt: '2025-01-04T09:30:00Z',
    status: 'Acknowledged',
    method: 'Electronic',
  },
  {
    employeeId: 'EMP-101',
    employeeCode: 'EMP101',
    employeeName: 'Mohammed Al-Farsi',
    department: 'Technology',
    designation: 'Senior Engineer',
    acknowledgedAt: null,
    status: 'Pending',
    method: null,
  },
  {
    employeeId: 'EMP-205',
    employeeCode: 'EMP205',
    employeeName: 'Priya Nair',
    department: 'Finance',
    designation: 'Financial Analyst',
    acknowledgedAt: null,
    status: 'Overdue',
    method: null,
  },
];

// ── Service Functions ─────────────────────────────────────────────────────────

export async function getPolicies(
  filters: PolicyFilters = {}
): Promise<{ policies: Policy[]; total: number }> {
  await new Promise((r) => setTimeout(r, 300));
  let results = [...MOCK_POLICIES];
  if (filters.category) results = results.filter((p) => p.category === filters.category);
  if (filters.status) results = results.filter((p) => p.status === filters.status);
  if (filters.requiresAcknowledgement !== undefined)
    results = results.filter((p) => p.requiresAcknowledgement === filters.requiresAcknowledgement);
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
  return { policies: paginated, total };
}

export async function getPolicy(id: string): Promise<PolicyDetail> {
  await new Promise((r) => setTimeout(r, 200));
  const base = MOCK_POLICIES.find((p) => p.id === id) ?? MOCK_POLICIES[0];
  return {
    ...base,
    summary:
      'This policy outlines the standards of conduct expected from all employees and establishes a framework for ethical business practices.',
    fullText:
      'Section 1: Introduction\n\nThis Code of Business Conduct and Ethics sets forth the standards...\n\nSection 2: Scope\n\nThis policy applies to all employees, contractors, and associates...',
    documentUrl: `documents/policies/${base.code}_v${base.currentVersion}.pdf`,
    versionHistory: [
      {
        version: '1.0',
        publishedAt: '2019-01-01T00:00:00Z',
        publishedBy: 'Legal Team',
        changeNotes: 'Initial version',
        documentUrl: `documents/policies/${base.code}_v1.0.pdf`,
      },
      {
        version: '2.0',
        publishedAt: '2022-06-01T00:00:00Z',
        publishedBy: 'Compliance Officer',
        changeNotes: 'Updated for UAE Labour Law changes',
        documentUrl: `documents/policies/${base.code}_v2.0.pdf`,
      },
      {
        version: base.currentVersion,
        publishedAt: base.effectiveDate + 'T00:00:00Z',
        publishedBy: 'CHRO',
        changeNotes: 'Annual review update',
        documentUrl: `documents/policies/${base.code}_v${base.currentVersion}.pdf`,
      },
    ],
    relatedPolicies: [
      { id: 'POL-006', title: 'Disciplinary and Grievance Procedure', code: 'POL-DIS-001' },
      {
        id: 'POL-003',
        title: 'Information Security and Acceptable Use Policy',
        code: 'POL-IT-001',
      },
    ],
    approvers: [
      { role: 'Policy Owner', name: base.owner, approvedAt: base.effectiveDate + 'T00:00:00Z' },
      { role: 'Legal Counsel', name: 'Legal Team', approvedAt: base.effectiveDate + 'T00:00:00Z' },
      { role: 'CEO', name: 'Ahmad Al-Rashidi', approvedAt: base.effectiveDate + 'T00:00:00Z' },
    ],
  };
}

export async function createPolicy(data: CreatePolicyData): Promise<Policy> {
  await new Promise((r) => setTimeout(r, 500));
  const code = `POL-${data.category.slice(0, 3).toUpperCase().replace(/\s/g, '')}-${String(Date.now()).slice(-3)}`;
  return {
    id: `POL-${Date.now()}`,
    code,
    ...data,
    status: 'Draft',
    currentVersion: '1.0-draft',
    acknowledgedCount: 0,
    totalApplicable: 495,
    acknowledgedPercent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updatePolicy(id: string, data: UpdatePolicyData): Promise<Policy> {
  await new Promise((r) => setTimeout(r, 300));
  const base = MOCK_POLICIES.find((p) => p.id === id) ?? MOCK_POLICIES[0];
  const versionParts = base.currentVersion.split('.');
  const newMinor = parseInt(versionParts[1] ?? '0') + 1;
  const newVersion = `${versionParts[0]}.${newMinor}-draft`;
  return {
    ...base,
    ...data,
    currentVersion: newVersion,
    status: 'Under Review',
    updatedAt: new Date().toISOString(),
  };
}

export async function publishPolicy(id: string): Promise<Policy> {
  await new Promise((r) => setTimeout(r, 300));
  const base = MOCK_POLICIES.find((p) => p.id === id) ?? MOCK_POLICIES[0];
  const newVersion = base.currentVersion.replace('-draft', '');
  return {
    ...base,
    status: 'Active',
    currentVersion: newVersion,
    effectiveDate: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
  };
}

export async function getEmployeeAcknowledgements(
  _policyId: string
): Promise<{
  records: AcknowledgementRecord[];
  stats: { acknowledged: number; pending: number; overdue: number; total: number };
}> {
  await new Promise((r) => setTimeout(r, 250));
  const stats = {
    acknowledged: MOCK_ACKNOWLEDGEMENTS.filter((a) => a.status === 'Acknowledged').length,
    pending: MOCK_ACKNOWLEDGEMENTS.filter((a) => a.status === 'Pending').length,
    overdue: MOCK_ACKNOWLEDGEMENTS.filter((a) => a.status === 'Overdue').length,
    total: MOCK_ACKNOWLEDGEMENTS.length,
  };
  return { records: MOCK_ACKNOWLEDGEMENTS, stats };
}

export async function requireAcknowledgement(
  policyId: string,
  employeeIds: string[]
): Promise<{ sent: number; failed: number }> {
  await new Promise((r) => setTimeout(r, 400));
  return { sent: employeeIds.length, failed: 0 };
}
