/**
 * @module Constants
 * @description Common constants used across all AURA HCM modules
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

// ==================== Application Constants ====================

export const APP_CONFIG = {
  NAME: 'AURA HCM',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-Powered Human Capital Management System',
  VENDOR: 'KreupAI Technologies',
  SUPPORT_EMAIL: 'support@kreupai.com',
  COPYRIGHT_YEAR: 2025,
} as const;

// ==================== Date & Time Constants ====================

export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'DD MMM YYYY, hh:mm A',
  TIME: 'hh:mm A',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  MONTH_YEAR: 'MMM YYYY',
  FULL: 'dddd, MMMM DD, YYYY',
} as const;

export const TIME_ZONES = {
  UTC: 'UTC',
  IST: 'Asia/Kolkata',
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  GMT: 'Europe/London',
  SGT: 'Asia/Singapore',
} as const;

// ==================== File Upload Constants ====================

export const FILE_UPLOAD = {
  MAX_SIZE: 10, // MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  ALLOWED_EXTENSIONS: {
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    DOCUMENT: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    VIDEO: ['.mp4', '.avi', '.mov', '.wmv'],
    AUDIO: ['.mp3', '.wav', '.ogg'],
  },
} as const;

// ==================== Pagination Constants ====================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// ==================== Validation Constants ====================

export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: true,
  },
  EMAIL: {
    MAX_LENGTH: 255,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  CODE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9_-]+$/,
  },
} as const;

// ==================== Module Codes ====================

export const MODULE_CODES = {
  AI_AUTOMATION: 'AI_AUTOMATION',
  ATTENDANCE: 'ATTENDANCE',
  AUDIT_SECURITY: 'AUDIT_SECURITY',
  BENEFITS: 'BENEFITS',
  CAREER_PLANNING: 'CAREER_PLANNING',
  CHATBOT_BUILDER: 'CHATBOT_BUILDER',
  COMPENSATION: 'COMPENSATION',
  COMPETENCY_LIBRARY: 'COMPETENCY_LIBRARY',
  CONTRACT_WORKFORCE: 'CONTRACT_WORKFORCE',
  CORE_HR: 'CORE_HR',
  DEI: 'DEI',
  ESS: 'ESS',
  EMPLOYEE_ENGAGEMENT: 'EMPLOYEE_ENGAGEMENT',
  ENGAGEMENT: 'ENGAGEMENT',
  GAMIFICATION: 'GAMIFICATION',
  HEALTH_SAFETY: 'HEALTH_SAFETY',
  HR_BUDGETING: 'HR_BUDGETING',
  HR_HELPDESK: 'HR_HELPDESK',
  HRSD: 'HRSD',
  JOB_LIBRARY: 'JOB_LIBRARY',
  LEARNING_DEVELOPMENT: 'LEARNING_DEVELOPMENT',
  LABOR_RELATIONS: 'LABOR_RELATIONS',
  LEAVE: 'LEAVE',
  LOCALIZATION: 'LOCALIZATION',
  MOBILE_APP: 'MOBILE_APP',
  MSS: 'MSS',
  OFFBOARDING: 'OFFBOARDING',
  ONBOARDING: 'ONBOARDING',
  ORG_DESIGN: 'ORG_DESIGN',
  PAYROLL: 'PAYROLL',
  PERFORMANCE: 'PERFORMANCE',
  POLICY_MGMT: 'POLICY_MGMT',
  POSITION_BUDGETING: 'POSITION_BUDGETING',
  RECRUITMENT: 'RECRUITMENT',
  REMOTE_WORK: 'REMOTE_WORK',
  REPORTS: 'REPORTS',
  SUCCESSION_PLANNING: 'SUCCESSION_PLANNING',
  TRAVEL: 'TRAVEL',
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  WELLNESS: 'WELLNESS',
  WORKFLOW_ENGINE: 'WORKFLOW_ENGINE',
  WORKFORCE_PLANNING: 'WORKFORCE_PLANNING',
} as const;

// ==================== Status Constants ====================

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;

// ==================== Priority Constants ====================

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// ==================== User Roles ====================

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  HR_EXECUTIVE: 'HR_EXECUTIVE',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  MANAGER: 'MANAGER',
  TEAM_LEAD: 'TEAM_LEAD',
  EMPLOYEE: 'EMPLOYEE',
  CONTRACTOR: 'CONTRACTOR',
  GUEST: 'GUEST',
} as const;

// ==================== Permission Actions ====================

export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
  VIEW_ALL: 'view_all',
  VIEW_TEAM: 'view_team',
  VIEW_OWN: 'view_own',
} as const;

// ==================== Employment Constants ====================

export const EMPLOYMENT_TYPE = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  TEMPORARY: 'temporary',
  INTERN: 'intern',
  CONSULTANT: 'consultant',
  FREELANCE: 'freelance',
} as const;

export const EMPLOYMENT_STATUS = {
  ACTIVE: 'active',
  PROBATION: 'probation',
  NOTICE_PERIOD: 'notice_period',
  ON_LEAVE: 'on_leave',
  SUSPENDED: 'suspended',
  TERMINATED: 'terminated',
  RESIGNED: 'resigned',
  RETIRED: 'retired',
} as const;

// ==================== Leave Constants ====================

export const LEAVE_CATEGORIES = {
  PAID: 'paid',
  UNPAID: 'unpaid',
  SICK: 'sick',
  CASUAL: 'casual',
  COMPENSATORY: 'compensatory',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  BEREAVEMENT: 'bereavement',
  SABBATICAL: 'sabbatical',
} as const;

export const LEAVE_DURATION = {
  FULL_DAY: 'full_day',
  HALF_DAY_FIRST: 'half_day_first',
  HALF_DAY_SECOND: 'half_day_second',
  HOURLY: 'hourly',
} as const;

// ==================== Attendance Constants ====================

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
  ON_LEAVE: 'on_leave',
  WEEK_OFF: 'week_off',
  HOLIDAY: 'holiday',
  WORK_FROM_HOME: 'work_from_home',
} as const;

export const PUNCH_TYPE = {
  IN: 'in',
  OUT: 'out',
  BREAK_START: 'break_start',
  BREAK_END: 'break_end',
} as const;

export const PUNCH_MODE = {
  BIOMETRIC: 'biometric',
  MOBILE: 'mobile',
  WEB: 'web',
  QR_CODE: 'qr_code',
  MANUAL: 'manual',
  KIOSK: 'kiosk',
} as const;

// ==================== Performance Constants ====================

export const PERFORMANCE_CYCLE = {
  ANNUAL: 'annual',
  SEMI_ANNUAL: 'semi_annual',
  QUARTERLY: 'quarterly',
  MONTHLY: 'monthly',
} as const;

export const RATING_SCALE = {
  FIVE_POINT: [1, 2, 3, 4, 5],
  FOUR_POINT: [1, 2, 3, 4],
  THREE_POINT: [1, 2, 3],
  LETTER_GRADE: ['A', 'B', 'C', 'D', 'E'],
} as const;

export const REVIEW_TYPE = {
  SELF: 'self',
  MANAGER: 'manager',
  PEER: 'peer',
  SUBORDINATE: 'subordinate',
  CUSTOMER: 'customer',
  THREE_SIXTY: '360',
} as const;

// ==================== Recruitment Constants ====================

export const CANDIDATE_STATUS = {
  NEW: 'new',
  SCREENING: 'screening',
  SHORTLISTED: 'shortlisted',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEWED: 'interviewed',
  SELECTED: 'selected',
  OFFER_SENT: 'offer_sent',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_DECLINED: 'offer_declined',
  JOINED: 'joined',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold',
} as const;

export const JOB_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  CLOSED: 'closed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
} as const;

// ==================== Payroll Constants ====================

export const PAY_FREQUENCY = {
  MONTHLY: 'monthly',
  SEMI_MONTHLY: 'semi_monthly',
  BI_WEEKLY: 'bi_weekly',
  WEEKLY: 'weekly',
} as const;

export const PAY_COMPONENT_TYPE = {
  EARNING: 'earning',
  DEDUCTION: 'deduction',
  REIMBURSEMENT: 'reimbursement',
  BENEFIT: 'benefit',
} as const;

export const PAYROLL_STATUS = {
  DRAFT: 'draft',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  APPROVED: 'approved',
  PAID: 'paid',
  FAILED: 'failed',
} as const;

// ==================== Document Constants ====================

export const DOCUMENT_CATEGORY = {
  IDENTITY: 'identity',
  ADDRESS: 'address',
  EDUCATION: 'education',
  EMPLOYMENT: 'employment',
  CERTIFICATION: 'certification',
  MEDICAL: 'medical',
  FINANCIAL: 'financial',
  OTHER: 'other',
} as const;

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

// ==================== Notification Constants ====================

export const NOTIFICATION_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const NOTIFICATION_CHANNEL = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  WHATSAPP: 'whatsapp',
} as const;

// ==================== Workflow Constants ====================

export const WORKFLOW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  ESCALATED: 'escalated',
} as const;

export const APPROVER_TYPE = {
  DIRECT_MANAGER: 'direct_manager',
  DEPARTMENT_HEAD: 'department_head',
  HR: 'hr',
  CXO: 'cxo',
  CUSTOM: 'custom',
  SKIP_MANAGER: 'skip_manager',
} as const;

// ==================== Benefits Constants ====================

export const BENEFIT_TYPE = {
  MEDICAL: 'medical',
  DENTAL: 'dental',
  VISION: 'vision',
  LIFE_INSURANCE: 'life_insurance',
  DISABILITY: 'disability',
  RETIREMENT: 'retirement',
  WELLNESS: 'wellness',
  TRAVEL: 'travel',
  MEAL: 'meal',
  TRANSPORTATION: 'transportation',
} as const;

export const CLAIM_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
} as const;

// ==================== Travel Constants ====================

export const TRAVEL_CLASS = {
  ECONOMY: 'economy',
  PREMIUM_ECONOMY: 'premium_economy',
  BUSINESS: 'business',
  FIRST_CLASS: 'first_class',
} as const;

export const ACCOMMODATION_TYPE = {
  BUDGET: 'budget',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  LUXURY: 'luxury',
} as const;

// ==================== Gamification Constants ====================

export const BADGE_TYPE = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
  DIAMOND: 'diamond',
} as const;

export const ACHIEVEMENT_CATEGORY = {
  PERFORMANCE: 'performance',
  LEARNING: 'learning',
  ENGAGEMENT: 'engagement',
  INNOVATION: 'innovation',
  COLLABORATION: 'collaboration',
  ATTENDANCE: 'attendance',
} as const;

// ==================== Error Codes ====================

export const ERROR_CODES = {
  // Authentication Errors (1000-1099)
  INVALID_CREDENTIALS: 'ERR_1000',
  UNAUTHORIZED: 'ERR_1001',
  TOKEN_EXPIRED: 'ERR_1002',
  TOKEN_INVALID: 'ERR_1003',
  SESSION_EXPIRED: 'ERR_1004',

  // Authorization Errors (1100-1199)
  FORBIDDEN: 'ERR_1100',
  INSUFFICIENT_PERMISSIONS: 'ERR_1101',

  // Validation Errors (1200-1299)
  VALIDATION_FAILED: 'ERR_1200',
  REQUIRED_FIELD_MISSING: 'ERR_1201',
  INVALID_FORMAT: 'ERR_1202',
  DUPLICATE_ENTRY: 'ERR_1203',

  // Resource Errors (1300-1399)
  RESOURCE_NOT_FOUND: 'ERR_1300',
  RESOURCE_ALREADY_EXISTS: 'ERR_1301',
  RESOURCE_DELETED: 'ERR_1302',

  // Business Logic Errors (1400-1499)
  OPERATION_FAILED: 'ERR_1400',
  INVALID_STATE: 'ERR_1401',
  DEPENDENCY_ERROR: 'ERR_1402',
  QUOTA_EXCEEDED: 'ERR_1403',

  // System Errors (1500-1599)
  INTERNAL_SERVER_ERROR: 'ERR_1500',
  DATABASE_ERROR: 'ERR_1501',
  EXTERNAL_SERVICE_ERROR: 'ERR_1502',
  FILE_UPLOAD_ERROR: 'ERR_1503',
} as const;

// ==================== HTTP Status Codes ====================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ==================== Regex Patterns ====================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA: /^[a-zA-Z]+$/,
  NUMERIC: /^[0-9]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  TIME_24H: /^([01]\d|2[0-3]):([0-5]\d)$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^\d{12}$/,
  SSN: /^\d{3}-\d{2}-\d{4}$/,
  PASSPORT: /^[A-Z0-9]{6,9}$/,
} as const;

// ==================== Country Codes ====================

export const COUNTRY_CODES = {
  INDIA: 'IN',
  USA: 'US',
  UK: 'GB',
  CANADA: 'CA',
  AUSTRALIA: 'AU',
  SINGAPORE: 'SG',
  UAE: 'AE',
} as const;

// ==================== Currency Codes ====================

export const CURRENCY_CODES = {
  INR: 'INR',
  USD: 'USD',
  GBP: 'GBP',
  EUR: 'EUR',
  CAD: 'CAD',
  AUD: 'AUD',
  SGD: 'SGD',
  AED: 'AED',
} as const;

// ==================== Language Codes ====================

export const LANGUAGE_CODES = {
  ENGLISH: 'en',
  HINDI: 'hi',
  SPANISH: 'es',
  FRENCH: 'fr',
  GERMAN: 'de',
  CHINESE: 'zh',
  JAPANESE: 'ja',
  ARABIC: 'ar',
} as const;

// ==================== Export All ====================

export const CONSTANTS = {
  APP_CONFIG,
  DATE_FORMATS,
  TIME_ZONES,
  FILE_UPLOAD,
  PAGINATION,
  VALIDATION,
  MODULE_CODES,
  STATUS,
  PRIORITY,
  USER_ROLES,
  PERMISSION_ACTIONS,
  EMPLOYMENT_TYPE,
  EMPLOYMENT_STATUS,
  LEAVE_CATEGORIES,
  LEAVE_DURATION,
  ATTENDANCE_STATUS,
  PUNCH_TYPE,
  PUNCH_MODE,
  PERFORMANCE_CYCLE,
  RATING_SCALE,
  REVIEW_TYPE,
  CANDIDATE_STATUS,
  JOB_STATUS,
  PAY_FREQUENCY,
  PAY_COMPONENT_TYPE,
  PAYROLL_STATUS,
  DOCUMENT_CATEGORY,
  VERIFICATION_STATUS,
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  WORKFLOW_STATUS,
  APPROVER_TYPE,
  BENEFIT_TYPE,
  CLAIM_STATUS,
  TRAVEL_CLASS,
  ACCOMMODATION_TYPE,
  BADGE_TYPE,
  ACHIEVEMENT_CATEGORY,
  ERROR_CODES,
  HTTP_STATUS,
  REGEX_PATTERNS,
  COUNTRY_CODES,
  CURRENCY_CODES,
  LANGUAGE_CODES,
} as const;
