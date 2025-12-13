// Expense Management Module Types

export type ExpenseStatus = 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'paid' | 'cancelled';
export type ExpenseType = 'general' | 'travel' | 'meals' | 'accommodation' | 'transportation' | 'office_supplies' | 'equipment' | 'training' | 'client_entertainment' | 'other';
export type PaymentMethod = 'personal_card' | 'corporate_card' | 'cash' | 'check' | 'bank_transfer';
export type ReimbursementStatus = 'pending' | 'processing' | 'paid' | 'rejected';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ReceiptStatus = 'missing' | 'uploaded' | 'verified' | 'rejected';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY';

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
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
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

export interface ExpenseItem {
  id: string;
  expenseReportId: string;
  date: string;
  categoryId: string;
  categoryName: string;
  expenseType: ExpenseType;
  description: string;
  merchant?: string;
  location?: string;
  amount: number;
  currency: CurrencyCode;
  exchangeRate?: number;
  amountInBaseCurrency: number;
  paymentMethod: PaymentMethod;
  isBillable: boolean;
  isReimbursable: boolean;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  costCenter?: string;
  glCode?: string;
  taxAmount?: number;
  tipAmount?: number;
  receipt?: ExpenseReceipt;
  attendees?: ExpenseAttendee[];
  mileage?: MileageInfo;
  perDiem?: PerDiemInfo;
  cardTransaction?: CardTransaction;
  policyViolations: PolicyViolation[];
  approvalRequired: boolean;
  isLocked: boolean;
  notes?: string;
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
  status: ReceiptStatus;
  ocrData?: ReceiptOCRData;
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
}

export interface ReceiptOCRData {
  merchant?: string;
  date?: string;
  amount?: number;
  currency?: string;
  taxAmount?: number;
  items?: { description: string; amount: number }[];
  confidence: number;
}

export interface ExpenseAttendee {
  id: string;
  name: string;
  company?: string;
  title?: string;
  isEmployee: boolean;
  employeeId?: string;
}

export interface MileageInfo {
  startLocation: string;
  endLocation: string;
  distance: number;
  unit: 'miles' | 'kilometers';
  rate: number;
  calculatedAmount: number;
  vehicleType?: 'personal' | 'company' | 'rental';
  purpose: string;
}

export interface PerDiemInfo {
  location: string;
  days: number;
  rate: number;
  calculatedAmount: number;
  mealBreakdown?: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
}

export interface CardTransaction {
  transactionId: string;
  cardNumber: string;
  cardType: string;
  transactionDate: string;
  merchant: string;
  amount: number;
  currency: CurrencyCode;
  isReconciled: boolean;
  reconciledDate?: string;
  reconciledBy?: string;
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  policyName: string;
  violationType: 'amount_exceeded' | 'missing_receipt' | 'late_submission' | 'unauthorized_category' | 'missing_approval' | 'duplicate' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  requiredAction?: string;
  isOverridable: boolean;
  overriddenBy?: string;
  overriddenDate?: string;
  overrideReason?: string;
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
  rejectedAmount?: number;
  approvedDate?: string;
  comments?: string;
  delegatedTo?: string;
  delegatedToName?: string;
}

export interface ReimbursementInfo {
  id: string;
  expenseReportId: string;
  amount: number;
  currency: CurrencyCode;
  status: ReimbursementStatus;
  paymentMethod: 'direct_deposit' | 'check' | 'payroll' | 'wire_transfer';
  accountNumber?: string;
  routingNumber?: string;
  scheduledPaymentDate?: string;
  actualPaymentDate?: string;
  paymentReference?: string;
  processedBy?: string;
  processedDate?: string;
  failureReason?: string;
}

export interface ExpenseCategory {
  id: string;
  categoryCode: string;
  categoryName: string;
  expenseType: ExpenseType;
  description: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  level: number;
  isActive: boolean;
  requiresReceipt: boolean;
  receiptThreshold?: number;
  requiresApproval: boolean;
  approvalThreshold?: number;
  isBillable: boolean;
  isReimbursable: boolean;
  defaultGLCode?: string;
  allowedPaymentMethods: PaymentMethod[];
  requiresJustification: boolean;
  requiresAttendees: boolean;
  maxAmount?: number;
  perDiemRate?: number;
  mileageRate?: number;
  taxDeductible: boolean;
  tags: string[];
  icon?: string;
  displayOrder: number;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

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
  lateSubmissionPenalty?: number;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  lastReviewedBy?: string;
  lastReviewedDate?: string;
}

