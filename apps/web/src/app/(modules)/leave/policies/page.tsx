'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { FileText, CheckCircle, XCircle, Settings } from 'lucide-react';

const ACCRUAL_TYPES = [
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'TENURE', label: 'Tenure Based' },
];

export default function LeavePoliciesPage() {
  const [stats, setStats] = useState<any>(null);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchLeaveTypes();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/leave-policies?isActive=true');
      const result = await response.json();
      if (result.success) {
        setStats({
          total: result.meta.total,
          active: result.data.filter((p: any) => p.isActive).length,
          inactive: result.data.filter((p: any) => !p.isActive).length,
        });
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
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    {
      key: 'leaveTypeId',
      label: 'Leave Type',
      render: (row: any) => {
        const type = leaveTypes.find((t) => t.value === row.leaveTypeId);
        return type?.label || row.leaveTypeId;
      },
    },
    {
      key: 'annualEntitlement',
      label: 'Annual Days',
      render: (row: any) => `${row.annualEntitlement} days`,
    },
    {
      key: 'accrualType',
      label: 'Accrual',
      render: (row: any) => {
        const type = ACCRUAL_TYPES.find((t) => t.value === row.accrualType);
        return type?.label || row.accrualType;
      },
    },
    {
      key: 'allowCarryForward',
      label: 'Carry Forward',
      render: (row: any) =>
        row.allowCarryForward ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        ),
    },
    {
      key: 'allowEncashment',
      label: 'Encashment',
      render: (row: any) =>
        row.allowEncashment ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        ),
    },
    {
      key: 'requiresApproval',
      label: 'Requires Approval',
      render: (row: any) =>
        row.requiresApproval ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-gray-400" />
        ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row: any) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const formFields = [
    { name: 'code', label: 'Policy Code', type: 'text' as const, required: true },
    { name: 'name', label: 'Policy Name', type: 'text' as const, required: true },
    { name: 'nameAr', label: 'Policy Name (Arabic)', type: 'text' as const },
    {
      name: 'leaveTypeId',
      label: 'Leave Type',
      type: 'select' as const,
      required: true,
      options: leaveTypes,
    },
    { name: 'countryCode', label: 'Country Code', type: 'text' as const },
    { name: 'minServiceMonths', label: 'Min Service (Months)', type: 'number' as const },
    {
      name: 'annualEntitlement',
      label: 'Annual Entitlement (Days)',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'accrualType',
      label: 'Accrual Type',
      type: 'select' as const,
      options: ACCRUAL_TYPES,
    },
    { name: 'accrualRate', label: 'Accrual Rate', type: 'number' as const },
    { name: 'allowCarryForward', label: 'Allow Carry Forward', type: 'checkbox' as const },
    { name: 'maxCarryForwardDays', label: 'Max Carry Forward Days', type: 'number' as const },
    {
      name: 'carryForwardExpiryMonths',
      label: 'Carry Forward Expiry (Months)',
      type: 'number' as const,
    },
    { name: 'allowEncashment', label: 'Allow Encashment', type: 'checkbox' as const },
    { name: 'maxEncashmentDays', label: 'Max Encashment Days', type: 'number' as const },
    { name: 'encashmentRate', label: 'Encashment Rate (%)', type: 'number' as const },
    { name: 'allowNegativeBalance', label: 'Allow Negative Balance', type: 'checkbox' as const },
    { name: 'maxNegativeDays', label: 'Max Negative Days', type: 'number' as const },
    { name: 'minConsecutiveDays', label: 'Min Consecutive Days', type: 'number' as const },
    { name: 'maxConsecutiveDays', label: 'Max Consecutive Days', type: 'number' as const },
    { name: 'advanceNoticeDays', label: 'Advance Notice (Days)', type: 'number' as const },
    { name: 'requiresApproval', label: 'Requires Approval', type: 'checkbox' as const },
    { name: 'requiresDocument', label: 'Requires Document', type: 'checkbox' as const },
    { name: 'proRataOnJoining', label: 'Pro-rata on Joining', type: 'checkbox' as const },
    { name: 'proRataOnExit', label: 'Pro-rata on Exit', type: 'checkbox' as const },
  ];

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Policies</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Active</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inactive}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Leave Policies Table */}
      <DataPage
        title="Leave Policies"
        apiEndpoint="/api/v1/leave-policies"
        columns={columns}
        formFields={formFields}
        onDataChange={fetchStats}
      />
    </div>
  );
}

