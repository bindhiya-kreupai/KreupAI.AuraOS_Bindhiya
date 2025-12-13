export type GradeLevel = 'GS-1' | 'GS-2' | 'GS-3' | 'GS-4' | 'GS-5' | 'GS-6' | 'GS-7' | 'GS-8' | 'GS-9' | 'GS-10' | 'GS-11' | 'GS-12' | 'GS-13' | 'GS-14' | 'GS-15' | 'SES';
export type ClearanceLevel = 'public_trust' | 'confidential' | 'secret' | 'top_secret' | 'top_secret_sci';
export type ClearanceStatus = 'pending' | 'active' | 'suspended' | 'revoked' | 'expired';
export type PensionType = 'fers' | 'csrs' | 'hybrid';
export type VestingStatus = 'not_vested' | 'partially_vested' | 'fully_vested';

export interface CivilServiceGrade {
  gradeId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  gradeLevel: GradeLevel;
  step: number;
  series: string;
  effectiveDate: string;
  salaryInformation: SalaryInformation;
  promotionEligibility: PromotionEligibility;
  performanceHistory: PerformanceRecord[];
  qualifications: Qualification[];
  status: 'active' | 'on_leave' | 'retired' | 'separated';
  createdAt: string;
  updatedAt?: string;
}

export interface SalaryInformation {
  annualBaseSalary: number;
  locality: string;
  localityPayPercentage: number;
  totalAnnualSalary: number;
  hourlyRate: number;
  overtimeRate: number;
  nightDifferential: number;
}

export interface PromotionEligibility {
  eligible: boolean;
  minimumTimeInGrade: number;
  timeInCurrentGrade: number;
  nextEligibleDate: string;
  targetGrade: GradeLevel;
  requiredQualifications: string[];
  competingService: boolean;
}

export interface PerformanceRecord {
  recordId: string;
  ratingPeriod: {
    startDate: string;
    endDate: string;
  };
  overallRating: 'unacceptable' | 'minimally_satisfactory' | 'fully_successful' | 'excellent' | 'outstanding';
  criticalElements: CriticalElement[];
  performanceSummary: string;
  supervisorId: string;
  supervisorName: string;
  reviewDate: string;
}

export interface CriticalElement {
  elementId: string;
  elementName: string;
  description: string;
  rating: 'unacceptable' | 'minimally_satisfactory' | 'fully_successful' | 'excellent' | 'outstanding';
  weight: number;
  comments: string;
}

export interface Qualification {
  qualificationId: string;
  qualificationType: 'education' | 'experience' | 'certification' | 'training';
  title: string;
  description: string;
  institution?: string;
  completionDate: string;
  expiryDate?: string;
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
}

export interface GradeStructure {
  gradeLevel: GradeLevel;
  title: string;
  minimumEducation: string;
  minimumExperience: number;
  responsibilities: string[];
  steps: GradeStep[];
  typicalPositions: string[];
}

export interface GradeStep {
  step: number;
  baseSalary: number;
  timeToNextStep: number;
  requirements: string[];
}

