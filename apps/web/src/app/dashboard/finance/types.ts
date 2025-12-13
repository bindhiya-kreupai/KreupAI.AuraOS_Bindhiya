/**
 * Finance & Budget Management Module - Type Definitions
 * Comprehensive financial management including budgeting, vendors, petty cash,
 * assets, and scenario planning
 */

// Common Types
export type Status = 'draft' | 'active' | 'approved' | 'rejected' | 'closed' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// Budget Management
// ============================================================================

export type BudgetType = 'headcount' | 'salary' | 'operations' | 'capital' | 'project' | 'department';
export type BudgetPeriod = 'monthly' | 'quarterly' | 'annual';

export interface Budget {
  id: string;
  budgetCode: string;
  budgetName: string;
  budgetType: BudgetType;
  status: Status;
  description: string;

  // Period
  fiscalYear: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;

  // Scope
  department?: string;
  costCenter?: string;
  project?: string;
  location?: string;

  // Budget Lines
  lines: BudgetLine[];

  // Totals
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationRate: number; // percentage

  // Approval
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;

  // Version Control
  version: string;
  baselineVersion?: string;
  revisionHistory: BudgetRevision[];

  // Meta
  createdBy: string;
  createdByName: string;
  createdDate: string;
  lastModified: string;
  tags: string[];
}

export interface BudgetLine {
  id: string;
  lineNumber: number;
  category: string;
  subcategory?: string;
  description: string;

  // Amounts
  budgetAmount: number;
  allocatedAmount: number;
  committedAmount: number;
  actualAmount: number;
  remainingAmount: number;

  // Breakdown by Period
  periodBreakdown?: PeriodAmount[];

  // Headcount-specific
  headcountBudget?: HeadcountBudget;

  // Tracking
  lastSpendDate?: string;
  topExpenses?: TopExpense[];

  notes?: string;
}

export interface PeriodAmount {
  period: string; // e.g., "2024-Q1", "2024-01"
  startDate: string;
  endDate: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
}

export interface HeadcountBudget {
  budgetedHeadcount: number;
  currentHeadcount: number;
  plannedHires: number;
  plannedAttrition: number;
  endingHeadcount: number;
  averageSalary: number;
  totalSalaryCost: number;
  benefitsCost: number;
  totalCompensationCost: number;
}

export interface TopExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  vendor?: string;
  category: string;
}

export interface BudgetRevision {
  id: string;
  version: string;
  revisionDate: string;
  revisedBy: string;
  revisedByName: string;
  reason: string;
  changes: BudgetChange[];
  totalImpact: number;
}

export interface BudgetChange {
  lineId: string;
  lineName: string;
  fieldChanged: string;
  oldValue: number;
  newValue: number;
  difference: number;
}

// ============================================================================
// Budget Variance & Reporting
// ============================================================================

export interface BudgetVarianceReport {
  id: string;
  reportCode: string;
  reportName: string;
  budgetId: string;
  budgetName: string;
  reportDate: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };

  // Overall Variance
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  totalVariancePercentage: number;
  favorableVariance: number;
  unfavorableVariance: number;

  // Line-by-Line Variance
  lineVariances: LineVariance[];

  // Category Rollup
  categoryVariances: CategoryVariance[];

  // Trend Analysis
  trends: VarianceTrend[];

  // Recommendations
  recommendations: string[];
  alerts: BudgetAlert[];

  createdDate: string;
}

export interface LineVariance {
  lineId: string;
  category: string;
  subcategory?: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  varianceType: 'favorable' | 'unfavorable' | 'neutral';
  explanation?: string;
}

export interface CategoryVariance {
  category: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  linesCount: number;
}

export interface VarianceTrend {
  period: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  runningVariance: number;
}

export interface BudgetAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  threshold: number;
  actualValue: number;
  recommendedAction: string;
}

// ============================================================================
// Budget Templates
// ============================================================================

export interface BudgetTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  templateType: BudgetType;
  status: Status;
  description: string;

  // Template Lines
  templateLines: TemplateLine[];

  // Configuration
  defaultPeriod: BudgetPeriod;
  defaultCurrency: string;
  includeHeadcount: boolean;
  includeContingency: boolean;
  contingencyPercentage?: number;

  // Usage
  usageCount: number;
  lastUsedDate?: string;

  // Permissions
  allowedDepartments: string[];
  allowedRoles: string[];

  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface TemplateLine {
  id: string;
  lineNumber: number;
  category: string;
  subcategory?: string;
  description: string;
  defaultAmount?: number;
  calculationFormula?: string;
  required: boolean;
  allowOverride: boolean;
  notes?: string;
}

