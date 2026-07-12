'use client';

import React, { useState, useMemo } from 'react';
import { Wrench, Clock, Download, Plus, Search } from 'lucide-react';
import { useAutomotive } from '../hooks/useAutomotive';
import { TechnicianModal } from '../components/TechnicianModal';
import { LoadingOverlay } from '../../agriculture/components/LoadingSpinner'; // reuse spinner
import { ToastContainer } from '../../agriculture/components/Toast'; // reuse toast
import type { Technician } from '../types';

export default function TechnicianRosteringPage() {
  const { technicians, shifts, loading, createTechnician, updateTechnician, deleteTechnician } =
    useAutomotive();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  const [localToasts, setLocalToasts] = useState<any[]>([]);

  const addToast = (toast: { type: string; message: string }) => {
    setLocalToasts((prev) => [...prev, { ...toast, id: Date.now().toString() }]);
  };
  const removeToast = (id: string) => {
    setLocalToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const visibleTechnicians = useMemo(() => {
    let filtered = technicians;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.firstName.toLowerCase().includes(lowerQuery) ||
          t.lastName.toLowerCase().includes(lowerQuery) ||
          t.skillLevel.toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [technicians, searchQuery]);

  const handleExportCSV = () => {
    if (technicians.length === 0) {
      addToast({ type: 'warning', message: 'No technicians to export' });
      return;
    }

    const headers = [
      'Technician ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Skill Level',
      'Employment Type',
      'Status',
    ];
    const csvRows = [headers.join(',')];

    for (const tech of technicians) {
      const row = [
        tech.technicianId,
        `"${tech.firstName}"`,
        `"${tech.lastName}"`,
        `"${tech.email}"`,
        `"${tech.phone}"`,
        tech.skillLevel,
        tech.employmentType,
        tech.status,
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `technicians_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Exported technicians successfully' });
  };

  const handleSaveTechnician = async (data: Partial<Technician>) => {
    if (editingTechnician) {
      await updateTechnician(editingTechnician.technicianId, data);
      addToast({ type: 'success', message: 'Technician updated successfully' });
    } else {
      await createTechnician({
        ...data,
        employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
        certifications: [],
        specializations: [],
        hourlyRate: 35,
        availability: [],
        performanceMetrics: {
          averageJobTime: 60,
          jobsCompleted: 0,
          customerSatisfactionScore: 100,
          qualityScore: 100,
          efficiency: 100,
          comebackRate: 0,
          lastReviewDate: new Date(),
        },
        hireDate: new Date(),
      });
      addToast({ type: 'success', message: 'Technician created successfully' });
    }
  };

  const openAddModal = () => {
    setEditingTechnician(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tech: Technician) => {
    setEditingTechnician(tech);
    setIsModalOpen(true);
  };

  // Filter shifts for today only (mock logic)
  const activeShifts = shifts.slice(0, 5); // Just grab first 5 for UI

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {loading && <LoadingOverlay message="Loading rostering data..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-500" />
            Technician Rostering
          </h1>
          <p className="text-slate-500 text-sm">Schedule service shifts and manage technicians.</p>
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
            <Plus className="w-4 h-4" /> Add Technician
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search technicians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full overflow-y-auto pb-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Technician Roster</h3>
            {visibleTechnicians.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">No technicians found.</div>
            ) : (
              <div className="space-y-4">
                {visibleTechnicians.map((tech) => (
                  <div
                    key={tech.technicianId}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {tech.firstName[0]}
                        {tech.lastName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {tech.firstName} {tech.lastName}
                        </div>
                        <div className="text-sm text-slate-500 capitalize">
                          {tech.skillLevel.replace('_', ' ')} • {tech.department}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 md:mt-0">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${tech.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}
                      >
                        {tech.status}
                      </span>
                      <div className="flex gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                        <button
                          onClick={() => openEditModal(tech)}
                          className="text-xs font-bold text-indigo-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              confirm(
                                `Are you sure you want to delete ${tech.firstName} ${tech.lastName}?`
                              )
                            ) {
                              try {
                                await deleteTechnician(tech.technicianId);
                                addToast({ type: 'success', message: 'Technician deleted' });
                              } catch (e) {
                                addToast({ type: 'error', message: 'Failed to delete' });
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
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Current Shifts</h3>
            <div className="space-y-3">
              {activeShifts.map((shift, i) => (
                <div
                  key={shift.shiftId || i}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      {shift.technicianName}
                    </h4>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${shift.status === 'in_progress' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {shift.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3" /> {shift.startTime} - {shift.endTime} •{' '}
                    {shift.location || 'Service Bay'}
                  </p>
                </div>
              ))}
              {activeShifts.length === 0 && (
                <div className="text-sm text-slate-500">No active shifts right now.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TechnicianModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTechnician}
        technician={editingTechnician}
      />

      <ToastContainer toasts={localToasts} onClose={removeToast} />
    </div>
  );
}
