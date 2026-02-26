'use client';

import React, { useState } from 'react';
import {
  Building2,
  CreditCard,
  User,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  Star,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import type {
  ProvisionTenantData,
  ProvisionedTenant,
  TenantPlan,
} from '@/services/tenantProvisioningService';
import { provisionTenant, getPlanConfigs } from '@/services/tenantProvisioningService';

// ── Types ────────────────────────────────────────────────────────────────────

interface WizardData {
  companyName: string;
  legalName: string;
  domain: string;
  country: string;
  industry: string;
  timezone: string;
  currency: string;
  employeeCount: number;
  plan: TenantPlan;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  billingEmail: string;
  features: string[];
}

// ── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Company Info', icon: <Building2 size={16} /> },
  { id: 2, label: 'Plan Selection', icon: <CreditCard size={16} /> },
  { id: 3, label: 'Admin User', icon: <User size={16} /> },
  { id: 4, label: 'Features', icon: <Layers size={16} /> },
  { id: 5, label: 'Review', icon: <CheckCircle2 size={16} /> },
];

const PLAN_ICONS: Record<TenantPlan, React.ReactNode> = {
  starter: <Zap size={20} />,
  professional: <Star size={20} />,
  enterprise: <Shield size={20} />,
  custom: <Layers size={20} />,
};

const PLAN_COLORS: Record<TenantPlan, string> = {
  starter: 'border-slate-300 bg-slate-50 text-slate-600',
  professional: 'border-indigo-400 bg-indigo-50 text-indigo-600',
  enterprise: 'border-purple-400 bg-purple-50 text-purple-600',
  custom: 'border-amber-400 bg-amber-50 text-amber-600',
};

const INDUSTRIES = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Education',
  'Government',
  'Hospitality',
  'Energy',
  'Professional Services',
  'Other',
];
const TIMEZONES = [
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Kolkata',
  'America/New_York',
  'Europe/London',
  'Asia/Singapore',
];
const CURRENCIES = ['AED', 'SAR', 'INR', 'USD', 'EUR', 'GBP', 'SGD'];

// ── Step Components ──────────────────────────────────────────────────────────

