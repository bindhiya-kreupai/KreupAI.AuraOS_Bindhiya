/**
 * Global Mobility Module - Type Definitions
 * Comprehensive types for visa & immigration, relocation packages, and expat tax management
 */

// ============================================================================
// Common Types
// ============================================================================

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'expired';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface AuditInfo {
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  countryCode: string;
}

export interface Document {
  documentId: string;
  documentType: string;
  documentName: string;
  documentNumber?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedDate: Date;
  expiryDate?: Date;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedDate?: Date;
}

// ============================================================================
// Visa & Immigration Types
// ============================================================================

export interface VisaApplication {
  applicationId: string;
  applicationCode: string;
  applicationStatus: VisaApplicationStatus;

  // Employee Information
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  nationality: string;
  dateOfBirth: Date;
  passportNumber: string;
  passportExpiryDate: Date;

  // Visa Details
  visaType: VisaType;
  visaCategory: string;
  destinationCountry: string;
  destinationCountryCode: string;
  purposeOfTravel: string;
  assignmentDuration: number; // months

  // Assignment Details
  assignmentId?: string;
  assignmentType: 'short_term' | 'long_term' | 'permanent' | 'business_trip';
  hostCompany: string;
  hostLocation: string;
  jobTitle: string;
  startDate: Date;
  endDate?: Date;

  // Sponsor Information
  sponsorCompany: string;
  sponsorContactName: string;
  sponsorContactEmail: string;
  sponsorContactPhone: string;

  // Application Timeline
  applicationDate: Date;
  submissionDate?: Date;
  approvalDate?: Date;
  rejectionDate?: Date;
  expectedProcessingTime: number; // days
  actualProcessingTime?: number; // days

  // Documents
  requiredDocuments: RequiredDocument[];
  submittedDocuments: Document[];
  documentCompletionRate: number; // percentage

  // Tracking
  currentStage: VisaStage;
  stages: VisaStage[];
  milestones: VisaMilestone[];

  // Costs
  applicationFee: number;
  governmentFees: number;
  legalFees: number;
  otherFees: number;
  totalCost: number;
  currency: string;
  paidBy: 'employee' | 'company' | 'shared';

  // Dependents
  includeDependents: boolean;
  dependents: Dependent[];

  // Legal Representation
  useLegalRepresentation: boolean;
  lawFirm?: string;
  attorney?: string;
  attorneyContact?: string;

  // Additional Information
  previousVisas: PreviousVisa[];
  travelHistory: TravelHistory[];
  additionalNotes?: string;

  // Notifications
  notificationPreferences: NotificationPreference[];

  // Outcome
  visaNumber?: string;
  visaIssueDate?: Date;
  visaExpiryDate?: Date;
  rejectionReason?: string;
  appealSubmitted?: boolean;

  audit: AuditInfo;
}

export type VisaApplicationStatus =
  | 'draft'
  | 'in_preparation'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'on_hold'
  | 'withdrawn';

export type VisaType =
  | 'work_visa'
  | 'business_visa'
  | 'investor_visa'
  | 'intra_company_transfer'
  | 'skilled_worker'
  | 'temporary_worker'
  | 'dependent_visa'
  | 'student_visa'
  | 'permanent_residence';

export interface VisaStage {
  stageId: string;
  stageName: string;
  stageType: 'document_collection' | 'submission' | 'review' | 'interview' | 'decision' | 'issuance';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startDate?: Date;
  completionDate?: Date;
  assignedTo?: string;
  notes?: string;
  position: number;
}

export interface VisaMilestone {
  milestoneId: string;
  milestoneName: string;
  dueDate: Date;
  completionDate?: Date;
  isCompleted: boolean;
  isCritical: boolean;
  description: string;
}

export interface RequiredDocument {
  documentType: string;
  documentName: string;
  isRequired: boolean;
  isMandatory: boolean;
  description: string;
  sampleUrl?: string;
  isSubmitted: boolean;
  submittedDocumentId?: string;
}

