/**
 * @module expenseService
 * @description Expense & Reimbursement Service — report CRUD, approvals, policies, analytics
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type ExpenseStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'cancelled';

export type ExpenseType =
  | 'general'
  | 'travel'
  | 'meals'
  | 'accommodation'
  | 'transportation'
  | 'office_supplies'
  | 'equipment'
  | 'training'
  | 'client_entertainment'
  | 'other';

export type PaymentMethod = 'personal_card' | 'corporate_card' | 'cash' | 'check' | 'bank_transfer';

export type ReimbursementStatus = 'pending' | 'processing' | 'paid' | 'rejected';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY';

// ── Report ─────────────────────────────────────────────────────────────────────

export interface CreateExpenseReportData {
  reportName: string;
  employeeId: string;
  departmentId: string;
  reportPeriod: { startDate: string; endDate: string };
  currency?: CurrencyCode;
  notes?: string;
  tags?: string[];
}

export interface ExpenseReport {
  id: string;
  reportCode: string;
  reportName: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentId: string;
  departmentName: string;
  managerId: string;
  managerName: string;
  status: ExpenseStatus;
  reportPeriod: { startDate: string; endDate: string };
  items: ExpenseItem[];
  totalAmount: number;
  currency: CurrencyCode;
  reimbursableAmount: number;
  corporateCardAmount: number;
  approvalChain: ExpenseApproval[];
  currentApproverId?: string;
  currentApproverName?: string;
  reimbursement?: ReimbursementInfo;
  notes?: string;
  submittedDate?: string;
  approvedDate?: string;
  paidDate?: string;
  rejectedReason?: string;
  tags: string[];
  attachments: ExpenseAttachment[];
  auditTrail: ExpenseAuditLog[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

// ── Item ───────────────────────────────────────────────────────────────────────

export interface AddExpenseItemData {
  date: string;
  categoryId: string;
  categoryName: string;
  expenseType: ExpenseType;
  description: string;
  merchant?: string;
  location?: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  isBillable?: boolean;
  isReimbursable?: boolean;
  projectId?: string;
  projectName?: string;
  costCenter?: string;
  glCode?: string;
  taxAmount?: number;
  tipAmount?: number;
  notes?: string;
}

export interface ExpenseItem extends AddExpenseItemData {
  id: string;
  expenseReportId: string;
  exchangeRate?: number;
  amountInBaseCurrency: number;
  receipt?: ExpenseReceipt;
  policyViolations: PolicyViolation[];
  approvalRequired: boolean;
  isLocked: boolean;
  createdDate: string;
  lastModified: string;
}

export interface ExpenseReceipt {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedDate: string;
  uploadedBy: string;
  status: 'missing' | 'uploaded' | 'verified' | 'rejected';
  ocrData?: {
    merchant?: string;
    date?: string;
    amount?: number;
    currency?: string;
    taxAmount?: number;
    confidence: number;
  };
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  policyName: string;
  violationType:
    | 'amount_exceeded'
    | 'missing_receipt'
    | 'late_submission'
    | 'unauthorized_category'
    | 'missing_approval'
    | 'duplicate'
    | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  isOverridable: boolean;
  overrideReason?: string;
}

export interface ExpenseAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  description?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedDate: string;
}

export interface ExpenseApproval {
  id: string;
  expenseReportId: string;
  approverId: string;
  approverName: string;
  approverTitle: string;
  approverLevel: number;
  status: ApprovalStatus;
  approvedAmount?: number;
  approvedDate?: string;
  comments?: string;
}

export interface ReimbursementInfo {
  id: string;
  expenseReportId: string;
  amount: number;
  currency: CurrencyCode;
  status: ReimbursementStatus;
  paymentMethod: 'direct_deposit' | 'check' | 'payroll' | 'wire_transfer';
  scheduledPaymentDate?: string;
  actualPaymentDate?: string;
  paymentReference?: string;
  processedBy?: string;
  processedDate?: string;
}

export interface ExpenseAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action:
    | 'created'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'paid'
    | 'modified'
    | 'deleted'
    | 'commented';
  details: string;
}

// ── Policy ─────────────────────────────────────────────────────────────────────

export interface ExpensePolicy {
  id: string;
  policyCode: string;
  policyName: string;
  description: string;
  version: string;
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
  applicableTo: {
    departments?: string[];
    locations?: string[];
    levels?: string[];
    employees?: string[];
  };
  rules: PolicyRule[];
  approvalWorkflow: ApprovalWorkflowConfig;
  reimbursementSettings: ReimbursementSettings;
  receiptRequirements: ReceiptRequirements;
  submissionDeadline: number;
  allowLateSubmission: boolean;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface PolicyRule {
  id: string;
  ruleName: string;
  ruleType:
    | 'amount_limit'
    | 'category_restriction'
    | 'receipt_required'
    | 'approval_required'
    | 'time_limit'
    | 'other';
  categoryId?: string;
  categoryName?: string;
  condition: string;
  threshold?: number;
  action: 'reject' | 'flag' | 'require_approval' | 'require_justification';
  message: string;
  isEnforced: boolean;
}

export interface ApprovalWorkflowConfig {
  requiresApproval: boolean;
  approvalLevels: ApprovalLevel[];
  autoApproveThreshold?: number;
  escalationEnabled: boolean;
  escalationDays?: number;
  allowDelegation: boolean;
  requireAllApprovals: boolean;
}

export interface ApprovalLevel {
  level: number;
  approverType: 'direct_manager' | 'department_head' | 'finance' | 'executive' | 'specific_user';
  approverIds?: string[];
  amountThreshold?: number;
  required: boolean;
}

export interface ReimbursementSettings {
  defaultPaymentMethod: 'direct_deposit' | 'check' | 'payroll';
  paymentSchedule: 'immediate' | 'weekly' | 'bi_weekly' | 'monthly';
  paymentDay?: number;
  minimumReimbursementAmount?: number;
  maximumReimbursementAmount?: number;
  requireBankAccount: boolean;
  allowAdvances: boolean;
}

export interface ReceiptRequirements {
  required: boolean;
  threshold?: number;
  allowedFormats: string[];
  maxFileSize: number;
  requireOriginal: boolean;
  retentionPeriod: number;
  allowOCR: boolean;
  requireVerification: boolean;
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export interface ExpenseAnalyticsParams {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  employeeId?: string;
  groupBy?: 'category' | 'department' | 'employee' | 'month';
}

export interface ExpenseAnalytics {
  totalExpenses: number;
  totalReimbursable: number;
  totalCorporateCard: number;
  averageExpenseAmount: number;
  pendingApprovals: number;
  pendingReimbursements: number;
  totalReimbursed: number;
  processingTime: number;
  approvalTime: number;
  reimbursementTime: number;
  policyViolations: number;
  rejectionRate: number;
  complianceScore: number;
  expensesByCategory: { categoryId: string; categoryName: string; amount: number; count: number }[];
  expensesByDepartment: {
    departmentId: string;
    departmentName: string;
    amount: number;
    count: number;
  }[];
  expensesByEmployee: { employeeId: string; employeeName: string; amount: number; count: number }[];
  expensesByMonth: { month: string; amount: number; count: number }[];
  topExpenseTypes: { expenseType: ExpenseType; amount: number; count: number }[];
  topMerchants: { merchant: string; amount: number; count: number }[];
  budgetUtilization: {
    departmentId: string;
    budgeted: number;
    spent: number;
    utilization: number;
  }[];
}

// ── Filters ────────────────────────────────────────────────────────────────────

export interface ExpenseReportFilters {
  status?: ExpenseStatus;
  employeeId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_REPORTS: ExpenseReport[] = [
  {
    id: 'exp-001',
    reportCode: 'EXP-2026-02-001',
    reportName: 'February Week 1 Expenses',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeEmail: 'jane.doe@company.com',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    managerId: 'mgr-001',
    managerName: 'Michael Zhang',
    status: 'draft',
    reportPeriod: { startDate: '2026-02-01', endDate: '2026-02-07' },
    items: [
      {
        id: 'item-001',
        expenseReportId: 'exp-001',
        date: '2026-02-03',
        categoryId: 'cat-001',
        categoryName: 'Business Meals',
        expenseType: 'meals',
        description: 'Client lunch meeting',
        merchant: 'The Capital Grille',
        location: 'New York, NY',
        amount: 145.5,
        currency: 'USD',
        amountInBaseCurrency: 145.5,
        paymentMethod: 'corporate_card',
        isBillable: true,
        isReimbursable: false,
        taxAmount: 11.64,
        tipAmount: 29.1,
        policyViolations: [],
        approvalRequired: true,
        isLocked: false,
        createdDate: '2026-02-03T18:00:00Z',
        lastModified: '2026-02-03T18:30:00Z',
      },
      {
        id: 'item-002',
        expenseReportId: 'exp-001',
        date: '2026-02-04',
        categoryId: 'cat-003',
        categoryName: 'Transportation',
        expenseType: 'transportation',
        description: 'Taxi to client office',
        merchant: 'Uber',
        location: 'New York, NY',
        amount: 42.0,
        currency: 'USD',
        amountInBaseCurrency: 42.0,
        paymentMethod: 'personal_card',
        isBillable: true,
        isReimbursable: true,
        policyViolations: [],
        approvalRequired: false,
        isLocked: false,
        createdDate: '2026-02-04T09:00:00Z',
        lastModified: '2026-02-04T09:00:00Z',
      },
    ],
    totalAmount: 187.5,
    currency: 'USD',
    reimbursableAmount: 42.0,
    corporateCardAmount: 145.5,
    approvalChain: [],
    notes: 'Client meetings for Q1 planning',
    tags: ['client-meeting'],
    attachments: [],
    auditTrail: [
      {
        id: 'audit-001',
        timestamp: '2026-02-03T18:00:00Z',
        userId: 'emp-001',
        userName: 'Jane Doe',
        action: 'created',
        details: 'Created expense report EXP-2026-02-001',
      },
    ],
    createdBy: 'emp-001',
    createdDate: '2026-02-03T18:00:00Z',
    lastModified: '2026-02-04T09:00:00Z',
  },
  {
    id: 'exp-002',
    reportCode: 'EXP-2026-01-045',
    reportName: 'January Business Trip — Chicago',
    employeeId: 'emp-002',
    employeeName: 'John Smith',
    employeeEmail: 'john.smith@company.com',
    departmentId: 'dept-005',
    departmentName: 'Sales & Marketing',
    managerId: 'mgr-002',
    managerName: 'Jennifer Martinez',
    status: 'approved',
    reportPeriod: { startDate: '2026-01-20', endDate: '2026-01-25' },
    items: [],
    totalAmount: 1850.0,
    currency: 'USD',
    reimbursableAmount: 650.0,
    corporateCardAmount: 1200.0,
    approvalChain: [
      {
        id: 'approval-001',
        expenseReportId: 'exp-002',
        approverId: 'mgr-002',
        approverName: 'Jennifer Martinez',
        approverTitle: 'VP Sales',
        approverLevel: 1,
        status: 'approved',
        approvedAmount: 1850.0,
        approvedDate: '2026-01-27T10:00:00Z',
        comments: 'Approved for Chicago sales trip',
      },
    ],
    reimbursement: {
      id: 'reimb-001',
      expenseReportId: 'exp-002',
      amount: 650.0,
      currency: 'USD',
      status: 'paid',
      paymentMethod: 'direct_deposit',
      scheduledPaymentDate: '2026-02-03',
      actualPaymentDate: '2026-02-03',
      paymentReference: 'PAY-2026-0203-045',
      processedBy: 'fin-001',
      processedDate: '2026-01-30T10:00:00Z',
    },
    submittedDate: '2026-01-26T16:00:00Z',
    approvedDate: '2026-01-27T10:00:00Z',
    paidDate: '2026-02-03',
    tags: ['business-trip', 'sales'],
    attachments: [],
    auditTrail: [],
    createdBy: 'emp-002',
    createdDate: '2026-01-25T18:00:00Z',
    lastModified: '2026-02-03T10:00:00Z',
  },
  {
    id: 'exp-003',
    reportCode: 'EXP-2026-02-012',
    reportName: 'Team Offsite Supplies',
    employeeId: 'emp-003',
    employeeName: 'Sarah Lee',
    employeeEmail: 'sarah.lee@company.com',
    departmentId: 'dept-003',
    departmentName: 'Human Resources',
    managerId: 'mgr-003',
    managerName: 'David Kim',
    status: 'pending_approval',
    reportPeriod: { startDate: '2026-02-10', endDate: '2026-02-14' },
    items: [],
    totalAmount: 525.0,
    currency: 'USD',
    reimbursableAmount: 525.0,
    corporateCardAmount: 0,
    approvalChain: [
      {
        id: 'approval-003',
        expenseReportId: 'exp-003',
        approverId: 'mgr-003',
        approverName: 'David Kim',
        approverTitle: 'HR Director',
        approverLevel: 1,
        status: 'pending',
      },
    ],
    currentApproverId: 'mgr-003',
    currentApproverName: 'David Kim',
    submittedDate: '2026-02-16T09:00:00Z',
    tags: ['offsite', 'supplies'],
    attachments: [],
    auditTrail: [],
    createdBy: 'emp-003',
    createdDate: '2026-02-15T14:00:00Z',
    lastModified: '2026-02-16T09:00:00Z',
  },
];

const MOCK_POLICIES: ExpensePolicy[] = [
  {
    id: 'policy-001',
    policyCode: 'EXP-POLICY-001',
    policyName: 'Standard Expense Policy',
    description: 'Standard expense policy applicable to all employees',
    version: '2.0',
    effectiveDate: '2026-01-01',
    isActive: true,
    applicableTo: {},
    rules: [
      {
        id: 'rule-001',
        ruleName: 'Receipt Required for Expenses Over $25',
        ruleType: 'receipt_required',
        condition: 'amount > 25',
        threshold: 25,
        action: 'require_approval',
        message: 'Receipt is required for all expenses over $25',
        isEnforced: true,
      },
      {
        id: 'rule-002',
        ruleName: 'Manager Approval Required',
        ruleType: 'approval_required',
        condition: 'always',
        action: 'require_approval',
        message: 'All expense reports require manager approval',
        isEnforced: true,
      },
      {
        id: 'rule-003',
        ruleName: 'Meal Limit $150',
        ruleType: 'amount_limit',
        categoryId: 'cat-001',
        categoryName: 'Business Meals',
        condition: 'amount > 150',
        threshold: 150,
        action: 'flag',
        message: 'Business meals should not exceed $150 per person',
        isEnforced: false,
      },
    ],
    approvalWorkflow: {
      requiresApproval: true,
      approvalLevels: [
        { level: 1, approverType: 'direct_manager', required: true },
        { level: 2, approverType: 'finance', amountThreshold: 1000, required: true },
      ],
      autoApproveThreshold: 100,
      escalationEnabled: true,
      escalationDays: 3,
      allowDelegation: true,
      requireAllApprovals: false,
    },
    reimbursementSettings: {
      defaultPaymentMethod: 'direct_deposit',
      paymentSchedule: 'bi_weekly',
      minimumReimbursementAmount: 10,
      requireBankAccount: true,
      allowAdvances: false,
    },
    receiptRequirements: {
      required: true,
      threshold: 25,
      allowedFormats: ['pdf', 'jpg', 'png', 'webp'],
      maxFileSize: 5242880,
      requireOriginal: false,
      retentionPeriod: 7,
      allowOCR: true,
      requireVerification: false,
    },
    submissionDeadline: 30,
    allowLateSubmission: true,
    createdBy: 'admin',
    createdDate: '2026-01-01',
    lastModified: '2026-01-01',
  },
  {
    id: 'policy-002',
    policyCode: 'EXP-POLICY-EXEC',
    policyName: 'Executive Travel Policy',
    description: 'Enhanced travel policy for director-level and above',
    version: '1.1',
    effectiveDate: '2026-01-01',
    isActive: true,
    applicableTo: { levels: ['director', 'vp', 'c-suite'] },
    rules: [
      {
        id: 'rule-e01',
        ruleName: 'Business Class Allowed',
        ruleType: 'category_restriction',
        condition: 'flight_distance > 4 hours',
        action: 'require_justification',
        message: 'Business class approved for flights over 4 hours',
        isEnforced: true,
      },
    ],
    approvalWorkflow: {
      requiresApproval: true,
      approvalLevels: [
        { level: 1, approverType: 'finance', amountThreshold: 5000, required: true },
      ],
      autoApproveThreshold: 2000,
      escalationEnabled: false,
      allowDelegation: true,
      requireAllApprovals: false,
    },
    reimbursementSettings: {
      defaultPaymentMethod: 'direct_deposit',
      paymentSchedule: 'weekly',
      requireBankAccount: true,
      allowAdvances: true,
    },
    receiptRequirements: {
      required: true,
      threshold: 50,
      allowedFormats: ['pdf', 'jpg', 'png'],
      maxFileSize: 10485760,
      requireOriginal: false,
      retentionPeriod: 7,
      allowOCR: true,
      requireVerification: true,
    },
    submissionDeadline: 60,
    allowLateSubmission: true,
    createdBy: 'admin',
    createdDate: '2026-01-01',
    lastModified: '2026-01-15',
  },
];

const MOCK_ANALYTICS: ExpenseAnalytics = {
  totalExpenses: 485000,
  totalReimbursable: 125000,
  totalCorporateCard: 360000,
  averageExpenseAmount: 425,
  pendingApprovals: 15,
  pendingReimbursements: 8,
  totalReimbursed: 98000,
  processingTime: 2.5,
  approvalTime: 1.8,
  reimbursementTime: 5.2,
  policyViolations: 23,
  rejectionRate: 3.2,
  complianceScore: 94.5,
  expensesByCategory: [
    { categoryId: 'cat-001', categoryName: 'Business Meals', amount: 125000, count: 450 },
    { categoryId: 'cat-002', categoryName: 'Accommodation', amount: 185000, count: 280 },
    { categoryId: 'cat-003', categoryName: 'Transportation', amount: 95000, count: 620 },
    { categoryId: 'cat-005', categoryName: 'Office Supplies', amount: 45000, count: 340 },
    { categoryId: 'cat-006', categoryName: 'Training & Dev', amount: 35000, count: 45 },
  ],
  expensesByDepartment: [
    { departmentId: 'dept-002', departmentName: 'Engineering', amount: 185000, count: 520 },
    { departmentId: 'dept-005', departmentName: 'Sales & Marketing', amount: 225000, count: 780 },
    { departmentId: 'dept-003', departmentName: 'Human Resources', amount: 45000, count: 125 },
    { departmentId: 'dept-004', departmentName: 'Finance', amount: 30000, count: 85 },
  ],
  expensesByEmployee: [
    { employeeId: 'emp-001', employeeName: 'Jane Doe', amount: 8500, count: 35 },
    { employeeId: 'emp-002', employeeName: 'John Smith', amount: 12500, count: 52 },
    { employeeId: 'emp-003', employeeName: 'Sarah Lee', amount: 5200, count: 22 },
  ],
  expensesByMonth: [
    { month: '2025-11', amount: 42000, count: 180 },
    { month: '2025-12', amount: 45000, count: 195 },
    { month: '2026-01', amount: 48000, count: 210 },
    { month: '2026-02', amount: 38000, count: 165 },
  ],
  topExpenseTypes: [
    { expenseType: 'accommodation', amount: 185000, count: 280 },
    { expenseType: 'meals', amount: 125000, count: 450 },
    { expenseType: 'transportation', amount: 95000, count: 620 },
  ],
  topMerchants: [
    { merchant: 'Marriott Hotels', amount: 85000, count: 120 },
    { merchant: 'United Airlines', amount: 65000, count: 95 },
    { merchant: 'Uber', amount: 45000, count: 380 },
  ],
  budgetUtilization: [
    { departmentId: 'dept-002', budgeted: 48000, spent: 36100, utilization: 75.2 },
    { departmentId: 'dept-005', budgeted: 65000, spent: 58500, utilization: 90.0 },
  ],
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class ExpenseService {
  /**
   * Create a new expense report
   */
  static async createExpenseReport(data: CreateExpenseReportData): Promise<ExpenseReport> {
    try {
      return await APIClient.post<ExpenseReport>('/v1/expenses/reports', data);
    } catch {
      const newReport: ExpenseReport = {
        id: `exp-${Date.now()}`,
        reportCode: `EXP-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(MOCK_REPORTS.length + 1).padStart(3, '0')}`,
        reportName: data.reportName,
        employeeId: data.employeeId,
        employeeName: 'Current User',
        employeeEmail: 'user@company.com',
        departmentId: data.departmentId,
        departmentName: 'Your Department',
        managerId: 'mgr-001',
        managerName: 'Your Manager',
        status: 'draft',
        reportPeriod: data.reportPeriod,
        items: [],
        totalAmount: 0,
        currency: data.currency ?? 'USD',
        reimbursableAmount: 0,
        corporateCardAmount: 0,
        approvalChain: [],
        notes: data.notes,
        tags: data.tags ?? [],
        attachments: [],
        auditTrail: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: data.employeeId,
            userName: 'Current User',
            action: 'created',
            details: `Created expense report`,
          },
        ],
        createdBy: data.employeeId,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      MOCK_REPORTS.push(newReport);
      return newReport;
    }
  }

  /**
   * List expense reports with optional filters
   */
  static async getExpenseReports(filters?: ExpenseReportFilters): Promise<ExpenseReport[]> {
    try {
      return await APIClient.get<ExpenseReport[]>('/v1/expenses/reports', filters);
    } catch {
      let results = [...MOCK_REPORTS];
      if (filters?.status) results = results.filter((r) => r.status === filters.status);
      if (filters?.employeeId) results = results.filter((r) => r.employeeId === filters.employeeId);
      if (filters?.departmentId)
        results = results.filter((r) => r.departmentId === filters.departmentId);
      if (filters?.startDate)
        results = results.filter((r) => r.reportPeriod.startDate >= filters.startDate!);
      if (filters?.endDate)
        results = results.filter((r) => r.reportPeriod.endDate <= filters.endDate!);
      return results;
    }
  }

  /**
   * Get a single expense report with all items
   */
  static async getExpenseReport(id: string): Promise<ExpenseReport | null> {
    try {
      return await APIClient.get<ExpenseReport>(`/v1/expenses/reports/${id}`);
    } catch {
      return MOCK_REPORTS.find((r) => r.id === id) ?? null;
    }
  }

  /**
   * Add a line item to an existing expense report
   */
  static async addExpenseItem(reportId: string, item: AddExpenseItemData): Promise<ExpenseReport> {
    try {
      return await APIClient.post<ExpenseReport>(`/v1/expenses/reports/${reportId}/items`, item);
    } catch {
      const report = MOCK_REPORTS.find((r) => r.id === reportId);
      if (!report) throw new Error(`Expense report ${reportId} not found`);
      const newItem: ExpenseItem = {
        ...item,
        id: `item-${Date.now()}`,
        expenseReportId: reportId,
        amountInBaseCurrency: item.amount,
        isBillable: item.isBillable ?? false,
        isReimbursable: item.isReimbursable ?? true,
        policyViolations: [],
        approvalRequired: item.amount > 100,
        isLocked: false,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      report.items.push(newItem);
      report.totalAmount = report.items.reduce((s, i) => s + i.amount, 0);
      report.reimbursableAmount = report.items
        .filter((i) => i.isReimbursable)
        .reduce((s, i) => s + i.amount, 0);
      report.corporateCardAmount = report.items
        .filter((i) => i.paymentMethod === 'corporate_card')
        .reduce((s, i) => s + i.amount, 0);
      report.lastModified = new Date().toISOString();
      return report;
    }
  }

  /**
   * Submit an expense report for approval
   */
  static async submitReport(reportId: string): Promise<ExpenseReport> {
    try {
      return await APIClient.post<ExpenseReport>(`/v1/expenses/reports/${reportId}/submit`, {});
    } catch {
      const report = MOCK_REPORTS.find((r) => r.id === reportId);
      if (!report) throw new Error(`Expense report ${reportId} not found`);
      report.status = 'submitted';
      report.submittedDate = new Date().toISOString();
      report.lastModified = new Date().toISOString();
      report.auditTrail.push({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: report.employeeId,
        userName: report.employeeName,
        action: 'submitted',
        details: `Submitted expense report for approval`,
      });
      return report;
    }
  }

  /**
   * Approve an expense report
   */
  static async approveReport(
    reportId: string,
    approverId: string,
    options?: { comments?: string; approvedAmount?: number }
  ): Promise<ExpenseReport> {
    try {
      return await APIClient.post<ExpenseReport>(`/v1/expenses/reports/${reportId}/approve`, {
        approverId,
        ...options,
      });
    } catch {
      const report = MOCK_REPORTS.find((r) => r.id === reportId);
      if (!report) throw new Error(`Expense report ${reportId} not found`);
      report.status = 'approved';
      report.approvedDate = new Date().toISOString();
      report.lastModified = new Date().toISOString();
      const approvalEntry = report.approvalChain.find((a) => a.approverId === approverId);
      if (approvalEntry) {
        approvalEntry.status = 'approved';
        approvalEntry.approvedDate = new Date().toISOString();
        if (options?.comments) approvalEntry.comments = options.comments;
        if (options?.approvedAmount) approvalEntry.approvedAmount = options.approvedAmount;
      }
      report.auditTrail.push({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: approverId,
        userName: 'Approver',
        action: 'approved',
        details: options?.comments ?? 'Expense report approved',
      });
      return report;
    }
  }

  /**
   * Reject an expense report with a reason
   */
  static async rejectReport(reportId: string, reason: string): Promise<ExpenseReport> {
    try {
      return await APIClient.post<ExpenseReport>(`/v1/expenses/reports/${reportId}/reject`, {
        reason,
      });
    } catch {
      const report = MOCK_REPORTS.find((r) => r.id === reportId);
      if (!report) throw new Error(`Expense report ${reportId} not found`);
      report.status = 'rejected';
      report.rejectedReason = reason;
      report.lastModified = new Date().toISOString();
      report.auditTrail.push({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'approver',
        userName: 'Approver',
        action: 'rejected',
        details: reason,
      });
      return report;
    }
  }

  /**
   * List expense policies
   */
  static async getExpensePolicies(filters?: { isActive?: boolean }): Promise<ExpensePolicy[]> {
    try {
      return await APIClient.get<ExpensePolicy[]>('/v1/expenses/policies', filters);
    } catch {
      if (filters?.isActive !== undefined) {
        return MOCK_POLICIES.filter((p) => p.isActive === filters.isActive);
      }
      return MOCK_POLICIES;
    }
  }

  /**
   * Create a new expense policy
   */
  static async createExpensePolicy(
    data: Omit<ExpensePolicy, 'id' | 'createdDate' | 'lastModified'>
  ): Promise<ExpensePolicy> {
    try {
      return await APIClient.post<ExpensePolicy>('/v1/expenses/policies', data);
    } catch {
      const policy: ExpensePolicy = {
        ...data,
        id: `policy-${Date.now()}`,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      MOCK_POLICIES.push(policy);
      return policy;
    }
  }

  /**
   * Update an existing expense policy
   */
  static async updateExpensePolicy(
    id: string,
    updates: Partial<ExpensePolicy>
  ): Promise<ExpensePolicy> {
    try {
      return await APIClient.put<ExpensePolicy>(`/v1/expenses/policies/${id}`, updates);
    } catch {
      const idx = MOCK_POLICIES.findIndex((p) => p.id === id);
      if (idx < 0) throw new Error(`Policy ${id} not found`);
      MOCK_POLICIES[idx] = {
        ...MOCK_POLICIES[idx],
        ...updates,
        lastModified: new Date().toISOString(),
      };
      return MOCK_POLICIES[idx];
    }
  }

  /**
   * Get analytics/metrics data for the expense module
   */
  static async getExpenseAnalytics(params?: ExpenseAnalyticsParams): Promise<ExpenseAnalytics> {
    try {
      return await APIClient.get<ExpenseAnalytics>('/v1/expenses/analytics', params);
    } catch {
      // Simulate minor variance so the UI feels live
      return {
        ...MOCK_ANALYTICS,
        pendingApprovals: MOCK_REPORTS.filter(
          (r) => r.status === 'pending_approval' || r.status === 'submitted'
        ).length,
      };
    }
  }
}

// ============================================================================
// CONSTANTS / META
// ============================================================================

export const EXPENSE_STATUS_META: Record<
  ExpenseStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: 'Draft', color: 'text-slate-500', bgColor: 'bg-slate-100' },
  submitted: { label: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  pending_approval: { label: 'Pending Approval', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  approved: { label: 'Approved', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50' },
  paid: { label: 'Paid', color: 'text-violet-600', bgColor: 'bg-violet-50' },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', bgColor: 'bg-gray-50' },
};

export const EXPENSE_TYPE_META: Record<ExpenseType, { label: string; icon: string }> = {
  general: { label: 'General', icon: 'Receipt' },
  travel: { label: 'Travel', icon: 'Plane' },
  meals: { label: 'Meals & Entertainment', icon: 'UtensilsCrossed' },
  accommodation: { label: 'Accommodation', icon: 'Building2' },
  transportation: { label: 'Transportation', icon: 'Car' },
  office_supplies: { label: 'Office Supplies', icon: 'Package' },
  equipment: { label: 'Equipment', icon: 'Laptop' },
  training: { label: 'Training & Dev', icon: 'GraduationCap' },
  client_entertainment: { label: 'Client Entertainment', icon: 'Users' },
  other: { label: 'Other', icon: 'MoreHorizontal' },
};
