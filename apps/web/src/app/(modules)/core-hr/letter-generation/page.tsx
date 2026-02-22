'use client';

import { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui';
import { FileText, Send, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const LETTER_TYPES = [
  { value: 'OFFER', label: 'Offer Letter', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'APPOINTMENT', label: 'Appointment Letter', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'CONFIRMATION', label: 'Confirmation Letter', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'PROMOTION', label: 'Promotion Letter', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'TRANSFER', label: 'Transfer Letter', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 'RESIGNATION', label: 'Resignation Acceptance', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'TERMINATION', label: 'Termination Letter', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  { value: 'PENDING', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'ISSUED', label: 'Issued', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

export default function LetterGenerationPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/letters/stats');
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
      key: 'letterType',
      label: 'Letter Type',
      render: (row: any) => {
        const type = LETTER_TYPES.find(t => t.value === row.letterType);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${type?.color || 'bg-gray-100 text-gray-800'}`}>
            {type?.label || row.letterType}
          </span>
        );
      },
    },
    { key: 'subject', label: 'Subject' },
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
      key: 'createdAt',
      label: 'Created',
      render: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'issuedAt',
      label: 'Issued',
      render: (row: any) => row.issuedAt ? new Date(row.issuedAt).toLocaleDateString() : '-',
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
      name: 'templateId',
      label: 'Template',
      type: 'text' as const,
      required: true,
      placeholder: 'Template ID',
    },
    {
      name: 'letterType',
      label: 'Letter Type',
      type: 'select' as const,
      required: true,
      options: LETTER_TYPES,
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text' as const,
      required: true,
      placeholder: 'Letter subject',
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Letter content',
    },
  ];

  const getRowActions = (row: any) => {
    const actions = [];

    if (row.status === 'APPROVED') {
      actions.push({
        label: 'Issue',
        apiEndpoint: `/api/v1/letters/${row.id}/issue`,
        method: 'POST' as const,
        successMessage: 'Letter issued successfully',
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
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Letters</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {stats.byStatus?.find((s: any) => s.status === 'PENDING')?._count || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Approved</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.byStatus?.find((s: any) => s.status === 'APPROVED')?._count || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Issued</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.byStatus?.find((s: any) => s.status === 'ISSUED')?._count || 0}
                </p>
              </div>
              <Send className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      )}

      <DataPage
        title="Letter Generation"
        apiEndpoint="/api/v1/letters"
        columns={columns}
        formFields={formFields}
        rowActions={getRowActions}
        onDataChange={fetchStats}
      />
    </div>
  );
}

