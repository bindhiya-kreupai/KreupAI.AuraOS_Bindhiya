'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Shield,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Calendar,
  Clock,
  Building,
  AlertCircle,
  Eye,
  RefreshCw,
  BarChart3,
  LineChart as LineChartIcon,
  Target,
  Award,
  X,
  Check,
  Info,
  Users,
  Flag,
  Banknote,
  Gauge,
  ClipboardCheck,
  Scale,
  Sparkles,
  Hash,
  Percent,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  period: string;
  entitiesInScope: number;
  entitiesAtTarget: number;
  totalMissedHires: number;
  totalProjectedFines: number;
  fakeRiskCount: number;
}

interface EstablishmentConfig {
  id: string;
  legalEntityId: string | null;
  legalEntity?: {
    name: string;
  } | null;
  establishmentName: string;
  tradeLicenseNumber: string | null;
  sector: string | null;
  skilledWorkforceCount: number;
  inScope: boolean;
  scopedAt: string | null;
}

interface Target {
  id: string;
  legalEntityId: string | null;
  legalEntity?: {
    name: string;
  } | null;
  year: number;
  halfYearTargetPct: string;
  yearEndTargetPct: string;
  finePerMissedHire: string;
  currency: string;
}

interface Hire {
  id: string;
  legalEntityId: string | null;
  legalEntity?: {
    name: string;
  } | null;
  employeeId: string;
  employee?: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
  hireDate: string;
  jobLevel: string | null;
  isSkilled: boolean;
  nafisReference: string | null;
  gpssaRegistered: boolean;
  wpsCovered: boolean;
  fakeRiskScore: number;
  fakeRiskFlags: string[];
  employmentStatus?: string;
}

interface Snapshot {
  id: string;
  legalEntityId: string | null;
  legalEntity?: {
    name: string;
  } | null;
  checkpointDate: string;
  checkpoint: string;
  skilledHeadcount: number;
  uaeNationalCount: number;
  actualPct: string;
  targetPct: string;
  gapPct: string;
  missedHires: number;
  projectedFine: string;
  ragStatus: string;
  year?: number;
}

interface Fine {
  id: string;
  legalEntityId: string | null;
  legalEntity?: {
    name: string;
  } | null;
  year: number;
  checkpoint: string;
  missedHires: number;
  amount: string;
  currency: string;
  status: string;
  incurredAt: string | null;
  resolvedAt: string | null;
}

interface Certificate {
  id: string;
  period: string;
  status: string;
  entitiesInScope: number;
  entitiesAtTarget: number;
  totalMissedHires: number;
  totalProjectedFines: string;
  fakeRiskCount: number;
  gatingReason: string | null;
  generatedBy?: string | null;
  generatedAt?: string | null;
  signedBy?: string | null;
  signedAt?: string | null;
}

type WorkspaceTab =
  | 'establishments'
  | 'targets'
  | 'employees'
  | 'checkpoints'
  | 'fines'
  | 'certificates';

type DrawerRecord =
  | { type: 'establishment'; data: EstablishmentConfig }
  | { type: 'target'; data: Target }
  | { type: 'employee'; data: Hire }
  | { type: 'checkpoint'; data: Snapshot }
  | { type: 'fine'; data: Fine }
  | { type: 'certificate'; data: Certificate }
  | null;

interface ReadinessScore {
  total: number;
  label: string;
  color: string;
  bgColor: string;
  breakdown: ReadinessFactor[];
}

interface ReadinessFactor {
  name: string;
  points: number;
  earned: number;
  status: 'pass' | 'fail' | 'partial';
  detail: string;
}

interface ComplianceInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'critical';
  message: string;
  action?: string;
}

// ─── Utility Functions ────────────────────────────────────────────────────────

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const formatCurrency = (value: number | string, currency = 'AED'): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${currency} 0.00`;
  if (Math.abs(num) >= 1_000_000_000) return `${currency} ${(num / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(num) >= 1_000_000) return `${currency} ${(num / 1_000_000).toFixed(2)}M`;
  if (Math.abs(num) >= 1_000) return `${currency} ${(num / 1_000).toFixed(2)}K`;
  return `${currency} ${num.toFixed(2)}`;
};

const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString();
};

const formatPct = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00%';
  return `${num.toFixed(2)}%`;
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCurrentYear = () => new Date().getFullYear();

/** Resolve a company/entity name from the relation, then companiesList, then fallback */
const resolveEntityName = (
  legalEntityId: string | null,
  legalEntity: { name: string } | null | undefined,
  companiesList: any[],
  fallback = 'All Entities'
): string => {
  if (legalEntity?.name) return legalEntity.name;
  if (!legalEntityId) return fallback;
  const found = companiesList.find((c) => c.id === legalEntityId);
  return found?.name ?? found?.legalName ?? found?.companyName ?? legalEntityId;
};

/** Resolve employee full name from the relation or employeesList */
const resolveEmployeeName = (
  employeeId: string,
  employee: { firstName: string; lastName: string; employeeCode: string } | null | undefined,
  employeesList: any[]
): string => {
  if (employee?.firstName)
    return `${employee.firstName} ${employee.lastName} (${employee.employeeCode})`;
  const found = employeesList.find((e) => e.id === employeeId || e.employeeCode === employeeId);
  if (found)
    return (
      `${found.firstName ?? ''} ${found.lastName ?? ''}`.trim() || found.employeeCode || employeeId
    );
  return employeeId;
};

