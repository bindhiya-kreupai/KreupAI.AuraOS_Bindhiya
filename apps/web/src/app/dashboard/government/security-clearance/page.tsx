'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, UserCheck, Search, Lock, PlusCircle, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
    <p className="font-bold">Error loading security clearances</p>
    <p className="text-sm">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No security clearance records found. Create one to get started.</p>
  </div>
);

export default function SecurityClearancePage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('Department of Defense');
  const [position, setPosition] = useState('Analyst');
  const [clearanceLevel, setClearanceLevel] = useState('Secret');

  const {
    data: clearances,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['securityClearances'],
    queryFn: async () => {
      const res = await fetch('/api/government/security-clearance');
      if (!res.ok) throw new Error('Failed to fetch security clearances');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newClearance: any) => {
      const res = await fetch('/api/government/security-clearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClearance),
      });
      if (!res.ok) throw new Error('Failed to create security clearance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityClearances'] });
      toast.success('Security clearance created successfully!');
      setIsModalOpen(false);
      setEmployeeName('');
      setDepartment('Department of Defense');
      setPosition('Analyst');
      setClearanceLevel('Secret');
    },
    onError: () => {
      toast.error('Failed to create security clearance');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/government/security-clearance/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete security clearance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityClearances'] });
      toast.success('Security clearance deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete security clearance');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      employeeName,
      department,
      position,
      clearanceLevel,
      status: 'active',
    });
  };

  // Calculate dynamic stats
  const topSecretCount =
    clearances?.filter((c: any) => c.clearanceLevel?.toLowerCase() === 'top secret').length || 0;
  const secretCount =
    clearances?.filter((c: any) => c.clearanceLevel?.toLowerCase() === 'secret').length || 0;
  const confidentialCount =
    clearances?.filter((c: any) => c.clearanceLevel?.toLowerCase() === 'confidential').length || 0;
  const pendingCount =
    clearances?.filter((c: any) => c.status?.toLowerCase() === 'pending').length || 0;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            Security Clearance
          </h1>
          <p className="text-slate-500 text-sm">Monitor vetting status and access levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search personnel..."
              className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-sm w-64 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> New Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Top Secret',
            count: isLoading ? '...' : topSecretCount,
            color: 'text-rose-500',
            bg: 'bg-rose-500',
          },
          {
            label: 'Secret',
            count: isLoading ? '...' : secretCount,
            color: 'text-amber-500',
            bg: 'bg-amber-500',
          },
          {
            label: 'Confidential',
            count: isLoading ? '...' : confidentialCount,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500',
          },
          {
            label: 'Pending Vetting',
            count: isLoading ? '...' : pendingCount,
            color: 'text-slate-400',
            bg: 'bg-slate-400',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center"
          >
            <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.count}</div>
            <div className="text-sm font-bold text-slate-500 uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col flex-1 min-h-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg">Active Vetting Cases</h3>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {isLoading && <Skeleton />}
          {error && <ErrorState message={(error as Error).message} />}
          {!isLoading && !error && clearances?.length === 0 && <EmptyState />}

          {!isLoading && !error && clearances?.length > 0 && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {clearances.map((clearance: any) => (
                <div
                  key={clearance.clearanceId}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">{clearance.employeeName}</div>
                      <div className="text-xs text-slate-500">
                        {clearance.department} • Target: {clearance.clearanceLevel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mt-4 md:mt-0">
                    <div className="min-w-[150px]">
                      <div className="text-xs font-bold text-slate-400 uppercase">Granted</div>
                      <div className="font-medium text-sm">
                        {new Date(clearance.grantedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="min-w-[100px]">
                      <div className="text-xs font-bold text-slate-400 uppercase">Expiry</div>
                      <div className="text-sm text-slate-500">
                        {new Date(clearance.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        clearance.status.toLowerCase() === 'active'
                          ? 'bg-emerald-100 text-emerald-600'
                          : clearance.status.toLowerCase() === 'pending'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {clearance.status}
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate(clearance.clearanceId)}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                      title="Delete case"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">New Security Clearance</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Department of Defense"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clearance Level
                  </label>
                  <select
                    value={clearanceLevel}
                    onChange={(e) => setClearanceLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Top Secret">Top Secret</option>
                    <option value="Secret">Secret</option>
                    <option value="Confidential">Confidential</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Analyst"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
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
                  {createMutation.isPending ? 'Saving...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
