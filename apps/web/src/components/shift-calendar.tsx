'use client';

import { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  isWeekend,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

type Shift = { id: string; code: string; name: string; startTime: string; endTime: string };
type Employee = { id: string; firstName: string; lastName: string; employeeCode?: string };
export type RosterEntry = {
  id: string;
  employeeId: string;
  shiftId: string;
  rosterDate: string;
  isWeekOff: boolean;
  isHoliday: boolean;
  customStartTime?: string | null;
  customEndTime?: string | null;
  shift?: { id: string; name: string } | null;
};

interface ShiftCalendarProps {
  rosters: RosterEntry[];
  employees: Employee[];
  shifts: Shift[];
  currentMonth: Date;
  onMonthChange: (d: Date) => void;
  onCellClick: (employeeId: string, date: Date, entry: RosterEntry | null) => void;
  loading?: boolean;
}

const SHIFT_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300',
];

export function ShiftCalendar({
  rosters,
  employees,
  shifts,
  currentMonth,
  onMonthChange,
  onCellClick,
  loading,
}: ShiftCalendarProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const shiftColorMap = useMemo(() => {
    const map = new Map<string, string>();
    shifts.forEach((s, idx) => map.set(s.id, SHIFT_COLORS[idx % SHIFT_COLORS.length]));
    return map;
  }, [shifts]);

  const rosterMap = useMemo(() => {
    const map = new Map<string, RosterEntry>();
    for (const r of rosters) {
      const key = `${r.employeeId}|${r.rosterDate.slice(0, 10)}`;
      map.set(key, r);
    }
    return map;
  }, [rosters]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div data-testid="roster-calendar" className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 text-left text-xs font-semibold text-slate-500 uppercase min-w-[140px]">
                Employee
              </th>
              {days.map((day) => (
                <th
                  key={day.toISOString()}
                  className={`border border-slate-200 dark:border-slate-700 p-1.5 text-center text-xs font-semibold w-[36px] ${
                    isToday(day)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : isWeekend(day)
                        ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400'
                        : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="text-[10px] leading-tight">{format(day, 'EEE')}</div>
                  <div className="text-sm font-bold">{format(day, 'd')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="group">
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {emp.firstName} {emp.lastName}
                </td>
                {days.map((day) => {
                  const key = `${emp.id}|${format(day, 'yyyy-MM-dd')}`;
                  const entry = rosterMap.get(key);
                  const isCurrMonth = day.getMonth() === currentMonth.getMonth();

                  let cellClass =
                    'border border-slate-200 dark:border-slate-700 p-1 text-center text-xs transition-colors h-8';
                  if (!isCurrMonth) cellClass += ' opacity-30';
                  if (isToday(day)) cellClass += ' ring-2 ring-blue-400 ring-inset';

                  let content: React.ReactNode = null;

                  if (entry?.isWeekOff) {
                    cellClass += ' bg-slate-100 dark:bg-slate-800';
                    content = (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">WO</span>
                    );
                  } else if (entry?.isHoliday) {
                    cellClass += ' bg-purple-100 dark:bg-purple-900/30';
                    content = (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                        H
                      </span>
                    );
                  } else if (entry?.shiftId) {
                    const color = shiftColorMap.get(entry.shiftId) || SHIFT_COLORS[0];
                    cellClass += ` ${color} cursor-pointer`;
                    content = (
                      <div
                        className="text-[10px] leading-tight font-medium truncate"
                        title={entry.shift?.name || ''}
                      >
                        {entry.shift?.name || '—'}
                      </div>
                    );
                  } else if (isCurrMonth) {
                    cellClass +=
                      ' bg-white dark:bg-slate-900/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10';
                  }

                  return (
                    <td
                      key={day.toISOString()}
                      className={cellClass}
                      onClick={() => isCurrMonth && onCellClick(emp.id, day, entry || null)}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
