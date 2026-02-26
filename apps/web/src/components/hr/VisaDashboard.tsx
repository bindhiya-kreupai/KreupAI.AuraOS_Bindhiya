/**
 * @module VisaDashboard
 * @description Visa & Immigration dashboard for AuraOS HR.
 *              Features:
 *              - Expiring visas alert (30/60/90 day windows)
 *              - Visa status distribution (donut chart)
 *              - Renewal pipeline
 *              - Employee visa search
 *              - Bulk renewal initiation
 *              - Compliance alerts
 *              - Cost tracking per visa type
 */

'use client';

import React, { useState, useEffect, useMemo, type FC } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  DollarSign,
  Globe,
  Shield,
  ArrowRight,
} from 'lucide-react';
import {
  getVisaRecords,
  getExpiringVisas,
  getVisaStatusDistribution,
  updateVisaStatus,
  type VisaRecord,
  type VisaStatus,
  type VisaType,
} from '@/services/visaService';

// ── Types ──────────────────────────────────────────────────────────────────

type ExpiryWindow = 30 | 60 | 90;

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<VisaStatus, string> = {
  ACTIVE: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  EXPIRED: 'text-red-600 bg-red-50 border-red-200',
  PENDING_RENEWAL: 'text-amber-600 bg-amber-50 border-amber-200',
  SUBMITTED: 'text-blue-600 bg-blue-50 border-blue-200',
  APPROVED: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  STAMPED: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  REJECTED: 'text-red-600 bg-red-50 border-red-200',
  CANCELLED: 'text-slate-500 bg-slate-100 border-slate-200',
};

const PIPELINE_STAGES: { key: VisaStatus; label: string }[] = [
  { key: 'PENDING_RENEWAL', label: 'Pending' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'STAMPED', label: 'Stamped' },
];

function daysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);
}

function expiryUrgency(days: number): 'critical' | 'warning' | 'ok' {
  if (days <= 30) return 'critical';
  if (days <= 60) return 'warning';
  return 'ok';
}

// ── Sub-components ─────────────────────────────────────────────────────────

const StatusBadge: FC<{ status: VisaStatus }> = ({ status }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}>
    {status.replace(/_/g, ' ')}
  </span>
);

const MetricCard: FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, sub, icon, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-500">{label}</span>
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────

