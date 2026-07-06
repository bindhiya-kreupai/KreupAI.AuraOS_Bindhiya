/**
 * Org Design Module service layer.
 *
 * Read-derived domains (org chart, position hierarchy, span of control,
 * org analytics, matrix structure) are computed live from the canonical
 * Position / Employee / Department models — no duplicated or mock data.
 *
 * Persisted domains (scenarios, succession pools, change initiatives) use
 * dedicated tables (aura_org_scenario, aura_org_succession_pool /
 * aura_org_succession_member, aura_org_change_initiative).
 *
 * Every method is tenant-scoped.
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

// ---------------------------------------------------------------------------
// Pure helpers (exported for unit tests)
// ---------------------------------------------------------------------------

export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

export function spanStatus(
  span: number,
  idealMin = 4,
  idealMax = 7
): 'too_narrow' | 'optimal' | 'too_wide' {
  if (span < idealMin) return 'too_narrow';
  if (span > idealMax) return 'too_wide';
  return 'optimal';
}

export function costDeltaPercentage(current: number, projected: number): number {
  if (current === 0) return 0;
  return Number((((projected - current) / current) * 100).toFixed(2));
}

// ---------------------------------------------------------------------------
// Tenant scoping helpers
// ---------------------------------------------------------------------------

async function tenantCompanyIds(tenantId: string): Promise<string[]> {
  const companies = await prisma.company.findMany({
    where: { tenantId, isDeleted: false },
    select: { id: true },
  });
  return companies.map((c) => c.id);
}

// ===========================================================================
// ORG CHART / POSITION HIERARCHY (read-derived from Position)
// ===========================================================================

export const orgChartService = {
  /**
   * Build the position hierarchy tree for a tenant, with occupant + span
   * counts derived from live employee assignments.
   */
  async getPositionTree(tenantId: string) {
    const positions = await prisma.position.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        department: { select: { id: true, name: true, code: true } },
        grade: { select: { name: true } },
        employees: {
          where: { isDeleted: false },
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    const childCount = new Map<string, number>();
    for (const p of positions) {
      if (p.reportsToPositionId) {
        childCount.set(p.reportsToPositionId, (childCount.get(p.reportsToPositionId) ?? 0) + 1);
      }
    }

    const nodes = positions.map((p) => {
      const occupant = p.employees[0];
      return {
        nodeId: p.id,
        positionId: p.id,
        positionTitle: p.title,
        positionCode: p.positionCode,
        department: p.department?.name ?? '',
        departmentId: p.departmentId,
        grade: p.grade?.name ?? '',
        parentNodeId: p.reportsToPositionId ?? undefined,
        headcount: p.headcount,
        filledCount: p.filledCount,
        vacantCount: p.vacantCount,
        isVacant: p.employees.length === 0,
        employeeId: occupant?.id,
        employeeName: occupant ? `${occupant.firstName} ${occupant.lastName}` : undefined,
        directReports: childCount.get(p.id) ?? 0,
        spanOfControl: childCount.get(p.id) ?? 0,
        budgetedSalary: p.salaryMax ? Number(p.salaryMax) : 0,
        status: p.status,
      };
    });

    return {
      nodes,
      totalPositions: nodes.length,
      totalVacancies: nodes.filter((n) => n.isVacant).length,
      totalEmployees: nodes.filter((n) => !n.isVacant).length,
    };
  },

  /**
   * Position hierarchy grouped by grade level (job architecture view).
   */
  async getHierarchyLevels(tenantId: string) {
    const positions = await prisma.position.findMany({
      where: { tenantId, isDeleted: false },
      include: { grade: { select: { id: true, name: true } } },
    });

    const byGrade = new Map<
      string,
      {
        gradeId: string;
        gradeName: string;
        titles: Set<string>;
        salaryMin: number;
        salaryMax: number;
      }
    >();

    for (const p of positions) {
      const key = p.gradeId ?? 'ungraded';
      const name = p.grade?.name ?? 'Ungraded';
      if (!byGrade.has(key)) {
        byGrade.set(key, {
          gradeId: key,
          gradeName: name,
          titles: new Set(),
          salaryMin: Number.MAX_SAFE_INTEGER,
          salaryMax: 0,
        });
      }
      const entry = byGrade.get(key)!;
      entry.titles.add(p.title);
      if (p.salaryMin != null) entry.salaryMin = Math.min(entry.salaryMin, Number(p.salaryMin));
      if (p.salaryMax != null) entry.salaryMax = Math.max(entry.salaryMax, Number(p.salaryMax));
    }

    const levels = Array.from(byGrade.values()).map((e) => ({
      gradeId: e.gradeId,
      gradeName: e.gradeName,
      titles: Array.from(e.titles),
      positionCount: e.titles.size,
      salaryMin: e.salaryMin === Number.MAX_SAFE_INTEGER ? 0 : e.salaryMin,
      salaryMax: e.salaryMax,
    }));

    levels.sort((a, b) => b.salaryMax - a.salaryMax);
    return { levels, totalLevels: levels.length };
  },
};

