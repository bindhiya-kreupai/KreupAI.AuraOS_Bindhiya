"use client";

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  ExternalLink,
  Plus,
  Settings,
  TrendingUp,
  Users,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Building2,
  MapPin,
  DollarSign,
  Filter,
  Search,
  MoreVertical,
  RefreshCw,
  Zap,
  BarChart3
} from 'lucide-react';
import { jobBoards } from '@/lib/services/ai-automation-client';

// ============================================================================
// TYPES
// ============================================================================

type JobBoardPlatform =
  | 'linkedin'
  | 'indeed'
  | 'glassdoor'
  | 'naukri'
  | 'bayt'
  | 'gulftalent'
  | 'monster'
  | 'ziprecruiter';

type JobStatus = 'draft' | 'published' | 'paused' | 'closed' | 'filled';

interface JobBoard {
  platform: JobBoardPlatform;
  name: string;
  nameAr: string;
  logo: string;
  connected: boolean;
  region: string[];
  color: string;
  stats: {
    activeJobs: number;
    applications: number;
    views: number;
  };
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: JobStatus;
  publishedAt: string;
  applications: number;
  views: number;
  platforms: {
    platform: JobBoardPlatform;
    status: 'published' | 'pending' | 'failed';
    url?: string;
  }[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const JOB_BOARDS: JobBoard[] = [
  {
    platform: 'linkedin',
    name: 'LinkedIn',
    nameAr: 'لينكد إن',
    logo: '💼',
    connected: true,
    region: ['Global'],
    color: 'bg-blue-500',
    stats: { activeJobs: 12, applications: 145, views: 2340 },
  },
  {
    platform: 'indeed',
    name: 'Indeed',
    nameAr: 'إنديد',
    logo: '🔍',
    connected: true,
    region: ['Global'],
    color: 'bg-indigo-500',
    stats: { activeJobs: 12, applications: 82, views: 1560 },
  },
  {
    platform: 'glassdoor',
    name: 'Glassdoor',
    nameAr: 'جلاسدور',
    logo: '🚪',
    connected: true,
    region: ['US', 'UK', 'EU'],
    color: 'bg-green-500',
    stats: { activeJobs: 8, applications: 45, views: 890 },
  },
  {
    platform: 'naukri',
    name: 'Naukri',
    nameAr: 'نوكري',
    logo: '🇮🇳',
    connected: true,
    region: ['India'],
    color: 'bg-orange-500',
    stats: { activeJobs: 6, applications: 120, views: 1800 },
  },
  {
    platform: 'bayt',
    name: 'Bayt',
    nameAr: 'بيت',
    logo: '🌍',
    connected: true,
    region: ['GCC', 'MENA'],
    color: 'bg-emerald-500',
    stats: { activeJobs: 10, applications: 95, views: 1420 },
  },
  {
    platform: 'gulftalent',
    name: 'GulfTalent',
    nameAr: 'جلف تالنت',
    logo: '🏢',
    connected: false,
    region: ['GCC'],
    color: 'bg-cyan-500',
    stats: { activeJobs: 0, applications: 0, views: 0 },
  },
  {
    platform: 'monster',
    name: 'Monster',
    nameAr: 'مونستر',
    logo: '👹',
    connected: false,
    region: ['Global'],
    color: 'bg-purple-500',
    stats: { activeJobs: 0, applications: 0, views: 0 },
  },
  {
    platform: 'ziprecruiter',
    name: 'ZipRecruiter',
    nameAr: 'زيب ريكروتر',
    logo: '⚡',
    connected: false,
    region: ['US', 'UK', 'CA'],
    color: 'bg-amber-500',
    stats: { activeJobs: 0, applications: 0, views: 0 },
  },
];

const JOB_POSTINGS: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Dubai, UAE',
    type: 'Full-time',
    status: 'published',
    publishedAt: '2024-12-15',
    applications: 45,
    views: 890,
    platforms: [
      { platform: 'linkedin', status: 'published', url: 'https://linkedin.com/jobs/123' },
      { platform: 'indeed', status: 'published', url: 'https://indeed.com/jobs/123' },
      { platform: 'bayt', status: 'published', url: 'https://bayt.com/jobs/123' },
    ],
  },
  {
    id: '2',
    title: 'HR Business Partner',
    department: 'Human Resources',
    location: 'Riyadh, Saudi Arabia',
    type: 'Full-time',
    status: 'published',
    publishedAt: '2024-12-18',
    applications: 32,
    views: 560,
    platforms: [
      { platform: 'linkedin', status: 'published' },
      { platform: 'bayt', status: 'published' },
      { platform: 'gulftalent', status: 'pending' },
    ],
  },
  {
    id: '3',
    title: 'Financial Analyst',
    department: 'Finance',
    location: 'Mumbai, India',
    type: 'Full-time',
    status: 'published',
    publishedAt: '2024-12-20',
    applications: 78,
    views: 1200,
    platforms: [
      { platform: 'linkedin', status: 'published' },
      { platform: 'naukri', status: 'published' },
      { platform: 'indeed', status: 'published' },
    ],
  },
  {
    id: '4',
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Abu Dhabi, UAE',
    type: 'Full-time',
    status: 'paused',
    publishedAt: '2024-12-10',
    applications: 28,
    views: 420,
    platforms: [
      { platform: 'linkedin', status: 'published' },
      { platform: 'bayt', status: 'published' },
    ],
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Contract',
    status: 'draft',
    publishedAt: '',
    applications: 0,
    views: 0,
    platforms: [],
  },
];