export interface Dependent {
  dependentId: string;
  relationship: 'spouse' | 'child' | 'parent' | 'other';
  fullName: string;
  dateOfBirth: Date;
  nationality: string;
  passportNumber: string;
  passportExpiryDate: Date;
  includeInVisa: boolean;
  visaStatus?: VisaApplicationStatus;
}

export interface PreviousVisa {
  country: string;
  visaType: string;
  visaNumber: string;
  issueDate: Date;
  expiryDate: Date;
  purpose: string;
}

export interface TravelHistory {
  country: string;
  entryDate: Date;
  exitDate: Date;
  purpose: string;
  duration: number; // days
}

export interface NotificationPreference {
  eventType: 'stage_change' | 'milestone_due' | 'document_required' | 'decision_made';
  notifyVia: ('email' | 'sms' | 'push')[];
  enabled: boolean;
}

export interface ImmigrationCompliance {
  complianceId: string;
  employeeId: string;
  employeeName: string;
  country: string;

  // Work Authorization
  workAuthorizationType: string;
  workAuthorizationNumber: string;
  workAuthorizationExpiryDate: Date;
  daysUntilExpiry: number;
  renewalRequired: boolean;
  renewalStartDate?: Date;

  // Compliance Status
  complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
  issues: ComplianceIssue[];

  // Monitoring
  lastReviewDate: Date;
  nextReviewDate: Date;
  assignedOfficer?: string;

  audit: AuditInfo;
}

export interface ComplianceIssue {
  issueId: string;
  issueType: 'expiring_document' | 'missing_document' | 'overstay_risk' | 'regulation_change' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedDate: Date;
  dueDate?: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  assignedTo?: string;
  resolution?: string;
  resolvedDate?: Date;
}

// ============================================================================
// Relocation Packages Types
// ============================================================================

export interface RelocationPackage {
  packageId: string;
  packageCode: string;
  packageName: string;
  status: Status;

  // Employee Information
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeePhone: string;

  // Assignment Details
  assignmentId?: string;
  assignmentType: 'domestic' | 'international';
  relocationType: 'permanent' | 'temporary' | 'rotational';
  seniority: 'entry' | 'mid' | 'senior' | 'executive' | 'c_level';

  // Locations
  originLocation: Address;
  destinationLocation: Address;
  distance: number; // km

  // Timeline
  requestDate: Date;
  plannedMoveDate: Date;
  actualMoveDate?: Date;
  expectedDuration: number; // days
  completionDate?: Date;

  // Family Details
  familySize: number;
  hasSpouse: boolean;
  numberOfChildren: number;
  numberOfPets: number;
  specialNeeds?: string;

  // Package Components
  benefits: RelocationBenefit[];
  services: RelocationService[];
  allowances: RelocationAllowance[];

  // Budget
  estimatedBudget: number;
  approvedBudget: number;
  actualSpent: number;
  remainingBudget: number;
  currency: string;
  budgetBreakdown: BudgetItem[];

  // Vendor Management
  vendors: RelocationVendor[];
  primaryVendor?: string;

  // Tracking
  currentPhase: RelocationPhase;
  phases: RelocationPhase[];
  tasks: RelocationTask[];

  // Housing
  temporaryHousing?: TemporaryHousing;
  permanentHousing?: PermanentHousing;

  // Policy
  policyTier: 'standard' | 'enhanced' | 'premium' | 'executive';
  policyExceptions: PolicyException[];

  // Satisfaction
  employeeSatisfaction?: number; // 1-5
  feedbackReceived: boolean;
  feedback?: string;

  // Coordinator
  coordinatorId: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;

  audit: AuditInfo;
}

export interface RelocationBenefit {
  benefitId: string;
  benefitType: BenefitType;
  benefitName: string;
  description: string;
  value: number;
  currency: string;
  isTaxable: boolean;
  isProvided: boolean;
  provisionStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  provisionDate?: Date;
  notes?: string;
}

