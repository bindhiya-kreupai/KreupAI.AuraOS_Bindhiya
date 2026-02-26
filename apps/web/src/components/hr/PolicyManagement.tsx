'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Plus,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Eye,
  Edit,
  Send,
  BookOpen,
  Shield,
  Archive,
} from 'lucide-react';
import type {
  Policy,
  PolicyDetail,
  PolicyCategory,
  PolicyStatus,
} from '@/services/policyManagementService';
import {
  getPolicies,
  getPolicy,
  publishPolicy,
  requireAcknowledgement,
} from '@/services/policyManagementService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  PolicyStatus,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  Draft: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    icon: <Edit size={11} />,
  },
  'Under Review': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    icon: <Clock size={11} />,
  },
  Active: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    icon: <CheckCircle2 size={11} />,
  },
  Superseded: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-200',
    icon: <Archive size={11} />,
  },
  Archived: {
    bg: 'bg-slate-100',
    text: 'text-slate-400',
    border: 'border-slate-200',
    icon: <Archive size={11} />,
  },
};

const CATEGORY_ICONS: Record<PolicyCategory, React.ReactNode> = {
  'Code of Conduct': <Shield size={14} />,
  'Leave & Attendance': <Clock size={14} />,
  'Compensation & Benefits': <FileText size={14} />,
  Recruitment: <Users size={14} />,
  'Health & Safety': <AlertTriangle size={14} />,
  'IT & Data Security': <Shield size={14} />,
  'Travel & Expense': <FileText size={14} />,
  Disciplinary: <AlertTriangle size={14} />,
  'Equal Opportunity': <Users size={14} />,
  Environmental: <BookOpen size={14} />,
};

function StatusBadge({ status }: { status: PolicyStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      {s.icon} {status}
    </span>
  );
}

