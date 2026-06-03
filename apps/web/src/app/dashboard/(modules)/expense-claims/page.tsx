/**
 * @module ExpenseClaimsPage
 * @description Expense claim center — list, submit, approve, reject, pay.
 * Talks to /api/v1/expenses + /api/v1/expenses/[id]/{submit,approve,reject,pay}.
 * @project AURA HCM Platform
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Receipt, Shield } from 'lucide-react';

type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELED';

interface ExpenseClaim {
  id: string;
  employeeId: string;
  title: string;
  totalAmount: number | string;
  currency: string;
  status: ExpenseStatus;
  submittedAt?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  paidReference?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

const statusColor: Record<ExpenseStatus, string> = {
  DRAFT: 'bg-silver-mist/15 text-silver-mist',
  SUBMITTED: 'bg-amber-500/15 text-amber-500',
  APPROVED: 'bg-blue-500/15 text-blue-500',
  REJECTED: 'bg-red-500/15 text-red-500',
  PAID: 'bg-emerald-500/15 text-emerald-500',
  CANCELED: 'bg-silver-mist/10 text-silver-mist',
};

async function listClaims(status?: string): Promise<ExpenseClaim[]> {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  const res = await fetch(`/api/v1/expenses?${qs.toString()}`, { credentials: 'include' });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Failed to load');
  return json.items as ExpenseClaim[];
}

async function action(id: string, name: 'submit' | 'approve' | 'reject' | 'pay', body?: object) {
  const res = await fetch(`/api/v1/expenses/${id}/${name}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? `${name} failed`);
}

export default function ExpenseClaimsPage() {
  const [items, setItems] = useState<ExpenseClaim[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('SUBMITTED');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listClaims(statusFilter));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handle = async (item: ExpenseClaim, name: 'submit' | 'approve' | 'reject' | 'pay') => {
    try {
      setError(null);
      if (name === 'reject') {
        const reason = window.prompt('Rejection reason:');
        if (!reason) return;
        await action(item.id, 'reject', { reason });
      } else if (name === 'pay') {
        const ref = window.prompt('Payment reference (rejected if < 3 chars — no placeholders):');
        if (!ref) return;
        await action(item.id, 'pay', { paidReference: ref });
      } else {
        await action(item.id, name);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Receipt className="w-5 h-5 text-celestial-indigo" />
          Expense Claims
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          DRAFT → SUBMITTED → APPROVED → PAID. Policy lanes (auto / manager / finance) and
          missing-receipt failures are gated server-side.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-500">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1 text-sm"
        >
          {['SUBMITTED', 'APPROVED', 'PAID', 'REJECTED', 'DRAFT', 'CANCELED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-sm text-silver-mist py-8">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center text-sm text-silver-mist py-8">No claims match the filter.</div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-silver-mist/20">
          <table className="w-full text-sm">
            <thead className="bg-silver-mist/5 text-left">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Submitted</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-silver-mist/10">
                  <td className="px-3 py-2 font-mono text-xs">{item.employeeId.slice(0, 8)}</td>
                  <td className="px-3 py-2">{item.title}</td>
                  <td className="px-3 py-2 text-right">
                    {item.currency} {Number(item.totalAmount).toLocaleString()}
                  </td>
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
                    {item.status === 'DRAFT' && (
                      <button
                        onClick={() => void handle(item, 'submit')}
                        className="rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-500 hover:bg-amber-500/20"
                      >
                        Submit
                      </button>
                    )}
                    {item.status === 'SUBMITTED' && (
                      <>
                        <button
                          onClick={() => void handle(item, 'approve')}
                          className="rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-500 hover:bg-blue-500/20"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void handle(item, 'reject')}
                          className="rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-500 hover:bg-red-500/20"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {item.status === 'APPROVED' && (
                      <button
                        onClick={() => void handle(item, 'pay')}
                        className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500 hover:bg-emerald-500/20"
                      >
                        Mark paid
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
          Payment references shorter than 3 chars are rejected at the API — placeholder values
          cannot be persisted to PAID. State-machine violations return HTTP 409.
          Missing-receipt-above-threshold failures return HTTP 422.
        </p>
      </div>
    </div>
  );
}
