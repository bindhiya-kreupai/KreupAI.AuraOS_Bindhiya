'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Users, Eye, Loader2, X } from 'lucide-react';
import { BonusService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface PayoutForm {
  employeeId: string;
  amount: string;
  reason: string;
}

interface SchemeForm {
  schemeName: string;
  bonusType: string;
  budgetAmount: string;
}

const EMPTY_PAYOUT: PayoutForm = { employeeId: '', amount: '', reason: '' };
const EMPTY_SCHEME: SchemeForm = { schemeName: '', bonusType: 'performance', budgetAmount: '' };

export default function BonusManagementPage() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [schemeModalOpen, setSchemeModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState<PayoutForm>(EMPTY_PAYOUT);
  const [schemeForm, setSchemeForm] = useState<SchemeForm>(EMPTY_SCHEME);
  const [submitting, setSubmitting] = useState(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schemesData, payoutsData] = await Promise.all([
        BonusService.getSchemes(),
        BonusService.getPayouts(),
      ]);
      setSchemes(schemesData);
      setPayouts(payoutsData);
    } catch (err) {
      console.error('Error:', err);
      error('Failed to load bonus data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutForm.employeeId) {
      error('Employee is required');
      return;
    }
    setSubmitting(true);
    try {
      await BonusService.createPayout({
        employeeId: payoutForm.employeeId,
        amount: Number(payoutForm.amount) || 0,
        reason: payoutForm.reason,
        name: 'Performance Bonus',
      } as any);
      success('Bonus payout created');
      setPayoutModalOpen(false);
      setPayoutForm(EMPTY_PAYOUT);
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to create bonus payout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleasePayout = async (id: string) => {
    setReleasingId(id);
    try {
      await BonusService.releasePayout(id);
      success('Bonus released');
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to release bonus');
    } finally {
      setReleasingId(null);
    }
  };

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemeForm.schemeName) {
      error('Scheme name is required');
      return;
    }
    setSubmitting(true);
    try {
      await BonusService.createScheme({
        schemeName: schemeForm.schemeName,
        bonusType: schemeForm.bonusType as any,
        budgetAmount: Number(schemeForm.budgetAmount) || 0,
      } as any);
      success('Bonus scheme saved');
      setSchemeModalOpen(false);
      setSchemeForm(EMPTY_SCHEME);
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to save bonus scheme');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const totalBonusAmount = payouts.reduce(
    (sum: number, p: any) =>
      sum + (Number(p.amount) || Number(p.payoutAmount) || Number(p.finalBonusAmount) || 0),
    0
  );
  const totalEligible = payouts.length;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-indigo-500" />
            Bonus Management
          </h1>
          <p className="text-slate-500 text-sm">Configure and distribute performance bonuses.</p>
        </div>
        <button
          onClick={() => {
            setPayoutForm(EMPTY_PAYOUT);
            setPayoutModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          Release Bonus
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Panel: Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Bonus Schemes & Payouts</h3>
            {schemes.length === 0 && payouts.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No bonus schemes or payouts found.</p>
            ) : (
              <div className="space-y-4">
                {schemes.map((scheme: any, i: number) => {
                  const schemePayouts = payouts.filter((p: any) => p.schemeId === scheme.id);
                  const schemeTotal = schemePayouts.reduce(
                    (sum: number, p: any) =>
                      sum + (Number(p.amount) || Number(p.payoutAmount) || 0),
                    0
                  );
                  return (
                    <div
                      key={scheme.id || i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start gap-3 mb-4 sm:mb-0">
                        <div
                          className={`p-3 rounded-xl ${
                            scheme.status === 'processed' || scheme.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-600'
                              : scheme.status === 'active' || scheme.status === 'Processing'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <Gift className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200">
                            {scheme.schemeName || scheme.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />{' '}
                            {scheme.payoutDate || scheme.fiscalYear || '--'}
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                            <Users className="w-3 h-3" /> {schemePayouts.length} Payouts
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-600">
                            $
                            {schemeTotal > 0
                              ? schemeTotal.toLocaleString()
                              : scheme.budgetAmount
                                ? Number(scheme.budgetAmount).toLocaleString()
                                : '--'}
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded ${
                              scheme.status === 'processed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : scheme.status === 'active'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {scheme.status}
                          </span>
                        </div>
                        <div className="text-slate-400 hover:text-indigo-600">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {schemes.length === 0 && payouts.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">
                      {payouts.length} Individual Bonus Payouts
                    </h4>
                    <div className="text-lg font-bold text-indigo-600 mt-2">
                      Total: ${totalBonusAmount.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {payouts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-lg mb-4">Individual Payouts</h3>
              <div className="space-y-2">
                {payouts.map((payout: any, i: number) => {
                  const amount =
                    Number(payout.amount) ||
                    Number(payout.payoutAmount) ||
                    Number(payout.finalBonusAmount) ||
                    0;
                  const isReleased =
                    payout.isProcessed === true ||
                    payout.approvalStatus === 'APPROVED' ||
                    payout.status === 'processed' ||
                    payout.status === 'paid' ||
                    payout.status === 'approved';
                  return (
                    <div
                      key={payout.id || i}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {payout.employeeName || payout.employeeId || '--'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {payout.reason || payout.name || '--'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-indigo-600 text-sm">
                          ${amount.toLocaleString()}
                        </span>
                        {isReleased ? (
                          <span className="text-[10px] font-bold uppercase py-1 px-2 rounded bg-emerald-100 text-emerald-700">
                            Released
                          </span>
                        ) : (
                          <button
                            onClick={() => handleReleasePayout(payout.id)}
                            disabled={releasingId === payout.id}
                            className="text-xs font-bold text-indigo-500 hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {releasingId === payout.id && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            Release
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Rules */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-indigo-500">
                <div className="text-sm font-bold">Total Bonus Budget</div>
                <div className="flex justify-between mt-2 text-xs">
                  <span>Schemes</span>
                  <span className="font-bold text-indigo-600">{schemes.length}</span>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span>Payouts</span>
                  <span className="font-bold text-emerald-500">{payouts.length}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-amber-500">
                <div className="text-sm font-bold">Total Payout Amount</div>
                <div className="text-lg font-bold text-indigo-600 mt-1">
                  ${totalBonusAmount > 0 ? totalBonusAmount.toLocaleString() : '--'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setSchemeForm(EMPTY_SCHEME);
                setSchemeModalOpen(true);
              }}
              className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Edit Rules
            </button>
          </div>
        </div>
      </div>

      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreatePayout}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Release Bonus</h2>
              <button
                type="button"
                onClick={() => setPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Employee ID</span>
                <input
                  value={payoutForm.employeeId}
                  onChange={(e) => setPayoutForm({ ...payoutForm, employeeId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Amount</span>
                <input
                  type="number"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Reason</span>
                <input
                  value={payoutForm.reason}
                  onChange={(e) => setPayoutForm({ ...payoutForm, reason: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoutModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Payout
              </button>
            </div>
          </form>
        </div>
      )}

      {schemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreateScheme}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Bonus Scheme Rules</h2>
              <button
                type="button"
                onClick={() => setSchemeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Scheme Name</span>
                <input
                  value={schemeForm.schemeName}
                  onChange={(e) => setSchemeForm({ ...schemeForm, schemeName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Bonus Type</span>
                <select
                  value={schemeForm.bonusType}
                  onChange={(e) => setSchemeForm({ ...schemeForm, bonusType: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                >
                  <option value="performance">Performance</option>
                  <option value="annual">Annual</option>
                  <option value="festival">Festival</option>
                  <option value="retention">Retention</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Budget Amount</span>
                <input
                  type="number"
                  value={schemeForm.budgetAmount}
                  onChange={(e) => setSchemeForm({ ...schemeForm, budgetAmount: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSchemeModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Scheme
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
