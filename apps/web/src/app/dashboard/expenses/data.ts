// Expense Management Sample Data
import type {
  ExpenseReport,
  ExpenseItem,
  ExpenseCategory,
  ExpensePolicy,
  CorporateCard,
  ExpenseBudget,
  ExpenseMetrics,
  ExpenseSettings
} from './types';

const sampleItems: ExpenseItem[] = [
  {
    id: 'item-001',
    expenseReportId: 'exp-001',
    date: '2024-12-05',
    categoryId: 'cat-001',
    categoryName: 'Business Meals',
    expenseType: 'meals',
    description: 'Client lunch meeting - Project discussion',
    merchant: 'The Steakhouse',
    location: 'New York, NY',
    amount: 125.50,
    currency: 'USD',
    amountInBaseCurrency: 125.50,
    paymentMethod: 'corporate_card',
    isBillable: true,
    isReimbursable: false,
    clientId: 'client-001',
    clientName: 'Acme Corp',
    projectId: 'proj-001',
    projectName: 'Website Redesign',
    taxAmount: 10.04,
    tipAmount: 25.00,
    receipt: {
      id: 'receipt-001',
      fileUrl: '/receipts/receipt-001.pdf',
      fileName: 'steakhouse-receipt.pdf',
      fileSize: 245000,
      fileType: 'application/pdf',
      uploadedDate: '2024-12-05T18:30:00Z',
      uploadedBy: 'emp-001',
      status: 'verified'
    },
    attendees: [
      {
        id: 'att-001',
        name: 'John Smith',
        company: 'Acme Corp',
        title: 'CTO',
        isEmployee: false
      }
    ],
    policyViolations: [],
    approvalRequired: true,
    isLocked: false,
    createdDate: '2024-12-05T18:00:00Z',
    lastModified: '2024-12-05T18:30:00Z'
  },
  {
    id: 'item-002',
    expenseReportId: 'exp-001',
    date: '2024-12-06',
    categoryId: 'cat-003',
    categoryName: 'Transportation',
    expenseType: 'transportation',
    description: 'Taxi to client office',
    merchant: 'Uber',
    location: 'New York, NY',
    amount: 45.00,
    currency: 'USD',
    amountInBaseCurrency: 45.00,
    paymentMethod: 'personal_card',
    isBillable: true,
    isReimbursable: true,
    clientId: 'client-001',
    clientName: 'Acme Corp',
    receipt: {
      id: 'receipt-002',
      fileUrl: '/receipts/receipt-002.pdf',
      fileName: 'uber-receipt.pdf',
      fileSize: 125000,
      fileType: 'application/pdf',
      uploadedDate: '2024-12-06T15:00:00Z',
      uploadedBy: 'emp-001',
      status: 'uploaded'
    },
    policyViolations: [],
    approvalRequired: false,
    isLocked: false,
    createdDate: '2024-12-06T15:00:00Z',
    lastModified: '2024-12-06T15:00:00Z'
  },
  {
    id: 'item-003',
    expenseReportId: 'exp-001',
    date: '2024-12-07',
    categoryId: 'cat-005',
    categoryName: 'Office Supplies',
    expenseType: 'office_supplies',
    description: 'Notebooks and pens for team',
    merchant: 'Staples',
    location: 'New York, NY',
    amount: 78.99,
    currency: 'USD',
    amountInBaseCurrency: 78.99,
    paymentMethod: 'personal_card',
    isBillable: false,
    isReimbursable: true,
    costCenter: 'CC-2000',
    glCode: 'GL-5100',
    taxAmount: 6.32,
    receipt: {
      id: 'receipt-003',
      fileUrl: '/receipts/receipt-003.pdf',
      fileName: 'staples-receipt.pdf',
      fileSize: 180000,
      fileType: 'application/pdf',
      uploadedDate: '2024-12-07T12:00:00Z',
      uploadedBy: 'emp-001',
      status: 'uploaded'
    },
    policyViolations: [],
    approvalRequired: false,
    isLocked: false,
    createdDate: '2024-12-07T12:00:00Z',
    lastModified: '2024-12-07T12:00:00Z'
  }
];

