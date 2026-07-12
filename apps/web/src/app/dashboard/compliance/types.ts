/**
 * Compliance Management Module Types
 * Comprehensive compliance tracking including labor law, POSH, grievances, disciplinary actions, and audits
 */

export type ComplianceStatus =
  | 'compliant'
  | 'non_compliant'
  | 'pending_review'
  | 'under_investigation'
  | 'resolved';
export type ComplianceType =
  | 'labor_law'
  | 'posh'
  | 'data_privacy'
  | 'tax'
  | 'safety'
  | 'environmental'
  | 'contract'
  | 'ethical';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type GrievanceStatus =
  | 'submitted'
  | 'acknowledged'
  | 'under_investigation'
  | 'resolved'
  | 'closed'
  | 'escalated'
  | 'rejected';
export type GrievanceCategory =
  | 'harassment'
  | 'discrimination'
  | 'workplace_safety'
  | 'compensation'
  | 'work_conditions'
  | 'policy_violation'
  | 'other';
export type DisciplinaryAction =
  | 'verbal_warning'
  | 'written_warning'
  | 'suspension'
  | 'demotion'
  | 'termination'
  | 'fine';
export type DisciplinaryStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'appealed'
  | 'completed'
  | 'overturned';
export type AuditType = 'internal' | 'external' | 'regulatory' | 'surprise' | 'follow_up';
export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'report_pending' | 'closed';
export type POSHComplaintStatus =
  | 'received'
  | 'under_investigation'
  | 'inquiry_committee_formed'
  | 'hearing_scheduled'
  | 'resolved'
  | 'closed'
  | 'appealed';
export type Jurisdiction = 'federal' | 'state' | 'local' | 'international';
export type UnionStatus = 'active' | 'inactive' | 'dissolved' | 'suspended';
export type ArbitrationStatus =
  | 'filed'
  | 'hearing_scheduled'
  | 'in_progress'
  | 'award_pending'
  | 'completed'
  | 'appealed';

// Labor Law Compliance
export interface LaborLaw {
  id: string;
  lawCode: string;
  lawName: string;
  description: string;
  jurisdiction: Jurisdiction;
  category: string;
  effectiveDate: string;
  lastAmendmentDate?: string;
  applicability: LawApplicability;
  requirements: LawRequirement[];
  penalties: LawPenalty[];
  complianceFrequency: 'one_time' | 'monthly' | 'quarterly' | 'annual' | 'ongoing';
  responsibleDepartment: string;
  responsiblePerson: string;
  responsiblePersonName: string;
  documentationRequired: string[];
  isActive: boolean;
  source: string;
  referenceUrl?: string;
  createdDate: string;
  lastModified: string;
}

export interface LawApplicability {
  companySize?: 'small' | 'medium' | 'large' | 'all';
  industries?: string[];
  locations?: string[];
  employeeTypes?: string[];
}

export interface LawRequirement {
  id: string;
  requirementDescription: string;
  dueDate?: string;
  isRecurring: boolean;
  frequency?: string;
  status: ComplianceStatus;
  evidenceRequired: string[];
  lastComplianceDate?: string;
  nextComplianceDate?: string;
}

export interface LawPenalty {
  violationType: string;
  penaltyDescription: string;
  monetaryPenalty?: {
    minAmount: number;
    maxAmount: number;
    currency: string;
  };
  nonMonetaryPenalty?: string;
}

export interface ComplianceRecord {
  id: string;
  recordCode: string;
  lawId: string;
  lawName: string;
  complianceType: ComplianceType;
  requirementId?: string;
  requirementDescription: string;
  dueDate: string;
  completedDate?: string;
  status: ComplianceStatus;
  evidenceDocuments: ComplianceDocument[];
  responsiblePerson: string;
  responsiblePersonName: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedDate?: string;
  findings?: string;
  correctiveActions?: CorrectiveAction[];
  auditTrail: ComplianceAuditLog[];
  notes?: string;
  createdDate: string;
  lastModified: string;
}

export interface ComplianceDocument {
  id: string;
  documentName: string;
  documentType: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedDate: string;
  expiryDate?: string;
}

export interface CorrectiveAction {
  id: string;
  actionDescription: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  verificationRequired: boolean;
  notes?: string;
}

