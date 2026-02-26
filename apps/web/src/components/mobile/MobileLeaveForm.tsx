/**
 * @module MobileLeaveForm
 * @description Mobile leave application form — type selector, date range picker,
 *              balance display, half-day option, document upload (Sec 15.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Upload, Camera, FileText, CheckCircle, X, Info } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeaveType {
  id: string;
  name: string;
  emoji: string;
  available: number;
  used: number;
  total: number;
  color: string;
  bgColor: string;
  requiresDocument: boolean;
}

interface LeaveRequest {
  typeId: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDaySession: 'AM' | 'PM';
  reason: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const LEAVE_TYPES: LeaveType[] = [
  {
    id: 'annual',
    name: 'Annual Leave',
    emoji: '🌴',
    available: 12,
    used: 6,
    total: 18,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    requiresDocument: false,
  },
  {
    id: 'sick',
    name: 'Sick Leave',
    emoji: '🤒',
    available: 7,
    used: 2,
    total: 9,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    requiresDocument: true,
  },
  {
    id: 'casual',
    name: 'Casual Leave',
    emoji: '☕',
    available: 3,
    used: 1,
    total: 4,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    requiresDocument: false,
  },
  {
    id: 'wfh',
    name: 'Work From Home',
    emoji: '🏠',
    available: 8,
    used: 4,
    total: 12,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    requiresDocument: false,
  },
  {
    id: 'maternity',
    name: 'Maternity Leave',
    emoji: '👶',
    available: 90,
    used: 0,
    total: 90,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    requiresDocument: true,
  },
  {
    id: 'comp_off',
    name: 'Compensatory Off',
    emoji: '🔄',
    available: 2,
    used: 0,
    total: 2,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    requiresDocument: false,
  },
];

const RECENT_HISTORY = [
  { type: 'Annual Leave', dates: 'Jan 15 – Jan 17', days: 3, status: 'approved' },
  { type: 'Sick Leave', dates: 'Feb 5', days: 1, status: 'approved' },
  { type: 'WFH', dates: 'Feb 12', days: 1, status: 'pending' },
];

const HOLIDAYS = ['2026-03-06', '2026-03-25', '2026-04-01'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function countWorkingDays(start: string, end: string, holidays: string[]): number {
  if (!start || !end) return 0;
  const startD = new Date(start);
  const endD = new Date(end);
  if (startD > endD) return 0;
  let count = 0;
  const cur = new Date(startD);
  while (cur <= endD) {
    const day = cur.getDay();
    const iso = cur.toISOString().split('T')[0];
    if (day !== 0 && day !== 6 && !holidays.includes(iso)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MobileLeaveForm() {
  const [selectedType, setSelectedType] = useState<string>('annual');
  const [request, setRequest] = useState<LeaveRequest>({
    typeId: 'annual',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    halfDaySession: 'AM',
    reason: '',
  });
  const [files, setFiles] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const leaveType = LEAVE_TYPES.find((lt) => lt.id === selectedType)!;
  const workingDays = useMemo(
    () => countWorkingDays(request.startDate, request.endDate, HOLIDAYS),
    [request.startDate, request.endDate]
  );

  const handleSubmit = () => {
    if (!request.startDate || !request.endDate) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Leave Applied!</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Your request has been submitted and is pending manager approval.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setRequest({
              typeId: 'annual',
              startDate: '',
              endDate: '',
              isHalfDay: false,
              halfDaySession: 'AM',
              reason: '',
            });
            setFiles([]);
          }}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
        >
          Apply Another
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">Apply Leave</h1>
        <p className="text-sm text-gray-500">Fill in the details below</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Balance Cards */}
        <div className="px-4 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Leave Balances</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {LEAVE_TYPES.map((lt) => (
              <button
                key={lt.id}
                onClick={() => {
                  setSelectedType(lt.id);
                  setRequest((prev) => ({ ...prev, typeId: lt.id }));
                }}
                className={`flex-shrink-0 rounded-xl p-3 border-2 transition-all ${
                  selectedType === lt.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-transparent bg-white'
                }`}
              >
                <p className="text-xl">{lt.emoji}</p>
                <p className="text-xs font-semibold text-gray-800 mt-1 whitespace-nowrap">
                  {lt.name}
                </p>
                <p className={`text-lg font-bold mt-0.5 ${lt.color}`}>{lt.available}</p>
                <p className="text-xs text-gray-400">available</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Type Info */}
        <div className={`mx-4 mt-3 ${leaveType.bgColor} rounded-xl p-3 flex items-center gap-2`}>
          <Info className={`w-4 h-4 ${leaveType.color} flex-shrink-0`} />
          <p className={`text-sm ${leaveType.color}`}>
            <span className="font-semibold">{leaveType.available} days</span> available of{' '}
            {leaveType.total} total
          </p>
        </div>

        {/* Date Range */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Date Range
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Start Date</label>
              <input
                type="date"
                value={request.startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setRequest((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">End Date</label>
              <input
                type="date"
                value={request.endDate}
                min={request.startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setRequest((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* Duration */}
          {workingDays > 0 && (
            <div className="mt-3 bg-indigo-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
              <span className="text-sm text-indigo-700">Working days</span>
              <span className="font-bold text-indigo-700">
                {workingDays} day{workingDays !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Half Day */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Half Day</span>
            </div>
            <button
              onClick={() => setRequest((prev) => ({ ...prev, isHalfDay: !prev.isHalfDay }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                request.isHalfDay ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  request.isHalfDay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {request.isHalfDay && (
            <div className="mt-2 flex gap-2">
              {['AM', 'PM'].map((session) => (
                <button
                  key={session}
                  onClick={() =>
                    setRequest((prev) => ({ ...prev, halfDaySession: session as 'AM' | 'PM' }))
                  }
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    request.halfDaySession === session
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {session} Session
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reason */}
        <div className="mx-4 mt-3 bg-white rounded-2xl p-4">
          <label className="font-semibold text-gray-900 block mb-2">Reason</label>
          <textarea
            value={request.reason}
            onChange={(e) => setRequest((prev) => ({ ...prev, reason: e.target.value }))}
            placeholder="Briefly describe the reason for leave..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        </div>

        {/* Document Upload */}
        {leaveType.requiresDocument && (
          <div className="mx-4 mt-3 bg-white rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Supporting Document</h3>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                <Camera className="w-4 h-4" />
                Camera
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                <Upload className="w-4 h-4" />
                Gallery
              </button>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 flex-1 truncate">{f}</span>
                    <button onClick={() => setFiles(files.filter((_, fi) => fi !== i))}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent History */}
        <div className="mx-4 mt-3 mb-4 bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent History</h3>
          <div className="space-y-2">
            {RECENT_HISTORY.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{h.type}</p>
                  <p className="text-xs text-gray-500">
                    {h.dates} · {h.days}d
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    h.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white border-t border-gray-100 p-4">
        <button
          onClick={handleSubmit}
          disabled={!request.startDate || !request.endDate}
          className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm disabled:opacity-40 hover:bg-indigo-700 transition-colors"
        >
          Submit Leave Application
        </button>
      </div>
    </div>
  );
}

export default MobileLeaveForm;
