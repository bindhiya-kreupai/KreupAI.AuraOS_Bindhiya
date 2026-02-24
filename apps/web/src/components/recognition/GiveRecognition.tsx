/**
 * @module GiveRecognition
 * @description Give kudos form — pick recipient, select core values, choose
 *              points amount, write message, optional badge and anonymous mode
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Send, User, Sparkles, Zap, Trophy, EyeOff, X } from 'lucide-react';
import type { CoreValueKey } from './RecognitionWall';
import { CORE_VALUES } from './RecognitionWall';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface RecognitionFormData {
  recipientId: string;
  recipientName: string;
  message: string;
  coreValues: CoreValueKey[];
  pointsAmount: number;
  badgeName?: string;
  isAnonymous: boolean;
}

interface GiveRecognitionProps {
  onSubmit: (data: RecognitionFormData) => void;
  isSaving?: boolean;
  onCancel?: () => void;
  pointsBalance?: number;
}

// ── Config ───────────────────────────────────────────────────────────────────────

const POINTS_OPTIONS = [50, 100, 250, 500, 750, 1000];

const BADGE_OPTIONS = [
  { name: 'Team Player', icon: '🤝' },
  { name: 'Innovation Champion', icon: '💡' },
  { name: 'Customer Hero', icon: '🦸' },
  { name: 'Quality Star', icon: '⭐' },
  { name: 'Culture Champion', icon: '🏆' },
];

const MOCK_TEAM = [
  { id: 'emp-201', name: 'Michael Torres', role: 'Engineering Manager', dept: 'Engineering' },
  { id: 'emp-202', name: 'Lisa Park', role: 'Tech Lead', dept: 'Engineering' },
  { id: 'emp-203', name: 'Anika Shah', role: 'Product Designer', dept: 'Design' },
  { id: 'emp-204', name: 'Jordan Lee', role: 'QA Engineer', dept: 'Engineering' },
  { id: 'emp-205', name: 'Rachel Green', role: 'DevOps Engineer', dept: 'Engineering' },
  { id: 'emp-206', name: 'Carlos Rivera', role: 'Product Manager', dept: 'Product' },
  { id: 'emp-207', name: 'Sarah Chen', role: 'Software Engineer', dept: 'Engineering' },
  { id: 'emp-208', name: 'David Kim', role: 'Solutions Architect', dept: 'Engineering' },
  { id: 'emp-209', name: 'Elena Rodriguez', role: 'VP of Sales', dept: 'Sales' },
  { id: 'emp-210', name: 'Priya Patel', role: 'UX Researcher', dept: 'Design' },
];

// ── Component ────────────────────────────────────────────────────────────────────

export const GiveRecognition: React.FC<GiveRecognitionProps> = ({
  onSubmit,
  isSaving = false,
  onCancel,
  pointsBalance = 2500,
}) => {
  const [recipientId, setRecipientId] = useState('');
  const [message, setMessage] = useState('');
  const [selectedValues, setSelectedValues] = useState<CoreValueKey[]>([]);
  const [points, setPoints] = useState(100);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const recipient = MOCK_TEAM.find((m) => m.id === recipientId);
  const isValid = recipientId && message.trim().length >= 10 && selectedValues.length > 0;

  const handleSubmit = useCallback(() => {
    if (!isValid || !recipient) return;
    onSubmit({
      recipientId,
      recipientName: recipient.name,
      message: message.trim(),
      coreValues: selectedValues,
      pointsAmount: points,
      badgeName: selectedBadge || undefined,
      isAnonymous,
    });
    setMessage('');
    setSelectedValues([]);
    setRecipientId('');
    setPoints(100);
    setSelectedBadge(null);
    setIsAnonymous(false);
  }, [
    recipientId,
    message,
    selectedValues,
    points,
    selectedBadge,
    isAnonymous,
    isValid,
    recipient,
    onSubmit,
  ]);

  const toggleValue = useCallback((key: CoreValueKey) => {
    setSelectedValues((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-celestial-indigo" />
          Give Kudos
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-[8px] font-bold text-sunset-amber">
            <Zap className="w-3 h-3" /> {pointsBalance} pts available
          </span>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1 rounded-md text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Recipient */}
      <div>
        <label className="text-[9px] font-bold text-silver-mist uppercase mb-1 block">
          <User className="w-3 h-3 inline mr-0.5" /> Who are you recognizing?
        </label>
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="w-full px-3 py-2 text-[10px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
        >
          <option value="">Select a colleague...</option>
          {MOCK_TEAM.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.role} ({m.dept})
            </option>
          ))}
        </select>
      </div>

      {/* Core Values */}
      <div>
        <label className="text-[9px] font-bold text-silver-mist uppercase mb-1 block">
          Which core values did they demonstrate?
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CORE_VALUES.map((cv) => {
            const isSelected = selectedValues.includes(cv.key);
            const CvIcon = cv.icon;
            return (
              <button
                key={cv.key}
                onClick={() => toggleValue(cv.key)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold transition-colors ${
                  isSelected
                    ? `${cv.bg} ${cv.color} border-current/20`
                    : 'border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                }`}
              >
                <CvIcon className="w-3.5 h-3.5" />
                {cv.label}
                {isSelected && ' ✓'}
              </button>
            );
          })}
        </div>
        {selectedValues.length === 0 && (
          <p className="text-[7px] text-coral-alert mt-0.5">Select at least one core value</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="text-[9px] font-bold text-silver-mist uppercase mb-1 block">
          What did they do? Be specific!
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the impact of their actions..."
          rows={3}
          className="w-full px-3 py-2 text-[10px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo resize-none"
        />
        <span
          className={`text-[7px] ${message.length < 10 ? 'text-coral-alert' : 'text-silver-mist'}`}
        >
          {message.length < 10
            ? `${10 - message.length} more characters needed`
            : `${message.length} characters`}
        </span>
      </div>

      {/* Points */}
      <div>
        <label className="text-[9px] font-bold text-silver-mist uppercase mb-1 block">
          <Zap className="w-3 h-3 inline mr-0.5" /> Points to award
        </label>
        <div className="flex flex-wrap gap-1.5">
          {POINTS_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPoints(p)}
              disabled={p > pointsBalance}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-colors ${
                points === p
                  ? 'bg-sunset-amber/10 text-sunset-amber border-sunset-amber/30'
                  : p > pointsBalance
                    ? 'border-cloud dark:border-nebula-purple/20 text-silver-mist/40 cursor-not-allowed'
                    : 'border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              {p} pts
            </button>
          ))}
        </div>
      </div>

      {/* Badge (optional) */}
      <div>
        <label className="text-[9px] font-bold text-silver-mist uppercase mb-1 block">
          <Trophy className="w-3 h-3 inline mr-0.5" /> Award a badge (optional)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {BADGE_OPTIONS.map((b) => (
            <button
              key={b.name}
              onClick={() => setSelectedBadge(selectedBadge === b.name ? null : b.name)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold transition-colors ${
                selectedBadge === b.name
                  ? 'bg-quantum-rose/10 text-quantum-rose border-quantum-rose/30'
                  : 'border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <span>{b.icon}</span>
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Anonymous + Submit */}
      <div className="flex items-center gap-3 pt-2 border-t border-cloud dark:border-nebula-purple/10">
        <button
          onClick={() => setIsAnonymous((p) => !p)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-colors ${
            isAnonymous
              ? 'bg-celestial-indigo/10 text-celestial-indigo border-celestial-indigo/30'
              : 'border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
          }`}
        >
          <EyeOff className="w-3 h-3" />
          {isAnonymous ? 'Anonymous ✓' : 'Send anonymously'}
        </button>

        <div className="flex-1" />

        <button
          onClick={handleSubmit}
          disabled={!isValid || isSaving}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          <Send className="w-3.5 h-3.5" />
          {isSaving ? 'Sending...' : 'Send Kudos'}
        </button>
      </div>
    </div>
  );
};

export default GiveRecognition;