// POSH (Prevention of Sexual Harassment)
export interface POSHComplaint {
  id: string;
  complaintCode: string;
  complaintDate: string;
  complainantId?: string;
  complainantName?: string;
  isAnonymous: boolean;
  complainantEmail?: string;
  complainantPhone?: string;
  respondentId?: string;
  respondentName: string;
  respondentDepartment?: string;
  incidentDate: string;
  incidentLocation: string;
  incidentDescription: string;
  witnesses: Witness[];
  evidenceSubmitted: ComplianceDocument[];
  status: POSHComplaintStatus;
  severity: Severity;
  committeeId?: string;
  committeeName?: string;
  committeeMembers: CommitteeMember[];
  investigationStartDate?: string;
  hearingDate?: string;
  hearingLocation?: string;
  findings?: string;
  actionsTaken?: DisciplinaryRecord[];
  resolutionDate?: string;
  resolutionDetails?: string;
  appealDate?: string;
  appealReason?: string;
  appealStatus?: 'pending' | 'accepted' | 'rejected';
  confidentiality: 'high' | 'critical';
  reportSubmittedToAuthority?: boolean;
  authorityReportDate?: string;
  createdDate: string;
  lastModified: string;
  lastModifiedBy: string;
}

export interface Witness {
  witnessId?: string;
  witnessName?: string;
  witnessContact?: string;
  statementRecorded: boolean;
  statementDate?: string;
  statementSummary?: string;
}

export interface CommitteeMember {
  memberId: string;
  memberName: string;
  role: 'chairperson' | 'member' | 'external_expert';
  organization?: string;
  appointedDate: string;
  termEndDate?: string;
  isActive: boolean;
}

export interface POSHCommittee {
  id: string;
  committeeCode: string;
  committeeName: string;
  location: string;
  establishedDate: string;
  members: CommitteeMember[];
  externalExpertId?: string;
  externalExpertName?: string;
  externalExpertOrganization?: string;
  casesHandled: number;
  casesResolved: number;
  averageResolutionDays: number;
  lastMeetingDate?: string;
  nextMeetingDate?: string;
  isActive: boolean;
  createdDate: string;
}

// Grievance Management
export interface Grievance {
  id: string;
  grievanceCode: string;
  submittedDate: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeDepartment: string;
  category: GrievanceCategory;
  subject: string;
  description: string;
  isAnonymous: boolean;
  severity: Severity;
  status: GrievanceStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  assignedDate?: string;
  acknowledgedDate?: string;
  investigationStartDate?: string;
  investigationNotes?: string;
  resolutionDate?: string;
  resolutionDetails?: string;
  satisfactionRating?: number;
  escalationLevel: number;
  escalatedTo?: string;
  escalatedToName?: string;
  escalationDate?: string;
  escalationReason?: string;
  attachments: ComplianceDocument[];
  timeline: GrievanceTimeline[];
  relatedGrievances: string[];
  confidential: boolean;
  createdDate: string;
  lastModified: string;
}

export interface GrievanceTimeline {
  timestamp: string;
  action: string;
  performedBy: string;
  performedByName: string;
  details?: string;
  status: GrievanceStatus;
}

// Disciplinary Actions
export interface DisciplinaryRecord {
  id: string;
  recordCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  employeeDepartment: string;
  violationType: string;
  violationCategory:
    | 'attendance'
    | 'conduct'
    | 'performance'
    | 'policy'
    | 'safety'
    | 'ethics'
    | 'other';
  incidentDate: string;
  incidentDescription: string;
  severity: Severity;
  witnesses: Witness[];
  evidence: ComplianceDocument[];
  investigationDetails?: string;
  actionTaken: DisciplinaryAction;
  effectiveDate: string;
  expiryDate?: string;
  warningLevel?: number;
  suspensionDays?: number;
  monetaryPenalty?: {
    amount: number;
    currency: string;
  };
  improvementPlan?: ImprovementPlan;
  status: DisciplinaryStatus;
  issuedBy: string;
  issuedByName: string;
  issuedDate: string;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  appealSubmitted: boolean;
  appealDate?: string;
  appealReason?: string;
  appealStatus?: 'pending' | 'accepted' | 'rejected';
  appealReviewedBy?: string;
  appealDecision?: string;
  appealDecisionDate?: string;
  expiryReached: boolean;
  relatedRecords: string[];
  notes?: string;
  createdDate: string;
  lastModified: string;
}

