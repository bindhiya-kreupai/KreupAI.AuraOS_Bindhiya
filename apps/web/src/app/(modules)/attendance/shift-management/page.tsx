'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { Clock, Users, Calendar, RefreshCw } from 'lucide-react';

export default function ShiftManagementPage() {
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments' | 'rosters' | 'swaps'>('shifts');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/shifts/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Shifts Tab
  const shiftColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    {
      key: 'startTime',
      label: 'Start Time',
    },
    {
      key: 'endTime',
      label: 'End Time',
    },
    {
      key: 'workHours',
      label: 'Work Hours',
      render: (row: any) => `${row.workHours}h`,
    },
    {
      key: 'graceInMinutes',
      label: 'Grace (In)',
      render: (row: any) => `${row.graceInMinutes} min`,
    },
    {
      key: 'isDefault',
      label: 'Default',
      render: (row: any) => row.isDefault ? (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Default</span>
      ) : null,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row: any) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const shiftFormFields = [
    { name: 'code', label: 'Shift Code', type: 'text' as const, required: true },
    { name: 'name', label: 'Shift Name', type: 'text' as const, required: true },
    { name: 'description', label: 'Description', type: 'textarea' as const },
    { name: 'startTime', label: 'Start Time (HH:MM)', type: 'text' as const, required: true, placeholder: '09:00' },
    { name: 'endTime', label: 'End Time (HH:MM)', type: 'text' as const, required: true, placeholder: '18:00' },
    { name: 'graceInMinutes', label: 'Grace In (Minutes)', type: 'number' as const, required: true },
    { name: 'graceOutMinutes', label: 'Grace Out (Minutes)', type: 'number' as const, required: true },
    { name: 'breakDuration', label: 'Break Duration (Minutes)', type: 'number' as const, required: true },
    { name: 'workHours', label: 'Work Hours', type: 'number' as const, required: true },
    { name: 'overtimeAllowed', label: 'Allow Overtime', type: 'checkbox' as const },
    { name: 'maxOvertimeHours', label: 'Max Overtime Hours', type: 'number' as const },
  ];

  const getShiftActions = (row: any) => {
    const actions = [];
    if (!row.isDefault) {
      actions.push({
        label: 'Set as Default',
        apiEndpoint: `/api/v1/shifts/${row.id}/set-default`,
        method: 'POST' as const,
        successMessage: 'Shift set as default',
      });
    }
    return actions;
  };

  // Assignments Tab
  const assignmentColumns = [
    { key: 'employeeId', label: 'Employee ID' },
    {
      key: 'shift.name',
      label: 'Shift',
      render: (row: any) => row.shift?.name || '-',
    },
    {
      key: 'effectiveFrom',
      label: 'From Date',
      render: (row: any) => new Date(row.effectiveFrom).toLocaleDateString(),
    },
    {
      key: 'effectiveTo',
      label: 'To Date',
      render: (row: any) => row.effectiveTo ? new Date(row.effectiveTo).toLocaleDateString() : 'Current',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row: any) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const assignmentFormFields = [
    { name: 'employeeId', label: 'Employee ID', type: 'text' as const, required: true },
    { name: 'shiftId', label: 'Shift ID', type: 'text' as const, required: true },
    { name: 'effectiveFrom', label: 'Effective From', type: 'date' as const, required: true },
    { name: 'effectiveTo', label: 'Effective To', type: 'date' as const },
    { name: 'reason', label: 'Reason', type: 'textarea' as const },
  ];

  // Rosters Tab
  const rosterColumns = [
    { key: 'employeeId', label: 'Employee ID' },
    {
      key: 'rosterDate',
      label: 'Date',
      render: (row: any) => new Date(row.rosterDate).toLocaleDateString(),
    },
    {
      key: 'shift.name',
      label: 'Shift',
      render: (row: any) => row.shift?.name || '-',
    },
    {
      key: 'isWeekOff',
      label: 'Week Off',
      render: (row: any) => row.isWeekOff ? '✓' : '',
    },
    {
      key: 'isHoliday',
      label: 'Holiday',
      render: (row: any) => row.isHoliday ? '✓' : '',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {row.status}
        </span>
      ),
    },
  ];

  const rosterFormFields = [
    { name: 'employeeId', label: 'Employee ID', type: 'text' as const, required: true },
    { name: 'shiftId', label: 'Shift ID', type: 'text' as const, required: true },
    { name: 'rosterDate', label: 'Roster Date', type: 'date' as const, required: true },
    { name: 'customStartTime', label: 'Custom Start Time (HH:MM)', type: 'text' as const },
    { name: 'customEndTime', label: 'Custom End Time (HH:MM)', type: 'text' as const },
    { name: 'isWeekOff', label: 'Mark as Week Off', type: 'checkbox' as const },
    { name: 'isHoliday', label: 'Mark as Holiday', type: 'checkbox' as const },
  ];

  // Swap Requests Tab
  const swapColumns = [
    { key: 'requestorId', label: 'Requestor' },
    { key: 'swapWithId', label: 'Swap With' },
    {
      key: 'requestorDate',
      label: 'Requestor Date',
      render: (row: any) => new Date(row.requestorDate).toLocaleDateString(),
    },
    {
      key: 'swapWithDate',
      label: 'Swap Date',
      render: (row: any) => new Date(row.swapWithDate).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: any) => {
        const colors: any = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          APPROVED_BY_PEER: 'bg-blue-100 text-blue-800',
          APPROVED_BY_MANAGER: 'bg-green-100 text-green-800',
          COMPLETED: 'bg-purple-100 text-purple-800',
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

  const swapFormFields = [
    { name: 'requestorId', label: 'Requestor Employee ID', type: 'text' as const, required: true },
    { name: 'swapWithId', label: 'Swap With Employee ID', type: 'text' as const, required: true },
    { name: 'requestorDate', label: 'Your Date', type: 'date' as const, required: true },
    { name: 'requestorShiftId', label: 'Your Shift ID', type: 'text' as const, required: true },
    { name: 'swapWithDate', label: 'Swap Date', type: 'date' as const, required: true },
    { name: 'swapWithShiftId', label: 'Swap Shift ID', type: 'text' as const, required: true },
    { name: 'reason', label: 'Reason', type: 'textarea' as const, required: true },
  ];

  const getSwapActions = (row: any) => {
    const actions = [];

    if (row.status === 'PENDING') {
      actions.push({
        label: 'Peer Approve',
        apiEndpoint: `/api/v1/shift-swaps/${row.id}/peer-approve`,
        method: 'POST' as const,
        successMessage: 'Swap approved by peer',
      });
    }

    if (row.status === 'APPROVED_BY_PEER') {
      actions.push({
        label: 'Manager Approve',
        apiEndpoint: `/api/v1/shift-swaps/${row.id}/manager-approve`,
        method: 'POST' as const,
        successMessage: 'Swap approved and completed',
      });
    }

    if (['PENDING', 'APPROVED_BY_PEER'].includes(row.status)) {
      actions.push({
        label: 'Reject',
        apiEndpoint: `/api/v1/shift-swaps/${row.id}/reject`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'reason', label: 'Rejection Reason', type: 'textarea' as const, required: true },
        ],
        successMessage: 'Swap request rejected',
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
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Shifts</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalShifts}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Active Shifts</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeShifts}</p>
              </div>
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Active Assignments</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.activeAssignments}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Pending Swaps</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingSwaps}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'shifts', label: 'Shifts' },
              { id: 'assignments', label: 'Assignments' },
              { id: 'rosters', label: 'Rosters' },
              { id: 'swaps', label: 'Swap Requests' },
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
          {activeTab === 'shifts' && (
            <DataPage
              title="Shift Definitions"
              apiEndpoint="/api/v1/shifts"
              columns={shiftColumns}
              formFields={shiftFormFields}
              rowActions={getShiftActions}
              onDataChange={fetchStats}
            />
          )}

          {activeTab === 'assignments' && (
            <DataPage
              title="Shift Assignments"
              apiEndpoint="/api/v1/shift-assignments"
              columns={assignmentColumns}
              formFields={assignmentFormFields}
              onDataChange={fetchStats}
            />
          )}

          {activeTab === 'rosters' && (
            <DataPage
              title="Shift Rosters"
              apiEndpoint="/api/v1/shift-rosters"
              columns={rosterColumns}
              formFields={rosterFormFields}
              onDataChange={fetchStats}
            />
          )}

          {activeTab === 'swaps' && (
            <DataPage
              title="Shift Swap Requests"
              apiEndpoint="/api/v1/shift-swaps"
              columns={swapColumns}
              formFields={swapFormFields}
              rowActions={getSwapActions}
              onDataChange={fetchStats}
            />
          )}
        </div>
      </div>
    </div>
  );
}