function AcknowledgementBar({
  percent,
  count,
  total,
}: {
  percent: number;
  count: number;
  total: number;
}) {
  const color = percent >= 90 ? 'bg-emerald-500' : percent >= 70 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>
          {count} / {total}
        </span>
        <span
          className={
            percent >= 90
              ? 'text-emerald-600 font-semibold'
              : percent >= 70
                ? 'text-amber-600 font-semibold'
                : 'text-rose-600 font-semibold'
          }
        >
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function PolicyDetailPanel({ policyId, onClose }: { policyId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPolicy(policyId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [policyId]);

  async function handlePublish() {
    if (!detail) return;
    setPublishing(true);
    const updated = await publishPolicy(detail.id);
    setDetail({ ...detail, ...updated });
    setPublishing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <RefreshCw size={20} className="animate-spin mr-2" /> Loading policy...
      </div>
    );
  }
  if (!detail) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {detail.code}
            </span>
            <StatusBadge status={detail.status} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{detail.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {detail.category} — v{detail.currentVersion}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">{detail.summary}</p>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { label: 'Owner', value: detail.owner },
          { label: 'Department', value: detail.ownerDepartment },
          { label: 'Effective Date', value: detail.effectiveDate },
          { label: 'Review Date', value: detail.reviewDate },
          { label: 'Applicable To', value: detail.applicableTo },
          { label: 'Version', value: detail.currentVersion },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
            <p className="font-medium text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Acknowledgement */}
      {detail.requiresAcknowledgement && (
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users size={14} /> Acknowledgement Progress
            </h4>
            <button
              onClick={() => requireAcknowledgement(detail.id, [])}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Send size={12} /> Send Reminder
            </button>
          </div>
          <AcknowledgementBar
            percent={detail.acknowledgedPercent}
            count={detail.acknowledgedCount}
            total={detail.totalApplicable}
          />
        </div>
      )}

      {/* Version History */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Clock size={14} /> Version History
        </h4>
        <div className="space-y-2">
          {detail.versionHistory.map((v) => (
            <div key={v.version} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded shrink-0">
                v{v.version}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600">{v.changeNotes}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  By {v.publishedBy} on {v.publishedAt.split('T')[0]}
                </p>
              </div>
              <a href={v.documentUrl} className="text-xs text-indigo-600 hover:underline shrink-0">
                Download
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Approvers */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Approvers</h4>
        <div className="space-y-2">
          {detail.approvers.map((a, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs font-medium text-slate-700">{a.name}</p>
                <p className="text-xs text-slate-400">{a.role}</p>
              </div>
              {a.approvedAt ? (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Approved
                </span>
              ) : (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <Clock size={12} /> Pending
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {(detail.status === 'Draft' || detail.status === 'Under Review') && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60"
          >
            {publishing ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            Publish Policy
          </button>
          <button className="px-4 py-2 border border-slate-300 text-sm text-slate-600 rounded-lg hover:bg-slate-50">
            Edit Draft
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const CATEGORIES: Array<PolicyCategory | 'All'> = [
  'All',
  'Code of Conduct',
  'Leave & Attendance',
  'Compensation & Benefits',
  'Recruitment',
  'Health & Safety',
  'IT & Data Security',
  'Travel & Expense',
  'Disciplinary',
  'Equal Opportunity',
  'Environmental',
];

const STATUSES: Array<PolicyStatus | 'All'> = [
  'All',
  'Draft',
  'Under Review',
  'Active',
  'Superseded',
  'Archived',
];

export default function PolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<PolicyStatus | 'All'>('All');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [_showCreateModal, setShowCreateModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getPolicies({
      search: search || undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      status: selectedStatus !== 'All' ? selectedStatus : undefined,
    });
    setPolicies(res.policies);
    setTotal(res.total);
    setLoading(false);
  }, [search, selectedCategory, selectedStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = {
    active: policies.filter((p) => p.status === 'Active').length,
    underReview: policies.filter((p) => p.status === 'Under Review').length,
    draft: policies.filter((p) => p.status === 'Draft').length,
    needsAck: policies.filter((p) => p.requiresAcknowledgement && p.acknowledgedPercent < 90)
      .length,
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={20} className="text-indigo-600" /> Policy Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {total} policies — version-controlled, acknowledgement-tracked
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            <Plus size={16} /> New Policy
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            {
              label: 'Active Policies',
              value: stats.active,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Under Review',
              value: stats.underReview,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            { label: 'Draft', value: stats.draft, color: 'text-slate-500', bg: 'bg-slate-100' },
            {
              label: 'Low Acknowledgement',
              value: stats.needsAck,
              color: 'text-rose-600',
              bg: 'bg-rose-50',
            },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} rounded-lg p-3`}>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-slate-600 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-52 shrink-0 bg-white border-r border-slate-200 p-4 overflow-y-auto">
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Category
            </p>
            <div className="space-y-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors ${selectedCategory === cat ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {cat !== 'All' && (
                    <span className="text-slate-400">{CATEGORY_ICONS[cat as PolicyCategory]}</span>
                  )}
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Status
            </p>
            <div className="space-y-0.5">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`w-full px-2 py-1.5 rounded text-sm text-left transition-colors ${selectedStatus === st ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Policy List */}
          <div
            className={`${selectedPolicyId ? 'w-1/2' : 'flex-1'} flex flex-col overflow-hidden transition-all`}
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search policies by title or code..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-slate-400">
                  <RefreshCw size={20} className="animate-spin mr-2" /> Loading...
                </div>
              ) : policies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <FileText size={32} className="mb-2 opacity-50" />
                  <p>No policies found</p>
                </div>
              ) : (
                policies.map((policy) => (
                  <button
                    key={policy.id}
                    onClick={() =>
                      setSelectedPolicyId(policy.id === selectedPolicyId ? null : policy.id)
                    }
                    className={`w-full text-left bg-white border rounded-xl p-4 hover:shadow-md transition-all group ${selectedPolicyId === policy.id ? 'border-indigo-400 shadow-md ring-1 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-slate-400">{policy.code}</span>
                          <StatusBadge status={policy.status} />
                          {policy.status === 'Under Review' && (
                            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              Needs Publish
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight">
                          {policy.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          {CATEGORY_ICONS[policy.category]} {policy.category}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`text-slate-400 shrink-0 mt-1 group-hover:text-indigo-500 transition-colors ${selectedPolicyId === policy.id ? 'rotate-90 text-indigo-500' : ''}`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mb-3">
                      <span>v{policy.currentVersion}</span>
                      <span>Effective: {policy.effectiveDate}</span>
                      <span>Review: {policy.reviewDate}</span>
                    </div>

                    {policy.requiresAcknowledgement && (
                      <AcknowledgementBar
                        percent={policy.acknowledgedPercent}
                        count={policy.acknowledgedCount}
                        total={policy.totalApplicable}
                      />
                    )}

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Eye size={11} /> {policy.owner}
                      </span>
                      {policy.requiresAcknowledgement && (
                        <span
                          className={`text-xs flex items-center gap-1 ${policy.acknowledgedPercent >= 90 ? 'text-emerald-600' : 'text-rose-600'}`}
                        >
                          <Users size={11} />{' '}
                          {policy.requiresAcknowledgement ? 'Ack Required' : 'No Ack'}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedPolicyId && (
            <div className="w-1/2 border-l border-slate-200 bg-white overflow-y-auto p-6">
              <PolicyDetailPanel
                policyId={selectedPolicyId}
                onClose={() => setSelectedPolicyId(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
