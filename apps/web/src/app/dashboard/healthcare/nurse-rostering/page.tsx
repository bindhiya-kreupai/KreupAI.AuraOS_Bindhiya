'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  X,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No nurse schedules found. Add one to get started.</p>
  </div>
);

export default function NurseRosteringPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState('New Weekly Roster');

  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [newNurseName, setNewNurseName] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['nurseSchedules'],
    queryFn: async () => {
      const res = await fetch('/api/healthcare/nurse-rostering');
      if (!res.ok) throw new Error('Failed to fetch nurse schedules');
      return res.json();
    },
  });

  const schedules = data?.schedules || [];

  React.useEffect(() => {
    if (schedules.length > 0 && !activeScheduleId) {
      setActiveScheduleId(schedules[0].id);
    } else if (schedules.length === 0) {
      setActiveScheduleId(null);
    }
  }, [schedules, activeScheduleId]);

  const activeSchedule = schedules.find((s: any) => s.id === activeScheduleId);

  const createMutation = useMutation({
    mutationFn: async (newSchedule: any) => {
      const res = await fetch('/api/healthcare/nurse-rostering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });
      if (!res.ok) throw new Error('Failed to create schedule');
      return res.json();
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['nurseSchedules'] });
      setActiveScheduleId(res.schedule.id);
      toast.success('Schedule added successfully!');
      setIsModalOpen(false);
      setScheduleName('New Weekly Roster');
    },
    onError: () => {
      toast.error('Failed to create schedule');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/healthcare/nurse-rostering/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete schedule');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurseSchedules'] });
      setActiveScheduleId(null);
      toast.success('Schedule deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete schedule');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, shifts }: { id: string; shifts: any[] }) => {
      const res = await fetch(`/api/healthcare/nurse-rostering/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shifts }),
      });
      if (!res.ok) throw new Error('Failed to update schedule');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurseSchedules'] });
    },
    onError: () => {
      toast.error('Failed to update roster');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    createMutation.mutate({
      scheduleName,
      status: 'Published',
      startDate: today,
      endDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
      shifts: [],
    });
  };

  const { nurseMap, sortedDates, totalHours } = useMemo(() => {
    const map: Record<string, { nurseId: string; name: string; shifts: Record<string, string> }> =
      {};
    const datesSet = new Set<string>();
    let hours = 0;

    if (activeSchedule) {
      let start = new Date(activeSchedule.startDate);
      let end = new Date(activeSchedule.endDate);

      // Fallback if dates are invalid
      if (isNaN(start.getTime())) start = new Date();
      if (isNaN(end.getTime())) {
        end = new Date(start);
        end.setDate(end.getDate() + 6);
      }

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        datesSet.add(d.toISOString().split('T')[0]);
      }

      const shifts = activeSchedule.shifts || [];
      shifts.forEach((shift: any) => {
        datesSet.add(shift.date);
        hours += shift.duration || 0;
        const staff = shift.assignedStaff || [];
        staff.forEach((s: any) => {
          if (!map[s.nurseId]) {
            map[s.nurseId] = { nurseId: s.nurseId, name: s.nurseName, shifts: {} };
          }
          map[s.nurseId].shifts[shift.date] = s.shiftType || shift.shiftType || 'Day';
        });
      });
    }

    return {
      nurseMap: map,
      sortedDates: Array.from(datesSet).sort(),
      totalHours: hours,
    };
  }, [activeSchedule]);

  const nurses = Object.values(nurseMap);

  const rebuildAndSaveShifts = (updatedNurseMap: Record<string, any>) => {
    if (!activeScheduleId) return;
    const newShiftsMap: Record<string, any> = {};

    sortedDates.forEach((date) => {
      newShiftsMap[date] = { date, shiftType: 'Mixed', duration: 0, assignedStaff: [] };
    });

    Object.values(updatedNurseMap).forEach((nurse) => {
      Object.entries(nurse.shifts).forEach(([date, shiftType]) => {
        if (shiftType !== 'Rest' && shiftType !== '') {
          if (!newShiftsMap[date]) {
            newShiftsMap[date] = { date, shiftType: 'Mixed', duration: 0, assignedStaff: [] };
          }
          newShiftsMap[date].assignedStaff.push({
            nurseId: nurse.nurseId,
            nurseName: nurse.name,
            shiftType,
          });
          newShiftsMap[date].duration += 12;
        }
      });
    });

    const newShiftsArray = Object.values(newShiftsMap).filter(
      (s: any) => s.assignedStaff.length > 0
    );

    updateMutation.mutate({ id: activeScheduleId, shifts: newShiftsArray });
  };

  const handleShiftChange = (nurseId: string, date: string, newShift: string) => {
    const updatedMap = JSON.parse(JSON.stringify(nurseMap));
    if (!updatedMap[nurseId]) return;
    updatedMap[nurseId].shifts[date] = newShift;
    rebuildAndSaveShifts(updatedMap);
  };

  const handleAddNurse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNurseName.trim() || !activeScheduleId) return;

    const newNurseId = `N-${Date.now()}`;
    const updatedMap = JSON.parse(JSON.stringify(nurseMap));

    updatedMap[newNurseId] = {
      nurseId: newNurseId,
      name: newNurseName.trim(),
      shifts: {},
    };

    if (sortedDates.length > 0) {
      updatedMap[newNurseId].shifts[sortedDates[0]] = 'Day';
    }

    rebuildAndSaveShifts(updatedMap);
    setNewNurseName('');
  };

  const handleRemoveNurse = (nurseId: string) => {
    const updatedMap = JSON.parse(JSON.stringify(nurseMap));
    delete updatedMap[nurseId];
    rebuildAndSaveShifts(updatedMap);
  };

  return (
    <div className="space-y-4 pb-6 relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            Nurse Rostering
          </h1>
          <p className="text-slate-500 text-sm">Manage shifts, leave, and ward coverage.</p>
        </div>
        <div className="flex items-center gap-4">
          {schedules.length > 0 && (
            <select
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-bold shadow-sm"
              value={activeScheduleId || ''}
              onChange={(e) => setActiveScheduleId(e.target.value)}
            >
              {schedules.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.scheduleName}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Add Schedule
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl font-bold">
          Error loading schedules
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4 min-w-[150px]">Nurse</th>
                  {sortedDates.map((date) => (
                    <th key={date} className="px-4 py-4 min-w-[120px]">
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        day: 'numeric',
                      })}
                    </th>
                  ))}
                  <th className="px-6 py-4 min-w-[100px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {nurses.map((nurse, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px]">
                        {nurse.name[0]}
                      </div>
                      {nurse.name}
                    </td>
                    {sortedDates.map((date) => {
                      const shift = nurse.shifts[date] || 'Rest';
                      return (
                        <td key={date} className="px-4 py-4">
                          <select
                            value={shift}
                            onChange={(e) => handleShiftChange(nurse.nurseId, date, e.target.value)}
                            className={`w-full px-2 py-1.5 rounded text-xs font-bold text-center appearance-none cursor-pointer border-transparent hover:border-slate-300 transition ${
                              shift === 'Day'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                                : shift === 'Night'
                                  ? 'bg-slate-800 text-slate-200 dark:bg-slate-700'
                                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800/50'
                            }`}
                          >
                            <option value="Rest">Rest</option>
                            <option value="Day">Day</option>
                            <option value="Night">Night</option>
                          </select>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemoveNurse(nurse.nurseId)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
                        title="Remove Nurse"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Add Nurse Row */}
                <tr>
                  <td
                    colSpan={sortedDates.length + 2}
                    className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20"
                  >
                    <form onSubmit={handleAddNurse} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Enter nurse name to add..."
                        value={newNurseName}
                        onChange={(e) => setNewNurseName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm w-64"
                      />
                      <button
                        type="submit"
                        disabled={!newNurseName.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-lg text-sm font-bold hover:bg-indigo-200 disabled:opacity-50 transition"
                      >
                        <UserPlus className="w-4 h-4" /> Add to Roster
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-indigo-500" />
                <div>
                  <div className="text-sm font-bold text-slate-500 dark:text-indigo-300">
                    Total Hours
                  </div>
                  <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                    {totalHours}h
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-emerald-500" />
                <div>
                  <div className="text-sm font-bold text-slate-500 dark:text-emerald-400">
                    Nurses Scheduled
                  </div>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-500">
                    {nurses.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <h3 className="font-bold text-sm mb-2 text-slate-500">Manage Schedules</h3>
              <div className="space-y-2">
                {schedules.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="font-bold">{s.scheduleName}</span>
                    <button
                      onClick={() => deleteMutation.mutate(s.id)}
                      className="text-rose-500 hover:text-rose-700 transition"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Weekly Roster</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Roster Name
                </label>
                <input
                  type="text"
                  required
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
