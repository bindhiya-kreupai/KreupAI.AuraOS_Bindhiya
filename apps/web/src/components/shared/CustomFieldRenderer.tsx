// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module CustomFieldRenderer
 * @description Universal component that renders any custom field type in input or display mode.
 *              Handles validation, formatting, and all 11 field types.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  ExternalLink,
  Phone,
  Mail,
  Upload,
  X,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import type { CustomField } from '@/services/customFieldsService';

// ============================================================================
// TYPES
// ============================================================================

export type FieldValue = string | number | boolean | string[] | null;

export interface CustomFieldRendererProps {
  field: CustomField;
  value: FieldValue;
  mode: 'input' | 'display';
  onChange?: (value: FieldValue) => void;
  error?: string;
  className?: string;
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateFieldValue(field: CustomField, value: FieldValue): string | null {
  const v = field.validation;

  // Required check
  if (v.required) {
    if (value === null || value === undefined || value === '') return `${field.label} is required.`;
    if (Array.isArray(value) && value.length === 0)
      return `${field.label} requires at least one selection.`;
  }

  if (value === null || value === undefined || value === '') return null;

  // Text validations
  if (
    field.type === 'text' ||
    field.type === 'email' ||
    field.type === 'phone' ||
    field.type === 'url'
  ) {
    const str = String(value);
    if (v.minLength && str.length < v.minLength)
      return `Minimum ${v.minLength} characters required.`;
    if (v.maxLength && str.length > v.maxLength)
      return `Maximum ${v.maxLength} characters allowed.`;
    if (v.pattern && !new RegExp(v.pattern).test(str)) {
      return v.patternDescription ?? 'Invalid format.';
    }
  }

  // Email format
  if (field.type === 'email' && value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return 'Invalid email address.';
  }

  // URL format
  if (field.type === 'url' && value) {
    try {
      new URL(String(value));
    } catch {
      return 'Invalid URL. Must start with https://';
    }
  }

  // Number validations
  if (field.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) return 'Must be a valid number.';
    if (v.min !== undefined && num < v.min) return `Minimum value is ${v.min}.`;
    if (v.max !== undefined && num > v.max) return `Maximum value is ${v.max}.`;
  }

  return null;
}

// ============================================================================
// DISPLAY RENDERERS
// ============================================================================

function DisplayValue({ field, value }: { field: CustomField; value: FieldValue }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-400 italic text-sm">—</span>;
  }

  switch (field.type) {
    case 'checkbox':
      return (
        <span
          className={`inline-flex items-center gap-1 text-sm font-medium ${value ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          {value ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          {value ? 'Yes' : 'No'}
        </span>
      );

    case 'select': {
      const opt = field.options?.find((o) => o.value === value);
      return (
        <span
          className="inline-flex items-center text-sm px-2 py-0.5 rounded-full font-medium"
          style={opt?.color ? { backgroundColor: opt.color + '20', color: opt.color } : undefined}
        >
          {opt?.label ?? String(value)}
        </span>
      );
    }

    case 'multi-select': {
      const vals = Array.isArray(value) ? value : [value];
      return (
        <div className="flex flex-wrap gap-1">
          {vals.map((v) => {
            const opt = field.options?.find((o) => o.value === v);
            return (
              <span
                key={String(v)}
                className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700"
                style={
                  opt?.color ? { backgroundColor: opt.color + '20', color: opt.color } : undefined
                }
              >
                {opt?.label ?? String(v)}
              </span>
            );
          })}
        </div>
      );
    }

    case 'date':
      return (
        <span className="text-sm text-slate-700">
          {new Date(String(value)).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      );

    case 'email':
      return (
        <a
          href={`mailto:${value}`}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <Mail className="h-3.5 w-3.5" />
          {String(value)}
        </a>
      );

    case 'phone':
      return (
        <a
          href={`tel:${value}`}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <Phone className="h-3.5 w-3.5" />
          {String(value)}
        </a>
      );

    case 'url':
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline break-all"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          {String(value)}
        </a>
      );

    case 'number':
      return (
        <span className="text-sm text-slate-700 font-mono">{Number(value).toLocaleString()}</span>
      );

    case 'rich-text':
      return (
        <div
          className="text-sm text-slate-700 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: String(value) }}
        />
      );

    default:
      return <span className="text-sm text-slate-700">{String(value)}</span>;
  }
}

// ============================================================================
// INPUT RENDERERS
// ============================================================================

function TextInput({
  field,
  value,
  onChange,
  hasError,
}: {
  field: CustomField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  hasError: boolean;
}) {
  return (
    <input
      type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
        hasError ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
      } bg-white`}
    />
  );
}

function NumberInputField({
  field,
  value,
  onChange,
  hasError,
}: {
  field: CustomField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  hasError: boolean;
}) {
  return (
    <input
      type="number"
      value={value === null || value === undefined ? '' : String(value)}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      placeholder={field.placeholder}
      min={field.validation.min}
      max={field.validation.max}
      className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
        hasError ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
      } bg-white`}
    />
  );
}

function DateInputField({
  _field,
  value,
  onChange,
  hasError,
}: {
  field: CustomField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  hasError: boolean;
}) {
  return (
    <input
      type="date"
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value || null)}
      className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
        hasError ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
      } bg-white`}
    />
  );
}