export interface PolicyRule {
  id: string;
  ruleName: string;
  ruleType: 'amount_limit' | 'category_restriction' | 'receipt_required' | 'approval_required' | 'time_limit' | 'other';
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
  advancePercentage?: number;
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

export interface ExpenseAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'modified' | 'deleted' | 'commented';
  details: string;
  changes?: { field: string; oldValue: any; newValue: any }[];
  ipAddress?: string;
}

export interface CorporateCard {
  id: string;
  cardNumber: string;
  cardType: 'credit' | 'debit' | 'prepaid';
  cardholderName: string;
  employeeId: string;
  employeeName: string;
  issueDate: string;
  expiryDate: string;
  creditLimit?: number;
  currentBalance: number;
  status: 'active' | 'suspended' | 'cancelled' | 'expired';
  billingCycle: string;
  lastStatementDate?: string;
  nextStatementDate?: string;
  isVirtual: boolean;
  departmentId: string;
  costCenter: string;
  cardProvider: string;
  notes?: string;
}

export interface ExpenseBudget {
  id: string;
  budgetCode: string;
  budgetName: string;
  departmentId: string;
  departmentName: string;
  costCenter: string;
  fiscalYear: string;
  periodType: 'annual' | 'quarterly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  totalCommitted: number;
  totalAvailable: number;
  utilizationPercentage: number;
  ownerId: string;
  ownerName: string;
  alerts: BudgetAlert[];
  isActive: boolean;
  createdDate: string;
  lastModified: string;
}

export interface BudgetCategory {
  categoryId: string;
  categoryName: string;
  budgetedAmount: number;
  spentAmount: number;
  committedAmount: number;
  availableAmount: number;
  utilizationPercentage: number;
}

export interface BudgetAlert {
  id: string;
  alertType: 'threshold_warning' | 'threshold_exceeded' | 'overspent';
  threshold: number;
  currentUtilization: number;
  message: string;
  triggeredDate: string;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
}

export interface ExpenseMetrics {
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
  expensesByCategory: { categoryId: string; categoryName: string; amount: number; count: number }[];
  expensesByDepartment: { departmentId: string; departmentName: string; amount: number; count: number }[];
  expensesByEmployee: { employeeId: string; employeeName: string; amount: number; count: number }[];
  expensesByMonth: { month: string; amount: number; count: number }[];
  topExpenseTypes: { expenseType: ExpenseType; amount: number; count: number }[];
  topMerchants: { merchant: string; amount: number; count: number }[];
  budgetUtilization: { departmentId: string; budgeted: number; spent: number; utilization: number }[];
  complianceScore: number;
}

export interface ExpenseSettings {
  enableExpenseReports: boolean;
  enableCorporateCards: boolean;
  enableMileageTracking: boolean;
  enablePerDiem: boolean;
  enableMultiCurrency: boolean;
  baseCurrency: CurrencyCode;
  enableReceiptOCR: boolean;
  enableAutoApproval: boolean;
  autoApprovalThreshold: number;
  requireManagerApproval: boolean;
  requireFinanceApproval: boolean;
  financeApprovalThreshold: number;
  enableBudgetEnforcement: boolean;
  allowOverBudget: boolean;
  submissionDeadlineDays: number;
  receiptRequiredThreshold: number;
  allowPersonalExpenses: boolean;
  enableMobileApp: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  defaultMileageRate: number;
  defaultPerDiemRate: number;
  taxRate: number;
  fiscalYearStart: string;
  reimbursementCycle: 'weekly' | 'bi_weekly' | 'monthly';
  paymentMethod: 'direct_deposit' | 'check' | 'payroll';
}

export interface ExpenseDelegation {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegateId: string;
  delegateName: string;
  startDate: string;
  endDate?: string;
  scope: 'all' | 'specific_departments' | 'specific_employees';
  departmentIds?: string[];
  employeeIds?: string[];
  permissions: string[];
  isActive: boolean;
  createdDate: string;
}

export interface ExpenseComment {
  id: string;
  expenseReportId: string;
  userId: string;
  userName: string;
  comment: string;
  isInternal: boolean;
  createdDate: string;
}
