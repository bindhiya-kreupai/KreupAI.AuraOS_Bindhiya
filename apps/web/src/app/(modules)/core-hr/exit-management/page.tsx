'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { LogOut, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const EXIT_TYPES = [
  { value: 'RESIGNATION', label: 'Resignation', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'TERMINATION', label: 'Termination', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'RETIREMENT', label: 'Retirement', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'ABSCONDING', label: 'Absconding', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'CONTRACT_END', label: 'Contract End', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

export default function ExitManagementPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/exits/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const columns = [
    { key: 'employee.employeeCode', label: 'Employee Code' },
    {
      key: 'employee',
      label: 'Employee Name',
      render: (row: any) => `${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`.trim(),
    },
    {
      key: 'employee.department.name',
      label: 'Department',
      render: (row: any) => row.employee?.department?.name || '-',
    },
    {
      key: 'exitType',
      label: 'Exit Type',
      render: (row: any) => {
        const type = EXIT_TYPES.find(t => t.value === row.exitType);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${type?.color || 'bg-gray-100 text-gray-800'}`}>
            {type?.label || row.exitType}
          </span>
        );
      },
    },
    {
      key: 'resignationDate',
      label: 'Resignation Date',
      render: (row: any) => new Date(row.resignationDate).toLocaleDateString(),
    },
    {
      key: 'lastWorkingDate',
      label: 'Last Working Date',
      render: (row: any) => new Date(row.lastWorkingDate).toLocaleDateString(),
    },
    {
      key: 'noticePeriodDays',
      label: 'Notice Period',
      render: (row: any) => `${row.noticePeriodDays} days`,
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
  ];

  const formFields = [
    {
      name: 'employeeId',
      label: 'Employee',
      type: 'text' as const,
      required: true,
      placeholder: 'Employee ID',
    },
    {
      name: 'exitType',
      label: 'Exit Type',
      type: 'select' as const,
      required: true,
      options: EXIT_TYPES,
    },
    {
      name: 'resignationDate',
      label: 'Resignation Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'lastWorkingDate',
      label: 'Last Working Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'noticePeriodDays',
      label: 'Notice Period (Days)',
      type: 'number' as const,
      required: true,
      placeholder: '30',
    },
    {
      name: 'reason',
      label: 'Reason',
      type: 'textarea' as const,
      required: false,
      placeholder: 'Reason for exit',
    },
  ];

  const getRowActions = (row: any) => {
    const actions = [];

    if (row.status === 'PENDING') {
      actions.push({
        label: 'Approve',
        apiEndpoint: `/api/v1/exits/${row.id}/approve`,
        method: 'POST' as const,
        successMessage: 'Exit request approved',
      });
    }

    if (row.status === 'APPROVED' && row.clearanceStatus === 'COMPLETED') {
      actions.push({
        label: 'Complete',
        apiEndpoint: `/api/v1/exits/${row.id}/complete`,
        method: 'POST' as const,
        successMessage: 'Exit process completed',
      });
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Exits</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <LogOut className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">This Month</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.thisMonth}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Completed</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.byStatus?.find((s: any) => s.status === 'COMPLETED')?.count || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      )}

      <DataPage
        title="Exit Management"
        apiEndpoint="/api/v1/exits"
        columns={columns}
        formFields={formFields}
        rowActions={getRowActions}
        onDataChange={fetchStats}
      />
    </div>
  );
}