export const sampleExpenseReports: ExpenseReport[] = [
  {
    id: 'exp-001',
    reportCode: 'EXP-2024-12-001',
    reportName: 'December Week 1 Expenses',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeEmail: 'jane.doe@company.com',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    managerId: 'mgr-001',
    managerName: 'Michael Zhang',
    status: 'draft',
    reportPeriod: {
      startDate: '2024-12-01',
      endDate: '2024-12-07'
    },
    items: sampleItems,
    totalAmount: 249.49,
    currency: 'USD',
    reimbursableAmount: 123.99,
    corporateCardAmount: 125.50,
    approvalChain: [],
    notes: 'Client meetings and office supplies',
    tags: ['client-meeting', 'office-supplies'],
    attachments: [],
    auditTrail: [
      {
        id: 'audit-001',
        timestamp: '2024-12-05T18:00:00Z',
        userId: 'emp-001',
        userName: 'Jane Doe',
        action: 'created',
        details: 'Created expense report EXP-2024-12-001'
      }
    ],
    createdBy: 'emp-001',
    createdDate: '2024-12-05T18:00:00Z',
    lastModified: '2024-12-07T12:00:00Z'
  },
  {
    id: 'exp-002',
    reportCode: 'EXP-2024-11-045',
    reportName: 'November Business Trip',
    employeeId: 'emp-002',
    employeeName: 'John Smith',
    employeeEmail: 'john.smith@company.com',
    departmentId: 'dept-005',
    departmentName: 'Sales & Marketing',
    managerId: 'mgr-002',
    managerName: 'Jennifer Martinez',
    status: 'approved',
    reportPeriod: {
      startDate: '2024-11-15',
      endDate: '2024-11-20'
    },
    items: [],
    totalAmount: 1850.00,
    currency: 'USD',
    reimbursableAmount: 650.00,
    corporateCardAmount: 1200.00,
    approvalChain: [
      {
        id: 'approval-001',
        expenseReportId: 'exp-002',
        approverId: 'mgr-002',
        approverName: 'Jennifer Martinez',
        approverTitle: 'VP Sales',
        approverLevel: 1,
        status: 'approved',
        approvedAmount: 1850.00,
        approvedDate: '2024-11-22T10:00:00Z',
        comments: 'Approved for business trip to Boston'
      },
      {
        id: 'approval-002',
        expenseReportId: 'exp-002',
        approverId: 'fin-001',
        approverName: 'Finance Team',
        approverTitle: 'Finance Approver',
        approverLevel: 2,
        status: 'approved',
        approvedAmount: 1850.00,
        approvedDate: '2024-11-23T14:00:00Z'
      }
    ],
    reimbursement: {
      id: 'reimb-001',
      expenseReportId: 'exp-002',
      amount: 650.00,
      currency: 'USD',
      status: 'paid',
      paymentMethod: 'direct_deposit',
      scheduledPaymentDate: '2024-11-30',
      actualPaymentDate: '2024-11-30',
      paymentReference: 'PAY-2024-1130-045',
      processedBy: 'fin-001',
      processedDate: '2024-11-25T10:00:00Z'
    },
    submittedDate: '2024-11-21T16:00:00Z',
    approvedDate: '2024-11-23T14:00:00Z',
    paidDate: '2024-11-30',
    tags: ['business-trip', 'sales'],
    attachments: [],
    auditTrail: [],
    createdBy: 'emp-002',
    createdDate: '2024-11-20T18:00:00Z',
    lastModified: '2024-11-30T10:00:00Z'
  }
];

