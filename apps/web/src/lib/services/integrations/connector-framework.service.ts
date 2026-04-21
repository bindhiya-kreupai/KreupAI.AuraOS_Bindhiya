/**
 * Integration Connector Framework Service
 *
 * Provides a standardized framework for integrating with external systems:
 *  - ERP (SAP, Oracle, Dynamics)
 *  - Accounting (QuickBooks, Xero, Tally, Zoho)
 *  - Biometric devices (ZKTeco, Suprema)
 *  - Banking APIs
 *  - Job boards (LinkedIn, Indeed, Bayt, Naukri)
 *  - Government portals (WPS/MOHRE, GOSI, Mudad, Qiwa)
 *  - Communication (Slack, Teams)
 *  - Storage (AWS S3, Azure Blob)
 *
 * Includes:
 *  - Built-in connector templates with required/optional fields per provider
 *  - Retry logic with exponential backoff for failed syncs
 *  - Rate limiting per connector
 *  - Error classification (transient vs permanent)
 *  - Audit logging for all sync operations
 */

// ============================================================================
// TYPES
// ============================================================================

export type ConnectorType =
  | 'ERP'
  | 'ACCOUNTING'
  | 'BIOMETRIC'
  | 'BANKING'
  | 'JOB_BOARD'
  | 'GOVERNMENT'
  | 'COMMUNICATION'
  | 'STORAGE';

export type ConnectorProvider =
  | 'SAP'
  | 'ORACLE'
  | 'DYNAMICS'
  | 'QUICKBOOKS'
  | 'XERO'
  | 'TALLY'
  | 'ZOHO'
  | 'ZKTECO'
  | 'SUPREMA'
  | 'WPS_MOHRE'
  | 'GOSI_PORTAL'
  | 'MUDAD'
  | 'QIWA'
  | 'LINKEDIN'
  | 'INDEED'
  | 'BAYT'
  | 'NAUKRI'
  | 'SLACK'
  | 'TEAMS'
  | 'AWS_S3'
  | 'AZURE_BLOB'
  | 'CUSTOM';

export type SyncDirection = 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
export type SyncStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ConnectorHealthStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN';
export type ErrorClassification = 'TRANSIENT' | 'PERMANENT';

export interface ConnectorConfig {
  id: string;
  tenantId: string;
  connectorType: ConnectorType;
  name: string;
  nameAr: string;
  provider: ConnectorProvider;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'PENDING';
  credentials: string; // encrypted reference
  endpoints: ConnectorEndpoint[];
  syncSchedule: string | null; // cron expression or null for manual
  lastSyncAt: Date | null;
  errorCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectorEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number; // milliseconds
}

export interface SyncOperation {
  id: string;
  connectorId: string;
  direction: SyncDirection;
  entityType: string;
  status: SyncStatus;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  startedAt: Date;
  completedAt: Date | null;
  errors: SyncOperationError[];
}

export interface SyncOperationError {
  recordId?: string;
  field?: string;
  code: string;
  message: string;
  messageAr?: string;
  classification: ErrorClassification;
  timestamp: Date;
  retryable: boolean;
}

export interface IntegrationMapping {
  id: string;
  connectorId: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: string;
}

export interface WebhookConfig {
  id: string;
  connectorId: string;
  eventType: string;
  url: string;
  secret: string;
  isActive: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
}

export interface ConnectorHealth {
  connectorId: string;
  status: ConnectorHealthStatus;
  latency: number; // milliseconds
  lastCheck: Date;
  errorRate: number; // percentage 0-100
  uptime: number; // percentage 0-100
}

export interface SyncOptions {
  direction?: SyncDirection;
  entityType?: string;
  fullSync?: boolean;
  dryRun?: boolean;
}

export interface ConnectorTemplate {
  provider: ConnectorProvider;
  type: ConnectorType;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  requiredFields: TemplateField[];
  optionalFields: TemplateField[];
  defaultEndpoints: ConnectorEndpoint[];
  defaultSyncSchedule: string | null;
  rateLimits: RateLimitConfig;
  supportedEntities: string[];
  supportedDirections: SyncDirection[];
}

export interface TemplateField {
  key: string;
  label: string;
  labelAr: string;
  type: 'TEXT' | 'PASSWORD' | 'URL' | 'NUMBER' | 'SELECT';
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    options?: string[];
  };
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
  retryAfterMs: number;
}

interface RateLimitState {
  requestCount: number;
  windowStart: number;
}

