// Core HR Module - Type Definitions

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
export type EmploymentStatus = 'active' | 'on_leave' | 'suspended' | 'terminated' | 'retired';
export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type DocumentType = 'contract' | 'offer_letter' | 'id_proof' | 'education' | 'certification' | 'performance_review' | 'other';

// ============================================================================
// EMPLOYEE DATABASE
// ============================================================================

export interface Employee {
  employeeId: string;
  employeeNumber: string;
  personalInfo: PersonalInfo;
  employmentInfo: EmploymentInfo;
  contactInfo: ContactInfo;
  emergencyContacts: EmergencyContact[];
  bankDetails?: BankDetails;
  taxInfo?: TaxInfo;
  customFields?: Record<string, any>;
  status: EmploymentStatus;
  createdDate: Date;
  lastModifiedDate: Date;
  lastModifiedBy: string;
}

export interface PersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: Date;
  gender: Gender;
  maritalStatus: MaritalStatus;
  nationality: string;
  citizenship?: string;
  passportNumber?: string;
  passportExpiryDate?: Date;
  nationalIdNumber?: string;
  socialSecurityNumber?: string;
  profilePhoto?: string;
}

export interface EmploymentInfo {
  hireDate: Date;
  employmentType: EmploymentType;
  jobTitle: string;
  department: string;
  division?: string;
  costCenter?: string;
  location: string;
  reportsTo?: string;
  workEmail: string;
  workPhone?: string;
  probationEndDate?: Date;
  confirmationDate?: Date;
  terminationDate?: Date;
  terminationReason?: string;
  rehireEligible?: boolean;
}

export interface ContactInfo {
  personalEmail?: string;
  mobilePhone: string;
  homePhone?: string;
  currentAddress: Address;
  permanentAddress?: Address;
  sameAsCurrent?: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  contactId: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  accountType: 'checking' | 'savings';
  branchName?: string;
  swiftCode?: string;
  iban?: string;
}

export interface TaxInfo {
  taxId: string;
  taxFilingStatus: string;
  allowances: number;
  additionalWithholding?: number;
  exemptFromWithholding?: boolean;
}

// ============================================================================
// ORGANIZATION STRUCTURE
// ============================================================================

export interface OrganizationUnit {
  unitId: string;
  unitCode: string;
  unitName: string;
  unitType: 'company' | 'division' | 'department' | 'team' | 'cost_center';
  parentUnitId?: string;
  level: number;
  headOfUnit?: string;
  headOfUnitName?: string;
  location?: string;
  costCenter?: string;
  employeeCount: number;
  isActive: boolean;
  effectiveDate: Date;
  endDate?: Date;
  createdDate: Date;
  lastModifiedDate: Date;
}

export interface OrgHierarchy {
  hierarchyId: string;
  hierarchyName: string;
  hierarchyType: 'reporting' | 'functional' | 'matrix';
  rootUnitId: string;
  levels: OrgLevel[];
  effectiveDate: Date;
  isActive: boolean;
}

export interface OrgLevel {
  level: number;
  levelName: string;
  units: string[];
}

export interface ReportingRelationship {
  relationshipId: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  relationshipType: 'direct' | 'dotted_line' | 'functional';
  effectiveDate: Date;
  endDate?: Date;
  isPrimary: boolean;
}

// ============================================================================
// EMPLOYMENT HISTORY
// ============================================================================

export interface EmploymentHistory {
  historyId: string;
  employeeId: string;
  employeeName: string;
  changeType: 'hire' | 'promotion' | 'transfer' | 'demotion' | 'title_change' | 'salary_change' | 'termination';
  effectiveDate: Date;
  previousValues?: Record<string, any>;
  newValues: Record<string, any>;
  reason?: string;
  approvedBy?: string;
  approvalDate?: Date;
  notes?: string;
  createdDate: Date;
  createdBy: string;
}

export interface PositionHistory {
  historyId: string;
  employeeId: string;
  positionId: string;
  positionTitle: string;
  department: string;
  startDate: Date;
  endDate?: Date;
  salary: number;
  currency: string;
  employmentType: EmploymentType;
  location: string;
  isCurrent: boolean;
}

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

export interface EmployeeDocument {
  documentId: string;
  employeeId: string;
  employeeName: string;
  documentType: DocumentType;
  documentName: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedDate: Date;
  expiryDate?: Date;
  isConfidential: boolean;
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  allowedRoles: string[];
  category?: string;
  tags: string[];
  version: number;
  status: 'active' | 'archived' | 'expired';

  // AI OCR Metadata
  ocrData?: {
    documentNumber?: string;
    expiryDate?: Date;
    nationality?: string;
    parsingConfidence?: number;
    rawText?: string;
  };
  isAIParsed?: boolean;
}