export const sampleCategories: ExpenseCategory[] = [
  {
    id: 'cat-001',
    categoryCode: 'MEALS',
    categoryName: 'Business Meals',
    expenseType: 'meals',
    description: 'Meals with clients or business partners',
    level: 1,
    isActive: true,
    requiresReceipt: true,
    receiptThreshold: 25,
    requiresApproval: true,
    approvalThreshold: 100,
    isBillable: true,
    isReimbursable: true,
    defaultGLCode: 'GL-6100',
    allowedPaymentMethods: ['corporate_card', 'personal_card', 'cash'],
    requiresJustification: true,
    requiresAttendees: true,
    maxAmount: 500,
    taxDeductible: true,
    tags: ['client-entertainment', 'meals'],
    displayOrder: 1,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  },
  {
    id: 'cat-002',
    categoryCode: 'LODGING',
    categoryName: 'Accommodation',
    expenseType: 'accommodation',
    description: 'Hotel and lodging expenses',
    level: 1,
    isActive: true,
    requiresReceipt: true,
    requiresApproval: true,
    approvalThreshold: 200,
    isBillable: false,
    isReimbursable: true,
    defaultGLCode: 'GL-6200',
    allowedPaymentMethods: ['corporate_card', 'personal_card'],
    requiresJustification: false,
    requiresAttendees: false,
    maxAmount: 300,
    taxDeductible: true,
    tags: ['travel', 'accommodation'],
    displayOrder: 2,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  },
  {
    id: 'cat-003',
    categoryCode: 'TRANSPORT',
    categoryName: 'Transportation',
    expenseType: 'transportation',
    description: 'Taxi, rideshare, public transit',
    level: 1,
    isActive: true,
    requiresReceipt: true,
    receiptThreshold: 25,
    requiresApproval: false,
    isBillable: false,
    isReimbursable: true,
    defaultGLCode: 'GL-6300',
    allowedPaymentMethods: ['corporate_card', 'personal_card', 'cash'],
    requiresJustification: false,
    requiresAttendees: false,
    maxAmount: 200,
    taxDeductible: true,
    tags: ['travel', 'transportation'],
    displayOrder: 3,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  },
  {
    id: 'cat-004',
    categoryCode: 'MILEAGE',
    categoryName: 'Mileage Reimbursement',
    expenseType: 'transportation',
    description: 'Personal vehicle mileage',
    level: 1,
    isActive: true,
    requiresReceipt: false,
    requiresApproval: false,
    isBillable: false,
    isReimbursable: true,
    defaultGLCode: 'GL-6310',
    allowedPaymentMethods: ['personal_card'],
    requiresJustification: true,
    requiresAttendees: false,
    mileageRate: 0.67,
    taxDeductible: true,
    tags: ['travel', 'mileage'],
    displayOrder: 4,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  },
  {
    id: 'cat-005',
    categoryCode: 'SUPPLIES',
    categoryName: 'Office Supplies',
    expenseType: 'office_supplies',
    description: 'Office supplies and materials',
    level: 1,
    isActive: true,
    requiresReceipt: true,
    receiptThreshold: 25,
    requiresApproval: false,
    isBillable: false,
    isReimbursable: true,
    defaultGLCode: 'GL-5100',
    allowedPaymentMethods: ['corporate_card', 'personal_card'],
    requiresJustification: false,
    requiresAttendees: false,
    maxAmount: 200,
    taxDeductible: true,
    tags: ['office', 'supplies'],
    displayOrder: 5,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  },
  {
    id: 'cat-006',
    categoryCode: 'TRAINING',
    categoryName: 'Training & Development',
    expenseType: 'training',
    description: 'Training courses, certifications, conferences',
    level: 1,
    isActive: true,
    requiresReceipt: true,
    requiresApproval: true,
    approvalThreshold: 500,
    isBillable: false,
    isReimbursable: true,
    defaultGLCode: 'GL-7200',
    allowedPaymentMethods: ['corporate_card', 'personal_card'],
    requiresJustification: true,
    requiresAttendees: false,
    taxDeductible: true,
    tags: ['training', 'development'],
    displayOrder: 6,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  }
];

