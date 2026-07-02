'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Coins,
  TrendingUp,
  Gift,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X,
} from 'lucide-react';
import { PointsService } from '../services';
import { useToast } from '../components/useToast';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface AccountView {
  totalPoints: number;
  currentBalance: number;
  currentLevel: number;
  currentTier: string;
}

interface TxnView {
  transactionId: string;
  type: 'earn' | 'redeem';
  pointsAmount: number;
  amount: string;
  title: string;
  date: string;
}

export default function PointsSystemPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const { toasts, dismiss, push } = useToast();
  const [account, setAccount] = useState<AccountView | null>(null);
  const [transactions, setTransactions] = useState<TxnView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.employeeId) return;
    try {
      setLoading(true);
      const [acc, txns] = await Promise.all([
        PointsService.getAccount(user.employeeId),
        PointsService.getTransactions(user.employeeId),
      ]);
      setAccount(acc as unknown as AccountView);
      setTransactions((txns as unknown as TxnView[]) || []);
    } catch (error) {
      push('error', error instanceof Error ? error.message : 'Failed to load points');
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId, push]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  const { earnedThisMonth, spentThisMonth } = useMemo(() => {
    const now = new Date();
    let earned = 0;
    let spent = 0;
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        if (tx.pointsAmount >= 0) earned += tx.pointsAmount;
        else spent += Math.abs(tx.pointsAmount);
      }
    }
    return { earnedThisMonth: earned, spentThisMonth: spent };
  }, [transactions]);

  const handleRedeem = async () => {
    const pts = Number(redeemPoints);
    if (!Number.isFinite(pts) || pts <= 0) {
      push('error', 'Enter a valid number of points');
      return;
    }
    if (account && pts > account.currentBalance) {
      push('error', 'You do not have enough points');
      return;
    }
    try {
      setSubmitting(true);
      await PointsService.redeemPoints(user!.employeeId, pts, 'Points redemption');
      push('success', `Redeemed ${pts} points`);
      setShowRedeem(false);
      setRedeemPoints('');
      await loadData();
    } catch (error) {
      push('error', error instanceof Error ? error.message : 'Redemption failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const balance = account?.currentBalance ?? 0;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-500" />
            My Points
          </h1>
          <p className="text-slate-500 text-sm">Track your earnings and spending history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Balance Card */}
        <div className="md:col-span-3 lg:col-span-1 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl p-8 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden flex flex-col justify-between h-64">
          <div className="relative z-10">
            <h3 className="text-amber-100 font-bold uppercase text-sm mb-1">Total Balance</h3>
            <div className="text-5xl font-bold mb-4">{balance.toLocaleString()}</div>
            <div className="flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-lg backdrop-blur-sm">
              <TrendingUp className="w-4 h-4" /> Level {account?.currentLevel ?? 1} ·{' '}
              {account?.currentTier ?? 'bronze'}
            </div>
          </div>
          <div className="relative z-10">
            <button
              onClick={() => setShowRedeem(true)}
              className="w-full py-2 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" /> Redeem Rewards
            </button>
          </div>
          <Coins className="absolute -bottom-8 -right-8 w-48 h-48 text-white opacity-20 transform rotate-12" />
        </div>

        {/* History & Stats */}
        <div className="md:col-span-3 lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Earned this Month</h4>
              <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                +{earnedThisMonth.toLocaleString()} <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Spent this Month</h4>
              <div className="text-2xl font-bold text-rose-500 flex items-center gap-2">
                -{spentThisMonth.toLocaleString()} <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex-1">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Recent Activity
            </h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">No point activity yet.</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.transactionId}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'earn'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {tx.type === 'earn' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{tx.title}</h4>
                        <p className="text-xs text-slate-500">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        tx.type === 'earn'
                          ? 'text-emerald-600'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.amount} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showRedeem && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange-500" /> Redeem Points
              </h3>
              <button
                onClick={() => setShowRedeem(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Available balance: <span className="font-bold">{balance.toLocaleString()}</span> pts
            </p>
            <input
              type="number"
              min={1}
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(e.target.value)}
              placeholder="Points to redeem"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRedeem(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