export type BenefitType =
  | 'lump_sum'
  | 'moving_costs'
  | 'temporary_housing'
  | 'home_finding'
  | 'home_sale_assistance'
  | 'duplicate_housing'
  | 'storage'
  | 'car_allowance'
  | 'cultural_training'
  | 'language_training'
  | 'spouse_support'
  | 'education_assistance'
  | 'settling_in'
  | 'repatriation';

export interface RelocationService {
  serviceId: string;
  serviceType: ServiceType;
  serviceName: string;
  description: string;
  provider: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: Date;
  completionDate?: Date;
  cost: number;
  currency: string;
  isIncluded: boolean;
}

export type ServiceType =
  | 'household_goods_shipment'
  | 'home_search'
  | 'school_search'
  | 'orientation_tour'
  | 'cultural_training'
  | 'language_lessons'
  | 'immigration_support'
  | 'tax_consultation'
  | 'banking_assistance'
  | 'utility_setup'
  | 'destination_services';

export interface RelocationAllowance {
  allowanceId: string;
  allowanceType: AllowanceType;
  allowanceName: string;
  amount: number;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  duration?: number; // months
  startDate: Date;
  endDate?: Date;
  currency: string;
  isTaxable: boolean;
  totalPaid: number;
  paymentSchedule: AllowancePayment[];
}

export type AllowanceType =
  | 'cost_of_living_adjustment'
  | 'housing_allowance'
  | 'hardship_allowance'
  | 'education_allowance'
  | 'home_leave_allowance'
  | 'relocation_bonus'
  | 'goods_and_services_differential';

export interface AllowancePayment {
  paymentId: string;
  paymentDate: Date;
  amount: number;
  status: 'scheduled' | 'processed' | 'cancelled';
  reference?: string;
}

export interface BudgetItem {
  category: string;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  percentOfTotal: number;
}

export interface RelocationVendor {
  vendorId: string;
  vendorName: string;
  vendorType: 'moving_company' | 'real_estate' | 'immigration' | 'tax' | 'destination_services' | 'other';
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  servicesProvided: string[];
  contractValue: number;
  currency: string;
  performance?: VendorPerformance;
}

export interface VendorPerformance {
  rating: number; // 1-5
  onTimeDelivery: boolean;
  qualityScore: number;
  employeeSatisfaction: number;
  wouldRecommend: boolean;
  feedback?: string;
}

export interface RelocationPhase {
  phaseId: string;
  phaseName: string;
  phaseType: 'pre_move' | 'move' | 'post_move';
  status: 'pending' | 'in_progress' | 'completed';
  startDate?: Date;
  endDate?: Date;
  completionPercentage: number;
  tasks: string[]; // Task IDs
  position: number;
}

export interface RelocationTask {
  taskId: string;
  taskName: string;
  description: string;
  category: 'administrative' | 'logistics' | 'housing' | 'family' | 'financial' | 'other';
  priority: Priority;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: 'employee' | 'coordinator' | 'vendor';
  assigneeName?: string;
  dueDate?: Date;
  completionDate?: Date;
  dependencies: string[]; // Task IDs
  notes?: string;
}

export interface TemporaryHousing {
  provider: string;
  propertyType: 'hotel' | 'serviced_apartment' | 'short_term_rental';
  address: Address;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfNights: number;
  dailyRate: number;
  totalCost: number;
  currency: string;
  amenities: string[];
}

export interface PermanentHousing {
  propertyType: 'rent' | 'purchase';
  address: Address;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  monthlyRent?: number;
  purchasePrice?: number;
  currency: string;
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  moveInDate?: Date;
  landLordName?: string;
  landLordContact?: string;
}

export interface PolicyException {
  exceptionId: string;
  exceptionType: string;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  approvalDate?: Date;
  additionalCost: number;
  currency: string;
}

// ============================================================================
// Expat Tax Manager Types
// ============================================================================

export interface ExpatTaxProfile {
  profileId: string;
  employeeId: string;
  employeeName: string;
  status: Status;

  // Personal Information
  taxResidency: string; // Country
  nationality: string;
  dateOfBirth: Date;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  numberOfDependents: number;