const ANALYTICS = {
  totalApplications: 487,
  totalViews: 8120,
  conversionRate: 6.0,
  avgTimeToHire: 28,
  topPlatform: 'LinkedIn',
  applicationsByDay: [12, 18, 15, 22, 28, 35, 42],
};

// ============================================================================
// COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: JobStatus }) {
  const styles = {
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    closed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    filled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PlatformBadge({ platform, status, boards }: { platform: JobBoardPlatform; status: string; boards: JobBoard[] }) {
  const board = boards.find(b => b.platform === platform);
  if (!board) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">
      <span>{board.logo}</span>
      <span className="text-slate-600 dark:text-slate-400">{board.name}</span>
      {status === 'published' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
      {status === 'pending' && <Clock className="w-3 h-3 text-amber-500" />}
      {status === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function JobBoardsPage() {
  const [activeTab, setActiveTab] = useState<'postings' | 'platforms' | 'analytics'>('postings');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [boards, setBoards] = useState<JobBoard[]>(JOB_BOARDS);
  const [postings, setPostings] = useState<JobPosting[]>(JOB_POSTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobBoards();
  }, []);

  const fetchJobBoards = async () => {
    try {
      const result = await jobBoards.getJobBoards();
      if (result.success) {
        if (result.data?.boards) setBoards(result.data.boards);
        if (result.data?.postings) setPostings(result.data.postings);
      }
    } catch (error) {
      console.error('Error fetching job boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (jobData: any, selectedBoards: string[]) => {
    setLoading(true);
    try {
      await jobBoards.postJob(jobData, selectedBoards);
      await fetchJobBoards();
    } catch (error) {
      console.error('Error posting job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCandidates = async () => {
    setLoading(true);
    try {
      await jobBoards.syncCandidates();
      await fetchJobBoards();
    } catch (error) {
      console.error('Error syncing candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPostings = postings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const connectedPlatforms = boards.filter(b => b.connected);
  const totalStats = connectedPlatforms.reduce(
    (acc, board) => ({
      jobs: acc.jobs + board.stats.activeJobs,
      applications: acc.applications + board.stats.applications,
      views: acc.views + board.stats.views,
    }),
    { jobs: 0, applications: 0, views: 0 }
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Globe className="w-7 h-7 text-indigo-500" />
            Job Board Integration
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Manage job postings across multiple platforms from one place
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-cloud dark:border-nebula-purple/50 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">{totalStats.jobs}</p>
              <p className="text-xs text-silver-mist">Active Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">{totalStats.applications}</p>
              <p className="text-xs text-silver-mist">Total Applications</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">{totalStats.views.toLocaleString()}</p>
              <p className="text-xs text-silver-mist">Total Views</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink-black dark:text-pearl">{ANALYTICS.conversionRate}%</p>
              <p className="text-xs text-silver-mist">Conversion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
        {(['postings', 'platforms', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl shadow-sm'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'postings' && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-transparent text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
              className="px-3 py-2 border border-cloud dark:border-nebula-purple/50 rounded-lg bg-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="filled">Filled</option>
            </select>
          </div>

          {/* Job List */}
          <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
            {filteredPostings.map((job) => (
              <div key={job.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-ink-black dark:text-pearl truncate">{job.title}</h3>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-silver-mist mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.platforms.map((p, idx) => (
                        <PlatformBadge key={idx} platform={p.platform} status={p.status} boards={boards} />
                      ))}
                      {job.platforms.length === 0 && (
                        <span className="text-xs text-silver-mist italic">Not posted to any platform</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-ink-black dark:text-pearl">{job.applications}</p>
                      <p className="text-xs text-silver-mist">Applications</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-ink-black dark:text-pearl">{job.views}</p>
                      <p className="text-xs text-silver-mist">Views</p>
                    </div>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-silver-mist" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {boards.map((board) => (
            <div
              key={board.platform}
              className={`bg-white dark:bg-stellar-blue p-5 rounded-xl border ${
                board.connected
                  ? 'border-cloud dark:border-nebula-purple/50'
                  : 'border-dashed border-slate-300 dark:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${board.color} rounded-xl flex items-center justify-center text-xl`}>
                    {board.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink-black dark:text-pearl">{board.name}</h3>
                    <p className="text-xs text-silver-mist">{board.region.join(', ')}</p>
                  </div>
                </div>
                {board.connected ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <button className="text-xs text-indigo-600 hover:underline">Connect</button>
                )}
              </div>

              {board.connected ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="font-bold text-ink-black dark:text-pearl">{board.stats.activeJobs}</p>
                    <p className="text-xs text-silver-mist">Jobs</p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="font-bold text-ink-black dark:text-pearl">{board.stats.applications}</p>
                    <p className="text-xs text-silver-mist">Apps</p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="font-bold text-ink-black dark:text-pearl">{board.stats.views}</p>
                    <p className="text-xs text-silver-mist">Views</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-silver-mist text-center py-4">
                  Connect to start posting jobs
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Over Time */}
          <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50">
            <h3 className="font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Applications This Week
            </h3>
            <div className="flex items-end gap-2 h-40">
              {ANALYTICS.applicationsByDay.map((count, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-indigo-600">{count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-lg"
                    style={{ height: `${(count / Math.max(...ANALYTICS.applicationsByDay)) * 100}%` }}
                  />
                  <span className="text-xs text-silver-mist">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Performance */}
          <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50">
            <h3 className="font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Platform Performance
            </h3>
            <div className="space-y-4">
              {connectedPlatforms.slice(0, 5).map((board) => {
                const conversionRate = board.stats.views > 0
                  ? ((board.stats.applications / board.stats.views) * 100).toFixed(1)
                  : '0';
                return (
                  <div key={board.platform} className="flex items-center gap-4">
                    <div className={`w-8 h-8 ${board.color} rounded-lg flex items-center justify-center`}>
                      {board.logo}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-ink-black dark:text-pearl">{board.name}</span>
                        <span className="text-silver-mist">{conversionRate}% conv.</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${board.color} rounded-full`}
                          style={{ width: `${Math.min(parseFloat(conversionRate) * 10, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="lg:col-span-2 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-sm text-white/80 mb-2">Best Performing Platform</p>
                <p className="text-xl font-bold">{ANALYTICS.topPlatform}</p>
                <p className="text-xs text-white/60 mt-1">Highest application rate</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-sm text-white/80 mb-2">Avg. Time to Hire</p>
                <p className="text-xl font-bold">{ANALYTICS.avgTimeToHire} days</p>
                <p className="text-xs text-white/60 mt-1">Industry avg: 36 days</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-sm text-white/80 mb-2">Suggestion</p>
                <p className="text-sm">Consider posting to Bayt for GCC roles - 35% higher response rate</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