// ===========================================================================
// SPAN OF CONTROL (read-derived)
// ===========================================================================

export const spanOfControlService = {
  async analyze(tenantId: string, idealMin = 4, idealMax = 7) {
    const positions = await prisma.position.findMany({
      where: { tenantId, isDeleted: false },
      include: { department: { select: { id: true, name: true } } },
    });

    const childCount = new Map<string, number>();
    for (const p of positions) {
      if (p.reportsToPositionId) {
        childCount.set(p.reportsToPositionId, (childCount.get(p.reportsToPositionId) ?? 0) + 1);
      }
    }

    const managers = positions.filter((p) => (childCount.get(p.id) ?? 0) > 0);
    const spans = managers.map((m) => childCount.get(m.id)!);

    // Distribution by number of direct reports
    const distMap = new Map<number, number>();
    for (const s of spans) {
      distMap.set(s, (distMap.get(s) ?? 0) + 1);
    }
    const distribution = Array.from(distMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([reports, count]) => ({
        reports,
        managers: count,
        status: spanStatus(reports, idealMin, idealMax),
      }));

    // By department
    const deptMap = new Map<
      string,
      { departmentId: string; departmentName: string; spans: number[]; total: number }
    >();
    for (const p of positions) {
      const key = p.departmentId;
      const name = p.department?.name ?? '';
      if (!deptMap.has(key)) {
        deptMap.set(key, { departmentId: key, departmentName: name, spans: [], total: 0 });
      }
      const entry = deptMap.get(key)!;
      entry.total += 1;
      const span = childCount.get(p.id) ?? 0;
      if (span > 0) entry.spans.push(span);
    }

    const departmentAnalysis = Array.from(deptMap.values()).map((d) => {
      const avg = average(d.spans);
      return {
        departmentId: d.departmentId,
        departmentName: d.departmentName,
        managerCount: d.spans.length,
        averageSpan: Number(avg.toFixed(1)),
        totalPositions: d.total,
        status: avg === 0 ? 'inefficient' : spanStatus(avg, idealMin, idealMax),
      };
    });

    const withinRange = spans.filter((s) => s >= idealMin && s <= idealMax).length;

    return {
      overall: {
        totalManagers: managers.length,
        averageSpan: Number(average(spans).toFixed(1)),
        medianSpan: Number(median(spans).toFixed(1)),
        minSpan: spans.length ? Math.min(...spans) : 0,
        maxSpan: spans.length ? Math.max(...spans) : 0,
        idealRange: { min: idealMin, max: idealMax },
        withinIdealRange: withinRange,
        tooNarrow: spans.filter((s) => s < idealMin).length,
        tooWide: spans.filter((s) => s > idealMax).length,
      },
      distribution,
      departmentAnalysis,
    };
  },
};

// ===========================================================================
// ORG ANALYTICS (read-derived)
// ===========================================================================

