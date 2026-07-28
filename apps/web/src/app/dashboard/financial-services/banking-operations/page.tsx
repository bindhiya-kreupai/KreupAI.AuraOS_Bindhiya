'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Landmark, ArrowRightLeft, X } from 'lucide-react';
import { toast } from 'sonner';

// Reusing generic states from components if they exist, or inline them
const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      ))}
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
    <p className="font-bold">Error loading data</p>
    <p className="text-sm">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No transactions found.</p>
  </div>
);

export default function BankingOperationsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [transactionId, setTransactionId] = useState('');
  const [type, setType] = useState('Transfer');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Completed');

  const {
    data: transactions,
    isLoading: isTxLoading,
    error: txError,
  } = useQuery({
    queryKey: ['financialTransactions'],
    queryFn: async () => {
      const res = await fetch('/api/financial-services/banking/transactions');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    },
  });

  const { data: accounts, isLoading: isAccLoading } = useQuery({
    queryKey: ['financialAccounts'],
    queryFn: async () => {
      const res = await fetch('/api/financial-services/banking/accounts');
      if (!res.ok) throw new Error('Failed to fetch accounts');
      return res.json();
    },
  });

  const { data: loans, isLoading: isLoansLoading } = useQuery({
    queryKey: ['financialLoans'],
    queryFn: async () => {
      const res = await fetch('/api/financial-services/banking/loans');
      if (!res.ok) throw new Error('Failed to fetch loans');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newTx: any) => {
      const res = await fetch('/api/financial-services/banking/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
      });
      if (!res.ok) throw new Error('Failed to create transaction');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialTransactions'] });
      toast.success('Transaction created successfully!');
      setIsModalOpen(false);
      setTransactionId('');
      setAmount('');
      setDescription('');
    },
    onError: () => {
      toast.error('Failed to create transaction');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/financial-services/banking/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete transaction');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialTransactions'] });
      toast.success('Transaction deleted');
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!transactionId) {
      toast.error('Please enter a Transaction ID');
      return;
    }

    createMutation.mutate({
      transactionId,
      type,
      amount: Number(amount),
      description: description || 'New Transaction',
      status,
    });
  };

  // Calculate Metrics
  const totalLiquidity =
    accounts?.reduce((sum: number, acc: any) => {
      // Handle if balance is an object with amount, or a direct number
      const bal =
        typeof acc.balance === 'object' && acc.balance !== null ? acc.balance.amount : acc.balance;
      return sum + (Number(bal) || 0);
    }, 0) || 0;

  const activeLoansList =
    loans?.filter((loan: any) => loan.status === 'active' || loan.status === 'Active') || [];
  const activeLoansCount = activeLoansList.length;
  const activeLoansValue = activeLoansList.reduce((sum: number, loan: any) => {
    return sum + (Number(loan.currentBalance) || Number(loan.principalAmount) || 0);
  }, 0);

  const formatCurrency = (val: number) => {
    if (val === 0) return '$0.00';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isMetricsLoading = isAccLoading || isLoansLoading;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="w-6 h-6 text-indigo-500" />
            Banking Operations
          </h1>
          <p className="text-slate-500 text-sm">
            Monitor core banking transactions, liquidity, and branches.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" /> New Transfer
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Total Liquidity</div>
          <div className="text-3xl font-bold text-indigo-600">
            {isMetricsLoading ? '...' : formatCurrency(totalLiquidity)}
          </div>
          <div className="text-xs text-emerald-500 font-bold mt-1">Based on active accounts</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Active Loans</div>
          <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
            {isMetricsLoading ? '...' : formatCurrency(activeLoansValue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{activeLoansCount} Active Accounts</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Daily Transactions</div>
          <div className="text-3xl font-bold text-emerald-600">
            {isTxLoading ? '...' : transactions?.length || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Total recorded volume</div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex-1">
        <h3 className="font-bold text-lg mb-4">Recent Transactions</h3>

        {isTxLoading && <Skeleton />}

        {txError && <ErrorState message={(txError as Error).message} />}

        {!isTxLoading && !txError && transactions?.length === 0 && <EmptyState />}

        {!isTxLoading && !txError && transactions?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((row: any) => (
                  <tr
                    key={row.transactionId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-4 font-mono text-slate-500">{row.transactionId}</td>
                    <td className="px-6 py-4 font-bold">{row.type}</td>
                    <td className="px-6 py-4 font-mono">${Number(row.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          row.status.toLowerCase() === 'completed'
                            ? 'bg-emerald-100 text-emerald-600'
                            : row.status.toLowerCase() === 'flagged'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteMutation.mutate(row.transactionId)}
                        disabled={deleteMutation.isPending}
                        className="text-rose-500 hover:text-rose-700 font-medium text-xs disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">New Transaction</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-12345"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Transfer">Transfer</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="Loan Disbursement">Loan Disbursement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Monthly Rent"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Completed">Completed</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending">Pending</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Submit Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
