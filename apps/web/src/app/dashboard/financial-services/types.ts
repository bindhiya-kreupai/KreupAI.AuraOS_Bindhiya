/**
 * Financial Services Module - Type Definitions
 * Comprehensive types for Banking Operations, Insurance Claims, Wealth Management, and Regulatory Compliance
 */

// ==================== Banking Operations Types ====================

export type AccountType = 'checking' | 'savings' | 'money_market' | 'cd' | 'business' | 'loan';
export type AccountStatus = 'active' | 'inactive' | 'frozen' | 'closed' | 'pending';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee' | 'interest' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';
export type LoanType = 'personal' | 'auto' | 'mortgage' | 'business' | 'student' | 'line_of_credit';
export type LoanStatus = 'applied' | 'approved' | 'active' | 'paid_off' | 'defaulted' | 'denied';

export interface BankAccount {
  accountId: string;
  accountNumber: string;
  accountType: AccountType;
  customerId: string;
  customerName: string;
  balance: AccountBalance;
  status: AccountStatus;
  openDate: string;
  closedDate?: string;
  interestRate?: number;
  minimumBalance?: number;
  fees: AccountFee[];
  features: string[];
  linkedAccounts: string[];
  alerts: AccountAlert[];
  createdAt: string;
  updatedAt?: string;
}

export interface AccountBalance {
  current: number;
  available: number;
  pending: number;
  hold: number;
  overdraftLimit?: number;
  currency: string;
}

export interface AccountFee {
  feeId: string;
  feeType: 'monthly' | 'overdraft' | 'atm' | 'wire' | 'stop_payment' | 'other';
  amount: number;
  description: string;
  chargedDate: string;
  waived: boolean;
  waivedReason?: string;
}

export interface AccountAlert {
  alertId: string;
  alertType: 'low_balance' | 'large_transaction' | 'unusual_activity' | 'fee_charged' | 'payment_due';
  severity: 'low' | 'medium' | 'high';
  message: string;
  triggeredDate: string;
  acknowledged: boolean;
}

export interface Transaction {
  transactionId: string;
  accountId: string;
  transactionType: TransactionType;
  amount: number;
  currency: string;
  description: string;
  merchantName?: string;
  category?: string;
  date: string;
  postDate: string;
  status: TransactionStatus;
  runningBalance?: number;
  reference?: string;
  location?: TransactionLocation;
  metadata: TransactionMetadata;
  createdAt: string;
}

