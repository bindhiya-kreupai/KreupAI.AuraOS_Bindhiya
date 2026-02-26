/**
 * @module MobileESSDashboard
 * @description Mobile-first Employee Self-Service dashboard — quick actions,
 *              profile summary, leave balances, payslip preview, attendance, pending requests (Sec 15.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock3,
  XCircle,
  Activity,
  Bell,
  User,
  MapPin,
  Briefcase,
  Hash,
  TrendingDown,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type LeaveType = 'annual' | 'sick' | 'casual' | 'wfh';
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'processing';

interface LeaveBalance {
  type: LeaveType;
  label: string;
  total: number;
  used: number;
  remaining: number;
  color: string;
  bgColor: string;
  iconColor: string;
}

interface PayslipPreview {
  month: string;
  year: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  taxDeducted: number;
  pfDeducted: number;
  bonusIncluded: boolean;
}

interface AttendanceSummary {
  workingDays: number;
  daysPresent: number;
  lateArrivals: number;
  earlyDepartures: number;
  avgCheckIn: string;
  avgCheckOut: string;
  hoursWorked: number;
  requiredHours: number;
}

interface PendingRequest {
  id: string;
  type: 'leave' | 'expense' | 'overtime' | 'wfh' | 'profile-change';
  title: string;
  description: string;
  submittedAt: string;
  status: RequestStatus;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const EMPLOYEE_PROFILE = {
  name: 'Jane Doe',
  initials: 'JD',
  employeeId: 'EMP-001',
  department: 'Engineering',
  designation: 'Sr. Software Engineer',
  location: 'San Francisco, CA',
  reportingTo: 'Tom Johnson',
  joinDate: 'Mar 2022',
};

const LEAVE_BALANCES: LeaveBalance[] = [
  {
    type: 'annual',
    label: 'Annual Leave',
    total: 21,
    used: 8,
    remaining: 13,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    type: 'sick',
    label: 'Sick Leave',
    total: 12,
    used: 2,
    remaining: 10,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    type: 'casual',
    label: 'Casual Leave',
    total: 8,
    used: 3,
    remaining: 5,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    type: 'wfh',
    label: 'WFH Days',
    total: 52,
    used: 18,
    remaining: 34,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
];

const PAYSLIP_PREVIEW: PayslipPreview = {
  month: 'January',
  year: '2026',
  grossPay: 12833,
  deductions: 2580,
  netPay: 10253,
  taxDeducted: 1840,
  pfDeducted: 740,
  bonusIncluded: false,
};

const ATTENDANCE_SUMMARY: AttendanceSummary = {
  workingDays: 21,
  daysPresent: 19,
  lateArrivals: 2,
  earlyDepartures: 1,
  avgCheckIn: '09:08',
  avgCheckOut: '18:22',
  hoursWorked: 152,
  requiredHours: 168,
};

const PENDING_REQUESTS: PendingRequest[] = [
  {
    id: 'req-001',
    type: 'leave',
    title: 'Annual Leave',
    description: 'Mar 3–7, 2026 (5 days)',
    submittedAt: '2 days ago',
    status: 'pending',
  },
  {
    id: 'req-002',
    type: 'expense',
    title: 'Conference Expense',
    description: 'AWS re:Invent 2026 — $1,240',
    submittedAt: '1 week ago',
    status: 'approved',
  },
  {
    id: 'req-003',
    type: 'overtime',
    title: 'Overtime Claim',
    description: 'Feb 22 — 6 hrs sprint work',
    submittedAt: '3 days ago',
    status: 'processing',
  },
  {
    id: 'req-004',
    type: 'profile-change',
    title: 'Address Update',
    description: '456 Market St, San Francisco',
    submittedAt: '5 days ago',
    status: 'approved',
  },
  {
    id: 'req-005',
    type: 'wfh',
    title: 'WFH Request',
    description: 'Feb 27 (Child care)',
    submittedAt: '3 hours ago',
    status: 'pending',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function requestStatusConfig(status: RequestStatus) {
  const map = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock3 },
    approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  };
  return map[status];
}

function requestTypeConfig(type: PendingRequest['type']) {
  const map = {
    leave: { label: 'Leave', color: 'bg-blue-100 text-blue-700' },
    expense: { label: 'Expense', color: 'bg-amber-100 text-amber-700' },
    overtime: { label: 'OT Claim', color: 'bg-purple-100 text-purple-700' },
    wfh: { label: 'WFH', color: 'bg-teal-100 text-teal-700' },
    'profile-change': { label: 'Profile', color: 'bg-gray-100 text-gray-600' },
  };
  return map[type];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function QuickActionsBar() {
  const [clockedIn, setClockedIn] = useState(true);
  const [clockTime, _setClockTime] = useState('09:08 AM');

  const actions = [
    { label: 'Apply Leave', icon: Calendar, color: 'bg-blue-500' },
    {
      label: clockedIn ? 'Clock Out' : 'Clock In',
      icon: clockedIn ? LogOut : LogIn,
      color: clockedIn ? 'bg-red-500' : 'bg-emerald-500',
      action: () => setClockedIn(!clockedIn),
    },
    { label: 'Submit Expense', icon: DollarSign, color: 'bg-amber-500' },
    { label: 'View Payslip', icon: FileText, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-3">
      {/* Clock status */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${clockedIn ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${clockedIn ? 'bg-emerald-500' : 'bg-red-500'}`}
          />
          <span
            className={`text-sm font-medium ${clockedIn ? 'text-emerald-700' : 'text-red-700'}`}
          >
            {clockedIn ? `Clocked In at ${clockTime}` : 'Not clocked in yet'}
          </span>
        </div>
        <button
          onClick={() => setClockedIn(!clockedIn)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium ${clockedIn ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
        >
          {clockedIn ? 'Clock Out' : 'Clock In'}
        </button>
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.action}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center leading-tight">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProfileSummaryCard() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-xl font-bold">
          {EMPLOYEE_PROFILE.initials}
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">{EMPLOYEE_PROFILE.name}</h2>
          <p className="text-blue-100 text-xs">{EMPLOYEE_PROFILE.designation}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-blue-100">
          <Briefcase className="w-3.5 h-3.5 shrink-0" />
          <span>{EMPLOYEE_PROFILE.department}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-100">
          <Hash className="w-3.5 h-3.5 shrink-0" />
          <span>{EMPLOYEE_PROFILE.employeeId}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-100">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{EMPLOYEE_PROFILE.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-100">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>{EMPLOYEE_PROFILE.reportingTo}</span>
        </div>
      </div>
    </div>
  );
}

function LeaveBalanceSection() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">Leave Balance</h3>
        <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
          Apply <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {LEAVE_BALANCES.map((lb) => {
          const usedPct = Math.round((lb.used / lb.total) * 100);
          return (
            <div key={lb.type} className={`${lb.bgColor} rounded-xl p-3`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600">{lb.label}</p>
              </div>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className={`text-2xl font-bold ${lb.color}`}>{lb.remaining}</span>
                  <span className="text-xs text-gray-400 ml-1">/ {lb.total}</span>
                </div>
                <span className="text-xs text-gray-400">{lb.used} used</span>
              </div>
              <div className="h-1.5 bg-white bg-opacity-60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${lb.color.replace('text-', 'bg-').replace('-600', '-500')}`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PayslipPreviewSection() {
  const { month, year, grossPay, deductions, netPay, taxDeducted, pfDeducted } = PAYSLIP_PREVIEW;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">Latest Payslip</h3>
        <span className="text-xs text-gray-500">
          {month} {year}
        </span>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 mb-3">
        <p className="text-xs text-gray-500 mb-0.5">Net Pay</p>
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(netPay)}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Gross: {formatCurrency(grossPay)} · Deductions: {formatCurrency(deductions)}
        </p>
      </div>

      <div className="space-y-2">
        {[
          { label: 'Income Tax (TDS)', amount: taxDeducted, color: 'text-red-600' },
          { label: 'Provident Fund', amount: pfDeducted, color: 'text-blue-600' },
          {
            label: 'Other Deductions',
            amount: deductions - taxDeducted - pfDeducted,
            color: 'text-gray-600',
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{item.label}</span>
            <span className={`font-semibold ${item.color}`}>-{formatCurrency(item.amount)}</span>
          </div>
        ))}
      </div>

      <button className="mt-3 w-full py-2.5 border border-blue-200 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
        <FileText className="w-4 h-4" /> View Full Payslip
      </button>
    </div>
  );
}

