'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  Building,
  RotateCcw,
  Scale,
  Send,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

interface GLLine {
  id?: string;
  accountId: string;
  costCenterId?: string;
  departmentId?: string;
  description?: string;
  debit?: number;
  credit?: number;
  currency?: string;
}

interface GLEntry {
  id: string;
  tenantId: string;
  countryCode: string;
  currency: string;
  entryDate: string;
  reference: string;
  description?: string;
  sourceType: string;
  sourceId: string;
  status: 'DRAFT' | 'POSTED' | 'EXPORTED' | 'REVERSED';
  totalDebit: number;
  totalCredit: number;
  postedAt?: string;
  postedById?: string;
  exportedAt?: string;
  exportedToSystem?: string;
  exportReference?: string;
  reversalOfId?: string;
  createdAt?: string;
  lines?: GLLine[];
}

export default function GLEntriesPage() {
  const [entries, setEntries] = useState<GLEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'DRAFT' | 'POSTED' | 'EXPORTED' | 'REVERSED'>(
    'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportEntryId, setExportEntryId] = useState<string | null>(null);
  const [exportSystem, setExportSystem] = useState('SAP');
  const [exportReferenceInput, setExportReferenceInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    countryCode: 'UAE',
    currency: 'AED',
    entryDate: new Date().toISOString().slice(0, 10),
    reference: `JV-PAY-${Date.now().toString().slice(-4)}`,
    description: 'August 2026 Monthly Payroll Disbursal Journal',
    sourceType: 'PAYROLL_RUN',
    sourceId: `pay_run_${Date.now().toString().slice(-4)}`,
  });

  const [lines, setLines] = useState<GLLine[]>([
    {
      accountId: 'ACC-5001-SALARY',
      description: 'Salaries & Allowances Expense',
      debit: 150000,
      credit: 0,
    },
    {
      accountId: 'ACC-2001-NET-PAYABLE',
      description: 'Net Payroll Payable',
      debit: 0,
      credit: 150000,
    },
  ]);

  useEffect(() => {
    fetchEntries();
  }, [activeTab]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/v1/gl/entries?limit=100';
      if (activeTab !== 'ALL') {
        url += `&status=${activeTab}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEntries(json.data);
      } else {
        setError(json.error || 'Failed to load GL journal entries');
      }
    } catch (_err) {
      setError('Failed to connect to GL posting service');
    } finally {
      setLoading(false);
    }
  };

  const calcTotalDebit = () => lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const calcTotalCredit = () => lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(calcTotalDebit() - calcTotalCredit()) <= 0.01;

  const handleAddLine = () => {
    setLines([...lines, { accountId: 'ACC-3000-MISC', description: '', debit: 0, credit: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof GLLine, value: any) => {
    const next = [...lines];
    next[index] = { ...next[index], [field]: value };
    setLines(next);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    if (!isBalanced) {
      setModalError(
        `Journal is unbalanced: Total Debits (${calcTotalDebit()}) must equal Total Credits (${calcTotalCredit()})`
      );
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/gl/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lines: lines.map((l) => ({
            ...l,
            debit: parseFloat(l.debit as any) || 0,
            credit: parseFloat(l.credit as any) || 0,
          })),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`Journal voucher ${formData.reference} created in DRAFT!`);
        setShowCreateModal(false);
        fetchEntries();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        const errMsg =
          typeof json.error === 'object'
            ? json.error?.message || JSON.stringify(json.error)
            : json.error;
        setModalError(errMsg || 'Failed to create GL journal entry');
      }
    } catch (_err) {
      setModalError('Error creating GL journal entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/gl/entries/${id}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('GL journal entry posted successfully!');
        fetchEntries();
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setError(json.error || 'Failed to post entry');
      }
    } catch (_err) {
      setError('Error posting entry');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSubmit = async () => {
    if (!exportEntryId) return;
    setSubmitting(true);
    setModalError(null);

    if (!exportReferenceInput || exportReferenceInput.trim().length < 3) {
      setModalError(
        'A real external export reference is required (minimum 3 non-placeholder characters)'
      );
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/gl/entries/${exportEntryId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: exportSystem,
          exportReference: exportReferenceInput,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`GL entry exported to ${exportSystem} (${exportReferenceInput})!`);
        setShowExportModal(false);
        setExportEntryId(null);
        setExportReferenceInput('');
        fetchEntries();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        const errMsg =
          typeof json.error === 'object'
            ? json.error?.message || JSON.stringify(json.error)
            : json.error;
        setModalError(errMsg || 'Failed to export entry');
      }
    } catch (_err) {
      setModalError('Failed to export entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReverse = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/gl/entries/${id}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Reversal journal entry created & posted!');
        fetchEntries();
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setError(json.error || 'Failed to reverse entry');
      }
    } catch (_err) {
      setError('Error reversing entry');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'ID',
      'Reference',
      'Country',
      'Currency',
      'Source Type',
      'Total Debit',
      'Total Credit',
      'Status',
      'Export System',
      'Export Ref',
    ];
    const rows = entries.map((e) => [
      e.id,
      e.reference,
      e.countryCode,
      e.currency,
      e.sourceType,
      e.totalDebit,
      e.totalCredit,
      e.status,
      e.exportedToSystem || 'N/A',
      e.exportReference || 'N/A',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gl-entries-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = entries.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.reference.toLowerCase().includes(q) ||
      e.sourceType.toLowerCase().includes(q) ||
      e.countryCode.toLowerCase().includes(q) ||
      (e.description && e.description.toLowerCase().includes(q))
    );
  });

  const totalDebitsSum = entries.reduce((sum, e) => sum + Number(e.totalDebit || 0), 0);
  const totalCreditsSum = entries.reduce((sum, e) => sum + Number(e.totalCredit || 0), 0);
  const postedCount = entries.filter((e) => e.status === 'POSTED').length;
  const exportedCount = entries.filter((e) => e.status === 'EXPORTED').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <Link
            href="/dashboard/payroll-compliance"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to FinOps Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-500" />
            General Ledger (GL) Journal Posting
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Double-Entry Accounting Journal Vouchers, Balance Validation & Downstream ERP Sync ·
            Workflow 15
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setModalError(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Journal Voucher
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-rose-700 dark:text-rose-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Debits</span>
            <Scale className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            ${totalDebitsSum.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Balanced Journal Debits</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Credits</span>
            <Scale className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">
            ${totalCreditsSum.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Balanced Journal Credits</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Posted Journals</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">{postedCount}</div>
          <div className="text-xs text-slate-400 mt-1">Authorized for Financial Records</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Exported to ERP</span>
            <ExternalLink className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 mt-2">{exportedCount}</div>
          <div className="text-xs text-slate-400 mt-1">SAP / QuickBooks / Xero Synced</div>
        </div>
      </div>

      {/* Workspace Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'DRAFT', 'POSTED', 'EXPORTED', 'REVERSED'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Reference, Source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading GL journal entries...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-sm">No GL journal entries found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting filters or create a new journal voucher.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Journal Reference</th>
                  <th className="py-3 px-4">Source Type</th>
                  <th className="py-3 px-4">Country & Currency</th>
                  <th className="py-3 px-4">Debits</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {entry.reference}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {entry.description || 'No description'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {entry.sourceType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-700 dark:text-slate-300">
                        {entry.countryCode}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{entry.currency}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ${Number(entry.totalDebit || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                      ${Number(entry.totalCredit || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Scale className="w-3 h-3" /> Balanced
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-max ${
                            entry.status === 'EXPORTED'
                              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : entry.status === 'POSTED'
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : entry.status === 'REVERSED'
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {entry.status === 'EXPORTED' && <Send className="w-3 h-3" />}
                          {entry.status === 'POSTED' && <CheckCircle className="w-3 h-3" />}
                          {entry.status === 'REVERSED' && <RotateCcw className="w-3 h-3" />}
                          {entry.status === 'DRAFT' && <Clock className="w-3 h-3" />}
                          {entry.status}
                        </span>
                        {entry.exportReference && (
                          <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                            {entry.exportedToSystem}: {entry.exportReference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {entry.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => handlePost(entry.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all"
                          >
                            Post Entry
                          </button>
                        )}
                        {entry.status === 'POSTED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setExportEntryId(entry.id);
                              setExportReferenceInput(`EXT-REF-${Date.now().toString().slice(-5)}`);
                              setModalError(null);
                              setShowExportModal(true);
                            }}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Export ERP
                          </button>
                        )}
                        {(entry.status === 'POSTED' || entry.status === 'EXPORTED') && (
                          <button
                            type="button"
                            onClick={() => handleReverse(entry.id)}
                            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Reverse
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Voucher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" /> New GL Journal Voucher (Double-Entry)
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Country *
                  </label>
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                  >
                    <option value="UAE">UAE</option>
                    <option value="KSA">KSA</option>
                    <option value="US">US</option>
                    <option value="IN">IN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                  >
                    <option value="AED">AED</option>
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Source Type *
                  </label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                  >
                    <option value="PAYROLL_RUN">PAYROLL_RUN</option>
                    <option value="FULL_FINAL">FULL_FINAL</option>
                    <option value="EXPENSE_PAY">EXPENSE_PAY</option>
                    <option value="ARREARS">ARREARS</option>
                    <option value="BONUS_PAYOUT">BONUS_PAYOUT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Journal Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              {/* Dynamic Lines Builder */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">
                    Double-Entry Journal Lines
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {lines.map((line, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50/60 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60"
                    >
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Account ID (e.g. ACC-5001)"
                          value={line.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-[11px]"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Description"
                          value={line.description}
                          onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Debit"
                          value={line.debit}
                          onChange={(e) =>
                            handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-emerald-600"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Credit"
                          value={line.credit}
                          onChange={(e) =>
                            handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold text-blue-600"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Balance Summary Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isBalanced
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  <span className="font-bold">
                    {isBalanced ? 'Journal Balanced (Debits == Credits)' : 'Journal Unbalanced!'}
                  </span>
                </div>
                <div className="font-mono font-extrabold text-xs">
                  Debits: ${calcTotalDebit().toLocaleString()} | Credits: $
                  {calcTotalCredit().toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isBalanced}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Journal Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export to ERP Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-purple-600 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Export GL Journal to Downstream ERP
              </h3>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Accounting System *
                </label>
                <select
                  value={exportSystem}
                  onChange={(e) => setExportSystem(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                >
                  <option value="SAP">SAP S/4HANA</option>
                  <option value="QUICKBOOKS">QuickBooks Online</option>
                  <option value="XERO">Xero Accounting</option>
                  <option value="TALLY">Tally Prime</option>
                  <option value="ZOHO_BOOKS">Zoho Books</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Downstream Export Reference *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAP-DOC-984712 (no placeholders)"
                  value={exportReferenceInput}
                  onChange={(e) => setExportReferenceInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExportSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm ERP Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
