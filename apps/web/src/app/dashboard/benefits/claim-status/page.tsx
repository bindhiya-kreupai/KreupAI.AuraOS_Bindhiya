// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Activity, CheckCircle, Clock, FileText } from 'lucide-react';
import { ClaimService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PENDING_INFO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  PARTIALLY_APPROVED:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAmount(value?: number | null): string {
  const n = typeof value === 'number' ? value : 0;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Build a real status timeline from the claim's timestamps and status.
 * Each step is marked completed / current / pending based on which dates
 * exist and the terminal status of the claim.
 */
function buildTimeline(claim: any) {
  if (!claim) return [];

  const status = String(claim.status || '').toUpperCase();
  const submitted = claim.submittedDate || claim.claimDate;
  const reviewed = claim.reviewedDate;
  const approved = claim.approvedDate || claim.processedDate;
  const paid = claim.paidDate || claim.paymentDate;

  const isRejected = status === 'REJECTED';
  const isPaid = status === 'PAID' || Boolean(paid);
  const isApproved =
    ['APPROVED', 'PARTIALLY_APPROVED', 'PAID'].includes(status) || Boolean(approved);
  const isUnderReview = ['UNDER_REVIEW', 'PENDING_INFO'].includes(status) || Boolean(reviewed);

  const steps: Array<{
    title: string;
    date: string | null;
    state: 'completed' | 'current' | 'pending';
    desc: string;
  }> = [];

  // 1. Submitted — always considered complete once a claim exists.
  steps.push({
    title: 'Claim Submitted',
    date: formatDate(submitted),
    state: 'completed',
    desc: 'Successfully received for processing.',
  });

  // 2. Under Review
  steps.push({
    title: 'Under Review',
    date: formatDate(reviewed),
    state:
      reviewed || isApproved || isPaid || isRejected
        ? 'completed'
        : isUnderReview
          ? 'current'
          : 'pending',
    desc: 'Provider verification and coverage checks.',
  });

  // 3. Adjudication / Decision
  steps.push({
    title: isRejected ? 'Adjudication (Rejected)' : 'Adjudication / Approved',
    date: formatDate(approved) || (isRejected ? formatDate(claim.reviewedDate) : null),
    state: isApproved || isRejected ? (isPaid || isRejected ? 'completed' : 'current') : 'pending',
    desc: isRejected
      ? claim.rejectionReason || claim.denialReason || 'Claim was not approved.'
      : 'Determining coverage and payable amount.',
  });

  // 4. Payment
  if (!isRejected) {
    steps.push({
      title: 'Payment',
      date: formatDate(paid),
      state: isPaid ? 'completed' : isApproved ? 'current' : 'pending',
      desc: 'Funds released to provider or employee.',
    });
  }

  return steps;
}

export default function ClaimStatusPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const searchParams = useSearchParams();
  const claimIdParam = searchParams?.get('claimId') || null;

  const toast = useToast();

  const [claims, setClaims] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchClaimStatus(user.employeeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const fetchClaimStatus = async (employeeId: string) => {
    try {
      setLoading(true);
      const response = await ClaimService.getClaims({ employeeId });
      const list = response?.data || [];
      setClaims(list);

      // Preselect from query param if present, else first claim.
      const preselect =
        (claimIdParam && list.find((c: any) => c.id === claimIdParam)) || list[0] || null;
      setSelectedId(preselect ? preselect.id : null);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load claim status. Please try again.');
      setClaims([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  };

  const selectedClaim = useMemo(
    () => claims.find((c) => c.id === selectedId) || null,
    [claims, selectedId]
  );

  const timeline = useMemo(() => buildTimeline(selectedClaim), [selectedClaim]);

  const documents: any[] = useMemo(() => {
    if (!selectedClaim) return [];
    const raw = selectedClaim.documents ?? selectedClaim.receipts ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [selectedClaim]);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            Claim Status Tracker
          </h1>
          <p className="text-slate-500 text-sm">Real-time updates on your submitted claims.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <Clock className="w-5 h-5 mr-2 animate-spin" /> Loading claims…
        </div>
      ) : claims.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
          <FileText className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            No claims found
          </h2>
          <p className="text-sm">You have no submitted claims to track yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 container mx-auto min-h-0 flex-1">
          {/* Claim selector rail */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 overflow-y-auto">
            <h3 className="font-bold text-xs uppercase tracking-wide text-slate-400 px-2 mb-2">
              Your Claims ({claims.length})
            </h3>
            <div className="space-y-1">
              {claims.map((claim) => {
                const active = claim.id === selectedId;
                return (
                  <button
                    key={claim.id}
                    type="button"
                    onClick={() => setSelectedId(claim.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs text-slate-400">#{claim.claimNumber || claim.id}</div>
                    <div className="font-semibold text-sm truncate">
                      {claim.claimType ||
                        claim.treatmentDescription ||
                        claim.planName ||
                        claim.benefitPlanName ||
                        'Claim'}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500 truncate">
                        {claim.providerName || '—'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[String(claim.status || '').toUpperCase()] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                      >
                        {String(claim.status || '—').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
            {selectedClaim && (
              <>
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      Claim ID: #{selectedClaim.claimNumber || selectedClaim.id}
                    </div>
                    <h2 className="text-2xl font-bold">
                      {selectedClaim.claimType ||
                        selectedClaim.treatmentDescription ||
                        selectedClaim.planName ||
                        selectedClaim.benefitPlanName ||
                        'Claim'}
                    </h2>
                    <div className="text-indigo-600 font-medium">
                      {[
                        selectedClaim.providerName,
                        formatDate(selectedClaim.serviceDate || selectedClaim.claimDate),
                      ]
                        .filter(Boolean)
                        .join(' • ') || '—'}
                    </div>
                    {(selectedClaim.planName || selectedClaim.benefitPlanName) && (
                      <div className="text-xs text-slate-400 mt-1">
                        Plan: {selectedClaim.planName || selectedClaim.benefitPlanName}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500 mb-1">Claim Amount</div>
                    <div className="text-2xl font-mono font-bold">
                      {formatAmount(selectedClaim.claimAmount ?? selectedClaim.claimedAmount)}
                    </div>
                    {(selectedClaim.approvedAmount != null || selectedClaim.paidAmount != null) && (
                      <div className="text-xs text-slate-400 mt-1">
                        {selectedClaim.approvedAmount != null && (
                          <div>Approved: {formatAmount(selectedClaim.approvedAmount)}</div>
                        )}
                        {selectedClaim.paidAmount != null && (
                          <div>Paid: {formatAmount(selectedClaim.paidAmount)}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>

                  {timeline.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white dark:ring-slate-900
                                                ${
                                                  step.state === 'completed'
                                                    ? 'bg-emerald-500 text-white'
                                                    : step.state === 'current'
                                                      ? 'bg-indigo-500 text-white animate-pulse'
                                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                                }`}
                      >
                        {step.state === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : step.state === 'current' ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                        )}
                      </div>
                      <div className="pt-1 pb-4">
                        <h4
                          className={`font-bold ${step.state === 'pending' ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}
                        >
                          {step.title}
                        </h4>
                        <div className="text-xs font-bold text-slate-400 mb-1">
                          {step.date || (step.state === 'current' ? 'In Progress' : 'Pending')}
                        </div>
                        <p className="text-sm text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
              <h3 className="font-bold text-sm mb-4">Documents</h3>
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-sm text-slate-400">No documents attached</p>
                ) : (
                  documents.map((doc, i) => {
                    const url = doc?.url;
                    const name = doc?.name || `Document ${i + 1}`;
                    const size = doc?.size;
                    const cardInner = (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors">
                        <FileText className="w-8 h-8 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{name}</div>
                          {size && <div className="text-xs text-slate-400">{size}</div>}
                          {!url && <div className="text-xs text-slate-400">Not available</div>}
                        </div>
                      </div>
                    );

                    return url ? (
                      <a
                        key={doc?.id || i}
                        href={url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block cursor-pointer"
                      >
                        {cardInner}
                      </a>
                    ) : (
                      <div key={doc?.id || i}>{cardInner}</div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
