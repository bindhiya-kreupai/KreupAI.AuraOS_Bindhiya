'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, TrendingUp, Plus, Filter, ChevronRight, Loader2, X } from 'lucide-react';
import { ClaimService, EnrollmentService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

// Status filter options — align with the API ClaimStatus enum (DB stores UPPERCASE).
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PARTIALLY_APPROVED', label: 'Partially Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING_INFO', label: 'Pending Info' },
] as const;

// Claim type options — align with the API claimType (BenefitCategory) enum.
const CLAIM_TYPE_OPTIONS = [
  { value: 'HEALTH_INSURANCE', label: 'Health Insurance' },
  { value: 'DENTAL', label: 'Dental' },
  { value: 'VISION', label: 'Vision' },
  { value: 'LIFE_INSURANCE', label: 'Life Insurance' },
  { value: 'DISABILITY', label: 'Disability' },
  { value: 'RETIREMENT', label: 'Retirement' },
  { value: 'FSA_HSA', label: 'FSA / HSA' },
  { value: 'WELLNESS', label: 'Wellness' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'OTHER', label: 'Other' },
] as const;

const APPROVED_STATUSES = ['APPROVED', 'PARTIALLY_APPROVED', 'PAID'];

export default function ClaimsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { toasts, removeToast, success, error: toastError } = useToast();

  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Enrollments (for the submit form)
  const [enrollments, setEnrollments] = useState<any[]>([]);

  // Submit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    enrollmentId: '',
    claimType: 'HEALTH_INSURANCE',
    providerName: '',
    claimAmount: '',
    serviceDate: '',
    claimDate: '',
  });

  const fetchClaims = useCallback(async () => {
    if (!user?.employeeId) return;
    try {
      setLoading(true);
      const response = await ClaimService.getClaims({
        employeeId: user.employeeId,
        ...(statusFilter ? { status: statusFilter as any } : {}),
      });
      const data = response?.data ?? [];
      setClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId, statusFilter]);

  const fetchEnrollments = useCallback(async () => {
    if (!user?.employeeId) return;
    try {
      const response = await EnrollmentService.getEnrollments({ employeeId: user.employeeId });
      const data = response?.data ?? [];
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setEnrollments([]);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    if (userLoading || !user?.employeeId) return;
    fetchClaims();
  }, [userLoading, user?.employeeId, fetchClaims]);

  useEffect(() => {
    if (userLoading || !user?.employeeId) return;
    fetchEnrollments();
  }, [userLoading, user?.employeeId, fetchEnrollments]);

  // ===== Deductible progress =====
  // Prefer a real deductible target from the enrolled plan; fall back to the
  // share of claims that reached an approved/paid state.
  const deductible = useMemo(() => {
    const deductibleTarget = claims.reduce((max: number, c: any) => {
      const target = c?.enrollment?.plan?.deductible;
      return typeof target === 'number' && target > max ? target : max;
    }, 0);

    const metAmount = claims.reduce((sum: number, c: any) => {
      const amt = c?.paidAmount ?? c?.approvedAmount ?? 0;
      return sum + (typeof amt === 'number' ? amt : 0);
    }, 0);

    if (deductibleTarget > 0) {
      const pct = Math.min(100, Math.round((metAmount / deductibleTarget) * 100));
      return {
        pct,
        label: `$${metAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })} / $${deductibleTarget.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      };
    }

    if (claims.length === 0) {
      return { pct: 0, label: 'N/A' };
    }

    const approvedCount = claims.filter((c: any) =>
      APPROVED_STATUSES.includes(String(c?.status || '').toUpperCase())
    ).length;
    const pct = Math.round((approvedCount / claims.length) * 100);
    return { pct, label: `${approvedCount}/${claims.length} approved` };
  }, [claims]);

  const getClaimId = (claim: any) => claim.claimNumber || claim.id || 'N/A';
  const getDate = (claim: any) => {
    const d = claim.date || claim.claimDate || claim.serviceDate;
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  const getProvider = (claim: any) => claim.provider || claim.providerName || 'Unknown';
  const getAmount = (claim: any) => {
    const amt = claim.amount || claim.claimAmount;
    if (typeof amt === 'number')
      return `$${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (typeof amt === 'string' && amt.startsWith('$')) return amt;
    return amt ? `$${amt}` : '$0.00';
  };
  const getStatus = (claim: any) => {
    const s = claim.status || 'Pending';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, ' ');
  };
  const getType = (claim: any) => {
    const t = claim.type || claim.claimType || 'Other';
    return t.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  };

  const openRow = (claim: any) => {
    if (!claim?.id) return;
    router.push(`/dashboard/benefits/claim-status?claimId=${claim.id}`);
  };

  const resetForm = () => {
    setForm({
      enrollmentId: '',
      claimType: 'HEALTH_INSURANCE',
      providerName: '',
      claimAmount: '',
      serviceDate: '',
      claimDate: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.employeeId) {
      toastError('You must be signed in to submit a claim.');
      return;
    }

    const enrollment = enrollments.find((en: any) => en.id === form.enrollmentId);
    if (!enrollment) {
      toastError('Please select an enrollment.');
      return;
    }

    const amount = parseFloat(form.claimAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toastError('Please enter a valid claim amount.');
      return;
    }
    if (!form.serviceDate || !form.claimDate) {
      toastError('Please provide both service and claim dates.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        enrollmentId: enrollment.id,
        employeeId: user.employeeId,
        employeeName: enrollment.employeeName || user.email || user.employeeId,
        claimType: form.claimType,
        claimDate: new Date(form.claimDate).toISOString(),
        serviceDate: new Date(form.serviceDate).toISOString(),
        claimAmount: amount,
        providerName: form.providerName || undefined,
      };
      const response = await ClaimService.createClaim(payload as any);
      if (response?.success) {
        success('Claim submitted successfully.');
        setModalOpen(false);
        resetForm();
        await fetchClaims();
      } else {
        toastError('Failed to submit claim. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting claim:', err);
      toastError('Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeStatusLabel =
    STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? 'All Statuses';

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Claims History
          </h1>
          <p className="text-slate-500 text-sm">
            Track reimbursements and direct provider billings.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              aria-label="Filter claims by status"
              title={`Filter: ${activeStatusLabel}`}
              className={`p-2 bg-white dark:bg-slate-800 border rounded-xl hover:text-indigo-600 ${
                statusFilter
                  ? 'border-indigo-400 text-indigo-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setFilterOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-52 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1">
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Filter by status
                  </div>
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value || 'all'}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                        statusFilter === opt.value
                          ? 'text-indigo-600 font-bold'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
          >
            <Plus className="w-4 h-4" /> Submit Claim
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 container mx-auto">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <span>Recent Claims</span>
            {statusFilter && (
              <span className="text-xs font-normal text-slate-500">
                Filtered: {activeStatusLabel}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              </div>
            ) : claims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">
                  No Claims Found
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Submit a new claim to track your reimbursements.
                </p>
              </div>
            ) : (
              claims.map((claim, i) => {
                const type = getType(claim);
                const status = getStatus(claim);
                return (
                  <div
                    key={claim.id || i}
                    role="button"
                    tabIndex={0}
                    onClick={() => openRow(claim)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openRow(claim);
                      }
                    }}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer group transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold
                                            ${
                                              type.includes('Health') || type.includes('Medical')
                                                ? 'bg-rose-50 text-rose-500'
                                                : type.includes('Dental')
                                                  ? 'bg-indigo-50 text-indigo-500'
                                                  : 'bg-emerald-50 text-emerald-500'
                                            }`}
                      >
                        {type.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">
                          {getProvider(claim)}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{getDate(claim)}</span>
                          <span>&#8226;</span>
                          <span>{getClaimId(claim)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">{getAmount(claim)}</span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded uppercase min-w-[80px] text-center
                                            ${
                                              status === 'Approved' || status === 'Paid'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : status === 'Rejected' || status === 'Denied'
                                                  ? 'bg-rose-100 text-rose-600'
                                                  : 'bg-amber-100 text-amber-600'
                                            }`}
                      >
                        {status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">
              Utilization Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold">Deductible Met</span>
                  <span>{deductible.label}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${deductible.pct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm text-indigo-500 mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300">Claims Summary</h3>
            <div className="text-3xl font-bold text-indigo-600 my-1">{claims.length}</div>
            <p className="text-xs text-slate-400">Total claims submitted</p>
          </div>
        </div>
      </div>

      {/* Submit Claim modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                Submit Claim
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Enrollment</label>
                <select
                  required
                  value={form.enrollmentId}
                  onChange={(e) => setForm((f) => ({ ...f, enrollmentId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="">Select an enrollment…</option>
                  {enrollments.map((en: any) => (
                    <option key={en.id} value={en.id}>
                      {en.planName || en.benefitPlanName || 'Plan'}
                      {en.enrollmentNumber ? ` — ${en.enrollmentNumber}` : ''}
                    </option>
                  ))}
                </select>
                {enrollments.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No active enrollments found. You must be enrolled before submitting a claim.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Claim Type</label>
                <select
                  required
                  value={form.claimType}
                  onChange={(e) => setForm((f) => ({ ...f, claimType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  {CLAIM_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Provider Name</label>
                <input
                  type="text"
                  value={form.providerName}
                  onChange={(e) => setForm((f) => ({ ...f, providerName: e.target.value }))}
                  placeholder="e.g. City Medical Center"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Claim Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.claimAmount}
                  onChange={(e) => setForm((f) => ({ ...f, claimAmount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Service Date</label>
                  <input
                    type="date"
                    required
                    value={form.serviceDate}
                    onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Claim Date</label>
                  <input
                    type="date"
                    required
                    value={form.claimDate}
                    onChange={(e) => setForm((f) => ({ ...f, claimDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || enrollments.length === 0}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Submitting…' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