export interface DocumentTemplate {
  templateId: string;
  templateName: string;
  templateType: 'offer_letter' | 'employment_contract' | 'confirmation' | 'promotion' | 'termination' | 'custom';
  content: string;
  variables: TemplateVariable[];
  isActive: boolean;
  createdBy: string;
  createdDate: Date;
  lastModifiedDate: Date;
}

export interface TemplateVariable {
  variableName: string;
  variableType: 'text' | 'number' | 'date' | 'boolean';
  defaultValue?: any;
  isRequired: boolean;
  description?: string;
}

export interface DocumentRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  documentType: DocumentType;
  requestedDocuments: string[];
  purpose: string;
  requestDate: Date;
  requiredBy?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  processedBy?: string;
  processedDate?: Date;
  notes?: string;
}

// ============================================================================
// POSITION MANAGEMENT
// ============================================================================

export interface Position {
  positionId: string;
  positionCode: string;
  positionTitle: string;
  department: string;
  division?: string;
  jobFamily: string;
  jobLevel: string;
  gradeLevel: string;
  reportsTo?: string;
  location: string;
  employmentType: EmploymentType;
  isHeadcount: boolean;
  salaryRange: SalaryRange;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  currentIncumbent?: string;
  positionStatus: 'open' | 'filled' | 'frozen' | 'eliminated';
  effectiveDate: Date;
  endDate?: Date;

  // Advanced Budgeting & Simulation
  budgetCommitted?: number;
  actualCost?: number;
  utilizationRate?: number;
  isSimulated?: boolean;

  createdDate: Date;
  lastModifiedDate: Date;
}

export interface SalaryRange {
  currency: string;
  minimum: number;
  midpoint: number;
  maximum: number;
}

export interface PositionBudget {
  budgetId: string;
  fiscalYear: number;
  department: string;
  approvedHeadcount: number;
  filledPositions: number;
  openPositions: number;
  frozenPositions: number;
  budgetedSalary: number;
  actualSalary: number;
  variance: number;
}

// ============================================================================
// COST CENTER
// ============================================================================

export interface CostCenter {
  costCenterId: string;
  costCenterCode: string;
  costCenterName: string;
  description: string;
  department: string;
  managerId?: string;
  managerName?: string;
  location?: string;
  fiscalYear: number;
  budget: CostCenterBudget;
  employees: string[];
  isActive: boolean;
  effectiveDate: Date;
  endDate?: Date;
}

export interface CostCenterBudget {
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  categoryName: string;
  categoryCode: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
}

// ============================================================================
// EMPLOYEE LIFE EVENTS
// ============================================================================

export interface LifeEvent {
  eventId: string;
  employeeId: string;
  employeeName: string;
  eventType: 'marriage' | 'birth' | 'adoption' | 'death' | 'relocation' | 'education' | 'other';
  eventDate: Date;
  description: string;
  impactedBenefits?: string[];
  requiredActions: LifeEventAction[];
  supportingDocuments: string[];
  reportedDate: Date;
  reportedBy: string;
  processedBy?: string;
  processedDate?: Date;
  status: 'reported' | 'in_progress' | 'completed';
  notes?: string;
}

export interface LifeEventAction {
  actionId: string;
  actionType: string;
  actionDescription: string;
  dueDate?: Date;
  completedDate?: Date;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// ============================================================================
// MASS UPDATES
// ============================================================================

export interface MassUpdate {
  updateId: string;
  updateType: 'salary' | 'department' | 'manager' | 'location' | 'employment_type' | 'custom';
  updateName: string;
  description: string;
  targetEmployees: string[];
  fieldUpdates: FieldUpdate[];
  effectiveDate: Date;
  reason?: string;
  createdBy: string;
  createdDate: Date;
  executedDate?: Date;
  executedBy?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'executed' | 'failed';
  approvedBy?: string;
  approvalDate?: Date;
  results?: UpdateResult[];
}

export interface FieldUpdate {
  fieldName: string;
  oldValue?: any;
  newValue: any;
  updateMethod: 'replace' | 'increment' | 'percentage_increase';
}

export interface UpdateResult {
  employeeId: string;
  employeeName: string;
  success: boolean;
  errorMessage?: string;
}

// ============================================================================
// EMPLOYEE ID CARDS
// ============================================================================

export interface IDCard {
  cardId: string;
  employeeId: string;
  employeeName: string;
  cardNumber: string;
  issueDate: Date;
  expiryDate: Date;
  cardType: 'employee' | 'contractor' | 'visitor' | 'temporary';
  accessLevel: string;
  photo: string;
  qrCode?: string;
  isActive: boolean;
  replacementReason?: string;
  previousCardId?: string;
  issuedBy: string;
}

export interface CardTemplate {
  templateId: string;
  templateName: string;
  cardType: string;
  layout: CardLayout;
  fields: CardField[];
  includePhoto: boolean;
  includeQRCode: boolean;
  includeBarcode: boolean;
  backgroundColor: string;
  textColor: string;
  isDefault: boolean;
}

export interface CardLayout {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  frontDesign: any;
  backDesign?: any;
}

export interface CardField {
  fieldName: string;
  displayName: string;
  position: { x: number; y: number };
  fontSize: number;
  fontWeight: string;
  isVisible: boolean;
}

// ============================================================================
// LETTER GENERATION
// ============================================================================

export interface LetterRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  letterType: 'employment_verification' | 'experience' | 'salary' | 'promotion' | 'transfer' | 'custom';
  templateId: string;
  customContent?: string;
  addressedTo?: string;
  purpose?: string;
  requestDate: Date;
  requestedBy: string;
  requiredBy?: Date;
  status: 'pending' | 'generated' | 'approved' | 'issued' | 'rejected';
  generatedDate?: Date;
  generatedBy?: string;
  approvedBy?: string;
  approvalDate?: Date;
  documentUrl?: string;
  referenceNumber?: string;
}

