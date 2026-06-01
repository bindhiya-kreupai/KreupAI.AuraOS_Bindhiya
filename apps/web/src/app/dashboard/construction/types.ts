/**
 * Construction & Real Estate Module - Type Definitions
 * Comprehensive types for Project Management, Site Safety, Equipment Leasing, and Subcontractor Portal
 */

// ==================== Project Management Types ====================

export type ProjectStatus = 'planning' | 'design' | 'permitting' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectType = 'residential' | 'commercial' | 'industrial' | 'infrastructure' | 'renovation' | 'mixed_use';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type MilestoneStatus = 'upcoming' | 'in_progress' | 'achieved' | 'delayed' | 'missed';

export interface ConstructionProject {
  projectId: string;
  projectName: string;
  projectNumber: string;
  projectType: ProjectType;
  client: ClientInfo;
  location: ProjectLocation;
  description: string;
  scope: ProjectScope;
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  team: ProjectTeam;
  milestones: Milestone[];
  status: ProjectStatus;
  permits: Permit[];
  risks: RiskAssessment[];
  documents: ProjectDocument[];
  photos: ProjectPhoto[];
  createdAt: string;
  updatedAt?: string;
}

export interface ClientInfo {
  clientId: string;
  clientName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  billingAddress?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ProjectLocation {
  address: Address;
  coordinates?: { latitude: number; longitude: number };
  siteArea: number; // in square feet or square meters
  zoning: string;
  accessibility: string;
}

export interface ProjectScope {
  description: string;
  totalArea: number; // in square feet
  numberOfUnits?: number;
  numberOfFloors?: number;
  phases: ProjectPhase[];
  deliverables: string[];
  exclusions?: string[];
}

export interface ProjectPhase {
  phaseId: string;
  phaseName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  completion: number; // percentage
  budget: number;
  actualCost: number;
}

export interface ProjectTimeline {
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  currentPhase: string;
  daysRemaining: number;
  daysElapsed: number;
  totalDuration: number; // in days
  weatherDelays: number; // in days
  otherDelays: DelayRecord[];
}

export interface DelayRecord {
  delayId: string;
  reason: string;
  category: 'weather' | 'materials' | 'labor' | 'permits' | 'client' | 'design_change' | 'other';
  startDate: string;
  endDate?: string;
  duration: number; // in days
  impact: 'low' | 'medium' | 'high';
  mitigationPlan?: string;
}

export interface ProjectBudget {
  totalBudget: number;
  contingency: number;
  allocations: BudgetAllocation[];
  actualCosts: ActualCost[];
  changeOrders: ChangeOrder[];
  variance: {
    amount: number;
    percentage: number;
    trend: 'under' | 'on_track' | 'over';
  };
}

export interface BudgetAllocation {
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  committedAmount: number;
  remainingAmount: number;
  percentage: number;
}

export interface ActualCost {
  costId: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  vendor?: string;
  invoiceNumber?: string;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  approvedBy?: string;
}

export interface ChangeOrder {
  changeOrderId: string;
  changeOrderNumber: string;
  date: string;
  requestedBy: string;
  description: string;
  reason: string;
  costImpact: number;
  scheduleImpact: number; // in days
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'implemented';
  approvals: Approval[];
  documents: string[];
}

export interface Approval {
  approver: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: string;
  comments?: string;
}

export interface ProjectTeam {
  projectManager: TeamMember;
  siteEngineer?: TeamMember;
  architect?: TeamMember;
  contractors: TeamMember[];
  supervisors: TeamMember[];
  safetyOfficer?: TeamMember;
}

export interface TeamMember {
  memberId: string;
  name: string;
  role: string;
  company?: string;
  email: string;
  phone: string;
  responsibilities: string[];
  startDate: string;
  endDate?: string;
}

export interface Milestone {
  milestoneId: string;
  milestoneName: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  status: MilestoneStatus;
  dependencies: string[]; // milestoneIds
  deliverables: string[];
  paymentTrigger: boolean;
  paymentAmount?: number;
  completion: number; // percentage
}

export interface Permit {
  permitId: string;
  permitType: string;
  permitNumber: string;
  issuingAuthority: string;
  applicationDate: string;
  approvalDate?: string;
  expiryDate?: string;
  status: 'pending' | 'approved' | 'expired' | 'rejected';
  cost: number;
  documents: string[];
  conditions?: string[];
}

export interface RiskAssessment {
  riskId: string;
  riskCategory: 'safety' | 'financial' | 'schedule' | 'quality' | 'environmental' | 'legal';
  riskDescription: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationStrategy: string;
  contingencyPlan?: string;
  owner: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'occurred';
  reviewDate: string;
}

export interface ProjectDocument {
  documentId: string;
  documentType: 'drawing' | 'specification' | 'contract' | 'report' | 'correspondence' | 'other';
  documentName: string;
  version: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
  fileSize: number;
  tags: string[];
}

export interface ProjectPhoto {
  photoId: string;
  photoUrl: string;
  thumbnailUrl?: string;
  captureDate: string;
  capturedBy: string;
  location?: string;
  description?: string;
  tags: string[];
}

export interface ProjectTask {
  taskId: string;
  projectId: string;
  taskName: string;
  description: string;
  assignedTo: string;
  assignedTeam?: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[]; // taskIds
  subtasks: Subtask[];
  progress: number; // percentage
  notes?: string;
  attachments: string[];
}

export interface Subtask {
  subtaskId: string;
  subtaskName: string;
  completed: boolean;
  completedDate?: string;
  completedBy?: string;
}

// ==================== Site Safety Types ====================

export type SafetyInspectionType = 'daily' | 'weekly' | 'monthly' | 'incident' | 'regulatory';
export type IncidentSeverity = 'minor' | 'moderate' | 'serious' | 'fatal';
export type IncidentType = 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security';
export type HazardLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SafetyInspection {
  inspectionId: string;
  projectId: string;
  inspectionType: SafetyInspectionType;
  inspectionDate: string;
  inspector: InspectorInfo;
  areas: InspectionArea[];
  findings: SafetyFinding[];
  overallScore: number; // percentage or 1-100
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  nextInspectionDue?: string;
  reportUrl?: string;
  createdAt: string;
}

export interface InspectorInfo {
  inspectorId: string;
  name: string;
  organization: string;
  certification: string;
  licenseNumber?: string;
}

export interface InspectionArea {
  areaId: string;
  areaName: string;
  location: string;
  checklistItems: SafetyChecklistItem[];
  score: number;
  status: 'pass' | 'fail' | 'conditional';
}

export interface SafetyChecklistItem {
  itemId: string;
  item: string;
  category: string;
  required: boolean;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
  photos?: string[];
}

export interface SafetyFinding {
  findingId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  location: string;
  regulation?: string;
  correctiveAction: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'resolved' | 'verified';
  resolutionDate?: string;
  verifiedBy?: string;
  photos?: string[];
}

export interface SafetyIncident {
  incidentId: string;
  projectId: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  incidentDate: string;
  incidentTime: string;
  location: string;
  description: string;
  injured: InjuredPerson[];
  witnesses: Witness[];
  immediateAction: string;
  investigation: Investigation;
  rootCause?: RootCauseAnalysis;
  correctiveActions: CorrectiveAction[];
  preventiveMeasures: string[];
  reportedBy: string;
  reportedDate: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  regulatoryNotification: RegulatoryNotification[];
  documents: string[];
  photos: string[];
  createdAt: string;
}

export interface InjuredPerson {
  name: string;
  age: number;
  role: string;
  company: string;
  injuryType: string;
  injuryLocation: string; // body part
  treatmentProvided: string;
  hospitalRequired: boolean;
  hospitalName?: string;
  daysLost?: number;
  returnToWorkDate?: string;
}

export interface Witness {
  witnessId: string;
  name: string;
  role: string;
  company: string;
  contactInfo: string;
  statement: string;
  statementDate: string;
}

export interface Investigation {
  investigatorId: string;
  investigatorName: string;
  investigationDate: string;
  findings: string;
  evidence: Evidence[];
  timeline: InvestigationTimeline[];
  conclusion: string;
}

export interface Evidence {
  evidenceId: string;
  evidenceType: 'photo' | 'video' | 'document' | 'physical' | 'testimony';
  description: string;
  collectedBy: string;
  collectionDate: string;
  fileUrl?: string;
}

export interface InvestigationTimeline {
  timestamp: string;
  event: string;
  source: string;
}

export interface RootCauseAnalysis {
  immediateCause: string[];
  underlyingCauses: string[];
  contributingFactors: string[];
  systemFailures: string[];
  recommendations: string[];
}

export interface CorrectiveAction {
  actionId: string;
  actionDescription: string;
  category: 'immediate' | 'short_term' | 'long_term';
  responsiblePerson: string;
  targetDate: string;
  completionDate?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'verified';
  effectiveness?: 'effective' | 'partially_effective' | 'ineffective';
  verificationDate?: string;
  verifiedBy?: string;
}

export interface RegulatoryNotification {
  authority: string;
  notificationDate: string;
  referenceNumber: string;
  reportSubmitted: boolean;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface SafetyTraining {
  trainingId: string;
  trainingName: string;
  trainingType: 'orientation' | 'toolbox_talk' | 'certification' | 'refresher' | 'specialized';
  description: string;
  trainer: string;
  trainingDate: string;
  duration: number; // in hours
  attendees: TrainingAttendee[];
  topics: string[];
  materials: string[];
  assessment?: TrainingAssessment;
  certificateIssued: boolean;
  expiryDate?: string;
  nextTrainingDue?: string;
}

export interface TrainingAttendee {
  attendeeId: string;
  name: string;
  role: string;
  company: string;
  attended: boolean;
  score?: number;
  certificateNumber?: string;
  signature?: string;
}

export interface TrainingAssessment {
  assessmentType: 'written' | 'practical' | 'both';
  passingScore: number;
  questions?: number;
  duration?: number; // in minutes
}

export interface PPETracking {
  ppeId: string;
  employeeId: string;
  employeeName: string;
  equipmentIssued: PPEItem[];
  complianceScore: number;
  lastInspectionDate: string;
  nextInspectionDue: string;
}

export interface PPEItem {
  itemId: string;
  itemType: 'hard_hat' | 'safety_glasses' | 'gloves' | 'boots' | 'vest' | 'harness' | 'respirator' | 'ear_protection';
  brand: string;
  model: string;
  serialNumber?: string;
  issueDate: string;
  expiryDate?: string;
  condition: 'new' | 'good' | 'fair' | 'needs_replacement';
  lastInspectionDate: string;
  certificationNumber?: string;
}

export interface HazardIdentification {
  hazardId: string;
  projectId: string;
  hazardType: string;
  hazardLevel: HazardLevel;
  location: string;
  description: string;
  identifiedBy: string;
  identificationDate: string;
  affectedPersonnel: number;
  controls: HazardControl[];
  status: 'identified' | 'controlled' | 'eliminated' | 'monitoring';
  reviewDate: string;
  photos?: string[];
}

export interface HazardControl {
  controlType: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  controlDescription: string;
  implementationDate: string;
  responsiblePerson: string;
  effectiveness: 'effective' | 'partially_effective' | 'ineffective' | 'pending';
}

// ==================== Equipment Leasing Types ====================

export type EquipmentCategory = 'heavy' | 'light' | 'tools' | 'vehicles' | 'scaffolding' | 'temporary_structures';
export type EquipmentStatus = 'available' | 'on_site' | 'maintenance' | 'out_of_service' | 'returned';
export type LeaseType = 'daily' | 'weekly' | 'monthly' | 'long_term' | 'rent_to_own';

export interface EquipmentLease {
  leaseId: string;
  projectId: string;
  equipment: LeasedEquipment;
  lessor: LessorInfo;
  leaseTerms: LeaseTerms;
  delivery: DeliveryInfo;
  maintenance: MaintenancePlan;
  insurance: InsuranceInfo;
  costs: LeaseCosts;
  utilization: EquipmentUtilization;
  inspection: EquipmentInspectionRecord[];
  status: 'pending' | 'active' | 'completed' | 'terminated';
  documents: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface LeasedEquipment {
  equipmentId: string;
  equipmentName: string;
  category: EquipmentCategory;
  manufacturer: string;
  model: string;
  year: number;
  serialNumber: string;
  registrationNumber?: string;
  specifications: EquipmentSpecifications;
  capacity: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  photos?: string[];
}

export interface EquipmentSpecifications {
  dimensions?: { length: number; width: number; height: number };
  weight?: number;
  powerType?: 'diesel' | 'electric' | 'gas' | 'hybrid' | 'manual';
  capacity?: string;
  reach?: number;
  liftHeight?: number;
  features?: string[];
}

export interface LessorInfo {
  lessorId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  taxId: string;
  rating?: number;
  insurance: string;
}

export interface LeaseTerms {
  leaseType: LeaseType;
  startDate: string;
  endDate: string;
  duration: number; // in days
  renewalOption: boolean;
  earlyTerminationAllowed: boolean;
  earlyTerminationPenalty?: number;
  securityDeposit: number;
  terms: string[];
  operatorRequired: boolean;
  operatorProvided?: boolean;
}

export interface DeliveryInfo {
  deliveryDate: string;
  deliveryTime: string;
  deliveryLocation: string;
  deliveryCharge: number;
  receivedBy?: string;
  receivedDate?: string;
  condition?: string;
  pickupDate?: string;
  pickupScheduled?: boolean;
  returnCondition?: string;
}

export interface MaintenancePlan {
  responsibility: 'lessor' | 'lessee' | 'shared';
  scheduledMaintenance: ScheduledMaintenance[];
  maintenanceRecords: MaintenanceRecord[];
  breakdownCoverage: boolean;
  responseTime?: number; // in hours
}

export interface ScheduledMaintenance {
  maintenanceType: string;
  frequency: string;
  lastServiceDate: string;
  nextServiceDue: string;
  provider: string;
}

export interface MaintenanceRecord {
  recordId: string;
  date: string;
  type: 'routine' | 'repair' | 'breakdown' | 'inspection';
  description: string;
  performedBy: string;
  cost: number;
  downtime: number; // in hours
  partsReplaced?: string[];
}

export interface InsuranceInfo {
  policyNumber: string;
  provider: string;
  coverage: number;
  deductible: number;
  expiryDate: string;
  responsibleParty: 'lessor' | 'lessee';
}

export interface LeaseCosts {
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  totalLeaseCost: number;
  additionalCharges: AdditionalCharge[];
  payments: LeasePayment[];
  totalPaid: number;
  balance: number;
}

export interface AdditionalCharge {
  chargeType: 'delivery' | 'pickup' | 'fuel' | 'damage' | 'late_fee' | 'overtime' | 'other';
  description: string;
  amount: number;
  date: string;
}

export interface LeasePayment {
  paymentId: string;
  paymentDate: string;
  amount: number;
  method: 'check' | 'wire' | 'credit_card' | 'ach';
  referenceNumber: string;
  invoiceNumber: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface EquipmentUtilization {
  totalHours: number;
  hoursPerDay: { [date: string]: number };
  utilizationRate: number; // percentage
  idleTime: number; // in hours
  productiveTime: number; // in hours
  fuelConsumption?: FuelConsumption;
}

export interface FuelConsumption {
  totalFuel: number;
  unit: 'gallons' | 'liters';
  cost: number;
  efficiency: number; // fuel per hour
}

export interface EquipmentInspectionRecord {
  inspectionId: string;
  inspectionDate: string;
  inspectorName: string;
  inspectionType: 'pre_delivery' | 'daily' | 'weekly' | 'return';
  checklistItems: EquipmentChecklistItem[];
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor';
  issues: InspectionIssue[];
  photos?: string[];
  signature?: string;
}

export interface EquipmentChecklistItem {
  item: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface InspectionIssue {
  issueType: 'damage' | 'malfunction' | 'missing_parts' | 'other';
  description: string;
  severity: 'minor' | 'major' | 'critical';
  action: 'monitor' | 'repair' | 'replace' | 'report_to_lessor';
  photos?: string[];
}

// ==================== Subcontractor Portal Types ====================

export type SubcontractorStatus = 'active' | 'pending' | 'inactive' | 'blacklisted';
export type BidStatus = 'invited' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
export type ContractStatus = 'draft' | 'negotiating' | 'active' | 'completed' | 'terminated' | 'disputed';
export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'paid' | 'rejected' | 'disputed';

export interface SubcontractorProfile {
  subcontractorId: string;
  companyName: string;
  businessRegistration: string;
  taxId: string;
  specialty: string[];
  contactInfo: ContactInfo;
  address: Address;
  qualifications: SubcontractorQualification[];
  certifications: Certification[];
  insurance: SubcontractorInsurance;
  licenses: License[];
  experience: ExperienceRecord[];
  references: Reference[];
  financialInfo: FinancialInfo;
  performanceRating: PerformanceRating;
  status: SubcontractorStatus;
  documents: SubcontractorDocument[];
  createdAt: string;
  updatedAt?: string;
}

export interface ContactInfo {
  primaryContact: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
  fax?: string;
  website?: string;
}

export interface SubcontractorQualification {
  qualificationId: string;
  qualificationType: string;
  description: string;
  issueDate: string;
  expiryDate?: string;
  issuingBody: string;
  verificationStatus: 'verified' | 'pending' | 'expired';
  documentUrl?: string;
}

export interface Certification {
  certificationId: string;
  certificationType: string;
  certificationName: string;
  issueDate: string;
  expiryDate?: string;
  certifyingBody: string;
  certificateNumber: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  documentUrl?: string;
}

export interface SubcontractorInsurance {
  generalLiability: InsurancePolicy;
  workersCompensation: InsurancePolicy;
  professionalLiability?: InsurancePolicy;
  autoInsurance?: InsurancePolicy;
  umbrella?: InsurancePolicy;
}

export interface InsurancePolicy {
  policyNumber: string;
  provider: string;
  coverageAmount: number;
  deductible: number;
  effectiveDate: string;
  expiryDate: string;
  status: 'active' | 'expiring_soon' | 'expired';
  certificateUrl?: string;
}

export interface License {
  licenseId: string;
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  jurisdiction: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'suspended';
  restrictions?: string[];
}

export interface ExperienceRecord {
  projectName: string;
  client: string;
  projectType: string;
  projectValue: number;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  reference?: string;
}

export interface Reference {
  referenceId: string;
  companyName: string;
  contactPerson: string;
  title: string;
  phone: string;
  email: string;
  projectName: string;
  relationship: string;
  verified: boolean;
  verificationDate?: string;
}

export interface FinancialInfo {
  dunsNumber?: string;
  annualRevenue?: number;
  numberOfEmployees: number;
  bondingCapacity?: number;
  bondingCompany?: string;
  bankReferences: BankReference[];
  creditRating?: string;
  paymentTerms: string;
}

export interface BankReference {
  bankName: string;
  accountType: string;
  contactPerson: string;
  phone: string;
  relationshipDuration: string;
}

export interface PerformanceRating {
  overallRating: number; // 1-5
  projectsCompleted: number;
  onTimeCompletion: number; // percentage
  budgetCompliance: number; // percentage
  qualityRating: number; // 1-5
  safetyRating: number; // 1-5
  communicationRating: number; // 1-5
  reviews: PerformanceReview[];
  lastReviewDate: string;
}

export interface PerformanceReview {
  reviewId: string;
  projectId: string;
  projectName: string;
  reviewDate: string;
  reviewer: string;
  ratings: {
    quality: number;
    schedule: number;
    cost: number;
    safety: number;
    communication: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendation: 'highly_recommend' | 'recommend' | 'conditional' | 'not_recommend';
  comments: string;
}

export interface SubcontractorDocument {
  documentId: string;
  documentType: string;
  documentName: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'current' | 'expiring_soon' | 'expired';
  fileUrl: string;
}

export interface BidInvitation {
  invitationId: string;
  projectId: string;
  projectName: string;
  scope: string;
  invitedSubcontractors: string[]; // subcontractorIds
  bidDeadline: string;
  prebidMeeting?: PrebidMeeting;
  specifications: string[];
  drawings: string[];
  terms: string[];
  evaluationCriteria: EvaluationCriteria;
  status: 'open' | 'closed' | 'awarded' | 'cancelled';
  createdAt: string;
}

export interface PrebidMeeting {
  meetingDate: string;
  meetingTime: string;
  location: string;
  mandatory: boolean;
  agenda: string[];
  attendees?: string[];
  minutes?: string;
}

export interface EvaluationCriteria {
  price: number; // weight percentage
  experience: number;
  schedule: number;
  qualifications: number;
  safety: number;
  references: number;
}

export interface Bid {
  bidId: string;
  invitationId: string;
  subcontractorId: string;
  projectId: string;
  submissionDate: string;
  pricing: BidPricing;
  schedule: BidSchedule;
  scope: string;
  exclusions: string[];
  assumptions: string[];
  alternates: BidAlternate[];
  qualifications: string[];
  references: string[];
  bondingInfo?: BondingInfo;
  validity: number; // days
  status: BidStatus;
  evaluation?: BidEvaluation;
  documents: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface BidPricing {
  basePrice: number;
  breakdown: PriceBreakdown[];
  contingency: number;
  escalation?: number;
  totalPrice: number;
  paymentSchedule: PaymentMilestone[];
  unitPrices?: UnitPrice[];
}

export interface PriceBreakdown {
  category: string;
  description: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice: number;
}

export interface PaymentMilestone {
  milestone: string;
  percentage: number;
  amount: number;
  timing: string;
}

export interface UnitPrice {
  item: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BidSchedule {
  mobilizationDuration: number; // days
  executionDuration: number; // days
  demobilizationDuration: number; // days
  totalDuration: number; // days
  startDate: string;
  completionDate: string;
  milestones: ScheduleMilestone[];
}

export interface ScheduleMilestone {
  milestone: string;
  duration: number; // days
  dependencies?: string[];
}

export interface BidAlternate {
  alternateId: string;
  description: string;
  priceAdjustment: number; // can be positive or negative
  scheduleImpact: number; // days
}

export interface BondingInfo {
  bondingCompany: string;
  bondingCapacity: number;
  bondType: 'bid_bond' | 'performance_bond' | 'payment_bond';
  bondAmount: number;
  bondPercentage: number;
}

export interface BidEvaluation {
  evaluationId: string;
  evaluatedBy: string;
  evaluationDate: string;
  scores: {
    price: number;
    experience: number;
    schedule: number;
    qualifications: number;
    safety: number;
    references: number;
  };
  totalScore: number;
  ranking?: number;
  recommendation: 'award' | 'shortlist' | 'reject';
  comments: string;
}

export interface SubcontractorContract {
  contractId: string;
  contractNumber: string;
  projectId: string;
  subcontractorId: string;
  bidId?: string;
  scope: string;
  terms: ContractTerms;
  pricing: ContractPricing;
  schedule: ContractSchedule;
  insurance: InsuranceRequirements;
  compliance: ComplianceRequirements;
  changeOrders: ContractChangeOrder[];
  status: ContractStatus;
  documents: string[];
  signatures: ContractSignature[];
  createdAt: string;
  updatedAt?: string;
}

export interface ContractTerms {
  startDate: string;
  completionDate: string;
  paymentTerms: string;
  retainage: number; // percentage
  warrantyPeriod: number; // days
  liquidatedDamages?: number; // per day
  disputeResolution: string;
  terminationClause: string;
  specialConditions: string[];
}

export interface ContractPricing {
  contractAmount: number;
  paymentSchedule: ContractPayment[];
  allowances: Allowance[];
  unitPrices?: UnitPrice[];
}

export interface ContractPayment {
  paymentNumber: number;
  description: string;
  percentage: number;
  amount: number;
  milestone: string;
  dueDate?: string;
  status: 'pending' | 'approved' | 'paid';
}

export interface Allowance {
  allowanceId: string;
  description: string;
  amount: number;
  used: number;
  remaining: number;
}

export interface ContractSchedule {
  startDate: string;
  completionDate: string;
  milestones: ContractMilestone[];
  criticalDates: CriticalDate[];
}

export interface ContractMilestone {
  milestone: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  paymentTrigger: boolean;
}

export interface CriticalDate {
  description: string;
  date: string;
  importance: 'high' | 'medium' | 'low';
}

export interface InsuranceRequirements {
  generalLiability: number;
  workersCompensation: boolean;
  professionalLiability?: number;
  autoInsurance?: number;
  umbrella?: number;
  additionalInsured: boolean;
  certificateRequired: boolean;
}

export interface ComplianceRequirements {
  licenses: string[];
  certifications: string[];
  safetyProgram: boolean;
  backgroundChecks: boolean;
  drugTesting: boolean;
  prevailingWage: boolean;
  minorityBusinessRequirements?: string[];
}

export interface ContractChangeOrder {
  changeOrderId: string;
  changeOrderNumber: string;
  date: string;
  description: string;
  reason: string;
  priceImpact: number;
  scheduleImpact: number; // days
  initiatedBy: 'contractor' | 'subcontractor' | 'owner';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'executed';
  documents: string[];
  approvals: Approval[];
}

export interface ContractSignature {
  signatory: string;
  role: string;
  company: string;
  signatureDate: string;
  signatureUrl?: string;
}

export interface SubcontractorInvoice {
  invoiceId: string;
  invoiceNumber: string;
  contractId: string;
  subcontractorId: string;
  projectId: string;
  billingPeriod: { startDate: string; endDate: string };
  lineItems: InvoiceLineItem[];
  subtotal: number;
  retainage: number;
  previousPayments: number;
  currentDue: number;
  totalDue: number;
  dueDate: string;
  status: InvoiceStatus;
  submittedDate: string;
  approvedDate?: string;
  approvedBy?: string;
  paidDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
  documents: string[];
  createdAt: string;
}

export interface InvoiceLineItem {
  lineItemId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

// ==================== Common/Shared Types ====================

export interface ConstructionSettings {
  settingsId: string;
  organizationId: string;
  projectSettings: {
    defaultContingency: number; // percentage
    defaultRetainage: number; // percentage
    budgetThresholds: {
      warning: number; // percentage
      critical: number; // percentage
    };
    scheduleThresholds: {
      warning: number; // days
      critical: number; // days
    };
  };
  safetySettings: {
    inspectionFrequency: { [key: string]: number }; // in days
    incidentReportingDeadline: number; // in hours
    trainingRequirements: string[];
    ppeRequirements: string[];
  };
  equipmentSettings: {
    inspectionFrequency: number; // in days
    maintenanceAlertDays: number;
    utilizationTarget: number; // percentage
  };
  subcontractorSettings: {
    insuranceRequirements: InsuranceRequirements;
    minimumRating: number; // 1-5
    backgroundCheckRequired: boolean;
    bondingRequired: boolean;
    retainagePercentage: number;
  };
  notifications: {
    budgetAlerts: boolean;
    scheduleAlerts: boolean;
    safetyAlerts: boolean;
    equipmentAlerts: boolean;
    paymentReminders: boolean;
    permitExpiry: boolean;
    advanceNoticeDays: number;
  };
  updatedAt: string;
}

export interface ConstructionAlert {
  alertId: string;
  alertType: 'budget' | 'schedule' | 'safety' | 'permit' | 'insurance' | 'payment' | 'equipment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  projectId?: string;
  affectedEntity: {
    entityType: string;
    entityId: string;
    entityName: string;
  };
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
