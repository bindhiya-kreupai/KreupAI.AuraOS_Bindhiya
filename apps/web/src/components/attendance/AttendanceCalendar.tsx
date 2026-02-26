'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, Info, TrendingUp, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'WFH'
  | 'LEAVE'
  | 'HOLIDAY'
  | 'WEEKEND';

interface DayDetail {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  clockIn: string | null;
  clockOut: string | null;
  totalHours: number;
  overtimeHours: number;
  notes: string | null;
}

interface MonthSummary {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  wfhDays: number;
  leaveDays: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
  attendancePct: number;
}

// ---------------------------------------------------------------------------
// Status Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
    border: string;
  }
> = {
  PRESENT: {
    label: 'Present',
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
    border: 'border-green-300',
  },
  ABSENT: {
    label: 'Absent',
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
    border: 'border-red-300',
  },
  LATE: {
    label: 'Late',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    dot: 'bg-orange-400',
    border: 'border-orange-300',
  },
  HALF_DAY: {
    label: 'Half Day',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-400',
    border: 'border-yellow-300',
  },
  WFH: {
    label: 'Work From Home',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    border: 'border-blue-300',
  },
  LEAVE: {
    label: 'On Leave',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    dot: 'bg-purple-500',
    border: 'border-purple-300',
  },
  HOLIDAY: {
    label: 'Holiday',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    border: 'border-gray-300',
  },
  WEEKEND: {
    label: 'Weekend',
    bg: 'bg-slate-50',
    text: 'text-slate-400',
    dot: 'bg-slate-300',
    border: 'border-slate-200',
  },
};

// ---------------------------------------------------------------------------
// Mock Attendance Data Generator
// ---------------------------------------------------------------------------

function generateMockData(year: number, month: number): DayDetail[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const records: DayDetail[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      records.push({
        date,
        status: 'WEEKEND',
        clockIn: null,
        clockOut: null,
        totalHours: 0,
        overtimeHours: 0,
        notes: null,
      });
      continue;
    }

    // Make some days different
    let status: AttendanceStatus = 'PRESENT';
    let clockIn = '09:00';
    let clockOut = '18:00';
    let totalHours = 9;
    let overtimeHours = 1;
    let notes = null;

    if (day === 5) {
      status = 'ABSENT';
      clockIn = null;
      clockOut = null;
      totalHours = 0;
      overtimeHours = 0;
      notes = 'Unplanned absence';
    } else if (day === 10) {
      status = 'LEAVE';
      clockIn = null;
      clockOut = null;
      totalHours = 0;
      overtimeHours = 0;
      notes = 'Annual Leave';
    } else if (day === 15) {
      status = 'HOLIDAY';
      clockIn = null;
      clockOut = null;
      totalHours = 0;
      overtimeHours = 0;
      notes = 'National Holiday';
    } else if (day === 3 || day === 18) {
      status = 'LATE';
      clockIn = '10:30';
      totalHours = 7.5;
      overtimeHours = 0;
      notes = 'Late arrival';
    } else if (day === 7) {
      status = 'HALF_DAY';
      clockIn = '09:00';
      clockOut = '13:30';
      totalHours = 4.5;
      overtimeHours = 0;
      notes = 'Half-day leave';
    } else if (day === 11 || day === 12 || day === 20) {
      status = 'WFH';
      clockIn = '09:30';
      clockOut = '18:30';
      totalHours = 9;
      overtimeHours = 1;
      notes = 'Work from home';
    }

    const today = new Date();
    if (new Date(date) > today) {
      // Future dates — no data
      records.push({
        date,
        status: 'WEEKEND',
        clockIn: null,
        clockOut: null,
        totalHours: 0,
        overtimeHours: 0,
        notes: 'Future',
      });
      continue;
    }

    records.push({ date, status, clockIn, clockOut, totalHours, overtimeHours, notes });
  }

  return records;
}

function computeSummary(records: DayDetail[]): MonthSummary {
  const working = records.filter((r) => r.status !== 'WEEKEND' && r.status !== 'HOLIDAY');
  return {
    presentDays: records.filter((r) => r.status === 'PRESENT').length,
    absentDays: records.filter((r) => r.status === 'ABSENT').length,
    lateDays: records.filter((r) => r.status === 'LATE').length,
    halfDays: records.filter((r) => r.status === 'HALF_DAY').length,
    wfhDays: records.filter((r) => r.status === 'WFH').length,
    leaveDays: records.filter((r) => r.status === 'LEAVE').length,
    totalHoursWorked: records.reduce((s, r) => s + r.totalHours, 0),
    totalOvertimeHours: records.reduce((s, r) => s + r.overtimeHours, 0),
    attendancePct:
      working.length > 0
        ? Math.round(
            (records.filter((r) => ['PRESENT', 'WFH', 'LATE', 'HALF_DAY'].includes(r.status))
              .length /
              working.length) *
              100
          )
        : 0,
  };
}

