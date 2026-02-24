/**
 * @module WorkloadDistribution
 * @description Workload chart showing team utilization distribution and balance analysis
 * @project AURA HCM Platform
 */

'use client';

import React, { useMemo } from 'react';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import type { TeamMemberCapacity } from './CapacityBar';

interface WorkloadDistributionProps {
  members: TeamMemberCapacity[];
}

interface DistributionBucket {
  range: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  label: string;
}

const BUCKETS: DistributionBucket[] = [
  {
    range: '0-25%',
    min: 0,
    max: 25,
    color: 'bg-silver-mist/40',
    bgColor: 'bg-silver-mist/10',
    label: 'Under-utilized',
  },
  {
    range: '25-50%',
    min: 25,
    max: 50,
    color: 'bg-neural-mint',
    bgColor: 'bg-neural-mint/10',
    label: 'Light',
  },
  {
    range: '50-75%',
    min: 50,
    max: 75,
    color: 'bg-celestial-indigo',
    bgColor: 'bg-celestial-indigo/10',
    label: 'Balanced',
  },
  {
    range: '75-90%',
    min: 75,
    max: 90,
    color: 'bg-sunset-amber',
    bgColor: 'bg-sunset-amber/10',
    label: 'High',
  },
  {
    range: '90-100%+',
    min: 90,
    max: 200,
    color: 'bg-coral-alert',
    bgColor: 'bg-coral-alert/10',
    label: 'Overloaded',
  },
];