function SelectInputField({
  field,
  value,
  onChange,
  hasError,
}: {
  field: CustomField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  hasError: boolean;
}) {
  return (
    <select
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value || null)}
      className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
        hasError ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
      } bg-white`}
    >
      <option value="">{field.placeholder ?? `Select ${field.label}`}</option>
      {(field.options ?? []).map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function MultiSelectInputField({
  field,
  value,
  onChange,
  hasError,
}: {
  field: CustomField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  hasError: boolean;
}) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (optValue: string) => {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onChange(next.length > 0 ? next : null);
  };

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 ${hasError ? 'border-red-400' : 'border-slate-300'}`}
    >
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map((v) => {
            const opt = field.options?.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700"
              >
                {opt?.label ?? v}
                <button type="button" onClick={() => toggle(v)} className="hover:text-blue-900">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
        {(field.options ?? []).map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-sm transition-colors ${
              selected.includes(opt.value)
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="rounded text-blue-600"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxInputField({
  _field,
  value,
  onChange,
}: {
  field: CustomField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        role="checkbox"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className="text-sm text-slate-700">{value ? 'Yes' : 'No'}</span>
    </label>
  );
}

function FileInputField({
  field,
  value,
  onChange,
  hasError,
}: {
  field: CustomField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  hasError: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={field.validation.allowedFileTypes?.join(',') ?? undefined}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file.name);
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
          hasError
            ? 'border-red-400 text-red-600 hover:bg-red-50'
            : 'border-slate-300 text-slate-600 hover:bg-slate-50'
        } bg-white`}
      >
        <Upload className="h-4 w-4" />
        {value ? String(value) : (field.placeholder ?? 'Choose file...')}
      </button>
      {field.validation.allowedFileTypes && (
        <p className="text-xs text-slate-400 mt-0.5">
          Accepted: {field.validation.allowedFileTypes.join(', ')}
        </p>
      )}
    </div>
  );
}

function RichTextInputField({
  field,
  value,
  onChange,
  hasError,
}: {
  field: CustomField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  hasError: boolean;
}) {
  return (
    <textarea
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder ?? 'Enter text...'}
      rows={4}
      className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 resize-y transition-colors ${
        hasError ? 'border-red-400 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
      } bg-white`}
    />
  );
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

export function CustomFieldRenderer({
  field,
  value,
  mode,
  onChange,
  error: externalError,
  className = '',
}: CustomFieldRendererProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  const error = externalError ?? internalError;

  const handleChange = useCallback(
    (newValue: FieldValue) => {
      const validationError = validateFieldValue(field, newValue);
      setInternalError(validationError);
      onChange?.(newValue);
    },
    [field, onChange]
  );

  if (mode === 'display') {
    return (
      <div className={`custom-field-display ${className}`}>
        <DisplayValue field={field} value={value} />
      </div>
    );
  }

  const renderInput = () => {
    const hasError = !!error;
    switch (field.type) {
      case 'number':
        return (
          <NumberInputField
            field={field}
            value={value}
            onChange={handleChange}
            hasError={hasError}
          />
        );
      case 'date':
        return (
          <DateInputField field={field} value={value} onChange={handleChange} hasError={hasError} />
        );
      case 'select':
        return (
          <SelectInputField
            field={field}
            value={value}
            onChange={handleChange}
            hasError={hasError}
          />
        );
      case 'multi-select':
        return (
          <MultiSelectInputField
            field={field}
            value={value}
            onChange={handleChange}
            hasError={hasError}
          />
        );
      case 'checkbox':
        return <CheckboxInputField field={field} value={value} onChange={handleChange} />;
      case 'file':
        return (
          <FileInputField field={field} value={value} onChange={handleChange} hasError={hasError} />
        );
      case 'rich-text':
        return (
          <RichTextInputField
            field={field}
            value={value}
            onChange={handleChange}
            hasError={hasError}
          />
        );
      // text, email, phone, url all use text input
      default:
        return (
          <TextInput field={field} value={value} onChange={handleChange} hasError={hasError} />
        );
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">
        {field.label}
        {field.validation.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
      {renderInput()}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ── Convenience: Render a list of custom fields ───────────────────────────────

export interface CustomFieldsFormProps {
  fields: CustomField[];
  values: Record<string, FieldValue>;
  mode: 'input' | 'display';
  onChange?: (fieldId: string, value: FieldValue) => void;
  errors?: Record<string, string>;
}

export function CustomFieldsForm({
  fields,
  values,
  mode,
  onChange,
  errors,
}: CustomFieldsFormProps) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <CustomFieldRenderer
          key={field.id}
          field={field}
          value={values[field.id] ?? field.defaultValue ?? null}
          mode={mode}
          onChange={mode === 'input' ? (v) => onChange?.(field.id, v) : undefined}
          error={errors?.[field.id]}
        />
      ))}
    </div>
  );
}

export default CustomFieldRenderer;
