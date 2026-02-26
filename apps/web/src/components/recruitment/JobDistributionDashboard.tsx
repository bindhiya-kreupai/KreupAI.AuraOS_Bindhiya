/**
 * @module JobDistributionDashboard
 * @description Multi-board job distribution — connected boards, active postings,
 *              source effectiveness, cost-per-hire, referral program metrics (Sec 20.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Share2,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Send,
  Award,
  ChevronRight,
  Wifi,
  WifiOff,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  JobDistributionService,
  type JobBoard,
  type ApplicationSource,
  type SourceEffectiveness,
  type Referral,
  type ReferralProgram,
} from '@/services/jobDistributionService';

// ── Status Badge ──────────────────────────────────────────────────────────────

function BoardStatusBadge({ status }: { status: JobBoard['status'] }) {
  const cfg = {
    connected: { icon: <Wifi size={12} />, label: 'Connected', cls: 'bg-green-100 text-green-700' },
    disconnected: {
      icon: <WifiOff size={12} />,
      label: 'Disconnected',
      cls: 'bg-gray-100 text-gray-500',
    },
    pending: { icon: <Clock size={12} />, label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
    error: { icon: <AlertCircle size={12} />, label: 'Error', cls: 'bg-red-100 text-red-700' },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Source Bar ────────────────────────────────────────────────────────────────

function SourceBar({ source, maxApps }: { source: ApplicationSource; maxApps: number }) {
  const pct = (source.applications / maxApps) * 100;
  const hirePct = (source.hired / source.applications) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{source.sourceName}</span>
        <div className="flex items-center gap-3 text-gray-500">
          <span>{source.applications.toLocaleString()} apps</span>
          <span className="text-green-600 font-semibold">{source.hired} hired</span>
          <span className="text-blue-600">{hirePct.toFixed(1)}%</span>
          <span className="text-purple-600">${source.costPerHire.toLocaleString()}/hire</span>
        </div>
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
        <div
          className="h-full bg-green-500 ml-0.5 rounded-full transition-all"
          style={{ width: `${Math.max((source.hired / maxApps) * 100, 0.5)}%` }}
        />
      </div>
    </div>
  );
}

// ── Quick Publish Modal ───────────────────────────────────────────────────────

function QuickPublishModal({ boards, onClose }: { boards: JobBoard[]; onClose: () => void }) {
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const connectedBoards = boards.filter((b) => b.status === 'connected');

  const toggle = (id: string) =>
    setSelectedBoards((p) => (p.includes(id) ? p.filter((b) => b !== id) : [...p, id]));

  const handlePublish = async () => {
    if (selectedBoards.length === 0) return;
    setPublishing(true);
    try {
      const res = await JobDistributionService.publishToBoards({
        jobId: 'job-001',
        boardIds: selectedBoards,
      });
      const successCount = res.results.filter((r) => r.success).length;
      setResult({
        success: true,
        message: `Published to ${successCount} of ${res.results.length} boards successfully.`,
      });
    } catch {
      setResult({ success: false, message: 'Publication failed. Please try again.' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Publish Job</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select boards to publish &quot;Senior Software Engineer&quot;
        </p>

        {result ? (
          <div
            className={`p-4 rounded-xl mb-4 ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
          >
            {result.success ? (
              <CheckCircle size={16} className="inline mr-2" />
            ) : (
              <XCircle size={16} className="inline mr-2" />
            )}
            {result.message}
          </div>
        ) : (
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {connectedBoards.map((board) => (
              <label
                key={board.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedBoards.includes(board.id)}
                  onChange={() => toggle(board.id)}
                  className="rounded text-blue-600"
                />
                <span className="text-xl">{board.logo}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{board.name}</p>
                  <p className="text-xs text-gray-400">{board.region.join(', ')}</p>
                </div>
                {board.monthlyCost > 0 && (
                  <span className="text-xs text-gray-400">${board.monthlyCost}/mo</span>
                )}
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          {!result && (
            <button
              onClick={handlePublish}
              disabled={selectedBoards.length === 0 || publishing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {publishing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              {publishing ? 'Publishing...' : `Publish to ${selectedBoards.length || ''} boards`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabType = 'boards' | 'sources' | 'referrals';

export default function JobDistributionDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('boards');
  const [boards, setBoards] = useState<JobBoard[]>([]);
  const [effectiveness, setEffectiveness] = useState<SourceEffectiveness | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [programs, setPrograms] = useState<ReferralProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPublish, setShowPublish] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [b, e, r, p] = await Promise.all([
        JobDistributionService.getJobBoards(),
        JobDistributionService.getSourceEffectiveness(),
        JobDistributionService.getReferrals(),
        JobDistributionService.getReferralPrograms(),
      ]);
      setBoards(b);
      setEffectiveness(e);
      setReferrals(r);
      setPrograms(p);
      setLoading(false);
    };
    load();
  }, []);

  const connectedBoards = boards.filter((b) => b.status === 'connected');
  const totalActivePostings = connectedBoards.reduce((sum, b) => sum + b.activePostings, 0);
  const totalApplications = connectedBoards.reduce((sum, b) => sum + b.totalApplications, 0);
  const hiredReferrals = referrals.filter((r) => r.status === 'hired').length;
  const pendingBonuses = referrals.filter((r) => r.rewardStatus === 'approved').length;

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'boards', label: 'Job Boards', icon: <Globe size={14} /> },
    { id: 'sources', label: 'Source Effectiveness', icon: <BarChart3 size={14} /> },
    { id: 'referrals', label: 'Referral Program', icon: <Award size={14} /> },
  ];

  const statusOrder = { connected: 0, pending: 1, error: 2, disconnected: 3 };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Distribution</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage multi-board posting and track source effectiveness
          </p>
        </div>
        <button
          onClick={() => setShowPublish(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Share2 size={16} />
          Quick Publish
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Connected Boards"
          value={connectedBoards.length}
          sub={`of ${boards.length} total`}
          icon={<Globe size={18} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <KPICard
          label="Active Postings"
          value={totalActivePostings}
          sub="across all boards"
          icon={<Share2 size={18} className="text-green-600" />}
          color="bg-green-50"
        />
        <KPICard
          label="Total Applications"
          value={totalApplications.toLocaleString()}
          sub="this quarter"
          icon={<Users size={18} className="text-purple-600" />}
          color="bg-purple-50"
        />
        <KPICard
          label="Avg Cost/Hire"
          value={`$${effectiveness?.avgCostPerHire.toLocaleString() ?? '-'}`}
          sub="across all sources"
          icon={<DollarSign size={18} className="text-amber-600" />}
          color="bg-amber-50"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Job Boards Tab */}
          {activeTab === 'boards' && (
            <div className="space-y-3">
              {[...boards]
                .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
                .map((board) => (
                  <div
                    key={board.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {board.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{board.name}</span>
                        {board.isInternal && (
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded font-medium">
                            Internal
                          </span>
                        )}
                        <BoardStatusBadge status={board.status} />
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {board.features.map((f) => (
                          <span key={f} className="text-xs text-gray-400">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-gray-800">{board.activePostings}</p>
                        <p className="text-xs text-gray-400">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-800">
                          {board.totalApplications.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">Applications</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-800">{board.avgTimeToFill}d</p>
                        <p className="text-xs text-gray-400">Avg Fill</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-800">
                          {board.monthlyCost > 0
                            ? `$${board.monthlyCost.toLocaleString()}`
                            : 'Free'}
                        </p>
                        <p className="text-xs text-gray-400">/month</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              <button className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                <Plus size={16} />
                Connect New Job Board
              </button>
            </div>
          )}

          {/* Source Effectiveness Tab */}
          {activeTab === 'sources' && effectiveness && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-green-700 font-semibold">Best Quality Source</p>
                  <p className="text-green-900 font-bold mt-0.5">{effectiveness.bestSource}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 font-semibold">Most Cost Effective</p>
                  <p className="text-blue-900 font-bold mt-0.5">
                    {effectiveness.mostCostEffective}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-purple-700 font-semibold">
                    Total Hires ({effectiveness.period})
                  </p>
                  <p className="text-purple-900 font-bold mt-0.5">{effectiveness.totalHires}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-2 bg-blue-500 rounded" /> Applications
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-2 bg-green-500 rounded" /> Hires
                  </div>
                </div>
                <div className="space-y-4">
                  {effectiveness.sources.map((src) => (
                    <SourceBar
                      key={src.sourceId}
                      source={src}
                      maxApps={Math.max(...effectiveness.sources.map((s) => s.applications))}
                    />
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase">
                        Source
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
                        Apps
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
                        Interviewed
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
                        Hired
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
                        Conv. Rate
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
                        Cost/Hire
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
                        Avg Days
                      </th>
                      <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase">
                        Quality
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {effectiveness.sources.map((src) => (
                      <tr key={src.sourceId} className="hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-800">{src.sourceName}</td>
                        <td className="py-2.5 text-right text-gray-600">
                          {src.applications.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-gray-600">{src.interviewed}</td>
                        <td className="py-2.5 text-right font-semibold text-green-600">
                          {src.hired}
                        </td>
                        <td className="py-2.5 text-right text-blue-600">
                          {src.conversionRate.toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-right text-gray-700">
                          ${src.costPerHire.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right text-gray-600">{src.avgTimeToHire}d</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`font-bold ${src.qualityScore >= 8.5 ? 'text-green-600' : src.qualityScore >= 7 ? 'text-blue-600' : 'text-amber-600'}`}
                          >
                            {src.qualityScore.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="space-y-5">
              {/* Program Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-indigo-700">{referrals.length}</p>
                  <p className="text-xs text-indigo-600 mt-0.5">Total Referrals</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-green-700">{hiredReferrals}</p>
                  <p className="text-xs text-green-600 mt-0.5">Hired</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-amber-700">
                    {
                      referrals.filter((r) =>
                        ['submitted', 'screening', 'interviewing'].includes(r.status)
                      ).length
                    }
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">In Progress</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-purple-700">{pendingBonuses}</p>
                  <p className="text-xs text-purple-600 mt-0.5">Pending Bonus</p>
                </div>
              </div>

              {/* Programs */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Active Programs</h4>
                {programs.map((prog) => (
                  <div key={prog.id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{prog.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{prog.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ${prog.bonusAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">per hire</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                      <span>{prog.totalReferrals} referred</span>
                      <span className="text-green-600 font-medium">{prog.totalHires} hired</span>
                      <span className="text-purple-600">
                        ${prog.totalPaid.toLocaleString()} paid out
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Referral List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Referrals</h4>
                <div className="space-y-2">
                  {referrals.slice(0, 8).map((ref) => {
                    const statusCfg: Record<string, { cls: string; label: string }> = {
                      submitted: { cls: 'bg-gray-100 text-gray-600', label: 'Submitted' },
                      screening: { cls: 'bg-yellow-100 text-yellow-700', label: 'Screening' },
                      interviewing: { cls: 'bg-blue-100 text-blue-700', label: 'Interviewing' },
                      hired: { cls: 'bg-green-100 text-green-700', label: 'Hired' },
                      rejected: { cls: 'bg-red-100 text-red-600', label: 'Rejected' },
                      withdrawn: { cls: 'bg-gray-100 text-gray-500', label: 'Withdrawn' },
                    };
                    const sc = statusCfg[ref.status] ?? {
                      cls: 'bg-gray-100 text-gray-600',
                      label: ref.status,
                    };
                    return (
                      <div
                        key={ref.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {ref.candidateName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {ref.candidateName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {ref.jobTitle} · Referred by {ref.referrerName}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.cls}`}>
                          {sc.label}
                        </span>
                        {ref.rewardAmount && (
                          <span className="text-xs font-semibold text-green-600">
                            ${ref.rewardAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPublish && <QuickPublishModal boards={boards} onClose={() => setShowPublish(false)} />}
    </div>
  );
}