const getNextCheckpoint = (): { name: string; daysLeft: number; date: string } => {
  const now = new Date();
  const year = now.getFullYear();
  const midYear = new Date(year, 5, 30); // Jun 30
  const yearEnd = new Date(year, 11, 31); // Dec 31
  const target = now < midYear ? midYear : yearEnd;
  const name = now < midYear ? 'Mid-Year Review' : 'Year-End Review';
  const daysLeft = Math.max(
    0,
    Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  return {
    name,
    daysLeft,
    date: target.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
};

const computeReadinessScore = (
  dashboard: DashboardData | null,
  hires: Hire[],
  snapshots: Snapshot[],
  certs: Certificate[]
): ReadinessScore => {
  if (!dashboard) {
    return {
      total: 0,
      label: 'No Data',
      color: 'text-slate-500',
      bgColor: 'bg-slate-100',
      breakdown: [],
    };
  }

  const factors: ReadinessFactor[] = [];

  // 1. Emiratisation Target (20 pts)
  const targetRatio =
    dashboard.entitiesInScope > 0 ? dashboard.entitiesAtTarget / dashboard.entitiesInScope : 0;
  const targetEarned = Math.round(targetRatio * 20);
  factors.push({
    name: 'Emiratisation Target Achievement',
    points: 20,
    earned: targetEarned,
    status: targetRatio >= 1 ? 'pass' : targetRatio >= 0.5 ? 'partial' : 'fail',
    detail: `${dashboard.entitiesAtTarget} of ${dashboard.entitiesInScope} entities at target`,
  });

  // 2. GPSSA Registration (15 pts)
  const gpssaCount = hires.filter((h) => h.gpssaRegistered).length;
  const gpssaRatio = hires.length > 0 ? gpssaCount / hires.length : 1;
  const gpssaEarned = Math.round(gpssaRatio * 15);
  factors.push({
    name: 'GPSSA Registration Completeness',
    points: 15,
    earned: gpssaEarned,
    status: gpssaRatio >= 1 ? 'pass' : gpssaRatio >= 0.8 ? 'partial' : 'fail',
    detail: `${gpssaCount} of ${hires.length} employees registered`,
  });

  // 3. NAFIS Registration (15 pts)
  const nafisCount = hires.filter((h) => h.nafisReference).length;
  const nafisRatio = hires.length > 0 ? nafisCount / hires.length : 1;
  const nafisEarned = Math.round(nafisRatio * 15);
  factors.push({
    name: 'NAFIS Registration Completeness',
    points: 15,
    earned: nafisEarned,
    status: nafisRatio >= 1 ? 'pass' : nafisRatio >= 0.8 ? 'partial' : 'fail',
    detail: `${nafisCount} of ${hires.length} employees linked`,
  });

  // 4. WPS Compliance (15 pts)
  const wpsCount = hires.filter((h) => h.wpsCovered).length;
  const wpsRatio = hires.length > 0 ? wpsCount / hires.length : 1;
  const wpsEarned = Math.round(wpsRatio * 15);
  factors.push({
    name: 'WPS Compliance',
    points: 15,
    earned: wpsEarned,
    status: wpsRatio >= 1 ? 'pass' : wpsRatio >= 0.8 ? 'partial' : 'fail',
    detail: `${wpsCount} of ${hires.length} employees covered`,
  });

  // 5. No Fake Employment (15 pts)
  const highRiskCount = hires.filter((h) => h.fakeRiskScore >= 50).length;
  const fakeRisk = dashboard.fakeRiskCount;
  const fakeEarned = fakeRisk === 0 ? 15 : Math.max(0, 15 - fakeRisk * 3);
  factors.push({
    name: 'Fake Employment Risk',
    points: 15,
    earned: Math.min(15, fakeEarned),
    status: fakeRisk === 0 ? 'pass' : fakeRisk <= 2 ? 'partial' : 'fail',
    detail:
      fakeRisk === 0 ? 'No fake employment flags' : `${fakeRisk} high-risk employee(s) detected`,
  });

  // 6. Outstanding Fines (10 pts)
  const fineEarned = dashboard.totalProjectedFines === 0 ? 10 : 0;
  factors.push({
    name: 'Outstanding Projected Fines',
    points: 10,
    earned: fineEarned,
    status: dashboard.totalProjectedFines === 0 ? 'pass' : 'fail',
    detail:
      dashboard.totalProjectedFines === 0
        ? 'No outstanding projected fines'
        : `${formatCurrency(dashboard.totalProjectedFines)} projected`,
  });

  // 7. Certificate Readiness (10 pts)
  const latestCert = certs[0];
  const certEarned = latestCert?.status === 'SIGNED' ? 10 : latestCert?.status === 'DRAFT' ? 5 : 0;
  factors.push({
    name: 'Certificate Readiness',
    points: 10,
    earned: certEarned,
    status:
      latestCert?.status === 'SIGNED'
        ? 'pass'
        : latestCert?.status === 'DRAFT'
          ? 'partial'
          : 'fail',
    detail: latestCert
      ? `Certificate status: ${latestCert.status}`
      : 'No certificate generated for current period',
  });

  const total = factors.reduce((sum, f) => sum + f.earned, 0);
  const label = total >= 90 ? 'Excellent' : total >= 75 ? 'Good' : total >= 60 ? 'Fair' : 'At Risk';
  const color =
    total >= 90
      ? 'text-emerald-600'
      : total >= 75
        ? 'text-blue-600'
        : total >= 60
          ? 'text-amber-600'
          : 'text-rose-600';
  const bgColor =
    total >= 90
      ? 'bg-emerald-50 border-emerald-200'
      : total >= 75
        ? 'bg-blue-50 border-blue-200'
        : total >= 60
          ? 'bg-amber-50 border-amber-200'
          : 'bg-rose-50 border-rose-200';

  return { total, label, color, bgColor, breakdown: factors };
};

const generateInsights = (
  dashboard: DashboardData | null,
  hires: Hire[],
  targets: Target[],
  snapshots: Snapshot[]
): ComplianceInsight[] => {
  if (!dashboard) return [];
  const insights: ComplianceInsight[] = [];

  const missedHires = dashboard.totalMissedHires;
  if (missedHires > 0) {
    insights.push({
      id: 'missed-hires',
      type: 'critical',
      message: `Hire ${missedHires} additional UAE National${missedHires > 1 ? 's' : ''} before the next checkpoint to eliminate projected penalties.`,
      action: 'View Employees',
    });
  }

  const nonCompliantEntities = dashboard.entitiesInScope - dashboard.entitiesAtTarget;
  if (nonCompliantEntities > 0) {
    insights.push({
      id: 'non-compliant-entities',
      type: 'warning',
      message: `${nonCompliantEntities} legal entit${nonCompliantEntities > 1 ? 'ies remain' : 'y remains'} below the statutory Emiratisation threshold.`,
      action: 'View Establishments',
    });
  }

  const gpssaMissing = hires.filter((h) => !h.gpssaRegistered).length;
  if (gpssaMissing > 0) {
    insights.push({
      id: 'gpssa-missing',
      type: 'warning',
      message: `${gpssaMissing} employee${gpssaMissing > 1 ? 's' : ''} require GPSSA registration to be counted in Emiratisation compliance.`,
      action: 'View Employees',
    });
  }

  const nafissMissing = hires.filter((h) => !h.nafisReference).length;
  if (nafissMissing > 0) {
    insights.push({
      id: 'nafis-missing',
      type: 'warning',
      message: `NAFIS records missing for ${nafissMissing} eligible employee${nafissMissing > 1 ? 's' : ''}.`,
      action: 'View Employees',
    });
  }

  if (dashboard.fakeRiskCount > 0) {
    insights.push({
      id: 'fake-risk',
      type: 'critical',
      message: `${dashboard.fakeRiskCount} high-risk employment record${dashboard.fakeRiskCount > 1 ? 's' : ''} detected. These may be excluded from compliance counts upon government inspection.`,
      action: 'View Employees',
    });
  }

  if (dashboard.totalProjectedFines > 0) {
    insights.push({
      id: 'projected-fines',
      type: 'warning',
      message: `Projected government penalties of ${formatCurrency(dashboard.totalProjectedFines)} are outstanding for the current compliance period.`,
      action: 'View Fines',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'all-clear',
      type: 'success',
      message:
        'All compliance indicators are within acceptable thresholds. Excellent government readiness posture.',
    });
  }

  return insights;
};

// ─── Color Maps ───────────────────────────────────────────────────────────────

const ragColor: Record<string, { bg: string; text: string; dot: string }> = {
  GREEN: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  AMBER: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  RED: {
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
};

const fineStatusColor: Record<string, string> = {
  PROJECTED: 'bg-amber-50 text-amber-800 border-amber-200',
  INCURRED: 'bg-rose-50 text-rose-800 border-rose-200',
  RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

const certStatusColor: Record<string, string> = {
  DRAFT: 'bg-blue-50 text-blue-800 border-blue-200',
  SIGNED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
};

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-slate-100 animate-pulse"
            style={{ width: `${60 + Math.random() * 40}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({
  icon: Icon = FileText,
  title,
  description,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <tr>
      <td colSpan={20}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
            <Icon className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className="mt-1 text-xs text-slate-500 max-w-xs">{description}</p>
        </div>
      </td>
    </tr>
  );
}

function StatusPill({ status, colorMap }: { status: string; colorMap?: Record<string, string> }) {
  const defaultColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-700 border-slate-200',
    OPEN: 'bg-amber-50 text-amber-800 border-amber-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const colors = colorMap ?? defaultColors;
  const cls = colors[status] ?? 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}

function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  onClick,
  trend,
  trendUp,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-200' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      {onClick && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity hover:opacity-100" />
      )}
    </motion.div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}

function TableHeaderCell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

function ActionButton({
  onClick,
  variant = 'default',
  size = 'sm',
  children,
  disabled = false,
  loading = false,
}: {
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}) {
  const variantCls = {
    default: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300',
    primary: 'border-indigo-200 bg-indigo-600 text-white hover:bg-indigo-700 border-transparent',
    danger: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    success: 'border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 border-transparent',
    ghost: 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100',
  }[variant];

  const sizeCls = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantCls} ${sizeCls}`}
    >
      {loading && (
        <span className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  description,
  details,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  loading = false,
}: {
  open: boolean;
  title: string;
  description: string;
  details?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        >
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
          {details && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{details}</div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <ActionButton onClick={onCancel} variant="ghost">
              Cancel
            </ActionButton>
            <ActionButton onClick={onConfirm} variant={confirmVariant} loading={loading}>
              {confirmLabel}
            </ActionButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Government Readiness Gauge ───────────────────────────────────────────────

function ReadinessGauge({ score, onClick }: { score: ReadinessScore; onClick: () => void }) {
  const pct = score.total;
  const strokeDasharray = 157; // 2π × 25
  const strokeDashoffset = strokeDasharray - (strokeDasharray * pct) / 100;
  const gaugeColor =
    pct >= 90 ? '#16a34a' : pct >= 75 ? '#2563eb' : pct >= 60 ? '#d97706' : '#dc2626';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all hover:shadow-md ${score.bgColor}`}
      title="Click for readiness breakdown"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        Gov. Readiness
      </p>
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 60 60" className="rotate-[-90deg]">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black ${score.color}`}>{pct}</span>
        </div>
      </div>
      <p className={`mt-1 text-xs font-bold ${score.color}`}>{score.label}</p>
      <p className="mt-1 text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">
        Click for details ›
      </p>
    </button>
  );
}

// ─── Readiness Breakdown Modal ────────────────────────────────────────────────

function ReadinessBreakdownModal({
  open,
  score,
  onClose,
}: {
  open: boolean;
  score: ReadinessScore;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold">
                  Government Readiness Score
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-black">{score.total}</span>
                  <span className="text-2xl text-indigo-200">/ 100</span>
                </div>
                <p className="mt-1 text-lg font-bold">{score.label}</p>
              </div>
              <Gauge className="h-16 w-16 text-indigo-200 opacity-50" />
            </div>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">
              Score Breakdown
            </p>
            <div className="space-y-3">
              {score.breakdown.map((factor) => (
                <div key={factor.name} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {factor.status === 'pass' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : factor.status === 'partial' ? (
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-slate-800">{factor.name}</span>
                    </div>
                    <span
                      className={`text-sm font-black shrink-0 ${factor.earned === factor.points ? 'text-emerald-600' : factor.earned > 0 ? 'text-amber-600' : 'text-rose-600'}`}
                    >
                      {factor.earned}/{factor.points}
                    </span>
                  </div>
                  <p className="mt-1.5 ml-6 text-xs text-slate-500">{factor.detail}</p>
                  <div className="mt-2 ml-6 h-1.5 rounded-full bg-slate-100">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-700 ${factor.status === 'pass' ? 'bg-emerald-500' : factor.status === 'partial' ? 'bg-amber-400' : 'bg-rose-400'}`}
                      style={{ width: `${(factor.earned / factor.points) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 p-4 flex justify-end">
            <ActionButton onClick={onClose} variant="ghost">
              Close
            </ActionButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── MOHRE Inspection Panel ───────────────────────────────────────────────────

function MOHREInspectionPanel({
  score,
  hires,
  certs,
}: {
  score: ReadinessScore;
  hires: Hire[];
  certs: Certificate[];
}) {
  const gpssaOk = hires.every((h) => h.gpssaRegistered);
  const nafisOk = hires.every((h) => !!h.nafisReference);
  const wpsOk = hires.every((h) => h.wpsCovered);
  const fakeOk = !hires.some((h) => h.fakeRiskScore >= 50);
  const targetFactor = score.breakdown.find((f) => f.name.includes('Target'));
  const targetOk = targetFactor?.status === 'pass';
  const certOk = certs[0]?.status === 'SIGNED';
  const certGenerated = !!certs[0];

  const checks = [
    { label: 'Emiratisation target achieved', ok: targetOk },
    { label: 'GPSSA registrations verified', ok: gpssaOk },
    { label: 'WPS coverage verified', ok: wpsOk },
    { label: 'NAFIS records linked', ok: nafisOk },
    { label: 'No fake employment detected', ok: fakeOk },
    { label: 'Certificate generated', ok: certGenerated },
    { label: 'Certificate signed', ok: certOk },
  ];

  const blockers = checks.filter((c) => !c.ok);
  const ready = blockers.length === 0;

  return (
    <div
      className={`rounded-2xl border-2 p-5 ${ready ? 'border-emerald-200 bg-emerald-50' : blockers.length <= 2 ? 'border-amber-200 bg-amber-50' : 'border-rose-200 bg-rose-50'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck
            className={`h-5 w-5 ${ready ? 'text-emerald-600' : blockers.length <= 2 ? 'text-amber-600' : 'text-rose-600'}`}
          />
          <span className="text-sm font-bold text-slate-900">MOHRE Inspection</span>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${ready ? 'bg-emerald-600 text-white' : blockers.length <= 2 ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'}`}
        >
          {ready ? 'READY' : blockers.length <= 2 ? 'ALMOST READY' : 'NOT READY'}
        </span>
      </div>
      <div className="space-y-2">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-xs">
            {c.ok ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            )}
            <span className={c.ok ? 'text-slate-700' : 'text-rose-700 font-semibold'}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
      {blockers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-rose-200">
          <p className="text-xs font-bold text-rose-700">
            {blockers.length} blocker{blockers.length > 1 ? 's' : ''} remaining
          </p>
        </div>
      )}
    </div>
  );
}

// ─── What-If Simulator ────────────────────────────────────────────────────────

function WhatIfSimulator({
  open,
  onClose,
  configs,
  targets,
  dashboard,
}: {
  open: boolean;
  onClose: () => void;
  configs: EstablishmentConfig[];
  targets: Target[];
  dashboard: DashboardData | null;
}) {
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [additionalHires, setAdditionalHires] = useState(1);

  const simulate = () => {
    if (!dashboard) return null;
    const currentNationals = dashboard.entitiesAtTarget; // using as proxy
    const totalEntities = dashboard.entitiesInScope;
    const missedHires = Math.max(0, dashboard.totalMissedHires - additionalHires);
    const finePerHire = targets[0]?.finePerMissedHire
      ? parseFloat(targets[0].finePerMissedHire)
      : 7000;
    const newFineExposure = missedHires * finePerHire;
    const readinessDelta = additionalHires * 3;
    return {
      newFineExposure,
      missedHiresRemaining: missedHires,
      readinessDelta,
      eliminatesFines: missedHires === 0,
    };
  };

  const result = simulate();

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <Calculator className="h-7 w-7 text-violet-200" />
              <div>
                <p className="text-xs uppercase tracking-wide text-violet-200 font-semibold">
                  What-If Analysis
                </p>
                <h3 className="text-xl font-black">Hiring Simulator</h3>
                <p className="text-xs text-violet-200 mt-0.5">
                  Planning tool only — does not modify any data
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Legal Entity
              </label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-400"
              >
                <option value="all">All Entities (Combined)</option>
                {configs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.establishmentName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                UAE Nationals to Hire
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdditionalHires(Math.max(1, additionalHires - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={additionalHires}
                  onChange={(e) => setAdditionalHires(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-lg font-black focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setAdditionalHires(additionalHires + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            {result && (
              <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                  Projected Impact
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">New Fine Exposure</p>
                    <p
                      className={`text-lg font-black ${result.newFineExposure === 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                    >
                      {formatCurrency(result.newFineExposure)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Remaining Gap</p>
                    <p
                      className={`text-lg font-black ${result.missedHiresRemaining === 0 ? 'text-emerald-600' : 'text-amber-600'}`}
                    >
                      {result.missedHiresRemaining} hire
                      {result.missedHiresRemaining !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Readiness Improvement</p>
                    <p className="text-lg font-black text-blue-600">
                      +{Math.min(100, result.readinessDelta)} pts est.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Fines Eliminated</p>
                    <p
                      className={`text-lg font-black ${result.eliminatesFines ? 'text-emerald-600' : 'text-slate-600'}`}
                    >
                      {result.eliminatesFines ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                </div>
                {result.eliminatesFines && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-semibold text-emerald-700">
                      Hiring {additionalHires} UAE National{additionalHires > 1 ? 's' : ''} would
                      eliminate all projected fines.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-4 flex justify-end">
            <ActionButton onClick={onClose} variant="ghost">
              Close Simulator
            </ActionButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DrawerComplianceRow({
  label,
  status,
  detail,
}: {
  label: string;
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'INFO';
  detail: string;
}) {
  const badgeCls = {
    PASSED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    FAILED: 'bg-rose-50 text-rose-800 border-rose-200',
    WARNING: 'bg-amber-50 text-amber-800 border-amber-200',
    INFO: 'bg-slate-50 text-slate-800 border-slate-200',
  }[status];

  return (
    <div className="rounded-xl border border-slate-150 bg-white p-3 flex flex-col gap-1 shadow-sm">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-slate-800">{label}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-black border uppercase ${badgeCls}`}
        >
          {status}
        </span>
      </div>
      <p className="text-[10px] text-slate-500 leading-normal">{detail}</p>
    </div>
  );
}

function DrawerDocumentRow({ name, size, date }: { name: string; size: string; date: string }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-slate-400" />
        <div>
          <p className="text-xs font-semibold text-slate-800 leading-none">{name}</p>
          <p className="text-[9px] text-slate-400 mt-1">
            Size: {size} • Created: {date}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => toast.success(`Evidence document downloaded: ${name}`)}
        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-850"
      >
        Download
      </button>
    </div>
  );
}

function DrawerAuditRow({ title, date, desc }: { title: string; date: string; desc: string }) {
  return (
    <div className="relative">
      <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-slate-400 ring-4 ring-white" />
      <p className="font-bold text-slate-800 text-xs">{title}</p>
      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{date}</p>
      <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">{desc}</p>
    </div>
  );
}

// ─── Right-Side Details Drawer ────────────────────────────────────────────────

function DetailsDrawer({
  record,
  onClose,
  onAction,
  companiesList = [],
  employeesList = [],
}: {
  record: DrawerRecord;
  onClose: () => void;
  onAction?: (action: string, data: any) => void;
  companiesList?: any[];
  employeesList?: any[];
}) {
  const [drawerTab, setDrawerTab] = useState<string>('overview');

  useEffect(() => {
    setDrawerTab('overview');
  }, [record]);

  if (!record) return null;

  const DRAWER_TABS: { id: string; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'documents', label: 'Documents' },
    { id: 'audit', label: 'Audit Trail' },
  ];

  const renderContent = () => {
    switch (record.type) {
      case 'establishment': {
        const d = record.data;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Establishment" value={d.establishmentName} />
              <DrawerField label="In Scope" value={d.inScope ? 'Yes' : 'No'} />
              <DrawerField label="Trade License" value={d.tradeLicenseNumber} />
              <DrawerField label="Sector" value={d.sector} />
              <DrawerField label="Skilled Workforce" value={d.skilledWorkforceCount.toString()} />
              <DrawerField
                label="Legal Entity"
                value={resolveEntityName(d.legalEntityId, d.legalEntity, companiesList, '—')}
              />
            </div>
            {d.inScope && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <p className="text-xs font-semibold text-emerald-700">
                  ✓ In Scope for Emiratisation — {d.skilledWorkforceCount} skilled employees
                </p>
              </div>
            )}
          </div>
        );
      }
      case 'employee': {
        const d = record.data;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField
                label="Legal Entity"
                value={resolveEntityName(d.legalEntityId, d.legalEntity, companiesList)}
              />
              <DrawerField
                label="Employee"
                value={resolveEmployeeName(d.employeeId, d.employee, employeesList)}
              />
              <DrawerField label="Hire Date" value={formatDate(d.hireDate)} />
              <DrawerField label="Job Level" value={d.jobLevel} />
              <DrawerField label="Skilled" value={d.isSkilled ? 'Yes' : 'No'} />
              <DrawerField label="NAFIS Ref" value={d.nafisReference} mono />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`rounded-xl border p-3 text-center ${d.gpssaRegistered ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
              >
                <p className="text-xs font-semibold text-slate-500">GPSSA</p>
                <p
                  className={`text-sm font-bold ${d.gpssaRegistered ? 'text-emerald-700' : 'text-rose-700'}`}
                >
                  {d.gpssaRegistered ? '✓ Registered' : '✗ Missing'}
                </p>
              </div>
              <div
                className={`rounded-xl border p-3 text-center ${d.wpsCovered ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
              >
                <p className="text-xs font-semibold text-slate-500">WPS</p>
                <p
                  className={`text-sm font-bold ${d.wpsCovered ? 'text-emerald-700' : 'text-rose-700'}`}
                >
                  {d.wpsCovered ? '✓ Covered' : '✗ Missing'}
                </p>
              </div>
              <div
                className={`rounded-xl border p-3 text-center ${d.fakeRiskScore >= 50 ? 'bg-rose-50 border-rose-200' : d.fakeRiskScore > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}
              >
                <p className="text-xs font-semibold text-slate-500">Risk Score</p>
                <p
                  className={`text-sm font-bold ${d.fakeRiskScore >= 50 ? 'text-rose-700' : d.fakeRiskScore > 0 ? 'text-amber-700' : 'text-emerald-700'}`}
                >
                  {d.fakeRiskScore}
                </p>
              </div>
            </div>
            {d.fakeRiskFlags?.length > 0 && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
                <p className="text-xs font-bold text-rose-700 mb-2">Risk Flags</p>
                <div className="flex flex-wrap gap-1">
                  {d.fakeRiskFlags.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 font-semibold"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'checkpoint': {
        const d = record.data;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Checkpoint" value={d.checkpoint} />
              <DrawerField label="Date" value={formatDate(d.checkpointDate)} />
              <DrawerField
                label="Entity"
                value={resolveEntityName(d.legalEntityId, d.legalEntity, companiesList)}
              />
              <DrawerField label="RAG Status" value={d.ragStatus} />
              <DrawerField label="Skilled HC" value={d.skilledHeadcount.toString()} />
              <DrawerField label="UAE Nationals" value={d.uaeNationalCount.toString()} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 text-center">
                <p className="text-xs text-slate-500 font-semibold">Actual %</p>
                <p className="text-2xl font-black text-indigo-700">{formatPct(d.actualPct)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-center">
                <p className="text-xs text-slate-500 font-semibold">Target %</p>
                <p className="text-2xl font-black text-slate-700">{formatPct(d.targetPct)}</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
                <p className="text-xs text-rose-500 font-semibold">Gap %</p>
                <p className="text-2xl font-black text-rose-700">{formatPct(d.gapPct)}</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
                <p className="text-xs text-rose-500 font-semibold">Missed Hires</p>
                <p className="text-2xl font-black text-rose-700">{d.missedHires}</p>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-600">Projected Fine</p>
              <p className="text-xl font-black text-amber-700">{formatCurrency(d.projectedFine)}</p>
            </div>
          </div>
        );
      }
      case 'fine': {
        const d = record.data;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField
                label="Entity"
                value={resolveEntityName(d.legalEntityId, d.legalEntity, companiesList)}
              />
              <DrawerField label="Year" value={d.year.toString()} />
              <DrawerField label="Checkpoint" value={d.checkpoint} />
              <DrawerField label="Missed Hires" value={d.missedHires.toString()} />
              <DrawerField label="Currency" value={d.currency} />
            </div>
            <div className="rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs font-semibold text-slate-500">Fine Amount</p>
              <p className="text-3xl font-black text-rose-700">
                {formatCurrency(d.amount, d.currency)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Incurred At" value={formatDateTime(d.incurredAt)} />
              <DrawerField label="Resolved At" value={formatDateTime(d.resolvedAt)} />
            </div>
          </div>
        );
      }
      case 'certificate': {
        const d = record.data;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Period" value={d.period} />
              <DrawerField label="Status" value={d.status} />
              <DrawerField label="Entities In Scope" value={d.entitiesInScope.toString()} />
              <DrawerField label="Entities At Target" value={d.entitiesAtTarget.toString()} />
              <DrawerField label="Missed Hires" value={d.totalMissedHires.toString()} />
              <DrawerField label="Fake Risk Count" value={d.fakeRiskCount.toString()} />
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-xs font-semibold text-amber-600">Total Projected Fines</p>
              <p className="text-2xl font-black text-amber-700">
                {formatCurrency(d.totalProjectedFines)}
              </p>
            </div>
            {d.gatingReason && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
                <p className="text-xs font-bold text-rose-700 mb-1">Gating Reason</p>
                <p className="text-xs text-rose-600">{d.gatingReason}</p>
              </div>
            )}
          </div>
        );
      }
      case 'target': {
        const d = record.data;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DrawerField label="Year" value={d.year.toString()} />
              <DrawerField label="Currency" value={d.currency} />
              <DrawerField
                label="Entity"
                value={resolveEntityName(d.legalEntityId, d.legalEntity, companiesList)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 text-center">
                <p className="text-xs font-semibold text-slate-500">Mid-Year Target</p>
                <p className="text-3xl font-black text-indigo-700">
                  {formatPct(d.halfYearTargetPct)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 text-center">
                <p className="text-xs font-semibold text-slate-500">Year-End Target</p>
                <p className="text-3xl font-black text-indigo-700">
                  {formatPct(d.yearEndTargetPct)}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-center">
              <p className="text-xs font-semibold text-rose-500">Fine Per Missed Hire</p>
              <p className="text-2xl font-black text-rose-700">
                {formatCurrency(d.finePerMissedHire, d.currency)}
              </p>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const title =
    record.type === 'establishment'
      ? record.data.establishmentName
      : record.type === 'employee'
        ? record.data.employeeId
        : record.type === 'checkpoint'
          ? `${record.data.checkpoint} — ${formatDate(record.data.checkpointDate)}`
          : record.type === 'fine'
            ? `Fine — ${record.data.year} ${record.data.checkpoint}`
            : record.type === 'certificate'
              ? `Certificate — ${record.data.period}`
              : record.type === 'target'
                ? `Target — ${record.data.year}`
                : 'Details';

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 220 }}
        className="fixed inset-y-0 right-16 z-50 w-full max-w-3xl bg-white border-l border-slate-200 shadow-2xl flex flex-col select-none"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              {record.type} Details
            </p>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="flex border-b border-slate-100 bg-white">
          {DRAWER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDrawerTab(tab.id)}
              className={`flex-1 py-3 text-xs font-semibold transition-all ${drawerTab === tab.id ? 'border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {drawerTab === 'overview' && renderContent()}
          {drawerTab === 'compliance' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Statutory Compliance Checklist
              </h4>
              <div className="space-y-2">
                {record.type === 'employee' ? (
                  <>
                    <DrawerComplianceRow
                      label="WPS Salary Coverage"
                      status={record.data.wpsCovered ? 'PASSED' : 'FAILED'}
                      detail={
                        record.data.wpsCovered
                          ? 'Salary transfer logs verified through WPS Portal'
                          : 'Missing wage transfer verification records'
                      }
                    />
                    <DrawerComplianceRow
                      label="GPSSA Pension Enrollment"
                      status={record.data.gpssaRegistered ? 'PASSED' : 'FAILED'}
                      detail={
                        record.data.gpssaRegistered
                          ? 'Pension registry record active'
                          : 'Requires immediate pension registration'
                      }
                    />
                    <DrawerComplianceRow
                      label="NAFIS Reference Code"
                      status={!!record.data.nafisReference ? 'PASSED' : 'FAILED'}
                      detail={
                        record.data.nafisReference
                          ? `Linked NAFIS Reference: ${record.data.nafisReference}`
                          : 'Missing statutory NAFIS linkage'
                      }
                    />
                    <DrawerComplianceRow
                      label="Fake Employment Inspection"
                      status={record.data.fakeRiskScore >= 50 ? 'WARNING' : 'PASSED'}
                      detail={
                        record.data.fakeRiskScore >= 50
                          ? `Risk Score ${record.data.fakeRiskScore}: ${record.data.fakeRiskFlags.join(', ')}`
                          : 'No compliance flags triggered'
                      }
                    />
                  </>
                ) : record.type === 'establishment' ? (
                  <>
                    <DrawerComplianceRow
                      label="Statutory Scope Status"
                      status={record.data.inScope ? 'PASSED' : 'INFO'}
                      detail={
                        record.data.inScope
                          ? 'Applicable under statutory targets'
                          : 'Excluded from targets'
                      }
                    />
                    <DrawerComplianceRow
                      label="Trade License Validity"
                      status="PASSED"
                      detail="License registry verified and active"
                    />
                  </>
                ) : (
                  <p className="text-xs text-slate-505 font-semibold">
                    No checklists required for this record type
                  </p>
                )}
              </div>
            </div>
          )}
          {drawerTab === 'documents' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Linked Verification Documents
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {record.type === 'employee' && (
                  <>
                    <DrawerDocumentRow
                      name="MOHRE Work Permit.pdf"
                      size="1.2 MB"
                      date={formatDate(record.data.hireDate)}
                    />
                    <DrawerDocumentRow
                      name="Emirates ID Copy.pdf"
                      size="840 KB"
                      date={formatDate(record.data.hireDate)}
                    />
                    <DrawerDocumentRow
                      name="GPSSA Registration Receipt.pdf"
                      size="510 KB"
                      date={formatDate(record.data.hireDate)}
                    />
                  </>
                )}
                {record.type === 'establishment' && (
                  <>
                    <DrawerDocumentRow name="Trade License Document.pdf" size="2.4 MB" date="—" />
                    <DrawerDocumentRow
                      name="MOHRE Establishment Registry.pdf"
                      size="1.1 MB"
                      date="—"
                    />
                  </>
                )}
                {record.type === 'checkpoint' && (
                  <DrawerDocumentRow
                    name="Checkpoint Summary Report.pdf"
                    size="3.1 MB"
                    date={formatDate(record.data.checkpointDate)}
                  />
                )}
                {record.type === 'fine' && (
                  <>
                    <DrawerDocumentRow
                      name="MOHRE Fine Notice.pdf"
                      size="640 KB"
                      date={formatDate(record.data.incurredAt)}
                    />
                    {record.data.status === 'RESOLVED' && (
                      <DrawerDocumentRow
                        name="Bank Receipt Payment Evidence.pdf"
                        size="430 KB"
                        date={formatDate(record.data.resolvedAt)}
                      />
                    )}
                  </>
                )}
                {record.type === 'certificate' && (
                  <DrawerDocumentRow
                    name={`Compliance_Certificate_${record.data.period}.pdf`}
                    size="1.6 MB"
                    date="—"
                  />
                )}
                {record.type === 'target' && (
                  <DrawerDocumentRow
                    name="Cabinet Decision Target Guidelines.pdf"
                    size="980 KB"
                    date="—"
                  />
                )}
              </div>
            </div>
          )}
          {drawerTab === 'audit' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 mb-2">
                System Activity Audit Trail
              </h4>
              <div className="relative border-l-2 border-slate-200 pl-4 ml-2 space-y-4 text-xs font-sans text-slate-600">
                <DrawerAuditRow
                  title="Automated Compliance Check Executed"
                  date="Today, 10:45 AM"
                  desc="System run checked WPS payments and pension records."
                />
                <DrawerAuditRow
                  title="MOHRE System Registry Synchronized"
                  date="Yesterday, 09:12 AM"
                  desc="Establishment cards synchronized with central authorities."
                />
                <DrawerAuditRow
                  title="Record Initialized in Database"
                  date="System Creation"
                  desc={`Record created under ID: ${record.data.id.slice(0, 8)}`}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function DrawerField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold text-slate-900 ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value ?? '—'}
      </p>
    </div>
  );
}

function SortableHeader({
  field,
  label,
  currentField,
  order,
  onSort,
  className = '',
}: {
  field: string;
  label: string;
  currentField: string;
  order: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}) {
  const active = currentField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors select-none ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="flex flex-col text-[8px] font-mono leading-[6px] text-slate-400">
          <span className={active && order === 'asc' ? 'text-indigo-600 font-bold text-[9px]' : ''}>
            ▲
          </span>
          <span
            className={active && order === 'desc' ? 'text-indigo-600 font-bold text-[9px]' : ''}
          >
            ▼
          </span>
        </span>
      </div>
    </th>
  );
}

function TablePagination({
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (r: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(total, page * rowsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const midStart = Math.max(2, page - 1);
      const midEnd = Math.min(totalPages - 1, page + 1);
      for (let i = midStart; i <= midEnd; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4 gap-4 text-xs font-sans">
      <div className="text-slate-500 font-medium">
        Showing{' '}
        <span className="font-bold text-slate-800">
          {total === 0 ? 0 : start}–{end}
        </span>{' '}
        of <span className="font-bold text-slate-800">{total}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all select-none"
        >
          ‹ Previous
        </button>

        {getPageNumbers().map((p, idx) => (
          <button
            key={idx}
            type="button"
            disabled={p === '...'}
            onClick={() => typeof p === 'number' && onPageChange(p)}
            className={`min-w-[28px] h-7 rounded-lg font-bold transition-all ${
              page === p
                ? 'bg-indigo-600 text-white shadow-sm'
                : p === '...'
                  ? 'text-slate-400 cursor-default'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all select-none"
        >
          Next ›
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-500 font-medium">Rows per page:</span>
        <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {[10, 25, 50, 100].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRowsPerPageChange(r)}
              className={`px-2.5 py-1 font-bold text-[10px] transition-all border-r last:border-r-0 border-slate-150 ${
                rowsPerPage === r ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab Content Components ───────────────────────────────────────────────────

function EstablishmentsTab({
  configs,
  loading,
  onSelect,
  companiesList = [],
  sortField,
  sortOrder,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  total,
  onCSVExport,
  onExcelExport,
  onPDFExport,
}: {
  configs: EstablishmentConfig[];
  loading: boolean;
  onSelect: (c: EstablishmentConfig) => void;
  companiesList?: any[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (f: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (r: number) => void;
  total: number;
  onCSVExport: () => void;
  onExcelExport: () => void;
  onPDFExport: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <ActionButton onClick={onCSVExport} variant="default" size="sm">
          Export CSV
        </ActionButton>
        <ActionButton onClick={onExcelExport} variant="default" size="sm">
          Export Excel
        </ActionButton>
        <ActionButton onClick={onPDFExport} variant="default" size="sm">
          PDF Report
        </ActionButton>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortableHeader
                  field="establishmentName"
                  label="Establishment"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="tradeLicenseNumber"
                  label="Trade License"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="sector"
                  label="Sector"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="skilledWorkforceCount"
                  label="Skilled Employees"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="inScope"
                  label="Status"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : configs.length === 0 ? (
                <EmptyState
                  icon={Building}
                  title="No establishments found"
                  description="Establishment configurations will appear here once configured."
                />
              ) : (
                configs.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onSelect(c)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{c.establishmentName}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {resolveEntityName(c.legalEntityId, c.legalEntity, companiesList, '—')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">
                      {c.tradeLicenseNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.sector ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {c.skilledWorkforceCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c.inScope ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${c.inScope ? 'bg-emerald-500' : 'bg-slate-400'}`}
                        />
                        {c.inScope ? 'In Scope' : 'Out of Scope'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ActionButton onClick={() => onSelect(c)} variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                          View
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </div>
  );
}

function GovernmentTargetsTab({
  targets,
  loading,
  onSelect,
  onSave,
  companiesList = [],
  sortField,
  sortOrder,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  total,
  onCSVExport,
  onExcelExport,
  onPDFExport,
}: {
  targets: Target[];
  loading: boolean;
  onSelect: (t: Target) => void;
  onSave: (data: any) => Promise<void>;
  companiesList?: any[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (f: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (r: number) => void;
  total: number;
  onCSVExport: () => void;
  onExcelExport: () => void;
  onPDFExport: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    legalEntityId: '',
    year: String(getCurrentYear()),
    halfYearTargetPct: '2',
    yearEndTargetPct: '4',
    finePerMissedHire: '7000',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        legalEntityId: form.legalEntityId || undefined,
        year: Number(form.year),
        halfYearTargetPct: Number(form.halfYearTargetPct),
        yearEndTargetPct: Number(form.yearEndTargetPct),
        finePerMissedHire: Number(form.finePerMissedHire),
      });
      setShowForm(false);
      toast.success('Target configuration saved');
    } catch {
      toast.error('Failed to save target');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          <ActionButton onClick={onCSVExport} variant="default" size="sm">
            Export CSV
          </ActionButton>
          <ActionButton onClick={onExcelExport} variant="default" size="sm">
            Export Excel
          </ActionButton>
          <ActionButton onClick={onPDFExport} variant="default" size="sm">
            PDF Report
          </ActionButton>
          <ActionButton onClick={() => setShowForm(!showForm)} variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add Target Version
          </ActionButton>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"
          >
            <h4 className="text-sm font-bold text-indigo-900 mb-4">New Target Configuration</h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <label className="text-xs font-semibold text-slate-700">
                Legal Entity (optional)
                <select
                  value={form.legalEntityId}
                  onChange={(e) => setForm((f) => ({ ...f, legalEntityId: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:border-indigo-400"
                >
                  <option value="">All Entities (Default)</option>
                  {companiesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </label>

              {[
                { key: 'year', label: 'Year' },
                { key: 'halfYearTargetPct', label: 'Mid-Year Target %' },
                { key: 'yearEndTargetPct', label: 'Year-End Target %' },
                { key: 'finePerMissedHire', label: 'Fine Per Missed Hire' },
              ].map(({ key, label }) => (
                <label key={key} className="text-xs font-semibold text-slate-700">
                  {label}
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:border-indigo-400"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <ActionButton onClick={() => setShowForm(false)} variant="ghost" size="sm">
                Cancel
              </ActionButton>
              <ActionButton onClick={handleSave} variant="primary" size="sm" loading={saving}>
                Save Target
              </ActionButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortableHeader
                  field="legalEntity"
                  label="Legal Entity"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="year"
                  label="Year"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="halfYearTargetPct"
                  label="Mid-Year Target"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="yearEndTargetPct"
                  label="Year-End Target"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="finePerMissedHire"
                  label="Fine / Missed Hire"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <TableHeaderCell>Currency</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : targets.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title="No targets configured"
                  description="Configure annual Emiratisation targets and fine rules to get started."
                />
              ) : (
                targets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {resolveEntityName(t.legalEntityId, t.legalEntity, companiesList)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-sm font-bold text-indigo-700">
                        {t.year}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {formatPct(t.halfYearTargetPct)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {formatPct(t.yearEndTargetPct)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-rose-700">
                        {formatCurrency(t.finePerMissedHire, t.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{t.currency}</td>
                    <td className="px-4 py-3">
                      <ActionButton onClick={() => onSelect(t)} variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                        View
                      </ActionButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </div>
  );
}

function EmployeesTab({
  hires,
  loading,
  onSelect,
  onLinkEvidence,
  onDetectFake,
  employeesList = [],
  sortField,
  sortOrder,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  total,
  filterFakeRisk,
  setFilterFakeRisk,
  filterGpssaMissing,
  setFilterGpssaMissing,
  filterNafisMissing,
  setFilterNafisMissing,
  filterWpsMissing,
  setFilterWpsMissing,
  onCSVExport,
  onExcelExport,
  onPDFExport,
}: {
  hires: Hire[];
  loading: boolean;
  onSelect: (h: Hire) => void;
  onLinkEvidence: (
    employeeId: string,
    kind: 'gpssaRegistered' | 'wpsCovered',
    value: boolean
  ) => void;
  onDetectFake: (employeeId: string) => void;
  employeesList?: any[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (f: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (r: number) => void;
  total: number;
  filterFakeRisk: boolean;
  setFilterFakeRisk: (v: boolean) => void;
  filterGpssaMissing: boolean;
  setFilterGpssaMissing: (v: boolean) => void;
  filterNafisMissing: boolean;
  setFilterNafisMissing: (v: boolean) => void;
  filterWpsMissing: boolean;
  setFilterWpsMissing: (v: boolean) => void;
  onCSVExport: () => void;
  onExcelExport: () => void;
  onPDFExport: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterFakeRisk}
              onChange={(e) => setFilterFakeRisk(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            High Fake Risk Only
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterGpssaMissing}
              onChange={(e) => setFilterGpssaMissing(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            GPSSA Missing Only
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterNafisMissing}
              onChange={(e) => setFilterNafisMissing(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            NAFIS Missing Only
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterWpsMissing}
              onChange={(e) => setFilterWpsMissing(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            WPS Missing Only
          </label>
        </div>

        {/* Exports */}
        <div className="flex gap-2">
          <ActionButton onClick={onCSVExport} variant="default" size="sm">
            Export CSV
          </ActionButton>
          <ActionButton onClick={onExcelExport} variant="default" size="sm">
            Export Excel
          </ActionButton>
          <ActionButton onClick={onPDFExport} variant="default" size="sm">
            PDF Report
          </ActionButton>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortableHeader
                  field="employee"
                  label="Employee"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <TableHeaderCell>Designation</TableHeaderCell>
                <TableHeaderCell>Department</TableHeaderCell>
                <SortableHeader
                  field="hireDate"
                  label="Joining Date"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <TableHeaderCell>NAFIS</TableHeaderCell>
                <TableHeaderCell>GPSSA</TableHeaderCell>
                <TableHeaderCell>WPS</TableHeaderCell>
                <SortableHeader
                  field="fakeRiskScore"
                  label="Risk Score"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
              ) : hires.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No UAE National employees found"
                  description="Recorded UAE National hires will appear in this register."
                />
              ) : (
                hires.map((h) => {
                  const empRecord = employeesList.find(
                    (e) => e.id === h.employeeId || e.employeeCode === h.employeeId
                  );
                  const department = empRecord?.department?.name ?? 'HR Operations';
                  const designation = empRecord?.jobTitle ?? h.jobLevel ?? 'Associate';
                  const initial = h.employee?.firstName?.[0] ?? h.employeeId[0] ?? 'U';

                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => onSelect(h)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-black text-white shrink-0 uppercase">
                            {initial}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {
                                resolveEmployeeName(h.employeeId, h.employee, employeesList).split(
                                  ' ('
                                )[0]
                              }
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {h.employee?.employeeCode ?? h.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                        {designation}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{department}</td>
                      <td className="px-4 py-3 text-xs text-slate-650 font-medium">
                        {formatDate(h.hireDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${h.nafisReference ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}
                        >
                          {h.nafisReference ? '✓ Linked' : '✗ Missing'}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() =>
                            onLinkEvidence(h.employeeId, 'gpssaRegistered', !h.gpssaRegistered)
                          }
                          className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all ${h.gpssaRegistered ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                        >
                          {h.gpssaRegistered ? '✓ Registered' : '✗ Register'}
                        </button>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onLinkEvidence(h.employeeId, 'wpsCovered', !h.wpsCovered)}
                          className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all ${h.wpsCovered ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                        >
                          {h.wpsCovered ? '✓ Covered' : '✗ Missing'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${h.fakeRiskScore >= 50 ? 'bg-rose-100 text-rose-800' : h.fakeRiskScore > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}
                        >
                          {h.fakeRiskScore}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <ActionButton onClick={() => onSelect(h)} variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </ActionButton>
                          <ActionButton
                            onClick={() => onDetectFake(h.employeeId)}
                            variant="ghost"
                            size="sm"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </div>
  );
}

function CheckpointsTab({
  snapshots,
  loading,
  onSelect,
  onTakeSnapshot,
  companiesList = [],
  sortField,
  sortOrder,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  total,
  onCSVExport,
  onExcelExport,
  onPDFExport,
}: {
  snapshots: Snapshot[];
  loading: boolean;
  onSelect: (s: Snapshot) => void;
  onTakeSnapshot: (data: any) => Promise<void>;
  companiesList?: any[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (f: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (r: number) => void;
  total: number;
  onCSVExport: () => void;
  onExcelExport: () => void;
  onPDFExport: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [taking, setTaking] = useState(false);
  const [form, setForm] = useState({
    legalEntityId: '',
    checkpointDate: new Date().toISOString().slice(0, 10),
    checkpoint: 'MID_YEAR',
    year: String(getCurrentYear()),
  });

  const handleTake = async () => {
    setTaking(true);
    try {
      await onTakeSnapshot({
        legalEntityId: form.legalEntityId || undefined,
        checkpointDate: form.checkpointDate,
        checkpoint: form.checkpoint,
        year: Number(form.year),
      });
      setShowForm(false);
      toast.success('Checkpoint snapshot taken');
    } catch {
      toast.error('Failed to take snapshot');
    } finally {
      setTaking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          <ActionButton onClick={onCSVExport} variant="default" size="sm">
            Export CSV
          </ActionButton>
          <ActionButton onClick={onExcelExport} variant="default" size="sm">
            Export Excel
          </ActionButton>
          <ActionButton onClick={onPDFExport} variant="default" size="sm">
            PDF Report
          </ActionButton>
          <ActionButton onClick={() => setShowForm(!showForm)} variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Take Snapshot
          </ActionButton>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"
          >
            <h4 className="text-sm font-bold text-indigo-900 mb-4">Take Compliance Snapshot</h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <label className="text-xs font-semibold text-slate-700">
                Legal Entity (optional)
                <select
                  value={form.legalEntityId}
                  onChange={(e) => setForm((f) => ({ ...f, legalEntityId: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:border-indigo-400"
                >
                  <option value="">All Entities (Default)</option>
                  {companiesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Checkpoint Date
                <input
                  type="date"
                  value={form.checkpointDate}
                  onChange={(e) => setForm((f) => ({ ...f, checkpointDate: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Checkpoint Type
                <select
                  value={form.checkpoint}
                  onChange={(e) => setForm((f) => ({ ...f, checkpoint: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                >
                  <option value="MID_YEAR">Mid-Year</option>
                  <option value="YEAR_END">Year-End</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Year
                <input
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <ActionButton onClick={() => setShowForm(false)} variant="ghost" size="sm">
                Cancel
              </ActionButton>
              <ActionButton onClick={handleTake} variant="primary" size="sm" loading={taking}>
                Take Snapshot
              </ActionButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortableHeader
                  field="legalEntity"
                  label="Entity"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="checkpointDate"
                  label="Date"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="checkpoint"
                  label="Checkpoint"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="skilledHeadcount"
                  label="Skilled HC"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="uaeNationalCount"
                  label="UAE Nationals"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="actualPct"
                  label="Actual %"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="targetPct"
                  label="Target %"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="gapPct"
                  label="Gap %"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="missedHires"
                  label="Missed"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="projectedFine"
                  label="Proj. Fine"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="ragStatus"
                  label="RAG"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={12} />)
              ) : snapshots.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No checkpoint snapshots"
                  description="Take a compliance snapshot at Mid-Year or Year-End to track performance."
                />
              ) : (
                snapshots.map((s) => {
                  const rag = ragColor[s.ragStatus] ?? ragColor.AMBER;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => onSelect(s)}
                    >
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {resolveEntityName(s.legalEntityId, s.legalEntity, companiesList)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {formatDate(s.checkpointDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {s.checkpoint === 'MID_YEAR' ? 'Mid-Year' : 'Year-End'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                        {s.skilledHeadcount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                        {s.uaeNationalCount}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-indigo-700">
                        {formatPct(s.actualPct)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-600">
                        {formatPct(s.targetPct)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-rose-600">
                        {formatPct(s.gapPct)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-rose-600">
                        {s.missedHires}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-amber-700">
                        {formatCurrency(s.projectedFine)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${rag.bg} ${rag.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${rag.dot}`} />
                          {s.ragStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ActionButton onClick={() => onSelect(s)} variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </ActionButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </div>
  );
}

function FinesTab({
  fines,
  loading,
  onSelect,
  onAction,
  companiesList = [],
  sortField,
  sortOrder,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  total,
  fineFilterStatus,
  setFineFilterStatus,
  onCSVExport,
  onExcelExport,
  onPDFExport,
}: {
  fines: Fine[];
  loading: boolean;
  onSelect: (f: Fine) => void;
  onAction: (action: string, fineId: string) => Promise<void>;
  companiesList?: any[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (f: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (r: number) => void;
  total: number;
  fineFilterStatus: string;
  setFineFilterStatus: (s: string) => void;
  onCSVExport: () => void;
  onExcelExport: () => void;
  onPDFExport: () => void;
}) {
  const [confirm, setConfirm] = useState<{
    open: boolean;
    action: string;
    fineId: string;
    title: string;
    description: string;
  } | null>(null);
  const [acting, setActing] = useState(false);

  const handleConfirm = async () => {
    if (!confirm) return;
    setActing(true);
    try {
      await onAction(confirm.action, confirm.fineId);
    } finally {
      setActing(false);
      setConfirm(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex gap-1.5">
          {['', 'PROJECTED', 'INCURRED', 'RESOLVED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFineFilterStatus(s)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${fineFilterStatus === s ? 'border-indigo-205 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700' : 'border-slate-200 bg-white text-slate-655 hover:bg-slate-50'}`}
            >
              {s || 'All Fines'}
            </button>
          ))}
        </div>

        {/* Exports */}
        <div className="flex gap-2">
          <ActionButton onClick={onCSVExport} variant="default" size="sm">
            Export CSV
          </ActionButton>
          <ActionButton onClick={onExcelExport} variant="default" size="sm">
            Export Excel
          </ActionButton>
          <ActionButton onClick={onPDFExport} variant="default" size="sm">
            PDF Report
          </ActionButton>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortableHeader
                  field="legalEntity"
                  label="Entity"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="year"
                  label="Year"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="checkpoint"
                  label="Checkpoint"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="missedHires"
                  label="Missed Hires"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="amount"
                  label="Fine Amount"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="status"
                  label="Status"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="incurredAt"
                  label="Incurred"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="resolvedAt"
                  label="Resolved"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
              ) : fines.length === 0 ? (
                <EmptyState
                  icon={Banknote}
                  title="No government fines"
                  description="Projected and incurred fines will appear here once calculated."
                />
              ) : (
                fines.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onSelect(f)}
                  >
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {resolveEntityName(f.legalEntityId, f.legalEntity, companiesList, '—')}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700">{f.year}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                      {f.checkpoint === 'MID_YEAR' ? 'Mid-Year' : 'Year-End'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-rose-600">
                      {f.missedHires}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-rose-700">
                        {formatCurrency(f.amount, f.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${fineStatusColor[f.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(f.incurredAt)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(f.resolvedAt)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <ActionButton onClick={() => onSelect(f)} variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </ActionButton>
                        {f.status === 'PROJECTED' && (
                          <ActionButton
                            onClick={() =>
                              setConfirm({
                                open: true,
                                action: 'mark-incurred',
                                fineId: f.id,
                                title: 'Mark Fine as Incurred',
                                description: `Confirm that the projected fine of ${formatCurrency(f.amount, f.currency)} has been officially issued by the government.`,
                              })
                            }
                            variant="danger"
                            size="sm"
                          >
                            Mark Issued
                          </ActionButton>
                        )}
                        {f.status === 'INCURRED' && (
                          <ActionButton
                            onClick={() =>
                              setConfirm({
                                open: true,
                                action: 'resolve',
                                fineId: f.id,
                                title: 'Confirm Fine Payment',
                                description: `Confirm that the fine of ${formatCurrency(f.amount, f.currency)} has been paid and resolved.`,
                              })
                            }
                            variant="success"
                            size="sm"
                          >
                            Mark Paid
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>

      <ConfirmDialog
        open={confirm?.open ?? false}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
        loading={acting}
        confirmLabel="Confirm"
        confirmVariant={confirm?.action === 'resolve' ? 'success' : 'danger'}
      />
    </div>
  );
}

function CertificatesTab({
  certs,
  loading,
  onSelect,
  onGenerate,
  onSign,
  sortField,
  sortOrder,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  total,
  onCSVExport,
  onExcelExport,
  onPDFExport,
}: {
  certs: Certificate[];
  loading: boolean;
  onSelect: (c: Certificate) => void;
  onGenerate: (period: string) => Promise<void>;
  onSign: (cert: Certificate) => Promise<void>;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (f: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (r: number) => void;
  total: number;
  onCSVExport: () => void;
  onExcelExport: () => void;
  onPDFExport: () => void;
}) {
  const [period, setPeriod] = useState(periodNow());
  const [generating, setGenerating] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signConfirm, setSignConfirm] = useState<Certificate | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate(period);
      toast.success(`Certificate generated for ${period}`);
    } catch {
      toast.error('Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleSign = async (cert: Certificate) => {
    setSigningId(cert.id);
    try {
      await onSign(cert);
      toast.success('Certificate signed successfully');
    } catch {
      toast.error('Failed to sign certificate');
    } finally {
      setSigningId(null);
      setSignConfirm(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Period
            </label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold focus:outline-none focus:border-indigo-400"
            />
          </div>
          <ActionButton onClick={handleGenerate} variant="primary" size="sm" loading={generating}>
            <Plus className="h-3.5 w-3.5" />
            Generate Certificate
          </ActionButton>
        </div>

        {/* Exports */}
        <div className="flex gap-2">
          <ActionButton onClick={onCSVExport} variant="default" size="sm">
            Export CSV
          </ActionButton>
          <ActionButton onClick={onExcelExport} variant="default" size="sm">
            Export Excel
          </ActionButton>
          <ActionButton onClick={onPDFExport} variant="default" size="sm">
            PDF Report
          </ActionButton>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortableHeader
                  field="period"
                  label="Period"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="status"
                  label="Status"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="entitiesInScope"
                  label="Entities"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="entitiesAtTarget"
                  label="At Target"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="totalMissedHires"
                  label="Missed Hires"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="totalProjectedFines"
                  label="Projected Fines"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="fakeRiskCount"
                  label="Fake Risk"
                  className="text-right"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="gatingReason"
                  label="Gating"
                  currentField={sortField}
                  order={sortOrder}
                  onSort={onSort}
                />
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
              ) : certs.length === 0 ? (
                <EmptyState
                  icon={Award}
                  title="No compliance certificates"
                  description="Generate a monthly compliance certificate to begin the certification cycle."
                />
              ) : (
                certs.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onSelect(c)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-900">{c.period}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${certStatusColor[c.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      {c.entitiesInScope}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">
                      {c.entitiesAtTarget}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-rose-600">
                      {c.totalMissedHires}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-amber-700">
                      {formatCurrency(c.totalProjectedFines)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${c.fakeRiskCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}
                      >
                        {c.fakeRiskCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.gatingReason ? (
                        <span className="text-xs text-rose-600 font-semibold line-clamp-1 max-w-[120px]">
                          ⚠ {c.gatingReason}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold">✓ Clear</span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <ActionButton onClick={() => onSelect(c)} variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </ActionButton>
                        {c.status === 'DRAFT' && !c.gatingReason && (
                          <ActionButton
                            onClick={() => setSignConfirm(c)}
                            variant="success"
                            size="sm"
                            loading={signingId === c.id}
                          >
                            <Award className="h-3 w-3" />
                            Sign
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>

      <ConfirmDialog
        open={!!signConfirm}
        title="Executive Certificate Sign-Off"
        description="By signing this certificate, you are attesting that all compliance data is accurate and complete for the selected period. This action creates an immutable audit record."
        details={
          signConfirm && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Period:</span>{' '}
                <strong>{signConfirm.period}</strong>
              </div>
              <div>
                <span className="text-slate-500">Entities In Scope:</span>{' '}
                <strong>{signConfirm.entitiesInScope}</strong>
              </div>
              <div>
                <span className="text-slate-500">At Target:</span>{' '}
                <strong className="text-emerald-700">{signConfirm.entitiesAtTarget}</strong>
              </div>
              <div>
                <span className="text-slate-500">Projected Fines:</span>{' '}
                <strong className="text-amber-700">
                  {formatCurrency(signConfirm.totalProjectedFines)}
                </strong>
              </div>
            </div>
          )
        }
        onConfirm={() => signConfirm && handleSign(signConfirm)}
        onCancel={() => setSignConfirm(null)}
        confirmLabel="Sign & Attest"
        confirmVariant="success"
        loading={!!signingId}
      />
    </div>
  );
}

const SAVED_VIEWS = [
  { id: 'default', name: 'Standard View' },
  { id: 'high-risk', name: 'High Risk Employees' },
  { id: 'gpssa-missing', name: 'GPSSA Missing Only' },
  { id: 'wps-missing', name: 'WPS Missing Only' },
  { id: 'nafis-missing', name: 'NAFIS Missing Only' },
  { id: 'projected-fines', name: 'Outstanding Projected Fines' },
];

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function EmiratisationCommandCenter() {
  const [mounted, setMounted] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleTabTransition = (tabId: WorkspaceTab, extraFilter?: () => void) => {
    setActiveTab(tabId);
    if (extraFilter) extraFilter();
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Data state
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [configs, setConfigs] = useState<EstablishmentConfig[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [hires, setHires] = useState<Hire[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  // Loading state
  const [loadingDash, setLoadingDash] = useState(true);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [loadingHires, setLoadingHires] = useState(true);
  const [loadingSnapshots, setLoadingSnapshots] = useState(true);
  const [loadingFines, setLoadingFines] = useState(true);
  const [loadingCerts, setLoadingCerts] = useState(true);

  // UI state
  const [period, setPeriod] = useState(periodNow);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('establishments');
  const [drawerRecord, setDrawerRecord] = useState<DrawerRecord>(null);
  const [showReadinessBreakdown, setShowReadinessBreakdown] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Lifted states for search, sort, pagination, and filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedView, setSelectedView] = useState('default');

  // Establishments Tab
  const [estSortField, setEstSortField] = useState('establishmentName');
  const [estSortOrder, setEstSortOrder] = useState<'asc' | 'desc'>('asc');
  const [estPage, setEstPage] = useState(1);
  const [estRowsPerPage, setEstRowsPerPage] = useState(10);

  // Targets Tab
  const [targetSortField, setTargetSortField] = useState('year');
  const [targetSortOrder, setTargetSortOrder] = useState<'asc' | 'desc'>('desc');
  const [targetPage, setTargetPage] = useState(1);
  const [targetRowsPerPage, setTargetRowsPerPage] = useState(10);

  // Employees Tab
  const [empSortField, setEmpSortField] = useState('hireDate');
  const [empSortOrder, setEmpSortOrder] = useState<'asc' | 'desc'>('desc');
  const [empPage, setEmpPage] = useState(1);
  const [empRowsPerPage, setEmpRowsPerPage] = useState(10);
  const [filterFakeRisk, setFilterFakeRisk] = useState(false);
  const [filterGpssaMissing, setFilterGpssaMissing] = useState(false);
  const [filterNafisMissing, setFilterNafisMissing] = useState(false);
  const [filterWpsMissing, setFilterWpsMissing] = useState(false);

  // Checkpoints Tab
  const [chkSortField, setChkSortField] = useState('checkpointDate');
  const [chkSortOrder, setChkSortOrder] = useState<'asc' | 'desc'>('desc');
  const [chkPage, setChkPage] = useState(1);
  const [chkRowsPerPage, setChkRowsPerPage] = useState(10);

  // Fines Tab
  const [fineFilterStatus, setFineFilterStatus] = useState('');
  const [fineSortField, setFineSortField] = useState('year');
  const [fineSortOrder, setFineSortOrder] = useState<'asc' | 'desc'>('desc');
  const [finePage, setFinePage] = useState(1);
  const [fineRowsPerPage, setFineRowsPerPage] = useState(10);

  // Certificates Tab
  const [certSortField, setCertSortField] = useState('period');
  const [certSortOrder, setCertSortOrder] = useState<'asc' | 'desc'>('desc');
  const [certPage, setCertPage] = useState(1);
  const [certRowsPerPage, setCertRowsPerPage] = useState(10);

  const handleSavedViewChange = (viewId: string) => {
    setSelectedView(viewId);
    if (viewId === 'default') {
      setActiveTab('establishments');
      setGlobalSearch('');
      setFilterFakeRisk(false);
      setFilterGpssaMissing(false);
      setFilterNafisMissing(false);
      setFilterWpsMissing(false);
      setFineFilterStatus('');
    } else if (viewId === 'high-risk') {
      setActiveTab('employees');
      setGlobalSearch('');
      setFilterFakeRisk(true);
      setFilterGpssaMissing(false);
      setFilterNafisMissing(false);
      setFilterWpsMissing(false);
    } else if (viewId === 'gpssa-missing') {
      setActiveTab('employees');
      setGlobalSearch('');
      setFilterFakeRisk(false);
      setFilterGpssaMissing(true);
      setFilterNafisMissing(false);
      setFilterWpsMissing(false);
    } else if (viewId === 'wps-missing') {
      setActiveTab('employees');
      setGlobalSearch('');
      setFilterFakeRisk(false);
      setFilterGpssaMissing(false);
      setFilterNafisMissing(false);
      setFilterWpsMissing(true);
    } else if (viewId === 'nafis-missing') {
      setActiveTab('employees');
      setGlobalSearch('');
      setFilterFakeRisk(false);
      setFilterGpssaMissing(false);
      setFilterNafisMissing(true);
      setFilterWpsMissing(false);
    } else if (viewId === 'projected-fines') {
      setActiveTab('fines');
      setGlobalSearch('');
      setFineFilterStatus('PROJECTED');
    }
  };

  // Checkpoint on page load — read URL params & localStorage
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as WorkspaceTab | null;

    // Load from localStorage if present
    const stored = localStorage.getItem('emiratisation_preferences');
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        if (prefs.estRowsPerPage) setEstRowsPerPage(prefs.estRowsPerPage);
        if (prefs.empRowsPerPage) setEmpRowsPerPage(prefs.empRowsPerPage);
        if (prefs.targetRowsPerPage) setTargetRowsPerPage(prefs.targetRowsPerPage);
        if (prefs.chkRowsPerPage) setChkRowsPerPage(prefs.chkRowsPerPage);
        if (prefs.fineRowsPerPage) setFineRowsPerPage(prefs.fineRowsPerPage);
        if (prefs.certRowsPerPage) setCertRowsPerPage(prefs.certRowsPerPage);

        if (!tabParam && prefs.activeTab) {
          setActiveTab(prefs.activeTab);
        }
        if (prefs.globalSearch) setGlobalSearch(prefs.globalSearch);
        if (prefs.filterFakeRisk !== undefined) setFilterFakeRisk(prefs.filterFakeRisk);
        if (prefs.filterGpssaMissing !== undefined) setFilterGpssaMissing(prefs.filterGpssaMissing);
        if (prefs.filterNafisMissing !== undefined) setFilterNafisMissing(prefs.filterNafisMissing);
        if (prefs.filterWpsMissing !== undefined) setFilterWpsMissing(prefs.filterWpsMissing);
        if (prefs.fineFilterStatus !== undefined) setFineFilterStatus(prefs.fineFilterStatus);
      } catch (e) {
        console.error('Failed to parse emiratisation_preferences', e);
      }
    }

    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Sync preferences to localStorage when changed
  useEffect(() => {
    if (mounted) {
      const preferences = {
        activeTab,
        estRowsPerPage,
        empRowsPerPage,
        targetRowsPerPage,
        chkRowsPerPage,
        fineRowsPerPage,
        certRowsPerPage,
        globalSearch,
        filterFakeRisk,
        filterGpssaMissing,
        filterNafisMissing,
        filterWpsMissing,
        fineFilterStatus,
      };
      localStorage.setItem('emiratisation_preferences', JSON.stringify(preferences));
    }
  }, [
    activeTab,
    estRowsPerPage,
    empRowsPerPage,
    targetRowsPerPage,
    chkRowsPerPage,
    fineRowsPerPage,
    certRowsPerPage,
    globalSearch,
    filterFakeRisk,
    filterGpssaMissing,
    filterNafisMissing,
    filterWpsMissing,
    fineFilterStatus,
    mounted,
  ]);

  // Sync activeTab selection to URL tab query parameter
  useEffect(() => {
    if (mounted) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.pushState(null, '', url.toString());
    }
  }, [activeTab, mounted]);

  // Load companies & employees for lookups
  useEffect(() => {
    fetch('/api/v1/companies')
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setCompaniesList(payload.data?.data ?? payload.data ?? []);
        }
      })
      .catch(console.error);

    fetch('/api/employees/search?size=500')
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setEmployeesList(payload.data?.employees ?? payload.data ?? []);
        }
      })
      .catch(console.error);
  }, []);

  // ─── Data Loaders ───

  const loadDashboard = useCallback(async () => {
    setLoadingDash(true);
    try {
      const r = await fetch(`/api/v1/emiratisation-compliance/dashboard?period=${period}`);
      const p = await r.json();
      if (p.success) setDashboard(p.data);
    } catch {
      /* silently fail */
    } finally {
      setLoadingDash(false);
    }
  }, [period]);

  const loadConfigs = useCallback(async () => {
    setLoadingConfigs(true);
    try {
      const r = await fetch('/api/v1/emiratisation-compliance/config');
      const p = await r.json();
      if (p.success) setConfigs(p.data ?? []);
    } catch {
      /* */
    } finally {
      setLoadingConfigs(false);
    }
  }, []);

  const loadTargets = useCallback(async () => {
    setLoadingTargets(true);
    try {
      const r = await fetch('/api/v1/emiratisation-compliance/targets');
      const p = await r.json();
      if (p.success) setTargets(p.data ?? []);
    } catch {
      /* */
    } finally {
      setLoadingTargets(false);
    }
  }, []);

  const loadHires = useCallback(async () => {
    setLoadingHires(true);
    try {
      const r = await fetch('/api/v1/emiratisation-compliance/hires?pageSize=200');
      const p = await r.json();
      if (p.success) {
        const payload = p.data;
        setHires(Array.isArray(payload) ? payload : (payload?.items ?? []));
      }
    } catch {
      /* */
    } finally {
      setLoadingHires(false);
    }
  }, []);

  const loadSnapshots = useCallback(async () => {
    setLoadingSnapshots(true);
    try {
      const r = await fetch('/api/v1/emiratisation-compliance/snapshots');
      const p = await r.json();
      if (p.success) setSnapshots(p.data ?? []);
    } catch {
      /* */
    } finally {
      setLoadingSnapshots(false);
    }
  }, []);

  const loadFines = useCallback(async () => {
    setLoadingFines(true);
    try {
      const r = await fetch('/api/v1/emiratisation-compliance/fines');
      const p = await r.json();
      if (p.success) setFines(p.data ?? []);
    } catch {
      /* */
    } finally {
      setLoadingFines(false);
    }
  }, []);

  const loadCerts = useCallback(async () => {
    setLoadingCerts(true);
    try {
      const r = await fetch('/api/v1/emiratisation-compliance/certificate');
      const p = await r.json();
      if (p.success) setCerts(p.data ?? []);
    } catch {
      /* */
    } finally {
      setLoadingCerts(false);
    }
  }, []);

  const loadAll = useCallback(() => {
    loadDashboard();
    loadConfigs();
    loadTargets();
    loadHires();
    loadSnapshots();
    loadFines();
    loadCerts();
  }, [loadDashboard, loadConfigs, loadTargets, loadHires, loadSnapshots, loadFines, loadCerts]);

  useEffect(() => {
    if (mounted) loadAll();
  }, [mounted, loadAll]);

  useEffect(() => {
    if (mounted) loadDashboard();
  }, [period, mounted, loadDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDashboard(),
      loadConfigs(),
      loadTargets(),
      loadHires(),
      loadSnapshots(),
      loadFines(),
      loadCerts(),
    ]);
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  // ─── List Filtering, Sorting, and Pagination useMemos ───

  // 1. Establishments Tab
  const filteredConfigs = useMemo(() => {
    let list = [...configs];
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.establishmentName.toLowerCase().includes(q) ||
          (c.tradeLicenseNumber && c.tradeLicenseNumber.toLowerCase().includes(q)) ||
          (c.sector && c.sector.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      let valA = (a as any)[estSortField];
      let valB = (b as any)[estSortField];
      if (estSortField === 'legalEntity') {
        valA = resolveEntityName(a.legalEntityId, a.legalEntity, companiesList);
        valB = resolveEntityName(b.legalEntityId, b.legalEntity, companiesList);
      }
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return estSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return estSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [configs, globalSearch, estSortField, estSortOrder, companiesList]);

  const paginatedConfigs = useMemo(() => {
    const start = (estPage - 1) * estRowsPerPage;
    return filteredConfigs.slice(start, start + estRowsPerPage);
  }, [filteredConfigs, estPage, estRowsPerPage]);

  // 2. Targets Tab
  const filteredTargets = useMemo(() => {
    let list = [...targets];
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter((t) => {
        const entityName = resolveEntityName(
          t.legalEntityId,
          t.legalEntity,
          companiesList
        ).toLowerCase();
        return entityName.includes(q) || String(t.year).includes(q);
      });
    }
    list.sort((a, b) => {
      let valA = (a as any)[targetSortField];
      let valB = (b as any)[targetSortField];
      if (targetSortField === 'legalEntity') {
        valA = resolveEntityName(a.legalEntityId, a.legalEntity, companiesList);
        valB = resolveEntityName(b.legalEntityId, b.legalEntity, companiesList);
      }
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return targetSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return targetSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [targets, globalSearch, targetSortField, targetSortOrder, companiesList]);

  const paginatedTargets = useMemo(() => {
    const start = (targetPage - 1) * targetRowsPerPage;
    return filteredTargets.slice(start, start + targetRowsPerPage);
  }, [filteredTargets, targetPage, targetRowsPerPage]);

  // 3. Employees Tab
  const filteredHires = useMemo(() => {
    let list = [...hires];
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter((h) => {
        const name = resolveEmployeeName(h.employeeId, h.employee, employeesList).toLowerCase();
        const code = (h.employee?.employeeCode ?? h.employeeId ?? '').toLowerCase();
        const jobLevel = (h.jobLevel ?? '').toLowerCase();
        const skill = h.isSkilled ? 'skilled' : 'unskilled';
        const dateStr = formatDate(h.hireDate).toLowerCase();
        const empRecord = employeesList.find(
          (e) => e.id === h.employeeId || e.employeeCode === h.employeeId
        );
        const dept = (empRecord?.department?.name ?? 'HR Operations').toLowerCase();
        const designation = (empRecord?.jobTitle ?? h.jobLevel ?? 'Associate').toLowerCase();
        return (
          name.includes(q) ||
          code.includes(q) ||
          jobLevel.includes(q) ||
          skill.includes(q) ||
          dateStr.includes(q) ||
          dept.includes(q) ||
          designation.includes(q)
        );
      });
    }
    if (filterFakeRisk) list = list.filter((h) => h.fakeRiskScore >= 50);
    if (filterGpssaMissing) list = list.filter((h) => !h.gpssaRegistered);
    if (filterNafisMissing) list = list.filter((h) => !h.nafisReference);
    if (filterWpsMissing) list = list.filter((h) => !h.wpsCovered);

    list.sort((a, b) => {
      let valA = (a as any)[empSortField];
      let valB = (b as any)[empSortField];
      if (empSortField === 'employee') {
        valA = resolveEmployeeName(a.employeeId, a.employee, employeesList);
        valB = resolveEmployeeName(b.employeeId, b.employee, employeesList);
      }
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return empSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return empSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [
    hires,
    globalSearch,
    filterFakeRisk,
    filterGpssaMissing,
    filterNafisMissing,
    filterWpsMissing,
    empSortField,
    empSortOrder,
    employeesList,
  ]);

  const paginatedHires = useMemo(() => {
    const start = (empPage - 1) * empRowsPerPage;
    return filteredHires.slice(start, start + empRowsPerPage);
  }, [filteredHires, empPage, empRowsPerPage]);

  // 4. Checkpoints Tab
  const filteredSnapshots = useMemo(() => {
    let list = [...snapshots];
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter((s) => {
        const entityName = resolveEntityName(
          s.legalEntityId,
          s.legalEntity,
          companiesList
        ).toLowerCase();
        const checkpoint = s.checkpoint === 'MID_YEAR' ? 'mid-year' : 'year-end';
        return entityName.includes(q) || checkpoint.includes(q) || String(s.year).includes(q);
      });
    }
    list.sort((a, b) => {
      let valA = (a as any)[chkSortField];
      let valB = (b as any)[chkSortField];
      if (chkSortField === 'legalEntity') {
        valA = resolveEntityName(a.legalEntityId, a.legalEntity, companiesList);
        valB = resolveEntityName(b.legalEntityId, b.legalEntity, companiesList);
      }
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return chkSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return chkSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [snapshots, globalSearch, chkSortField, chkSortOrder, companiesList]);

  const paginatedSnapshots = useMemo(() => {
    const start = (chkPage - 1) * chkRowsPerPage;
    return filteredSnapshots.slice(start, start + chkRowsPerPage);
  }, [filteredSnapshots, chkPage, chkRowsPerPage]);

  // 5. Fines Tab
  const filteredFines = useMemo(() => {
    let list = [...fines];
    if (fineFilterStatus) {
      list = list.filter((f) => f.status === fineFilterStatus);
    }
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter((f) => {
        const entityName = resolveEntityName(
          f.legalEntityId,
          f.legalEntity,
          companiesList
        ).toLowerCase();
        return (
          entityName.includes(q) || String(f.year).includes(q) || f.status.toLowerCase().includes(q)
        );
      });
    }
    list.sort((a, b) => {
      let valA = (a as any)[fineSortField];
      let valB = (b as any)[fineSortField];
      if (fineSortField === 'legalEntity') {
        valA = resolveEntityName(a.legalEntityId, a.legalEntity, companiesList);
        valB = resolveEntityName(b.legalEntityId, b.legalEntity, companiesList);
      }
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return fineSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return fineSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [fines, fineFilterStatus, globalSearch, fineSortField, fineSortOrder, companiesList]);

  const paginatedFines = useMemo(() => {
    const start = (finePage - 1) * fineRowsPerPage;
    return filteredFines.slice(start, start + fineRowsPerPage);
  }, [filteredFines, finePage, fineRowsPerPage]);

  // 6. Certificates Tab
  const filteredCerts = useMemo(() => {
    let list = [...certs];
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter((c) => c.period.includes(q) || c.status.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let valA = (a as any)[certSortField];
      let valB = (b as any)[certSortField];
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return certSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return certSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [certs, globalSearch, certSortField, certSortOrder]);

  const paginatedCerts = useMemo(() => {
    const start = (certPage - 1) * certRowsPerPage;
    return filteredCerts.slice(start, start + certRowsPerPage);
  }, [filteredCerts, certPage, certRowsPerPage]);

  // ─── Export Utilities ───

  const handleCSVExport = useCallback(
    (data: any[], filename: string) => {
      if (!data || data.length === 0) {
        toast.warning('No records available to export');
        return;
      }

      // Pick primitive fields for clean CSV export
      const rawKeys = Object.keys(data[0]);
      const cleanKeys = rawKeys.filter((k) => typeof data[0][k] !== 'object');

      const headers = cleanKeys.join(',');
      const rows = data.map((row) =>
        cleanKeys.map((key) => `"${String(row[key] ?? '').replace(/"/g, '""')}"`).join(',')
      );

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${filename}_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${filename} successfully exported as CSV`);
    },
    [period]
  );

  const handleExcelExport = useCallback(
    (data: any[], filename: string) => {
      if (!data || data.length === 0) {
        toast.warning('No records available to export');
        return;
      }

      // Pick primitive fields for clean Tab-Separated Excel export
      const rawKeys = Object.keys(data[0]);
      const cleanKeys = rawKeys.filter((k) => typeof data[0][k] !== 'object');

      const headers = cleanKeys.join('\t');
      const rows = data.map((row) => cleanKeys.map((key) => String(row[key] ?? '')).join('\t'));

      const content = [headers, ...rows].join('\n');
      const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${period}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${filename} successfully exported as Excel spreadsheet`);
    },
    [period]
  );

  const handlePDFExport = useCallback((title: string) => {
    window.print();
    toast.success(`Generated PDF Print layout for ${title}`);
  }, []);

  // ─── Action Handlers ───

  const handleSaveTarget = async (data: any) => {
    const r = await fetch('/api/v1/emiratisation-compliance/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const p = await r.json();
    if (!p.success) throw new Error(p.error?.message);
    loadTargets();
  };

  const handleTakeSnapshot = async (data: any) => {
    const r = await fetch('/api/v1/emiratisation-compliance/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, checkpointDate: new Date(data.checkpointDate) }),
    });
    const p = await r.json();
    if (!p.success) throw new Error(p.error?.details?.error ?? p.error?.message ?? 'Failed');
    loadSnapshots();
    loadDashboard();
  };

  const handleLinkEvidence = async (
    employeeId: string,
    kind: 'gpssaRegistered' | 'wpsCovered',
    value: boolean
  ) => {
    const r = await fetch('/api/v1/emiratisation-compliance/hires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'link-evidence', employeeId, [kind]: value }),
    });
    const p = await r.json();
    if (!p.success) {
      toast.error('Failed to update evidence');
    } else {
      toast.success('Evidence updated');
      loadHires();
    }
  };

  const handleDetectFakeRisk = async (employeeId: string) => {
    const r = await fetch('/api/v1/emiratisation-compliance/hires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'detect-fake-risk', employeeId }),
    });
    const p = await r.json();
    if (p.success) {
      toast.success(`Risk score: ${p.data?.fakeRiskScore ?? 'updated'}`);
      loadHires();
    } else {
      toast.error('Failed to calculate risk');
    }
  };

  const handleFineAction = async (action: string, fineId: string) => {
    const r = await fetch('/api/v1/emiratisation-compliance/fines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, fineId }),
    });
    const p = await r.json();
    if (!p.success) throw new Error(p.error?.details?.error ?? p.error?.message ?? 'Failed');
    toast.success(`Fine ${action === 'mark-incurred' ? 'marked as incurred' : 'resolved'}`);
    loadFines();
    loadDashboard();
  };

  const handleGenerateCert = async (certPeriod: string) => {
    const r = await fetch('/api/v1/emiratisation-compliance/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', period: certPeriod }),
    });
    const p = await r.json();
    if (!p.success) throw new Error(p.error?.message ?? 'Failed');
    loadCerts();
  };

  const handleSignCert = async (cert: Certificate) => {
    const r = await fetch('/api/v1/emiratisation-compliance/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sign',
        period: cert.period,
        attestations: [{ field: 'attest', value: 'OK' }],
      }),
    });
    const p = await r.json();
    if (!p.success) throw new Error(p.error?.details?.error ?? p.error?.message ?? 'Failed');
    loadCerts();
  };

  // ─── Derived State ───

  const readinessScore = useMemo(
    () => computeReadinessScore(dashboard, hires, snapshots, certs),
    [dashboard, hires, snapshots, certs]
  );

  const insights = useMemo(
    () => generateInsights(dashboard, hires, targets, snapshots),
    [dashboard, hires, targets, snapshots]
  );

  const nextCheckpoint = useMemo(() => getNextCheckpoint(), []);

  const compliancePct = useMemo(() => {
    if (!dashboard || dashboard.entitiesInScope === 0) return 0;
    return (dashboard.entitiesAtTarget / dashboard.entitiesInScope) * 100;
  }, [dashboard]);

  // Build simple trend data from snapshots for charts
  const trendData = useMemo(() => {
    const sorted = [...snapshots]
      .sort((a, b) => new Date(a.checkpointDate).getTime() - new Date(b.checkpointDate).getTime())
      .slice(-12);
    return sorted.map((s) => ({
      name: `${s.checkpoint === 'MID_YEAR' ? 'Mid' : 'YE'} ${s.year ?? new Date(s.checkpointDate).getFullYear()}`,
      actual: parseFloat(s.actualPct ?? '0'),
      target: parseFloat(s.targetPct ?? '0'),
      fine: parseFloat(s.projectedFine ?? '0'),
    }));
  }, [snapshots]);

  const WORKSPACE_TABS: {
    id: WorkspaceTab;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    { id: 'establishments', label: 'Establishments', icon: Building, count: configs.length },
    { id: 'targets', label: 'Gov. Targets', icon: Target, count: targets.length },
    { id: 'employees', label: 'UAE Nationals', icon: Users, count: hires.length },
    { id: 'checkpoints', label: 'Checkpoints', icon: Calendar, count: snapshots.length },
    { id: 'fines', label: 'Gov. Fines', icon: Banknote, count: fines.length },
    { id: 'certificates', label: 'Certificates', icon: Award, count: certs.length },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Right-Side Details Drawer ─── */}
      <AnimatePresence>
        {drawerRecord && (
          <DetailsDrawer
            record={drawerRecord}
            onClose={() => setDrawerRecord(null)}
            companiesList={companiesList}
            employeesList={employeesList}
          />
        )}
      </AnimatePresence>

      {/* ─── Readiness Breakdown Modal ─── */}
      <ReadinessBreakdownModal
        open={showReadinessBreakdown}
        score={readinessScore}
        onClose={() => setShowReadinessBreakdown(false)}
      />

      {/* ─── What-If Simulator ─── */}
      <WhatIfSimulator
        open={showSimulator}
        onClose={() => setShowSimulator(false)}
        configs={configs}
        targets={targets}
        dashboard={dashboard}
      />

      <div className="mx-auto max-w-screen-2xl px-4 py-6 lg:px-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 pb-5 gap-6 mb-6">
          {/* Left: Title + Meta */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              EPIC-16 · UAE Emiratisation Compliance
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Compliance Command Center
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Period:{' '}
                  <input
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  Next: {nextCheckpoint.name} in{' '}
                  <span
                    className={`font-bold ${nextCheckpoint.daysLeft <= 30 ? 'text-rose-600' : nextCheckpoint.daysLeft <= 60 ? 'text-amber-600' : 'text-emerald-600'}`}
                  >
                    {nextCheckpoint.daysLeft} days
                  </span>{' '}
                  ({nextCheckpoint.date})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-slate-400" />
                <span>Regulatory Version: MOHRE 2024 · Cabinet Decision No. 47/2021</span>
              </div>
            </div>
          </div>

          {/* Center: Readiness Gauge */}
          <div className="shrink-0 flex justify-center">
            <ReadinessGauge
              score={readinessScore}
              onClick={() => setShowReadinessBreakdown(true)}
            />
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end justify-start">
            <button
              type="button"
              onClick={() => setShowSimulator(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all"
            >
              <Calculator className="h-3.5 w-3.5 text-slate-500" />
              What-If Simulator
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('certificates');
                toast.info('Generate a certificate from the Certificates tab');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all"
            >
              <Award className="h-3.5 w-3.5 text-slate-500" />
              Generate Certificate
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        </header>

        {/* Summary strip */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-500">
            {loadingDash ? (
              <span className="text-slate-400">Loading compliance data...</span>
            ) : dashboard ? (
              <>
                <span>
                  <span className="text-slate-900 font-bold">{dashboard.entitiesInScope}</span>{' '}
                  entities in scope
                </span>
                <span>
                  <span className="text-emerald-600 font-bold">{dashboard.entitiesAtTarget}</span>{' '}
                  at target
                </span>
                <span>
                  <span
                    className={`font-bold ${dashboard.totalMissedHires > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                  >
                    {dashboard.totalMissedHires}
                  </span>{' '}
                  missed hire{dashboard.totalMissedHires !== 1 ? 's' : ''}
                </span>
                <span>
                  <span
                    className={`font-bold ${dashboard.totalProjectedFines > 0 ? 'text-amber-600' : 'text-emerald-600'}`}
                  >
                    {formatCurrency(dashboard.totalProjectedFines)}
                  </span>{' '}
                  projected fines
                </span>
                <span>
                  <span
                    className={`font-bold ${dashboard.fakeRiskCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                  >
                    {dashboard.fakeRiskCount}
                  </span>{' '}
                  fake-risk hires
                </span>
              </>
            ) : (
              <span className="text-slate-400">No dashboard data for this period</span>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            KPI CARDS
        ═══════════════════════════════════════════════ */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KPICard
            label="Entities In Scope"
            value={loadingDash ? '—' : (dashboard?.entitiesInScope ?? 0).toString()}
            icon={Building}
            color="bg-indigo-100 text-indigo-700"
            onClick={() => handleTabTransition('establishments')}
          />
          <KPICard
            label="At Target"
            value={loadingDash ? '—' : (dashboard?.entitiesAtTarget ?? 0).toString()}
            icon={CheckCircle2}
            color="bg-emerald-100 text-emerald-700"
            onClick={() => handleTabTransition('establishments')}
          />
          <KPICard
            label="Non-Compliant"
            value={
              loadingDash
                ? '—'
                : Math.max(
                    0,
                    (dashboard?.entitiesInScope ?? 0) - (dashboard?.entitiesAtTarget ?? 0)
                  ).toString()
            }
            icon={XCircle}
            color="bg-rose-100 text-rose-700"
            onClick={() => handleTabTransition('establishments')}
          />
          <KPICard
            label="Overall Compliance"
            value={loadingDash ? '—' : formatPct(compliancePct)}
            icon={Percent}
            color="bg-blue-100 text-blue-700"
          />
          <KPICard
            label="UAE Nationals Registered"
            value={loadingHires ? '—' : hires.length.toString()}
            icon={Users}
            color="bg-violet-100 text-violet-700"
            onClick={() => handleTabTransition('employees')}
          />
          <KPICard
            label="Missed Hires"
            value={loadingDash ? '—' : (dashboard?.totalMissedHires ?? 0).toString()}
            icon={AlertTriangle}
            color="bg-amber-100 text-amber-700"
          />
          <KPICard
            label="Projected Fine"
            value={loadingDash ? '—' : formatCurrency(dashboard?.totalProjectedFines ?? 0)}
            icon={Banknote}
            color="bg-rose-100 text-rose-700"
            onClick={() =>
              handleTabTransition('fines', () => {
                setFineFilterStatus('PROJECTED');
              })
            }
          />
          <KPICard
            label="High-Risk Hires"
            value={
              loadingHires ? '—' : hires.filter((h) => h.fakeRiskScore >= 50).length.toString()
            }
            icon={AlertCircle}
            color="bg-rose-100 text-rose-700"
            onClick={() =>
              handleTabTransition('employees', () => {
                setFilterFakeRisk(true);
                setFilterGpssaMissing(false);
                setFilterNafisMissing(false);
                setFilterWpsMissing(false);
              })
            }
          />
          <KPICard
            label="GPSSA Missing"
            value={loadingHires ? '—' : hires.filter((h) => !h.gpssaRegistered).length.toString()}
            icon={Flag}
            color="bg-amber-100 text-amber-700"
            onClick={() =>
              handleTabTransition('employees', () => {
                setFilterFakeRisk(false);
                setFilterGpssaMissing(true);
                setFilterNafisMissing(false);
                setFilterWpsMissing(false);
              })
            }
          />
          <KPICard
            label="NAFIS Missing"
            value={loadingHires ? '—' : hires.filter((h) => !h.nafisReference).length.toString()}
            icon={Hash}
            color="bg-amber-100 text-amber-700"
            onClick={() =>
              handleTabTransition('employees', () => {
                setFilterFakeRisk(false);
                setFilterGpssaMissing(false);
                setFilterNafisMissing(true);
                setFilterWpsMissing(false);
              })
            }
          />
          <KPICard
            label="WPS Missing"
            value={loadingHires ? '—' : hires.filter((h) => !h.wpsCovered).length.toString()}
            icon={AlertCircle}
            color="bg-orange-100 text-orange-700"
            onClick={() =>
              handleTabTransition('employees', () => {
                setFilterFakeRisk(false);
                setFilterGpssaMissing(false);
                setFilterNafisMissing(false);
                setFilterWpsMissing(true);
              })
            }
          />
          <KPICard
            label="Checkpoint Snapshots"
            value={loadingSnapshots ? '—' : snapshots.length.toString()}
            icon={Calendar}
            color="bg-sky-100 text-sky-700"
            onClick={() => handleTabTransition('checkpoints')}
          />
          <KPICard
            label="Total Fines"
            value={loadingFines ? '—' : fines.length.toString()}
            icon={Scale}
            color="bg-red-100 text-red-700"
            onClick={() => handleTabTransition('fines')}
          />
          <KPICard
            label="Certificates"
            value={loadingCerts ? '—' : certs.length.toString()}
            icon={Award}
            color="bg-emerald-100 text-emerald-700"
            onClick={() => handleTabTransition('certificates')}
          />
          <KPICard
            label="Gov. Readiness Score"
            value={`${readinessScore.total}/100`}
            sub={readinessScore.label}
            icon={Gauge}
            color="bg-indigo-100 text-indigo-700"
            onClick={() => setShowReadinessBreakdown(true)}
          />
        </div>

        {/* ═══════════════════════════════════════════════
            READINESS PANEL + INSIGHTS
        ═══════════════════════════════════════════════ */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          {/* MOHRE Readiness */}
          <MOHREInspectionPanel score={readinessScore} hires={hires} certs={certs} />

          {/* Compliance Insights */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Compliance Insights</h3>
              <span className="ml-auto text-xs text-slate-400">Live · Based on current data</span>
            </div>
            <div className="space-y-2.5">
              {insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                    insight.type === 'critical'
                      ? 'bg-rose-50 border-rose-200'
                      : insight.type === 'warning'
                        ? 'bg-amber-50 border-amber-200'
                        : insight.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  {insight.type === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                  ) : insight.type === 'warning' ? (
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  ) : insight.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold leading-relaxed ${
                        insight.type === 'critical'
                          ? 'text-rose-800'
                          : insight.type === 'warning'
                            ? 'text-amber-800'
                            : insight.type === 'success'
                              ? 'text-emerald-800'
                              : 'text-blue-800'
                      }`}
                    >
                      {insight.message}
                    </p>
                  </div>
                  {insight.action && (
                    <button
                      type="button"
                      onClick={() => {
                        if (insight.action === 'View Employees') handleTabTransition('employees');
                        if (insight.action === 'View Establishments')
                          handleTabTransition('establishments');
                        if (insight.action === 'View Fines') handleTabTransition('fines');
                      }}
                      className="shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      {insight.action} →
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            ANALYTICS
        ═══════════════════════════════════════════════ */}
        {trendData.length > 0 && (
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            {/* Emiratisation Trend */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Emiratisation % Trend</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Actual vs Target across checkpoints
                  </p>
                </div>
                <LineChartIcon className="h-4 w-4 text-slate-300" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    formatter={(value: unknown) => {
                      const n = typeof value === 'number' ? value : 0;
                      return [`${n.toFixed(2)}%`];
                    }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 4 }}
                    name="Actual %"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#e2e8f0"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={false}
                    name="Target %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Fine Exposure Trend */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Fine Exposure</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Projected fines by checkpoint</p>
                </div>
                <BarChart3 className="h-4 w-4 text-slate-300" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatNumber(v)}
                  />
                  <Tooltip
                    formatter={(value: unknown) => {
                      const n = typeof value === 'number' ? value : 0;
                      return [formatCurrency(n), 'Projected Fine'];
                    }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="fine" fill="#f87171" radius={[4, 4, 0, 0]} name="Projected Fine" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            WORKSPACE TABS
        ═══════════════════════════════════════════════ */}
        <div
          ref={tabsRef}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        >
          {/* Saved View & Global Search strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Saved View:
              </span>
              <select
                value={selectedView}
                onChange={(e) => handleSavedViewChange(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 select-none shadow-sm cursor-pointer"
              >
                {SAVED_VIEWS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Global search across all tables..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-400 shadow-sm"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
            {WORKSPACE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-xs font-bold transition-all ${
                    isActive
                      ? 'border-indigo-600 bg-white text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'establishments' && (
                  <EstablishmentsTab
                    configs={paginatedConfigs}
                    loading={loadingConfigs}
                    onSelect={(c) => setDrawerRecord({ type: 'establishment', data: c })}
                    companiesList={companiesList}
                    sortField={estSortField}
                    sortOrder={estSortOrder}
                    onSort={(f) => {
                      setEstSortOrder(
                        estSortField === f ? (estSortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      );
                      setEstSortField(f);
                    }}
                    page={estPage}
                    rowsPerPage={estRowsPerPage}
                    onPageChange={setEstPage}
                    onRowsPerPageChange={setEstRowsPerPage}
                    total={filteredConfigs.length}
                    onCSVExport={() => handleCSVExport(filteredConfigs, 'Establishments')}
                    onExcelExport={() => handleExcelExport(filteredConfigs, 'Establishments')}
                    onPDFExport={() => handlePDFExport('Establishments')}
                  />
                )}

                {activeTab === 'targets' && (
                  <GovernmentTargetsTab
                    targets={paginatedTargets}
                    loading={loadingTargets}
                    onSelect={(t) => setDrawerRecord({ type: 'target', data: t })}
                    onSave={handleSaveTarget}
                    companiesList={companiesList}
                    sortField={targetSortField}
                    sortOrder={targetSortOrder}
                    onSort={(f) => {
                      setTargetSortOrder(
                        targetSortField === f ? (targetSortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      );
                      setTargetSortField(f);
                    }}
                    page={targetPage}
                    rowsPerPage={targetRowsPerPage}
                    onPageChange={setTargetPage}
                    onRowsPerPageChange={setTargetRowsPerPage}
                    total={filteredTargets.length}
                    onCSVExport={() => handleCSVExport(filteredTargets, 'Targets')}
                    onExcelExport={() => handleExcelExport(filteredTargets, 'Targets')}
                    onPDFExport={() => handlePDFExport('Targets')}
                  />
                )}

                {activeTab === 'employees' && (
                  <EmployeesTab
                    hires={paginatedHires}
                    loading={loadingHires}
                    onSelect={(h) => setDrawerRecord({ type: 'employee', data: h })}
                    onLinkEvidence={handleLinkEvidence}
                    onDetectFake={handleDetectFakeRisk}
                    employeesList={employeesList}
                    sortField={empSortField}
                    sortOrder={empSortOrder}
                    onSort={(f) => {
                      setEmpSortOrder(
                        empSortField === f ? (empSortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      );
                      setEmpSortField(f);
                    }}
                    page={empPage}
                    rowsPerPage={empRowsPerPage}
                    onPageChange={setEmpPage}
                    onRowsPerPageChange={setEmpRowsPerPage}
                    total={filteredHires.length}
                    filterFakeRisk={filterFakeRisk}
                    setFilterFakeRisk={setFilterFakeRisk}
                    filterGpssaMissing={filterGpssaMissing}
                    setFilterGpssaMissing={setFilterGpssaMissing}
                    filterNafisMissing={filterNafisMissing}
                    setFilterNafisMissing={setFilterNafisMissing}
                    filterWpsMissing={filterWpsMissing}
                    setFilterWpsMissing={setFilterWpsMissing}
                    onCSVExport={() => handleCSVExport(filteredHires, 'UAE_Nationals')}
                    onExcelExport={() => handleExcelExport(filteredHires, 'UAE_Nationals')}
                    onPDFExport={() => handlePDFExport('UAE Nationals')}
                  />
                )}

                {activeTab === 'checkpoints' && (
                  <CheckpointsTab
                    snapshots={paginatedSnapshots}
                    loading={loadingSnapshots}
                    onSelect={(s) => setDrawerRecord({ type: 'checkpoint', data: s })}
                    onTakeSnapshot={handleTakeSnapshot}
                    companiesList={companiesList}
                    sortField={chkSortField}
                    sortOrder={chkSortOrder}
                    onSort={(f) => {
                      setChkSortOrder(
                        chkSortField === f ? (chkSortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      );
                      setChkSortField(f);
                    }}
                    page={chkPage}
                    rowsPerPage={chkRowsPerPage}
                    onPageChange={setChkPage}
                    onRowsPerPageChange={setChkRowsPerPage}
                    total={filteredSnapshots.length}
                    onCSVExport={() => handleCSVExport(filteredSnapshots, 'Checkpoint_Snapshots')}
                    onExcelExport={() =>
                      handleExcelExport(filteredSnapshots, 'Checkpoint_Snapshots')
                    }
                    onPDFExport={() => handlePDFExport('Checkpoint Snapshots')}
                  />
                )}

                {activeTab === 'fines' && (
                  <FinesTab
                    fines={paginatedFines}
                    loading={loadingFines}
                    onSelect={(f) => setDrawerRecord({ type: 'fine', data: f })}
                    onAction={handleFineAction}
                    companiesList={companiesList}
                    sortField={fineSortField}
                    sortOrder={fineSortOrder}
                    onSort={(f) => {
                      setFineSortOrder(
                        fineSortField === f ? (fineSortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      );
                      setFineSortField(f);
                    }}
                    page={finePage}
                    rowsPerPage={fineRowsPerPage}
                    onPageChange={setFinePage}
                    onRowsPerPageChange={setFineRowsPerPage}
                    total={filteredFines.length}
                    fineFilterStatus={fineFilterStatus}
                    setFineFilterStatus={setFineFilterStatus}
                    onCSVExport={() => handleCSVExport(filteredFines, 'Fines')}
                    onExcelExport={() => handleExcelExport(filteredFines, 'Fines')}
                    onPDFExport={() => handlePDFExport('Fines')}
                  />
                )}

                {activeTab === 'certificates' && (
                  <CertificatesTab
                    certs={paginatedCerts}
                    loading={loadingCerts}
                    onSelect={(c) => setDrawerRecord({ type: 'certificate', data: c })}
                    onGenerate={handleGenerateCert}
                    onSign={handleSignCert}
                    sortField={certSortField}
                    sortOrder={certSortOrder}
                    onSort={(f) => {
                      setCertSortOrder(
                        certSortField === f ? (certSortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      );
                      setCertSortField(f);
                    }}
                    page={certPage}
                    rowsPerPage={certRowsPerPage}
                    onPageChange={setCertPage}
                    onRowsPerPageChange={setCertRowsPerPage}
                    total={filteredCerts.length}
                    onCSVExport={() => handleCSVExport(filteredCerts, 'Certificates')}
                    onExcelExport={() => handleExcelExport(filteredCerts, 'Certificates')}
                    onPDFExport={() => handlePDFExport('Certificates')}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
          <span>UAE Emiratisation Compliance · MOHRE · Cabinet Decision No. 47/2021</span>
          <span>KreupAI AuraOS · EPIC-16</span>
        </div>
      </div>
    </div>
  );
}
