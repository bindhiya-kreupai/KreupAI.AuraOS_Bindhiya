'use client';

/**
 * EPIC-31 Executive Compliance Risk Heatmap & Command Center
 *
 * Enterprise executive cockpit for board-level compliance risk intelligence.
 * Aggregates data from all 21 compliance domains into a single interactive view.
 *
 * Layout: KPIs → Full-Width Heatmap → Analytics Charts → Top Risks Table → Drill-Down → Drawer
 */

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart2,
  Bell,
  BookOpen,
  Building,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Flag,
  Globe,
  Maximize2,
  Minimize2,
  Minus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  TrendingDown,
  TrendingUp,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface KpiSnapshot {
  totalRisks: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  openRisks: number;
  inProgress: number;
  resolvedLast30d: number;
  healthScore: number;
  countriesAtRisk: number;
  entitiesAtRisk: number;
  departmentsAtRisk: number;
  overdueCAPAs: number;
  escalatedFindings: number;
  repeatFindings: number;
  avgResolutionDays: number;
  avgRiskScore: number;
}

interface HeatmapCell {
  domain: string;
  country: string;
  flagCount: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  maxSeverity: Severity | null;
  riskScore: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  sourceRoute: string;
}

interface HeatmapData {
  cells: HeatmapCell[];
  totals: { flagsInScope: number; domains: number; countries: number };
}

interface TopRiskRow {
  id: string;
  ruleCode: string;
  domain: string;
  label: string;
  severity: Severity;
  status: string;
  countryCode: string;
  ageInDays: number;
  riskScore: number;
  sourceRoute: string;
}

interface AnalyticsData {
  topCountries: Array<{ name: string; score: number; count: number }>;
  topDomains: Array<{ name: string; score: number; count: number }>;
  topDepartments: Array<{ name: string; score: number; count: number }>;
  monthlyTrend: Array<{ month: string; open: number; resolved: number; critical: number }>;
  severityDistribution: Array<{ name: string; value: number; color: string }>;
  riskAging: { d0_30: number; d31_60: number; d61_90: number; d90plus: number };
  riskMovement: { newRisks: number; resolved: number; escalated: number };
}

interface FilterOptions {
  countries: string[];
  domains: string[];
  severities: string[];
  statuses: string[];
}

// ─── Filter Reducer ───────────────────────────────────────────────────────────
interface Filters {
  country: string;
  domain: string;
  severity: string;
  entity: string;
  department: string;
  dateFrom: string;
  dateTo: string;
  search: string;
  kpiFilter: string;
}

const initialFilters: Filters = {
  country: '',
  domain: '',
  severity: '',
  entity: '',
  department: '',
  dateFrom: '',
  dateTo: '',
  search: '',
  kpiFilter: '',
};

type FilterAction =
  | { type: 'SET'; key: keyof Filters; value: string }
  | { type: 'RESET' }
  | { type: 'RESET_KEY'; key: keyof Filters };

function filterReducer(state: Filters, action: FilterAction): Filters {
  switch (action.type) {
    case 'SET':
      return { ...state, [action.key]: action.value };
    case 'RESET':
      return initialFilters;
    case 'RESET_KEY':
      return { ...state, [action.key]: '' };
    default:
      return state;
  }
}

// ─── Colour utilities ─────────────────────────────────────────────────────────
function severityColor(s: Severity | null): string {
  if (s === 'CRITICAL') return 'bg-rose-600';
  if (s === 'HIGH') return 'bg-orange-500';
  if (s === 'MEDIUM') return 'bg-amber-400';
  if (s === 'LOW') return 'bg-emerald-400';
  return 'bg-slate-200 dark:bg-slate-700';
}

