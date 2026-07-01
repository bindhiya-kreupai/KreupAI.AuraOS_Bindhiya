'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X,
} from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface HsaFsaAccount {
  id: string;
  type: string;
  status: string;
  balance: number;
  yearToDateContributions: { employee: number; employer: number; total: number };
  annualLimit: number;
  remainingContributionRoom: number;
  investmentBalance: number;
  cashBalance: number;
  planYear: number;
  contributionAmount: number;
  contributionFrequency: string;
}

interface HsaFsaTransaction {
  id: string;
  accountId: string;
  accountType: string | null;
  type: string;
  amount: number;
  description: string;
  date: string;
  status: string;
}

const DEFAULT_TRANSACTIONS: HsaFsaTransaction[] = [];

export default function HsaFsaPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const { toasts, removeToast, success, error: errorToast, info } = useToast();

  const [accounts, setAccounts] = useState<HsaFsaAccount[]>([]);
  const [transactions, setTransactions] = useState<HsaFsaTransaction[]>(DEFAULT_TRANSACTIONS);
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Contribution modal state
  const [contribAccount, setContribAccount] = useState<HsaFsaAccount | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribFrequency, setContribFrequency] = useState('MONTHLY');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.employeeId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/v1/benefits/hsa-fsa?employeeId=${encodeURIComponent(user.employeeId)}`,
        { credentials: 'same-origin', cache: 'no-store' }
      );
      const body = await res.json();
      if (res.ok && body?.success && body.data) {
        setAccounts(Array.isArray(body.data.accounts) ? body.data.accounts : []);
        setTransactions(
          Array.isArray(body.data.recentTransactions) ? body.data.recentTransactions : []
        );
      } else {
        setAccounts([]);
        setTransactions([]);
      }
    } catch (err) {
      setAccounts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    void fetchData();
  }, [authLoading, user, fetchData]);

  const openContribModal = (account: HsaFsaAccount) => {
    setContribAccount(account);
    setContribAmount(String(account.contributionAmount || ''));
    setContribFrequency((account.contributionFrequency || 'monthly').toUpperCase());
  };

  const closeContribModal = () => {
    setContribAccount(null);
    setContribAmount('');
    setSubmitting(false);
  };

  const handleContributionSubmit = async () => {
    if (!contribAccount) return;
    const amount = parseFloat(contribAmount);
    if (Number.isNaN(amount) || amount < 0) {
      errorToast('Enter a valid contribution amount');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/benefits/hsa-fsa/contribution', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: contribAccount.id,
          contributionAmount: amount,
          frequency: contribFrequency,
        }),
      });
      const body = await res.json();
      if (res.ok && body?.success) {
        success(body.data?.message || 'Contribution updated successfully');
        closeContribModal();
        await fetchData();
      } else {
        errorToast(body?.error?.message || 'Failed to update contribution');
      }
    } catch (err) {
      errorToast('Failed to update contribution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClaim = () => {
    // Reuse the shared benefits claims flow for reimbursement submission.
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard/benefits/claims';
    }
  };

  const handleOrderCard = async () => {
    if (accounts.length === 0) {
      info('No active account to order a card for');
      return;
    }
    // Record the card request as an ADJUSTMENT transaction against the first account.
    try {
      const account = accounts[0];
      const res = await fetch('/api/v1/benefits/hsa-fsa/contribution', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          contributionAmount: account.contributionAmount,
          frequency: (account.contributionFrequency || 'monthly').toUpperCase(),
        }),
      });
      if (res.ok) {
        info(
          'Replacement card request noted. Contact your benefits administrator to confirm shipping.'
        );
      } else {
        info('Please contact your benefits administrator to order a replacement card.');
      }
    } catch (err) {
      info('Please contact your benefits administrator to order a replacement card.');
    }
  };

  const visibleTransactions = showAllTransactions ? transactions : transactions.slice(0, 5);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-celestial-indigo animate-spin" />
      </div>
    );
  }

  if (accounts.length === 0 && transactions.length === 0) {
    return (
      <div className="space-y-4 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            HSA &amp; FSA Accounts
          </h1>
          <p className="text-sm text-silver-mist mt-1">
            Manage your Health Savings and Flexible Spending Accounts
          </p>
        </div>
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <DollarSign className="w-12 h-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-2">
            No HSA/FSA Accounts
          </h2>
          <p className="text-silver-mist max-w-md">
            You don&apos;t have any Health Savings or Flexible Spending Accounts set up. Contact HR
            to enroll.
          </p>
        </div>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
          HSA &amp; FSA Accounts
        </h1>
        <p className="text-sm text-silver-mist mt-1">
          Manage your Health Savings and Flexible Spending Accounts
        </p>
      </div>

      {/* Account Cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accounts.map((account) => {
            const isHsa = account.type === 'HSA';
            const contributed = account.yearToDateContributions.total;
            const remaining = Math.max(0, account.annualLimit - contributed);
            const pct =
              account.annualLimit > 0
                ? Math.min((contributed / account.annualLimit) * 100, 100)
                : 0;
            return (
              <div
                key={account.id}
                className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${isHsa ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                    >
                      <DollarSign
                        className={`w-5 h-5 ${isHsa ? 'text-emerald-500' : 'text-blue-500'}`}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-ink-black dark:text-pearl">
                        {account.type} Account
                      </h3>
                      <p className="text-[10px] text-silver-mist">
                        {isHsa ? 'Health Savings Account' : 'Flexible Spending Account'}
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-silver-mist" />
                </div>
                <p className="text-3xl font-bold text-ink-black dark:text-pearl">
                  ${account.balance.toLocaleString()}
                </p>
                <p className="text-xs text-silver-mist mt-1">Available Balance</p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-silver-mist">Annual Limit</span>
                    <span className="font-medium text-ink-black dark:text-pearl">
                      ${account.annualLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isHsa ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-silver-mist">
                    <span>Contributed: ${contributed.toLocaleString()}</span>
                    <span>Remaining: ${remaining.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-cloud dark:border-nebula-purple/50">
                  <div className="text-center">
                    <p className="text-xs text-silver-mist">YTD Total</p>
                    <p className="text-sm font-bold text-ink-black dark:text-pearl mt-0.5">
                      ${contributed.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-silver-mist">Investment</p>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">
                      ${account.investmentBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-silver-mist">Per {account.contributionFrequency}</p>
                    <p className="text-sm font-bold text-sunset-amber mt-0.5">
                      ${account.contributionAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openContribModal(account)}
                  className="mt-4 w-full py-2 text-xs font-medium text-celestial-indigo bg-celestial-indigo/5 rounded-lg hover:bg-celestial-indigo/10 transition-colors"
                >
                  Change Contribution
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl">
              Recent Transactions
            </h3>
            {transactions.length > 5 && (
              <button
                onClick={() => setShowAllTransactions((v) => !v)}
                className="text-xs text-celestial-indigo font-medium hover:underline"
              >
                {showAllTransactions ? 'Show Less' : 'View All'}
              </button>
            )}
          </div>
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {visibleTransactions.map((tx) => {
              const isContribution = tx.type === 'contribution';
              return (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                  <div
                    className={`p-2 rounded-lg ${isContribution ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
                  >
                    {isContribution ? (
                      <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-silver-mist">
                      <span>
                        {new Date(tx.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded text-[10px] capitalize">
                        {tx.type}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${isContribution ? 'text-emerald-600' : 'text-ink-black dark:text-pearl'}`}
                  >
                    {isContribution ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleSubmitClaim}
          className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo transition-colors text-left"
        >
          <Receipt className="w-5 h-5 text-celestial-indigo mb-2" />
          <p className="text-sm font-medium text-ink-black dark:text-pearl">Submit Claim</p>
          <p className="text-xs text-silver-mist mt-0.5">File a new reimbursement</p>
        </button>
        <button
          onClick={() => accounts[0] && openContribModal(accounts[0])}
          className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo transition-colors text-left"
        >
          <TrendingUp className="w-5 h-5 text-celestial-indigo mb-2" />
          <p className="text-sm font-medium text-ink-black dark:text-pearl">Change Contribution</p>
          <p className="text-xs text-silver-mist mt-0.5">Adjust payroll deductions</p>
        </button>
        <button
          onClick={handleOrderCard}
          className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo transition-colors text-left"
        >
          <CreditCard className="w-5 h-5 text-celestial-indigo mb-2" />
          <p className="text-sm font-medium text-ink-black dark:text-pearl">Order New Card</p>
          <p className="text-xs text-silver-mist mt-0.5">Request a replacement debit card</p>
        </button>
      </div>

      {/* Change Contribution Modal */}
      {contribAccount && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-cloud dark:border-nebula-purple/50">
              <h3 className="font-bold text-ink-black dark:text-pearl">
                Change {contribAccount.type} Contribution
              </h3>
              <button onClick={closeContribModal} className="text-silver-mist hover:text-ink-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">
                  Contribution Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-silver-mist mb-1">Frequency</label>
                <select
                  value={contribFrequency}
                  onChange={(e) => setContribFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="BI_WEEKLY">Bi-weekly</option>
                </select>
              </div>
              <p className="text-[11px] text-silver-mist">
                Annual limit: ${contribAccount.annualLimit.toLocaleString()} · Remaining room: $
                {contribAccount.remainingContributionRoom.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-cloud dark:border-nebula-purple/50">
              <button
                onClick={closeContribModal}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-silver-mist hover:text-ink-black"
              >
                Cancel
              </button>
              <button
                onClick={handleContributionSubmit}
                disabled={submitting}
                className="px-4 py-2 text-sm font-bold text-white bg-celestial-indigo rounded-lg hover:bg-celestial-indigo/90 disabled:opacity-60 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Contribution
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
