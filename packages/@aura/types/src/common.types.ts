/**
 * @module CommonTypes
 * @description Common master data types used across all AURA HCM modules
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

// ==================== Base Types ====================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface AuditInfo {
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

// ==================== Geographic Master Data ====================

export interface Country extends BaseEntity {
  code: string; // ISO 3166-1 alpha-2 code (e.g., "US", "IN")
  code3: string; // ISO 3166-1 alpha-3 code (e.g., "USA", "IND")
  name: string;
  nativeName: string;
  phoneCode: string;
  currencyCode: string;
  timezones: string[];
  region: string;
  subregion: string;
  flag?: string;
  emoji?: string;
}

export interface State extends BaseEntity {
  countryCode: string;
  code: string;
  name: string;
  type?: string; // state, province, region, etc.
}

export interface City extends BaseEntity {
  stateCode: string;
  countryCode: string;
  name: string;
  latitude?: number;
  longitude?: number;
  population?: number;
}

// ==================== Currency & Language ====================

export interface Currency extends BaseEntity {
  code: string; // ISO 4217 code (e.g., "USD", "INR")
  name: string;
  symbol: string;
  decimalPlaces: number;
  countries: string[];
}

export interface Language extends BaseEntity {
  code: string; // ISO 639-1 code (e.g., "en", "hi")
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  isSupported: boolean;
}

// ==================== Organization Master Data ====================

export interface Department extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  headOfDepartment?: string; // Employee ID
  costCenterId?: string;
  locationId?: string;
  budgetAmount?: number;
  employeeCount?: number;
  level: number; // hierarchy level
}

export interface Designation extends BaseEntity {
  code: string;
  title: string;
  description?: string;
  level: number;
  gradeId?: string;
  departmentId?: string;
  jobFamilyId?: string;
  isManagerial: boolean;
  reportingTo?: string; // Designation ID
  minExperience?: number;
  maxExperience?: number;
  skillRequirements?: string[];
}

export interface Grade extends BaseEntity {
  code: string;
  name: string;
  level: number;
  description?: string;
  minSalary?: number;
  maxSalary?: number;
  benefits?: string[];
  eligibleForBonus: boolean;
  eligibleForEquity: boolean;
}

export interface CostCenter extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  departmentId?: string;
  locationId?: string;
  budget?: number;
  budgetPeriod?: 'monthly' | 'quarterly' | 'yearly';
  managerId?: string; // Employee ID
}

export interface BusinessUnit extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  headOfUnit?: string; // Employee ID
  parentUnitId?: string;
  locations?: string[];
  region?: string;
  country?: string;
}

export interface Location extends BaseEntity {
  code: string;
  name: string;
  type: 'headquarters' | 'branch' | 'regional_office' | 'remote' | 'satellite';
  address: Address;
  timezone: string;
  workingHours?: WorkingHours;
  capacity?: number;
  isHeadquarters: boolean;
  isPrimary: boolean;
  contactInfo?: ContactInfo;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
}

export interface WorkingHours {
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
}

export interface TimeRange {
  start: string; // HH:mm format
  end: string; // HH:mm format
  breaks?: Break[];
}

export interface Break {
  name: string;
  start: string;
  end: string;
  isPaid: boolean;
}

// ==================== Employment Master Data ====================

export interface EmploymentType extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  isPermanent: boolean;
  isFullTime: boolean;
  benefitsEligible: boolean;
  probationPeriod?: number; // in months
  noticePeriod?: number; // in days
}

export interface EmploymentStatus extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  category: 'active' | 'inactive' | 'terminated' | 'on_hold' | 'suspended';
  isPayrollEligible: boolean;
  isBenefitsEligible: boolean;
}

export interface JobFamily extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  category: string;
  competencies?: string[];
}

// ==================== Document Master Data ====================

export interface DocumentType extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  category: 'identity' | 'address' | 'education' | 'employment' | 'certification' | 'other';
  isMandatory: boolean;
  validityPeriod?: number; // in months
  maxFileSize?: number; // in MB
  allowedFormats?: string[]; // e.g., ['pdf', 'jpg', 'png']
  expiryTracking: boolean;
  requiresVerification: boolean;
}

// ==================== Skill & Competency Master Data ====================

export interface Skill extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  category: 'technical' | 'functional' | 'behavioral' | 'leadership';
  proficiencyLevels: ProficiencyLevel[];
  relatedSkills?: string[]; // Skill IDs
}

export interface ProficiencyLevel {
  level: number;
  name: string;
  description?: string;
  criteria?: string[];
}

export interface Competency extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  type: 'core' | 'functional' | 'leadership' | 'technical';
  proficiencyScale: ProficiencyScale;
  behaviors?: string[];
  relatedSkills?: string[];
}

export interface ProficiencyScale {
  min: number;
  max: number;
  levels: {
    value: number;
    label: string;
    description?: string;
  }[];
}

// ==================== Leave Master Data ====================

export interface LeaveType extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  category: 'paid' | 'unpaid' | 'sick' | 'casual' | 'compensatory' | 'maternity' | 'paternity' | 'other';
  isPaid: boolean;
  isCarryForward: boolean;
  maxCarryForward?: number;
  isEncashable: boolean;
  maxEncashment?: number;
  accrualType: 'monthly' | 'quarterly' | 'yearly' | 'manual';
  accrualAmount?: number;
  maxBalance?: number;
  minServicePeriod?: number; // in months
  requiresApproval: boolean;
  requiresDocument: boolean;
  gender?: 'male' | 'female' | 'all';
  applicableAfter?: number; // in months
  allowNegativeBalance: boolean;
  maxNegativeBalance?: number;
  proration: boolean;
}

// ==================== Attendance & Time Master Data ====================

export interface ShiftType extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  type: 'fixed' | 'rotational' | 'flexible' | 'night';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  graceTimeIn?: number; // in minutes
  graceTimeOut?: number; // in minutes
  halfDayThreshold?: number; // in hours
  fullDayThreshold?: number; // in hours
  breaks: Break[];
  weeklyOffDays?: number[]; // 0-6 (Sunday-Saturday)
  overtimeEligible: boolean;
  nightShiftAllowance?: number;
}

export interface Holiday extends BaseEntity {
  name: string;
  date: Date;
  type: 'national' | 'regional' | 'optional' | 'floating';
  countryCode?: string;
  stateCode?: string;
  locationIds?: string[];
  isOptional: boolean;
  description?: string;
  year: number;
}

// ==================== Tax & Compliance Master Data ====================

export interface TaxRegime extends BaseEntity {
  code: string;
  name: string;
  countryCode: string;
  description?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  slabs: TaxSlab[];
  deductions?: TaxDeduction[];
  exemptions?: TaxExemption[];
}

export interface TaxSlab {
  minIncome: number;
  maxIncome?: number;
  rate: number; // percentage
  fixedAmount?: number;
}

export interface TaxDeduction {
  code: string;
  name: string;
  maxAmount?: number;
  conditions?: string[];
}

export interface TaxExemption {
  code: string;
  name: string;
  amount?: number;
  conditions?: string[];
}

// ==================== Workflow & Approval Master Data ====================

export interface ApprovalLevel extends BaseEntity {
  code: string;
  name: string;
  level: number;
  approverType: 'direct_manager' | 'department_head' | 'hr' | 'cxo' | 'custom';
  escalationDays?: number;
  isParallel: boolean;
  isMandatory: boolean;
}

export interface WorkflowTemplate extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  module: string;
  type: string;
  levels: ApprovalLevel[];
  conditions?: WorkflowCondition[];
  notifications: NotificationConfig[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
  action?: string;
}

export interface NotificationConfig {
  event: string;
  recipients: string[];
  template: string;
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
}

// ==================== Payroll Master Data ====================

export interface PayComponent extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  type: 'earning' | 'deduction' | 'reimbursement' | 'benefit';
  category: 'fixed' | 'variable' | 'statutory';
  calculationType: 'flat' | 'percentage' | 'formula';
  calculation?: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  isTaxable: boolean;
  isPFApplicable: boolean;
  isESIApplicable: boolean;
  isProrated: boolean;
  displayOrder?: number;
}

export interface BankDetail extends BaseEntity {
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode?: string;
  swiftCode?: string;
  routingNumber?: string;
  bankCode?: string;
  accountType: 'savings' | 'current' | 'salary';
  isPrimary: boolean;
}

// ==================== User & Role Master Data ====================

export interface Role extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  type: 'system' | 'custom';
  permissions: Permission[];
  hierarchy?: number;
  isDefault: boolean;
}

export interface Permission {
  module: string;
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve' | 'export')[];
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: string;
  value: any;
}

// ==================== Common Enums ====================

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
}

export enum RecordStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  WITHDRAWN = 'withdrawn',
}

// ==================== Pagination & Filters ====================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any;
}

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// ==================== File Upload Types ====================

export interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  category?: string;
  tags?: string[];
}

// ==================== Notification Types ====================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  recipientId: string;
  isRead: boolean;
  createdAt: Date;
  link?: string;
  metadata?: any;
}

// ==================== Settings Types ====================

export interface SystemSettings extends BaseEntity {
  category: string;
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  isEditable: boolean;
  module?: string;
}
