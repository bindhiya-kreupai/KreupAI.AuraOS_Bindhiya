'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { UserCheck, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'EXTENDED', label: 'Extended', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'TERMINATED', label: 'Terminated', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

export default function ProbationTrackingPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/probation/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error: any) {
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
      key: 'extendedEndDate',
      label: 'Extended End Date',
      render: (row: any) => row.extendedEndDate ? new Date(row.extendedEndDate).toLocaleDateString() : '-',
    },
    {
      key: 'performanceRating',
      label: 'Performance',
      render: (row: any) => row.performanceRating || '-',
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
      name: 'startDate',
      label: 'Start Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'endDate',
      label: 'End Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'performanceRating',
      label: 'Performance Rating',
      type: 'text' as const,
      required: false,
      placeholder: 'e.g., Excellent, Good, Satisfactory',
    },
    {
      name: 'managerRecommendation',
      label: 'Manager Recommendation',
      type: 'textarea' as const,
      required: false,
      placeholder: 'Manager comments and recommendation',
    },
  ];

  const getRowActions = (row: any) => {
    const actions = [];

    if (row.status === 'ACTIVE') {
      actions.push({
        label: 'Extend',
        apiEndpoint: `/api/v1/probation/${row.id}/extend`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'newEndDate', label: 'New End Date', type: 'date' as const, required: true },
          { name: 'reason', label: 'Reason', type: 'textarea' as const, required: false },
        ],
        successMessage: 'Probation extended successfully',
      });
      actions.push({
        label: 'Confirm',
        apiEndpoint: `/api/v1/probation/${row.id}/confirm`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'hrRecommendation', label: 'HR Recommendation', type: 'textarea' as const, required: false },
        ],
        successMessage: 'Employee confirmed successfully',
      });
      actions.push({
        label: 'Terminate',
        apiEndpoint: `/api/v1/probation/${row.id}/terminate`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'reason', label: 'Termination Reason', type: 'textarea' as const, required: true },
        ],
        successMessage: 'Employee terminated',
        confirmMessage: 'Are you sure you want to terminate this employee?',
      });
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Probations</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Active</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Ending Soon (30 days)</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.ending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Confirmed</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.byStatus?.find((s: any) => s.status === 'CONFIRMED')?.count || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      )}

      <DataPage
        title="Probation Tracking"
        apiEndpoint="/api/v1/probation"
        columns={columns}
        formFields={formFields}
        rowActions={getRowActions}
        onDataChange={fetchStats}
      />
    </div>
  );
}

