/**
 * @module ManagerQuickActions
 * @description Manager quick actions grid with pending counts, recent pinned actions,
 *              and responsive card layout (Sec 15.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Clock,
  Timer,
  Star,
  Briefcase,
  Users,
  BarChart3,
  Pin,
  ChevronRight,
  Zap,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  pendingCount: number;
  color: string;
  bgColor: string;
  borderColor: string;
  href?: string;
  description: string;
  isPinned?: boolean;
  isRecent?: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const ALL_ACTIONS: QuickAction[] = [
  {
    id: 'approve-leaves',
    label: 'Approve Leaves',
    icon: Calendar,
    pendingCount: 3,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    description: 'Review pending leave requests',
    isPinned: true,
  },
  {
    id: 'review-expenses',
    label: 'Review Expenses',
    icon: DollarSign,
    pendingCount: 2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    description: 'Approve expense reports',
    isPinned: true,
  },
  {
    id: 'team-attendance',
    label: 'Team Attendance',
    icon: Users,
    pendingCount: 0,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-100',
    description: "View today's team attendance",
    isPinned: true,
  },
  {
    id: 'overtime-approval',
    label: 'Overtime Approval',
    icon: Timer,
    pendingCount: 1,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    description: 'Approve overtime requests',
    isRecent: true,
  },
  {
    id: 'performance-reviews',
    label: 'Performance Reviews',
    icon: Star,
    pendingCount: 4,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100',
    description: 'Pending quarterly reviews',
    isRecent: true,
  },
  {
    id: 'hiring-requests',
    label: 'Hiring Requests',
    icon: Briefcase,
    pendingCount: 1,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    description: 'Open headcount approvals',
    isRecent: false,
  },
  {
    id: 'analytics',
    label: 'Team Analytics',
    icon: BarChart3,
    pendingCount: 0,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-100',
    description: 'Team performance metrics',
    isRecent: false,
  },
  {
    id: 'work-schedule',
    label: 'Work Schedules',
    icon: Clock,
    pendingCount: 0,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-100',
    description: 'Manage team shifts',
    isRecent: false,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ManagerQuickActions() {
  const [pinnedActions, setPinnedActions] = useState<string[]>(
    ALL_ACTIONS.filter((a) => a.isPinned).map((a) => a.id)
  );

  const totalPending = ALL_ACTIONS.reduce((sum, a) => sum + a.pendingCount, 0);
  const pinned = ALL_ACTIONS.filter((a) => pinnedActions.includes(a.id));
  const recent = ALL_ACTIONS.filter((a) => !pinnedActions.includes(a.id) && a.isRecent);
  const all = ALL_ACTIONS.filter((a) => !pinnedActions.includes(a.id) && !a.isRecent);

  const togglePin = (id: string) => {
    setPinnedActions((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <h1 className="text-xl font-bold text-gray-900">Quick Actions</h1>
        {totalPending > 0 && (
          <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              You have <span className="font-bold">{totalPending} items</span> requiring your
              attention.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Pinned Actions */}
        {pinned.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Pin className="w-4 h-4 text-indigo-500" />
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Pinned
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {pinned.map((action) => (
                <ActionCard key={action.id} action={action} isPinned onTogglePin={togglePin} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Actions */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Recently Used
              </h2>
            </div>
            <div className="space-y-2">
              {recent.map((action) => (
                <ActionRow key={action.id} action={action} onTogglePin={togglePin} />
              ))}
            </div>
          </section>
        )}

        {/* All Actions */}
        {all.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                All Actions
              </h2>
            </div>
            <div className="space-y-2">
              {all.map((action) => (
                <ActionRow key={action.id} action={action} onTogglePin={togglePin} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActionCard({
  action,
  isPinned,
  onTogglePin,
}: {
  action: QuickAction;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
}) {
  const Icon = action.icon;
  return (
    <button
      className={`relative ${action.bgColor} border ${action.borderColor} rounded-2xl p-3 text-center flex flex-col items-center gap-2 hover:shadow-md transition-all active:scale-95 w-full`}
    >
      {action.pendingCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {action.pendingCount > 9 ? '9+' : action.pendingCount}
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl ${action.bgColor} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${action.color}`} />
      </div>
      <span className="text-xs font-medium text-gray-700 leading-tight text-center">
        {action.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(action.id);
        }}
        className="absolute top-2 left-2 opacity-0 hover:opacity-100 focus:opacity-100"
      >
        <Pin
          className={`w-3 h-3 ${isPinned ? 'text-indigo-500 fill-indigo-500' : 'text-gray-400'}`}
        />
      </button>
    </button>
  );
}

function ActionRow({
  action,
  onTogglePin,
}: {
  action: QuickAction;
  onTogglePin: (id: string) => void;
}) {
  const Icon = action.icon;
  return (
    <div className="bg-white rounded-xl p-3 flex items-center gap-3 hover:shadow-sm transition-all cursor-pointer">
      <div
        className={`w-10 h-10 rounded-xl ${action.bgColor} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-5 h-5 ${action.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 text-sm">{action.label}</p>
          {action.pendingCount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {action.pendingCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{action.description}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(action.id);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-50"
        >
          <Pin className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-500 transition-colors" />
        </button>
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </div>
  );
}

export default ManagerQuickActions;
