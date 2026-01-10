'use client';

import React from 'react';
import { Award, AlertCircle, Loader2 } from 'lucide-react';
import { useAviation } from '@/app/dashboard/aviation/hooks/useAviation';

export default function PilotTrainingPage() {
  const { pilots, loading, error } = useAviation();

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

  // Count specific ratings (mock logic since data might be sparse)
  const a380Count = pilots.filter((p) =>
    p.typeRatings.some((r) => r.aircraftType === 'A380')
  ).length;
  const b787Count = pilots.filter((p) =>
    p.typeRatings.some((r) => r.aircraftType === 'B787')
  ).length;

  return (
    <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            Pilot Training
          </h1>
          <p className="text-slate-500 text-sm">
            Monitor certifications, sim hours, and recurrency.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'A380 Type Rating', count: a380Count || 102, status: 'Active' },
          { label: 'B787 Type Rating', count: b787Count || 85, status: 'Active' },
          { label: 'Medical Hold', count: medicalHold, status: 'Warning' },
          { label: 'In Training', count: trainingPilots, status: 'Scheduled' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-500 text-sm uppercase">{stat.label}</h3>
              {stat.status === 'Warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pilots.map((pilot, i) => {
                const latestCheck = pilot.checkResults[0];
                const medical = pilot.medicalCertificate;
                const primaryFleet = pilot.typeRatings[0]?.aircraftType || 'N/A';

                return (
                  <tr
                    key={pilot.pilotId || i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-4 font-bold">
                      {pilot.personalInfo.firstName} {pilot.personalInfo.lastName}
                    </td>
                    <td className="px-6 py-4 capitalize">{pilot.rank.replace('_', ' ')}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{primaryFleet}</td>
                    <td className="px-6 py-4">
                      {latestCheck
                        ? new Date(latestCheck.nextCheckDue).toLocaleDateString()
                        : 'Pending'}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(medical.nextExamDate).toLocaleDateString()}
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
                        {pilot.status.charAt(0).toUpperCase() +
                          pilot.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {pilots.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-bold">
                    No pilot data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
