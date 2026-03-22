/**
 * @module MobileAttendance
 * @description Mobile attendance — clock in/out, timeline, weekly bar chart,
 *              monthly calendar view, GPS, and regularization (Sec 15.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Edit3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'holiday'
  | 'weekend'
  | 'leave';

interface TimelineEntry {
  time: string;
  label: string;
  type: 'in' | 'break_start' | 'break_end' | 'out';
}

interface DayAttendance {
  date: number;
  status: AttendanceStatus;
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const STATUS_DOT: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-400',
  absent: 'bg-red-400',
  late: 'bg-amber-400',
  half_day: 'bg-yellow-400',
  holiday: 'bg-blue-300',
  weekend: 'bg-gray-200',
  leave: 'bg-violet-400',
};

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function WeeklyBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 9);
  return (
    <div className="flex items-end gap-1 h-24 mt-2">
      {data.map((hours, i) => {
        const heightPct = (hours / max) * 100;
        const isWeekend = i >= 5;
        const isToday = i === 4; // Friday = today (demo)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500">{hours > 0 ? hours : ''}</span>
            <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  isWeekend
                    ? 'bg-gray-100'
                    : isToday
                      ? 'bg-indigo-500'
                      : hours < 7 && hours > 0
                        ? 'bg-amber-400'
                        : 'bg-indigo-200'
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span
              className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}
            >
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MobileAttendance() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState('--:--');
  const [showRegularize, setShowRegularize] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [calendarData, setCalendarData] = useState<DayAttendance[]>([]);
  const [clockInTime, setClockInTime] = useState('');
  const [location, setLocation] = useState('');
  const [shift, setShift] = useState('');

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/attendance/today');
      const json = await res.json();
      const rec = json.data;
      if (rec) {
        setIsClockedIn(!!rec.clockIn && !rec.clockOut);
        if (rec.clockIn) {
          const d = new Date(rec.clockIn);
          setClockInTime(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        }
        if (rec.timeline) setTimeline(rec.timeline);
        if (rec.location) setLocation(rec.location);
        if (rec.shift) setShift(rec.shift);
      }
    } catch { /* silent */ }
    try {
      const res = await fetch('/api/v1/attendance/summary?month=' + (new Date().getMonth() + 1) + '&year=' + new Date().getFullYear());
      const json = await res.json();
      if (json.data?.weeklyHours) setWeeklyHours(json.data.weeklyHours);
      if (json.data?.calendar) setCalendarData(json.data.calendar);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  const handleClockToggle = async () => {
    try {
      const endpoint = isClockedIn ? '/api/v1/attendance/check-out' : '/api/v1/attendance/check-in';
      await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'app' }) });
      setIsClockedIn(!isClockedIn);
      fetchAttendance();
    } catch { /* silent */ }
  };

  const totalHours = weeklyHours.reduce((a, b) => a + b, 0);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const monthStr = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500">{dateStr}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Clock In/Out Button */}
        <div className="mx-4 mt-4 bg-white rounded-3xl p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-gray-900 mb-1">{currentTime}</div>
          <p className="text-sm text-gray-400 mb-5">Current time</p>

          <button
            onClick={handleClockToggle}
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center font-bold text-lg shadow-lg transition-all active:scale-95 ${
              isClockedIn
                ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-200'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200'
            }`}
          >
            <Clock className="w-8 h-8 mb-1" />
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </button>

          {isClockedIn && (
            <div className="mt-4 flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              <p className="text-sm font-medium">Clocked in at {clockInTime || currentTime}</p>
            </div>
          )}

          {/* GPS */}
          <div className="mt-3 flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <p className="text-xs">{location || 'Fetching location...'}</p>
          </div>

          {/* Shift */}
          <div className="mt-3 bg-gray-50 rounded-xl px-4 py-2.5 w-full text-center">
            <p className="text-xs text-gray-500">Current Shift</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">
              {shift || 'General Shift'}
            </p>
          </div>
        </div>

        {/* Today Timeline */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Today&apos;s Timeline
          </h3>
          <div className="relative pl-5">
            {/* Line */}
            <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-100" />
            <div className="space-y-4">
              {timeline.map((entry, i) => (
                <div key={i} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-3 w-3 h-3 rounded-full border-2 border-white ${
                      entry.type === 'in'
                        ? 'bg-emerald-500'
                        : entry.type === 'out'
                          ? 'bg-red-500'
                          : 'bg-amber-400'
                    }`}
                  />
                  <div className="text-sm font-bold text-gray-800 w-12 flex-shrink-0">
                    {entry.time}
                  </div>
                  <div className="text-sm text-gray-600">{entry.label}</div>
                </div>
              ))}
              {/* Current */}
              {isClockedIn && (
                <div className="relative flex items-start gap-3">
                  <div className="absolute -left-3 w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                  <div className="text-sm font-bold text-indigo-600 w-12 flex-shrink-0">
                    {currentTime}
                  </div>
                  <div className="text-sm text-indigo-600 font-medium">Working... (6h 37m)</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">This Week</h3>
            <span className="text-sm font-bold text-indigo-600">{totalHours.toFixed(1)}h</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">Standard: 40h</p>
          <WeeklyBarChart data={weeklyHours} labels={WEEK_LABELS} />
        </div>

        {/* Monthly Calendar */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {monthStr}
            </h3>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-gray-100">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center text-xs text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid — Feb 2026 starts on Sunday */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map(({ date, status }) => {
              const dotColor = STATUS_DOT[status];
              const isToday = date === today.getDate();
              return (
                <div
                  key={date}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs ${
                    isToday
                      ? 'bg-indigo-600 text-white'
                      : status === 'weekend'
                        ? 'text-gray-300'
                        : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">{date}</span>
                  {!isToday && status !== 'weekend' && (
                    <span className={`w-1 h-1 rounded-full ${dotColor} mt-0.5`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {[
              { label: 'Present', color: 'bg-emerald-400' },
              { label: 'Late', color: 'bg-amber-400' },
              { label: 'Leave', color: 'bg-violet-400' },
              { label: 'Absent', color: 'bg-red-400' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regularization */}
        <div className="mx-4 mt-4 mb-6">
          <button
            onClick={() => setShowRegularize(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-indigo-500" />
            Request Attendance Regularization
          </button>
        </div>
      </div>

      {/* Regularization Modal */}
      {showRegularize && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 p-4">
          <div className="bg-white rounded-2xl w-full p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Regularization Request</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Reason</label>
                <textarea
                  rows={2}
                  placeholder="Reason for regularization..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRegularize(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRegularize(false)}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileAttendance;