export interface SecurityClearance {
  clearanceId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  clearanceLevel: ClearanceLevel;
  status: ClearanceStatus;
  grantedDate: string;
  expiryDate: string;
  investigationType: InvestigationType;
  investigationDetails: InvestigationDetails;
  polygraphRequired: boolean;
  polygraphStatus?: PolygraphStatus;
  continuousEvaluation: ContinuousEvaluation;
  accessAuthorizations: AccessAuthorization[];
  suspensionHistory: SuspensionRecord[];
  debriefRequired: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InvestigationType {
  typeCode: string;
  typeName: string;
  scope: 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4' | 'tier_5';
  investigationDepth: number;
  periodicReinvestigation: number;
}

export interface InvestigationDetails {
  investigationId: string;
  initiatedDate: string;
  completedDate?: string;
  investigatingAgency: string;
  investigator: string;
  subjectInterviews: InterviewRecord[];
  referenceInterviews: InterviewRecord[];
  employmentVerification: EmploymentVerification[];
  educationVerification: EducationVerification[];
  criminalHistory: CriminalHistoryCheck;
  creditCheck: CreditCheck;
  foreignContacts: ForeignContact[];
  findings: InvestigationFinding[];
  adjudicationDate?: string;
  adjudicator?: string;
  adjudicationDecision?: 'approved' | 'denied' | 'pending_additional_info';
}

export interface InterviewRecord {
  interviewId: string;
  interviewDate: string;
  interviewee: string;
  relationship: string;
  interviewer: string;
  location: string;
  duration: number;
  summary: string;
  concerns?: string[];
}

export interface EmploymentVerification {
  employer: string;
  position: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  verified: boolean;
  verificationDate: string;
  discrepancies?: string;
}

export interface EducationVerification {
  institution: string;
  degree: string;
  major: string;
  graduationDate: string;
  verified: boolean;
  verificationDate: string;
  discrepancies?: string;
}

export interface CriminalHistoryCheck {
  checkDate: string;
  fbiCheckCompleted: boolean;
  localCheckCompleted: boolean;
  internationalCheckCompleted: boolean;
  recordsFound: boolean;
  records?: CriminalRecord[];
}

export interface CriminalRecord {
  recordId: string;
  jurisdiction: string;
  offense: string;
  date: string;
  disposition: string;
  impact: 'none' | 'minor' | 'moderate' | 'major';
}

export interface CreditCheck {
  checkDate: string;
  creditScore: number;
  debtToIncomeRatio: number;
  bankruptcies: number;
  latePayments: number;
  collections: number;
  concernsIdentified: boolean;
  concerns?: string[];
}

export interface ForeignContact {
  contactId: string;
  contactName: string;
  relationship: string;
  country: string;
  frequency: 'rare' | 'occasional' | 'regular' | 'frequent';
  nature: string;
  lastContactDate: string;
  securityConcern: boolean;
  mitigation?: string;
}

export interface InvestigationFinding {
  findingId: string;
  category: 'personal_conduct' | 'foreign_influence' | 'financial' | 'substance_abuse' | 'criminal_conduct' | 'security_violations';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  mitigatingFactors: string[];
  recommendation: string;
}

export interface PolygraphStatus {
  examDate: string;
  examiner: string;
  examType: 'counterintelligence' | 'lifestyle' | 'full_scope';
  result: 'pass' | 'fail' | 'inconclusive' | 'no_deception_indicated' | 'deception_indicated';
  issues?: string[];
  retestRequired: boolean;
}

export interface ContinuousEvaluation {
  enrolled: boolean;
  enrollmentDate?: string;
  lastReview: string;
  nextReview: string;
  alerts: CEAlert[];
  status: 'clear' | 'review_required' | 'action_required';
}

export interface CEAlert {
  alertId: string;
  alertDate: string;
  alertType: 'financial' | 'legal' | 'travel' | 'foreign_contact' | 'behavioral';
  description: string;
  severity: 'low' | 'medium' | 'high';
  reviewed: boolean;
  reviewedBy?: string;
  reviewDate?: string;
  action?: string;
}

export interface AccessAuthorization {
  authorizationId: string;
  program: string;
  facility: string;
  compartment?: string;
  grantedDate: string;
  expiryDate?: string;
  accessLevel: string;
  restrictions?: string[];
  status: 'active' | 'suspended' | 'revoked';
}

export interface SuspensionRecord {
  suspensionId: string;
  suspensionDate: string;
  reason: string;
  suspendedBy: string;
  reinstatedDate?: string;
  reinstatedBy?: string;
  permanentRevocation: boolean;
}

export interface PensionScheme {
  pensionId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  pensionType: PensionType;
  enrollmentDate: string;
  serviceComputationDate: string;
  yearsOfService: number;
  vestingStatus: VestingStatus;
  retirementEligibility: RetirementEligibility;
  contributions: ContributionSummary;
  projections: RetirementProjection;
  beneficiaries: Beneficiary[];
  thriftSavingsPlan: TSPAccount;
  status: 'active' | 'deferred' | 'retired' | 'disability';
  createdAt: string;
  updatedAt?: string;
}

export interface RetirementEligibility {
  immediateRetirement: boolean;
  earlyRetirement: boolean;
  deferredRetirement: boolean;
  disabilityRetirement: boolean;
  eligibilityDetails: {
    minimumRetirementAge: number;
    currentAge: number;
    yearsOfServiceRequired: number;
    currentYearsOfService: number;
    eligibleDate: string;
  };
  specialProvisions?: string[];
}

export interface ContributionSummary {
  employeeContributions: number;
  employerContributions: number;
  totalContributions: number;
  contributionRate: number;
  yearToDateContributions: number;
  lifetimeContributions: number;
  contributionHistory: ContributionRecord[];
}

export interface ContributionRecord {
  recordId: string;
  year: number;
  period: string;
  employeeAmount: number;
  employerAmount: number;
  totalAmount: number;
  salary: number;
}

export interface RetirementProjection {
  projectionDate: string;
  retirementDate: string;
  projectedAge: number;
  projectedYearsOfService: number;
  highThreeAverage: number;
  monthlyAnnuity: number;
  annualAnnuity: number;
  colaAdjustments: boolean;
  survivorBenefitSelected: boolean;
  survivorBenefitReduction?: number;
  healthBenefitsContinuation: boolean;
  projectionAssumptions: {
    annualSalaryIncrease: number;
    inflationRate: number;
    yearsToRetirement: number;
  };
}

export interface Beneficiary {
  beneficiaryId: string;
  beneficiaryType: 'primary' | 'contingent';
  name: string;
  relationship: string;
  dateOfBirth: string;
  ssn: string;
  percentage: number;
  address: string;
  contactInfo: string;
  designation: 'survivor_annuity' | 'life_insurance' | 'tsp' | 'all';
}

export interface TSPAccount {
  accountNumber: string;
  enrollmentDate: string;
  contributionPercentage: number;
  agencyMatching: number;
  currentBalance: number;
  vested: boolean;
  vestingDate?: string;
  allocation: FundAllocation[];
  loanBalance: number;
  loansOutstanding: TSPLoan[];
  projectedBalance: number;
}

export interface FundAllocation {
  fundCode: string;
  fundName: string;
  allocationPercentage: number;
  currentValue: number;
  returnYTD: number;
  returnLifetime: number;
}

export interface TSPLoan {
  loanId: string;
  loanType: 'general_purpose' | 'residential';
  loanDate: string;
  loanAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment: number;
  payoffDate: string;
  status: 'active' | 'paid_off' | 'defaulted';
}

export interface GovernmentSettings {
  settingsId: string;
  organizationId: string;
  gradeSettings: {
    promotionCycleMonths: number;
    performanceRatingRequired: boolean;
    timeInGradeMinimum: number;
    localityPayEnabled: boolean;
  };
  clearanceSettings: {
    reinvestigationPeriod: number;
    continuousEvaluationEnabled: boolean;
    polygraphFrequency: number;
    debriefingRequired: boolean;
  };
  pensionSettings: {
    defaultPensionType: PensionType;
    employeeContributionRate: number;
    agencyMatchPercentage: number;
    vestingYears: number;
  };
  notifications: {
    clearanceExpiring: boolean;
    promotionEligible: boolean;
    retirementEligible: boolean;
    performanceReviewDue: boolean;
  };
  updatedAt: string;
}

export interface GovernmentAlert {
  alertId: string;
  alertType: 'clearance' | 'grade' | 'pension' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  relatedEntity: {
    entityType: 'employee' | 'clearance' | 'grade' | 'pension';
    entityId: string;
    entityName: string;
  };
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}
