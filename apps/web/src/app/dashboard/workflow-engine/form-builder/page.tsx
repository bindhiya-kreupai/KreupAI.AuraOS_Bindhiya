'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Loader2,
  Search,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
  CheckCircle2,
  GripVertical,
  Type,
  Hash,
  Calendar,
  AtSign,
  ChevronDown,
  Circle,
  CheckSquare,
  Upload,
  PenTool,
  Save,
  ArrowUp,
  ArrowDown,
  Columns,
  LayoutGrid,
  Shield,
  Users,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ChevronLeft,
  Link,
  Webhook,
  Layers,
  Minus,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { FormBuilderService } from '../services';
import { toast as sonnerToast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

interface FormFieldDef {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  sectionId?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: Record<string, unknown>;
  helpText?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

interface FormSectionDef {
  id: string;
  title: string;
  description: string;
  collapsible: boolean;
  defaultCollapsed: boolean;
  order: number;
}

interface ValidationRuleDef {
  id: string;
  ruleName: string;
  sourceField: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'notEmpty';
  targetValue: string;
  errorMessage: string;
  validateOn: 'submit' | 'change';
}

interface FormDefinition {
  id: string;
  name: string;
  description: string;
  processType: string;
  status: string;
  nodes: any[];
  edges: any[];
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: { instances: number };
  [key: string]: unknown;
}

interface FormData {
  id?: string;
  name: string;
  description: string;
  fields: FormFieldDef[];
  sections: FormSectionDef[];
  validationRules: ValidationRuleDef[];
  submitAction: 'save' | 'workflow' | 'api';
  submitWorkflowId?: string;
  submitApiEndpoint?: string;
  status: 'draft' | 'active' | 'inactive';
  allowedRoles: string[];
  allowedUsers: string[];
}

// ============================================================================
// Constants
// ============================================================================

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: Type, category: 'Basic' },
  { type: 'textarea', label: 'Text Area', icon: Type, category: 'Basic' },
  { type: 'number', label: 'Number', icon: Hash, category: 'Basic' },
  { type: 'email', label: 'Email', icon: AtSign, category: 'Basic' },
  { type: 'date', label: 'Date', icon: Calendar, category: 'Basic' },
  { type: 'select', label: 'Dropdown', icon: ChevronDown, category: 'Selection' },
  { type: 'radio', label: 'Radio', icon: Circle, category: 'Selection' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, category: 'Selection' },
  { type: 'file', label: 'File Upload', icon: Upload, category: 'Advanced' },
  { type: 'signature', label: 'Signature', icon: PenTool, category: 'Advanced' },
];

const OPERATORS = [
  { value: 'eq', label: 'equals' },
  { value: 'neq', label: 'not equals' },
  { value: 'gt', label: 'greater than' },
  { value: 'gte', label: 'greater or equal' },
  { value: 'lt', label: 'less than' },
  { value: 'lte', label: 'less or equal' },
  { value: 'contains', label: 'contains' },
  { value: 'notEmpty', label: 'is not empty' },
];

