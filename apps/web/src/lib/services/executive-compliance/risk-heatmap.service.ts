/**
 * EPIC-31 Risk Heatmap Service
 *
 * Single point of access for all (prisma as any).redFlagInstance
 * and (prisma as any).complianceException reads. Encapsulating here
 * means future Prisma Client regeneration only requires touching this
 * one file to remove the type-safety bypass.
 *
 * Exports pure aggregation helpers used by every compliance-dashboard
 * API route: KPIs, heatmap, drill-down, analytics, filter options.
 */

import { prisma } from '@aura/database';

// ─── Domain → Source Module routing ──────────────────────────────────────────
export const DOMAIN_SOURCE_ROUTES: Record<string, string> = {
  ATTENDANCE: '/dashboard/attendance-compliance',
  BENEFITS: '/dashboard/benefits-compliance',
  ACCOMMODATION: '/dashboard/accommodation-compliance',
  EMIRATISATION: '/dashboard/emiratisation-compliance',
  BAHRAINIZATION: '/dashboard/bahrainization-compliance',
  DOCUMENT_RETENTION: '/dashboard/document-retention-compliance',
  WPS: '/dashboard/compliance-calendar',
  PAYROLL: '/dashboard/compliance-calendar',
  VISA_EXIT: '/dashboard/compliance-calendar',
  IMMIGRATION: '/dashboard/compliance-calendar',
  AUDIT: '/dashboard/compliance-audit-register',
  HSE: '/dashboard/executive-compliance',
  ER: '/dashboard/executive-compliance',
  EOSB: '/dashboard/executive-compliance',
  LEAVE: '/dashboard/executive-compliance',
  GOSI: '/dashboard/executive-compliance',
  GPSSA: '/dashboard/executive-compliance',
  SIO: '/dashboard/executive-compliance',
  NITAQAT: '/dashboard/executive-compliance',
  OVERTIME: '/dashboard/executive-compliance',
  HR_POLICIES: '/dashboard/executive-compliance',
  HR_FORMS: '/dashboard/executive-compliance',
};

// ─── Core types ───────────────────────────────────────────────────────────────
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FlagStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'WAIVED';

export interface FlagRow {
  id: string;
  ruleCode: string;
  domain: string;
  severity: Severity;
  status: FlagStatus;
  raisedAt: Date;
  clearedAt?: Date | null;
  details: Record<string, unknown>;
}

export interface EnrichedFlag extends FlagRow {
  countryCode: string;
  legalEntityId?: string;
  departmentId?: string;
  businessUnitId?: string;
  location?: string;
  ownerUserId?: string;
  label?: string;
  sourceModule?: string;
  ageInDays: number;
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  LOW: 1,
  MEDIUM: 5,
  HIGH: 20,
  CRITICAL: 80,
};