function scoreToGradient(score: number): string {
  if (score === 0) return '#94a3b8';
  if (score <= 20) return '#10b981';
  if (score <= 40) return '#eab308';
  if (score <= 60) return '#f59e0b';
  if (score <= 80) return '#f97316';
  return '#ef4444';
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: Severity | null }) {
  const colors: Record<string, string> = {
    CRITICAL:
      'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700',
    HIGH: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700',
    MEDIUM:
      'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
    LOW: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
  };
  if (!severity) return null;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[severity] ?? ''}`}
    >
      {severity}
    </span>
  );
}

function TrendIcon({ trend }: { trend: 'UP' | 'DOWN' | 'STABLE' }) {
  if (trend === 'UP') return <ArrowUp className="w-3 h-3 text-rose-500 shrink-0" />;
  if (trend === 'DOWN') return <ArrowDown className="w-3 h-3 text-emerald-500 shrink-0" />;
  return <Minus className="w-3 h-3 text-slate-400 shrink-0" />;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning';
  subtitle?: string;
  active?: boolean;
  onClick?: () => void;
  trend?: 'UP' | 'DOWN' | 'STABLE';
}

function KpiCard({
  label,
  value,
  icon: Icon,
  type,
  subtitle,
  active,
  onClick,
  trend,
}: KpiCardProps) {
  const styles = {
    critical: {
      bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50',
      icon: 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400',
      val: 'text-rose-700 dark:text-rose-400',
    },
    high: {
      bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50',
      icon: 'bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-400',
      val: 'text-orange-700 dark:text-orange-400',
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
      icon: 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400',
      val: 'text-amber-700 dark:text-amber-400',
    },
    low: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
      icon: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400',
      val: 'text-emerald-700 dark:text-emerald-400',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
      icon: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400',
      val: 'text-emerald-700 dark:text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
      icon: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400',
      val: 'text-amber-700 dark:text-amber-400',
    },
    info: {
      bg: 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800',
      icon: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      val: 'text-slate-900 dark:text-slate-100',
    },
  }[type];

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-left w-full flex flex-col gap-3 ${styles.bg} ${active ? 'ring-2 ring-slate-800 dark:ring-slate-300' : ''} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </span>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${styles.icon}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-1">
        <span className={`text-2xl font-black tracking-tight leading-none ${styles.val}`}>
          {value}
        </span>
        {trend && <TrendIcon trend={trend} />}
      </div>
      {subtitle && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
          {subtitle}
        </span>
      )}
    </button>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

// ─── Executive Risk Heatmap component ────────────────────────────────────────
interface ExecutiveRiskHeatmapProps {
  cells: HeatmapCell[];
  selectedCell: HeatmapCell | null;
  onCellClick: (cell: HeatmapCell) => void;
  onCellDoubleClick: (cell: HeatmapCell) => void;
}

function ExecutiveRiskHeatmap({
  cells,
  selectedCell,
  onCellClick,
  onCellDoubleClick,
}: ExecutiveRiskHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const domains = useMemo(() => [...new Set(cells.map((c) => c.domain))].sort(), [cells]);
  const countries = useMemo(() => [...new Set(cells.map((c) => c.country))].sort(), [cells]);

  const cellMap = useMemo(() => {
    const m = new Map<string, HeatmapCell>();
    for (const c of cells) m.set(`${c.domain}::${c.country}`, c);
    return m;
  }, [cells]);

  if (domains.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500 text-sm">
        <div className="text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No compliance risks found</p>
          <p className="text-xs mt-1">All domains are clean for the selected filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-auto">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Risk Score:
        </span>
        {[
          { label: 'None', color: 'bg-slate-200 dark:bg-slate-700' },
          { label: '1–20', color: 'bg-emerald-200 dark:bg-emerald-800' },
          { label: '21–40', color: 'bg-yellow-200 dark:bg-yellow-800' },
          { label: '41–60', color: 'bg-amber-300 dark:bg-amber-700' },
          { label: '61–80', color: 'bg-orange-400 dark:bg-orange-700' },
          { label: '81–100', color: 'bg-rose-500 dark:bg-rose-700' },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-slate-500 dark:text-slate-400">{l.label}</span>
          </span>
        ))}
        <span className="ml-auto flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3 text-rose-400" /> Worsening
          </span>
          <span className="flex items-center gap-1">
            <ArrowDown className="w-3 h-3 text-emerald-400" /> Improving
          </span>
          <span className="flex items-center gap-1">
            <Minus className="w-3 h-3" /> Stable
          </span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1 min-w-full">
          <thead>
            <tr>
              <th className="w-36 text-left p-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Domain \ Country
                </span>
              </th>
              {countries.map((c) => (
                <th key={c} className="text-center p-1 min-w-[80px]">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                    {c}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domains.map((domain) => (
              <tr key={domain}>
                <td className="p-1">
                  <span
                    className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block truncate max-w-[130px]"
                    title={domain}
                  >
                    {domain}
                  </span>
                </td>
                {countries.map((country) => {
                  const cell = cellMap.get(`${domain}::${country}`);
                  const isSelected =
                    selectedCell?.domain === domain && selectedCell?.country === country;
                  const isHovered =
                    hoveredCell?.domain === domain && hoveredCell?.country === country;
                  const bg = cell ? scoreToGradient(cell.riskScore) : '#e2e8f0';

                  return (
                    <td key={country} className="p-1">
                      <div
                        className={`relative rounded-lg h-14 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none ${isSelected ? 'ring-2 ring-slate-900 dark:ring-white scale-105' : ''} ${isHovered ? 'scale-105' : ''}`}
                        style={{ backgroundColor: bg + (cell ? '' : ''), opacity: cell ? 1 : 0.15 }}
                        onClick={() => cell && onCellClick(cell)}
                        onDoubleClick={() => cell && onCellDoubleClick(cell)}
                        onMouseEnter={(e) => {
                          if (cell) {
                            setHoveredCell(cell);
                            setTooltipPos({ x: e.clientX, y: e.clientY });
                          }
                        }}
                        onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {cell ? (
                          <>
                            <span className="text-sm font-black text-white drop-shadow">
                              {cell.riskScore}
                            </span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <span className="text-[9px] text-white/80">{cell.flagCount}F</span>
                              <TrendIcon trend={cell.trend} />
                            </div>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900 dark:bg-slate-950 text-white rounded-xl shadow-2xl p-3 min-w-[180px] text-xs border border-slate-700"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 60 }}
        >
          <div className="font-bold text-sm mb-1">{hoveredCell.domain}</div>
          <div className="text-slate-300 mb-2">{hoveredCell.country}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span className="text-slate-400">Risk Score</span>
            <span className="font-bold text-white">{hoveredCell.riskScore}</span>
            <span className="text-slate-400">Flags</span>
            <span>{hoveredCell.flagCount}</span>
            <span className="text-rose-400">Critical</span>
            <span>{hoveredCell.critical}</span>
            <span className="text-orange-400">High</span>
            <span>{hoveredCell.high}</span>
            <span className="text-amber-400">Medium</span>
            <span>{hoveredCell.medium}</span>
            <span className="text-emerald-400">Low</span>
            <span>{hoveredCell.low}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700 text-slate-400 text-[10px]">
            Click to filter · Double-click to open module
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drill-down tree ──────────────────────────────────────────────────────────
interface DrillNode {
  key: string;
  label: string;
  level: string;
  flagCount: number;
  riskScore: number;
  maxSeverity: Severity | null;
  severityCounts: Record<Severity, number>;
  topFive: Array<{ id: string; domain: string; severity: Severity; label?: string }>;
  children?: DrillNode[];
}

function DrillNodeRow({
  node,
  depth = 0,
  onSelect,
  selectedKey,
}: {
  node: DrillNode;
  depth?: number;
  onSelect: (n: DrillNode) => void;
  selectedKey?: string;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.key === selectedKey;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group ${isSelected ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => {
          onSelect(node);
          if (hasChildren) setExpanded((e) => !e);
        }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          )
        ) : (
          <span className="w-3.5 h-3.5 shrink-0" />
        )}
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${severityColor(node.maxSeverity)}`} />
        <span
          className={`text-xs font-semibold truncate flex-1 ${isSelected ? 'text-inherit' : 'text-slate-700 dark:text-slate-200'}`}
        >
          {node.label}
        </span>
        <span
          className={`text-[10px] font-bold ${isSelected ? 'text-inherit opacity-70' : 'text-slate-400'}`}
        >
          {node.flagCount}
        </span>
        <span
          className={`text-[10px] font-black shrink-0 ${isSelected ? 'text-inherit' : 'text-slate-500'}`}
        >
          {node.riskScore}
        </span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <DrillNodeRow
              key={child.key}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedKey={selectedKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Risk Detail Drawer ───────────────────────────────────────────────────────
function RiskDetailDrawer({
  cell,
  onClose,
  router,
}: {
  cell: HeatmapCell | null;
  onClose: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  if (!cell) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[420px] max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 z-50 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Risk Detail
            </p>
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {cell.domain} · {cell.country}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Score */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Risk Score
              </span>
              <SeverityBadge severity={cell.maxSeverity} />
            </div>
            <div className="flex items-end gap-3">
              <span
                className="text-4xl font-black"
                style={{ color: scoreToGradient(cell.riskScore) }}
              >
                {cell.riskScore}
              </span>
              <span className="text-sm text-slate-400 mb-1">/100</span>
              <div className="ml-auto flex items-center gap-1.5">
                <TrendIcon trend={cell.trend} />
                <span className="text-xs text-slate-400">
                  {cell.trend === 'UP'
                    ? 'Worsening'
                    : cell.trend === 'DOWN'
                      ? 'Improving'
                      : 'Stable'}
                </span>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${cell.riskScore}%`,
                  backgroundColor: scoreToGradient(cell.riskScore),
                }}
              />
            </div>
          </div>

          {/* Severity breakdown */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Severity Breakdown
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  [
                    'Critical',
                    cell.critical,
                    'text-rose-600 dark:text-rose-400',
                    'bg-rose-50 dark:bg-rose-950/30',
                  ],
                  [
                    'High',
                    cell.high,
                    'text-orange-600 dark:text-orange-400',
                    'bg-orange-50 dark:bg-orange-950/30',
                  ],
                  [
                    'Medium',
                    cell.medium,
                    'text-amber-600 dark:text-amber-400',
                    'bg-amber-50 dark:bg-amber-950/30',
                  ],
                  [
                    'Low',
                    cell.low,
                    'text-emerald-600 dark:text-emerald-400',
                    'bg-emerald-50 dark:bg-emerald-950/30',
                  ],
                ] as const
              ).map(([label, count, text, bg]) => (
                <div key={label} className={`rounded-lg p-3 ${bg}`}>
                  <div className={`text-xl font-black ${text}`}>{count}</div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total flags */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Flags
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {cell.flagCount}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Link
              href={cell.sourceRoute}
              className="flex items-center justify-between w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-900 dark:hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                Open {cell.domain} Module
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Export utility ───────────────────────────────────────────────────────────
function exportToCSV(risks: TopRiskRow[], filename = 'compliance-risks.csv') {
  const headers = [
    'ID',
    'Rule Code',
    'Domain',
    'Label',
    'Severity',
    'Status',
    'Country',
    'Age (Days)',
    'Risk Score',
  ];
  const rows = risks.map((r) => [
    r.id,
    r.ruleCode,
    r.domain,
    r.label,
    r.severity,
    r.status,
    r.countryCode,
    r.ageInDays,
    r.riskScore,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RiskHeatmapCommandCenter() {
  const router = useRouter();
  const [filters, dispatch] = useReducer(filterReducer, initialFilters);
  const [kpis, setKpis] = useState<KpiSnapshot | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [topRisks, setTopRisks] = useState<TopRiskRow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    countries: [],
    domains: [],
    severities: [],
    statuses: [],
  });
  const [drillTree, setDrillTree] = useState<DrillNode | null>(null);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [selectedNode, setSelectedNode] = useState<DrillNode | null>(null);
  const [drawerCell, setDrawerCell] = useState<HeatmapCell | null>(null);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);
  const [loadingRisks, setLoadingRisks] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [riskPage, setRiskPage] = useState(0);
  const [riskSearch, setRiskSearch] = useState('');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const PAGE_SIZE = 15;

  const qs = useCallback(
    (extra: Record<string, string> = {}) => {
      const p = new URLSearchParams();
      if (filters.country) p.set('country', filters.country);
      if (filters.domain) p.set('domain', filters.domain);
      if (filters.severity) p.set('severity', filters.severity);
      if (filters.entity) p.set('entity', filters.entity);
      if (filters.department) p.set('department', filters.department);
      if (filters.dateFrom) p.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) p.set('dateTo', filters.dateTo);
      Object.entries(extra).forEach(([k, v]) => p.set(k, v));
      return p.toString();
    },
    [filters]
  );

  const loadAll = useCallback(async () => {
    setLoadingKpis(true);
    setLoadingHeatmap(true);
    setLoadingRisks(true);
    setLoadingAnalytics(true);
    const q = qs();
    try {
      const [kRes, hRes, rRes, aRes, dRes] = await Promise.allSettled([
        fetch(`/api/v1/compliance-dashboard/kpis?${q}`).then((r) => r.json()),
        fetch(`/api/v1/compliance-dashboard/risk-heatmap?${q}`).then((r) => r.json()),
        fetch(`/api/v1/compliance-dashboard/top-risks?${q}&take=200`).then((r) => r.json()),
        fetch(`/api/v1/compliance-dashboard/analytics?${q}`).then((r) => r.json()),
        fetch(`/api/v1/compliance-dashboard/drill-down?${q}`).then((r) => r.json()),
      ]);
      if (kRes.status === 'fulfilled' && kRes.value.success) setKpis(kRes.value.data);
      if (hRes.status === 'fulfilled' && hRes.value.success) setHeatmap(hRes.value.data);
      if (rRes.status === 'fulfilled' && rRes.value.success)
        setTopRisks(rRes.value.data.risks ?? []);
      if (aRes.status === 'fulfilled' && aRes.value.success) setAnalytics(aRes.value.data);
      if (dRes.status === 'fulfilled' && dRes.value.success) setDrillTree(dRes.value.data);
      setLastRefresh(new Date());
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingKpis(false);
      setLoadingHeatmap(false);
      setLoadingRisks(false);
      setLoadingAnalytics(false);
    }
  }, [qs]);

  useEffect(() => {
    loadAll();
    fetch('/api/v1/compliance-dashboard/filter-options')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setFilterOptions(d.data);
      })
      .catch(() => {});
  }, [loadAll]);

  useEffect(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (autoRefreshInterval > 0) {
      refreshTimer.current = setInterval(loadAll, autoRefreshInterval * 1000);
    }
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [autoRefreshInterval, loadAll]);

  const filteredRisks = useMemo(() => {
    if (!riskSearch) return topRisks;
    const q = riskSearch.toLowerCase();
    return topRisks.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.domain.toLowerCase().includes(q) ||
        r.countryCode.toLowerCase().includes(q) ||
        r.ruleCode.toLowerCase().includes(q)
    );
  }, [topRisks, riskSearch]);

  const pagedRisks = useMemo(
    () => filteredRisks.slice(riskPage * PAGE_SIZE, (riskPage + 1) * PAGE_SIZE),
    [filteredRisks, riskPage]
  );
  const totalRiskPages = Math.ceil(filteredRisks.length / PAGE_SIZE);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'search' && k !== 'kpiFilter' && v !== ''
  ).length;

  const handleKpiFilter = (key: string) => {
    dispatch({ type: 'SET', key: 'kpiFilter', value: filters.kpiFilter === key ? '' : key });
    if (key === 'critical' || key === 'high' || key === 'medium' || key === 'low') {
      dispatch({
        type: 'SET',
        key: 'severity',
        value: filters.kpiFilter === key ? '' : key.toUpperCase(),
      });
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div
      className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none ${fullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}
    >
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* ── Header ── */}
        <header className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <nav className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mb-2">
                <Link href="/dashboard" className="hover:text-slate-600 dark:hover:text-slate-300">
                  Dashboard
                </Link>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href="/dashboard/compliance-dashboard"
                  className="hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Compliance
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Risk Heatmap
                </span>
              </nav>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                EPIC-31 · Executive Compliance Command Center
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-slate-50">
                Compliance Risk Heatmap
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Cross-domain risk intelligence · {heatmap?.totals.flagsInScope ?? '—'} flags in
                scope · {heatmap?.totals.domains ?? '—'} domains ×{' '}
                {heatmap?.totals.countries ?? '—'} countries
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastRefresh ? formatTime(lastRefresh) : '--:--:--'}
              </span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none"
              >
                <option value={0}>Manual refresh</option>
                <option value={30}>Auto 30s</option>
                <option value={60}>Auto 1m</option>
                <option value={300}>Auto 5m</option>
              </select>
              <button
                onClick={loadAll}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <button
                onClick={() => exportToCSV(topRisks)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Print
              </button>
              <button
                onClick={() => setFullscreen((f) => !f)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {fullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* ── Filter Bar ── */}
          <div className="flex flex-wrap gap-2 items-end">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                placeholder="Search risks, domains, countries…"
                value={filters.search}
                onChange={(e) => dispatch({ type: 'SET', key: 'search', value: e.target.value })}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 w-56 focus:outline-none focus:border-slate-500"
              />
            </div>
            <select
              value={filters.country}
              onChange={(e) => dispatch({ type: 'SET', key: 'country', value: e.target.value })}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Countries</option>
              {filterOptions.countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={filters.domain}
              onChange={(e) => dispatch({ type: 'SET', key: 'domain', value: e.target.value })}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Domains</option>
              {filterOptions.domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={filters.severity}
              onChange={(e) => dispatch({ type: 'SET', key: 'severity', value: e.target.value })}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Severities</option>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => dispatch({ type: 'SET', key: 'dateFrom', value: e.target.value })}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none"
              title="From date"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => dispatch({ type: 'SET', key: 'dateTo', value: e.target.value })}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none"
              title="To date"
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                <XCircle className="w-3.5 h-3.5" />
                Clear filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Risk movement banner */}
          {analytics && (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
                <TrendingUp className="w-3.5 h-3.5" />
                {analytics.riskMovement.newRisks} new risks (30d)
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <TrendingDown className="w-3.5 h-3.5" />
                {analytics.riskMovement.resolved} resolved (30d)
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-400">
                <Zap className="w-3.5 h-3.5" />
                {analytics.riskMovement.escalated} escalated (30d)
              </div>
            </div>
          )}
        </header>

        {/* ── KPI Cards ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Executive KPIs
          </h2>
          {loadingKpis ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : kpis ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
              <KpiCard
                label="Total Risks"
                value={kpis.totalRisks.toLocaleString()}
                icon={Flag}
                type="info"
                subtitle="All open risks"
                onClick={() => handleKpiFilter('total')}
                active={filters.kpiFilter === 'total'}
              />
              <KpiCard
                label="Critical"
                value={kpis.critical.toLocaleString()}
                icon={AlertOctagon}
                type="critical"
                subtitle="Immediate action"
                onClick={() => handleKpiFilter('critical')}
                active={filters.kpiFilter === 'critical'}
              />
              <KpiCard
                label="High"
                value={kpis.high.toLocaleString()}
                icon={ShieldAlert}
                type="high"
                subtitle="Priority review"
                onClick={() => handleKpiFilter('high')}
                active={filters.kpiFilter === 'high'}
              />
              <KpiCard
                label="Medium"
                value={kpis.medium.toLocaleString()}
                icon={AlertTriangle}
                type="medium"
                subtitle="Monitor closely"
                onClick={() => handleKpiFilter('medium')}
                active={filters.kpiFilter === 'medium'}
              />
              <KpiCard
                label="Health Score"
                value={`${kpis.healthScore}%`}
                icon={ShieldCheck}
                type={
                  kpis.healthScore >= 80
                    ? 'success'
                    : kpis.healthScore >= 60
                      ? 'warning'
                      : 'critical'
                }
                subtitle="Compliance posture"
              />
              <KpiCard
                label="Countries at Risk"
                value={kpis.countriesAtRisk}
                icon={Globe}
                type="info"
                subtitle="Distinct countries"
                onClick={() => {}}
              />
              <KpiCard
                label="Overdue CAPAs"
                value={kpis.overdueCAPAs}
                icon={Clock}
                type={kpis.overdueCAPAs > 0 ? 'critical' : 'success'}
                subtitle="Past due date"
                onClick={() => handleKpiFilter('overdue')}
                active={filters.kpiFilter === 'overdue'}
              />
              <KpiCard
                label="Escalated"
                value={kpis.escalatedFindings}
                icon={Bell}
                type={kpis.escalatedFindings > 0 ? 'high' : 'success'}
                subtitle="Critical >7 days"
                onClick={() => handleKpiFilter('escalated')}
                active={filters.kpiFilter === 'escalated'}
              />
              <KpiCard
                label="Repeat Findings"
                value={kpis.repeatFindings}
                icon={Activity}
                type={kpis.repeatFindings > 0 ? 'warning' : 'success'}
                subtitle="≥3 times in 90d"
              />
            </div>
          ) : null}
        </section>

        {/* ── Full-Width Heatmap ── */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-slate-400" />
                Domain × Country Risk Heatmap
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Click to filter · Double-click to open source compliance module
              </p>
            </div>
            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear selection
              </button>
            )}
          </div>
          {loadingHeatmap ? (
            <div className="h-72 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 dark:border-slate-100 border-t-transparent dark:border-t-transparent" />
            </div>
          ) : heatmap ? (
            <ExecutiveRiskHeatmap
              cells={heatmap.cells}
              selectedCell={selectedCell}
              onCellClick={(cell) => {
                setSelectedCell(cell);
                setDrawerCell(cell);
                dispatch({ type: 'SET', key: 'domain', value: cell.domain });
                dispatch({ type: 'SET', key: 'country', value: cell.country });
              }}
              onCellDoubleClick={(cell) => router.push(cell.sourceRoute)}
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              No heatmap data available
            </div>
          )}
        </section>

        {/* ── Analytics Row ── */}
        {analytics && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly Trend */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                12-Month Trend
              </h3>
              {loadingAnalytics ? (
                <Skeleton className="h-48" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={analytics.monthlyTrend}
                    margin={{ left: -20, right: 5, top: 5, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 9 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{
                        fontSize: '11px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="open"
                      name="Open"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#openGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="resolved"
                      name="Resolved"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#resolvedGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="critical"
                      name="Critical"
                      stroke="#f97316"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top Countries */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-slate-400" />
                Top Countries by Risk
              </h3>
              {loadingAnalytics ? (
                <Skeleton className="h-48" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={analytics.topCountries.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      strokeOpacity={0.5}
                      horizontal={false}
                    />
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={35} />
                    <Tooltip
                      contentStyle={{
                        fontSize: '11px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <Bar dataKey="score" name="Risk Score" radius={[0, 4, 4, 0]}>
                      {analytics.topCountries.slice(0, 8).map((entry, i) => (
                        <Cell key={i} fill={scoreToGradient(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Severity Distribution */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-slate-400" />
                Severity Distribution
              </h3>
              {loadingAnalytics ? (
                <Skeleton className="h-48" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={analytics.severityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analytics.severityDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          fontSize: '11px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {analytics.severityDistribution.map((s) => (
                      <div key={s.name} className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {s.name}: {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* ── Risk Aging ── */}
        {analytics && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              Risk Aging Analysis
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {(
                [
                  [
                    '0–30 Days',
                    analytics.riskAging.d0_30,
                    'text-emerald-600 dark:text-emerald-400',
                    'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
                  ],
                  [
                    '31–60 Days',
                    analytics.riskAging.d31_60,
                    'text-amber-600 dark:text-amber-400',
                    'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
                  ],
                  [
                    '61–90 Days',
                    analytics.riskAging.d61_90,
                    'text-orange-600 dark:text-orange-400',
                    'bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50',
                  ],
                  [
                    '90+ Days',
                    analytics.riskAging.d90plus,
                    'text-rose-600 dark:text-rose-400',
                    'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50',
                  ],
                ] as const
              ).map(([label, count, text, bg]) => (
                <div key={label} className={`rounded-xl border p-4 ${bg}`}>
                  <div className={`text-3xl font-black ${text}`}>{count}</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    {label}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {kpis && kpis.totalRisks > 0
                      ? `${Math.round((count / kpis.totalRisks) * 100)}%`
                      : '—'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Top Domains ── */}
        {analytics && analytics.topDomains.length > 0 && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-slate-400" />
              Top Compliance Domains by Risk Score
            </h2>
            <div className="space-y-2">
              {analytics.topDomains.slice(0, 8).map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <button
                    onClick={() => dispatch({ type: 'SET', key: 'domain', value: d.name })}
                    className="text-xs font-semibold text-slate-700 dark:text-slate-200 w-36 text-left truncate hover:text-slate-900 dark:hover:text-white"
                  >
                    {d.name}
                  </button>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${d.score}%`, backgroundColor: scoreToGradient(d.score) }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 w-8 text-right">
                    {d.score}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 w-12 text-right">
                    {d.count} flags
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Top Risks Table ── */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-slate-400" />
              Top Compliance Risks
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {filteredRisks.length.toLocaleString()}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input
                  value={riskSearch}
                  onChange={(e) => {
                    setRiskSearch(e.target.value);
                    setRiskPage(0);
                  }}
                  placeholder="Search risks…"
                  className="pl-7 pr-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 w-40 focus:outline-none"
                />
              </div>
              <button
                onClick={() => exportToCSV(filteredRisks)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>
          </div>

          {loadingRisks ? (
            <div className="p-5 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {[
                        'Rule Code',
                        'Domain',
                        'Label',
                        'Severity',
                        'Status',
                        'Country',
                        'Age',
                        'Score',
                        '',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-[10px]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRisks.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm"
                        >
                          No risks match the current filters
                        </td>
                      </tr>
                    ) : (
                      pagedRisks.map((r, i) => (
                        <tr
                          key={r.id}
                          className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}
                        >
                          <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            {r.ruleCode}
                          </td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() =>
                                dispatch({ type: 'SET', key: 'domain', value: r.domain })
                              }
                              className="font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                            >
                              {r.domain}
                            </button>
                          </td>
                          <td
                            className="px-4 py-2.5 text-slate-600 dark:text-slate-300 max-w-[200px] truncate"
                            title={r.label}
                          >
                            {r.label}
                          </td>
                          <td className="px-4 py-2.5">
                            <SeverityBadge severity={r.severity} />
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${r.status === 'OPEN' ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' : r.status === 'IN_PROGRESS' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'}`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() =>
                                dispatch({ type: 'SET', key: 'country', value: r.countryCode })
                              }
                              className="font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                            >
                              {r.countryCode}
                            </button>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                            {r.ageInDays}d
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className="font-black"
                              style={{ color: scoreToGradient(Math.min(100, r.riskScore)) }}
                            >
                              {r.riskScore}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <Link
                              href={r.sourceRoute}
                              className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalRiskPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Showing {riskPage * PAGE_SIZE + 1}–
                    {Math.min((riskPage + 1) * PAGE_SIZE, filteredRisks.length)} of{' '}
                    {filteredRisks.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={riskPage === 0}
                      onClick={() => setRiskPage((p) => p - 1)}
                      className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Prev
                    </button>
                    <span className="px-2 text-xs text-slate-500">
                      {riskPage + 1} / {totalRiskPages}
                    </span>
                    <button
                      disabled={riskPage >= totalRiskPages - 1}
                      onClick={() => setRiskPage((p) => p + 1)}
                      className="px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Drill-Down Tree ── */}
        {drillTree && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-slate-400" />
                Drill-Down: Global → Country → Entity → Department
              </h2>
              {selectedNode && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {selectedNode.label}
                  </span>
                  <span>·</span>
                  <span>{selectedNode.flagCount} flags</span>
                  <span>·</span>
                  <span
                    className="font-black"
                    style={{ color: scoreToGradient(selectedNode.riskScore) }}
                  >
                    {selectedNode.riskScore}
                  </span>
                  <SeverityBadge severity={selectedNode.maxSeverity} />
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="ml-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              <DrillNodeRow
                node={drillTree}
                onSelect={setSelectedNode}
                selectedKey={selectedNode?.key}
              />
            </div>
          </section>
        )}

        {/* ── Navigation Cards ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              href: '/dashboard/executive-compliance',
              title: '21-Domain RAG Status',
              sub: 'EPIC-31',
              desc: 'Full domain-level compliance scorecard with GREEN/AMBER/RED status across all 21 compliance domains.',
            },
            {
              href: '/dashboard/executive-compliance/corrective-action-register',
              title: 'Corrective Actions',
              sub: 'EPIC-31-S06',
              desc: 'Track CAPAs across all compliance modules with due dates, owners, and completion status.',
            },
            {
              href: '/dashboard/compliance-audit-register',
              title: 'Audit Register',
              sub: 'EPIC-32',
              desc: 'Full compliance audit checklist with evidence tracking and finding management.',
            },
            {
              href: '/dashboard/executive-compliance/compliance-review-calendar',
              title: 'Review Calendar',
              sub: 'EPIC-31-S07',
              desc: 'Scheduled compliance review items with overdue tracking and owner assignments.',
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 hover:border-slate-800 dark:hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                  {c.sub}
                </span>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1">
                  {c.title}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all ml-0.5 text-slate-400" />
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-1.5">
                  {c.desc}
                </p>
              </div>
              <div className="flex justify-end pt-4 mt-auto">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-900 dark:group-hover:bg-slate-100 text-slate-400 group-hover:text-white dark:group-hover:text-slate-900 transition-all">
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>

      {/* ── Risk Detail Drawer ── */}
      <RiskDetailDrawer cell={drawerCell} onClose={() => setDrawerCell(null)} router={router} />
    </div>
  );
}
