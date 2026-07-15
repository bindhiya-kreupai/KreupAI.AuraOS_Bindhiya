'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Layers,
  Globe,
  Building,
  User,
  Plus,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Info,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

interface Rule {
  id: string;
  code: string;
  name: string;
  categoryCode: string;
  countryCode: string | null;
  legalEntityId: string | null;
  cadence: string;
  dayOfMonth: number | null;
  monthOfYear: number | null;
  ownerRole: string;
  escalationRole: string | null;
  leadDays: number;
  tierAlerts: number[];
  isActive: boolean;
}

interface Company {
  id: string;
  code: string;
  name: string;
}

interface Category {
  id: string;
  code: string;
  name: string;
  ownerRole: string;
  defaultCadence: string;
}

const CATEGORY_MAP: Record<string, string> = {
  PAYROLL: 'Payroll Cut-off',
  WPS: 'Wage Protection System',
  SOCIAL_INSURANCE: 'Social Insurance',
  IMMIGRATION: 'Visa & Work Permits',
  NATIONALIZATION: 'Nationalization Target',
  HOLIDAY: 'Holidays & Ramadan',
  BENEFITS: 'Benefits & Insurance',
  HSE: 'HSE & Training',
  EMPLOYEE_RELATIONS: 'Employee Relations',
  DOCUMENT_AUDIT: 'Personnel-File Audit',
};

const COUNTRY_MAP: Record<string, string> = {
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  BH: 'Bahrain',
  QA: 'Qatar',
  OM: 'Oman',
  KW: 'Kuwait',
};