export const orgAnalyticsService = {
  async getAnalytics(tenantId: string) {
    const companyIds = await tenantCompanyIds(tenantId);

    const [employees, positions, departments] = await Promise.all([
      prisma.employee.findMany({
        where: { companyId: { in: companyIds }, isDeleted: false },
        select: {
          id: true,
          departmentId: true,
          locationId: true,
          gradeId: true,
          department: { select: { name: true } },
          location: { select: { name: true } },
          grade: { select: { name: true } },
        },
      }),
      prisma.position.findMany({
        where: { tenantId, isDeleted: false },
        select: { id: true, reportsToPositionId: true, vacantCount: true, headcount: true },
      }),
      prisma.department.findMany({
        where: { companyId: { in: companyIds }, isDeleted: false },
        select: { id: true, name: true },
      }),
    ]);

    const totalEmployees = employees.length;
    const totalPositions = positions.length;
    const totalHeadcount = positions.reduce((s, p) => s + p.headcount, 0);
    const totalVacancies = positions.reduce((s, p) => s + p.vacantCount, 0);
    const vacancyRate =
      totalHeadcount > 0 ? Number(((totalVacancies / totalHeadcount) * 100).toFixed(1)) : 0;

    // Span
    const childCount = new Map<string, number>();
    for (const p of positions) {
      if (p.reportsToPositionId) {
        childCount.set(p.reportsToPositionId, (childCount.get(p.reportsToPositionId) ?? 0) + 1);
      }
    }
    const spans = Array.from(childCount.values());

    const byDept = countBy(employees, (e) => e.department?.name ?? 'Unassigned');
    const byLocation = countBy(employees, (e) => e.location?.name ?? 'Unassigned');
    const byGrade = countBy(employees, (e) => e.grade?.name ?? 'Ungraded');

    return {
      totalEmployees,
      totalPositions,
      totalDepartments: departments.length,
      totalLocations: byLocation.length,
      vacancyRate,
      averageSpanOfControl: Number(average(spans).toFixed(1)),
      employeesByDepartment: withPercentage(byDept, totalEmployees),
      employeesByLocation: withPercentage(byLocation, totalEmployees),
      employeesByGrade: withPercentage(byGrade, totalEmployees),
    };
  },
};

function countBy<T>(items: T[], key: (item: T) => string): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function withPercentage(
  rows: { name: string; count: number }[],
  total: number
): { name: string; count: number; percentage: number }[] {
  return rows.map((r) => ({
    ...r,
    percentage: total > 0 ? Number(((r.count / total) * 100).toFixed(1)) : 0,
  }));
}

// ===========================================================================
// MATRIX STRUCTURE (read-derived: dual reporting via position + employee manager)
// ===========================================================================

export const matrixStructureService = {
  async getMatrix(tenantId: string) {
    const companyIds = await tenantCompanyIds(tenantId);

    const employees = await prisma.employee.findMany({
      where: { companyId: { in: companyIds }, isDeleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        managerId: true,
        department: { select: { name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        position: {
          select: {
            id: true,
            title: true,
            reportsToPosition: { select: { id: true, title: true } },
          },
        },
      },
      take: 500,
    });

    const relationships = employees
      .filter((e) => e.manager || e.position?.reportsToPosition)
      .map((e) => ({
        employeeId: e.id,
        employeeName: `${e.firstName} ${e.lastName}`,
        department: e.department?.name ?? '',
        positionTitle: e.position?.title ?? '',
        primaryManagerId: e.manager?.id ?? undefined,
        primaryManagerName: e.manager ? `${e.manager.firstName} ${e.manager.lastName}` : undefined,
        functionalManagerPositionId: e.position?.reportsToPosition?.id ?? undefined,
        functionalManagerPosition: e.position?.reportsToPosition?.title ?? undefined,
        hasDualReporting: Boolean(e.manager && e.position?.reportsToPosition),
      }));

    return {
      relationships,
      totalRelationships: relationships.length,
      dualReportingCount: relationships.filter((r) => r.hasDualReporting).length,
    };
  },
};

// ===========================================================================
// SCENARIOS (persisted)
// ===========================================================================

export const scenarioService = {
  async list(tenantId: string) {
    const items = await prisma.orgScenario.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { updatedAt: 'desc' },
    });
    return items.map(serializeScenario);
  },

  async create(
    tenantId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      scenarioType?: string;
      currentHeadcount?: number;
      projectedHeadcount?: number;
      currentCost?: number;
      projectedCost?: number;
    }
  ) {
    const created = await prisma.orgScenario.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description ?? null,
        scenarioType: data.scenarioType ?? 'what_if',
        currentHeadcount: data.currentHeadcount ?? 0,
        projectedHeadcount: data.projectedHeadcount ?? 0,
        currentCost: data.currentCost ?? 0,
        projectedCost: data.projectedCost ?? 0,
        status: 'draft',
        createdBy: userId,
        updatedBy: userId,
      },
    });
    return serializeScenario(created);
  },

  async update(tenantId: string, userId: string, id: string, data: Record<string, unknown>) {
    const existing = await prisma.orgScenario.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) return null;
    const updated = await prisma.orgScenario.update({
      where: { id },
      data: {
        ...pick(data, [
          'name',
          'description',
          'scenarioType',
          'status',
          'currentHeadcount',
          'projectedHeadcount',
          'currentCost',
          'projectedCost',
        ]),
        updatedBy: userId,
      },
    });
    return serializeScenario(updated);
  },

  async remove(tenantId: string, userId: string, id: string) {
    const existing = await prisma.orgScenario.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) return false;
    await prisma.orgScenario.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return true;
  },
};

