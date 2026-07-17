'use client';

import React, { useState } from 'react';
import { Award, AlertCircle, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { usePilots } from '@/app/dashboard/aviation/hooks/queries';
import { useDeletePilot } from '@/app/dashboard/aviation/hooks/mutations';
import { PilotForm } from './components/PilotForm';
import type { PilotProfile } from '../types';

export default function PilotTrainingPage() {
  const { data: pilots = [], isLoading: loading, error: errorObj } = usePilots();
  const error = errorObj ? errorObj.message : null;

  const deletePilotMutation = useDeletePilot();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPilot, setEditingPilot] = useState<PilotProfile | null>(null);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
        Error: {error}
      </div>
    );
  }

  // Derived statistics
  const trainingPilots = pilots.filter((p) => p.status === 'training').length;
  const medicalHold = pilots.filter((p) => p.status === 'medical_hold').length;

  const a380Count = pilots.filter((p) =>
    p.typeRatings?.some((r) => r.aircraftType === 'A380')
  ).length;
  const b787Count = pilots.filter((p) =>
    p.typeRatings?.some((r) => r.aircraftType === 'B787')
  ).length;

  return (
    <>
      <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-500" />
              Pilot Training
            </h1>
            <p className="text-slate-500 text-sm">
              Monitor certifications, sim hours, and recurrency.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPilot(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Pilot
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          {[
            {
              label: 'Total Pilots',
              count: pilots.length,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            },
            {
              label: 'In Training',
              count: trainingPilots,
              color: 'text-amber-600',
              bg: 'bg-amber-50 dark:bg-amber-900/20',
            },
            {
              label: 'A380 Rated',
              count: a380Count,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            },
            {
              label: 'Medical Hold',
              count: medicalHold,
              color: 'text-rose-600',
              bg: 'bg-rose-50 dark:bg-rose-900/20',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-2 h-2 rounded-full ${stat.bg.split(' ')[0].replace('50', '500')}`}
                />
                <span className="text-xs font-bold text-slate-500 uppercase">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {stat.count}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-lg">Training Compliance Matrix</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase sticky top-0">
                <tr>
                  <th className="px-6 py-4">Pilot</th>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Primary Fleet</th>
                  <th className="px-6 py-4">Next Sim</th>
                  <th className="px-6 py-4">Next Medical</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pilots.map((pilot, i) => {
                  const latestCheck = pilot.checkResults?.[0];
                  const medical = pilot.medicalCertificate;
                  const primaryFleet = pilot.typeRatings?.[0]?.aircraftType || 'N/A';

                  return (
                    <tr
                      key={pilot.pilotId || i}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                    >
                      <td className="px-6 py-4 font-bold">
                        {pilot.personalInfo?.firstName} {pilot.personalInfo?.lastName}
                      </td>
                      <td className="px-6 py-4 capitalize">{pilot.rank?.replace('_', ' ')}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{primaryFleet}</td>
                      <td className="px-6 py-4">
                        {latestCheck
                          ? new Date(latestCheck.nextCheckDue).toLocaleDateString()
                          : 'Pending'}
                      </td>
                      <td className="px-6 py-4">
                        {medical?.nextExamDate
                          ? new Date(medical.nextExamDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            pilot.status === 'active'
                              ? 'bg-emerald-100 text-emerald-600'
                              : pilot.status === 'training'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-rose-100 text-rose-600'
                          }`}
                        >
                          {pilot.status?.charAt(0).toUpperCase() +
                            pilot.status?.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingPilot(pilot);
                              setModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-500 rounded bg-white dark:bg-slate-700 shadow-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete pilot?'))
                                deletePilotMutation.mutate(pilot.pilotId);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded bg-white dark:bg-slate-700 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pilots.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-bold">
                      No pilot data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PilotForm open={modalOpen} onClose={() => setModalOpen(false)} initialData={editingPilot} />
    </>
  );
}
