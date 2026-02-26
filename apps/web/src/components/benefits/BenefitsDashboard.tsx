'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Smile,
  Eye,
  Shield,
  Umbrella,
  Wallet,
  Plus,
  ChevronRight,
  RefreshCw,
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import type {
  BenefitsSummary,
  EnrolledPlan,
  InsuranceClaim,
  PlanType,
} from '@/services/benefitsClaimsService';
import { BenefitsClaimsService } from '@/services/benefitsClaimsService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLAN_ICONS: Record<PlanType, React.ReactNode> = {
  Medical: <Heart size={18} className="text-rose-500" />,
  Dental: <Smile size={18} className="text-sky-500" />,
  Vision: <Eye size={18} className="text-violet-500" />,
  Life: <Shield size={18} className="text-emerald-500" />,
  Disability: <Umbrella size={18} className="text-amber-500" />,
  FSA: <Wallet size={18} className="text-teal-500" />,
  HSA: <Wallet size={18} className="text-teal-500" />,
};

const PLAN_BG: Record<PlanType, string> = {
  Medical: 'bg-rose-50 border-rose-200',
  Dental: 'bg-sky-50 border-sky-200',
  Vision: 'bg-violet-50 border-violet-200',
  Life: 'bg-emerald-50 border-emerald-200',
  Disability: 'bg-amber-50 border-amber-200',
  FSA: 'bg-teal-50 border-teal-200',
  HSA: 'bg-teal-50 border-teal-200',
};

const CLAIM_STATUS_CONFIG = {
  Submitted: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Clock size={12} /> },
  'Under Review': { bg: 'bg-sky-100', text: 'text-sky-700', icon: <Clock size={12} /> },
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
// Enrolled Plan Card
// ---------------------------------------------------------------------------

