'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Calendar, DollarSign, UserPlus, Loader2, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No locum providers found. Add one to get started.</p>
  </div>
);

export default function LocumManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [providerName, setProviderName] = useState('');
  const [specialty, setSpecialty] = useState('Emergency Medicine');
  const [hourlyRate, setHourlyRate] = useState('150');

  const { data, isLoading, error } = useQuery({
    queryKey: ['locumProviders'],
    queryFn: async () => {
      const res = await fetch('/api/healthcare/locum-management');
      if (!res.ok) throw new Error('Failed to fetch locum providers');
      return res.json();
    },
  });

  const locumProviders = data?.locums || [];

  const createMutation = useMutation({
    mutationFn: async (newProvider: any) => {
      const res = await fetch('/api/healthcare/locum-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider),
      });
      if (!res.ok) throw new Error('Failed to create provider');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locumProviders'] });
      toast.success('Locum Provider added successfully!');
      setIsModalOpen(false);
      setProviderName('');
      setHourlyRate('150');
    },
    onError: () => {
      toast.error('Failed to create provider');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/healthcare/locum-management/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete provider');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locumProviders'] });
      toast.success('Locum provider deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete provider');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      providerName,
      specialty,
      hourlyRate: parseFloat(hourlyRate),
      status: 'confirmed',
      performanceRating: 4.5,
      assignments: [
        {
          assignmentId: `A-${Date.now()}`,
          facility: 'Main Hospital',
          specialty,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
          rate: parseFloat(hourlyRate),
          totalHours: 160,
          totalCompensation: 160 * parseFloat(hourlyRate),
          status: 'confirmed',
        },
      ],
    });
  };

  // Flatten assignments
  const allAssignments: any[] = [];
  locumProviders.forEach((p: any) => {
    (p.assignments || []).forEach((a: any) => {
      allAssignments.push({ ...a, providerId: p.id, providerName: p.providerName });
    });
  });

  const totalBudgetUsage = allAssignments.reduce((acc, a) => acc + (a.totalCompensation || 0), 0);
  const averageRating =
    locumProviders.length > 0
      ? locumProviders.reduce((acc: number, p: any) => acc + (p.performanceRating || 0), 0) /
        locumProviders.length
      : 0;

  return (
    <div className="space-y-4 pb-6 relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Locum Management
          </h1>
          <p className="text-slate-500 text-sm">
            Fill temporary vacancies and manage agency staff.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Request Locum
        </button>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl font-bold">
          Error loading providers
        </div>
      ) : locumProviders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Current Assignments</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {allAssignments.map((assignment, i) => (
                <div
                  key={assignment.assignmentId || i}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center group relative"
                >
                  <div>
                    <div className="font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                      {assignment.providerName}
                    </div>
                    <div className="font-bold text-sm">
                      {assignment.specialty} @ {assignment.facility}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" />{' '}
                      {new Date(assignment.startDate).toLocaleDateString()} -{' '}
                      {new Date(assignment.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
                      <DollarSign className="w-3 h-3" /> ${assignment.rate}/hr
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        assignment.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-600'
                          : assignment.status === 'pending'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-indigo-100 text-indigo-600'
                      }`}
                    >
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate(assignment.providerId)}
                      className="text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition p-1"
                      title="Remove Locum"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {allAssignments.length === 0 && (
                <div className="text-center py-10 text-slate-400">No locum assignments found.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Agency Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-500">
                    Total Compensation Commit
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    $
                    {totalBudgetUsage.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${Math.min((totalBudgetUsage / 100000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-500">
                    Average Provider Performance
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {(averageRating * 20).toFixed(1)}% Fill Satisfaction
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(averageRating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Request Locum Provider</h2>
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
                  Provider Name
                </label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specialty
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                >
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Anesthesiology">Anesthesiology</option>
                  <option value="Radiology">Radiology</option>
                  <option value="General Surgery">General Surgery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  required
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                />
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
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
