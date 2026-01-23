"use client";

import React from 'react';
import { Users, Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface TeamMember {
  name: string;
  avatar: string;
  role: string;
  utilization: number;
  hoursThisWeek: number;
  status: 'available' | 'busy' | 'leave' | 'overloaded';
  leaveNext7Days: boolean;
}

const teamMembers: TeamMember[] = [
  { name: 'Emily Davis', avatar: 'ED', role: 'Senior Engineer', utilization: 85, hoursThisWeek: 34, status: 'busy', leaveNext7Days: false },
  { name: 'Raj Patel', avatar: 'RP', role: 'Engineer II', utilization: 110, hoursThisWeek: 44, status: 'overloaded', leaveNext7Days: false },
  { name: 'Anna Lee', avatar: 'AL', role: 'Senior Engineer', utilization: 60, hoursThisWeek: 24, status: 'available', leaveNext7Days: true },
  { name: 'Mike Chen', avatar: 'MC', role: 'Staff Engineer', utilization: 75, hoursThisWeek: 30, status: 'available', leaveNext7Days: false },
  { name: 'Sarah Johnson', avatar: 'SJ', role: 'Engineer II', utilization: 0, hoursThisWeek: 0, status: 'leave', leaveNext7Days: true },
  { name: 'David Wilson', avatar: 'DW', role: 'Engineer I', utilization: 95, hoursThisWeek: 38, status: 'busy', leaveNext7Days: false },
];

export default function TeamCapacityPage() {
  const avgUtilization = Math.round(teamMembers.filter(m => m.status !== 'leave').reduce((sum, m) => sum + m.utilization, 0) / teamMembers.filter(m => m.status !== 'leave').length);
  const onLeave = teamMembers.filter(m => m.status === 'leave').length;
  const overloaded = teamMembers.filter(m => m.status === 'overloaded').length;

  const getUtilizationColor = (util: number) => {
    if (util === 0) return 'bg-slate-200';
    if (util > 100) return 'bg-coral-alert';
    if (util > 85) return 'bg-sunset-amber';
    if (util > 60) return 'bg-celestial-indigo';
    return 'bg-neural-mint';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'busy': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overloaded': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      case 'leave': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Team Capacity</h1>
        <p className="text-sm text-silver-mist mt-1">Monitor workload distribution and team availability</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Team Size</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{teamMembers.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Utilization</p>
          <p className={`text-2xl font-bold mt-1 ${avgUtilization > 85 ? 'text-sunset-amber' : 'text-celestial-indigo'}`}>{avgUtilization}%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">On Leave</p>
          <p className="text-2xl font-bold text-silver-mist mt-1">{onLeave}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Overloaded</p>
          <p className={`text-2xl font-bold mt-1 ${overloaded > 0 ? 'text-coral-alert' : 'text-neural-mint'}`}>{overloaded}</p>
        </div>
      </div>

      {/* Capacity Bars */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Workload Distribution</h3>
        </div>
        <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex items-center gap-4 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-celestial-indigo">{member.avatar}</span>
              </div>
              <div className="w-32 flex-shrink-0">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{member.name}</p>
                <p className="text-[10px] text-silver-mist">{member.role}</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-3 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getUtilizationColor(member.utilization)}`}
                    style={{ width: `${Math.min(member.utilization, 100)}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right">
                <span className={`text-sm font-bold ${member.utilization > 100 ? 'text-coral-alert' : 'text-ink-black dark:text-pearl'}`}>
                  {member.utilization}%
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadge(member.status)}`}>
                {member.status}
              </span>
              {member.leaveNext7Days && (
                <Calendar className="w-3.5 h-3.5 text-sunset-amber flex-shrink-0" title="Leave upcoming" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {overloaded > 0 && (
        <div className="bg-coral-alert/5 border border-coral-alert/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-coral-alert mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-coral-alert">Overload Alert</p>
            <p className="text-xs text-coral-alert/70 mt-0.5">
              {overloaded} team member(s) are over 100% utilization. Consider redistributing workload.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
