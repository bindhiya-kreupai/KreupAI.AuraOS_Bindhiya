// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

/**
 * @component ShiftRoster
 * @description Weekly shift roster grid — employees × days, color-coded shifts,
 *   shift assignment, swap indicators, conflict detection, swap requests management.
 * @project AURA HCM Platform
 * @section 12.1 — Advanced Shift Management
 * @legal UAE Labour Law Federal Decree-Law No. 33 of 2021 — Article 17 (max 8h/day, 48h/week);
 *   minimum 11 hours rest between shifts (Art. 18); Friday as weekly rest day where applicable.
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Edit3,
  Sun,
  Sunset,
  Moon,
  Briefcase,
  Shuffle,
} from 'lucide-react';
import type {
  ShiftRoster as ShiftRosterData,
  ShiftPattern,
  RosterEntry,
  RosterEmployee,
  ShiftSwapRequest,
  SwapStatus,
} from '@/services/shiftService';
import { ShiftService } from '@/services/shiftService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function fmtDateShort(d: string): string {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}

function getWeekStart(offset = 0): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function getWeekDates(weekStart: string): string[] {
  const dates: string[] = [];
  const start = new Date(weekStart + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// ── Shift Cell ─────────────────────────────────────────────────────────────────

const SHIFT_TYPE_ICON: Record<string, React.ReactNode> = {
  Morning: <Sun className="h-3 w-3" />,
  Day: <Briefcase className="h-3 w-3" />,
  Evening: <Sunset className="h-3 w-3" />,
  Night: <Moon className="h-3 w-3" />,
  Flexible: <Shuffle className="h-3 w-3" />,
  Rotational: <RefreshCw className="h-3 w-3" />,
  Split: <ArrowLeftRight className="h-3 w-3" />,
};

interface ShiftCellProps {
  entry: RosterEntry | undefined;
  shiftMap: Record<string, ShiftPattern>;
  hasSwap: boolean;
  isToday: boolean;
}

function ShiftCell({ entry, shiftMap, hasSwap, isToday }: ShiftCellProps) {
  if (!entry || entry.shiftType === 'Off') {
    return (
      <div
        className={`h-14 rounded-lg flex items-center justify-center ${isToday ? 'ring-2 ring-blue-300' : ''} bg-gray-50 border border-dashed border-gray-200`}
      >
        <span className="text-xs text-gray-300 font-medium">OFF</span>
      </div>
    );
  }

  if (entry.shiftType === 'Leave') {
    return (
      <div
        className={`h-14 rounded-lg flex items-center justify-center bg-orange-50 border border-orange-200 ${isToday ? 'ring-2 ring-blue-300' : ''}`}
      >
        <span className="text-xs text-orange-600 font-medium">LEAVE</span>
      </div>
    );
  }

  if (entry.shiftType === 'Holiday') {
    return (
      <div
        className={`h-14 rounded-lg flex items-center justify-center bg-rose-50 border border-rose-200 ${isToday ? 'ring-2 ring-blue-300' : ''}`}
      >
        <span className="text-xs text-rose-600 font-medium">HOLIDAY</span>
      </div>
    );
  }

  const shift = entry.shiftId ? shiftMap[entry.shiftId] : null;
  const colorClass = shift?.colorCode ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const icon = SHIFT_TYPE_ICON[entry.shiftType] ?? <Clock className="h-3 w-3" />;

  return (
    <div
      className={`relative h-14 rounded-lg border flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-all hover:shadow-sm cursor-default ${colorClass} ${isToday ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className="flex items-center gap-1">
        {icon}
        <span className="font-bold">
          {shift?.code ?? entry.shiftType.slice(0, 2).toUpperCase()}
        </span>
      </div>
      {shift && (
        <div className="text-[10px] opacity-70">
          {shift.startTime}–{shift.endTime}
        </div>
      )}
      {hasSwap && (
        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center">
          <ArrowLeftRight className="h-2.5 w-2.5 text-white" />
        </div>
      )}
    </div>
  );
}

// ── Swap Badge ─────────────────────────────────────────────────────────────────

const SWAP_STATUS_STYLES: Record<SwapStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  'Counter Proposed': 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

function SwapBadge({ status }: { status: SwapStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${SWAP_STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// ── Assign Shift Modal ─────────────────────────────────────────────────────────

interface AssignShiftModalProps {
  employee: RosterEmployee;
  date: string;
  patterns: ShiftPattern[];
  onAssign: (shiftId: string) => void;
  onClose: () => void;
}

function AssignShiftModal({ employee, date, patterns, onAssign, onClose }: AssignShiftModalProps) {
  const [selected, setSelected] = useState<string>('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-700 text-white px-5 py-4">
          <h3 className="font-bold text-base">Assign Shift</h3>
          <p className="text-indigo-200 text-sm">
            {employee.employeeName} · {fmtDate(date)}
          </p>
        </div>
        <div className="p-5 space-y-2">
          {/* Off option */}
          <label
            className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${selected === 'off' ? 'border-gray-400 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="shift"
                value="off"
                checked={selected === 'off'}
                onChange={() => setSelected('off')}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Day Off</span>
            </div>
            <span className="text-xs text-gray-400">— rest day —</span>
          </label>
          {patterns.map((p) => (
            <label
              key={p.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${selected === p.id ? `border-indigo-400 ${p.colorCode}` : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shift"
                  value={p.id}
                  checked={selected === p.id}
                  onChange={() => setSelected(p.id)}
                  className="h-4 w-4"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {p.name} <span className="text-gray-400 text-xs">({p.code})</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.startTime} – {p.endTime} · {p.workingHours}h work · {p.breakMinutes}m break
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selected}
            onClick={() => {
              onAssign(selected);
              onClose();
            }}
            className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Assign Shift
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Swap Requests Panel ────────────────────────────────────────────────────────

interface SwapPanelProps {
  swaps: ShiftSwapRequest[];
  onApprove: (swapId: string, approved: boolean, comments: string) => void;
  onClose: () => void;
}

function SwapPanel({ swaps, onApprove, onClose }: SwapPanelProps) {
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(swapId: string, approved: boolean) {
    setProcessing(swapId);
    await onApprove(swapId, approved, commentMap[swapId] ?? '');
    setProcessing(null);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Shift Swap Requests
            </h2>
            <p className="text-indigo-200 text-sm">{swaps.length} request(s)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {swaps.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No swap requests found.</div>
          ) : (
            swaps.map((swap) => (
              <div key={swap.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {swap.requesterName}{' '}
                      <ArrowLeftRight className="inline h-3.5 w-3.5 text-gray-400 mx-1" />{' '}
                      {swap.targetEmployeeName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Requested: {new Date(swap.requestedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <SwapBadge status={swap.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="bg-sky-50 border border-sky-100 rounded-lg p-2.5">
                    <div className="text-sky-600 font-semibold mb-1">
                      {swap.requesterName} gives up
                    </div>
                    <div className="text-gray-700">{fmtDate(swap.requesterShiftDate)}</div>
                    <div className="text-gray-500">{swap.requesterShiftName}</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
                    <div className="text-emerald-600 font-semibold mb-1">
                      {swap.targetEmployeeName} gives up
                    </div>
                    <div className="text-gray-700">{fmtDate(swap.targetShiftDate)}</div>
                    <div className="text-gray-500">{swap.targetShiftName}</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 italic mb-3">
                  Reason: &ldquo;{swap.reason}&rdquo;
                </div>

                {swap.status === 'Pending' && (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Manager comments (optional)..."
                      rows={1}
                      value={commentMap[swap.id] ?? ''}
                      onChange={(e) =>
                        setCommentMap((prev) => ({ ...prev, [swap.id]: e.target.value }))
                      }
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none text-gray-700"
                    />
                    <div className="flex gap-2">
                      <button
                        disabled={processing === swap.id}
                        onClick={() => handleAction(swap.id, true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        disabled={processing === swap.id}
                        onClick={() => handleAction(swap.id, false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {swap.managerComments && swap.status !== 'Pending' && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mt-1">
                    Manager: &ldquo;{swap.managerComments}&rdquo;
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ShiftRoster() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [roster, setRoster] = useState<ShiftRosterData | null>(null);
  const [patterns, setPatterns] = useState<ShiftPattern[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSwapPanel, setShowSwapPanel] = useState(false);
  const [assignModal, setAssignModal] = useState<{ employee: RosterEmployee; date: string } | null>(
    null
  );
  const [_viewMode, _setViewMode] = useState<'roster' | 'legend'>('roster');

  const weekStart = getWeekStart(weekOffset);
  const weekDates = getWeekDates(weekStart);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ShiftService.getShiftRoster('dept-001', weekStart),
      ShiftService.getShiftPatterns(),
      ShiftService.getSwapRequests(),
    ]).then(([rosterData, patternsData, swapsData]) => {
      setRoster(rosterData);
      setPatterns(patternsData);
      setSwapRequests(swapsData);
      setLoading(false);
    });
  }, [weekOffset]);

  // Build shift lookup map
  const shiftMap: Record<string, ShiftPattern> = {};
  patterns.forEach((p) => {
    shiftMap[p.id] = p;
  });

  // Build entry lookup: employeeId + date => RosterEntry
  const entryMap: Record<string, RosterEntry> = {};
  roster?.entries.forEach((e) => {
    entryMap[`${e.employeeId}-${e.date}`] = e;
  });

  // Build swap indicator set: employeeId+date
  const swapIndicators = new Set<string>();
  swapRequests.forEach((sw) => {
    if (sw.status === 'Approved' || sw.status === 'Pending') {
      swapIndicators.add(`${sw.requesterId}-${sw.requesterShiftDate}`);
      swapIndicators.add(`${sw.targetEmployeeId}-${sw.targetShiftDate}`);
    }
  });

  const pendingSwaps = swapRequests.filter((s) => s.status === 'Pending');

  async function handleAssignShift(employeeId: string, date: string, shiftId: string) {
    await ShiftService.assignShift(employeeId, shiftId, date, date);
    // Optimistic UI update
    setRoster((prev) => {
      if (!prev) return prev;
      const shift = shiftId === 'off' ? null : shiftMap[shiftId];
      return {
        ...prev,
        entries: prev.entries.map((e) =>
          e.employeeId === employeeId && e.date === date
            ? {
                ...e,
                shiftId: shiftId === 'off' ? null : shiftId,
                shiftName: shiftId === 'off' ? null : (shift?.name ?? null),
                shiftType: shiftId === 'off' ? 'Off' : (shift?.type ?? 'Day'),
              }
            : e
        ),
      };
    });
  }

  async function handleSwapAction(swapId: string, approved: boolean, comments: string) {
    const updated = await ShiftService.approveShiftSwap(swapId, approved, comments, 'Manager');
    setSwapRequests((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  // Coverage summary per day
  function getDayCoverage(date: string) {
    const entries =
      roster?.entries.filter(
        (e) => e.date === date && e.shiftType !== 'Off' && e.shiftType !== 'Holiday'
      ) ?? [];
    return entries.length;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin mr-2" />
        <span className="text-gray-500 text-sm">Loading roster...</span>
      </div>
    );
  }

  const employees = roster?.employees ?? [];

  return (
    <div className="bg-gray-50 min-h-full p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Shift Roster
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Engineering Department — Week of {fmtDate(weekStart)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingSwaps.length > 0 && (
            <button
              onClick={() => setShowSwapPanel(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold hover:bg-amber-100 transition-colors"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Swap Requests
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {pendingSwaps.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowSwapPanel(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftRight className="h-4 w-4" />
            All Swaps
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800">
              {new Date(weekStart + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div className="text-xs text-gray-400">
              {fmtDate(weekDates[0])} — {fmtDate(weekDates[6])}
            </div>
          </div>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Roster Grid */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="sticky left-0 bg-white px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-100 min-w-[160px]">
                  Employee
                </th>
                {weekDates.map((date) => {
                  const isToday = date === today;
                  const isWeekend =
                    new Date(date + 'T00:00:00').getDay() === 0 ||
                    new Date(date + 'T00:00:00').getDay() === 6;
                  const coverage = getDayCoverage(date);
                  return (
                    <th
                      key={date}
                      className={`px-2 py-3 text-center text-xs font-semibold min-w-[100px] ${isToday ? 'bg-blue-50 text-blue-700' : isWeekend ? 'bg-gray-50 text-gray-400' : 'text-gray-500'}`}
                    >
                      <div className="uppercase tracking-wide">{fmtDateShort(date)}</div>
                      <div
                        className={`text-[10px] mt-0.5 font-normal ${coverage === 0 ? 'text-red-400' : coverage <= 2 ? 'text-amber-500' : 'text-emerald-500'}`}
                      >
                        {coverage} active
                      </div>
                    </th>
                  );
                })}
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[60px]">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp) => {
                // Calculate total scheduled hours for the week
                const totalHours = weekDates.reduce((sum, date) => {
                  const entry = entryMap[`${emp.employeeId}-${date}`];
                  if (!entry || !entry.shiftId) return sum;
                  const shift = shiftMap[entry.shiftId];
                  return sum + (shift?.workingHours ?? 0);
                }, 0);

                return (
                  <tr key={emp.employeeId} className="hover:bg-gray-50 transition-colors">
                    {/* Employee column — sticky */}
                    <td className="sticky left-0 bg-white border-r border-gray-100 px-4 py-2 z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {emp.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-800 truncate">
                            {emp.employeeName}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {emp.designation}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Daily cells */}
                    {weekDates.map((date) => {
                      const entry = entryMap[`${emp.employeeId}-${date}`];
                      const hasSwap = swapIndicators.has(`${emp.employeeId}-${date}`);
                      const isToday = date === today;
                      const isWeekend =
                        new Date(date + 'T00:00:00').getDay() === 0 ||
                        new Date(date + 'T00:00:00').getDay() === 6;

                      return (
                        <td
                          key={date}
                          className={`px-1 py-1.5 ${isToday ? 'bg-blue-50/30' : isWeekend ? 'bg-gray-50/50' : ''}`}
                        >
                          <div
                            className="group relative"
                            onDoubleClick={() => setAssignModal({ employee: emp, date })}
                            title="Double-click to reassign shift"
                          >
                            <ShiftCell
                              entry={entry}
                              shiftMap={shiftMap}
                              hasSwap={hasSwap}
                              isToday={isToday}
                            />
                            <button
                              onClick={() => setAssignModal({ employee: emp, date })}
                              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-black/5 flex items-center justify-center transition-opacity"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      );
                    })}

                    {/* Weekly total hours */}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`text-xs font-bold ${totalHours > 48 ? 'text-red-600' : totalHours >= 40 ? 'text-emerald-600' : 'text-gray-500'}`}
                      >
                        {totalHours}h
                      </span>
                      {totalHours > 48 && (
                        <AlertTriangle
                          className="h-3 w-3 text-red-400 mx-auto mt-0.5"
                          title="Exceeds 48h UAE limit"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-100 flex flex-wrap gap-2 bg-gray-50">
          <div className="text-xs font-semibold text-gray-500 mr-2 flex items-center">
            Shift Legend:
          </div>
          {patterns.map((p) => (
            <span
              key={p.id}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${p.colorCode}`}
            >
              {SHIFT_TYPE_ICON[p.type]}
              {p.code} {p.startTime}–{p.endTime}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
            OFF — day off
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
            <ArrowLeftRight className="h-3 w-3" /> — swap indicator
          </span>
        </div>
      </div>

      {/* Coverage Summary */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const isToday = date === today;
          const isWeekend =
            new Date(date + 'T00:00:00').getDay() === 0 ||
            new Date(date + 'T00:00:00').getDay() === 6;
          const coverage = getDayCoverage(date);
          const maxEmployees = employees.length;
          const pct = Math.round((coverage / maxEmployees) * 100);
          return (
            <div
              key={date}
              className={`bg-white rounded-xl border p-3 shadow-sm text-center ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
            >
              <div
                className={`text-[10px] font-semibold uppercase ${isToday ? 'text-blue-600' : isWeekend ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {fmtDateShort(date)}
              </div>
              <div
                className={`text-xl font-bold mt-1 ${coverage === 0 ? 'text-red-500' : coverage <= 2 ? 'text-amber-500' : 'text-emerald-600'}`}
              >
                {coverage}
              </div>
              <div className="text-[10px] text-gray-400">/{maxEmployees} active</div>
              <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct === 0 ? 'bg-red-300' : pct <= 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">UAE Labour Law Compliance:</span> Maximum 8 hours/day
            and 48 hours/week (Art. 17). Minimum 11 hours rest between shifts (Art. 18). Employees
            exceeding 48 hours/week are flagged in red. Friday is the designated weekly rest day for
            applicable roles. Night shift premium applies to shifts between 22:00–06:00.
          </div>
        </div>
      </div>

      {/* Assign Shift Modal */}
      {assignModal && (
        <AssignShiftModal
          employee={assignModal.employee}
          date={assignModal.date}
          patterns={patterns}
          onAssign={(shiftId) =>
            handleAssignShift(assignModal.employee.employeeId, assignModal.date, shiftId)
          }
          onClose={() => setAssignModal(null)}
        />
      )}

      {/* Swap Panel */}
      {showSwapPanel && (
        <SwapPanel
          swaps={swapRequests}
          onApprove={handleSwapAction}
          onClose={() => setShowSwapPanel(false)}
        />
      )}
    </div>
  );
}
