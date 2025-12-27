'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

export default function LeaveBalancesPage() {
  const [stats, setStats] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/leave-balances');
      const result = await response.json();
      if (result.success) {
        const data = result.data;
        const totalAccrued = data.reduce((sum: number, b: any) => sum + Number(b.accrued), 0);
        const totalTaken = data.reduce((sum: number, b: any) => sum + Number(b.taken), 0);
        const totalBalance = data.reduce((sum: number, b: any) => sum + Number(b.currentBalance), 0);
        const totalEncashed = data.reduce((sum: number, b: any) => sum + Number(b.encashed), 0);

        setStats({
          totalAccrued,
          totalTaken,
          totalBalance,
          totalEncashed,
          employeeCount: new Set(data.map((b: any) => b.employeeId)).size,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const columns = [
    { key: 'employeeId', label: 'Employee ID' },
    {
      key: 'policy',
      label: 'Policy',
      render: (row: any) => row.policy?.name || '-',
    },
    {
      key: 'leaveYear',
      label: 'Year',
    },
    {
      key: 'openingBalance',
      label: 'Opening',
      render: (row: any) => Number(row.openingBalance).toFixed(2),
    },
    {
      key: 'accrued',
      label: 'Accrued',
      render: (row: any) => Number(row.accrued).toFixed(2),
    },
    {
      key: 'taken',
      label: 'Taken',
      render: (row: any) => (
        <span className="text-red-600 dark:text-red-400">
          -{Number(row.taken).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'adjusted',
      label: 'Adjusted',
      render: (row: any) => {
        const value = Number(row.adjusted);
        return (
          <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
            {value >= 0 ? '+' : ''}
            {value.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'encashed',
      label: 'Encashed',
      render: (row: any) => Number(row.encashed).toFixed(2),
    },
    {
      key: 'carriedForward',
      label: 'Carried Forward',
      render: (row: any) => Number(row.carriedForward).toFixed(2),
    },
    {
      key: 'lapsed',
      label: 'Lapsed',
      render: (row: any) => (
        <span className="text-orange-600 dark:text-orange-400">
          {Number(row.lapsed).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'currentBalance',
      label: 'Current Balance',
      render: (row: any) => {
        const balance = Number(row.currentBalance);
        return (
          <span
            className={`font-bold ${
              balance > 0
                ? 'text-green-600 dark:text-green-400'
                : balance < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {balance.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      render: (row: any) => new Date(row.lastUpdated).toLocaleDateString(),
    },
  ];

  const formFields = [
    { name: 'employeeId', label: 'Employee ID', type: 'text' as const, required: true },
    { name: 'policyId', label: 'Policy ID', type: 'text' as const, required: true },
    { name: 'leaveYear', label: 'Leave Year', type: 'number' as const, required: true },
    { name: 'openingBalance', label: 'Opening Balance', type: 'number' as const },
    { name: 'accrued', label: 'Accrued', type: 'number' as const },
    { name: 'taken', label: 'Taken', type: 'number' as const },
    { name: 'adjusted', label: 'Adjusted', type: 'number' as const },
    { name: 'encashed', label: 'Encashed', type: 'number' as const },
    { name: 'carriedForward', label: 'Carried Forward', type: 'number' as const },
    { name: 'lapsed', label: 'Lapsed', type: 'number' as const },
    { name: 'currentBalance', label: 'Current Balance', type: 'number' as const },
  ];

  const getRowActions = (row: any) => {
    return [
      {
        label: 'Adjust Balance',
        apiEndpoint: `/api/v1/leave-balances/${row.id}/adjust`,
        method: 'POST' as const,
        requiresInput: true,
        inputFields: [
          { name: 'adjustment', label: 'Adjustment (+/-)', type: 'number' as const, required: true },
          { name: 'reason', label: 'Reason', type: 'textarea' as const, required: true },
        ],
        successMessage: 'Balance adjusted successfully',
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Accrued</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalAccrued.toFixed(1)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-300">Total Taken</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {stats.totalTaken.toFixed(1)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Total Balance</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.totalBalance.toFixed(1)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Encashed</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {stats.totalEncashed.toFixed(1)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Employees</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.employeeCount}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Leave Balances Table */}
      <DataPage
        title="Leave Balances"
        apiEndpoint="/api/v1/leave-balances"
        columns={columns}
        formFields={formFields}
        rowActions={getRowActions}
        onDataChange={fetchStats}
      />
    </div>
  );
}
