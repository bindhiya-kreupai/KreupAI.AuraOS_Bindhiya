'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DataPage, type Column } from '@aura/ui/components/ui';
import { toast } from 'sonner';
import { apiJson } from '@/lib/api-utils';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Clock,
  Users,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  Star,
  LayoutTemplate,
  Moon,
  CalendarDays,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react';

type Stats = {
  totalShifts: number;
  activeShifts: number;
  activeAssignments: number;
  pendingSwaps: number;
};

type Shift = {
  id: string;
  code: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  workHours: number;
  graceInMinutes: number;
  graceOutMinutes: number;
  breakDuration: number;
  overtimeAllowed: boolean;
  maxOvertimeHours?: number;
  isDefault: boolean;
  isActive: boolean;
};

type Assignment = {
  id: string;
  employeeId: string;
  shiftId: string;
  shift?: { id: string; name: string };
  effectiveFrom: string;
  effectiveTo?: string | null;
  reason?: string;
  isActive: boolean;
};

type Roster = {
  id: string;
  employeeId: string;
  shiftId: string;
  shift?: { id: string; name: string };
  rosterDate: string;
  customStartTime?: string | null;
  customEndTime?: string | null;
  isWeekOff: boolean;
  isHoliday: boolean;
  status: string;
};

type Swap = {
  id: string;
  requestorId: string;
  swapWithId: string;
  requestorShiftId: string;
  swapWithShiftId: string;
  requestorDate: string;
  swapWithDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED_BY_PEER' | 'APPROVED_BY_MANAGER' | 'COMPLETED' | 'REJECTED';
};

