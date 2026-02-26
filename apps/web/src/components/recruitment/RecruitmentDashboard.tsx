/**
 * @module RecruitmentDashboard
 * @description Recruitment overview — KPI cards, active job listings, pipeline funnel,
 *              upcoming interviews, candidate activity feed (Sec 20.1–20.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  Clock,
  Star,
  ChevronRight,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import {
  RecruitmentService,
  PIPELINE_STAGES,
  type JobPosting,
  type RecruitmentAnalytics,
  type Candidate,
} from '@/services/recruitmentService';

// ── Pipeline Funnel ────────────────────────────────────────────────────────────

function PipelineFunnel({ funnel }: { funnel: RecruitmentAnalytics['pipelineFunnel'] }) {
  const max = funnel[0]?.count ?? 1;
  const displayStages = funnel.filter((s) => !['hired', 'rejected'].includes(s.stage));
  return (
    <div className="space-y-2">
      {displayStages.map((stage) => {
        const pct = (stage.count / max) * 100;
        const stageCfg = PIPELINE_STAGES.find((s) => s.stage === stage.stage);
        return (
          <div key={stage.stage}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 font-medium">{stage.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">{stage.count}</span>
                {stage.conversionRate < 100 && (
                  <span className="text-xs text-gray-400">{stage.conversionRate}%</span>
                )}
              </div>
            </div>
            <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${stageCfg?.bgColor ?? 'bg-indigo-100'} flex items-center pl-2 transition-all`}
                style={{ width: `${Math.max(pct, 5)}%` }}
              >
                <span className={`text-xs font-semibold ${stageCfg?.color ?? 'text-indigo-600'}`}>
                  {stage.count > 0 ? stage.count : ''}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface RecruitmentDashboardProps {
  onCreateJob?: () => void;
  onViewJob?: (jobId: string) => void;
  onViewPipeline?: (jobId?: string) => void;
  onScheduleInterview?: () => void;
}

export function RecruitmentDashboard({
  onCreateJob,
  onViewJob,
  onViewPipeline,
  onScheduleInterview,
}: RecruitmentDashboardProps) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [analytics, setAnalytics] = useState<RecruitmentAnalytics | null>(null);
  const [recentCandidates, setRecentCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [j, a, c] = await Promise.all([
        RecruitmentService.getJobPostings({ status: 'active' }),
        RecruitmentService.getRecruitmentAnalytics(),
        RecruitmentService.getCandidates(undefined, { isArchived: false }),
      ]);
      setJobs(j);
      setAnalytics(a);
      setRecentCandidates(
        c.sort((x, y) => y.lastActivityDate.localeCompare(x.lastActivityDate)).slice(0, 5)
      );
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-sm text-gray-500 mt-0.5">Talent acquisition pipeline</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onScheduleInterview}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
          </button>
          <button
            onClick={onCreateJob}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post Job
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Open Positions',
            value: analytics.totalOpenPositions,
            icon: Briefcase,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            label: 'Total Applicants',
            value: analytics.totalApplications,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Interviews',
            value: analytics.totalInterviewsScheduled,
            icon: Calendar,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
          {
            label: 'Offers Made',
            value: analytics.totalOffersMade,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} rounded-2xl p-4`}>
            <kpi.icon className={`w-5 h-5 ${kpi.color} mb-2`} />
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{analytics.averageTimeToHire}</p>
          <p className="text-xs text-gray-500 mt-0.5">Avg Days to Hire</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{analytics.offerAcceptanceRate}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Offer Acceptance</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{analytics.totalHired}</p>
          <p className="text-xs text-gray-500 mt-0.5">Hired This Quarter</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              Active Positions
            </h2>
            <button
              onClick={() => onViewPipeline?.()}
              className="text-xs text-indigo-600 font-medium flex items-center gap-1"
            >
              All jobs <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onViewJob?.(job.id)}
                className="w-full bg-white rounded-xl p-4 text-left hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {job.department} · {job.location}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-indigo-600">{job.applicantCount}</p>
                    <p className="text-xs text-gray-400">applicants</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">
                    {job.openPositions} opening{job.openPositions !== 1 ? 's' : ''}
                  </span>
                  {job.isRemote && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      Remote
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {job.employmentType.replace('_', ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Pipeline Funnel */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Pipeline Funnel
            </h2>
            <button
              onClick={() => onViewPipeline?.()}
              className="text-xs text-indigo-600 font-medium flex items-center gap-1"
            >
              View pipeline <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white rounded-2xl p-5">
            <PipelineFunnel funnel={analytics.pipelineFunnel} />
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <div className="text-center">
                <p className="text-xs text-gray-400">Hired</p>
                <p className="font-bold text-emerald-600">{analytics.totalHired}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Conversion</p>
                <p className="font-bold text-gray-700">
                  {analytics.totalApplications > 0
                    ? ((analytics.totalHired / analytics.totalApplications) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Avg Time</p>
                <p className="font-bold text-gray-700">{analytics.averageTimeToHire}d</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Candidate Activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Recent Candidate Activity
          </h2>
        </div>
        <div className="space-y-2">
          {recentCandidates.map((candidate) => {
            const stageCfg = PIPELINE_STAGES.find((s) => s.stage === candidate.currentStage);
            return (
              <div
                key={candidate.id}
                className="bg-white rounded-xl p-3 flex items-center gap-3 hover:shadow-sm transition-all cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full ${candidate.avatarColor} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-xs font-bold">{candidate.avatarInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{candidate.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{candidate.jobTitle}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageCfg?.bgColor} ${stageCfg?.color}`}
                  >
                    {stageCfg?.label}
                  </span>
                  <div className="flex">
                    {Array.from({ length: Math.min(candidate.rating, 5) }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default RecruitmentDashboard;
