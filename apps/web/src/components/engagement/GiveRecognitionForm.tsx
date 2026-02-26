/**
 * @module GiveRecognitionForm
 * @description Recognition submission form — employee search, value selector,
 *              badge grid, points allocation, public/private toggle, preview (Sec 13.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import { Search, X, Eye, EyeOff, Send, Star } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
}

interface CompanyValue {
  key: string;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}

interface BadgeOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

interface GiveRecognitionFormProps {
  onClose?: () => void;
  onSubmit?: (data: RecognitionFormData) => void;
}

interface RecognitionFormData {
  recipients: Employee[];
  message: string;
  values: string[];
  badgeId: string | null;
  points: number;
  isPublic: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    name: 'Jane Doe',
    role: 'Senior Engineer',
    department: 'Engineering',
    avatar: 'JD',
  },
  { id: 'emp-002', name: 'John Smith', role: 'Sales Executive', department: 'Sales', avatar: 'JS' },
  { id: 'emp-003', name: 'Sarah Lee', role: 'HR Business Partner', department: 'HR', avatar: 'SL' },
  {
    id: 'emp-004',
    name: 'Michael Zhang',
    role: 'Finance Analyst',
    department: 'Finance',
    avatar: 'MZ',
  },
  {
    id: 'emp-005',
    name: 'Priya Patel',
    role: 'Operations Manager',
    department: 'Operations',
    avatar: 'PP',
  },
  {
    id: 'emp-006',
    name: 'David Kim',
    role: 'Product Manager',
    department: 'Product',
    avatar: 'DK',
  },
  {
    id: 'emp-007',
    name: 'Lisa Wang',
    role: 'Marketing Lead',
    department: 'Marketing',
    avatar: 'LW',
  },
  {
    id: 'emp-008',
    name: 'Tom Johnson',
    role: 'Tech Lead',
    department: 'Engineering',
    avatar: 'TJ',
  },
  { id: 'emp-009', name: 'Emily Chen', role: 'Customer Success', department: 'CS', avatar: 'EC' },
  { id: 'emp-010', name: 'Robert Brown', role: 'Legal Counsel', department: 'Legal', avatar: 'RB' },
];

const COMPANY_VALUES: CompanyValue[] = [
  {
    key: 'innovation',
    label: 'Innovation',
    emoji: '💡',
    color: 'text-violet-700',
    bg: 'bg-violet-50 border-violet-200',
  },
  {
    key: 'integrity',
    label: 'Integrity',
    emoji: '🛡️',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  {
    key: 'customer_focus',
    label: 'Customer Focus',
    emoji: '🎯',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
  },
  {
    key: 'teamwork',
    label: 'Teamwork',
    emoji: '🤝',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  {
    key: 'excellence',
    label: 'Excellence',
    emoji: '⭐',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
];

const BADGES: BadgeOption[] = [
  { id: 'badge-001', name: 'Team Player', emoji: '🏆', description: 'Outstanding collaboration' },
  { id: 'badge-002', name: 'Innovator', emoji: '🚀', description: 'Creative problem solver' },
  { id: 'badge-003', name: 'Mentor', emoji: '🎓', description: 'Exceptional knowledge sharing' },
  { id: 'badge-004', name: 'Customer Hero', emoji: '🦸', description: 'Above-and-beyond service' },
  { id: 'badge-005', name: 'Rising Star', emoji: '⭐', description: 'Outstanding new talent' },
  {
    id: 'badge-006',
    name: 'Problem Solver',
    emoji: '🧩',
    description: 'Complex challenge champion',
  },
  {
    id: 'badge-007',
    name: 'Culture Champion',
    emoji: '🎉',
    description: 'Embodies company values',
  },
  { id: 'badge-008', name: 'Leadership Star', emoji: '👑', description: 'Exceptional leadership' },
];

const MAX_CHARS = 500;
const POINTS_OPTIONS = [25, 50, 100, 200, 500];

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({ initials, size = 'sm' }: { initials: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];
  const colorIdx = initials.charCodeAt(0) % colors.length;
  return (
    <div
      className={`${sizeClasses[size]} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function GiveRecognitionForm({ onClose, onSubmit }: GiveRecognitionFormProps) {
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');
  const [search, setSearch] = useState('');
  const [recipients, setRecipients] = useState<Employee[]>([]);
  const [message, setMessage] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [points, setPoints] = useState(50);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const filteredEmployees = MOCK_EMPLOYEES.filter(
    (emp) =>
      !recipients.some((r) => r.id === emp.id) &&
      (search === '' ||
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.department.toLowerCase().includes(search.toLowerCase()))
  );

  const addRecipient = (emp: Employee) => {
    setRecipients((prev) => [...prev, emp]);
    setSearch('');
  };

  const removeRecipient = (id: string) => setRecipients((prev) => prev.filter((r) => r.id !== id));

  const toggleValue = (key: string) => {
    setSelectedValues((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  };

  const canSubmit =
    recipients.length > 0 && message.trim().length >= 10 && selectedValues.length > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    onSubmit?.({
      recipients,
      message,
      values: selectedValues,
      badgeId: selectedBadge,
      points,
      isPublic,
    });
    setSubmitting(false);
    setStep('success');
  };

  const _selectedBadgeObj = BADGES.find((b) => b.id === selectedBadge);

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Recognition Sent!</h2>
        <p className="text-slate-500 text-sm mb-1">
          You recognized <strong>{recipients.map((r) => r.name).join(', ')}</strong>
        </p>
        <p className="text-slate-400 text-xs mb-6">
          {points} points awarded · Shared {isPublic ? 'publicly' : 'privately'}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (step === 'preview') {
    const badge = BADGES.find((b) => b.id === selectedBadge);
    return (
      <div className="space-y-5 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">Preview Recognition</h2>
          <button onClick={() => setStep('form')} className="text-sm text-blue-600 hover:underline">
            Edit
          </button>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {recipients.map((r) => (
                <Avatar key={r.id} initials={r.avatar} size="sm" />
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold">You</span>
              <span className="text-white/60"> recognized </span>
              <span className="font-semibold">{recipients.map((r) => r.name).join(' & ')}</span>
            </div>
          </div>
          <p className="text-white/90 text-sm leading-relaxed mb-4">&ldquo;{message}&rdquo;</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedValues.map((v) => {
              const val = COMPANY_VALUES.find((cv) => cv.key === v);
              return val ? (
                <span key={v} className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {val.emoji} {val.label}
                </span>
              ) : null;
            })}
          </div>
          {badge && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 mb-3">
              <span className="text-3xl">{badge.emoji}</span>
              <div>
                <div className="font-semibold text-sm">{badge.name}</div>
                <div className="text-white/60 text-xs">{badge.description}</div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{points} points</span>
            <span>{isPublic ? '🌐 Public' : '🔒 Private'}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('form')}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Recognition
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 max-h-[80vh] overflow-y-auto">
      <h2 className="font-bold text-slate-800 text-lg">Give Recognition</h2>

      {/* Recipient selector */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          Who are you recognizing? *
        </label>
        {recipients.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {recipients.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1 text-sm"
              >
                <Avatar initials={r.avatar} size="sm" />
                <span className="font-medium">{r.name}</span>
                <button
                  onClick={() => removeRecipient(r.id)}
                  className="ml-0.5 text-blue-400 hover:text-blue-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {search && (
          <div className="mt-1 border border-slate-200 rounded-lg shadow-sm overflow-hidden max-h-44 overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="py-4 text-center text-sm text-slate-400">No employees found</div>
            ) : (
              filteredEmployees.slice(0, 6).map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => addRecipient(emp)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <Avatar initials={emp.avatar} size="sm" />
                  <div>
                    <div className="text-sm font-medium text-slate-800">{emp.name}</div>
                    <div className="text-xs text-slate-400">
                      {emp.role} · {emp.department}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Company values */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          Company Values *
        </label>
        <div className="flex flex-wrap gap-2">
          {COMPANY_VALUES.map((val) => (
            <button
              key={val.key}
              onClick={() => toggleValue(val.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                selectedValues.includes(val.key)
                  ? `${val.bg} ${val.color} border-current shadow-sm`
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{val.emoji}</span>
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge selector */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          Badge (optional)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(selectedBadge === badge.id ? null : badge.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                selectedBadge === badge.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl">{badge.emoji}</span>
              <span className="text-[10px] text-slate-600 text-center leading-tight">
                {badge.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Points */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          Points to Award
        </label>
        <div className="flex gap-2 flex-wrap">
          {POINTS_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPoints(p)}
              className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                points === p
                  ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Star
                className={`w-3 h-3 inline mr-1 ${points === p ? 'text-amber-500' : 'text-slate-400'}`}
              />
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
          Recognition Message * <span className="text-slate-300 font-normal">(min 10 chars)</span>
        </label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Share why you're recognizing this person and the impact they made..."
          className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end mt-1 text-xs text-slate-400">
          {message.length} / {MAX_CHARS}
        </div>
      </div>

      {/* Public/Private toggle */}
      <div className="flex items-center justify-between py-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {isPublic ? (
            <Eye className="w-4 h-4 text-blue-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400" />
          )}
          <div>
            <div className="text-sm font-medium text-slate-700">
              {isPublic ? 'Public' : 'Private'}
            </div>
            <div className="text-xs text-slate-400">
              {isPublic
                ? 'Visible to all employees on the Recognition Wall'
                : 'Only visible to the recipient'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsPublic((v) => !v)}
          className={`w-11 h-6 rounded-full transition-colors flex items-center ${isPublic ? 'bg-blue-600' : 'bg-slate-200'}`}
        >
          <span
            className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep('preview')}
          disabled={!canSubmit}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview &amp; Send
        </button>
      </div>
    </div>
  );
}