export interface GeneratedLetter {
  letterId: string;
  requestId: string;
  employeeId: string;
  letterType: string;
  content: string;
  generatedDate: Date;
  signatory: string;
  signatoryTitle: string;
  letterheadUsed: boolean;
  watermark?: string;
  documentUrl: string;
  referenceNumber: string;
}

// ============================================================================
// EXIT MANAGEMENT
// ============================================================================

export interface ExitProcess {
  exitId: string;
  employeeId: string;
  employeeName: string;
  exitType: 'resignation' | 'termination' | 'retirement' | 'end_of_contract' | 'layoff';
  exitReason: string;
  resignationDate?: Date;
  lastWorkingDate: Date;
  noticePeriod: number;
  noticeServed: number;
  isRehireable: boolean;
  exitInterviewScheduled: boolean;
  exitInterviewDate?: Date;
  exitInterviewCompleted: boolean;
  clearanceItems: ClearanceItem[];
  finalSettlement?: FinalSettlement;
  status: 'initiated' | 'in_progress' | 'completed';
  initiatedBy: string;
  initiatedDate: Date;
  completedDate?: Date;
}

export interface ClearanceItem {
  itemId: string;
  itemName: string;
  department: string;
  assignedTo: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'not_applicable';
  notes?: string;
}

export interface FinalSettlement {
  settlementId: string;
  employeeId: string;
  lastWorkingDate: Date;
  unpaidSalaryDays: number;
  unpaidSalary: number;
  unusedLeaveDays: number;
  leaveEncashment: number;
  bonusPayable: number;
  deductions: SettlementDeduction[];
  totalDeductions: number;
  netPayable: number;
  paymentDate?: Date;
  paymentMethod?: string;
  status: 'calculated' | 'approved' | 'paid';
}

export interface SettlementDeduction {
  deductionType: string;
  amount: number;
  reason: string;
}

// ============================================================================
// ANNIVERSARY ALERTS
// ============================================================================

export interface Anniversary {
  anniversaryId: string;
  employeeId: string;
  employeeName: string;
  anniversaryType: 'work' | 'birthday' | 'probation_end' | 'contract_end' | 'certification_expiry';
  anniversaryDate: Date;
  yearsOfService?: number;
  notificationDate: Date;
  notificationsSent: NotificationLog[];
  acknowledgedBy?: string[];
  celebrationPlanned: boolean;
  status: 'upcoming' | 'notified' | 'celebrated' | 'missed';
}

export interface NotificationLog {
  notificationId: string;
  recipientId: string;
  recipientName: string;
  channel: 'email' | 'sms' | 'app' | 'slack';
  sentDate: Date;
  status: 'sent' | 'delivered' | 'failed';
}

export interface AnniversarySettings {
  enableWorkAnniversaries: boolean;
  enableBirthdays: boolean;
  notifyDaysBefore: number;
  notifyManager: boolean;
  notifyHR: boolean;
  notifyTeam: boolean;
  autoGenerateCertificate: boolean;
  milestoneYears: number[];
}

// ============================================================================
// AUTO-NUMBERING
// ============================================================================

export interface AutoNumberSequence {
  sequenceId: string;
  sequenceName: string;
  entityType: 'employee' | 'position' | 'document' | 'letter' | 'exit' | 'asset' | 'id_card' | 'custom';
  prefix: string;
  suffix?: string;
  currentNumber: number;
  incrementBy: number;
  numberLength: number;
  resetFrequency: 'never' | 'yearly' | 'monthly';
  lastResetDate?: Date;
  nextResetDate?: Date;
  format: string;
  isActive: boolean;
  createdDate: Date;
}

