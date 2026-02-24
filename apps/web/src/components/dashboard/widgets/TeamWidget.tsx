/**
 * @module TeamWidget
 * @description Direct reports, who's out widget
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import { Users } from 'lucide-react';

interface TeamMember {
  name: string;
  initials: string;
  role: string;
  status: 'online' | 'away' | 'leave' | 'offline';
}

export const TeamWidget: React.FC = () => {
  // Mock data – in production, fetch from team API
  const teamMembers: TeamMember[] = [
    { name: 'Sarah Johnson', initials: 'SJ', role: 'Sr. Developer', status: 'online' },
    { name: 'Mike Chen', initials: 'MC', role: 'Designer', status: 'online' },
    { name: 'Ana Garcia', initials: 'AG', role: 'QA Engineer', status: 'leave' },
    { name: 'Tom Wilson', initials: 'TW', role: 'Developer', status: 'away' },
    { name: 'Lisa Park', initials: 'LP', role: 'PM', status: 'online' },
  ];

  const statusColors: Record<string, string> = {
    online: 'bg-neural-mint',
    away: 'bg-sunset-amber',
    leave: 'bg-quantum-rose',
    offline: 'bg-silver-mist',
  };

  const statusLabels: Record<string, string> = {
    online: 'Online',
    away: 'Away',
    leave: 'On Leave',
    offline: 'Offline',
  };

  const onlineCount = teamMembers.filter((m) => m.status === 'online').length;
  const onLeaveCount = teamMembers.filter((m) => m.status === 'leave').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Users className="w-4 h-4 text-quantum-rose" />
          My Team
        </h3>
        <span className="text-[10px] text-silver-mist">
          {onlineCount} online · {onLeaveCount} leave
        </span>
      </div>

      <div className="space-y-2">
        {teamMembers.map((member) => (
          <div key={member.name} className="flex items-center gap-2.5 py-1">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 dark:bg-celestial-indigo/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-celestial-indigo">
                  {member.initials}
                </span>
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-stellar-blue ${statusColors[member.status]}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">
                {member.name}
              </p>
              <p className="text-[10px] text-silver-mist truncate">{member.role}</p>
            </div>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                member.status === 'online'
                  ? 'bg-neural-mint/10 text-neural-mint'
                  : member.status === 'leave'
                    ? 'bg-quantum-rose/10 text-quantum-rose'
                    : member.status === 'away'
                      ? 'bg-sunset-amber/10 text-sunset-amber'
                      : 'bg-pearl dark:bg-deep-cosmos text-silver-mist'
              }`}
            >
              {statusLabels[member.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamWidget;
