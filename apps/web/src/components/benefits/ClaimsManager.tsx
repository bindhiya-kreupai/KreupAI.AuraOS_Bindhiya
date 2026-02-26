'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Upload,
  FileText,
  Activity,
  X,
} from 'lucide-react';
import type {
  InsuranceClaim,
  ClaimStatus,
  PlanType,
  ClaimType,
  SubmitClaimData,
} from '@/services/benefitsClaimsService';
import { BenefitsClaimsService } from '@/services/benefitsClaimsService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<ClaimStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  Submitted: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Clock size={12} /> },
  'Under Review': { bg: 'bg-sky-100', text: 'text-sky-700', icon: <Activity size={12} /> },
  'Additional Info Required': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: <AlertCircle size={12} />,
  },
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 size={12} /> },
  Denied: { bg: 'bg-rose-100', text: 'text-rose-700', icon: <XCircle size={12} /> },
  Paid: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 size={12} /> },
  Appealed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <AlertCircle size={12} /> },
};

function fmtCurrency(v: number) {
  return `$${v.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Claim Detail Modal
// ---------------------------------------------------------------------------

function ClaimDetailModal({
  claim,
  onClose,
  onApprove,
  onReject,
  isAdmin,
}: {
  claim: InsuranceClaim;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  isAdmin?: boolean;
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const statusConfig = STATUS_CONFIG[claim.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{claim.claimNumber}</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
              >
                {statusConfig.icon}
                {claim.status}
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-800 mt-0.5">{claim.claimType} Claim</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Plan', value: claim.planName },
              { label: 'Service Date', value: claim.serviceDate },
              { label: 'Provider', value: claim.providerName },
              { label: 'Diagnosis', value: claim.diagnosis },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-sm font-medium text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Financial */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Explanation of Benefits (EOB)
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Billed Amount', value: claim.billedAmount, color: 'text-slate-700' },
                { label: 'Allowed Amount', value: claim.allowedAmount, color: 'text-slate-700' },
                {
                  label: 'Deductible Applied',
                  value: claim.deductibleApplied,
                  color: 'text-amber-600',
                },
                { label: 'Copay', value: claim.copayAmount, color: 'text-amber-600' },
                { label: 'Coinsurance', value: claim.coinsuranceAmount, color: 'text-amber-600' },
                { label: 'Plan Paid', value: claim.planPaid, color: 'text-emerald-600' },
                { label: 'You Owe', value: claim.employeeOwes, color: 'text-rose-600' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{fmtCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Denial reason */}
          {claim.denialReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-xs font-semibold text-rose-700 mb-1">Denial Reason</p>
              <p className="text-xs text-rose-600">{claim.denialReason}</p>
            </div>
          )}

          {/* Timeline */}
          {claim.timeline.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Timeline
              </h4>
              <div className="space-y-2">
                {claim.timeline.map((event, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-700">{event.event}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(event.timestamp).toLocaleDateString('en-GB')} by{' '}
                        {event.performedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipts */}
          {claim.receipts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Receipts
              </h4>
              {claim.receipts.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <FileText size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-700 truncate">{r.fileName}</span>
                  <span className="text-xs text-slate-400 ml-auto">{r.sizeKb}KB</span>
                </div>
              ))}
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin &&
            ['Submitted', 'Under Review', 'Additional Info Required'].includes(claim.status) && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Admin Actions
                </p>
                {!showRejectForm ? (
                  <div className="flex gap-2">
                    <button
                      onClick={onApprove}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Approve Claim
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors"
                    >
                      Deny Claim
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm resize-none h-20 focus:outline-none"
                      placeholder="Denial reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRejectForm(false)}
                        className="flex-1 py-2 border border-slate-300 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onReject?.(rejectionReason);
                          setShowRejectForm(false);
                        }}
                        disabled={!rejectionReason.trim()}
                        className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
                      >
                        Confirm Denial
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Submit Claim Form
// ---------------------------------------------------------------------------

function SubmitClaimForm({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [form, setForm] = useState({
    planId: 'h-gold',
    claimType: 'Medical' as ClaimType,
    serviceDate: '',
    providerName: '',
    diagnosis: '',
    billedAmount: 0,
    isDependent: false,
    dependentName: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data: SubmitClaimData = {
      employeeId: 'emp-self',
      planId: form.planId,
      claimType: form.claimType,
      serviceDate: form.serviceDate,
      providerName: form.providerName,
      diagnosis: form.diagnosis,
      billedAmount: form.billedAmount,
      receipts: [],
      isDependent: form.isDependent,
      dependentName: form.isDependent ? form.dependentName : null,
    };
    await BenefitsClaimsService.submitClaim(data);
    setSaving(false);
    onSubmitted();
    onClose();
  }

  const inputClass =
    'w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">Submit Insurance Claim</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
              <select
                className={inputClass}
                value={form.planId}
                onChange={(e) => setForm({ ...form, planId: e.target.value })}
              >
                {[
                  ['h-gold', 'Medical — Gold'],
                  ['d-gold', 'Dental — Gold'],
                  ['v-basic', 'Vision — Basic'],
                ].map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Claim Type</label>
              <select
                className={inputClass}
                value={form.claimType}
                onChange={(e) => setForm({ ...form, claimType: e.target.value as ClaimType })}
              >
                {(
                  [
                    'Medical',
                    'Dental',
                    'Vision',
                    'Prescription',
                    'Mental Health',
                    'Physical Therapy',
                    'Emergency',
                    'Preventive',
                  ] as ClaimType[]
                ).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Date *</label>
            <input
              required
              type="date"
              className={inputClass}
              value={form.serviceDate}
              onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Provider Name *</label>
            <input
              required
              className={inputClass}
              placeholder="Hospital, clinic, or provider name"
              value={form.providerName}
              onChange={(e) => setForm({ ...form, providerName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Diagnosis / Service Description *
            </label>
            <input
              required
              className={inputClass}
              placeholder="e.g. Annual wellness exam, Flu treatment"
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Billed Amount (USD) *
            </label>
            <input
              required
              type="number"
              className={inputClass}
              placeholder="0.00"
              value={form.billedAmount || ''}
              onChange={(e) => setForm({ ...form, billedAmount: Number(e.target.value) })}
            />
          </div>

          {/* Upload placeholder */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-slate-500 transition-colors">
            <Upload size={20} className="text-slate-400 mx-auto mb-1" />
            <p className="text-sm text-slate-500">Attach receipts (PDF, JPG)</p>
            <p className="text-xs text-slate-400">Drag & drop or click to upload</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-slate-800"
              checked={form.isDependent}
              onChange={(e) => setForm({ ...form, isDependent: e.target.checked })}
            />
            <span className="text-sm text-slate-700">This claim is for a dependent</span>
          </label>
          {form.isDependent && (
            <input
              className={inputClass}
              placeholder="Dependent name"
              value={form.dependentName}
              onChange={(e) => setForm({ ...form, dependentName: e.target.value })}
            />
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Claim Row (list)
// ---------------------------------------------------------------------------

function ClaimListRow({ claim, onSelect }: { claim: InsuranceClaim; onSelect: () => void }) {
  const config = STATUS_CONFIG[claim.status] ?? STATUS_CONFIG.Submitted;
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm transition-all text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">{claim.claimNumber}</span>
          <span className="text-xs text-slate-500">&bull;</span>
          <span className="text-xs text-slate-500">{claim.claimType}</span>
        </div>
        <p className="text-sm font-semibold text-slate-800 truncate">{claim.providerName}</p>
        <p className="text-xs text-slate-400">
          {claim.serviceDate} &bull; {claim.planName}
        </p>
        {claim.denialReason && (
          <p className="text-xs text-rose-500 mt-0.5 truncate">{claim.denialReason}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-slate-700">{fmtCurrency(claim.billedAmount)}</p>
        {claim.planPaid > 0 && (
          <p className="text-xs text-emerald-600">Paid: {fmtCurrency(claim.planPaid)}</p>
        )}
        {claim.employeeOwes > 0 && (
          <p className="text-xs text-amber-600">Owe: {fmtCurrency(claim.employeeOwes)}</p>
        )}
      </div>
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${config.bg} ${config.text}`}
      >
        {config.icon}
        {claim.status}
      </span>
      <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ClaimsManager({ isAdmin = false }: { isAdmin?: boolean }) {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<PlanType | 'All'>('All');
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);
    const c = isAdmin
      ? await BenefitsClaimsService.getPendingClaimsForAdmin()
      : await BenefitsClaimsService.getClaims('emp-self');
    setClaims(c);
    setLoading(false);
  }

  async function handleApprove(claimId: string) {
    await BenefitsClaimsService.approveClaim(claimId);
    setSelectedClaim(null);
    await loadData();
  }

  async function handleReject(claimId: string, reason: string) {
    await BenefitsClaimsService.rejectClaim(claimId, reason);
    setSelectedClaim(null);
    await loadData();
  }

  const filtered = claims.filter((c) => {
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchType = typeFilter === 'All' || c.planType === typeFilter;
    const matchSearch =
      !search ||
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.providerName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const totalBilled = filtered.reduce((s, c) => s + c.billedAmount, 0);
  const totalPaid = filtered.reduce((s, c) => s + c.planPaid, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw size={24} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          {isAdmin ? 'Claims Queue — Admin' : 'My Claims'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
          {!isAdmin && (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <Plus size={15} />
              Submit Claim
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-slate-800">{filtered.length}</p>
          <p className="text-xs text-slate-500">Total Claims</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-slate-800">{fmtCurrency(totalBilled)}</p>
          <p className="text-xs text-slate-500">Billed</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{fmtCurrency(totalPaid)}</p>
          <p className="text-xs text-slate-500">Plan Paid</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            placeholder="Search claims..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
        >
          <option value="All">All Status</option>
          {(
            [
              'Submitted',
              'Under Review',
              'Additional Info Required',
              'Approved',
              'Denied',
              'Paid',
              'Appealed',
            ] as ClaimStatus[]
          ).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
        >
          <option value="All">All Plans</option>
          {(['Medical', 'Dental', 'Vision', 'Life', 'Disability'] as PlanType[]).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Claims List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
            No claims match your filters.
          </div>
        ) : (
          filtered.map((c) => (
            <ClaimListRow key={c.id} claim={c} onSelect={() => setSelectedClaim(c)} />
          ))
        )}
      </div>

      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          isAdmin={isAdmin}
          onApprove={isAdmin ? () => handleApprove(selectedClaim.id) : undefined}
          onReject={isAdmin ? (reason) => handleReject(selectedClaim.id, reason) : undefined}
        />
      )}

      {showSubmitForm && (
        <SubmitClaimForm onClose={() => setShowSubmitForm(false)} onSubmitted={loadData} />
      )}
    </div>
  );
}
