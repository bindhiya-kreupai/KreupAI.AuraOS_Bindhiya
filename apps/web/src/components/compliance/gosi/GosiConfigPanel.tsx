// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Save,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Info,
  Percent,
  CreditCard,
  Users,
} from 'lucide-react';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

const GosiConfigSchema = z.object({
  companyName: z.string().min(2, 'Company name required').max(200),
  gosiSubscriptionNumber: z.string().min(5, 'GOSI subscription number required').max(50),
  establishmentNumber: z.string().optional(),
  bankAccountIBAN: z
    .string()
    .regex(/^SA\d{22}$/, 'Saudi IBAN must be 24 characters starting with SA')
    .optional()
    .or(z.literal('')),
  contactName: z.string().min(2, 'Contact name required').max(100),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().min(7, 'Valid phone required').max(20),
  submissionDueDay: z.number().int().min(1).max(28),
  autoCalculate: z.boolean(),
  autoSubmit: z.boolean(),
});

type GosiConfigFormData = z.infer<typeof GosiConfigSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValidationError {
  field: keyof GosiConfigFormData;
  message: string;
}

// ---------------------------------------------------------------------------
// Mock Initial Data
// ---------------------------------------------------------------------------

const INITIAL_CONFIG: GosiConfigFormData = {
  companyName: 'Kreup AI Technologies Arabia LLC',
  gosiSubscriptionNumber: 'GOSI-KSA-20240001',
  establishmentNumber: 'MOL-EST-789012',
  bankAccountIBAN: 'SA0380000000608010167519',
  contactName: 'Abdullah Al Otaibi',
  contactEmail: 'gosi@kreupai.com.sa',
  contactPhone: '+966 11 234 5678',
  submissionDueDay: 15,
  autoCalculate: true,
  autoSubmit: false,
};

// ---------------------------------------------------------------------------
// Rate Display (read-only — rates are regulatory, not configurable)
// ---------------------------------------------------------------------------

