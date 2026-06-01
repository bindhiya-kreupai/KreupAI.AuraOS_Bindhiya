"use client";

import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

interface TeamMember {
  id: string;
  employeeName: string;
  designation: string;
  status: string;
  attendanceRate: number;
  performanceRating: number;
}

export default function TeamCapacityPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch('/api/manager/team');
        if (res.ok) {
          const data = await res.json();
          setTeamMembers(data.members || []);
        }
      } catch (err: any) {
        console.error('Failed to fetch team capacity data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  const activeMembers = teamMembers.filter(m => m.status !== 'leave' && m.status !== 'separated');
  const avgUtilization = activeMembers.length > 0
    ? Math.round(activeMembers.reduce((sum, m) => sum + m.attendanceRate, 0) / activeMembers.length)
    : 0;
  const onLeave = teamMembers.filter(m => m.status === 'leave' || m.status === 'on_leave').length;
  const overloaded = 0;

  const getUtilizationColor = (util: number) => {
    if (util === 0) return 'bg-slate-200';
    if (util > 100) return 'bg-coral-alert';
    if (util > 85) return 'bg-sunset-amber';
    if (util > 60) return 'bg-celestial-indigo';
    return 'bg-neural-mint';
  };

  const getStatusFromAttendance = (rate: number, status: string) => {
    if (status === 'leave' || status === 'on_leave') return 'leave';
    if (rate > 100) return 'overloaded';
    if (rate > 85) return 'busy';
    return 'available';
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

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="ml-2 text-sm text-silver-mist">Loading team capacity...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Team Capacity</h1>
        <p className="text-sm text-silver-mist mt-1">Monitor workload distribution and team availability</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Team Size</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{teamMembers.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Attendance</p>
          <p className={`text-2xl font-bold mt-1 ${avgUtilization > 85 ? 'text-sunset-amber' : 'text-celestial-indigo'}`}>{avgUtilization}%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">On Leave</p>
          <p className="text-2xl font-bold text-silver-mist mt-1">{onLeave}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Active</p>
          <p className="text-2xl font-bold text-neural-mint mt-1">{activeMembers.length}</p>
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-500">No team members found</p>
          <p className="text-xs text-slate-400 mt-1">Team capacity data will appear once members are assigned</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Attendance Distribution</h3>
          </div>
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {teamMembers.map((member) => {
              const derivedStatus = getStatusFromAttendance(member.attendanceRate, member.status);
              return (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-celestial-indigo">{getInitials(member.employeeName)}</span>
                  </div>
                  <div className="w-32 flex-shrink-0">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">{member.employeeName}</p>
                    <p className="text-[10px] text-silver-mist">{member.designation}</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-3 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getUtilizationColor(member.attendanceRate)}`}
                        style={{ width: `${Math.min(member.attendanceRate, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm font-bold ${member.attendanceRate > 100 ? 'text-coral-alert' : 'text-ink-black dark:text-pearl'}`}>
                      {member.attendanceRate}%
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${getStatusBadge(derivedStatus)}`}>
                    {derivedStatus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

