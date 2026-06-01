"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Users, CheckCircle2, BarChart3, UserPlus, Calendar, TrendingUp, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { TeamDashboardService } from './services';
import { ApprovalCenterService } from './services';

interface DashboardData {
  teamCount: number;
  pendingApprovals: number;
  avgAttendance: number;
  avgPerformance: number;
}

const features = [
  { name: 'Team Dashboard', href: '/dashboard/manager/team-dashboard', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { name: 'Approval Center', href: '/dashboard/manager/approval-center', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { name: 'One-on-Ones', href: '/dashboard/manager/one-on-ones', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Team Capacity', href: '/dashboard/manager/team-capacity', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { name: 'Team Reports', href: '/dashboard/manager/team-reports', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { name: 'Delegation', href: '/dashboard/manager/delegation', icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: 'Team Analytics', href: '/dashboard/manager/team-analytics', icon: BarChart3, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
];

export default function MssPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamResponse, approvalsResponse] = await Promise.allSettled([
          fetch('/api/manager/team'),
          fetch('/api/manager/approvals'),
        ]);

        let teamCount = 0;
        let avgAttendance = 0;
        let avgPerformance = 0;
        let pendingApprovals = 0;

        if (teamResponse.status === 'fulfilled' && teamResponse.value.ok) {
          const teamData = await teamResponse.value.json();
          teamCount = teamData.metrics?.totalHeadcount || 0;
          avgAttendance = teamData.metrics?.averageAttendance || 0;
          avgPerformance = teamData.metrics?.averagePerformanceRating || 0;
        }

        if (approvalsResponse.status === 'fulfilled' && approvalsResponse.value.ok) {
          const approvalData = await approvalsResponse.value.json();
          pendingApprovals = approvalData.summary?.total || 0;
        }

        setData({ teamCount, pendingApprovals, avgAttendance, avgPerformance });
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setData({ teamCount: 0, pendingApprovals: 0, avgAttendance: 0, avgPerformance: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-500" />
          Manager Self-Service
        </h1>
        <p className="text-silver-mist text-sm mt-1">Manage your team, approvals, and operations.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="ml-2 text-sm text-silver-mist">Loading dashboard...</span>
        </div>
      ) : (
        <>
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                <p className="text-xs text-silver-mist uppercase font-medium">Team Size</p>
                <p className="text-2xl font-bold text-indigo-500 mt-1">{data.teamCount}</p>
              </div>
              <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                <p className="text-xs text-silver-mist uppercase font-medium">Pending Approvals</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">{data.pendingApprovals}</p>
              </div>
              <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                <p className="text-xs text-silver-mist uppercase font-medium">Avg Attendance</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">{data.avgAttendance}%</p>
              </div>
              <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
                <p className="text-xs text-silver-mist uppercase font-medium">Avg Performance</p>
                <p className="text-2xl font-bold text-celestial-indigo mt-1">{data.avgPerformance}/5</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {features.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="group bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all"
              >
                <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-3`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-bold text-ink-black dark:text-pearl group-hover:text-indigo-500 transition-colors">{feature.name}</h3>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

