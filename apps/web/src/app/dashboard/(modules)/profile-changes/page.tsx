/**
 * @module ProfileChangesPage
 * @description Employee profile change request center — submit, review, approve/reject bank/address/dependents/personal changes.
 * @project AURA HCM Platform
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { UserCog, Filter, Shield } from 'lucide-react';

type ProfileChangeStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'APPLIED' | 'CANCELED';

interface ProfileChangeRequest {
  id: string;
  employeeId: string;
  category: string;
  fieldPath?: string | null;
  beforeValues: Record<string, unknown>;
  afterValues: Record<string, unknown>;
  justification?: string | null;
  status: ProfileChangeStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  effectiveDate?: string | null;
  createdAt: string;
}

const STATUS_FILTERS: ProfileChangeStatus[] = ['SUBMITTED', 'APPROVED', 'REJECTED', 'DRAFT'];
const CATEGORIES = ['bank', 'address', 'emergency_contact', 'dependent', 'personal', 'tax'];

const statusColor: Record<ProfileChangeStatus, string> = {
  DRAFT: 'bg-silver-mist/15 text-silver-mist',
  SUBMITTED: 'bg-amber-500/15 text-amber-500',
  APPROVED: 'bg-emerald-500/15 text-emerald-500',
  REJECTED: 'bg-red-500/15 text-red-500',
  APPLIED: 'bg-celestial-indigo/15 text-celestial-indigo',
  CANCELED: 'bg-silver-mist/10 text-silver-mist',
};

async function fetchRequests(params: { status?: string; category?: string }) {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.category) qs.set('category', params.category);
  const res = await fetch(`/api/v1/profile-changes?${qs.toString()}`, { credentials: 'include' });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Failed to load');
  return json.items as ProfileChangeRequest[];
}

async function postAction(
  id: string,
  action: 'submit' | 'approve' | 'reject' | 'cancel',
  body?: object
) {
  const res = await fetch(`/api/v1/profile-changes/${id}/${action}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? `${action} failed`);
  return json.data as ProfileChangeRequest;
}

export default function ProfileChangesPage() {
  const [items, setItems] = useState<ProfileChangeRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('SUBMITTED');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRequests({
        status: statusFilter,
        category: categoryFilter || undefined,
      });
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'cancel') => {
    try {
      await postAction(id, action);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <UserCog className="w-5 h-5 text-celestial-indigo" />
          Profile Change Requests
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Employee-initiated changes to bank details, address, emergency contacts, dependents,
          personal info, and tax declarations.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-silver-mist" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1 text-sm"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={() => void load()}
          className="rounded-md bg-celestial-indigo/10 px-3 py-1 text-sm text-celestial-indigo hover:bg-celestial-indigo/20"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-500">{error}</div>
      )}

      {loading ? (
        <div className="rounded-md border border-silver-mist/20 px-4 py-8 text-center text-sm text-silver-mist">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-silver-mist/20 px-4 py-8 text-center text-sm text-silver-mist">
          No profile change requests match the current filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-silver-mist/20">
          <table className="w-full text-sm">
            <thead className="bg-silver-mist/5 text-left">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Submitted</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-silver-mist/10">
                  <td className="px-3 py-2 font-mono text-xs">{item.employeeId.slice(0, 8)}</td>
                  <td className="px-3 py-2">{item.category}</td>
                  <td className="px-3 py-2 text-silver-mist">{item.fieldPath ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${statusColor[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-silver-mist text-xs">
                    {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-3 py-2 text-right space-x-2">
                    {item.status === 'SUBMITTED' && (
                      <>
                        <button
                          onClick={() => void handleAction(item.id, 'approve')}
                          className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500 hover:bg-emerald-500/20"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void handleAction(item.id, 'reject')}
                          className="rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-500 hover:bg-red-500/20"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {(item.status === 'DRAFT' || item.status === 'SUBMITTED') && (
                      <button
                        onClick={() => void handleAction(item.id, 'cancel')}
                        className="rounded-md bg-silver-mist/10 px-2 py-1 text-xs text-silver-mist hover:bg-silver-mist/20"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          All approval actions are audit-logged. Cancel is permitted by requester at any
          non-terminal state.
        </p>
      </div>
    </div>
  );
}
