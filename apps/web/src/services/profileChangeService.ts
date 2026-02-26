/**
 * @module profileChangeService
 * @description Profile Change Requests Service — bank/address/personal info change submissions,
 *              approvals, document verification and audit trail (Sec 17.2)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type ChangeRequestStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type ChangeType =
  | 'bank_details'
  | 'permanent_address'
  | 'current_address'
  | 'emergency_contact'
  | 'personal_info'
  | 'contact_info'
  | 'tax_declaration';

export type VerificationDocumentType =
  | 'cancelled_cheque'
  | 'bank_statement'
  | 'utility_bill'
  | 'government_id'
  | 'address_proof'
  | 'other';

// ── Bank Details ──────────────────────────────────────────────────────────────

export interface BankDetailsChange {
  accountHolderName: string;
  accountNumber: string;
  iban?: string;
  bankName: string;
  bankCode?: string;
  branchName?: string;
  branchCode?: string;
  routingNumber?: string;
  swiftCode?: string;
  accountType: 'savings' | 'checking' | 'current';
  currency?: string;
  isPrimary?: boolean;
}

// ── Address ───────────────────────────────────────────────────────────────────

export interface AddressChange {
  addressType: 'permanent' | 'current' | 'mailing';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ── Emergency Contact ─────────────────────────────────────────────────────────

export interface EmergencyContactChange {
  name: string;
  relationship: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

// ── Personal Info ─────────────────────────────────────────────────────────────

export interface PersonalInfoChange {
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'domestic_partner';
  nationality?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  preferredName?: string;
  bloodGroup?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationalId?: string;
  dependentCount?: number;
}

// ── Contact Info ──────────────────────────────────────────────────────────────

export interface ContactInfoChange {
  personalEmail?: string;
  workPhone?: string;
  personalPhone?: string;
  mobilePhone?: string;
  extension?: string;
}

// ── Tax Declaration ───────────────────────────────────────────────────────────

export interface TaxDeclarationChange {
  taxId?: string;
  panNumber?: string;
  taxRegime?: 'old' | 'new';
  declarationYear?: string;
  investmentProofs?: string[];
  exemptions?: { type: string; amount: number }[];
}

// ── Change Data Union ─────────────────────────────────────────────────────────

export type ChangeData =
  | BankDetailsChange
  | AddressChange
  | EmergencyContactChange
  | PersonalInfoChange
  | ContactInfoChange
  | TaxDeclarationChange;

// ── Change Request ────────────────────────────────────────────────────────────

export interface ChangeRequest {
  id: string;
  requestCode: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentId: string;
  departmentName: string;
  changeType: ChangeType;
  changeTypeName: string;
  status: ChangeRequestStatus;
  priority: 'normal' | 'urgent';
  currentValues: ChangeData;
  requestedValues: ChangeData;
  reason?: string;
  effectiveDate?: string;
  approverId?: string;
  approverName?: string;
  approvedDate?: string;
  rejectedReason?: string;
  verificationRequired: boolean;
  verificationDocuments: VerificationDocument[];
  history: ChangeRequestHistoryEntry[];
  createdDate: string;
  submittedDate?: string;
  lastModified: string;
  tags: string[];
}

export interface VerificationDocument {
  id: string;
  changeRequestId: string;
  documentType: VerificationDocumentType;
  documentName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedDate: string;
  uploadedBy: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
}

export interface ChangeRequestHistoryEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action:
    | 'created'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'verification_requested'
    | 'document_uploaded'
    | 'document_verified'
    | 'modified';
  details: string;
  oldStatus?: ChangeRequestStatus;
  newStatus?: ChangeRequestStatus;
}

// ── Create/Filter DTOs ────────────────────────────────────────────────────────

export interface CreateChangeRequestData {
  employeeId: string;
  changeType: ChangeType;
  requestedValues: ChangeData;
  reason?: string;
  effectiveDate?: string;
  priority?: 'normal' | 'urgent';
}

export interface ChangeRequestFilters {
  status?: ChangeRequestStatus;
  changeType?: ChangeType;
  employeeId?: string;
  departmentId?: string;
  approverId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ── Change Type Meta ──────────────────────────────────────────────────────────

export interface ChangeTypeMeta {
  type: ChangeType;
  label: string;
  description: string;
  icon: string;
  requiresVerification: boolean;
  verificationDocTypes: VerificationDocumentType[];
  requiresApproval: boolean;
  effectiveDateRequired: boolean;
  fields: ChangeTypeField[];
}

export interface ChangeTypeField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'number' | 'textarea';
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: 'cr-001',
    requestCode: 'PCR-2026-02-001',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeEmail: 'jane.doe@company.com',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    changeType: 'bank_details',
    changeTypeName: 'Bank Account Details',
    status: 'pending_verification',
    priority: 'normal',
    currentValues: {
      accountHolderName: 'Jane Doe',
      accountNumber: '****4521',
      bankName: 'Chase Bank',
      branchName: 'Downtown NYC',
      accountType: 'checking',
      currency: 'USD',
      isPrimary: true,
    } as BankDetailsChange,
    requestedValues: {
      accountHolderName: 'Jane Doe',
      accountNumber: '****8834',
      iban: 'US12CHAS00000000008834',
      bankName: 'Bank of America',
      branchName: 'Midtown NYC',
      routingNumber: '021000021',
      accountType: 'checking',
      currency: 'USD',
      isPrimary: true,
    } as BankDetailsChange,
    reason: 'Switching to Bank of America for better online banking features',
    effectiveDate: '2026-03-01',
    verificationRequired: true,
    verificationDocuments: [
      {
        id: 'vdoc-001',
        changeRequestId: 'cr-001',
        documentType: 'cancelled_cheque',
        documentName: 'cancelled_cheque.pdf',
        fileUrl: '/docs/cancelled_cheque.pdf',
        fileSize: 204800,
        fileType: 'application/pdf',
        uploadedDate: '2026-02-20T10:00:00Z',
        uploadedBy: 'emp-001',
        status: 'pending',
      },
    ],
    history: [
      {
        id: 'hist-001',
        timestamp: '2026-02-19T14:00:00Z',
        userId: 'emp-001',
        userName: 'Jane Doe',
        action: 'created',
        details: 'Change request PCR-2026-02-001 created',
        newStatus: 'draft',
      },
      {
        id: 'hist-002',
        timestamp: '2026-02-19T14:05:00Z',
        userId: 'emp-001',
        userName: 'Jane Doe',
        action: 'submitted',
        details: 'Change request submitted for verification',
        oldStatus: 'draft',
        newStatus: 'pending_verification',
      },
    ],
    createdDate: '2026-02-19T14:00:00Z',
    submittedDate: '2026-02-19T14:05:00Z',
    lastModified: '2026-02-20T10:00:00Z',
    tags: ['bank', 'payroll'],
  },
  {
    id: 'cr-002',
    requestCode: 'PCR-2026-02-002',
    employeeId: 'emp-002',
    employeeName: 'John Smith',
    employeeEmail: 'john.smith@company.com',
    departmentId: 'dept-005',
    departmentName: 'Sales & Marketing',
    changeType: 'current_address',
    changeTypeName: 'Current Address',
    status: 'pending_approval',
    priority: 'normal',
    currentValues: {
      addressType: 'current',
      line1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    } as AddressChange,
    requestedValues: {
      addressType: 'current',
      line1: '456 Park Avenue',
      line2: 'Apt 8B',
      city: 'New York',
      state: 'NY',
      postalCode: '10022',
      country: 'US',
    } as AddressChange,
    reason: 'Relocated to new apartment',
    effectiveDate: '2026-03-01',
    approverId: 'mgr-002',
    approverName: 'Jennifer Martinez',
    verificationRequired: true,
    verificationDocuments: [
      {
        id: 'vdoc-002',
        changeRequestId: 'cr-002',
        documentType: 'utility_bill',
        documentName: 'utility_bill_feb_2026.pdf',
        fileUrl: '/docs/utility_bill_feb_2026.pdf',
        fileSize: 512000,
        fileType: 'application/pdf',
        uploadedDate: '2026-02-21T09:30:00Z',
        uploadedBy: 'emp-002',
        status: 'verified',
        verifiedBy: 'hr-001',
        verifiedDate: '2026-02-22T11:00:00Z',
      },
    ],
    history: [
      {
        id: 'hist-003',
        timestamp: '2026-02-20T09:00:00Z',
        userId: 'emp-002',
        userName: 'John Smith',
        action: 'created',
        details: 'Change request created',
        newStatus: 'draft',
      },
      {
        id: 'hist-004',
        timestamp: '2026-02-20T09:15:00Z',
        userId: 'emp-002',
        userName: 'John Smith',
        action: 'submitted',
        details: 'Submitted for approval',
        oldStatus: 'draft',
        newStatus: 'pending_approval',
      },
    ],
    createdDate: '2026-02-20T09:00:00Z',
    submittedDate: '2026-02-20T09:15:00Z',
    lastModified: '2026-02-22T11:00:00Z',
    tags: ['address', 'relocation'],
  },
  {
    id: 'cr-003',
    requestCode: 'PCR-2026-01-045',
    employeeId: 'emp-003',
    employeeName: 'Sarah Lee',
    employeeEmail: 'sarah.lee@company.com',
    departmentId: 'dept-003',
    departmentName: 'Human Resources',
    changeType: 'personal_info',
    changeTypeName: 'Personal Information',
    status: 'approved',
    priority: 'normal',
    currentValues: {
      maritalStatus: 'single',
      dependentCount: 0,
    } as PersonalInfoChange,
    requestedValues: {
      maritalStatus: 'married',
      dependentCount: 1,
    } as PersonalInfoChange,
    reason: 'Recently married — updating marital status and adding spouse as dependent',
    effectiveDate: '2026-01-20',
    approverId: 'mgr-003',
    approverName: 'David Kim',
    approvedDate: '2026-01-25T10:00:00Z',
    verificationRequired: false,
    verificationDocuments: [],
    history: [
      {
        id: 'hist-005',
        timestamp: '2026-01-22T14:00:00Z',
        userId: 'emp-003',
        userName: 'Sarah Lee',
        action: 'created',
        details: 'Change request created',
        newStatus: 'draft',
      },
      {
        id: 'hist-006',
        timestamp: '2026-01-22T14:10:00Z',
        userId: 'emp-003',
        userName: 'Sarah Lee',
        action: 'submitted',
        details: 'Submitted for approval',
        oldStatus: 'draft',
        newStatus: 'pending_approval',
      },
      {
        id: 'hist-007',
        timestamp: '2026-01-25T10:00:00Z',
        userId: 'mgr-003',
        userName: 'David Kim',
        action: 'approved',
        details: 'Approved — congratulations on the marriage!',
        oldStatus: 'pending_approval',
        newStatus: 'approved',
      },
    ],
    createdDate: '2026-01-22T14:00:00Z',
    submittedDate: '2026-01-22T14:10:00Z',
    lastModified: '2026-01-25T10:00:00Z',
    tags: ['personal', 'marital-status'],
  },
];

// ============================================================================
// CHANGE TYPE DEFINITIONS
// ============================================================================

const CHANGE_TYPE_CATALOG: ChangeTypeMeta[] = [
  {
    type: 'bank_details',
    label: 'Bank Account Details',
    description: 'Update salary deposit account, IBAN, or bank details',
    icon: 'Landmark',
    requiresVerification: true,
    verificationDocTypes: ['cancelled_cheque', 'bank_statement'],
    requiresApproval: true,
    effectiveDateRequired: true,
    fields: [
      {
        key: 'accountHolderName',
        label: 'Account Holder Name',
        type: 'text',
        required: true,
        placeholder: 'Full name as on bank records',
      },
      {
        key: 'accountNumber',
        label: 'Account Number',
        type: 'text',
        required: true,
        placeholder: 'Enter account number',
      },
      {
        key: 'iban',
        label: 'IBAN',
        type: 'text',
        required: false,
        placeholder: 'e.g. GB29NWBK60161331926819',
      },
      {
        key: 'bankName',
        label: 'Bank Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. Chase Bank',
      },
      { key: 'branchName', label: 'Branch Name', type: 'text', required: false },
      { key: 'routingNumber', label: 'Routing / Sort Code', type: 'text', required: false },
      { key: 'swiftCode', label: 'SWIFT / BIC Code', type: 'text', required: false },
      {
        key: 'accountType',
        label: 'Account Type',
        type: 'select',
        required: true,
        options: [
          { value: 'checking', label: 'Checking' },
          { value: 'savings', label: 'Savings' },
          { value: 'current', label: 'Current' },
        ],
      },
    ],
  },
  {
    type: 'permanent_address',
    label: 'Permanent Address',
    description: 'Update your permanent residential address',
    icon: 'Home',
    requiresVerification: true,
    verificationDocTypes: ['utility_bill', 'government_id', 'address_proof'],
    requiresApproval: true,
    effectiveDateRequired: false,
    fields: [
      { key: 'line1', label: 'Address Line 1', type: 'text', required: true },
      { key: 'line2', label: 'Address Line 2', type: 'text', required: false },
      { key: 'city', label: 'City', type: 'text', required: true },
      { key: 'state', label: 'State / Province', type: 'text', required: true },
      { key: 'postalCode', label: 'Postal / ZIP Code', type: 'text', required: true },
      { key: 'country', label: 'Country', type: 'text', required: true },
    ],
  },
  {
    type: 'current_address',
    label: 'Current Address',
    description: 'Update your current living address',
    icon: 'MapPin',
    requiresVerification: true,
    verificationDocTypes: ['utility_bill', 'address_proof'],
    requiresApproval: false,
    effectiveDateRequired: false,
    fields: [
      { key: 'line1', label: 'Address Line 1', type: 'text', required: true },
      { key: 'line2', label: 'Address Line 2', type: 'text', required: false },
      { key: 'city', label: 'City', type: 'text', required: true },
      { key: 'state', label: 'State / Province', type: 'text', required: true },
      { key: 'postalCode', label: 'Postal / ZIP Code', type: 'text', required: true },
      { key: 'country', label: 'Country', type: 'text', required: true },
    ],
  },
  {
    type: 'emergency_contact',
    label: 'Emergency Contact',
    description: 'Add or update your emergency contact information',
    icon: 'HeartPulse',
    requiresVerification: false,
    verificationDocTypes: [],
    requiresApproval: false,
    effectiveDateRequired: false,
    fields: [
      { key: 'name', label: 'Contact Name', type: 'text', required: true },
      {
        key: 'relationship',
        label: 'Relationship',
        type: 'text',
        required: true,
        placeholder: 'e.g. Spouse, Parent, Sibling',
      },
      { key: 'phone', label: 'Primary Phone', type: 'phone', required: true },
      { key: 'altPhone', label: 'Alternate Phone', type: 'phone', required: false },
      { key: 'email', label: 'Email', type: 'email', required: false },
      { key: 'address', label: 'Address', type: 'textarea', required: false },
    ],
  },
  {
    type: 'personal_info',
    label: 'Personal Information',
    description: 'Update marital status, nationality, or other personal details',
    icon: 'User',
    requiresVerification: false,
    verificationDocTypes: [],
    requiresApproval: true,
    effectiveDateRequired: false,
    fields: [
      {
        key: 'maritalStatus',
        label: 'Marital Status',
        type: 'select',
        required: false,
        options: [
          { value: 'single', label: 'Single' },
          { value: 'married', label: 'Married' },
          { value: 'divorced', label: 'Divorced' },
          { value: 'widowed', label: 'Widowed' },
          { value: 'domestic_partner', label: 'Domestic Partner' },
        ],
      },
      { key: 'nationality', label: 'Nationality', type: 'text', required: false },
      { key: 'preferredName', label: 'Preferred Name', type: 'text', required: false },
      { key: 'dependentCount', label: 'Number of Dependents', type: 'number', required: false },
      { key: 'passportNumber', label: 'Passport Number', type: 'text', required: false },
      { key: 'passportExpiry', label: 'Passport Expiry Date', type: 'date', required: false },
      { key: 'nationalId', label: 'National ID Number', type: 'text', required: false },
    ],
  },
  {
    type: 'contact_info',
    label: 'Contact Information',
    description: 'Update phone numbers and personal email address',
    icon: 'Phone',
    requiresVerification: false,
    verificationDocTypes: [],
    requiresApproval: false,
    effectiveDateRequired: false,
    fields: [
      { key: 'personalEmail', label: 'Personal Email', type: 'email', required: false },
      { key: 'workPhone', label: 'Work Phone', type: 'phone', required: false },
      { key: 'personalPhone', label: 'Personal Phone', type: 'phone', required: false },
      { key: 'mobilePhone', label: 'Mobile Phone', type: 'phone', required: false },
      { key: 'extension', label: 'Extension', type: 'text', required: false },
    ],
  },
  {
    type: 'tax_declaration',
    label: 'Tax Declaration',
    description: 'Update tax ID, PAN, or investment declaration for the fiscal year',
    icon: 'FileText',
    requiresVerification: false,
    verificationDocTypes: [],
    requiresApproval: true,
    effectiveDateRequired: true,
    fields: [
      { key: 'taxId', label: 'Tax ID / TIN', type: 'text', required: false },
      { key: 'panNumber', label: 'PAN Number', type: 'text', required: false },
      {
        key: 'taxRegime',
        label: 'Tax Regime',
        type: 'select',
        required: false,
        options: [
          { value: 'old', label: 'Old Regime' },
          { value: 'new', label: 'New Regime' },
        ],
      },
      {
        key: 'declarationYear',
        label: 'Financial Year',
        type: 'text',
        required: false,
        placeholder: 'e.g. 2025-26',
      },
    ],
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class ProfileChangeService {
  /**
   * Submit a new profile change request
   */
  static async createChangeRequest(data: CreateChangeRequestData): Promise<ChangeRequest> {
    try {
      return await APIClient.post<ChangeRequest>('/v1/profile-changes', data);
    } catch {
      const meta = CHANGE_TYPE_CATALOG.find((c) => c.type === data.changeType);
      const newRequest: ChangeRequest = {
        id: `cr-${Date.now()}`,
        requestCode: `PCR-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(MOCK_CHANGE_REQUESTS.length + 1).padStart(3, '0')}`,
        employeeId: data.employeeId,
        employeeName: 'Current Employee',
        employeeEmail: 'employee@company.com',
        departmentId: 'dept-001',
        departmentName: 'Your Department',
        changeType: data.changeType,
        changeTypeName: meta?.label ?? data.changeType,
        status: 'draft',
        priority: data.priority ?? 'normal',
        currentValues: {} as ChangeData,
        requestedValues: data.requestedValues,
        reason: data.reason,
        effectiveDate: data.effectiveDate,
        verificationRequired: meta?.requiresVerification ?? false,
        verificationDocuments: [],
        history: [
          {
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: data.employeeId,
            userName: 'Current Employee',
            action: 'created',
            details: `Change request created for ${meta?.label ?? data.changeType}`,
            newStatus: 'draft',
          },
        ],
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [],
      };
      MOCK_CHANGE_REQUESTS.push(newRequest);
      return newRequest;
    }
  }

  /**
   * List change requests with filters
   */
  static async getChangeRequests(filters?: ChangeRequestFilters): Promise<ChangeRequest[]> {
    try {
      return await APIClient.get<ChangeRequest[]>('/v1/profile-changes', filters);
    } catch {
      let results = [...MOCK_CHANGE_REQUESTS];
      if (filters?.status) results = results.filter((r) => r.status === filters.status);
      if (filters?.changeType) results = results.filter((r) => r.changeType === filters.changeType);
      if (filters?.employeeId) results = results.filter((r) => r.employeeId === filters.employeeId);
      if (filters?.departmentId)
        results = results.filter((r) => r.departmentId === filters.departmentId);
      if (filters?.approverId) results = results.filter((r) => r.approverId === filters.approverId);
      return results;
    }
  }

  /**
   * Get a single change request with full history
   */
  static async getChangeRequest(id: string): Promise<ChangeRequest | null> {
    try {
      return await APIClient.get<ChangeRequest>(`/v1/profile-changes/${id}`);
    } catch {
      return MOCK_CHANGE_REQUESTS.find((r) => r.id === id) ?? null;
    }
  }

  /**
   * Approve a change request and apply the change
   */
  static async approveChange(
    id: string,
    approverId: string,
    comments?: string
  ): Promise<ChangeRequest> {
    try {
      return await APIClient.post<ChangeRequest>(`/v1/profile-changes/${id}/approve`, {
        approverId,
        comments,
      });
    } catch {
      const request = MOCK_CHANGE_REQUESTS.find((r) => r.id === id);
      if (!request) throw new Error(`Change request ${id} not found`);
      request.status = 'approved';
      request.approverId = approverId;
      request.approvedDate = new Date().toISOString();
      request.lastModified = new Date().toISOString();
      request.history.push({
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: approverId,
        userName: 'Approver',
        action: 'approved',
        details: comments ?? 'Change request approved and applied',
        oldStatus: request.status,
        newStatus: 'approved',
      });
      return request;
    }
  }

  /**
   * Reject a change request with a reason
   */
  static async rejectChange(id: string, reason: string): Promise<ChangeRequest> {
    try {
      return await APIClient.post<ChangeRequest>(`/v1/profile-changes/${id}/reject`, { reason });
    } catch {
      const request = MOCK_CHANGE_REQUESTS.find((r) => r.id === id);
      if (!request) throw new Error(`Change request ${id} not found`);
      const prevStatus = request.status;
      request.status = 'rejected';
      request.rejectedReason = reason;
      request.lastModified = new Date().toISOString();
      request.history.push({
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'approver',
        userName: 'Approver',
        action: 'rejected',
        details: reason,
        oldStatus: prevStatus,
        newStatus: 'rejected',
      });
      return request;
    }
  }

  /**
   * Get available change types with their metadata and field definitions
   */
  static async getChangeTypes(): Promise<ChangeTypeMeta[]> {
    try {
      return await APIClient.get<ChangeTypeMeta[]>('/v1/profile-changes/types');
    } catch {
      return CHANGE_TYPE_CATALOG;
    }
  }

  /**
   * Upload a verification document for a change request
   */
  static async uploadVerificationDocument(
    changeRequestId: string,
    documentType: VerificationDocumentType,
    file: { name: string; size: number; type: string }
  ): Promise<VerificationDocument> {
    try {
      return await APIClient.post<VerificationDocument>(
        `/v1/profile-changes/${changeRequestId}/documents`,
        { documentType, ...file }
      );
    } catch {
      const doc: VerificationDocument = {
        id: `vdoc-${Date.now()}`,
        changeRequestId,
        documentType,
        documentName: file.name,
        fileUrl: `/uploads/${file.name}`,
        fileSize: file.size,
        fileType: file.type,
        uploadedDate: new Date().toISOString(),
        uploadedBy: 'emp-001',
        status: 'pending',
      };
      const request = MOCK_CHANGE_REQUESTS.find((r) => r.id === changeRequestId);
      if (request) {
        request.verificationDocuments.push(doc);
        request.lastModified = new Date().toISOString();
      }
      return doc;
    }
  }

  /**
   * Verify or reject a verification document
   */
  static async verifyDocument(
    changeRequestId: string,
    documentId: string,
    status: 'verified' | 'rejected',
    reason?: string
  ): Promise<VerificationDocument> {
    try {
      return await APIClient.put<VerificationDocument>(
        `/v1/profile-changes/${changeRequestId}/documents/${documentId}`,
        { status, reason }
      );
    } catch {
      const request = MOCK_CHANGE_REQUESTS.find((r) => r.id === changeRequestId);
      if (!request) throw new Error(`Change request ${changeRequestId} not found`);
      const doc = request.verificationDocuments.find((d) => d.id === documentId);
      if (!doc) throw new Error(`Document ${documentId} not found`);
      doc.status = status;
      doc.verifiedBy = 'hr-admin';
      doc.verifiedDate = new Date().toISOString();
      if (reason) doc.rejectionReason = reason;
      return doc;
    }
  }

  /**
   * Submit a draft change request for approval/verification
   */
  static async submitChangeRequest(id: string): Promise<ChangeRequest> {
    try {
      return await APIClient.post<ChangeRequest>(`/v1/profile-changes/${id}/submit`, {});
    } catch {
      const request = MOCK_CHANGE_REQUESTS.find((r) => r.id === id);
      if (!request) throw new Error(`Change request ${id} not found`);
      const prevStatus = request.status;
      request.status = request.verificationRequired ? 'pending_verification' : 'pending_approval';
      request.submittedDate = new Date().toISOString();
      request.lastModified = new Date().toISOString();
      request.history.push({
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: request.employeeId,
        userName: request.employeeName,
        action: 'submitted',
        details: 'Change request submitted',
        oldStatus: prevStatus,
        newStatus: request.status,
      });
      return request;
    }
  }

  /**
   * Cancel a pending change request
   */
  static async cancelChangeRequest(id: string, reason?: string): Promise<ChangeRequest> {
    try {
      return await APIClient.post<ChangeRequest>(`/v1/profile-changes/${id}/cancel`, { reason });
    } catch {
      const request = MOCK_CHANGE_REQUESTS.find((r) => r.id === id);
      if (!request) throw new Error(`Change request ${id} not found`);
      const prevStatus = request.status;
      request.status = 'cancelled';
      request.lastModified = new Date().toISOString();
      request.history.push({
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: request.employeeId,
        userName: request.employeeName,
        action: 'cancelled',
        details: reason ?? 'Change request cancelled',
        oldStatus: prevStatus,
        newStatus: 'cancelled',
      });
      return request;
    }
  }
}

