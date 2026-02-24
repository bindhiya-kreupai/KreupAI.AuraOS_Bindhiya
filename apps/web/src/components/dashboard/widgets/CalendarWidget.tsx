/**
 * @module CalendarWidget
 * @description Upcoming events mini-calendar widget
 * @project AURA HCM Platform
 */

'use client';

import React, { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'deadline' | 'holiday' | 'event';
  date: string;
}

export const CalendarWidget: React.FC = () => {
  const today = new Date();
  const currentMonth = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const currentDay = today.getDate();

  // Generate mini calendar grid for current month
  const calendarDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [today]);

  // Mock events
  const upcomingEvents: CalendarEvent[] = [
    { id: '1', title: 'Team Standup', time: '10:00 AM', type: 'meeting', date: 'Today' },
    { id: '2', title: 'Sprint Planning', time: '2:00 PM', type: 'meeting', date: 'Today' },
    { id: '3', title: 'Payroll Deadline', time: 'EOD', type: 'deadline', date: 'Tomorrow' },
    { id: '4', title: 'Company Town Hall', time: '4:00 PM', type: 'event', date: 'Feb 28' },
  ];

  const eventDays = [currentDay, currentDay + 1, currentDay + 4]; // Mock event days

  const typeColors: Record<string, string> = {
    meeting: 'bg-celestial-indigo/10 text-celestial-indigo border-l-celestial-indigo',
    deadline: 'bg-quantum-rose/10 text-quantum-rose border-l-quantum-rose',
    holiday: 'bg-neural-mint/10 text-neural-mint border-l-neural-mint',
    event: 'bg-sunset-amber/10 text-sunset-amber border-l-sunset-amber',
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
        <Calendar className="w-4 h-4 text-neural-mint" />
        Calendar
      </h3>

      {/* Mini Calendar Grid */}
      <div className="bg-pearl/30 dark:bg-deep-cosmos/30 rounded-lg p-2">
        <p className="text-[10px] font-semibold text-ink-black dark:text-pearl text-center mb-1.5">
          {currentMonth}
        </p>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <span key={i} className="text-[9px] font-medium text-silver-mist">
              {day}
            </span>
          ))}
          {calendarDays.map((day, i) => (
            <span
              key={i}
              className={`text-[9px] w-5 h-5 flex items-center justify-center rounded-full ${
                day === null
                  ? ''
                  : day === currentDay
                    ? 'bg-celestial-indigo text-white font-bold'
                    : eventDays.includes(day)
                      ? 'bg-celestial-indigo/10 text-celestial-indigo font-medium'
                      : 'text-ink-black dark:text-pearl'
              }`}
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
          Upcoming
        </p>
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className={`pl-2 border-l-2 py-1.5 px-2 rounded-r-lg ${typeColors[event.type]}`}
          >
            <p className="text-xs font-medium truncate">{event.title}</p>
            <div className="flex items-center gap-1.5 text-[10px] opacity-75">
              <Clock className="w-2.5 h-2.5" />
              {event.time} · {event.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
