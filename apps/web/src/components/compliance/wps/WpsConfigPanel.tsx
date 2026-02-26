'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  CreditCard,
  Shield,
  Save,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  X,
} from 'lucide-react';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

const WpsConfigSchema = z.object({
  wpsAgentCode: z.string().min(2, 'Agent code must be at least 2 characters').max(50),
  employerCode: z.string().min(2, 'Employer code required').max(50),
  bankCode: z.string().regex(/^\d{3,4}$/, 'Bank routing code must be 3–4 numeric digits'),
  bankName: z.string().min(2, 'Bank name required').max(100),
  bankBranchCode: z.string().optional(),
  molEstablishmentId: z.string().optional(),
  companyName: z.string().min(2, 'Company name required').max(200),
  contactPerson: z.string().min(2, 'Contact person required').max(100),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Valid phone number required'),
  submissionDay: z.number().int().min(1, 'Day must be 1–28').max(28, 'Day must be 1–28'),
  autoSubmit: z.boolean(),
  wpsFilePrefix: z.string().max(10).default('WPS'),
});

type WpsConfigFormData = z.infer<typeof WpsConfigSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValidationError {
  field: keyof WpsConfigFormData;
  message: string;
}

// ---------------------------------------------------------------------------
// Mock Initial Data
// ---------------------------------------------------------------------------

const INITIAL_CONFIG: WpsConfigFormData = {
  wpsAgentCode: 'ENBD_WPS_001',
  employerCode: 'MOL_EMP_123456',
  bankCode: '0302',
  bankName: 'Emirates NBD',
  bankBranchCode: 'DBX001',
  molEstablishmentId: 'EST_987654',
  companyName: 'Kreup AI Technologies LLC',
  contactPerson: 'Mohammed Al Farsi',
  contactEmail: 'payroll@kreupai.com',
  contactPhone: '+971 4 123 4567',
  submissionDay: 25,
  autoSubmit: false,
  wpsFilePrefix: 'WPS',
};

const UAE_BANKS = [
  { code: '0302', name: 'Emirates NBD' },
  { code: '0330', name: 'Abu Dhabi Commercial Bank (ADCB)' },
  { code: '0512', name: 'First Abu Dhabi Bank (FAB)' },
  { code: '0400', name: 'Dubai Islamic Bank (DIB)' },
  { code: '0350', name: 'RAKBANK' },
  { code: '0601', name: 'Mashreq Bank' },
  { code: '0033', name: 'HSBC Bank Middle East' },
  { code: '0020', name: 'Standard Chartered Bank UAE' },
  { code: '0016', name: 'Citibank UAE' },
];

// ---------------------------------------------------------------------------
// Helper
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

