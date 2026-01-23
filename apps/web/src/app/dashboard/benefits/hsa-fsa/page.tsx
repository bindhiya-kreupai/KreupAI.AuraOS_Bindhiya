"use client";

import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Account {
  type: 'HSA' | 'FSA';
  balance: number;
  annualLimit: number;
  contributed: number;
  employerContribution: number;
  spent: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'expense' | 'contribution';
  category: string;
}

const accounts: Account[] = [
  { type: 'HSA', balance: 4250, annualLimit: 4150, contributed: 3200, employerContribution: 1000, spent: 950 },
  { type: 'FSA', balance: 1800, annualLimit: 3050, contributed: 2500, employerContribution: 0, spent: 700 },
];

const transactions: Transaction[] = [
  { id: '1', date: 'Jan 15, 2025', description: 'Dr. Smith - Annual Checkup', amount: -150, type: 'expense', category: 'Medical' },
  { id: '2', date: 'Jan 10, 2025', description: 'Payroll Contribution', amount: 200, type: 'contribution', category: 'HSA' },
  { id: '3', date: 'Jan 5, 2025', description: 'CVS Pharmacy', amount: -45, type: 'expense', category: 'Prescription' },
  { id: '4', date: 'Dec 28, 2024', description: 'Vision Center - Eye Exam', amount: -120, type: 'expense', category: 'Vision' },
  { id: '5', date: 'Dec 26, 2024', description: 'Payroll Contribution', amount: 200, type: 'contribution', category: 'HSA' },
];

export default function HsaFsaPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">HSA & FSA Accounts</h1>
        <p className="text-sm text-silver-mist mt-1">Manage your Health Savings and Flexible Spending Accounts</p>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <div key={account.type} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${account.type === 'HSA' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                  <DollarSign className={`w-5 h-5 ${account.type === 'HSA' ? 'text-emerald-500' : 'text-blue-500'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink-black dark:text-pearl">{account.type} Account</h3>
                  <p className="text-[10px] text-silver-mist">{account.type === 'HSA' ? 'Health Savings Account' : 'Flexible Spending Account'}</p>
                </div>
              </div>
              <CreditCard className="w-5 h-5 text-silver-mist" />
            </div>
            <p className="text-3xl font-bold text-ink-black dark:text-pearl">${account.balance.toLocaleString()}</p>
            <p className="text-xs text-silver-mist mt-1">Available Balance</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-silver-mist">Annual Limit</span>
                <span className="font-medium text-ink-black dark:text-pearl">${account.annualLimit.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${account.type === 'HSA' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min((account.contributed / account.annualLimit) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-silver-mist">
                <span>Contributed: ${account.contributed.toLocaleString()}</span>
                <span>Remaining: ${(account.annualLimit - account.contributed).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-cloud dark:border-nebula-purple/50">
              <div className="text-center">
                <p className="text-xs text-silver-mist">Your Contribution</p>
                <p className="text-sm font-bold text-ink-black dark:text-pearl mt-0.5">${(account.contributed - account.employerContribution).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-silver-mist">Employer</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">${account.employerContribution.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-silver-mist">Spent</p>
                <p className="text-sm font-bold text-sunset-amber mt-0.5">${account.spent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Recent Transactions</h3>
          <button className="text-xs text-celestial-indigo font-medium hover:underline">View All</button>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-5 py-3">
              <div className={`p-2 rounded-lg ${tx.type === 'contribution' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                {tx.type === 'contribution' ? (
                  <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-silver-mist">
                  <span>{tx.date}</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded text-[10px]">{tx.category}</span>
                </div>
              </div>
              <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-ink-black dark:text-pearl'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo transition-colors text-left">
          <Receipt className="w-5 h-5 text-celestial-indigo mb-2" />
          <p className="text-sm font-medium text-ink-black dark:text-pearl">Submit Claim</p>
          <p className="text-xs text-silver-mist mt-0.5">File a new reimbursement</p>
        </button>
        <button className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo transition-colors text-left">
          <TrendingUp className="w-5 h-5 text-celestial-indigo mb-2" />
          <p className="text-sm font-medium text-ink-black dark:text-pearl">Change Contribution</p>
          <p className="text-xs text-silver-mist mt-0.5">Adjust payroll deductions</p>
        </button>
        <button className="p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo transition-colors text-left">
          <CreditCard className="w-5 h-5 text-celestial-indigo mb-2" />
          <p className="text-sm font-medium text-ink-black dark:text-pearl">Order New Card</p>
          <p className="text-xs text-silver-mist mt-0.5">Request a replacement debit card</p>
        </button>
      </div>
    </div>
  );
}