const swapStatusColors: Record<Swap['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED_BY_PEER: 'bg-blue-100 text-blue-800',
  APPROVED_BY_MANAGER: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function ShiftManagementPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments' | 'rosters' | 'swaps'>(
    'shifts'
  );

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);

  const [shiftsLoading, setShiftsLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [rostersLoading, setRostersLoading] = useState(true);
  const [swapsLoading, setSwapsLoading] = useState(true);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectSwapId, setRejectSwapId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const r = await apiJson<Stats>('/api/v1/shifts/stats');
    if (r.ok && r.data) setStats(r.data);
    setStatsLoading(false);
  }, []);

  const fetchShifts = useCallback(async () => {
    setShiftsLoading(true);
    const r = await apiJson<Shift[]>('/api/v1/shifts?limit=200');
    if (r.ok && r.data) setShifts(r.data);
    setShiftsLoading(false);
  }, []);

  const fetchAssignments = useCallback(async () => {
    setAssignmentsLoading(true);
    const r = await apiJson<Assignment[]>('/api/v1/shift-assignments?limit=200');
    if (r.ok && r.data) setAssignments(r.data);
    setAssignmentsLoading(false);
  }, []);

  const fetchRosters = useCallback(async () => {
    setRostersLoading(true);
    const r = await apiJson<Roster[]>('/api/v1/shift-rosters?limit=200');
    if (r.ok && r.data) setRosters(r.data);
    setRostersLoading(false);
  }, []);

  const fetchSwaps = useCallback(async () => {
    setSwapsLoading(true);
    const r = await apiJson<Swap[]>('/api/v1/shift-swaps?limit=200');
    if (r.ok && r.data) setSwaps(r.data);
    setSwapsLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchShifts();
  }, [fetchStats, fetchShifts]);

  useEffect(() => {
    if (activeTab === 'assignments' && assignmentsLoading) fetchAssignments();
    if (activeTab === 'rosters' && rostersLoading) fetchRosters();
    if (activeTab === 'swaps' && swapsLoading) fetchSwaps();
  }, [
    activeTab,
    fetchAssignments,
    fetchRosters,
    fetchSwaps,
    assignmentsLoading,
    rostersLoading,
    swapsLoading,
  ]);

  // ---------------------------------------------------------------------------
  // Shifts tab
  // ---------------------------------------------------------------------------
  const shiftColumns: Column<Shift>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (r) => <span className="font-mono text-xs">{r.code}</span>,
    },
    { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'startTime', header: 'Start' },
    { key: 'endTime', header: 'End' },
    { key: 'workHours', header: 'Hours', render: (r) => `${r.workHours}h` },
    { key: 'graceInMinutes', header: 'Grace', render: (r) => `${r.graceInMinutes} min` },
    {
      key: 'isDefault',
      header: 'Default',
      render: (r) =>
        r.isDefault ? (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Default
          </span>
        ) : null,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (r) => (
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            r.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const saveShift = async (record: Partial<Shift>) => {
    const payload: Record<string, any> = {
      code: record.code,
      name: record.name,
      description: record.description,
      startTime: record.startTime,
      endTime: record.endTime,
      workHours: record.workHours !== undefined ? Number(record.workHours) : undefined,
      graceInMinutes:
        record.graceInMinutes !== undefined ? Number(record.graceInMinutes) : undefined,
      graceOutMinutes:
        record.graceOutMinutes !== undefined ? Number(record.graceOutMinutes) : undefined,
      breakDuration: record.breakDuration !== undefined ? Number(record.breakDuration) : undefined,
      overtimeAllowed: !!record.overtimeAllowed,
      maxOvertimeHours:
        record.maxOvertimeHours !== undefined && record.maxOvertimeHours !== null
          ? Number(record.maxOvertimeHours)
          : undefined,
    };

    const url = record.id ? `/api/v1/shifts/${record.id}` : '/api/v1/shifts';
    const method = record.id ? 'PUT' : 'POST';
    const r = await apiJson(url, { method, body: JSON.stringify(payload) });
    if (!r.ok) {
      toast.error(r.error?.message || 'Failed to save shift');
      return;
    }
    toast.success(record.id ? 'Shift updated' : 'Shift created');
    await Promise.all([fetchShifts(), fetchStats()]);
  };

  const deleteShift = async (row: Shift) => {
    setConfirmTitle('Delete Shift');
    setConfirmMessage(
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
    );
    setConfirmAction(() => async () => {
      const r = await apiJson(`/api/v1/shifts/${row.id}`, { method: 'DELETE' });
      if (!r.ok) {
        toast.error(r.error?.message || 'Failed to delete shift');
        return;
      }
      toast.success('Shift deleted');
      await Promise.all([fetchShifts(), fetchStats()]);
    });
    setConfirmOpen(true);
  };

  const setShiftDefault = async (row: Shift) => {
    const r = await apiJson(`/api/v1/shifts/${row.id}/set-default`, { method: 'POST' });
    if (!r.ok) {
      toast.error(r.error?.message || 'Failed to set default shift');
      return;
    }
    toast.success(`"${row.name}" set as default shift`);
    await fetchShifts();
  };

  // ---------------------------------------------------------------------------
  // Assignments tab
  // ---------------------------------------------------------------------------
  const assignmentColumns: Column<Assignment>[] = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (r) => <span className="font-mono text-xs">{r.employeeId}</span>,
    },
    { key: 'shift.name', header: 'Shift', render: (r) => r.shift?.name || '—' },
    {
      key: 'effectiveFrom',
      header: 'From',
      render: (r) => new Date(r.effectiveFrom).toLocaleDateString(),
    },
    {
      key: 'effectiveTo',
      header: 'To',
      render: (r) =>
        r.effectiveTo ? (
          new Date(r.effectiveTo).toLocaleDateString()
        ) : (
          <span className="text-slate-400">Current</span>
        ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (r) => (
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            r.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const saveAssignment = async (record: Partial<Assignment>) => {
    const payload = {
      employeeId: record.employeeId,
      shiftId: record.shiftId,
      effectiveFrom: record.effectiveFrom,
      effectiveTo: record.effectiveTo || undefined,
      reason: record.reason,
    };
    const url = record.id ? `/api/v1/shift-assignments/${record.id}` : '/api/v1/shift-assignments';
    const method = record.id ? 'PUT' : 'POST';
    const r = await apiJson(url, { method, body: JSON.stringify(payload) });
    if (!r.ok) {
      toast.error(r.error?.message || 'Failed to save assignment');
      return;
    }
    toast.success(record.id ? 'Assignment updated' : 'Assignment created');
    await Promise.all([fetchAssignments(), fetchStats()]);
  };

  const deleteAssignment = async (row: Assignment) => {
    setConfirmTitle('End Assignment');
    setConfirmMessage('Are you sure you want to end this assignment?');
    setConfirmAction(() => async () => {
      const r = await apiJson(`/api/v1/shift-assignments/${row.id}`, { method: 'DELETE' });
      if (!r.ok) {
        toast.error(r.error?.message || 'Failed to delete assignment');
        return;
      }
      toast.success('Assignment ended');
      await Promise.all([fetchAssignments(), fetchStats()]);
    });
    setConfirmOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Rosters tab
  // ---------------------------------------------------------------------------
  const rosterColumns: Column<Roster>[] = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (r) => <span className="font-mono text-xs">{r.employeeId}</span>,
    },
    {
      key: 'rosterDate',
      header: 'Date',
      render: (r) => new Date(r.rosterDate).toLocaleDateString(),
    },
    { key: 'shift.name', header: 'Shift', render: (r) => r.shift?.name || '—' },
    { key: 'isWeekOff', header: 'Week Off', render: (r) => (r.isWeekOff ? '✓' : '') },
    { key: 'isHoliday', header: 'Holiday', render: (r) => (r.isHoliday ? '✓' : '') },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {r.status}
        </span>
      ),
    },
  ];

  const saveRoster = async (record: Partial<Roster>) => {
    const payload = {
      employeeId: record.employeeId,
      shiftId: record.shiftId,
      rosterDate: record.rosterDate,
      customStartTime: record.customStartTime || undefined,
      customEndTime: record.customEndTime || undefined,
      isWeekOff: !!record.isWeekOff,
      isHoliday: !!record.isHoliday,
    };
    const url = record.id ? `/api/v1/shift-rosters/${record.id}` : '/api/v1/shift-rosters';
    const method = record.id ? 'PUT' : 'POST';
    const r = await apiJson(url, { method, body: JSON.stringify(payload) });
    if (!r.ok) {
      toast.error(r.error?.message || 'Failed to save roster');
      return;
    }
    toast.success(record.id ? 'Roster updated' : 'Roster entry created');
    await fetchRosters();
  };

  const deleteRoster = async (row: Roster) => {
    setConfirmTitle('Delete Roster Entry');
    setConfirmMessage('Are you sure you want to delete this roster entry?');
    setConfirmAction(() => async () => {
      const r = await apiJson(`/api/v1/shift-rosters/${row.id}`, { method: 'DELETE' });
      if (!r.ok) {
        toast.error(r.error?.message || 'Failed to delete roster');
        return;
      }
      toast.success('Roster entry deleted');
      await fetchRosters();
    });
    setConfirmOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Swap requests tab
  // ---------------------------------------------------------------------------
  const swapColumns: Column<Swap>[] = [
    {
      key: 'requestorId',
      header: 'Requestor',
      render: (r) => <span className="font-mono text-xs">{r.requestorId}</span>,
    },
    {
      key: 'swapWithId',
      header: 'Swap With',
      render: (r) => <span className="font-mono text-xs">{r.swapWithId}</span>,
    },
    {
      key: 'requestorDate',
      header: 'Their Date',
      render: (r) => new Date(r.requestorDate).toLocaleDateString(),
    },
    {
      key: 'swapWithDate',
      header: 'Swap Date',
      render: (r) => new Date(r.swapWithDate).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            swapStatusColors[r.status] || 'bg-gray-100 text-gray-700'
          }`}
        >
          {r.status.replace(/_/g, ' ')}
        </span>
      ),
    },
  ];

  const saveSwap = async (record: Partial<Swap>) => {
    if (record.id) {
      toast.error('Swap requests cannot be edited — use approve/reject.');
      return;
    }
    const payload = {
      requestorId: record.requestorId,
      swapWithId: record.swapWithId,
      requestorShiftId: record.requestorShiftId,
      swapWithShiftId: record.swapWithShiftId,
      requestorDate: record.requestorDate,
      swapWithDate: record.swapWithDate,
      reason: record.reason,
    };
    const r = await apiJson('/api/v1/shift-swaps', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      toast.error(r.error?.message || 'Failed to create swap request');
      return;
    }
    toast.success('Swap request created');
    await Promise.all([fetchSwaps(), fetchStats()]);
  };

  const swapAction = async (
    id: string,
    action: 'peer-approve' | 'manager-approve' | 'reject',
    label: string,
    reason?: string
  ) => {
    let body: string | undefined;
    if (action === 'reject' && reason) {
      body = JSON.stringify({ reason });
    }
    const r = await apiJson(`/api/v1/shift-swaps/${id}/${action}`, {
      method: 'POST',
      body,
    });
    if (!r.ok) {
      toast.error(r.error?.message || `Failed to ${label.toLowerCase()}`);
      return;
    }
    toast.success(label);
    await Promise.all([fetchSwaps(), fetchStats()]);
  };

  const handleRejectClick = (id: string) => {
    setRejectSwapId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    if (rejectSwapId) {
      await swapAction(rejectSwapId, 'reject', 'Swap rejected', rejectReason);
    }
    setRejectDialogOpen(false);
    setRejectSwapId(null);
    setRejectReason('');
  };

  const swapRowActions = (row: Swap) => {
    const actions: Array<{
      label: string;
      icon: any;
      variant?: 'success' | 'danger' | 'warning';
      onClick: () => void;
    }> = [];
    if (row.status === 'PENDING') {
      actions.push({
        label: 'Peer approve',
        icon: CheckCircle,
        variant: 'success',
        onClick: () => swapAction(row.id, 'peer-approve', 'Peer approved'),
      });
    }
    if (row.status === 'APPROVED_BY_PEER') {
      actions.push({
        label: 'Manager approve',
        icon: CheckCircle,
        variant: 'success',
        onClick: () => swapAction(row.id, 'manager-approve', 'Manager approved'),
      });
    }
    if (row.status === 'PENDING' || row.status === 'APPROVED_BY_PEER') {
      actions.push({
        label: 'Reject',
        icon: XCircle,
        variant: 'danger',
        onClick: () => handleRejectClick(row.id),
      });
    }
    return actions;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4 pb-6">
      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          setConfirmOpen(false);
          await confirmAction?.();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
      {/* Page header + sub-page links */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            Shift Management
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Configure shifts, assign employees, plan rosters and approve swap requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/shift-management/shift-templates"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" /> Templates
          </Link>
          <Link
            href="/dashboard/attendance/shift-management/ramadan-auto-switch"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Moon className="w-4 h-4" /> Ramadan Auto-switch
          </Link>
          <Link
            href="/dashboard/attendance/roster-assignment"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <CalendarDays className="w-4 h-4" /> Roster planner
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Clock className="h-7 w-7 text-blue-600 dark:text-blue-400" />}
          label="Total shifts"
          value={stats?.totalShifts ?? '—'}
          tone="blue"
          loading={statsLoading}
        />
        <StatCard
          icon={<Users className="h-7 w-7 text-green-600 dark:text-green-400" />}
          label="Active shifts"
          value={stats?.activeShifts ?? '—'}
          tone="green"
          loading={statsLoading}
        />
        <StatCard
          icon={<Calendar className="h-7 w-7 text-purple-600 dark:text-purple-400" />}
          label="Active assignments"
          value={stats?.activeAssignments ?? '—'}
          tone="purple"
          loading={statsLoading}
        />
        <StatCard
          icon={<RefreshCw className="h-7 w-7 text-orange-600 dark:text-orange-400" />}
          label="Pending swaps"
          value={stats?.pendingSwaps ?? '—'}
          tone="orange"
          loading={statsLoading}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <div className="border-b border-cloud dark:border-nebula-purple/40">
          <nav className="flex gap-6 px-4 overflow-x-auto" aria-label="Tabs">
            {[
              { id: 'shifts', label: 'Shifts', count: shifts.length },
              { id: 'assignments', label: 'Assignments', count: assignments.length },
              { id: 'rosters', label: 'Rosters', count: rosters.length },
              { id: 'swaps', label: 'Swap Requests', count: swaps.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-300'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-2 sm:p-4">
          {activeTab === 'shifts' && (
            <DataPage<Shift>
              title="Shifts"
              data={shifts}
              columns={shiftColumns}
              onSave={saveShift}
              onDelete={deleteShift}
              addButtonText="Add shift"
              searchKeys={['code', 'name', 'description', 'startTime', 'endTime']}
              searchPlaceholder="Search shifts by code, name, time..."
              emptyState={{
                title: 'No shifts configured',
                description: 'Create your first shift to get started with shift management.',
                icon: Clock,
              }}
              rowActions={(row) =>
                row.isDefault
                  ? []
                  : [
                      {
                        label: 'Set as default',
                        icon: Star,
                        variant: 'warning',
                        onClick: () => setShiftDefault(row),
                      },
                    ]
              }
              formFields={[
                {
                  name: 'code',
                  label: 'Shift code',
                  type: 'text',
                  required: true,
                  placeholder: 'GEN-09',
                },
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'description', label: 'Description', type: 'textarea' },
                {
                  name: 'startTime',
                  label: 'Start time (HH:MM)',
                  type: 'text',
                  required: true,
                  placeholder: '09:00',
                },
                {
                  name: 'endTime',
                  label: 'End time (HH:MM)',
                  type: 'text',
                  required: true,
                  placeholder: '18:00',
                },
                { name: 'workHours', label: 'Work hours', type: 'number', required: true },
                { name: 'graceInMinutes', label: 'Grace in (min)', type: 'number', required: true },
                {
                  name: 'graceOutMinutes',
                  label: 'Grace out (min)',
                  type: 'number',
                  required: true,
                },
                {
                  name: 'breakDuration',
                  label: 'Break duration (min)',
                  type: 'number',
                  required: true,
                },
                { name: 'overtimeAllowed', label: 'Overtime allowed', type: 'checkbox' },
                { name: 'maxOvertimeHours', label: 'Max overtime hours', type: 'number' },
              ]}
            />
          )}

          {activeTab === 'assignments' && (
            <DataPage<Assignment>
              title="Assignments"
              data={assignments}
              columns={assignmentColumns}
              onSave={saveAssignment}
              onDelete={deleteAssignment}
              addButtonText="Assign shift"
              searchKeys={['employeeId', 'shift.name']}
              searchPlaceholder="Search by employee or shift..."
              emptyState={{
                title: 'No shift assignments',
                description: 'Assign shifts to employees to define their work schedule.',
                icon: Users,
              }}
              formFields={[
                { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
                { name: 'shiftId', label: 'Shift ID', type: 'text', required: true },
                { name: 'effectiveFrom', label: 'Effective from', type: 'date', required: true },
                { name: 'effectiveTo', label: 'Effective to', type: 'date' },
                { name: 'reason', label: 'Reason', type: 'textarea' },
              ]}
            />
          )}

          {activeTab === 'rosters' && (
            <DataPage<Roster>
              title="Rosters"
              data={rosters}
              columns={rosterColumns}
              onSave={saveRoster}
              onDelete={deleteRoster}
              addButtonText="Add roster entry"
              searchKeys={['employeeId', 'shift.name', 'status']}
              searchPlaceholder="Search by employee, shift, or status..."
              emptyState={{
                title: 'No roster entries',
                description: 'Plan daily shift rosters for your employees.',
                icon: Calendar,
              }}
              formFields={[
                { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
                { name: 'shiftId', label: 'Shift ID', type: 'text', required: true },
                { name: 'rosterDate', label: 'Date', type: 'date', required: true },
                { name: 'customStartTime', label: 'Custom start (HH:MM)', type: 'text' },
                { name: 'customEndTime', label: 'Custom end (HH:MM)', type: 'text' },
                { name: 'isWeekOff', label: 'Week off', type: 'checkbox' },
                { name: 'isHoliday', label: 'Holiday', type: 'checkbox' },
              ]}
            />
          )}

          {activeTab === 'swaps' && (
            <DataPage<Swap>
              title="Swap requests"
              data={swaps}
              columns={swapColumns}
              onSave={saveSwap}
              rowActions={swapRowActions}
              addButtonText="New swap request"
              enableDelete={false}
              searchKeys={['requestorId', 'swapWithId', 'reason', 'status']}
              searchPlaceholder="Search by requestor, swap partner, or status..."
              emptyState={{
                title: 'No swap requests',
                description: 'Shift swap requests from employees will appear here.',
                icon: RefreshCw,
              }}
              formFields={[
                { name: 'requestorId', label: 'Your employee ID', type: 'text', required: true },
                { name: 'requestorShiftId', label: 'Your shift ID', type: 'text', required: true },
                { name: 'requestorDate', label: 'Your shift date', type: 'date', required: true },
                {
                  name: 'swapWithId',
                  label: 'Swap with (employee ID)',
                  type: 'text',
                  required: true,
                },
                { name: 'swapWithShiftId', label: 'Their shift ID', type: 'text', required: true },
                { name: 'swapWithDate', label: 'Their shift date', type: 'date', required: true },
                { name: 'reason', label: 'Reason', type: 'textarea', required: true },
              ]}
            />
          )}
        </div>
      </div>

      {/* Reject swap reason dialog */}
      {rejectDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setRejectDialogOpen(false);
              setRejectSwapId(null);
              setRejectReason('');
            }
          }}
          ref={(el) => {
            if (el && rejectDialogOpen) el.focus();
          }}
          tabIndex={-1}
        >
          <div className="relative w-full max-w-md bg-white dark:bg-stellar-blue rounded-2xl shadow-2xl border border-cloud dark:border-nebula-purple/50 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink-black dark:text-pearl">
                  Reject Swap Request
                </h3>
                <p className="text-sm text-silver-mist">Please provide a reason for rejection.</p>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full p-3 border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm bg-white dark:bg-slate-800 text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectSwapId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
}) {
  const tones: Record<typeof tone, string> = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-200',
    green:
      'from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 text-green-700 dark:text-green-200',
    purple:
      'from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-700 dark:text-purple-200',
    orange:
      'from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/40 text-orange-700 dark:text-orange-200',
  };
  return (
    <div
      className={`bg-gradient-to-br ${tones[tone]} p-5 rounded-xl shadow-sm border border-white/40 dark:border-white/10`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium opacity-80">{label}</p>
          {loading ? (
            <div className="mt-1 h-7 w-12 animate-pulse rounded bg-current opacity-20" />
          ) : (
            <p className="text-2xl font-bold mt-1">{value}</p>
          )}
        </div>
        {icon}
      </div>
    </div>
  );
}