function AttendanceSummarySection() {
  const {
    workingDays,
    daysPresent,
    lateArrivals,
    earlyDepartures,
    avgCheckIn,
    avgCheckOut,
    hoursWorked,
    requiredHours,
  } = ATTENDANCE_SUMMARY;
  const presentPct = Math.round((daysPresent / workingDays) * 100);
  const hoursPct = Math.round((hoursWorked / requiredHours) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">This Month — Attendance</h3>
        <span
          className={`text-xs font-semibold ${presentPct >= 95 ? 'text-emerald-600' : presentPct >= 85 ? 'text-amber-600' : 'text-red-600'}`}
        >
          {presentPct}% attendance
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {[
          {
            label: 'Days Present',
            value: `${daysPresent}/${workingDays}`,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Hours Logged',
            value: `${hoursWorked}h`,
            icon: Clock,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Late Arrivals',
            value: lateArrivals,
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Early Exits',
            value: earlyDepartures,
            icon: TrendingDown,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`${item.bg} rounded-xl p-3 flex items-center gap-2`}>
              <Icon className={`w-5 h-5 ${item.color} shrink-0`} />
              <div>
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Hours worked this month</span>
            <span>
              {hoursWorked} / {requiredHours} hrs
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${hoursPct >= 95 ? 'bg-emerald-500' : hoursPct >= 85 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${hoursPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Avg Check-In: <span className="font-semibold text-gray-600">{avgCheckIn}</span>
          </span>
          <span>
            Avg Check-Out: <span className="font-semibold text-gray-600">{avgCheckOut}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function PendingRequestsSection() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">My Requests</h3>
        <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
          {PENDING_REQUESTS.filter((r) => r.status === 'pending').length} pending
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {PENDING_REQUESTS.map((req) => {
          const {
            label: statusLabel,
            color: statusColor,
            icon: StatusIcon,
          } = requestStatusConfig(req.status);
          const { label: typeLabel, color: typeColor } = requestTypeConfig(req.type);
          return (
            <div
              key={req.id}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}>
                    {typeLabel}
                  </span>
                  <p className="text-sm font-medium text-gray-800">{req.title}</p>
                </div>
                <p className="text-xs text-gray-500">{req.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{req.submittedAt}</p>
              </div>
              <div className="shrink-0">
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                >
                  <StatusIcon className="w-3 h-3" /> {statusLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-gray-50">
        <button className="w-full text-center text-xs text-blue-600 font-medium hover:underline flex items-center justify-center gap-1">
          View All Requests <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MobileESSDashboard() {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 600);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Employee Self-Service</p>
          <h1 className="text-lg font-bold text-gray-900">My Dashboard</h1>
          {lastUpdated && <p className="text-xs text-gray-400">Updated {lastUpdated}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <button className="relative w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <ProfileSummaryCard />

      {/* Quick Actions + Clock */}
      <QuickActionsBar />

      {/* Leave Balances */}
      <LeaveBalanceSection />

      {/* Payslip Preview */}
      <PayslipPreviewSection />

      {/* Attendance Summary */}
      <AttendanceSummarySection />

      {/* Pending Requests */}
      <PendingRequestsSection />

      {/* Footer hint */}
      <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between text-xs text-gray-400">
        <span>Employee Mode · {EMPLOYEE_PROFILE.employeeId}</span>
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3" /> Since {EMPLOYEE_PROFILE.joinDate}
        </span>
      </div>
    </div>
  );
}
