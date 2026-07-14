'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataPage, ErrorState, ExportMenu, Skeleton } from '@aura/ui/components/ui';
import type { Column, ExportFormat } from '@aura/ui/components/ui';
import { Shield, ShieldOff } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  user: { email: string; firstName: string | null; lastName: string | null } | null;
  action: string;
  module: string;
  severity: string;
  resourceType: string | null;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  success: boolean;
  metadata: Record<string, unknown> | null;
  timestamp: string;
  createdAt: string;
}

interface AuditFilters {
  action?: string;
  module?: string;
  fromDate?: string;
  toDate?: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CRITICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const ACTION_OPTIONS = [
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'LOGIN_SUCCESS',
  'EMPLOYEE_CREATED',
  'EMPLOYEE_UPDATED',
  'EMPLOYEE_DELETED',
  'EMPLOYEE_TERMINATED',
  'EMPLOYEE_REHIRED',
  'PAYROLL_RUN_INITIATED',
  'PAYROLL_RUN_APPROVED',
  'PAYROLL_RUN_REJECTED',
  'PAYSLIP_GENERATED',
  'PAYSLIP_VIEWED',
  'SALARY_UPDATED',
  'LEAVE_REQUEST_CREATED',
  'LEAVE_REQUEST_APPROVED',
  'LEAVE_REQUEST_REJECTED',
  'LEAVE_REQUEST_CANCELLED',
  'LEAVE_POLICY_CREATED',
  'LEAVE_POLICY_UPDATED',
  'LEAVE_ENCASHMENT_REQUESTED',
  'ATTENDANCE_MARKED',
  'ATTENDANCE_UPDATED',
  'ATTENDANCE_REGULARIZED',
  'BULK_ATTENDANCE_IMPORTED',
  'USER_LOGIN',
  'USER_LOGOUT',
  'USER_LOGIN_FAILED',
  'PASSWORD_CHANGED',
  'PASSWORD_RESET_REQUESTED',
  'ROLE_ASSIGNED',
  'ROLE_REMOVED',
  'PERMISSION_GRANTED',
  'PERMISSION_REVOKED',
  'DATA_EXPORTED',
  'REPORT_GENERATED',
  'REPORT_DOWNLOADED',
  'SETTINGS_UPDATED',
  'INTEGRATION_CONFIGURED',
  'API_KEY_CREATED',
  'API_KEY_REVOKED',
  'MFA_ENABLED',
  'MFA_VERIFIED',
  'MFA_DISABLED',
  'MFA_SETUP_INITIATED',
  'MFA_VALIDATION_FAILED',
  'COMMENT_ATTENDANCE_REGULARIZATION',
  'COMMENT_COMP_OFF_REQUEST',
  'COMMENT_CONFIRMATION_REQUEST',
  'COMMENT_EMPLOYMENT_HISTORY',
  'COMMENT_EXIT_REQUEST',
  'COMMENT_EXPENSE_CLAIM',
  'COMMENT_INTER_COMPANY_TRANSFER',
  'COMMENT_LEAVE_REQUEST',
  'COMMENT_OVERTIME_REQUEST',
  'COMMENT_SHIFT_SWAP_REQUEST',
  'APPROVE_ATTENDANCE_REGULARIZATION',
  'APPROVE_COMP_OFF_REQUEST',
  'APPROVE_CONFIRMATION_REQUEST',
  'APPROVE_EMPLOYMENT_HISTORY_CHANGE',
  'APPROVE_EXIT_REQUEST',
  'APPROVE_EXPENSE_CLAIM',
  'APPROVE_INTER_COMPANY_TRANSFER',
  'APPROVE_LEAVE_REQUEST',
  'APPROVE_OVERTIME_REQUEST',
  'APPROVE_SHIFT_SWAP_REQUEST',
  'REJECT_ATTENDANCE_REGULARIZATION',
  'REJECT_COMP_OFF_REQUEST',
  'REJECT_CONFIRMATION_REQUEST',
  'REJECT_EMPLOYMENT_HISTORY_CHANGE',
  'REJECT_EXIT_REQUEST',
  'REJECT_EXPENSE_CLAIM',
  'REJECT_INTER_COMPANY_TRANSFER',
  'REJECT_LEAVE_REQUEST',
  'REJECT_OVERTIME_REQUEST',
  'REJECT_SHIFT_SWAP_REQUEST',
  'CANCEL_INTERVIEW',
  'REQUEST_DOCUMENT',
  'COMPANY_CREATED',
  'COMPANY_UPDATED',
  'COMPANY_DELETED',
  'COMPANY_ACTIVATED',
  'COMPANY_SUSPENDED',
  'REQUEST_INFO',
];

export default function AuditTrailPage() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<AuditFilters>({});

