'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2, Plus, X } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

/** A record returned by any vendor sub-domain endpoint. */
export type VendorSubRecord = Record<string, unknown> & { id: string };

type VendorOption = { id: string; name: string; vendorCode?: string };

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

export type CreateField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export type RowAction = {
  label: string;
  /** Body merged into the PATCH request. */
  patch: Record<string, unknown>;
  /** Only show when this predicate passes. */
  show?: (row: VendorSubRecord) => boolean;
  variant?: 'primary' | 'danger' | 'default';
};

export type ColumnDef = {
  header: string;
  render: (row: VendorSubRecord) => React.ReactNode;
};

type VendorSubdomainViewProps = {
  title: string;
  description: string;
  Icon: LucideIcon;
  /** REST collection endpoint, e.g. '/v1/recruitment/vendors/invoices'. */
  endpoint: string;
  /** Whether records are attached to a specific vendor (adds a vendor selector). */
  requiresVendor: boolean;
  createLabel: string;
  createFields: CreateField[];
  columns: ColumnDef[];
  rowActions?: RowAction[];
  emptyMessage: string;
};

type ApiEnvelope = {
  success?: boolean;
  data?: { items?: VendorSubRecord[] } | VendorSubRecord[] | VendorSubRecord;
  error?: { message?: string; messageAr?: string };
  message?: string;
};

function extractItems(response: ApiEnvelope): VendorSubRecord[] {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { items?: VendorSubRecord[] }).items)
  ) {
    return (data as { items: VendorSubRecord[] }).items;
  }
  return [];
}

export function VendorSubdomainView({
  title,
  description,
  Icon,
  endpoint,
  requiresVendor,
  createLabel,
  createFields,
  columns,
  rowActions = [],
  emptyMessage,
}: VendorSubdomainViewProps) {
  const [rows, setRows] = useState<VendorSubRecord[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const loadVendors = useCallback(async () => {
    try {
      const response = await APIClient.get<ApiEnvelope>('/v1/recruitment/vendors');
      const items = extractItems(response) as unknown as VendorOption[];
      setVendors(
        items.map((v) => ({ id: v.id, name: (v as any).name, vendorCode: (v as any).vendorCode }))
      );
    } catch {
      setVendors([]);
    }
  }, []);

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await APIClient.get<ApiEnvelope>(endpoint);
      setRows(extractItems(response));
    } catch (err) {
      console.error(`Failed to load ${title}:`, err);
      setError('Unable to load records. Please try again.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, title]);

  useEffect(() => {
    void loadRows();
    if (requiresVendor) void loadVendors();
  }, [loadRows, loadVendors, requiresVendor]);

  const resetForm = useCallback(() => {
    const initial: Record<string, string> = {};
    createFields.forEach((f) => {
      initial[f.name] = f.type === 'select' && f.options?.length ? f.options[0].value : '';
    });
    setForm(initial);
  }, [createFields]);

  const openModal = useCallback(() => {
    resetForm();
    setNotice(null);
    setError(null);
    setShowModal(true);
  }, [resetForm]);

  const handleCreate = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setSubmitting(true);
      setError(null);
      try {
        const payload: Record<string, unknown> = {};
        if (requiresVendor) payload.vendorId = form.vendorId;
        createFields.forEach((f) => {
          const value = form[f.name];
          if (value === undefined || value === '') return;
          payload[f.name] = f.type === 'number' ? Number(value) : value;
        });
        const response = await APIClient.post<ApiEnvelope>(endpoint, payload);
        if (response?.success === false) {
          throw new Error(response?.error?.message || 'Request failed');
        }
        setShowModal(false);
        setNotice(response?.message || 'Saved successfully');
        await loadRows();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save record');
      } finally {
        setSubmitting(false);
      }
    },
    [createFields, endpoint, form, loadRows, requiresVendor]
  );

  const runRowAction = useCallback(
    async (row: VendorSubRecord, action: RowAction) => {
      setPendingAction(`${row.id}:${action.label}`);
      setError(null);
      try {
        const response = await APIClient.patch<ApiEnvelope>(`${endpoint}/${row.id}`, action.patch);
        if (response?.success === false) {
          throw new Error(response?.error?.message || 'Request failed');
        }
        setNotice(response?.message || 'Updated successfully');
        await loadRows();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update record');
      } finally {
        setPendingAction(null);
      }
    },
    [endpoint, loadRows]
  );

  const canSubmit = useMemo(() => {
    if (requiresVendor && !form.vendorId) return false;
    return createFields.every((f) => !f.required || (form[f.name] && form[f.name] !== ''));
  }, [createFields, form, requiresVendor]);

  const showAdd = !requiresVendor || vendors.length > 0;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon className="w-6 h-6 text-indigo-500" />
            {title}
          </h1>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>
        <button
          type="button"
          onClick={openModal}
          disabled={!showAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          {createLabel}
        </button>
      </div>

      {requiresVendor && vendors.length === 0 && !loading ? (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 shrink-0">
          No recruitment vendors exist yet. Create a vendor in the registry before adding records
          here.
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 shrink-0">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 shrink-0">
          {error}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[240px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-500">Loading {title.toLowerCase()}...</p>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[240px] p-8 text-center">
            <div>
              <Icon className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 max-w-md mx-auto">{emptyMessage}</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {columns.map((col) => (
                  <th key={col.header} className="px-4 py-3 font-bold">
                    {col.header}
                  </th>
                ))}
                {rowActions.length > 0 ? (
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                >
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-3 align-top">
                      {col.render(row)}
                    </td>
                  ))}
                  {rowActions.length > 0 ? (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {rowActions
                          .filter((action) => !action.show || action.show(row))
                          .map((action) => {
                            const key = `${row.id}:${action.label}`;
                            const busy = pendingAction === key;
                            const style =
                              action.variant === 'danger'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300'
                                : action.variant === 'primary'
                                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300';
                            return (
                              <button
                                key={action.label}
                                type="button"
                                disabled={busy}
                                onClick={() => void runRowAction(row, action)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-60 ${style}`}
                              >
                                {busy ? '...' : action.label}
                              </button>
                            );
                          })}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold">{createLabel}</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {requiresVendor ? (
                <div>
                  <label className="block text-sm font-bold mb-1" htmlFor="vendorId">
                    Vendor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="vendorId"
                    required
                    value={form.vendorId || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, vendorId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                        {v.vendorCode ? ` (${v.vendorCode})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {createFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-bold mb-1" htmlFor={field.name}>
                    {field.label}
                    {field.required ? <span className="text-rose-500"> *</span> : null}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      id={field.name}
                      required={field.required}
                      value={form[field.name] || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      required={field.required}
                      rows={3}
                      placeholder={field.placeholder}
                      value={form[field.name] || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    />
                  ) : (
                    <input
                      id={field.name}
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={form[field.name] || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}

              {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Small helpers shared by the sub-domain pages. */
export function formatDate(value: unknown): string {
  if (!value) return '—';
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export function statusBadge(status: unknown): React.ReactNode {
  const s = String(status ?? '').toLowerCase();
  const map: Record<string, string> = {
    valid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    renewed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    expiring: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
    expired: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300',
  };
  const style = map[s] || 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';
  return <span className={`px-2 py-1 rounded-full text-xs font-bold ${style}`}>{label}</span>;
}
