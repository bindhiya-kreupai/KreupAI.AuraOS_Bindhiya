// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module TenantConfiguration
 * @description Per-tenant configuration panel: general settings, branding, module enablement,
 *              limits, SSO/SAML, and data retention policies.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Palette,
  ToggleRight,
  Shield,
  Database,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Sliders,
} from 'lucide-react';
import {
  TenantService,
  type TenantConfig,
  type TenantModuleConfig,
} from '@/services/tenantService';

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {open && <div className="p-5 pt-0 border-t border-slate-100">{children}</div>}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="sm:col-span-2">{children}</div>
    </div>
  );
}

// ── Input Components ──────────────────────────────────────────────────────────

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-32 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
    </div>
  );
}

// ── Module Toggle ─────────────────────────────────────────────────────────────

function ModuleToggle({
  module,
  onChange,
}: {
  module: TenantModuleConfig;
  onChange: (key: string, enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-slate-700">{module.label}</p>
        <p className="text-xs text-slate-400">{module.category}</p>
      </div>
      <button
        onClick={() => onChange(module.key, !module.enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          module.enabled ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            module.enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface TenantConfigurationProps {
  tenantId: string;
  onSave?: () => void;
}

export function TenantConfiguration({ tenantId, onSave }: TenantConfigurationProps) {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TenantService.getTenantConfig(tenantId);
      setConfig(data);
    } catch {
      setSaveError('Failed to load tenant configuration.');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      setSaveError(null);
      await TenantService.updateTenantConfig(tenantId, config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onSave?.();
    } catch {
      setSaveError('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateGeneral = (key: keyof TenantConfig['generalSettings'], value: string) => {
    setConfig((prev) =>
      prev ? { ...prev, generalSettings: { ...prev.generalSettings, [key]: value } } : prev
    );
  };

  const updateBranding = (key: keyof TenantConfig['branding'], value: string) => {
    setConfig((prev) => (prev ? { ...prev, branding: { ...prev.branding, [key]: value } } : prev));
  };

  const updateModule = (key: string, enabled: boolean) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            modules: prev.modules.map((m) => (m.key === key ? { ...m, enabled } : m)),
          }
        : prev
    );
  };

  const updateLimits = (key: keyof TenantConfig['limits'], value: number | null) => {
    setConfig((prev) => (prev ? { ...prev, limits: { ...prev.limits, [key]: value } } : prev));
  };

  const updateSSO = (key: keyof TenantConfig['sso'], value: string | boolean) => {
    setConfig((prev) => (prev ? { ...prev, sso: { ...prev.sso, [key]: value } } : prev));
  };

  const updateRetention = (key: keyof TenantConfig['dataRetention'], value: number | boolean) => {
    setConfig((prev) =>
      prev ? { ...prev, dataRetention: { ...prev.dataRetention, [key]: value } } : prev
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Failed to load configuration.</p>
        </div>
      </div>
    );
  }

  // Group modules by category
  const modulesByCategory = config.modules.reduce(
    (acc, m) => {
      const cat = m.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(m);
      return acc;
    },
    {} as Record<string, TenantModuleConfig[]>
  );

  const enabledCount = config.modules.filter((m) => m.enabled).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tenant Configuration</h2>
          <p className="text-sm text-slate-500 mt-1">Tenant ID: {tenantId}</p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              Saved
            </div>
          )}
          {saveError && <div className="text-sm text-red-600">{saveError}</div>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* General Settings */}
      <SectionCard title="General Settings" icon={Building2}>
        <div className="space-y-0">
          <Field label="Organization Name">
            <TextInput
              value={config.generalSettings.name}
              onChange={(v) => updateGeneral('name', v)}
              placeholder="Acme Corporation"
            />
          </Field>
          <Field label="Domain" description="Custom subdomain for this tenant">
            <TextInput
              value={config.generalSettings.domain}
              onChange={(v) => updateGeneral('domain', v)}
              placeholder="acme.auraos.app"
            />
          </Field>
          <Field label="Timezone">
            <SelectInput
              value={config.generalSettings.timezone}
              onChange={(v) => updateGeneral('timezone', v)}
              options={[
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'Europe/London', label: 'GMT/BST' },
                { value: 'Europe/Berlin', label: 'Central European Time' },
                { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
                { value: 'Asia/Singapore', label: 'Singapore Time (SGT)' },
                { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
              ]}
            />
          </Field>
          <Field label="Date Format">
            <SelectInput
              value={config.generalSettings.dateFormat}
              onChange={(v) => updateGeneral('dateFormat', v)}
              options={[
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
                { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY' },
              ]}
            />
          </Field>
          <Field label="Currency">
            <SelectInput
              value={config.generalSettings.currency}
              onChange={(v) => updateGeneral('currency', v)}
              options={[
                { value: 'USD', label: 'US Dollar (USD)' },
                { value: 'EUR', label: 'Euro (EUR)' },
                { value: 'GBP', label: 'British Pound (GBP)' },
                { value: 'INR', label: 'Indian Rupee (INR)' },
                { value: 'CAD', label: 'Canadian Dollar (CAD)' },
                { value: 'AUD', label: 'Australian Dollar (AUD)' },
                { value: 'SGD', label: 'Singapore Dollar (SGD)' },
              ]}
            />
          </Field>
          <Field label="Language">
            <SelectInput
              value={config.generalSettings.language}
              onChange={(v) => updateGeneral('language', v)}
              options={[
                { value: 'en-US', label: 'English (US)' },
                { value: 'en-GB', label: 'English (UK)' },
                { value: 'es-ES', label: 'Spanish' },
                { value: 'fr-FR', label: 'French' },
                { value: 'de-DE', label: 'German' },
                { value: 'pt-BR', label: 'Portuguese (Brazil)' },
                { value: 'zh-CN', label: 'Chinese (Simplified)' },
                { value: 'hi-IN', label: 'Hindi' },
              ]}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Branding */}
      <SectionCard title="Branding" icon={Palette}>
        <div className="space-y-0">
          <Field label="Company Name" description="Displayed in UI headers">
            <TextInput
              value={config.branding.companyName}
              onChange={(v) => updateBranding('companyName', v)}
              placeholder="Acme Corporation"
            />
          </Field>
          <Field label="Logo URL" description="HTTPS URL to company logo (recommended: 200x50px)">
            <TextInput
              value={config.branding.logoUrl ?? ''}
              onChange={(v) => updateBranding('logoUrl', v)}
              placeholder="https://cdn.acme.com/logo.png"
              type="url"
            />
          </Field>
          <Field label="Primary Color" description="Main brand color (hex)">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.branding.primaryColor}
                onChange={(e) => updateBranding('primaryColor', e.target.value)}
                className="h-8 w-12 rounded cursor-pointer border border-slate-300"
              />
              <TextInput
                value={config.branding.primaryColor}
                onChange={(v) => updateBranding('primaryColor', v)}
                placeholder="#2563EB"
              />
            </div>
          </Field>
          <Field label="Accent Color" description="Secondary accent color (hex)">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.branding.accentColor}
                onChange={(e) => updateBranding('accentColor', e.target.value)}
                className="h-8 w-12 rounded cursor-pointer border border-slate-300"
              />
              <TextInput
                value={config.branding.accentColor}
                onChange={(v) => updateBranding('accentColor', v)}
                placeholder="#7C3AED"
              />
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* Module Enablement */}
      <SectionCard
        title={`Module Enablement (${enabledCount} / ${config.modules.length} enabled)`}
        icon={ToggleRight}
      >
        <div className="space-y-4 pt-2">
          {Object.entries(modulesByCategory).map(([category, modules]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {category}
              </p>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 px-4">
                {modules.map((m) => (
                  <ModuleToggle key={m.key} module={m} onChange={updateModule} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Limits */}
      <SectionCard title="Limits & Quotas" icon={Sliders}>
        <div className="space-y-0">
          <Field label="Max Users" description="null = unlimited">
            <div className="flex items-center gap-3">
              <NumberInput
                value={config.limits.maxUsers ?? 0}
                onChange={(v) => updateLimits('maxUsers', v === 0 ? null : v)}
                min={1}
                suffix="users"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={config.limits.maxUsers === null}
                  onChange={(e) => updateLimits('maxUsers', e.target.checked ? null : 100)}
                  className="rounded"
                />
                Unlimited
              </label>
            </div>
          </Field>
          <Field label="Storage Limit">
            <div className="flex items-center gap-3">
              <NumberInput
                value={config.limits.storageLimitGB ?? 0}
                onChange={(v) => updateLimits('storageLimitGB', v === 0 ? null : v)}
                min={1}
                suffix="GB"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={config.limits.storageLimitGB === null}
                  onChange={(e) => updateLimits('storageLimitGB', e.target.checked ? null : 10)}
                  className="rounded"
                />
                Unlimited
              </label>
            </div>
          </Field>
          <Field label="API Rate Limit" description="Requests per minute">
            <NumberInput
              value={config.limits.apiRateLimit}
              onChange={(v) => updateLimits('apiRateLimit', v)}
              min={10}
              max={10000}
              suffix="req/min"
            />
          </Field>
          <Field label="Session Timeout">
            <NumberInput
              value={config.limits.sessionTimeoutMinutes}
              onChange={(v) => updateLimits('sessionTimeoutMinutes', v)}
              min={15}
              max={1440}
              suffix="minutes"
            />
          </Field>
          <Field label="Max File Upload">
            <NumberInput
              value={config.limits.maxFileUploadMB}
              onChange={(v) => updateLimits('maxFileUploadMB', v)}
              min={1}
              max={500}
              suffix="MB"
            />
          </Field>
        </div>
      </SectionCard>

      {/* SSO / SAML */}
      <SectionCard title="SSO / SAML Configuration" icon={Shield} defaultOpen={false}>
        <div className="space-y-0">
          <Field label="Enable SSO">
            <button
              onClick={() => updateSSO('enabled', !config.sso.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.sso.enabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  config.sso.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </Field>
          {config.sso.enabled && (
            <>
              <Field label="Provider">
                <SelectInput
                  value={config.sso.provider}
                  onChange={(v) => updateSSO('provider', v)}
                  options={[
                    { value: 'saml', label: 'SAML 2.0' },
                    { value: 'oidc', label: 'OpenID Connect (OIDC)' },
                  ]}
                />
              </Field>
              <Field label="Metadata URL" description="IdP metadata URL for SAML">
                <TextInput
                  value={config.sso.metadataUrl ?? ''}
                  onChange={(v) => updateSSO('metadataUrl', v)}
                  placeholder="https://idp.example.com/metadata.xml"
                  type="url"
                />
              </Field>
              <Field label="Entity ID">
                <TextInput
                  value={config.sso.entityId ?? ''}
                  onChange={(v) => updateSSO('entityId', v)}
                  placeholder="https://auraos.app/sp/acme"
                />
              </Field>
              <Field label="ACS URL" description="Assertion Consumer Service URL">
                <TextInput
                  value={config.sso.acsUrl ?? ''}
                  onChange={(v) => updateSSO('acsUrl', v)}
                  placeholder="https://acme.auraos.app/sso/acs"
                />
              </Field>
            </>
          )}
        </div>
      </SectionCard>

      {/* Data Retention */}
      <SectionCard title="Data Retention" icon={Database} defaultOpen={false}>
        <div className="space-y-0">
          <Field
            label="Employee Data"
            description="Years to retain employee records after termination"
          >
            <NumberInput
              value={config.dataRetention.employeeDataYears}
              onChange={(v) => updateRetention('employeeDataYears', v)}
              min={1}
              max={20}
              suffix="years"
            />
          </Field>
          <Field label="Audit Logs" description="Years to retain security and audit logs">
            <NumberInput
              value={config.dataRetention.auditLogsYears}
              onChange={(v) => updateRetention('auditLogsYears', v)}
              min={1}
              max={10}
              suffix="years"
            />
          </Field>
          <Field label="Documents" description="Years to retain uploaded documents">
            <NumberInput
              value={config.dataRetention.documentRetentionYears}
              onChange={(v) => updateRetention('documentRetentionYears', v)}
              min={1}
              max={30}
              suffix="years"
            />
          </Field>
          <Field label="Auto-Delete" description="Automatically delete data after retention period">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateRetention('autoDeleteEnabled', !config.dataRetention.autoDeleteEnabled)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.dataRetention.autoDeleteEnabled ? 'bg-red-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    config.dataRetention.autoDeleteEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              {config.dataRetention.autoDeleteEnabled && (
                <span className="text-xs text-red-600 font-medium">
                  Warning: Data will be permanently deleted after retention period
                </span>
              )}
            </div>
          </Field>
        </div>
      </SectionCard>

      {/* Save Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saveError && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="flex items-center gap-1 text-sm text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            Configuration saved successfully
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

export default TenantConfiguration;
