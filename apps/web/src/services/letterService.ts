/**
 * @module letterService
 * @description ESS Letter Self-Service — letter template catalog, request generation,
 *              HR approval workflow, PDF download, request history (Sec 17.7)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type LetterType =
  | 'employment_verification'
  | 'salary_certificate'
  | 'noc'
  | 'experience_letter'
  | 'bank_letter'
  | 'visa_support'
  | 'address_proof'
  | 'service_letter';

export type LetterStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'ready'
  | 'downloaded';

export type LetterLanguage = 'en' | 'ar' | 'both';

export interface LetterField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface LetterTemplate {
  id: string;
  name: string;
  type: LetterType;
  description: string;
  icon: string;
  requiresApproval: boolean;
  slaBusinessDays: number;
  availableLanguages: LetterLanguage[];
  fields: LetterField[];
  purpose: string;
  commonUses: string[];
}

export interface LetterRequest {
  id: string;
  templateId: string;
  templateName: string;
  type: LetterType;
  employeeId: string;
  employeeName: string;
  department: string;
  requestedAt: string;
  status: LetterStatus;
  language: LetterLanguage;
  purpose: string;
  addressedTo?: string;
  fieldValues: Record<string, string>;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  downloadUrl?: string;
  downloadedAt?: string;
  expiryDate?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TEMPLATES: LetterTemplate[] = [
  {
    id: 'tmpl-001',
    name: 'Employment Verification Letter',
    type: 'employment_verification',
    description:
      'Confirms your current employment status, position, and start date with the company.',
    icon: '📋',
    requiresApproval: false,
    slaBusinessDays: 1,
    availableLanguages: ['en', 'ar', 'both'],
    purpose: 'Confirms active employment',
    commonUses: [
      'Visa applications',
      'Bank account opening',
      'Rental agreements',
      'Loan applications',
    ],
    fields: [
      {
        id: 'addressed_to',
        label: 'Addressed To',
        type: 'text',
        required: false,
        placeholder: 'e.g. Embassy of France, HSBC Bank',
      },
      {
        id: 'purpose',
        label: 'Purpose',
        type: 'text',
        required: true,
        placeholder: 'e.g. Visa application',
      },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        required: true,
        options: ['English', 'Arabic', 'Both'],
      },
      {
        id: 'additional_notes',
        label: 'Additional Notes',
        type: 'textarea',
        required: false,
        placeholder: 'Any specific information to include...',
      },
    ],
  },
  {
    id: 'tmpl-002',
    name: 'Salary Certificate',
    type: 'salary_certificate',
    description: 'Official certificate stating your monthly salary and compensation details.',
    icon: '💰',
    requiresApproval: true,
    slaBusinessDays: 2,
    availableLanguages: ['en', 'ar', 'both'],
    purpose: 'Confirms salary details',
    commonUses: ['Mortgage applications', 'Car loan', 'Personal loan', 'School admissions'],
    fields: [
      {
        id: 'addressed_to',
        label: 'Addressed To',
        type: 'text',
        required: false,
        placeholder: 'e.g. Bank Al Rajhi',
      },
      {
        id: 'purpose',
        label: 'Purpose',
        type: 'text',
        required: true,
        placeholder: 'e.g. Home mortgage application',
      },
      {
        id: 'include_allowances',
        label: 'Include Allowances',
        type: 'select',
        required: true,
        options: ['Yes - Show all components', 'No - Basic salary only'],
      },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        required: true,
        options: ['English', 'Arabic', 'Both'],
      },
    ],
  },
  {
    id: 'tmpl-003',
    name: 'No Objection Certificate (NOC)',
    type: 'noc',
    description:
      'Certifies that the company has no objection to you pursuing specified activities.',
    icon: '✅',
    requiresApproval: true,
    slaBusinessDays: 3,
    availableLanguages: ['en', 'ar', 'both'],
    purpose: 'No objection statement',
    commonUses: [
      'Part-time work',
      'Starting a business',
      'Attending university',
      'Transfer of sponsorship',
    ],
    fields: [
      { id: 'addressed_to', label: 'Addressed To', type: 'text', required: false },
      {
        id: 'purpose',
        label: 'Purpose',
        type: 'text',
        required: true,
        placeholder: 'e.g. Enrollment at King Saud University',
      },
      {
        id: 'activity',
        label: 'Requested Activity',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the activity requiring NOC...',
      },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        required: true,
        options: ['English', 'Arabic', 'Both'],
      },
    ],
  },
  {
    id: 'tmpl-004',
    name: 'Experience Letter',
    type: 'experience_letter',
    description: 'Detailed letter confirming work experience, roles, and responsibilities.',
    icon: '🏅',
    requiresApproval: true,
    slaBusinessDays: 3,
    availableLanguages: ['en', 'ar'],
    purpose: 'Confirms work experience',
    commonUses: [
      'New job applications',
      'Professional licensing',
      'Immigration',
      'Credential verification',
    ],
    fields: [
      { id: 'addressed_to', label: 'Addressed To', type: 'text', required: false },
      { id: 'purpose', label: 'Purpose', type: 'text', required: true },
      {
        id: 'roles_to_mention',
        label: 'Roles/Positions to Mention',
        type: 'textarea',
        required: false,
        placeholder: 'Leave blank to include all roles',
      },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        required: true,
        options: ['English', 'Arabic'],
      },
    ],
  },
  {
    id: 'tmpl-005',
    name: 'Bank Letter',
    type: 'bank_letter',
    description: 'Letter confirming employment for bank account or financial product applications.',
    icon: '🏦',
    requiresApproval: false,
    slaBusinessDays: 1,
    availableLanguages: ['en', 'ar', 'both'],
    purpose: 'Bank/financial institution letter',
    commonUses: ['Opening bank account', 'Credit card application', 'Investment account'],
    fields: [
      {
        id: 'bank_name',
        label: 'Bank Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Saudi National Bank',
      },
      {
        id: 'account_type',
        label: 'Account Type',
        type: 'select',
        required: false,
        options: [
          'Current Account',
          'Savings Account',
          'Salary Account',
          'Credit Card',
          'Home Finance',
          'Other',
        ],
      },
      { id: 'purpose', label: 'Purpose', type: 'text', required: true },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        required: true,
        options: ['English', 'Arabic', 'Both'],
      },
    ],
  },
  {
    id: 'tmpl-006',
    name: 'Visa Support Letter',
    type: 'visa_support',
    description: 'Supporting letter for visa applications confirming employment and salary.',
    icon: '✈️',
    requiresApproval: false,
    slaBusinessDays: 1,
    availableLanguages: ['en'],
    purpose: 'Visa and travel support',
    commonUses: ['Tourist visa', 'Business visa', 'Schengen visa', 'US/UK visa'],
    fields: [
      {
        id: 'destination_country',
        label: 'Destination Country',
        type: 'text',
        required: true,
        placeholder: 'e.g. United Kingdom',
      },
      { id: 'embassy', label: 'Embassy / Consulate', type: 'text', required: false },
      {
        id: 'travel_dates',
        label: 'Travel Dates',
        type: 'text',
        required: false,
        placeholder: 'e.g. 15 March - 30 March 2025',
      },
      { id: 'purpose', label: 'Purpose of Travel', type: 'text', required: true },
    ],
  },
  {
    id: 'tmpl-007',
    name: 'Address Proof Letter',
    type: 'address_proof',
    description: 'Confirms your residential address as registered with HR.',
    icon: '🏠',
    requiresApproval: false,
    slaBusinessDays: 1,
    availableLanguages: ['en', 'ar'],
    purpose: 'Address confirmation',
    commonUses: ['Utility connections', 'Government applications', 'School enrollment'],
    fields: [
      { id: 'addressed_to', label: 'Addressed To', type: 'text', required: false },
      { id: 'purpose', label: 'Purpose', type: 'text', required: true },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        required: true,
        options: ['English', 'Arabic'],
      },
    ],
  },
  {
    id: 'tmpl-008',
    name: 'Service Letter',
    type: 'service_letter',
    description: 'Comprehensive letter for employees who have completed their service.',
    icon: '📜',
    requiresApproval: true,
    slaBusinessDays: 5,
    availableLanguages: ['en', 'ar', 'both'],
    purpose: 'End of service confirmation',
    commonUses: ['GOSI claims', 'Gratuity calculation', 'Pension registration', 'Final settlement'],
    fields: [
      { id: 'addressed_to', label: 'Addressed To', type: 'text', required: false },
      { id: 'purpose', label: 'Purpose', type: 'text', required: true },
      { id: 'last_working_day', label: 'Last Working Day', type: 'date', required: false },
      {
        id: 'reason_for_leaving',
        label: 'Reason for Leaving',
        type: 'select',
        required: false,
        options: ['Resignation', 'End of contract', 'Retirement', 'Mutual agreement'],
      },
      {
        id: 'language',
        label: 'Language',
        type: 'select',
        required: true,
        options: ['English', 'Arabic', 'Both'],
      },
    ],
  },
];

const MOCK_REQUESTS: LetterRequest[] = [
  {
    id: 'req-001',
    templateId: 'tmpl-001',
    templateName: 'Employment Verification Letter',
    type: 'employment_verification',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2025-02-20T10:00:00Z',
    status: 'ready',
    language: 'en',
    purpose: 'UK Visa application',
    addressedTo: 'UK Visa & Immigration',
    fieldValues: { purpose: 'UK Visa application', addressed_to: 'UK Visa & Immigration' },
    approvedBy: 'HR System',
    approvedAt: '2025-02-20T11:30:00Z',
    downloadUrl: '/api/letters/req-001/download',
    expiryDate: '2025-05-20',
  },
  {
    id: 'req-002',
    templateId: 'tmpl-002',
    templateName: 'Salary Certificate',
    type: 'salary_certificate',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2025-02-15T09:00:00Z',
    status: 'approved',
    language: 'ar',
    purpose: 'Home mortgage with Al-Rajhi Bank',
    addressedTo: 'Al-Rajhi Bank',
    fieldValues: {
      purpose: 'Home mortgage',
      addressed_to: 'Al-Rajhi Bank',
      include_allowances: 'Yes - Show all components',
    },
    approvedBy: 'Sarah HR',
    approvedAt: '2025-02-17T14:00:00Z',
    downloadUrl: '/api/letters/req-002/download',
    expiryDate: '2025-05-15',
  },
  {
    id: 'req-003',
    templateId: 'tmpl-003',
    templateName: 'No Objection Certificate (NOC)',
    type: 'noc',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2025-02-10T11:00:00Z',
    status: 'under_review',
    language: 'both',
    purpose: 'MBA enrollment at KFUPM',
    fieldValues: { purpose: 'MBA enrollment', activity: 'Part-time MBA at King Fahd University' },
  },
  {
    id: 'req-004',
    templateId: 'tmpl-005',
    templateName: 'Bank Letter',
    type: 'bank_letter',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2025-01-20T08:00:00Z',
    status: 'downloaded',
    language: 'en',
    purpose: 'Opening a savings account',
    addressedTo: 'HSBC Bank',
    fieldValues: {
      bank_name: 'HSBC Bank',
      account_type: 'Savings Account',
      purpose: 'New account opening',
    },
    approvedBy: 'HR System',
    approvedAt: '2025-01-20T08:30:00Z',
    downloadUrl: '/api/letters/req-004/download',
    downloadedAt: '2025-01-21T10:00:00Z',
  },
  {
    id: 'req-005',
    templateId: 'tmpl-006',
    templateName: 'Visa Support Letter',
    type: 'visa_support',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2025-01-05T09:00:00Z',
    status: 'rejected',
    language: 'en',
    purpose: 'Schengen visa for France',
    fieldValues: { destination_country: 'France', purpose: 'Tourism' },
    rejectionReason:
      'Address registered with HR does not match provided address. Please update HR records first.',
  },
  {
    id: 'req-006',
    templateId: 'tmpl-001',
    templateName: 'Employment Verification Letter',
    type: 'employment_verification',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2024-12-01T09:00:00Z',
    status: 'downloaded',
    language: 'en',
    purpose: 'School enrollment for daughter',
    fieldValues: { purpose: 'School enrollment' },
    approvedBy: 'HR System',
    approvedAt: '2024-12-01T09:30:00Z',
    downloadUrl: '/api/letters/req-006/download',
    downloadedAt: '2024-12-02T11:00:00Z',
  },
  {
    id: 'req-007',
    templateId: 'tmpl-004',
    templateName: 'Experience Letter',
    type: 'experience_letter',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2024-11-10T10:00:00Z',
    status: 'downloaded',
    language: 'en',
    purpose: 'Professional Engineering License application',
    fieldValues: { purpose: 'PE License' },
    approvedBy: 'Ahmed HR Manager',
    approvedAt: '2024-11-12T15:00:00Z',
    downloadUrl: '/api/letters/req-007/download',
    downloadedAt: '2024-11-13T09:00:00Z',
  },
  {
    id: 'req-008',
    templateId: 'tmpl-007',
    templateName: 'Address Proof Letter',
    type: 'address_proof',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2024-10-05T08:00:00Z',
    status: 'downloaded',
    language: 'ar',
    purpose: 'Electricity connection',
    fieldValues: { purpose: 'Electricity connection application' },
    approvedBy: 'HR System',
    approvedAt: '2024-10-05T08:30:00Z',
    downloadUrl: '/api/letters/req-008/download',
    downloadedAt: '2024-10-05T11:00:00Z',
  },
  {
    id: 'req-009',
    templateId: 'tmpl-002',
    templateName: 'Salary Certificate',
    type: 'salary_certificate',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2024-09-20T09:00:00Z',
    status: 'downloaded',
    language: 'both',
    purpose: 'Car loan from SNB',
    addressedTo: 'Saudi National Bank',
    fieldValues: {
      purpose: 'Car loan',
      addressed_to: 'Saudi National Bank',
      include_allowances: 'Yes - Show all components',
    },
    approvedBy: 'Sarah HR',
    approvedAt: '2024-09-22T10:00:00Z',
    downloadUrl: '/api/letters/req-009/download',
    downloadedAt: '2024-09-22T14:00:00Z',
  },
  {
    id: 'req-010',
    templateId: 'tmpl-005',
    templateName: 'Bank Letter',
    type: 'bank_letter',
    employeeId: 'emp-current',
    employeeName: 'Ahmed Al-Rashidi',
    department: 'Engineering',
    requestedAt: '2024-08-15T09:00:00Z',
    status: 'downloaded',
    language: 'en',
    purpose: 'Credit card application',
    addressedTo: 'Riyad Bank',
    fieldValues: { bank_name: 'Riyad Bank', account_type: 'Credit Card', purpose: 'Credit card' },
    approvedBy: 'HR System',
    approvedAt: '2024-08-15T09:30:00Z',
    downloadUrl: '/api/letters/req-010/download',
    downloadedAt: '2024-08-16T08:00:00Z',
  },
];

// ============================================================================
// SERVICE
// ============================================================================

export class LetterService {
  // ── Get Letter Templates ───────────────────────────────────────────────────

  static async getLetterTemplates(): Promise<LetterTemplate[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_TEMPLATES];
  }

  // ── Request Letter ─────────────────────────────────────────────────────────

  static async requestLetter(
    templateId: string,
    params: {
      language: LetterLanguage;
      purpose: string;
      addressedTo?: string;
      fieldValues: Record<string, string>;
    }
  ): Promise<LetterRequest> {
    await new Promise((r) => setTimeout(r, 400));
    const template = MOCK_TEMPLATES.find((t) => t.id === templateId);
    if (!template) throw new Error('Template not found');

    const request: LetterRequest = {
      id: `req-${Date.now()}`,
      templateId,
      templateName: template.name,
      type: template.type,
      employeeId: 'emp-current',
      employeeName: 'Ahmed Al-Rashidi',
      department: 'Engineering',
      requestedAt: new Date().toISOString(),
      status: template.requiresApproval ? 'submitted' : 'ready',
      language: params.language,
      purpose: params.purpose,
      addressedTo: params.addressedTo,
      fieldValues: params.fieldValues,
      ...(template.requiresApproval
        ? {}
        : {
            approvedBy: 'HR System (Auto)',
            approvedAt: new Date().toISOString(),
            downloadUrl: `/api/letters/req-new/download`,
          }),
    };

    MOCK_REQUESTS.unshift(request);
    return request;
  }

  // ── Get My Letter Requests ─────────────────────────────────────────────────

  static async getMyLetterRequests(employeeId: string): Promise<LetterRequest[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_REQUESTS.filter((r) => r.employeeId === employeeId);
  }

  // ── Approve Letter (HR) ────────────────────────────────────────────────────

  static async approveLetter(requestId: string): Promise<LetterRequest> {
    await new Promise((r) => setTimeout(r, 300));
    const req = MOCK_REQUESTS.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');
    req.status = 'approved';
    req.approvedBy = 'HR Manager';
    req.approvedAt = new Date().toISOString();
    req.downloadUrl = `/api/letters/${requestId}/download`;
    return req;
  }

  // ── Download Letter ────────────────────────────────────────────────────────

  static async downloadLetter(requestId: string): Promise<{ url: string; filename: string }> {
    await new Promise((r) => setTimeout(r, 300));
    const req = MOCK_REQUESTS.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');
    req.status = 'downloaded';
    req.downloadedAt = new Date().toISOString();
    return {
      url: req.downloadUrl ?? `/api/letters/${requestId}/download`,
      filename: `${req.templateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
    };
  }

  // ── Get Letter History ─────────────────────────────────────────────────────

  static async getLetterHistory(employeeId: string): Promise<LetterRequest[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_REQUESTS.filter(
      (r) => r.employeeId === employeeId && ['downloaded', 'rejected'].includes(r.status)
    );
  }
}
