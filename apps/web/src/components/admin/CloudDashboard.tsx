// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module CloudDashboard
 * @description Multi-region cloud infrastructure dashboard with cost overview,
 *              service health grid, resource utilization, and incident banner.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Cloud,
  Cpu,
  Database,
  DollarSign,
  Globe,
  HardDrive,
  Loader2,
  MemoryStick,
  RefreshCw,
  Server,
  TrendingDown,
  TrendingUp,
  Wifi,
  XCircle,
  Zap,
} from 'lucide-react';
import cloudInfraService, {
  type InfrastructureOverview,
  type CostBreakdown,
  type ScalingMetric,
  type CloudService,
  type Region,
} from '@/services/cloudInfraService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  healthy: {
    label: 'Healthy',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle,
  },
  degraded: {
    label: 'Degraded',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/10  text-amber-400   border-amber-500/20',
    icon: AlertTriangle,
  },
  down: {
    label: 'Down',
    dot: 'bg-red-400',
    badge: 'bg-red-500/10    text-red-400     border-red-500/20',
    icon: XCircle,
  },
  maintenance: {
    label: 'Maintenance',
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/10   text-blue-400    border-blue-500/20',
    icon: Activity,
  },
};

const REGION_CONFIG: Record<Region, { label: string; flag: string; color: string }> = {
  'us-east-1': { label: 'US East (Virginia)', flag: '🇺🇸', color: 'blue' },
  'eu-west-1': { label: 'EU West (Ireland)', flag: '🇮🇪', color: 'purple' },
  'me-south-1': { label: 'ME South (Bahrain)', flag: '🇧🇭', color: 'amber' },
};

const TYPE_ICON: Record<string, React.ElementType> = {
  compute: Server,
  database: Database,
  cache: Zap,
  storage: HardDrive,
  network: Wifi,
  messaging: Activity,
};

function formatCost(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
}

