'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { Award, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

const APPROVAL_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

export default function ConfirmationLettersPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/confirmations/stats');
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
      key: 'eligibleDate',
      label: 'Eligible Date',
      render: (row: any) => new Date(row.eligibleDate).toLocaleDateString(),
    },
    {
      key: 'requestedDate',
      label: 'Requested Date',
      render: (row: any) => new Date(row.requestedDate).toLocaleDateString(),
    },
    {
      key: 'newSalary',
      label: 'New Salary',
      render: (row: any) => row.newSalary ? `₹${row.newSalary.toLocaleString()}` : '-',
    },
    {
      key: 'managerApproval',
      label: 'Manager Approval',
      render: (row: any) => {
        const approval = APPROVAL_STATUS.find(a => a.value === row.managerApproval);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${approval?.color || 'bg-gray-100 text-gray-800'}`}>
            {approval?.label || row.managerApproval || 'Pending'}
          </span>
        );
      },
    },
    {
      key: 'hrApproval',
      label: 'HR Approval',
      render: (row: any) => {
        const approval = APPROVAL_STATUS.find(a => a.value === row.hrApproval);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${approval?.color || 'bg-gray-100 text-gray-800'}`}>
            {approval?.label || row.hrApproval || 'Pending'}
          </span>
        );
      },
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
      name: 'eligibleDate',
      label: 'Eligible Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'requestedDate',
      label: 'Requested Date',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'newSalary',
      label: 'New Salary (Optional)',
      type: 'number' as const,
      required: false,
      placeholder: 'Enter new salary if applicable',
    },
  ];

  const getRowActions = (row: any) => {
    const actions = [];

    if (row.status === 'PENDING' && row.managerApproval === 'PENDING') {
      actions.push({
        label: 'Manager Approve',
        apiEndpoint: `/api/v1/confirmations/${row.id}/manager-approve`,
        method: 'POST' as const,
        successMessage: 'Manager approval granted',
      });
      actions.push({
        label: 'Manager Reject',
        apiEndpoint: `/api/v1/confirmations/${row.id}/reject`,
        method: 'POST' as const,
        body: { rejectedBy: 'MANAGER' },
        successMessage: 'Request rejected by manager',
        confirmMessage: 'Are you sure you want to reject this confirmation request?',
      });
    }

    if (row.managerApproval === 'APPROVED' && row.hrApproval === 'PENDING') {
      actions.push({
        label: 'HR Approve',
        apiEndpoint: `/api/v1/confirmations/${row.id}/hr-approve`,
        method: 'POST' as const,
        successMessage: 'HR approval granted - Employee confirmed',
      });
      actions.push({
        label: 'HR Reject',
        apiEndpoint: `/api/v1/confirmations/${row.id}/reject`,
        method: 'POST' as const,
        body: { rejectedBy: 'HR' },
        successMessage: 'Request rejected by HR',
        confirmMessage: 'Are you sure you want to reject this confirmation request?',
      });
    }

    if (row.status === 'APPROVED') {
      actions.push({
        label: 'Confirm & Issue Letter',
        apiEndpoint: `/api/v1/confirmations/${row.id}/confirm`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'letterUrl', label: 'Confirmation Letter URL', type: 'text' as const, required: false },
        ],
        successMessage: 'Employee confirmed and letter issued',
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
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Requests</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Confirmed</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.confirmed}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      )}

      <DataPage
        title="Employee Confirmation"
        apiEndpoint="/api/v1/confirmations"
        columns={columns}
        formFields={formFields}
        rowActions={getRowActions}
        onDataChange={fetchStats}
      />
    </div>
  );
}