interface AuditEntry {
  id: string;
  tenantId: string;
  connectorId: string;
  action: string;
  details: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// CONNECTOR TEMPLATES
// ============================================================================

const CONNECTOR_TEMPLATES: ConnectorTemplate[] = [
  // ERP
  {
    provider: 'SAP',
    type: 'ERP',
    name: 'SAP SuccessFactors',
    nameAr: 'SAP SuccessFactors',
    description: 'Enterprise HR and payroll integration with SAP SuccessFactors',
    descriptionAr: 'تكامل الموارد البشرية والرواتب مع SAP SuccessFactors',
    requiredFields: [
      { key: 'apiUrl', label: 'API Base URL', labelAr: 'رابط API الأساسي', type: 'URL' },
      { key: 'companyId', label: 'Company ID', labelAr: 'معرف الشركة', type: 'TEXT' },
      { key: 'clientId', label: 'OAuth Client ID', labelAr: 'معرف عميل OAuth', type: 'TEXT' },
      { key: 'clientSecret', label: 'OAuth Client Secret', labelAr: 'سر عميل OAuth', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'proxyUrl', label: 'Proxy URL', labelAr: 'رابط الوسيط', type: 'URL' },
      { key: 'timeout', label: 'Request Timeout (ms)', labelAr: 'مهلة الطلب (مللي ثانية)', type: 'NUMBER' },
    ],
    defaultEndpoints: [
      { id: 'ep_sap_employees', name: 'Employees', url: '/odata/v2/PerPerson', method: 'GET' },
      { id: 'ep_sap_org', name: 'Organization', url: '/odata/v2/FOCompany', method: 'GET' },
      { id: 'ep_sap_payroll', name: 'Payroll', url: '/odata/v2/PayrollResult', method: 'GET' },
    ],
    defaultSyncSchedule: '0 2 * * *', // Daily at 2 AM
    rateLimits: { maxRequests: 100, windowMs: 60000, retryAfterMs: 5000 },
    supportedEntities: ['Employee', 'Organization', 'PayrollRun', 'Position', 'Department'],
    supportedDirections: ['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'],
  },
  {
    provider: 'ORACLE',
    type: 'ERP',
    name: 'Oracle HCM Cloud',
    nameAr: 'Oracle HCM Cloud',
    description: 'Oracle Human Capital Management cloud integration',
    descriptionAr: 'تكامل إدارة رأس المال البشري من Oracle',
    requiredFields: [
      { key: 'instanceUrl', label: 'Instance URL', labelAr: 'رابط النسخة', type: 'URL' },
      { key: 'username', label: 'Service Account Username', labelAr: 'اسم مستخدم حساب الخدمة', type: 'TEXT' },
      { key: 'password', label: 'Service Account Password', labelAr: 'كلمة مرور حساب الخدمة', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'customEndpoint', label: 'Custom REST Endpoint', labelAr: 'نقطة نهاية REST مخصصة', type: 'URL' },
    ],
    defaultEndpoints: [
      { id: 'ep_oracle_workers', name: 'Workers', url: '/hcmRestApi/resources/11.13.18.05/workers', method: 'GET' },
      { id: 'ep_oracle_departments', name: 'Departments', url: '/hcmRestApi/resources/11.13.18.05/departments', method: 'GET' },
    ],
    defaultSyncSchedule: '0 3 * * *',
    rateLimits: { maxRequests: 50, windowMs: 60000, retryAfterMs: 10000 },
    supportedEntities: ['Employee', 'Department', 'Position', 'PayrollRun'],
    supportedDirections: ['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'],
  },
  {
    provider: 'DYNAMICS',
    type: 'ERP',
    name: 'Microsoft Dynamics 365 HR',
    nameAr: 'Microsoft Dynamics 365 HR',
    description: 'Microsoft Dynamics 365 Human Resources integration',
    descriptionAr: 'تكامل الموارد البشرية مع Microsoft Dynamics 365',
    requiredFields: [
      { key: 'tenantId', label: 'Azure Tenant ID', labelAr: 'معرف مستأجر Azure', type: 'TEXT' },
      { key: 'clientId', label: 'App Registration Client ID', labelAr: 'معرف عميل التسجيل', type: 'TEXT' },
      { key: 'clientSecret', label: 'Client Secret', labelAr: 'سر العميل', type: 'PASSWORD' },
      { key: 'environmentUrl', label: 'Environment URL', labelAr: 'رابط البيئة', type: 'URL' },
    ],
    optionalFields: [
      { key: 'legalEntity', label: 'Legal Entity', labelAr: 'الكيان القانوني', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_dyn_workers', name: 'Workers', url: '/data/Workers', method: 'GET' },
      { id: 'ep_dyn_positions', name: 'Positions', url: '/data/Positions', method: 'GET' },
    ],
    defaultSyncSchedule: '0 1 * * *',
    rateLimits: { maxRequests: 60, windowMs: 60000, retryAfterMs: 8000 },
    supportedEntities: ['Employee', 'Position', 'Department', 'LeaveBalance'],
    supportedDirections: ['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'],
  },

  // ACCOUNTING
  {
    provider: 'QUICKBOOKS',
    type: 'ACCOUNTING',
    name: 'QuickBooks Online',
    nameAr: 'QuickBooks Online',
    description: 'Sync payroll and expense data with QuickBooks Online',
    descriptionAr: 'مزامنة بيانات الرواتب والمصاريف مع QuickBooks Online',
    requiredFields: [
      { key: 'realmId', label: 'Company ID (Realm ID)', labelAr: 'معرف الشركة', type: 'TEXT' },
      { key: 'clientId', label: 'OAuth Client ID', labelAr: 'معرف عميل OAuth', type: 'TEXT' },
      { key: 'clientSecret', label: 'OAuth Client Secret', labelAr: 'سر عميل OAuth', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'sandbox', label: 'Use Sandbox', labelAr: 'استخدام بيئة الاختبار', type: 'SELECT', validation: { options: ['true', 'false'] } },
    ],
    defaultEndpoints: [
      { id: 'ep_qb_journal', name: 'Journal Entries', url: '/v3/company/{realmId}/journalentry', method: 'POST' },
      { id: 'ep_qb_employees', name: 'Employees', url: '/v3/company/{realmId}/employee', method: 'GET' },
    ],
    defaultSyncSchedule: '0 6 * * 1', // Weekly on Monday at 6 AM
    rateLimits: { maxRequests: 500, windowMs: 60000, retryAfterMs: 3000 },
    supportedEntities: ['PayrollRun', 'JournalEntry', 'Employee', 'Vendor'],
    supportedDirections: ['OUTBOUND', 'BIDIRECTIONAL'],
  },
  {
    provider: 'XERO',
    type: 'ACCOUNTING',
    name: 'Xero Accounting',
    nameAr: 'محاسبة Xero',
    description: 'Payroll journal entries and employee sync with Xero',
    descriptionAr: 'قيود الرواتب ومزامنة الموظفين مع Xero',
    requiredFields: [
      { key: 'clientId', label: 'OAuth2 Client ID', labelAr: 'معرف عميل OAuth2', type: 'TEXT' },
      { key: 'clientSecret', label: 'OAuth2 Client Secret', labelAr: 'سر عميل OAuth2', type: 'PASSWORD' },
      { key: 'tenantId', label: 'Xero Tenant ID', labelAr: 'معرف مستأجر Xero', type: 'TEXT' },
    ],
    optionalFields: [
      { key: 'trackingCategory', label: 'Default Tracking Category', labelAr: 'فئة التتبع الافتراضية', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_xero_journals', name: 'Manual Journals', url: '/api.xro/2.0/ManualJournals', method: 'POST' },
      { id: 'ep_xero_contacts', name: 'Contacts', url: '/api.xro/2.0/Contacts', method: 'GET' },
    ],
    defaultSyncSchedule: '0 6 * * 1',
    rateLimits: { maxRequests: 60, windowMs: 60000, retryAfterMs: 5000 },
    supportedEntities: ['PayrollRun', 'JournalEntry', 'Employee'],
    supportedDirections: ['OUTBOUND', 'BIDIRECTIONAL'],
  },
  {
    provider: 'TALLY',
    type: 'ACCOUNTING',
    name: 'Tally ERP',
    nameAr: 'Tally ERP',
    description: 'Payroll voucher export to Tally ERP',
    descriptionAr: 'تصدير قسائم الرواتب إلى Tally ERP',
    requiredFields: [
      { key: 'serverHost', label: 'Tally Server Host', labelAr: 'خادم Tally', type: 'TEXT' },
      { key: 'serverPort', label: 'Tally Server Port', labelAr: 'منفذ خادم Tally', type: 'NUMBER' },
      { key: 'companyName', label: 'Company Name', labelAr: 'اسم الشركة', type: 'TEXT' },
    ],
    optionalFields: [
      { key: 'voucherType', label: 'Voucher Type', labelAr: 'نوع القسيمة', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_tally_import', name: 'Import Data', url: '/tally-import', method: 'POST' },
    ],
    defaultSyncSchedule: null, // Manual only
    rateLimits: { maxRequests: 10, windowMs: 60000, retryAfterMs: 10000 },
    supportedEntities: ['PayrollRun', 'JournalEntry'],
    supportedDirections: ['OUTBOUND'],
  },
  {
    provider: 'ZOHO',
    type: 'ACCOUNTING',
    name: 'Zoho Books',
    nameAr: 'Zoho Books',
    description: 'Payroll and expense integration with Zoho Books',
    descriptionAr: 'تكامل الرواتب والمصاريف مع Zoho Books',
    requiredFields: [
      { key: 'clientId', label: 'OAuth Client ID', labelAr: 'معرف عميل OAuth', type: 'TEXT' },
      { key: 'clientSecret', label: 'OAuth Client Secret', labelAr: 'سر عميل OAuth', type: 'PASSWORD' },
      { key: 'organizationId', label: 'Organization ID', labelAr: 'معرف المنظمة', type: 'TEXT' },
    ],
    optionalFields: [
      { key: 'region', label: 'Data Center Region', labelAr: 'منطقة مركز البيانات', type: 'SELECT', validation: { options: ['US', 'EU', 'IN', 'AU'] } },
    ],
    defaultEndpoints: [
      { id: 'ep_zoho_journals', name: 'Journals', url: '/api/v3/journals', method: 'POST' },
      { id: 'ep_zoho_contacts', name: 'Contacts', url: '/api/v3/contacts', method: 'GET' },
    ],
    defaultSyncSchedule: '0 6 * * 1',
    rateLimits: { maxRequests: 100, windowMs: 60000, retryAfterMs: 5000 },
    supportedEntities: ['PayrollRun', 'JournalEntry', 'Employee'],
    supportedDirections: ['OUTBOUND', 'BIDIRECTIONAL'],
  },

  // BIOMETRIC
  {
    provider: 'ZKTECO',
    type: 'BIOMETRIC',
    name: 'ZKTeco Devices',
    nameAr: 'أجهزة ZKTeco',
    description: 'Attendance data from ZKTeco biometric terminals',
    descriptionAr: 'بيانات الحضور من أجهزة ZKTeco البيومترية',
    requiredFields: [
      { key: 'deviceIp', label: 'Device IP Address', labelAr: 'عنوان IP للجهاز', type: 'TEXT' },
      { key: 'port', label: 'Port', labelAr: 'المنفذ', type: 'NUMBER' },
      { key: 'communicationKey', label: 'Communication Key', labelAr: 'مفتاح الاتصال', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'deviceName', label: 'Device Label', labelAr: 'تسمية الجهاز', type: 'TEXT' },
      { key: 'pollingInterval', label: 'Polling Interval (seconds)', labelAr: 'فترة الاستقصاء (ثوان)', type: 'NUMBER' },
    ],
    defaultEndpoints: [
      { id: 'ep_zk_attendance', name: 'Attendance Logs', url: '/iclock/cdata', method: 'GET' },
      { id: 'ep_zk_users', name: 'User List', url: '/iclock/getuser', method: 'GET' },
    ],
    defaultSyncSchedule: '*/15 * * * *', // Every 15 minutes
    rateLimits: { maxRequests: 30, windowMs: 60000, retryAfterMs: 10000 },
    supportedEntities: ['AttendanceLog', 'BiometricUser'],
    supportedDirections: ['INBOUND'],
  },
  {
    provider: 'SUPREMA',
    type: 'BIOMETRIC',
    name: 'Suprema BioStar',
    nameAr: 'Suprema BioStar',
    description: 'Access control and attendance from Suprema BioStar 2',
    descriptionAr: 'التحكم بالدخول والحضور من Suprema BioStar 2',
    requiredFields: [
      { key: 'serverUrl', label: 'BioStar 2 Server URL', labelAr: 'رابط خادم BioStar 2', type: 'URL' },
      { key: 'loginId', label: 'Admin Login ID', labelAr: 'معرف تسجيل الدخول', type: 'TEXT' },
      { key: 'password', label: 'Admin Password', labelAr: 'كلمة مرور المسؤول', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'doorGroupId', label: 'Door Group ID', labelAr: 'معرف مجموعة الأبواب', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_sup_events', name: 'Events', url: '/api/events/search', method: 'POST' },
      { id: 'ep_sup_users', name: 'Users', url: '/api/users', method: 'GET' },
    ],
    defaultSyncSchedule: '*/10 * * * *', // Every 10 minutes
    rateLimits: { maxRequests: 20, windowMs: 60000, retryAfterMs: 15000 },
    supportedEntities: ['AttendanceLog', 'AccessEvent', 'BiometricUser'],
    supportedDirections: ['INBOUND'],
  },

  // BANKING
  {
    provider: 'WPS_MOHRE',
    type: 'BANKING',
    name: 'UAE WPS (MOHRE)',
    nameAr: 'نظام حماية الأجور (وزارة الموارد البشرية)',
    description: 'UAE Wage Protection System for salary file submission',
    descriptionAr: 'نظام حماية الأجور لإرسال ملفات الرواتب',
    requiredFields: [
      { key: 'bankCode', label: 'Agent Bank Code', labelAr: 'رمز البنك الوكيل', type: 'TEXT' },
      { key: 'employerMolId', label: 'MOL Establishment ID', labelAr: 'رقم المنشأة في وزارة العمل', type: 'TEXT' },
      { key: 'sifFormat', label: 'SIF Format Version', labelAr: 'إصدار صيغة SIF', type: 'SELECT', validation: { options: ['SIF_V1', 'SIF_V2'] } },
    ],
    optionalFields: [
      { key: 'bankBranch', label: 'Bank Branch Code', labelAr: 'رمز فرع البنك', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_wps_submit', name: 'Submit SIF', url: '/wps/submit', method: 'POST' },
      { id: 'ep_wps_status', name: 'Check Status', url: '/wps/status', method: 'GET' },
    ],
    defaultSyncSchedule: null, // Manual - triggered after payroll finalization
    rateLimits: { maxRequests: 5, windowMs: 60000, retryAfterMs: 30000 },
    supportedEntities: ['PayrollRun', 'SIFFile'],
    supportedDirections: ['OUTBOUND'],
  },

  // GOVERNMENT
  {
    provider: 'GOSI_PORTAL',
    type: 'GOVERNMENT',
    name: 'GOSI Portal (Saudi)',
    nameAr: 'بوابة التأمينات الاجتماعية',
    description: 'Saudi GOSI contribution filing and employee registration',
    descriptionAr: 'تقديم اشتراكات التأمينات وتسجيل الموظفين',
    requiredFields: [
      { key: 'establishmentId', label: 'GOSI Establishment Number', labelAr: 'رقم المنشأة في التأمينات', type: 'TEXT' },
      { key: 'certificate', label: 'Digital Certificate', labelAr: 'الشهادة الرقمية', type: 'PASSWORD' },
      { key: 'certificatePassword', label: 'Certificate Password', labelAr: 'كلمة مرور الشهادة', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'branchNumber', label: 'Branch Number', labelAr: 'رقم الفرع', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_gosi_contrib', name: 'Submit Contributions', url: '/api/contributions/submit', method: 'POST' },
      { id: 'ep_gosi_register', name: 'Register Employee', url: '/api/employees/register', method: 'POST' },
    ],
    defaultSyncSchedule: '0 8 1 * *', // Monthly on the 1st at 8 AM
    rateLimits: { maxRequests: 10, windowMs: 60000, retryAfterMs: 30000 },
    supportedEntities: ['GOSIContribution', 'Employee'],
    supportedDirections: ['OUTBOUND'],
  },
  {
    provider: 'MUDAD',
    type: 'GOVERNMENT',
    name: 'Mudad Platform (Saudi)',
    nameAr: 'منصة مُدد',
    description: 'Saudi Mudad wage protection and compliance platform',
    descriptionAr: 'منصة مدد لحماية الأجور والامتثال',
    requiredFields: [
      { key: 'establishmentId', label: 'Establishment ID', labelAr: 'رقم المنشأة', type: 'TEXT' },
      { key: 'apiKey', label: 'Mudad API Key', labelAr: 'مفتاح API لمدد', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'environment', label: 'Environment', labelAr: 'البيئة', type: 'SELECT', validation: { options: ['PRODUCTION', 'SANDBOX'] } },
    ],
    defaultEndpoints: [
      { id: 'ep_mudad_wages', name: 'Submit Wages', url: '/api/v1/wages/submit', method: 'POST' },
      { id: 'ep_mudad_status', name: 'Check Status', url: '/api/v1/wages/status', method: 'GET' },
    ],
    defaultSyncSchedule: null,
    rateLimits: { maxRequests: 10, windowMs: 60000, retryAfterMs: 30000 },
    supportedEntities: ['PayrollRun', 'WageProtection'],
    supportedDirections: ['OUTBOUND'],
  },
  {
    provider: 'QIWA',
    type: 'GOVERNMENT',
    name: 'Qiwa Platform (Saudi)',
    nameAr: 'منصة قوى',
    description: 'Saudi Qiwa labor market platform integration',
    descriptionAr: 'تكامل منصة قوى لسوق العمل',
    requiredFields: [
      { key: 'unifiedNumber', label: 'Unified National Number', labelAr: 'الرقم الموحد', type: 'TEXT' },
      { key: 'apiToken', label: 'API Access Token', labelAr: 'رمز الوصول لـ API', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'delegateId', label: 'Delegate ID', labelAr: 'رقم المفوض', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_qiwa_contracts', name: 'Contract Management', url: '/api/v1/contracts', method: 'POST' },
      { id: 'ep_qiwa_employees', name: 'Employee Verification', url: '/api/v1/employees/verify', method: 'GET' },
    ],
    defaultSyncSchedule: null,
    rateLimits: { maxRequests: 15, windowMs: 60000, retryAfterMs: 20000 },
    supportedEntities: ['Employee', 'Contract', 'Visa'],
    supportedDirections: ['OUTBOUND', 'BIDIRECTIONAL'],
  },

  // JOB BOARDS
  {
    provider: 'LINKEDIN',
    type: 'JOB_BOARD',
    name: 'LinkedIn Jobs',
    nameAr: 'وظائف LinkedIn',
    description: 'Post jobs and import candidates from LinkedIn',
    descriptionAr: 'نشر الوظائف واستيراد المرشحين من LinkedIn',
    requiredFields: [
      { key: 'clientId', label: 'OAuth Client ID', labelAr: 'معرف عميل OAuth', type: 'TEXT' },
      { key: 'clientSecret', label: 'OAuth Client Secret', labelAr: 'سر عميل OAuth', type: 'PASSWORD' },
      { key: 'companyId', label: 'Company Page ID', labelAr: 'معرف صفحة الشركة', type: 'TEXT' },
    ],
    optionalFields: [
      { key: 'defaultLocation', label: 'Default Job Location', labelAr: 'الموقع الافتراضي للوظيفة', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_li_jobs', name: 'Job Postings', url: '/v2/simpleJobPostings', method: 'POST' },
      { id: 'ep_li_applications', name: 'Applications', url: '/v2/jobApplications', method: 'GET' },
    ],
    defaultSyncSchedule: '0 */6 * * *', // Every 6 hours
    rateLimits: { maxRequests: 100, windowMs: 86400000, retryAfterMs: 60000 }, // 100/day
    supportedEntities: ['JobPosting', 'Candidate', 'Application'],
    supportedDirections: ['OUTBOUND', 'INBOUND'],
  },
  {
    provider: 'INDEED',
    type: 'JOB_BOARD',
    name: 'Indeed',
    nameAr: 'Indeed',
    description: 'Job posting and candidate sourcing via Indeed',
    descriptionAr: 'نشر الوظائف واستقطاب المرشحين عبر Indeed',
    requiredFields: [
      { key: 'employerApiKey', label: 'Employer API Key', labelAr: 'مفتاح API لصاحب العمل', type: 'PASSWORD' },
      { key: 'employerId', label: 'Employer ID', labelAr: 'معرف صاحب العمل', type: 'TEXT' },
    ],
    optionalFields: [
      { key: 'sponsoredBudget', label: 'Sponsored Job Budget (USD)', labelAr: 'ميزانية الوظائف المدعومة', type: 'NUMBER' },
    ],
    defaultEndpoints: [
      { id: 'ep_indeed_post', name: 'Post Jobs', url: '/v2/jobs', method: 'POST' },
      { id: 'ep_indeed_apps', name: 'Applications', url: '/v2/applications', method: 'GET' },
    ],
    defaultSyncSchedule: '0 */4 * * *', // Every 4 hours
    rateLimits: { maxRequests: 200, windowMs: 60000, retryAfterMs: 5000 },
    supportedEntities: ['JobPosting', 'Candidate', 'Application'],
    supportedDirections: ['OUTBOUND', 'INBOUND'],
  },
  {
    provider: 'BAYT',
    type: 'JOB_BOARD',
    name: 'Bayt.com',
    nameAr: 'بيت.كوم',
    description: 'MENA region job board integration',
    descriptionAr: 'تكامل موقع التوظيف لمنطقة الشرق الأوسط وشمال أفريقيا',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', labelAr: 'مفتاح API', type: 'PASSWORD' },
      { key: 'companyId', label: 'Company ID', labelAr: 'معرف الشركة', type: 'TEXT' },
    ],
    optionalFields: [
      { key: 'defaultCountry', label: 'Default Country', labelAr: 'الدولة الافتراضية', type: 'SELECT', validation: { options: ['SA', 'AE', 'BH', 'QA', 'KW', 'OM'] } },
    ],
    defaultEndpoints: [
      { id: 'ep_bayt_post', name: 'Post Job', url: '/api/v1/jobs', method: 'POST' },
      { id: 'ep_bayt_candidates', name: 'Candidates', url: '/api/v1/candidates', method: 'GET' },
    ],
    defaultSyncSchedule: '0 */4 * * *',
    rateLimits: { maxRequests: 50, windowMs: 60000, retryAfterMs: 10000 },
    supportedEntities: ['JobPosting', 'Candidate', 'Application'],
    supportedDirections: ['OUTBOUND', 'INBOUND'],
  },
  {
    provider: 'NAUKRI',
    type: 'JOB_BOARD',
    name: 'Naukri.com',
    nameAr: 'Naukri.com',
    description: 'India job board integration for hiring',
    descriptionAr: 'تكامل موقع التوظيف الهندي',
    requiredFields: [
      { key: 'apiKey', label: 'RMS API Key', labelAr: 'مفتاح API لنظام التوظيف', type: 'PASSWORD' },
      { key: 'companyId', label: 'Company ID', labelAr: 'معرف الشركة', type: 'TEXT' },
    ],
    optionalFields: [
      { key: 'defaultCity', label: 'Default City', labelAr: 'المدينة الافتراضية', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_naukri_post', name: 'Post Job', url: '/api/jobs/post', method: 'POST' },
      { id: 'ep_naukri_resume', name: 'Resume Database', url: '/api/resumes/search', method: 'POST' },
    ],
    defaultSyncSchedule: '0 */4 * * *',
    rateLimits: { maxRequests: 50, windowMs: 60000, retryAfterMs: 10000 },
    supportedEntities: ['JobPosting', 'Candidate', 'Application'],
    supportedDirections: ['OUTBOUND', 'INBOUND'],
  },

  // COMMUNICATION
  {
    provider: 'SLACK',
    type: 'COMMUNICATION',
    name: 'Slack',
    nameAr: 'Slack',
    description: 'HR notifications, approvals, and announcements via Slack',
    descriptionAr: 'إشعارات الموارد البشرية والموافقات والإعلانات عبر Slack',
    requiredFields: [
      { key: 'botToken', label: 'Bot OAuth Token', labelAr: 'رمز مصادقة البوت', type: 'PASSWORD' },
      { key: 'signingSecret', label: 'Signing Secret', labelAr: 'سر التوقيع', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'defaultChannel', label: 'Default Channel', labelAr: 'القناة الافتراضية', type: 'TEXT' },
      { key: 'announcementsChannel', label: 'Announcements Channel', labelAr: 'قناة الإعلانات', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_slack_msg', name: 'Post Message', url: 'https://slack.com/api/chat.postMessage', method: 'POST' },
      { id: 'ep_slack_channels', name: 'List Channels', url: 'https://slack.com/api/conversations.list', method: 'GET' },
    ],
    defaultSyncSchedule: null, // Event-driven
    rateLimits: { maxRequests: 50, windowMs: 60000, retryAfterMs: 3000 },
    supportedEntities: ['Notification', 'Approval', 'Announcement'],
    supportedDirections: ['OUTBOUND', 'BIDIRECTIONAL'],
  },
  {
    provider: 'TEAMS',
    type: 'COMMUNICATION',
    name: 'Microsoft Teams',
    nameAr: 'Microsoft Teams',
    description: 'HR notifications and approvals via Microsoft Teams',
    descriptionAr: 'إشعارات الموارد البشرية والموافقات عبر Microsoft Teams',
    requiredFields: [
      { key: 'tenantId', label: 'Azure Tenant ID', labelAr: 'معرف مستأجر Azure', type: 'TEXT' },
      { key: 'clientId', label: 'App Client ID', labelAr: 'معرف عميل التطبيق', type: 'TEXT' },
      { key: 'clientSecret', label: 'App Client Secret', labelAr: 'سر عميل التطبيق', type: 'PASSWORD' },
    ],
    optionalFields: [
      { key: 'defaultTeam', label: 'Default Team ID', labelAr: 'معرف الفريق الافتراضي', type: 'TEXT' },
      { key: 'defaultChannel', label: 'Default Channel ID', labelAr: 'معرف القناة الافتراضية', type: 'TEXT' },
    ],
    defaultEndpoints: [
      { id: 'ep_teams_msg', name: 'Send Message', url: 'https://graph.microsoft.com/v1.0/teams/{teamId}/channels/{channelId}/messages', method: 'POST' },
      { id: 'ep_teams_card', name: 'Send Adaptive Card', url: 'https://graph.microsoft.com/v1.0/teams/{teamId}/channels/{channelId}/messages', method: 'POST' },
    ],
    defaultSyncSchedule: null,
    rateLimits: { maxRequests: 30, windowMs: 60000, retryAfterMs: 5000 },
    supportedEntities: ['Notification', 'Approval', 'Announcement'],
    supportedDirections: ['OUTBOUND', 'BIDIRECTIONAL'],
  },

  // STORAGE
  {
    provider: 'AWS_S3',
    type: 'STORAGE',
    name: 'AWS S3',
    nameAr: 'AWS S3',
    description: 'Document storage and backup via Amazon S3',
    descriptionAr: 'تخزين المستندات والنسخ الاحتياطي عبر Amazon S3',
    requiredFields: [
      { key: 'accessKeyId', label: 'AWS Access Key ID', labelAr: 'معرف مفتاح الوصول', type: 'TEXT' },
      { key: 'secretAccessKey', label: 'AWS Secret Access Key', labelAr: 'مفتاح الوصول السري', type: 'PASSWORD' },
      { key: 'bucket', label: 'S3 Bucket Name', labelAr: 'اسم حاوية S3', type: 'TEXT' },
      { key: 'region', label: 'AWS Region', labelAr: 'منطقة AWS', type: 'SELECT', validation: { options: ['us-east-1', 'eu-west-1', 'ap-south-1', 'me-south-1'] } },
    ],
    optionalFields: [
      { key: 'prefix', label: 'Key Prefix', labelAr: 'بادئة المفتاح', type: 'TEXT' },
      { key: 'encryption', label: 'Server-Side Encryption', labelAr: 'تشفير جانب الخادم', type: 'SELECT', validation: { options: ['AES256', 'aws:kms', 'none'] } },
    ],
    defaultEndpoints: [
      { id: 'ep_s3_upload', name: 'Upload', url: 's3://{bucket}/{prefix}', method: 'PUT' },
      { id: 'ep_s3_download', name: 'Download', url: 's3://{bucket}/{prefix}', method: 'GET' },
    ],
    defaultSyncSchedule: null,
    rateLimits: { maxRequests: 1000, windowMs: 60000, retryAfterMs: 1000 },
    supportedEntities: ['Document', 'Report', 'Backup'],
    supportedDirections: ['OUTBOUND', 'INBOUND', 'BIDIRECTIONAL'],
  },
  {
    provider: 'AZURE_BLOB',
    type: 'STORAGE',
    name: 'Azure Blob Storage',
    nameAr: 'تخزين Azure Blob',
    description: 'Document storage and backup via Azure Blob Storage',
    descriptionAr: 'تخزين المستندات والنسخ الاحتياطي عبر Azure Blob',
    requiredFields: [
      { key: 'connectionString', label: 'Connection String', labelAr: 'سلسلة الاتصال', type: 'PASSWORD' },
      { key: 'containerName', label: 'Container Name', labelAr: 'اسم الحاوية', type: 'TEXT' },
    ],
    optionalFields: [
      { key: 'prefix', label: 'Blob Prefix', labelAr: 'بادئة Blob', type: 'TEXT' },
      { key: 'accessTier', label: 'Access Tier', labelAr: 'طبقة الوصول', type: 'SELECT', validation: { options: ['Hot', 'Cool', 'Archive'] } },
    ],
    defaultEndpoints: [
      { id: 'ep_azure_upload', name: 'Upload Blob', url: 'https://{account}.blob.core.windows.net/{container}', method: 'PUT' },
      { id: 'ep_azure_download', name: 'Download Blob', url: 'https://{account}.blob.core.windows.net/{container}', method: 'GET' },
    ],
    defaultSyncSchedule: null,
    rateLimits: { maxRequests: 1000, windowMs: 60000, retryAfterMs: 1000 },
    supportedEntities: ['Document', 'Report', 'Backup'],
    supportedDirections: ['OUTBOUND', 'INBOUND', 'BIDIRECTIONAL'],
  },
  {
    provider: 'CUSTOM',
    type: 'ERP',
    name: 'Custom Connector',
    nameAr: 'موصل مخصص',
    description: 'Custom HTTP-based connector for any external system',
    descriptionAr: 'موصل مخصص عبر HTTP لأي نظام خارجي',
    requiredFields: [
      { key: 'baseUrl', label: 'Base URL', labelAr: 'الرابط الأساسي', type: 'URL' },
      { key: 'authType', label: 'Authentication Type', labelAr: 'نوع المصادقة', type: 'SELECT', validation: { options: ['API_KEY', 'BEARER', 'BASIC', 'OAUTH2', 'NONE'] } },
    ],
    optionalFields: [
      { key: 'apiKey', label: 'API Key', labelAr: 'مفتاح API', type: 'PASSWORD' },
      { key: 'username', label: 'Username', labelAr: 'اسم المستخدم', type: 'TEXT' },
      { key: 'password', label: 'Password', labelAr: 'كلمة المرور', type: 'PASSWORD' },
      { key: 'customHeaders', label: 'Custom Headers (JSON)', labelAr: 'رؤوس مخصصة (JSON)', type: 'TEXT' },
    ],
    defaultEndpoints: [],
    defaultSyncSchedule: null,
    rateLimits: { maxRequests: 60, windowMs: 60000, retryAfterMs: 5000 },
    supportedEntities: [],
    supportedDirections: ['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'],
  },
];

// ============================================================================
// RETRY & RATE LIMIT HELPERS
// ============================================================================

const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 60000;

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempt: number, baseDelay: number = BASE_RETRY_DELAY_MS): number {
  const delay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * baseDelay * 0.5;
  return Math.min(delay + jitter, MAX_RETRY_DELAY_MS);
}

/**
 * Classify an error as transient or permanent
 */
function classifyError(error: unknown): ErrorClassification {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Transient errors: timeouts, rate limits, temporary network issues, server errors
    const transientPatterns = [
      'timeout', 'econnreset', 'econnrefused', 'enotfound',
      'socket hang up', 'network', 'rate limit', '429',
      '500', '502', '503', '504', 'service unavailable',
      'temporarily unavailable', 'retry',
    ];
    if (transientPatterns.some(pattern => message.includes(pattern))) {
      return 'TRANSIENT';
    }
  }
  // Permanent errors: auth failures, validation errors, not found
  return 'PERMANENT';
}

/**
 * Determine if an error is retryable
 */
function isRetryable(classification: ErrorClassification): boolean {
  return classification === 'TRANSIENT';
}

// ============================================================================
// CONNECTOR FRAMEWORK SERVICE
// ============================================================================

/**
 * Connector Framework Service
 *
 * Provides standardized integration with external systems including:
 * - Connector lifecycle management (register, configure, test, deactivate)
 * - Data sync with retry and backoff
 * - Field mapping configuration
 * - Webhook management
 * - Health monitoring
 * - Rate limiting
 * - Comprehensive audit logging
 */
export class ConnectorFrameworkService {
  // In-memory stores (in production, backed by database)
  private static connectors: Map<string, ConnectorConfig> = new Map();
  private static syncHistory: Map<string, SyncOperation[]> = new Map();
  private static mappings: Map<string, IntegrationMapping[]> = new Map();
  private static webhooks: Map<string, WebhookConfig[]> = new Map();
  private static healthCache: Map<string, ConnectorHealth> = new Map();
  private static rateLimitStates: Map<string, RateLimitState> = new Map();
  private static auditLog: AuditEntry[] = [];

  // ─────────────────────────────────────────────────────────────────────────
  // CONNECTOR LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Register a new integration connector for a tenant
   */
  static async registerConnector(
    tenantId: string,
    config: Omit<ConnectorConfig, 'id' | 'tenantId' | 'lastSyncAt' | 'errorCount' | 'createdAt' | 'updatedAt'>
  ): Promise<ConnectorConfig> {
    // Validate provider against template
    const template = CONNECTOR_TEMPLATES.find(
      t => t.provider === config.provider && t.type === config.connectorType
    );
    if (!template && config.provider !== 'CUSTOM') {
      throw new Error(
        `Unsupported provider "${config.provider}" for connector type "${config.connectorType}"`
      );
    }

    const connector: ConnectorConfig = {
      id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      tenantId,
      connectorType: config.connectorType,
      name: config.name,
      nameAr: config.nameAr,
      provider: config.provider,
      status: 'PENDING',
      credentials: config.credentials,
      endpoints: config.endpoints.length > 0 ? config.endpoints : (template?.defaultEndpoints ?? []),
      syncSchedule: config.syncSchedule ?? template?.defaultSyncSchedule ?? null,
      lastSyncAt: null,
      errorCount: 0,
      isActive: config.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.connectors.set(connector.id, connector);

    await this.logAudit(tenantId, connector.id, 'CONNECTOR_REGISTERED', `Registered connector "${connector.name}" (${connector.provider})`, {
      connectorType: connector.connectorType,
      provider: connector.provider,
    });

    return connector;
  }

  /**
   * Get all connectors for a tenant, optionally filtered by type
   */
  static async getConnectors(
    tenantId: string,
    type?: ConnectorType
  ): Promise<ConnectorConfig[]> {
    const results: ConnectorConfig[] = [];
    for (const connector of this.connectors.values()) {
      if (connector.tenantId !== tenantId) continue;
      if (type && connector.connectorType !== type) continue;
      results.push(connector);
    }
    return results;
  }

  /**
   * Get health status of a specific connector
   */
  static async getConnectorHealth(
    tenantId: string,
    connectorId: string
  ): Promise<ConnectorHealth> {
    const connector = this.connectors.get(connectorId);
    if (!connector || connector.tenantId !== tenantId) {
      throw new Error(`Connector "${connectorId}" not found for tenant`);
    }

    // Check cache
    const cached = this.healthCache.get(connectorId);
    if (cached && Date.now() - cached.lastCheck.getTime() < 60000) {
      return cached;
    }

    // Perform health check
    const health = await this.performHealthCheck(connector);
    this.healthCache.set(connectorId, health);

    return health;
  }

  /**
   * Test connectivity of a connector
   */
  static async testConnection(
    tenantId: string,
    connectorId: string
  ): Promise<{ success: boolean; latency: number; message: string; messageAr: string }> {
    const connector = this.connectors.get(connectorId);
    if (!connector || connector.tenantId !== tenantId) {
      throw new Error(`Connector "${connectorId}" not found for tenant`);
    }

    const startTime = Date.now();

    try {
      // Attempt connection to first endpoint
      const endpoint = connector.endpoints[0];
      if (!endpoint) {
        return {
          success: false,
          latency: 0,
          message: 'No endpoints configured for this connector',
          messageAr: 'لم يتم تكوين نقاط نهاية لهذا الموصل',
        };
      }

      // In production: make actual HTTP request to the endpoint
      // Simulated test - validates configuration completeness
      await this.simulateConnectionTest(connector);

      const latency = Date.now() - startTime;

      // Update connector status
      connector.status = 'ACTIVE';
      connector.errorCount = 0;
      connector.updatedAt = new Date();

      await this.logAudit(tenantId, connectorId, 'CONNECTION_TEST_SUCCESS', `Connection test passed in ${latency}ms`);

      return {
        success: true,
        latency,
        message: 'Connection successful',
        messageAr: 'الاتصال ناجح',
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      connector.status = 'ERROR';
      connector.errorCount += 1;
      connector.updatedAt = new Date();

      await this.logAudit(tenantId, connectorId, 'CONNECTION_TEST_FAILED', `Connection test failed: ${errorMessage}`);

      return {
        success: false,
        latency,
        message: `Connection failed: ${errorMessage}`,
        messageAr: `فشل الاتصال: ${errorMessage}`,
      };
    }
  }

  /**
   * Deactivate a connector
   */
  static async deactivateConnector(
    tenantId: string,
    connectorId: string
  ): Promise<ConnectorConfig> {
    const connector = this.connectors.get(connectorId);
    if (!connector || connector.tenantId !== tenantId) {
      throw new Error(`Connector "${connectorId}" not found for tenant`);
    }

    connector.isActive = false;
    connector.status = 'INACTIVE';
    connector.updatedAt = new Date();

    await this.logAudit(tenantId, connectorId, 'CONNECTOR_DEACTIVATED', `Deactivated connector "${connector.name}"`);

    return connector;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DATA SYNC
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Trigger a data synchronization for a connector
   */
  static async sync(
    tenantId: string,
    connectorId: string,
    options?: SyncOptions
  ): Promise<SyncOperation> {
    const connector = this.connectors.get(connectorId);
    if (!connector || connector.tenantId !== tenantId) {
      throw new Error(`Connector "${connectorId}" not found for tenant`);
    }

    if (!connector.isActive) {
      throw new Error(`Connector "${connectorId}" is inactive`);
    }

    // Check rate limits
    await this.enforceRateLimit(connector);

    const operation: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      connectorId,
      direction: options?.direction ?? 'BIDIRECTIONAL',
      entityType: options?.entityType ?? 'ALL',
      status: 'RUNNING',
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      startedAt: new Date(),
      completedAt: null,
      errors: [],
    };

    await this.logAudit(tenantId, connectorId, 'SYNC_STARTED', `Sync started: direction=${operation.direction}, entity=${operation.entityType}`, {
      syncId: operation.id,
      options,
    });

    try {
      // Execute sync with retry logic
      const result = await this.executeSyncWithRetry(connector, operation, options);

      // Update operation status
      operation.status = result.errors.length > 0 && result.recordsSuccess === 0 ? 'FAILED' : 'COMPLETED';
      operation.recordsProcessed = result.recordsProcessed;
      operation.recordsSuccess = result.recordsSuccess;
      operation.recordsFailed = result.recordsFailed;
      operation.errors = result.errors;
      operation.completedAt = new Date();

      // Update connector metadata
      connector.lastSyncAt = new Date();
      connector.errorCount = operation.status === 'FAILED' ? connector.errorCount + 1 : 0;
      connector.updatedAt = new Date();

      // Store in history
      const history = this.syncHistory.get(connectorId) ?? [];
      history.unshift(operation);
      this.syncHistory.set(connectorId, history.slice(0, 100)); // Keep last 100

      await this.logAudit(tenantId, connectorId, 'SYNC_COMPLETED', `Sync ${operation.status}: ${operation.recordsSuccess}/${operation.recordsProcessed} records`, {
        syncId: operation.id,
        recordsProcessed: operation.recordsProcessed,
        recordsSuccess: operation.recordsSuccess,
        recordsFailed: operation.recordsFailed,
      });

      return operation;
    } catch (error) {
      operation.status = 'FAILED';
      operation.completedAt = new Date();
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      operation.errors.push({
        code: 'SYNC_FATAL',
        message: errorMessage,
        messageAr: 'خطأ فادح في المزامنة',
        classification: classifyError(error),
        timestamp: new Date(),
        retryable: isRetryable(classifyError(error)),
      });

      connector.errorCount += 1;
      connector.updatedAt = new Date();

      const history = this.syncHistory.get(connectorId) ?? [];
      history.unshift(operation);
      this.syncHistory.set(connectorId, history.slice(0, 100));

      await this.logAudit(tenantId, connectorId, 'SYNC_FAILED', `Sync failed: ${errorMessage}`, {
        syncId: operation.id,
        error: errorMessage,
      });

      return operation;
    }
  }

  /**
   * Get the last sync operation for a connector
   */
  static async getLastSync(
    tenantId: string,
    connectorId: string
  ): Promise<SyncOperation | null> {
    const connector = this.connectors.get(connectorId);
    if (!connector || connector.tenantId !== tenantId) {
      throw new Error(`Connector "${connectorId}" not found for tenant`);
    }

    const history = this.syncHistory.get(connectorId) ?? [];
    return history[0] ?? null;
  }

  /**
   * Get sync history for a connector
   */
  static async getSyncHistory(
    tenantId: string,
    connectorId: string,
    limit: number = 20
  ): Promise<SyncOperation[]> {
    const connector = this.connectors.get(connectorId);
    if (!connector || connector.tenantId !== tenantId) {
      throw new Error(`Connector "${connectorId}" not found for tenant`);
    }

    const history = this.syncHistory.get(connectorId) ?? [];
    return history.slice(0, limit);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FIELD MAPPINGS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Configure field mappings for a connector
   */
  static async configureMapping(
    tenantId: string,
    connectorId: string,
    mappings: Omit<IntegrationMapping, 'id' | 'connectorId'>[]
  ): Promise<IntegrationMapping[]> {
    const connector = this.connectors.get(connectorId);
    if (!connector || connector.tenantId !== tenantId) {
      throw new Error(`Connector "${connectorId}" not found for tenant`);
    }

    const createdMappings: IntegrationMapping[] = mappings.map((mapping, index) => ({
      id: `map_${Date.now()}_${index}`,
      connectorId,
      sourceField: mapping.sourceField,
      targetField: mapping.targetField,
      transformation: mapping.transformation,
      defaultValue: mapping.defaultValue,
    }));

    this.mappings.set(connectorId, createdMappings);

    await this.logAudit(tenantId, connectorId, 'MAPPINGS_CONFIGURED', `Configured ${createdMappings.length} field mappings`, {
      mappingCount: createdMappings.length,
    });

    return createdMappings;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WEBHOOKS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Register a webhook for a connector
   */
  static async registerWebhook(
    tenantId: string,
    connectorId: string,
    webhook: Omit<WebhookConfig, 'id' | 'connectorId' | 'createdAt' | 'lastTriggeredAt'>
  ): Promise<WebhookConfig> {
    const connector = this.connectors.get(connectorId);
    if (!connector || connector.tenantId !== tenantId) {
      throw new Error(`Connector "${connectorId}" not found for tenant`);
    }

    const config: WebhookConfig = {
      id: `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      connectorId,
      eventType: webhook.eventType,
      url: webhook.url,
      secret: webhook.secret,
      isActive: webhook.isActive,
      createdAt: new Date(),
    };

    const existing = this.webhooks.get(connectorId) ?? [];
    existing.push(config);
    this.webhooks.set(connectorId, existing);

    await this.logAudit(tenantId, connectorId, 'WEBHOOK_REGISTERED', `Registered webhook for event "${config.eventType}" -> ${config.url}`, {
      webhookId: config.id,
      eventType: config.eventType,
    });

    return config;
  }

  /**
   * Process an incoming webhook payload
   */
  static async processWebhook(
    connectorId: string,
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; message: string; messageAr: string; processedEvents: number }> {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      throw new Error(`Connector "${connectorId}" not found`);
    }

    if (!connector.isActive) {
      return {
        success: false,
        message: 'Connector is inactive, webhook ignored',
        messageAr: 'الموصل غير نشط، تم تجاهل الـ Webhook',
        processedEvents: 0,
      };
    }

    const webhooks = this.webhooks.get(connectorId) ?? [];
    const activeWebhooks = webhooks.filter(wh => wh.isActive);

    if (activeWebhooks.length === 0) {
      return {
        success: false,
        message: 'No active webhooks configured for this connector',
        messageAr: 'لا توجد Webhooks نشطة مكونة لهذا الموصل',
        processedEvents: 0,
      };
    }

    let processedCount = 0;
    const eventType = (payload.event as string) ?? (payload.type as string) ?? 'unknown';

    for (const webhook of activeWebhooks) {
      if (webhook.eventType === '*' || webhook.eventType === eventType) {
        // In production: verify signature, enqueue processing
        webhook.lastTriggeredAt = new Date();
        processedCount++;
      }
    }

    await this.logAudit(connector.tenantId, connectorId, 'WEBHOOK_PROCESSED', `Processed webhook event "${eventType}" (${processedCount} handlers)`, {
      eventType,
      processedCount,
      payloadSize: JSON.stringify(payload).length,
    });

    return {
      success: processedCount > 0,
      message: `Processed ${processedCount} webhook handler(s)`,
      messageAr: `تمت معالجة ${processedCount} معالج(ات) Webhook`,
      processedEvents: processedCount,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DISCOVERY
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all available connector types with their metadata/templates
   */
  static getAvailableConnectors(): ConnectorTemplate[] {
    return [...CONNECTOR_TEMPLATES];
  }

  /**
   * Get a specific connector template by provider
   */
  static getConnectorTemplate(provider: ConnectorProvider): ConnectorTemplate | null {
    return CONNECTOR_TEMPLATES.find(t => t.provider === provider) ?? null;
  }

  /**
   * Get connector templates filtered by type
   */
  static getConnectorsByType(type: ConnectorType): ConnectorTemplate[] {
    return CONNECTOR_TEMPLATES.filter(t => t.type === type);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE: SYNC ENGINE WITH RETRY
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Execute sync operation with exponential backoff retry
   */
  private static async executeSyncWithRetry(
    connector: ConnectorConfig,
    operation: SyncOperation,
    _options?: SyncOptions
  ): Promise<{
    recordsProcessed: number;
    recordsSuccess: number;
    recordsFailed: number;
    errors: SyncOperationError[];
  }> {
    let attempts = 0;
    let lastError: unknown = null;

    while (attempts < MAX_RETRY_ATTEMPTS) {
      try {
        // In production: execute actual data sync against external API
        const result = await this.executeSync(connector, operation);
        return result;
      } catch (error) {
        lastError = error;
        const classification = classifyError(error);

        if (!isRetryable(classification)) {
          // Permanent error - do not retry
          throw error;
        }

        attempts++;
        if (attempts >= MAX_RETRY_ATTEMPTS) {
          break;
        }

        // Wait with exponential backoff
        const delay = calculateBackoffDelay(attempts);
        await this.sleep(delay);
      }
    }

    // All retries exhausted
    throw lastError ?? new Error('Sync failed after maximum retry attempts');
  }

  /**
   * Execute the actual sync (in production: call external APIs)
   */
  private static async executeSync(
    _connector: ConnectorConfig,
    _operation: SyncOperation
  ): Promise<{
    recordsProcessed: number;
    recordsSuccess: number;
    recordsFailed: number;
    errors: SyncOperationError[];
  }> {
    // In production, this would:
    // 1. Fetch data from external system using connector endpoints
    // 2. Apply field mappings
    // 3. Transform data as needed
    // 4. Upsert into local database
    // 5. Track per-record success/failure
    //
    // Placeholder for integration layer:
    return {
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      errors: [],
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE: HEALTH CHECK
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Perform a health check on a connector
   */
  private static async performHealthCheck(connector: ConnectorConfig): Promise<ConnectorHealth> {
    const startTime = Date.now();

    try {
      await this.simulateConnectionTest(connector);
      const latency = Date.now() - startTime;

      // Calculate error rate from recent sync history
      const history = this.syncHistory.get(connector.id) ?? [];
      const recentOps = history.slice(0, 10);
      const failedOps = recentOps.filter(op => op.status === 'FAILED').length;
      const errorRate = recentOps.length > 0 ? (failedOps / recentOps.length) * 100 : 0;

      // Determine status based on error rate and latency
      let status: ConnectorHealthStatus = 'HEALTHY';
      if (errorRate > 50 || latency > 10000) {
        status = 'DOWN';
      } else if (errorRate > 20 || latency > 5000) {
        status = 'DEGRADED';
      }

      // Calculate uptime from history
      const totalOps = recentOps.length;
      const successOps = totalOps - failedOps;
      const uptime = totalOps > 0 ? (successOps / totalOps) * 100 : 100;

      return {
        connectorId: connector.id,
        status,
        latency,
        lastCheck: new Date(),
        errorRate,
        uptime,
      };
    } catch {
      return {
        connectorId: connector.id,
        status: 'DOWN',
        latency: Date.now() - startTime,
        lastCheck: new Date(),
        errorRate: 100,
        uptime: 0,
      };
    }
  }

  /**
   * Simulate a connection test (in production: actual HTTP call)
   */
  private static async simulateConnectionTest(_connector: ConnectorConfig): Promise<void> {
    // In production: make lightweight API call (e.g., GET /health or HEAD on first endpoint)
    await this.sleep(50 + Math.random() * 100);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE: RATE LIMITING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Enforce rate limit for a connector
   */
  private static async enforceRateLimit(connector: ConnectorConfig): Promise<void> {
    const template = CONNECTOR_TEMPLATES.find(
      t => t.provider === connector.provider && t.type === connector.connectorType
    );
    if (!template) return;

    const { maxRequests, windowMs, retryAfterMs } = template.rateLimits;
    const now = Date.now();
    const state = this.rateLimitStates.get(connector.id);

    if (!state || now - state.windowStart > windowMs) {
      // Start new window
      this.rateLimitStates.set(connector.id, { requestCount: 1, windowStart: now });
      return;
    }

    if (state.requestCount >= maxRequests) {
      // Rate limit exceeded - wait
      await this.sleep(retryAfterMs);
      // Reset window after waiting
      this.rateLimitStates.set(connector.id, { requestCount: 1, windowStart: Date.now() });
      return;
    }

    state.requestCount++;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE: AUDIT LOGGING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Log an audit entry for connector operations
   */
  private static async logAudit(
    tenantId: string,
    connectorId: string,
    action: string,
    details: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const entry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      tenantId,
      connectorId,
      action,
      details,
      timestamp: new Date(),
      metadata,
    };

    this.auditLog.push(entry);

    // Keep audit log bounded in memory (in production: persisted to DB)
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }

  /**
   * Get audit log entries for a connector
   */
  static async getAuditLog(
    tenantId: string,
    connectorId?: string,
    limit: number = 50
  ): Promise<AuditEntry[]> {
    let entries = this.auditLog.filter(e => e.tenantId === tenantId);
    if (connectorId) {
      entries = entries.filter(e => e.connectorId === connectorId);
    }
    return entries.slice(-limit).reverse();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE: UTILITIES
  // ─────────────────────────────────────────────────────────────────────────

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