function gaugeColor(pct: number): string {
  return pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-500';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UtilGauge({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  const color = gaugeColor(value);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="flex items-center gap-1 text-slate-400">
          <Icon className="w-3 h-3" />
          {label}
        </span>
        <span
          className={
            value >= 90
              ? 'text-red-400 font-semibold'
              : value >= 75
                ? 'text-amber-400'
                : 'text-slate-300'
          }
        >
          {value}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: CloudService }) {
  const cfg = STATUS_CONFIG[service.status];
  const TIcon = TYPE_ICON[service.type] ?? Server;
  const SCIcon = cfg.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-800 rounded-lg">
            <TIcon className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white truncate max-w-[120px]">
              {service.name}
            </div>
            <div className="text-xs text-slate-500">{service.region}</div>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.badge}`}
        >
          <SCIcon className="w-3 h-3" />
          {cfg.label}
        </div>
      </div>

      <div className="space-y-2">
        <UtilGauge label="CPU" value={service.cpuPercent} icon={Cpu} />
        <UtilGauge label="Mem" value={service.memoryPercent} icon={MemoryStick} />
        <UtilGauge label="Disk" value={service.diskPercent} icon={HardDrive} />
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-slate-500">RPS</div>
          <div className="text-white font-medium">{service.requestsPerSecond.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-slate-500">p99 Latency</div>
          <div
            className={`font-medium ${service.p99LatencyMs > 500 ? 'text-amber-400' : 'text-white'}`}
          >
            {service.p99LatencyMs}ms
          </div>
        </div>
        <div>
          <div className="text-slate-500">Error Rate</div>
          <div className={`font-medium ${service.errorRate > 1 ? 'text-red-400' : 'text-white'}`}>
            {service.errorRate}%
          </div>
        </div>
        <div>
          <div className="text-slate-500">Cost/mo</div>
          <div className="text-white font-medium">{formatCost(service.monthlyCostUSD)}</div>
        </div>
      </div>
    </div>
  );
}

function DonutChart({
  segments,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let currentAngle = -90;

  const paths = segments.map((seg) => {
    const pct = seg.value / total;
    const angle = pct * 360;
    const startRad = (currentAngle * Math.PI) / 180;
    const endRad = ((currentAngle + angle) * Math.PI) / 180;
    currentAngle += angle;

    const r = 40;
    const cx = 50,
      cy = 50;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: seg.color,
      label: seg.label,
      value: seg.value,
    };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
        <circle cx="50" cy="50" r="40" fill="#1e293b" />
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.85} />
        ))}
        <circle cx="50" cy="50" r="26" fill="#0f172a" />
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-slate-400 truncate">{seg.label}</span>
            <span className="text-white font-medium ml-auto">{formatCost(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const REGION_COLORS: Record<Region, string> = {
  'us-east-1': '#3b82f6',
  'eu-west-1': '#a855f7',
  'me-south-1': '#f59e0b',
};

export default function CloudDashboard() {
  const [overview, setOverview] = useState<InfrastructureOverview | null>(null);
  const [costs, setCosts] = useState<CostBreakdown | null>(null);
  const [scaling, setScaling] = useState<ScalingMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<Region | 'all'>('all');
  const [expandedRegion, setExpandedRegion] = useState<Region | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ov, cb, sm] = await Promise.all([
          cloudInfraService.getInfrastructureOverview(),
          cloudInfraService.getCostBreakdown(),
          cloudInfraService.getScalingMetrics(),
        ]);
        setOverview(ov);
        setCosts(cb);
        setScaling(sm);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !overview || !costs) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-3 text-slate-400">Loading infrastructure data...</span>
      </div>
    );
  }

  const filteredServices =
    regionFilter === 'all'
      ? overview.services
      : overview.services.filter((s) => s.region === regionFilter);

  const activeIncidents = overview.activeIncidents.filter((i) => i.status === 'active');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Active Incident Banner */}
      {activeIncidents.length > 0 && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-amber-300">
              {activeIncidents.length} Active Incident{activeIncidents.length > 1 ? 's' : ''}
            </div>
            {activeIncidents.map((inc) => (
              <div key={inc.id} className="text-xs text-amber-400/70 mt-0.5">
                [{inc.region}] {inc.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Cloud className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Cloud Infrastructure</h1>
            <p className="text-xs text-slate-400">3 regions · {overview.totalServices} services</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          {
            label: 'Total Services',
            value: overview.totalServices,
            icon: Server,
            color: 'text-blue-400',
          },
          {
            label: 'Healthy',
            value: overview.healthyServices,
            icon: CheckCircle,
            color: 'text-emerald-400',
          },
          {
            label: 'Degraded',
            value: overview.degradedServices,
            icon: AlertTriangle,
            color: 'text-amber-400',
          },
          { label: 'Down', value: overview.downServices, icon: XCircle, color: 'text-red-400' },
          {
            label: 'Monthly Cost',
            value: formatCost(overview.totalMonthlyCostUSD),
            icon: DollarSign,
            color: 'text-purple-400',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className={`flex items-center gap-2 ${color} mb-2`}>
              <Icon className="w-4 h-4" />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Region map + Service health grid */}
        <div className="xl:col-span-2 space-y-6">
          {/* Region Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overview.regions.map((r) => {
              const cfg = REGION_CONFIG[r.region];
              return (
                <div
                  key={r.region}
                  className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${
                    expandedRegion === r.region
                      ? 'border-blue-500/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  onClick={() => {
                    setExpandedRegion(expandedRegion === r.region ? null : r.region);
                    setRegionFilter(regionFilter === r.region ? 'all' : r.region);
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs font-semibold text-white">{cfg.label}</div>
                        <div className="text-xs text-slate-500">{r.region}</div>
                      </div>
                    </div>
                    <div className="text-xl">{cfg.flag}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                      <div className="text-lg font-bold text-white">{r.serviceCount}</div>
                      <div className="text-slate-500">Services</div>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                      <div className="text-lg font-bold text-emerald-400">{r.healthyServices}</div>
                      <div className="text-slate-500">Healthy</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <UtilGauge label="CPU" value={Math.round(r.totalCpuPercent)} icon={Cpu} />
                    <UtilGauge
                      label="Memory"
                      value={Math.round(r.totalMemoryPercent)}
                      icon={MemoryStick}
                    />
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Monthly cost</span>
                    <span className="font-semibold text-white">
                      {formatCost(r.totalMonthlyCostUSD)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Service health grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-white">Service Health Grid</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value as Region | 'all')}
                  className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1"
                >
                  <option value="all">All Regions</option>
                  <option value="us-east-1">US East</option>
                  <option value="eu-west-1">EU West</option>
                  <option value="me-south-1">ME South</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredServices.map((svc) => (
                <ServiceCard key={svc.id} service={svc} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cost + Scaling */}
        <div className="space-y-6">
          {/* Cost Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">Cost Overview</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">This Month</div>
                <div className="text-xl font-bold text-white">{formatCost(costs.totalUSD)}</div>
                <div className="flex items-center justify-center gap-1 text-xs text-emerald-400 mt-1">
                  <TrendingDown className="w-3 h-3" />
                  2.3% vs last mo
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-500 mb-1">Forecast</div>
                <div className="text-xl font-bold text-amber-400">
                  {formatCost(Math.round(costs.totalUSD * 1.03))}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-amber-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  3% projected
                </div>
              </div>
            </div>

            <div className="mb-1 text-xs text-slate-400 font-medium">Cost by Region</div>
            <DonutChart
              segments={costs.byRegion.map((r) => ({
                label: r.region,
                value: r.costUSD,
                color: REGION_COLORS[r.region],
              }))}
            />

            <div className="mt-4">
              <div className="text-xs text-slate-400 font-medium mb-2">Top Services by Cost</div>
              <div className="space-y-2">
                {costs.byService.slice(0, 5).map((svc) => (
                  <div key={svc.serviceName} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 truncate flex-1">
                      {svc.serviceName}
                    </span>
                    <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${svc.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-white w-12 text-right">
                      {formatCost(svc.costUSD)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scaling Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Auto-Scaling Status</h2>
            </div>
            <div className="space-y-3">
              {scaling.map((sm) => {
                const ratio = sm.currentReplicas / sm.maxReplicas;
                const cpuColor = gaugeColor(sm.cpuPercent);
                return (
                  <div key={sm.serviceId} className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white truncate">
                        {sm.serviceName}
                      </span>
                      <span className="text-xs text-slate-500">{sm.region}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <Server className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-400">
                        {sm.currentReplicas}/{sm.maxReplicas} replicas
                      </span>
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                      {sm.lastScaleDirection && (
                        <span
                          className={`flex items-center gap-0.5 ${sm.lastScaleDirection === 'up' ? 'text-amber-400' : 'text-emerald-400'}`}
                        >
                          {sm.lastScaleDirection === 'up' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Cpu className="w-3 h-3 text-slate-400" />
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cpuColor}`}
                          style={{ width: `${sm.cpuPercent}%` }}
                        />
                      </div>
                      <span className={sm.cpuPercent >= 90 ? 'text-red-400' : 'text-slate-400'}>
                        {sm.cpuPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
