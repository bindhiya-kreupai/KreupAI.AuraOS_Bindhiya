'use client';

/**
 * @component COBRAManager
 * @description COBRA continuation coverage management — eligible employees list,
 *   election form, coverage timeline, payment history, status machine.
 * @project AURA HCM Platform
 * @section 18.2 — COBRA Continuation Coverage
 * @legal ERISA Section 606 — qualifying event notifications within 44 days;
 *   IRS COBRA guidelines — 60-day election window from later of loss of coverage
 *   or notice date; 18 months for termination/reduced hours; 36 months for other events;
 *   2% administrative fee on top of group rate (102% total).
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  XCircle,
  AlertTriangle,
  FileText,
  BadgeCheck,
  Info,
  Hourglass,
  Banknote,
  RefreshCw,
  Eye,
} from 'lucide-react';
import type { COBRARecord, COBRAStatus } from '@/services/benefitsClaimsService';
import { BenefitsClaimsService } from '@/services/benefitsClaimsService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function coverageMonthsUsed(startDate: string | null, maxMonths: number): number {
  if (!startDate) return 0;
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.min(Math.max(0, months), maxMonths);
}

// ── Status Badge ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<COBRAStatus, string> = {
  Eligible: 'bg-blue-100 text-blue-800 border-blue-200',
  'Notice Sent': 'bg-amber-100 text-amber-800 border-amber-200',
  Elected: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Expired: 'bg-gray-100 text-gray-600 border-gray-200',
  Declined: 'bg-red-100 text-red-800 border-red-200',
};

function StatusBadge({ status }: { status: COBRAStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// ── Payment Status Badge ────────────────────────────────────────────────────────

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  Paid: 'bg-emerald-100 text-emerald-800',
  Pending: 'bg-amber-100 text-amber-800',
  Overdue: 'bg-red-100 text-red-800',
  'Grace Period': 'bg-orange-100 text-orange-800',
};

function PaymentBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PAYMENT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </span>
  );
}

// ── Election Form ──────────────────────────────────────────────────────────────

interface ElectionFormProps {
  record: COBRARecord;
  onElect: (planIds: string[]) => Promise<void>;
  onCancel: () => void;
}

function ElectionForm({ record, onElect, onCancel }: ElectionFormProps) {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [saving, setSaving] = useState(false);

  const totalMonthly = record.availablePlans
    .filter((p) => selectedPlans.includes(p.planId))
    .reduce((s, p) => s + p.cobraPremium, 0);

  function togglePlan(planId: string) {
    setSelectedPlans((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  }

  async function handleSubmit() {
    if (selectedPlans.length === 0) return;
    setSaving(true);
    try {
      await onElect(selectedPlans);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-700 text-white px-6 py-4">
          <h2 className="text-lg font-bold">COBRA Coverage Election</h2>
          <p className="text-indigo-200 text-sm mt-0.5">
            {record.employeeName} — Election deadline: {fmtDate(record.electionDeadline)}
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Legal Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-sm">
            <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-amber-800">
              <span className="font-semibold">ERISA Section 606 Notice:</span> You have 60 days from
              the later of your loss of coverage or notice date to elect COBRA. Coverage is
              retroactive to the day after loss of coverage. COBRA premiums are 102% of the group
              rate (original premium + 2% admin fee).
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Plans to Continue</h3>
            <div className="space-y-2">
              {record.availablePlans.map((plan) => {
                const selected = selectedPlans.includes(plan.planId);
                return (
                  <label
                    key={plan.planId}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => togglePlan(plan.planId)}
                        className="h-4 w-4 text-indigo-600 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{plan.planName}</div>
                        <div className="text-xs text-gray-500">
                          {plan.carrier} · {plan.coverageLevel} · {plan.planType}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold text-gray-900">
                        {fmtCurrency(plan.cobraPremium)}
                        <span className="text-gray-500 font-normal">/mo</span>
                      </div>
                      <div className="text-xs text-gray-400 line-through">
                        {fmtCurrency(plan.originalPremium)} original
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Bank Transfer</option>
              <option>Credit Card</option>
              <option>Check</option>
              <option>ACH Direct Debit</option>
            </select>
          </div>

          {/* Coverage Duration Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <div className="font-semibold mb-1">Coverage Duration</div>
            <p>
              Based on your qualifying event (<strong>{record.qualifyingEvent}</strong>), you are
              eligible for up to <strong>{record.maxDurationMonths} months</strong> of continuation
              coverage.
              {record.coverageStartDate
                ? ` Coverage runs from ${fmtDate(record.coverageStartDate)} to ${fmtDate(record.coverageEndDate)}.`
                : ` Coverage would start retroactively from ${fmtDate(record.qualifyingEventDate)}.`}
            </p>
          </div>

          {/* Total Cost */}
          {selectedPlans.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-indigo-800">
                  Total Monthly COBRA Cost
                </span>
                <span className="text-xl font-bold text-indigo-700">
                  {fmtCurrency(totalMonthly)}
                </span>
              </div>
              <p className="text-xs text-indigo-600 mt-1">
                Due within 45 days of election for the retroactive period, then monthly thereafter.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedPlans.length === 0 || saving}
            className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Electing...' : 'Confirm COBRA Election'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── COBRA Record Card ──────────────────────────────────────────────────────────

