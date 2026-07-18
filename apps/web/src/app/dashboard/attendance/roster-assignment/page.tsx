'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Save,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { apiJson } from '@/lib/api-utils';

type Employee = {
  id: string;
  name: string;
  role: string;
  avatar: string;
};

type Shift = {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  workHours: number;
};

type Roster = {
  id: string;
  employeeId: string;
  shiftId: string;
  shift?: { id: string; name: string };
  rosterDate: string;
  isWeekOff: boolean;
  isHoliday: boolean;
};

const SHIFT_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-rose-100 text-rose-700 border-rose-200',
];

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function weekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function RosterAssignmentPage() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ empId: string; date: string; existing?: Roster } | null>(
    null
  );
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterShiftId, setFilterShiftId] = useState<string>('');
  const [filterCoverage, setFilterCoverage] = useState<'all' | 'assigned' | 'unassigned'>('all');

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const weekEnd = weekDates[6];

  const shiftColorById = useMemo(() => {
    const map = new Map<string, string>();
    shifts.forEach((s, idx) => map.set(s.id, SHIFT_COLORS[idx % SHIFT_COLORS.length]));
    return map;
  }, [shifts]);

  const reload = async () => {
    setLoading(true);
    const startStr = isoDate(weekStart);
    const endStr = isoDate(weekEnd);
    const [empRes, shiftRes, rosterRes] = await Promise.all([
      apiJson<any>('/api/v1/employees?limit=200'),
      apiJson<Shift[]>('/api/v1/shifts?limit=100'),
      apiJson<Roster[]>(`/api/v1/shift-rosters?startDate=${startStr}&endDate=${endStr}&limit=2000`),
    ]);

    if (empRes.ok && empRes.data) {
      const list: any[] = Array.isArray(empRes.data)
        ? empRes.data
        : empRes.data.employees || empRes.data.data || [];
      setEmployees(
        list.map((e: any) => ({
          id: e.id,
          name:
            e.fullName ||
            [e.firstName, e.lastName].filter(Boolean).join(' ') ||
            e.name ||
            'Unknown',
          role: e.designation?.name || e.designationName || e.department?.name || e.role || '',
          avatar:
            (e.firstName?.[0] || '') + (e.lastName?.[0] || '') ||
            (e.name || 'U').slice(0, 2).toUpperCase(),
        }))
      );
    }
    if (shiftRes.ok && shiftRes.data) setShifts(shiftRes.data);
    if (rosterRes.ok && rosterRes.data) setRosters(rosterRes.data);

    if (!empRes.ok)
      setStatus({ kind: 'error', text: empRes.error?.message || 'Failed to load employees' });
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const rosterByKey = useMemo(() => {
    const map = new Map<string, Roster>();
    rosters.forEach((r) => map.set(`${r.employeeId}:${r.rosterDate.slice(0, 10)}`, r));
    return map;
  }, [rosters]);

  // Distinct roles for the filter dropdown, derived from the loaded employees.
  const roleOptions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => e.role && set.add(e.role));
    return Array.from(set).sort();
  }, [employees]);

  const activeFilterCount =
    (filterRole ? 1 : 0) + (filterShiftId ? 1 : 0) + (filterCoverage !== 'all' ? 1 : 0);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((e) => {
      // Text search across name + role
      if (q && !(e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))) {
        return false;
      }
      // Role / designation filter
      if (filterRole && e.role !== filterRole) {
        return false;
      }
      // Shift filter — keep employees assigned to the chosen shift in this week
      if (filterShiftId) {
        const hasShift = weekDates.some((d) => {
          const r = rosterByKey.get(`${e.id}:${isoDate(d)}`);
          return r && !r.isWeekOff && !r.isHoliday && r.shiftId === filterShiftId;
        });
        if (!hasShift) return false;
      }
      // Coverage filter — assigned vs unassigned for the visible week
      if (filterCoverage !== 'all') {
        const hasAnyWorkingDay = weekDates.some((d) => {
          const r = rosterByKey.get(`${e.id}:${isoDate(d)}`);
          return r && !r.isWeekOff && !r.isHoliday;
        });
        if (filterCoverage === 'assigned' && !hasAnyWorkingDay) return false;
        if (filterCoverage === 'unassigned' && hasAnyWorkingDay) return false;
      }
      return true;
    });
  }, [employees, search, filterRole, filterShiftId, filterCoverage, weekDates, rosterByKey]);

  const hoursForEmployee = (empId: string) => {
    let total = 0;
    weekDates.forEach((d) => {
      const r = rosterByKey.get(`${empId}:${isoDate(d)}`);
      if (r && !r.isWeekOff && !r.isHoliday) {
        const s = shifts.find((x) => x.id === r.shiftId);
        if (s) total += s.workHours || 0;
      }
    });
    return total;
  };

  const saveRoster = async (
    empId: string,
    date: string,
    choice: { shiftId?: string; isWeekOff?: boolean; isHoliday?: boolean; existingId?: string }
  ) => {
    setStatus(null);
    const existing = rosterByKey.get(`${empId}:${date}`);
    if (existing) {
      // Delete existing then create new (simpler than partial update with version)
      await apiJson(`/api/v1/shift-rosters/${existing.id}`, { method: 'DELETE' });
    }
    if (choice.shiftId || choice.isWeekOff || choice.isHoliday) {
      const r = await apiJson<Roster>('/api/v1/shift-rosters', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: empId,
          shiftId: choice.shiftId || shifts[0]?.id,
          rosterDate: date,
          isWeekOff: !!choice.isWeekOff,
          isHoliday: !!choice.isHoliday,
        }),
      });
      if (!r.ok) {
        setStatus({ kind: 'error', text: r.error?.message || 'Failed to save roster' });
        return;
      }
    }
    setEditing(null);
    await reload();
    setStatus({ kind: 'success', text: 'Roster updated.' });
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            Roster Assignment
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Manage weekly shift schedules and assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/attendance/shift-management"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            <Upload className="w-4 h-4" /> Bulk via Shift Management
          </Link>
          <button
            onClick={() => reload()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
          >
            <Save className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.text}
        </div>
      )}

      <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const prev = new Date(weekStart);
              prev.setDate(prev.getDate() - 7);
              setWeekStart(prev);
            }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="text-center">
            <span className="block text-sm font-bold text-ink-black dark:text-pearl">
              {weekStart.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })} -{' '}
              {weekEnd.toLocaleDateString(undefined, {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })}
            </span>
            <span className="text-xs text-silver-mist">Week {weekNumber(weekStart)}</span>
          </div>
          <button
            onClick={() => {
              const next = new Date(weekStart);
              next.setDate(next.getDate() + 7);
              setWeekStart(next);
            }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="px-2 py-1 ml-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search employee..."
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none"
            />
          </div>
          <button
            type="button"
            title="Filter roster"
            onClick={() => setShowFilters((v) => !v)}
            className={`relative p-2 border rounded-lg transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                : 'border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
            }`}
          >
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <label className="block">
            <span className="block text-xs font-bold text-silver-mist mb-1 uppercase">
              Role / Designation
            </span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none"
            >
              <option value="">All roles</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-silver-mist mb-1 uppercase">Shift</span>
            <select
              value={filterShiftId}
              onChange={(e) => setFilterShiftId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none"
            >
              <option value="">All shifts</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-silver-mist mb-1 uppercase">
              Coverage
            </span>
            <select
              value={filterCoverage}
              onChange={(e) => setFilterCoverage(e.target.value as typeof filterCoverage)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm focus:outline-none"
            >
              <option value="all">All employees</option>
              <option value="assigned">Assigned this week</option>
              <option value="unassigned">Unassigned this week</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setFilterRole('');
              setFilterShiftId('');
              setFilterCoverage('all');
            }}
            disabled={activeFilterCount === 0}
            className="px-4 py-2 text-sm font-bold border border-cloud dark:border-nebula-purple/50 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="p-4 text-left min-w-[220px] border-b border-r border-cloud dark:border-nebula-purple/50 sticky left-0 bg-slate-50 dark:bg-slate-900/50 z-10">
                Employee
              </th>
              {weekDates.map((d) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th
                    key={d.toISOString()}
                    className="p-2 text-center border-b border-cloud dark:border-nebula-purple/50 min-w-[80px]"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-silver-mist font-medium uppercase">
                        {d.toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          isWeekend ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {String(d.getDate()).padStart(2, '0')}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="p-4 text-center border-b border-cloud dark:border-nebula-purple/50 min-w-[70px]">
                Hours
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
            {loading ? (
              <tr>
                <td colSpan={9} className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  {employees.length === 0
                    ? 'No employees found'
                    : 'No employees match the current search / filters'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const total = hoursForEmployee(emp.id);
                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 border-r border-cloud dark:border-nebula-purple/50 sticky left-0 bg-white dark:bg-stellar-blue z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-500">
                          {emp.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-ink-black dark:text-pearl">{emp.name}</div>
                          <div className="text-xs text-silver-mist">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((d) => {
                      const dateStr = isoDate(d);
                      const r = rosterByKey.get(`${emp.id}:${dateStr}`);
                      const cellLabel = r?.isWeekOff
                        ? 'WO'
                        : r?.isHoliday
                          ? 'H'
                          : r?.shift?.name?.slice(0, 3).toUpperCase() ||
                            shifts.find((s) => s.id === r?.shiftId)?.code ||
                            '—';
                      const color = r?.isWeekOff
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : r?.isHoliday
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : r
                            ? shiftColorById.get(r.shiftId) || SHIFT_COLORS[0]
                            : 'bg-white text-slate-300 border-slate-200 border-dashed';
                      return (
                        <td
                          key={dateStr}
                          onClick={() => setEditing({ empId: emp.id, date: dateStr, existing: r })}
                          className="p-2 text-center border-r border-cloud dark:border-nebula-purple/20 cursor-pointer"
                        >
                          <div className="group relative w-full h-12 rounded-lg flex items-center justify-center hover:ring-2 hover:ring-indigo-200 transition-all">
                            <div className={`px-2 py-1 rounded text-xs font-bold border ${color}`}>
                              {cellLabel}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center text-xs text-silver-mist">
                      {total ? `${total}h` : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <RosterCellModal
          empId={editing.empId}
          date={editing.date}
          existing={editing.existing}
          shifts={shifts}
          onClose={() => setEditing(null)}
          onSave={(choice) => saveRoster(editing.empId, editing.date, choice)}
        />
      )}
    </div>
  );
}

function RosterCellModal({
  empId,
  date,
  existing,
  shifts,
  onClose,
  onSave,
}: {
  empId: string;
  date: string;
  existing?: Roster;
  shifts: Shift[];
  onClose: () => void;
  onSave: (c: { shiftId?: string; isWeekOff?: boolean; isHoliday?: boolean }) => void;
}) {
  const [mode, setMode] = useState<'shift' | 'week-off' | 'holiday' | 'clear'>(
    existing?.isWeekOff
      ? 'week-off'
      : existing?.isHoliday
        ? 'holiday'
        : existing
          ? 'shift'
          : 'shift'
  );
  const [shiftId, setShiftId] = useState<string>(existing?.shiftId || shifts[0]?.id || '');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-stellar-blue w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cloud dark:border-nebula-purple/30">
          <h3 className="font-bold">
            Roster ·{' '}
            {new Date(date).toLocaleDateString(undefined, {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            })}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3 text-sm">
          <div className="text-xs text-silver-mist">
            Employee: <span className="font-mono">{empId}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['shift', 'week-off', 'holiday', 'clear'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded text-xs font-bold border ${
                  mode === m
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {m === 'shift'
                  ? 'Shift'
                  : m === 'week-off'
                    ? 'Week off'
                    : m === 'holiday'
                      ? 'Holiday'
                      : 'Clear'}
              </button>
            ))}
          </div>
          {mode === 'shift' && (
            <label className="block">
              <span className="block text-xs font-medium text-silver-mist mb-1">Shift</span>
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full px-3 py-2 bg-pearl dark:bg-slate-900/40 rounded-lg text-sm border border-cloud dark:border-nebula-purple/50"
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.startTime}–{s.endTime} ({s.workHours}h)
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-cloud dark:border-nebula-purple/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (mode === 'shift') onSave({ shiftId });
              else if (mode === 'week-off') onSave({ isWeekOff: true });
              else if (mode === 'holiday') onSave({ isHoliday: true });
              else onSave({});
            }}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
