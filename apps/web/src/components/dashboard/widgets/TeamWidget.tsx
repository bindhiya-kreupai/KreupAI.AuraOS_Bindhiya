"use client";

import React from 'react';
import { Users, UserX } from 'lucide-react';

const teamMembers = [
  { name: 'Sarah Johnson', status: 'present', avatar: 'SJ' },
  { name: 'Mike Chen', status: 'present', avatar: 'MC' },
  { name: 'Emily Davis', status: 'leave', avatar: 'ED' },
  { name: 'Raj Patel', status: 'present', avatar: 'RP' },
  { name: 'Anna Lee', status: 'wfh', avatar: 'AL' },
];

export function TeamWidget() {
  const presentCount = teamMembers.filter((m) => m.status === 'present').length;
  const leaveCount = teamMembers.filter((m) => m.status === 'leave').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-medium text-ink-black dark:text-pearl">{presentCount} Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <UserX className="w-3.5 h-3.5 text-coral-alert" />
          <span className="text-xs font-medium text-ink-black dark:text-pearl">{leaveCount} On Leave</span>
        </div>
      </div>
      <div className="space-y-2">
        {teamMembers.map((member) => (
          <div key={member.name} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-celestial-indigo">{member.avatar}</span>
            </div>
            <span className="text-xs text-ink-black dark:text-pearl flex-1">{member.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              member.status === 'present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
              member.status === 'leave' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
              'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            }`}>
              {member.status === 'wfh' ? 'WFH' : member.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