export interface ImprovementPlan {
  objectives: string[];
  timelines: string[];
  reviewFrequency: 'weekly' | 'bi_weekly' | 'monthly';
  nextReviewDate: string;
  supportProvided: string[];
  progress?: string;
}

// Compliance Audits
export interface ComplianceAudit {
  id: string;
  auditCode: string;
  auditName: string;
  auditType: AuditType;
  scope: string[];
  scheduledDate: string;
  actualStartDate?: string;
  completionDate?: string;
  status: AuditStatus;
  auditors: Auditor[];
  location: string;
  departments: string[];
  complianceAreas: ComplianceType[];
  lawsReviewed: string[];
  findings: AuditFinding[];
  overallRating?: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'critical';
  complianceScore?: number;
  nonComplianceCount: number;
  criticalIssuesCount: number;
  recommendations: string[];
  correctiveActions: CorrectiveAction[];
  followUpAuditDate?: string;
  reportUrl?: string;
  reportSubmittedDate?: string;
  executiveSummary?: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface Auditor {
  auditorId: string;
  auditorName: string;
  role: 'lead_auditor' | 'auditor' | 'observer';
  organization?: string;
  isExternal: boolean;
  qualifications?: string[];
}

export interface AuditFinding {
  id: string;
  findingNumber: string;
  complianceArea: ComplianceType;
  lawReference?: string;
  finding: string;
  severity: Severity;
  status: ComplianceStatus;
  evidenceReviewed: string[];
  recommendation: string;
  responsiblePerson: string;
  responsiblePersonName: string;
  dueDate?: string;
  actionTaken?: string;
  closedDate?: string;
}

// Union & Collective Bargaining
export interface Union {
  id: string;
  unionCode: string;
  unionName: string;
  registrationNumber: string;
  registrationDate: string;
  status: UnionStatus;
  unionType: 'local' | 'national' | 'international';
  affiliatedTo?: string;
  memberCount: number;
  eligibleEmployees: number;
  penetrationRate: number;
  representativeId?: string;
  representativeName?: string;
  representativeContact?: string;
  officeAddress?: string;
  established: string;
  recognitionDate?: string;
  agreements: CollectiveBargainingAgreement[];
  communications: UnionCommunication[];
  isActive: boolean;
  createdDate: string;
  lastModified: string;
}

export interface CollectiveBargainingAgreement {
  id: string;
  agreementCode: string;
  agreementName: string;
  unionId: string;
  unionName: string;
  negotiationStartDate: string;
  agreementDate: string;
  effectiveDate: string;
  expiryDate: string;
  status: 'draft' | 'negotiation' | 'active' | 'expired' | 'terminated';
  terms: AgreementTerm[];
  financialImpact?: {
    estimatedCost: number;
    currency: string;
    breakdown: string;
  };
  signatories: Signatory[];
  documentUrl?: string;
  renewalNoticeDate?: string;
  isAutoRenewable: boolean;
  createdDate: string;
  lastModified: string;
}

export interface AgreementTerm {
  category: 'wages' | 'benefits' | 'working_hours' | 'safety' | 'grievance' | 'other';
  termDescription: string;
  details: string;
}

export interface Signatory {
  signatoryId: string;
  signatoryName: string;
  designation: string;
  organization: string;
  signedDate: string;
  signatureUrl?: string;
}

export interface UnionCommunication {
  id: string;
  communicationDate: string;
  communicationType: 'meeting' | 'negotiation' | 'grievance_discussion' | 'notice' | 'other';
  subject: string;
  summary: string;
  attendees: string[];
  documentsShared: ComplianceDocument[];
  actionItems: string[];
  nextMeetingDate?: string;
}

// Whistleblower
export interface WhistleblowerReport {
  id: string;
  reportCode: string;
  submittedDate: string;
  reporterIdentity: 'anonymous' | 'confidential' | 'disclosed';
  reporterId?: string;
  reporterName?: string;
  reporterContact?: string;
  allegationType:
    | 'fraud'
    | 'corruption'
    | 'misconduct'
    | 'safety_violation'
    | 'legal_violation'
    | 'ethical_violation'
    | 'other';
  severity: Severity;
  subject: string;
  detailedDescription: string;
  allegedPersons: AllegedPerson[];
  dateOfIncident: string;
  locationOfIncident: string;
  witnesses?: Witness[];
  evidenceProvided: ComplianceDocument[];
  status:
    | 'received'
    | 'under_review'
    | 'investigating'
    | 'substantiated'
    | 'unsubstantiated'
    | 'closed';
  assignedInvestigator?: string;
  assignedInvestigatorName?: string;
  investigationStartDate?: string;
  investigationCompletedDate?: string;
  findings?: string;
  actionsTaken?: string[];
  protectionMeasures?: string[];
  retaliationReported: boolean;
  retaliationDetails?: string;
  confidentialityLevel: 'high' | 'critical';
  createdDate: string;
  lastModified: string;
}

export interface AllegedPerson {
  personId?: string;
  personName?: string;
  personDesignation?: string;
  personDepartment?: string;
  allegationDetails: string;
}

// Arbitration
export interface Arbitration {
  id: string;
  arbitrationCode: string;
  caseTitle: string;
  disputeType: 'labor' | 'contract' | 'disciplinary' | 'termination' | 'grievance' | 'other';
  filingDate: string;
  claimantId?: string;
  claimantName: string;
  claimantType: 'employee' | 'union' | 'company';
  respondentName: string;
  respondentType: 'employee' | 'union' | 'company';
  disputeDescription: string;
  claimAmount?: {
    amount: number;
    currency: string;
  };
  arbitrator: Arbitrator;
  hearingDates: HearingSession[];
  status: ArbitrationStatus;
  venue?: string;
  documents: ComplianceDocument[];
  witnesses: Witness[];
  award?: ArbitrationAward;
  appealFiled: boolean;
  appealDate?: string;
  appealOutcome?: string;
  createdDate: string;
  lastModified: string;
}

export interface Arbitrator {
  arbitratorId: string;
  arbitratorName: string;
  organization?: string;
  appointedDate: string;
  qualifications: string[];
}

export interface HearingSession {
  sessionNumber: number;
  hearingDate: string;
  duration: number;
  attendees: string[];
  summary: string;
  nextHearingDate?: string;
}

export interface ArbitrationAward {
  awardDate: string;
  awardSummary: string;
  awardInFavorOf: 'claimant' | 'respondent' | 'split';
  monetaryAward?: {
    amount: number;
    currency: string;
    paymentDueDate: string;
  };
  nonMonetaryRelief?: string[];
  complianceDeadline?: string;
  documentUrl?: string;
}

// Strike Management
export interface Strike {
  id: string;
  strikeCode: string;
  strikeName: string;
  unionId?: string;
  unionName?: string;
  noticeDate: string;
  proposedStartDate: string;
  actualStartDate?: string;
  endDate?: string;
  status: 'notice_received' | 'in_negotiation' | 'active' | 'resolved' | 'cancelled';
  strikeType: 'full' | 'partial' | 'sit_in' | 'work_to_rule' | 'slowdown';
  demands: StrikeDemand[];
  affectedDepartments: string[];
  affectedEmployeeCount: number;
  estimatedBusinessImpact?: {
    productionLoss: number;
    financialLoss: number;
    currency: string;
  };
  negotiations: NegotiationSession[];
  resolutionDate?: string;
  resolutionTerms?: string[];
  lessonsLearned?: string;
  createdDate: string;
  lastModified: string;
}

export interface StrikeDemand {
  demandNumber: number;
  demandCategory: 'wages' | 'benefits' | 'working_conditions' | 'safety' | 'job_security' | 'other';
  demandDescription: string;
  priority: 'must_have' | 'important' | 'negotiable';
  status: 'pending' | 'accepted' | 'rejected' | 'under_negotiation';
  resolutionDetails?: string;
}

export interface NegotiationSession {
  sessionNumber: number;
  sessionDate: string;
  companyRepresentatives: string[];
  unionRepresentatives: string[];
  mediator?: string;
  agenda: string[];
  outcomes: string[];
  agreementsReached: string[];
  nextSessionDate?: string;
}

// Compliance Settings
export interface ComplianceSettings {
  enableComplianceTracking: boolean;
  enablePOSHManagement: boolean;
  enableGrievanceManagement: boolean;
  enableDisciplinaryTracking: boolean;
  enableAudits: boolean;
  enableUnionManagement: boolean;
  enableWhistleblower: boolean;
  anonymousReportingEnabled: boolean;
  poshCommitteeEmail?: string;
  grievanceEscalationLevels: number;
  grievanceResolutionSLA: number; // days
  disciplinaryRetentionPeriod: number; // years
  autoArchiveResolvedGrievances: boolean;
  autoArchiveResolvedDisciplinary: boolean;
  complianceReminderDaysBefore: number;
  enableComplianceAlerts: boolean;
  enableAutomaticReporting: boolean;
  regulatoryReportingFrequency: 'monthly' | 'quarterly' | 'annually';
  dataRetentionPeriod: number; // years
  enableEncryption: boolean;
  enableAuditTrail: boolean;
  notificationSettings: {
    notifyOnGrievanceSubmission: boolean;
    notifyOnPOSHComplaint: boolean;
    notifyOnDisciplinaryAction: boolean;
    notifyOnComplianceDeadline: boolean;
    notifyOnAuditScheduled: boolean;
  };
  createdDate: string;
  lastModified: string;
}

// Compliance Metrics
export interface ComplianceMetrics {
  totalComplianceItems: number;
  compliantItems: number;
  nonCompliantItems: number;
  pendingReviewItems: number;
  complianceRate: number;
  activeGrievances: number;
  resolvedGrievances: number;
  averageGrievanceResolutionDays: number;
  grievancesByCategory: { category: GrievanceCategory; count: number; percentage: number }[];
  activePOSHComplaints: number;
  resolvedPOSHComplaints: number;
  averagePOSHResolutionDays: number;
  activeDisciplinaryRecords: number;
  disciplinaryActionsByType: { action: DisciplinaryAction; count: number }[];
  upcomingAudits: number;
  completedAudits: number;
  criticalFindings: number;
  activeUnions: number;
  unionMembershipRate: number;
  activeArbitrations: number;
  activeStrikes: number;
  whistleblowerReports: number;
  complianceScoreByArea: { area: ComplianceType; score: number }[];
  complianceByJurisdiction: {
    jurisdiction: Jurisdiction;
    compliant: number;
    nonCompliant: number;
  }[];
  trends: {
    period: string;
    complianceRate: number;
    grievances: number;
    poshComplaints: number;
    disciplinaryActions: number;
    auditFindings: number;
  }[];
  lastUpdated: string;
}

// Compliance Notifications
export interface ComplianceNotification {
  id: string;
  notificationType:
    | 'compliance_deadline'
    | 'grievance_submitted'
    | 'posh_complaint'
    | 'disciplinary_action'
    | 'audit_scheduled'
    | 'whistleblower_report';
  recipientId: string;
  recipientName: string;
  title: string;
  message: string;
  relatedId?: string;
  severity: Severity;
  isRead: boolean;
  readDate?: string;
  actionRequired: boolean;
  actionUrl?: string;
  dueDate?: string;
  createdDate: string;
}

// Compliance Audit Log
export interface ComplianceAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action:
    | 'created'
    | 'updated'
    | 'deleted'
    | 'viewed'
    | 'approved'
    | 'rejected'
    | 'escalated'
    | 'resolved';
  entityType:
    | 'grievance'
    | 'posh'
    | 'disciplinary'
    | 'audit'
    | 'compliance_record'
    | 'union'
    | 'whistleblower'
    | 'arbitration';
  entityId: string;
  details: string;
  previousValues?: { [key: string]: any };
  newValues?: { [key: string]: any };
  ipAddress?: string;
  location?: string;
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

/**
 * Compliance service catalogue — returned by the root GET /api/compliance
 * endpoint. Static metadata describing the supported countries, statutory
 * service surfaces and platform features. Bilingual (English + Arabic).
 */
export interface ComplianceCatalogService {
  name: string;
  nameAr: string;
  country: string;
  countryAr: string;
  endpoint: string;
  methods: string[];
  description: string;
  descriptionAr: string;
}

export interface ComplianceCatalogFeature {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
}

export interface ComplianceCatalog {
  name: string;
  nameAr: string;
  version: string;
  supportedCountries: unknown[];
  services: ComplianceCatalogService[];
  features: ComplianceCatalogFeature[];
}