// ============================================================================
// CONSTANTS / META
// ============================================================================

export const CHANGE_REQUEST_STATUS_META: Record<
  ChangeRequestStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: 'Draft', color: 'text-slate-500', bgColor: 'bg-slate-100' },
  submitted: { label: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  pending_approval: { label: 'Pending Approval', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  pending_verification: {
    label: 'Pending Verification',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  approved: { label: 'Approved', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-50' },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', bgColor: 'bg-gray-50' },
};

export const CHANGE_TYPE_META: Record<ChangeType, { label: string; icon: string; color: string }> =
  {
    bank_details: { label: 'Bank Details', icon: 'Landmark', color: 'text-emerald-600' },
    permanent_address: { label: 'Permanent Address', icon: 'Home', color: 'text-blue-600' },
    current_address: { label: 'Current Address', icon: 'MapPin', color: 'text-indigo-600' },
    emergency_contact: { label: 'Emergency Contact', icon: 'HeartPulse', color: 'text-red-600' },
    personal_info: { label: 'Personal Info', icon: 'User', color: 'text-purple-600' },
    contact_info: { label: 'Contact Info', icon: 'Phone', color: 'text-cyan-600' },
    tax_declaration: { label: 'Tax Declaration', icon: 'FileText', color: 'text-orange-600' },
  };
