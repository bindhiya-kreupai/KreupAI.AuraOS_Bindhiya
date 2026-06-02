"use client";

import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Upload, Clock, CheckCircle, XCircle, DollarSign, Filter, FileText, Loader2 } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface Expense {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed' | 'paid';
  receiptUrl: string | null;
}

export default function ExpenseReimbursementPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await APIClient.get<Expense[]>('/compensation/expense-claims');
      setExpenses(data);
    } catch (error: any) {
      console.error('Error fetching expense claims:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Normalize statuses: map 'paid' to 'reimbursed' for display consistency
  const normalizeStatus = (status: string): string => {
    if (status === 'paid') return 'reimbursed';
    return status;
  };

  const filteredExpenses = filterStatus === 'all'
    ? expenses
    : expenses.filter(e => normalizeStatus(e.status) === filterStatus);

  const totalPending = expenses
    .filter(e => normalizeStatus(e.status) === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = expenses
    .filter(e => normalizeStatus(e.status) === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalReimbursed = expenses
    .filter(e => normalizeStatus(e.status) === 'reimbursed')
    .reduce((sum, e) => sum + e.amount, 0);

  const getStatusStyle = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'pending': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      case 'approved': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'reimbursed': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'rejected': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'approved': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'reimbursed': return <DollarSign className="w-3.5 h-3.5" />;
      case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Expense Reimbursement</h1>
          <p className="text-sm text-silver-mist mt-1">Submit and track expense claims</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" /> New Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{expenses.length}</p>
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
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No expense claims found.</p>
            <p className="text-xs text-slate-300 mt-1">Click "New Expense" to submit a claim.</p>
          </div>
        ) : (
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-deep-cosmos">
                  <Receipt className="w-5 h-5 text-celestial-indigo" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{expense.title || expense.description || '--'}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-silver-mist">
                    <span>{formatDate(expense.date)}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded text-[10px] font-medium capitalize">{expense.category?.toLowerCase()}</span>
                    {expense.receiptUrl && <span className="flex items-center gap-0.5"><FileText className="w-3 h-3" /> Receipt</span>}
                  </div>
                </div>
                <span className="text-sm font-bold text-ink-black dark:text-pearl">${expense.amount.toFixed(2)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize flex items-center gap-1 ${getStatusStyle(expense.status)}`}>
                  {getStatusIcon(expense.status)} {normalizeStatus(expense.status)}
                </span>
              </div>
            ))}
          </div>
        )}
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

