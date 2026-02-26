/**
 * @module accessGovernanceService
 * @description Access Governance Service — Segregation of Duties rules, access review campaigns,
 *              role-permission matrix, violation detection, and exception requests.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type SoDSeverity = 'critical' | 'high' | 'medium' | 'low';
export type SoDConflictType = 'role-role' | 'permission-permission' | 'role-permission';
export type ReviewStatus = 'pending' | 'approved' | 'revoked' | 'escalated';
export type CampaignStatus = 'active' | 'completed' | 'draft' | 'cancelled';

export interface SoDRule {
  id: string;
  name: string;
  description: string;
  conflictType: SoDConflictType;
  severity: SoDSeverity;
  entityA: string; // role or permission name
  entityB: string; // role or permission name
  rationale: string;
  exceptionProcess?: string;
  activeViolations: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface SoDViolation {
  userId: string;
  userName: string;
  userEmail: string;
  ruleId: string;
  ruleName: string;
  severity: SoDSeverity;
  conflictingRoles: string[];
  detectedAt: string;
  hasException: boolean;
  exceptionReason?: string;
}

export interface AccessReviewItem {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  role: string;
  permission?: string;
  grantedAt: string;
  lastUsed?: string;
  status: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  riskScore: number; // 0-100
  isOverdue: boolean;
}

export interface AccessReviewCampaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  reviewType: 'role-certification' | 'access-rights' | 'privileged-access' | 'separation-of-duties';
  totalItems: number;
  completedItems: number;
  approvedItems: number;
  revokedItems: number;
  pendingItems: number;
  dueDate: string;
  startDate: string;
  completedAt?: string;
  owners: string[];
  targetScope: string; // e.g., "All Engineering roles", "Admin users"
}

export interface RolePermission {
  role: string;
  category: string;
  permissions: {
    key: string;
    label: string;
    category: string;
    granted: boolean;
  }[];
}

export interface AccessMatrix {
  roles: string[];
  permissionGroups: {
    group: string;
    permissions: string[];
  }[];
  assignments: Record<string, Record<string, boolean>>; // role -> permission -> granted
}

export interface SoDCheckResult {
  userId: string;
  requestedRole: string;
  currentRoles: string[];
  violations: {
    ruleId: string;
    ruleName: string;
    severity: SoDSeverity;
    conflictingRole: string;
    description: string;
  }[];
  canProceed: boolean;
  requiresException: boolean;
}

export interface CreateSoDRuleInput {
  name: string;
  description: string;
  conflictType: SoDConflictType;
  severity: SoDSeverity;
  entityA: string;
  entityB: string;
  rationale: string;
  exceptionProcess?: string;
}

export interface CreateReviewCampaignInput {
  name: string;
  description: string;
  reviewType: AccessReviewCampaign['reviewType'];
  targetScope: string;
  dueDate: string;
  owners: string[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SOD_RULES: SoDRule[] = [
  {
    id: 'sod-001',
    name: 'Payroll Create & Payroll Approve',
    description: 'The same user cannot create payroll AND approve it — prevents financial fraud.',
    conflictType: 'permission-permission',
    severity: 'critical',
    entityA: 'payroll.create',
    entityB: 'payroll.approve',
    rationale:
      'SOX control: Separation between payroll creation and approval prevents unauthorized payments.',
    exceptionProcess: 'CFO approval required. Document compensating control. Review quarterly.',
    activeViolations: 0,
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    createdBy: 'compliance-admin',
  },
  {
    id: 'sod-002',
    name: 'Super Admin & Auditor Role',
    description:
      'Super Admin and Auditor roles are incompatible — auditors cannot audit their own privileged actions.',
    conflictType: 'role-role',
    severity: 'critical',
    entityA: 'Super Admin',
    entityB: 'Auditor',
    rationale:
      'Independence principle: An auditor must not have admin access to systems they audit.',
    exceptionProcess: 'CISO approval required. Temporary access only with time-limited exception.',
    activeViolations: 1,
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    createdBy: 'compliance-admin',
  },
  {
    id: 'sod-003',
    name: 'Vendor Create & Payment Authorize',
    description: 'Same user cannot add vendors AND authorize payments to prevent vendor fraud.',
    conflictType: 'permission-permission',
    severity: 'critical',
    entityA: 'vendor.create',
    entityB: 'payment.authorize',
    rationale: 'Prevents fictitious vendor payment schemes. Key financial control.',
    exceptionProcess:
      'CFO and Legal approval required. Enhanced monitoring during exception period.',
    activeViolations: 0,
    isActive: true,
    createdAt: '2025-02-01T00:00:00Z',
    createdBy: 'finance-admin',
  },
  {
    id: 'sod-004',
    name: 'HR Admin & Payroll Admin',
    description:
      'HR Admin and Payroll Admin roles should be separated to prevent unauthorized salary changes.',
    conflictType: 'role-role',
    severity: 'high',
    entityA: 'HR Admin',
    entityB: 'Payroll Admin',
    rationale:
      'Prevents unauthorized salary modifications. Compensating controls exist for small businesses.',
    exceptionProcess: 'CHRO and CFO approval. Monthly reconciliation review required.',
    activeViolations: 2,
    isActive: true,
    createdAt: '2025-03-01T00:00:00Z',
    createdBy: 'compliance-admin',
  },
  {
    id: 'sod-005',
    name: 'User Create & Role Assign',
    description:
      'Users who can create accounts should not also assign roles — prevents privilege escalation.',
    conflictType: 'permission-permission',
    severity: 'high',
    entityA: 'user.create',
    entityB: 'role.assign',
    rationale: 'Prevents privilege escalation through self-created accounts.',
    activeViolations: 0,
    isActive: true,
    createdAt: '2025-04-01T00:00:00Z',
    createdBy: 'it-admin',
  },
  {
    id: 'sod-006',
    name: 'Expense Submit & Expense Approve',
    description: 'An employee cannot approve their own expense reports.',
    conflictType: 'permission-permission',
    severity: 'medium',
    entityA: 'expense.submit',
    entityB: 'expense.approve_self',
    rationale: 'Self-approval of expenses violates basic authorization controls.',
    activeViolations: 0,
    isActive: true,
    createdAt: '2025-01-20T00:00:00Z',
    createdBy: 'finance-admin',
  },
  {
    id: 'sod-007',
    name: 'IT Admin & Compliance Auditor',
    description:
      'IT Administrators should not perform compliance audits on IT systems they manage.',
    conflictType: 'role-role',
    severity: 'high',
    entityA: 'IT Admin',
    entityB: 'Compliance Auditor',
    rationale: 'Independence of audit function from IT operations.',
    exceptionProcess: 'External auditor must co-sign any IT audit performed by IT staff.',
    activeViolations: 0,
    isActive: true,
    createdAt: '2025-05-01T00:00:00Z',
    createdBy: 'compliance-admin',
  },
  {
    id: 'sod-008',
    name: 'Recruiter & Final Hiring Approval',
    description:
      'Recruiters managing candidates should not have final hiring authority to prevent bias.',
    conflictType: 'role-role',
    severity: 'medium',
    entityA: 'Recruiter',
    entityB: 'Hiring Approver',
    rationale: 'Reduces risk of biased or undisclosed-conflict hiring decisions.',
    activeViolations: 0,
    isActive: true,
    createdAt: '2025-06-01T00:00:00Z',
    createdBy: 'hr-admin',
  },
];

const MOCK_VIOLATIONS: SoDViolation[] = [
  {
    userId: 'emp-020',
    userName: 'Kevin Walsh',
    userEmail: 'k.walsh@company.com',
    ruleId: 'sod-002',
    ruleName: 'Super Admin & Auditor Role',
    severity: 'critical',
    conflictingRoles: ['Super Admin', 'Auditor'],
    detectedAt: '2026-02-20T08:00:00Z',
    hasException: false,
  },
  {
    userId: 'emp-021',
    userName: 'Patricia Moon',
    userEmail: 'p.moon@company.com',
    ruleId: 'sod-004',
    ruleName: 'HR Admin & Payroll Admin',
    severity: 'high',
    conflictingRoles: ['HR Admin', 'Payroll Admin'],
    detectedAt: '2026-02-18T10:30:00Z',
    hasException: true,
    exceptionReason:
      'Small company exception — compensating control: monthly reconciliation by CFO',
  },
  {
    userId: 'emp-022',
    userName: 'Carlos Herrera',
    userEmail: 'c.herrera@company.com',
    ruleId: 'sod-004',
    ruleName: 'HR Admin & Payroll Admin',
    severity: 'high',
    conflictingRoles: ['HR Admin', 'Payroll Admin'],
    detectedAt: '2026-02-19T14:00:00Z',
    hasException: false,
  },
];

const MOCK_CAMPAIGNS: AccessReviewCampaign[] = [
  {
    id: 'rev-001',
    name: 'Q1 2026 Role Certification',
    description: 'Quarterly review of all role assignments across Engineering and Product teams.',
    status: 'active',
    reviewType: 'role-certification',
    totalItems: 145,
    completedItems: 89,
    approvedItems: 82,
    revokedItems: 7,
    pendingItems: 56,
    dueDate: '2026-03-31T00:00:00Z',
    startDate: '2026-03-01T00:00:00Z',
    owners: ['hr-admin', 'dept-head-eng'],
    targetScope: 'Engineering & Product departments',
  },
  {
    id: 'rev-002',
    name: 'Privileged Access Annual Review',
    description:
      'Annual review of all privileged system access including admin, DBA, and security roles.',
    status: 'active',
    reviewType: 'privileged-access',
    totalItems: 28,
    completedItems: 12,
    approvedItems: 10,
    revokedItems: 2,
    pendingItems: 16,
    dueDate: '2026-02-28T00:00:00Z',
    startDate: '2026-02-01T00:00:00Z',
    owners: ['it-admin', 'compliance-admin'],
    targetScope: 'All privileged roles (Super Admin, IT Admin, DBA)',
  },
  {
    id: 'rev-003',
    name: 'SoD Violation Remediation Campaign',
    description:
      'Review all detected Separation of Duties violations and remediate or document exceptions.',
    status: 'draft',
    reviewType: 'separation-of-duties',
    totalItems: 0,
    completedItems: 0,
    approvedItems: 0,
    revokedItems: 0,
    pendingItems: 0,
    dueDate: '2026-04-30T00:00:00Z',
    startDate: '2026-04-01T00:00:00Z',
    owners: ['compliance-admin'],
    targetScope: 'All SoD violations detected in Q1 2026',
  },
];

const MOCK_REVIEW_ITEMS: AccessReviewItem[] = [
  {
    id: 'ri-001',
    reviewId: 'rev-001',
    userId: 'emp-001',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@company.com',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    grantedAt: '2022-03-15T00:00:00Z',
    lastUsed: '2026-02-24T15:30:00Z',
    status: 'pending',
    riskScore: 25,
    isOverdue: false,
  },
  {
    id: 'ri-002',
    reviewId: 'rev-001',
    userId: 'emp-011',
    userName: 'Alice Nguyen',
    userEmail: 'alice.nguyen@company.com',
    department: 'Engineering',
    role: 'IT Admin',
    grantedAt: '2024-01-10T00:00:00Z',
    lastUsed: '2026-02-25T09:00:00Z',
    status: 'approved',
    reviewedBy: 'hr-admin',
    reviewedAt: '2026-03-05T10:00:00Z',
    reviewComment: 'Active use confirmed. Role is appropriate.',
    riskScore: 75,
    isOverdue: false,
  },
  {
    id: 'ri-003',
    reviewId: 'rev-002',
    userId: 'emp-020',
    userName: 'Kevin Walsh',
    userEmail: 'k.walsh@company.com',
    department: 'IT',
    role: 'Super Admin',
    grantedAt: '2023-08-01T00:00:00Z',
    lastUsed: '2026-02-22T14:00:00Z',
    status: 'escalated',
    reviewedBy: 'it-admin',
    reviewedAt: '2026-02-20T10:00:00Z',
    reviewComment: 'SoD conflict detected — escalated to CISO for decision.',
    riskScore: 95,
    isOverdue: true,
  },
];

const MOCK_ACCESS_MATRIX: AccessMatrix = {
  roles: [
    'Super Admin',
    'HR Admin',
    'Payroll Admin',
    'Recruiter',
    'Manager',
    'Employee',
    'Auditor',
    'IT Admin',
  ],
  permissionGroups: [
    {
      group: 'Employee Records',
      permissions: ['employee.view', 'employee.create', 'employee.edit', 'employee.delete'],
    },
    {
      group: 'Payroll',
      permissions: ['payroll.view', 'payroll.create', 'payroll.approve', 'payroll.export'],
    },
    {
      group: 'Recruitment',
      permissions: ['candidate.view', 'candidate.create', 'offer.create', 'hiring.approve'],
    },
    {
      group: 'System Admin',
      permissions: ['user.create', 'role.assign', 'audit.view', 'system.configure'],
    },
  ],
  assignments: {
    'Super Admin': {
      'employee.view': true,
      'employee.create': true,
      'employee.edit': true,
      'employee.delete': true,
      'payroll.view': true,
      'payroll.create': true,
      'payroll.approve': true,
      'payroll.export': true,
      'candidate.view': true,
      'candidate.create': true,
      'offer.create': true,
      'hiring.approve': true,
      'user.create': true,
      'role.assign': true,
      'audit.view': true,
      'system.configure': true,
    },
    'HR Admin': {
      'employee.view': true,
      'employee.create': true,
      'employee.edit': true,
      'employee.delete': false,
      'payroll.view': true,
      'payroll.create': false,
      'payroll.approve': false,
      'payroll.export': true,
      'candidate.view': true,
      'candidate.create': true,
      'offer.create': true,
      'hiring.approve': false,
      'user.create': false,
      'role.assign': false,
      'audit.view': false,
      'system.configure': false,
    },
    'Payroll Admin': {
      'employee.view': true,
      'employee.create': false,
      'employee.edit': false,
      'employee.delete': false,
      'payroll.view': true,
      'payroll.create': true,
      'payroll.approve': true,
      'payroll.export': true,
      'candidate.view': false,
      'candidate.create': false,
      'offer.create': false,
      'hiring.approve': false,
      'user.create': false,
      'role.assign': false,
      'audit.view': false,
      'system.configure': false,
    },
    Recruiter: {
      'employee.view': true,
      'employee.create': false,
      'employee.edit': false,
      'employee.delete': false,
      'payroll.view': false,
      'payroll.create': false,
      'payroll.approve': false,
      'payroll.export': false,
      'candidate.view': true,
      'candidate.create': true,
      'offer.create': true,
      'hiring.approve': false,
      'user.create': false,
      'role.assign': false,
      'audit.view': false,
      'system.configure': false,
    },
    Manager: {
      'employee.view': true,
      'employee.create': false,
      'employee.edit': false,
      'employee.delete': false,
      'payroll.view': false,
      'payroll.create': false,
      'payroll.approve': false,
      'payroll.export': false,
      'candidate.view': true,
      'candidate.create': false,
      'offer.create': false,
      'hiring.approve': true,
      'user.create': false,
      'role.assign': false,
      'audit.view': false,
      'system.configure': false,
    },
    Employee: {
      'employee.view': false,
      'employee.create': false,
      'employee.edit': false,
      'employee.delete': false,
      'payroll.view': false,
      'payroll.create': false,
      'payroll.approve': false,
      'payroll.export': false,
      'candidate.view': false,
      'candidate.create': false,
      'offer.create': false,
      'hiring.approve': false,
      'user.create': false,
      'role.assign': false,
      'audit.view': false,
      'system.configure': false,
    },
    Auditor: {
      'employee.view': true,
      'employee.create': false,
      'employee.edit': false,
      'employee.delete': false,
      'payroll.view': true,
      'payroll.create': false,
      'payroll.approve': false,
      'payroll.export': true,
      'candidate.view': false,
      'candidate.create': false,
      'offer.create': false,
      'hiring.approve': false,
      'user.create': false,
      'role.assign': false,
      'audit.view': true,
      'system.configure': false,
    },
    'IT Admin': {
      'employee.view': true,
      'employee.create': false,
      'employee.edit': false,
      'employee.delete': false,
      'payroll.view': false,
      'payroll.create': false,
      'payroll.approve': false,
      'payroll.export': false,
      'candidate.view': false,
      'candidate.create': false,
      'offer.create': false,
      'hiring.approve': false,
      'user.create': true,
      'role.assign': true,
      'audit.view': true,
      'system.configure': true,
    },
  },
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class AccessGovernanceService {
  /**
   * Get all SoD rules
   */
  static async getSoDRules(): Promise<SoDRule[]> {
    try {
      return await APIClient.get<SoDRule[]>('/v1/access-governance/sod-rules');
    } catch {
      return MOCK_SOD_RULES;
    }
  }

  /**
   * Create a new SoD rule
   */
  static async createSoDRule(data: CreateSoDRuleInput): Promise<SoDRule> {
    try {
      return await APIClient.post<SoDRule>('/v1/access-governance/sod-rules', data);
    } catch {
      const newRule: SoDRule = {
        id: `sod-${Date.now()}`,
        ...data,
        activeViolations: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user',
      };
      MOCK_SOD_RULES.push(newRule);
      return newRule;
    }
  }

  /**
   * Toggle SoD rule active/inactive
   */
  static async toggleSoDRule(id: string, isActive: boolean): Promise<SoDRule> {
    try {
      return await APIClient.patch<SoDRule>(`/v1/access-governance/sod-rules/${id}`, { isActive });
    } catch {
      const idx = MOCK_SOD_RULES.findIndex((r) => r.id === id);
      if (idx < 0) throw new Error('Rule not found');
      MOCK_SOD_RULES[idx].isActive = isActive;
      return MOCK_SOD_RULES[idx];
    }
  }

  /**
   * Check if assigning a role to a user would create SoD violations
   */
  static async checkSoDViolations(userId: string, requestedRole: string): Promise<SoDCheckResult> {
    try {
      return await APIClient.post<SoDCheckResult>('/v1/access-governance/sod-check', {
        userId,
        requestedRole,
      });
    } catch {
      // Simulate role lookup — map some mock users to roles
      const userRoleMap: Record<string, string[]> = {
        'emp-020': ['Super Admin'],
        'emp-021': ['HR Admin', 'Payroll Admin'],
        'emp-001': ['Employee'],
        'emp-010': ['IT Admin'],
      };
      const currentRoles = userRoleMap[userId] ?? ['Employee'];

      const violations = MOCK_SOD_RULES.filter((rule) => rule.isActive)
        .filter(
          (rule) =>
            (rule.entityA === requestedRole && currentRoles.includes(rule.entityB)) ||
            (rule.entityB === requestedRole && currentRoles.includes(rule.entityA))
        )
        .map((rule) => ({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          conflictingRole: currentRoles.find((r) => r === rule.entityA || r === rule.entityB) ?? '',
          description: rule.description,
        }));

      return {
        userId,
        requestedRole,
        currentRoles,
        violations,
        canProceed: violations.length === 0 || violations.every((v) => v.severity === 'low'),
        requiresException: violations.some(
          (v) => v.severity === 'critical' || v.severity === 'high'
        ),
      };
    }
  }

  /**
   * Get all SoD violations
   */
  static async getSoDViolations(): Promise<SoDViolation[]> {
    try {
      return await APIClient.get<SoDViolation[]>('/v1/access-governance/violations');
    } catch {
      return MOCK_VIOLATIONS;
    }
  }

  /**
   * Get access review campaigns
   */
  static async getAccessReviews(): Promise<AccessReviewCampaign[]> {
    try {
      return await APIClient.get<AccessReviewCampaign[]>('/v1/access-governance/reviews');
    } catch {
      return MOCK_CAMPAIGNS;
    }
  }

  /**
   * Create an access review campaign
   */
  static async createAccessReview(data: CreateReviewCampaignInput): Promise<AccessReviewCampaign> {
    try {
      return await APIClient.post<AccessReviewCampaign>('/v1/access-governance/reviews', data);
    } catch {
      const newCampaign: AccessReviewCampaign = {
        id: `rev-${Date.now()}`,
        ...data,
        status: 'draft',
        totalItems: 0,
        completedItems: 0,
        approvedItems: 0,
        revokedItems: 0,
        pendingItems: 0,
        startDate: new Date().toISOString(),
      };
      MOCK_CAMPAIGNS.push(newCampaign);
      return newCampaign;
    }
  }

  /**
   * Get review items for a campaign
   */
  static async getReviewItems(reviewId: string): Promise<AccessReviewItem[]> {
    try {
      return await APIClient.get<AccessReviewItem[]>(
        `/v1/access-governance/reviews/${reviewId}/items`
      );
    } catch {
      return MOCK_REVIEW_ITEMS.filter((i) => i.reviewId === reviewId);
    }
  }

  /**
   * Approve an access review item
   */
  static async approveAccess(itemId: string, comment?: string): Promise<AccessReviewItem> {
    try {
      return await APIClient.post<AccessReviewItem>(
        `/v1/access-governance/review-items/${itemId}/approve`,
        { comment }
      );
    } catch {
      const idx = MOCK_REVIEW_ITEMS.findIndex((i) => i.id === itemId);
      if (idx < 0) throw new Error('Item not found');
      MOCK_REVIEW_ITEMS[idx] = {
        ...MOCK_REVIEW_ITEMS[idx],
        status: 'approved',
        reviewedBy: 'current-user',
        reviewedAt: new Date().toISOString(),
        reviewComment: comment,
      };
      return MOCK_REVIEW_ITEMS[idx];
    }
  }

  /**
   * Revoke access via review
   */
  static async revokeAccess(itemId: string, reason: string): Promise<AccessReviewItem> {
    try {
      return await APIClient.post<AccessReviewItem>(
        `/v1/access-governance/review-items/${itemId}/revoke`,
        { reason }
      );
    } catch {
      const idx = MOCK_REVIEW_ITEMS.findIndex((i) => i.id === itemId);
      if (idx < 0) throw new Error('Item not found');
      MOCK_REVIEW_ITEMS[idx] = {
        ...MOCK_REVIEW_ITEMS[idx],
        status: 'revoked',
        reviewedBy: 'current-user',
        reviewedAt: new Date().toISOString(),
        reviewComment: reason,
      };
      return MOCK_REVIEW_ITEMS[idx];
    }
  }

  /**
   * Get the role-permission access matrix
   */
  static async getAccessMatrix(): Promise<AccessMatrix> {
    try {
      return await APIClient.get<AccessMatrix>('/v1/access-governance/matrix');
    } catch {
      return MOCK_ACCESS_MATRIX;
    }
  }
}

export default AccessGovernanceService;