// ============================================================================
// Budget Scenarios
// ============================================================================

export type ScenarioType = 'baseline' | 'optimistic' | 'pessimistic' | 'custom';

export interface BudgetScenario {
  id: string;
  scenarioCode: string;
  scenarioName: string;
  scenarioType: ScenarioType;
  status: Status;
  description: string;

  // Base Budget
  baseBudgetId: string;
  baseBudgetName: string;

  // Scenario Assumptions
  assumptions: ScenarioAssumption[];

  // Adjusted Budget
  adjustedLines: BudgetLine[];
  totalAdjustedBudget: number;
  totalVarianceFromBase: number;
  variancePercentage: number;

  // Impact Analysis
  headcountImpact?: HeadcountImpact;
  cashFlowImpact?: CashFlowImpact;

  // Comparison
  comparisonScenarios?: string[];

  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ScenarioAssumption {
  id: string;
  assumptionType: 'salary_increase' | 'headcount_change' | 'cost_inflation' | 'revenue_change' | 'custom';
  description: string;
  baselineValue: number;
  scenarioValue: number;
  unit: string;
  impactDescription: string;
  affectedCategories: string[];
}

export interface HeadcountImpact {
  baselineHeadcount: number;
  scenarioHeadcount: number;
  headcountChange: number;
  averageSalaryChange: number;
  totalCompensationChange: number;
}

export interface CashFlowImpact {
  quarters: QuarterlyCashFlow[];
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
}

export interface QuarterlyCashFlow {
  quarter: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeFlow: number;
}

// ============================================================================
// Vendor Management
// ============================================================================

export type VendorType = 'individual' | 'company' | 'contractor' | 'consultant';
export type VendorStatus = 'active' | 'inactive' | 'pending_approval' | 'blacklisted';
export type PaymentTerms = 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90' | 'due_on_receipt' | 'custom';

export interface Vendor {
  id: string;
  vendorCode: string;
  vendorName: string;
  vendorType: VendorType;
  status: VendorStatus;

  // Contact Information
  primaryContact: ContactPerson;
  alternateContact?: ContactPerson;
  email: string;
  phone: string;
  website?: string;

  // Address
  billingAddress: Address;
  shippingAddress?: Address;

  // Tax & Legal
  taxId: string;
  businessRegistrationNumber?: string;
  insuranceCertificate?: string;
  insuranceExpiryDate?: string;

  // Payment Details
  paymentTerms: PaymentTerms;
  customPaymentTerms?: string;
  bankDetails: BankDetails;
  preferredPaymentMethod: 'bank_transfer' | 'check' | 'ach' | 'wire' | 'credit_card';

  // Compliance
  w9OnFile: boolean;
  backgroundCheckCompleted: boolean;
  contractOnFile: boolean;
  contractExpiryDate?: string;

  // Categories & Services
  categories: string[];
  servicesProvided: string[];

  // Performance
  performanceRating: number;
  totalTransactions: number;
  totalSpend: number;
  averageInvoiceAmount: number;
  onTimePaymentRate: number;
  qualityScore: number;

  // Documents
  documents: VendorDocument[];

  // Approval
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedDate?: string;

  // Meta
  createdBy: string;
  createdDate: string;
  lastModified: string;
  lastTransactionDate?: string;
  notes?: string;
}

export interface ContactPerson {
  name: string;
  title?: string;
  email: string;
  phone: string;
  mobile?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
  iban?: string;
}

export interface VendorDocument {
  id: string;
  documentType: 'w9' | 'contract' | 'insurance' | 'license' | 'certificate' | 'other';
  documentName: string;
  fileUrl: string;
  uploadedDate: string;
  expiryDate?: string;
  status: 'current' | 'expiring_soon' | 'expired';
}

// ============================================================================
// Vendor Contracts
// ============================================================================

export type ContractType = 'fixed_price' | 'time_and_materials' | 'retainer' | 'master_service_agreement';

export interface VendorContract {
  id: string;
  contractCode: string;
  contractName: string;
  vendorId: string;
  vendorName: string;
  contractType: ContractType;
  status: Status;

