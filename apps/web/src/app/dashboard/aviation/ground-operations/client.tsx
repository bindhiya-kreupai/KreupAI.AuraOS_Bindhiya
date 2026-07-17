'use client';

import React, { Suspense, useState } from 'react';
import { Truck, Clock, AlertTriangle, Users, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useTurnarounds, useGroundStaff } from '@/app/dashboard/aviation/hooks/queries';
import {
  useDeleteTurnaround,
  useDeleteGroundStaff,
} from '@/app/dashboard/aviation/hooks/mutations';
import { TurnaroundForm } from './components/TurnaroundForm';
import { GroundStaffForm } from './components/GroundStaffForm';
import type { TurnaroundAssignment, GroundStaffMember } from '../types';

function GroundOpsContent() {
  const {
    data: turnarounds = [],
    isLoading: loadingTurnarounds,
    error: errorTurnarounds,
  } = useTurnarounds();
  const { data: groundStaff = [], isLoading: loadingStaff, error: errorStaff } = useGroundStaff();

  const deleteTurnaroundMutation = useDeleteTurnaround();
  const deleteGroundStaffMutation = useDeleteGroundStaff();

  const [turnaroundModalOpen, setTurnaroundModalOpen] = useState(false);
  const [editingTurnaround, setEditingTurnaround] = useState<TurnaroundAssignment | null>(null);

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<GroundStaffMember | null>(null);

  const loading = loadingTurnarounds || loadingStaff;
  const error = errorTurnarounds
    ? errorTurnarounds.message
    : errorStaff
      ? errorStaff.message
      : null;

  if (loading && turnarounds.length === 0 && groundStaff.length === 0) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
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
  const avgTurnaround =
    turnarounds.length > 0
      ? Math.round(turnarounds.reduce((acc, t) => acc + t.turnaroundTime, 0) / turnarounds.length)
      : 45;

  const activeStaff = groundStaff.filter((s) => s.status === 'active');
  const baggageHandlers = activeStaff.filter((s) => s.role === 'baggage_handler').length;
  const rampMarshals = activeStaff.filter((s) => s.role === 'ramp_agent').length;
  const cleanersList = activeStaff.filter((s) => s.role === 'aircraft_cleaner').length;

  return (
    <>
      <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="w-6 h-6 text-orange-500" />
              Ground Operations
            </h1>
            <p className="text-slate-500 text-sm">
              Ramp safety, baggage handling roster, and turnaround coordination.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingStaff(null);
                setStaffModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Plus className="w-4 h-4" /> Add Staff
            </button>
            <button
              onClick={() => {
                setEditingTurnaround(null);
                setTurnaroundModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" /> New Turnaround
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 flex justify-between items-center">
              <h3 className="font-bold text-lg">Active Turnarounds</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Avg Target:</span>
                <span className="font-bold">{avgTurnaround}m</span>
              </div>
            </div>

            <div className="overflow-x-auto flex-1 p-2">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Flight</th>
                    <th className="px-4 py-3">Gate</th>
                    <th className="px-4 py-3">Aircraft</th>
                    <th className="px-4 py-3">Target Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {turnarounds.map((t, i) => (
                    <tr
                      key={t.assignmentId || i}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3 font-bold">{t.flightNumber}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">
                        {t.gate}
                      </td>
                      <td className="px-4 py-3">
                        {t.aircraftType}{' '}
                        <span className="text-xs text-slate-400">({t.aircraftRegistration})</span>
                      </td>
                      <td className="px-4 py-3 font-mono">{t.turnaroundTime}m</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                            t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-600'
                              : t.status === 'delayed'
                                ? 'bg-rose-100 text-rose-600'
                                : t.status === 'in_progress'
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingTurnaround(t);
                              setTurnaroundModalOpen(true);
                            }}
                            className="text-slate-400 hover:text-orange-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete turnaround?'))
                                deleteTurnaroundMutation.mutate(t.assignmentId);
                            }}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {turnarounds.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                        No turnarounds found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-lg mb-4">Staff on Duty</h3>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center p-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-sm font-bold opacity-80">Baggage Handlers</span>
                  <span
                    className={`text-sm font-bold ${baggageHandlers >= 10 ? 'text-emerald-500' : 'text-amber-500'}`}
                  >
                    {baggageHandlers} Active
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-sm font-bold opacity-80">Ramp Marshals</span>
                  <span
                    className={`text-sm font-bold ${rampMarshals >= 4 ? 'text-emerald-500' : 'text-amber-500'}`}
                  >
                    {rampMarshals} Active
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-sm font-bold opacity-80">Cleaners</span>
                  <span
                    className={`text-sm font-bold ${cleanersList >= 8 ? 'text-emerald-500' : 'text-amber-500'}`}
                  >
                    {cleanersList} {cleanersList < 8 ? '(Low)' : 'Active'}
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Staff Roster</h4>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {activeStaff.map((staff, i) => (
                  <div
                    key={staff.staffId || i}
                    className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg group"
                  >
                    <div>
                      <div className="font-bold">
                        {staff.personalInfo?.firstName} {staff.personalInfo?.lastName}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {staff.role?.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingStaff(staff);
                          setStaffModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-indigo-500"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete staff?'))
                            deleteGroundStaffMutation.mutate(staff.staffId);
                        }}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-6 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <h3 className="font-bold text-rose-900 dark:text-rose-300 text-sm">
                  Ramp Safety Alert
                </h3>
                <p className="text-xs text-rose-800 dark:text-rose-400 mt-1">
                  High winds reported. All ramp activity must follow extreme weather protocol.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TurnaroundForm
        open={turnaroundModalOpen}
        onClose={() => setTurnaroundModalOpen(false)}
        initialData={editingTurnaround}
      />
      <GroundStaffForm
        open={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        initialData={editingStaff}
      />
    </>
  );
}

export default function GroundOpsClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <GroundOpsContent />
    </Suspense>
  );
}
