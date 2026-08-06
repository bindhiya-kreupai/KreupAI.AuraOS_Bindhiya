'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
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
  Upload,
  ShieldCheck,
  Building,
} from 'lucide-react';
import Link from 'next/link';

interface TaxDeclaration {
  id: string;
  tenantId: string;
  employeeId: string;
  financialYear: string;
  taxRegime: 'OLD' | 'NEW';
  ppf?: number;
  elss?: number;
  lifeInsurance?: number;
  homeLoanPrincipal?: number;
  section80C?: number;
  medicalSelf?: number;
  medicalParents?: number;
  section80D?: number;
  rentPaid?: number;
  landlordPAN?: string;
  totalDeductions?: number;
  proofsUploaded?: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  submittedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export default function TaxDeclarationsPage() {
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [financialYearFilter, setFinancialYearFilter] = useState('2026-2027');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: 'EMP001',
    financialYear: '2026-2027',
    taxRegime: 'OLD' as 'OLD' | 'NEW',
    ppf: '150000',
    elss: '0',
    lifeInsurance: '25000',
    homeLoanPrincipal: '0',
    medicalSelf: '25000',
    medicalParents: '50000',
    rentPaid: '180000',
    landlordPAN: 'ABCDE1234F',
  });

  useEffect(() => {
    fetchDeclarations();
  }, [financialYearFilter, activeTab]);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/v1/tax-declarations?financialYear=${financialYearFilter}`;
      if (activeTab !== 'ALL') {
        url += `&status=${activeTab}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDeclarations(json.data);
      } else {
        setError(json.error || 'Failed to load tax declarations');
      }
    } catch (_err) {
      setError('Failed to connect to tax declaration service');
    } finally {
      setLoading(false);
    }
  };

  const calcSection80C = () =>
    (parseFloat(formData.ppf) || 0) +
    (parseFloat(formData.elss) || 0) +
    (parseFloat(formData.lifeInsurance) || 0) +
    (parseFloat(formData.homeLoanPrincipal) || 0);

  const calcSection80D = () =>
    (parseFloat(formData.medicalSelf) || 0) + (parseFloat(formData.medicalParents) || 0);

  const calcTotalDeductions = () => calcSection80C() + calcSection80D();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/tax-declarations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ppf: parseFloat(formData.ppf) || 0,
          elss: parseFloat(formData.elss) || 0,
          lifeInsurance: parseFloat(formData.lifeInsurance) || 0,
          homeLoanPrincipal: parseFloat(formData.homeLoanPrincipal) || 0,
          medicalSelf: parseFloat(formData.medicalSelf) || 0,
          medicalParents: parseFloat(formData.medicalParents) || 0,
          rentPaid: parseFloat(formData.rentPaid) || 0,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Tax declaration created successfully!');
        setShowCreateModal(false);
        fetchDeclarations();
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setError(json.error || 'Failed to create tax declaration');
      }
    } catch (_err) {
      setError('Error creating tax declaration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDeclaration = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/tax-declarations/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Tax declaration submitted for verification!');
        fetchDeclarations();
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setError(json.error || 'Failed to submit declaration');
      }
    } catch (_err) {
      setError('Error submitting declaration');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/tax-declarations/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Tax declaration verified successfully!');
        fetchDeclarations();
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setError(json.error || 'Failed to verify declaration');
      }
    } catch (_err) {
      setError('Error verifying declaration');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectId) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/tax-declarations/${rejectId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Tax declaration rejected');
        setShowRejectModal(false);
        setRejectId(null);
        setRejectionReason('');
        fetchDeclarations();
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        setError(json.error || 'Failed to reject declaration');
      }
    } catch (_err) {
      setError('Failed to reject declaration');
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'ID',
      'Employee ID',
      'Financial Year',
      'Regime',
      '80C Sum',
      '80D Sum',
      'Rent Paid',
      'Total Deductions',
      'Proofs Uploaded',
      'Status',
    ];
    const rows = declarations.map((d) => [
      d.id,
      d.employeeId,
      d.financialYear,
      d.taxRegime,
      d.section80C || 0,
      d.section80D || 0,
      d.rentPaid || 0,
      d.totalDeductions || 0,
      d.proofsUploaded ? 'Yes' : 'No',
      d.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-declarations-${financialYearFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = declarations.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return d.employeeId.toLowerCase().includes(q) || d.taxRegime.toLowerCase().includes(q);
  });

  const oldRegimeCount = declarations.filter((d) => d.taxRegime === 'OLD').length;
  const newRegimeCount = declarations.filter((d) => d.taxRegime === 'NEW').length;
  const totalSec80C = declarations.reduce((sum, d) => sum + Number(d.section80C || 0), 0);
  const totalSec80D = declarations.reduce((sum, d) => sum + Number(d.section80D || 0), 0);
  const pendingVerifyCount = declarations.filter((d) => d.status === 'SUBMITTED').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <Link
            href="/dashboard/payroll-compliance"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Payroll Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-indigo-500" />
            Tax Declarations Governance
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Annual Income Tax Regime Election & Section 80C/80D Investment Deductions · Workflow 14
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={financialYearFilter}
            onChange={(e) => setFinancialYearFilter(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="2026-2027">FY 2026-2027</option>
            <option value="2025-2026">FY 2025-2026</option>
          </select>
          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Declaration
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
            <span>Regime Split</span>
            <Building className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">
            {oldRegimeCount} Old / {newRegimeCount} New
          </div>
          <div className="text-xs text-slate-400 mt-1">Tax Regime Elections</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Sec 80C Claimed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            ${totalSec80C.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">PPF, ELSS, Insurance</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Sec 80D Claimed</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">
            ${totalSec80D.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Medical Self & Parents</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{pendingVerifyCount}</div>
          <div className="text-xs text-slate-400 mt-1">Proof document verification</div>
        </div>
      </div>

      {/* Workspace Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as const).map((tab) => (
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
              placeholder="Search by Employee ID..."
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
            <span>Loading tax declarations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-sm">No tax declarations found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting filters or create a new declaration.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Regime</th>
                  <th className="py-3 px-4">Sec 80C</th>
                  <th className="py-3 px-4">Sec 80D</th>
                  <th className="py-3 px-4">Total Deductions</th>
                  <th className="py-3 px-4">Proofs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filtered.map((decl) => (
                  <tr
                    key={decl.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {decl.employeeId}
                      </div>
                      <div className="text-[10px] text-slate-400">{decl.financialYear}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          decl.taxRegime === 'OLD'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400'
                        }`}
                      >
                        {decl.taxRegime} REGIME
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                      ${Number(decl.section80C || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                      ${Number(decl.section80D || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      ${Number(decl.totalDeductions || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {decl.proofsUploaded ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                          <Upload className="w-3 h-3" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          decl.status === 'VERIFIED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : decl.status === 'SUBMITTED'
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : decl.status === 'REJECTED'
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {decl.status === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
                        {decl.status === 'SUBMITTED' && <Clock className="w-3 h-3" />}
                        {decl.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {decl.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {decl.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => handleSubmitDeclaration(decl.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all"
                          >
                            Submit
                          </button>
                        )}
                        {decl.status === 'SUBMITTED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerify(decl.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectId(decl.id);
                                setShowRejectModal(true);
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {decl.status === 'VERIFIED' && (
                          <span className="text-[11px] text-emerald-600 font-bold">
                            Form 16 Ready
                          </span>
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" /> New Tax Declaration & Investment
                Election
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Financial Year *
                  </label>
                  <select
                    value={formData.financialYear}
                    onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="2026-2027">2026-2027</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tax Regime Election *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, taxRegime: 'OLD' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formData.taxRegime === 'OLD'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold">OLD REGIME</div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      Claim Section 80C, 80D, HRA deductions
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, taxRegime: 'NEW' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formData.taxRegime === 'NEW'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold">NEW REGIME</div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      Lower tax rates, zero deductions
                    </div>
                  </button>
                </div>
              </div>

              {formData.taxRegime === 'OLD' && (
                <>
                  {/* Section 80C */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center justify-between">
                      <span>Section 80C Investments (Max $150,000 / ₹1.5L)</span>
                      <span className="text-xs text-emerald-600 font-extrabold">
                        ${calcSection80C().toLocaleString()}
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 mb-0.5">
                          PPF Contribution
                        </label>
                        <input
                          type="number"
                          value={formData.ppf}
                          onChange={(e) => setFormData({ ...formData, ppf: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 mb-0.5">
                          ELSS Mutual Funds
                        </label>
                        <input
                          type="number"
                          value={formData.elss}
                          onChange={(e) => setFormData({ ...formData, elss: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 mb-0.5">
                          Life Insurance Premium
                        </label>
                        <input
                          type="number"
                          value={formData.lifeInsurance}
                          onChange={(e) =>
                            setFormData({ ...formData, lifeInsurance: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 mb-0.5">
                          Home Loan Principal
                        </label>
                        <input
                          type="number"
                          value={formData.homeLoanPrincipal}
                          onChange={(e) =>
                            setFormData({ ...formData, homeLoanPrincipal: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 80D */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center justify-between">
                      <span>Section 80D Medical Health Insurance</span>
                      <span className="text-xs text-emerald-600 font-extrabold">
                        ${calcSection80D().toLocaleString()}
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 mb-0.5">
                          Medical (Self & Family)
                        </label>
                        <input
                          type="number"
                          value={formData.medicalSelf}
                          onChange={(e) =>
                            setFormData({ ...formData, medicalSelf: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 mb-0.5">
                          Medical (Parents)
                        </label>
                        <input
                          type="number"
                          value={formData.medicalParents}
                          onChange={(e) =>
                            setFormData({ ...formData, medicalParents: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* House Rent Allowance */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">
                      House Rent Allowance (HRA)
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 mb-0.5">
                          Annual Rent Paid ($)
                        </label>
                        <input
                          type="number"
                          value={formData.rentPaid}
                          onChange={(e) => setFormData({ ...formData, rentPaid: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 mb-0.5">
                          Landlord PAN
                        </label>
                        <input
                          type="text"
                          value={formData.landlordPAN}
                          onChange={(e) =>
                            setFormData({ ...formData, landlordPAN: e.target.value })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Total Calculation Banner */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-center justify-between">
                <span className="font-extrabold text-indigo-900 dark:text-indigo-200">
                  Total Deductions Claimed:
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${calcTotalDeductions().toLocaleString()}
                </span>
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
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Tax Declaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-rose-600 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Reject Tax Declaration
              </h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                placeholder="Specify why the proof documents or declaration were rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Reject Declaration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
