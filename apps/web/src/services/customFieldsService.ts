/**
 * @module customFieldsService
 * @description Custom Fields Engine — define, reorder, and manage custom fields for entities;
 *              get and set custom field values per entity instance.
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'file'
  | 'email'
  | 'phone'
  | 'url'
  | 'rich-text';

export type EntityType = 'employee' | 'department' | 'position' | 'leave' | 'expense' | 'candidate';

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternDescription?: string;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  customRules?: string[];
}

export interface CustomField {
  id: string;
  entityType: EntityType;
  name: string;
  apiKey: string; // snake_case key for API
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean | string[];
  options?: FieldOption[]; // for select, multi-select
  validation: FieldValidation;
  displayOrder: number;
  isActive: boolean;
  isSystemField: boolean; // system fields cannot be deleted
  usageCount: number; // how many entities have a value for this field
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldValue {
  fieldId: string;
  fieldName: string;
  fieldType: FieldType;
  entityId: string;
  entityType: EntityType;
  value: string | number | boolean | string[] | null;
  updatedAt: string;
}

export interface CreateCustomFieldInput {
  entityType: EntityType;
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean | string[];
  options?: FieldOption[];
  validation?: FieldValidation;
}

export interface UpdateCustomFieldInput {
  name?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean | string[];
  options?: FieldOption[];
  validation?: FieldValidation;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_FIELDS: CustomField[] = [
  // Employee Custom Fields
  {
    id: 'cf-001',
    entityType: 'employee',
    name: 'shirt_size',
    apiKey: 'shirt_size',
    label: 'T-Shirt Size',
    type: 'select',
    description: 'Required for company swag orders',
    placeholder: 'Select size',
    options: [
      { value: 'XS', label: 'Extra Small (XS)' },
      { value: 'S', label: 'Small (S)' },
      { value: 'M', label: 'Medium (M)' },
      { value: 'L', label: 'Large (L)' },
      { value: 'XL', label: 'Extra Large (XL)' },
      { value: 'XXL', label: 'XX-Large (XXL)' },
    ],
    validation: { required: false },
    displayOrder: 1,
    isActive: true,
    isSystemField: false,
    usageCount: 198,
    createdBy: 'hr-admin',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'cf-002',
    entityType: 'employee',
    name: 'emergency_contact_phone',
    apiKey: 'emergency_contact_phone',
    label: 'Emergency Contact Phone',
    type: 'phone',
    description: 'Emergency contact secondary phone number',
    placeholder: '+1-555-0100',
    validation: {
      required: true,
      pattern: '^\\+?[1-9]\\d{1,14}$',
      patternDescription: 'Must be a valid international phone number',
    },
    displayOrder: 2,
    isActive: true,
    isSystemField: false,
    usageCount: 312,
    createdBy: 'hr-admin',
    createdAt: '2025-03-15T00:00:00Z',
    updatedAt: '2025-03-15T00:00:00Z',
  },
  {
    id: 'cf-003',
    entityType: 'employee',
    name: 'certifications',
    apiKey: 'certifications',
    label: 'Professional Certifications',
    type: 'multi-select',
    description: 'Select all applicable professional certifications',
    options: [
      { value: 'aws-sa', label: 'AWS Solutions Architect', color: '#FF9900' },
      { value: 'aws-dev', label: 'AWS Developer', color: '#FF9900' },
      { value: 'azure-fundamentals', label: 'Azure Fundamentals', color: '#0078D4' },
      { value: 'gcp-ace', label: 'GCP Associate Cloud Engineer', color: '#4285F4' },
      { value: 'pmp', label: 'PMP', color: '#6C3483' },
      { value: 'cissp', label: 'CISSP', color: '#C0392B' },
      { value: 'scrum-master', label: 'Scrum Master', color: '#1ABC9C' },
      { value: 'cpa', label: 'CPA', color: '#2ECC71' },
    ],
    validation: { required: false },
    displayOrder: 3,
    isActive: true,
    isSystemField: false,
    usageCount: 145,
    createdBy: 'hr-admin',
    createdAt: '2025-04-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 'cf-004',
    entityType: 'employee',
    name: 'remote_work_days_per_week',
    apiKey: 'remote_work_days_per_week',
    label: 'Remote Work Days/Week',
    type: 'number',
    description: 'Number of approved remote work days per week',
    placeholder: '2',
    defaultValue: 2,
    validation: { required: false, min: 0, max: 5 },
    displayOrder: 4,
    isActive: true,
    isSystemField: false,
    usageCount: 276,
    createdBy: 'hr-admin',
    createdAt: '2025-05-01T00:00:00Z',
    updatedAt: '2025-05-01T00:00:00Z',
  },
  {
    id: 'cf-005',
    entityType: 'employee',
    name: 'linkedin_profile',
    apiKey: 'linkedin_profile',
    label: 'LinkedIn Profile',
    type: 'url',
    placeholder: 'https://linkedin.com/in/username',
    validation: {
      required: false,
      pattern: '^https:\\/\\/(www\\.)?linkedin\\.com\\/in\\/',
      patternDescription: 'Must be a valid LinkedIn profile URL',
    },
    displayOrder: 5,
    isActive: true,
    isSystemField: false,
    usageCount: 189,
    createdBy: 'hr-admin',
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
  },

  // Department Custom Fields
  {
    id: 'cf-006',
    entityType: 'department',
    name: 'cost_center_code',
    apiKey: 'cost_center_code',
    label: 'Cost Center Code',
    type: 'text',
    description: 'Finance cost center identifier for budget allocation',
    placeholder: 'CC-2024-001',
    validation: {
      required: true,
      pattern: '^CC-\\d{4}-\\d{3}$',
      patternDescription: 'Format: CC-YYYY-NNN',
    },
    displayOrder: 1,
    isActive: true,
    isSystemField: false,
    usageCount: 12,
    createdBy: 'finance-admin',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'cf-007',
    entityType: 'department',
    name: 'is_revenue_generating',
    apiKey: 'is_revenue_generating',
    label: 'Revenue-Generating Department',
    type: 'checkbox',
    description: 'Check if this department directly generates revenue',
    defaultValue: false,
    validation: { required: false },
    displayOrder: 2,
    isActive: true,
    isSystemField: false,
    usageCount: 12,
    createdBy: 'finance-admin',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },

  // Position Custom Fields
  {
    id: 'cf-008',
    entityType: 'position',
    name: 'salary_band',
    apiKey: 'salary_band',
    label: 'Salary Band',
    type: 'select',
    options: [
      { value: 'IC1', label: 'IC1 — Entry Level', color: '#86EFAC' },
      { value: 'IC2', label: 'IC2 — Mid Level', color: '#4ADE80' },
      { value: 'IC3', label: 'IC3 — Senior', color: '#22C55E' },
      { value: 'IC4', label: 'IC4 — Staff', color: '#16A34A' },
      { value: 'M1', label: 'M1 — Manager', color: '#3B82F6' },
      { value: 'M2', label: 'M2 — Senior Manager', color: '#2563EB' },
      { value: 'D1', label: 'D1 — Director', color: '#7C3AED' },
      { value: 'VP', label: 'VP — Vice President', color: '#6D28D9' },
    ],
    validation: { required: true },
    displayOrder: 1,
    isActive: true,
    isSystemField: false,
    usageCount: 45,
    createdBy: 'comp-admin',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-07-01T00:00:00Z',
  },

  // Candidate Custom Fields
  {
    id: 'cf-009',
    entityType: 'candidate',
    name: 'resume_source',
    apiKey: 'resume_source',
    label: 'Application Source',
    type: 'select',
    options: [
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'indeed', label: 'Indeed' },
      { value: 'referral', label: 'Employee Referral' },
      { value: 'careers_page', label: 'Company Careers Page' },
      { value: 'glassdoor', label: 'Glassdoor' },
      { value: 'campus', label: 'Campus Recruiting' },
      { value: 'agency', label: 'Recruiting Agency' },
      { value: 'other', label: 'Other' },
    ],
    validation: { required: true },
    displayOrder: 1,
    isActive: true,
    isSystemField: false,
    usageCount: 234,
    createdBy: 'recruiter-admin',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'cf-010',
    entityType: 'candidate',
    name: 'github_profile',
    apiKey: 'github_profile',
    label: 'GitHub Profile',
    type: 'url',
    placeholder: 'https://github.com/username',
    description: 'For technical roles — portfolio and code samples',
    validation: {
      required: false,
      pattern: '^https:\\/\\/github\\.com\\/',
      patternDescription: 'Must be a valid GitHub URL',
    },
    displayOrder: 2,
    isActive: true,
    isSystemField: false,
    usageCount: 89,
    createdBy: 'recruiter-admin',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
];

const MOCK_VALUES: CustomFieldValue[] = [
  {
    fieldId: 'cf-001',
    fieldName: 'T-Shirt Size',
    fieldType: 'select',
    entityId: 'emp-001',
    entityType: 'employee',
    value: 'M',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    fieldId: 'cf-002',
    fieldName: 'Emergency Contact Phone',
    fieldType: 'phone',
    entityId: 'emp-001',
    entityType: 'employee',
    value: '+1-555-0201',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    fieldId: 'cf-003',
    fieldName: 'Professional Certifications',
    fieldType: 'multi-select',
    entityId: 'emp-001',
    entityType: 'employee',
    value: ['aws-sa', 'scrum-master'],
    updatedAt: '2026-02-01T09:00:00Z',
  },
  {
    fieldId: 'cf-004',
    fieldName: 'Remote Work Days/Week',
    fieldType: 'number',
    entityId: 'emp-001',
    entityType: 'employee',
    value: 3,
    updatedAt: '2026-01-20T11:00:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class CustomFieldsService {
  /**
   * Get all custom fields for an entity type
   */
  static async getCustomFields(entityType?: EntityType): Promise<CustomField[]> {
    try {
      return await APIClient.get<CustomField[]>('/v1/custom-fields', { entityType });
    } catch {
      const fields = entityType
        ? MOCK_FIELDS.filter((f) => f.entityType === entityType && f.isActive)
        : MOCK_FIELDS.filter((f) => f.isActive);
      return fields.sort((a, b) => a.displayOrder - b.displayOrder);
    }
  }

  /**
   * Create a new custom field
   */
  static async createCustomField(data: CreateCustomFieldInput): Promise<CustomField> {
    try {
      return await APIClient.post<CustomField>('/v1/custom-fields', data);
    } catch {
      const existing = MOCK_FIELDS.filter((f) => f.entityType === data.entityType);
      const maxOrder = existing.reduce((max, f) => Math.max(max, f.displayOrder), 0);

      const newField: CustomField = {
        id: `cf-${Date.now()}`,
        apiKey: data.name
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, ''),
        validation: data.validation ?? { required: false },
        displayOrder: maxOrder + 1,
        isActive: true,
        isSystemField: false,
        usageCount: 0,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      MOCK_FIELDS.push(newField);
      return newField;
    }
  }

  /**
   * Update a custom field definition
   */
  static async updateCustomField(id: string, data: UpdateCustomFieldInput): Promise<CustomField> {
    try {
      return await APIClient.patch<CustomField>(`/v1/custom-fields/${id}`, data);
    } catch {
      const idx = MOCK_FIELDS.findIndex((f) => f.id === id);
      if (idx < 0) throw new Error('Field not found');
      MOCK_FIELDS[idx] = {
        ...MOCK_FIELDS[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return MOCK_FIELDS[idx];
    }
  }

  /**
   * Soft delete a custom field
   */
  static async deleteCustomField(id: string): Promise<void> {
    try {
      await APIClient.delete(`/v1/custom-fields/${id}`);
    } catch {
      const idx = MOCK_FIELDS.findIndex((f) => f.id === id);
      if (idx >= 0) MOCK_FIELDS[idx].isActive = false;
    }
  }

  /**
   * Reorder custom fields for an entity type
   */
  static async reorderFields(entityType: EntityType, fieldIds: string[]): Promise<void> {
    try {
      await APIClient.post('/v1/custom-fields/reorder', { entityType, fieldIds });
    } catch {
      fieldIds.forEach((id, idx) => {
        const field = MOCK_FIELDS.find((f) => f.id === id);
        if (field) field.displayOrder = idx + 1;
      });
    }
  }

  /**
   * Get all custom field values for an entity instance
   */
  static async getFieldValues(
    entityId: string,
    entityType: EntityType
  ): Promise<CustomFieldValue[]> {
    try {
      return await APIClient.get<CustomFieldValue[]>(`/v1/custom-fields/values`, {
        entityId,
        entityType,
      });
    } catch {
      return MOCK_VALUES.filter((v) => v.entityId === entityId && v.entityType === entityType);
    }
  }

  /**
   * Set a custom field value for an entity
   */
  static async setFieldValue(
    entityId: string,
    fieldId: string,
    value: CustomFieldValue['value']
  ): Promise<CustomFieldValue> {
    try {
      return await APIClient.post<CustomFieldValue>('/v1/custom-fields/values', {
        entityId,
        fieldId,
        value,
      });
    } catch {
      const field = MOCK_FIELDS.find((f) => f.id === fieldId);
      const existingIdx = MOCK_VALUES.findIndex(
        (v) => v.fieldId === fieldId && v.entityId === entityId
      );
      const newValue: CustomFieldValue = {
        fieldId,
        fieldName: field?.label ?? '',
        fieldType: field?.type ?? 'text',
        entityId,
        entityType: field?.entityType ?? 'employee',
        value,
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        MOCK_VALUES[existingIdx] = newValue;
      } else {
        MOCK_VALUES.push(newValue);
      }
      return newValue;
    }
  }
}

export default CustomFieldsService;
