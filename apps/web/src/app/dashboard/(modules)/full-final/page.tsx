/**
 * @module FullFinalPage
 * @description F&F settlement calculator + record list. Hits the v1 F&F APIs.
 * @project AURA HCM Platform
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Calculator, FileCheck, Shield } from 'lucide-react';

type FFStatus = 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PROCESSED' | 'CANCELED';

interface FFRecord {
  id: string;
  employeeId: string;
  countryCode: string;
  status: FFStatus;
  lastWorkingDay: string;
  serviceMonths: number;
  basicSalary: string | number;
  grossPayable: string | number;
  totalDeductions: string | number;
  netPayable: string | number;
  currency: string;
  createdAt: string;
}

interface PreviewLine {
  code: string;
  label: string;
  kind: 'earning' | 'deduction' | 'tax';
  amount: number;
}

interface Preview {
  grossPayable: number;
  totalDeductions: number;
  netPayable: number;
  currency: string;
  serviceMonths: number;
  breakdown: PreviewLine[];
}

const statusColor: Record<FFStatus, string> = {
  DRAFT: 'bg-silver-mist/15 text-silver-mist',
  CALCULATED: 'bg-amber-500/15 text-amber-500',
  APPROVED: 'bg-blue-500/15 text-blue-500',
  PROCESSED: 'bg-emerald-500/15 text-emerald-500',
  CANCELED: 'bg-red-500/15 text-red-500',
};

async function listRecords(status?: string): Promise<FFRecord[]> {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  const res = await fetch(`/api/v1/payroll/full-final?${qs.toString()}`, {
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Failed to load');
  return json.items as FFRecord[];
}

async function calculate(
  employeeId: string,
  body: Record<string, unknown>,
  persist: boolean
): Promise<Preview | FFRecord | null> {
  const res = await fetch(`/api/v1/payroll/full-final/calculate/${employeeId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, persist }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Calculation failed');
  return persist ? (json.data?.record as FFRecord) : (json.data?.calculation as Preview);
}

async function approve(id: string) {
  const res = await fetch(`/api/v1/payroll/full-final/${id}/approve`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Approve failed');
}

async function process_(id: string, payrollRunId?: string) {
  const res = await fetch(`/api/v1/payroll/full-final/${id}/process`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payrollRunId ? { payrollRunId } : {}),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json?.error?.message ?? 'Process failed');
}

export default function FullFinalPage() {
  const [items, setItems] = useState<FFRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('CALCULATED');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [calcForm, setCalcForm] = useState({
    employeeId: '',
    countryCode: 'AE',
    joiningDate: '',
    lastWorkingDay: '',
    basicSalary: 0,
    grossSalary: 0,
    earnedLeaveBalanceDays: 0,
    outstandingLoanAmount: 0,
    unservedNoticeDays: 0,
    currency: 'AED',
  });
  const [preview, setPreview] = useState<Preview | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listRecords(statusFilter));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePreview = async () => {
    try {
      setError(null);
      const result = await calculate(calcForm.employeeId, calcForm, false);
      setPreview(result as Preview);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview failed');
    }
  };

  const handleRecord = async () => {
    try {
      setError(null);
      await calculate(calcForm.employeeId, calcForm, true);
      setPreview(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Record failed');
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'process') => {
    try {
      setError(null);
      if (action === 'approve') await approve(id);
      else await process_(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Calculator className="w-5 h-5 text-celestial-indigo" />
          Full &amp; Final Settlement
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Calculate, approve, and process F&amp;F settlements per UAE / KSA / India jurisdictional
          rules.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-500">{error}</div>
      )}

      <div className="rounded-md border border-silver-mist/20 p-4 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Calculator className="w-4 h-4 text-celestial-indigo" /> Calculate F&amp;F
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <label className="flex flex-col">
            Employee ID
            <input
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
              value={calcForm.employeeId}
              onChange={(e) => setCalcForm({ ...calcForm, employeeId: e.target.value })}
            />
          </label>
          <label className="flex flex-col">
            Country
            <select
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
              value={calcForm.countryCode}
              onChange={(e) => setCalcForm({ ...calcForm, countryCode: e.target.value })}
            >
              <option value="AE">UAE</option>
              <option value="SA">KSA</option>
              <option value="IN">India</option>
            </select>
          </label>
          <label className="flex flex-col">
            Joining date
            <input
              type="date"
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
              value={calcForm.joiningDate}
              onChange={(e) => setCalcForm({ ...calcForm, joiningDate: e.target.value })}
            />
          </label>
          <label className="flex flex-col">
            Last working day
            <input
              type="date"
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
              value={calcForm.lastWorkingDay}
              onChange={(e) => setCalcForm({ ...calcForm, lastWorkingDay: e.target.value })}
            />
          </label>
          <label className="flex flex-col">
            Basic salary
            <input
              type="number"
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
              value={calcForm.basicSalary}
              onChange={(e) => setCalcForm({ ...calcForm, basicSalary: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col">
            Gross salary
            <input
              type="number"
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
              value={calcForm.grossSalary}
              onChange={(e) => setCalcForm({ ...calcForm, grossSalary: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col">
            Leave balance (days)
            <input
              type="number"
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
              value={calcForm.earnedLeaveBalanceDays}
              onChange={(e) =>
                setCalcForm({ ...calcForm, earnedLeaveBalanceDays: Number(e.target.value) })
              }
            />
          </label>
          <label className="flex flex-col">
            Outstanding loan
            <input
              type="number"
              className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1"
              value={calcForm.outstandingLoanAmount}
              onChange={(e) =>
                setCalcForm({ ...calcForm, outstandingLoanAmount: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void handlePreview()}
            className="rounded-md bg-celestial-indigo/10 px-3 py-1 text-sm text-celestial-indigo hover:bg-celestial-indigo/20"
          >
            Preview
          </button>
          <button
            onClick={() => void handleRecord()}
            className="rounded-md bg-emerald-500/10 px-3 py-1 text-sm text-emerald-500 hover:bg-emerald-500/20"
          >
            Record CALCULATED
          </button>
        </div>

        {preview && (
          <div className="mt-3 rounded-md bg-silver-mist/5 p-3 text-xs">
            <div className="flex justify-between mb-2 text-sm font-semibold">
              <span>Net payable</span>
              <span>
                {preview.currency} {preview.netPayable.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-silver-mist">
              <div>Gross: {preview.grossPayable.toLocaleString()}</div>
              <div>Deductions: {preview.totalDeductions.toLocaleString()}</div>
              <div>Service months: {preview.serviceMonths}</div>
            </div>
            <table className="w-full mt-2">
              <tbody>
                {preview.breakdown.map((line) => (
                  <tr key={line.code} className="border-t border-silver-mist/10">
                    <td className="py-1">{line.label}</td>
                    <td
                      className={`py-1 text-right ${line.kind === 'deduction' || line.kind === 'tax' ? 'text-red-500' : 'text-emerald-500'}`}
                    >
                      {line.kind === 'deduction' || line.kind === 'tax' ? '-' : '+'}
                      {line.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-md border border-silver-mist/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-celestial-indigo" /> Settlement records
          </h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-silver-mist/30 bg-transparent px-2 py-1 text-sm"
          >
            <option value="">All</option>
            <option value="CALCULATED">CALCULATED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PROCESSED">PROCESSED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center text-sm text-silver-mist py-6">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center text-sm text-silver-mist py-6">
            No records match the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-silver-mist/5 text-left">
                <tr>
                  <th className="px-2 py-2">Employee</th>
                  <th className="px-2 py-2">Country</th>
                  <th className="px-2 py-2">LWD</th>
                  <th className="px-2 py-2 text-right">Net</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-silver-mist/10">
                    <td className="px-2 py-2 font-mono text-xs">{item.employeeId.slice(0, 8)}</td>
                    <td className="px-2 py-2">{item.countryCode}</td>
                    <td className="px-2 py-2 text-silver-mist text-xs">
                      {new Date(item.lastWorkingDay).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {item.currency} {Number(item.netPayable).toLocaleString()}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${statusColor[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right space-x-2">
                      {item.status === 'CALCULATED' && (
                        <button
                          onClick={() => void handleAction(item.id, 'approve')}
                          className="rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-500 hover:bg-blue-500/20"
                        >
                          Approve
                        </button>
                      )}
                      {item.status === 'APPROVED' && (
                        <button
                          onClick={() => void handleAction(item.id, 'process')}
                          className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500 hover:bg-emerald-500/20"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          All approval and processing actions are audit-logged. Calculations honour UAE EOSB
          (Federal Law 33/2021), KSA Labour Law Article 84, and India Gratuity Act 1972.
        </p>
      </div>
    </div>
  );
}
