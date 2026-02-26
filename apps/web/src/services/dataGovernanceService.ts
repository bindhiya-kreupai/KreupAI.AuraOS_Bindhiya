/**
 * @module dataGovernanceService
 * @description Data Governance Service — GDPR/CCPA DSARs, consent management,
 *              data retention policies, data map, and privacy reports.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

// ── DSAR ──────────────────────────────────────────────────────────────────────

export type DSARType =
  | 'access' // Right to access: send all data held
  | 'rectification' // Right to correct inaccurate data
  | 'erasure' // Right to be forgotten
  | 'portability' // Export data in machine-readable format
  | 'restriction' // Restrict processing
  | 'objection'; // Object to processing

export type DSARStatus =
  | 'received'
  | 'acknowledged'
  | 'processing'
  | 'review'
  | 'completed'
  | 'rejected'
  | 'withdrawn';

export type DSARRegulation = 'gdpr' | 'ccpa' | 'pdpa' | 'lgpd' | 'other';

export interface DSARRequest {
  id: string;
  requestCode: string;
  type: DSARType;
  regulation: DSARRegulation;
  subjectId: string; // Employee / data subject ID
  subjectName: string;
  subjectEmail: string;
  status: DSARStatus;
  submittedAt: string;
  acknowledgedAt?: string;
  dueDate: string; // GDPR: 30 days, CCPA: 45 days
  completedAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  notes?: string;
  rejectionReason?: string;
  attachments: string[];
  auditLog: DSARAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DSARAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface CreateDSARInput {
  type: DSARType;
  regulation: DSARRegulation;
  subjectId: string;
  notes?: string;
}

// ── Consent ───────────────────────────────────────────────────────────────────

export type ConsentPurpose =
  | 'payroll_processing'
  | 'benefits_administration'
  | 'analytics'
  | 'marketing'
  | 'training_records'
  | 'background_checks'
  | 'health_data'
  | 'biometric_data'
  | 'third_party_sharing';

export interface ConsentRecord {
  id: string;
  employeeId: string;
  purpose: ConsentPurpose;
  purposeLabel: string;
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  ipAddress?: string;
  channel: 'web' | 'email' | 'paper' | 'verbal' | 'system';
  legalBasis:
    | 'consent'
    | 'contract'
    | 'legal_obligation'
    | 'vital_interests'
    | 'public_task'
    | 'legitimate_interests';
  expiresAt?: string;
  version: string;
  updatedAt: string;
}

export interface ConsentHistory {
  id: string;
  consentId: string;
  purpose: ConsentPurpose;
  action: 'granted' | 'revoked' | 'updated';
  timestamp: string;
  performedBy: string;
  previousValue: boolean;
  newValue: boolean;
  reason?: string;
}

// ── Retention Policies ────────────────────────────────────────────────────────

export type RetentionCategory =
  | 'personal_data'
  | 'employment_records'
  | 'payroll_data'
  | 'health_data'
  | 'communications'
  | 'financial_data'
  | 'recruitment_data'
  | 'audit_logs';

export interface DataRetentionPolicy {
  id: string;
  category: RetentionCategory;
  label: string;
  description: string;
  retentionPeriodMonths: number;
  legalBasis: string;
  regulation: string[];
  autoDelete: boolean;
  requiresReview: boolean;
  lastReviewedAt?: string;
  nextReviewAt?: string;
}

// ── Data Map ──────────────────────────────────────────────────────────────────

export interface DataMapEntry {
  id: string;
  dataCategory: string;
  dataTypes: string[];
  purpose: string;
  legalBasis: string;
  storageLocation: string;
  thirdParties?: string[];
  retentionPeriod: string;
  securityMeasures: string[];
  crossBorderTransfer: boolean;
  transferSafeguards?: string;
}

// ── Privacy Report ────────────────────────────────────────────────────────────

export interface PrivacyReport {
  employeeId: string;
  employeeName: string;
  generatedAt: string;
  sections: {
    personalData: Record<string, unknown>;
    employmentData: Record<string, unknown>;
    payrollData: Record<string, unknown>;
    consentHistory: ConsentHistory[];
    dsarHistory: { id: string; type: DSARType; status: DSARStatus; submittedAt: string }[];
    loginHistory: { timestamp: string; ipAddress: string; success: boolean }[];
  };
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export interface GovernanceMetrics {
  totalDSARs: number;
  openDSARs: number;
  overdueCount: number;
  avgCompletionDays: number;
  completionRate: number;
  byType: { type: DSARType; count: number }[];
  byStatus: { status: DSARStatus; count: number }[];
  byRegulation: { regulation: DSARRegulation; count: number }[];
  monthlyTrend: { month: string; submitted: number; completed: number }[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DSAR_SLA_DAYS: Record<DSARRegulation, number> = {
  gdpr: 30,
  ccpa: 45,
  pdpa: 30,
  lgpd: 15,
  other: 30,
};

function getDueDate(submittedAt: string, regulation: DSARRegulation): string {
  const d = new Date(submittedAt);
  d.setDate(d.getDate() + DSAR_SLA_DAYS[regulation]);
  return d.toISOString();
}

const MOCK_DSARS: DSARRequest[] = [
  {
    id: 'dsar-001',
    requestCode: 'DSAR-2026-001',
    type: 'access',
    regulation: 'gdpr',
    subjectId: 'emp-001',
    subjectName: 'Sarah Johnson',
    subjectEmail: 'sarah.johnson@company.com',
    status: 'processing',
    submittedAt: '2026-02-10T09:00:00Z',
    acknowledgedAt: '2026-02-10T10:00:00Z',
    dueDate: getDueDate('2026-02-10T09:00:00Z', 'gdpr'),
    assignedTo: 'hr-admin',
    assignedToName: 'HR Administrator',
    attachments: [],
    auditLog: [
      {
        id: 'log-001',
        timestamp: '2026-02-10T09:00:00Z',
        userId: 'system',
        userName: 'System',
        action: 'Created',
        details: 'DSAR request received via portal',
      },
      {
        id: 'log-002',
        timestamp: '2026-02-10T10:00:00Z',
        userId: 'hr-admin',
        userName: 'HR Administrator',
        action: 'Acknowledged',
        details: 'Request acknowledged and assigned to HR team',
      },
    ],
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'dsar-002',
    requestCode: 'DSAR-2026-002',
    type: 'erasure',
    regulation: 'gdpr',
    subjectId: 'emp-010',
    subjectName: 'James Wilson',
    subjectEmail: 'james.wilson@company.com',
    status: 'review',
    submittedAt: '2026-02-01T14:00:00Z',
    acknowledgedAt: '2026-02-02T09:00:00Z',
    dueDate: getDueDate('2026-02-01T14:00:00Z', 'gdpr'),
    assignedTo: 'hr-manager',
    assignedToName: 'HR Manager',
    notes: 'Former employee requesting deletion of all personal data after contract end.',
    attachments: [],
    auditLog: [],
    createdAt: '2026-02-01T14:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'dsar-003',
    requestCode: 'DSAR-2026-003',
    type: 'portability',
    regulation: 'ccpa',
    subjectId: 'emp-003',
    subjectName: 'Sarah Lee',
    subjectEmail: 'sarah.lee@company.com',
    status: 'completed',
    submittedAt: '2026-01-15T10:00:00Z',
    acknowledgedAt: '2026-01-15T11:00:00Z',
    completedAt: '2026-01-25T15:00:00Z',
    dueDate: getDueDate('2026-01-15T10:00:00Z', 'ccpa'),
    assignedTo: 'hr-admin',
    assignedToName: 'HR Administrator',
    attachments: ['export-emp003.zip'],
    auditLog: [],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-25T15:00:00Z',
  },
];

const MOCK_CONSENTS: ConsentRecord[] = [
  {
    id: 'con-001',
    employeeId: 'emp-001',
    purpose: 'payroll_processing',
    purposeLabel: 'Payroll Processing',
    granted: true,
    grantedAt: '2022-03-15T09:00:00Z',
    channel: 'system',
    legalBasis: 'contract',
    version: '2.0',
    updatedAt: '2022-03-15T09:00:00Z',
  },
  {
    id: 'con-002',
    employeeId: 'emp-001',
    purpose: 'analytics',
    purposeLabel: 'HR Analytics',
    granted: true,
    grantedAt: '2022-03-15T09:00:00Z',
    channel: 'web',
    legalBasis: 'consent',
    version: '2.0',
    updatedAt: '2022-03-15T09:00:00Z',
  },
  {
    id: 'con-003',
    employeeId: 'emp-001',
    purpose: 'marketing',
    purposeLabel: 'Marketing Communications',
    granted: false,
    revokedAt: '2023-06-01T10:00:00Z',
    channel: 'web',
    legalBasis: 'consent',
    version: '2.0',
    updatedAt: '2023-06-01T10:00:00Z',
  },
  {
    id: 'con-004',
    employeeId: 'emp-001',
    purpose: 'training_records',
    purposeLabel: 'Training & Development Records',
    granted: true,
    grantedAt: '2022-03-15T09:00:00Z',
    channel: 'system',
    legalBasis: 'legitimate_interests',
    version: '2.0',
    updatedAt: '2022-03-15T09:00:00Z',
  },
  {
    id: 'con-005',
    employeeId: 'emp-001',
    purpose: 'health_data',
    purposeLabel: 'Health & Benefits Data',
    granted: true,
    grantedAt: '2022-04-01T09:00:00Z',
    channel: 'paper',
    legalBasis: 'consent',
    version: '1.0',
    updatedAt: '2022-04-01T09:00:00Z',
  },
];

const MOCK_RETENTION_POLICIES: DataRetentionPolicy[] = [
  {
    id: 'ret-001',
    category: 'personal_data',
    label: 'Employee Personal Data',
    description: 'Name, address, contact details, identification documents',
    retentionPeriodMonths: 84,
    legalBasis: 'Employment contract and legal obligations',
    regulation: ['GDPR', 'CCPA', 'LABOR_LAW'],
    autoDelete: false,
    requiresReview: true,
    lastReviewedAt: '2026-01-01T00:00:00Z',
    nextReviewAt: '2027-01-01T00:00:00Z',
  },
  {
    id: 'ret-002',
    category: 'payroll_data',
    label: 'Payroll & Financial Records',
    description: 'Salary records, tax documents, bank account details',
    retentionPeriodMonths: 84,
    legalBasis: 'Tax and employment regulations',
    regulation: ['TAX_LAW', 'EMPLOYMENT_ACT', 'GDPR'],
    autoDelete: false,
    requiresReview: false,
  },
  {
    id: 'ret-003',
    category: 'recruitment_data',
    label: 'Unsuccessful Candidate Data',
    description: 'CVs, interview notes, assessment results for rejected candidates',
    retentionPeriodMonths: 12,
    legalBasis: 'Legitimate interests (re-engagement)',
    regulation: ['GDPR', 'CCPA'],
    autoDelete: true,
    requiresReview: false,
  },
  {
    id: 'ret-004',
    category: 'audit_logs',
    label: 'System Audit Logs',
    description: 'User activity, data access, and change logs',
    retentionPeriodMonths: 24,
    legalBasis: 'Security and legal obligations',
    regulation: ['GDPR', 'SOC2', 'ISO27001'],
    autoDelete: true,
    requiresReview: false,
  },
  {
    id: 'ret-005',
    category: 'health_data',
    label: 'Health & Medical Data',
    description: 'Medical certificates, health assessments, disability data',
    retentionPeriodMonths: 84,
    legalBasis: 'Employment law and health regulations',
    regulation: ['GDPR', 'HIPAA', 'EMPLOYMENT_ACT'],
    autoDelete: false,
    requiresReview: true,
  },
];

const MOCK_DATA_MAP: DataMapEntry[] = [
  {
    id: 'dm-001',
    dataCategory: 'Identity Data',
    dataTypes: ['Name', 'Employee ID', 'Photo', 'Date of Birth', 'National ID'],
    purpose: 'Employee identification and management',
    legalBasis: 'Contract',
    storageLocation: 'Core HR Database (encrypted)',
    retentionPeriod: '7 years after employment end',
    securityMeasures: ['AES-256 encryption', 'Role-based access', 'Audit logging'],
    crossBorderTransfer: false,
  },
  {
    id: 'dm-002',
    dataCategory: 'Financial Data',
    dataTypes: ['Salary', 'Bank Account', 'Tax Deductions', 'Benefits Cost'],
    purpose: 'Payroll processing and tax compliance',
    legalBasis: 'Legal obligation',
    storageLocation: 'Payroll System (segregated)',
    thirdParties: ['Payroll Provider', 'Tax Authority'],
    retentionPeriod: '7 years',
    securityMeasures: ['AES-256 encryption', 'MFA required', 'Limited access'],
    crossBorderTransfer: true,
    transferSafeguards: 'Standard Contractual Clauses (SCCs)',
  },
  {
    id: 'dm-003',
    dataCategory: 'Performance Data',
    dataTypes: ['Reviews', 'KPIs', 'Goals', 'Training Records', '360 Feedback'],
    purpose: 'Performance management and career development',
    legalBasis: 'Legitimate interests',
    storageLocation: 'Performance Module',
    retentionPeriod: '5 years',
    securityMeasures: ['Role-based access', 'Data minimization'],
    crossBorderTransfer: false,
  },
  {
    id: 'dm-004',
    dataCategory: 'Sensitive Personal Data',
    dataTypes: ['Health records', 'Disability status', 'Religious accommodations'],
    purpose: 'Benefits administration, legal compliance',
    legalBasis: 'Consent / Legal obligation',
    storageLocation: 'Benefits System (restricted)',
    retentionPeriod: '7 years after employment end',
    securityMeasures: ['Extra access controls', 'Dedicated DPA role', 'Audit logging'],
    crossBorderTransfer: false,
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class DataGovernanceService {
  /**
   * Get all DSAR requests with optional filters
   */
  static async getDataSubjectRequests(filters?: {
    status?: DSARStatus;
    type?: DSARType;
    regulation?: DSARRegulation;
    page?: number;
    pageSize?: number;
  }): Promise<{ requests: DSARRequest[]; total: number }> {
    try {
      return await APIClient.get<{ requests: DSARRequest[]; total: number }>(
        '/v1/governance/dsars',
        filters
      );
    } catch {
      let results = [...MOCK_DSARS];
      if (filters?.status) results = results.filter((r) => r.status === filters.status);
      if (filters?.type) results = results.filter((r) => r.type === filters.type);
      if (filters?.regulation) results = results.filter((r) => r.regulation === filters.regulation);
      return { requests: results, total: results.length };
    }
  }

  /**
   * Create a new DSAR request
   */
  static async createDSAR(input: CreateDSARInput): Promise<DSARRequest> {
    try {
      return await APIClient.post<DSARRequest>('/v1/governance/dsars', input);
    } catch {
      const request: DSARRequest = {
        id: `dsar-${Date.now()}`,
        requestCode: `DSAR-${new Date().getFullYear()}-${String(MOCK_DSARS.length + 1).padStart(3, '0')}`,
        type: input.type,
        regulation: input.regulation,
        subjectId: input.subjectId,
        subjectName: 'Employee Name',
        subjectEmail: 'employee@company.com',
        status: 'received',
        submittedAt: new Date().toISOString(),
        dueDate: getDueDate(new Date().toISOString(), input.regulation),
        notes: input.notes,
        attachments: [],
        auditLog: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: 'system',
            userName: 'System',
            action: 'Created',
            details: `DSAR (${input.type}) submitted`,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_DSARS.unshift(request);
      return request;
    }
  }

  /**
   * Update a DSAR request status
   */
  static async updateDSARStatus(
    id: string,
    status: DSARStatus,
    notes?: string
  ): Promise<DSARRequest> {
    try {
      return await APIClient.put<DSARRequest>(`/v1/governance/dsars/${id}`, { status, notes });
    } catch {
      const req = MOCK_DSARS.find((r) => r.id === id);
      if (!req) throw new Error(`DSAR ${id} not found`);
      req.status = status;
      if (notes) req.notes = notes;
      if (status === 'completed') req.completedAt = new Date().toISOString();
      req.updatedAt = new Date().toISOString();
      req.auditLog.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        userName: 'Current User',
        action: 'Status updated',
        details: `Status changed to ${status}${notes ? `: ${notes}` : ''}`,
      });
      return req;
    }
  }

  /**
   * Get all consent records for an employee
   */
  static async getConsentRecords(employeeId: string): Promise<ConsentRecord[]> {
    try {
      return await APIClient.get<ConsentRecord[]>(`/v1/governance/consent/${employeeId}`);
    } catch {
      return MOCK_CONSENTS.filter((c) => c.employeeId === employeeId);
    }
  }

  /**
   * Update an employee's consent for a specific purpose
   */
  static async updateConsent(
    employeeId: string,
    purpose: ConsentPurpose,
    granted: boolean,
    reason?: string
  ): Promise<ConsentRecord> {
    try {
      return await APIClient.put<ConsentRecord>(`/v1/governance/consent/${employeeId}/${purpose}`, {
        granted,
        reason,
      });
    } catch {
      const existing = MOCK_CONSENTS.find(
        (c) => c.employeeId === employeeId && c.purpose === purpose
      );
      const now = new Date().toISOString();
      if (existing) {
        existing.granted = granted;
        if (granted) {
          existing.grantedAt = now;
          existing.revokedAt = undefined;
        } else {
          existing.revokedAt = now;
        }
        existing.updatedAt = now;
        return existing;
      }
      const newRecord: ConsentRecord = {
        id: `con-${Date.now()}`,
        employeeId,
        purpose,
        purposeLabel: purpose.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        granted,
        grantedAt: granted ? now : undefined,
        revokedAt: !granted ? now : undefined,
        channel: 'web',
        legalBasis: 'consent',
        version: '2.0',
        updatedAt: now,
      };
      MOCK_CONSENTS.push(newRecord);
      return newRecord;
    }
  }

  /**
   * Get data retention policies
   */
  static async getDataRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    try {
      return await APIClient.get<DataRetentionPolicy[]>('/v1/governance/retention-policies');
    } catch {
      return MOCK_RETENTION_POLICIES;
    }
  }

  /**
   * Get the organization's data map
   */
  static async getDataMap(): Promise<DataMapEntry[]> {
    try {
      return await APIClient.get<DataMapEntry[]>('/v1/governance/data-map');
    } catch {
      return MOCK_DATA_MAP;
    }
  }

  /**
   * Generate a privacy report for a specific employee (Right of Access)
   */
  static async generatePrivacyReport(employeeId: string): Promise<PrivacyReport> {
    try {
      return await APIClient.post<PrivacyReport>(`/v1/governance/privacy-report/${employeeId}`, {});
    } catch {
      return {
        employeeId,
        employeeName: 'Employee Name',
        generatedAt: new Date().toISOString(),
        sections: {
          personalData: {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            phone: '+1-555-0101',
            address: '123 Main St, New York, NY',
            dateOfBirth: '1990-05-15',
            nationalId: '***-**-1234',
          },
          employmentData: {
            employeeId,
            title: 'Senior Software Engineer',
            department: 'Engineering',
            hireDate: '2022-03-15',
            managerId: 'emp-010',
            employmentType: 'full_time',
          },
          payrollData: {
            salaryBand: 'Band 4',
            payFrequency: 'monthly',
            currency: 'USD',
            lastReviewDate: '2026-01-15',
          },
          consentHistory: [],
          dsarHistory: [],
          loginHistory: [],
        },
      };
    }
  }

  /**
   * Get governance compliance metrics
   */
  static async getMetrics(): Promise<GovernanceMetrics> {
    try {
      return await APIClient.get<GovernanceMetrics>('/v1/governance/metrics');
    } catch {
      const now = new Date();
      return {
        totalDSARs: MOCK_DSARS.length,
        openDSARs: MOCK_DSARS.filter(
          (r) => !['completed', 'rejected', 'withdrawn'].includes(r.status)
        ).length,
        overdueCount: MOCK_DSARS.filter(
          (r) =>
            new Date(r.dueDate) < now && !['completed', 'rejected', 'withdrawn'].includes(r.status)
        ).length,
        avgCompletionDays: 12,
        completionRate: 85,
        byType: [
          { type: 'access', count: 1 },
          { type: 'erasure', count: 1 },
          { type: 'portability', count: 1 },
        ],
        byStatus: [
          { status: 'processing', count: 1 },
          { status: 'review', count: 1 },
          { status: 'completed', count: 1 },
        ],
        byRegulation: [
          { regulation: 'gdpr', count: 2 },
          { regulation: 'ccpa', count: 1 },
        ],
        monthlyTrend: [
          { month: '2025-12', submitted: 2, completed: 2 },
          { month: '2026-01', submitted: 1, completed: 1 },
          { month: '2026-02', submitted: 2, completed: 0 },
        ],
      };
    }
  }
}

