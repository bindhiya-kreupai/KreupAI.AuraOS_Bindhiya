'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Mail,
  RefreshCw,
  Plus,
  Search,
  Star,
  Clock,
  CheckCircle2,
  Target,
} from 'lucide-react';
import type {
  Candidate,
  PipelineStage,
  CandidateSource,
  RecruitmentAnalytics,
} from '@/services/recruitmentService';
import { RecruitmentService } from '@/services/recruitmentService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'pipeline' | 'talent-pool' | 'campaigns' | 'analytics';

interface DashboardState {
  candidates: Candidate[];
  analytics: RecruitmentAnalytics | null;
  loading: boolean;
  activeTab: Tab;
  selectedCandidate: Candidate | null;
  search: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bg: string }> = {
  applied: { label: 'Applied', color: 'text-slate-700', bg: 'bg-slate-100' },
  screening: { label: 'Screened', color: 'text-sky-700', bg: 'bg-sky-100' },
  phone_screen: { label: 'Phone Screen', color: 'text-blue-700', bg: 'bg-blue-100' },
  technical: { label: 'Technical', color: 'text-purple-700', bg: 'bg-purple-100' },
  hr_interview: { label: 'Interview', color: 'text-amber-700', bg: 'bg-amber-100' },
  offer: { label: 'Offer', color: 'text-orange-700', bg: 'bg-orange-100' },
  hired: { label: 'Hired', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-100' },
};

const SOURCE_CONFIG: Record<CandidateSource, { label: string; color: string }> = {
  linkedin: { label: 'LinkedIn', color: 'text-sky-700' },
  referral: { label: 'Referral', color: 'text-emerald-700' },
  job_board: { label: 'Job Board', color: 'text-amber-700' },
  career_site: { label: 'Career Site', color: 'text-purple-700' },
  agency: { label: 'Agency', color: 'text-orange-700' },
  direct: { label: 'Direct', color: 'text-slate-700' },
};

const KANBAN_STAGES: PipelineStage[] = ['applied', 'screening', 'hr_interview', 'offer', 'hired'];

// Mock nurture campaign data
const MOCK_CAMPAIGNS = [
  {
    id: '1',
    name: 'Engineering Talent Nurture Q1',
    audience: 'Software Engineers',
    status: 'active',
    sent: 450,
    openRate: 34,
    clickRate: 12,
  },
  {
    id: '2',
    name: 'Finance Talent Pool Engagement',
    audience: 'Finance Professionals',
    status: 'active',
    sent: 200,
    openRate: 28,
    clickRate: 8,
  },
  {
    id: '3',
    name: 'Product Manager Pipeline',
    audience: 'Product Managers',
    status: 'draft',
    sent: 0,
    openRate: 0,
    clickRate: 0,
  },
  {
    id: '4',
    name: 'Alumni Re-engagement 2025',
    audience: 'Past Employees',
    status: 'completed',
    sent: 320,
    openRate: 42,
    clickRate: 18,
  },
  {
    id: '5',
    name: 'Leadership Talent Branding',
    audience: 'Senior Executives',
    status: 'active',
    sent: 90,
    openRate: 51,
    clickRate: 22,
  },
];

// ── Sub Components ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function CandidateAvatar({ candidate }: { candidate: Candidate }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ backgroundColor: candidate.avatarColor || '#64748b' }}
    >
      {candidate.avatarInitials}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  );
}

// ── Pipeline (Kanban) Tab ──────────────────────────────────────────────────────

