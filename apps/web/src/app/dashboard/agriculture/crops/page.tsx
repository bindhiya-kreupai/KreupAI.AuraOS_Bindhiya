'use client';

import React from 'react';
import { Sprout, CalendarDays, CloudRain, Leaf } from 'lucide-react';
import { useAgriculture } from '../hooks/useAgriculture';
import { LoadingOverlay } from '../components/LoadingSpinner';
import type { CropCycle } from '../types';

export default function CropsPage() {
  const { cropCycles, harvestSchedules, loading } = useAgriculture();

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
            <Sprout className="w-6 h-6 text-emerald-500" />
            Crop Cycle Planning
          </h1>
          <p className="text-slate-500 text-sm">
            Aligning workforce demand with planting and harvest windows.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">
          <CalendarDays className="w-4 h-4" /> Add Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">
                Active Crop Cycles
              </h3>
              <p className="text-sm text-slate-500">Current crop status and stage tracking.</p>
            </div>
            <span className="text-sm font-bold text-emerald-600">{cropCycles.length} cycles</span>
          </div>

          {cropCycles.length === 0 ? (
            <div className="text-sm text-slate-500">
              No crop cycles found. Add a new cycle to begin planning.
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto">
              {cropCycles.map((cycle) => (
                <div
                  key={cycle.cycleId || cycle.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                        {cycle.cropName}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {cycle.farm || 'Unknown farm'} •{' '}
                        {cycle.fields?.map((field) => field.fieldName).join(', ') ||
                          'Field data unavailable'}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-bold uppercase">
                      {cycle.currentStage || 'Planned'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <div className="font-bold">Estimated harvest</div>
                      <div>
                        {cycle.expectedHarvestDate
                          ? new Date(cycle.expectedHarvestDate).toLocaleDateString()
                          : 'TBD'}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">Progress</div>
                      <div>{calculateProgress(cycle)}%</div>
                    </div>
                  </div>

                  <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${calculateProgress(cycle)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Weather Impact</h3>
                <p className="text-sm opacity-80">
                  Monitor conditions affecting harvest readiness.
                </p>
              </div>
              <CloudRain className="w-6 h-6 text-sky-200" />
            </div>
            <div className="text-4xl font-bold mb-1">Rain</div>
            <div className="text-sm opacity-80 mb-4">
              Expected Thursday. Harvest windows may shift accordingly.
            </div>
            <div className="flex gap-2">
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                +10 staff needed
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Upcoming Harvests</h3>
                <p className="text-sm text-slate-500">Scheduled work for the next cycle.</p>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {harvestSchedules.length} schedules
              </span>
            </div>

            {harvestSchedules.length === 0 ? (
              <div className="text-sm text-slate-500">No harvest schedules available.</div>
            ) : (
              <div className="space-y-3">
                {harvestSchedules.map((schedule) => (
                  <div
                    key={schedule.scheduleId || schedule.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                  >
                    <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-200">
                      <span>{schedule.cropName || 'Crop'}</span>
                      <span>
                        {schedule.plannedEndDate
                          ? new Date(schedule.plannedEndDate).toLocaleDateString()
                          : 'TBD'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {schedule.fields?.join(', ') || schedule.farm || 'No field info'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
