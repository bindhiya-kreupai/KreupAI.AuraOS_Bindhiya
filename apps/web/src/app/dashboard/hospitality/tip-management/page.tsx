'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Users, Wallet, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No tip pools processed yet. Click "Process Payout" to start.</p>
  </div>
);

export default function TipManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState('3450');

  const { data, isLoading, error } = useQuery({
    queryKey: ['tipPools'],
    queryFn: async () => {
      const res = await fetch('/api/hospitality/tip-management');
      if (!res.ok) throw new Error('Failed to fetch tip pools');
      return res.json();
    },
  });

  const tipPools = data?.pools || [];

  // Get the most recent tip pool to display in the UI (Today's pool)
  const activePool = tipPools.length > 0 ? tipPools[0] : null;

  const createMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await fetch('/api/hospitality/tip-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalAmount: amount }),
      });
      if (!res.ok) throw new Error('Failed to process tip pool');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipPools'] });
      toast.success('Tip Payout Processed Successfully!');
      setIsModalOpen(false);
      setTotalAmount('');
    },
    onError: () => {
      toast.error('Failed to process tip pool');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/hospitality/tip-management/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete tip pool');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipPools'] });
      toast.success('Tip pool record deleted');
    },
    onError: () => {
      toast.error('Failed to delete record');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(totalAmount);
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-500" />
            Tip Management
          </h1>
          <p className="text-slate-500 text-sm">Distribute gratuities fairly and transparently.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" /> Process Payout
        </button>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl font-bold">
          Error loading tip data
        </div>
      ) : tipPools.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">Daily Pool (Latest)</h3>
              <button
                onClick={() => deleteMutation.mutate(activePool.id)}
                className="text-rose-500 hover:text-rose-700 transition"
                title="Delete Latest Pool"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-5xl font-bold text-emerald-600 mb-2">
                ${activePool.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-slate-500">Total Collected Tips</div>
            </div>
            <div className="space-y-3 mt-auto">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Method</span>
                <span className="font-bold">{activePool.distributionMethod}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Processed On</span>
                <span className="font-bold">{new Date(activePool.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Distribution Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Points</th>
                    <th className="px-4 py-3">Staff Count</th>
                    <th className="px-4 py-3">Share %</th>
                    <th className="px-4 py-3 text-right">Per Person</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activePool.distributions?.map((group: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-bold">{group.role}</td>
                      <td className="px-4 py-3">{group.points}</td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        {group.count}
                      </td>
                      <td className="px-4 py-3">{group.share}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        {group.per}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Process Tip Payout</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total Tips Collected ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-mono text-lg"
                  placeholder="e.g. 3450.00"
                />
                <p className="text-xs text-slate-500 mt-2">
                  This amount will be automatically distributed according to the standard points
                  system.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
