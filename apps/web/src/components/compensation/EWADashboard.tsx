/**
 * @module EWADashboard
 * @description Earned Wage Access (EWA) dashboard for AuraOS.
 *              Employee view: balance, request form, history, policy.
 *              HR view: usage analytics, adoption rate, withdrawal trends.
 */

'use client';

import React, { useState, useEffect, type FC } from 'react';
import {
  Wallet,
  Calendar,
  Clock,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Info,
  TrendingUp,
  DollarSign,
  BarChart2,
  Loader2,
} from 'lucide-react';
import {
  getEWAEligibility,
  requestEarlyPay,
  getEWAHistory,
  getEWASettings,
  getEWAAnalytics,
  type EWAEligibility,
  type EWATransaction,
  type EWAPolicy,
  type EWAAnalytics,
  type PaymentMethod,
  type EWATransactionStatus,
} from '@/services/earnedWageService';

// ── Types ──────────────────────────────────────────────────────────────────

type ViewMode = 'employee' | 'hr';

// ── Helpers ────────────────────────────────────────────────────────────────

function statusBadge(status: EWATransactionStatus) {
  const map: Record<EWATransactionStatus, { label: string; cls: string }> = {
    PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
    PROCESSING: { label: 'Processing', cls: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700' },
    FAILED: { label: 'Failed', cls: 'bg-red-100 text-red-700' },
    REFUNDED: { label: 'Refunded', cls: 'bg-slate-100 text-slate-600' },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString()}`;
}

// ── Employee: Available Balance Card ──────────────────────────────────────

const BalanceCard: FC<{ eligibility: EWAEligibility }> = ({ eligibility }) => {
  const pctUsed =
    eligibility.grossEarnedToDate > 0
      ? (eligibility.alreadyDrawn /
          ((eligibility.grossEarnedToDate * eligibility.maxDrawPercentage) / 100)) *
        100
      : 0;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-80">Earned Wage Access</span>
        </div>
        <span className="text-xs opacity-60 bg-white/10 px-2 py-0.5 rounded-full">
          {eligibility.currency}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-sm opacity-70 mb-1">Available to Withdraw</p>
        <p className="text-4xl font-bold">
          {formatAmount(eligibility.availableAmount, eligibility.currency)}
        </p>
        <p className="text-xs opacity-60 mt-1">
          of {formatAmount(eligibility.grossEarnedToDate, eligibility.currency)} earned this period
        </p>
      </div>

      {/* Usage bar */}
      <div className="mb-4">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/70 rounded-full transition-all"
            style={{ width: `${Math.min(pctUsed, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs opacity-60 mt-1">
          <span>Withdrawn: {formatAmount(eligibility.alreadyDrawn, eligibility.currency)}</span>
          <span>{Math.round(pctUsed)}% used</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 opacity-70">
          <Calendar className="w-4 h-4" />
          <span>Payday: {eligibility.nextPayday}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-70">
          <Clock className="w-4 h-4" />
          <span>{eligibility.daysUntilPayday} days away</span>
        </div>
      </div>
    </div>
  );
};

// ── Employee: Request Withdrawal Form ─────────────────────────────────────

const WithdrawalForm: FC<{
  eligibility: EWAEligibility;
  onSuccess: () => void;
}> = ({ eligibility, onSuccess }) => {
  const [amount, setAmount] = useState(Math.floor(eligibility.availableAmount * 0.5));
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const feeAmount = eligibility.feePerRequest;
  const netAmount = amount - feeAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await requestEarlyPay(eligibility.employeeId, amount, method);
      setSuccess(true);
      setTimeout(onSuccess, 1_500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
        <p className="text-lg font-semibold text-slate-900">Transfer Successful!</p>
        <p className="text-sm text-slate-500 mt-1">
          {eligibility.currency} {netAmount.toLocaleString()} will arrive shortly.
        </p>
      </div>
    );
  }

  if (!eligibility.isEligible) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
        <p className="text-base font-semibold text-slate-800">Not Eligible</p>
        <p className="text-sm text-slate-500 mt-1">{eligibility.ineligibilityReason}</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {/* Amount slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Withdrawal Amount</label>
          <span className="text-sm font-bold text-slate-900">
            {eligibility.currency} {amount.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={eligibility.availableAmount}
          step={50}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Min: {eligibility.currency} 100</span>
          <span>
            Max: {eligibility.currency} {eligibility.availableAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-2">Payment Method</label>
        <div className="flex gap-2">
          {(['BANK_TRANSFER', 'MOBILE_WALLET'] as PaymentMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                method === m
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Mobile Wallet'}
            </button>
          ))}
        </div>
      </div>

      {/* Fee preview */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Withdrawal amount</span>
          <span>
            {eligibility.currency} {amount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Service fee</span>
          <span>
            - {eligibility.currency} {feeAmount}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-2 mt-2">
          <span>You receive</span>
          <span>
            {eligibility.currency} {netAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || amount < 100}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowDownCircle className="w-4 h-4" />
        )}
        {isSubmitting ? 'Processing…' : 'Request Withdrawal'}
      </button>
    </form>
  );
};

// ── Employee: Transaction History ─────────────────────────────────────────

