'use client';

import React, { useState, useEffect } from 'react';
import type { FormField} from '@aura/ui';
import { DataPage, type RowAction } from '@aura/ui';
import { Heart, Baby, Users, Home, AlertCircle, CheckCircle, Clock, XCircle, FileText, Calendar } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'MARRIAGE', label: 'Marriage', icon: Heart, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
  { value: 'BIRTH', label: 'Birth', icon: Baby, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'ADOPTION', label: 'Adoption', icon: Users, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  { value: 'RELOCATION', label: 'Relocation', icon: Home, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  { value: 'DEATH', label: 'Death', icon: AlertCircle, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  VERIFIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PROCESSED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function EmployeeLifeEventsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/life-events/stats');
      const result = await response.json();
      if (result.success) setStats(result.data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const columns = [
    {
      key: 'eventDate',
      label: 'Event Date',
      sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(row.eventDate).toLocaleDateString()}</span>
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
      key: 'eventType',
      label: 'Event Type',
      sortable: true,
      render: (row: any) => {
        const eventConfig = EVENT_TYPES.find(e => e.value === row.eventType);
        const Icon = eventConfig?.icon || FileText;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${eventConfig?.color}`}>
            <Icon className="h-3 w-3" />
            {eventConfig?.label || row.eventType}
          </span>
        );
      },
    },
    {
      key: 'title',
      label: 'Title',
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.title}</div>
          {row.relatedPersonName && (
            <div className="text-xs text-gray-500">Related: {row.relatedPersonName} ({row.relatedPersonRelation})</div>
          )}
        </div>
      ),
    },
    {
      key: 'impacts',
      label: 'Impacts',
      render: (row: any) => {
        const impacts = [];
        if (row.impactsPayroll) impacts.push('Payroll');
        if (row.impactsBenefits) impacts.push('Benefits');
        if (row.impactsTax) impacts.push('Tax');
        return impacts.length > 0 ? impacts.join(', ') : '-';
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: any) => {
        const icons: Record<string, any> = {
          PENDING: Clock,
          VERIFIED: CheckCircle,
          PROCESSED: CheckCircle,
          REJECTED: XCircle,
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
      name: 'eventType',
      label: 'Event Type',
      type: 'select',
      required: true,
      options: EVENT_TYPES.map(e => ({ value: e.value, label: e.label })),
    },
    {
      name: 'eventDate',
      label: 'Event Date',
      type: 'date',
      required: true,
    },
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Brief title for the event',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
    },
    {
      name: 'relatedPersonName',
      label: 'Related Person Name',
      type: 'text',
    },
    {
      name: 'relatedPersonRelation',
      label: 'Relationship',
      type: 'select',
      options: [
        { value: 'SPOUSE', label: 'Spouse' },
        { value: 'CHILD', label: 'Child' },
        { value: 'PARENT', label: 'Parent' },
        { value: 'SIBLING', label: 'Sibling' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
    {
      name: 'impactsPayroll',
      label: 'Impacts Payroll',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'impactsBenefits',
      label: 'Impacts Benefits',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'impactsTax',
      label: 'Impacts Tax',
      type: 'checkbox',
      defaultValue: false,
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
      { label: 'View', icon: FileText },
      { label: 'Edit', icon: FileText },
    ];

    if (row.status === 'PENDING') {
      actions.push({
        label: 'Verify',
        icon: CheckCircle,
        variant: 'success' as const,
        apiEndpoint: `/api/v1/life-events/${row.id}/verify`,
        method: 'POST' as const,
        onSuccess: fetchStats,
      });
      actions.push({
        label: 'Reject',
        icon: XCircle,
        variant: 'danger' as const,
        apiEndpoint: `/api/v1/life-events/${row.id}/reject`,
        method: 'POST' as const,
        onSuccess: fetchStats,
      });
    }

    if (row.status === 'VERIFIED') {
      actions.push({
        label: 'Process',
        icon: CheckCircle,
        variant: 'success' as const,
        apiEndpoint: `/api/v1/life-events/${row.id}/process`,
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
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Events</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{stats?.total || 0}</p>
            </div>
            <Heart className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">{stats?.pending || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Verified</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{stats?.verified || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Processed</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{stats?.processed || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
      </div>

      <DataPage
        title="Employee Life Events"
        apiEndpoint="/api/v1/life-events"
        columns={columns}
        formFields={formFields}
        searchPlaceholder="Search life events..."
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