const STATUSES = [
  {
    value: 'draft',
    label: 'Draft',
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
  {
    value: 'active',
    label: 'Active',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    value: 'inactive',
    label: 'Inactive',
    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
];

const uid = () => `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const secUid = () => `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const ruleUid = () => `vr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ============================================================================
// Storage mapping: API ↔ FormData
// ============================================================================

function loadFormFromDef(def: FormDefinition): FormData {
  const nodes = Array.isArray(def.nodes) ? def.nodes : [];
  const fields: FormFieldDef[] = [];
  const sections: FormSectionDef[] = [];

  nodes.forEach((n: any, i: number) => {
    if (n.type === '_section') {
      sections.push({
        id: n.id,
        title: n.label || n.name || 'Section',
        description: n.description || '',
        collapsible: n.collapsible ?? true,
        defaultCollapsed: n.defaultCollapsed ?? false,
        order: n.order ?? i,
      });
    } else {
      fields.push({
        id: n.id || uid(),
        name: n.name || n.label?.toLowerCase().replace(/\s+/g, '_') || `field_${i}`,
        label: n.label || n.name || `Field ${i + 1}`,
        type: n.type || 'text',
        required: n.required ?? false,
        order: n.order ?? i,
        sectionId: n.sectionId,
        placeholder: n.placeholder,
        options: n.options,
        helpText: n.helpText,
        defaultValue: n.defaultValue,
        minLength: n.minLength,
        maxLength: n.maxLength,
        min: n.min,
        max: n.max,
        pattern: n.pattern,
      });
    }
  });

  fields.sort((a, b) => a.order - b.order);
  sections.sort((a, b) => a.order - b.order);

  const edges = Array.isArray(def.edges) ? def.edges : [];
  const validationRules: ValidationRuleDef[] = edges.map((e: any) => ({
    id: e.id || ruleUid(),
    ruleName: e.label || e.ruleName || '',
    sourceField: e.source || e.sourceField || '',
    operator: e.condition?.operator || e.operator || 'eq',
    targetValue: String(e.condition?.value ?? e.targetValue ?? ''),
    errorMessage: e.errorMessage || '',
    validateOn: e.validateOn || 'submit',
  }));

  const meta: any = (def as any).triggerEvent ? JSON.parse((def as any).triggerEvent || '{}') : {};

  return {
    id: def.id,
    name: def.name,
    description: def.description || '',
    fields,
    sections,
    validationRules,
    submitAction: meta.submitAction || 'save',
    submitWorkflowId: meta.submitWorkflowId,
    submitApiEndpoint: meta.submitApiEndpoint,
    status: (def.status?.toLowerCase() as FormData['status']) || 'draft',
    allowedRoles: meta.allowedRoles || [],
    allowedUsers: meta.allowedUsers || [],
  };
}

function saveFormToNodes(formData: FormData): any[] {
  const nodes: any[] = [];

  formData.sections.forEach((sec, i) => {
    nodes.push({
      id: sec.id,
      type: '_section',
      name: sec.title,
      label: sec.title,
      description: sec.description,
      collapsible: sec.collapsible,
      defaultCollapsed: sec.defaultCollapsed,
      order: i,
    });
  });

  formData.fields.forEach((f, i) => {
    nodes.push({
      id: f.id,
      type: f.type,
      name: f.name,
      label: f.label,
      required: f.required,
      order: i,
      sectionId: f.sectionId,
      placeholder: f.placeholder,
      options: f.options,
      helpText: f.helpText,
      defaultValue: f.defaultValue,
      minLength: f.minLength,
      maxLength: f.maxLength,
      min: f.min,
      max: f.max,
      pattern: f.pattern,
    });
  });

  return nodes;
}

function saveFormToEdges(formData: FormData): any[] {
  return formData.validationRules.map((rule) => ({
    id: rule.id,
    label: rule.ruleName,
    ruleName: rule.ruleName,
    source: rule.sourceField,
    sourceField: rule.sourceField,
    condition: { operator: rule.operator, value: rule.targetValue },
    operator: rule.operator,
    targetValue: rule.targetValue,
    errorMessage: rule.errorMessage,
    validateOn: rule.validateOn,
  }));
}

function saveFormMeta(formData: FormData): string {
  return JSON.stringify({
    submitAction: formData.submitAction,
    submitWorkflowId: formData.submitWorkflowId,
    submitApiEndpoint: formData.submitApiEndpoint,
    allowedRoles: formData.allowedRoles,
    allowedUsers: formData.allowedUsers,
  });
}

// ============================================================================
// Helpers
// ============================================================================

function makeDefaultField(type: string): FormFieldDef {
  const ft = FIELD_TYPES.find((f) => f.type === type);
  const label = ft?.label || 'Field';
  return {
    id: uid(),
    name: label.toLowerCase().replace(/\s+/g, '_'),
    label: `New ${label}`,
    type,
    required: false,
    order: 0,
    placeholder: '',
    options: ['select', 'radio', 'checkbox'].includes(type)
      ? [
          { value: 'option_1', label: 'Option 1' },
          { value: 'option_2', label: 'Option 2' },
        ]
      : undefined,
  };
}

function FieldIcon({ type, className = 'w-4 h-4' }: { type: string; className?: string }) {
  const ft = FIELD_TYPES.find((f) => f.type === type);
  if (!ft) return <Type className={className} />;
  const Icon = ft.icon;
  return <Icon className={className} />;
}

// ============================================================================
// Sub-components
// ============================================================================

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-[400px] shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Form Preview
// ============================================================================

function FormPreview({ formData }: { formData: FormData }) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const defaults: Record<string, any> = {};
    formData.fields.forEach((f) => {
      if (f.defaultValue) defaults[f.id] = f.defaultValue;
    });
    setValues(defaults);
  }, [formData.fields]);

  const handleChange = (fieldId: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[fieldId];
        return n;
      });
    }
  };

  const runValidation = () => {
    const newErrors: Record<string, string> = {};
    formData.fields.forEach((f) => {
      if (f.required && !values[f.id]) {
        newErrors[f.id] = `${f.label} is required`;
      }
    });
    formData.validationRules.forEach((rule) => {
      if (rule.validateOn !== 'submit') return;
      const srcVal = values[rule.sourceField] || '';
      const tgtVal = rule.targetValue;
      let pass = true;
      switch (rule.operator) {
        case 'eq':
          pass = String(srcVal) === tgtVal;
          break;
        case 'neq':
          pass = String(srcVal) !== tgtVal;
          break;
        case 'gt':
          pass = Number(srcVal) > Number(tgtVal);
          break;
        case 'gte':
          pass = Number(srcVal) >= Number(tgtVal);
          break;
        case 'lt':
          pass = Number(srcVal) < Number(tgtVal);
          break;
        case 'lte':
          pass = Number(srcVal) <= Number(tgtVal);
          break;
        case 'contains':
          pass = String(srcVal).includes(tgtVal);
          break;
        case 'notEmpty':
          pass = !!srcVal;
          break;
      }
      if (!pass && rule.sourceField) {
        newErrors[rule.sourceField] = rule.errorMessage || `${rule.ruleName} failed`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (runValidation()) {
      sonnerToast.success('Form validation passed (preview mode)');
    }
  };

  const sections =
    formData.sections.length > 0
      ? formData.sections.sort((a, b) => a.order - b.order)
      : [
          {
            id: '__default',
            title: '',
            description: '',
            collapsible: false,
            defaultCollapsed: false,
            order: 0,
          },
        ];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {formData.name || 'Untitled Form'}
          </h2>
          {formData.description && <p className="text-slate-400 mt-1">{formData.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            {STATUSES.map(
              (s) =>
                s.value === formData.status && (
                  <span
                    key={s.value}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}
                  >
                    {s.label}
                  </span>
                )
            )}
          </div>
        </div>

        {formData.fields.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No fields added yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((sec) => {
              const sectionFields =
                sec.id === '__default'
                  ? formData.fields.filter((f) => !f.sectionId)
                  : formData.fields.filter((f) => f.sectionId === sec.id);
              if (sectionFields.length === 0 && sec.id !== '__default') return null;
              return (
                <div key={sec.id} className="space-y-4">
                  {sec.title && (
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {sec.title}
                      </h3>
                      {sec.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{sec.description}</p>
                      )}
                    </div>
                  )}
                  {sectionFields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.helpText && <p className="text-xs text-slate-400">{field.helpText}</p>}
                      {field.type === 'text' || field.type === 'email' ? (
                        <input
                          type={field.type}
                          placeholder={field.placeholder || field.label}
                          value={values[field.id] || ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className={`w-full h-10 px-3 bg-white dark:bg-slate-800 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-offset-0 ${errors[field.id] ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 dark:border-slate-600 focus:ring-celestial-indigo'}`}
                        />
                      ) : field.type === 'textarea' ? (
                        <textarea
                          placeholder={field.placeholder || field.label}
                          rows={3}
                          value={values[field.id] || ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className={`w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border text-sm resize-none outline-none focus:ring-2 focus:ring-offset-0 ${errors[field.id] ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} focus:ring-celestial-indigo`}
                        />
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          placeholder={field.placeholder || '0'}
                          min={field.min}
                          max={field.max}
                          value={values[field.id] || ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className={`w-full h-10 px-3 bg-white dark:bg-slate-800 rounded-lg border text-sm ${errors[field.id] ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0`}
                        />
                      ) : field.type === 'date' ? (
                        <input
                          type="date"
                          value={values[field.id] || ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className={`w-full h-10 px-3 bg-white dark:bg-slate-800 rounded-lg border text-sm ${errors[field.id] ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0`}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={values[field.id] || ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className={`w-full h-10 px-3 bg-white dark:bg-slate-800 rounded-lg border text-sm ${errors[field.id] ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0`}
                        >
                          <option value="">{field.placeholder || 'Select an option'}</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'radio' ? (
                        <div className="flex flex-wrap gap-4 mt-1">
                          {(field.options || []).map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={field.id}
                                value={opt.value}
                                checked={values[field.id] === opt.value}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="text-celestial-indigo focus:ring-celestial-indigo"
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer mt-1">
                          <input
                            type="checkbox"
                            checked={!!values[field.id]}
                            onChange={(e) => handleChange(field.id, e.target.checked)}
                            className="rounded border-slate-300 text-celestial-indigo focus:ring-celestial-indigo"
                          />
                          {field.placeholder || field.label}
                        </label>
                      ) : field.type === 'file' ? (
                        <input
                          type="file"
                          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-celestial-indigo/10 file:text-celestial-indigo hover:file:bg-celestial-indigo/20"
                        />
                      ) : field.type === 'signature' ? (
                        <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center text-slate-400 text-sm cursor-not-allowed">
                          Signature field (not available in preview)
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={field.placeholder || field.label}
                          value={values[field.id] || ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className={`w-full h-10 px-3 bg-white dark:bg-slate-800 rounded-lg border text-sm ${errors[field.id] ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'} outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0`}
                        />
                      )}
                      {errors[field.id] && (
                        <p className="text-xs text-red-500 mt-0.5">{errors[field.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-bold hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

// ============================================================================
// Field Properties Panel
// ============================================================================

function FieldProperties({
  field,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  allFields,
  sections,
}: {
  field: FormFieldDef;
  onChange: (updates: Partial<FormFieldDef>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  allFields: FormFieldDef[];
  sections: FormSectionDef[];
}) {
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);
  const hasMinMax = field.type === 'number';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Properties</h3>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 ml-1"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 block mb-1">Label</label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 block mb-1">Field Name</label>
        <input
          type="text"
          value={field.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 block mb-1">Placeholder</label>
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => onChange({ placeholder: e.target.value })}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 block mb-1">Help Text</label>
        <input
          type="text"
          value={field.helpText || ''}
          onChange={(e) => onChange({ helpText: e.target.value })}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0"
        />
      </div>

      <div>
        <label className="text-xs text-slate-500 block mb-1">Default Value</label>
        {field.type === 'checkbox' ? (
          <button
            onClick={() =>
              onChange({ defaultValue: field.defaultValue === 'true' ? 'false' : 'true' })
            }
            className={`w-9 h-5 rounded-full relative transition-colors ${field.defaultValue === 'true' ? 'bg-celestial-indigo' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${field.defaultValue === 'true' ? 'left-4' : 'left-0.5'}`}
            />
          </button>
        ) : (
          <input
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            value={field.defaultValue || ''}
            onChange={(e) => onChange({ defaultValue: e.target.value })}
            placeholder={`Default ${field.label}`}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0"
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Required</label>
        <button
          onClick={() => onChange({ required: !field.required })}
          className={`w-9 h-5 rounded-full relative transition-colors ${field.required ? 'bg-celestial-indigo' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${field.required ? 'left-4' : 'left-0.5'}`}
          />
        </button>
      </div>

      {hasOptions && (
        <div>
          <label className="text-xs text-slate-500 block mb-1">Options</label>
          <div className="space-y-1.5">
            {(field.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => {
                    const newOpts = [...(field.options || [])];
                    newOpts[i] = {
                      value: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                      label: e.target.value,
                    };
                    onChange({ options: newOpts });
                  }}
                  className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-celestial-indigo"
                />
                <button
                  onClick={() =>
                    onChange({ options: (field.options || []).filter((_, j) => j !== i) })
                  }
                  className="p-0.5 text-slate-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                onChange({
                  options: [
                    ...(field.options || []),
                    {
                      value: `option_${(field.options || []).length + 1}`,
                      label: `Option ${(field.options || []).length + 1}`,
                    },
                  ],
                })
              }
              className="flex items-center gap-1 text-xs text-celestial-indigo hover:text-celestial-indigo/80 font-medium"
            >
              <Plus className="w-3 h-3" /> Add Option
            </button>
          </div>
        </div>
      )}

      {hasMinMax && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Min</label>
            <input
              type="number"
              value={field.min ?? ''}
              onChange={(e) =>
                onChange({ min: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-celestial-indigo"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Max</label>
            <input
              type="number"
              value={field.max ?? ''}
              onChange={(e) =>
                onChange({ max: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-celestial-indigo"
            />
          </div>
        </div>
      )}

      {field.type === 'text' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Min Length</label>
            <input
              type="number"
              value={field.minLength ?? ''}
              onChange={(e) =>
                onChange({ minLength: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-celestial-indigo"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Max Length</label>
            <input
              type="number"
              value={field.maxLength ?? ''}
              onChange={(e) =>
                onChange({ maxLength: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-celestial-indigo"
            />
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-slate-500 block mb-1">Section</label>
        <select
          value={field.sectionId || ''}
          onChange={(e) => onChange({ sectionId: e.target.value || undefined })}
          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-celestial-indigo"
        >
          <option value="">No section</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ============================================================================
// Settings Panel
// ============================================================================

function FormSettingsPanel({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}) {
  const [newRole, setNewRole] = useState('');
  const [newUser, setNewUser] = useState('');

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Form Settings</h3>

      {/* Status */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">Status</label>
        <div className="flex gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange({ status: s.value as FormData['status'] })}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                formData.status === s.value
                  ? `${s.color} border-current`
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Action */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">On Submit</label>
        <div className="space-y-1.5">
          {[
            { value: 'save', label: 'Save to database', icon: Save },
            { value: 'workflow', label: 'Trigger workflow', icon: Zap },
            { value: 'api', label: 'Call API endpoint', icon: Webhook },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ submitAction: opt.value as FormData['submitAction'] })}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-colors ${
                formData.submitAction === opt.value
                  ? 'border-celestial-indigo bg-celestial-indigo/5 text-celestial-indigo'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <opt.icon className="w-3.5 h-3.5" />
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {formData.submitAction === 'workflow' && (
        <div>
          <label className="text-xs text-slate-500 block mb-1">Workflow ID</label>
          <input
            type="text"
            value={formData.submitWorkflowId || ''}
            onChange={(e) => onChange({ submitWorkflowId: e.target.value })}
            placeholder="Enter workflow definition ID"
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0"
          />
        </div>
      )}

      {formData.submitAction === 'api' && (
        <div>
          <label className="text-xs text-slate-500 block mb-1">API Endpoint</label>
          <input
            type="text"
            value={formData.submitApiEndpoint || ''}
            onChange={(e) => onChange({ submitApiEndpoint: e.target.value })}
            placeholder="https://api.example.com/webhook"
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono text-[11px] outline-none focus:ring-2 focus:ring-celestial-indigo focus:ring-offset-0"
          />
        </div>
      )}

      {/* Permissions */}
      <div>
        <label className="text-xs text-slate-500 block mb-1.5">Allowed Roles</label>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {(formData.allowedRoles || []).map((role, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo text-[10px] font-bold rounded-full"
            >
              {role}
              <button
                onClick={() =>
                  onChange({ allowedRoles: formData.allowedRoles.filter((_, j) => j !== i) })
                }
                className="hover:text-red-500"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="Add role"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newRole.trim()) {
                onChange({ allowedRoles: [...(formData.allowedRoles || []), newRole.trim()] });
                setNewRole('');
              }
            }}
            className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-celestial-indigo"
          />
          <button
            onClick={() => {
              if (newRole.trim()) {
                onChange({ allowedRoles: [...(formData.allowedRoles || []), newRole.trim()] });
                setNewRole('');
              }
            }}
            className="px-2 py-1 text-xs rounded bg-celestial-indigo/10 text-celestial-indigo hover:bg-celestial-indigo/20"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 block mb-1.5">Allowed Users</label>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {(formData.allowedUsers || []).map((user, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full"
            >
              {user}
              <button
                onClick={() =>
                  onChange({ allowedUsers: formData.allowedUsers.filter((_, j) => j !== i) })
                }
                className="hover:text-red-500"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="Add user ID"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newUser.trim()) {
                onChange({ allowedUsers: [...(formData.allowedUsers || []), newUser.trim()] });
                setNewUser('');
              }
            }}
            className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-celestial-indigo"
          />
          <button
            onClick={() => {
              if (newUser.trim()) {
                onChange({ allowedUsers: [...(formData.allowedUsers || []), newUser.trim()] });
                setNewUser('');
              }
            }}
            className="px-2 py-1 text-xs rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Validation Rules Panel
// ============================================================================

function ValidationRulesPanel({
  formData,
  onChange,
}: {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}) {
  const addRule = () => {
    const rule: ValidationRuleDef = {
      id: ruleUid(),
      ruleName: '',
      sourceField: formData.fields[0]?.id || '',
      operator: 'eq',
      targetValue: '',
      errorMessage: '',
      validateOn: 'submit',
    };
    onChange({ validationRules: [...formData.validationRules, rule] });
  };

  const updateRule = (id: string, updates: Partial<ValidationRuleDef>) => {
    onChange({
      validationRules: formData.validationRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    });
  };

  const removeRule = (id: string) => {
    onChange({ validationRules: formData.validationRules.filter((r) => r.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Validation Rules
        </h3>
        <button
          onClick={addRule}
          className="flex items-center gap-1 text-xs text-celestial-indigo hover:text-celestial-indigo/80 font-bold"
        >
          <Plus className="w-3 h-3" /> Add Rule
        </button>
      </div>

      {formData.validationRules.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No validation rules defined</p>
      ) : (
        <div className="space-y-3">
          {formData.validationRules.map((rule) => (
            <div
              key={rule.id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={rule.ruleName}
                  onChange={(e) => updateRule(rule.id, { ruleName: e.target.value })}
                  placeholder="Rule name"
                  className="flex-1 text-xs font-bold bg-transparent border-none outline-none text-slate-700 dark:text-slate-200"
                />
                <button
                  onClick={() => removeRule(rule.id)}
                  className="p-0.5 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <select
                  value={rule.sourceField}
                  onChange={(e) => updateRule(rule.id, { sourceField: e.target.value })}
                  className="px-2 py-1 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                >
                  <option value="">Field</option>
                  {formData.fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                  className="px-2 py-1 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={rule.targetValue}
                  onChange={(e) => updateRule(rule.id, { targetValue: e.target.value })}
                  placeholder="Value"
                  className="px-2 py-1 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>
              <input
                type="text"
                value={rule.errorMessage}
                onChange={(e) => updateRule(rule.id, { errorMessage: e.target.value })}
                placeholder="Error message"
                className="w-full px-2 py-1 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              />
              <select
                value={rule.validateOn}
                onChange={(e) => updateRule(rule.id, { validateOn: e.target.value as any })}
                className="px-2 py-1 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              >
                <option value="submit">Validate on submit</option>
                <option value="change">Validate on change</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Need Zap import for settings panel
const Zap = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// ============================================================================
// Main Page
// ============================================================================

export default function FormBuilderPage() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    fields: [],
    sections: [],
    validationRules: [],
    submitAction: 'save',
    status: 'draft',
    allowedRoles: [],
    allowedUsers: [],
  });
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormDefinition | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rightPanel, setRightPanel] = useState<'properties' | 'settings' | 'validation'>(
    'properties'
  );
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [mobilePalette, setMobilePalette] = useState(false);
  const [mobileProps, setMobileProps] = useState(false);

  const closeAllMobile = useCallback(() => {
    setMobileSidebar(false);
    setMobilePalette(false);
    setMobileProps(false);
  }, []);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FormBuilderService.getForms();
      setForms(data as unknown as FormDefinition[]);
    } catch (err: any) {
      console.error('Failed to load forms:', err);
      showToast('error', `Failed to load forms: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const loadForm = useCallback(
    (def: FormDefinition) => {
      if (dirty) sonnerToast.warning('Unsaved changes discarded');
      setSelectedFormId(def.id);
      setFormData(loadFormFromDef(def));
      setSelectedFieldId(null);
      setPreviewMode(false);
      setDirty(false);
      setRightPanel('properties');
      closeAllMobile();
    },
    [dirty, closeAllMobile]
  );

  const createNewForm = useCallback(async () => {
    try {
      setSaving(true);
      const result = await FormBuilderService.createForm({
        formName: 'Untitled Form',
        description: '',
        fields: [],
      } as any);
      await loadForms();
      if (result?.id) {
        loadForm(result as unknown as FormDefinition);
        showToast('success', 'Form created');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create form');
    } finally {
      setSaving(false);
    }
  }, [loadForm, loadForms, showToast]);

  const saveForm = useCallback(async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Form name is required');
      return;
    }
    try {
      setSaving(true);
      const nodes = saveFormToNodes(formData);
      const edges = saveFormToEdges(formData);
      const triggerEvent = saveFormMeta(formData);
      if (formData.id) {
        await FormBuilderService.updateForm(formData.id, {
          formName: formData.name,
          description: formData.description,
          fields: nodes,
          edges,
          triggerEvent,
        } as any);
      } else {
        const result = await FormBuilderService.createForm({
          formName: formData.name,
          description: formData.description,
          fields: nodes,
          edges,
          triggerEvent,
        } as any);
        if (result?.id) {
          setFormData((prev) => ({ ...prev, id: result.id }));
        }
      }
      setDirty(false);
      showToast('success', 'Form saved');
      await loadForms();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [formData, loadForms, showToast]);

  const deleteForm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await FormBuilderService.deleteForm(deleteTarget.id);
      setForms((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      if (selectedFormId === deleteTarget.id) {
        setSelectedFormId(null);
        setFormData({
          name: '',
          description: '',
          fields: [],
          sections: [],
          validationRules: [],
          submitAction: 'save',
          status: 'draft',
          allowedRoles: [],
          allowedUsers: [],
        });
        setSelectedFieldId(null);
      }
      showToast('success', 'Form deleted');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, selectedFormId, showToast]);

  const cloneForm = useCallback(
    async (form: FormDefinition) => {
      try {
        const result = await FormBuilderService.cloneForm(form.id, `${form.name} (Copy)`);
        await loadForms();
        if (result?.id) showToast('success', 'Form cloned');
      } catch (err: any) {
        showToast('error', err.message || 'Failed to clone');
      }
    },
    [loadForms, showToast]
  );

  const addField = useCallback(
    (type: string) => {
      const field = makeDefaultField(type);
      field.order = formData.fields.length;
      setFormData((prev) => ({ ...prev, fields: [...prev.fields, field] }));
      setSelectedFieldId(field.id);
      setRightPanel('properties');
      setDirty(true);
    },
    [formData.fields.length]
  );

  const updateField = useCallback((fieldId: string, updates: Partial<FormFieldDef>) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    }));
    setDirty(true);
  }, []);

  const removeField = useCallback(
    (fieldId: string) => {
      setFormData((prev) => ({ ...prev, fields: prev.fields.filter((f) => f.id !== fieldId) }));
      if (selectedFieldId === fieldId) setSelectedFieldId(null);
      setDirty(true);
    },
    [selectedFieldId]
  );

  const moveField = useCallback((fieldId: string, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const idx = prev.fields.findIndex((f) => f.id === fieldId);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.fields.length) return prev;
      const newFields = [...prev.fields];
      [newFields[idx], newFields[newIdx]] = [newFields[newIdx], newFields[idx]];
      return { ...prev, fields: newFields.map((f, i) => ({ ...f, order: i })) };
    });
    setDirty(true);
  }, []);

  const addSection = useCallback(() => {
    const sec: FormSectionDef = {
      id: secUid(),
      title: `Section ${formData.sections.length + 1}`,
      description: '',
      collapsible: true,
      defaultCollapsed: false,
      order: formData.sections.length,
    };
    setFormData((prev) => ({ ...prev, sections: [...prev.sections, sec] }));
    setDirty(true);
  }, [formData.sections.length]);

  const updateSection = useCallback((secId: string, updates: Partial<FormSectionDef>) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === secId ? { ...s, ...updates } : s)),
    }));
    setDirty(true);
  }, []);

  const removeSection = useCallback((secId: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== secId),
      fields: prev.fields.map((f) => (f.sectionId === secId ? { ...f, sectionId: undefined } : f)),
    }));
    setDirty(true);
  }, []);

  const moveSection = useCallback((secId: string, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === secId);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.sections.length) return prev;
      const newSections = [...prev.sections];
      [newSections[idx], newSections[newIdx]] = [newSections[newIdx], newSections[idx]];
      return { ...prev, sections: newSections.map((s, i) => ({ ...s, order: i })) };
    });
    setDirty(true);
  }, []);

  const filteredForms = forms.filter(
    (f) => !search || f.name.toLowerCase().includes(search.toLowerCase())
  );
  const selectedField = formData.fields.find((f) => f.id === selectedFieldId);
  const selectedFieldIndex = selectedFieldId
    ? formData.fields.findIndex((f) => f.id === selectedFieldId)
    : -1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Form"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={deleteForm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-celestial-indigo flex-shrink-0" />
            <span className="truncate">Dynamic Form Architect</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm truncate">
            {selectedFormId
              ? `Editing: ${formData.name || 'Untitled'}`
              : 'Design and manage dynamic data collection forms'}
            {dirty && <span className="ml-2 text-amber-500 font-medium">Unsaved changes</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {selectedFormId && (
            <>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold hidden sm:inline-flex ${STATUSES.find((s) => s.value === formData.status)?.color || ''}`}
              >
                {formData.status.toUpperCase()}
              </span>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${previewMode ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {previewMode ? (
                  <>
                    <EyeOff className="w-4 h-4" />{' '}
                    <span className="hidden sm:inline">Exit Preview</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Preview</span>
                  </>
                )}
              </button>
              <button
                onClick={saveForm}
                disabled={saving || !dirty}
                className="px-3 sm:px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-bold hover:bg-celestial-indigo/90 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-celestial-indigo/20"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          )}
          {/* Mobile panel toggle buttons */}
          <div className="flex gap-1.5 lg:hidden">
            <button
              onClick={() => {
                closeAllMobile();
                setMobileSidebar(true);
              }}
              className={`p-2 rounded-lg text-xs font-bold transition-colors ${mobileSidebar ? 'bg-celestial-indigo text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              <FileText className="w-4 h-4" />
            </button>
            {selectedFormId && !previewMode && (
              <>
                <button
                  onClick={() => {
                    closeAllMobile();
                    setMobilePalette(true);
                  }}
                  className={`p-2 rounded-lg text-xs font-bold transition-colors ${mobilePalette ? 'bg-celestial-indigo text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    closeAllMobile();
                    setMobileProps(true);
                  }}
                  className={`p-2 rounded-lg text-xs font-bold transition-colors ${mobileProps ? 'bg-celestial-indigo text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <button
            onClick={createNewForm}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Form</span>
          </button>
        </div>
      </div>

      {/* Mobile backdrop */}
      {(mobileSidebar || mobilePalette || mobileProps) && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={closeAllMobile} />
      )}

      {/* Main Layout */}
      <div className="flex gap-3 h-[calc(100vh-200px)] min-h-[500px] max-lg:h-[calc(100vh-160px)]">
        {/* Form List Sidebar */}
        <div
          className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm
          fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out
          ${mobileSidebar ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:z-auto lg:w-64 lg:flex-shrink-0 lg:translate-x-0 lg:rounded-2xl lg:transition-none`}
        >
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Forms</span>
              <button
                onClick={closeAllMobile}
                className="ml-auto p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search forms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-celestial-indigo"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredForms.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                {forms.length === 0 ? 'No forms yet' : 'No matching forms'}
              </div>
            ) : (
              filteredForms.map((form) => (
                <div
                  key={form.id}
                  onClick={() => loadForm(form)}
                  className={`group p-2.5 rounded-xl cursor-pointer transition-all ${selectedFormId === form.id ? 'bg-celestial-indigo/10 border border-celestial-indigo/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg ${selectedFormId === form.id ? 'bg-celestial-indigo/20' : 'bg-slate-100 dark:bg-slate-800'}`}
                    >
                      <FileText
                        className={`w-3.5 h-3.5 ${selectedFormId === form.id ? 'text-celestial-indigo' : 'text-slate-400'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${selectedFormId === form.id ? 'text-celestial-indigo' : 'text-slate-700 dark:text-slate-200'}`}
                      >
                        {form.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {Array.isArray(form.nodes)
                          ? form.nodes.filter((n: any) => n.type !== '_section').length
                          : 0}{' '}
                        fields
                        {form._count?.instances ? ` · ${form._count.instances} sub.` : ''}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cloneForm(form);
                        }}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                        title="Clone"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(form);
                        }}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedFormId ? (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-500 mb-2">No Form Selected</h3>
                <p className="text-sm text-slate-400">
                  Select a form from the sidebar or click <strong>New Form</strong> in the header
                </p>
              </div>
            </div>
          ) : previewMode ? (
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <FormPreview formData={formData} />
            </div>
          ) : (
            <div className="flex-1 flex gap-3 min-h-0">
              {/* Field Palette */}
              <div
                className={`bg-white dark:bg-slate-900 p-3 shadow-sm overflow-y-auto
                fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out
                ${mobilePalette ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:z-auto lg:w-52 lg:flex-shrink-0 lg:translate-x-0 lg:rounded-2xl lg:border lg:border-slate-200 lg:dark:border-slate-800 lg:transition-none`}
              >
                <div className="flex items-center justify-between mb-3 lg:block">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Fields
                  </h3>
                  <button
                    onClick={closeAllMobile}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {['Basic', 'Selection', 'Advanced'].map((cat) => (
                  <div key={cat} className="mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{cat}</p>
                    <div className="space-y-1">
                      {FIELD_TYPES.filter((ft) => ft.category === cat).map((ft) => (
                        <button
                          key={ft.type}
                          onClick={() => addField(ft.type)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-celestial-indigo/30 hover:bg-celestial-indigo/5 transition-colors text-left"
                        >
                          <ft.icon className="w-3.5 h-3.5 text-celestial-indigo" />
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                            {ft.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Sections
                  </h3>
                  <button
                    onClick={addSection}
                    className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-500 hover:border-celestial-indigo hover:text-celestial-indigo transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Section
                  </button>
                  <div className="space-y-1 mt-2">
                    {formData.sections
                      .sort((a, b) => a.order - b.order)
                      .map((sec, i) => (
                        <div
                          key={sec.id}
                          className="group flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px]"
                        >
                          <Layers className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                            className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-slate-700 dark:text-slate-200 min-w-0"
                          />
                          <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                            <button
                              onClick={() => moveSection(sec.id, 'up')}
                              disabled={i === 0}
                              className="p-0.5 disabled:opacity-30"
                            >
                              <ArrowUp className="w-2.5 h-2.5 text-slate-400" />
                            </button>
                            <button
                              onClick={() => moveSection(sec.id, 'down')}
                              disabled={i === formData.sections.length - 1}
                              className="p-0.5 disabled:opacity-30"
                            >
                              <ArrowDown className="w-2.5 h-2.5 text-slate-400" />
                            </button>
                            <button
                              onClick={() => removeSection(sec.id)}
                              className="p-0.5 text-slate-400 hover:text-red-500"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-6 overflow-y-auto min-w-0">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 mb-4 shadow-sm">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, name: e.target.value }));
                      setDirty(true);
                    }}
                    placeholder="Form Name"
                    className="w-full text-lg sm:text-xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 mb-2"
                  />
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, description: e.target.value }));
                      setDirty(true);
                    }}
                    placeholder="Form description (optional)"
                    className="w-full text-sm bg-transparent border-none outline-none text-slate-500 placeholder-slate-300 dark:placeholder-slate-600"
                  />
                </div>

                {/* Sections and their fields */}
                {formData.sections.length > 0 &&
                  formData.sections
                    .sort((a, b) => a.order - b.order)
                    .map((sec) => {
                      const secFields = formData.fields.filter((f) => f.sectionId === sec.id);
                      return (
                        <div
                          key={sec.id}
                          className="mb-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                          <div className="flex items-center gap-2 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
                            <Layers className="w-3.5 h-3.5 text-celestial-indigo" />
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                              className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
                            />
                            <span className="text-[10px] text-slate-400">
                              {secFields.length} fields
                            </span>
                            <button
                              onClick={() => removeSection(sec.id)}
                              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="p-3 space-y-2 min-h-[60px]">
                            {secFields.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-3">
                                Drag fields here or add from palette
                              </p>
                            ) : (
                              secFields.map((field, idx) => (
                                <FieldCard
                                  key={field.id}
                                  field={field}
                                  index={formData.fields.indexOf(field)}
                                  totalFields={formData.fields.length}
                                  isSelected={selectedFieldId === field.id}
                                  onSelect={() => {
                                    setSelectedFieldId(field.id);
                                    setRightPanel('properties');
                                  }}
                                  onRemove={() => removeField(field.id)}
                                  onMoveUp={() => moveField(field.id, 'up')}
                                  onMoveDown={() => moveField(field.id, 'down')}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}

                {/* Unsectioned fields */}
                <div className="space-y-2">
                  {formData.fields.filter(
                    (f) => !f.sectionId || !formData.sections.find((s) => s.id === f.sectionId)
                  ).length > 0 && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {formData.sections.length > 0 ? 'Unsectioned Fields' : ''}
                    </p>
                  )}
                  {formData.fields
                    .filter(
                      (f) => !f.sectionId || !formData.sections.find((s) => s.id === f.sectionId)
                    )
                    .map((field) => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        index={formData.fields.indexOf(field)}
                        totalFields={formData.fields.length}
                        isSelected={selectedFieldId === field.id}
                        onSelect={() => {
                          setSelectedFieldId(field.id);
                          setRightPanel('properties');
                        }}
                        onRemove={() => removeField(field.id)}
                        onMoveUp={() => moveField(field.id, 'up')}
                        onMoveDown={() => moveField(field.id, 'down')}
                      />
                    ))}
                  {formData.fields.length === 0 && formData.sections.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
                      <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 mb-1">No fields yet</p>
                      <p className="text-xs text-slate-300">
                        Use the Fields panel to add form fields
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel */}
              <div
                className={`bg-white dark:bg-slate-900 shadow-sm overflow-y-auto
                fixed inset-y-0 right-0 z-50 w-72 transition-transform duration-300 ease-in-out
                ${mobileProps ? 'translate-x-0' : 'translate-x-full'}
                lg:relative lg:z-auto lg:w-64 lg:flex-shrink-0 lg:translate-x-0 lg:rounded-2xl lg:border lg:border-slate-200 lg:dark:border-slate-800 lg:transition-none`}
              >
                {/* Panel Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800">
                  {[
                    { key: 'properties' as const, label: 'Field', icon: Settings },
                    { key: 'settings' as const, label: 'Settings', icon: Shield },
                    { key: 'validation' as const, label: 'Rules', icon: ShieldCheck },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setRightPanel(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
                        rightPanel === tab.key
                          ? 'border-celestial-indigo text-celestial-indigo'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <tab.icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={closeAllMobile}
                    className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3">
                  {rightPanel === 'properties' && selectedField ? (
                    <FieldProperties
                      field={selectedField}
                      onChange={(updates) => updateField(selectedField.id, updates)}
                      onRemove={() => removeField(selectedField.id)}
                      onMoveUp={() => moveField(selectedField.id, 'up')}
                      onMoveDown={() => moveField(selectedField.id, 'down')}
                      isFirst={selectedFieldIndex === 0}
                      isLast={selectedFieldIndex === formData.fields.length - 1}
                      allFields={formData.fields}
                      sections={formData.sections}
                    />
                  ) : rightPanel === 'properties' ? (
                    <p className="text-xs text-slate-400 text-center py-8">
                      Select a field to edit its properties
                    </p>
                  ) : rightPanel === 'settings' ? (
                    <FormSettingsPanel
                      formData={formData}
                      onChange={(updates) => {
                        setFormData((prev) => ({ ...prev, ...updates }));
                        setDirty(true);
                      }}
                    />
                  ) : (
                    <ValidationRulesPanel
                      formData={formData}
                      onChange={(updates) => {
                        setFormData((prev) => ({ ...prev, ...updates }));
                        setDirty(true);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Field Card (extracted for reuse)
// ============================================================================

function FieldCard({
  field,
  index,
  totalFields,
  isSelected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  field: FormFieldDef;
  index: number;
  totalFields: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`bg-white dark:bg-slate-800 rounded-xl border p-3 flex items-center gap-3 cursor-pointer transition-all group ${
        isSelected
          ? 'border-celestial-indigo ring-2 ring-celestial-indigo/20 shadow-sm'
          : 'border-slate-200 dark:border-slate-700 hover:border-celestial-indigo/30'
      }`}
    >
      <GripVertical className="w-4 h-4 text-slate-300 cursor-grab flex-shrink-0" />
      <div className="p-1.5 bg-celestial-indigo/10 rounded-lg flex-shrink-0">
        <FieldIcon type={field.type} className="w-3.5 h-3.5 text-celestial-indigo" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
          {field.label}
        </p>
        <p className="text-[10px] text-slate-400 capitalize">
          {field.type}
          {field.required ? ' · Required' : ''}
          {field.defaultValue ? ' · Has default' : ''}
        </p>
      </div>
      {field.required && (
        <span className="text-[10px] bg-celestial-indigo/10 text-celestial-indigo px-1.5 py-0.5 rounded-full font-bold">
          Req
        </span>
      )}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
        >
          <ArrowUp className="w-3 h-3 text-slate-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === totalFields - 1}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
        >
          <ArrowDown className="w-3 h-3 text-slate-400" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