  // Assignment Details
  assignmentId?: string;
  homeCountry: string;
  hostCountry: string;
  assignmentStartDate: Date;
  assignmentEndDate?: Date;
  assignmentDuration: number; // days

  // Tax Status
  homeCountryTaxStatus: TaxStatus;
  hostCountryTaxStatus: TaxStatus;
  taxTreaty: boolean;
  taxTreatyCountries: string[];

  // Tax Equalization
  taxEqualizationApplicable: boolean;
  taxEqualizationType?: 'gross_up' | 'tax_protection' | 'laissez_faire';
  hypotheticalTax: number;
  hypotheticalTaxCurrency: string;

  // Income Sources
  incomeSources: IncomeSource[];
  totalAnnualIncome: number;
  currency: string;

  // Deductions & Credits
  deductions: TaxDeduction[];
  credits: TaxCredit[];

  // Tax Returns
  taxReturns: TaxReturn[];
  complianceStatus: 'compliant' | 'pending' | 'overdue' | 'non_compliant';

  // Tax Advisor
  useTaxAdvisor: boolean;
  taxAdvisorFirm?: string;
  taxAdvisorName?: string;
  taxAdvisorContact?: string;

  // Social Security
  socialSecurityCoverage: SocialSecurityCoverage[];

  // Documents
  taxDocuments: Document[];

  audit: AuditInfo;
}

export interface TaxStatus {
  country: string;
  residencyStatus: 'resident' | 'non_resident' | 'dual_resident';
  taxId: string;
  taxYear: number;
  filingRequired: boolean;
  filingDeadline?: Date;
  extensionFiled?: boolean;
  extensionDeadline?: Date;
}

export interface IncomeSource {
  sourceId: string;
  sourceType: 'salary' | 'bonus' | 'equity' | 'rental' | 'investment' | 'pension' | 'other';
  description: string;
  country: string;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time';
  isTaxable: boolean;
  taxWithheld: number;
  startDate: Date;
  endDate?: Date;
}

export interface TaxDeduction {
  deductionId: string;
  deductionType: string;
  description: string;
  amount: number;
  currency: string;
  applicableCountry: string;
  taxYear: number;
  isApproved: boolean;
  supportingDocuments: string[]; // Document IDs
}

export interface TaxCredit {
  creditId: string;
  creditType: 'foreign_tax_credit' | 'child_care' | 'education' | 'retirement' | 'other';
  description: string;
  amount: number;
  currency: string;
  applicableCountry: string;
  taxYear: number;
  isApproved: boolean;
}

export interface TaxReturn {
  returnId: string;
  taxYear: number;
  country: string;
  returnType: 'annual' | 'quarterly' | 'final';

  // Filing
  filingStatus: 'not_started' | 'in_preparation' | 'ready_for_review' | 'filed' | 'amended';
  filingDeadline: Date;
  filingDate?: Date;
  filedBy?: string;
  extensionFiled: boolean;
  extensionDeadline?: Date;

  // Tax Calculation
  grossIncome: number;
  taxableIncome: number;
  totalDeductions: number;
  totalCredits: number;
  taxLiability: number;
  taxWithheld: number;
  taxOwed: number;
  refundDue: number;
  currency: string;

  // Payment
  paymentStatus: 'not_applicable' | 'pending' | 'paid' | 'overdue';
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;

  // Documents
  returnDocuments: Document[];

  // Review
  reviewRequired: boolean;
  reviewedBy?: string;
  reviewDate?: Date;
  reviewNotes?: string;

  // Audit Risk
  auditRisk: 'low' | 'medium' | 'high';
  auditStatus?: 'none' | 'under_audit' | 'completed';

  audit: AuditInfo;
}

export interface SocialSecurityCoverage {
  country: string;
  coverageType: 'home_country' | 'host_country' | 'totalization_agreement';
  ssNumber?: string;
  contributionRequired: boolean;
  employeeContribution?: number;
  employerContribution?: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
}

