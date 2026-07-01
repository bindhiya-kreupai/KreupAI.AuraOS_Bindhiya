'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, PiggyBank, ArrowRight, Loader2, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { LoanService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface LoanForm {
  schemeId: string;
  employeeId: string;
  loanType: string;
  principalAmount: string;
  interestRate: string;
  tenureMonths: string;
  purpose: string;
}

const EMPTY_FORM: LoanForm = {
  schemeId: '',
  employeeId: '',
  loanType: 'personal',
  principalAmount: '',
  interestRate: '',
  tenureMonths: '',
  purpose: '',
};

export default function LoansPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [employeeLoans, setEmployeeLoans] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<LoanForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansData, schemesData] = await Promise.all([
        LoanService.getLoans(),
        LoanService.getSchemes(),
      ]);
      setEmployeeLoans(loansData);
      setSchemes(schemesData);
    } catch (err) {
      console.error('Error:', err);
      error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm({ ...EMPTY_FORM, employeeId: user?.employeeId ?? '' });
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.principalAmount || !form.tenureMonths) {
      error('Employee, principal amount and tenure are required');
      return;
    }
    setSubmitting(true);
    try {
      await LoanService.createLoan({
        schemeId: form.schemeId || undefined,
        employeeId: form.employeeId,
        loanType: form.loanType,
        principalAmount: Number(form.principalAmount) || 0,
        interestRate: Number(form.interestRate) || 0,
        tenureMonths: Number(form.tenureMonths) || 0,
        purpose: form.purpose,
      } as any);
      success('Loan request created');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to create loan request');
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)] text-sm text-slate-400">
        You must be signed in to view loans.
      </div>
    );
  }

  const activeLoan =
    employeeLoans.find((l: any) => l.status === 'active' || l.status === 'Active') ||
    employeeLoans[0];
  const pendingLoans = employeeLoans.filter(
    (l: any) => l.status === 'pending' || l.status === 'Pending'
  );

  const loanAmount = activeLoan
    ? Number(activeLoan.loanAmount || activeLoan.principalAmount || activeLoan.amount || 0)
    : 0;
  const outstanding = activeLoan
    ? Number(
        activeLoan.totalOutstanding || activeLoan.outstandingPrincipal || activeLoan.balance || 0
      )
    : 0;
  const emiAmount = activeLoan ? Number(activeLoan.emiAmount || activeLoan.emi || 0) : 0;
  const paidPercentage = loanAmount > 0 ? ((loanAmount - outstanding) / loanAmount) * 100 : 0;

  const chartData =
    loanAmount > 0
      ? [
          { name: 'Paid', value: loanAmount - outstanding, color: '#10b981' },
          { name: 'Balance', value: outstanding, color: '#e2e8f0' },
        ]
      : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];

  return (
    <div className="space-y-4 pb-6 relative">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-celestial-indigo" />
            Loans &amp; Advances
          </h1>
          <p className="text-silver-mist text-sm">
            Manage your loans, track repayments, and request advances.
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {employeeLoans.length === 0 ? (
        <div className="bg-white dark:bg-stellar-blue p-8 rounded-2xl border border-cloud dark:border-nebula-purple/50 text-center">
          <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No loans or advances found.</p>
          <p className="text-xs text-slate-300 mt-1">Submit a new loan request to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Active Loan Details */}
          <div className="lg:col-span-2 space-y-4">
            {activeLoan && (
              <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-3 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-ink-black dark:text-pearl">
                        {activeLoan.schemeName || activeLoan.loanType || 'Loan'}
                      </h2>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase rounded">
                        {activeLoan.status}
                      </span>
                    </div>
                    <div className="text-sm text-silver-mist mb-6">
                      {activeLoan.loanCode || activeLoan.id?.substring(0, 12)}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-silver-mist uppercase font-bold">
                          Total Loan
                        </div>
                        <div className="text-lg font-bold text-ink-black dark:text-pearl">
                          ${loanAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-silver-mist uppercase font-bold">
                          Outstanding
                        </div>
                        <div className="text-lg font-bold text-rose-500">
                          ${outstanding.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-silver-mist uppercase font-bold">
                          Monthly EMI
                        </div>
                        <div className="text-lg font-bold text-ink-black dark:text-pearl">
                          ${emiAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-silver-mist uppercase font-bold">Tenure</div>
                        <div className="text-lg font-bold text-ink-black dark:text-pearl">
                          {activeLoan.tenureMonths || activeLoan.tenure || '--'} Months
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-40 h-40 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={60}
                          outerRadius={75}
                          paddingAngle={0}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-emerald-500">
                        {Math.round(paidPercentage)}%
                      </span>
                      <span className="text-[10px] text-silver-mist uppercase">Paid</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Loans */}
            <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-cloud dark:border-nebula-purple/20">
                <h3 className="font-bold text-ink-black dark:text-pearl">All Loans</h3>
              </div>
              <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
                {employeeLoans.map((loan: any) => (
                  <div
                    key={loan.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          loan.status === 'active' || loan.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-ink-black dark:text-pearl">
                          {loan.schemeName || loan.loanType || 'Loan'}
                        </div>
                        <div className="text-xs text-silver-mist">
                          {loan.loanCode || loan.id?.substring(0, 12)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-ink-black dark:text-pearl">
                        $
                        {Number(
                          loan.loanAmount || loan.principalAmount || loan.amount || 0
                        ).toLocaleString()}
                      </div>
                      <div
                        className={`text-[10px] font-bold uppercase ${
                          loan.status === 'active' || loan.status === 'Active'
                            ? 'text-emerald-500'
                            : loan.status === 'pending' || loan.status === 'Pending'
                              ? 'text-amber-500'
                              : 'text-slate-400'
                        }`}
                      >
                        {loan.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-celestial-indigo to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <h3 className="font-bold text-lg mb-1">Available Schemes</h3>
              <p className="text-indigo-100 text-xs mb-4">Loan schemes you can apply for.</p>

              <div className="space-y-3">
                {schemes.length === 0 ? (
                  <p className="text-indigo-200 text-sm">No loan schemes available.</p>
                ) : (
                  schemes.map((scheme: any, i: number) => (
                    <div
                      key={scheme.id || i}
                      className="bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm">
                          {scheme.schemeName || scheme.name}
                        </span>
                        <ArrowRight className="w-4 h-4 text-indigo-200" />
                      </div>
                      <div className="flex justify-between text-xs text-indigo-100">
                        <span>
                          Max: $
                          {Number(scheme.maxAmount || scheme.maxLoanAmount || 0).toLocaleString()}
                        </span>
                        <span>{scheme.interestRate || 0}% p.a.</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Requests */}
            {pendingLoans.length > 0 && (
              <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Pending Requests</h3>
                {pendingLoans.map((loan: any) => (
                  <div
                    key={loan.id}
                    className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl mb-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-ink-black dark:text-pearl">
                        {loan.schemeName || loan.loanType || 'Loan'}
                      </div>
                      <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                    <div className="text-xs text-silver-mist mb-3">
                      Amount: $
                      {Number(loan.loanAmount || loan.principalAmount || 0).toLocaleString()}
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-amber-500"></div>
                    </div>
                    <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-400 text-center font-medium">
                      Under Review
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Loan Request</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Scheme (optional)</span>
                <select
                  value={form.schemeId}
                  onChange={(e) => setForm({ ...form, schemeId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                >
                  <option value="">-- None --</option>
                  {schemes.map((scheme: any) => (
                    <option key={scheme.id} value={scheme.id}>
                      {scheme.schemeName || scheme.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Employee ID</span>
                <input
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Loan Type</span>
                <select
                  value={form.loanType}
                  onChange={(e) => setForm({ ...form, loanType: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                >
                  <option value="personal">Personal</option>
                  <option value="housing">Housing</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="education">Education</option>
                  <option value="emergency">Emergency</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Principal Amount</span>
                <input
                  type="number"
                  value={form.principalAmount}
                  onChange={(e) => setForm({ ...form, principalAmount: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Interest Rate (%)</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.interestRate}
                  onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Tenure (Months)</span>
                <input
                  type="number"
                  value={form.tenureMonths}
                  onChange={(e) => setForm({ ...form, tenureMonths: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Purpose</span>
                <input
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
