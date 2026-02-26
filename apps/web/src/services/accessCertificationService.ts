/**
 * @module accessCertificationService
 * @description Access Certification Service — periodic access reviews, certification campaigns,
 *   entitlement reporting, anomaly detection, and access governance compliance.
 * @project AURA HCM Platform
 * @section 24.2 — Access Governance & Certification
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type CampaignStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled' | 'Scheduled';
export type ReviewDecision = 'Approved' | 'Revoked' | 'Pending' | 'Escalated';
export type AnomalyType =
  | 'Excessive Permissions'
  | 'Dormant Account'
  | 'SoD Violation'
  | 'Unusual Access'
  | 'Orphan Account'
  | 'Shared Account';
export type AnomalySeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface CampaignFilter {
  status?: CampaignStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CertificationCampaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  scope: 'All Users' | 'Department' | 'Role' | 'Application';
  scopeValue: string | null;
  startDate: string;
  endDate: string;
  totalReviews: number;
  completedReviews: number;
  approvedReviews: number;
  revokedReviews: number;
  pendingReviews: number;
  completionPercent: number;
  createdBy: string;
  createdAt: string;
  remindersSent: number;
}

export interface AccessReview {
  id: string;
  campaignId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerDepartment: string;
  subjectId: string;
  subjectName: string;
  subjectDepartment: string;
  subjectJobTitle: string;
  accessType: string;
  accessLevel: string;
  application: string;
  permissions: string[];
  lastUsed: string | null;
  daysSinceLastUse: number | null;
  grantedDate: string;
  grantedBy: string;
  decision: ReviewDecision;
  decidedAt: string | null;
  comments: string;
  riskScore: number;
}

export interface AccessAnomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  userId: string;
  userName: string;
  department: string;
  description: string;
  detectedAt: string;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  riskScore: number;
  affectedSystems: string[];
  recommendedAction: string;
}

export interface EntitlementRecord {
  applicationId: string;
  applicationName: string;
  accessLevel: string;
  permissions: string[];
  grantedDate: string;
  grantedBy: string;
  lastUsed: string | null;
  isActive: boolean;
  riskLevel: 'High' | 'Medium' | 'Low';
  certifiedAt: string | null;
  certifiedBy: string | null;
}

export interface UserEntitlementReport {
  userId: string;
  userName: string;
  employeeCode: string;
  department: string;
  jobTitle: string;
  entitlements: EntitlementRecord[];
  totalPermissions: number;
  highRiskPermissions: number;
  lastCertified: string | null;
  riskScore: number;
  anomalies: AccessAnomaly[];
}

export interface CreateCampaignData {
  name: string;
  description: string;
  scope: 'All Users' | 'Department' | 'Role' | 'Application';
  scopeValue?: string;
  startDate: string;
  endDate: string;
  reviewerStrategy: 'Manager' | 'HR' | 'Application Owner' | 'Custom';
  applications?: string[];
  notifyReviewers: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGNS: CertificationCampaign[] = [
  {
    id: 'CAMP-001',
    name: 'Q1 2026 Quarterly Access Review',
    description: 'Quarterly review of all user access entitlements across enterprise applications',
    status: 'Active',
    scope: 'All Users',
    scopeValue: null,
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    totalReviews: 1240,
    completedReviews: 892,
    approvedReviews: 780,
    revokedReviews: 112,
    pendingReviews: 348,
    completionPercent: 72.0,
    createdBy: 'Security Admin',
    createdAt: '2026-01-25T09:00:00Z',
    remindersSent: 2,
  },
  {
    id: 'CAMP-002',
    name: 'Finance Systems Access Certification',
    description: 'Annual certification of access to ERP and financial systems',
    status: 'Completed',
    scope: 'Application',
    scopeValue: 'Finance ERP',
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    totalReviews: 145,
    completedReviews: 145,
    approvedReviews: 128,
    revokedReviews: 17,
    pendingReviews: 0,
    completionPercent: 100.0,
    createdBy: 'Compliance Officer',
    createdAt: '2025-11-20T10:00:00Z',
    remindersSent: 3,
  },
  {
    id: 'CAMP-003',
    name: 'Privileged Access Review — IT Admins',
    description: 'Bi-annual review of privileged and administrative access',
    status: 'Scheduled',
    scope: 'Role',
    scopeValue: 'System Administrator',
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    totalReviews: 0,
    completedReviews: 0,
    approvedReviews: 0,
    revokedReviews: 0,
    pendingReviews: 0,
    completionPercent: 0,
    createdBy: 'CISO',
    createdAt: '2026-02-20T14:00:00Z',
    remindersSent: 0,
  },
];

const MOCK_REVIEWS: AccessReview[] = [
  {
    id: 'REV-001',
    campaignId: 'CAMP-001',
    reviewerId: 'EMP-050',
    reviewerName: 'Tariq Hassan',
    reviewerDepartment: 'Technology',
    subjectId: 'EMP-101',
    subjectName: 'Mohammed Al-Farsi',
    subjectDepartment: 'Technology',
    subjectJobTitle: 'Senior Software Engineer',
    accessType: 'Application Role',
    accessLevel: 'Admin',
    application: 'Jira',
    permissions: ['Project Admin', 'User Management', 'Billing Admin'],
    lastUsed: '2026-02-20T14:30:00Z',
    daysSinceLastUse: 6,
    grantedDate: '2022-05-01',
    grantedBy: 'IT Admin',
    decision: 'Pending',
    decidedAt: null,
    comments: '',
    riskScore: 78,
  },
  {
    id: 'REV-002',
    campaignId: 'CAMP-001',
    reviewerId: 'EMP-010',
    reviewerName: 'Khalid Ibrahim',
    reviewerDepartment: 'Finance',
    subjectId: 'EMP-205',
    subjectName: 'Priya Nair',
    subjectDepartment: 'Finance',
    subjectJobTitle: 'Financial Analyst',
    accessType: 'Application Role',
    accessLevel: 'Read/Write',
    application: 'Finance ERP',
    permissions: ['GL View', 'AP Entry', 'Budget Reports'],
    lastUsed: '2026-02-25T10:00:00Z',
    daysSinceLastUse: 1,
    grantedDate: '2023-08-15',
    grantedBy: 'Finance Manager',
    decision: 'Approved',
    decidedAt: '2026-02-24T11:00:00Z',
    comments: 'Access required for daily job function',
    riskScore: 35,
  },
  {
    id: 'REV-003',
    campaignId: 'CAMP-001',
    reviewerId: 'EMP-050',
    reviewerName: 'Tariq Hassan',
    reviewerDepartment: 'Technology',
    subjectId: 'EMP-999',
    subjectName: 'Former Employee (Inactive)',
    subjectDepartment: 'Technology',
    subjectJobTitle: 'Software Engineer',
    accessType: 'System Access',
    accessLevel: 'Full Access',
    application: 'GitHub Enterprise',
    permissions: ['Repo Admin', 'Org Owner'],
    lastUsed: '2025-11-30T16:00:00Z',
    daysSinceLastUse: 88,
    grantedDate: '2021-03-01',
    grantedBy: 'IT Admin',
    decision: 'Revoked',
    decidedAt: '2026-02-10T09:00:00Z',
    comments: 'Employee no longer with company — access revoked',
    riskScore: 95,
  },
];

const MOCK_ANOMALIES: AccessAnomaly[] = [
  {
    id: 'ANM-001',
    type: 'Excessive Permissions',
    severity: 'High',
    userId: 'EMP-101',
    userName: 'Mohammed Al-Farsi',
    department: 'Technology',
    description: 'User has Admin access to 14 applications — significantly above peer average of 3',
    detectedAt: '2026-02-15T08:00:00Z',
    isResolved: false,
    resolvedAt: null,
    resolvedBy: null,
    riskScore: 82,
    affectedSystems: ['Jira', 'Confluence', 'GitHub', 'AWS Console', 'Datadog'],
    recommendedAction:
      'Review and reduce application admin roles to only those required for current role',
  },
  {
    id: 'ANM-002',
    type: 'Dormant Account',
    severity: 'Medium',
    userId: 'EMP-088',
    userName: 'Carlos Mendez',
    department: 'Operations',
    description: 'User account active but no login recorded in 92 days — employee retired',
    detectedAt: '2026-02-10T10:00:00Z',
    isResolved: true,
    resolvedAt: '2026-02-12T14:00:00Z',
    resolvedBy: 'IT Admin',
    riskScore: 65,
    affectedSystems: ['HRMS', 'ERP', 'Document Management'],
    recommendedAction: 'Deactivate account and revoke all access',
  },
  {
    id: 'ANM-003',
    type: 'SoD Violation',
    severity: 'Critical',
    userId: 'EMP-302',
    userName: 'Ali Hassan',
    department: 'Finance',
    description:
      'User can both create and approve payment requests — violates Segregation of Duties policy',
    detectedAt: '2026-02-20T09:30:00Z',
    isResolved: false,
    resolvedAt: null,
    resolvedBy: null,
    riskScore: 97,
    affectedSystems: ['Finance ERP', 'Payment Gateway'],
    recommendedAction: 'Immediately revoke payment approval rights and assign to separate user',
  },
];

// ── Service Functions ─────────────────────────────────────────────────────────

export async function getCertificationCampaigns(
  filters: CampaignFilter = {}
): Promise<{ campaigns: CertificationCampaign[]; total: number }> {
  await new Promise((r) => setTimeout(r, 300));
  let results = [...MOCK_CAMPAIGNS];
  if (filters.status) results = results.filter((c) => c.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((c) => c.name.toLowerCase().includes(q));
  }
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const total = results.length;
  return { campaigns: results.slice((page - 1) * pageSize, page * pageSize), total };
}

export async function createCampaign(data: CreateCampaignData): Promise<CertificationCampaign> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    id: `CAMP-${Date.now()}`,
    name: data.name,
    description: data.description,
    status: 'Draft',
    scope: data.scope,
    scopeValue: data.scopeValue ?? null,
    startDate: data.startDate,
    endDate: data.endDate,
    totalReviews: 0,
    completedReviews: 0,
    approvedReviews: 0,
    revokedReviews: 0,
    pendingReviews: 0,
    completionPercent: 0,
    createdBy: 'Current User',
    createdAt: new Date().toISOString(),
    remindersSent: 0,
  };
}

export async function getCampaignReviews(
  campaignId: string,
  filters: { decision?: ReviewDecision } = {}
): Promise<AccessReview[]> {
  await new Promise((r) => setTimeout(r, 250));
  let results = MOCK_REVIEWS.filter((r) => r.campaignId === campaignId);
  if (filters.decision) results = results.filter((r) => r.decision === filters.decision);
  return results;
}

export async function submitReview(
  reviewId: string,
  decision: 'Approved' | 'Revoked',
  comments?: string
): Promise<AccessReview> {
  await new Promise((r) => setTimeout(r, 350));
  const review = MOCK_REVIEWS.find((r) => r.id === reviewId) ?? MOCK_REVIEWS[0];
  return {
    ...review,
    decision,
    decidedAt: new Date().toISOString(),
    comments: comments ?? '',
  };
}

export async function getAccessAnomalies(
  filters: { severity?: AnomalySeverity; isResolved?: boolean } = {}
): Promise<AccessAnomaly[]> {
  await new Promise((r) => setTimeout(r, 250));
  let results = [...MOCK_ANOMALIES];
  if (filters.severity) results = results.filter((a) => a.severity === filters.severity);
  if (filters.isResolved !== undefined)
    results = results.filter((a) => a.isResolved === filters.isResolved);
  return results;
}

export async function getEntitlementReport(userId: string): Promise<UserEntitlementReport> {
  await new Promise((r) => setTimeout(r, 300));
  const entitlements: EntitlementRecord[] = [
    {
      applicationId: 'APP-001',
      applicationName: 'HRMS',
      accessLevel: 'Full Access',
      permissions: ['Employee View', 'Leave Management', 'Reports'],
      grantedDate: '2022-01-10',
      grantedBy: 'HR Admin',
      lastUsed: '2026-02-26T08:00:00Z',
      isActive: true,
      riskLevel: 'Low',
      certifiedAt: '2026-01-15T00:00:00Z',
      certifiedBy: 'Manager',
    },
    {
      applicationId: 'APP-002',
      applicationName: 'Jira',
      accessLevel: 'Admin',
      permissions: ['Project Admin', 'User Management', 'Billing Admin'],
      grantedDate: '2022-05-01',
      grantedBy: 'IT Admin',
      lastUsed: '2026-02-20T14:30:00Z',
      isActive: true,
      riskLevel: 'High',
      certifiedAt: null,
      certifiedBy: null,
    },
    {
      applicationId: 'APP-003',
      applicationName: 'GitHub Enterprise',
      accessLevel: 'Member',
      permissions: ['Repo Read', 'Repo Write', 'PR Review'],
      grantedDate: '2022-01-10',
      grantedBy: 'IT Admin',
      lastUsed: '2026-02-25T16:00:00Z',
      isActive: true,
      riskLevel: 'Medium',
      certifiedAt: '2026-01-15T00:00:00Z',
      certifiedBy: 'Manager',
    },
    {
      applicationId: 'APP-004',
      applicationName: 'AWS Console',
      accessLevel: 'Developer',
      permissions: ['EC2 Full', 'S3 Full', 'RDS Read'],
      grantedDate: '2023-03-15',
      grantedBy: 'DevOps Lead',
      lastUsed: '2026-02-24T11:00:00Z',
      isActive: true,
      riskLevel: 'High',
      certifiedAt: null,
      certifiedBy: null,
    },
    {
      applicationId: 'APP-005',
      applicationName: 'Finance ERP',
      accessLevel: 'Read Only',
      permissions: ['Budget View', 'Cost Reports'],
      grantedDate: '2024-01-01',
      grantedBy: 'Finance Manager',
      lastUsed: '2025-10-15T10:00:00Z',
      isActive: true,
      riskLevel: 'Medium',
      certifiedAt: '2025-12-20T00:00:00Z',
      certifiedBy: 'Finance Manager',
    },
  ];

  const userAnomalies = MOCK_ANOMALIES.filter((a) => a.userId === userId);
  const highRiskCount = entitlements.filter((e) => e.riskLevel === 'High').length;

  return {
    userId,
    userName: 'Mohammed Al-Farsi',
    employeeCode: 'EMP101',
    department: 'Technology',
    jobTitle: 'Senior Software Engineer',
    entitlements,
    totalPermissions: entitlements.reduce((sum, e) => sum + e.permissions.length, 0),
    highRiskPermissions: highRiskCount,
    lastCertified: '2026-01-15T00:00:00Z',
    riskScore: 78,
    anomalies: userAnomalies,
  };
}

export async function resolveAnomaly(
  anomalyId: string,
  _resolution: string
): Promise<AccessAnomaly> {
  await new Promise((r) => setTimeout(r, 300));
  const anomaly = MOCK_ANOMALIES.find((a) => a.id === anomalyId) ?? MOCK_ANOMALIES[0];
  return {
    ...anomaly,
    isResolved: true,
    resolvedAt: new Date().toISOString(),
    resolvedBy: 'Current User',
  };
}
