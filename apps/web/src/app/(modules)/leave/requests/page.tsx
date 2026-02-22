'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

const LEAVE_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
];

export default function LeaveRequestsPage() {
  const [stats, setStats] = useState<any>(null);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchLeaveTypes();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/leave-requests/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch('/api/leave/types');
      const result = await response.json();
      if (result.success) {
        setLeaveTypes(
          result.data.map((type: any) => ({
            value: type.id,
            label: type.name,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch leave types:', error);
    }
  };

  const columns = [
    { key: 'employeeId', label: 'Employee' },
    {
      key: 'leaveTypeId',
      label: 'Leave Type',
      render: (row: any) => {
        const type = leaveTypes.find((t) => t.value === row.leaveTypeId);
        return type?.label || row.leaveTypeId;
      },
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (row: any) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (row: any) => new Date(row.endDate).toLocaleDateString(),
    },
    {
      key: 'totalDays',
      label: 'Days',
      render: (row: any) => `${row.totalDays} ${row.halfDayStart || row.halfDayEnd ? '(Half)' : ''}`,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row: any) => row.reason.substring(0, 50) + (row.reason.length > 50 ? '...' : ''),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => {
        const status = LEAVE_STATUSES.find((s) => s.value === row.status);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status?.color}`}>
            {status?.label}
          </span>
        );
      },
    },
    {
      key: 'appliedAt',
      label: 'Applied On',
      render: (row: any) => new Date(row.appliedAt).toLocaleDateString(),
    },
  ];

  const formFields = [
    { name: 'employeeId', label: 'Employee ID', type: 'text' as const, required: true },
    {
      name: 'leaveTypeId',
      label: 'Leave Type',
      type: 'select' as const,
      required: true,
      options: leaveTypes,
    },
    { name: 'startDate', label: 'Start Date', type: 'date' as const, required: true },
    { name: 'endDate', label: 'End Date', type: 'date' as const, required: true },
    { name: 'totalDays', label: 'Total Days', type: 'number' as const, required: true },
    { name: 'halfDayStart', label: 'Half Day (Start)', type: 'checkbox' as const },
    { name: 'halfDayEnd', label: 'Half Day (End)', type: 'checkbox' as const },
    { name: 'reason', label: 'Reason', type: 'textarea' as const, required: true },
    { name: 'contactNumber', label: 'Contact Number', type: 'text' as const },
    { name: 'addressDuringLeave', label: 'Address During Leave', type: 'textarea' as const },
    { name: 'delegateToEmployeeId', label: 'Delegate To (Employee ID)', type: 'text' as const },
  ];

  const getRowActions = (row: any) => {
    const actions = [];

    if (row.status === 'PENDING') {
      actions.push({
        label: 'Approve',
        apiEndpoint: `/api/v1/leave-requests/${row.id}/approve`,
        method: 'POST' as const,
        successMessage: 'Leave request approved',
      });
      actions.push({
        label: 'Reject',
        apiEndpoint: `/api/v1/leave-requests/${row.id}/reject`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'reason', label: 'Rejection Reason', type: 'textarea' as const, required: true },
        ],
        successMessage: 'Leave request rejected',
      });
    }

    if (['PENDING', 'APPROVED'].includes(row.status)) {
      actions.push({
        label: 'Cancel',
        apiEndpoint: `/api/v1/leave-requests/${row.id}/cancel`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'reason', label: 'Cancellation Reason', type: 'textarea' as const, required: true },
        ],
        successMessage: 'Leave request cancelled',
      });
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Requests</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Approved</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-300">Rejected</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Days Taken</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalDaysTaken}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Leave Requests Table */}
      <DataPage
        title="Leave Requests"
        apiEndpoint="/api/v1/leave-requests"
        columns={columns}
        formFields={formFields}
        rowActions={getRowActions}
        onDataChange={fetchStats}
      />
    </div>
  );
}