function StepCompanyInfo({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (k: keyof WizardData, v: string | number) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Company Information</h2>
        <p className="text-sm text-slate-500">Enter the details for the new tenant organization.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            value={data.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Acme Corporation"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Legal Name <span className="text-rose-500">*</span>
          </label>
          <input
            value={data.legalName}
            onChange={(e) => onChange('legalName', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Acme Corporation LLC"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Domain <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={data.domain}
              onChange={(e) => onChange('domain', e.target.value)}
              className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="acme.kreupai.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
          <select
            value={data.country}
            onChange={(e) => onChange('country', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {['UAE', 'Saudi Arabia', 'India', 'USA', 'UK', 'Singapore', 'Other'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
          <select
            value={data.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Employee Count</label>
          <input
            type="number"
            value={data.employeeCount}
            onChange={(e) => onChange('employeeCount', parseInt(e.target.value))}
            min={1}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
          <select
            value={data.timezone}
            onChange={(e) => onChange('timezone', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {TIMEZONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Base Currency</label>
          <select
            value={data.currency}
            onChange={(e) => onChange('currency', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepPlanSelection({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (k: keyof WizardData, v: string | number) => void;
}) {
  const plans = getPlanConfigs();
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Select Plan</h2>
        <p className="text-sm text-slate-500">Choose the subscription plan for this tenant.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(Object.entries(plans) as [TenantPlan, (typeof plans)[TenantPlan]][])
          .filter(([k]) => k !== 'custom')
          .map(([key, plan]) => (
            <button
              key={key}
              onClick={() => onChange('plan', key)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${data.plan === key ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${PLAN_COLORS[key]}`}
                >
                  {PLAN_ICONS[key]}
                </div>
                {data.plan === key && <CheckCircle2 size={18} className="text-indigo-600" />}
              </div>
              <h3 className="font-semibold text-slate-800 text-base mb-0.5">{plan.label}</h3>
              <p className="text-2xl font-bold text-indigo-600 mb-3">
                {plan.pricePerUser > 0 ? `$${plan.pricePerUser}` : 'Custom'}
                {plan.pricePerUser > 0 && (
                  <span className="text-sm font-normal text-slate-400">/user/mo</span>
                )}
              </p>
              <div className="space-y-1">
                {plan.features.slice(0, 5).map((f) => (
                  <p key={f} className="text-xs text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-500 shrink-0" /> {f}
                  </p>
                ))}
                {plan.features.length > 5 && (
                  <p className="text-xs text-slate-400">+{plan.features.length - 5} more</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-1 text-xs text-slate-400">
                <span>Users: {plan.maxUsers ?? 'Unlimited'}</span>
                <span>Storage: {plan.storageGB ? `${plan.storageGB}GB` : 'Unlimited'}</span>
              </div>
            </button>
          ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
        <Users size={16} className="text-amber-600 shrink-0" />
        <p className="text-sm text-amber-700">
          Estimated monthly cost:{' '}
          <strong>${getPlanConfigs()[data.plan].pricePerUser * data.employeeCount}</strong> (
          {data.employeeCount} users × ${getPlanConfigs()[data.plan].pricePerUser}/user)
        </p>
      </div>
    </div>
  );
}

function StepAdminUser({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (k: keyof WizardData, v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Administrator Account</h2>
        <p className="text-sm text-slate-500">
          Create the initial administrator user for this tenant.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            First Name <span className="text-rose-500">*</span>
          </label>
          <input
            value={data.adminFirstName}
            onChange={(e) => onChange('adminFirstName', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Last Name <span className="text-rose-500">*</span>
          </label>
          <input
            value={data.adminLastName}
            onChange={(e) => onChange('adminLastName', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={data.adminEmail}
              onChange={(e) => onChange('adminEmail', e.target.value)}
              type="email"
              className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="admin@company.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={data.adminPhone}
              onChange={(e) => onChange('adminPhone', e.target.value)}
              className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="+971 50 000 0000"
            />
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Billing Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={data.billingEmail}
              onChange={(e) => onChange('billingEmail', e.target.value)}
              type="email"
              className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="billing@company.com"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          A temporary password will be generated and sent to the admin email. The admin must change
          the password on first login.
        </p>
      </div>
    </div>
  );
}

function StepFeatures({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (k: keyof WizardData, v: string[]) => void;
}) {
  const planFeatures = getPlanConfigs()[data.plan].features;
  const allModules = [
    'Core HR',
    'Payroll',
    'Recruitment',
    'Time & Attendance',
    'Leave Management',
    'Performance',
    'Learning & Development',
    'ESS/MSS',
    'Workflow Automation',
    'Advanced Analytics',
    'Multi-Entity',
    'AI Insights',
    'GDPR Tools',
    'White Labeling',
    'API Access',
    'SSO',
    'Mobile App',
  ];

  function toggle(feature: string) {
    const current = data.features;
    onChange(
      'features',
      current.includes(feature) ? current.filter((f) => f !== feature) : [...current, feature]
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Enable Features</h2>
        <p className="text-sm text-slate-500">
          Select the modules to activate for this tenant. Features outside the plan will require an
          upgrade.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {allModules.map((module) => {
          const isPlanIncluded = planFeatures.some(
            (f) =>
              f.toLowerCase().includes(module.toLowerCase()) ||
              module.toLowerCase().includes(f.toLowerCase())
          );
          const isEnabled = data.features.includes(module);
          return (
            <button
              key={module}
              onClick={() => isPlanIncluded && toggle(module)}
              disabled={!isPlanIncluded}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isEnabled && isPlanIncluded ? 'border-indigo-400 bg-indigo-50' : isPlanIncluded ? 'border-slate-200 bg-white hover:border-slate-300' : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'}`}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isEnabled ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}
              >
                {isEnabled && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className="text-sm text-slate-700">{module}</span>
              {!isPlanIncluded && (
                <span className="ml-auto text-xs text-slate-400 shrink-0">Upgrade</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepReview({
  data,
  onSubmit,
  loading,
}: {
  data: WizardData;
  onSubmit: () => void;
  loading: boolean;
}) {
  const plan = getPlanConfigs()[data.plan];
  const monthlyCost = plan.pricePerUser * data.employeeCount;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Review and Provision</h2>
        <p className="text-sm text-slate-500">
          Review the configuration before provisioning the new tenant.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Building2 size={12} /> Company
          </h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-800">{data.companyName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Domain</span>
              <span className="font-medium text-slate-800">{data.domain || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Country</span>
              <span className="font-medium text-slate-800">{data.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Industry</span>
              <span className="font-medium text-slate-800">{data.industry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Employees</span>
              <span className="font-medium text-slate-800">{data.employeeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Timezone</span>
              <span className="font-medium text-slate-800">{data.timezone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Currency</span>
              <span className="font-medium text-slate-800">{data.currency}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard size={12} /> Plan & Billing
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan</span>
                <span className="font-semibold text-indigo-700 capitalize">{data.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Price</span>
                <span className="font-medium text-slate-800">${plan.pricePerUser}/user/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Users</span>
                <span className="font-medium text-slate-800">{data.employeeCount}</span>
              </div>
              <div className="flex justify-between border-t border-indigo-200 pt-1.5 mt-1.5">
                <span className="text-slate-600 font-medium">Monthly Total</span>
                <span className="font-bold text-indigo-700">${monthlyCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={12} /> Admin User
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-800">
                  {data.adminFirstName} {data.adminLastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800 truncate ml-2">
                  {data.adminEmail || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers size={12} /> Enabled Features ({data.features.length})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {data.features.map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
            >
              {f}
            </span>
          ))}
          {data.features.length === 0 && (
            <span className="text-xs text-slate-400">No features selected</span>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          Provisioning will create a dedicated database schema, seed default data, create the admin
          account, and send a welcome email. This process takes approximately 30-60 seconds.
        </p>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading || !data.companyName || !data.domain || !data.adminEmail}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 text-sm shadow-lg"
      >
        {loading ? (
          <>
            <RefreshCw size={16} className="animate-spin" /> Provisioning Tenant...
          </>
        ) : (
          <>
            <Building2 size={16} /> Provision Tenant
          </>
        )}
      </button>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────────

function SuccessScreen({ result, onReset }: { result: ProvisionedTenant; onReset: () => void }) {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={40} className="text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Tenant Provisioned!</h2>
        <p className="text-slate-500">
          The new tenant has been successfully created and configured.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-md mx-auto">
        <div className="space-y-2.5 text-sm">
          {[
            { label: 'Tenant ID', value: result.tenantId },
            { label: 'Schema', value: result.schemaName },
            { label: 'Company', value: result.companyName },
            { label: 'Domain', value: result.domain },
            { label: 'Admin Email', value: result.adminEmail },
            { label: 'Status', value: result.status },
            { label: 'Trial Ends', value: result.trialEndsAt?.split('T')[0] ?? 'N/A' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-4">
              <span className="text-slate-400">{item.label}</span>
              <span className="font-medium text-slate-800 text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onReset}
          className="px-5 py-2 border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-slate-50"
        >
          Provision Another
        </button>
        <button className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700">
          View Tenant Dashboard
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const DEFAULT_DATA: WizardData = {
  companyName: '',
  legalName: '',
  domain: '',
  country: 'UAE',
  industry: 'Technology',
  timezone: 'Asia/Dubai',
  currency: 'AED',
  employeeCount: 100,
  plan: 'professional',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  billingEmail: '',
  features: ['Core HR', 'Leave Management', 'ESS/MSS'],
};

export default function TenantProvisioningWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProvisionedTenant | null>(null);

  function handleChange(key: keyof WizardData, value: string | number | string[]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleProvision() {
    setLoading(true);
    const payload: ProvisionTenantData = {
      companyName: data.companyName,
      legalName: data.legalName,
      domain: data.domain,
      country: data.country,
      industry: data.industry,
      timezone: data.timezone,
      currency: data.currency,
      plan: data.plan,
      adminUser: {
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
        email: data.adminEmail,
        phone: data.adminPhone,
      },
      features: data.features,
      employeeCount: data.employeeCount,
      billingEmail: data.billingEmail,
    };
    try {
      const res = await provisionTenant(payload);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 w-full max-w-2xl">
          <SuccessScreen
            result={result}
            onReset={() => {
              setResult(null);
              setCurrentStep(1);
              setData(DEFAULT_DATA);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 size={20} className="text-indigo-600" /> New Tenant Provisioning
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Create a new tenant organization on the AuraOS platform
        </p>
      </div>

      <div className="flex-1 flex max-w-4xl mx-auto w-full p-6 gap-6">
        {/* Step Sidebar */}
        <aside className="w-48 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 sticky top-6">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${currentStep === step.id ? 'bg-indigo-600 text-white font-medium' : step.id < currentStep ? 'text-emerald-600 font-medium hover:bg-emerald-50' : 'text-slate-400 cursor-default'}`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${currentStep === step.id ? 'bg-white text-indigo-600' : step.id < currentStep ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                >
                  {step.id < currentStep ? <CheckCircle2 size={12} /> : step.id}
                </span>
                {step.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Step Content */}
        <div className="flex-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            {currentStep === 1 && (
              <StepCompanyInfo
                data={data}
                onChange={handleChange as (k: keyof WizardData, v: string | number) => void}
              />
            )}
            {currentStep === 2 && (
              <StepPlanSelection
                data={data}
                onChange={handleChange as (k: keyof WizardData, v: string | number) => void}
              />
            )}
            {currentStep === 3 && (
              <StepAdminUser
                data={data}
                onChange={handleChange as (k: keyof WizardData, v: string) => void}
              />
            )}
            {currentStep === 4 && (
              <StepFeatures
                data={data}
                onChange={handleChange as (k: keyof WizardData, v: string[]) => void}
              />
            )}
            {currentStep === 5 && (
              <StepReview data={data} onSubmit={handleProvision} loading={loading} />
            )}

            {currentStep < 5 && (
              <div className="flex justify-between mt-8 pt-5 border-t border-slate-100">
                <button
                  onClick={() => setCurrentStep((s) => s - 1)}
                  disabled={currentStep === 1}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Step Progress Indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-1.5 rounded-full transition-all ${step.id === currentStep ? 'w-8 bg-indigo-600' : step.id < currentStep ? 'w-4 bg-emerald-400' : 'w-4 bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
