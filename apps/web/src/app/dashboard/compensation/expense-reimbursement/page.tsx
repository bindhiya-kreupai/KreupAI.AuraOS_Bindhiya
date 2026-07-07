'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Loader2,
  X,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

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

interface ExpenseForm {
  title: string;
  category: string;
  amount: string;
  date: string;
  description: string;
  receiptUrl: string;
}

const EMPTY_FORM: ExpenseForm = {
  title: '',
  category: 'Travel',
  amount: '',
  date: '',
  description: '',
  receiptUrl: '',
};

const CATEGORY_OPTIONS = ['Travel', 'Meals', 'Accommodation', 'Supplies', 'Other'];

export default function ExpenseReimbursementPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ExpenseForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await APIClient.get('/compensation/expense-claims');
      setExpenses(APIClient.unwrapList<Expense>(res));
    } catch (err: any) {
      console.error('Error fetching expense claims:', err);
      error('Failed to load expense claims');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('You must be signed in to submit an expense');
      return;
    }
    if (!form.title || !form.amount || !form.date) {
      error('Title, amount and date are required');
      return;
    }
    setSubmitting(true);
    try {
      await APIClient.post('/compensation/expense-claims', {
        employeeId: user.employeeId,
        title: form.title,
        description: form.description,
        amount: Number(form.amount) || 0,
        category: form.category,
        date: form.date,
        receiptUrl: form.receiptUrl || null,
      });
      success('Expense claim submitted');
      setModalOpen(false);
      setForm(EMPTY_FORM);
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to submit expense claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (id: string, status: 'approved' | 'rejected') => {
    setActioningId(id);
    try {
      await APIClient.put('/compensation/expense-claims', {
        id,
        status,
        ...(status === 'rejected' ? { rejectionReason: 'Rejected' } : {}),
      });
      success(status === 'approved' ? 'Expense approved' : 'Expense rejected');
      await fetchData();
    } catch (err) {
      console.error(err);
      error('Failed to update expense claim');
    } finally {
      setActioningId(null);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (modalOpen) {
      setForm((prev) => ({ ...prev, receiptUrl: file.name }));
      success(`Receipt "${file.name}" attached`);
    } else {
      success('Attach receipts when creating an expense');
    }
    e.target.value = '';
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
        You must be signed in to view expense claims.
      </div>
    );
  }

  // Normalize statuses: map 'paid' to 'reimbursed' for display consistency
  const normalizeStatus = (status: string): string => {
    if (status === 'paid') return 'reimbursed';
    return status;
  };

  const filteredExpenses =
    filterStatus === 'all'
      ? expenses
      : expenses.filter((e) => normalizeStatus(e.status) === filterStatus);

  const totalPending = expenses
    .filter((e) => normalizeStatus(e.status) === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = expenses
    .filter((e) => normalizeStatus(e.status) === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalReimbursed = expenses
    .filter((e) => normalizeStatus(e.status) === 'reimbursed')
    .reduce((sum, e) => sum + e.amount, 0);

  const getStatusStyle = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'pending':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      case 'approved':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'reimbursed':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'rejected':
        return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />;
      case 'approved':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'reimbursed':
        return <DollarSign className="w-3.5 h-3.5" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return null;
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
    <div className="space-y-4 pb-6 relative">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
            Expense Reimbursement
          </h1>
          <p className="text-sm text-silver-mist mt-1">Submit and track expense claims</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors"
        >
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
          <p className="text-2xl font-bold text-celestial-indigo mt-1">
            ${totalApproved.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Reimbursed (YTD)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">${totalReimbursed.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Claims</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">
            {expenses.length}
          </p>
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
            <p className="text-xs text-slate-300 mt-1">
              Click &quot;New Expense&quot; to submit a claim.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-deep-cosmos">
                  <Receipt className="w-5 h-5 text-celestial-indigo" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    {expense.title || expense.description || '--'}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-silver-mist">
                    <span>{formatDate(expense.date)}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-deep-cosmos rounded text-[10px] font-medium capitalize">
                      {expense.category?.toLowerCase()}
                    </span>
                    {expense.receiptUrl && (
                      <span className="flex items-center gap-0.5">
                        <FileText className="w-3 h-3" /> Receipt
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-ink-black dark:text-pearl">
                  ${expense.amount.toFixed(2)}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize flex items-center gap-1 ${getStatusStyle(expense.status)}`}
                >
                  {getStatusIcon(expense.status)} {normalizeStatus(expense.status)}
                </span>
                {normalizeStatus(expense.status) === 'pending' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDecision(expense.id, 'approved')}
                      disabled={actioningId === expense.id}
                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      {actioningId === expense.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecision(expense.id, 'rejected')}
                      disabled={actioningId === expense.id}
                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Area */}
      <label className="block border-2 border-dashed border-cloud dark:border-nebula-purple/50 rounded-xl p-6 text-center cursor-pointer hover:border-celestial-indigo/50 transition-colors">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileSelected}
        />
        <Upload className="w-8 h-8 text-silver-mist mx-auto mb-2" />
        <p className="text-sm font-medium text-ink-black dark:text-pearl">
          Drag & drop receipts here
        </p>
        <p className="text-xs text-silver-mist mt-1">
          or click to browse. Supported: PDF, JPG, PNG
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Open &quot;New Expense&quot; first to attach a receipt to a claim.
        </p>
      </label>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">New Expense</h2>
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
                <span className="text-slate-500 font-medium">Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Description</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Receipt</span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 truncate">
                    {form.receiptUrl || 'No file attached'}
                  </span>
                  <span className="px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Browse
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileSelected}
                    />
                  </span>
                </span>
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
                className="px-4 py-2 rounded-lg text-sm font-bold bg-celestial-indigo text-white hover:bg-celestial-indigo/90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
