// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Landmark,
  MapPin,
  User,
  Phone,
  HeartPulse,
  FileText,
  Home,
  Check,
  Loader2,
  Info,
} from 'lucide-react';
import type { ChangeTypeMeta, ChangeType, ChangeData } from '@/services/profileChangeService';
import { ProfileChangeService } from '@/services/profileChangeService';

// ── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark,
  MapPin,
  User,
  Phone,
  HeartPulse,
  FileText,
  Home,
};

// ── Zod schema for basic validation ──────────────────────────────────────────

const _BaseSchema = z.object({
  changeType: z.string().min(1, 'Please select a change type'),
  reason: z.string().optional(),
  effectiveDate: z.string().optional(),
});

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${
              idx < current
                ? 'text-emerald-600'
                : idx === current
                  ? 'text-indigo-600'
                  : 'text-slate-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                idx < current
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                  : idx === current
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {idx < current ? <Check className="w-3 h-3" /> : idx + 1}
            </div>
            <span className="hidden sm:block">{step}</span>
          </div>
          {idx < steps.length - 1 && (
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Field renderer ────────────────────────────────────────────────────────────

interface FieldProps {
  field: ChangeTypeMeta['fields'][0];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function FieldInput({ field, value, onChange, error }: FieldProps) {
  const baseInputClass =
    'w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ' +
    (error ? 'border-red-400' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400');

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field.type === 'select' ? (
        <select className={baseInputClass} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select {field.label}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          className={`${baseInputClass} resize-none`}
          rows={3}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={field.type === 'phone' ? 'tel' : field.type}
          className={baseInputClass}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.helpText && !error && <p className="mt-1 text-xs text-slate-400">{field.helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Current vs New comparison ─────────────────────────────────────────────────

function ComparisonRow({
  label,
  currentValue,
  newValue,
}: {
  label: string;
  currentValue?: string;
  newValue?: string;
}) {
  if (!newValue) return null;
  const changed = currentValue !== newValue;
  return (
    <div className="grid grid-cols-3 gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={`text-xs ${changed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}
      >
        {currentValue || '—'}
      </span>
      <span
        className={`text-xs font-medium ${changed ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}
      >
        {newValue}
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ChangeRequestFormProps {
  employeeId?: string;
  initialChangeType?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChangeRequestForm({
  employeeId = 'emp-001',
  initialChangeType,
  onSuccess,
  onCancel,
}: ChangeRequestFormProps) {
  const [step, setStep] = useState(initialChangeType ? 1 : 0);
  const [changeTypes, setChangeTypes] = useState<ChangeTypeMeta[]>([]);
  const [selectedType, setSelectedType] = useState<ChangeTypeMeta | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const STEPS = ['Select Type', 'Fill Details', 'Review & Submit'];

  useEffect(() => {
    ProfileChangeService.getChangeTypes().then((types) => {
      setChangeTypes(types);
      if (initialChangeType) {
        const found = types.find((t) => t.type === initialChangeType);
        if (found) setSelectedType(found);
      }
      setLoadingTypes(false);
    });
  }, [initialChangeType]);

  const handleTypeSelect = (type: ChangeTypeMeta) => {
    setSelectedType(type);
    setFormValues({});
    setErrors({});
    setStep(1);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validateStep1 = (): boolean => {
    if (!selectedType) return false;
    const newErrors: Record<string, string> = {};
    for (const field of selectedType.fields) {
      if (field.required && !formValues[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} is required`;
      }
    }
    if (selectedType.effectiveDateRequired && !effectiveDate) {
      newErrors['effectiveDate'] = 'Effective date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const requestedValues: ChangeData = formValues as unknown as ChangeData;
      await ProfileChangeService.createChangeRequest({
        employeeId,
        changeType: selectedType!.type as ChangeType,
        requestedValues,
        reason: reason || undefined,
        effectiveDate: effectiveDate || undefined,
      });
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create change request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTypes) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            New Change Request
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Submit a request to update your profile information
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator steps={STEPS} current={step} />

      {/* Step 0 — Select Type */}
      {step === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {changeTypes.map((ct) => {
            const Icon = ICON_MAP[ct.icon] ?? FileText;
            return (
              <button
                key={ct.type}
                onClick={() => handleTypeSelect(ct)}
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all text-left"
              >
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {ct.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{ct.description}</p>
                  {ct.requiresVerification && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-violet-600">
                      <Info className="w-3 h-3" /> Document verification required
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 1 — Fill Details */}
      {step === 1 && selectedType && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            {React.createElement(ICON_MAP[selectedType.icon] ?? FileText, {
              className: 'w-5 h-5 text-indigo-600 shrink-0',
            })}
            <div>
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                {selectedType.label}
              </p>
              <p className="text-xs text-indigo-600/70 dark:text-indigo-400">
                {selectedType.description}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedType.fields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <FieldInput
                    field={field}
                    value={formValues[field.key] ?? ''}
                    onChange={(v) => handleFieldChange(field.key, v)}
                    error={errors[field.key]}
                  />
                </div>
              ))}
            </div>

            {selectedType.effectiveDateRequired && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Effective Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors['effectiveDate']
                      ? 'border-red-400'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors['effectiveDate'] && (
                  <p className="mt-1 text-xs text-red-500">{errors['effectiveDate']}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Reason for Change
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
                placeholder="Briefly explain why you are requesting this change (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          {selectedType.requiresVerification && (
            <div className="flex items-start gap-3 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
              <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
              <p className="text-xs text-violet-700 dark:text-violet-300">
                This change type requires document verification. You will be prompted to upload
                supporting documents ({selectedType.verificationDocTypes.join(', ')}) after
                submission.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && selectedType && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span>Field</span>
                <span>Current</span>
                <span>New Value</span>
              </div>
            </div>
            <div className="px-5 py-2">
              {selectedType.fields.map((field) =>
                formValues[field.key] ? (
                  <ComparisonRow
                    key={field.key}
                    label={field.label}
                    currentValue="—"
                    newValue={
                      field.type === 'select'
                        ? (field.options?.find((o) => o.value === formValues[field.key])?.label ??
                          formValues[field.key])
                        : formValues[field.key]
                    }
                  />
                ) : null
              )}
              {effectiveDate && <ComparisonRow label="Effective Date" newValue={effectiveDate} />}
              {reason && <ComparisonRow label="Reason" newValue={reason} />}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Please review your changes carefully. Once submitted, this request will be sent for{' '}
              {selectedType.requiresVerification ? 'document verification and ' : ''}approval.
              {selectedType.requiresApproval && ' Your manager will be notified.'}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={step === 0 ? onCancel : () => setStep((s) => s - 1)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < 2 ? (
          <button
            onClick={handleNext}
            disabled={step === 0 && !selectedType}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Submit Request
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
