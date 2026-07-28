'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CalendarDays, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiJson } from '@/lib/api-utils';
import { ShiftCalendar, type RosterEntry } from '@/components/shift-calendar';

type Employee = { id: string; firstName: string; lastName: string; employeeCode?: string };
type Shift = {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  workHours: number;
};

export default function RosterCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [rosters, setRosters] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<RosterEntry | null>(null);

  const monthStart = useMemo(() => format(currentMonth, 'yyyy-MM-01'), [currentMonth]);
  const monthEnd = useMemo(() => {
    const last = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return format(last, 'yyyy-MM-dd');
  }, [currentMonth]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, shiftRes, rosterRes] = await Promise.all([
        apiJson<Employee[]>(
          '/api/v1/employees?limit=500&fields=id,firstName,lastName,employeeCode'
        ),
        apiJson<Shift[]>('/api/v1/shifts?limit=100'),
        apiJson<RosterEntry[]>(
          `/api/v1/shift-rosters?startDate=${monthStart}&endDate=${monthEnd}&limit=5000`
        ),
      ]);
      if (empRes.ok) setEmployees(empRes.data);
      if (shiftRes.ok) setShifts(shiftRes.data);
      if (rosterRes.ok) setRosters(rosterRes.data);
    } catch (err) {
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCellClick = useCallback(
    (employeeId: string, date: Date, entry: RosterEntry | null) => {
      const emp = employees.find((e) => e.id === employeeId) || null;
      setSelectedEmployee(emp);
      setSelectedDate(date);
      setSelectedEntry(entry);
      setModalOpen(true);
    },
    [employees]
  );

  const handleAssignShift = async (
    shiftId: string | null,
    isWeekOff: boolean,
    isHoliday: boolean
  ) => {
    if (!selectedEmployee || !selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    if (selectedEntry?.id) {
      const body: Record<string, any> = {};
      if (shiftId) body.shiftId = shiftId;
      body.isWeekOff = isWeekOff;
      body.isHoliday = isHoliday;
      const res = await apiJson(`/api/v1/shift-rosters/${selectedEntry.id}`, {
        method: 'PUT',
        body,
      });
      if (!res.ok) {
        toast.error(res.error?.message || 'Failed to update');
        return;
      }
    } else {
      if (!shiftId && !isWeekOff && !isHoliday) return;
      const res = await apiJson('/api/v1/shift-rosters', {
        method: 'POST',
        body: {
          employeeId: selectedEmployee.id,
          shiftId: shiftId || '',
          rosterDate: dateStr,
          isWeekOff,
          isHoliday,
        },
      });
      if (!res.ok) {
        toast.error(res.error?.message || 'Failed to create');
        return;
      }
    }

    toast.success('Roster updated');
    setModalOpen(false);
    fetchData();
  };

  const handleRemove = async () => {
    if (!selectedEntry?.id) {
      toast.error('No entry to remove');
      return;
    }
    const res = await apiJson(`/api/v1/shift-rosters/${selectedEntry.id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(res.error?.message || 'Failed to remove');
      return;
    }
    toast.success('Roster entry removed');
    setModalOpen(false);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/attendance/shift-management"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            &larr; Shift Management
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Roster Calendar
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monthly view of shift assignments — click a cell to assign or change a shift
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <ShiftCalendar
            rosters={rosters}
            employees={employees}
            shifts={shifts}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onCellClick={handleCellClick}
            loading={loading}
          />
        </div>
      </div>

      {modalOpen && selectedEmployee && selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-500">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assign shift
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {shifts
                  .filter((s) => s.id)
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleAssignShift(s.id, false, false)}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        selectedEntry?.shiftId === s.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <div className="font-medium">{s.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {s.startTime} - {s.endTime}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAssignShift(null, true, false)}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedEntry?.isWeekOff
                    ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Week Off
              </button>
              <button
                onClick={() => handleAssignShift(null, false, true)}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedEntry?.isHoliday
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                }`}
              >
                Holiday
              </button>
            </div>

            {selectedEntry?.id && (
              <button
                onClick={handleRemove}
                className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Remove entry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
