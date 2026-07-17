'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Sprout, Calendar, CloudRain, BarChart3, Download, Plus, Search } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  useCropCycles,
  useHarvestSchedules,
  useCreateCropCycle,
  useUpdateCropCycle,
  useDeleteCropCycle,
} from '../hooks/queries';
import { useDebounce } from '../hooks/useDebounce';
import { CropCycleModal } from '../components/CropCycleModal';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import type { CropCycle } from '../types';

export default function CropCyclesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    router.replace(`${pathname}?${createQueryString('search', debouncedSearch)}`, {
      scroll: false,
    });
  }, [debouncedSearch, pathname, router, createQueryString]);

  const queryParams = debouncedSearch ? { query: debouncedSearch } : {};

  const { data: cropCycles = [], isLoading, isError, error, refetch } = useCropCycles(queryParams);
  const { data: harvestSchedules = [], isLoading: loadingSchedules } = useHarvestSchedules();

  const { mutateAsync: createCropCycle } = useCreateCropCycle();
  const { mutateAsync: updateCropCycle } = useUpdateCropCycle();
  const { mutateAsync: deleteCropCycle } = useDeleteCropCycle();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<CropCycle | null>(null);

  const visibleCycles = useMemo(() => {
    let filtered = cropCycles;
    if (debouncedSearch.trim()) {
      const lowerQuery = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.cropName.toLowerCase().includes(lowerQuery) ||
          c.cropType.toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [cropCycles, debouncedSearch]);

  const handleExportCSV = () => {
    if (visibleCycles.length === 0) {
      toast.warning('No crop cycles to export');
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

    for (const cycle of visibleCycles) {
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
    toast.success('Exported crop cycles successfully');
  };

  const handleSaveCycle = async (data: Partial<CropCycle>) => {
    try {
      if (editingCycle) {
        await updateCropCycle({ cycleId: editingCycle.cycleId, updates: data });
        toast.success('Crop cycle updated successfully');
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
        toast.success('Crop cycle added successfully');
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error('Failed to save crop cycle');
    }
  };

  const handleDeleteCycle = async (cycle: CropCycle) => {
    if (confirm(`Are you sure you want to delete the ${cycle.cropName} cycle?`)) {
      try {
        await deleteCropCycle(cycle.cycleId);
        toast.success(`${cycle.cropName} cycle has been deleted.`);
      } catch (e) {
        toast.error('Failed to delete cycle');
      }
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
    <div className="space-y-4 pb-6 min-h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
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
            <Calendar className="w-4 h-4" />{' '}
            {isLoading ? <Skeleton className="h-4 w-6 inline-block" /> : cropCycles.length} Active
            Cycles
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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2 flex flex-col items-end">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-full rounded-full mb-4" />
              <Skeleton className="h-8 w-full mt-6" />
            </div>
          ))
        ) : isError ? (
          <div className="col-span-1 lg:col-span-2">
            <ErrorState
              title="Failed to load crop cycles"
              message={error?.message || 'Something went wrong while fetching the crop cycle data.'}
              onRetry={() => refetch()}
            />
          </div>
        ) : visibleCycles.length === 0 ? (
          <div className="col-span-1 lg:col-span-2">
            <EmptyState
              title="No crop cycles found"
              description={
                debouncedSearch
                  ? 'Try adjusting your search query.'
                  : 'Add your first crop cycle to begin monitoring growth stages.'
              }
              action={
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                >
                  <Plus className="w-4 h-4" /> Add Cycle
                </button>
              }
            />
          </div>
        ) : (
          visibleCycles.map((cycle) => (
            <div
              key={cycle.cycleId}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all flex flex-col"
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

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
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
                    onClick={() => handleDeleteCycle(cycle)}
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
        {loadingSchedules ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : harvestSchedules.length === 0 ? (
          <div className="text-sm text-slate-500">No harvest schedules available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {harvestSchedules.slice(0, 3).map((schedule) => (
              <div
                key={schedule.scheduleId}
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
    </div>
  );
}