interface COBRARecordCardProps {
  record: COBRARecord;
  onElect: (record: COBRARecord) => void;
  onView: (record: COBRARecord) => void;
}

function COBRARecordCard({ record, onElect, onView }: COBRARecordCardProps) {
  const daysLeft = daysUntil(record.electionDeadline);
  const isElectable = record.status === 'Eligible' || record.status === 'Notice Sent';
  const monthsUsed = coverageMonthsUsed(record.coverageStartDate, record.maxDurationMonths);
  const progressPct = record.coverageStartDate
    ? Math.round((monthsUsed / record.maxDurationMonths) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top colored bar */}
      <div
        className={`h-1.5 ${record.status === 'Active' ? 'bg-emerald-400' : record.status === 'Eligible' || record.status === 'Notice Sent' ? 'bg-amber-400' : record.status === 'Expired' ? 'bg-gray-300' : 'bg-indigo-400'}`}
      />

      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
              {record.employeeName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{record.employeeName}</div>
              <div className="text-xs text-gray-500">
                {record.department} · {record.employeeId}
              </div>
            </div>
          </div>
          <StatusBadge status={record.status} />
        </div>

        {/* Qualifying Event */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
          <div>
            <div className="text-gray-500 mb-0.5">Qualifying Event</div>
            <div className="font-medium text-gray-800">{record.qualifyingEvent}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-0.5">Event Date</div>
            <div className="font-medium text-gray-800">{fmtDate(record.qualifyingEventDate)}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-0.5">Election Deadline</div>
            <div
              className={`font-semibold ${daysLeft <= 14 && daysLeft > 0 ? 'text-red-600' : 'text-gray-800'}`}
            >
              {fmtDate(record.electionDeadline)}
              {isElectable && daysLeft > 0 && (
                <span
                  className={`ml-1.5 font-normal ${daysLeft <= 14 ? 'text-red-500' : 'text-gray-500'}`}
                >
                  ({daysLeft}d left)
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-0.5">Max Duration</div>
            <div className="font-medium text-gray-800">{record.maxDurationMonths} months</div>
          </div>
        </div>

        {/* Coverage Progress (if Active) */}
        {record.status === 'Active' && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                Coverage used: {monthsUsed}/{record.maxDurationMonths} months
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${progressPct >= 80 ? 'bg-red-400' : progressPct >= 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">Ends {fmtDate(record.coverageEndDate)}</div>
          </div>
        )}

        {/* Plans elected / available */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1.5">
            {record.electedPlans.length > 0 ? 'Elected Plans' : 'Available Plans'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(record.electedPlans.length > 0
              ? record.availablePlans.filter((p) => record.electedPlans.includes(p.planId))
              : record.availablePlans
            ).map((plan) => (
              <span
                key={plan.planId}
                className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs"
              >
                {plan.planType} — {fmtCurrency(plan.cobraPremium)}/mo
              </span>
            ))}
          </div>
          {record.totalMonthlyCost > 0 && (
            <div className="mt-2 text-sm font-semibold text-gray-700">
              Total:{' '}
              <span className="text-indigo-700">{fmtCurrency(record.totalMonthlyCost)}/month</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(record)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            View Details
          </button>
          {isElectable && daysLeft > 0 && (
            <button
              onClick={() => onElect(record)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition-colors"
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              Elect COBRA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel ───────────────────────────────────────────────────────────────

interface DetailPanelProps {
  record: COBRARecord;
  onClose: () => void;
  onElect: (record: COBRARecord) => void;
}

function DetailPanel({ record, onClose, onElect }: DetailPanelProps) {
  const daysLeft = daysUntil(record.electionDeadline);
  const isElectable = record.status === 'Eligible' || record.status === 'Notice Sent';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-xl shadow-2xl sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold">{record.employeeName}</h2>
            <p className="text-indigo-200 text-sm">COBRA Record · {record.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Status + Deadline Alert */}
          {isElectable && daysLeft <= 30 && daysLeft > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <span className="font-semibold">Election deadline in {daysLeft} days</span> (
                {fmtDate(record.electionDeadline)}). Failure to elect by this date permanently
                waives continuation coverage rights.
              </div>
            </div>
          )}

          {/* Basic Info Grid */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Qualifying Event
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Status', value: <StatusBadge status={record.status} /> },
                { label: 'Event Type', value: record.qualifyingEvent },
                { label: 'Event Date', value: fmtDate(record.qualifyingEventDate) },
                { label: 'Notice Date', value: fmtDate(record.noticeDate) },
                { label: 'Election Deadline', value: fmtDate(record.electionDeadline) },
                { label: 'Max Duration', value: `${record.maxDurationMonths} months` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                  <div className="font-medium text-gray-800">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Coverage Info (if elected) */}
          {record.coverageStartDate && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Coverage Period
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Coverage Start</div>
                    <div className="font-medium text-gray-800">
                      {fmtDate(record.coverageStartDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Coverage End</div>
                    <div className="font-medium text-gray-800">
                      {fmtDate(record.coverageEndDate)}
                    </div>
                  </div>
                </div>
                {/* Timeline Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{fmtDate(record.coverageStartDate)}</span>
                    <span>{fmtDate(record.coverageEndDate)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{
                        width: `${Math.round((coverageMonthsUsed(record.coverageStartDate, record.maxDurationMonths) / record.maxDurationMonths) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    {coverageMonthsUsed(record.coverageStartDate, record.maxDurationMonths)} of{' '}
                    {record.maxDurationMonths} months used
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Plans */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {record.electedPlans.length > 0 ? 'Elected Plans' : 'Available Plans'}
            </h3>
            <div className="space-y-2">
              {record.availablePlans.map((plan) => {
                const elected = record.electedPlans.includes(plan.planId);
                return (
                  <div
                    key={plan.planId}
                    className={`rounded-lg border p-3 ${elected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {elected && <BadgeCheck className="h-4 w-4 text-indigo-600" />}
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{plan.planName}</div>
                          <div className="text-xs text-gray-500">
                            {plan.carrier} · {plan.planType} · {plan.coverageLevel}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-bold text-gray-900">
                          {fmtCurrency(plan.cobraPremium)}
                          <span className="text-gray-400 font-normal text-xs">/mo</span>
                        </div>
                        <div className="text-xs text-gray-400">incl. 2% admin fee</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {record.totalMonthlyCost > 0 && (
              <div className="mt-3 flex justify-between items-center text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg px-4 py-2">
                <span>Total Monthly Cost</span>
                <span className="text-indigo-700 text-base">
                  {fmtCurrency(record.totalMonthlyCost)}
                </span>
              </div>
            )}
          </div>

          {/* Payment History */}
          {record.payments.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Payment History
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                        Payment ID
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                        Amount
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                        Due Date
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                        Paid Date
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                        Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {record.payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                          {payment.id}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-gray-800">
                          {fmtCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{fmtDate(payment.dueDate)}</td>
                        <td className="px-4 py-2.5 text-gray-600">{fmtDate(payment.paidDate)}</td>
                        <td className="px-4 py-2.5">
                          <PaymentBadge status={payment.status} />
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs">
                          {payment.paymentMethod}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Election Legal Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <div className="font-semibold mb-1">Legal Reference</div>
            <p>
              COBRA continuation coverage is available under ERISA Section 601-608 and IRS
              regulations. Election deadline is 60 days from the later of (1) loss of coverage or
              (2) date of COBRA notice. Coverage under termination/reduced hours is limited to 18
              months; other qualifying events allow up to 36 months. Premiums are 102% of the
              applicable group rate.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {isElectable && (
            <button
              onClick={() => {
                onClose();
                onElect(record);
              }}
              className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
            >
              <BadgeCheck className="h-4 w-4" />
              Elect COBRA Coverage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabKey = 'eligible' | 'active' | 'all';

export default function COBRAManager() {
  const [records, setRecords] = useState<COBRARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('eligible');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<COBRARecord | null>(null);
  const [electingRecord, setElectingRecord] = useState<COBRARecord | null>(null);

  useEffect(() => {
    BenefitsClaimsService.getCOBRARecords().then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  async function handleElect(planIds: string[]) {
    if (!electingRecord) return;
    const updated = await BenefitsClaimsService.initiateCOBRA(electingRecord.employeeId, planIds);
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setElectingRecord(null);
  }

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'eligible') return r.status === 'Eligible' || r.status === 'Notice Sent';
    if (activeTab === 'active') return r.status === 'Active' || r.status === 'Elected';
    return true; // 'all'
  });

  // Summary stats
  const stats = {
    eligible: records.filter((r) => r.status === 'Eligible' || r.status === 'Notice Sent').length,
    active: records.filter((r) => r.status === 'Active').length,
    expiringSoon: records.filter((r) => {
      if (r.status !== 'Active' || !r.coverageEndDate) return false;
      return daysUntil(r.coverageEndDate) <= 60;
    }).length,
    deadlineSoon: records.filter((r) => {
      if (r.status !== 'Eligible' && r.status !== 'Notice Sent') return false;
      return daysUntil(r.electionDeadline) <= 14;
    }).length,
    totalMonthlyCost: records
      .filter((r) => r.status === 'Active')
      .reduce((s, r) => s + r.totalMonthlyCost, 0),
  };

  const TAB_CONFIG: { key: TabKey; label: string; count: number }[] = [
    { key: 'eligible', label: 'Awaiting Election', count: stats.eligible },
    { key: 'active', label: 'Active Coverage', count: stats.active },
    { key: 'all', label: 'All Records', count: records.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin mr-2" />
        <span className="text-gray-500 text-sm">Loading COBRA records...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            COBRA Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage continuation coverage — ERISA Sections 601-608 · IRS 60-day election window
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Hourglass className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-gray-500 font-medium">Awaiting Election</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.eligible}</div>
          {stats.deadlineSoon > 0 && (
            <div className="text-xs text-red-500 mt-1 font-medium">
              {stats.deadlineSoon} deadline within 14 days
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BadgeCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Active COBRA</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          {stats.expiringSoon > 0 && (
            <div className="text-xs text-orange-500 mt-1 font-medium">
              {stats.expiringSoon} expiring in 60 days
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="h-4 w-4 text-indigo-500" />
            <span className="text-xs text-gray-500 font-medium">Monthly Premiums</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {fmtCurrency(stats.totalMonthlyCost)}
          </div>
          <div className="text-xs text-gray-400 mt-1">active coverage</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Total Records</span>
          </div>
          <div className="text-2xl font-bold text-gray-700">{records.length}</div>
          <div className="text-xs text-gray-400 mt-1">all qualifying events</div>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name, department, employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {TAB_CONFIG.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-indigo-600 text-indigo-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Records Grid */}
        <div className="p-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No COBRA records found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredRecords.map((record) => (
                <COBRARecordCard
                  key={record.id}
                  record={record}
                  onElect={setElectingRecord}
                  onView={setSelectedRecord}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legal Compliance Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">ERISA &amp; IRS COBRA Compliance:</span> Employers must
            provide COBRA election notice within 44 days of qualifying event. Employees have 60 days
            from the later of loss of coverage or notice to elect. Coverage under termination or
            reduction in hours is limited to 18 months; other qualifying events (divorce, Medicare
            entitlement, dependent loss of status, employer bankruptcy) allow up to 36 months.
            Premium cannot exceed 102% of applicable group rate. (ERISA §§601-608; 26 CFR §54.4980B)
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedRecord && (
        <DetailPanel
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onElect={(r) => {
            setSelectedRecord(null);
            setElectingRecord(r);
          }}
        />
      )}

      {/* Election Form */}
      {electingRecord && (
        <ElectionForm
          record={electingRecord}
          onElect={handleElect}
          onCancel={() => setElectingRecord(null)}
        />
      )}
    </div>
  );
}
