/**
 * @module BirthdayWidget
 * @description Birthdays & anniversaries widget
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Cake, Award } from 'lucide-react';

interface CelebrationItem {
  id: string;
  name: string;
  initials: string;
  type: 'birthday' | 'anniversary';
  detail: string;
  date: string;
}

export const BirthdayWidget: React.FC = () => {
  // Mock data – in production, fetch from employee API
  const celebrations: CelebrationItem[] = [
    {
      id: '1',
      name: 'Emily Roberts',
      initials: 'ER',
      type: 'birthday',
      detail: 'Turns 30',
      date: 'Today',
    },
    {
      id: '2',
      name: 'James Lee',
      initials: 'JL',
      type: 'anniversary',
      detail: '5 years',
      date: 'Today',
    },
    {
      id: '3',
      name: 'Priya Sharma',
      initials: 'PS',
      type: 'birthday',
      detail: 'Turns 28',
      date: 'Tomorrow',
    },
    {
      id: '4',
      name: 'Alex Turner',
      initials: 'AT',
      type: 'anniversary',
      detail: '3 years',
      date: 'Feb 27',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
        <Cake className="w-4 h-4 text-celestial-indigo" />
        Celebrations
      </h3>

      <div className="space-y-2">
        {celebrations.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 py-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                item.type === 'birthday' ? 'bg-quantum-rose/10' : 'bg-sunset-amber/10'
              }`}
            >
              {item.type === 'birthday' ? (
                <Cake className="w-3.5 h-3.5 text-quantum-rose" />
              ) : (
                <Award className="w-3.5 h-3.5 text-sunset-amber" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">
                {item.name}
              </p>
              <p className="text-[10px] text-silver-mist">
                {item.type === 'birthday' ? 'Birthday' : 'Work Anniversary'} · {item.detail}
              </p>
            </div>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                item.date === 'Today'
                  ? 'bg-neural-mint/10 text-neural-mint'
                  : 'bg-pearl dark:bg-deep-cosmos text-silver-mist'
              }`}
            >
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BirthdayWidget;