const MOCK_EMPLOYEES = [
  { id: 'emp-001', name: 'Priya Sharma', code: 'EMP001' },
  { id: 'emp-002', name: 'Rahul Mehta', code: 'EMP002' },
  { id: 'emp-003', name: 'Anita Nair', code: 'EMP003' },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AttendanceCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState(MOCK_EMPLOYEES[0].id);

  const records = useMemo(
    () => generateMockData(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
  const summary = useMemo(() => computeSummary(records), [records]);

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const _daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', {
    month: 'long',
  });

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else setCurrentMonth((m) => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else setCurrentMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const selectedRecord = selectedDate ? records.find((r) => r.date === selectedDate) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monthly attendance view with daily status tracking
            </p>
          </div>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {MOCK_EMPLOYEES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.code})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <h2 className="text-base font-bold text-gray-800">
                {monthName} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[72px] border-r border-b border-gray-50" />
              ))}

              {/* Day cells */}
              {records.map((record) => {
                const dayNum = parseInt(record.date.split('-')[2]);
                const isToday = record.date === today.toISOString().slice(0, 10);
                const isSelected = record.date === selectedDate;
                const isFuture = new Date(record.date) > today;
                const conf = STATUS_CONFIG[record.status];

                return (
                  <div
                    key={record.date}
                    onClick={() =>
                      !isFuture &&
                      record.status !== 'FUTURE' &&
                      setSelectedDate(isSelected ? null : record.date)
                    }
                    className={`min-h-[72px] border-r border-b border-gray-50 p-1.5 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-50'
                        : isFuture
                          ? 'opacity-30 cursor-default'
                          : record.status === 'WEEKEND'
                            ? 'bg-slate-50/50 hover:bg-slate-50'
                            : `hover:${conf.bg}`
                    }`}
                  >
                    <div className={`flex items-center justify-between mb-1`}>
                      <span
                        className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                          isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    {!isFuture && record.status !== 'WEEKEND' && (
                      <div
                        className={`text-center py-0.5 px-1 rounded text-xs font-medium ${conf.bg} ${conf.text} truncate`}
                      >
                        {conf.label.split(' ')[0]}
                      </div>
                    )}

                    {record.status === 'PRESENT' ||
                    record.status === 'LATE' ||
                    record.status === 'WFH' ? (
                      <div className="text-center text-xs text-gray-400 mt-0.5">
                        {record.totalHours > 0 ? `${record.totalHours}h` : ''}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Day Detail */}
            {selectedRecord ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div
                  className={`px-4 py-3 ${STATUS_CONFIG[selectedRecord.status].bg} border-b border-gray-200`}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-semibold text-sm ${STATUS_CONFIG[selectedRecord.status].text}`}
                    >
                      {new Date(selectedRecord.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <button onClick={() => setSelectedDate(null)}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[selectedRecord.status].bg} ${STATUS_CONFIG[selectedRecord.status].text} border ${STATUS_CONFIG[selectedRecord.status].border}`}
                  >
                    {STATUS_CONFIG[selectedRecord.status].label}
                  </span>
                </div>
                <div className="p-4 space-y-2.5">
                  {selectedRecord.clockIn && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Clock In
                      </span>
                      <span className="font-medium text-gray-800">{selectedRecord.clockIn}</span>
                    </div>
                  )}
                  {selectedRecord.clockOut && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Clock Out
                      </span>
                      <span className="font-medium text-gray-800">{selectedRecord.clockOut}</span>
                    </div>
                  )}
                  {selectedRecord.totalHours > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total Hours</span>
                      <span className="font-medium text-gray-800">
                        {selectedRecord.totalHours}h
                      </span>
                    </div>
                  )}
                  {selectedRecord.overtimeHours > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-orange-500" /> Overtime
                      </span>
                      <span className="font-medium text-orange-600">
                        {selectedRecord.overtimeHours}h
                      </span>
                    </div>
                  )}
                  {selectedRecord.notes && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                      <Info className="w-3.5 h-3.5 inline mr-1" />
                      {selectedRecord.notes}
                    </div>
                  )}
                  {selectedRecord.status === 'ABSENT' && (
                    <button className="w-full text-xs py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                      Request Regularization
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Click a day for details</p>
              </div>
            )}

            {/* Month Summary */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Month Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Present', value: summary.presentDays, conf: STATUS_CONFIG.PRESENT },
                  { label: 'Absent', value: summary.absentDays, conf: STATUS_CONFIG.ABSENT },
                  { label: 'Late', value: summary.lateDays, conf: STATUS_CONFIG.LATE },
                  { label: 'Half Day', value: summary.halfDays, conf: STATUS_CONFIG.HALF_DAY },
                  { label: 'WFH', value: summary.wfhDays, conf: STATUS_CONFIG.WFH },
                  { label: 'Leave', value: summary.leaveDays, conf: STATUS_CONFIG.LEAVE },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between p-2 rounded-lg ${item.conf.bg}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${item.conf.dot}`} />
                      <span className={item.conf.text}>{item.label}</span>
                    </div>
                    <span className={`font-bold ${item.conf.text}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Hours Worked</span>
                  <span className="font-semibold text-gray-800">
                    {summary.totalHoursWorked.toFixed(0)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Overtime Hours</span>
                  <span className="font-semibold text-orange-600">
                    {summary.totalOvertimeHours.toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Attendance %</span>
                  <span
                    className={`font-bold ${summary.attendancePct >= 90 ? 'text-green-600' : summary.attendancePct >= 80 ? 'text-yellow-600' : 'text-red-600'}`}
                  >
                    {summary.attendancePct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Legend
              </h3>
              <div className="space-y-1">
                {(Object.keys(STATUS_CONFIG) as AttendanceStatus[])
                  .filter((s) => s !== 'WEEKEND')
                  .map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${STATUS_CONFIG[s].dot}`} />
                      <span className="text-xs text-gray-600">{STATUS_CONFIG[s].label}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
