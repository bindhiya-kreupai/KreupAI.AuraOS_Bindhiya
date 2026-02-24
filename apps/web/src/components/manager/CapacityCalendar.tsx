/**
 * @module CapacityCalendar
 * @description Visual calendar showing team availability, leave, and capacity by day
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users, Palmtree, AlertTriangle } from 'lucide-react';
import type { TeamMemberCapacity } from './CapacityBar';

interface CapacityCalendarProps {
  members: TeamMemberCapacity[];
}

interface DayLeaveInfo {
  memberId: string;
  memberName: string;
  type: 'full' | 'half';
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  availableCount: number;
  totalCount: number;
  onLeave: DayLeaveInfo[];
  utilization: number;
}

// Simulated leave schedule for the team (next 30 days)
function generateLeaveSchedule(
  members: TeamMemberCapacity[],
  year: number,
  month: number
): Record<string, DayLeaveInfo[]> {
  const schedule: Record<string, DayLeaveInfo[]> = {};

  // Generate deterministic leave based on member data
  members.forEach((member) => {
    if (member.upcomingLeaveDays > 0) {
      // Distribute leave days across the month
      const seed = member.id.charCodeAt(member.id.length - 1);
      const startDay = (seed % 20) + 1;
      for (let i = 0; i < Math.min(member.upcomingLeaveDays, 5); i++) {
        const day = ((startDay + i * 3) % 28) + 1;
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (!schedule[dateKey]) schedule[dateKey] = [];
        schedule[dateKey].push({
          memberId: member.id,
          memberName: member.name,
          type: i === 0 && member.currentStatus === 'half_day' ? 'half' : 'full',
        });
      }
    }

    // Current leave
    if (member.onLeaveToday) {
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (!schedule[dateKey]) schedule[dateKey] = [];
      if (!schedule[dateKey].some((l) => l.memberId === member.id)) {
        schedule[dateKey].push({
          memberId: member.id,
          memberName: member.name,
          type: 'full',
        });
      }
    }
  });

  return schedule;
}

export const CapacityCalendar: React.FC<CapacityCalendarProps> = ({ members }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const prevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }, [currentMonth]);

  const leaveSchedule = useMemo(
    () => generateLeaveSchedule(members, currentYear, currentMonth),
    [members, currentYear, currentMonth]
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startOffset = firstDay.getDay(); // 0=Sun

    const days: CalendarDay[] = [];

    // Previous month fill
    const prevMonthLast = new Date(currentYear, currentMonth, 0);
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLast.getDate() - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        availableCount: members.length,
        totalCount: members.length,
        onLeave: [],
        utilization: 0,
      });
    }

    // Current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayLeave = leaveSchedule[dateKey] || [];
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const available = members.length - dayLeave.filter((l) => l.type === 'full').length;
      const avgUtil = isWeekend
        ? 0
        : Math.round(
            (members.reduce((s, m) => s + m.utilization, 0) / members.length) *
              (available / members.length)
          );

      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: d.toDateString() === today.toDateString(),
        isWeekend,
        availableCount: isWeekend ? 0 : available,
        totalCount: members.length,
        onLeave: dayLeave,
        utilization: avgUtil,
      });
    }

    // Next month fill
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        availableCount: members.length,
        totalCount: members.length,
        onLeave: [],
        utilization: 0,
      });
    }

    return days;
  }, [currentYear, currentMonth, members, leaveSchedule, today]);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Capacity coverage color
  function getCoverageColor(available: number, total: number, isWeekend: boolean): string {
    if (isWeekend) return 'bg-pearl/30 dark:bg-deep-cosmos/10';
    const ratio = total > 0 ? available / total : 1;
    if (ratio >= 0.8) return 'bg-neural-mint/10';
    if (ratio >= 0.6) return 'bg-celestial-indigo/10';
    if (ratio >= 0.4) return 'bg-sunset-amber/10';
    return 'bg-coral-alert/10';
  }

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Calendar className="w-4 h-4 text-celestial-indigo" />
          Team Availability Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-silver-mist" />
          </button>
          <span className="text-xs font-semibold text-ink-black dark:text-pearl min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-silver-mist" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[9px] text-silver-mist">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-neural-mint/20 border border-neural-mint/30 inline-block" />{' '}
          Full team
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-celestial-indigo/20 border border-celestial-indigo/30 inline-block" />{' '}
          60-80%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-sunset-amber/20 border border-sunset-amber/30 inline-block" />{' '}
          40-60%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-coral-alert/20 border border-coral-alert/30 inline-block" />{' '}
          &lt;40%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-pearl/40 border border-cloud inline-block" /> Weekend
        </span>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-pearl/50 dark:bg-deep-cosmos/20">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-1 py-2 text-center text-[10px] font-semibold text-silver-mist"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const isSelected = selectedDay?.date.toDateString() === day.date.toDateString();
            return (
              <button
                key={idx}
                onClick={() =>
                  day.isCurrentMonth && !day.isWeekend
                    ? setSelectedDay(isSelected ? null : day)
                    : null
                }
                className={`relative p-1.5 min-h-[56px] border-r border-b border-cloud/50 dark:border-nebula-purple/10 transition-colors ${getCoverageColor(
                  day.availableCount,
                  day.totalCount,
                  day.isWeekend
                )} ${!day.isCurrentMonth ? 'opacity-30' : ''} ${
                  day.isToday ? 'ring-1 ring-inset ring-celestial-indigo' : ''
                } ${
                  isSelected ? 'ring-2 ring-inset ring-celestial-indigo bg-celestial-indigo/10' : ''
                } ${
                  day.isCurrentMonth && !day.isWeekend
                    ? 'cursor-pointer hover:ring-1 hover:ring-inset hover:ring-celestial-indigo/40'
                    : 'cursor-default'
                }`}
              >
                <span
                  className={`text-[10px] font-semibold ${
                    day.isToday
                      ? 'text-celestial-indigo'
                      : day.isWeekend
                        ? 'text-silver-mist/40'
                        : 'text-ink-black dark:text-pearl'
                  }`}
                >
                  {day.date.getDate()}
                </span>

                {day.isCurrentMonth && !day.isWeekend && (
                  <div className="mt-0.5">
                    <p className="text-[8px] text-silver-mist">
                      {day.availableCount}/{day.totalCount}
                    </p>
                    {day.onLeave.length > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Palmtree className="w-2 h-2 text-sunset-amber" />
                        <span className="text-[7px] text-sunset-amber font-semibold">
                          {day.onLeave.length}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="rounded-xl border border-celestial-indigo/30 bg-celestial-indigo/5 dark:bg-celestial-indigo/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-ink-black dark:text-pearl">
              {selectedDay.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
            <span className="text-[10px] text-silver-mist">
              {selectedDay.availableCount} of {selectedDay.totalCount} available
            </span>
          </div>

          {selectedDay.onLeave.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[10px] text-sunset-amber font-semibold flex items-center gap-1">
                <Palmtree className="w-3 h-3" /> On Leave ({selectedDay.onLeave.length})
              </p>
              {selectedDay.onLeave.map((leave, i) => (
                <div key={i} className="flex items-center gap-2 pl-4">
                  <div className="w-5 h-5 rounded-full bg-sunset-amber/10 flex items-center justify-center text-[8px] font-bold text-sunset-amber">
                    {leave.memberName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <span className="text-[11px] text-ink-black dark:text-pearl">
                    {leave.memberName}
                  </span>
                  <span className="text-[9px] text-silver-mist capitalize">({leave.type} day)</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-neural-mint">
              <Users className="w-3 h-3" />
              Full team available
            </div>
          )}

          {selectedDay.availableCount < selectedDay.totalCount * 0.5 && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-coral-alert/10 border border-coral-alert/20">
              <AlertTriangle className="w-3 h-3 text-coral-alert shrink-0" />
              <p className="text-[10px] text-coral-alert">
                Low team coverage — consider rescheduling non-critical activities.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CapacityCalendar;
