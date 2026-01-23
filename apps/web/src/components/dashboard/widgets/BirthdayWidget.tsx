"use client";

import React from 'react';
import { Cake, Award } from 'lucide-react';

const celebrations = [
  { name: 'Sarah Johnson', type: 'birthday', date: 'Today', avatar: 'SJ' },
  { name: 'Mike Chen', type: 'anniversary', years: 5, date: 'Tomorrow', avatar: 'MC' },
  { name: 'Emily Davis', type: 'birthday', date: 'Jan 25', avatar: 'ED' },
];

export function BirthdayWidget() {
  return (
    <div className="space-y-2">
      {celebrations.map((item) => (
        <div key={item.name} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
          <div className="w-7 h-7 rounded-full bg-quantum-rose/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-quantum-rose">{item.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">{item.name}</p>
            <p className="text-[10px] text-silver-mist">{item.date}</p>
          </div>
          {item.type === 'birthday' ? (
            <Cake className="w-3.5 h-3.5 text-quantum-rose flex-shrink-0" />
          ) : (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Award className="w-3.5 h-3.5 text-sunset-amber" />
              <span className="text-[10px] font-medium text-sunset-amber">{item.years}y</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