function PlanCard({ plan }: { plan: EnrolledPlan }) {
  const bg = PLAN_BG[plan.planType] ?? 'bg-slate-50 border-slate-200';
  const icon = PLAN_ICONS[plan.planType];
  const deductiblePct =
    plan.deductibleLimit > 0 ? Math.round((plan.deductibleUsed / plan.deductibleLimit) * 100) : 0;
  const oopPct =
    plan.outOfPocketMax > 0 ? Math.round((plan.outOfPocketUsed / plan.outOfPocketMax) * 100) : 0;

  return (
    <div className={`border rounded-xl p-4 ${bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white rounded-lg border border-white/80 shadow-sm">{icon}</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{plan.planName}</p>
            <p className="text-xs text-slate-500">{plan.carrier}</p>
          </div>
        </div>
        <span className="text-xs text-slate-500">{plan.coverageLevel}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/70 rounded-lg p-2">
          <p className="text-xs text-slate-400">Your Premium</p>
          <p className="text-sm font-bold text-slate-700">{fmtCurrency(plan.employeePremium)}/mo</p>
        </div>
        <div className="bg-white/70 rounded-lg p-2">
          <p className="text-xs text-slate-400">Employer Pays</p>
          <p className="text-sm font-bold text-slate-700">{fmtCurrency(plan.employerPremium)}/mo</p>
        </div>
      </div>

      {plan.deductibleLimit > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Deductible Used</span>
            <span>
              {fmtCurrency(plan.deductibleUsed)} / {fmtCurrency(plan.deductibleLimit)}
            </span>
          </div>
          <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-400 rounded-full"
              style={{ width: `${deductiblePct}%` }}
            />
          </div>
        </div>
      )}

      {plan.outOfPocketMax > 0 && (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Out-of-Pocket Used</span>
            <span>
              {fmtCurrency(plan.outOfPocketUsed)} / {fmtCurrency(plan.outOfPocketMax)}
            </span>
          </div>
          <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${oopPct > 80 ? 'bg-rose-400' : 'bg-sky-400'}`}
              style={{ width: `${oopPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between mt-3 text-xs text-slate-400">
        <span>Member ID: {plan.memberId}</span>
        <span>{plan.claimsCount} claims YTD</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Claim Row
// ---------------------------------------------------------------------------

function ClaimRow({ claim, onSelect }: { claim: InsuranceClaim; onSelect: () => void }) {
  const config = CLAIM_STATUS_CONFIG[claim.status] ?? CLAIM_STATUS_CONFIG.Submitted;

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm transition-all text-left"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{claim.claimNumber}</p>
        <p className="text-xs text-slate-500">
          {claim.claimType} &bull; {claim.providerName}
        </p>
        <p className="text-xs text-slate-400">{claim.serviceDate}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-slate-700">{fmtCurrency(claim.billedAmount)}</p>
        <p className="text-xs text-emerald-600">
          {claim.planPaid > 0 ? `Plan paid: ${fmtCurrency(claim.planPaid)}` : ''}
        </p>
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
// Enrollment Banner
// ---------------------------------------------------------------------------

function EnrollmentBanner({
  enrollmentWindow,
}: {
  enrollmentWindow: { isOpen: boolean; endDate: string; daysRemaining: number; type: string };
}) {
  if (!enrollmentWindow.isOpen) return null;
  return (
    <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-300 rounded-xl">
      <Bell size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-purple-800 text-sm">Open Enrollment is Active!</p>
        <p className="text-xs text-purple-600 mt-0.5">
          {enrollmentWindow.type} enrollment closes on {enrollmentWindow.endDate} —{' '}
          {enrollmentWindow.daysRemaining} days remaining. Review and update your benefit elections
          now.
        </p>
      </div>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-medium hover:bg-purple-700 transition-colors flex-shrink-0">
        Enroll Now
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function BenefitsDashboard({
  onClaimSelect,
}: {
  onClaimSelect?: (claimId: string) => void;
}) {
  const [summary, setSummary] = useState<BenefitsSummary | null>(null);
  const [recentClaims, setRecentClaims] = useState<InsuranceClaim[]>([]);
  const [enrollmentWindow, setEnrollmentWindow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'claims'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [sum, claims, ew] = await Promise.all([
      BenefitsClaimsService.getBenefitsSummary('emp-self'),
      BenefitsClaimsService.getClaims('emp-self'),
      BenefitsClaimsService.getEligibilityWindow(),
    ]);
    setSummary(sum);
    setRecentClaims(claims.slice(0, 10));
    setEnrollmentWindow(ew);
    setLoading(false);
  }

  const submittedClaims = recentClaims.filter((c) =>
    ['Submitted', 'Under Review'].includes(c.status)
  ).length;
  const approvedClaims = recentClaims.filter((c) => ['Approved', 'Paid'].includes(c.status)).length;
  const deniedClaims = recentClaims.filter((c) => c.status === 'Denied').length;
  const pendingClaims = recentClaims.filter((c) => c.status === 'Additional Info Required').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Benefits Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            FY2026 &bull; {summary?.enrolledPlans.length} plans enrolled
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Enrollment Banner */}
      {enrollmentWindow && <EnrollmentBanner enrollmentWindow={enrollmentWindow} />}

      {/* Total Benefits Value */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-300">Total Annual Benefits Value</p>
            <p className="text-3xl font-bold mt-1">
              {fmtCurrency(summary?.totalBenefitsValue ?? 0)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              You pay: {fmtCurrency(summary?.employeeContribution ?? 0)} &bull; Employer:{' '}
              {fmtCurrency(summary?.employerContribution ?? 0)}
            </p>
          </div>
          <Shield size={32} className="text-white/30" />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-slate-400">YTD Claims</p>
            <p className="text-lg font-bold">{fmtCurrency(summary?.ytdClaimsAmount ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Plan Paid</p>
            <p className="text-lg font-bold text-emerald-300">
              {fmtCurrency(summary?.ytdClaimsPaid ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Dependents</p>
            <p className="text-lg font-bold">{summary?.dependentsCount ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Claims Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'In Review',
            value: submittedClaims,
            bg: 'bg-sky-50',
            text: 'text-sky-700',
            border: 'border-sky-200',
            icon: <Clock size={16} className="text-sky-500" />,
          },
          {
            label: 'Approved',
            value: approvedClaims,
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: <CheckCircle2 size={16} className="text-emerald-500" />,
          },
          {
            label: 'Needs Info',
            value: pendingClaims,
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: <AlertCircle size={16} className="text-amber-500" />,
          },
          {
            label: 'Denied',
            value: deniedClaims,
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-200',
            icon: <XCircle size={16} className="text-rose-500" />,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border p-4 flex items-center gap-3 ${item.bg} ${item.border}`}
          >
            {item.icon}
            <div>
              <p className={`text-xl font-bold ${item.text}`}>{item.value}</p>
              <p className={`text-xs ${item.text} opacity-70`}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        {(
          [
            ['overview', 'Overview'],
            ['plans', 'My Plans'],
            ['claims', 'Recent Claims'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700 text-sm">Enrolled Plans</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {summary?.enrolledPlans.slice(0, 4).map((plan) => (
              <PlanCard key={plan.planId} plan={plan} />
            ))}
          </div>

          <h3 className="font-semibold text-slate-700 text-sm mt-2">Recent Claims</h3>
          <div className="space-y-2">
            {recentClaims.slice(0, 5).map((c) => (
              <ClaimRow key={c.id} claim={c} onSelect={() => onClaimSelect?.(c.id)} />
            ))}
          </div>
        </div>
      )}

      {/* All Plans */}
      {activeTab === 'plans' && (
        <div className="grid md:grid-cols-2 gap-4">
          {summary?.enrolledPlans.map((plan) => (
            <PlanCard key={plan.planId} plan={plan} />
          ))}
        </div>
      )}

      {/* All Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
              <Plus size={14} />
              Submit Claim
            </button>
          </div>
          {recentClaims.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
              No claims found.
            </div>
          ) : (
            recentClaims.map((c) => (
              <ClaimRow key={c.id} claim={c} onSelect={() => onClaimSelect?.(c.id)} />
            ))
          )}
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          Claims should be submitted within 90 days of the service date. Keep all receipts and EOB
          documents. Appeals must be filed within 60 days of denial.
        </p>
      </div>
    </div>
  );
}
