/**
 * @module TeamDashboard
 * @description Mobile-optimised manager team overview — attendance stats,
 *              member statuses, sparkline trends, birthdays, and quick actions (Sec 15.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  MessageSquare,
  Gift,
  Award,
  MoreHorizontal,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type MemberStatus = 'present' | 'absent' | 'on_leave' | 'wfh' | 'late';

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  avatarInitials: string;
  avatarColor: string;
  status: MemberStatus;
  checkInTime?: string;
  leaveType?: string;
  upcomingLeave?: string;
}

interface TeamStats {
  total: number;
  present: number;
  onLeave: number;
  wfh: number;
  absent: number;
}

interface SpecialEvent {
  employeeId: string;
  name: string;
  type: 'birthday' | 'anniversary';
  details: string;
  avatarInitials: string;
  avatarColor: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500', 'bg-emerald-500'];

const STATUS_CONFIG: Record<
  MemberStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  present: {
    label: 'Present',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    dotColor: 'bg-emerald-500',
  },
  absent: { label: 'Absent', color: 'text-red-600', bgColor: 'bg-red-50', dotColor: 'bg-red-500' },
  on_leave: {
    label: 'On Leave',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    dotColor: 'bg-amber-500',
  },
  wfh: { label: 'WFH', color: 'text-blue-600', bgColor: 'bg-blue-50', dotColor: 'bg-blue-500' },
  late: {
    label: 'Late',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    dotColor: 'bg-orange-500',
  },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── Sparkline SVG ──────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data) - 5;
  const width = 200;
  const height = 50;
  const padding = 4;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = padding + ((maxVal - val) / (maxVal - minVal)) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const fillPoints = `${padding},${height - padding} ${polyline} ${width - padding},${height - padding}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill="url(#sparkGrad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
        const y = padding + ((maxVal - val) / (maxVal - minVal)) * (height - 2 * padding);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#6366f1" />;
      })}
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TeamDashboard() {
  const [filter, setFilter] = useState<MemberStatus | 'all'>('all');
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({ total: 0, present: 0, onLeave: 0, wfh: 0, absent: 0 });
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<{ name: string; type: string; dates: string; days: number }[]>([]);

  const fetchTeamData = useCallback(async () => {
    try {
      const [teamRes, statsRes, eventsRes, trendRes, leavesRes] = await Promise.allSettled([
        fetch('/api/v1/team/members'),
        fetch('/api/v1/team/stats'),
        fetch('/api/v1/team/events'),
        fetch('/api/v1/attendance/trend'),
        fetch('/api/v1/team/upcoming-leaves'),
      ]);

      if (teamRes.status === 'fulfilled') {
        const json = await teamRes.value.json();
        const list = json.data || [];
        setTeam(list.map((m: any, idx: number) => {
          const initials = (m.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
          return {
            id: m.id || String(idx),
            name: m.name || '',
            designation: m.designation || m.jobTitle || '',
            department: m.department || '',
            avatarInitials: initials,
            avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
            status: m.status || 'present',
            checkInTime: m.checkInTime,
            leaveType: m.leaveType,
            upcomingLeave: m.upcomingLeave,
          };
        }));
      }

      if (statsRes.status === 'fulfilled') {
        const json = await statsRes.value.json();
        const d = json.data || json;
        setStats({
          total: d.total ?? 0,
          present: d.present ?? 0,
          onLeave: d.onLeave ?? 0,
          wfh: d.wfh ?? 0,
          absent: d.absent ?? 0,
        });
      }

      if (eventsRes.status === 'fulfilled') {
        const json = await eventsRes.value.json();
        const list = json.data || [];
        setSpecialEvents(list.map((ev: any, idx: number) => {
          const initials = (ev.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
          return {
            employeeId: ev.employeeId || ev.id || '',
            name: ev.name || '',
            type: ev.type || 'birthday',
            details: ev.details || '',
            avatarInitials: initials,
            avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          };
        }));
      }

      if (trendRes.status === 'fulfilled') {
        const json = await trendRes.value.json();
        setSparklineData(json.data || []);
      }

      if (leavesRes.status === 'fulfilled') {
        const json = await leavesRes.value.json();
        setUpcomingLeaves((json.data || []).map((l: any) => ({
          name: l.name || l.employeeName || '',
          type: l.leaveType || l.type || '',
          dates: l.dates || `${l.startDate || ''} – ${l.endDate || ''}`,
          days: l.days ?? l.requestedDays ?? 0,
        })));
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchTeamData(); }, [fetchTeamData]);

  const filtered = filter === 'all' ? team : team.filter((m) => m.status === filter);

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Stats Row */}
      <div className="bg-white p-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-4">My Team</h1>
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: 'Total',
              value: stats.total,
              icon: Users,
              color: 'text-gray-600',
              bg: 'bg-gray-50',
            },
            {
              label: 'Present',
              value: stats.present + stats.wfh,
              icon: UserCheck,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'On Leave',
              value: stats.onLeave,
              icon: Calendar,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              label: 'Absent',
              value: stats.absent,
              icon: UserX,
              color: 'text-red-500',
              bg: 'bg-red-50',
            },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Attendance Trend */}
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Attendance Trend</h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <Sparkline data={sparklineData} />
          <div className="flex justify-between mt-1">
            {DAYS.map((day, i) => (
              <div key={day} className="text-center">
                <span className="text-xs text-gray-400">{day}</span>
                <p className="text-xs font-medium text-gray-700">{sparklineData[i]}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Special Events */}
        {specialEvents.length > 0 && (
          <div className="mx-4 mt-4 bg-gradient-to-r from-amber-50 to-rose-50 rounded-2xl p-4 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              Today&apos;s Highlights
            </h3>
            <div className="space-y-2">
              {specialEvents.map((ev) => (
                <div key={ev.employeeId} className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full ${ev.avatarColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-xs font-semibold">{ev.avatarInitials}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{ev.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {ev.type === 'birthday' ? (
                        <Gift className="w-3 h-3 text-amber-500" />
                      ) : (
                        <Award className="w-3 h-3 text-violet-500" />
                      )}
                      {ev.type === 'birthday' ? 'Birthday' : 'Work Anniversary'} — {ev.details}
                    </p>
                  </div>
                  <button className="text-xs text-indigo-600 font-medium">Wish</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Member List */}
        <div className="mx-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Team Members</h3>
            <div className="flex gap-1 overflow-x-auto">
              {(['all', 'present', 'wfh', 'on_leave', 'absent'] as const).map((s) => {
                const label = s === 'all' ? 'All' : (STATUS_CONFIG[s as MemberStatus]?.label ?? s);
                return (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      filter === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {filtered.map((member) => {
              const statusCfg = STATUS_CONFIG[member.status];
              return (
                <div key={member.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${member.avatarColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-sm font-semibold">
                      {member.avatarInitials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusCfg.dotColor}`} />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{member.designation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.bgColor} ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                        {member.checkInTime ? ` · ${member.checkInTime}` : ''}
                        {member.leaveType ? ` · ${member.leaveType}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button className="p-2 rounded-lg hover:bg-gray-50">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Leaves */}
        <div className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Upcoming Leaves
          </h3>
          <div className="space-y-2">
            {upcomingLeaves.map((leave) => (
              <div
                key={leave.name}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{leave.name}</p>
                  <p className="text-xs text-gray-500">
                    {leave.type} · {leave.dates}
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  {leave.days}d
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamDashboard;
