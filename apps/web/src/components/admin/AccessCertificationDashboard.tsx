'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  ChevronRight,
  Activity,
  Lock,
} from 'lucide-react';
import type {
  CertificationCampaign,
  AccessReview,
  AccessAnomaly,
  UserEntitlementReport,
  CampaignStatus,
  AnomalySeverity,
} from '@/services/accessCertificationService';
import {
  getCertificationCampaigns,
  getCampaignReviews,
  getAccessAnomalies,
  getEntitlementReport,
  submitReview,
  resolveAnomaly,
} from '@/services/accessCertificationService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, { bg: string; text: string; border: string }> =
  {
    Draft: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
    Active: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
    Completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    Cancelled: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
    Scheduled: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  };

const ANOMALY_SEVERITY_STYLES: Record<
  AnomalySeverity,
  { bg: string; text: string; border: string; dot: string }
> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400', dot: 'bg-red-600' },
  High: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', dot: 'bg-rose-500' },
  Medium: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    dot: 'bg-amber-500',
  },
  Low: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
  },
};

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const s = CAMPAIGN_STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      {status}
    </span>
  );
}

function ProgressBar({ value, color = 'bg-indigo-500' }: { value: number; color?: string }) {
  return (
    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ── Campaign Card ─────────────────────────────────────────────────────────────

function CampaignCard({
  campaign,
  onSelect,
  isSelected,
}: {
  campaign: CertificationCampaign;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const barColor =
    campaign.completionPercent >= 90
      ? 'bg-emerald-500'
      : campaign.completionPercent >= 50
        ? 'bg-sky-500'
        : 'bg-amber-500';

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left bg-white border rounded-xl p-4 hover:shadow-md transition-all ${isSelected ? 'border-indigo-400 ring-1 ring-indigo-200 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm leading-tight">{campaign.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{campaign.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <CampaignStatusBadge status={campaign.status} />
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Completion Progress</span>
          <span className="font-semibold">{campaign.completionPercent.toFixed(0)}%</span>
        </div>
        <ProgressBar value={campaign.completionPercent} color={barColor} />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Total', value: campaign.totalReviews, color: 'text-slate-700' },
          { label: 'Approved', value: campaign.approvedReviews, color: 'text-emerald-600' },
          { label: 'Revoked', value: campaign.revokedReviews, color: 'text-rose-600' },
          { label: 'Pending', value: campaign.pendingReviews, color: 'text-amber-600' },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 rounded-lg p-2">
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
        <span>
          {campaign.startDate} → {campaign.endDate}
        </span>
        <span className="flex items-center gap-1">
          <ChevronRight size={12} /> {campaign.scope}
        </span>
      </div>
    </button>
  );
}

// ── Review Queue ──────────────────────────────────────────────────────────────

function ReviewQueue({
  reviews,
  onDecision,
}: {
  reviews: AccessReview[];
  onDecision: (id: string, decision: 'Approved' | 'Revoked') => void;
}) {
  return (
    <div className="space-y-3">
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-slate-400">
          <CheckCircle2 size={28} className="mb-2 opacity-40" />
          <p className="text-sm">No pending reviews</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            className={`bg-white border rounded-xl p-4 ${review.decision === 'Pending' ? 'border-amber-200' : review.decision === 'Approved' ? 'border-emerald-200' : review.decision === 'Revoked' ? 'border-rose-200' : 'border-slate-200'}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-slate-800 text-sm">{review.subjectName}</p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${review.riskScore >= 80 ? 'bg-rose-100 text-rose-700' : review.riskScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Risk: {review.riskScore}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {review.subjectJobTitle} — {review.subjectDepartment}
                </p>
              </div>
              {review.decision !== 'Pending' && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${review.decision === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                >
                  {review.decision}
                </span>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-slate-600">{review.application}</p>
                <span className="text-xs text-slate-500">{review.accessLevel}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {review.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
                  >
                    {perm}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Granted {review.grantedDate} by {review.grantedBy}
                {review.lastUsed &&
                  ` • Last used ${new Date(review.lastUsed).toLocaleDateString()}`}
                {!review.lastUsed && ' • Never used'}
              </p>
            </div>

            {review.decision === 'Pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onDecision(review.id, 'Approved')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700"
                >
                  <CheckCircle2 size={13} /> Approve Access
                </button>
                <button
                  onClick={() => onDecision(review.id, 'Revoked')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 text-white text-xs font-medium rounded-lg hover:bg-rose-700"
                >
                  <XCircle size={13} /> Revoke Access
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ── Anomaly Panel ─────────────────────────────────────────────────────────────

function AnomalyPanel({
  anomalies,
  onResolve,
}: {
  anomalies: AccessAnomaly[];
  onResolve: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {anomalies.map((anomaly) => {
        const s = ANOMALY_SEVERITY_STYLES[anomaly.severity];
        return (
          <div
            key={anomaly.id}
            className={`border rounded-xl p-4 ${anomaly.isResolved ? 'bg-slate-50 border-slate-200 opacity-70' : `${s.bg} ${s.border}`}`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-start gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${s.dot}`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}
                    >
                      {anomaly.severity}
                    </span>
                    <span className="text-xs text-slate-500">{anomaly.type}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{anomaly.userName}</p>
                  <p className="text-xs text-slate-500">{anomaly.department}</p>
                </div>
              </div>
              {anomaly.isResolved ? (
                <span className="text-xs text-emerald-600 flex items-center gap-1 shrink-0">
                  <CheckCircle2 size={12} /> Resolved
                </span>
              ) : (
                <button
                  onClick={() => onResolve(anomaly.id)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                >
                  Resolve
                </button>
              )}
            </div>

            <p className="text-xs text-slate-700 mb-2">{anomaly.description}</p>

            <div className="flex flex-wrap gap-1 mb-2">
              {anomaly.affectedSystems.map((sys) => (
                <span
                  key={sys}
                  className="text-xs bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
                >
                  {sys}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <AlertTriangle size={10} /> {anomaly.recommendedAction}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Detected: {new Date(anomaly.detectedAt).toLocaleDateString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Entitlement Report ────────────────────────────────────────────────────────

function EntitlementReportPanel({ report }: { report: UserEntitlementReport }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
          {report.userName
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{report.userName}</p>
          <p className="text-sm text-slate-500">
            {report.jobTitle} — {report.department}
          </p>
          <p className="text-xs text-slate-400">{report.employeeCode}</p>
        </div>
        <div className="ml-auto text-right">
          <p
            className={`text-2xl font-bold ${report.riskScore >= 80 ? 'text-rose-600' : report.riskScore >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}
          >
            {report.riskScore}
          </p>
          <p className="text-xs text-slate-400">Risk Score</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-slate-700">{report.totalPermissions}</p>
          <p className="text-xs text-slate-400">Total Permissions</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-rose-600">{report.highRiskPermissions}</p>
          <p className="text-xs text-slate-400">High Risk</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{report.anomalies.length}</p>
          <p className="text-xs text-slate-400">Anomalies</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Lock size={13} /> Entitlements
        </h4>
        <div className="space-y-2">
          {report.entitlements.map((ent) => (
            <div
              key={ent.applicationId}
              className={`border rounded-lg p-3 ${ent.riskLevel === 'High' ? 'border-rose-200 bg-rose-50' : ent.riskLevel === 'Medium' ? 'border-amber-100 bg-amber-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-800">{ent.applicationName}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${ent.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : ent.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {ent.riskLevel}
                  </span>
                  {ent.certifiedAt ? (
                    <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Certified
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 flex items-center gap-0.5">
                      <Clock size={10} /> Not Certified
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-1">{ent.accessLevel}</p>
              <div className="flex flex-wrap gap-1">
                {ent.permissions.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                  >
                    {p}
                  </span>
                ))}
              </div>
              {ent.lastUsed && (
                <p className="text-xs text-slate-400 mt-1">
                  Last used: {new Date(ent.lastUsed).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type ViewTab = 'campaigns' | 'reviews' | 'anomalies' | 'entitlements';

export default function AccessCertificationDashboard() {
  const [activeTab, setActiveTab] = useState<ViewTab>('campaigns');
  const [campaigns, setCampaigns] = useState<CertificationCampaign[]>([]);
  const [reviews, setReviews] = useState<AccessReview[]>([]);
  const [anomalies, setAnomalies] = useState<AccessAnomaly[]>([]);
  const [entitlementReport, setEntitlementReport] = useState<UserEntitlementReport | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CertificationCampaign | null>(null);
  const [entitlementUserId, setEntitlementUserId] = useState('EMP-101');
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [camps, anoms] = await Promise.all([getCertificationCampaigns(), getAccessAnomalies()]);
    setCampaigns(camps.campaigns);
    setAnomalies(anoms);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCampaignSelect(campaign: CertificationCampaign) {
    setSelectedCampaign(campaign);
    setReviewsLoading(true);
    const r = await getCampaignReviews(campaign.id);
    setReviews(r);
    setReviewsLoading(false);
    setActiveTab('reviews');
  }

  async function handleReviewDecision(id: string, decision: 'Approved' | 'Revoked') {
    await submitReview(id, decision);
    if (selectedCampaign) {
      const r = await getCampaignReviews(selectedCampaign.id);
      setReviews(r);
    }
  }

  async function handleResolveAnomaly(id: string) {
    await resolveAnomaly(id, 'Resolved by admin review');
    setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, isResolved: true } : a)));
  }

  async function handleLoadEntitlement() {
    const report = await getEntitlementReport(entitlementUserId);
    setEntitlementReport(report);
  }

  useEffect(() => {
    handleLoadEntitlement();
  }, []);

  const unresolvedAnomalies = anomalies.filter((a) => !a.isResolved);
  const criticalAnomalies = anomalies.filter((a) => a.severity === 'Critical' && !a.isResolved);
  const activeCampaigns = campaigns.filter((c) => c.status === 'Active');
  const totalPendingReviews = campaigns.reduce((s, c) => s + c.pendingReviews, 0);

  const tabs: Array<{ id: ViewTab; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'campaigns',
      label: 'Campaigns',
      icon: <Activity size={14} />,
      badge: activeCampaigns.length,
    },
    {
      id: 'reviews',
      label: 'Review Queue',
      icon: <CheckCircle2 size={14} />,
      badge: reviews.filter((r) => r.decision === 'Pending').length,
    },
    {
      id: 'anomalies',
      label: 'Anomalies',
      icon: <AlertTriangle size={14} />,
      badge: unresolvedAnomalies.length,
    },
    { id: 'entitlements', label: 'Entitlement Report', icon: <Eye size={14} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" /> Access Certification
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Access review campaigns, anomaly detection, and entitlement governance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
              <Plus size={16} /> New Campaign
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
            <p className="text-2xl font-bold text-sky-700">{activeCampaigns.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Active Campaigns</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-2xl font-bold text-amber-700">
              {totalPendingReviews.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Pending Reviews</p>
          </div>
          <div
            className={`${unresolvedAnomalies.length > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3`}
          >
            <p
              className={`text-2xl font-bold ${unresolvedAnomalies.length > 0 ? 'text-rose-700' : 'text-slate-500'}`}
            >
              {unresolvedAnomalies.length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Open Anomalies</p>
          </div>
          <div
            className={`${criticalAnomalies.length > 0 ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3`}
          >
            <p
              className={`text-2xl font-bold ${criticalAnomalies.length > 0 ? 'text-red-700' : 'text-slate-500'}`}
            >
              {criticalAnomalies.length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Critical Anomalies</p>
          </div>
        </div>
      </div>

      {/* Critical Alert */}
      {criticalAnomalies.length > 0 && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {criticalAnomalies.length} Critical Access Anomaly Detected
            </p>
            <p className="text-xs text-red-600 mt-0.5">{criticalAnomalies[0].description}</p>
          </div>
          <button
            onClick={() => setActiveTab('anomalies')}
            className="ml-auto text-xs text-red-700 font-medium hover:underline shrink-0"
          >
            View &rarr;
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 mt-4">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab.icon} {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-semibold ${tab.id === 'anomalies' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-400">
            <RefreshCw size={20} className="animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <>
            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    isSelected={selectedCampaign?.id === campaign.id}
                    onSelect={() => handleCampaignSelect(campaign)}
                  />
                ))}
                {campaigns.length === 0 && (
                  <div className="col-span-2 flex flex-col items-center py-16 text-slate-400">
                    <Shield size={36} className="mb-3 opacity-30" />
                    <p>No certification campaigns found</p>
                    <button className="mt-3 text-sm text-indigo-600 hover:underline">
                      Create First Campaign
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="max-w-2xl mx-auto">
                {!selectedCampaign ? (
                  <div className="flex flex-col items-center py-16 text-slate-400">
                    <CheckCircle2 size={36} className="mb-3 opacity-30" />
                    <p className="text-sm">
                      Select a campaign from the Campaigns tab to view its review queue
                    </p>
                    <button
                      onClick={() => setActiveTab('campaigns')}
                      className="mt-3 text-sm text-indigo-600 hover:underline"
                    >
                      View Campaigns
                    </button>
                  </div>
                ) : reviewsLoading ? (
                  <div className="flex items-center justify-center h-40 text-slate-400">
                    <RefreshCw size={20} className="animate-spin mr-2" /> Loading reviews...
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3">
                      <Shield size={16} className="text-indigo-600" />
                      <div>
                        <p className="text-sm font-semibold text-indigo-800">
                          {selectedCampaign.name}
                        </p>
                        <p className="text-xs text-indigo-600">
                          {reviews.filter((r) => r.decision === 'Pending').length} pending reviews
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('campaigns')}
                        className="ml-auto text-xs text-indigo-600 hover:underline"
                      >
                        Change Campaign
                      </button>
                    </div>
                    <ReviewQueue reviews={reviews} onDecision={handleReviewDecision} />
                  </>
                )}
              </div>
            )}

            {/* Anomalies Tab */}
            {activeTab === 'anomalies' && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" /> Access Anomalies
                  </h2>
                  <div className="flex gap-2">
                    {(['Critical', 'High', 'Medium', 'Low'] as AnomalySeverity[]).map((sev) => (
                      <span
                        key={sev}
                        className={`text-xs px-2 py-0.5 rounded-full border cursor-pointer ${ANOMALY_SEVERITY_STYLES[sev].bg} ${ANOMALY_SEVERITY_STYLES[sev].text} ${ANOMALY_SEVERITY_STYLES[sev].border}`}
                      >
                        {sev}
                      </span>
                    ))}
                  </div>
                </div>
                <AnomalyPanel anomalies={anomalies} onResolve={handleResolveAnomaly} />
              </div>
            )}

            {/* Entitlements Tab */}
            {activeTab === 'entitlements' && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={entitlementUserId}
                      onChange={(e) => setEntitlementUserId(e.target.value)}
                      placeholder="Enter Employee ID..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <button
                    onClick={handleLoadEntitlement}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                  >
                    <Eye size={14} /> View Report
                  </button>
                </div>
                {entitlementReport && <EntitlementReportPanel report={entitlementReport} />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
