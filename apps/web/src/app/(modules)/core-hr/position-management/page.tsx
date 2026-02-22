'use client';

import React, { useState, useEffect } from 'react';
import { DataPage, FormField, type RowAction } from '@aura/ui';
import {
  Building2, Users, DollarSign, TrendingUp,
  CheckCircle2, XCircle, Pause, FileText,
  ThumbsUp, Snowflake, Lock, Briefcase,
  MapPin, BarChart3, Network
} from 'lucide-react';

interface Position {
  id: string;
  positionCode: string;
  title: string;
  description?: string;
  departmentId: string;
  department?: { id: string; name: string };
  locationId?: string;
  location?: { id: string; name: string };
  reportsToPositionId?: string;
  reportsToPosition?: { id: string; title: string; positionCode: string };
  jobProfileId?: string;
  jobProfile?: { id: string; title: string };
  gradeId?: string;
  grade?: { id: string; name: string };
  headcount: number;
  fte: number;
  filledCount: number;
  vacantCount: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  annualBudget?: number;
  status: string;
  effectiveDate?: string;
  closedDate?: string;
  requestedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  byStatus: { status: string; count: number }[];
  totalHeadcount: number;
  totalFilled: number;
  totalVacant: number;
  fillRate: number;
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  FILLED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  FROZEN: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  CLOSED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const STATUS_ICONS = {
  DRAFT: FileText,
  OPEN: TrendingUp,
  FILLED: CheckCircle2,
  FROZEN: Snowflake,
  CLOSED: Lock,
};

const STATUS_FILTERS = [
  { value: 'DRAFT', label: 'Draft', icon: FileText, color: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700' },
  { value: 'OPEN', label: 'Open', icon: TrendingUp, color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800' },
  { value: 'FILLED', label: 'Filled', icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800' },
  { value: 'FROZEN', label: 'Frozen', icon: Snowflake, color: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-800' },
  { value: 'CLOSED', label: 'Closed', icon: Lock, color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800' },
];

export default function PositionManagementPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/positions/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(statusFilter === status ? '' : status);
  };

  const handleActionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const getStatusCount = (status: string) => {
    if (!stats) return 0;
    const statusData = stats.byStatus.find(s => s.status === status);
    return statusData?.count || 0;
  };

  const formatCurrency = (amount?: number, currency: string = 'USD') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'positionCode',
      label: 'Position Code',
      sortable: true,
      render: (row: Position) => (
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {row.positionCode}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (row: Position) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{row.title}</div>
          {row.description && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (row: Position) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Building2 className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">
            {row.department?.name || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (row: Position) => (
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">
            {row.location?.name || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'reportsTo',
      label: 'Reports To',
      render: (row: Position) => row.reportsToPosition ? (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {row.reportsToPosition.title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.reportsToPosition.positionCode}
          </div>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">Top Level</span>
      ),
    },
    {
      key: 'headcount',
      label: 'Headcount',
      sortable: true,
      render: (row: Position) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {row.headcount}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ({row.filledCount} filled, {row.vacantCount} vacant)
          </div>
        </div>
      ),
    },
    {
      key: 'fte',
      label: 'FTE',
      sortable: true,
      render: (row: Position) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {Number(row.fte).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'salaryRange',
      label: 'Salary Range',
      render: (row: Position) => {
        if (!row.salaryMin && !row.salaryMax) return <span className="text-gray-400 text-sm">-</span>;
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(row.salaryMin, row.salaryCurrency)} - {formatCurrency(row.salaryMax, row.salaryCurrency)}
            </div>
            {row.annualBudget && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Budget: {formatCurrency(row.annualBudget, row.salaryCurrency)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: Position) => {
        const StatusIcon = STATUS_ICONS[row.status as keyof typeof STATUS_ICONS] || FileText;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[row.status as keyof typeof STATUS_COLORS]}`}>
            <StatusIcon className="h-3 w-3" />
            {row.status}
          </span>
        );
      },
    },
  ];

  const formFields: FormField[] = [
    {
      name: 'positionCode',
      label: 'Position Code',
      type: 'text',
      placeholder: 'POS-ENG-001',
      required: true,
      helpText: 'Unique identifier for this position',
    },
    {
      name: 'title',
      label: 'Position Title',
      type: 'text',
      placeholder: 'Senior Software Engineer',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Brief description of the position responsibilities...',
      rows: 3,
    },
    {
      name: 'departmentId',
      label: 'Department',
      type: 'select',
      required: true,
      apiEndpoint: '/api/v1/departments',
      valueKey: 'id',
      labelKey: 'name',
    },
    {
      name: 'locationId',
      label: 'Location',
      type: 'select',
      apiEndpoint: '/api/v1/locations',
      valueKey: 'id',
      labelKey: 'name',
    },
    {
      name: 'reportsToPositionId',
      label: 'Reports To Position',
      type: 'select',
      apiEndpoint: '/api/v1/positions?status=OPEN,FILLED',
      valueKey: 'id',
      labelKey: 'title',
      helpText: 'Leave empty if this is a top-level position',
    },
    {
      name: 'jobProfileId',
      label: 'Job Profile',
      type: 'select',
      apiEndpoint: '/api/v1/job-profiles',
      valueKey: 'id',
      labelKey: 'title',
    },
    {
      name: 'gradeId',
      label: 'Grade',
      type: 'select',
      apiEndpoint: '/api/v1/grades',
      valueKey: 'id',
      labelKey: 'name',
    },
    {
      name: 'headcount',
      label: 'Headcount',
      type: 'number',
      placeholder: '1',
      required: true,
      defaultValue: 1,
      helpText: 'Number of positions to be filled',
    },
    {
      name: 'fte',
      label: 'FTE (Full-Time Equivalent)',
      type: 'number',
      placeholder: '1.0',
      step: 0.01,
      required: true,
      defaultValue: 1.0,
      helpText: 'e.g., 0.5 for part-time, 1.0 for full-time',
    },
    {
      name: 'salaryMin',
      label: 'Minimum Salary',
      type: 'number',
      placeholder: '50000',
      step: 1000,
    },
    {
      name: 'salaryMax',
      label: 'Maximum Salary',
      type: 'number',
      placeholder: '80000',
      step: 1000,
    },
    {
      name: 'salaryCurrency',
      label: 'Currency',
      type: 'select',
      options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' },
        { value: 'INR', label: 'INR' },
      ],
      defaultValue: 'USD',
    },
    {
      name: 'annualBudget',
      label: 'Annual Budget',
      type: 'number',
      placeholder: '100000',
      step: 1000,
      helpText: 'Total annual budget for this position',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'OPEN', label: 'Open' },
        { value: 'FILLED', label: 'Filled' },
        { value: 'FROZEN', label: 'Frozen' },
        { value: 'CLOSED', label: 'Closed' },
      ],
      defaultValue: 'DRAFT',
      required: true,
    },
    {
      name: 'effectiveDate',
      label: 'Effective Date',
      type: 'date',
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Additional notes or comments...',
      rows: 3,
    },
  ];

  const getRowActions = (row: Position): RowAction<Position>[] => {
    const actions: RowAction<Position>[] = [
      {
        label: 'View Details',
        icon: Briefcase,
        onClick: (row: Position) => {
          console.log('View position:', row);
        },
      },
      {
        label: 'Edit',
        icon: FileText,
        variant: 'default' as const,
      },
    ];

    if (row.status === 'DRAFT') {
      actions.push({
        label: 'Approve',
        icon: ThumbsUp,
        variant: 'success' as const,
        confirmTitle: `Are you sure you want to approve position "${row.title}"? This will change its status to OPEN.`,
        apiEndpoint: `/api/v1/positions/${row.id}/approve`,
        method: 'POST' as const,
        onSuccess: handleActionSuccess,
      });
    }

    if (row.status === 'OPEN') {
      actions.push({
        label: 'Freeze',
        icon: Snowflake,
        variant: 'warning' as const,
        confirmTitle: 'Freeze Position?',
        confirmMessage: `Are you sure you want to freeze position "${row.title}"? This will temporarily halt hiring.`,
        apiEndpoint: `/api/v1/positions/${row.id}/freeze`,
        method: 'POST' as const,
        onSuccess: handleActionSuccess,
      });
    }

    if (row.status !== 'CLOSED') {
      actions.push({
        label: 'Close',
        icon: XCircle,
        variant: 'danger' as const,
        confirmTitle: 'Close Position?',
        confirmMessage: `Are you sure you want to close position "${row.title}"? This action cannot be undone.`,
        apiEndpoint: `/api/v1/positions/${row.id}/close`,
        method: 'POST' as const,
        onSuccess: handleActionSuccess,
      });
    }

    actions.push({
      label: 'Delete',
      icon: XCircle,
      variant: 'danger' as const,
    });

    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Positions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Positions</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {stats?.total || 0}
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Open</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {getStatusCount('OPEN')}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500 dark:text-green-400" />
          </div>
        </div>

        {/* Filled Positions */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Filled</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                {getStatusCount('FILLED')}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          </div>
        </div>

        {/* Frozen Positions */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Frozen</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                {getStatusCount('FROZEN')}
              </p>
            </div>
            <Snowflake className="h-8 w-8 text-orange-500 dark:text-orange-400" />
          </div>
        </div>

        {/* Headcount Stats */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Total Headcount</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                {stats?.totalHeadcount || 0}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                {stats?.totalFilled || 0} filled
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500 dark:text-purple-400" />
          </div>
        </div>

        {/* Fill Rate */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Fill Rate</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-1">
                {stats?.fillRate ? `${stats.fillRate.toFixed(1)}%` : '0%'}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                {stats?.totalVacant || 0} vacant
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => {
          const Icon = status.icon;
          const isActive = statusFilter === status.value;
          return (
            <button
              key={status.value}
              onClick={() => handleStatusFilter(status.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${isActive
                ? status.color + ' ring-2 ring-offset-2 ring-current'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {status.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/50 dark:bg-black/20">
                {getStatusCount(status.value)}
              </span>
            </button>
          );
        })}
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* DataPage */}
      <DataPage
        title="Position Management"
        apiEndpoint="/api/v1/positions"
        columns={columns}
        formFields={formFields}
        searchPlaceholder="Search positions by code, title, or department..."
        pageSize={20}
        enableCreate
        enableEdit
        enableDelete
        enableExport
        enableColumnVisibility
        filterParams={statusFilter ? { status: statusFilter } : undefined}
        onDataChange={handleActionSuccess}
        rowActions={getRowActions}
        emptyState={{
          icon: Briefcase,
          title: 'No positions found',
          description: 'Get started by creating your first position.',
        }}
      />
    </div>
  );
}