  // Contract Terms
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  renewalNoticeDays?: number;

  // Financial Terms
  totalContractValue: number;
  currency: string;
  paymentTerms: PaymentTerms;
  paymentSchedule?: PaymentSchedule[];

  // Scope of Work
  servicesIncluded: string[];
  deliverables: Deliverable[];

  // Performance Metrics
  kpis: ContractKPI[];
  penaltyClause?: PenaltyClause;
  bonusClause?: BonusClause;

  // Compliance
  confidentialityClause: boolean;
  nonCompeteClause: boolean;
  terminationClause: string;
  disputeResolution: string;

  // Documents
  contractDocument?: string;
  amendments: ContractAmendment[];

  // Tracking
  totalSpent: number;
  remainingValue: number;
  utilizationRate: number;

  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface PaymentSchedule {
  id: string;
  milestoneDescription: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  paidDate?: string;
  invoiceNumber?: string;
}

export interface Deliverable {
  id: string;
  deliverableName: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completionDate?: string;
  acceptanceStatus?: 'pending' | 'accepted' | 'rejected';
}

export interface ContractKPI {
  id: string;
  kpiName: string;
  targetValue: number;
  actualValue?: number;
  unit: string;
  measurementFrequency: 'weekly' | 'monthly' | 'quarterly' | 'annual';
}

export interface PenaltyClause {
  description: string;
  penaltyAmount: number;
  triggers: string[];
}

export interface BonusClause {
  description: string;
  bonusAmount: number;
  conditions: string[];
}

export interface ContractAmendment {
  id: string;
  amendmentNumber: number;
  amendmentDate: string;
  description: string;
  changes: string[];
  impactOnValue: number;
  approvedBy: string;
  documentUrl?: string;
}

// ============================================================================
// Petty Cash Management
// ============================================================================

export type PettyCashTransactionType = 'disbursement' | 'replenishment' | 'return' | 'adjustment';

export interface PettyCashFund {
  id: string;
  fundCode: string;
  fundName: string;
  status: Status;

  // Fund Details
  department: string;
  location: string;
  custodian: string;
  custodianName: string;

  // Amounts
  initialBalance: number;
  currentBalance: number;
  totalDisbursed: number;
  totalReplenished: number;

  // Limits
  fundLimit: number;
  transactionLimit: number;
  minimumBalance: number;

  // Transactions
  transactions: PettyCashTransaction[];

  // Reconciliation
  lastReconciledDate?: string;
  lastReconciledBy?: string;
  nextReconciliationDue?: string;

  // Controls
  requireReceipt: boolean;
  requireApproval: boolean;
  approvalThreshold?: number;

  createdDate: string;
  lastModified: string;
}

export interface PettyCashTransaction {
  id: string;
  transactionCode: string;
  fundId: string;
  transactionType: PettyCashTransactionType;
  transactionDate: string;

  // Details
  amount: number;
  category: string;
  description: string;
  requestedBy: string;
  requestedByName: string;

  // Receipt
  receiptNumber?: string;
  receiptAttachment?: string;
  vendor?: string;

  // Approval
  requiresApproval: boolean;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedDate?: string;

  // Reconciliation
  reconciled: boolean;
  reconciledDate?: string;

  // Balance After Transaction
  balanceAfter: number;

  createdDate: string;
  notes?: string;
}

export interface PettyCashReconciliation {
  id: string;
  reconciliationCode: string;
  fundId: string;
  fundName: string;
  reconciliationDate: string;

  // Balances
  expectedBalance: number;
  actualBalance: number;
  variance: number;

  // Transaction Summary
  transactionCount: number;
  totalDisbursements: number;
  totalReplenishments: number;
  unreconciled transactions: number;

  // Physical Count
  cashOnHand: number;
  receipts: number;
  ious: number;

  // Reconciliation Status
  status: 'in_progress' | 'completed' | 'variance_pending_review';
  varianceExplanation?: string;
  varianceResolution?: string;

  // Personnel
  reconciledBy: string;
  reconciledByName: string;
  reviewedBy?: string;
  reviewedDate?: string;

  // Documents
  reconciliationReport?: string;
  supportingDocuments: string[];

