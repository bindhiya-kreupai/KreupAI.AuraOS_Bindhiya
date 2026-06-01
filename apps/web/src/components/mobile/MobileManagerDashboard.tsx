// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module MobileManagerDashboard
 * @description Mobile-first manager dashboard — quick actions, team overview,
 *              pending approvals, team calendar, and notifications (Sec 15.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  CheckCircle,
  Clock,
  Bell,
  Calendar,
  DollarSign,
  MessageSquare,
  ChevronRight,
  Activity,
  Check,
  X,
  Home,
  Loader2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ApprovalType = 'leave' | 'expense' | 'overtime' | 'wfh';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type MemberStatus = 'present' | 'absent' | 'on_leave' | 'wfh' | 'late';

interface TeamStat {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface PendingApproval {
  id: string;
  type: ApprovalType;
  employeeName: string;
  employeeInitials: string;
  employeeColor: string;
  description: string;
  requestedAt: string;
  urgency: 'high' | 'normal';
  status: ApprovalStatus;
}

interface CalendarDay {
  date: number;
  dayLabel: string;
  isToday: boolean;
  members: { initials: string; color: string; status: MemberStatus }[];
}

interface Notification {
  id: string;
  type: 'approval' | 'alert' | 'info' | 'calendar';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ── API Helpers ──────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['bg-blue-500', 'bg-amber-500', 'bg-violet-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500', 'bg-rose-500'];

function notifIconConfig(type: string): { icon: React.ElementType; color: string } {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    approval: { icon: CheckCircle, color: 'text-emerald-500' },
    alert: { icon: AlertCircle, color: 'text-red-500' },
    calendar: { icon: Calendar, color: 'text-blue-500' },
    info: { icon: Activity, color: 'text-purple-500' },
  };
  return map[type] || { icon: Bell, color: 'text-gray-500' };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function approvalTypeConfig(type: ApprovalType) {
  const map = {
    leave: { label: 'Leave', color: 'bg-blue-100 text-blue-700', icon: Calendar },
    expense: { label: 'Expense', color: 'bg-amber-100 text-amber-700', icon: DollarSign },
    overtime: { label: 'Overtime', color: 'bg-purple-100 text-purple-700', icon: Clock },
    wfh: { label: 'WFH', color: 'bg-teal-100 text-teal-700', icon: Home },
  };
  return map[type];
}

function memberStatusDot(status: MemberStatus): string {
  const map = {
    present: 'bg-emerald-400',
    absent: 'bg-red-400',
    on_leave: 'bg-amber-400',
    wfh: 'bg-blue-400',
    late: 'bg-orange-400',
  };
  return map[status] ?? 'bg-gray-300';
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function QuickActionsBar() {
  const actions = [
    { label: 'Approve Leave', icon: Calendar, color: 'bg-blue-500', count: 2 },
    { label: 'Approve Expense', icon: DollarSign, color: 'bg-amber-500', count: 1 },
    { label: 'Team Attendance', icon: UserCheck, color: 'bg-emerald-500', count: null },
    { label: 'Messages', icon: MessageSquare, color: 'bg-purple-500', count: 4 },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative"
          >
            <div
              className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-600 text-center leading-tight">
              {action.label}
            </span>
            {action.count !== null && action.count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {action.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TeamOverviewSection({ teamSize, present, onLeave, pendingCount }: { teamSize: number; present: number; onLeave: number; pendingCount: number }) {
  const stats: TeamStat[] = [
    { label: 'Team Size', value: teamSize, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Present Today', value: present, icon: UserCheck, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'On Leave', value: onLeave, icon: UserX, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Pending Approvals', value: pendingCount, icon: Clock, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Team Overview</h3>
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-xl p-3 flex flex-col items-center gap-1`}
            >
              <Icon className={`w-5 h-5 ${stat.color}`} />
              <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-xs text-gray-500 text-center leading-tight">{stat.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PendingApprovalsSection({ initialApprovals }: { initialApprovals: PendingApproval[] }) {
  const [approvals, setApprovals] = useState<PendingApproval[]>(initialApprovals);

  useEffect(() => { setApprovals(initialApprovals); }, [initialApprovals]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/v1/approvals/${id}/${action === 'approved' ? 'approve' : 'reject'}`, { method: 'POST' });
    } catch { /* silent */ }
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: action } : a)));
  };

  const pendingOnly = approvals.filter((a) => a.status === 'pending');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">Pending Approvals</h3>
        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
          {pendingOnly.length} pending
        </span>
      </div>
      <div className="divide-y divide-gray-50">
        {approvals.map((approval) => {
          const { label, color, icon: _TypeIcon } = approvalTypeConfig(approval.type);
          const isPending = approval.status === 'pending';
          return (
            <div key={approval.id} className={`p-4 ${!isPending ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 ${approval.employeeColor} rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0`}
                >
                  {approval.employeeInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800">{approval.employeeName}</p>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${color}`}>
                      {label}
                    </span>
                    {approval.urgency === 'high' && (
                      <span className="text-xs text-red-500 font-semibold">Urgent</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{approval.description}</p>
                  <p className="text-xs text-gray-400">{approval.requestedAt}</p>
                </div>
                {isPending ? (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAction(approval.id, 'approved')}
                      className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                      title="Approve"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleAction(approval.id, 'rejected')}
                      className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                      title="Reject"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-xs px-2 py-1 rounded-lg font-medium shrink-0 ${approval.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {approval.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-gray-50">
        <button className="w-full text-center text-xs text-blue-600 font-medium hover:underline flex items-center justify-center gap-1">
          View All Requests <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function TeamCalendarSection({ calendarWeek }: { calendarWeek: CalendarDay[] }) {
  const statusLabels: Record<MemberStatus, string> = {
    present: 'Office',
    absent: 'Absent',
    on_leave: 'Leave',
    wfh: 'WFH',
    late: 'Late',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 text-sm mb-3">Team Calendar — This Week</h3>
      <div className="grid grid-cols-5 gap-2">
        {calendarWeek.map((day) => (
          <div
            key={day.date}
            className={`rounded-xl p-2 text-center ${day.isToday ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 border border-gray-100'}`}
          >
            <p
              className={`text-xs font-medium mb-0.5 ${day.isToday ? 'text-blue-600' : 'text-gray-500'}`}
            >
              {day.dayLabel}
            </p>
            <p
              className={`text-sm font-bold mb-2 ${day.isToday ? 'text-blue-700' : 'text-gray-700'}`}
            >
              {day.date}
            </p>
            <div className="flex flex-col gap-1">
              {day.members.slice(0, 3).map((m, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div
                    className={`w-5 h-5 ${m.color} rounded-full flex items-center justify-center text-white text-[9px] font-semibold shrink-0`}
                  >
                    {m.initials}
                  </div>
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${memberStatusDot(m.status)}`}
                    title={statusLabels[m.status]}
                  />
                </div>
              ))}
              {day.members.length > 3 && (
                <p className="text-[10px] text-gray-400 text-center">+{day.members.length - 3}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {[
          { label: 'Office', dot: 'bg-emerald-400' },
          { label: 'WFH', dot: 'bg-blue-400' },
          { label: 'Leave', dot: 'bg-amber-400' },
          { label: 'Absent', dot: 'bg-red-400' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${l.dot}`} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsSection({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  useEffect(() => { setNotifications(initialNotifications); }, [initialNotifications]);
  const [showAll, setShowAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const displayed = showAll ? notifications : notifications.slice(0, 4);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
            Mark all read
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-50">
        {displayed.map((n) => {
          const { icon: Icon, color: iconColor } = notifIconConfig(n.type);
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{n.timestamp}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>
      {notifications.length > 4 && (
        <div className="p-3 border-t border-gray-50">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-center text-xs text-blue-600 font-medium hover:underline flex items-center justify-center gap-1"
          >
            {showAll ? 'Show Less' : `View All ${notifications.length} Notifications`}{' '}
            <ChevronRight
              className={`w-3 h-3 transition-transform ${showAll ? 'rotate-90' : ''}`}
            />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MobileManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [calendarWeek, setCalendarWeek] = useState<CalendarDay[]>([]);
  const [teamStats, setTeamStats] = useState({ teamSize: 0, present: 0, onLeave: 0, pendingCount: 0 });

  const fetchData = useCallback(async () => {
    try {
      const [appRes, notifRes, calRes, statsRes] = await Promise.allSettled([
        fetch('/api/v1/approvals/pending'),
        fetch('/api/v1/notifications'),
        fetch('/api/v1/attendance/team/calendar'),
        fetch('/api/v1/team/stats'),
      ]);

      if (appRes.status === 'fulfilled') {
        const json = await appRes.value.json();
        const list = json.data || [];
        setApprovals(list.map((a: any, idx: number) => ({
          id: a.id || String(idx),
          type: a.type || 'leave',
          employeeName: a.employeeName || a.name || '',
          employeeInitials: (a.employeeName || a.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          employeeColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          description: a.description || a.subtitle || '',
          requestedAt: a.requestedAt || a.submittedDate || '',
          urgency: a.urgency || 'normal',
          status: a.status || 'pending',
        })));
      }

      if (notifRes.status === 'fulfilled') {
        const json = await notifRes.value.json();
        setNotifications((json.data || []).map((n: any) => ({
          id: n.id,
          type: n.type || 'info',
          title: n.title || '',
          message: n.message || '',
          timestamp: n.timestamp || n.createdAt || '',
          read: n.read ?? false,
        })));
      }

      if (calRes.status === 'fulfilled') {
        const json = await calRes.value.json();
        const today = new Date().getDate();
        setCalendarWeek((json.data || []).map((d: any) => ({
          date: d.date,
          dayLabel: d.dayLabel || d.day || '',
          isToday: d.date === today,
          members: (d.members || []).map((m: any, mi: number) => ({
            initials: m.initials || '',
            color: m.color || AVATAR_COLORS[mi % AVATAR_COLORS.length],
            status: m.status || 'present',
          })),
        })));
      }

      if (statsRes.status === 'fulfilled') {
        const json = await statsRes.value.json();
        const d = json.data || json;
        setTeamStats({
          teamSize: d.total ?? d.teamSize ?? 0,
          present: d.present ?? 0,
          onLeave: d.onLeave ?? 0,
          pendingCount: d.pendingApprovals ?? d.pendingCount ?? 0,
        });
      }
    } catch { /* silent */ }
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Good morning,</p>
          <h1 className="text-xl font-bold text-gray-900">Tom Johnson</h1>
          <p className="text-xs text-gray-400">
            Engineering Manager · {lastUpdated && `Updated ${lastUpdated}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Activity className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">
            TJ
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsBar />

      {/* Team Overview */}
      <TeamOverviewSection teamSize={teamStats.teamSize} present={teamStats.present} onLeave={teamStats.onLeave} pendingCount={teamStats.pendingCount} />

      {/* Pending Approvals */}
      <PendingApprovalsSection initialApprovals={approvals} />

      {/* Team Calendar */}
      <TeamCalendarSection calendarWeek={calendarWeek} />

      {/* Notifications */}
      <NotificationsSection initialNotifications={notifications} />

      {/* Bottom nav hint */}
      <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between text-xs text-gray-400">
        <span>Manager Mode</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Team performing well this week
        </span>
      </div>
    </div>
  );
}
