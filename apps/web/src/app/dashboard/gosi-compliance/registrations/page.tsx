'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';
import { EmployeeSearchableSelect } from '@/components/shared/EmployeeSearchableSelect';
import {
  Search,
  SlidersHorizontal,
  Eye,
  Plus,
  UserPlus,
  Check,
  X,
  ShieldAlert,
  Loader2,
  Trash2,
  Lock,
} from 'lucide-react';

interface Reg {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  establishmentId: string;
  establishmentName?: string;
  nationalityClass: string;
  status: string;
  registrationDate: string;
  deregistrationReason: string | null;
}

export default function RegistrationsPage() {
  const { isDark } = useTheme();
  const [regs, setRegs] = useState<Reg[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    employeeId: '',
    establishmentId: '',
    nationalityClass: 'SAUDI',
  });

  async function load() {
    setIsLoading(true);
    try {
      const r = await fetch('/api/v1/gosi-compliance/registrations');
      const p = await r.json();
      if (p.success) {
        setRegs(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function loadEmployees() {
    try {
      const r = await fetch('/api/v1/employees?limit=200');
      const p = await r.json();
      if (p.success) {
        setEmployees(p.data?.items ?? p.data ?? []);
      }
    } catch {
      // Silently catch
    }
  }

  useEffect(() => {
    load();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (!form.employeeId) {
      setPreview(null);
      return;
    }
    const fetchPreview = async () => {
      setPreviewLoading(true);
      try {
        const r = await fetch(
          `/api/v1/gosi-compliance/registrations?action=preview-employee&employeeId=${form.employeeId}`
        );
        const p = await r.json();
        if (p.success) {
          setPreview(p.data);
          setForm((f) => ({
            ...f,
            establishmentId: p.data.legalEntityId || '',
            nationalityClass: p.data.nationalityClass || 'SAUDI',
          }));
        } else {
          setPreview(null);
          setMessage(p.error?.message ?? 'Failed to load employee preview');
        }
      } catch (err: any) {
        setPreview(null);
        setMessage(err?.message ?? 'Failed to load employee preview');
      } finally {
        setPreviewLoading(false);
      }
    };
    fetchPreview();
  }, [form.employeeId]);

  async function register() {
    setIsRegistering(true);
    setMessage('');
    try {
      const r = await fetch('/api/v1/gosi-compliance/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...form }),
      });
      const p = await r.json();
      if (p.success) {
        setMessage('Successfully registered employee in GOSI');
        setForm({ employeeId: '', establishmentId: '', nationalityClass: 'SAUDI' });
        setPreview(null);
        setShowForm(false);
      } else {
        setMessage(p.error?.details?.error ?? p.error?.message ?? 'Registration failed');
      }
    } finally {
      setIsRegistering(false);
      load();
    }
  }

  async function deregister(employeeId: string) {
    const reason = window.prompt(
      'Enter GOSI deregistration reason (e.g. Resignation, Contract End):'
    );
    if (!reason) return;
    setActionLoadingId(employeeId);
    setMessage('');
    try {
      const r = await fetch('/api/v1/gosi-compliance/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deregister', employeeId, reason }),
      });
      const p = await r.json();
      setMessage(
        p.success
          ? 'Deregistered successfully'
          : (p.error?.details?.error ?? p.error?.message ?? 'failed')
      );
    } finally {
      setActionLoadingId(null);
      load();
    }
  }

  // Filter local results based on search input
  const filteredRegs = regs.filter((r) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      r.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.establishmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nationalityClass?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = showDeleted ? true : r.status === 'ACTIVE';
    return matchesSearch && matchesStatus;
  });

  return (
    <main
      className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-8 text-slate-900 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header Block */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-550">
              EPIC-13 · GOSI COMPLIANCE
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              GOSI Employee Registrations
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? 'Cancel Registration' : 'Register Employee'}
            </button>
          </div>
        </header>

        {/* Collapsible Register Form */}
        {showForm && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Register Employee in GOSI
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
                Employee Name
                <EmployeeSearchableSelect
                  value={form.employeeId}
                  onChange={(val) => setForm((f) => ({ ...f, employeeId: val }))}
                  placeholder="Search employee..."
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
                Company (Auto-fetched)
                <input
                  value={preview?.companyName ?? '—'}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-100/50 dark:bg-slate-800/40 px-3.5 py-2.5 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
                Saudi Legal Entity (Auto-fetched)
                <input
                  value={preview?.legalEntityName ?? '—'}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-100/50 dark:bg-slate-800/40 px-3.5 py-2.5 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
                GOSI Establishment Number (Auto-fetched)
                <input
                  value={preview?.establishmentNumber ?? '—'}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-100/50 dark:bg-slate-800/40 px-3.5 py-2.5 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
                Nationality Class (Auto-verified)
                <input
                  value={preview ? `${preview.nationalityClass} (${preview.nationality})` : '—'}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-100/50 dark:bg-slate-800/40 px-3.5 py-2.5 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={register}
                  disabled={
                    !form.employeeId ||
                    previewLoading ||
                    isRegistering ||
                    !preview?.isGosiConfigured
                  }
                  className="w-full rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 dark:disabled:text-slate-600 px-4 py-3 text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(previewLoading || isRegistering) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {previewLoading
                    ? 'Loading Preview...'
                    : isRegistering
                      ? 'Registering...'
                      : 'Register in GOSI'}
                </button>
              </div>
            </div>
          </section>
        )}

        {message ? (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/50 text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
            <ShieldAlert className="h-4 w-4 text-indigo-600" />
            {message}
          </div>
        ) : null}

        {/* Search and Filters Row */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee Code, Name or Establishment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`border px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                showDeleted
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350'
              }`}
            >
              <Eye className="h-4 w-4" />
              Show Archived
            </button>
          </div>
        </section>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mt-3 mb-1">
          <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Results ({filteredRegs.length} items)
          </h2>
          <button className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-855 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition-all shadow-sm">
            Columns
          </button>
        </div>

        {/* Table Panel */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Employee Name</th>
                <th className="px-4 py-3.5">Establishment</th>
                <th className="px-4 py-3.5">Nationality</th>
                <th className="px-4 py-3.5">Registered At</th>
                <th className="px-4 py-3.5">State</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : filteredRegs.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {r.employeeCode ?? '—'}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">
                        {r.employeeName ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-slate-550 dark:text-slate-400">
                        {r.establishmentName ?? r.establishmentId}
                      </td>
                      <td className="px-4 py-4 text-slate-550 dark:text-slate-400">
                        {r.nationalityClass}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {r.registrationDate?.slice(0, 10)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                            r.status === 'ACTIVE'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/20'
                          }`}
                        >
                          {r.status === 'ACTIVE' ? 'Active ✓' : 'Deregistered'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {r.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => deregister(r.employeeId)}
                            disabled={actionLoadingId === r.employeeId}
                            className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {actionLoadingId === r.employeeId && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            {actionLoadingId === r.employeeId ? 'Deregistering...' : 'Deregister'}
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-550 text-xs italic">
                            {r.deregistrationReason ?? 'Deregistered'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              {!isLoading && filteredRegs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium"
                  >
                    No registrations found matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
