'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Target,
  Search,
  Filter,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users,
  User,
  Building2,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Zap,
  BookOpen,
  GraduationCap,
  Sparkles,
  BrainCircuit,
  RefreshCw,
  Eye,
  FileText,
  Layers,
  Star,
  Code,
  Heart,
  Crown,
  Shield,
  Award,
  Calendar,
  Clock,
  Lightbulb,
  Route,
  Settings,
  Save,
  Plus,
  Trash2,
  Link2,
  Loader2,
} from 'lucide-react';
import { Sheet } from '@aura/ui/components/ui';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import { GapAnalysisService, DevelopmentPlanService } from '@/services/competency-library.service';
import { useDevelopmentPlans } from '@/hooks/useCompetencyLibrary';

// --- TYPES ---

type GapSeverity = 'Critical' | 'Significant' | 'Moderate' | 'Minor' | 'None';
type CompetencyCategory = 'Technical' | 'Leadership' | 'Behavioral' | 'Functional' | 'Core';
type ViewLevel = 'Individual' | 'Team' | 'Department' | 'Organization';

interface CompetencyGap {
  competencyId: string;
  competencyName: string;
  category: CompetencyCategory;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  severity: GapSeverity;
  trend: 'improving' | 'declining' | 'stable';
  impactedEmployees: number;
  recommendedActions: string[];
  estimatedTimeToClose: string;
  priority: number;
}

interface EmployeeGapSummary {
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  totalCompetencies: number;
  criticalGaps: number;
  significantGaps: number;
  moderateGaps: number;
  averageGap: number;
  overallReadiness: number;
  gaps: CompetencyGap[];
}

interface TeamGapSummary {
  teamId: string;
  teamName: string;
  department: string;
  headcount: number;
  avgReadiness: number;
  criticalGaps: number;
  topGaps: CompetencyGap[];
}

interface DepartmentGapSummary {
  departmentId: string;
  departmentName: string;
  headcount: number;
  avgReadiness: number;
  criticalGapsCount: number;
  teams: TeamGapSummary[];
}

// --- CONSTANTS & HELPERS ---

const CATEGORY_STYLES: Record<
  CompetencyCategory,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  Technical: {
    icon: <Code className="w-3.5 h-3.5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  Leadership: {
    icon: <Crown className="w-3.5 h-3.5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  Behavioral: {
    icon: <Heart className="w-3.5 h-3.5" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
  },
  Functional: {
    icon: <Briefcase className="w-3.5 h-3.5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  Core: {
    icon: <Star className="w-3.5 h-3.5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
};

const SEVERITY_STYLES: Record<
  GapSeverity,
  { color: string; bgColor: string; borderColor: string }
> = {
  Critical: {
    color: 'text-rose-600',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    borderColor: 'border-rose-300 dark:border-rose-700',
  },
  Significant: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
  Moderate: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  Minor: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  None: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  },
};

// Category color map for chart distribution
const CATEGORY_COLORS: Record<string, string> = {
  Technical: '#3B82F6',
  Leadership: '#F59E0B',
  Behavioral: '#F43F5E',
  Functional: '#8B5CF6',
  Core: '#10B981',
};

// Helper: map API priority to page severity
function mapPriorityToSeverity(priority: string): GapSeverity {
  switch (priority) {
    case 'Critical':
      return 'Critical';
    case 'High':
      return 'Significant';
    case 'Medium':
      return 'Moderate';
    case 'Low':
      return 'Minor';
    default:
      return 'None';
  }
}

// Helper: determine severity from numeric gap
function severityFromGap(gap: number): GapSeverity {
  const absGap = Math.abs(gap);
  if (absGap >= 1.5) return 'Critical';
  if (absGap >= 1.0) return 'Significant';
  if (absGap >= 0.5) return 'Moderate';
  if (absGap > 0) return 'Minor';
  return 'None';
}

// --- COMPONENTS ---