export const WorkloadDistribution: React.FC<WorkloadDistributionProps> = ({ members }) => {
  const distribution = useMemo(() => {
    return BUCKETS.map((bucket) => ({
      ...bucket,
      count: members.filter((m) => m.utilization >= bucket.min && m.utilization < bucket.max)
        .length,
      members: members.filter((m) => m.utilization >= bucket.min && m.utilization < bucket.max),
    }));
  }, [members]);

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const avgUtilization = useMemo(() => {
    if (members.length === 0) return 0;
    return Math.round(members.reduce((sum, m) => sum + m.utilization, 0) / members.length);
  }, [members]);

  const overloaded = useMemo(() => members.filter((m) => m.utilization >= 90), [members]);
  const underUtilized = useMemo(() => members.filter((m) => m.utilization < 25), [members]);
  const _balanced = useMemo(
    () => members.filter((m) => m.utilization >= 50 && m.utilization < 75),
    [members]
  );
  const onLeave = useMemo(() => members.filter((m) => m.onLeaveToday), [members]);

  const _totalAllocated = useMemo(
    () => members.reduce((s, m) => s + m.allocatedHours, 0),
    [members]
  );
  const totalAvailable = useMemo(
    () => members.reduce((s, m) => s + m.availableHours, 0),
    [members]
  );
  const totalCapacity = useMemo(() => members.reduce((s, m) => s + m.totalHours, 0), [members]);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3 h-3 text-celestial-indigo" />
            <span className="text-[9px] text-silver-mist">Team Utilization</span>
          </div>
          <p className="text-lg font-bold text-ink-black dark:text-pearl">{avgUtilization}%</p>
          <div className="h-1 rounded-full bg-cloud dark:bg-nebula-purple/20 mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                avgUtilization >= 90
                  ? 'bg-coral-alert'
                  : avgUtilization >= 75
                    ? 'bg-sunset-amber'
                    : avgUtilization >= 50
                      ? 'bg-celestial-indigo'
                      : 'bg-neural-mint'
              }`}
              style={{ width: `${Math.min(avgUtilization, 100)}%` }}
            />
          </div>
        </div>

        <div className="px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3 text-neural-mint" />
            <span className="text-[9px] text-silver-mist">Available Capacity</span>
          </div>
          <p className="text-lg font-bold text-ink-black dark:text-pearl">{totalAvailable}h</p>
          <p className="text-[9px] text-silver-mist">of {totalCapacity}h total</p>
        </div>

        <div className="px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3 h-3 text-coral-alert" />
            <span className="text-[9px] text-silver-mist">Overloaded</span>
          </div>
          <p className="text-lg font-bold text-coral-alert">{overloaded.length}</p>
          <p className="text-[9px] text-silver-mist">
            {overloaded.length > 0 ? 'Need rebalancing' : 'All balanced'}
          </p>
        </div>

        <div className="px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3 h-3 text-neural-mint" />
            <span className="text-[9px] text-silver-mist">On Leave Today</span>
          </div>
          <p className="text-lg font-bold text-sunset-amber">{onLeave.length}</p>
          <p className="text-[9px] text-silver-mist">{members.length - onLeave.length} available</p>
        </div>
      </div>

      {/* Distribution chart */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
        <h4 className="text-xs font-bold text-ink-black dark:text-pearl flex items-center gap-1.5 mb-4">
          <BarChart3 className="w-3.5 h-3.5 text-celestial-indigo" />
          Utilization Distribution
        </h4>

        <div className="space-y-2.5">
          {distribution.map((bucket) => (
            <div key={bucket.range} className="flex items-center gap-3">
              <span className="text-[10px] text-silver-mist w-16 text-right shrink-0">
                {bucket.range}
              </span>
              <div className="flex-1 h-6 rounded-lg bg-pearl/50 dark:bg-deep-cosmos/20 overflow-hidden relative">
                <div
                  className={`h-full rounded-lg ${bucket.color} transition-all duration-500 flex items-center`}
                  style={{
                    width: `${maxCount > 0 ? (bucket.count / maxCount) * 100 : 0}%`,
                    minWidth: bucket.count > 0 ? '24px' : '0',
                  }}
                >
                  {bucket.count > 0 && (
                    <span className="text-[10px] font-bold text-white px-2">{bucket.count}</span>
                  )}
                </div>
              </div>
              <span className="text-[9px] text-silver-mist w-20 shrink-0">{bucket.label}</span>
            </div>
          ))}
        </div>

        {/* Member dots by bucket */}
        <div className="mt-4 pt-3 border-t border-cloud/50 dark:border-nebula-purple/10 space-y-2">
          {distribution
            .filter((b) => b.count > 0)
            .map((bucket) => (
              <div key={bucket.range} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${bucket.color} shrink-0`} />
                <div className="flex items-center gap-1 flex-wrap">
                  {bucket.members.map((m) => (
                    <span
                      key={m.id}
                      className={`text-[9px] px-1.5 py-0.5 rounded-full ${bucket.bgColor} text-ink-black dark:text-pearl`}
                    >
                      {m.name.split(' ')[0]} ({m.utilization}%)
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Workload type breakdown */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4">
        <h4 className="text-xs font-bold text-ink-black dark:text-pearl mb-3">
          Team Hours Breakdown
        </h4>
        <div className="space-y-2">
          {(() => {
            const totalProject = members.reduce((s, m) => s + m.projectWork, 0);
            const totalMeetings = members.reduce((s, m) => s + m.meetings, 0);
            const totalAdmin = members.reduce((s, m) => s + m.adminTasks, 0);
            const total = totalProject + totalMeetings + totalAdmin;

            return [
              {
                label: 'Project Work',
                hours: totalProject,
                color: 'bg-celestial-indigo',
                textColor: 'text-celestial-indigo',
              },
              {
                label: 'Meetings',
                hours: totalMeetings,
                color: 'bg-nebula-purple',
                textColor: 'text-nebula-purple',
              },
              {
                label: 'Admin Tasks',
                hours: totalAdmin,
                color: 'bg-sunset-amber',
                textColor: 'text-sunset-amber',
              },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center gap-3">
                <span className="text-[10px] text-silver-mist w-20 shrink-0">{cat.label}</span>
                <div className="flex-1 h-4 rounded-lg bg-pearl/50 dark:bg-deep-cosmos/20 overflow-hidden">
                  <div
                    className={`h-full rounded-lg ${cat.color} flex items-center transition-all duration-500`}
                    style={{ width: `${total > 0 ? (cat.hours / total) * 100 : 0}%` }}
                  >
                    <span className="text-[9px] font-bold text-white px-2">{cat.hours}h</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold ${cat.textColor} w-10 text-right shrink-0`}
                >
                  {total > 0 ? Math.round((cat.hours / total) * 100) : 0}%
                </span>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Alerts */}
      {(overloaded.length > 0 || underUtilized.length > 0) && (
        <div className="space-y-2">
          {overloaded.length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-coral-alert/10 border border-coral-alert/20">
              <AlertTriangle className="w-3.5 h-3.5 text-coral-alert shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-coral-alert">
                  Overloaded Team Members
                </p>
                <p className="text-[10px] text-coral-alert/80">
                  {overloaded.map((m) => `${m.name} (${m.utilization}%)`).join(', ')} — consider
                  redistributing workload.
                </p>
              </div>
            </div>
          )}
          {underUtilized.length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-celestial-indigo/10 border border-celestial-indigo/20">
              <ArrowRight className="w-3.5 h-3.5 text-celestial-indigo shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-celestial-indigo">
                  Available Capacity
                </p>
                <p className="text-[10px] text-celestial-indigo/80">
                  {underUtilized.map((m) => `${m.name} (${m.utilization}%)`).join(', ')} — can take
                  on more work.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkloadDistribution;
