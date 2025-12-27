'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { Clock, CheckCircle, Gift, AlertCircle } from 'lucide-react';

const OVERTIME_TYPES = [
  { value: 'REGULAR', label: 'Regular', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'HOLIDAY', label: 'Holiday', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'WEEKEND', label: 'Weekend', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
];

const REGULARIZATION_TYPES = [
  { value: 'MISSED_PUNCH', label: 'Missed Punch' },
  { value: 'EARLY_OUT', label: 'Early Out' },
  { value: 'LATE_IN', label: 'Late In' },
  { value: 'WRONG_PUNCH', label: 'Wrong Punch' },
];

export default function OvertimeManagementPage() {
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overtime' | 'compoffs' | 'regularizations'>('overtime');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/overtime/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Overtime Tab
  const overtimeColumns = [
    { key: 'employeeId', label: 'Employee' },
    {
      key: 'overtimeDate',
      label: 'Date',
      render: (row: any) => new Date(row.overtimeDate).toLocaleDateString(),
    },
    {
      key: 'startTime',
      label: 'Start',
      render: (row: any) => new Date(row.startTime).toLocaleTimeString(),
    },
    {
      key: 'endTime',
      label: 'End',
      render: (row: any) => new Date(row.endTime).toLocaleTimeString(),
    },
    {
      key: 'totalHours',
      label: 'Hours',
      render: (row: any) => `${row.totalHours}h`,
    },
    {
      key: 'overtimeType',
      label: 'Type',
      render: (row: any) => {
        const type = OVERTIME_TYPES.find(t => t.value === row.overtimeType);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${type?.color}`}>
            {type?.label}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => {
        const colors: any = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          APPROVED: 'bg-green-100 text-green-800',
          REJECTED: 'bg-red-100 text-red-800',
          COMPLETED: 'bg-purple-100 text-purple-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'compensationType',
      label: 'Compensation',
      render: (row: any) => row.compensationType || '-',
    },
  ];

  const overtimeFormFields = [
    { name: 'employeeId', label: 'Employee ID', type: 'text' as const, required: true },
    { name: 'overtimeDate', label: 'Date', type: 'date' as const, required: true },
    { name: 'startTime', label: 'Start Time', type: 'datetime-local' as const, required: true },
    { name: 'endTime', label: 'End Time', type: 'datetime-local' as const, required: true },
    { name: 'totalHours', label: 'Total Hours', type: 'number' as const, required: true },
    { name: 'overtimeType', label: 'Type', type: 'select' as const, required: true, options: OVERTIME_TYPES },
    { name: 'reason', label: 'Reason', type: 'textarea' as const, required: true },
    { name: 'workDescription', label: 'Work Description', type: 'textarea' as const },
    { name: 'project', label: 'Project', type: 'text' as const },
  ];

  const getOvertimeActions = (row: any) => {
    const actions = [];

    if (row.status === 'PENDING') {
      actions.push({
        label: 'Approve',
        apiEndpoint: `/api/v1/overtime/${row.id}/approve`,
        method: 'POST' as const,
        successMessage: 'Overtime approved',
      });
      actions.push({
        label: 'Reject',
        apiEndpoint: `/api/v1/overtime/${row.id}/reject`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'reason', label: 'Rejection Reason', type: 'textarea' as const, required: true },
        ],
        successMessage: 'Overtime rejected',
      });
    }

    if (row.status === 'APPROVED' && !row.actualHours) {
      actions.push({
        label: 'Verify Hours',
        apiEndpoint: `/api/v1/overtime/${row.id}/verify`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'actualHours', label: 'Actual Hours Worked', type: 'number' as const, required: true },
        ],
        successMessage: 'Overtime verified',
      });
    }

    if (row.status === 'APPROVED' && !row.isCompensated) {
      actions.push({
        label: 'Convert to Comp-Off',
        apiEndpoint: `/api/v1/overtime/${row.id}/convert-to-compoff`,
        method: 'POST' as const,
        successMessage: 'Converted to comp-off',
      });
    }

    return actions;
  };

  // Comp-Off Tab
  const compOffColumns = [
    { key: 'employeeId', label: 'Employee' },
    {
      key: 'earnedDate',
      label: 'Earned Date',
      render: (row: any) => new Date(row.earnedDate).toLocaleDateString(),
    },
    {
      key: 'earnedHours',
      label: 'Hours',
      render: (row: any) => `${row.earnedHours}h`,
    },
    {
      key: 'appliedDate',
      label: 'Applied',
      render: (row: any) => row.appliedDate ? new Date(row.appliedDate).toLocaleDateString() : '-',
    },
    {
      key: 'expiryDate',
      label: 'Expires',
      render: (row: any) => new Date(row.expiryDate).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => {
        const colors: any = {
          EARNED: 'bg-green-100 text-green-800',
          APPLIED: 'bg-yellow-100 text-yellow-800',
          APPROVED: 'bg-blue-100 text-blue-800',
          AVAILED: 'bg-purple-100 text-purple-800',
          EXPIRED: 'bg-red-100 text-red-800',
          CANCELLED: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
  ];

  const compOffFormFields = [
    { name: 'employeeId', label: 'Employee ID', type: 'text' as const, required: true },
    { name: 'earnedDate', label: 'Earned Date', type: 'date' as const, required: true },
    { name: 'earnedHours', label: 'Hours Earned', type: 'number' as const, required: true },
    { name: 'expiryDate', label: 'Expiry Date', type: 'date' as const, required: true },
    { name: 'remarks', label: 'Remarks', type: 'textarea' as const },
  ];

  const getCompOffActions = (row: any) => {
    const actions = [];

    if (row.status === 'EARNED') {
      actions.push({
        label: 'Apply',
        apiEndpoint: `/api/v1/comp-offs/${row.id}/apply`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'appliedDate', label: 'Applied Date', type: 'date' as const, required: true },
        ],
        successMessage: 'Comp-off applied',
      });
    }

    if (row.status === 'APPLIED') {
      actions.push({
        label: 'Approve',
        apiEndpoint: `/api/v1/comp-offs/${row.id}/approve`,
        method: 'POST' as const,
        successMessage: 'Comp-off approved',
      });
    }

    return actions;
  };

  // Regularizations Tab
  const regularizationColumns = [
    { key: 'employeeId', label: 'Employee' },
    {
      key: 'date',
      label: 'Date',
      render: (row: any) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'regularizationType',
      label: 'Type',
      render: (row: any) => {
        const type = REGULARIZATION_TYPES.find(t => t.value === row.regularizationType);
        return type?.label || row.regularizationType;
      },
    },
    {
      key: 'requestedClockIn',
      label: 'Clock In',
      render: (row: any) => row.requestedClockIn ? new Date(row.requestedClockIn).toLocaleTimeString() : '-',
    },
    {
      key: 'requestedClockOut',
      label: 'Clock Out',
      render: (row: any) => row.requestedClockOut ? new Date(row.requestedClockOut).toLocaleTimeString() : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => {
        const colors: any = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          APPROVED: 'bg-green-100 text-green-800',
          REJECTED: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
  ];

  const regularizationFormFields = [
    { name: 'employeeId', label: 'Employee ID', type: 'text' as const, required: true },
    { name: 'date', label: 'Date', type: 'date' as const, required: true },
    { name: 'regularizationType', label: 'Type', type: 'select' as const, required: true, options: REGULARIZATION_TYPES },
    { name: 'requestedClockIn', label: 'Requested Clock In', type: 'datetime-local' as const },
    { name: 'requestedClockOut', label: 'Requested Clock Out', type: 'datetime-local' as const },
    { name: 'reason', label: 'Reason', type: 'textarea' as const, required: true },
  ];

  const getRegularizationActions = (row: any) => {
    const actions = [];

    if (row.status === 'PENDING') {
      actions.push({
        label: 'Approve',
        apiEndpoint: `/api/v1/regularizations/${row.id}/approve`,
        method: 'POST' as const,
        successMessage: 'Regularization approved and attendance updated',
      });
      actions.push({
        label: 'Reject',
        apiEndpoint: `/api/v1/regularizations/${row.id}/reject`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'reason', label: 'Rejection Reason', type: 'textarea' as const, required: true },
        ],
        successMessage: 'Regularization rejected',
      });
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total OT Hours</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalOvertimeHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pendingOvertime}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Available Comp-Off</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.availableCompOff}</p>
              </div>
              <Gift className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Comp-Off Hours</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalCompOffHours}h</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overtime', label: 'Overtime Requests' },
              { id: 'compoffs', label: 'Comp-Off Balance' },
              { id: 'regularizations', label: 'Regularizations' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overtime' && (
            <DataPage
              title="Overtime Requests"
              apiEndpoint="/api/v1/overtime"
              columns={overtimeColumns}
              formFields={overtimeFormFields}
              rowActions={getOvertimeActions}
              onDataChange={fetchStats}
            />
          )}

          {activeTab === 'compoffs' && (
            <DataPage
              title="Comp-Off Balance"
              apiEndpoint="/api/v1/comp-offs"
              columns={compOffColumns}
              formFields={compOffFormFields}
              rowActions={getCompOffActions}
              onDataChange={fetchStats}
            />
          )}

          {activeTab === 'regularizations' && (
            <DataPage
              title="Attendance Regularizations"
              apiEndpoint="/api/v1/regularizations"
              columns={regularizationColumns}
              formFields={regularizationFormFields}
              rowActions={getRegularizationActions}
              onDataChange={fetchStats}
            />
          )}
        </div>
      </div>
    </div>
  );
}