  const fetchData = useCallback(async (pageNum: number, currentFilters: AuditFilters) => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', '25');
      if (currentFilters.action) params.set('action', currentFilters.action);
      if (currentFilters.module) params.set('module', currentFilters.module);
      if (currentFilters.fromDate) params.set('fromDate', currentFilters.fromDate);
      if (currentFilters.toDate) params.set('toDate', currentFilters.toDate);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setData(json.data || []);
        if (json.meta) {
          setPage(json.meta.page || 1);
          setTotalPages(json.meta.totalPages || 1);
          setTotal(json.meta.total || 0);
        }
      } else {
        setError(json.error || 'Failed to load audit logs');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while fetching audit logs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page, appliedFilters);
  }, [page, appliedFilters, fetchData]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setAppliedFilters({});
    setPage(1);
  };

  const handleExport = async (format: ExportFormat): Promise<Blob | void> => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(Math.min(total || 9999, 10000)));
    if (appliedFilters.action) params.set('action', appliedFilters.action);
    if (appliedFilters.module) params.set('module', appliedFilters.module);
    if (appliedFilters.fromDate) params.set('fromDate', appliedFilters.fromDate);
    if (appliedFilters.toDate) params.set('toDate', appliedFilters.toDate);

    const res = await fetch(`/api/audit-logs?${params.toString()}`);
    const json = await res.json();
    const allData: AuditLog[] = json.success ? json.data || [] : data;

    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Severity',
      'Module',
      'Status',
      'Details',
      'IP Address',
    ];
    const rows = allData.map((row) => [
      new Date(row.timestamp).toISOString(),
      row.user?.email || row.userEmail || 'System',
      row.action,
      row.severity,
      row.module,
      row.success ? 'Success' : 'Failed',
      row.details || (row.resourceType ? `${row.resourceType}/${row.resourceId || ''}` : ''),
      row.ipAddress || '',
    ]);

    if (format === 'csv') {
      const csv = [
        headers.join(','),
        ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    }

    if (format === 'xlsx') {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      ws['!cols'] = headers.map((h) => ({
        wch: Math.max(h.length, ...rows.map((r) => String(r[headers.indexOf(h)] || '').length)) + 2,
      }));

      XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail');
      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }

    if (format === 'pdf') {
      const rowsHtml = rows
        .map(
          (r) =>
            `<tr>${r.map((c) => `<td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151">${String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`).join('')}</tr>`
        )
        .join('');

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Audit Trail Export</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #111827; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  p.sub { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1e3a5f; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; font-weight: 600; }
  tr:nth-child(even) { background: #f9fafb; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <h1>Audit Trail</h1>
  <p class="sub">Generated ${new Date().toLocaleString()} &middot; ${allData.length} entries</p>
  <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table>
</body></html>`);
        printWindow.document.close();
        printWindow.print();
      }
      return;
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      width: '170px',
      render: (row) => (
        <span className="text-xs text-silver-mist">{new Date(row.timestamp).toLocaleString()}</span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <span className="font-medium text-sm">
          {row.user?.email || row.userEmail || 'System'}
          {row.user?.firstName && (
            <span className="text-silver-mist ml-1">
              ({[row.user.firstName, row.user.lastName].filter(Boolean).join(' ')})
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      width: '180px',
      render: (row) => <span className="text-xs font-mono">{row.action}</span>,
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '100px',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
            SEVERITY_STYLES[row.severity] || SEVERITY_STYLES.LOW
          }`}
        >
          {row.severity}
        </span>
      ),
    },
    {
      key: 'module',
      header: 'Module',
      width: '140px',
      render: (row) => <span className="text-xs text-silver-mist">{row.module}</span>,
    },
    {
      key: 'success',
      header: 'Status',
      width: '80px',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs ${
            row.success
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {row.success ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
          {row.success ? 'OK' : 'Fail'}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (row) => (
        <span className="text-xs text-silver-mist truncate max-w-[250px] block">
          {row.details || (row.resourceType ? `${row.resourceType}/${row.resourceId || ''}` : '-')}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP',
      width: '120px',
      render: (row) => (
        <span className="text-xs text-silver-mist font-mono">{row.ipAddress || '-'}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200/80 animate-pulse rounded" />
        <div className="space-y-3">
          <Skeleton variant="table-row" rows={10} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load audit logs"
          message={error}
          onRetry={() => {
            setIsLoading(true);
            fetchData(page, appliedFilters);
          }}
        />
      </div>
    );
  }

  return (
    <DataPage<AuditLog>
      title="Audit Trail"
      breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Audit Trail' }]}
      data={data}
      columns={columns}
      onSave={undefined}
      onDelete={undefined}
      enableCreate={false}
      renderForm={() => <></>}
      searchKeys={['userEmail', 'action', 'module', 'details', 'ipAddress']}
      searchPlaceholder="Search by user, action, module, or IP..."
      pageSize={25}
      toolbarSlot={
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filters.action || ''}
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value || undefined }))}
            className="px-2 py-1 text-xs border border-cloud dark:border-nebula-purple/50 rounded-lg bg-pearl dark:bg-stellar-blue"
          >
            <option value="">All Actions</option>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={filters.module || ''}
            onChange={(e) => setFilters((f) => ({ ...f, module: e.target.value || undefined }))}
            placeholder="Module..."
            className="px-2 py-1 text-xs border border-cloud dark:border-nebula-purple/50 rounded-lg bg-pearl dark:bg-stellar-blue w-28"
          />

          <input
            type="date"
            value={filters.fromDate || ''}
            onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value || undefined }))}
            className="px-2 py-1 text-xs border border-cloud dark:border-nebula-purple/50 rounded-lg bg-pearl dark:bg-stellar-blue"
            title="From date"
          />

          <input
            type="date"
            value={filters.toDate || ''}
            onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value || undefined }))}
            className="px-2 py-1 text-xs border border-cloud dark:border-nebula-purple/50 rounded-lg bg-pearl dark:bg-stellar-blue"
            title="To date"
          />

          <button
            type="button"
            onClick={handleApplyFilters}
            className="px-3 py-1 text-xs font-medium bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors"
          >
            Filter
          </button>

          {(appliedFilters.action ||
            appliedFilters.module ||
            appliedFilters.fromDate ||
            appliedFilters.toDate) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1 text-xs font-medium text-silver-mist hover:text-foreground rounded-lg hover:bg-cloud/50 transition-colors"
            >
              Clear
            </button>
          )}

          <span className="text-xs text-silver-mist ml-auto">
            {total.toLocaleString()} total entries
          </span>

          <ExportMenu
            onExport={handleExport}
            filename="audit-trail-export"
            formats={['csv', 'xlsx', 'pdf']}
            rowCount={total}
          />

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 text-xs border border-cloud dark:border-nebula-purple/50 rounded-lg disabled:opacity-40 hover:bg-cloud/50 transition-colors"
              >
                Prev
              </button>
              <span className="text-xs text-silver-mist px-1">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 text-xs border border-cloud dark:border-nebula-purple/50 rounded-lg disabled:opacity-40 hover:bg-cloud/50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      }
    />
  );
}
