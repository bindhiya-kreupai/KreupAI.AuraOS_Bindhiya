'use client';

/**
 * @component OvertimeManager
 * @description Overtime request management — OT request form, country-specific pay preview,
 *   approval queue, monthly summaries, department budget tracking, OT cap warnings.
 * @project AURA HCM Platform
 * @section 12.2 — Overtime Management
 * @legal UAE Labour Law Federal Decree-Law No. 33 of 2021:
 *   Art. 19(1) — weekday OT at 25% premium on basic + HRA;
 *   Art. 19(2) — Friday/holiday OT at 50% premium;
 *   Art. 19(3) — maximum 2 hours OT per day; max 144 hours OT per 3-month period.
 *   KSA Labour Law Art. 107(2) — 50% weekday OT premium;
 *   Art. 107(3) — 100% rest day premium.
 *   India Factories Act 1948 §59 — double rate for work beyond 9h/day or 48h/week.
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  DollarSign,
  Filter,
  RefreshCw,
  Info,
  BarChart3,
  ChevronDown,
  ChevronUp,
  BadgeAlert,
  Globe,
  Banknote,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import type {
  OvertimeRequest,
  OvertimeSummary,
  OvertimeStatus,
  OvertimeType,
  Country,
} from '@/services/shiftService';
import { ShiftService, calculateOvertimePay } from '@/services/shiftService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n);
}

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em - sh * 60 - sm + 1440) % 1440;
  return parseFloat((diff / 60).toFixed(2));
}

// ── Status Badge ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<OvertimeStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Processed: 'bg-blue-100 text-blue-800 border-blue-200',
};

function StatusBadge({ status }: { status: OvertimeStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// ── OT Type Badge ──────────────────────────────────────────────────────────────

const OT_TYPE_STYLES: Record<OvertimeType, string> = {
  Weekday: 'bg-sky-100 text-sky-700',
  Weekend: 'bg-violet-100 text-violet-700',
  'Public Holiday': 'bg-rose-100 text-rose-700',
  'Night Premium': 'bg-purple-100 text-purple-700',
};

function OTTypeBadge({ type }: { type: OvertimeType }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${OT_TYPE_STYLES[type]}`}
    >
      {type}
    </span>
  );
}

// ── Country Pay Preview ────────────────────────────────────────────────────────

interface OTPayPreviewProps {
  country: Country;
  hours: number;
  overtimeType: OvertimeType;
  baseSalary: number;
}

function OTPayPreview({ country, hours, overtimeType, baseSalary }: OTPayPreviewProps) {
  if (hours <= 0 || baseSalary <= 0) return null;
  const calc = calculateOvertimePay(baseSalary, hours, overtimeType, country);

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm space-y-1.5">
      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs mb-2">
        <DollarSign className="h-3.5 w-3.5" />
        Estimated Overtime Pay
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Hourly Rate:</span>
          <span className="ml-1 font-semibold text-gray-700">{fmtCurrency(calc.hourlyRate)}/h</span>
        </div>
        <div>
          <span className="text-gray-500">Rate Multiplier:</span>
          <span className="ml-1 font-semibold text-gray-700">{calc.multiplier}×</span>
        </div>
        <div>
          <span className="text-gray-500">OT Hours:</span>
          <span className="ml-1 font-semibold text-gray-700">{hours}h</span>
        </div>
        <div>
          <span className="text-gray-500">OT Pay:</span>
          <span className="ml-1 font-bold text-emerald-700 text-sm">
            {fmtCurrency(calc.overtimePay)}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-gray-400 italic mt-1">{calc.legalReference}</div>
    </div>
  );
}

// ── Submit OT Form ─────────────────────────────────────────────────────────────

interface SubmitOTFormProps {
  onSubmit: (data: Partial<OvertimeRequest>) => Promise<void>;
  onClose: () => void;
}

const COUNTRIES: Country[] = ['UAE', 'KSA', 'India', 'Global'];
const OT_TYPES: OvertimeType[] = ['Weekday', 'Weekend', 'Public Holiday', 'Night Premium'];

function SubmitOTForm({ onSubmit, onClose }: SubmitOTFormProps) {
  const [form, setForm] = useState({
    overtimeDate: new Date().toISOString().slice(0, 10),
    startTime: '18:00',
    endTime: '21:00',
    overtimeType: 'Weekday' as OvertimeType,
    reason: '',
    projectCode: '',
    country: 'UAE' as Country,
    baseSalary: 15000,
  });
  const [saving, setSaving] = useState(false);

  const hours = calcHours(form.startTime, form.endTime);
  const twoHourLimit = form.country === 'UAE' && hours > 2;

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.reason || hours <= 0) return;
    setSaving(true);
    try {
      await onSubmit({
        overtimeDate: form.overtimeDate,
        startTime: form.startTime,
        endTime: form.endTime,
        hours,
        overtimeType: form.overtimeType,
        reason: form.reason,
        projectCode: form.projectCode || null,
        country: form.country,
        employeeId: 'emp-self',
        employeeCode: 'EMP-SELF',
        employeeName: 'Current User',
        department: 'Engineering',
        designation: 'Engineer',
        managerId: 'emp-001',
        managerName: 'Rahul Mehta',
        estimatedPay: form.baseSalary,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-indigo-700 text-white px-5 py-4">
          <h2 className="font-bold text-base">Submit Overtime Request</h2>
          <p className="text-indigo-200 text-sm">Request pre-approval for overtime work</p>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Overtime Date *
            </label>
            <input
              type="date"
              value={form.overtimeDate}
              onChange={(e) => update('overtimeDate', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Start Time *</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => update('startTime', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">End Time *</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => update('endTime', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Hours display */}
          {hours > 0 && (
            <div
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${twoHourLimit ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-sky-50 border border-sky-200 text-sky-700'}`}
            >
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">{hours} hours overtime</span>
              {twoHourLimit && (
                <span className="text-xs">
                  — UAE max 2h/day per Art. 19(3). Submit only if exceptional approval obtained.
                </span>
              )}
            </div>
          )}

          {/* OT Type */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Overtime Type *
            </label>
            <select
              value={form.overtimeType}
              onChange={(e) => update('overtimeType', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {OT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Country / Labour Law *
            </label>
            <select
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Pay Preview */}
          <OTPayPreview
            country={form.country}
            hours={hours}
            overtimeType={form.overtimeType}
            baseSalary={form.baseSalary}
          />

          {/* Reason */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Reason / Justification *
            </label>
            <textarea
              rows={3}
              value={form.reason}
              onChange={(e) => update('reason', e.target.value)}
              placeholder="Describe the business need for overtime..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Project Code */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Project / Cost Code (optional)
            </label>
            <input
              type="text"
              value={form.projectCode}
              onChange={(e) => update('projectCode', e.target.value)}
              placeholder="e.g. PROJ-AOS-001"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t bg-gray-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!form.reason || hours <= 0 || saving}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── OT Request Row ─────────────────────────────────────────────────────────────

interface OTRequestRowProps {
  request: OvertimeRequest;
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function OTRequestRow({ request, isAdmin, onApprove, onReject }: OTRequestRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Employee */}
        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
          {request.employeeName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-800 truncate">
            {request.employeeName}
            {isAdmin && (
              <span className="text-gray-400 font-normal ml-1.5 text-xs">
                ({request.department})
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap mt-0.5">
            <span>{fmtDate(request.overtimeDate)}</span>
            <span className="text-gray-300">·</span>
            <span>
              {request.startTime}–{request.endTime}
            </span>
            <span className="text-gray-300">·</span>
            <span className="font-medium">{request.hours}h</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <OTTypeBadge type={request.overtimeType} />
          <StatusBadge status={request.status} />
          <div className="text-sm font-bold text-emerald-600">
            {fmtCurrency(request.estimatedPay)}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-gray-400 mb-0.5">Project Code</div>
              <div className="font-medium text-gray-700">{request.projectCode ?? '—'}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-0.5">Country</div>
              <div className="font-medium text-gray-700 flex items-center gap-1">
                <Globe className="h-3 w-3 text-gray-400" />
                {request.country}
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-0.5">Pay Rate</div>
              <div className="font-medium text-gray-700">{request.payRate}×</div>
            </div>
            <div>
              <div className="text-gray-400 mb-0.5">Payroll</div>
              <div className="font-medium text-gray-700">
                {request.isProcessedInPayroll ? 'Processed' : 'Pending'}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-0.5">Reason</div>
            <div className="text-xs text-gray-700 italic">&ldquo;{request.reason}&rdquo;</div>
          </div>

          {request.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-xs text-red-700">
              <span className="font-semibold">Rejection reason: </span>
              {request.rejectionReason}
            </div>
          )}

          {isAdmin && request.status === 'Pending' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onApprove(request.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Monthly Summary Table ──────────────────────────────────────────────────────

function MonthlySummary({ summaries }: { summaries: OvertimeSummary[] }) {
  const OT_MONTHLY_CAP = 48; // UAE: 144h per quarter = ~48/month

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-500" />
        <h2 className="text-sm font-bold text-gray-800">Monthly OT Summary by Employee</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">
                Employee
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">
                Weekday OT
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">
                Weekend OT
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">
                Holiday OT
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">
                Total Hours
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">
                Total Pay
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">
                Budget Used
              </th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">
                Pending
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summaries.map((s) => {
              const overCap = s.totalOTHours > OT_MONTHLY_CAP;
              const budgetPct =
                s.otBudgetAllocated > 0
                  ? Math.round((s.otBudgetUsed / s.otBudgetAllocated) * 100)
                  : 0;
              return (
                <tr
                  key={s.employeeId}
                  className={`hover:bg-gray-50 transition-colors ${overCap ? 'bg-red-50/30' : ''}`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {s.employeeName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-800">{s.employeeName}</div>
                        <div className="text-[10px] text-gray-400">{s.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-600">
                    {s.weekdayOTHours}h
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-600">
                    {s.weekendOTHours}h
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-600">
                    {s.holidayOTHours}h
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className={`text-xs font-bold ${overCap ? 'text-red-600' : 'text-gray-800'}`}
                    >
                      {s.totalOTHours}h
                    </span>
                    {overCap && (
                      <AlertTriangle
                        className="inline h-3 w-3 text-red-400 ml-1"
                        title="Exceeds monthly OT cap"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs font-semibold text-emerald-600">
                    {fmtCurrency(s.totalOTPay)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${budgetPct >= 90 ? 'bg-red-400' : budgetPct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${Math.min(budgetPct, 100)}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${budgetPct >= 90 ? 'text-red-600' : 'text-gray-500'}`}
                      >
                        {budgetPct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {s.pendingRequests > 0 ? (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        {s.pendingRequests}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td className="px-4 py-2.5 text-xs font-bold text-gray-700">TOTALS</td>
              <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">
                {summaries.reduce((s, r) => s + r.weekdayOTHours, 0)}h
              </td>
              <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">
                {summaries.reduce((s, r) => s + r.weekendOTHours, 0)}h
              </td>
              <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">
                {summaries.reduce((s, r) => s + r.holidayOTHours, 0)}h
              </td>
              <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">
                {summaries.reduce((s, r) => s + r.totalOTHours, 0)}h
              </td>
              <td className="px-4 py-2.5 text-right text-xs font-bold text-emerald-700">
                {fmtCurrency(summaries.reduce((s, r) => s + r.totalOTPay, 0))}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Reject Modal ───────────────────────────────────────────────────────────────

interface RejectModalProps {
  requestId: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

function RejectModal({ requestId, onConfirm, onCancel }: RejectModalProps) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-red-700 text-white px-5 py-4">
          <h3 className="font-bold text-base">Reject Overtime Request</h3>
          <p className="text-red-200 text-sm">{requestId}</p>
        </div>
        <div className="p-5">
          <label className="text-xs font-semibold text-gray-600 block mb-1">
            Rejection Reason *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a clear reason for rejection..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>
        <div className="px-5 pb-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!reason}
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Reject Request
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabKey = 'pending' | 'all' | 'summary';

interface OvertimeManagerProps {
  isAdmin?: boolean;
}

export default function OvertimeManager({ isAdmin = true }: OvertimeManagerProps) {
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [summaries, setSummaries] = useState<OvertimeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<Country | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<OvertimeStatus | 'All'>('All');
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    Promise.all([
      ShiftService.getOvertimeRequests(),
      ShiftService.getOvertimeSummaries(currentMonth),
    ]).then(([reqs, sums]) => {
      setRequests(reqs);
      setSummaries(sums);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(data: Partial<OvertimeRequest>) {
    const newReq = await ShiftService.submitOvertimeRequest(data);
    setRequests((prev) => [newReq, ...prev]);
  }

  async function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Approved' as OvertimeStatus,
              approvedDate: new Date().toISOString().slice(0, 10),
              approvedBy: 'Manager',
            }
          : r
      )
    );
  }

  async function handleReject(id: string, reason: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'Rejected' as OvertimeStatus, rejectionReason: reason } : r
      )
    );
    setRejectModal(null);
  }

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'pending' && r.status !== 'Pending') return false;
    if (filterCountry !== 'All' && r.country !== filterCountry) return false;
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const stats = {
    pending: requests.filter((r) => r.status === 'Pending').length,
    approved: requests.filter((r) => r.status === 'Approved').length,
    totalEstimatedPay: requests
      .filter((r) => r.status === 'Approved' || r.status === 'Processed')
      .reduce((s, r) => s + r.estimatedPay, 0),
    totalHours: requests
      .filter((r) => r.status === 'Approved' || r.status === 'Processed')
      .reduce((s, r) => s + r.hours, 0),
    overCapEmployees: summaries.filter((s) => s.totalOTHours > 48).length,
  };

  const TAB_CONFIG: { key: TabKey; label: string; count?: number }[] = [
    { key: 'pending', label: 'Pending Approval', count: stats.pending },
    { key: 'all', label: 'All Requests', count: requests.length },
    { key: 'summary', label: 'Monthly Summary' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin mr-2" />
        <span className="text-gray-500 text-sm">Loading overtime data...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6 text-indigo-600" />
            Overtime Manager
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            OT request approval · Country-specific pay calculations · Budget tracking
          </p>
        </div>
        <button
          onClick={() => setShowSubmitForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Submit OT Request
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-gray-500 font-medium">Pending Approval</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-gray-400 mt-0.5">awaiting manager action</div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Approved</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
          <div className="text-xs text-gray-400 mt-0.5">this period</div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="h-4 w-4 text-indigo-500" />
            <span className="text-xs text-gray-500 font-medium">Approved OT Cost</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {fmtCurrency(stats.totalEstimatedPay)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{stats.totalHours}h total</div>
        </div>

        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BadgeAlert className="h-4 w-4 text-red-500" />
            <span className="text-xs text-gray-500 font-medium">Cap Warnings</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.overCapEmployees}</div>
          <div className="text-xs text-gray-400 mt-0.5">employees over 48h/month</div>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50 flex-wrap">
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
              {count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== 'summary' && (
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">Filters:</span>
            </div>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value as Country | 'All')}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="All">All Countries</option>
              {(['UAE', 'KSA', 'India', 'Global'] as Country[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {activeTab === 'all' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as OvertimeStatus | 'All')}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="All">All Statuses</option>
                {(['Pending', 'Approved', 'Rejected', 'Processed'] as OvertimeStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="p-4">
          {activeTab === 'summary' ? (
            <MonthlySummary summaries={summaries} />
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No overtime requests found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRequests.map((req) => (
                <OTRequestRow
                  key={req.id}
                  request={req}
                  isAdmin={isAdmin}
                  onApprove={handleApprove}
                  onReject={(id) => setRejectModal(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OT Pay Rate Reference */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-gray-800">Country OT Rate Reference</h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              country: 'UAE',
              flag: '🇦🇪',
              rates: [
                { type: 'Weekday', rate: '25% premium', ref: 'Art. 19(1)' },
                { type: 'Friday / Holiday', rate: '50% premium', ref: 'Art. 19(2)' },
                { type: 'Night Premium', rate: '50% premium', ref: 'Art. 19(3)' },
              ],
              cap: '2h/day max; 144h per 3 months',
              law: 'Federal Decree-Law No. 33/2021',
            },
            {
              country: 'KSA',
              flag: '🇸🇦',
              rates: [
                { type: 'Weekday', rate: '50% premium', ref: 'Art. 107(2)' },
                { type: 'Rest Day', rate: '100% premium', ref: 'Art. 107(3)' },
              ],
              cap: '12h/day max work hours',
              law: 'Saudi Labour Law 2005 (Royal Decree M/51)',
            },
            {
              country: 'India',
              flag: '🇮🇳',
              rates: [
                { type: 'Beyond 9h/day or 48h/week', rate: 'Double rate (200%)', ref: '§ 59' },
              ],
              cap: '50h OT/quarter; 75h with Gov. permission',
              law: 'Factories Act 1948',
            },
          ].map(({ country, flag, rates, cap, law }) => (
            <div key={country} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">{flag}</span>
                <span className="text-xs font-bold text-gray-800">{country}</span>
                <span className="text-[10px] text-gray-400 ml-auto">{law}</span>
              </div>
              <div className="space-y-1 mb-2">
                {rates.map((r) => (
                  <div key={r.type} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{r.type}</span>
                    <span className="font-semibold text-indigo-700">{r.rate}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-orange-600 bg-orange-50 rounded px-2 py-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                Cap: {cap}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Multi-Country OT Compliance:</span> UAE: All overtime
            must be pre-approved. Maximum 2 hours/day under Art. 19; 144 hours per 3-month period.
            Calculated on basic salary + housing allowance per MoHRE guidance. KSA: Calculated on
            total hourly wage including all allowances per Art. 107. India: Overtime in factories is
            paid at double the ordinary rate per Factories Act §59; state-specific rules may apply
            for establishments covered under Shops &amp; Establishments Acts.
          </div>
        </div>
      </div>

      {/* Submit Form Modal */}
      {showSubmitForm && (
        <SubmitOTForm onSubmit={handleSubmit} onClose={() => setShowSubmitForm(false)} />
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <RejectModal
          requestId={rejectModal}
          onConfirm={(reason) => handleReject(rejectModal, reason)}
          onCancel={() => setRejectModal(null)}
        />
      )}
    </div>
  );
}