export interface TaxProjection {
  projectionId: string;
  employeeId: string;
  taxYear: number;
  projectionDate: Date;

  // Income Projections
  projectedGrossIncome: number;
  projectedDeductions: number;
  projectedTaxableIncome: number;

  // Tax Liability Projections
  homeCountryTaxLiability: number;
  hostCountryTaxLiability: number;
  totalTaxLiability: number;

  // Equalization Impact
  hypotheticalTax: number;
  actualTax: number;
  taxEqualizationAdjustment: number;
  employeeNetImpact: number;
  companyNetCost: number;

  // Currency
  currency: string;

  // Assumptions
  assumptions: string[];
  confidenceLevel: 'low' | 'medium' | 'high';

  // Scenarios
  scenarios: TaxScenario[];
}

export interface TaxScenario {
  scenarioId: string;
  scenarioName: string;
  description: string;
  assumptions: string[];
  projectedTaxLiability: number;
  variance: number; // from base projection
  probability: number; // percentage
}

// ============================================================================
// Global Mobility Analytics
// ============================================================================

export interface MobilityAnalytics {
  period: 'monthly' | 'quarterly' | 'yearly';
  periodStart: Date;
  periodEnd: Date;

  // Visa & Immigration
  visaMetrics: {
    totalApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    pendingApplications: number;
    approvalRate: number; // percentage
    averageProcessingTime: number; // days
    totalCost: number;
    currency: string;
  };

  // Relocation
  relocationMetrics: {
    totalRelocations: number;
    domesticRelocations: number;
    internationalRelocations: number;
    activeRelocations: number;
    completedRelocations: number;
    averageCost: number;
    totalCost: number;
    employeeSatisfaction: number; // 1-5
    currency: string;
  };

  // Tax
  taxMetrics: {
    totalExpatProfiles: number;
    taxReturnsToFile: number;
    taxReturnsFiled: number;
    taxReturnsOverdue: number;
    totalTaxLiability: number;
    totalEqualizationCost: number;
    currency: string;
  };

  // Global Assignments
  assignmentMetrics: {
    totalAssignments: number;
    shortTermAssignments: number;
    longTermAssignments: number;
    permanentAssignments: number;
    topDestinations: { country: string; count: number }[];
    topOrigins: { country: string; count: number }[];
  };
}

// ============================================================================
// Global Mobility Settings
// ============================================================================

export interface MobilitySettings {
  settingsId: string;

  // Visa & Immigration Settings
  visaSettings: {
    enabled: boolean;
    autoNotifications: boolean;
    expiryReminderDays: number;
    requireLegalReview: boolean;
    defaultProcessingTime: number; // days
  };

  // Relocation Settings
  relocationSettings: {
    enabled: boolean;
    defaultPolicyTier: 'standard' | 'enhanced' | 'premium' | 'executive';
    requireBudgetApproval: boolean;
    budgetApprovalThreshold: number;
    employeeFeedbackRequired: boolean;
    vendorRatingRequired: boolean;
  };

  // Tax Settings
  taxSettings: {
    enabled: boolean;
    taxEqualizationEnabled: boolean;
    defaultTaxEqualizationType: 'gross_up' | 'tax_protection' | 'laissez_faire';
    requireAdvisorReview: boolean;
    filingReminderDays: number;
    autoCalculateProjections: boolean;
  };

  // Notification Settings
  notificationSettings: {
    notifyOnVisaApproval: boolean;
    notifyOnVisaRejection: boolean;
    notifyOnDocumentExpiry: boolean;
    notifyOnTaskDue: boolean;
    notifyOnBudgetExceeded: boolean;
    notifyOnTaxDeadline: boolean;
    digestFrequency: 'daily' | 'weekly' | 'monthly';
  };

  // Compliance Settings
  complianceSettings: {
    autoComplianceCheck: boolean;
    complianceReviewFrequency: number; // days
    escalateHighRiskIssues: boolean;
    escalationRecipients: string[];
  };

  audit: AuditInfo;
}
