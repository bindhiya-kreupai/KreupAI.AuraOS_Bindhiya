'use client';

import React, { useMemo, useState } from 'react';
import { Users, Tractor, Globe, Download, Plus, Search } from 'lucide-react';
import { useAgriculture } from '../hooks/useAgriculture';
import { ToastContainer } from '../components/Toast';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { WorkerModal } from '../components/WorkerModal';
import type { SeasonalWorker } from '../types';

export default function SeasonalLaborPage() {
  const {
    workers,
    loading,
    toasts,
    addToast,
    removeToast,
    loadWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
  } = useAgriculture();

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'on_leave' | 'onboarding' | 'recruited' | 'completed' | 'terminated'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<SeasonalWorker | null>(null);

  const visibleWorkers = useMemo(() => {
    let filtered = workers;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((worker) => worker.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (worker) =>
          worker.fullName.toLowerCase().includes(lowerQuery) ||
          (worker.employeeId || '').toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [workers, statusFilter, searchQuery]);

  const handleExportCSV = () => {
    if (workers.length === 0) {
      addToast({ type: 'warning', message: 'No workers to export' });
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

    for (const worker of workers) {
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
    addToast({ type: 'success', message: 'Exported workers successfully' });
  };

  const handleSaveWorker = async (workerData: Partial<SeasonalWorker>) => {
    if (editingWorker) {
      await updateWorker(editingWorker.workerId, workerData);
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

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {loading && <LoadingOverlay message="Loading agriculture data..." />}

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
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
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
            {visibleWorkers.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">
                No workers found for the current search and filters.
              </div>
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
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete ${worker.fullName}?`)) {
                            try {
                              await deleteWorker(worker.workerId);
                            } catch (e) {
                              addToast({ type: 'error', message: 'Failed to delete worker' });
                            }
                          }
                        }}
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
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Total Headcount</h3>
            <div className="text-4xl font-bold text-indigo-700 dark:text-indigo-400 mb-1">
              {workers.length}
            </div>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/70">
              Peak harvest capacity: {Math.max(150, workers.length + 50)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Compliance Checks</h3>
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
          </div>
        </div>
      </div>

      <WorkerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorker}
        worker={editingWorker}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