function daysSince(d: Date): number {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

function enrichFlag(row: FlagRow): EnrichedFlag {
  const d = row.details;
  return {
    ...row,
    countryCode: (d.countryCode as string) ?? (d.country as string) ?? 'UNASSIGNED',
    legalEntityId: d.legalEntityId as string | undefined,
    departmentId: d.departmentId as string | undefined,
    businessUnitId: d.businessUnitId as string | undefined,
    location: d.location as string | undefined,
    ownerUserId: d.ownerUserId as string | undefined,
    label: (d.label as string) ?? row.ruleCode,
    sourceModule: DOMAIN_SOURCE_ROUTES[row.domain] ?? '/dashboard/executive-compliance',
    ageInDays: daysSince(row.raisedAt),
  };
}

// ─── Fetch flags (single encapsulated DB call) ────────────────────────────────
export interface FetchFlagsInput {
  tenantId: string;
  statusIn?: FlagStatus[];
  domain?: string;
  country?: string;
  severity?: string;
  dateFrom?: Date;
  dateTo?: Date;
  take?: number;
}

export async function fetchFlags(input: FetchFlagsInput): Promise<EnrichedFlag[]> {
  const where: Record<string, unknown> = {
    tenantId: input.tenantId,
    isDeleted: false,
    ...(input.domain ? { domain: input.domain } : {}),
    ...(input.severity ? { severity: input.severity } : {}),
    ...(input.statusIn?.length
      ? { status: { in: input.statusIn } }
      : { status: { in: ['OPEN', 'IN_PROGRESS'] } }),
    ...(input.dateFrom || input.dateTo
      ? {
          raisedAt: {
            ...(input.dateFrom ? { gte: input.dateFrom } : {}),
            ...(input.dateTo ? { lte: input.dateTo } : {}),
          },
        }
      : {}),
  };

  const rows = await (prisma as any).redFlagInstance.findMany({
    where,
    orderBy: { raisedAt: 'desc' },
    take: input.take ?? 10000,
    select: {
      id: true,
      ruleCode: true,
      domain: true,
      severity: true,
      status: true,
      raisedAt: true,
      clearedAt: true,
      details: true,
    },
  });

  return (rows as FlagRow[]).map(enrichFlag);
}

// ─── Risk score computation ───────────────────────────────────────────────────
export function computeRiskScore(counts: Record<Severity, number>): number {
  const sum =
    counts.LOW * SEVERITY_WEIGHT.LOW +
    counts.MEDIUM * SEVERITY_WEIGHT.MEDIUM +
    counts.HIGH * SEVERITY_WEIGHT.HIGH +
    counts.CRITICAL * SEVERITY_WEIGHT.CRITICAL;
  if (sum === 0) return 0;
  if (sum < SEVERITY_WEIGHT.CRITICAL) return Math.round((sum / SEVERITY_WEIGHT.CRITICAL) * 50);
  return Math.min(100, Math.round(60 + 30 * Math.log10(sum / SEVERITY_WEIGHT.CRITICAL + 1)));
}

function emptyCounts(): Record<Severity, number> {
  return { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
}

// ─── KPI computation ──────────────────────────────────────────────────────────
export interface KpiSnapshot {
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

export async function computeKpis(
  tenantId: string,
  filters: { domain?: string; country?: string; severity?: string; dateFrom?: Date; dateTo?: Date }
): Promise<KpiSnapshot> {
  const allOpen = await fetchFlags({
    tenantId,
    statusIn: ['OPEN', 'IN_PROGRESS'],
    ...filters,
    take: 20000,
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

  const [resolvedRows, allRows] = await Promise.all([
    (prisma as any).redFlagInstance.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: 'RESOLVED',
        clearedAt: { gte: thirtyDaysAgo },
        ...(filters.domain ? { domain: filters.domain } : {}),
        ...(filters.severity ? { severity: filters.severity } : {}),
      },
      select: { id: true, raisedAt: true, clearedAt: true },
      take: 5000,
    }),
    (prisma as any).redFlagInstance.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(filters.domain ? { domain: filters.domain } : {}),
        ...(filters.severity ? { severity: filters.severity } : {}),
      },
      select: { id: true, ruleCode: true, raisedAt: true, details: true },
      take: 20000,
    }),
  ]);

  const overdueCAPAs = await (prisma as any).complianceException.count({
    where: {
      tenantId,
      isDeleted: false,
      status: 'OPEN',
      dueDate: { lt: new Date() },
    },
  });

  // Repeat findings: same ruleCode flagged ≥ 3 times in last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000);
  const ruleCodeMap = new Map<string, number>();
  for (const r of allRows) {
    if (new Date(r.raisedAt) > ninetyDaysAgo) {
      ruleCodeMap.set(r.ruleCode, (ruleCodeMap.get(r.ruleCode) ?? 0) + 1);
    }
  }
  const repeatFindings = [...ruleCodeMap.values()].filter((c) => c >= 3).length;

  // Escalated: CRITICAL open > 7 days
  const escalatedFindings = allOpen.filter(
    (f) => f.severity === 'CRITICAL' && f.ageInDays > 7
  ).length;

  // Avg resolution days
  let totalResolutionDays = 0;
  let resolvedCount = 0;
  for (const r of resolvedRows) {
    if (r.clearedAt) {
      const days = daysSince(r.raisedAt) - daysSince(r.clearedAt);
      totalResolutionDays += Math.max(0, days);
      resolvedCount++;
    }
  }

  const bySeverity = emptyCounts();
  let open = 0,
    inProgress = 0;
  const countries = new Set<string>();
  const entities = new Set<string>();
  const departments = new Set<string>();

  for (const f of allOpen) {
    bySeverity[f.severity]++;
    if (f.status === 'OPEN') open++;
    else if (f.status === 'IN_PROGRESS') inProgress++;
    countries.add(f.countryCode);
    if (f.legalEntityId) entities.add(f.legalEntityId);
    if (f.departmentId) departments.add(f.departmentId);
  }

  const totalScore = computeRiskScore(bySeverity);

  return {
    totalRisks: allOpen.length,
    critical: bySeverity.CRITICAL,
    high: bySeverity.HIGH,
    medium: bySeverity.MEDIUM,
    low: bySeverity.LOW,
    openRisks: open,
    inProgress,
    resolvedLast30d: (resolvedRows as unknown[]).length,
    healthScore: Math.max(0, 100 - totalScore),
    countriesAtRisk: countries.size,
    entitiesAtRisk: entities.size,
    departmentsAtRisk: departments.size,
    overdueCAPAs,
    escalatedFindings,
    repeatFindings,
    avgResolutionDays: resolvedCount > 0 ? Math.round(totalResolutionDays / resolvedCount) : 0,
    avgRiskScore: allOpen.length > 0 ? Math.round(totalScore) : 0,
  };
}