function serializeScenario(s: {
  id: string;
  name: string;
  description: string | null;
  scenarioType: string;
  status: string;
  currentHeadcount: number;
  projectedHeadcount: number;
  currentCost: unknown;
  projectedCost: unknown;
  updatedAt: Date;
}) {
  const currentCost = Number(s.currentCost);
  const projectedCost = Number(s.projectedCost);
  return {
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    scenarioType: s.scenarioType,
    status: s.status,
    currentHeadcount: s.currentHeadcount,
    projectedHeadcount: s.projectedHeadcount,
    headcountDelta: s.projectedHeadcount - s.currentHeadcount,
    currentCost,
    projectedCost,
    costDelta: projectedCost - currentCost,
    costDeltaPercentage: costDeltaPercentage(currentCost, projectedCost),
    updatedAt: s.updatedAt.toISOString(),
  };
}

// ===========================================================================
// SUCCESSION POOLS (persisted)
// ===========================================================================

export const successionPoolService = {
  async list(tenantId: string) {
    const pools = await prisma.orgSuccessionPool.findMany({
      where: { tenantId, isDeleted: false },
      include: { members: true },
      orderBy: { updatedAt: 'desc' },
    });
    return pools.map((p) => ({
      id: p.id,
      name: p.name,
      poolType: p.poolType,
      description: p.description ?? '',
      criticalRole: p.criticalRole,
      incumbentId: p.incumbentId ?? undefined,
      incumbentName: p.incumbentName ?? undefined,
      retentionRisk: p.retentionRisk,
      status: p.status,
      members: p.members.map((m) => ({
        id: m.id,
        employeeId: m.employeeId,
        employeeName: m.employeeName,
        currentRole: m.currentRole ?? '',
        readinessLevel: m.readinessLevel,
        fitScore: m.fitScore,
        riskOfLoss: m.riskOfLoss,
      })),
      totalMembers: p.members.length,
    }));
  },

  async create(
    tenantId: string,
    userId: string,
    data: {
      name: string;
      criticalRole: string;
      poolType?: string;
      description?: string;
      incumbentId?: string;
      incumbentName?: string;
      retentionRisk?: string;
    }
  ) {
    const created = await prisma.orgSuccessionPool.create({
      data: {
        tenantId,
        name: data.name,
        criticalRole: data.criticalRole,
        poolType: data.poolType ?? 'management',
        description: data.description ?? null,
        incumbentId: data.incumbentId ?? null,
        incumbentName: data.incumbentName ?? null,
        retentionRisk: data.retentionRisk ?? 'medium',
        status: 'active',
        createdBy: userId,
        updatedBy: userId,
      },
    });
    return created;
  },

  async update(tenantId: string, userId: string, id: string, data: Record<string, unknown>) {
    const existing = await prisma.orgSuccessionPool.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) return null;
    return prisma.orgSuccessionPool.update({
      where: { id },
      data: {
        ...pick(data, [
          'name',
          'criticalRole',
          'poolType',
          'description',
          'incumbentName',
          'retentionRisk',
          'status',
        ]),
        updatedBy: userId,
      },
    });
  },

  async remove(tenantId: string, userId: string, id: string) {
    const existing = await prisma.orgSuccessionPool.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) return false;
    await prisma.orgSuccessionPool.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return true;
  },

  async addMember(
    tenantId: string,
    userId: string,
    poolId: string,
    data: {
      employeeId: string;
      employeeName: string;
      currentRole?: string;
      readinessLevel?: string;
      fitScore?: number;
      riskOfLoss?: string;
    }
  ) {
    const pool = await prisma.orgSuccessionPool.findFirst({
      where: { id: poolId, tenantId, isDeleted: false },
    });
    if (!pool) return null;
    return prisma.orgSuccessionMember.create({
      data: {
        tenantId,
        poolId,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        currentRole: data.currentRole ?? null,
        readinessLevel: data.readinessLevel ?? 'ready_2_3_years',
        fitScore: data.fitScore ?? 0,
        riskOfLoss: data.riskOfLoss ?? 'medium',
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async removeMember(tenantId: string, poolId: string, memberId: string) {
    const member = await prisma.orgSuccessionMember.findFirst({
      where: { id: memberId, poolId, tenantId },
    });
    if (!member) return false;
    await prisma.orgSuccessionMember.delete({ where: { id: memberId } });
    return true;
  },
};

// ===========================================================================
// CHANGE INITIATIVES (persisted)
// ===========================================================================

export const changeManagementService = {
  async list(tenantId: string) {
    const items = await prisma.orgChangeInitiative.findMany({
      where: { tenantId, isDeleted: false },
      orderBy: { updatedAt: 'desc' },
    });
    return items.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description ?? '',
      changeType: c.changeType,
      changeScope: c.changeScope,
      status: c.status,
      completionPercentage: c.completionPercentage,
      impactLevel: c.impactLevel,
      ownerId: c.ownerId ?? undefined,
      ownerName: c.ownerName ?? undefined,
      plannedStartDate: c.plannedStartDate?.toISOString(),
      plannedEndDate: c.plannedEndDate?.toISOString(),
      totalAffected: c.totalAffected,
    }));
  },

  async create(
    tenantId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      changeType?: string;
      changeScope?: string;
      impactLevel?: string;
      ownerName?: string;
      plannedStartDate?: string;
      plannedEndDate?: string;
    }
  ) {
    return prisma.orgChangeInitiative.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description ?? null,
        changeType: data.changeType ?? 'restructure',
        changeScope: data.changeScope ?? 'department',
        impactLevel: data.impactLevel ?? 'medium',
        ownerName: data.ownerName ?? null,
        plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : null,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : null,
        status: 'planning',
        createdBy: userId,
        updatedBy: userId,
      },
    });
  },

  async update(tenantId: string, userId: string, id: string, data: Record<string, unknown>) {
    const existing = await prisma.orgChangeInitiative.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) return null;
    const patch: Record<string, unknown> = pick(data, [
      'title',
      'description',
      'changeType',
      'changeScope',
      'status',
      'completionPercentage',
      'impactLevel',
      'ownerName',
      'totalAffected',
    ]);
    if (typeof data.plannedStartDate === 'string') {
      patch.plannedStartDate = new Date(data.plannedStartDate);
    }
    if (typeof data.plannedEndDate === 'string') {
      patch.plannedEndDate = new Date(data.plannedEndDate);
    }
    return prisma.orgChangeInitiative.update({
      where: { id },
      data: { ...patch, updatedBy: userId },
    });
  },

  async remove(tenantId: string, userId: string, id: string) {
    const existing = await prisma.orgChangeInitiative.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) return false;
    await prisma.orgChangeInitiative.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: userId },
    });
    return true;
  },
};

function pick(source: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (source[k] !== undefined) out[k] = source[k];
  }
  return out;
}