function PipelineTab({ candidates }: { candidates: Candidate[] }) {
  const byStage: Record<PipelineStage, Candidate[]> = {} as any;
  KANBAN_STAGES.forEach((stage) => {
    byStage[stage] = candidates.filter((c) => c.currentStage === stage && !c.isArchived);
  });

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_STAGES.map((stage) => {
        const cfg = STAGE_CONFIG[stage];
        const stageCandidates = byStage[stage] || [];
        return (
          <div key={stage} className="flex-shrink-0 w-64">
            {/* Column header */}
            <div
              className={`flex items-center justify-between px-3 py-2 rounded-lg mb-3 ${cfg.bg}`}
            >
              <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
              <span
                className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.color} border border-current border-opacity-30`}
              >
                {stageCandidates.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {stageCandidates.slice(0, 8).map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <CandidateAvatar candidate={candidate} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">
                        {candidate.fullName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{candidate.jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <StarRating rating={candidate.rating} />
                    <span className="text-xs text-slate-400">{candidate.daysInCurrentStage}d</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {stageCandidates.length === 0 && (
                <div className="text-center py-8 text-slate-300 text-xs border-2 border-dashed border-slate-100 rounded-xl">
                  No candidates
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Talent Pool Tab ────────────────────────────────────────────────────────────

function TalentPoolTab({ candidates }: { candidates: Candidate[] }) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<CandidateSource | 'All'>('All');

  const filtered = candidates.filter((c) => {
    const matchSearch =
      !search ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.currentTitle?.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchSource = sourceFilter === 'All' || c.source === sourceFilter;
    return matchSearch && matchSource;
  });

  // Determine warm/cold lead based on lastActivityDate
  function isWarm(candidate: Candidate): boolean {
    const days = Math.abs(
      Math.ceil((new Date(candidate.lastActivityDate).getTime() - Date.now()) / 86400000)
    );
    return days <= 30;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill..."
            className="text-sm outline-none w-40"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as CandidateSource | 'All')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Sources</option>
          {(Object.keys(SOURCE_CONFIG) as CandidateSource[]).map((s) => (
            <option key={s} value={s}>
              {SOURCE_CONFIG[s].label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left p-4 font-semibold text-slate-600">Candidate</th>
              <th className="text-left p-4 font-semibold text-slate-600">Skills</th>
              <th className="text-right p-4 font-semibold text-slate-600">Experience</th>
              <th className="text-left p-4 font-semibold text-slate-600">Source</th>
              <th className="text-left p-4 font-semibold text-slate-600">Last Contact</th>
              <th className="text-left p-4 font-semibold text-slate-600">Lead</th>
              <th className="text-right p-4 font-semibold text-slate-600">Rating</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map((candidate) => {
              const warm = isWarm(candidate);
              return (
                <tr
                  key={candidate.id}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CandidateAvatar candidate={candidate} />
                      <div>
                        <p className="font-medium text-slate-800">{candidate.fullName}</p>
                        <p className="text-xs text-slate-400">
                          {candidate.currentTitle || candidate.jobTitle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right text-slate-600">{candidate.experienceYears}y</td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-medium ${SOURCE_CONFIG[candidate.source]?.color || 'text-slate-500'}`}
                    >
                      {SOURCE_CONFIG[candidate.source]?.label || candidate.source}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {new Date(candidate.lastActivityDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${warm ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {warm ? 'Warm' : 'Cold'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <StarRating rating={candidate.rating} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400">No candidates found.</div>
        )}
      </div>
    </div>
  );
}

// ── Nurture Campaigns Tab ──────────────────────────────────────────────────────

function NurtureCampaignsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700">
          <Plus size={14} />
          New Campaign
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_CAMPAIGNS.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-slate-800">{campaign.name}</p>
                <p className="text-sm text-slate-500 mt-0.5">Audience: {campaign.audience}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  campaign.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : campaign.status === 'draft'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-sky-100 text-sky-700'
                }`}
              >
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>

            {campaign.sent > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-800">
                    {campaign.sent.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">Sent</p>
                </div>
                <div className="text-center p-3 bg-sky-50 rounded-lg">
                  <p className="text-lg font-bold text-sky-700">{campaign.openRate}%</p>
                  <p className="text-xs text-slate-400">Open Rate</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-lg font-bold text-emerald-700">{campaign.clickRate}%</p>
                  <p className="text-xs text-slate-400">Click Rate</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail size={14} />
                <span>Draft — not yet sent</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sourcing Analytics Tab ─────────────────────────────────────────────────────

function SourcingAnalyticsTab({ analytics }: { analytics: RecruitmentAnalytics | null }) {
  if (!analytics) return <div className="text-center py-12 text-slate-400">No analytics data.</div>;

  return (
    <div className="space-y-5">
      {/* Funnel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Recruitment Funnel</h3>
        <div className="space-y-2">
          {analytics.pipelineFunnel.map(({ stage, label, count, conversionRate }) => {
            const cfg = STAGE_CONFIG[stage];
            return (
              <div key={stage} className="flex items-center gap-3">
                <span className={`w-28 text-sm font-medium ${cfg.color} flex-shrink-0`}>
                  {label}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`h-6 rounded-full flex items-center px-2 ${cfg.bg}`}
                    style={{
                      width: `${Math.max((count / (analytics.pipelineFunnel[0]?.count || 1)) * 100, 5)}%`,
                    }}
                  >
                    <span className={`text-xs font-semibold ${cfg.color}`}>{count}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-16 text-right">
                  {conversionRate.toFixed(0)}% conv.
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source Effectiveness */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Source Effectiveness</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left pb-3 font-semibold text-slate-600">Source</th>
                <th className="text-right pb-3 font-semibold text-slate-600">Applications</th>
                <th className="text-right pb-3 font-semibold text-slate-600">Hire Rate</th>
                <th className="pb-3">
                  <div className="w-24" />
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.sourceEffectiveness.map(({ source, count, hireRate }) => (
                <tr key={source} className="border-b border-slate-50">
                  <td className="py-3">
                    <span
                      className={`font-medium ${SOURCE_CONFIG[source as CandidateSource]?.color || 'text-slate-600'}`}
                    >
                      {SOURCE_CONFIG[source as CandidateSource]?.label || source}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-600">{count}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-semibold ${hireRate > 15 ? 'text-emerald-600' : hireRate > 8 ? 'text-amber-600' : 'text-slate-500'}`}
                    >
                      {hireRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 pl-4">
                    <div className="w-24 bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-slate-700 h-1.5 rounded-full"
                        style={{ width: `${Math.min(hireRate * 3, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Hiring */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Hiring by Department</h3>
        <div className="space-y-3">
          {analytics.departmentHiring.map(({ department, openPositions, hired }) => (
            <div key={department} className="flex items-center gap-3">
              <span className="text-sm text-slate-600 w-32 flex-shrink-0 truncate">
                {department}
              </span>
              <div className="flex-1 flex gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${Math.min((openPositions / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-amber-600 w-20 text-right">{openPositions} open</span>
              <span className="text-xs text-emerald-600 w-16 text-right">{hired} hired</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function TalentCRMDashboard() {
  const [state, setState] = useState<DashboardState>({
    candidates: [],
    analytics: null,
    loading: true,
    activeTab: 'pipeline',
    selectedCandidate: null,
    search: '',
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const [candidatesResult, analytics] = await Promise.all([
        RecruitmentService.getCandidates(),
        RecruitmentService.getAnalytics(),
      ]);
      setState((s) => ({
        ...s,
        candidates: candidatesResult.candidates || candidatesResult,
        analytics,
        loading: false,
      }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { candidates, analytics, loading, activeTab } = state;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'talent-pool', label: 'Talent Pool' },
    { id: 'campaigns', label: 'Nurture Campaigns' },
    { id: 'analytics', label: 'Sourcing Analytics' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">Loading talent CRM...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Talent CRM</h1>
          <p className="text-sm text-slate-500 mt-1">
            Candidate pipeline, talent pool, and sourcing analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700">
            <Plus size={14} />
            Add Candidate
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users size={18} className="text-slate-600" />}
            label="Total Applications"
            value={analytics.totalApplications}
            color="bg-slate-100"
          />
          <StatCard
            icon={<Target size={18} className="text-sky-600" />}
            label="Open Positions"
            value={analytics.totalOpenPositions}
            color="bg-sky-100"
          />
          <StatCard
            icon={<CheckCircle2 size={18} className="text-emerald-600" />}
            label="Hired This Period"
            value={analytics.totalHired}
            color="bg-emerald-100"
          />
          <StatCard
            icon={<Clock size={18} className="text-amber-600" />}
            label="Avg Time to Hire"
            value={`${analytics.averageTimeToHire}d`}
            color="bg-amber-100"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setState((s) => ({ ...s, activeTab: tab.id }))}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'pipeline' && <PipelineTab candidates={candidates} />}
        {activeTab === 'talent-pool' && <TalentPoolTab candidates={candidates} />}
        {activeTab === 'campaigns' && <NurtureCampaignsTab />}
        {activeTab === 'analytics' && <SourcingAnalyticsTab analytics={analytics} />}
      </div>
    </div>
  );
}