const VisaDashboard: FC = () => {
  const [allVisas, setAllVisas] = useState<VisaRecord[]>([]);
  const [expiring30, setExpiring30] = useState<VisaRecord[]>([]);
  const [expiring60, setExpiring60] = useState<VisaRecord[]>([]);
  const [expiring90, setExpiring90] = useState<VisaRecord[]>([]);
  const [statusDist, setStatusDist] = useState<Record<VisaStatus, number>>(
    {} as Record<VisaStatus, number>
  );
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<VisaStatus | ''>('');
  const [filterType, _setFilterType] = useState<VisaType | ''>('');
  const [expiryWindow, setExpiryWindow] = useState<ExpiryWindow>(30);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [allResp, exp30, exp60, exp90, dist] = await Promise.all([
      getVisaRecords({ limit: 100 }),
      getExpiringVisas(30),
      getExpiringVisas(60),
      getExpiringVisas(90),
      Promise.resolve(getVisaStatusDistribution()),
    ]);
    setAllVisas(allResp.data);
    setExpiring30(exp30);
    setExpiring60(exp60);
    setExpiring90(exp90);
    setStatusDist(dist);
    setIsLoading(false);
  }

  // ── Filtered list ──────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return allVisas.filter((v) => {
      if (filterStatus && v.status !== filterStatus) return false;
      if (filterType && v.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          v.employeeName.toLowerCase().includes(q) ||
          v.visaNumber.toLowerCase().includes(q) ||
          v.nationality.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allVisas, filterStatus, filterType, search]);

  // ── Pipeline stats ─────────────────────────────────────────────────────

  const pipelineCount = (stage: VisaStatus) => allVisas.filter((v) => v.status === stage).length;

  // ── Cost totals ────────────────────────────────────────────────────────

  const totalCostAED = allVisas
    .filter((v) => v.currency === 'AED' && v.status !== 'REJECTED' && v.status !== 'CANCELLED')
    .reduce((sum, v) => sum + v.cost, 0);

  // ── Bulk renewal ───────────────────────────────────────────────────────

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkInitiateRenewal() {
    if (selectedIds.size === 0) return;
    await Promise.all([...selectedIds].map((id) => updateVisaStatus(id, 'SUBMITTED')));
    await loadData();
    setSelectedIds(new Set());
  }

  // ── Current expiry window list ─────────────────────────────────────────

  const expiryList =
    expiryWindow === 30 ? expiring30 : expiryWindow === 60 ? expiring60 : expiring90;

  // ── Render ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visa & Immigration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track work permits, residency, and renewal pipelines
          </p>
        </div>
        <button
          onClick={() => void loadData()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Active Visas"
          value={statusDist['ACTIVE'] ?? 0}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <MetricCard
          label="Expiring (30d)"
          value={expiring30.length}
          sub="Urgent action needed"
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          color="bg-amber-50"
        />
        <MetricCard
          label="Expired"
          value={statusDist['EXPIRED'] ?? 0}
          sub="Compliance risk"
          icon={<XCircle className="w-4 h-4 text-red-600" />}
          color="bg-red-50"
        />
        <MetricCard
          label="Total Visa Cost"
          value={`AED ${(totalCostAED / 1000).toFixed(0)}K`}
          sub="Current financial year"
          icon={<DollarSign className="w-4 h-4 text-blue-600" />}
          color="bg-blue-50"
        />
      </div>

      {/* Compliance alerts */}
      {(statusDist['EXPIRED'] ?? 0) > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              {statusDist['EXPIRED']} expired visa{statusDist['EXPIRED'] !== 1 ? 's' : ''} detected
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Employees with expired visas may face overstay violations. Initiate renewals
              immediately.
            </p>
          </div>
        </div>
      )}

      {/* Renewal pipeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Renewal Pipeline</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map((stage, idx) => (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center min-w-[100px]">
                <div className="text-2xl font-bold text-slate-900">{pipelineCount(stage.key)}</div>
                <div className="text-xs text-slate-500 mt-1 text-center">{stage.label}</div>
                <StatusBadge status={stage.key} />
              </div>
              {idx < PIPELINE_STAGES.length - 1 && (
                <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Expiring visas section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Expiring Visas</h2>
          <div className="flex gap-2">
            {([30, 60, 90] as ExpiryWindow[]).map((w) => (
              <button
                key={w}
                onClick={() => setExpiryWindow(w)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  expiryWindow === w
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {w} days
              </button>
            ))}
          </div>
        </div>

        {expiryList.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No visas expiring in the next {expiryWindow} days</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expiryList.slice(0, 8).map((visa) => {
              const days = daysUntilExpiry(visa.expiryDate);
              const urgency = expiryUrgency(days);
              return (
                <div
                  key={visa.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    urgency === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : urgency === 'warning'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(visa.id)}
                      onChange={() => toggleSelect(visa.id)}
                      className="rounded border-slate-300"
                    />
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{visa.employeeName}</p>
                      <p className="text-xs text-slate-500">
                        {visa.type.replace(/_/g, ' ')} — {visa.country}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        urgency === 'critical'
                          ? 'text-red-600'
                          : urgency === 'warning'
                            ? 'text-amber-600'
                            : 'text-slate-600'
                      }`}
                    >
                      {days} days
                    </p>
                    <p className="text-xs text-slate-400">{visa.expiryDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedIds.size} visa{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => void bulkInitiateRenewal()}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Initiate Bulk Renewal
            </button>
          </div>
        )}
      </div>

      {/* Employee visa search table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h2 className="text-base font-semibold text-slate-900 flex-1">Visa Records</h2>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, number…"
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as VisaStatus | '')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {(
              [
                'ACTIVE',
                'PENDING_RENEWAL',
                'SUBMITTED',
                'APPROVED',
                'STAMPED',
                'EXPIRED',
                'REJECTED',
              ] as VisaStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Employee</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Type</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Country</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Expiry</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">Status</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((visa) => (
                <React.Fragment key={visa.id}>
                  <tr
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === visa.id ? null : visa.id)}
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-900">{visa.employeeName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{visa.type.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-3 text-slate-600">{visa.country}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {visa.expiryDate !== 'N/A' ? visa.expiryDate : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={visa.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {visa.cost > 0 ? `${visa.currency} ${visa.cost.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                  {expandedId === visa.id && (
                    <tr>
                      <td colSpan={6} className="px-4 pb-3 bg-slate-50">
                        <div className="grid grid-cols-3 gap-4 text-xs py-3">
                          <div>
                            <span className="text-slate-400">Visa Number</span>
                            <p className="font-mono text-slate-700 mt-0.5">{visa.visaNumber}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Passport</span>
                            <p className="font-mono text-slate-700 mt-0.5">
                              {visa.passportNumber} (exp {visa.passportExpiry})
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400">Sponsor</span>
                            <p className="text-slate-700 mt-0.5">{visa.sponsorEntity}</p>
                          </div>
                          {visa.renewalStatus && (
                            <div>
                              <span className="text-slate-400">Renewal Status</span>
                              <p className="text-slate-700 mt-0.5">
                                {visa.renewalStatus.replace(/_/g, ' ')}
                              </p>
                            </div>
                          )}
                          {visa.notes && (
                            <div className="col-span-2">
                              <span className="text-slate-400">Notes</span>
                              <p className="text-slate-700 mt-0.5">{visa.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No records match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaDashboard;
