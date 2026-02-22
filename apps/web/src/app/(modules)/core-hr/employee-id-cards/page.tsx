'use client';

import React, { useState, useEffect } from 'react';
import { DataPage, FormField, type RowAction } from '@aura/ui';
import { CreditCard, CheckCircle, Clock, XCircle, Printer, AlertTriangle, User, Calendar } from 'lucide-react';

const CARD_TYPES = [
  { value: 'EMPLOYEE', label: 'Employee', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'TEMPORARY', label: 'Temporary', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'CONTRACTOR', label: 'Contractor', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  { value: 'VISITOR', label: 'Visitor', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  APPROVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  ISSUED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  EXPIRED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  REVOKED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  LOST: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

export default function EmployeeIDCardsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/id-cards/stats');
      const result = await response.json();
      if (result.success) setStats(result.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusCount = (status: string) => stats?.byStatus?.find((s: any) => s.status === status)?.count || 0;

  const columns = [
    {
      key: 'cardNumber',
      label: 'Card Number',
      sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="font-mono font-medium">{row.cardNumber}</span>
        </div>
      ),
    },
    {
      key: 'employee',
      label: 'Employee',
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.employee?.firstName} {row.employee?.lastName}</div>
          <div className="text-xs text-gray-500">{row.employee?.employeeCode}</div>
        </div>
      ),
    },
    {
      key: 'cardType',
      label: 'Card Type',
      sortable: true,
      render: (row: any) => {
        const typeConfig = CARD_TYPES.find(t => t.value === row.cardType);
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig?.color}`}>
            {typeConfig?.label || row.cardType}
          </span>
        );
      },
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
      render: (row: any) => new Date(row.issueDate).toLocaleDateString(),
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      sortable: true,
      render: (row: any) => row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'No Expiry',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: any) => {
        const icons: Record<string, any> = {
          PENDING: Clock,
          APPROVED: CheckCircle,
          ISSUED: CheckCircle,
          EXPIRED: AlertTriangle,
          REVOKED: XCircle,
          LOST: XCircle,
        };
        const Icon = icons[row.status] || Clock;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] || STATUS_COLORS.PENDING}`}>
            <Icon className="h-3 w-3" />
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'printedCount',
      label: 'Printed',
      render: (row: any) => (
        <div className="flex items-center gap-1.5">
          <Printer className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm">{row.printedCount}x</span>
        </div>
      ),
    },
  ];

  const formFields: FormField[] = [
    {
      name: 'employeeId',
      label: 'Employee',
      type: 'select',
      required: true,
      apiEndpoint: '/api/v1/employees',
      valueKey: 'id',
      labelKey: 'firstName',
      labelFormat: (emp: any) => `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`,
    },
    {
      name: 'templateId',
      label: 'Card Template',
      type: 'select',
      required: true,
      options: [{ value: 'default', label: 'Default Template' }],
    },
    {
      name: 'cardNumber',
      label: 'Card Number',
      type: 'text',
      required: true,
      placeholder: 'CARD-2024-0001',
    },
    {
      name: 'cardType',
      label: 'Card Type',
      type: 'select',
      required: true,
      options: CARD_TYPES.map(t => ({ value: t.value, label: t.label })),
    },
    {
      name: 'issueDate',
      label: 'Issue Date',
      type: 'date',
      required: true,
    },
    {
      name: 'expiryDate',
      label: 'Expiry Date',
      type: 'date',
    },
    {
      name: 'photoUrl',
      label: 'Photo URL',
      type: 'text',
      placeholder: 'https://example.com/photo.jpg',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      rows: 2,
    },
  ];

  const getRowActions = (row: any): RowAction<any>[] => {
    const actions: RowAction<any>[] = [
      { label: 'View', icon: CreditCard },
      { label: 'Edit', icon: User },
    ];

    if (row.status === 'APPROVED') {
      actions.push({
        label: 'Issue',
        icon: CheckCircle,
        variant: 'success' as const,
        apiEndpoint: `/api/v1/id-cards/${row.id}/issue`,
        method: 'POST' as const,
        onSuccess: fetchStats,
      });
    }

    if (['ISSUED', 'APPROVED'].includes(row.status)) {
      actions.push({
        label: 'Print',
        icon: Printer,
        variant: 'default' as const,
        apiEndpoint: `/api/v1/id-cards/${row.id}/print`,
        method: 'POST' as const,
        onSuccess: fetchStats,
      });
    }

    if (['ISSUED', 'APPROVED'].includes(row.status)) {
      actions.push({
        label: 'Revoke',
        icon: XCircle,
        variant: 'danger' as const,
        apiEndpoint: `/api/v1/id-cards/${row.id}/revoke`,
        method: 'POST' as const,
        onSuccess: fetchStats,
      });
    }

    actions.push({ label: 'Delete', icon: XCircle, variant: 'danger' as const });
    return actions;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Cards</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{stats?.total || 0}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Issued</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{getStatusCount('ISSUED')}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">{getStatusCount('PENDING')}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">{stats?.expiringSoon || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <DataPage
        title="Employee ID Cards"
        apiEndpoint="/api/v1/id-cards"
        columns={columns}
        formFields={formFields}
        searchPlaceholder="Search by card number or employee..."
        pageSize={20}
        enableCreate
        enableEdit
        enableDelete
        enableExport
        rowActions={getRowActions}
        onDataChange={fetchStats}
      />
    </div>
  );
}