const TransactionHistory: FC<{ transactions: EWATransaction[] }> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Wallet className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">No EWA transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-900">
                {formatAmount(tx.requestedAmount, tx.currency)}
              </span>
              {statusBadge(tx.status)}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDate(tx.requestedAt)} — {tx.paymentMethod.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Fee: {formatAmount(tx.feeAmount, tx.currency)}</p>
            <p className="text-slate-600 font-medium">
              Net: {formatAmount(tx.netAmount, tx.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── HR Analytics Panel ─────────────────────────────────────────────────────

const HRAnalyticsPanel: FC<{ analytics: EWAAnalytics; policy: EWAPolicy }> = ({
  analytics,
  policy,
}) => {
  const maxBarVal = Math.max(...analytics.byMonth.map((m) => m.amount));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Adoption Rate',
            value: `${analytics.adoptionRate}%`,
            icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
          },
          {
            label: 'Avg Withdrawal',
            value: `AED ${analytics.avgWithdrawalAmount.toLocaleString()}`,
            icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
          },
          {
            label: 'Total Requests',
            value: analytics.totalWithdrawals.toLocaleString(),
            icon: <BarChart2 className="w-4 h-4 text-indigo-500" />,
          },
          {
            label: 'Total Fees',
            value: `AED ${analytics.totalFees.toLocaleString()}`,
            icon: <Wallet className="w-4 h-4 text-amber-500" />,
          },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly trend */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Monthly Withdrawal Volume</h3>
        <div className="flex items-end gap-2 h-24">
          {analytics.byMonth.map((m) => {
            const barH = (m.amount / maxBarVal) * 100;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-400 rounded-t hover:bg-blue-500 transition-colors cursor-default"
                  style={{ height: `${barH}%` }}
                  title={`${m.month}: AED ${m.amount.toLocaleString()} (${m.count} requests)`}
                />
                <span className="text-xs text-slate-400">{m.month.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top departments */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Departments by Usage</h3>
        <div className="space-y-3">
          {analytics.topDepartments.map((dept) => {
            const pct = (dept.count / analytics.totalWithdrawals) * 100;
            return (
              <div key={dept.department} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-32">{dept.department}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-16 text-right">
                  {dept.count} requests
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Current EWA Policy</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Max Withdrawal %', `${policy.maxWithdrawalPercent}% of earned wages`],
            ['Hard Cap', `${policy.currency} ${policy.maxAbsoluteAmount.toLocaleString()}`],
            ['Fee Structure', `${policy.currency} ${policy.feeAmount} flat per request`],
            ['Requests / Period', String(policy.maxRequestsPerPeriod)],
            ['Eligible After', `${policy.eligibleAfterDays} days from hire`],
            ['Processing Time', policy.processingTime],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-slate-400 block text-xs">{label}</span>
              <span className="text-slate-800 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────

const EWADashboard: FC<{ employeeId?: string }> = ({ employeeId = 'emp_001' }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('employee');
  const [eligibility, setEligibility] = useState<EWAEligibility | null>(null);
  const [history, setHistory] = useState<EWATransaction[]>([]);
  const [policy, setPolicy] = useState<EWAPolicy | null>(null);
  const [analytics, setAnalytics] = useState<EWAAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'balance' | 'history' | 'policy'>('balance');

  useEffect(() => {
    void loadData();
  }, [employeeId]);

  async function loadData() {
    setIsLoading(true);
    const [elig, hist, pol, ana] = await Promise.all([
      getEWAEligibility(employeeId),
      getEWAHistory(employeeId),
      getEWASettings(),
      getEWAAnalytics(),
    ]);
    setEligibility(elig);
    setHistory(hist);
    setPolicy(pol);
    setAnalytics(ana);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Earned Wage Access</h1>
          <p className="text-sm text-slate-400 mt-0.5">Access your earned wages before payday</p>
        </div>
        <div className="flex gap-2">
          {(['employee', 'hr'] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {m === 'employee' ? 'My EWA' : 'HR Analytics'}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'employee' && eligibility && policy && (
        <>
          {/* Balance card */}
          <BalanceCard eligibility={eligibility} />

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-200">
            {(['balance', 'history', 'policy'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === t
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'balance' ? 'Request Withdrawal' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            {activeTab === 'balance' && (
              <WithdrawalForm eligibility={eligibility} onSuccess={() => void loadData()} />
            )}
            {activeTab === 'history' && <TransactionHistory transactions={history} />}
            {activeTab === 'policy' && (
              <div className="space-y-3 text-sm">
                <h3 className="font-semibold text-slate-900">EWA Policy Information</h3>
                {[
                  [
                    'Maximum withdrawal',
                    `Up to ${policy.maxWithdrawalPercent}% of wages earned in current period`,
                  ],
                  [
                    'Absolute maximum',
                    `${policy.currency} ${policy.maxAbsoluteAmount.toLocaleString()} per request`,
                  ],
                  [
                    'Requests per period',
                    `${policy.maxRequestsPerPeriod} withdrawals per pay period`,
                  ],
                  ['Service fee', `${policy.currency} ${policy.feeAmount} per withdrawal`],
                  ['Processing time', policy.processingTime],
                  ['Eligibility', `Available after ${policy.eligibleAfterDays} days of employment`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-800 font-medium text-right max-w-xs">{value}</span>
                  </div>
                ))}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mt-4">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Withdrawn amounts will be deducted from your next payslip. EWA is a benefit — it
                    does not affect your credit score.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'hr' && analytics && policy && (
        <HRAnalyticsPanel analytics={analytics} policy={policy} />
      )}
    </div>
  );
};

export default EWADashboard;
