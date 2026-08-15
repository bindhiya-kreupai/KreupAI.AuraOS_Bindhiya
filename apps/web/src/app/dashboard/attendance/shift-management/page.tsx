'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  X,
  Star,
  LayoutTemplate,
  Moon,
  CalendarDays,
  AlertCircle,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { ExportMenu } from '@aura/ui/components/ui';
import { useI18n } from '@/lib/i18n/I18nProvider';

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
  employee?: { id: string; firstName: string; lastName: string; employeeCode: string } | null;
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
  employee?: { id: string; firstName: string; lastName: string; employeeCode: string } | null;
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
  requestor?: { id: string; firstName: string; lastName: string; employeeCode: string } | null;
  swapWith?: { id: string; firstName: string; lastName: string; employeeCode: string } | null;
};

const swapStatusColors: Record<Swap['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  APPROVED_BY_PEER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  APPROVED_BY_MANAGER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  COMPLETED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function ShiftManagementPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments' | 'rosters' | 'swaps'>(
    'shifts'
  );

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<
    { id: string; firstName: string; lastName: string; employeeCode: string }[]
  >([]);
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
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Date range filter state (assignments, rosters, swaps)
  const defaultStart = new Date();
  defaultStart.setMonth(defaultStart.getMonth() - 1);
  const [filterStartDate, setFilterStartDate] = useState(defaultStart.toISOString().slice(0, 10));
  const [filterEndDate, setFilterEndDate] = useState(new Date().toISOString().slice(0, 10));

  const { t, isRTL } = useI18n();

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const r = await apiJson<Stats>('/api/v1/shifts/stats');
    if (r.ok && r.data) setStats(r.data);
    else if (!r.ok) setFetchError(r.error?.message || 'Failed to load statistics');
    setStatsLoading(false);
  }, []);

  const fetchShifts = useCallback(async () => {
    setShiftsLoading(true);
    const r = await apiJson<Shift[]>('/api/v1/shifts?limit=200');
    if (r.ok && r.data) setShifts(r.data);
    else if (!r.ok) setFetchError(r.error?.message || 'Failed to load shifts');
    setShiftsLoading(false);
  }, []);

  const fetchAssignments = useCallback(async (startDate?: string, endDate?: string) => {
    setAssignmentsLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const r = await apiJson<Assignment[]>(`/api/v1/shift-assignments?${params}`);
    if (r.ok && r.data) setAssignments(r.data);
    else if (!r.ok) setFetchError(r.error?.message || 'Failed to load assignments');
    setAssignmentsLoading(false);
  }, []);

  const fetchRosters = useCallback(async (startDate?: string, endDate?: string) => {
    setRostersLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const r = await apiJson<Roster[]>(`/api/v1/shift-rosters?${params}`);
    if (r.ok && r.data) setRosters(r.data);
    else if (!r.ok) setFetchError(r.error?.message || 'Failed to load rosters');
    setRostersLoading(false);
  }, []);

  const fetchEmployees = useCallback(async () => {
    const r = await apiJson<
      { id: string; firstName: string; lastName: string; employeeCode: string }[]
    >('/api/v1/employees?limit=200');
    if (r.ok && r.data) setEmployees(r.data);
  }, []);

  const fetchSwaps = useCallback(async (startDate?: string, endDate?: string) => {
    setSwapsLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const r = await apiJson<Swap[]>(`/api/v1/shift-swaps?${params}`);
    if (r.ok && r.data) setSwaps(r.data);
    else if (!r.ok) setFetchError(r.error?.message || 'Failed to load swaps');
    setSwapsLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchShifts();
    fetchEmployees();
  }, [fetchStats, fetchShifts, fetchEmployees]);

  useEffect(() => {
    if (activeTab === 'assignments' && assignmentsLoading)
      fetchAssignments(filterStartDate, filterEndDate);
    if (activeTab === 'rosters' && rostersLoading) fetchRosters(filterStartDate, filterEndDate);
    if (activeTab === 'swaps' && swapsLoading) fetchSwaps(filterStartDate, filterEndDate);
  }, [
    activeTab,
    filterStartDate,
    filterEndDate,
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
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
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
            r.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const saveShift = async (record: Partial<Shift>) => {
    if (!record.name?.trim()) {
      toast.error('Shift name is required');
      return;
    }
    if (!record.startTime) {
      toast.error('Start time is required');
      return;
    }
    if (!record.endTime) {
      toast.error('End time is required');
      return;
    }
    if (record.workHours === undefined || record.workHours <= 0) {
      toast.error('Work hours must be greater than 0');
      return;
    }

    const payload: Record<string, any> = {
      name: record.name,
      description: record.description,
      startTime: record.startTime,
      endTime: record.endTime,
      workHours: Number(record.workHours),
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

  const saveAsTemplate = async (row: Shift) => {
    const payload = {
      name: `${row.name} template`,
      description: `Template from "${row.name}" shift`,
      shiftCode: row.code,
      shiftName: row.name,
      shiftDescription: row.description || '',
      startTime: row.startTime,
      endTime: row.endTime,
      workHours: row.workHours,
      graceInMinutes: row.graceInMinutes,
      graceOutMinutes: row.graceOutMinutes,
      breakDuration: row.breakDuration,
      overtimeAllowed: row.overtimeAllowed,
      maxOvertimeHours: row.maxOvertimeHours || 0,
    };
    const r = await apiJson('/api/v1/shift-templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      toast.error(r.error?.message || 'Failed to save template');
      return;
    }
    toast.success(`"${row.name}" saved as template`);
  };

  // ---------------------------------------------------------------------------
  // Assignments tab
  // ---------------------------------------------------------------------------
  const assignmentColumns: Column<Assignment>[] = [
    {
      key: 'employeeId',
      header: 'Employee',
      render: (r) => {
        const emp = r.employee;
        if (emp) {
          return (
            <span className="font-medium">
              {emp.firstName} {emp.lastName}
              {emp.employeeCode && (
                <span className="ml-1 text-xs text-slate-400">({emp.employeeCode})</span>
              )}
            </span>
          );
        }
        return <span className="font-mono text-xs text-slate-400">{r.employeeId}</span>;
      },
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
            r.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const saveAssignment = async (record: Partial<Assignment>) => {
    const ext = record as Record<string, any>;
    if (record.id) {
      if (!record.employeeId) {
        toast.error('Employee is required');
        return;
      }
      if (!record.shiftId) {
        toast.error('Shift is required');
        return;
      }
      if (!record.effectiveFrom) {
        toast.error('Effective from date is required');
        return;
      }
      const payload = {
        employeeId: record.employeeId,
        shiftId: record.shiftId,
        effectiveFrom: record.effectiveFrom,
        effectiveTo: record.effectiveTo || undefined,
        reason: record.reason,
      };
      const res = await apiJson(`/api/v1/shift-assignments/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast.error(res.error?.message || 'Failed to update assignment');
        return;
      }
      toast.success('Assignment updated');
    } else {
      const employeeIds = ext.employeeIds || (record.employeeId ? [record.employeeId] : []);
      if (!employeeIds.length) {
        toast.error('Select at least one employee');
        return;
      }
      if (!record.shiftId) {
        toast.error('Shift is required');
        return;
      }
      if (!record.effectiveFrom) {
        toast.error('Effective from date is required');
        return;
      }
      const payload = {
        employeeIds,
        shiftId: record.shiftId,
        effectiveFrom: record.effectiveFrom,
        effectiveTo: record.effectiveTo || undefined,
        notes: record.reason,
      };
      const res = await apiJson('/api/v1/shifts/assign', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast.error(res.error?.message || 'Failed to assign shift');
        return;
      }
      toast.success(`Shift assigned to ${employeeIds.length} employee(s)`);
    }
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
      header: 'Employee',
      render: (r) => {
        const emp = r.employee;
        if (emp) {
          return (
            <span className="font-medium">
              {emp.firstName} {emp.lastName}
              {emp.employeeCode && (
                <span className="ml-1 text-xs text-slate-400">({emp.employeeCode})</span>
              )}
            </span>
          );
        }
        return <span className="font-mono text-xs text-slate-400">{r.employeeId}</span>;
      },
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
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {r.status}
        </span>
      ),
    },
  ];

  const saveRoster = async (record: Partial<Roster>) => {
    if (!record.employeeId) {
      toast.error('Employee is required');
      return;
    }
    if (!record.shiftId) {
      toast.error('Shift is required');
      return;
    }
    if (!record.rosterDate) {
      toast.error('Roster date is required');
      return;
    }

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
      render: (r) => {
        const emp = r.requestor;
        if (emp) {
          return (
            <span className="font-medium">
              {emp.firstName} {emp.lastName}
            </span>
          );
        }
        return <span className="font-mono text-xs text-slate-400">{r.requestorId}</span>;
      },
    },
    {
      key: 'swapWithId',
      header: 'Swap With',
      render: (r) => {
        const emp = r.swapWith;
        if (emp) {
          return (
            <span className="font-medium">
              {emp.firstName} {emp.lastName}
            </span>
          );
        }
        return <span className="font-mono text-xs text-slate-400">{r.swapWithId}</span>;
      },
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
            swapStatusColors[r.status] ||
            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
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
    if (!record.requestorId) {
      toast.error('Requestor is required');
      return;
    }
    if (!record.swapWithId) {
      toast.error('Swap with colleague is required');
      return;
    }
    if (record.requestorId === record.swapWithId) {
      toast.error('Cannot swap with yourself');
      return;
    }
    if (!record.requestorShiftId) {
      toast.error('Your shift is required');
      return;
    }
    if (!record.swapWithShiftId) {
      toast.error('Colleague shift is required');
      return;
    }
    if (!record.requestorDate) {
      toast.error('Your shift date is required');
      return;
    }
    if (!record.swapWithDate) {
      toast.error('Colleague shift date is required');
      return;
    }
    if (!record.reason?.trim()) {
      toast.error('Reason is required');
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

  const handleExport = (entity: string) => async (format: 'csv' | 'xlsx' | 'pdf') => {
    const params = new URLSearchParams({ entity, format });
    const res = await fetch(`/api/v1/shifts/export?${params}`);
    if (!res.ok) {
      toast.error('Export failed');
      return;
    }
    return res.blob();
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
    <div className="space-y-4 pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-silver-mist" aria-label="Breadcrumb">
        <Link href="/dashboard/attendance" className="hover:text-indigo-500 transition-colors">
          Attendance
        </Link>
        <span>/</span>
        <span className="text-ink-black dark:text-pearl font-medium">
          {t('shiftManagement.title')}
        </span>
      </nav>
      {/* Page header + sub-page links */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            {t('shiftManagement.title')}
          </h1>
          <p className="text-silver-mist text-sm mt-1">{t('shiftManagement.subtitle')}</p>
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
          <Link
            href="/dashboard/attendance/roster-calendar"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <CalendarDays className="w-4 h-4" /> Calendar view
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Clock className="h-7 w-7 text-blue-600 dark:text-blue-400" />}
          label={t('shiftManagement.overview.totalShifts')}
          value={stats?.totalShifts ?? '—'}
          tone="blue"
          loading={statsLoading}
        />
        <StatCard
          icon={<Users className="h-7 w-7 text-green-600 dark:text-green-400" />}
          label={t('shiftManagement.overview.activeShifts')}
          value={stats?.activeShifts ?? '—'}
          tone="green"
          loading={statsLoading}
        />
        <StatCard
          icon={<Calendar className="h-7 w-7 text-purple-600 dark:text-purple-400" />}
          label={t('shiftManagement.overview.totalAssignments')}
          value={stats?.activeAssignments ?? '—'}
          tone="purple"
          loading={statsLoading}
        />
        <StatCard
          icon={<RefreshCw className="h-7 w-7 text-orange-600 dark:text-orange-400" />}
          label={t('shiftManagement.overview.pendingSwaps')}
          value={stats?.pendingSwaps ?? '—'}
          tone="orange"
          loading={statsLoading}
        />
      </div>

      {fetchError && (
        <div className="rounded-lg border px-4 py-2 text-sm flex items-center gap-2 bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
          <button
            onClick={() => {
              setFetchError(null);
              fetchStats();
              fetchShifts();
            }}
            className="ml-auto text-xs font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Date range filter for assignments / rosters / swaps */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <Filter className="w-4 h-4 text-silver-mist shrink-0" />
        <label className="text-sm text-silver-mist">From:</label>
        <input
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          className="px-2 py-1.5 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-slate-800 text-ink-black dark:text-pearl"
        />
        <label className="text-sm text-silver-mist">To:</label>
        <input
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          className="px-2 py-1.5 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-slate-800 text-ink-black dark:text-pearl"
        />
        {(activeTab === 'assignments' || activeTab === 'rosters' || activeTab === 'swaps') && (
          <button
            onClick={() => {
              setAssignmentsLoading(true);
              setRostersLoading(true);
              setSwapsLoading(true);
            }}
            className="px-3 py-1.5 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            Apply
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <div className="border-b border-cloud dark:border-nebula-purple/40">
          <nav className="flex px-4 overflow-x-auto" aria-label="Tabs">
            {[
              { id: 'shifts', label: t('shiftManagement.tabs.overview'), count: shifts.length },
              {
                id: 'assignments',
                label: t('shiftManagement.tabs.assignments'),
                count: assignments.length,
              },
              { id: 'rosters', label: t('shiftManagement.tabs.rosters'), count: rosters.length },
              { id: 'swaps', label: t('shiftManagement.tabs.swaps'), count: swaps.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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
              searchPlaceholder={t('shiftManagement.shift.searchPlaceholder')}
              emptyState={{
                title: 'No shifts configured',
                description: 'Create your first shift to get started with shift management.',
                icon: Clock,
              }}
              toolbarSlot={
                <ExportMenu
                  onExport={handleExport('shifts')}
                  filename={`shifts_${new Date().toISOString().slice(0, 10)}`}
                  rowCount={shifts.length}
                />
              }
              loading={shiftsLoading}
              pageSize={15}
              rowActions={(row) => {
                const actions: any[] = [];
                if (!row.isDefault) {
                  actions.push({
                    label: 'Set as default',
                    icon: Star,
                    variant: 'warning',
                    onClick: () => setShiftDefault(row),
                  });
                }
                actions.push({
                  label: 'Save as template',
                  icon: LayoutTemplate,
                  variant: 'default',
                  onClick: () => saveAsTemplate(row),
                });
                return actions;
              }}
              formFields={[
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'description', label: 'Description', type: 'textarea' },
                {
                  name: 'startTime',
                  label: 'Start time',
                  type: 'time',
                  required: true,
                },
                {
                  name: 'endTime',
                  label: 'End time',
                  type: 'time',
                  required: true,
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
              searchKeys={[
                'employee.firstName',
                'employee.lastName',
                'employee.employeeCode',
                'shift.name',
              ]}
              searchPlaceholder="Search by employee or shift..."
              toolbarSlot={
                <ExportMenu
                  onExport={handleExport('assignments')}
                  filename={`assignments_${new Date().toISOString().slice(0, 10)}`}
                  rowCount={assignments.length}
                />
              }
              emptyState={{
                title: 'No shift assignments',
                description: 'Assign shifts to employees to define their work schedule.',
                icon: Users,
              }}
              loading={assignmentsLoading}
              pageSize={15}
              renderForm={(data, onChange) => (
                <BulkAssignForm
                  data={data}
                  onChange={onChange}
                  employees={employees}
                  shifts={shifts}
                />
              )}
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
              searchKeys={[
                'employee.firstName',
                'employee.lastName',
                'employee.employeeCode',
                'shift.name',
                'status',
              ]}
              searchPlaceholder="Search by employee name, shift, or status..."
              toolbarSlot={
                <ExportMenu
                  onExport={handleExport('rosters')}
                  filename={`rosters_${new Date().toISOString().slice(0, 10)}`}
                  rowCount={rosters.length}
                />
              }
              emptyState={{
                title: 'No roster entries',
                description: 'Plan daily shift rosters for your employees.',
                icon: Calendar,
              }}
              loading={rostersLoading}
              pageSize={15}
              renderForm={(data, onChange) => (
                <RosterForm data={data} onChange={onChange} employees={employees} shifts={shifts} />
              )}
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
              searchKeys={[
                'requestor.firstName',
                'requestor.lastName',
                'swapWith.firstName',
                'swapWith.lastName',
                'reason',
                'status',
              ]}
              searchPlaceholder="Search by employee name, reason, or status..."
              toolbarSlot={
                <ExportMenu
                  onExport={handleExport('swap-requests')}
                  filename={`swap_requests_${new Date().toISOString().slice(0, 10)}`}
                  rowCount={swaps.length}
                />
              }
              emptyState={{
                title: 'No swap requests',
                description: 'Shift swap requests from employees will appear here.',
                icon: RefreshCw,
              }}
              loading={swapsLoading}
              pageSize={15}
              renderForm={(data, onChange) => (
                <SwapForm data={data} onChange={onChange} employees={employees} shifts={shifts} />
              )}
            />
          )}
        </div>
      </div>

      {/* Reject swap reason dialog */}
      {rejectDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-swap-title"
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
                <h3
                  id="reject-swap-title"
                  className="text-lg font-semibold text-ink-black dark:text-pearl"
                >
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

function BulkAssignForm({
  data,
  onChange,
  employees,
  shifts,
}: {
  data: Partial<any>;
  onChange: (field: string, value: any) => void;
  employees: { id: string; firstName: string; lastName: string; employeeCode: string }[];
  shifts: Shift[];
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const selectedIds: string[] = data.employeeIds || [];
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const filtered = useMemo(
    () =>
      employees.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.employeeCode}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [employees, search]
  );

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange('employeeIds', next);
  }

  function selectAll() {
    onChange(
      'employeeIds',
      filtered.map((e) => e.id)
    );
  }

  function selectNone() {
    onChange('employeeIds', []);
  }

  const selectedEmployees = useMemo(
    () => employees.filter((e) => selectedIds.includes(e.id)),
    [employees, selectedIds]
  );

  return (
    <div className="space-y-4">
      {/* Employee multi-select picker */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Employees <span className="text-red-500">*</span>
        </label>
        <div ref={wrapperRef} className="relative">
          <div
            className="flex flex-wrap gap-1.5 min-h-[2.25rem] p-1.5 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 cursor-text"
            onClick={() => wrapperRef.current?.querySelector<HTMLInputElement>('input')?.focus()}
          >
            {selectedEmployees.map((emp) => (
              <span
                key={emp.id}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
              >
                {emp.firstName} {emp.lastName}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(emp.id);
                  }}
                  className="rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={selectedIds.length ? 'Search more…' : 'Search employees…'}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              className="flex-1 min-w-[120px] text-sm bg-transparent border-none outline-none text-ink-black dark:text-pearl placeholder:text-slate-400"
            />
          </div>
          {open && (
            <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-stellar-blue rounded-lg shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 max-h-60 overflow-y-auto">
              {filtered.length === 0 && search.trim() ? (
                <div className="px-3 py-4 text-sm text-slate-400 text-center">
                  No employees found
                </div>
              ) : (
                <>
                  {search.trim() && filtered.length > 0 && (
                    <div className="flex gap-2 px-2 pt-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={selectNone}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  {filtered.map((emp) => (
                    <label
                      key={emp.id}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp.id)}
                        onChange={() => toggle(emp.id)}
                        className="rounded border-slate-300 dark:border-slate-600"
                      />
                      <span className="font-medium text-ink-black dark:text-pearl">
                        {emp.firstName} {emp.lastName}
                      </span>
                      <span className="text-xs text-slate-400">{emp.employeeCode}</span>
                    </label>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        {selectedIds.length > 0 && (
          <p className="text-xs text-slate-500">{selectedIds.length} employee(s) selected</p>
        )}
      </div>

      {/* Shift select */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Shift <span className="text-red-500">*</span>
        </label>
        <select
          value={data.shiftId || ''}
          onChange={(e) => onChange('shiftId', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl"
        >
          <option value="">Select shift...</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* Effective from */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Effective from <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={data.effectiveFrom || ''}
          onChange={(e) => onChange('effectiveFrom', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl"
        />
      </div>

      {/* Effective to */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Effective to
        </label>
        <input
          type="date"
          value={data.effectiveTo || ''}
          onChange={(e) => onChange('effectiveTo', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl"
        />
      </div>

      {/* Reason / Notes */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
        <textarea
          value={data.reason || ''}
          onChange={(e) => onChange('reason', e.target.value)}
          rows={3}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl resize-none"
          placeholder="Optional notes about this assignment..."
        />
      </div>
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

// ---------------------------------------------------------------------------
// F-26: Roster form with employee and shift dropdowns
// ---------------------------------------------------------------------------
function RosterForm({
  data,
  onChange,
  employees,
  shifts,
}: {
  data: Partial<Roster>;
  onChange: (field: string, value: any) => void;
  employees: { id: string; firstName: string; lastName: string; employeeCode: string }[];
  shifts: Shift[];
}) {
  const [empSearch, setEmpSearch] = useState('');
  const [empOpen, setEmpOpen] = useState(false);
  const empWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!empOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!empWrapperRef.current?.contains(e.target as Node)) setEmpOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [empOpen]);

  const filteredEmployees = useMemo(
    () =>
      employees.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.employeeCode}`
          .toLowerCase()
          .includes(empSearch.toLowerCase())
      ),
    [employees, empSearch]
  );

  const selectedEmployee = employees.find((e) => e.id === data.employeeId);

  return (
    <div className="space-y-4">
      {/* Employee dropdown */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Employee <span className="text-red-500">*</span>
        </label>
        <div ref={empWrapperRef} className="relative">
          <div
            className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 cursor-pointer min-h-[38px]"
            onClick={() => setEmpOpen((o) => !o)}
          >
            {selectedEmployee ? (
              <span className="text-sm text-ink-black dark:text-pearl flex-1">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
                <span className="ml-1 text-xs text-slate-400">
                  ({selectedEmployee.employeeCode})
                </span>
              </span>
            ) : (
              <span className="text-sm text-slate-400 flex-1">Select employee...</span>
            )}
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          {empOpen && (
            <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-stellar-blue rounded-lg shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 max-h-60 overflow-hidden flex flex-col">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-ink-black dark:text-pearl outline-none"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto max-h-48">
                {filteredEmployees.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-slate-400 text-center">
                    No employees found
                  </div>
                ) : (
                  filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        onChange('employeeId', emp.id);
                        setEmpOpen(false);
                        setEmpSearch('');
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        data.employeeId === emp.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      }`}
                    >
                      <span className="font-medium text-ink-black dark:text-pearl">
                        {emp.firstName} {emp.lastName}
                      </span>
                      <span className="text-xs text-slate-400">{emp.employeeCode}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shift dropdown */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Shift <span className="text-red-500">*</span>
        </label>
        <select
          value={data.shiftId || ''}
          onChange={(e) => onChange('shiftId', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
        >
          <option value="">Select shift...</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code}) · {s.startTime}–{s.endTime}
            </option>
          ))}
        </select>
      </div>

      {/* Roster date */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={
            data.rosterDate
              ? typeof data.rosterDate === 'string'
                ? data.rosterDate.slice(0, 10)
                : new Date(data.rosterDate).toISOString().slice(0, 10)
              : ''
          }
          onChange={(e) => onChange('rosterDate', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
        />
      </div>

      {/* Custom times */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Custom start (HH:MM)
          </label>
          <input
            type="time"
            value={data.customStartTime || ''}
            onChange={(e) => onChange('customStartTime', e.target.value || undefined)}
            className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Custom end (HH:MM)
          </label>
          <input
            type="time"
            value={data.customEndTime || ''}
            onChange={(e) => onChange('customEndTime', e.target.value || undefined)}
            className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
          />
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={!!data.isWeekOff}
            onChange={(e) => onChange('isWeekOff', e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          Week off
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={!!data.isHoliday}
            onChange={(e) => onChange('isHoliday', e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600"
          />
          Holiday
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// F-26: Swap request form with employee and shift dropdowns
// ---------------------------------------------------------------------------
function SwapForm({
  data,
  onChange,
  employees,
  shifts,
}: {
  data: Partial<Swap>;
  onChange: (field: string, value: any) => void;
  employees: { id: string; firstName: string; lastName: string; employeeCode: string }[];
  shifts: Shift[];
}) {
  return (
    <div className="space-y-4">
      {/* Requestor (you) */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Requestor (you) <span className="text-red-500">*</span>
        </label>
        <select
          value={data.requestorId || ''}
          onChange={(e) => onChange('requestorId', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
        >
          <option value="">Select your employee record...</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName} ({emp.employeeCode})
            </option>
          ))}
        </select>
      </div>

      {/* Requestor shift */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Your shift <span className="text-red-500">*</span>
        </label>
        <select
          value={data.requestorShiftId || ''}
          onChange={(e) => onChange('requestorShiftId', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
        >
          <option value="">Select your shift...</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code}) · {s.startTime}–{s.endTime}
            </option>
          ))}
        </select>
      </div>

      {/* Requestor date */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Your shift date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={
            data.requestorDate
              ? typeof data.requestorDate === 'string'
                ? data.requestorDate.slice(0, 10)
                : new Date(data.requestorDate).toISOString().slice(0, 10)
              : ''
          }
          onChange={(e) => onChange('requestorDate', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
        />
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Swap with employee */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Swap with (colleague) <span className="text-red-500">*</span>
        </label>
        <select
          value={data.swapWithId || ''}
          onChange={(e) => onChange('swapWithId', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
        >
          <option value="">Select colleague...</option>
          {employees
            .filter((emp) => emp.id !== data.requestorId)
            .map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.employeeCode})
              </option>
            ))}
        </select>
      </div>

      {/* Their shift */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Their shift <span className="text-red-500">*</span>
        </label>
        <select
          value={data.swapWithShiftId || ''}
          onChange={(e) => onChange('swapWithShiftId', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
        >
          <option value="">Select their shift...</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code}) · {s.startTime}–{s.endTime}
            </option>
          ))}
        </select>
      </div>

      {/* Their date */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Their shift date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={
            data.swapWithDate
              ? typeof data.swapWithDate === 'string'
                ? data.swapWithDate.slice(0, 10)
                : new Date(data.swapWithDate).toISOString().slice(0, 10)
              : ''
          }
          onChange={(e) => onChange('swapWithDate', e.target.value)}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm"
        />
      </div>

      {/* Reason */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.reason || ''}
          onChange={(e) => onChange('reason', e.target.value)}
          rows={3}
          placeholder="Why are you requesting this swap?"
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700 text-ink-black dark:text-pearl text-sm resize-none"
        />
      </div>
    </div>
  );
}
