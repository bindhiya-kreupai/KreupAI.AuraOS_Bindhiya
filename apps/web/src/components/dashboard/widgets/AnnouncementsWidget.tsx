"use client";

import React from 'react';
import { Megaphone, ChevronRight } from 'lucide-react';

const announcements = [
  { id: '1', title: 'Open Enrollment Period Begins', date: 'Jan 15', priority: 'high', category: 'Benefits' },
  { id: '2', title: 'Office Closed - Republic Day', date: 'Jan 26', priority: 'medium', category: 'Holiday' },
  { id: '3', title: 'New WFH Policy Update', date: 'Jan 12', priority: 'low', category: 'Policy' },
];

export function AnnouncementsWidget() {
  return (
    <div className="space-y-2">
      {announcements.map((announcement) => (
        <div key={announcement.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors cursor-pointer group">
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${
            announcement.priority === 'high' ? 'bg-coral-alert/10 text-coral-alert' :
            announcement.priority === 'medium' ? 'bg-sunset-amber/10 text-sunset-amber' :
            'bg-celestial-indigo/10 text-celestial-indigo'
          }`}>
            <Megaphone className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">{announcement.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-silver-mist">{announcement.date}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-silver-mist">{announcement.category}</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </div>
      ))}
    </div>
  );
}
