/**
 * @module SecurityOperationsDashboard
 * @description Security Operations Center (SOC) dashboard with real-time threat
 *              monitoring, event timeline, failed login charts, and quick actions.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Activity,
  AlertTriangle,
  Ban,
  Clock,
  Eye,
  Globe,
  Key,
  Lock,
  RefreshCw,
  Search,
  Siren,
  TrendingUp,
  User,
  Users,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  userId?: string;
  ip?: string;
  country?: string;
  message: string;
  outcome: 'success' | 'failure' | 'blocked';
}

interface ThreatAlert {
  id: string;
  type: string;
  severity: ThreatLevel;
  userId?: string;
  ip?: string;
  description: string;
  detectedAt: string;
  resolved: boolean;
  riskScore: number;
}

interface HourlyLoginData {
  hour: string;
  failures: number;
  successes: number;
}

interface GeoDistribution {
  country: string;
  countryCode: string;
  count: number;
  blocked: boolean;
}

interface RateLimitStatus {
  endpoint: string;
  current: number;
  limit: number;
  windowSec: number;
}

// ── Mock data ────────────────────────────────────────────────────────────────

function generateMockEvents(): SecurityEvent[] {
  const types = [
    'login_failure',
    'login_success',
    'mfa_challenge',
    'role_change',
    'data_export',
    'permission_denied',
    'suspicious_activity',
    'api_key_usage',
    'ip_blocked',
    'rate_limit_exceeded',
  ];
  const countries = ['US', 'DE', 'GB', 'IN', 'BR', 'CN', 'RU', 'FR'];
  const severities: SecurityEvent['severity'][] = ['info', 'warning', 'error', 'critical'];
  const outcomes: SecurityEvent['outcome'][] = ['success', 'failure', 'blocked'];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `evt-${i}`,
    type: types[i % types.length],
    severity: severities[i % 4],
    timestamp: new Date(Date.now() - i * 180_000).toISOString(),
    userId: i % 3 === 0 ? `user_${(i % 10) + 1}` : undefined,
    ip: `192.168.${Math.floor(i / 20)}.${(i % 254) + 1}`,
    country: countries[i % countries.length],
    message: `Security event: ${types[i % types.length].replace(/_/g, ' ')}`,
    outcome: outcomes[i % 3],
  }));
}

function generateHourlyData(): HourlyLoginData[] {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    failures: Math.floor(Math.random() * 40) + (i >= 9 && i <= 17 ? 10 : 2),
    successes: Math.floor(Math.random() * 200) + (i >= 9 && i <= 17 ? 50 : 5),
  }));
}

const MOCK_THREATS: ThreatAlert[] = [
  {
    id: 'ta-1',
    type: 'brute_force',
    severity: 'critical',
    userId: 'user_5',
    ip: '45.33.32.156',
    description: 'Brute force attack: 47 failures in 300s',
    detectedAt: new Date(Date.now() - 600_000).toISOString(),
    resolved: false,
    riskScore: 92,
  },
  {
    id: 'ta-2',
    type: 'impossible_travel',
    severity: 'high',
    userId: 'user_12',
    ip: '203.0.113.45',
    description: 'Impossible travel: US → CN in 0.3h',
    detectedAt: new Date(Date.now() - 1_200_000).toISOString(),
    resolved: false,
    riskScore: 78,
  },
  {
    id: 'ta-3',
    type: 'credential_stuffing',
    severity: 'high',
    ip: '198.51.100.0',
    description: 'Credential stuffing from 23 different IPs',
    detectedAt: new Date(Date.now() - 3_600_000).toISOString(),
    resolved: true,
    riskScore: 65,
  },
  {
    id: 'ta-4',
    type: 'privilege_escalation',
    severity: 'medium',
    userId: 'user_8',
    description: '5 role changes in 24 hours for user_8',
    detectedAt: new Date(Date.now() - 7_200_000).toISOString(),
    resolved: false,
    riskScore: 58,
  },
];

const GEO_DISTRIBUTION: GeoDistribution[] = [
  { country: 'United States', countryCode: 'US', count: 1245, blocked: false },
  { country: 'Germany', countryCode: 'DE', count: 432, blocked: false },
  { country: 'India', countryCode: 'IN', count: 389, blocked: false },
  { country: 'United Kingdom', countryCode: 'GB', count: 302, blocked: false },
  { country: 'Brazil', countryCode: 'BR', count: 198, blocked: false },
  { country: 'China', countryCode: 'CN', count: 87, blocked: true },
  { country: 'Russia', countryCode: 'RU', count: 63, blocked: true },
  { country: 'France', countryCode: 'FR', count: 201, blocked: false },
];

const RATE_LIMIT_STATUS: RateLimitStatus[] = [
  { endpoint: 'POST /api/auth/login', current: 8, limit: 10, windowSec: 60 },
  { endpoint: 'GET /api/employees', current: 45, limit: 100, windowSec: 60 },
  { endpoint: 'POST /api/data/export', current: 2, limit: 5, windowSec: 300 },
  { endpoint: 'GET /api/reports', current: 12, limit: 20, windowSec: 60 },
  { endpoint: 'POST /api/payroll', current: 3, limit: 5, windowSec: 60 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const THREAT_LEVEL_CONFIG: Record<
  ThreatLevel,
  { label: string; className: string; icon: React.ElementType; bg: string }
> = {
  low: {
    label: 'Low',
    className: 'text-emerald-400',
    icon: ShieldCheck,
    bg: 'bg-emerald-500/10 border-emerald-500/30',
  },
  medium: {
    label: 'Medium',
    className: 'text-amber-400',
    icon: ShieldAlert,
    bg: 'bg-amber-500/10  border-amber-500/30',
  },
  high: {
    label: 'High',
    className: 'text-orange-400',
    icon: Shield,
    bg: 'bg-orange-500/10 border-orange-500/30',
  },
  critical: {
    label: 'Critical',
    className: 'text-red-400',
    icon: ShieldX,
    bg: 'bg-red-500/10    border-red-500/30',
  },
};

const SEV_DOT: Record<string, string> = {
  info: 'bg-blue-400',
  warning: 'bg-amber-400',
  error: 'bg-orange-500',
  critical: 'bg-red-500',
};

function overallThreatLevel(alerts: ThreatAlert[]): ThreatLevel {
  const active = alerts.filter((a) => !a.resolved);
  if (active.some((a) => a.severity === 'critical')) return 'critical';
  if (active.some((a) => a.severity === 'high')) return 'high';
  if (active.some((a) => a.severity === 'medium')) return 'medium';
  return 'low';
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'blue',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10   border-blue-500/20   text-blue-400',
    red: 'bg-red-500/10    border-red-500/20    text-red-400',
    amber: 'bg-amber-500/10  border-amber-500/20  text-amber-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color] ?? colors.blue}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-white/5">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function BarChart({ data }: { data: HourlyLoginData[] }) {
  const maxVal = Math.max(...data.map((d) => d.failures + d.successes), 1);

  return (
    <div className="flex items-end gap-px h-24 w-full">
      {data.map((d) => {
        const totalH = ((d.failures + d.successes) / maxVal) * 100;
        const failH = (d.failures / maxVal) * 100;

        return (
          <div key={d.hour} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="flex-1 flex flex-col-reverse w-full">
              <div className="w-full bg-slate-600/50 rounded-t-sm" style={{ height: `${totalH}%` }}>
                <div
                  className="w-full bg-red-500/70 rounded-t-sm"
                  style={{ height: `${(failH / totalH) * 100}%` }}
                />
              </div>
            </div>
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10">
              <div className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                {d.hour}: {d.failures} failures / {d.successes} successes
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SecurityOperationsDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [threats, setThreats] = useState<ThreatAlert[]>(MOCK_THREATS);
  const [hourlyData] = useState(generateHourlyData());
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setEvents(generateMockEvents());
      setLastRefresh(new Date());
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const threatLevel = overallThreatLevel(threats);
  const tlConfig = THREAT_LEVEL_CONFIG[threatLevel];
  const TLIcon = tlConfig.icon;
  const activeThreats = threats.filter((t) => !t.resolved);
  const criticalEvents = events.filter((e) => e.severity === 'critical').length;
  const blockedIPs = events.filter((e) => e.type === 'ip_blocked').length;

  const filteredEvents = events.filter((e) => {
    const matchText =
      filter === '' ||
      e.message.toLowerCase().includes(filter.toLowerCase()) ||
      (e.ip ?? '').includes(filter) ||
      (e.userId ?? '').includes(filter);
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    return matchText && matchType;
  });

  function handleAction(action: string, target?: string) {
    setActionMsg(`${action}${target ? `: ${target}` : ''}`);
    setTimeout(() => setActionMsg(null), 3000);
  }

  function resolveAlert(id: string) {
    setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, resolved: true } : t)));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Action Feedback */}
      {actionMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Action executed: {actionMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
            <Siren className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Security Operations Center</h1>
            <p className="text-xs text-slate-400">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold ${tlConfig.bg} ${tlConfig.className}`}
          >
            <TLIcon className="w-4 h-4" />
            Threat Level: {tlConfig.label}
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={ShieldAlert}
          label="Active Threats"
          value={activeThreats.length}
          sub="Unresolved"
          color="red"
        />
        <StatCard
          icon={Activity}
          label="Events (24h)"
          value={events.length}
          sub="Security events"
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Events"
          value={criticalEvents}
          sub="Needs attention"
          color="amber"
        />
        <StatCard
          icon={Ban}
          label="Blocked IPs"
          value={blockedIPs}
          sub="Last 24h"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: Events timeline + Failed login chart */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Failed Login Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-semibold text-white">
                  Failed Login Attempts — Last 24 Hours
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-red-500/70 inline-block" /> Failures
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-slate-600/50 inline-block" /> Successes
                </span>
              </div>
            </div>
            <BarChart data={hourlyData} />
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Security Events Timeline</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="login_failure">Login Failures</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
                  <option value="permission_denied">Permission Denied</option>
                  <option value="data_export">Data Exports</option>
                  <option value="ip_blocked">IP Blocked</option>
                </select>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter events..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded pl-7 pr-3 py-1 w-36"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {filteredEvents.slice(0, 30).map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SEV_DOT[evt.severity]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300 truncate">
                        {evt.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                        {relativeTime(evt.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {evt.ip && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {evt.ip}
                        </span>
                      )}
                      {evt.userId && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {evt.userId}
                        </span>
                      )}
                      {evt.country && <span>{evt.country}</span>}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                      evt.outcome === 'blocked'
                        ? 'bg-red-500/20 text-red-400'
                        : evt.outcome === 'failure'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {evt.outcome}
                  </span>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No events match filters
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Active Threats */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Siren className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-white">Active Threats</h2>
              <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                {activeThreats.length} unresolved
              </span>
            </div>

            <div className="space-y-2">
              {threats.map((t) => {
                const cfg = THREAT_LEVEL_CONFIG[t.severity];
                const TIcon = cfg.icon;
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${t.resolved ? 'opacity-40' : ''} ${cfg.bg}`}
                    onClick={() => setSelectedAlert(t)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TIcon className={`w-4 h-4 flex-shrink-0 ${cfg.className}`} />
                        <div>
                          <div className={`text-xs font-semibold ${cfg.className}`}>
                            {t.type.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                            {t.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-500">{relativeTime(t.detectedAt)}</span>
                        <span
                          className={`text-xs font-bold ${t.riskScore >= 80 ? 'text-red-400' : t.riskScore >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}
                        >
                          Risk: {t.riskScore}
                        </span>
                      </div>
                    </div>
                    {!t.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveAlert(t.id);
                        }}
                        className="mt-2 text-xs text-slate-400 hover:text-white underline"
                      >
                        Mark resolved
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Login Origins (24h)</h2>
            </div>
            <div className="space-y-2">
              {GEO_DISTRIBUTION.map((geo) => {
                const pct = (geo.count / GEO_DISTRIBUTION[0].count) * 100;
                return (
                  <div key={geo.countryCode} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 w-28 truncate">
                      {geo.country}
                    </span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${geo.blocked ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right">{geo.count}</span>
                    {geo.blocked && <Ban className="w-3 h-3 text-red-400 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rate Limit Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Rate Limit Status</h2>
            </div>
            <div className="space-y-3">
              {RATE_LIMIT_STATUS.map((rl) => {
                const pct = (rl.current / rl.limit) * 100;
                const color =
                  pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-500';
                return (
                  <div key={rl.endpoint}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 truncate max-w-[60%]">{rl.endpoint}</span>
                      <span
                        className={`font-medium ${pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-amber-400' : 'text-slate-400'}`}
                      >
                        {rl.current}/{rl.limit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Block IP Address', icon: Ban, action: 'block_ip', color: 'red' },
                { label: 'Revoke Session', icon: Lock, action: 'revoke_session', color: 'amber' },
                {
                  label: 'Force Password Reset',
                  icon: Key,
                  action: 'force_password_reset',
                  color: 'orange',
                },
                { label: 'Lock User Account', icon: Users, action: 'lock_account', color: 'red' },
                {
                  label: 'Export Security Report',
                  icon: Activity,
                  action: 'export_report',
                  color: 'blue',
                },
                {
                  label: 'Trigger Security Scan',
                  icon: Eye,
                  action: 'security_scan',
                  color: 'purple',
                },
              ].map(({ label, icon: Icon, action, color }) => (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors border
                    ${
                      color === 'red'
                        ? 'bg-red-500/10    hover:bg-red-500/20    text-red-400    border-red-500/20'
                        : color === 'amber'
                          ? 'bg-amber-500/10  hover:bg-amber-500/20  text-amber-400  border-amber-500/20'
                          : color === 'orange'
                            ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20'
                            : color === 'purple'
                              ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20'
                              : 'bg-blue-500/10   hover:bg-blue-500/20   text-blue-400   border-blue-500/20'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {label}
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API Usage */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">API Usage by Endpoint (24h)</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { endpoint: '/api/employees', calls: 12450, errors: 23 },
            { endpoint: '/api/payroll', calls: 3210, errors: 5 },
            { endpoint: '/api/auth', calls: 8920, errors: 145 },
            { endpoint: '/api/reports', calls: 1890, errors: 12 },
            { endpoint: '/api/attendance', calls: 5640, errors: 8 },
            { endpoint: '/api/analytics', calls: 2310, errors: 3 },
          ].map((api) => {
            const errRate = ((api.errors / api.calls) * 100).toFixed(1);
            return (
              <div
                key={api.endpoint}
                className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
              >
                <div className="text-xs font-medium text-slate-300 truncate mb-2">
                  {api.endpoint}
                </div>
                <div className="text-lg font-bold text-white">{api.calls.toLocaleString()}</div>
                <div
                  className={`text-xs mt-1 ${parseFloat(errRate) > 2 ? 'text-red-400' : 'text-slate-500'}`}
                >
                  {errRate}% error rate
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Siren className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-white">Threat Details</h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className={`px-3 py-2 rounded-lg border mb-4 ${THREAT_LEVEL_CONFIG[selectedAlert.severity].bg}`}
            >
              <div
                className={`text-sm font-bold ${THREAT_LEVEL_CONFIG[selectedAlert.severity].className}`}
              >
                {selectedAlert.type.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div className="text-xs text-slate-400 mt-1">{selectedAlert.description}</div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Risk Score</span>
                  <div className="font-bold text-white text-lg">{selectedAlert.riskScore}/100</div>
                </div>
                <div>
                  <span className="text-slate-500">Status</span>
                  <div
                    className={`font-semibold ${selectedAlert.resolved ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {selectedAlert.resolved ? 'Resolved' : 'Active'}
                  </div>
                </div>
                {selectedAlert.userId && (
                  <div>
                    <span className="text-slate-500">User ID</span>
                    <div className="text-white">{selectedAlert.userId}</div>
                  </div>
                )}
                {selectedAlert.ip && (
                  <div>
                    <span className="text-slate-500">Source IP</span>
                    <div className="text-white font-mono">{selectedAlert.ip}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleAction('block_ip', selectedAlert.ip);
                  setSelectedAlert(null);
                }}
                className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium"
              >
                Block IP
              </button>
              <button
                onClick={() => {
                  resolveAlert(selectedAlert.id);
                  setSelectedAlert(null);
                }}
                className="flex-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