// ── Meta ───────────────────────────────────────────────────────────────────────

export const DSAR_TYPE_META: Record<
  DSARType,
  { label: string; description: string; color: string }
> = {
  access: {
    label: 'Right of Access',
    description: 'Request a copy of all personal data held',
    color: 'text-blue-600',
  },
  rectification: {
    label: 'Right to Rectify',
    description: 'Correct inaccurate personal data',
    color: 'text-amber-600',
  },
  erasure: {
    label: 'Right to Erasure',
    description: 'Request deletion of personal data',
    color: 'text-red-600',
  },
  portability: {
    label: 'Data Portability',
    description: 'Receive data in machine-readable format',
    color: 'text-purple-600',
  },
  restriction: {
    label: 'Restrict Processing',
    description: 'Limit how personal data is used',
    color: 'text-orange-600',
  },
  objection: {
    label: 'Right to Object',
    description: 'Object to specific uses of data',
    color: 'text-slate-600',
  },
};

export const DSAR_STATUS_META: Record<
  DSARStatus,
  { label: string; color: string; bgColor: string }
> = {
  received: { label: 'Received', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  acknowledged: { label: 'Acknowledged', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  processing: { label: 'Processing', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  review: { label: 'Under Review', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  completed: { label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50' },
  withdrawn: { label: 'Withdrawn', color: 'text-gray-500', bgColor: 'bg-gray-50' },
};

export const CONSENT_PURPOSE_META: Record<
  ConsentPurpose,
  { label: string; description: string; required: boolean }
> = {
  payroll_processing: {
    label: 'Payroll Processing',
    description: 'Processing salary payments and tax deductions',
    required: true,
  },
  benefits_administration: {
    label: 'Benefits Administration',
    description: 'Managing health insurance, pension, and other benefits',
    required: true,
  },
  analytics: {
    label: 'HR Analytics',
    description: 'Aggregated workforce analytics and reporting',
    required: false,
  },
  marketing: {
    label: 'Marketing Communications',
    description: 'Receiving company news, events, and promotions',
    required: false,
  },
  training_records: {
    label: 'Training & Development Records',
    description: 'Maintaining learning and certification history',
    required: false,
  },
  background_checks: {
    label: 'Background Checks',
    description: 'Employment verification and background screening',
    required: false,
  },
  health_data: {
    label: 'Health & Medical Data',
    description: 'Processing health-related information for benefits',
    required: false,
  },
  biometric_data: {
    label: 'Biometric Data',
    description: 'Fingerprint or facial recognition for attendance',
    required: false,
  },
  third_party_sharing: {
    label: 'Third-Party Sharing',
    description: 'Sharing data with authorized third-party providers',
    required: false,
  },
};

export { DSAR_SLA_DAYS };
export default DataGovernanceService;
