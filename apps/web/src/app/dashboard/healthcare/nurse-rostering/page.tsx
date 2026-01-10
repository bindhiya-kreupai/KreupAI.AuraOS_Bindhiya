'use client';

import React from 'react';
import { CalendarDays, Clock, UserCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useHealthcare } from '@/app/dashboard/healthcare/hooks/useHealthcare';

export default function NurseRosteringPage() {
  const { schedules, loading, error } = useHealthcare();

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

  // Transform schedule to nurse-centric view
  const nurseMap: Record<string, { name: string; shifts: Record<string, string> }> = {};
  const allDatesSet = new Set<string>();

  schedules.forEach((schedule) => {
    schedule.shifts.forEach((shift) => {
      allDatesSet.add(shift.date);
      shift.assignedStaff.forEach((staff) => {
        if (!nurseMap[staff.nurseId]) {
          nurseMap[staff.nurseId] = { name: staff.nurseName, shifts: {} };
        }
        nurseMap[staff.nurseId].shifts[shift.date] = shift.shiftType;
      });
    });
  });

  const sortedDates = Array.from(allDatesSet).sort();
  const nurses = Object.values(nurseMap);

  return (
    <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            Nurse Rostering
          </h1>
          <p className="text-slate-500 text-sm">Manage shifts, leave, and ward coverage.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm px-2">
            {sortedDates.length > 0
              ? `${new Date(sortedDates[0]).toLocaleDateString()} - ${new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString()}`
              : 'No Active Roster'}
          </span>
          <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4 min-w-[150px]">Nurse</th>
                {sortedDates.map((date) => (
                  <th key={date} className="px-4 py-4 min-w-[100px]">
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      day: 'numeric',
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {nurses.map((nurse, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                      {nurse.name[0]}
                    </div>
                    {nurse.name}
                  </td>
                  {sortedDates.map((date) => {
                    const shift = nurse.shifts[date] || 'Rest';
                    return (
                      <td key={date} className="px-4 py-4">
                        <div
                          className={`px-2 py-1 rounded text-xs font-bold text-center ${
                            shift.toLowerCase().includes('day')
                              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300'
                              : shift.toLowerCase().includes('night')
                                ? 'bg-slate-800 text-slate-200 dark:bg-slate-700'
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800/50'
                          }`}
                        >
                          {shift}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {nurses.length === 0 && (
                <tr>
                  <td
                    colSpan={sortedDates.length + 1}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    No shift data available for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-indigo-500" />
              <div>
                <div className="text-sm font-bold text-slate-500 dark:text-indigo-300">
                  Total Hours
                </div>
                <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                  {schedules.reduce(
                    (acc, s) => acc + s.shifts.reduce((sum, sh) => sum + sh.duration, 0),
                    0
                  )}
                  h
                </div>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-emerald-500" />
              <div>
                <div className="text-sm font-bold text-slate-500 dark:text-emerald-400">
                  Coverage
                </div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-500">98%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