export interface TransactionLocation {
  city?: string;
  state?: string;
  country?: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface TransactionMetadata {
  channel: 'online' | 'mobile' | 'atm' | 'branch' | 'phone' | 'third_party';
  device?: string;
  ipAddress?: string;
  authorizationCode?: string;
  merchantCategory?: string;
}

export interface Loan {
  loanId: string;
  loanNumber: string;
  loanType: LoanType;
  customerId: string;
  customerName: string;
  principal: number;
  currentBalance: number;
  interestRate: number;
  term: LoanTerm;
  payment: LoanPayment;
  collateral?: Collateral;
  status: LoanStatus;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  maturityDate?: string;
  payoffDate?: string;
  delinquency?: DelinquencyInfo;
  documents: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface LoanTerm {
  termMonths: number;
  startDate: string;
  endDate: string;
  paymentFrequency: 'monthly' | 'bi_weekly' | 'weekly';
}

export interface LoanPayment {
  monthlyPayment: number;
  nextPaymentDate: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  totalPayments: number;
  paymentsRemaining: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
  paymentId: string;
  paymentDate: string;
  amount: number;
  principalPortion: number;
  interestPortion: number;
  lateFee?: number;
  status: 'on_time' | 'late' | 'missed';
}

export interface Collateral {
  collateralType: 'auto' | 'real_estate' | 'equipment' | 'securities' | 'other';
  description: string;
  value: number;
  valuationDate: string;
  lienPosition: number;
}

export interface DelinquencyInfo {
  daysDelinquent: number;
  amountPastDue: number;
  lastContactDate?: string;
  collectionStatus: 'current' | 'warning' | 'collection' | 'legal';
  notes: string[];
}

export interface WireTransfer {
  wireId: string;
  wireType: 'domestic' | 'international';
  direction: 'incoming' | 'outgoing';
  fromAccount: AccountInfo;
  toAccount: AccountInfo;
  amount: number;
  currency: string;
  purpose: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  initiatedDate: string;
  completedDate?: string;
  fees: number;
  reference: string;
  intermediaryBank?: BankInfo;
  compliance: ComplianceCheck;
  createdAt: string;
}

export interface AccountInfo {
  accountNumber: string;
  accountName: string;
  bankName: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  address?: string;
}

export interface BankInfo {
  bankName: string;
  swiftCode: string;
  address: string;
}

export interface ComplianceCheck {
  amlChecked: boolean;
  sanctionsChecked: boolean;
  kycVerified: boolean;
  riskScore: number;
  flags: string[];
  approvedBy?: string;
  approvalDate?: string;
}

// ==================== Insurance Claims Types ====================

export type ClaimType = 'auto' | 'home' | 'health' | 'life' | 'disability' | 'liability' | 'workers_comp';
export type ClaimStatus = 'reported' | 'under_review' | 'investigating' | 'approved' | 'denied' | 'paid' | 'closed';
export type PolicyStatus = 'active' | 'lapsed' | 'cancelled' | 'expired' | 'pending';

export interface InsurancePolicy {
  policyId: string;
  policyNumber: string;
  policyType: ClaimType;
  policyHolder: PolicyHolder;
  coverage: Coverage;
  premium: Premium;
  beneficiaries: Beneficiary[];
  status: PolicyStatus;
  effectiveDate: string;
  expirationDate: string;
  renewalDate?: string;
  claims: string[]; // claimIds
  documents: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface PolicyHolder {
  customerId: string;
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: Address;
  riskProfile: RiskProfile;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface RiskProfile {
  riskScore: number;
  factors: RiskFactor[];
  lastAssessmentDate: string;
}

export interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export interface Coverage {
  coverageAmount: number;
  deductible: number;
  copay?: number;
  coinsurance?: number;
  outOfPocketMax?: number;
  coverageDetails: CoverageDetail[];
  exclusions: string[];
  riders: PolicyRider[];
}

export interface CoverageDetail {
  coverageType: string;
  limit: number;
  description: string;
}

export interface PolicyRider {
  riderId: string;
  riderName: string;
  additionalPremium: number;
  coverage: string;
}

export interface Premium {
  annualPremium: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  paymentAmount: number;
  nextPaymentDate: string;
  lastPaymentDate?: string;
  paymentMethod: string;
  discounts: Discount[];
}

export interface Discount {
  discountType: string;
  amount: number;
  percentage: number;
  description: string;
}

export interface Beneficiary {
  beneficiaryId: string;
  name: string;
  relationship: string;
  percentage: number;
  contactInfo: string;
  isPrimary: boolean;
}

export interface InsuranceClaim {
  claimId: string;
  claimNumber: string;
  policyId: string;
  claimType: ClaimType;
  claimant: Claimant;
  incident: Incident;
  claimAmount: number;
  approvedAmount?: number;
  deductibleApplied?: number;
  payoutAmount?: number;
  status: ClaimStatus;
  filedDate: string;
  assignedAdjuster?: Adjuster;
  investigation: Investigation;
  documents: ClaimDocument[];
  timeline: ClaimTimeline[];
  communications: Communication[];
  createdAt: string;
  updatedAt?: string;
}

export interface Claimant {
  claimantId: string;
  name: string;
  relationship: 'policyholder' | 'spouse' | 'dependent' | 'third_party';
  contactInfo: string;
}

export interface Incident {
  incidentDate: string;
  incidentTime?: string;
  location: string;
  description: string;
  incidentType: string;
  policeReport?: PoliceReport;
  witnesses: Witness[];
  injuries?: Injury[];
  propertyDamage?: PropertyDamage[];
  photos: string[];
}

export interface PoliceReport {
  reportNumber: string;
  department: string;
  officerName: string;
  reportDate: string;
  fileUrl?: string;
}

export interface Witness {
  name: string;
  contactInfo: string;
  statement: string;
}

export interface Injury {
  injuredPerson: string;
  injuryType: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  treatment: string;
  medicalProvider: string;
}

export interface PropertyDamage {
  propertyType: string;
  description: string;
  estimatedValue: number;
  repairEstimate?: number;
}

export interface Adjuster {
  adjusterId: string;
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  assignedDate: string;
}

export interface Investigation {
  investigationStatus: 'pending' | 'in_progress' | 'completed';
  findings: string[];
  fraudIndicators: FraudIndicator[];
  recommendation: 'approve' | 'deny' | 'partial_approve' | 'further_investigation';
  completedDate?: string;
}

export interface FraudIndicator {
  indicator: string;
  severity: 'low' | 'medium' | 'high';
  notes: string;
}

export interface ClaimDocument {
  documentId: string;
  documentType: string;
  fileName: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
}

export interface ClaimTimeline {
  eventId: string;
  eventType: string;
  eventDate: string;
  description: string;
  performedBy: string;
}

export interface Communication {
  communicationId: string;
  communicationType: 'email' | 'phone' | 'letter' | 'portal';
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  date: string;
  from: string;
  to: string;
}

// ==================== Wealth Management Types ====================

export type AssetClass = 'stocks' | 'bonds' | 'mutual_funds' | 'etfs' | 'real_estate' | 'commodities' | 'cash' | 'alternatives';
export type PortfolioStatus = 'active' | 'inactive' | 'restricted';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus = 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';

export interface Portfolio {
  portfolioId: string;
  portfolioName: string;
  clientId: string;
  clientName: string;
  advisor?: Advisor;
  totalValue: number;
  cashBalance: number;
  investedAmount: number;
  unrealizedGainLoss: number;
  realizedGainLoss: number;
  allocation: AssetAllocation[];
  holdings: Holding[];
  performance: Performance;
  riskProfile: InvestmentRiskProfile;
  status: PortfolioStatus;
  inceptionDate: string;
  lastRebalanceDate?: string;
  nextRebalanceDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Advisor {
  advisorId: string;
  name: string;
  designation: string[];
  email: string;
  phone: string;
  licenseNumber: string;
  yearsExperience: number;
}

export interface AssetAllocation {
  assetClass: AssetClass;
  targetPercentage: number;
  currentPercentage: number;
  value: number;
  drift: number;
}

export interface Holding {
  holdingId: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  percentOfPortfolio: number;
  purchaseDate: string;
}

export interface Performance {
  dayReturn: number;
  weekReturn: number;
  monthReturn: number;
  quarterReturn: number;
  yearReturn: number;
  inceptionReturn: number;
  annualizedReturn: number;
  sharpeRatio?: number;
  volatility?: number;
  benchmarkComparison?: BenchmarkComparison;
}

export interface BenchmarkComparison {
  benchmarkName: string;
  benchmarkReturn: number;
  alpha: number;
  beta: number;
  correlationCoefficient: number;
}

export interface InvestmentRiskProfile {
  riskTolerance: 'conservative' | 'moderate' | 'balanced' | 'growth' | 'aggressive';
  timeHorizon: number; // in years
  investmentObjectives: string[];
  constraints: string[];
  taxConsiderations: TaxConsideration[];
}

export interface TaxConsideration {
  considerationType: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface TradeOrder {
  orderId: string;
  portfolioId: string;
  orderType: OrderType;
  action: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  filledQuantity: number;
  averageFillPrice?: number;
  commission: number;
  status: OrderStatus;
  placedDate: string;
  filledDate?: string;
  expirationDate?: string;
  notes?: string;
  createdAt: string;
}

export interface FinancialPlan {
  planId: string;
  clientId: string;
  planType: 'retirement' | 'education' | 'estate' | 'comprehensive';
  goals: FinancialGoal[];
  currentSituation: FinancialSituation;
  recommendations: Recommendation[];
  projections: Projection[];
  assumptions: Assumption[];
  status: 'draft' | 'active' | 'under_review' | 'completed';
  createdDate: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  advisorId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FinancialGoal {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  requiredMonthlySavings: number;
  onTrack: boolean;
}

export interface FinancialSituation {
  income: IncomeSource[];
  expenses: ExpenseCategory[];
  assets: Asset[];
  liabilities: Liability[];
  netWorth: number;
  liquidityRatio: number;
  debtToIncomeRatio: number;
}

export interface IncomeSource {
  source: string;
  amount: number;
  frequency: string;
  taxable: boolean;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  frequency: string;
  discretionary: boolean;
}

export interface Asset {
  assetType: string;
  description: string;
  value: number;
  liquid: boolean;
}

export interface Liability {
  liabilityType: string;
  description: string;
  balance: number;
  interestRate: number;
  monthlyPayment: number;
}

export interface Recommendation {
  recommendationId: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  expectedBenefit: string;
  implementationSteps: string[];
  timeline: string;
  status: 'pending' | 'in_progress' | 'implemented' | 'rejected';
}

export interface Projection {
  year: number;
  age: number;
  income: number;
  expenses: number;
  savings: number;
  portfolioValue: number;
  netWorth: number;
}

export interface Assumption {
  assumptionType: string;
  value: number | string;
  description: string;
}

// ==================== Regulatory Compliance Types ====================

export type ComplianceArea = 'kyc' | 'aml' | 'cip' | 'bsa' | 'ofac' | 'privacy' | 'fair_lending' | 'consumer_protection';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'under_review' | 'remediation_required';
export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed';

export interface ComplianceProgram {
  programId: string;
  programName: string;
  complianceArea: ComplianceArea;
  policies: CompliancePolicy[];
  procedures: ComplianceProcedure[];
  controls: ComplianceControl[];
  training: ComplianceTraining[];
  audits: ComplianceAudit[];
  status: ComplianceStatus;
  lastReviewDate: string;
  nextReviewDate: string;
  responsibleOfficer: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CompliancePolicy {
  policyId: string;
  policyName: string;
  version: string;
  effectiveDate: string;
  approvedBy: string;
  approvalDate: string;
  description: string;
  requirements: string[];
  documentUrl: string;
  reviewFrequency: number; // in months
  nextReviewDate: string;
}

export interface ComplianceProcedure {
  procedureId: string;
  procedureName: string;
  relatedPolicy: string;
  steps: ProcedureStep[];
  responsibleParties: string[];
  frequency: string;
  lastPerformed?: string;
  nextScheduled?: string;
}

export interface ProcedureStep {
  stepNumber: number;
  description: string;
  responsibleRole: string;
  documentation: string;
  controlPoint: boolean;
}

export interface ComplianceControl {
  controlId: string;
  controlName: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  description: string;
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  automated: boolean;
  owner: string;
  effectiveness: 'effective' | 'needs_improvement' | 'ineffective';
  lastTestDate?: string;
  nextTestDate?: string;
}

export interface ComplianceTraining {
  trainingId: string;
  trainingName: string;
  trainingType: 'initial' | 'annual' | 'refresher' | 'specialized';
  complianceTopics: string[];
  targetAudience: string[];
  duration: number; // in hours
  deliveryMethod: 'classroom' | 'online' | 'webinar' | 'self_paced';
  completionRecords: TrainingCompletion[];
  passingScore: number;
  certificateIssued: boolean;
  validityPeriod?: number; // in months
}

export interface TrainingCompletion {
  employeeId: string;
  employeeName: string;
  completionDate: string;
  score: number;
  passed: boolean;
  certificateNumber?: string;
  expirationDate?: string;
}

export interface ComplianceAudit {
  auditId: string;
  auditName: string;
  auditType: 'internal' | 'external' | 'regulatory';
  scope: string[];
  auditor: AuditorInfo;
  scheduledDate: string;
  completionDate?: string;
  status: AuditStatus;
  findings: AuditFinding[];
  overallRating: 'satisfactory' | 'needs_improvement' | 'unsatisfactory';
  reportUrl?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface AuditorInfo {
  auditorId: string;
  name: string;
  organization: string;
  certification: string;
  contactInfo: string;
}

export interface AuditFinding {
  findingId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  regulation: string;
  recommendation: string;
  managementResponse: ManagementResponse;
  correctiveAction?: CorrectiveAction;
}

export interface ManagementResponse {
  response: string;
  agreedToRecommendation: boolean;
  alternativeApproach?: string;
  respondedBy: string;
  responseDate: string;
}

export interface CorrectiveAction {
  actionId: string;
  actionDescription: string;
  responsiblePerson: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  evidenceOfCompletion?: string[];
}

export interface RegulatoryReport {
  reportId: string;
  reportType: string;
  regulatoryBody: string;
  reportingPeriod: { startDate: string; endDate: string };
  dueDate: string;
  submissionDate?: string;
  status: 'draft' | 'pending_review' | 'submitted' | 'accepted' | 'rejected';
  data: any;
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  confirmationNumber?: string;
  reportUrl?: string;
  createdAt: string;
}

export interface SanctionsScreening {
  screeningId: string;
  entityType: 'individual' | 'organization';
  entityName: string;
  entityId: string;
  screeningDate: string;
  lists: SanctionsList[];
  result: 'clear' | 'potential_match' | 'confirmed_match';
  matches: SanctionsMatch[];
  reviewedBy?: string;
  reviewDate?: string;
  decision?: 'approved' | 'escalated' | 'blocked';
  notes?: string;
}

export interface SanctionsList {
  listName: string;
  listType: 'ofac' | 'un' | 'eu' | 'other';
  lastUpdated: string;
}

export interface SanctionsMatch {
  matchId: string;
  listName: string;
  matchScore: number;
  matchedName: string;
  additionalInfo: string;
  falsePositive: boolean;
}

export interface TransactionMonitoring {
  monitoringId: string;
  transactionId: string;
  accountId: string;
  amount: number;
  alertType: string;
  riskScore: number;
  triggers: MonitoringTrigger[];
  status: 'new' | 'under_review' | 'escalated' | 'cleared' | 'sar_filed';
  assignedAnalyst?: string;
  reviewDate?: string;
  decision?: string;
  sarFiled?: boolean;
  sarNumber?: string;
  createdAt: string;
}

export interface MonitoringTrigger {
  triggerType: string;
  threshold: number;
  actualValue: number;
  description: string;
}

// ==================== Common/Shared Types ====================

export interface FinancialSettings {
  settingsId: string;
  organizationId: string;
  bankingSettings: {
    overdraftProtection: boolean;
    minimumBalanceAlerts: boolean;
    fraudMonitoring: boolean;
    transactionLimits: { daily: number; weekly: number; monthly: number };
  };
  insuranceSettings: {
    claimAutoAssignment: boolean;
    fraudDetectionEnabled: boolean;
    claimApprovalThreshold: number;
    investigationThreshold: number;
  };
  wealthSettings: {
    autoRebalancing: boolean;
    rebalanceTolerance: number;
    taxLossHarvesting: boolean;
    performanceReportingFrequency: string;
  };
  complianceSettings: {
    sanctionsScreeningEnabled: boolean;
    transactionMonitoringEnabled: boolean;
    amlRiskScoreThreshold: number;
    auditFrequency: number; // in months
  };
  notifications: {
    transactionAlerts: boolean;
    claimUpdates: boolean;
    portfolioAlerts: boolean;
    complianceDeadlines: boolean;
    advanceNoticeDays: number;
  };
  updatedAt: string;
}

export interface FinancialAlert {
  alertId: string;
  alertType: 'transaction' | 'claim' | 'portfolio' | 'compliance' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affectedEntity: { entityType: string; entityId: string; entityName: string };
  actionRequired?: string;
  dueDate?: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
}
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards: id, type, message,
 * optional duration in ms.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
