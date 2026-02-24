/**
 * @module CalendarSlotPicker
 * @description Weekly time-slot grid for selecting interview slots with
 *              availability overlay, calendar provider indicators, and slot scoring
 * @project AURA HCM Platform
 */

'use client';

import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Star,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface SlotData {
  id: string;
  date: string; // YYYY-MM-DD
  hour: number; // 0–23
  minute: number;
  available: boolean;
  score: number; // 0–100 recommendation score
  interviewerCount: number;
  conflicts: string[];
  calendarSource?: 'google' | 'outlook' | 'manual';
}

interface CalendarSlotPickerProps {
  slots: SlotData[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: SlotData) => void;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  duration: number; // minutes
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // 9 AM – 5 PM
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const formatHour = (h: number): string => {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr} ${ampm}`;
};

const getWeekDates = (
  offset: number
): { date: string; dayName: string; dayNum: number; isToday: boolean }[] => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);

  return DAY_NAMES.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === now.toISOString().split('T')[0];
    return { date: dateStr, dayName: name, dayNum: d.getDate(), isToday };
  });
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'bg-neural-mint/20 border-neural-mint/40 hover:bg-neural-mint/30';
  if (score >= 60)
    return 'bg-celestial-indigo/10 border-celestial-indigo/30 hover:bg-celestial-indigo/20';
  if (score >= 40) return 'bg-sunset-amber/10 border-sunset-amber/30 hover:bg-sunset-amber/20';
  return 'bg-pearl/50 dark:bg-deep-cosmos/20 border-cloud dark:border-nebula-purple/20 hover:bg-pearl dark:hover:bg-deep-cosmos/30';
};

const CALENDAR_ICONS: Record<string, { label: string; color: string }> = {
  google: { label: 'Google', color: 'text-neural-mint' },
  outlook: { label: 'Outlook', color: 'text-celestial-indigo' },
  manual: { label: 'Manual', color: 'text-silver-mist' },
};

// ── Component ────────────────────────────────────────────────────────────────────

export const CalendarSlotPicker: React.FC<CalendarSlotPickerProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  weekOffset,
  onWeekChange,
  duration,
}) => {
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const slotMap = useMemo(() => {
    const map: Record<string, SlotData> = {};
    slots.forEach((s) => {
      map[`${s.date}-${s.hour}`] = s;
    });
    return map;
  }, [slots]);

  const weekLabel = useMemo(() => {
    if (weekDates.length === 0) return '';
    const first = new Date(weekDates[0].date);
    const last = new Date(weekDates[weekDates.length - 1].date);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${first.toLocaleDateString('en-US', opts)} – ${last.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
  }, [weekDates]);

  return (
    <div className="space-y-3">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onWeekChange(weekOffset - 1)}
            className="p-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/10 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-silver-mist" />
          </button>
          <span className="text-[11px] font-bold text-ink-black dark:text-pearl min-w-[160px] text-center">
            {weekLabel}
          </span>
          <button
            onClick={() => onWeekChange(weekOffset + 1)}
            className="p-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/10 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-silver-mist" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-[9px] text-silver-mist">
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded bg-neural-mint/30 border border-neural-mint/50" /> Best
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded bg-celestial-indigo/20 border border-celestial-indigo/40" />{' '}
            Good
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded bg-sunset-amber/20 border border-sunset-amber/40" />{' '}
            Fair
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 rounded bg-pearl/50 border border-cloud" /> Low
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[50px_repeat(5,1fr)] gap-1 mb-1">
            <div /> {/* Time column spacer */}
            {weekDates.map((day) => (
              <div
                key={day.date}
                className={`text-center py-1.5 rounded-lg ${
                  day.isToday ? 'bg-celestial-indigo/10 border border-celestial-indigo/20' : ''
                }`}
              >
                <p className="text-[9px] font-bold text-silver-mist">{day.dayName}</p>
                <p
                  className={`text-sm font-bold ${day.isToday ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}
                >
                  {day.dayNum}
                </p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[50px_repeat(5,1fr)] gap-1 mb-1">
              {/* Time Label */}
              <div className="flex items-center justify-end pr-2">
                <span className="text-[9px] font-semibold text-silver-mist">
                  {formatHour(hour)}
                </span>
              </div>

              {/* Slots */}
              {weekDates.map((day) => {
                const slot = slotMap[`${day.date}-${hour}`];
                if (!slot) {
                  return (
                    <div
                      key={`${day.date}-${hour}`}
                      className="h-10 rounded-lg border border-dashed border-cloud/50 dark:border-nebula-purple/10 bg-pearl/10 dark:bg-deep-cosmos/5"
                    />
                  );
                }

                const isSelected = slot.id === selectedSlotId;
                const isAvailable = slot.available;

                return (
                  <button
                    key={slot.id}
                    disabled={!isAvailable}
                    onClick={() => onSelectSlot(slot)}
                    className={`h-10 rounded-lg border text-left px-1.5 transition-all ${
                      isSelected
                        ? 'border-celestial-indigo bg-celestial-indigo/15 ring-1 ring-celestial-indigo/30 shadow-sm'
                        : isAvailable
                          ? getScoreColor(slot.score)
                          : 'bg-coral-alert/5 border-coral-alert/10 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="min-w-0">
                        {isAvailable ? (
                          <>
                            <p className="text-[8px] font-semibold text-ink-black dark:text-pearl truncate">
                              {slot.interviewerCount} available
                            </p>
                            {slot.calendarSource && (
                              <p
                                className={`text-[7px] ${CALENDAR_ICONS[slot.calendarSource]?.color || 'text-silver-mist'}`}
                              >
                                {CALENDAR_ICONS[slot.calendarSource]?.label}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-[8px] text-coral-alert">Unavailable</p>
                        )}
                      </div>
                      {isAvailable && slot.score >= 80 && (
                        <Star className="w-2.5 h-2.5 text-neural-mint shrink-0" />
                      )}
                      {isSelected && (
                        <CheckCircle2 className="w-3 h-3 text-celestial-indigo shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Slot Detail */}
      {selectedSlotId &&
        (() => {
          const sel = slots.find((s) => s.id === selectedSlotId);
          if (!sel) return null;
          const d = new Date(sel.date);
          return (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-celestial-indigo/20 bg-celestial-indigo/5">
              <Calendar className="w-4 h-4 text-celestial-indigo" />
              <div className="flex-1">
                <p className="text-[11px] font-bold text-ink-black dark:text-pearl">
                  {d.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  at {formatHour(sel.hour)}
                </p>
                <p className="text-[9px] text-silver-mist">
                  {duration} min · {sel.interviewerCount} interviewer
                  {sel.interviewerCount !== 1 ? 's' : ''} available · Score: {sel.score}%
                </p>
              </div>
              {sel.conflicts.length > 0 && (
                <div className="flex items-center gap-1 text-[9px] text-sunset-amber">
                  <AlertTriangle className="w-3 h-3" />
                  {sel.conflicts.length} conflict{sel.conflicts.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })()}
    </div>
  );
};

export default CalendarSlotPicker;