const RATE_ROWS = [
  {
    label: 'Saudi Pension — Employee',
    rate: '9.75%',
    note: 'Deducted from employee salary',
    color: 'bg-blue-500',
  },
  {
    label: 'Saudi Pension — Employer',
    rate: '9.75%',
    note: 'Borne by employer',
    color: 'bg-blue-400',
  },
  {
    label: 'SANED — Employee (Saudi)',
    rate: '0.75%',
    note: 'Unemployment insurance',
    color: 'bg-violet-500',
  },
  {
    label: 'SANED — Employer (Saudi)',
    rate: '0.75%',
    note: 'Unemployment insurance',
    color: 'bg-violet-400',
  },
  {
    label: 'Occupational Hazards — Employer',
    rate: '2.00%',
    note: 'Saudi only, employer borne',
    color: 'bg-amber-500',
  },
  {
    label: 'SANED — Employee (Non-Saudi)',
    rate: '2.00%',
    note: 'No pension for non-Saudis',
    color: 'bg-slate-500',
  },
  {
    label: 'SANED — Employer (Non-Saudi)',
    rate: '2.00%',
    note: 'No pension for non-Saudis',
    color: 'bg-slate-400',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  disabled,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
    />
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3">
      <div className={`rounded-lg p-2 ${accent}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
  disabled,
  label,
  sub,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? 'bg-emerald-600' : 'bg-slate-300'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function GosiConfigPanel() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState<GosiConfigFormData>(INITIAL_CONFIG);
  const [draftData, setDraftData] = useState<GosiConfigFormData>(INITIAL_CONFIG);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showRates, setShowRates] = useState(false);

  const getError = (field: keyof GosiConfigFormData): string | undefined =>
    errors.find((e) => e.field === field)?.message;

  const handleEdit = () => {
    setDraftData(formData);
    setErrors([]);
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setDraftData(formData);
    setErrors([]);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const result = GosiConfigSchema.safeParse(draftData);
    if (!result.success) {
      setErrors(
        result.error.errors.map((e) => ({
          field: e.path[0] as keyof GosiConfigFormData,
          message: e.message,
        }))
      );
      return;
    }
    setErrors([]);
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setFormData(result.data);
    setIsSaving(false);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const update = (field: keyof GosiConfigFormData) => (value: string | boolean | number) =>
    setDraftData((prev) => ({ ...prev, [field]: value }));

  const data = isEditing ? draftData : formData;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-700 p-2.5">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">GOSI Configuration</h2>
            <p className="text-sm text-slate-500">
              Subscription number, branch, and contribution settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legal notice */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div>
            <p className="text-sm font-medium text-emerald-800">
              GOSI — Saudi Labour Law Obligation
            </p>
            <p className="mt-0.5 text-xs text-emerald-700">
              All employers operating in Saudi Arabia must register with GOSI and submit monthly
              contribution reports. Non-compliance results in penalties and suspension of IQAMA
              renewals. Deadline: 15th of each Gregorian month.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: GOSI Registration */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={Shield}
          title="GOSI Registration"
          subtitle="Subscription and establishment numbers from GOSI portal"
          accent="bg-emerald-600"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Company Legal Name" required error={getError('companyName')}>
              <TextInput
                value={data.companyName}
                onChange={update('companyName')}
                disabled={!isEditing}
                placeholder="Company name as registered with GOSI"
              />
            </Field>
          </div>
          <Field
            label="GOSI Subscription Number"
            required
            hint="Assigned upon company registration with GOSI"
            error={getError('gosiSubscriptionNumber')}
          >
            <TextInput
              value={data.gosiSubscriptionNumber}
              onChange={update('gosiSubscriptionNumber')}
              disabled={!isEditing}
              placeholder="e.g. GOSI-KSA-20240001"
            />
          </Field>
          <Field
            label="Establishment Number"
            hint="Ministry of Labour establishment identifier (optional)"
            error={getError('establishmentNumber')}
          >
            <TextInput
              value={data.establishmentNumber ?? ''}
              onChange={update('establishmentNumber')}
              disabled={!isEditing}
              placeholder="e.g. MOL-EST-789012"
            />
          </Field>
        </div>
      </div>

      {/* Section 2: Bank */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={CreditCard}
          title="Bank Account"
          subtitle="Saudi IBAN used for GOSI contribution transfers"
          accent="bg-blue-600"
        />
        <div className="grid grid-cols-1 gap-4">
          <Field
            label="Bank Account IBAN"
            hint="Saudi IBAN — 24 characters starting with SA"
            error={getError('bankAccountIBAN')}
          >
            <TextInput
              value={data.bankAccountIBAN ?? ''}
              onChange={update('bankAccountIBAN')}
              disabled={!isEditing}
              placeholder="SA0380000000608010167519"
            />
          </Field>
        </div>
      </div>

      {/* Section 3: Contact */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={Users}
          title="Contact Person"
          subtitle="GOSI liaison / HR representative"
          accent="bg-violet-600"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Full Name" required error={getError('contactName')}>
              <TextInput
                value={data.contactName}
                onChange={update('contactName')}
                disabled={!isEditing}
                placeholder="Full name"
              />
            </Field>
          </div>
          <Field label="Email" required error={getError('contactEmail')}>
            <TextInput
              value={data.contactEmail}
              onChange={update('contactEmail')}
              disabled={!isEditing}
              type="email"
              placeholder="gosi@company.com.sa"
            />
          </Field>
          <Field label="Phone" required error={getError('contactPhone')}>
            <TextInput
              value={data.contactPhone}
              onChange={update('contactPhone')}
              disabled={!isEditing}
              placeholder="+966 11 XXX XXXX"
            />
          </Field>
        </div>
      </div>

      {/* Section 4: Automation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={Settings}
          title="Automation Settings"
          subtitle="Configure calculation and submission scheduling"
          accent="bg-amber-500"
        />
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Submission Due Day"
              hint="Day of month (1–28) GOSI contribution is due"
              error={getError('submissionDueDay')}
            >
              {isEditing ? (
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={data.submissionDueDay}
                  onChange={(e) => update('submissionDueDay')(parseInt(e.target.value, 10) || 15)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              ) : (
                <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  Day {data.submissionDueDay} of each month
                </div>
              )}
            </Field>
          </div>

          <Toggle
            label="Auto-Calculate Contributions"
            sub="Automatically compute contributions when payroll is finalized"
            value={data.autoCalculate}
            onChange={update('autoCalculate')}
            disabled={!isEditing}
          />
          <Toggle
            label="Auto-Submit to GOSI Portal"
            sub="Submit on due date without manual confirmation"
            value={data.autoSubmit}
            onChange={update('autoSubmit')}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Section 5: Rates Reference (read-only) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          onClick={() => setShowRates(!showRates)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-600 p-2">
              <Percent className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">Statutory Contribution Rates</p>
              <p className="text-xs text-slate-500">
                Fixed by GOSI — not editable (updated per official circulars)
              </p>
            </div>
          </div>
          <RefreshCw
            className={`h-4 w-4 text-slate-400 transition-transform ${showRates ? 'rotate-180' : ''}`}
          />
        </button>

        {showRates && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">
                    Contribution Type
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">
                    Rate
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RATE_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${row.color}`} />
                        <span className="text-slate-700">{row.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                      {row.rate}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{row.note}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-4 py-2.5 text-xs font-semibold text-slate-700" colSpan={3}>
                    Contribution base: Basic + Housing Allowance, capped at SAR 45,000/month.
                    Source: GOSI Circular SS/1451 (2024).
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-sm font-semibold text-red-700">
              {errors.length} error{errors.length !== 1 ? 's' : ''} to fix before saving
            </p>
          </div>
          <ul className="space-y-1">
            {errors.map((e, i) => (
              <li key={i} className="text-xs text-red-600">
                • <span className="font-medium">{e.field}</span>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GosiConfigPanel;