const SeverityBadge: React.FC<{ severity: GapSeverity }> = ({ severity }) => {
  const style = SEVERITY_STYLES[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${style.bgColor} ${style.color}`}
    >
      {severity === 'Critical' && <AlertTriangle className="w-3 h-3" />}
      {severity === 'Significant' && <AlertCircle className="w-3 h-3" />}
      {severity === 'None' && <CheckCircle2 className="w-3 h-3" />}
      {severity}
    </span>
  );
};

const TrendIndicator: React.FC<{ trend: 'improving' | 'declining' | 'stable' }> = ({ trend }) => {
  if (trend === 'improving')
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600">
        <TrendingUp className="w-3.5 h-3.5" /> Improving
      </span>
    );
  if (trend === 'declining')
    return (
      <span className="flex items-center gap-1 text-xs text-rose-600">
        <TrendingDown className="w-3.5 h-3.5" /> Declining
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs text-slate-500">
      <Minus className="w-3.5 h-3.5" /> Stable
    </span>
  );
};

const GapBar: React.FC<{ current: number; required: number; maxLevel?: number }> = ({
  current,
  required,
  maxLevel = 5,
}) => {
  const currentPct = (current / maxLevel) * 100;
  const requiredPct = (required / maxLevel) * 100;
  const gapPct = requiredPct - currentPct;

  return (
    <div className="space-y-1">
      <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {/* Current level */}
        <div
          className="absolute top-0 left-0 h-full bg-celestial-indigo rounded-full transition-all"
          style={{ width: `${currentPct}%` }}
        />
        {/* Gap indicator */}
        {gapPct > 0 && (
          <div
            className="absolute top-0 h-full bg-rose-200 dark:bg-rose-900/50 rounded-r-full"
            style={{ left: `${currentPct}%`, width: `${gapPct}%` }}
          />
        )}
        {/* Required level marker */}
        <div
          className="absolute top-0 w-0.5 h-full bg-rose-500"
          style={{ left: `${requiredPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>Current: {current.toFixed(1)}</span>
        <span>Required: {required.toFixed(1)}</span>
      </div>
    </div>
  );
};

const ReadinessGauge: React.FC<{ readiness: number; size?: 'sm' | 'md' | 'lg' }> = ({
  readiness,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-20 h-20 text-xl',
  };

  const getColor = () => {
    if (readiness >= 80) return 'text-emerald-500 border-emerald-500';
    if (readiness >= 60) return 'text-amber-500 border-amber-500';
    return 'text-rose-500 border-rose-500';
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-4 ${getColor()} flex items-center justify-center font-bold`}
    >
      {readiness}%
    </div>
  );
};

const GapCard: React.FC<{ gap: CompetencyGap; showDetails?: boolean }> = ({
  gap,
  showDetails = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const catStyle = CATEGORY_STYLES[gap.category];
  const sevStyle = SEVERITY_STYLES[gap.severity];

  return (
    <div
      className={`p-4 rounded-xl border-2 ${sevStyle.borderColor} ${sevStyle.bgColor} transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`p-2 rounded-lg bg-white dark:bg-slate-800 ${catStyle.color} shadow-sm shrink-0`}
          >
            {catStyle.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-bold text-sm text-ink-black dark:text-pearl">
                {gap.competencyName}
              </h4>
              <SeverityBadge severity={gap.severity} />
            </div>
            <div className="mt-2">
              <GapBar current={gap.currentLevel} required={gap.requiredLevel} />
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className={`text-2xl font-bold ${gap.gap < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
          >
            {gap.gap > 0 ? '+' : ''}
            {gap.gap.toFixed(1)}
          </div>
          <TrendIndicator trend={gap.trend} />
        </div>
      </div>

      {showDetails && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs font-bold text-celestial-indigo flex items-center gap-1 hover:underline"
          >
            {expanded ? 'Hide' : 'Show'} Details
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {gap.impactedEmployees} employees impacted
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {gap.estimatedTimeToClose}
                </span>
              </div>

              {gap.recommendedActions.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Recommended Actions
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {gap.recommendedActions.map((action, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function GapAnalysisPage() {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('Organization');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<GapSeverity | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<CompetencyCategory | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // API data state
  const [orgGaps, setOrgGaps] = useState<CompetencyGap[]>([]);
  const [employeeGaps, setEmployeeGaps] = useState<EmployeeGapSummary[]>([]);
  const [departmentGaps, setDepartmentGaps] = useState<DepartmentGapSummary[]>([]);

  // Fetch gap analyses from API
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const result = await GapAnalysisService.getAll();

        if (cancelled) return;

        if (!result.success || !result.data) {
          setFetchError('Failed to load gap analysis data');
          setOrgGaps([]);
          setEmployeeGaps([]);
          setDepartmentGaps([]);
          return;
        }

        const analyses = result.data as any[];

        // --- Build organization-level CompetencyGap[] from all items ---
        const gapMap = new Map<string, CompetencyGap>();
        let priorityCounter = 1;

        for (const analysis of analyses) {
          const items = analysis.items || [];
          for (const item of items) {
            const compId = item.competencyId || item.id;
            const compName = item.competency?.name || 'Unknown Competency';
            const rawCategory = item.competency?.category?.name || 'Core';
            const category: CompetencyCategory = (
              ['Technical', 'Leadership', 'Behavioral', 'Functional', 'Core'].includes(rawCategory)
                ? rawCategory
                : 'Core'
            ) as CompetencyCategory;

            const currentLvl = item.currentLevel?.levelNumber ?? item.currentLevel?.level ?? 1;
            const targetLvl = item.targetLevel?.levelNumber ?? item.targetLevel?.level ?? 3;
            const gapScore =
              typeof item.gapScore === 'number' ? item.gapScore : targetLvl - currentLvl;
            const gapValue = -Math.abs(gapScore);

            const severity: GapSeverity = item.priority
              ? mapPriorityToSeverity(item.priority)
              : severityFromGap(gapValue);

            if (!gapMap.has(compId)) {
              gapMap.set(compId, {
                competencyId: compId,
                competencyName: compName,
                category,
                currentLevel: currentLvl,
                requiredLevel: targetLvl,
                gap: gapValue === 0 ? 0 : gapValue,
                severity,
                trend: 'stable' as const,
                impactedEmployees: 0,
                recommendedActions: item.notes ? [item.notes] : [],
                estimatedTimeToClose: 'TBD',
                priority: priorityCounter++,
              });
            }
          }
        }

        const orgGapsList = Array.from(gapMap.values()).sort((a, b) => {
          const severityOrder: Record<GapSeverity, number> = {
            Critical: 0,
            Significant: 1,
            Moderate: 2,
            Minor: 3,
            None: 4,
          };
          return (
            severityOrder[a.severity] - severityOrder[b.severity] ||
            Math.abs(b.gap) - Math.abs(a.gap)
          );
        });
        // Re-assign priorities after sorting
        orgGapsList.forEach((g, i) => {
          g.priority = i + 1;
        });

        setOrgGaps(orgGapsList);

        // --- Build employee-level summaries from Individual analyses ---
        const empSummaries: EmployeeGapSummary[] = [];
        for (const analysis of analyses) {
          if (analysis.type === 'Individual' && analysis.targetType === 'Employee') {
            const items = analysis.items || [];
            const empGaps: CompetencyGap[] = items.map((item: any, idx: number) => {
              const compName = item.competency?.name || 'Unknown';
              const rawCat = item.competency?.category?.name || 'Core';
              const cat: CompetencyCategory = (
                ['Technical', 'Leadership', 'Behavioral', 'Functional', 'Core'].includes(rawCat)
                  ? rawCat
                  : 'Core'
              ) as CompetencyCategory;
              const cl = item.currentLevel?.levelNumber ?? 1;
              const tl = item.targetLevel?.levelNumber ?? 3;
              const gs = typeof item.gapScore === 'number' ? item.gapScore : tl - cl;
              const gv = -Math.abs(gs);
              return {
                competencyId: item.competencyId || item.id,
                competencyName: compName,
                category: cat,
                currentLevel: cl,
                requiredLevel: tl,
                gap: gv === 0 ? 0 : gv,
                severity: item.priority
                  ? mapPriorityToSeverity(item.priority)
                  : severityFromGap(gv),
                trend: 'stable' as const,
                impactedEmployees: 1,
                recommendedActions: item.notes ? [item.notes] : [],
                estimatedTimeToClose: 'TBD',
                priority: idx + 1,
              };
            });

            const critical = empGaps.filter((g) => g.severity === 'Critical').length;
            const significant = empGaps.filter((g) => g.severity === 'Significant').length;
            const moderate = empGaps.filter((g) => g.severity === 'Moderate').length;
            const totalComp = empGaps.length || 1;
            const avgGap =
              empGaps.length > 0 ? empGaps.reduce((s, g) => s + g.gap, 0) / empGaps.length : 0;
            const readiness = Math.max(
              0,
              Math.min(100, Math.round(((totalComp - critical - significant) / totalComp) * 100))
            );

            empSummaries.push({
              employeeId: analysis.targetId || analysis.id,
              employeeName: analysis.name || 'Unknown Employee',
              role: analysis.targetType || 'Employee',
              department:
                analysis.type === 'Individual' ? 'General' : analysis.targetId || 'General',
              totalCompetencies: totalComp,
              criticalGaps: critical,
              significantGaps: significant,
              moderateGaps: moderate,
              averageGap: Math.round(avgGap * 10) / 10,
              overallReadiness: readiness,
              gaps: empGaps,
            });
          }
        }
        setEmployeeGaps(empSummaries);

        // --- Build department-level summaries from Department analyses ---
        const deptSummaries: DepartmentGapSummary[] = [];
        for (const analysis of analyses) {
          if (analysis.type === 'Department') {
            const items = analysis.items || [];
            const criticalCount = items.filter((i: any) => i.priority === 'Critical').length;
            const totalItems = items.length || 1;
            const avgGapScore =
              items.length > 0
                ? items.reduce(
                    (s: number, i: any) => s + (typeof i.gapScore === 'number' ? i.gapScore : 0),
                    0
                  ) / items.length
                : 0;
            // Estimate readiness: lower gap score = higher readiness (scale 0-5 gap to 0-100)
            const readiness = Math.max(0, Math.min(100, Math.round((1 - avgGapScore / 5) * 100)));

            deptSummaries.push({
              departmentId: analysis.targetId || analysis.id,
              departmentName: analysis.name || 'Unknown Department',
              headcount: 0,
              avgReadiness: readiness,
              criticalGapsCount: criticalCount,
              teams: [],
            });
          }
        }
        setDepartmentGaps(deptSummaries);
      } catch (err: any) {
        if (!cancelled) {
          console.error('Gap analysis fetch error:', err);
          setFetchError('An error occurred while loading gap analysis data.');
          setOrgGaps([]);
          setEmployeeGaps([]);
          setDepartmentGaps([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleRefresh = () => setReloadKey((k) => k + 1);

  // Export the current organization-level gaps as a CSV report.
  const handleExportReport = () => {
    const headers = [
      'Competency',
      'Category',
      'Current Level',
      'Required Level',
      'Gap',
      'Severity',
    ];
    const rows = orgGaps.map((g) => [
      g.competencyName,
      g.category,
      String(g.currentLevel),
      String(g.requiredLevel),
      String(g.gap),
      g.severity,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gap-analysis-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Derived data ---
  const radarData = useMemo(
    () =>
      orgGaps.slice(0, 6).map((gap) => ({
        subject: gap.competencyName.split(' ')[0],
        current: gap.currentLevel,
        required: gap.requiredLevel,
        fullMark: 5,
      })),
    [orgGaps]
  );

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of orgGaps) {
      counts[g.category] = (counts[g.category] || 0) + 1;
    }
    return Object.entries(counts).map(([name, gaps]) => ({
      name,
      gaps,
      color: CATEGORY_COLORS[name] || '#6B7280',
    }));
  }, [orgGaps]);

  const stats = useMemo(() => {
    const totalEmployees =
      employeeGaps.length || departmentGaps.reduce((s, d) => s + d.headcount, 0);
    const critical = orgGaps.filter((g) => g.severity === 'Critical').length;
    const significant = orgGaps.filter((g) => g.severity === 'Significant').length;
    const improving = orgGaps.filter((g) => g.trend === 'improving').length;
    const improvingPct = orgGaps.length > 0 ? Math.round((improving / orgGaps.length) * 100) : 0;
    const avgReadiness =
      departmentGaps.length > 0
        ? Math.round(departmentGaps.reduce((s, d) => s + d.avgReadiness, 0) / departmentGaps.length)
        : orgGaps.length > 0
          ? Math.round(
              (1 - orgGaps.reduce((s, g) => s + Math.abs(g.gap), 0) / orgGaps.length / 5) * 100
            )
          : 0;
    return {
      totalEmployees,
      avgReadiness,
      criticalGaps: critical,
      significantGaps: significant,
      improvingTrend: improvingPct,
      trainingHoursNeeded: orgGaps.length * 40, // rough estimate
    };
  }, [orgGaps, employeeGaps, departmentGaps]);

  // Development Plan Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [developmentPlans, setDevelopmentPlans] = useState<
    {
      id: string;
      name: string;
      targetEmployee: string;
      targetDepartment: string;
      startDate: string;
      endDate: string;
      status: 'Draft' | 'Active' | 'Completed';
      gaps: { gapId: string; gapName: string; priority: number }[];
      activities: { id: string; name: string; type: string; dueDate: string; status: string }[];
    }[]
  >([]);

  // Load existing development plans from the API (AURA-042 list/view) via the
  // shared useDevelopmentPlans hook (AURA-046).
  const { developmentPlans: apiDevelopmentPlans, refetch: refetchDevelopmentPlans } =
    useDevelopmentPlans();
  useEffect(() => {
    if (!apiDevelopmentPlans) return;
    setDevelopmentPlans(
      apiDevelopmentPlans.map((p: any) => ({
        id: p.id,
        name: p.name,
        targetEmployee: p.targetType === 'employee' ? p.targetId || '' : '',
        targetDepartment: p.targetType === 'department' ? p.targetId || '' : '',
        startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : '',
        endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : '',
        status: (p.status === 'Active' || p.status === 'Completed' ? p.status : 'Draft') as
          | 'Draft'
          | 'Active'
          | 'Completed',
        gaps: [],
        activities: (p.activities || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          dueDate: a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : '',
          status: a.status || 'Planned',
        })),
      }))
    );
  }, [apiDevelopmentPlans]);

  // Form state for development plan
  const [planFormData, setPlanFormData] = useState<{
    name: string;
    description: string;
    targetType: 'Individual' | 'Team' | 'Department' | 'Organization';
    targetEmployee: string;
    targetDepartment: string;
    startDate: string;
    endDate: string;
    selectedGaps: {
      gapId: string;
      gapName: string;
      category: CompetencyCategory;
      severity: GapSeverity;
      priority: number;
    }[];
    activities: {
      id: string;
      name: string;
      type: string;
      description: string;
      dueDate: string;
      resources: string;
      estimatedHours: number;
    }[];
    budget: string;
    successMetrics: string;
  }>({
    name: '',
    description: '',
    targetType: 'Individual',
    targetEmployee: '',
    targetDepartment: '',
    startDate: '',
    endDate: '',
    selectedGaps: [],
    activities: [],
    budget: '',
    successMetrics: '',
  });

  // Available activity types
  const ACTIVITY_TYPES = [
    'Training Course',
    'Workshop',
    'Certification',
    'Mentoring',
    'On-the-job Training',
    'Self-study',
    'Conference',
    'Coaching Session',
    'Project Assignment',
    'Job Shadowing',
    'E-Learning',
    'Book/Resource Study',
  ];

  const handleCreateDevelopmentPlan = () => {
    setPlanFormData({
      name: '',
      description: '',
      targetType: 'Individual',
      targetEmployee: '',
      targetDepartment: '',
      startDate: '',
      endDate: '',
      selectedGaps: [],
      activities: [],
      budget: '',
      successMetrics: '',
    });
    setIsSheetOpen(true);
  };

  const handleSaveDevelopmentPlan = async () => {
    setIsSaving(true);
    try {
      const result = await DevelopmentPlanService.create({
        name: planFormData.name,
        description: planFormData.description,
        type: planFormData.targetType,
        targetType:
          planFormData.targetType === 'Individual'
            ? 'employee'
            : planFormData.targetType === 'Team'
              ? 'team'
              : planFormData.targetType === 'Department'
                ? 'department'
                : 'organization',
        targetId: planFormData.targetEmployee || planFormData.targetDepartment || '',
        startDate: planFormData.startDate,
        endDate: planFormData.endDate,
        selectedGaps: planFormData.selectedGaps,
        activities: planFormData.activities,
        budget: planFormData.budget,
        successMetrics: planFormData.successMetrics,
      } as any);

      if (result.success) {
        // Re-load from the API so the list reflects persisted data.
        await refetchDevelopmentPlans();
        setIsSheetOpen(false);
      } else {
        setFetchError(result.error || 'Failed to save development plan.');
      }
    } catch (error: any) {
      setFetchError(error?.message || 'Failed to save development plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGapToPlan = (gap: CompetencyGap) => {
    if (!planFormData.selectedGaps.find((g) => g.gapId === gap.competencyId)) {
      setPlanFormData((prev) => ({
        ...prev,
        selectedGaps: [
          ...prev.selectedGaps,
          {
            gapId: gap.competencyId,
            gapName: gap.competencyName,
            category: gap.category,
            severity: gap.severity,
            priority: prev.selectedGaps.length + 1,
          },
        ],
      }));
    }
  };

  const handleRemoveGapFromPlan = (gapId: string) => {
    setPlanFormData((prev) => ({
      ...prev,
      selectedGaps: prev.selectedGaps.filter((g) => g.gapId !== gapId),
    }));
  };

  const handleAddActivity = () => {
    const newActivity = {
      id: `ACT-${Date.now()}`,
      name: '',
      type: 'Training Course',
      description: '',
      dueDate: '',
      resources: '',
      estimatedHours: 0,
    };
    setPlanFormData((prev) => ({
      ...prev,
      activities: [...prev.activities, newActivity],
    }));
  };

  const handleUpdateActivity = (index: number, field: string, value: string | number) => {
    setPlanFormData((prev) => ({
      ...prev,
      activities: prev.activities.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    }));
  };

  const handleRemoveActivity = (index: number) => {
    setPlanFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const handleAddAllCriticalGaps = () => {
    const criticalGaps = orgGaps.filter(
      (g) => g.severity === 'Critical' || g.severity === 'Significant'
    );
    const newGaps = criticalGaps
      .filter((g) => !planFormData.selectedGaps.find((sg) => sg.gapId === g.competencyId))
      .map((g, idx) => ({
        gapId: g.competencyId,
        gapName: g.competencyName,
        category: g.category,
        severity: g.severity,
        priority: planFormData.selectedGaps.length + idx + 1,
      }));
    setPlanFormData((prev) => ({
      ...prev,
      selectedGaps: [...prev.selectedGaps, ...newGaps],
    }));
  };

  const filteredGaps = useMemo(() => {
    let result = orgGaps;

    if (severityFilter !== 'All') {
      result = result.filter((g) => g.severity === severityFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter((g) => g.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((g) => g.competencyName.toLowerCase().includes(query));
    }

    return result;
  }, [orgGaps, severityFilter, categoryFilter, searchQuery]);

  const filteredEmployees = useMemo(() => {
    let result = employeeGaps;

    if (selectedDepartment !== 'All') {
      result = result.filter((e) => e.department === selectedDepartment);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.employeeName.toLowerCase().includes(query) || e.role.toLowerCase().includes(query)
      );
    }

    return result.sort(
      (a, b) => b.criticalGaps - a.criticalGaps || a.overallReadiness - b.overallReadiness
    );
  }, [employeeGaps, selectedDepartment, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-celestial-indigo animate-spin" />
        <p className="text-sm text-silver-mist font-medium">Loading gap analysis data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Error Banner */}
      {fetchError && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm text-rose-700 dark:text-rose-300">{fetchError}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Target className="w-6 h-6 text-celestial-indigo" />
            Competency Gap Analysis
          </h1>
          <p className="text-silver-mist text-sm">
            Identify skill gaps across your organization and create targeted development plans.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleExportReport}
            disabled={orgGaps.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button
            onClick={handleCreateDevelopmentPlan}
            className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20"
          >
            <Route className="w-4 h-4" /> Create Development Plan
          </button>
        </div>
      </div>

      {/* View Level Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(['Organization', 'Department', 'Team', 'Individual'] as ViewLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => setViewLevel(level)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              viewLevel === level
                ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {stats.totalEmployees}
              </div>
              <div className="text-[10px] text-silver-mist uppercase font-bold">Employees</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {stats.avgReadiness}%
              </div>
              <div className="text-[10px] text-silver-mist uppercase font-bold">Avg Readiness</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {stats.criticalGaps}
              </div>
              <div className="text-[10px] text-silver-mist uppercase font-bold">Critical Gaps</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {stats.significantGaps}
              </div>
              <div className="text-[10px] text-silver-mist uppercase font-bold">Significant</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {stats.improvingTrend}%
              </div>
              <div className="text-[10px] text-silver-mist uppercase font-bold">Improving</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ink-black dark:text-pearl">
                {stats.trainingHoursNeeded}
              </div>
              <div className="text-[10px] text-silver-mist uppercase font-bold">Training Hrs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Radar Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h3 className="font-bold text-ink-black dark:text-pearl mb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-celestial-indigo" />
            Competency Radar
          </h3>
          <p className="text-xs text-silver-mist mb-4">Current vs Required proficiency levels</p>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Required"
                  dataKey="required"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="#f43f5e"
                  fillOpacity={0.1}
                  strokeDasharray="4 4"
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h3 className="font-bold text-ink-black dark:text-pearl mb-2 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-celestial-indigo" />
            Gap Distribution by Category
          </h3>
          <p className="text-xs text-silver-mist mb-4">Number of gaps per competency category</p>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="gaps" radius={[0, 4, 4, 0]}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {cat.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-ink-black dark:text-pearl">
                  {cat.gaps} gaps
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Readiness */}
        <div className="lg:col-span-1 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h3 className="font-bold text-ink-black dark:text-pearl mb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-celestial-indigo" />
            Department Readiness
          </h3>
          <p className="text-xs text-silver-mist mb-4">
            Overall competency readiness by department
          </p>

          <div className="space-y-4">
            {departmentGaps.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No department data available.</p>
              </div>
            )}
            {departmentGaps.map((dept) => (
              <div
                key={dept.departmentId}
                className="p-3 bg-slate-50 dark:bg-deep-cosmos/30 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-ink-black dark:text-pearl">
                      {dept.departmentName}
                    </h4>
                    <span className="text-[10px] text-slate-500">{dept.headcount} employees</span>
                  </div>
                  <ReadinessGauge readiness={dept.avgReadiness} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dept.avgReadiness >= 80
                          ? 'bg-emerald-500'
                          : dept.avgReadiness >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${dept.avgReadiness}%` }}
                    />
                  </div>
                  {dept.criticalGapsCount > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {dept.criticalGapsCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
            <input
              type="text"
              placeholder={
                viewLevel === 'Individual' ? 'Search employees...' : 'Search competencies...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
            />
          </div>

          {viewLevel !== 'Individual' && (
            <>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as GapSeverity | 'All')}
                className="px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="Significant">Significant</option>
                <option value="Moderate">Moderate</option>
                <option value="Minor">Minor</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CompetencyCategory | 'All')}
                className="px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Leadership">Leadership</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Functional">Functional</option>
                <option value="Core">Core</option>
              </select>
            </>
          )}

          {viewLevel === 'Individual' && (
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departmentGaps.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentName}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Gap List / Employee List based on view */}
      {viewLevel !== 'Individual' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-ink-black dark:text-pearl">
              Priority Gap Analysis
            </h3>
            <span className="text-sm text-silver-mist">{filteredGaps.length} gaps identified</span>
          </div>

          {filteredGaps.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No competency gaps found.</p>
              <p className="text-xs mt-1">
                Adjust filters or check back after analyses are completed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredGaps.map((gap) => (
                <GapCard key={gap.competencyId} gap={gap} showDetails />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-ink-black dark:text-pearl">
              Individual Gap Summary
            </h3>
            <span className="text-sm text-silver-mist">{filteredEmployees.length} employees</span>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No individual gap data available.</p>
              <p className="text-xs mt-1">Individual gap analyses will appear here once created.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.employeeId}
                  className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-celestial-indigo to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {emp.employeeName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-ink-black dark:text-pearl">
                          {emp.employeeName}
                        </h4>
                        <p className="text-sm text-silver-mist">
                          {emp.role} • {emp.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Gap Summary */}
                      <div className="flex items-center gap-3">
                        {emp.criticalGaps > 0 && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-rose-600">
                              {emp.criticalGaps}
                            </div>
                            <div className="text-[9px] uppercase text-slate-400">Critical</div>
                          </div>
                        )}
                        {emp.significantGaps > 0 && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {emp.significantGaps}
                            </div>
                            <div className="text-[9px] uppercase text-slate-400">Significant</div>
                          </div>
                        )}
                        {emp.moderateGaps > 0 && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-amber-600">
                              {emp.moderateGaps}
                            </div>
                            <div className="text-[9px] uppercase text-slate-400">Moderate</div>
                          </div>
                        )}
                      </div>

                      {/* Readiness */}
                      <div className="border-l border-slate-200 dark:border-slate-700 pl-6">
                        <ReadinessGauge readiness={emp.overallReadiness} size="md" />
                      </div>

                      {/* Actions */}
                      <button className="p-2 text-slate-400 hover:text-celestial-indigo hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>
                        Competency Coverage:{' '}
                        {emp.totalCompetencies - emp.criticalGaps - emp.significantGaps}/
                        {emp.totalCompetencies}
                      </span>
                      <span>Avg Gap: {emp.averageGap.toFixed(1)} levels</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${((emp.totalCompetencies - emp.criticalGaps - emp.significantGaps - emp.moderateGaps) / emp.totalCompetencies) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${(emp.moderateGaps / emp.totalCompetencies) * 100}%` }}
                      />
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${(emp.significantGaps / emp.totalCompetencies) * 100}%` }}
                      />
                      <div
                        className="h-full bg-rose-500"
                        style={{ width: `${(emp.criticalGaps / emp.totalCompetencies) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg border border-indigo-500/30 text-white">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-white/10 rounded-xl">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-bold uppercase opacity-80">AI Recommendations</span>
            </div>
            <h3 className="font-bold text-lg mb-3">Priority Actions to Close Gaps</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <span className="font-bold text-sm">Cloud Architecture</span>
                </div>
                <p className="text-xs opacity-90">
                  Launch AWS certification program for 45 engineers. Estimated impact: 40% gap
                  reduction in 6 months.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <span className="font-bold text-sm">Data Analytics</span>
                </div>
                <p className="text-xs opacity-90">
                  Implement data literacy bootcamp. 38 employees would benefit. ROI: High strategic
                  value.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <span className="font-bold text-sm">Strategic Thinking</span>
                </div>
                <p className="text-xs opacity-90">
                  Executive coaching for 28 managers. Critical for succession planning and
                  leadership pipeline.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" /> View Full Report
              </button>
              <button
                onClick={handleCreateDevelopmentPlan}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <Route className="w-4 h-4" /> Generate Development Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Development Plan Sheet */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Create Development Plan"
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsSheetOpen(false)}
              className="px-4 py-2 text-sm font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDevelopmentPlan}
              disabled={
                !planFormData.name ||
                !planFormData.startDate ||
                !planFormData.endDate ||
                planFormData.selectedGaps.length === 0
              }
              className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Create Plan
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Description */}
          <p className="text-sm text-silver-mist">
            Create a targeted development plan to address competency gaps. Select gaps to address,
            define learning activities, and set timelines.
          </p>

          {/* Plan Details Section */}
          <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-celestial-indigo" />
              Plan Details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Plan Name */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  placeholder="e.g., Q1 2026 Technical Skills Development"
                  className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={planFormData.description}
                  onChange={(e) =>
                    setPlanFormData({ ...planFormData, description: e.target.value })
                  }
                  placeholder="Describe the objectives and scope of this development plan..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none"
                />
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Target Scope *
                </label>
                <select
                  value={planFormData.targetType}
                  onChange={(e) =>
                    setPlanFormData({
                      ...planFormData,
                      targetType: e.target.value as typeof planFormData.targetType,
                    })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                >
                  <option value="Individual">Individual</option>
                  <option value="Team">Team</option>
                  <option value="Department">Department</option>
                  <option value="Organization">Organization-wide</option>
                </select>
              </div>

              {/* Target Department/Employee based on type */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {planFormData.targetType === 'Individual'
                    ? 'Target Employee'
                    : 'Target Department'}
                </label>
                {planFormData.targetType === 'Individual' ? (
                  <select
                    value={planFormData.targetEmployee}
                    onChange={(e) =>
                      setPlanFormData({ ...planFormData, targetEmployee: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                  >
                    <option value="">Select Employee</option>
                    {employeeGaps.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeName}>
                        {emp.employeeName} - {emp.role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={planFormData.targetDepartment}
                    onChange={(e) =>
                      setPlanFormData({ ...planFormData, targetDepartment: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Sales">Sales</option>
                    <option value="People & Culture">People & Culture</option>
                    <option value="Finance">Finance</option>
                    <option value="All">All Departments</option>
                  </select>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={planFormData.startDate}
                  onChange={(e) => setPlanFormData({ ...planFormData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={planFormData.endDate}
                  onChange={(e) => setPlanFormData({ ...planFormData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Budget (Optional)
                </label>
                <input
                  type="text"
                  value={planFormData.budget}
                  onChange={(e) => setPlanFormData({ ...planFormData, budget: e.target.value })}
                  placeholder="e.g., $10,000"
                  className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                />
              </div>
            </div>
          </div>

          {/* Competency Gaps Section */}
          <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2">
                <Target className="w-4 h-4 text-celestial-indigo" />
                Competency Gaps to Address
              </h3>
              <button
                onClick={handleAddAllCriticalGaps}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
              >
                <AlertTriangle className="w-3 h-3" /> Add All Critical/Significant
              </button>
            </div>

            {/* Gap Selection */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Select gaps from the analysis
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {orgGaps.map((gap) => {
                  const isSelected = planFormData.selectedGaps.find(
                    (g) => g.gapId === gap.competencyId
                  );
                  const sevStyle = SEVERITY_STYLES[gap.severity];
                  return (
                    <button
                      key={gap.competencyId}
                      onClick={() =>
                        isSelected
                          ? handleRemoveGapFromPlan(gap.competencyId)
                          : handleAddGapToPlan(gap)
                      }
                      className={`p-2 rounded-lg text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-celestial-indigo/20 border-2 border-celestial-indigo'
                          : 'bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 hover:border-celestial-indigo/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-ink-black dark:text-pearl">
                          {gap.competencyName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sevStyle.bgColor} ${sevStyle.color}`}
                        >
                          {gap.severity}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-1">Gap: {gap.gap.toFixed(1)} levels</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Gaps */}
            {planFormData.selectedGaps.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  Selected Gaps ({planFormData.selectedGaps.length})
                </label>
                <div className="space-y-2">
                  {planFormData.selectedGaps.map((gap, idx) => {
                    const sevStyle = SEVERITY_STYLES[gap.severity];
                    const catStyle = CATEGORY_STYLES[gap.category];
                    return (
                      <div
                        key={gap.gapId}
                        className="flex items-center gap-3 p-2 bg-white dark:bg-stellar-blue rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                        <div className={`p-1.5 rounded ${catStyle.bgColor} ${catStyle.color}`}>
                          {catStyle.icon}
                        </div>
                        <span className="flex-1 text-sm font-medium text-ink-black dark:text-pearl">
                          {gap.gapName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${sevStyle.bgColor} ${sevStyle.color}`}
                        >
                          {gap.severity}
                        </span>
                        <button
                          onClick={() => handleRemoveGapFromPlan(gap.gapId)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Development Activities Section */}
          <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-ink-black dark:text-pearl flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-celestial-indigo" />
                Development Activities
              </h3>
              <button
                onClick={handleAddActivity}
                className="flex items-center gap-1 px-3 py-1.5 bg-celestial-indigo text-white rounded-lg text-xs font-bold hover:bg-celestial-indigo/90 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Activity
              </button>
            </div>

            {planFormData.activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activities added yet.</p>
                <p className="text-xs">Add training, workshops, or other development activities.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {planFormData.activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="bg-white dark:bg-stellar-blue p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="grid grid-cols-12 gap-3">
                      {/* Activity Name */}
                      <div className="col-span-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Activity Name
                        </label>
                        <input
                          type="text"
                          value={activity.name}
                          onChange={(e) => handleUpdateActivity(index, 'name', e.target.value)}
                          placeholder="e.g., AWS Certification Course"
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                      </div>

                      {/* Activity Type */}
                      <div className="col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Type
                        </label>
                        <select
                          value={activity.type}
                          onChange={(e) => handleUpdateActivity(index, 'type', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl cursor-pointer"
                        >
                          {ACTIVITY_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Due Date */}
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={activity.dueDate}
                          onChange={(e) => handleUpdateActivity(index, 'dueDate', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                      </div>

                      {/* Hours */}
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Est. Hours
                        </label>
                        <input
                          type="number"
                          value={activity.estimatedHours || ''}
                          onChange={(e) =>
                            handleUpdateActivity(index, 'estimatedHours', Number(e.target.value))
                          }
                          placeholder="0"
                          className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                        />
                      </div>

                      {/* Remove */}
                      <div className="col-span-1 flex items-end justify-end">
                        <button
                          onClick={() => handleRemoveActivity(index)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description row */}
                    <div className="mt-3">
                      <input
                        type="text"
                        value={activity.description}
                        onChange={(e) => handleUpdateActivity(index, 'description', e.target.value)}
                        placeholder="Brief description or notes..."
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-deep-cosmos/50 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Success Metrics */}
          <div className="bg-slate-50 dark:bg-deep-cosmos/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-celestial-indigo" />
              Success Metrics
            </h3>
            <textarea
              value={planFormData.successMetrics}
              onChange={(e) => setPlanFormData({ ...planFormData, successMetrics: e.target.value })}
              placeholder="Define how success will be measured, e.g., 'Reduce average gap from -1.5 to -0.5 levels by end of Q1 2026'"
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-stellar-blue border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-ink-black dark:text-pearl resize-none"
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