export interface GeneratedNumber {
  numberId: string;
  sequenceId: string;
  generatedNumber: string;
  entityType: string;
  entityId: string;
  generatedDate: Date;
  generatedBy: string;
}

// ============================================================================
// PROBATION TRACKING
// ============================================================================

export interface ProbationRecord {
  recordId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  probationStartDate: Date;
  probationEndDate: Date;
  probationPeriod: number;
  extensionPeriod?: number;
  extendedEndDate?: Date;
  reviews: ProbationReview[];
  finalDecision?: 'confirmed' | 'extended' | 'terminated';
  confirmationDate?: Date;
  confirmationLetterId?: string;
  status: 'ongoing' | 'extended' | 'confirmed' | 'terminated';
}

export interface ProbationReview {
  reviewId: string;
  reviewDate: Date;
  reviewType: 'mid_term' | 'final' | 'extension';
  reviewer: string;
  reviewerTitle: string;
  performance: 'exceeds' | 'meets' | 'needs_improvement' | 'unsatisfactory';
  strengths: string[];
  areasForImprovement: string[];
  recommendation: 'confirm' | 'extend' | 'terminate';
  comments: string;
  employeeComments?: string;
  attachments?: string[];
}

// ============================================================================
// CONFIRMATION LETTERS
// ============================================================================

export interface ConfirmationLetter {
  letterId: string;
  employeeId: string;
  employeeName: string;
  confirmationDate: Date;
  effectiveDate: Date;
  probationStartDate: Date;
  probationEndDate: Date;
  newJobTitle?: string;
  newSalary?: number;
  content: string;
  templateId: string;
  generatedDate: Date;
  generatedBy: string;
  approvedBy: string;
  approvalDate: Date;
  issuedDate?: Date;
  documentUrl: string;
  referenceNumber: string;
  status: 'draft' | 'approved' | 'issued';
}

// ============================================================================
// ASSET MANAGEMENT
// ============================================================================

export interface Asset {
  assetId: string;
  assetTag: string;
  assetName: string;
  assetType: 'laptop' | 'desktop' | 'phone' | 'tablet' | 'monitor' | 'keyboard' | 'mouse' | 'other';
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  purchaseCost: number;
  currentValue: number;
  warrantyExpiryDate?: Date;
  specifications?: Record<string, any>;
  location: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedDate?: Date;
  status: 'available' | 'assigned' | 'in_repair' | 'retired' | 'lost';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
}

export interface AssetAssignment {
  assignmentId: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  assignmentDate: Date;
  returnDate?: Date;
  expectedReturnDate?: Date;
  condition: string;
  assignedBy: string;
  returnCondition?: string;
  returnedBy?: string;
  notes?: string;
  status: 'active' | 'returned' | 'lost' | 'damaged';
}

export interface AssetMaintenance {
  maintenanceId: string;
  assetId: string;
  maintenanceType: 'routine' | 'repair' | 'upgrade' | 'replacement';
  maintenanceDate: Date;
  performedBy: string;
  cost: number;
  description: string;
  nextMaintenanceDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed';
}

// ============================================================================
// SHARED / COMMON TYPES
// ============================================================================

export interface CoreHRSettings {
  settingsId: string;
  employeeNumberPrefix: string;
  enableAutoNumbering: boolean;
  probationPeriodDays: number;
  defaultNoticePeriod: number;
  enableProbationTracking: boolean;
  enableAssetManagement: boolean;
  enableDocumentExpiry: boolean;
  documentExpiryNotificationDays: number;
  enableAnniversaryAlerts: boolean;
  enableExitManagement: boolean;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

// ============================================================================
// INTER-COMPANY TRANSFERS & SHARED SERVICES
// ============================================================================

export interface InterCompanyTransfer {
  transferId: string;
  employeeId: string;
  employeeName: string;
  fromCompanyId: string;
  fromCompanyName: string;
  toCompanyId: string;
  toCompanyName: string;
  transferType: 'permanent' | 'secondment' | 'project_based';
  effectiveDate: Date;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  requestedBy: string;
  approvedBy?: string;
}

export interface SharedServiceRequest {
  requestId: string;
  requestorId: string;
  requestorName: string;
  category: 'hr_letter' | 'it_access' | 'equipment' | 'travel' | 'other';
  subject: string;
  details?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_review' | 'in_progress' | 'completed' | 'rejected';
  assignedToId?: string;
  assignedToName?: string;
  createdDate: Date;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