const ROLE_MAP: Record<string, string> = {
  PAYROLL_OFFICER: 'Payroll Specialist',
  HR_MANAGER: 'HR Operations Manager',
  PRO_OFFICER: 'Public Relations Officer',
  HR_ADMIN: 'HR Administrator',
  COMPLIANCE_OFFICER: 'Chief Compliance Officer',
  INTERNAL_AUDITOR: 'Internal Audit Lead',
  EXECUTIVE_LEADERSHIP: 'Executive Director',
};

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: '',
  });

  // Modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleCode, setNewRuleCode] = useState('');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('PAYROLL');
  const [newRuleCountry, setNewRuleCountry] = useState('AE');
  const [newRuleLegalEntity, setNewRuleLegalEntity] = useState('');
  const [newRuleCadence, setNewRuleCadence] = useState('MONTHLY');
  const [newRuleDOM, setNewRuleDOM] = useState('1');
  const [newRuleMOY, setNewRuleMOY] = useState('1');
  const [newRuleOwnerRole, setNewRuleOwnerRole] = useState('PAYROLL_OFFICER');
  const [newRuleEscRole, setNewRuleEscRole] = useState('HR_MANAGER');
  const [newRuleLeadDays, setNewRuleLeadDays] = useState('7');
  const [newRuleAlerts, setNewRuleAlerts] = useState('5, 2, 1');

  async function loadData() {
    setLoading(true);
    try {
      // 1. Fetch rules
      const rulesRes = await fetch('/api/v1/compliance-calendar/rules');
      const rulesData = await rulesRes.json();
      if (rulesData.success) {
        setRules(rulesData.data ?? []);
      }

      // 2. Fetch categories
      const catRes = await fetch('/api/v1/compliance-calendar/categories');
      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.data ?? []);
      }

      // 3. Fetch companies
      const compRes = await fetch('/api/v1/companies');
      const compData = await compRes.json();
      if (compData.success) {
        const lookup: Record<string, string> = {};
        (compData.data?.data || []).forEach((c: Company) => {
          lookup[c.id] = c.name;
        });
        setCompanies(lookup);
      }
    } catch (e) {
      console.error('Failed to load recurrence rules data', e);
      setMessage({ type: 'error', text: 'Error connecting to recurrence engines' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleToggleRule(rule: Rule) {
    try {
      setActionLoading(true);
      const r = await fetch('/api/v1/compliance-calendar/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          ruleId: rule.id,
          isActive: !rule.isActive,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setRules((prev) =>
          prev.map((item) => (item.id === rule.id ? { ...item, isActive: !rule.isActive } : item))
        );
        setMessage({
          type: 'success',
          text: `Recurrence engine rule "${rule.name}" is now ${!rule.isActive ? 'ACTIVE' : 'INACTIVE'}.`,
        });
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Toggle failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to update rule status' });
    } finally {
      setActionLoading(false);
    }
  }

  function handleDeleteRule(rule: Rule) {
    setRuleToDelete(rule);
    setShowDeleteConfirm(true);
  }

  async function executeDeleteRule() {
    if (!ruleToDelete) return;
    try {
      setActionLoading(true);
      const r = await fetch('/api/v1/compliance-calendar/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          ruleId: ruleToDelete.id,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setRules((prev) => prev.filter((item) => item.id !== ruleToDelete.id));
        setMessage({
          type: 'success',
          text: `Success: Recurrence rule "${ruleToDelete.name}" has been removed.`,
        });
        setShowDeleteConfirm(false);
        setRuleToDelete(null);
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Deletion failed' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to delete recurrence rule' });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreateRule(e: React.FormEvent) {
    e.preventDefault();
    try {
      setActionLoading(true);
      const alertsArr = newRuleAlerts
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));

      const r = await fetch('/api/v1/compliance-calendar/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newRuleCode.toUpperCase().replace(/\s+/g, '_'),
          name: newRuleName,
          categoryCode: newRuleCategory,
          countryCode: newRuleCountry || null,
          legalEntityId: newRuleLegalEntity || null,
          cadence: newRuleCadence,
          dayOfMonth: Number(newRuleDOM) || 1,
          monthOfYear: newRuleCadence === 'ANNUAL' ? Number(newRuleMOY) || 1 : null,
          ownerRole: newRuleOwnerRole,
          escalationRole: newRuleEscRole || null,
          leadDays: Number(newRuleLeadDays) || 7,
          tierAlerts: alertsArr,
        }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage({
          type: 'success',
          text: `Success: New recurrence engine rule "${newRuleName}" created.`,
        });
        setShowAddModal(false);
        // Reset form
        setNewRuleCode('');
        setNewRuleName('');
        loadData();
      } else {
        setMessage({ type: 'error', text: p.error?.message || 'Creation failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error executing create action' });
    } finally {
      setActionLoading(false);
    }
  }

  const filteredRules = useMemo(() => {
    if (!search) return rules;
    const s = search.toLowerCase();
    return rules.filter(
      (r) =>
        r.code.toLowerCase().includes(s) ||
        r.name.toLowerCase().includes(s) ||
        r.categoryCode.toLowerCase().includes(s)
    );
  }, [rules, search]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <a href="/dashboard/compliance-calendar" className="hover:text-slate-700">
            Compliance Calendar
          </a>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-700">Recurrence Rules</span>
        </nav>

        {/* Enterprise Header */}
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                S01-S06, S09
              </span>
              <span className="text-xs text-slate-500">Recurrence Scheduling Engine</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Recurrence Rules
            </h1>
            <p className="text-sm text-slate-500">
              Configure automatic statutory check triggers, owner role hierarchies, and multi-tier
              alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow hover:bg-slate-800 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Define New Rule</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              className="rounded-md border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Action message */}
        {message.text && (
          <div
            className={`flex items-center justify-between rounded-lg border p-4 text-sm shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-500" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage({ type: '', text: '' })}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Info card */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-500 flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="leading-relaxed">
            <h4 className="font-semibold text-slate-800">
              Recurrence Scheduling Engine Business Logic
            </h4>
            <p className="mt-1">
              Statutory tasks are rolled forward automatically every month depending on cadences
              defined below. Due dates landing on a GCC weekend (Friday, Saturday, or Sunday
              depending on country regulations) or registered public holidays are shifted backward
              to the <strong>previous business day</strong> to ensure compliance filings occur on
              workdays.
            </p>
          </div>
        </section>

        {/* Search bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search rules by code or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-slate-900 transition bg-slate-50 focus:bg-white shadow-sm"
          />
        </div>

        {/* Recurrence Rules Table */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Rule Name</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Country</th>
                  <th className="px-4 py-3.5">Cadence</th>
                  <th className="px-4 py-3.5 text-center">Day Details</th>
                  <th className="px-4 py-3.5">Owner Role</th>
                  <th className="px-4 py-3.5">Lead/Alert Days</th>
                  <th className="px-4 py-3.5 text-center">Active Trigger</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && rules.length === 0
                  ? Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={`skel-${idx}`}>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-4 w-10 bg-slate-200 rounded mx-auto animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="h-6 w-10 bg-slate-200 rounded mx-auto animate-pulse" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="h-6 w-6 bg-slate-200 rounded ml-auto animate-pulse" />
                        </td>
                      </tr>
                    ))
                  : filteredRules.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">
                          {r.code}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-900">{r.name}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          {CATEGORY_MAP[r.categoryCode] || r.categoryCode}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-600">
                          {r.countryCode ? (
                            <span className="flex items-center gap-1">
                              <span>{r.countryCode}</span>
                              <span className="text-slate-400">
                                ({COUNTRY_MAP[r.countryCode] || r.countryCode})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold text-indigo-600 uppercase">
                          {r.cadence}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-center text-slate-600 font-mono">
                          {r.cadence === 'ANNUAL' ? (
                            <span>
                              DOM: {r.dayOfMonth ?? 1} / MOY: {r.monthOfYear ?? 1}
                            </span>
                          ) : (
                            <span>Day: {r.dayOfMonth ?? 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                          {ROLE_MAP[r.ownerRole] || r.ownerRole}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          <div>Lead: {r.leadDays} Days</div>
                          {r.tierAlerts.length > 0 && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Alerts: {r.tierAlerts.join(', ')} Days
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRule(r)}
                            className="inline-flex justify-center focus:outline-none transition"
                            title={r.isActive ? 'Disable Rule' : 'Enable Rule'}
                          >
                            {r.isActive ? (
                              <ToggleRight className="h-6 w-6 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-slate-300" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(r)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Recurrence Rule"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                {filteredRules.length === 0 && !loading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-16 text-center text-slate-400 text-sm">
                      <Info className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <span>
                        No recurrence rules defined. Generate rules or seed from dashboard.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ========================================================
          DEFINE NEW RECURRENCE RULE MODAL
      ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-slate-800 text-base">
                Define Compliance Recurrence Engine Rule
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Rule Code *</label>
                  <input
                    type="text"
                    required
                    value={newRuleCode}
                    onChange={(e) => setNewRuleCode(e.target.value)}
                    placeholder="WPS_SUBMIT_SA"
                    className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 uppercase"
                  />
                </div>
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Rule Name / Label *</label>
                  <input
                    type="text"
                    required
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="KSA Mudad WPS Submission"
                    className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Compliance Pillar *</label>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                  >
                    {Object.entries(CATEGORY_MAP).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    ))}
                  </select>
                </div>
                {/* Country */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Country Context *</label>
                  <select
                    value={newRuleCountry}
                    onChange={(e) => setNewRuleCountry(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                  >
                    <option value="">GCC-Wide / Global</option>
                    {Object.entries(COUNTRY_MAP).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Legal Entity */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Legal Entity Scoping</label>
                <select
                  value={newRuleLegalEntity}
                  onChange={(e) => setNewRuleLegalEntity(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                >
                  <option value="">All Scopes &amp; Legal Entities</option>
                  {Object.entries(companies).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Cadence */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Cadence *</label>
                  <select
                    value={newRuleCadence}
                    onChange={(e) => setNewRuleCadence(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
                {/* DOM */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Day of Month *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={newRuleDOM}
                    onChange={(e) => setNewRuleDOM(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                  />
                </div>
                {/* MOY */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Month of Year</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    disabled={newRuleCadence !== 'ANNUAL'}
                    value={newRuleMOY}
                    onChange={(e) => setNewRuleMOY(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Owner Role */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Owner Role *</label>
                  <select
                    value={newRuleOwnerRole}
                    onChange={(e) => setNewRuleOwnerRole(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                  >
                    {Object.entries(ROLE_MAP).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    ))}
                  </select>
                </div>
                {/* Escalation Role */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Escalation Role</label>
                  <select
                    value={newRuleEscRole}
                    onChange={(e) => setNewRuleEscRole(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-900"
                  >
                    <option value="">No Escalation</option>
                    {Object.entries(ROLE_MAP).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name} ({code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Lead Days */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Task Lead Days *</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={newRuleLeadDays}
                    onChange={(e) => setNewRuleLeadDays(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                  />
                  <p className="text-[10px] text-slate-400">
                    Generate tasks this many days before deadline.
                  </p>
                </div>
                {/* Alerts */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Warning Alert Days</label>
                  <input
                    type="text"
                    value={newRuleAlerts}
                    onChange={(e) => setNewRuleAlerts(e.target.value)}
                    placeholder="5, 2, 1"
                    className="w-full rounded-md border border-slate-300 p-2 text-xs outline-none focus:border-slate-900"
                  />
                  <p className="text-[10px] text-slate-400">
                    Comma-separated countdown warning alarms.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={actionLoading}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || loading}
                  className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {actionLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{actionLoading ? 'Processing...' : 'Create Engine Rule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL DIALOG
      ======================================================== */}
      {showDeleteConfirm && ruleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                Delete Recurrence Rule
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRuleToDelete(null);
                }}
                disabled={actionLoading}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 leading-normal">
                Are you sure you want to delete the compliance recurrence rule{' '}
                <strong className="text-slate-950 font-bold">"{ruleToDelete.name}"</strong>?
              </p>
              <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-[11px] text-rose-900 leading-normal flex items-start gap-2">
                <Info className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  This will remove the recurrence template for any future tasks. Active tasks
                  derived from this rule will remain but won't trigger further cascades.
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRuleToDelete(null);
                }}
                disabled={actionLoading}
                className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteRule}
                disabled={actionLoading}
                className="rounded-md bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                <span>{actionLoading ? 'Deleting...' : 'Delete Rule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
