'use client';

import React from 'react';
import { Wrench, Clock, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { useManufacturing } from '@/app/dashboard/manufacturing/hooks/useManufacturing';

export default function PlantMaintenancePage() {
  const { equipment, maintenanceSchedules, workOrders, loading, error } = useManufacturing();

  if (loading) {
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

  // Derived states
  const runningLines = equipment.filter((e) => e.status === 'operational');
  const maintenanceLines = equipment.filter((e) => e.status === 'maintenance');

  return (
    <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-500" />
            Plant Maintenance
          </h1>
          <p className="text-slate-500 text-sm">
            Shift rosters, downtime tracking, and equipment logs.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Operational: {runningLines.length}
          </div>
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Maintenance: {maintenanceLines.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        {/* Maintenance Schedules */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto pb-20 pr-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" /> Maintenance Schedule
              </h3>
              <button className="text-sm font-bold text-indigo-600">View All</button>
            </div>

            <div className="space-y-4">
              {maintenanceSchedules.slice(0, 3).map((s, i) => (
                <div
                  key={s.scheduleId || i}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {s.maintenanceType.charAt(0).toUpperCase() + s.maintenanceType.slice(1)}:{' '}
                      {s.equipmentName}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Due: {new Date(s.nextDue).toLocaleDateString()} • Assigned to:{' '}
                      {s.assignedTo || 'Unassigned'}
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                            ${
                                              s.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-600 animate-pulse'
                                                : s.status === 'overdue'
                                                  ? 'bg-rose-100 text-rose-600'
                                                  : 'bg-slate-100 text-slate-500'
                                            }
                                        `}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
              {maintenanceSchedules.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic">
                  No maintenance scheduled.
                </div>
              )}
            </div>
          </div>

          {/* Recent Work Orders */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" /> Active Work Orders
            </h3>
            <div className="space-y-4">
              {workOrders
                .filter((wo) => wo.status !== 'completed')
                .map((wo, i) => (
                  <div
                    key={wo.workOrderId || i}
                    className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          wo.priority === 'critical'
                            ? 'bg-rose-50 text-rose-500'
                            : wo.priority === 'high'
                              ? 'bg-orange-50 text-orange-500'
                              : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {wo.description}
                        </div>
                        <div className="text-xs text-slate-500">
                          {wo.equipmentName} • {wo.priority}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold text-sm ${wo.priority === 'critical' ? 'text-rose-600' : 'text-slate-600'}`}
                      >
                        {wo.status.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(wo.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              {workOrders.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic">
                  No active work orders.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Machine Status Sidebar */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
          <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">
            Machine Health
          </h3>
          <div className="space-y-4">
            {equipment.map((m, i) => {
              const health = m.currentCondition.overallHealth;
              const status =
                m.status === 'operational'
                  ? 'Good'
                  : m.status === 'maintenance'
                    ? 'Warning'
                    : 'Critical';

              return (
                <div
                  key={m.equipmentId || i}
                  className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold">{m.equipmentName}</span>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        status === 'Good'
                          ? 'text-emerald-500'
                          : status === 'Warning'
                            ? 'text-amber-500'
                            : 'text-rose-500'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        health > 90
                          ? 'bg-emerald-500'
                          : health > 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${health}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
