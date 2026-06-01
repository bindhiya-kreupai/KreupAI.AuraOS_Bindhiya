// Offboarding Module Types
// Complete type system for employee offboarding and exit management

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type OffboardingType =
  | 'resignation'
  | 'termination'
  | 'retirement'
  | 'contract_end'
  | 'redundancy'
  | 'mutual_agreement'
  | 'end_of_probation';

export type OffboardingStatus =
  | 'initiated'
  | 'in_progress'
  | 'pending_approval'
  | 'approved'
  | 'completed'
  | 'cancelled';

export type ExitPhase =
  | 'notice_period'
  | 'knowledge_transfer'
  | 'handover'
  | 'exit_formalities'
  | 'final_settlement'
  | 'post_exit';

export type ResignationStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'counter_offered'
  | 'withdrawn'
  | 'rejected';

export type ClearanceStatus = 'pending' | 'cleared' | 'issues' | 'waived';

export type ExitInterviewStatus = 'scheduled' | 'completed' | 'skipped' | 'no_show';

export type EquipmentReturnStatus = 'pending' | 'returned' | 'damaged' | 'lost' | 'waived';

export type AccessRevocationStatus = 'pending' | 'revoked' | 'failed' | 'not_applicable';

export type KnowledgeTransferStatus = 'not_started' | 'in_progress' | 'completed' | 'partial';

export type AlumniStatus = 'active' | 'inactive' | 'opted_out';

export type RehireEligibility = 'eligible' | 'not_eligible' | 'restricted' | 'under_review';

// ============================================================================
// RESIGNATION & EXIT REQUEST
// ============================================================================

