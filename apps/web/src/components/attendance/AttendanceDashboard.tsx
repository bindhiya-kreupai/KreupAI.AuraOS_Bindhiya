'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Users,
  MapPin,
  Smartphone,
  BarChart3,
  RefreshCw,
  LogIn,
  LogOut,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'WFH' | 'LEAVE' | 'HOLIDAY';
type _ClockMethod = 'BIOMETRIC' | 'MOBILE' | 'WEB' | 'CARD';

interface DayStatus {
  status: AttendanceStatus;
  clockIn: string | null;
  clockOut: string | null;
  hours: number;
}

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  status: AttendanceStatus;
  clockIn: string | null;
}

interface DeptStats {
  department: string;
  present: number;
  total: number;
  percentage: number;
}

interface WeekHeatmap {
  date: string;
  dayLabel: string;
  hours: number;
  status: AttendanceStatus;
}

interface Anomaly {
  id: string;
  employeeCode: string;
  employeeName: string;
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const today = new Date();
const todayStr = today.toISOString().slice(0, 10);
const _todayTime = new Date().toTimeString().slice(0, 5);

const MOCK_TODAY_SNAPSHOT = {
  present: 201,
  absent: 18,
  late: 12,
  onLeave: 8,
  wfh: 8,
  total: 247,
};

const MOCK_CURRENT_USER: DayStatus = {
  status: 'PRESENT',
  clockIn: `${todayStr}T09:02:00Z`,
  clockOut: null,
  hours: 7.5,
};

const MOCK_WEEK: WeekHeatmap[] = [
  { date: '2026-02-23', dayLabel: 'Mon', hours: 8.5, status: 'PRESENT' },
  { date: '2026-02-24', dayLabel: 'Tue', hours: 8.0, status: 'PRESENT' },
  { date: '2026-02-25', dayLabel: 'Wed', hours: 7.5, status: 'PRESENT' },
  { date: '2026-02-21', dayLabel: 'Sat', hours: 0, status: 'HOLIDAY' },
  { date: '2026-02-22', dayLabel: 'Sun', hours: 0, status: 'HOLIDAY' },
  { date: '2026-02-20', dayLabel: 'Thu', hours: 8.0, status: 'WFH' },
  { date: '2026-02-19', dayLabel: 'Fri', hours: 4.5, status: 'HALF_DAY' },
];

const MOCK_TEAM: TeamMember[] = [
  { id: 'e1', name: 'Priya Sharma', initials: 'PS', status: 'PRESENT', clockIn: '09:02' },
  { id: 'e2', name: 'Rahul Mehta', initials: 'RM', status: 'PRESENT', clockIn: '08:45' },
  { id: 'e3', name: 'Anita Nair', initials: 'AN', status: 'WFH', clockIn: '09:30' },
  { id: 'e4', name: 'Suresh Kumar', initials: 'SK', status: 'ABSENT', clockIn: null },
  { id: 'e5', name: 'Kavita Singh', initials: 'KS', status: 'LEAVE', clockIn: null },
  { id: 'e6', name: 'Ahmed Al-Rashid', initials: 'AA', status: 'LATE', clockIn: '10:45' },
];

const MOCK_DEPT_STATS: DeptStats[] = [
  { department: 'Engineering', present: 75, total: 82, percentage: 91.5 },
  { department: 'Sales', present: 52, total: 55, percentage: 94.5 },
  { department: 'Finance', present: 20, total: 22, percentage: 90.9 },
  { department: 'HR', present: 16, total: 18, percentage: 88.9 },
  { department: 'Operations', present: 38, total: 50, percentage: 76.0 },
];

const MOCK_ANOMALIES: Anomaly[] = [
  {
    id: 'a1',
    employeeCode: 'EMP004',
    employeeName: 'Suresh Kumar',
    type: 'Missing Punch-Out',
    description: 'No clock-out recorded yesterday',
    severity: 'MEDIUM',
  },
  {
    id: 'a2',
    employeeCode: 'EMP006',
    employeeName: 'Ahmed Al-Rashid',
    type: 'Late Arrival',
    description: 'Arrived 1h 45m late today',
    severity: 'LOW',
  },
  {
    id: 'a3',
    employeeCode: 'EMP009',
    employeeName: 'Meera Pillai',
    type: 'Missing Punch-In',
    description: 'No clock-in yesterday',
    severity: 'MEDIUM',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<AttendanceStatus, { bg: string; text: string; label: string }> = {
  PRESENT: { bg: 'bg-green-500', text: 'text-green-700', label: 'Present' },
  ABSENT: { bg: 'bg-red-500', text: 'text-red-700', label: 'Absent' },
  LATE: { bg: 'bg-orange-400', text: 'text-orange-700', label: 'Late' },
  HALF_DAY: { bg: 'bg-yellow-400', text: 'text-yellow-700', label: 'Half Day' },
  WFH: { bg: 'bg-blue-500', text: 'text-blue-700', label: 'WFH' },
  LEAVE: { bg: 'bg-purple-500', text: 'text-purple-700', label: 'On Leave' },
  HOLIDAY: { bg: 'bg-gray-400', text: 'text-gray-600', label: 'Holiday' },
};

function HeatCell({
  status,
  hours,
  label,
}: {
  status: AttendanceStatus;
  hours: number;
  label: string;
}) {
  const intensity =
    hours > 9 ? 'opacity-100' : hours > 7 ? 'opacity-80' : hours > 0 ? 'opacity-50' : 'opacity-20';
  const color = STATUS_COLORS[status].bg;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-10 h-10 rounded-lg ${color} ${intensity} flex items-center justify-center`}
      >
        <span className="text-white text-xs font-bold">{hours > 0 ? hours.toFixed(1) : '—'}</span>
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AttendanceDashboard() {
  const [clockedIn, setClockedIn] = useState(
    !!MOCK_CURRENT_USER.clockIn && !MOCK_CURRENT_USER.clockOut
  );
  const [clockInTime, setClockInTime] = useState<string | null>(
    MOCK_CURRENT_USER.clockIn
      ? new Date(MOCK_CURRENT_USER.clockIn).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null
  );
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockLoading, setClockLoading] = useState(false);
  const [showRegForm, setShowRegForm] = useState(false);
  const [regReason, setRegReason] = useState('');

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsedHours = clockInTime
    ? (
        (currentTime.getTime() -
          new Date(`${todayStr}T${clockInTime.replace(':', ':')}:00`).getTime()) /
        3600000
      ).toFixed(1)
    : '0.0';

  const handleClockIn = async () => {
    setClockLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const time = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setClockInTime(time);
    setClockedIn(true);
    setClockLoading(false);
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const time = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setClockOutTime(time);
    setClockedIn(false);
    setClockLoading(false);
  };

  const presentPct = Math.round((MOCK_TODAY_SNAPSHOT.present / MOCK_TODAY_SNAPSHOT.total) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              {today.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800 tabular-nums">
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Clock In/Out Widget */}
            <div
              className={`rounded-xl shadow-sm p-5 border-2 transition-colors ${
                clockedIn ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Your Attendance Today</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    clockedIn
                      ? 'bg-green-100 text-green-700'
                      : clockOutTime
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {clockedIn ? 'Clocked In' : clockOutTime ? 'Completed' : 'Not Started'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-500">Clock In</p>
                  <p className="text-lg font-bold text-gray-800 mt-0.5">{clockInTime ?? '—'}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-500">Clock Out</p>
                  <p className="text-lg font-bold text-gray-800 mt-0.5">{clockOutTime ?? '—'}</p>
                </div>
              </div>

              {clockedIn && (
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-500">Elapsed Today</p>
                  <p className="text-3xl font-bold text-green-700">{elapsedHours}h</p>
                </div>
              )}

              <div className="flex gap-2">
                {!clockedIn && !clockOutTime && (
                  <button
                    onClick={handleClockIn}
                    disabled={clockLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 disabled:opacity-60 transition-colors"
                  >
                    {clockLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    Clock In
                  </button>
                )}
                {clockedIn && (
                  <button
                    onClick={handleClockOut}
                    disabled={clockLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {clockLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    Clock Out
                  </button>
                )}
                {clockOutTime && (
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Day Completed
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                  <MapPin className="w-3.5 h-3.5" /> GPS
                </button>
                <button
                  onClick={() => setShowRegForm((r) => !r)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regularize
                </button>
              </div>

              {showRegForm && (
                <div className="mt-3 border-t border-gray-200 pt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-700">Regularization Request</p>
                  <textarea
                    rows={2}
                    value={regReason}
                    onChange={(e) => setRegReason(e.target.value)}
                    placeholder="Reason for regularization..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                  <button className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                    Submit Request
                  </button>
                </div>
              )}
            </div>

            {/* Weekly Heatmap */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">This Week</h3>
              <div className="flex gap-2 justify-between">
                {MOCK_WEEK.sort((a, b) => a.date.localeCompare(b.date)).map((day) => (
                  <HeatCell
                    key={day.date}
                    status={day.status}
                    hours={day.hours}
                    label={day.dayLabel}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(['PRESENT', 'WFH', 'HALF_DAY', 'HOLIDAY'] as AttendanceStatus[]).map((s) => (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${STATUS_COLORS[s].bg}`} />
                    <span className="text-xs text-gray-500">{STATUS_COLORS[s].label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Anomalies */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-red-50 border-b border-red-100 px-4 py-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-semibold text-red-800">Attendance Anomalies</h3>
                <span className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {MOCK_ANOMALIES.length}
                </span>
              </div>
              {MOCK_ANOMALIES.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.severity === 'HIGH' ? 'bg-red-500' : a.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-400'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">
                      {a.employeeName} ({a.employeeCode})
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.type}: {a.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Team + Stats */}
          <div className="xl:col-span-2 space-y-4">
            {/* Today's Snapshot */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Today&apos;s Snapshot — {MOCK_TODAY_SNAPSHOT.total} Employees
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {[
                  {
                    label: 'Present',
                    value: MOCK_TODAY_SNAPSHOT.present,
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                  },
                  {
                    label: 'Absent',
                    value: MOCK_TODAY_SNAPSHOT.absent,
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-200',
                  },
                  {
                    label: 'Late',
                    value: MOCK_TODAY_SNAPSHOT.late,
                    bg: 'bg-orange-50',
                    text: 'text-orange-700',
                    border: 'border-orange-200',
                  },
                  {
                    label: 'On Leave',
                    value: MOCK_TODAY_SNAPSHOT.onLeave,
                    bg: 'bg-purple-50',
                    text: 'text-purple-700',
                    border: 'border-purple-200',
                  },
                  {
                    label: 'WFH',
                    value: MOCK_TODAY_SNAPSHOT.wfh,
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`text-center p-3 rounded-xl ${stat.bg} border ${stat.border}`}
                  >
                    <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
                    <p className={`text-xs mt-0.5 ${stat.text} opacity-80`}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Overall attendance bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Attendance Rate</span>
                  <span className="font-semibold text-gray-800">{presentPct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${presentPct >= 90 ? 'bg-green-500' : presentPct >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${presentPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Department-wise Attendance */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                <BarChart3 className="w-4 h-4 inline mr-1 text-gray-500" /> Department Attendance
              </h3>
              <div className="space-y-3">
                {MOCK_DEPT_STATS.map((dept) => (
                  <div key={dept.department}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{dept.department}</span>
                      <span className="text-gray-500">
                        {dept.present}/{dept.total} ({dept.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${dept.percentage >= 90 ? 'bg-green-500' : dept.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Attendance */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-800">My Team — Today</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
                {MOCK_TEAM.map((member) => {
                  const statusConf = STATUS_COLORS[member.status];
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${statusConf.bg}`}
                      >
                        {member.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{member.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-xs font-medium ${statusConf.text}`}>
                            {statusConf.label}
                          </span>
                          {member.clockIn && (
                            <span className="text-xs text-gray-400">· {member.clockIn}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