// ─── Heatmap cells ────────────────────────────────────────────────────────────
export interface HeatmapCell {
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

export async function buildHeatmap(
  tenantId: string,
  filters: {
    domain?: string;
    country?: string;
    severity?: string;
    entity?: string;
    department?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<{
  cells: HeatmapCell[];
  totals: { flagsInScope: number; domains: number; countries: number };
}> {
  const [currentFlags, prevFlags] = await Promise.all([
    fetchFlags({ tenantId, statusIn: ['OPEN', 'IN_PROGRESS'], ...filters }),
    fetchFlags({
      tenantId,
      statusIn: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      domain: filters.domain,
      country: filters.country,
      dateTo: new Date(Date.now() - 30 * 86_400_000),
      take: 10000,
    }),
  ]);

  const filtered = filters.country
    ? currentFlags.filter((f) => f.countryCode === filters.country)
    : currentFlags;
  const filteredEntity = filters.entity
    ? filtered.filter((f) => f.legalEntityId === filters.entity)
    : filtered;
  const filteredDept = filters.department
    ? filteredEntity.filter((f) => f.departmentId === filters.department)
    : filteredEntity;

  const byCell = new Map<string, EnrichedFlag[]>();
  for (const f of filteredDept) {
    const key = `${f.domain}::${f.countryCode}`;
    if (!byCell.has(key)) byCell.set(key, []);
    byCell.get(key)!.push(f);
  }

  const prevByCell = new Map<string, number>();
  for (const f of prevFlags) {
    const key = `${f.domain}::${f.countryCode}`;
    prevByCell.set(key, (prevByCell.get(key) ?? 0) + 1);
  }

  const cells: HeatmapCell[] = [];
  for (const [key, flags] of byCell) {
    const [domain, country] = key.split('::');
    const counts = emptyCounts();
    for (const f of flags) counts[f.severity]++;
    const riskScore = computeRiskScore(counts);
    const prevCount = prevByCell.get(key) ?? flags.length;
    const trend: 'UP' | 'DOWN' | 'STABLE' =
      flags.length > prevCount + 1 ? 'UP' : flags.length < prevCount - 1 ? 'DOWN' : 'STABLE';

    let maxSev: Severity | null = null;
    for (const s of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const) {
      if (counts[s] > 0) {
        maxSev = s;
        break;
      }
    }

    cells.push({
      domain,
      country,
      flagCount: flags.length,
      critical: counts.CRITICAL,
      high: counts.HIGH,
      medium: counts.MEDIUM,
      low: counts.LOW,
      maxSeverity: maxSev,
      riskScore,
      trend,
      sourceRoute: DOMAIN_SOURCE_ROUTES[domain] ?? '/dashboard/executive-compliance',
    });
  }

  cells.sort((a, b) => b.riskScore - a.riskScore);
  return {
    cells,
    totals: {
      flagsInScope: filteredDept.length,
      domains: new Set(cells.map((c) => c.domain)).size,
      countries: new Set(cells.map((c) => c.country)).size,
    },
  };
}

// ─── Top risks ────────────────────────────────────────────────────────────────
export interface TopRiskRow {
  id: string;
  ruleCode: string;
  domain: string;
  label: string;
  severity: Severity;
  status: string;
  countryCode: string;
  legalEntityId?: string;
  departmentId?: string;
  ageInDays: number;
  riskScore: number;
  sourceRoute: string;
}

export async function fetchTopRisks(
  tenantId: string,
  filters: {
    domain?: string;
    country?: string;
    severity?: string;
    entity?: string;
    department?: string;
  },
  take = 50
): Promise<TopRiskRow[]> {
  const flags = await fetchFlags({
    tenantId,
    statusIn: ['OPEN', 'IN_PROGRESS'],
    ...filters,
    take: 5000,
  });
  return flags
    .map((f) => ({
      id: f.id,
      ruleCode: f.ruleCode,
      domain: f.domain,
      label: f.label ?? f.ruleCode,
      severity: f.severity,
      status: f.status,
      countryCode: f.countryCode,
      legalEntityId: f.legalEntityId,
      departmentId: f.departmentId,
      ageInDays: f.ageInDays,
      riskScore: SEVERITY_WEIGHT[f.severity] + (f.ageInDays > 30 ? 10 : 0),
      sourceRoute: f.sourceModule ?? '/dashboard/executive-compliance',
    }))
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, take);
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface AnalyticsSnapshot {
  topCountries: Array<{ name: string; score: number; count: number }>;
  topDomains: Array<{ name: string; score: number; count: number }>;
  topDepartments: Array<{ name: string; score: number; count: number }>;
  topRules: Array<{ ruleCode: string; count: number; domain: string }>;
  monthlyTrend: Array<{ month: string; open: number; resolved: number; critical: number }>;
  severityDistribution: Array<{ name: string; value: number; color: string }>;
  riskAging: { d0_30: number; d31_60: number; d61_90: number; d90plus: number };
  riskMovement: { newRisks: number; resolved: number; escalated: number };
}

export async function computeAnalytics(
  tenantId: string,
  filters: { domain?: string; country?: string; severity?: string }
): Promise<AnalyticsSnapshot> {
  const flags = await fetchFlags({
    tenantId,
    statusIn: ['OPEN', 'IN_PROGRESS'],
    ...filters,
    take: 20000,
  });

  // Top countries
  const countryMap = new Map<string, { counts: Record<Severity, number>; n: number }>();
  const domainMap = new Map<string, { counts: Record<Severity, number>; n: number }>();
  const deptMap = new Map<string, { counts: Record<Severity, number>; n: number }>();
  const ruleMap = new Map<string, { count: number; domain: string }>();

  const aging = { d0_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };

  for (const f of flags) {
    // Country
    if (!countryMap.has(f.countryCode))
      countryMap.set(f.countryCode, { counts: emptyCounts(), n: 0 });
    countryMap.get(f.countryCode)!.counts[f.severity]++;
    countryMap.get(f.countryCode)!.n++;

    // Domain
    if (!domainMap.has(f.domain)) domainMap.set(f.domain, { counts: emptyCounts(), n: 0 });
    domainMap.get(f.domain)!.counts[f.severity]++;
    domainMap.get(f.domain)!.n++;

    // Department
    const deptKey = f.departmentId ?? 'UNASSIGNED';
    if (!deptMap.has(deptKey)) deptMap.set(deptKey, { counts: emptyCounts(), n: 0 });
    deptMap.get(deptKey)!.counts[f.severity]++;
    deptMap.get(deptKey)!.n++;

    // Rule
    if (!ruleMap.has(f.ruleCode)) ruleMap.set(f.ruleCode, { count: 0, domain: f.domain });
    ruleMap.get(f.ruleCode)!.count++;

    // Aging
    if (f.ageInDays <= 30) aging.d0_30++;
    else if (f.ageInDays <= 60) aging.d31_60++;
    else if (f.ageInDays <= 90) aging.d61_90++;
    else aging.d90plus++;
  }

  const toRanked = (map: Map<string, { counts: Record<Severity, number>; n: number }>) =>
    [...map.entries()]
      .map(([name, v]) => ({ name, score: computeRiskScore(v.counts), count: v.n }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

  // Monthly trend (12 months)
  const monthlyTrend: AnalyticsSnapshot['monthlyTrend'] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const [openCount, resolvedCount, criticalCount] = await Promise.all([
      (prisma as any).redFlagInstance.count({
        where: {
          tenantId,
          isDeleted: false,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          raisedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      (prisma as any).redFlagInstance.count({
        where: {
          tenantId,
          isDeleted: false,
          status: 'RESOLVED',
          clearedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      (prisma as any).redFlagInstance.count({
        where: {
          tenantId,
          isDeleted: false,
          severity: 'CRITICAL',
          raisedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);
    monthlyTrend.push({ month, open: openCount, resolved: resolvedCount, critical: criticalCount });
  }

  // Risk movement (vs 30 days ago)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
  const [newRisks, resolvedRecent, escalatedRecent] = await Promise.all([
    (prisma as any).redFlagInstance.count({
      where: { tenantId, isDeleted: false, raisedAt: { gte: thirtyDaysAgo } },
    }),
    (prisma as any).redFlagInstance.count({
      where: { tenantId, isDeleted: false, status: 'RESOLVED', clearedAt: { gte: thirtyDaysAgo } },
    }),
    (prisma as any).redFlagInstance.count({
      where: {
        tenantId,
        isDeleted: false,
        severity: 'CRITICAL',
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        raisedAt: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  const severityColors: Record<Severity, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#f59e0b',
    LOW: '#10b981',
  };

  const bySev = emptyCounts();
  for (const f of flags) bySev[f.severity]++;

  return {
    topCountries: toRanked(countryMap),
    topDomains: toRanked(domainMap),
    topDepartments: toRanked(deptMap),
    topRules: [...ruleMap.entries()]
      .map(([ruleCode, v]) => ({ ruleCode, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    monthlyTrend,
    severityDistribution: (Object.keys(bySev) as Severity[]).map((s) => ({
      name: s,
      value: bySev[s],
      color: severityColors[s],
    })),
    riskAging: aging,
    riskMovement: { newRisks, resolved: resolvedRecent, escalated: escalatedRecent },
  };
}

// ─── Filter options ───────────────────────────────────────────────────────────
export interface FilterOptions {
  countries: string[];
  domains: string[];
  severities: string[];
  statuses: string[];
}

export async function fetchFilterOptions(tenantId: string): Promise<FilterOptions> {
  const rows = await (prisma as any).redFlagInstance.findMany({
    where: { tenantId, isDeleted: false },
    select: { domain: true, severity: true, status: true, details: true },
    take: 20000,
    distinct: ['domain', 'severity', 'status'],
  });

  const countries = new Set<string>();
  const domains = new Set<string>();
  const severities = new Set<string>();
  const statuses = new Set<string>();

  for (const r of rows) {
    const d = r.details as Record<string, unknown>;
    const cc = (d.countryCode as string) ?? (d.country as string);
    if (cc) countries.add(cc);
    if (r.domain) domains.add(r.domain);
    if (r.severity) severities.add(r.severity);
    if (r.status) statuses.add(r.status);
  }

  return {
    countries: [...countries].sort(),
    domains: [...domains].sort(),
    severities: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].filter((s) => severities.has(s)),
    statuses: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'WAIVED'].filter((s) => statuses.has(s)),
  };
}