export interface ResignationLetter {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionTitle: string;
  managerId: string;
  managerName: string;
  submittedDate: string;
  lastWorkingDate: string;
  noticePeriodDays: number;
  resignationType: OffboardingType;
  reason: string;
  reasonCategory?: 'better_opportunity' | 'career_growth' | 'compensation' | 'work_life_balance' | 'relocation' | 'personal' | 'health' | 'education' | 'retirement' | 'other';
  detailedReason?: string;
  newEmployer?: string;
  status: ResignationStatus;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewComments?: string;
  counterOfferMade?: boolean;
  counterOfferDetails?: string;
  counterOfferResponse?: 'accepted' | 'declined' | 'considering';
  acceptedBy?: string;
  acceptedDate?: string;
  withdrawnDate?: string;
  withdrawalReason?: string;
  attachments?: string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface TerminationNotice {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionTitle: string;
  terminationType: OffboardingType;
  terminationDate: string;
  effectiveDate: string;
  noticePeriodDays: number;
  issuedBy: string;
  issuedDate: string;
  reason: string;
  reasonCategory: 'performance' | 'conduct' | 'redundancy' | 'business_closure' | 'policy_violation' | 'attendance' | 'contract_breach' | 'other';
  detailedJustification: string;
  severancePay?: number;
  severanceDetails?: string;
  legalReview?: boolean;
  legalReviewedBy?: string;
  legalReviewDate?: string;
  legalComments?: string;
  approvedBy: string;
  approvedDate: string;
  communicatedToEmployee: boolean;
  communicationDate?: string;
  employeeAcknowledgement?: boolean;
  acknowledgementDate?: string;
  appealAllowed: boolean;
  appealDeadline?: string;
  attachments?: string[];
  createdBy: string;
  createdDate: string;
}

// ============================================================================
// OFFBOARDING INSTANCE
// ============================================================================

export interface OffboardingInstance {
  id: string;
  offboardingCode: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionTitle: string;
  managerId: string;
  managerName: string;
  hrContactId: string;
  hrContactName: string;
  offboardingType: OffboardingType;
  initiatedDate: string;
  lastWorkingDate: string;
  noticePeriodDays: number;
  actualNoticePeriod?: number;
  status: OffboardingStatus;
  currentPhase: ExitPhase;
  progress: number;
  resignationId?: string;
  terminationId?: string;
  tasks: OffboardingTask[];
  completedTasks: number;
  totalTasks: number;
  overdueTasks: number;
  equipmentReturns: EquipmentReturn[];
  accessRevocations: AccessRevocation[];
  clearances: DepartmentClearance[];
  knowledgeTransfer?: KnowledgeTransfer;
  exitInterview?: ExitInterview;
  finalSettlement?: FinalSettlement;
  exitSurvey?: ExitSurvey;
  rehireEligibility: RehireEligibility;
  rehireNotes?: string;
  alumni?: AlumniRecord;
  notes?: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface OffboardingTask {
  id: string;
  taskName: string;
  description: string;
  assignedTo: 'employee' | 'manager' | 'hr' | 'it' | 'finance' | 'admin' | 'legal' | 'other';
  assignedRole: string;
  assignedPerson?: string;
  dueDate: string;
  phase: ExitPhase;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'not_applicable';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedHours?: number;
  actualHours?: number;
  isMandatory: boolean;
  completedDate?: string;
  completedBy?: string;
  notes?: string;
  dependencies?: string[];
}

// ============================================================================
// EQUIPMENT RETURN
// ============================================================================

export interface EquipmentReturn {
  id: string;
  offboardingId: string;
  equipmentId: string;
  equipmentType: string;
  equipmentName: string;
  serialNumber?: string;
  assetTag?: string;
  assignedDate: string;
  dueReturnDate: string;
  actualReturnDate?: string;
  status: EquipmentReturnStatus;
  condition?: 'good' | 'fair' | 'damaged' | 'lost';
  conditionNotes?: string;
  receivedBy?: string;
  damageCharge?: number;
  lostCharge?: number;
  chargeWaived?: boolean;
  waiverReason?: string;
  waivedBy?: string;
  location?: string;
  notes?: string;
}

// ============================================================================
// ACCESS REVOCATION
// ============================================================================

export interface AccessRevocation {
  id: string;
  offboardingId: string;
  accessId: string;
  accessType: string;
  systemName: string;
  accountId: string;
  grantedDate: string;
  scheduledRevocationDate: string;
  actualRevocationDate?: string;
  status: AccessRevocationStatus;
  revokedBy?: string;
  revocationMethod?: 'automated' | 'manual';
  verifiedBy?: string;
  verificationDate?: string;
  failureReason?: string;
  retryCount?: number;
  notes?: string;
}

// ============================================================================
// CLEARANCE
// ============================================================================

export interface DepartmentClearance {
  id: string;
  offboardingId: string;
  departmentId: string;
  departmentName: string;
  clearanceType: 'hr' | 'it' | 'finance' | 'admin' | 'security' | 'facilities' | 'library' | 'other';
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  status: ClearanceStatus;
  clearedDate?: string;
  clearedBy?: string;
  issues?: ClearanceIssue[];
  comments?: string;
  attachments?: string[];
}

export interface ClearanceIssue {
  issueType: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  amountDue?: number;
  resolvedDate?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

// ============================================================================
// KNOWLEDGE TRANSFER
// ============================================================================

export interface KnowledgeTransfer {
  id: string;
  offboardingId: string;
  employeeId: string;
  employeeName: string;
  successorId?: string;
  successorName?: string;
  managerId: string;
  managerName: string;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  status: KnowledgeTransferStatus;
  progress: number;
  sessions: KnowledgeTransferSession[];
  documentation: KnowledgeDocument[];
  handoverChecklist: HandoverItem[];
  completedItems: number;
  totalItems: number;
  notes?: string;
}

export interface KnowledgeTransferSession {
  id: string;
  sessionDate: string;
  duration: number;
  topics: string[];
  attendees: string[];
  keyPoints: string;
  actionItems?: string[];
  nextSessionDate?: string;
  completedBy: string;
}

export interface KnowledgeDocument {
  id: string;
  documentType: 'process_doc' | 'sop' | 'contact_list' | 'password_vault' | 'project_handover' | 'other';
  title: string;
  description: string;
  fileUrl?: string;
  createdDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  status: 'draft' | 'reviewed' | 'approved';
}

export interface HandoverItem {
  id: string;
  category: 'projects' | 'tasks' | 'responsibilities' | 'contacts' | 'access' | 'documents' | 'other';
  itemName: string;
  description: string;
  handoverTo?: string;
  handoverToName?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  completedDate?: string;
  notes?: string;
}

// ============================================================================
// EXIT INTERVIEW
// ============================================================================

export interface ExitInterview {
  id: string;
  offboardingId: string;
  employeeId: string;
  employeeName: string;
  scheduledDate: string;
  conductedDate?: string;
  conductedBy: string;
  conductedByName: string;
  interviewType: 'in_person' | 'virtual' | 'phone' | 'written';
  status: ExitInterviewStatus;
  duration?: number;
  questions: ExitInterviewQuestion[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
  wouldRecommend: boolean;
  recommendationScore?: number;
  openToRehire: boolean;
  keyTakeaways: string[];
  actionItems?: string[];
  confidential: boolean;
  recordingUrl?: string;
  transcriptUrl?: string;
  notes?: string;
}

export interface ExitInterviewQuestion {
  question: string;
  questionType: 'text' | 'rating' | 'multiple_choice' | 'yes_no';
  answer?: string;
  rating?: number;
  category: 'job_satisfaction' | 'management' | 'compensation' | 'culture' | 'growth' | 'work_life_balance' | 'other';
}

// ============================================================================
// EXIT SURVEY
// ============================================================================

export interface ExitSurvey {
  id: string;
  offboardingId: string;
  employeeId: string;
  employeeName: string;
  sentDate: string;
  completedDate?: string;
  status: 'sent' | 'completed' | 'expired' | 'declined';
  surveyType: 'standard' | 'detailed' | 'anonymous';
  isAnonymous: boolean;
  questions: ExitSurveyQuestion[];
  overallRating?: number;
  wouldReturn: boolean;
  wouldRecommend: boolean;
  npsScore?: number;
  comments?: string;
}

export interface ExitSurveyQuestion {
  questionId: string;
  question: string;
  questionType: 'rating' | 'text' | 'multiple_choice' | 'yes_no' | 'scale';
  category: string;
  answer?: string;
  rating?: number;
  choices?: string[];
  selectedChoices?: string[];
}

// ============================================================================
// FINAL SETTLEMENT
// ============================================================================

export interface FinalSettlement {
  id: string;
  offboardingId: string;
  employeeId: string;
  employeeName: string;
  employeeBankAccount: string;
  calculationDate: string;
  paymentDueDate: string;
  paymentDate?: string;
  status: 'pending_calculation' | 'calculated' | 'approved' | 'paid' | 'disputed';
  components: SettlementComponent[];
  earnings: SettlementEarning[];
  deductions: SettlementDeduction[];
  totalEarnings: number;
  totalDeductions: number;
  netPayable: number;
  paymentMethod: 'bank_transfer' | 'cheque' | 'cash' | 'other';
  paymentReference?: string;
  calculatedBy: string;
  approvedBy?: string;
  approvedDate?: string;
  paidBy?: string;
  notes?: string;
  attachments?: string[];
}

export interface SettlementComponent {
  componentType: string;
  description: string;
  amount: number;
  isEarning: boolean;
  isTaxable: boolean;
  category: string;
}

export interface SettlementEarning {
  earningType: 'salary' | 'bonus' | 'commission' | 'leave_encashment' | 'notice_pay' | 'gratuity' | 'severance' | 'other';
  description: string;
  amount: number;
  isTaxable: boolean;
  calculation?: string;
}

export interface SettlementDeduction {
  deductionType: 'tax' | 'loan_recovery' | 'advance_recovery' | 'equipment_damage' | 'notice_shortfall' | 'other';
  description: string;
  amount: number;
  calculation?: string;
}

// ============================================================================
// ALUMNI
// ============================================================================

export interface AlumniRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  personalEmail?: string;
  phoneNumber?: string;
  linkedInProfile?: string;
  departmentId: string;
  departmentName: string;
  lastPosition: string;
  joinDate: string;
  exitDate: string;
  tenure: number;
  exitReason: OffboardingType;
  status: AlumniStatus;
  optedInDate?: string;
  optedOutDate?: string;
  currentEmployer?: string;
  currentPosition?: string;
  currentLocation?: string;
  willingToMentor: boolean;
  willingToRefer: boolean;
  interestedInReturning: boolean;
  lastContactDate?: string;
  events: AlumniEvent[];
  notes?: string;
}

export interface AlumniEvent {
  eventType: 'newsletter' | 'reunion' | 'webinar' | 'networking' | 'contact' | 'referral' | 'other';
  eventDate: string;
  description: string;
  participated: boolean;
  notes?: string;
}

// ============================================================================
// ANALYTICS & METRICS
// ============================================================================

export interface OffboardingMetrics {
  totalOffboarding: number;
  activeOffboarding: number;
  completedOffboarding: number;
  averageCompletionTime: number;
  averageNoticePeriod: number;
  offboardingByType: OffboardingTypeMetric[];
  offboardingByDepartment: DepartmentMetric[];
  turnoverRate: number;
  voluntaryTurnover: number;
  involuntaryTurnover: number;
  retirementRate: number;
  avgTenure: number;
  topExitReasons: ExitReasonMetric[];
  rehireEligibilityStats: RehireStats;
  exitInterviewParticipation: number;
  exitSurveyResponse: number;
  averageExitRating: number;
  npsScore: number;
  equipmentReturnRate: number;
  clearanceCompletionRate: number;
  knowledgeTransferCompletionRate: number;
  alumniEngagementRate: number;
  costPerOffboarding: number;
  retentionRiskDepartments: string[];
}

export interface OffboardingTypeMetric {
  type: OffboardingType;
  count: number;
  percentage: number;
}

export interface DepartmentMetric {
  departmentId: string;
  departmentName: string;
  offboardingCount: number;
  turnoverRate: number;
  avgTenure: number;
}

export interface ExitReasonMetric {
  reason: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface RehireStats {
  eligible: number;
  notEligible: number;
  restricted: number;
  underReview: number;
}

// ============================================================================
// SETTINGS
// ============================================================================

export interface OffboardingSettings {
  defaultNoticePeriod: number;
  autoInitiateOffboarding: boolean;
  requireExitInterview: boolean;
  requireExitSurvey: boolean;
  exitSurveyAnonymous: boolean;
  exitSurveyExpiry: number;
  sendExitSurveyAfter: number;
  requireKnowledgeTransfer: boolean;
  knowledgeTransferDuration: number;
  autoRevokeAccessOnExit: boolean;
  accessRevocationLeadTime: number;
  autoCreateAlumniRecord: boolean;
  alumniOptInRequired: boolean;
  equipmentReturnReminder: number;
  clearanceReminderFrequency: 'daily' | 'weekly' | 'none';
  finalSettlementDays: number;
  allowCounterOffer: boolean;
  counterOfferApprovalRequired: boolean;
  notificationEmail: string;
  hrNotificationEmail: string;
  itNotificationEmail: string;
  financeNotificationEmail: string;
  customFields?: CustomField[];
}

export interface CustomField {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  isRequired: boolean;
  options?: string[];
  defaultValue?: string;
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