export const samplePolicies: ExpensePolicy[] = [
  {
    id: 'policy-001',
    policyCode: 'EXP-POLICY-001',
    policyName: 'Standard Expense Policy',
    description: 'Standard expense policy for all employees',
    version: '2.0',
    effectiveDate: '2024-01-01',
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
        isEnforced: true
      },
      {
        id: 'rule-002',
        ruleName: 'Manager Approval Required',
        ruleType: 'approval_required',
        condition: 'always',
        action: 'require_approval',
        message: 'All expense reports require manager approval',
        isEnforced: true
      },
      {
        id: 'rule-003',
        ruleName: 'Meal Limit',
        ruleType: 'amount_limit',
        categoryId: 'cat-001',
        categoryName: 'Business Meals',
        condition: 'amount > 150',
        threshold: 150,
        action: 'flag',
        message: 'Business meals should not exceed $150 per person',
        isEnforced: false
      }
    ],
    approvalWorkflow: {
      requiresApproval: true,
      approvalLevels: [
        {
          level: 1,
          approverType: 'direct_manager',
          required: true
        },
        {
          level: 2,
          approverType: 'finance',
          amountThreshold: 1000,
          required: true
        }
      ],
      autoApproveThreshold: 100,
      escalationEnabled: true,
      escalationDays: 3,
      allowDelegation: true,
      requireAllApprovals: false
    },
    reimbursementSettings: {
      defaultPaymentMethod: 'direct_deposit',
      paymentSchedule: 'bi_weekly',
      minimumReimbursementAmount: 10,
      requireBankAccount: true,
      allowAdvances: false
    },
    receiptRequirements: {
      required: true,
      threshold: 25,
      allowedFormats: ['pdf', 'jpg', 'png'],
      maxFileSize: 5242880,
      requireOriginal: false,
      retentionPeriod: 7,
      allowOCR: true,
      requireVerification: false
    },
    submissionDeadline: 30,
    allowLateSubmission: true,
    lateSubmissionPenalty: 0,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  }
];

export const sampleCorporateCards: CorporateCard[] = [
  {
    id: 'card-001',
    cardNumber: '**** **** **** 1234',
    cardType: 'credit',
    cardholderName: 'Jane Doe',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    issueDate: '2024-01-15',
    expiryDate: '2027-01-31',
    creditLimit: 5000,
    currentBalance: 1250.50,
    status: 'active',
    billingCycle: 'monthly',
    lastStatementDate: '2024-11-30',
    nextStatementDate: '2024-12-31',
    isVirtual: false,
    departmentId: 'dept-002',
    costCenter: 'CC-2000',
    cardProvider: 'Visa Business',
    notes: 'Engineering department card'
  },
  {
    id: 'card-002',
    cardNumber: '**** **** **** 5678',
    cardType: 'credit',
    cardholderName: 'John Smith',
    employeeId: 'emp-002',
    employeeName: 'John Smith',
    issueDate: '2024-02-01',
    expiryDate: '2027-02-28',
    creditLimit: 7500,
    currentBalance: 2340.00,
    status: 'active',
    billingCycle: 'monthly',
    lastStatementDate: '2024-11-30',
    nextStatementDate: '2024-12-31',
    isVirtual: false,
    departmentId: 'dept-005',
    costCenter: 'CC-5000',
    cardProvider: 'American Express Business',
    notes: 'Sales team card'
  }
];

export const sampleBudgets: ExpenseBudget[] = [
  {
    id: 'budget-001',
    budgetCode: 'BDG-2024-ENG',
    budgetName: 'Engineering Department - 2024',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    costCenter: 'CC-2000',
    fiscalYear: '2024',
    periodType: 'annual',
    periodStart: '2024-01-01',
    periodEnd: '2024-12-31',
    categories: [
      {
        categoryId: 'cat-001',
        categoryName: 'Business Meals',
        budgetedAmount: 15000,
        spentAmount: 12500,
        committedAmount: 1200,
        availableAmount: 1300,
        utilizationPercentage: 91.3
      },
      {
        categoryId: 'cat-005',
        categoryName: 'Office Supplies',
        budgetedAmount: 8000,
        spentAmount: 5600,
        committedAmount: 400,
        availableAmount: 2000,
        utilizationPercentage: 75.0
      },
      {
        categoryId: 'cat-006',
        categoryName: 'Training & Development',
        budgetedAmount: 25000,
        spentAmount: 18000,
        committedAmount: 3000,
        availableAmount: 4000,
        utilizationPercentage: 84.0
      }
    ],
    totalBudget: 48000,
    totalSpent: 36100,
    totalCommitted: 4600,
    totalAvailable: 7300,
    utilizationPercentage: 84.8,
    ownerId: 'mgr-001',
    ownerName: 'Michael Zhang',
    alerts: [
      {
        id: 'alert-001',
        alertType: 'threshold_warning',
        threshold: 90,
        currentUtilization: 91.3,
        message: 'Business Meals budget is at 91.3% utilization',
        triggeredDate: '2024-11-15'
      }
    ],
    isActive: true,
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  }
];

