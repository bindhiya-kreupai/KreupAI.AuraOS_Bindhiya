/**
 * @module TeamDashboard
 * @description Mobile-optimised manager team overview — attendance stats,
 *              member statuses, sparkline trends, birthdays, and quick actions (Sec 15.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
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

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_TEAM: TeamMember[] = [
  {
    id: 'emp-001',
    name: 'Jane Doe',
    designation: 'Sr. Software Engineer',
    department: 'Engineering',
    avatarInitials: 'JD',
    avatarColor: 'bg-blue-500',
    status: 'present',
    checkInTime: '09:05',
  },
  {
    id: 'emp-007',
    name: 'Lisa Wang',
    designation: 'Marketing Specialist',
    department: 'Marketing',
    avatarInitials: 'LW',
    avatarColor: 'bg-indigo-500',
    status: 'wfh',
    checkInTime: '09:30',
  },
  {
    id: 'emp-019',
    name: 'Kevin Park',
    designation: 'Software Engineer',
    department: 'Engineering',
    avatarInitials: 'KP',
    avatarColor: 'bg-violet-500',
    status: 'on_leave',
    leaveType: 'Annual Leave',
  },
  {
    id: 'emp-022',
    name: 'Daniel Taylor',
    designation: 'Data Scientist',
    department: 'Engineering',
    avatarInitials: 'DT',
    avatarColor: 'bg-cyan-500',
    status: 'present',
    checkInTime: '08:55',
  },
  {
    id: 'emp-024',
    name: 'Ethan Scott',
    designation: 'DevOps Engineer',
    department: 'Engineering',
    avatarInitials: 'ES',
    avatarColor: 'bg-teal-500',
    status: 'wfh',
    checkInTime: '10:00',
  },
  {
    id: 'emp-008',
    name: 'Tom Johnson',
    designation: 'Lead Engineer',
    department: 'Engineering',
    avatarInitials: 'TJ',
    avatarColor: 'bg-amber-500',
    status: 'present',
    checkInTime: '08:45',
  },
  {
    id: 'emp-023',
    name: 'Mia Nguyen',
    designation: 'Account Executive',
    department: 'Sales',
    avatarInitials: 'MN',
    avatarColor: 'bg-rose-500',
    status: 'absent',
  },
  {
    id: 'emp-021',
    name: 'Olivia Brown',
    designation: 'UX Designer',
    department: 'Product',
    avatarInitials: 'OB',
    avatarColor: 'bg-emerald-500',
    status: 'late',
    checkInTime: '10:22',
  },
];

const STATS: TeamStats = { total: 8, present: 3, onLeave: 1, wfh: 2, absent: 1 };

const SPECIAL_EVENTS: SpecialEvent[] = [
  {
    employeeId: 'emp-022',
    name: 'Daniel Taylor',
    type: 'birthday',
    details: 'Today!',
    avatarInitials: 'DT',
    avatarColor: 'bg-cyan-500',
  },
  {
    employeeId: 'emp-001',
    name: 'Jane Doe',
    type: 'anniversary',
    details: '5 Years — Tomorrow',
    avatarInitials: 'JD',
    avatarColor: 'bg-blue-500',
  },
];

// Last 7 days attendance percentages
const SPARKLINE_DATA = [72, 85, 90, 78, 88, 75, 88];

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

  const filtered = filter === 'all' ? MOCK_TEAM : MOCK_TEAM.filter((m) => m.status === filter);

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Stats Row */}
      <div className="bg-white p-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-4">My Team</h1>
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: 'Total',
              value: STATS.total,
              icon: Users,
              color: 'text-gray-600',
              bg: 'bg-gray-50',
            },
            {
              label: 'Present',
              value: STATS.present + STATS.wfh,
              icon: UserCheck,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'On Leave',
              value: STATS.onLeave,
              icon: Calendar,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              label: 'Absent',
              value: STATS.absent,
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
          <Sparkline data={SPARKLINE_DATA} />
          <div className="flex justify-between mt-1">
            {DAYS.map((day, i) => (
              <div key={day} className="text-center">
                <span className="text-xs text-gray-400">{day}</span>
                <p className="text-xs font-medium text-gray-700">{SPARKLINE_DATA[i]}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Special Events */}
        {SPECIAL_EVENTS.length > 0 && (
          <div className="mx-4 mt-4 bg-gradient-to-r from-amber-50 to-rose-50 rounded-2xl p-4 border border-amber-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              Today&apos;s Highlights
            </h3>
            <div className="space-y-2">
              {SPECIAL_EVENTS.map((ev) => (
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
            {[
              { name: 'Kevin Park', type: 'Annual Leave', dates: 'Mar 4 – Mar 7', days: 4 },
              { name: 'Lisa Wang', type: 'Parental Leave', dates: 'Mar 1 – May 31', days: 65 },
            ].map((leave) => (
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
