'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const PUNCH_TYPES = [
  { value: 'CLOCK_IN', label: 'Clock In', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'CLOCK_OUT', label: 'Clock Out', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'BREAK_START', label: 'Break Start', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'BREAK_END', label: 'Break End', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
];

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'ABSENT', label: 'Absent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'HALF_DAY', label: 'Half Day', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'LATE', label: 'Late', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'EARLY_OUT', label: 'Early Out', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'ON_LEAVE', label: 'On Leave', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'HOLIDAY', label: 'Holiday', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  { value: 'WEEK_OFF', label: 'Week Off', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
];

export default function TimeTrackingPage() {
  const [stats, setStats] = useState<any>(null);
  const [todayPunches, setTodayPunches] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchTodayPunches();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/attendance/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTodayPunches = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/v1/attendance/punches?punchDate=${today}`);
      const result = await response.json();
      if (result.success) {
        setTodayPunches(result.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch today punches:', error);
    }
  };

  const handleClockAction = async (punchType: string) => {
    try {
      const response = await fetch('/api/v1/attendance/punches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          punchDate: new Date(),
          punchTime: new Date(),
          punchType,
          device: 'Web',
        }),
      });

      if (response.ok) {
        fetchTodayPunches();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Clock action failed:', error);
    }
  };

  const recordColumns = [
    {
      key: 'date',
      label: 'Date',
      render: (row: any) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'clockIn',
      label: 'Clock In',
      render: (row: any) => row.clockIn ? new Date(row.clockIn).toLocaleTimeString() : '-',
    },
    {
      key: 'clockOut',
      label: 'Clock Out',
      render: (row: any) => row.clockOut ? new Date(row.clockOut).toLocaleTimeString() : '-',
    },
    {
      key: 'workHours',
      label: 'Work Hours',
      render: (row: any) => `${row.workHours.toFixed(2)}h`,
    },
    {
      key: 'overtimeHours',
      label: 'Overtime',
      render: (row: any) => `${row.overtimeHours.toFixed(2)}h`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => {
        const status = STATUS_OPTIONS.find(s => s.value === row.status);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status?.color || 'bg-gray-100 text-gray-800'}`}>
            {status?.label || row.status}
          </span>
        );
      },
    },
    {
      key: 'approvalStatus',
      label: 'Approval',
      render: (row: any) => {
        const colors = {
          PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[row.approvalStatus as keyof typeof colors]}`}>
            {row.approvalStatus}
          </span>
        );
      },
    },
  ];

  const recordFormFields = [
    {
      name: 'employeeId',
      label: 'Employee ID',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'clockIn',
      label: 'Clock In Time',
      type: 'datetime-local' as const,
      required: false,
    },
    {
      name: 'clockOut',
      label: 'Clock Out Time',
      type: 'datetime-local' as const,
      required: false,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: STATUS_OPTIONS,
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'textarea' as const,
      required: false,
    },
  ];

  const getRowActions = (row: any) => {
    const actions = [];

    if (row.approvalStatus === 'PENDING') {
      actions.push({
        label: 'Approve',
        apiEndpoint: `/api/v1/attendance/records/${row.id}/approve`,
        method: 'POST' as const,
        successMessage: 'Attendance approved',
      });
      actions.push({
        label: 'Reject',
        apiEndpoint: `/api/v1/attendance/records/${row.id}/reject`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'reason', label: 'Rejection Reason', type: 'textarea' as const, required: true },
        ],
        successMessage: 'Attendance rejected',
      });
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      {/* Quick Clock Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleClockAction('CLOCK_IN')}
            className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
          >
            Clock In
          </button>
          <button
            onClick={() => handleClockAction('CLOCK_OUT')}
            className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
          >
            Clock Out
          </button>
          <button
            onClick={() => handleClockAction('BREAK_START')}
            className="p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition"
          >
            Start Break
          </button>
          <button
            onClick={() => handleClockAction('BREAK_END')}
            className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            End Break
          </button>
        </div>

        {/* Today's Punches */}
        {todayPunches.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Today's Activity</h4>
            <div className="space-y-2">
              {todayPunches.map((punch) => {
                const punchType = PUNCH_TYPES.find(p => p.value === punch.punchType);
                return (
                  <div key={punch.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${punchType?.color}`}>
                      {punchType?.label}
                    </span>
                    <span className="text-sm">{new Date(punch.punchTime).toLocaleTimeString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Present Days</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.present}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-300">Absent Days</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Late Days</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.late}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Hours</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalWorkHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <DataPage
        title="Attendance Records"
        apiEndpoint="/api/v1/attendance/records"
        columns={recordColumns}
        formFields={recordFormFields}
        rowActions={getRowActions}
        onDataChange={fetchStats}
      />
    </div>
  );
}

