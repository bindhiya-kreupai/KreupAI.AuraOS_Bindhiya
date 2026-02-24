/**
 * @module AnnouncementsWidget
 * @description Company announcements widget
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Megaphone, Pin } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  pinned: boolean;
  category: 'general' | 'policy' | 'event' | 'urgent';
}

export const AnnouncementsWidget: React.FC = () => {
  // Mock data – in production, fetch from announcements API
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'Annual Performance Review Cycle',
      excerpt: 'The Q4 performance review cycle begins next week. Managers should prepare...',
      date: 'Feb 24',
      author: 'HR Department',
      pinned: true,
      category: 'policy',
    },
    {
      id: '2',
      title: 'Office Renovation Update',
      excerpt: 'Floor 3 will be closed for renovation from March 1-15. Please use...',
      date: 'Feb 23',
      author: 'Facilities',
      pinned: false,
      category: 'general',
    },
    {
      id: '3',
      title: 'Company Fun Day - March 10',
      excerpt: 'Join us for our annual company fun day! Activities include team building...',
      date: 'Feb 22',
      author: 'Culture Committee',
      pinned: false,
      category: 'event',
    },
  ];

  const categoryColors: Record<string, string> = {
    general: 'bg-celestial-indigo/10 text-celestial-indigo',
    policy: 'bg-sunset-amber/10 text-sunset-amber',
    event: 'bg-neural-mint/10 text-neural-mint',
    urgent: 'bg-quantum-rose/10 text-quantum-rose',
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-quantum-rose" />
        Announcements
      </h3>

      <div className="space-y-2.5">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-lg border border-cloud/50 dark:border-nebula-purple/30 hover:border-cloud dark:hover:border-nebula-purple/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {item.pinned && <Pin className="w-2.5 h-2.5 text-sunset-amber" />}
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${categoryColors[item.category]}`}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="text-xs font-semibold text-ink-black dark:text-pearl truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-silver-mist line-clamp-2 mt-0.5">{item.excerpt}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] text-silver-mist">{item.author}</span>
                  <span className="text-[9px] text-silver-mist">·</span>
                  <span className="text-[9px] text-silver-mist">{item.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsWidget;
