/**
 * @module CapacityBar
 * @description Utilization bar per person showing capacity, availability, and leave integration
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import {
  Palmtree,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Wifi,
  Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TeamMemberCapacity {
  id: string;
  name: string;
  designation: string;
  avatar?: string;
  workMode: 'office' | 'remote' | 'hybrid';
  currentStatus: 'working' | 'on_leave' | 'on_travel' | 'wfh' | 'half_day' | 'absent';

  // Capacity metrics (0-100)
  utilization: number;
  allocatedHours: number;
  availableHours: number;
  totalHours: number;

  // Leave info
  onLeaveToday: boolean;
  upcomingLeaveDays: number; // next 14 days
  leaveBalanceRemaining: number;

  // Trend
  trend: 'up' | 'down' | 'stable';
  trendDelta: number; // percentage change vs last period

  // Workload breakdown
  projectWork: number; // hours
  meetings: number; // hours
  adminTasks: number; // hours
}

interface CapacityBarProps {
  member: TeamMemberCapacity;
  compact?: boolean;
  onClick?: (member: TeamMemberCapacity) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  working: { label: 'Working', color: 'text-neural-mint', dot: 'bg-neural-mint' },
  on_leave: { label: 'On Leave', color: 'text-sunset-amber', dot: 'bg-sunset-amber' },
  on_travel: { label: 'Traveling', color: 'text-celestial-indigo', dot: 'bg-celestial-indigo' },
  wfh: { label: 'WFH', color: 'text-nebula-purple', dot: 'bg-nebula-purple' },
  half_day: { label: 'Half Day', color: 'text-quantum-rose', dot: 'bg-quantum-rose' },
  absent: { label: 'Absent', color: 'text-coral-alert', dot: 'bg-coral-alert' },
};

const WORK_MODE_ICONS: Record<string, LucideIcon> = {
  office: Building2,
  remote: Wifi,
  hybrid: MapPin,
};

const TREND_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  up: { icon: TrendingUp, color: 'text-coral-alert' },
  down: { icon: TrendingDown, color: 'text-neural-mint' },
  stable: { icon: Minus, color: 'text-silver-mist' },
};

function getUtilizationColor(util: number): string {
  if (util >= 90) return 'bg-coral-alert';
  if (util >= 75) return 'bg-sunset-amber';
  if (util >= 50) return 'bg-celestial-indigo';
  if (util >= 25) return 'bg-neural-mint';
  return 'bg-silver-mist/40';
}

function getUtilizationLabel(util: number): string {
  if (util >= 90) return 'Overloaded';
  if (util >= 75) return 'High';
  if (util >= 50) return 'Balanced';
  if (util >= 25) return 'Light';
  return 'Available';
}

export const CapacityBar: React.FC<CapacityBarProps> = ({ member, compact = false, onClick }) => {
  const status = STATUS_CONFIG[member.currentStatus];
  const WorkModeIcon = WORK_MODE_ICONS[member.workMode];
  const trend = TREND_ICONS[member.trend];
  const TrendIcon = trend.icon;
  const utilColor = getUtilizationColor(member.utilization);
  const utilLabel = getUtilizationLabel(member.utilization);

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(member)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue hover:border-celestial-indigo/30 transition-colors text-left"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[10px] font-bold text-celestial-indigo">
            {member.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-stellar-blue ${status.dot}`}
          />
        </div>

        {/* Name & role */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-ink-black dark:text-pearl truncate">
            {member.name}
          </p>
          <p className="text-[9px] text-silver-mist truncate">{member.designation}</p>
        </div>

        {/* Utilization bar */}
        <div className="w-20 shrink-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-silver-mist">{member.utilization}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-cloud dark:bg-nebula-purple/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${utilColor}`}
              style={{ width: `${Math.min(member.utilization, 100)}%` }}
            />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={() => onClick?.(member)}
      className={`rounded-xl border transition-colors ${
        member.onLeaveToday
          ? 'border-sunset-amber/30 bg-sunset-amber/5 dark:bg-sunset-amber/5'
          : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
      } ${onClick ? 'cursor-pointer hover:border-celestial-indigo/30' : ''}`}
    >
      <div className="p-3">
        {/* Top row: avatar, name, status */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-bold text-celestial-indigo">
              {member.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-stellar-blue ${status.dot}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-ink-black dark:text-pearl truncate">
                {member.name}
              </h4>
              {WorkModeIcon && <WorkModeIcon className="w-3 h-3 text-silver-mist/60 shrink-0" />}
            </div>
            <p className="text-[10px] text-silver-mist truncate">{member.designation}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className={`text-[9px] font-semibold ${status.color}`}>{status.label}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-ink-black dark:text-pearl leading-none">
              {member.utilization}%
            </p>
            <p
              className={`text-[9px] font-semibold ${
                member.utilization >= 90
                  ? 'text-coral-alert'
                  : member.utilization >= 75
                    ? 'text-sunset-amber'
                    : 'text-neural-mint'
              }`}
            >
              {utilLabel}
            </p>
          </div>
        </div>

        {/* Utilization bar */}
        <div className="mb-3">
          <div className="h-2.5 rounded-full bg-cloud dark:bg-nebula-purple/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${utilColor}`}
              style={{ width: `${Math.min(member.utilization, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-silver-mist">
              {member.allocatedHours}h allocated / {member.totalHours}h total
            </span>
            <span className="text-[9px] text-neural-mint font-semibold">
              {member.availableHours}h available
            </span>
          </div>
        </div>

        {/* Workload breakdown */}
        <div className="flex items-center gap-1 mb-2.5">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden flex">
            {member.projectWork > 0 && (
              <div
                className="h-full bg-celestial-indigo"
                style={{ width: `${(member.projectWork / member.totalHours) * 100}%` }}
                title={`Projects: ${member.projectWork}h`}
              />
            )}
            {member.meetings > 0 && (
              <div
                className="h-full bg-nebula-purple"
                style={{ width: `${(member.meetings / member.totalHours) * 100}%` }}
                title={`Meetings: ${member.meetings}h`}
              />
            )}
            {member.adminTasks > 0 && (
              <div
                className="h-full bg-sunset-amber"
                style={{ width: `${(member.adminTasks / member.totalHours) * 100}%` }}
                title={`Admin: ${member.adminTasks}h`}
              />
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-silver-mist">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-celestial-indigo inline-block" /> Projects{' '}
            {member.projectWork}h
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-nebula-purple inline-block" /> Meetings{' '}
            {member.meetings}h
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-sunset-amber inline-block" /> Admin{' '}
            {member.adminTasks}h
          </span>
        </div>

        {/* Bottom row: leave info & trend */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-cloud/50 dark:border-nebula-purple/10">
          <div className="flex items-center gap-3">
            {member.upcomingLeaveDays > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-sunset-amber">
                <Palmtree className="w-2.5 h-2.5" />
                {member.upcomingLeaveDays}d leave upcoming
              </span>
            )}
            <span className="flex items-center gap-0.5 text-[9px] text-silver-mist">
              <Clock className="w-2.5 h-2.5" />
              {member.leaveBalanceRemaining}d balance
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <TrendIcon className={`w-3 h-3 ${trend.color}`} />
            <span className={`text-[9px] font-semibold ${trend.color}`}>
              {member.trendDelta > 0 ? '+' : ''}
              {member.trendDelta}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacityBar;