  createdDate: string;
}

// ============================================================================
// Financial Assets
// ============================================================================

export type AssetType = 'capital' | 'operational' | 'it_equipment' | 'furniture' | 'vehicle' | 'other';
export type AssetStatus = 'active' | 'disposed' | 'lost' | 'stolen' | 'under_repair' | 'retired';

export interface FinancialAsset {
  id: string;
  assetCode: string;
  assetName: string;
  assetType: AssetType;
  status: AssetStatus;
  description: string;

  // Financial Details
  purchasePrice: number;
  currentValue: number;
  depreciationMethod: 'straight_line' | 'declining_balance' | 'none';
  usefulLife: number; // years
  salvageValue: number;
  accumulatedDepreciation: number;

  // Purchase Information
  purchaseDate: string;
  vendor?: string;
  invoiceNumber?: string;
  warrantyExpiryDate?: string;

  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  department?: string;
  costCenter?: string;
  location?: string;

  // Maintenance
  maintenanceSchedule?: MaintenanceSchedule;
  maintenanceHistory: MaintenanceRecord[];

  // Documents
  purchaseReceipt?: string;
  warranty?: string;
  manuals?: string[];
  photos?: string[];

  // Disposal
  disposalDate?: string;
  disposalMethod?: string;
  disposalValue?: number;

  createdDate: string;
  lastModified: string;
  notes?: string;
}

export interface MaintenanceSchedule {
  frequency: 'monthly' | 'quarterly' | 'annual';
  lastMaintenanceDate?: string;
  nextMaintenanceDate: string;
  estimatedCost: number;
}

export interface MaintenanceRecord {
  id: string;
  maintenanceDate: string;
  maintenanceType: 'preventive' | 'corrective' | 'emergency';
  description: string;
  cost: number;
  performedBy: string;
  nextScheduledDate?: string;
  notes?: string;
}

// ============================================================================
// Analytics & Metrics
// ============================================================================

export interface FinanceMetrics {
  // Budget Metrics
  totalBudgets: number;
  activeBudgets: number;
  totalBudgetAmount: number;
  totalSpent: number;
  totalRemaining: number;
  averageUtilization: number; // percentage

  // Variance Metrics
  favorableVariances: number;
  unfavorableVariances: number;
  criticalVariances: number;
  averageVariancePercentage: number;

  // Vendor Metrics
  totalVendors: number;
  activeVendors: number;
  totalVendorSpend: number;
  averageVendorRating: number;
  vendorsAwaitingApproval: number;

  // Contract Metrics
  activeContracts: number;
  totalContractValue: number;
  contractsExpiringSoon: number;
  averageContractUtilization: number;

  // Petty Cash Metrics
  activePettyCashFunds: number;
  totalPettyCashBalance: number;
  pendingReconciliations: number;
  pettyCashUtilization: number;

  // Asset Metrics
  totalAssets: number;
  totalAssetValue: number;
  totalDepreciation: number;
  assetsUnderMaintenance: number;

  // Trends
  budgetTrends: TrendData[];
  spendingTrends: TrendData[];

  lastUpdated: string;
}

export interface TrendData {
  period: string;
  value: number;
  change?: number;
  changePercentage?: number;
}

// ============================================================================
// Settings
// ============================================================================

export interface FinanceSettings {
  // General Settings
  defaultCurrency: string;
  fiscalYearStart: string; // MM-DD format
  budgetPeriod: BudgetPeriod;

  // Budget Settings
  requireBudgetApproval: boolean;
  budgetVarianceThreshold: number; // percentage
  allowOverspending: boolean;
  overspendingApprovalRequired: boolean;

  // Vendor Settings
  requireVendorApproval: boolean;
  vendorBackgroundCheckRequired: boolean;
  minimumInsuranceCoverage: number;
  contractRenewalNoticeDays: number;

  // Petty Cash Settings
  defaultPettyCashLimit: number;
  defaultTransactionLimit: number;
  requirePettyCashReceipt: boolean;
  pettyCashApprovalThreshold: number;
  reconciliationFrequency: 'weekly' | 'monthly' | 'quarterly';

  // Asset Settings
  defaultDepreciationMethod: 'straight_line' | 'declining_balance';
  defaultUsefulLife: number;
  assetCapitalizationThreshold: number;
  requireAssetTag: boolean;

  // Notifications
  enableNotifications: boolean;
  notifyBudgetThreshold: boolean;
  notifyContractExpiry: boolean;
  notifyVendorDocExpiry: boolean;
  notifyPettyCashLow: boolean;

  createdDate: string;
  lastModified: string;
}
