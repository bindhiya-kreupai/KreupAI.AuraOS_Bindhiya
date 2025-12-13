/**
 * Education Module Type Definitions
 * Covers: Faculty Tenure, Research Grants, Adjunct Management
 */

// ============================================================================
// 1. FACULTY TENURE
// ============================================================================

export interface FacultyMember {
  facultyId: string;
  employeeId: string;
  facultyName: string;
  email: string;
  department: string;
  college?: string;
  rank: FacultyRank;
  tenureStatus: TenureStatus;
  appointmentType: AppointmentType;
  hireDate: string;
  tenureEligibilityDate?: string;
  tenureApplicationDate?: string;
  tenureDecisionDate?: string;
  tenureReviewDate?: string;
  teachingLoad: TeachingLoad;
  researchActivities: ResearchActivity[];
  publications: Publication[];
  serviceActivities: ServiceActivity[];
  evaluations: FacultyEvaluation[];
  awards: FacultyAward[];
  status: 'active' | 'on_leave' | 'sabbatical' | 'retired' | 'emeritus';
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export type FacultyRank =
  | 'instructor'
  | 'assistant_professor'
  | 'associate_professor'
  | 'professor'
  | 'distinguished_professor'
  | 'emeritus';

export type TenureStatus =
  | 'not_eligible'
  | 'tenure_track'
  | 'under_review'
  | 'tenured'
  | 'denied'
  | 'non_tenure_track';

export type AppointmentType =
  | 'tenure_track'
  | 'tenured'
  | 'clinical'
  | 'research'
  | 'visiting'
  | 'adjunct'
  | 'lecturer';

export interface TeachingLoad {
  currentSemester: SemesterLoad;
  annualLoad: number; // credit hours
  courseHistory: CourseAssignment[];
  studentEvaluationAverage: number;
}

export interface SemesterLoad {
  semester: string;
  year: number;
  courses: CourseAssignment[];
  totalCredits: number;
  studentCount: number;
}

export interface CourseAssignment {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  enrollmentCount: number;
  semester: string;
  year: number;
  role: 'primary_instructor' | 'co_instructor' | 'teaching_assistant';
}

export interface ResearchActivity {
  activityId: string;
  activityType: 'publication' | 'grant' | 'presentation' | 'patent' | 'collaboration';
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  role: 'principal' | 'co_investigator' | 'collaborator';
  funding?: number;
  fundingSource?: string;
  status: 'active' | 'completed' | 'under_review' | 'published';
}

export interface Publication {
  publicationId: string;
  publicationType: PublicationType;
  title: string;
  authors: string[];
  authorOrder: number; // faculty member's position in author list
  venue: string; // journal, conference, book publisher
  publicationDate: string;
  doi?: string;
  isbn?: string;
  citations?: number;
  impactFactor?: number;
  peerReviewed: boolean;
  status: 'published' | 'accepted' | 'under_review' | 'in_progress';
}

export type PublicationType =
  | 'journal_article'
  | 'conference_paper'
  | 'book'
  | 'book_chapter'
  | 'technical_report'
  | 'white_paper';

export interface ServiceActivity {
  serviceId: string;
  serviceType: 'committee' | 'advising' | 'administration' | 'community' | 'professional';
  title: string;
  description: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  timeCommitment?: string; // e.g., "5 hours per week"
  level: 'departmental' | 'college' | 'university' | 'professional' | 'community';
  status: 'active' | 'completed';
}

export interface FacultyEvaluation {
  evaluationId: string;
  evaluationType: 'annual' | 'mid_tenure' | 'tenure' | 'promotion' | 'post_tenure';
  evaluationDate: string;
  academicYear: string;
  evaluator: string;
  evaluatorRole: 'department_chair' | 'dean' | 'provost' | 'external_reviewer' | 'peer';
  areas: EvaluationArea[];
  overallRating: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  decisionRecommendation?: 'approve' | 'deny' | 'defer';
  comments?: string;
  confidential: boolean;
}

export interface EvaluationArea {
  area: 'teaching' | 'research' | 'service' | 'professional_development';
  rating: number; // 1-5 scale
  evidence: string[];
  comments?: string;
}

export interface FacultyAward {
  awardId: string;
  awardName: string;
  awardingOrganization: string;
  awardDate: string;
  category: 'teaching' | 'research' | 'service' | 'lifetime_achievement';
  level: 'departmental' | 'college' | 'university' | 'national' | 'international';
  monetaryValue?: number;
  description?: string;
}

export interface TenureApplication {
  applicationId: string;
  facultyId: string;
  facultyName: string;
  department: string;
  currentRank: FacultyRank;
  requestedRank: FacultyRank;
  submissionDate: string;
  reviewDeadline: string;
  dossier: TenureDossier;
  reviewProcess: TenureReviewProcess;
  decision?: TenureDecision;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'denied' | 'deferred';
  createdAt: string;
  updatedAt?: string;
}

export interface TenureDossier {
  teachingPortfolio: {
    philosophy: string;
    syllabi: DocumentReference[];
    evaluations: number[];
    innovations: string[];
  };
  researchPortfolio: {
    statement: string;
    publications: string[]; // publication IDs
    grants: string[]; // grant IDs
    presentations: Presentation[];
    collaborations: string[];
  };
  servicePortfolio: {
    statement: string;
    activities: string[]; // service activity IDs
    leadership: string[];
    mentoring: MentoringRecord[];
  };
  supportingDocuments: DocumentReference[];
  externalReviewers: ExternalReviewer[];
}

export interface DocumentReference {
  documentId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

export interface Presentation {
  presentationId: string;
  title: string;
  venue: string;
  presentationType: 'keynote' | 'invited' | 'contributed' | 'poster';
  date: string;
  location: string;
}

export interface MentoringRecord {
  menteeType: 'undergraduate' | 'graduate' | 'postdoc' | 'junior_faculty';
  menteeName: string;
  startDate: string;
  endDate?: string;
  outcomes?: string[];
}

export interface ExternalReviewer {
  reviewerId: string;
  name: string;
  institution: string;
  rank: string;
  expertise: string[];
  conflictOfInterest: boolean;
  invitedDate: string;
  acceptedDate?: string;
  submittedDate?: string;
  letterReceived: boolean;
}

export interface TenureReviewProcess {
  stages: ReviewStage[];
  currentStage: string;
  timeline: ReviewTimeline[];
  committees: ReviewCommittee[];
  votes: CommitteeVote[];
}

export interface ReviewStage {
  stageId: string;
  stageName: string;
  order: number;
  startDate?: string;
  endDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  outcome?: 'favorable' | 'unfavorable' | 'mixed';
}

export interface ReviewTimeline {
  milestoneId: string;
  milestone: string;
  dueDate: string;
  completedDate?: string;
  responsible: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
}

export interface ReviewCommittee {
  committeeId: string;
  committeeName: string;
  committeeType: 'departmental' | 'college' | 'university' | 'external';
  chair: string;
  members: CommitteeMember[];
  reviewDate?: string;
  recommendation?: 'approve' | 'deny' | 'defer';
}

export interface CommitteeMember {
  memberId: string;
  name: string;
  role: string;
  department?: string;
}

export interface CommitteeVote {
  voteId: string;
  committeeId: string;
  voteDate: string;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  recommendation: 'approve' | 'deny' | 'defer';
  summary?: string;
}

export interface TenureDecision {
  decisionId: string;
  finalDecision: 'approved' | 'denied' | 'deferred';
  decisionMaker: string;
  decisionMakerTitle: string;
  decisionDate: string;
  effectiveDate?: string;
  rationale: string;
  conditions?: string[];
  appealDeadline?: string;
  notificationSent: boolean;
}

// ============================================================================
// 2. RESEARCH GRANTS
// ============================================================================

export interface ResearchGrant {
  grantId: string;
  grantNumber: string;
  grantTitle: string;
  grantType: GrantType;
  fundingAgency: FundingAgency;
  principalInvestigator: Investigator;
  coInvestigators: Investigator[];
  department: string;
  college?: string;
  submissionDate: string;
  startDate?: string;
  endDate?: string;
  duration: number; // in months
  requestedAmount: number;
  awardedAmount?: number;
  indirectCosts: number;
  directCosts: number;
  budget: GrantBudget;
  status: GrantStatus;
  reviewStatus?: ReviewStatus;
  compliance: ComplianceRequirements;
  milestones: GrantMilestone[];
  deliverables: Deliverable[];
  financials: GrantFinancials;
  reports: GrantReport[];
  publications: string[]; // publication IDs
  personnel: GrantPersonnel[];
  equipment: GrantEquipment[];
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export type GrantType =
  | 'federal'
  | 'state'
  | 'foundation'
  | 'corporate'
  | 'internal'
  | 'international';

export interface FundingAgency {
  agencyId: string;
  agencyName: string;
  agencyType: GrantType;
  programName?: string;
  programOfficer?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Investigator {
  facultyId: string;
  name: string;
  email: string;
  department: string;
  role: 'pi' | 'co_pi' | 'senior_personnel' | 'consultant';
  effortPercentage: number;
  responsibilities: string[];
}

export type GrantStatus =
  | 'draft'
  | 'in_preparation'
  | 'submitted'
  | 'under_review'
  | 'awarded'
  | 'declined'
  | 'active'
  | 'completed'
  | 'closed';

export type ReviewStatus =
  | 'pending_review'
  | 'in_review'
  | 'reviewed'
  | 'revise_and_resubmit'
  | 'approved'
  | 'rejected';

export interface GrantBudget {
  totalBudget: number;
  directCosts: BudgetCategory[];
  indirectCosts: IndirectCosts;
  costSharing?: CostSharing;
  budgetJustification: string;
}

export interface BudgetCategory {
  category: 'personnel' | 'equipment' | 'travel' | 'materials' | 'other';
  description: string;
  requestedAmount: number;
  awardedAmount?: number;
  spent: number;
  remaining: number;
  items: BudgetLineItem[];
}

export interface BudgetLineItem {
  itemId: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  fiscalYear: number;
}

export interface IndirectCosts {
  rate: number; // percentage
  base: number;
  total: number;
  rationale: string;
}

export interface CostSharing {
  required: boolean;
  committedAmount: number;
  source: string[];
  type: 'cash' | 'in_kind' | 'both';
}

export interface ComplianceRequirements {
  irbRequired: boolean;
  irbApprovalNumber?: string;
  irbApprovalDate?: string;
  iacucRequired: boolean;
  iacucApprovalNumber?: string;
  environmentalReview: boolean;
  humanSubjects: boolean;
  animalSubjects: boolean;
  biosafetyLevel?: number;
  exportControl: boolean;
  dataManagementPlan: boolean;
  conflictOfInterest: ConflictOfInterest[];
}

export interface ConflictOfInterest {
  investigatorId: string;
  investigatorName: string;
  conflictType: 'financial' | 'personal' | 'professional' | 'institutional';
  description: string;
  mitigationPlan: string;
  disclosedDate: string;
  reviewedBy?: string;
  approved: boolean;
}

export interface GrantMilestone {
  milestoneId: string;
  milestoneName: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  delayReason?: string;
  evidence?: DocumentReference[];
}

export interface Deliverable {
  deliverableId: string;
  deliverableType: 'report' | 'publication' | 'prototype' | 'dataset' | 'software' | 'other';
  title: string;
  description: string;
  dueDate: string;
  submittedDate?: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'overdue';
  documentUrl?: string;
}

export interface GrantFinancials {
  accountNumber: string;
  totalAwarded: number;
  totalExpended: number;
  totalCommitted: number;
  availableBalance: number;
  expenditures: Expenditure[];
  invoices: Invoice[];
  reimbursements: Reimbursement[];
}

export interface Expenditure {
  expenditureId: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  vendor?: string;
  approvedBy: string;
  fiscalYear: number;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  vendor: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidDate?: string;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
}

export interface Reimbursement {
  reimbursementId: string;
  employeeId: string;
  employeeName: string;
  expenseType: string;
  expenseDate: string;
  amount: number;
  requestDate: string;
  approvalDate?: string;
  paidDate?: string;
  status: 'submitted' | 'approved' | 'rejected' | 'paid';
  receipts: DocumentReference[];
}

export interface GrantReport {
  reportId: string;
  reportType: 'progress' | 'financial' | 'final' | 'annual' | 'quarterly';
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  dueDate: string;
  submittedDate?: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'revision_requested' | 'overdue';
  accomplishments: string[];
  challenges: string[];
  nextSteps: string[];
  financialSummary?: {
    expenditures: number;
    budgetBalance: number;
    variance: number;
  };
  documentUrl?: string;
  reviewedBy?: string;
  reviewDate?: string;
  comments?: string[];
}

export interface GrantPersonnel {
  personnelId: string;
  employeeId: string;
  name: string;
  role: string;
  effortPercentage: number;
  salary: number;
  benefits: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed';
}

export interface GrantEquipment {
  equipmentId: string;
  equipmentName: string;
  description: string;
  vendor: string;
  cost: number;
  purchaseDate?: string;
  serialNumber?: string;
  location: string;
  custodian: string;
  status: 'planned' | 'ordered' | 'received' | 'operational' | 'decommissioned';
}

// ============================================================================
// 3. ADJUNCT MANAGEMENT
// ============================================================================

export interface AdjunctFaculty {
  adjunctId: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  expertise: string[];
  qualifications: Qualification[];
  employmentStatus: AdjunctStatus;
  contractType: ContractType;
  contracts: AdjunctContract[];
  courseHistory: CourseAssignment[];
  availability: Availability;
  compensation: AdjunctCompensation;
  evaluations: number[];
  onboardingStatus: OnboardingStatus;
  professionalDevelopment: ProfessionalDevelopment[];
  status: 'active' | 'inactive' | 'on_hold';
  createdAt: string;
  updatedAt?: string;
}

export type AdjunctStatus =
  | 'new'
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'terminated'
  | 'retired';

export type ContractType =
  | 'per_course'
  | 'semester'
  | 'annual'
  | 'visiting'
  | 'temporary';

export interface Qualification {
  qualificationId: string;
  qualificationType: 'degree' | 'certification' | 'experience' | 'publication';
  title: string;
  institution?: string;
  year?: string;
  field?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
  documentUrl?: string;
}

export interface AdjunctContract {
  contractId: string;
  contractNumber: string;
  contractType: ContractType;
  academicYear: string;
  semester?: string;
  startDate: string;
  endDate: string;
  courses: ContractCourse[];
  totalCompensation: number;
  paymentSchedule: PaymentSchedule;
  terms: ContractTerms;
  status: 'draft' | 'pending_approval' | 'active' | 'completed' | 'cancelled';
  signedDate?: string;
  signedBy?: string;
  approvedBy?: string;
  approvalDate?: string;
  createdAt: string;
}

export interface ContractCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  expectedEnrollment: number;
  actualEnrollment?: number;
  schedule: CourseSchedule;
  location: string;
  compensation: number;
}

export interface CourseSchedule {
  days: string[]; // ['Monday', 'Wednesday', 'Friday']
  startTime: string;
  endTime: string;
  format: 'in_person' | 'online' | 'hybrid';
}

export interface PaymentSchedule {
  totalAmount: number;
  installments: PaymentInstallment[];
  paymentMethod: 'direct_deposit' | 'check' | 'wire_transfer';
}

export interface PaymentInstallment {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'processed' | 'paid' | 'overdue';
}

export interface ContractTerms {
  teachingResponsibilities: string[];
  officeHours: string;
  assessmentRequirements: string[];
  professionalConduct: string[];
  termination: {
    noticePeriod: number; // days
    conditions: string[];
  };
  benefits?: AdjunctBenefits;
}

export interface AdjunctBenefits {
  libraryAccess: boolean;
  parkingPermit: boolean;
  facultyEmail: boolean;
  professionalDevelopment: boolean;
  healthInsurance: boolean;
  retirementContribution: boolean;
  tuitionWaiver?: {
    eligible: boolean;
    percentage?: number;
    maxCourses?: number;
  };
}

export interface Availability {
  preferredDays: string[];
  preferredTimes: TimeSlot[];
  maxCourses: number;
  maxCredits: number;
  willingToTeachOnline: boolean;
  campusPreferences: string[];
  blackoutDates?: DateRange[];
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface AdjunctCompensation {
  rateType: 'per_course' | 'per_credit' | 'hourly' | 'salary';
  baseRate: number;
  bonuses: CompensationBonus[];
  totalEarnings: number;
  fiscalYear: number;
}

export interface CompensationBonus {
  bonusType: 'enrollment' | 'performance' | 'course_development' | 'other';
  amount: number;
  reason: string;
  date: string;
}

export interface OnboardingStatus {
  applicationSubmitted: boolean;
  applicationDate?: string;
  backgroundCheckCompleted: boolean;
  credentialsVerified: boolean;
  orientationCompleted: boolean;
  orientationDate?: string;
  technologyTrainingCompleted: boolean;
  lmsAccessGranted: boolean;
  facultyIdIssued: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
  completionDate?: string;
}

export interface ProfessionalDevelopment {
  developmentId: string;
  activityType: 'workshop' | 'conference' | 'certification' | 'course' | 'seminar';
  title: string;
  provider: string;
  completionDate: string;
  certificateUrl?: string;
  hoursEarned: number;
  relevantToTeaching: boolean;
}

export interface AdjunctPool {
  poolId: string;
  department: string;
  activeAdjuncts: number;
  availableAdjuncts: number;
  requiredCompetencies: string[];
  shortageAreas: string[];
  recruitmentNeeds: RecruitmentNeed[];
  averageHourlyRate: number;
  budgetAllocated: number;
  budgetUsed: number;
}

export interface RecruitmentNeed {
  needId: string;
  subject: string;
  requiredCredentials: string[];
  estimatedCourses: number;
  semester: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'filled' | 'cancelled';
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface EducationSettings {
  tenureSettings: {
    probationaryPeriod: number; // years
    tenureReviewTimeline: number; // months before decision
    externalReviewersRequired: number;
    publicationMinimum?: number;
    teachingEvaluationMinimum?: number;
  };
  grantSettings: {
    indirectCostRate: number; // percentage
    costSharingRequired: boolean;
    reportingFrequency: 'quarterly' | 'semiannual' | 'annual';
    approvalLevels: ApprovalLevel[];
  };
  adjunctSettings: {
    maxCoursesPerSemester: number;
    minQualifications: string[];
    defaultCompensationRate: number;
    backgroundCheckRequired: boolean;
    orientationRequired: boolean;
    contractRenewalNoticeDays: number;
  };
}

export interface ApprovalLevel {
  threshold: number;
  approver: string;
  required: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
