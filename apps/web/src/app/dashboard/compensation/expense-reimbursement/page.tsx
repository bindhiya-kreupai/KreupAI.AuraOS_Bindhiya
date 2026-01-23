"use client";

import React, { useState } from 'react';
import { Receipt, Plus, Upload, Clock, CheckCircle, XCircle, DollarSign, Filter, FileText } from 'lucide-react';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receipt: boolean;
}

const mockExpenses: Expense[] = [
  { id: '1', date: 'Jan 18, 2025', description: 'Client dinner - Project Alpha', category: 'Meals', amount: 185.50, status: 'pending', receipt: true },
  { id: '2', date: 'Jan 15, 2025', description: 'Uber to client office', category: 'Transport', amount: 42.00, status: 'approved', receipt: true },
  { id: '3', date: 'Jan 12, 2025', description: 'Conference registration', category: 'Training', amount: 599.00, status: 'reimbursed', receipt: true },
  { id: '4', date: 'Jan 10, 2025', description: 'Office supplies', category: 'Supplies', amount: 67.30, status: 'approved', receipt: true },
  { id: '5', date: 'Jan 5, 2025', description: 'Hotel - Business trip', category: 'Travel', amount: 289.00, status: 'reimbursed', receipt: true },
  { id: '6', date: 'Dec 28, 2024', description: 'Software license renewal', category: 'Software', amount: 149.99, status: 'rejected', receipt: false },
];

export default function ExpenseReimbursementPage() {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredExpenses = filterStatus === 'all' ? mockExpenses : mockExpenses.filter(e => e.status === filterStatus);
  const totalPending = mockExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = mockExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const totalReimbursed = mockExpenses.filter(e => e.status === 'reimbursed').reduce((sum, e) => sum + e.amount, 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      case 'approved': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'reimbursed': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'rejected': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'approved': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'reimbursed': return <DollarSign className="w-3.5 h-3.5" />;
      case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Expense Reimbursement</h1>
          <p className="text-sm text-silver-mist mt-1">Submit and track expense claims</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" /> New Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Pending</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">${totalPending.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Approved</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">${totalApproved.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Reimbursed (YTD)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">${totalReimbursed.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Claims</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{mockExpenses.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {['all', 'pending', 'approved', 'reimbursed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
              filterStatus === status
                ? 'bg-celestial-indigo text-white'
                : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist hover:bg-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-deep-cosmos">
                <Receipt className="w-5 h-5 text-celestial-indigo" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{expense.description}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-silver-mist">
                  <span>{expense.date}</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded text-[10px] font-medium">{expense.category}</span>
                  {expense.receipt && <span className="flex items-center gap-0.5"><FileText className="w-3 h-3" /> Receipt</span>}
                </div>
              </div>
              <span className="text-sm font-bold text-ink-black dark:text-pearl">${expense.amount.toFixed(2)}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize flex items-center gap-1 ${getStatusStyle(expense.status)}`}>
                {getStatusIcon(expense.status)} {expense.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-cloud dark:border-nebula-purple/50 rounded-xl p-6 text-center">
        <Upload className="w-8 h-8 text-silver-mist mx-auto mb-2" />
        <p className="text-sm font-medium text-ink-black dark:text-pearl">Drag & drop receipts here</p>
        <p className="text-xs text-silver-mist mt-1">or click to browse. Supported: PDF, JPG, PNG</p>
      </div>
    </div>
  );
}
