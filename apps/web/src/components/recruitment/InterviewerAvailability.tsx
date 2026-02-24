/**
 * @module InterviewerAvailability
 * @description Interviewer availability grid showing each panelist's schedule,
 *              calendar integration status, and daily interview load
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  User,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Search,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface InterviewerSlot {
  date: string; // YYYY-MM-DD
  hour: number;
  available: boolean;
  reason?: string; // e.g. "In meeting", "On leave"
}

export interface InterviewerData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  skills: string[];
  interviewsToday: number;
  maxInterviewsPerDay: number;
  calendarConnected: boolean;
  calendarProvider?: 'google' | 'outlook';
  timezone: string;
  slots: InterviewerSlot[];
}

interface InterviewerAvailabilityProps {
  interviewers: InterviewerData[];
  selectedDate: string;
  selectedHour: number | null;
  selectedInterviewerIds: string[];
  onToggleInterviewer: (id: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

const formatHour = (h: number): string => {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}${ampm}`;
};

const CALENDAR_CONFIG: Record<string, { label: string; color: string }> = {
  google: { label: 'Google Calendar', color: 'text-neural-mint' },
  outlook: { label: 'Outlook Calendar', color: 'text-celestial-indigo' },
};

// ── Component ────────────────────────────────────────────────────────────────────

export const InterviewerAvailability: React.FC<InterviewerAvailabilityProps> = ({
  interviewers,
  selectedDate,
  selectedHour,
  selectedInterviewerIds,
  onToggleInterviewer,
}) => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return interviewers;
    const q = search.toLowerCase();
    return interviewers.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.role.toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q) ||
        i.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [interviewers, search]);

  const selectedDateLabel = useMemo(() => {
    const d = new Date(selectedDate);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, [selectedDate]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <User className="w-4 h-4 text-celestial-indigo" />
          Interviewer Availability
          <span className="text-[9px] font-normal text-silver-mist">({selectedDateLabel})</span>
        </p>
        <p className="text-[9px] text-silver-mist">{selectedInterviewerIds.length} selected</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, role, or skill..."
          className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
        />
      </div>

      {/* Interviewer List */}
      <div className="space-y-1.5">
        {filtered.map((interviewer) => {
          const isSelected = selectedInterviewerIds.includes(interviewer.id);
          const isExpanded = expandedId === interviewer.id;
          const daySlots = interviewer.slots.filter((s) => s.date === selectedDate);
          const availableSlots = daySlots.filter((s) => s.available);
          const isAvailableAtSelected =
            selectedHour !== null
              ? daySlots.some((s) => s.hour === selectedHour && s.available)
              : availableSlots.length > 0;
          const loadPct =
            interviewer.maxInterviewsPerDay > 0
              ? Math.round((interviewer.interviewsToday / interviewer.maxInterviewsPerDay) * 100)
              : 0;

          return (
            <div
              key={interviewer.id}
              className={`rounded-xl border transition-all ${
                isSelected
                  ? 'border-celestial-indigo bg-celestial-indigo/5'
                  : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
            >
              {/* Main Row */}
              <div className="flex items-center gap-2 p-2.5">
                {/* Checkbox */}
                <button
                  onClick={() => onToggleInterviewer(interviewer.id)}
                  disabled={!isAvailableAtSelected && !isSelected}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-celestial-indigo border-celestial-indigo'
                      : isAvailableAtSelected
                        ? 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo'
                        : 'border-cloud/50 dark:border-nebula-purple/10 opacity-40 cursor-not-allowed'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>

                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[9px] font-bold text-celestial-indigo shrink-0">
                  {interviewer.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-ink-black dark:text-pearl truncate">
                      {interviewer.name}
                    </span>
                    {interviewer.calendarConnected ? (
                      <Wifi
                        className={`w-3 h-3 ${
                          interviewer.calendarProvider
                            ? CALENDAR_CONFIG[interviewer.calendarProvider]?.color ||
                              'text-neural-mint'
                            : 'text-neural-mint'
                        }`}
                      />
                    ) : (
                      <WifiOff className="w-3 h-3 text-silver-mist/40" />
                    )}
                  </div>
                  <p className="text-[9px] text-silver-mist">
                    {interviewer.role} · {interviewer.department}
                  </p>
                </div>

                {/* Availability indicator */}
                <div className="text-center shrink-0">
                  <p
                    className={`text-[10px] font-bold ${
                      isAvailableAtSelected ? 'text-neural-mint' : 'text-coral-alert'
                    }`}
                  >
                    {availableSlots.length}/{daySlots.length}
                  </p>
                  <p className="text-[7px] text-silver-mist">slots</p>
                </div>

                {/* Load */}
                <div className="w-14 shrink-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[8px] text-silver-mist">Load</span>
                    <span
                      className={`text-[8px] font-bold ${
                        loadPct >= 80
                          ? 'text-coral-alert'
                          : loadPct >= 50
                            ? 'text-sunset-amber'
                            : 'text-neural-mint'
                      }`}
                    >
                      {interviewer.interviewsToday}/{interviewer.maxInterviewsPerDay}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-pearl dark:bg-deep-cosmos/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        loadPct >= 80
                          ? 'bg-coral-alert'
                          : loadPct >= 50
                            ? 'bg-sunset-amber'
                            : 'bg-neural-mint'
                      }`}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                </div>

                {/* Expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : interviewer.id)}
                  className="p-1 text-silver-mist hover:text-ink-black dark:hover:text-pearl"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Expanded: Day Schedule + Skills */}
              {isExpanded && (
                <div className="px-2.5 pb-2.5 border-t border-cloud/50 dark:border-nebula-purple/10 pt-2 space-y-2">
                  {/* Hour-by-hour availability */}
                  <div>
                    <p className="text-[9px] font-bold text-silver-mist uppercase tracking-wider mb-1">
                      Schedule — {selectedDateLabel}
                    </p>
                    <div className="flex gap-0.5">
                      {HOURS.map((hour) => {
                        const slot = daySlots.find((s) => s.hour === hour);
                        const isAvail = slot?.available ?? false;
                        const isSelectedHour = hour === selectedHour;
                        return (
                          <div
                            key={hour}
                            className={`flex-1 py-1 rounded text-center text-[8px] font-semibold border ${
                              isSelectedHour && isAvail
                                ? 'bg-celestial-indigo/20 border-celestial-indigo text-celestial-indigo'
                                : isAvail
                                  ? 'bg-neural-mint/10 border-neural-mint/20 text-neural-mint'
                                  : 'bg-coral-alert/5 border-coral-alert/10 text-coral-alert'
                            }`}
                            title={slot?.reason || (isAvail ? 'Available' : 'Busy')}
                          >
                            {formatHour(hour)}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-[9px] font-bold text-silver-mist uppercase tracking-wider mb-1">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {interviewer.skills.map((s, i) => (
                        <span
                          key={i}
                          className="text-[8px] px-1.5 py-0.5 rounded-full border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl bg-pearl/20 dark:bg-deep-cosmos/10"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Calendar Status */}
                  <div className="flex items-center gap-2 text-[9px]">
                    {interviewer.calendarConnected && interviewer.calendarProvider ? (
                      <>
                        <CheckCircle2
                          className={`w-3 h-3 ${CALENDAR_CONFIG[interviewer.calendarProvider]?.color}`}
                        />
                        <span className="text-silver-mist">
                          Connected to {CALENDAR_CONFIG[interviewer.calendarProvider]?.label}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-sunset-amber" />
                        <span className="text-sunset-amber">
                          Calendar not connected — availability is manual
                        </span>
                      </>
                    )}
                    <span className="text-silver-mist ml-auto">{interviewer.timezone}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-6">
            <User className="w-6 h-6 text-silver-mist/20 mx-auto mb-2" />
            <p className="text-[10px] text-silver-mist">No interviewers match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewerAvailability;