function Input({
  value,
  onChange,
  disabled,
  placeholder,
  type = 'text',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
    />
  );
}

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

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
    <div className="flex items-center gap-3 pb-3 border-b border-slate-200 mb-4">
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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function WpsConfigPanel() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState<WpsConfigFormData>(INITIAL_CONFIG);
  const [draftData, setDraftData] = useState<WpsConfigFormData>(INITIAL_CONFIG);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showAgentCode, setShowAgentCode] = useState(false);

  const getError = (field: keyof WpsConfigFormData): string | undefined =>
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
    const result = WpsConfigSchema.safeParse(draftData);
    if (!result.success) {
      const fieldErrors: ValidationError[] = result.error.errors.map((e) => ({
        field: e.path[0] as keyof WpsConfigFormData,
        message: e.message,
      }));
      setErrors(fieldErrors);
      return;
    }
    setErrors([]);
    setIsSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setFormData(result.data);
    setIsSaving(false);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const update = (field: keyof WpsConfigFormData) => (value: string | boolean | number) => {
    setDraftData((prev) => ({ ...prev, [field]: value }));
  };

  const data = isEditing ? draftData : formData;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-700 p-2.5">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">WPS Configuration</h2>
            <p className="text-sm text-slate-500">
              Agent codes, bank routing, and MoHRE establishment settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved successfully
            </span>
          )}
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Edit2 className="h-4 w-4" />
              Edit Configuration
            </button>
          ) : (
            <div className="flex items-center gap-2">
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
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              WPS Compliance — UAE Federal Law No. 15 of 2017
            </p>
            <p className="mt-0.5 text-xs text-blue-700">
              All UAE mainland employers must submit salary information via WPS through a
              Ministry-approved agent. Late or non-submission can result in fines and work permit
              bans.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: WPS Agent Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={Shield}
          title="WPS Agent Settings"
          subtitle="MoHRE-issued codes for your WPS agent and employer"
          accent="bg-blue-600"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="WPS Agent Code"
            required
            hint="Issued by your WPS-approved agent (bank or exchange)"
            error={getError('wpsAgentCode')}
          >
            <div className="relative">
              <Input
                value={data.wpsAgentCode}
                onChange={update('wpsAgentCode')}
                disabled={!isEditing}
                type={showAgentCode || isEditing ? 'text' : 'password'}
                placeholder="e.g. ENBD_WPS_001"
              />
              {!isEditing && (
                <button
                  onClick={() => setShowAgentCode(!showAgentCode)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showAgentCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
          </Field>

          <Field
            label="Employer Code"
            required
            hint="Ministry of Labour employer registration number"
            error={getError('employerCode')}
          >
            <Input
              value={data.employerCode}
              onChange={update('employerCode')}
              disabled={!isEditing}
              placeholder="e.g. MOL_EMP_123456"
            />
          </Field>

          <Field
            label="MoL Establishment ID"
            hint="Optional — Ministry of Labour establishment identifier"
            error={getError('molEstablishmentId')}
          >
            <Input
              value={data.molEstablishmentId ?? ''}
              onChange={update('molEstablishmentId')}
              disabled={!isEditing}
              placeholder="e.g. EST_987654"
            />
          </Field>

          <Field
            label="WPS File Prefix"
            hint="3-letter prefix for generated SIF file names"
            error={getError('wpsFilePrefix')}
          >
            <Input
              value={data.wpsFilePrefix}
              onChange={update('wpsFilePrefix')}
              disabled={!isEditing}
              placeholder="WPS"
              className="uppercase"
            />
          </Field>
        </div>
      </div>

      {/* Section 2: Bank / Routing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={CreditCard}
          title="Bank Routing"
          subtitle="Primary bank details used for salary disbursement"
          accent="bg-violet-600"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Bank Routing Code"
            required
            hint="3–4 digit WPS routing code"
            error={getError('bankCode')}
          >
            {isEditing ? (
              <select
                value={data.bankCode}
                onChange={(e) => {
                  const bank = UAE_BANKS.find((b) => b.code === e.target.value);
                  update('bankCode')(e.target.value);
                  if (bank) update('bankName')(bank.name);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select bank...</option>
                {UAE_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.code} — {bank.name}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={data.bankCode}
                onChange={update('bankCode')}
                disabled
                placeholder="0302"
              />
            )}
          </Field>

          <Field label="Bank Name" required error={getError('bankName')}>
            <Input
              value={data.bankName}
              onChange={update('bankName')}
              disabled={!isEditing}
              placeholder="Emirates NBD"
            />
          </Field>

          <Field
            label="Branch Code"
            hint="Optional — specific branch identifier"
            error={getError('bankBranchCode')}
          >
            <Input
              value={data.bankBranchCode ?? ''}
              onChange={update('bankBranchCode')}
              disabled={!isEditing}
              placeholder="e.g. DBX001"
            />
          </Field>
        </div>
      </div>

      {/* Section 3: Company & Contact */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={Building2}
          title="Company & Contact"
          subtitle="Legal entity name and WPS contact person"
          accent="bg-emerald-600"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Legal Company Name" required error={getError('companyName')}>
              <Input
                value={data.companyName}
                onChange={update('companyName')}
                disabled={!isEditing}
                placeholder="Company name as registered with MoHRE"
              />
            </Field>
          </div>

          <Field label="Contact Person" required error={getError('contactPerson')}>
            <Input
              value={data.contactPerson}
              onChange={update('contactPerson')}
              disabled={!isEditing}
              placeholder="Full name"
            />
          </Field>

          <Field label="Contact Email" required error={getError('contactEmail')}>
            <Input
              value={data.contactEmail}
              onChange={update('contactEmail')}
              disabled={!isEditing}
              type="email"
              placeholder="payroll@company.com"
            />
          </Field>

          <Field label="Contact Phone" required error={getError('contactPhone')}>
            <Input
              value={data.contactPhone}
              onChange={update('contactPhone')}
              disabled={!isEditing}
              placeholder="+971 4 XXX XXXX"
            />
          </Field>
        </div>
      </div>

      {/* Section 4: Submission Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={Settings}
          title="Submission Settings"
          subtitle="Configure automatic submission timing and reminders"
          accent="bg-amber-500"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Submission Day of Month"
            required
            hint="Day (1–28) to submit WPS file each month"
            error={getError('submissionDay')}
          >
            {isEditing ? (
              <input
                type="number"
                min={1}
                max={28}
                value={data.submissionDay}
                onChange={(e) => update('submissionDay')(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-900">
                  Day {data.submissionDay} of each month
                </span>
              </div>
            )}
          </Field>

          <Field label="Auto Submit" hint="Automatically submit to MoHRE portal on the set day">
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => isEditing && update('autoSubmit')(!data.autoSubmit)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  data.autoSubmit ? 'bg-blue-600' : 'bg-slate-300'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    data.autoSubmit ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-slate-700">
                {data.autoSubmit ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </Field>
        </div>
      </div>

      {/* Validation errors summary */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-sm font-semibold text-red-700">
              Please fix {errors.length} error{errors.length !== 1 ? 's' : ''} before saving
            </p>
          </div>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-red-600">
                • <span className="font-medium">{err.field}</span>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WpsConfigPanel;