export const sampleMetrics: ExpenseMetrics = {
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
  expensesByCategory: [
    { categoryId: 'cat-001', categoryName: 'Business Meals', amount: 125000, count: 450 },
    { categoryId: 'cat-002', categoryName: 'Accommodation', amount: 185000, count: 280 },
    { categoryId: 'cat-003', categoryName: 'Transportation', amount: 95000, count: 620 },
    { categoryId: 'cat-005', categoryName: 'Office Supplies', amount: 45000, count: 340 },
    { categoryId: 'cat-006', categoryName: 'Training & Development', amount: 35000, count: 45 }
  ],
  expensesByDepartment: [
    { departmentId: 'dept-002', departmentName: 'Engineering', amount: 185000, count: 520 },
    { departmentId: 'dept-005', departmentName: 'Sales & Marketing', amount: 225000, count: 780 },
    { departmentId: 'dept-003', departmentName: 'Human Resources', amount: 45000, count: 125 },
    { departmentId: 'dept-004', departmentName: 'Finance', amount: 30000, count: 85 }
  ],
  expensesByEmployee: [
    { employeeId: 'emp-001', employeeName: 'Jane Doe', amount: 8500, count: 35 },
    { employeeId: 'emp-002', employeeName: 'John Smith', amount: 12500, count: 52 }
  ],
  expensesByMonth: [
    { month: '2024-09', amount: 42000, count: 180 },
    { month: '2024-10', amount: 45000, count: 195 },
    { month: '2024-11', amount: 48000, count: 210 },
    { month: '2024-12', amount: 38000, count: 165 }
  ],
  topExpenseTypes: [
    { expenseType: 'accommodation', amount: 185000, count: 280 },
    { expenseType: 'meals', amount: 125000, count: 450 },
    { expenseType: 'transportation', amount: 95000, count: 620 }
  ],
  topMerchants: [
    { merchant: 'Marriott Hotels', amount: 85000, count: 120 },
    { merchant: 'United Airlines', amount: 65000, count: 95 },
    { merchant: 'Uber', amount: 45000, count: 380 }
  ],
  budgetUtilization: [
    { departmentId: 'dept-002', budgeted: 48000, spent: 36100, utilization: 75.2 },
    { departmentId: 'dept-005', budgeted: 65000, spent: 58500, utilization: 90.0 }
  ],
  complianceScore: 94.5
};

export const sampleSettings: ExpenseSettings = {
  enableExpenseReports: true,
  enableCorporateCards: true,
  enableMileageTracking: true,
  enablePerDiem: true,
  enableMultiCurrency: false,
  baseCurrency: 'USD',
  enableReceiptOCR: true,
  enableAutoApproval: false,
  autoApprovalThreshold: 100,
  requireManagerApproval: true,
  requireFinanceApproval: true,
  financeApprovalThreshold: 1000,
  enableBudgetEnforcement: false,
  allowOverBudget: true,
  submissionDeadlineDays: 30,
  receiptRequiredThreshold: 25,
  allowPersonalExpenses: false,
  enableMobileApp: true,
  enableEmailNotifications: true,
  enablePushNotifications: true,
  defaultMileageRate: 0.67,
  defaultPerDiemRate: 75,
  taxRate: 0.0,
  fiscalYearStart: '01-01',
  reimbursementCycle: 'bi_weekly',
  paymentMethod: 'direct_deposit'
};

export const expenseData = {
  reports: sampleExpenseReports,
  categories: sampleCategories,
  policies: samplePolicies,
  corporateCards: sampleCorporateCards,
  budgets: sampleBudgets,
  metrics: sampleMetrics,
  settings: sampleSettings
};
