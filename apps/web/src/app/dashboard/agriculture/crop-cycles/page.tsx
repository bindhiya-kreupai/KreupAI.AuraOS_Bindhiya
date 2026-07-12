'use client';

import React, { useState, useMemo } from 'react';
import { Sprout, Calendar, CloudRain, BarChart3, Download, Plus, Search } from 'lucide-react';
import { useAgriculture } from '../hooks/useAgriculture';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { CropCycleModal } from '../components/CropCycleModal';
import type { CropCycle } from '../types';

export default function CropCyclesPage() {
  const {
    cropCycles,
    harvestSchedules,
    loading,
    toasts,
    removeToast,
    addToast,
    createCropCycle,
    updateCropCycle,
    deleteCropCycle,
  } = useAgriculture();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<CropCycle | null>(null);

  const visibleCycles = useMemo(() => {
    let filtered = cropCycles;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.cropName.toLowerCase().includes(lowerQuery) ||
          c.cropType.toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [cropCycles, searchQuery]);

  const handleExportCSV = () => {
    if (cropCycles.length === 0) {
      addToast({ type: 'warning', message: 'No crop cycles to export' });
      return;
    }

    const headers = [
      'Cycle ID',
      'Crop Name',
      'Type',
      'Stage',
      'Status',
      'Total Acreage',
      'Expected Yield',
    ];
    const csvRows = [headers.join(',')];

    for (const cycle of cropCycles) {
      const row = [
        cycle.cycleId,
        `"${cycle.cropName}"`,
        cycle.cropType,
        cycle.currentStage,
        cycle.status,
        cycle.totalAcreage,
        cycle.expectedYield,
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crop_cycles_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Exported crop cycles successfully' });
  };

  const handleSaveCycle = async (data: Partial<CropCycle>) => {
    if (editingCycle) {
      await updateCropCycle(editingCycle.cycleId, data);
    } else {
      await createCropCycle({
        ...data,
        farm: 'Main Farm',
        farmId: 'F-001',
        fields: [],
        plantingDate: new Date(),
        expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        cycleDuration: 90,
        growingSeason: 'Current Season',
        stages: [],
        laborRequirements: [],
        peakLaborNeed: 50,
        currentLaborAssigned: 0,
        yieldUnit: 'lbs',
        weatherImpact: [],
        irrigationRequired: true,
        seedCost: 500,
        laborCost: 2000,
        irrigationCost: 300,
        fertilizerCost: 600,
        pesticideCost: 400,
        equipmentCost: 800,
        totalCost: 4600,
        expectedRevenue: 15000,
        cropHealth: 'good',
        diseasePresent: false,
        pestPresent: false,
        issues: [],
        risks: [],
        createdDate: new Date(),
        lastUpdatedDate: new Date(),
      });
    }
  };

  const openAddModal = () => {
    setEditingCycle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cycle: CropCycle) => {
    setEditingCycle(cycle);
    setIsModalOpen(true);
  };

  const calculateProgress = (cycle: CropCycle) => {
    const completedStages = cycle.stages?.filter((stage) => stage.completed).length ?? 0;
    const totalStages = cycle.stages?.length ?? 1;
    return totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {loading && <LoadingOverlay message="Loading crop cycle data..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sprout className="w-6 h-6 text-indigo-500" />
            Crop Cycles
          </h1>
          <p className="text-slate-500 text-sm">Monitor growth stages and harvest windows.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-900/30">
            <Calendar className="w-4 h-4" /> {cropCycles.length} Active Cycles
          </div>
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
            <Plus className="w-4 h-4" /> Add Cycle
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop cycles by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full overflow-y-auto pb-10">
        {visibleCycles.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-8 col-span-2">
            No crop cycles found.
          </div>
        ) : (
          visibleCycles.map((cycle) => (
            <div
              key={cycle.cycleId || cycle.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{cycle.cropName}</h3>
                  <div className="text-sm text-slate-500">
                    {cycle.cropType} • {cycle.totalAcreage} acres
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase">Stage</span>
                  <span className="font-bold text-indigo-600">
                    {cycle.currentStage || 'Planned'}
                  </span>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-300">Harvest window</span>
                <span className="text-slate-500">
                  {cycle.expectedHarvestDate
                    ? new Date(cycle.expectedHarvestDate).toLocaleDateString()
                    : 'TBD'}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${calculateProgress(cycle)}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-3">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600">
                    <CloudRain className="w-3.5 h-3.5" /> Log
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600">
                    <BarChart3 className="w-3.5 h-3.5" /> Yield
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => openEditModal(cycle)}
                    className="text-xs font-bold text-indigo-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete the ${cycle.cropName} cycle?`)) {
                        try {
                          await deleteCropCycle(cycle.cycleId);
                        } catch (e) {
                          addToast({ type: 'error', message: 'Failed to delete cycle' });
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shrink-0 mt-4">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-500" /> Upcoming Harvests
        </h3>
        {harvestSchedules.length === 0 ? (
          <div className="text-sm text-slate-500">No harvest schedules available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {harvestSchedules.slice(0, 3).map((schedule) => (
              <div
                key={schedule.scheduleId || schedule.id}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50"
              >
                <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                  <span>{schedule.cropName || 'Crop'}</span>
                  <span>
                    {schedule.plannedStartDate
                      ? new Date(schedule.plannedStartDate).toLocaleDateString()
                      : 'TBD'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Target Yield: {schedule.targetYield || '0'} • {schedule.totalAcreage || '0'} acres
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CropCycleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCycle}
        cycle={editingCycle}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
