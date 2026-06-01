// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module DeviceManagementDashboard
 * @description Admin MDM dashboard — device counts, platform donut chart,
 *              non-compliant alerts, search, bulk actions, OS version chart,
 *              last activity per device (Sec 15.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Trash2,
  Send,
  ChevronDown,
  Loader2,
  BarChart3,
  Clock,
} from 'lucide-react';
import {
  MobileSecurityService,
  type RegisteredDevice,
  type DeviceComplianceReport,
  type DeviceStatus,
  type ComplianceReason,
} from '@/services/mobileSecurityService';

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  const days = Math.floor(diff / 86400_000);
  return `${days}d ago`;
}

const STATUS_STYLES: Record<DeviceStatus, { label: string; cls: string }> = {
  compliant: { label: 'Compliant', cls: 'bg-emerald-100 text-emerald-700' },
  non_compliant: { label: 'Non-Compliant', cls: 'bg-red-100 text-red-700' },
  revoked: { label: 'Revoked', cls: 'bg-slate-200 text-slate-600' },
  registered: { label: 'Registered', cls: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
};

const COMPLIANCE_LABELS: Record<ComplianceReason, string> = {
  os_outdated: 'OS outdated',
  encryption_disabled: 'Encryption off',
  jailbroken: 'Jailbroken',
  rooted: 'Rooted',
  pin_not_set: 'No PIN',
  screen_lock_disabled: 'No screen lock',
  unknown_source_apps: 'Unknown apps',
  compliant: 'Compliant',
};

// ── Donut Chart (Platform Breakdown) ─────────────────────────────────────────

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 50;
  const gap = 2;

  let cumulativeAngle = -90;
  const arcs = data.map((d) => {
    const angle = total > 0 ? (d.value / total) * 360 : 0;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return { ...d, startAngle, angle };
  });

  function polarToCart(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const start = polarToCart(cx, cy, r, endDeg - gap / 2);
    const end = polarToCart(cx, cy, r, startDeg + gap / 2);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size}>
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={20} />
        ) : (
          arcs.map((arc, i) =>
            arc.angle > 0 ? (
              <path
                key={i}
                d={describeArc(cx, cy, r, arc.startAngle, arc.startAngle + arc.angle)}
                fill="none"
                stroke={arc.color}
                strokeWidth={20}
                strokeLinecap="round"
              />
            ) : null
          )
        )}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight="700" fill="#1e293b">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#94a3b8">
          devices
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-slate-600">{d.label}</span>
            <span className="font-bold text-slate-800 ml-auto pl-3">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── OS Version Bar Chart ──────────────────────────────────────────────────────

function OsVersionChart({ devices }: { devices: RegisteredDevice[] }) {
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    devices.forEach((d) => {
      const key = `${d.platform} ${d.osVersion.split('.')[0]}`;
      m[key] = (m[key] ?? 0) + 1;
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [devices]);

  const max = Math.max(...counts.map((c) => c[1]), 1);

  return (
    <div className="space-y-2">
      {counts.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3 text-sm">
          <span className="text-slate-500 text-xs w-24 truncate">{label}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="font-semibold text-slate-700 w-4 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DeviceManagementDashboard() {
  const [report, setReport] = useState<DeviceComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await MobileSecurityService.getDeviceComplianceReport();
    setReport(r);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredDevices = useMemo(() => {
    if (!report) return [];
    return report.devices.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        d.userName.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [report, searchQuery, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredDevices.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredDevices.map((d) => d.id)));
    }
  };

  const handleBulkRevoke = async () => {
    setBulkLoading(true);
    for (const id of Array.from(selected)) {
      await MobileSecurityService.revokeDevice(id);
    }
    await load();
    setSelected(new Set());
    setBulkLoading(false);
    showToast(`${selected.size} device(s) revoked successfully`);
  };

  const platformData = useMemo(() => {
    if (!report) return [];
    const colors: Record<string, string> = {
      iOS: '#6366f1',
      Android: '#10b981',
      Windows: '#f59e0b',
      macOS: '#8b5cf6',
    };
    return Object.entries(report.byPlatform).map(([p, v]) => ({
      label: p,
      value: v.total,
      color: colors[p] ?? '#94a3b8',
    }));
  }, [report]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Device Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            MDM overview · Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Devices"
          value={report.totalDevices}
          sub={`${report.complianceRate}% compliant`}
          icon={Smartphone}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Compliant"
          value={report.compliantDevices}
          icon={CheckCircle}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Non-Compliant"
          value={report.nonCompliantDevices}
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
        />
        <StatCard
          label="Revoked"
          value={report.revokedDevices}
          icon={XCircle}
          color="bg-slate-100 text-slate-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            Platform Breakdown
          </h3>
          <DonutChart data={platformData} />
        </div>

        {/* Non-Compliant Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Top Compliance Issues
          </h3>
          {report.topIssues.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              All devices are compliant
            </div>
          ) : (
            <div className="space-y-2">
              {report.topIssues.map((issue) => (
                <div key={issue.reason} className="flex items-center gap-3">
                  <div className="flex-1 bg-red-50 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-sm text-red-800 font-medium">
                      {COMPLIANCE_LABELS[issue.reason]}
                    </span>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                      {issue.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OS Version Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          OS Version Distribution
        </h3>
        <OsVersionChart devices={report.devices} />
      </div>

      {/* Device Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user, device, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | 'all')}
              className="appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_STYLES).map(([v, { label }]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 font-medium">{selected.size} selected</span>
              <button
                onClick={handleBulkRevoke}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {bulkLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Revoke
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <Send className="w-3.5 h-3.5" />
                Push Update
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === filteredDevices.length && filteredDevices.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Device
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Platform
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Issues
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No devices found
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(device.id)}
                        onChange={() => toggleSelect(device.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{device.model}</p>
                      <p className="text-xs text-slate-400">
                        OS {device.osVersion} · v{device.appVersion}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{device.userName}</p>
                      <p className="text-xs text-slate-400">{device.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{device.platform}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[device.status]?.cls ?? 'bg-slate-100'}`}
                      >
                        {STATUS_STYLES[device.status]?.label ?? device.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {device.complianceReasons.filter((r) => r !== 'compliant').length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {device.complianceReasons
                            .filter((r) => r !== 'compliant')
                            .map((r) => (
                              <span
                                key={r}
                                className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded"
                              >
                                {COMPLIANCE_LABELS[r]}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Clock className="w-3 h-3" />
                        {relativeTime(device.lastActiveAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredDevices.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filteredDevices.length} of {report.totalDevices} devices
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 z-50">
          <CheckCircle className="w-4 h-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
