'use client';

/**
 * @component TeamAttendance
 * @description Team attendance table view for managers — sortable, filterable,
 *              bulk regularization, and Excel export.
 * @project AURA HCM Platform
 */

import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coffee,
  Home,
  Calendar,
  LogIn,
  LogOut,
  Timer,
  AlertTriangle,
  FileText,
  Send,
  Check,
  X,
} from 'lucide-react';

import type { TeamAttendanceRecord, AttendanceStatus } from '@/services/attendanceService';

// ── Mock Data (expanded for table demonstration) ──────────────────────────────

const today = new Date().toISOString().slice(0, 10);

const MOCK_TEAM: TeamAttendanceRecord[] = [
  {
    employeeId: 'emp-001',
    employeeCode: 'EMP001',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    designation: 'Senior Engineer',
    status: 'PRESENT',
    clockIn: `${today}T09:02:00Z`,
    clockOut: null,
    hoursWorked: 7.5,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-002',
    employeeCode: 'EMP002',
    employeeName: 'Rahul Mehta',
    department: 'Engineering',
    designation: 'Tech Lead',
    status: 'PRESENT',
    clockIn: `${today}T08:45:00Z`,
    clockOut: null,
    hoursWorked: 8.25,
    overtimeHours: 0.25,
  },
  {
    employeeId: 'emp-003',
    employeeCode: 'EMP003',
    employeeName: 'Anita Nair',
    department: 'Engineering',
    designation: 'Engineer',
    status: 'WFH',
    clockIn: `${today}T09:30:00Z`,
    clockOut: null,
    hoursWorked: 6.5,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-004',
    employeeCode: 'EMP004',
    employeeName: 'Suresh Kumar',
    department: 'Engineering',
    designation: 'Junior Engineer',
    status: 'ABSENT',
    clockIn: null,
    clockOut: null,
    hoursWorked: 0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-005',
    employeeCode: 'EMP005',
    employeeName: 'Kavita Singh',
    department: 'Engineering',
    designation: 'QA Engineer',
    status: 'LEAVE',
    clockIn: null,
    clockOut: null,
    hoursWorked: 0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-006',
    employeeCode: 'EMP006',
    employeeName: 'Ahmed Al-Rashid',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    status: 'LATE',
    clockIn: `${today}T10:45:00Z`,
    clockOut: null,
    hoursWorked: 5.25,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-007',
    employeeCode: 'EMP007',
    employeeName: 'Fatima Al-Hassan',
    department: 'Engineering',
    designation: 'UI Designer',
    status: 'PRESENT',
    clockIn: `${today}T09:00:00Z`,
    clockOut: null,
    hoursWorked: 7.0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-008',
    employeeCode: 'EMP008',
    employeeName: 'David Chen',
    department: 'Engineering',
    designation: 'Backend Engineer',
    status: 'PRESENT',
    clockIn: `${today}T09:10:00Z`,
    clockOut: null,
    hoursWorked: 7.8,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-009',
    employeeCode: 'EMP009',
    employeeName: 'Meera Pillai',
    department: 'HR',
    designation: 'HR Manager',
    status: 'PRESENT',
    clockIn: `${today}T08:58:00Z`,
    clockOut: `${today}T17:30:00Z`,
    hoursWorked: 8.53,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-010',
    employeeCode: 'EMP010',
    employeeName: 'Omar Al-Farsi',
    department: 'HR',
    designation: 'HR Business Partner',
    status: 'WFH',
    clockIn: `${today}T09:15:00Z`,
    clockOut: null,
    hoursWorked: 6.0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-011',
    employeeCode: 'EMP011',
    employeeName: 'Nisha Gupta',
    department: 'HR',
    designation: 'Recruiter',
    status: 'ABSENT',
    clockIn: null,
    clockOut: null,
    hoursWorked: 0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-012',
    employeeCode: 'EMP012',
    employeeName: 'Carlos Mendes',
    department: 'Finance',
    designation: 'Finance Manager',
    status: 'PRESENT',
    clockIn: `${today}T08:55:00Z`,
    clockOut: `${today}T18:05:00Z`,
    hoursWorked: 9.17,
    overtimeHours: 1.17,
  },
  {
    employeeId: 'emp-013',
    employeeCode: 'EMP013',
    employeeName: 'Layla Al-Sayed',
    department: 'Finance',
    designation: 'Senior Accountant',
    status: 'LATE',
    clockIn: `${today}T10:20:00Z`,
    clockOut: null,
    hoursWorked: 5.5,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-014',
    employeeCode: 'EMP014',
    employeeName: 'Ravi Krishnan',
    department: 'Finance',
    designation: 'Accountant',
    status: 'PRESENT',
    clockIn: `${today}T09:05:00Z`,
    clockOut: null,
    hoursWorked: 7.2,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-015',
    employeeCode: 'EMP015',
    employeeName: 'Sophie Williams',
    department: 'Operations',
    designation: 'Operations Lead',
    status: 'HALF_DAY',
    clockIn: `${today}T09:00:00Z`,
    clockOut: `${today}T13:00:00Z`,
    hoursWorked: 4.0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-016',
    employeeCode: 'EMP016',
    employeeName: 'Arun Patel',
    department: 'Operations',
    designation: 'Operations Analyst',
    status: 'PRESENT',
    clockIn: `${today}T08:50:00Z`,
    clockOut: null,
    hoursWorked: 8.0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-017',
    employeeCode: 'EMP017',
    employeeName: 'Hana Tanaka',
    department: 'Operations',
    designation: 'Process Manager',
    status: 'LEAVE',
    clockIn: null,
    clockOut: null,
    hoursWorked: 0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-018',
    employeeCode: 'EMP018',
    employeeName: 'Brandon Lee',
    department: 'Sales',
    designation: 'Sales Manager',
    status: 'PRESENT',
    clockIn: `${today}T09:30:00Z`,
    clockOut: null,
    hoursWorked: 6.5,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-019',
    employeeCode: 'EMP019',
    employeeName: 'Zara Ahmed',
    department: 'Sales',
    designation: 'Account Executive',
    status: 'WFH',
    clockIn: `${today}T09:45:00Z`,
    clockOut: null,
    hoursWorked: 5.75,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-020',
    employeeCode: 'EMP020',
    employeeName: 'Vikram Joshi',
    department: 'Sales',
    designation: 'Business Dev Manager',
    status: 'ABSENT',
    clockIn: null,
    clockOut: null,
    hoursWorked: 0,
    overtimeHours: 0,
  },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = ['All Departments', 'Engineering', 'HR', 'Finance', 'Operations', 'Sales'];

const STATUS_FILTER_OPTIONS: { value: AttendanceStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'LATE', label: 'Late' },
  { value: 'WFH', label: 'Work from Home' },
  { value: 'LEAVE', label: 'On Leave' },
  { value: 'HALF_DAY', label: 'Half Day' },
];

// ── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; icon: React.ReactNode; bg: string; text: string; dot: string }
> = {
  PRESENT: {
    label: 'Present',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  ABSENT: {
    label: 'Absent',
    icon: <XCircle className="w-3.5 h-3.5" />,
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  LATE: {
    label: 'Late',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  HALF_DAY: {
    label: 'Half Day',
    icon: <Coffee className="w-3.5 h-3.5" />,
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
  },
  WFH: {
    label: 'WFH',
    icon: <Home className="w-3.5 h-3.5" />,
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  LEAVE: {
    label: 'Leave',
    icon: <Calendar className="w-3.5 h-3.5" />,
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  HOLIDAY: {
    label: 'Holiday',
    icon: <Calendar className="w-3.5 h-3.5" />,
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
  },
  WEEKEND: {
    label: 'Weekend',
    icon: <Calendar className="w-3.5 h-3.5" />,
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

type SortField = 'employeeName' | 'department' | 'status' | 'clockIn' | 'hoursWorked';
type SortDirection = 'asc' | 'desc' | null;

interface BulkRegularizationForm {
  reason: string;
  requestedStatus: AttendanceStatus;
  requestedClockIn: string;
  requestedClockOut: string;
  notes: string;
}

// ── Helper Functions ──────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

function formatHours(hours: number): string {
  if (hours === 0) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function avatarColor(employeeId: string): string {
  const colors = [
    'bg-indigo-500',
    'bg-violet-500',
    'bg-sky-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-pink-500',
  ];
  const idx = parseInt(employeeId.replace(/\D/g, ''), 10) % colors.length;
  return colors[idx] || 'bg-slate-500';
}

/** Export team data as a CSV file (Excel-compatible) */
function exportToCSV(records: TeamAttendanceRecord[]) {
  const headers = [
    'Employee Code',
    'Employee Name',
    'Department',
    'Designation',
    'Status',
    'Clock In',
    'Clock Out',
    'Hours Worked',
    'Overtime Hours',
  ];
  const rows = records.map((r) => [
    r.employeeCode,
    r.employeeName,
    r.department,
    r.designation,
    STATUS_CONFIG[r.status]?.label ?? r.status,
    formatTime(r.clockIn),
    formatTime(r.clockOut),
    r.hoursWorked > 0 ? r.hoursWorked.toFixed(2) : '0',
    r.overtimeHours > 0 ? r.overtimeHours.toFixed(2) : '0',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `team-attendance-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Sub-component: StatusBadge ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Sub-component: SortIcon ────────────────────────────────────────────────────

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField | null;
  sortDir: SortDirection;
}) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />;
  if (sortDir === 'asc') return <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />;
  if (sortDir === 'desc') return <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />;
}

// ── Sub-component: SummaryCard ─────────────────────────────────────────────────

function SummaryCard({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <span className={`text-xl font-bold ${color}`}>{count}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
        <div
          className={`h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-400">{pct}% of team</span>
    </div>
  );
}

// ── Sub-component: BulkRegularizationModal ────────────────────────────────────

function BulkRegularizationModal({
  selectedCount,
  onClose,
  onSubmit,
}: {
  selectedCount: number;
  onClose: () => void;
  onSubmit: (form: BulkRegularizationForm) => void;
}) {
  const [form, setForm] = useState<BulkRegularizationForm>({
    reason: '',
    requestedStatus: 'PRESENT',
    requestedClockIn: '09:00',
    requestedClockOut: '18:00',
    notes: '',
  });

  const reasonOptions = [
    'Biometric failure',
    'System downtime',
    'Remote work not captured',
    'Travel / client visit',
    'Medical appointment',
    'Other',
  ];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Bulk Regularization</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedCount} employee{selectedCount !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Regularization Reason *
            </label>
            <select
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select reason…</option>
              {reasonOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Requested Status */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Override Status
            </label>
            <select
              value={form.requestedStatus}
              onChange={(e) =>
                setForm((f) => ({ ...f, requestedStatus: e.target.value as AttendanceStatus }))
              }
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {(['PRESENT', 'WFH', 'HALF_DAY', 'LEAVE'] as AttendanceStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>

          {/* Clock In/Out */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                <LogIn className="w-3 h-3 inline mr-1" />
                Clock In Time
              </label>
              <input
                type="time"
                value={form.requestedClockIn}
                onChange={(e) => setForm((f) => ({ ...f, requestedClockIn: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                <LogOut className="w-3 h-3 inline mr-1" />
                Clock Out Time
              </label>
              <input
                type="time"
                value={form.requestedClockOut}
                onChange={(e) => setForm((f) => ({ ...f, requestedClockOut: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Additional Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Any additional context for the approval…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (form.reason) onSubmit(form);
            }}
            disabled={!form.reason}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function TeamAttendance() {
  // ── Filter & Sort state ───────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [selectedDate, setSelectedDate] = useState(today);

  // ── Selection state ───────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSubmitted, setBulkSubmitted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ── Derived: filtered + sorted records ───────────────────────────────────

  const filteredRecords = useMemo(() => {
    let data = MOCK_TEAM;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeCode.toLowerCase().includes(q) ||
          r.designation.toLowerCase().includes(q)
      );
    }

    // Department filter
    if (deptFilter !== 'All Departments') {
      data = data.filter((r) => r.department === deptFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      data = data.filter((r) => r.status === statusFilter);
    }

    // Sort
    if (sortField && sortDir) {
      data = [...data].sort((a, b) => {
        let aVal: string | number = '';
        let bVal: string | number = '';

        switch (sortField) {
          case 'employeeName':
            aVal = a.employeeName;
            bVal = b.employeeName;
            break;
          case 'department':
            aVal = a.department;
            bVal = b.department;
            break;
          case 'status':
            aVal = a.status;
            bVal = b.status;
            break;
          case 'clockIn':
            aVal = a.clockIn ?? '';
            bVal = b.clockIn ?? '';
            break;
          case 'hoursWorked':
            aVal = a.hoursWorked;
            bVal = b.hoursWorked;
            break;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return data;
  }, [search, deptFilter, statusFilter, sortField, sortDir]);

  // ── Derived: summary counts ───────────────────────────────────────────────

  const summary = useMemo(
    () => ({
      present: MOCK_TEAM.filter((r) => r.status === 'PRESENT').length,
      absent: MOCK_TEAM.filter((r) => r.status === 'ABSENT').length,
      late: MOCK_TEAM.filter((r) => r.status === 'LATE').length,
      wfh: MOCK_TEAM.filter((r) => r.status === 'WFH').length,
      leave: MOCK_TEAM.filter((r) => r.status === 'LEAVE').length,
      halfDay: MOCK_TEAM.filter((r) => r.status === 'HALF_DAY').length,
      total: MOCK_TEAM.length,
    }),
    []
  );

  const attendanceRate = Math.round(
    ((summary.present + summary.wfh + summary.halfDay) / summary.total) * 100
  );

  // ── Event Handlers ────────────────────────────────────────────────────────

  function handleSort(field: SortField) {
    if (sortField !== field) {
      setSortField(field);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortField(null);
      setSortDir(null);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.employeeId)));
    }
  }

  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  }

  function handleBulkSubmit(form: BulkRegularizationForm) {
    // In production: POST to regularization API for each selected employee
    console.warn('Bulk regularization submitted:', { employees: Array.from(selectedIds), form });
    setShowBulkModal(false);
    setBulkSubmitted(true);
    setSelectedIds(new Set());
    setTimeout(() => setBulkSubmitted(false), 4000);
  }

  const allSelected = filteredRecords.length > 0 && selectedIds.size === filteredRecords.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredRecords.length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 space-y-5">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Team Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date picker */}
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export */}
          <button
            onClick={() => exportToCSV(filteredRecords)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Bulk Regularization Success Banner ───────────────────────────── */}
      {bulkSubmitted && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          Bulk regularization request submitted successfully. Pending manager approval.
        </div>
      )}

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard
          label="Present"
          count={summary.present}
          total={summary.total}
          color="text-green-600"
        />
        <SummaryCard
          label="Absent"
          count={summary.absent}
          total={summary.total}
          color="text-red-600"
        />
        <SummaryCard
          label="Late"
          count={summary.late}
          total={summary.total}
          color="text-orange-500"
        />
        <SummaryCard label="WFH" count={summary.wfh} total={summary.total} color="text-blue-600" />
        <SummaryCard
          label="On Leave"
          count={summary.leave}
          total={summary.total}
          color="text-purple-600"
        />
        <SummaryCard
          label="Half Day"
          count={summary.halfDay}
          total={summary.total}
          color="text-yellow-600"
        />
      </div>

      {/* ── Attendance Rate Bar ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Team Attendance Rate</span>
          <span className="text-sm font-bold text-slate-800">{attendanceRate}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${attendanceRate >= 90 ? 'bg-green-500' : attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <span>
            {summary.present + summary.wfh + summary.halfDay} present / {summary.total} total
          </span>
          {attendanceRate < 90 && (
            <span className="flex items-center gap-1 text-orange-600">
              <AlertTriangle className="w-3 h-3" />
              Below 90% threshold
            </span>
          )}
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-slate-100">
          {/* Search */}
          <div className="relative flex-1 min-w-0 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code, or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {(deptFilter !== 'All Departments' || statusFilter !== 'ALL') && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />
            )}
          </button>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{selectedIds.size} selected</span>
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Regularize
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Expandable filter row */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            {/* Department */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | 'ALL')}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters */}
            {(deptFilter !== 'All Departments' || statusFilter !== 'ALL') && (
              <div className="flex flex-col justify-end">
                <button
                  onClick={() => {
                    setDeptFilter('All Departments');
                    setStatusFilter('ALL');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                {/* Select all checkbox */}
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                  />
                </th>

                {/* Employee */}
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('employeeName')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-indigo-600 transition-colors"
                  >
                    Employee
                    <SortIcon field="employeeName" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>

                {/* Department */}
                <th className="px-4 py-3 hidden lg:table-cell">
                  <button
                    onClick={() => handleSort('department')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-indigo-600 transition-colors"
                  >
                    Department
                    <SortIcon field="department" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>

                {/* Status */}
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-indigo-600 transition-colors"
                  >
                    Status
                    <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>

                {/* Clock In */}
                <th className="px-4 py-3 hidden sm:table-cell">
                  <button
                    onClick={() => handleSort('clockIn')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-indigo-600 transition-colors"
                  >
                    <LogIn className="w-3 h-3" />
                    Clock In
                    <SortIcon field="clockIn" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>

                {/* Clock Out */}
                <th className="px-4 py-3 hidden sm:table-cell">
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    <LogOut className="w-3 h-3" />
                    Clock Out
                  </span>
                </th>

                {/* Hours */}
                <th className="px-4 py-3 hidden md:table-cell">
                  <button
                    onClick={() => handleSort('hoursWorked')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-indigo-600 transition-colors"
                  >
                    <Timer className="w-3 h-3" />
                    Hours
                    <SortIcon field="hoursWorked" sortField={sortField} sortDir={sortDir} />
                  </button>
                </th>

                {/* Overtime */}
                <th className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    OT Hours
                  </span>
                </th>

                {/* Actions */}
                <th className="px-4 py-3 text-right">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Action
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users className="w-8 h-8" />
                      <p className="text-sm">No employees match the current filters</p>
                      <button
                        onClick={() => {
                          setSearch('');
                          setDeptFilter('All Departments');
                          setStatusFilter('ALL');
                        }}
                        className="text-xs text-indigo-600 hover:underline mt-1"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, idx) => {
                  const isSelected = selectedIds.has(record.employeeId);
                  const statusCfg = STATUS_CONFIG[record.status];
                  const hasAnomaly =
                    record.status === 'LATE' ||
                    (record.clockIn && !record.clockOut && record.hoursWorked > 0);

                  return (
                    <tr
                      key={record.employeeId}
                      className={`border-b border-slate-50 transition-colors ${isSelected ? 'bg-indigo-50' : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(record.employeeId)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                        />
                      </td>

                      {/* Employee */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${avatarColor(record.employeeId)} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                          >
                            {getInitials(record.employeeName)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {record.employeeName}
                              </p>
                              {hasAnomaly && (
                                <AlertTriangle
                                  className="w-3 h-3 text-orange-400 shrink-0"
                                  title="Attendance anomaly"
                                />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                              {record.designation} · {record.employeeCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-slate-600">{record.department}</span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <StatusBadge status={record.status} />
                      </td>

                      {/* Clock In */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          {record.clockIn ? (
                            <>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                              {formatTime(record.clockIn)}
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Clock Out */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-sm">
                          {record.clockOut ? (
                            <span className="text-slate-600">{formatTime(record.clockOut)}</span>
                          ) : record.clockIn ? (
                            <span className="text-amber-600 text-xs font-medium">In progress</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Hours */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          {record.hoursWorked > 0 ? (
                            <>
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-700 font-medium">
                                {formatHours(record.hoursWorked)}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Overtime */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {record.overtimeHours > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            +{formatHours(record.overtimeHours)} OT
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {(record.status === 'ABSENT' ||
                          record.status === 'LATE' ||
                          !record.clockOut) && (
                          <button
                            onClick={() => {
                              setSelectedIds(new Set([record.employeeId]));
                              setShowBulkModal(true);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                          >
                            Regularize
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer */}
            {filteredRecords.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={2} className="px-4 py-2.5">
                    <span className="text-xs text-slate-500">
                      Showing {filteredRecords.length} of {MOCK_TEAM.length} employees
                      {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell" />
                  <td className="px-4 py-2.5" />
                  <td className="px-4 py-2.5 hidden sm:table-cell" />
                  <td className="px-4 py-2.5 hidden sm:table-cell" />
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <span className="text-xs font-medium text-slate-600">
                      Avg:{' '}
                      {filteredRecords.length > 0
                        ? formatHours(
                            filteredRecords.reduce((s, r) => s + r.hoursWorked, 0) /
                              filteredRecords.filter((r) => r.hoursWorked > 0).length || 0
                          )
                        : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <span className="text-xs font-medium text-slate-600">
                      {filteredRecords.filter((r) => r.overtimeHours > 0).length} with OT
                    </span>
                  </td>
                  <td className="px-4 py-2.5" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Department Breakdown ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          Department Breakdown
        </h2>
        <div className="space-y-3">
          {Array.from(new Set(MOCK_TEAM.map((r) => r.department))).map((dept) => {
            const deptRecords = MOCK_TEAM.filter((r) => r.department === dept);
            const presentCount = deptRecords.filter((r) =>
              ['PRESENT', 'WFH', 'HALF_DAY'].includes(r.status)
            ).length;
            const pct = Math.round((presentCount / deptRecords.length) * 100);
            const absentCount = deptRecords.filter((r) => r.status === 'ABSENT').length;
            const lateCount = deptRecords.filter((r) => r.status === 'LATE').length;

            return (
              <div key={dept} className="flex items-center gap-4">
                <div className="w-28 shrink-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{dept}</p>
                  <p className="text-xs text-slate-400">
                    {presentCount}/{deptRecords.length} present
                  </p>
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${pct >= 90 ? 'bg-green-500' : pct >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-slate-700 w-10 text-right">{pct}%</span>
                  {absentCount > 0 && (
                    <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      {absentCount} absent
                    </span>
                  )}
                  {lateCount > 0 && (
                    <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                      {lateCount} late
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bulk Regularization Modal ─────────────────────────────────────── */}
      {showBulkModal && (
        <BulkRegularizationModal
          selectedCount={selectedIds.size}
          onClose={() => setShowBulkModal(false)}
          onSubmit={handleBulkSubmit}
        />
      )}
    </div>
  );
}
