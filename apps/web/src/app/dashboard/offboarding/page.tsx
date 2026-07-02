'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DoorOpen,
  UserX,
  Clock,
  CheckSquare,
  MessageSquare,
  DollarSign,
  ChevronRight,
  Loader2,
  TrendingDown,
} from 'lucide-react';
import { OffboardingInstanceService, OffboardingAnalyticsService } from './services';

interface ActiveInstance {
  id: string;
  employeeName: string;
  offboardingType: string;
  lastWorkingDate: string;
  status: string;
  progress: number;
}

const QUICK_LINKS = [
  {
    slug: 'exit-process',
    label: 'Exit Process',
    description: 'Manage resignations, notice periods and clearance tracking.',
    icon: DoorOpen,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    slug: 'exit-interview',
    label: 'Exit Interviews',
    description: 'Capture departure feedback and analyze attrition drivers.',
    icon: MessageSquare,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    slug: 'clearance-checklist',
    label: 'Clearance Checklist',
    description: 'Track asset returns and department clearances.',
    icon: CheckSquare,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    slug: 'f-f-settlement',
    label: 'F&F Settlement',
    description: 'Process full and final settlements and payouts.',
    icon: DollarSign,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
];

export default function OffboardingPage() {
  const [instances, setInstances] = useState<ActiveInstance[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [instanceData, metricsData] = await Promise.all([
          OffboardingInstanceService.getInstances(),
          OffboardingAnalyticsService.getMetrics(),
        ]);
        const mapped: ActiveInstance[] = (instanceData || []).map((inst: any) => ({
          id: inst.id,
          employeeName: inst.employeeName || 'Unknown Employee',
          offboardingType: inst.offboardingType || 'resignation',
          lastWorkingDate: inst.lastWorkingDate || '',
          status: inst.status || 'pending',
          progress: inst.progress || 0,
        }));
        setInstances(mapped);
        setMetrics(metricsData);
      } catch (error: any) {
        console.error('Error fetching offboarding overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <p className="text-sm text-silver-mist font-medium">Loading offboarding overview...</p>
        </div>
      </div>
    );
  }

  const activeInstances = instances.filter(
    (i) => i.status !== 'completed' && i.status !== 'cancelled'
  );

  const getDaysLeft = (lastWorkingDate: string) => {
    if (!lastWorkingDate) return 0;
    const diff = Math.ceil(
      (new Date(lastWorkingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  };

  const stats = [
    {
      label: 'Total Offboarding',
      value: metrics?.totalOffboarding ?? instances.length,
      icon: UserX,
      color: 'text-rose-500',
    },
    {
      label: 'Active',
      value: metrics?.activeOffboarding ?? activeInstances.length,
      icon: Clock,
      color: 'text-amber-500',
    },
    {
      label: 'Completed',
      value: metrics?.completedOffboarding ?? 0,
      icon: CheckSquare,
      color: 'text-emerald-500',
    },
    {
      label: 'Clearance Rate',
      value: `${metrics?.clearanceCompletionRate ?? 0}%`,
      icon: TrendingDown,
      color: 'text-indigo-500',
    },
  ];

  const topReasons: Array<{ reason: string; count: number; percentage: number }> =
    metrics?.topExitReasons?.slice(0, 5) || [];

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-rose-500" />
            Offboarding
          </h1>
          <p className="text-silver-mist text-sm">
            Manage resignations, exit interviews, and full &amp; final settlements.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-silver-mist uppercase">{stat.label}</div>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-ink-black dark:text-pearl">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.slug}
              href={`/dashboard/offboarding/${link.slug}`}
              className="group bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:border-rose-200 dark:hover:border-rose-800 transition-colors flex flex-col"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${link.bg} mb-3`}
              >
                <Icon className={`w-5 h-5 ${link.color}`} />
              </div>
              <div className="font-bold text-ink-black dark:text-pearl text-sm mb-1">
                {link.label}
              </div>
              <p className="text-xs text-silver-mist flex-1">{link.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Active Offboarding */}
        <div className="lg:col-span-2 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Active Offboarding
            </h3>
            <Link
              href="/dashboard/offboarding/exit-process"
              className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {activeInstances.length === 0 ? (
            <div className="p-10 text-center text-sm text-silver-mist">
              No active offboarding in progress.
            </div>
          ) : (
            <div className="divide-y divide-cloud dark:divide-nebula-purple/20">
              {activeInstances.slice(0, 6).map((inst) => (
                <div
                  key={inst.id}
                  className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-deep-cosmos/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {inst.employeeName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-ink-black dark:text-pearl truncate">
                      {inst.employeeName}
                    </div>
                    <div className="text-xs text-silver-mist capitalize">
                      {inst.offboardingType.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="w-28 hidden sm:block">
                    <div className="flex justify-between text-[10px] font-bold text-silver-mist mb-1">
                      <span>Progress</span>
                      <span>{inst.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-amber-400 rounded-full"
                        style={{ width: `${inst.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-rose-500">
                      {getDaysLeft(inst.lastWorkingDate)} days
                    </div>
                    <div className="text-[10px] text-silver-mist uppercase">left</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Exit Reasons */}
        <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-500" /> Top Exit Reasons
            </h3>
          </div>
          {topReasons.length === 0 ? (
            <div className="p-10 text-center text-sm text-silver-mist">No data available yet.</div>
          ) : (
            <div className="p-4 space-y-3">
              {topReasons.map((r) => (
                <div key={r.reason}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-ink-black dark:text-pearl truncate pr-2">
                      {r.reason}
                    </span>
                    <span className="text-silver-mist font-bold shrink-0">{r.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${r.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
