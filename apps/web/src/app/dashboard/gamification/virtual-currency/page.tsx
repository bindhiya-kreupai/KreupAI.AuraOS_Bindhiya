'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Wallet, ArrowRightLeft, CreditCard, DollarSign, Loader2, X } from 'lucide-react';
import { VirtualCurrencyService } from '../services';
import { useToast } from '../components/useToast';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface CurrencyView {
  currencyCode: string;
  currencyName: string;
  conversionRate: number;
  balance: number;
  displayName: string;
  usdValue: number;
}

type Action = 'transfer' | 'cashout' | 'convert';

export default function VirtualCurrencyPage() {
  const { loading: authLoading } = useCurrentUser();
  const { toasts, dismiss, push } = useToast();
  const [currency, setCurrency] = useState<CurrencyView | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<Action | null>(null);
  const [amount, setAmount] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await VirtualCurrencyService.getCurrencies();
      setCurrency(((data as unknown as CurrencyView[]) || [])[0] || null);
    } catch (error) {
      push('error', error instanceof Error ? error.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  const openAction = (a: Action) => {
    setAction(a);
    setAmount('');
    setToUserId('');
  };

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      push('error', 'Enter a valid amount');
      return;
    }
    if (currency && amt > currency.balance) {
      push('error', 'Insufficient balance');
      return;
    }
    try {
      setSubmitting(true);
      if (action === 'transfer') {
        if (!toUserId.trim()) {
          push('error', 'Enter a recipient employee ID');
          setSubmitting(false);
          return;
        }
        await VirtualCurrencyService.transfer(toUserId.trim(), amt);
        push('success', `Transferred ${amt} AC`);
      } else if (action === 'cashout') {
        await VirtualCurrencyService.cashOut(amt);
        push('success', `Cashed out ${amt} AC to payroll`);
      } else if (action === 'convert') {
        await VirtualCurrencyService.convertPointsToCurrency('', 'aura-coin', amt);
        push('success', `Converted ${amt} AC`);
      }
      setAction(null);
      await loadData();
    } catch (error) {
      push('error', error instanceof Error ? error.message : 'Action failed');
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

  const balance = currency?.balance ?? 0;
  const rate = currency?.conversionRate ?? 100;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-500" />
            Virtual Wallet
          </h1>
          <p className="text-slate-500 text-sm">Manage your Aura Coins and transactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Visual Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl shadow-indigo-900/30 flex flex-col justify-between min-h-[240px] relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-12 h-8 rounded bg-yellow-400/20 flex items-center justify-center border border-yellow-400/50">
              <div className="w-8 h-5 border border-yellow-400/30 rounded-sm"></div>
            </div>
            <span className="font-mono tracking-widest opacity-50">AURA COIN</span>
          </div>
          <div className="relative z-10">
            <div className="text-sm opacity-75 mb-1">Current Balance</div>
            <div className="text-4xl font-mono tracking-wider mb-8">
              {balance.toLocaleString()} AC
            </div>
            <div className="flex justify-between items-end">
              <div className="font-mono text-sm opacity-75">{currency?.displayName || '—'}</div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => openAction('transfer')}
            className="h-full p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors flex flex-col items-center justify-center text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg">Transfer Points</h3>
            <p className="text-sm text-slate-500">Send points to colleagues as a gift.</p>
          </button>
          <button
            onClick={() => openAction('cashout')}
            className="h-full p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors flex flex-col items-center justify-center text-center group"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-bold text-lg">Cash Out</h3>
            <p className="text-sm text-slate-500">Convert points to payroll credit.</p>
          </button>
        </div>
      </div>

      {/* Exchange Rates / Market */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Currency Exchange</h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded shadow-sm">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="font-bold">{rate} Aura Coins</div>
              <div className="text-xs text-slate-500">= $1.00 USD</div>
            </div>
          </div>
          <button
            onClick={() => openAction('convert')}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold"
          >
            Convert
          </button>
        </div>
      </div>

      {action && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg capitalize">
                {action === 'cashout' ? 'Cash Out' : action}
              </h3>
              <button
                onClick={() => setAction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-3">
              Available: <span className="font-bold">{balance.toLocaleString()}</span> AC
            </p>
            {action === 'transfer' && (
              <input
                type="text"
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                placeholder="Recipient employee ID"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent mb-3"
              />
            )}
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (AC)"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setAction(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
