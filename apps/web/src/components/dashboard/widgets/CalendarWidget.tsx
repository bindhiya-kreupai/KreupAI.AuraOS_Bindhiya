"use client";

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const upcomingEvents = [
  { id: '1', title: 'Team Standup', time: '10:00 AM', type: 'meeting' },
  { id: '2', title: 'Sprint Review', time: '02:00 PM', type: 'meeting' },
  { id: '3', title: 'Training: Compliance', time: '04:00 PM', type: 'training' },
];

export function CalendarWidget() {
  const today = new Date();
  const dayName = today.toLocaleDateString([], { weekday: 'short' });
  const dayNum = today.getDate();
  const month = today.toLocaleDateString([], { month: 'short' });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-celestial-indigo/10 rounded-lg flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium text-celestial-indigo uppercase">{dayName}</span>
          <span className="text-lg font-bold text-celestial-indigo leading-none">{dayNum}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-ink-black dark:text-pearl">{month} {dayNum}</p>
          <p className="text-xs text-silver-mist">{upcomingEvents.length} events today</p>
        </div>
      </div>
      <div className="space-y-2">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
            <div className={`w-1 h-8 rounded-full ${event.type === 'meeting' ? 'bg-celestial-indigo' : 'bg-neural-mint'}`} />
            <div className="flex-1">
              <p className="text-xs font-medium text-ink-black dark:text-pearl">{event.title}</p>
              <div className="flex items-center gap-1 text-[10px] text-silver-mist">
                <Clock className="w-2.5 h-2.5" /> {event.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
