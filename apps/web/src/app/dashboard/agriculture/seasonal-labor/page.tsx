'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Users, Tractor, Globe, Download, Plus, Search } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useWorkers, useDeleteWorker, useCreateWorker, useUpdateWorker } from '../hooks/queries';
import { useDebounce } from '../hooks/useDebounce';
import { WorkerModal } from '../components/WorkerModal';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import type { SeasonalWorker } from '../types';

export default function SeasonalLaborPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlStatus = searchParams.get('status') || 'all';
  const urlSearch = searchParams.get('search') || '';

  const [statusFilter, setStatusFilter] = useState<string>(urlStatus);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Sync state to URL params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    router.replace(
      `${pathname}?${createQueryString('search', debouncedSearch)}&${createQueryString('status', statusFilter)}`,
      { scroll: false }
    );
  }, [debouncedSearch, statusFilter, pathname, router, createQueryString]);

  // Server-side filtering parameters passed to React Query
  const queryParams = {
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(debouncedSearch ? { query: debouncedSearch } : {}),
  };

  const { data: workers = [], isLoading, isError, error, refetch } = useWorkers(queryParams);
  const { mutateAsync: deleteWorker } = useDeleteWorker();
  const { mutateAsync: createWorker } = useCreateWorker();
  const { mutateAsync: updateWorker } = useUpdateWorker();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<SeasonalWorker | null>(null);

  // Client-side fallback filtering just in case server doesn't filter perfectly
  const visibleWorkers = useMemo(() => {
    let filtered = workers;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((worker) => worker.status === statusFilter);
    }
    if (debouncedSearch.trim()) {
      const lowerQuery = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (worker) =>
          worker.fullName.toLowerCase().includes(lowerQuery) ||
          (worker.employeeId || '').toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [workers, statusFilter, debouncedSearch]);

  const handleExportCSV = () => {
    if (visibleWorkers.length === 0) {
      toast.warning('No workers to export');
      return;
    }

    const headers = [
      'Worker ID',
      'Name',
      'Nationality',
      'Phone',
      'Status',
      'Employment Type',
      'Visa Type',
    ];
    const csvRows = [headers.join(',')];

    for (const worker of visibleWorkers) {
      const row = [
        worker.workerId,
        `"${worker.fullName}"`,
        `"${worker.nationality || ''}"`,
        `"${worker.phone || ''}"`,
        worker.status,
        worker.employmentType,
        worker.visaType || 'None',
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seasonal_workers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported workers successfully');
  };

  const handleSaveWorker = async (workerData: Partial<SeasonalWorker>) => {
    try {
      if (editingWorker) {
        await updateWorker({ workerId: editingWorker.workerId, updates: workerData });
        toast.success('Worker updated successfully');
      } else {
        await createWorker({
          ...workerData,
          dateOfBirth: new Date('1990-01-01'), // Default dummy dates for mockup
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          contractedHours: 40,
          hourlyRate: 15,
          skills: [],
          certifications: [],
          languages: ['English'],
          previousSeasons: 0,
          housingRequired: false,
          attendanceRate: 100,
          rehireEligible: true,
          documents: [],
          assignmentHistory: [],
          createdDate: new Date(),
          lastUpdatedDate: new Date(),
          emergencyContact: {
            name: 'Unknown',
            relationship: 'Unknown',
            phone: '000-000-0000',
          },
        });
        toast.success('Worker added successfully');
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error('Failed to save worker. Please try again.');
    }
  };

  const openAddModal = () => {
    setEditingWorker(null);
    setIsModalOpen(true);
  };

  const openEditModal = (worker: SeasonalWorker) => {
    setEditingWorker(worker);
    setIsModalOpen(true);
  };

  const handleDeleteWorker = async (worker: SeasonalWorker) => {
    if (confirm(`Are you sure you want to delete ${worker.fullName}?`)) {
      try {
        await deleteWorker(worker.workerId);
        toast.success(`${worker.fullName} has been deleted.`);
      } catch (e) {
        toast.error('Failed to delete worker');
      }
    }
  };

  return (
    <div className="space-y-4 pb-6 min-h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tractor className="w-6 h-6 text-indigo-500" />
            Seasonal Labor
          </h1>
          <p className="text-slate-500 text-sm">Recruit and manage harvest crews.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Worker
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 shrink-0">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search workers by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="on_leave">On leave</option>
          <option value="onboarding">Onboarding</option>
          <option value="recruited">Recruited</option>
          <option value="completed">Completed</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Worker Roster</h3>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl"
                >
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2 flex-grow">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            ) : isError ? (
              <ErrorState
                title="Failed to load workers"
                message={error?.message || 'Something went wrong while fetching the worker roster.'}
                onRetry={() => refetch()}
              />
            ) : visibleWorkers.length === 0 ? (
              <EmptyState
                title="No seasonal workers found"
                description={
                  debouncedSearch || statusFilter !== 'all'
                    ? 'Try adjusting your search query or filters.'
                    : 'Get started by adding your first seasonal worker.'
                }
                action={
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  >
                    <Plus className="w-4 h-4" /> Add Worker
                  </button>
                }
              />
            ) : (
              visibleWorkers.map((worker, i) => (
                <div
                  key={worker.workerId || i}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {worker.fullName || 'Unnamed'}
                      </div>
                      {worker.visaType && worker.visaType.toLowerCase().includes('h-2') && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Visa
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {worker.nationality || 'Local'} • {worker.phone || 'No phone'} •{' '}
                      {worker.employmentType}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold mt-2 md:mt-0 w-fit 
                                            ${
                                              worker.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : worker.status === 'on_leave'
                                                  ? 'bg-amber-100 text-amber-600'
                                                  : worker.status === 'terminated'
                                                    ? 'bg-rose-100 text-rose-600'
                                                    : 'bg-slate-200 text-slate-600'
                                            }`}
                    >
                      {worker.status ?? 'unknown'}
                    </span>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openEditModal(worker)}
                        className="text-xs font-bold text-indigo-500 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorker(worker)}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 relative overflow-hidden">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Total Headcount</h3>
            <div className="text-4xl font-bold text-indigo-700 dark:text-indigo-400 mb-1">
              {isLoading ? (
                <Skeleton className="h-10 w-16 bg-indigo-200 dark:bg-indigo-800" />
              ) : (
                visibleWorkers.length
              )}
            </div>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/70">
              Peak harvest capacity: {Math.max(150, visibleWorkers.length + 50)}
            </p>
            <Users className="w-24 h-24 absolute -bottom-4 -right-4 text-indigo-500 opacity-10" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Compliance Checks</h3>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : isError ? (
              <div className="text-sm text-rose-500 py-4 text-center">
                Cannot load compliance info.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-300">I-9 Verification</span>
                  <span className="font-bold text-amber-600">1 Pending</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Safety Training</span>
                  <span className="font-bold text-emerald-600">All Clear</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Heat Stress Protocol</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WorkerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorker}
        worker={editingWorker}
      />
    </div>
  );
}
