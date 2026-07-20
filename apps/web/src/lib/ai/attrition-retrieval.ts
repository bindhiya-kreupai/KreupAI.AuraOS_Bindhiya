/**
 * Attrition Prediction — tenant-scoped feature retrieval
 */

import { prisma } from '@aura/database';
import type { AttritionAtRiskFilters, AttritionFeatureVector } from './attrition-types';

const TOTAL_FEATURE_SLOTS = 8;

function num(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'object' && v !== null && 'toNumber' in v) {
    try {
      return (v as { toNumber: () => number }).toNumber();
    } catch {
      return Number(v) || 0;
    }
  }
  return Number(v) || 0;
}

function monthsBetween(from: Date, to: Date): number {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / (30.44 * 24 * 3600 * 1000)));
}

export type EmployeeRow = {
  id: string;
  firstName: string;
  lastName: string;
  joiningDate: Date;
  managerId: string | null;
  departmentId: string;
  locationId: string;
  department: { name: string } | null;
  location: { name: string } | null;
  jobProfile: { title: string } | null;
  status: { code: string; name: string } | null;
  _count: { reports: number };
};

function activeEmployeeWhere(tenantId: string, filters?: AttritionAtRiskFilters) {
  const where: Record<string, unknown> = {
    isDeleted: false,
    company: { tenantId },
    OR: [
      { status: { code: { equals: 'ACTIVE', mode: 'insensitive' } } },
      { status: { name: { equals: 'Active', mode: 'insensitive' } } },
      { status: { code: { equals: 'CONFIRMED', mode: 'insensitive' } } },
    ],
  };
  if (filters?.departmentId) where.departmentId = filters.departmentId;
  if (filters?.locationId) where.locationId = filters.locationId;
  if (filters?.managerId) where.managerId = filters.managerId;
  return where;
}

const employeeSelect = {
  id: true,
  firstName: true,
  lastName: true,
  joiningDate: true,
  managerId: true,
  departmentId: true,
  locationId: true,
  department: { select: { name: true } },
  location: { select: { name: true } },
  jobProfile: { select: { title: true } },
  status: { select: { code: true, name: true } },
  _count: { select: { reports: true } },
} as const;

export async function listActiveEmployeesForTenant(
  tenantId: string,
  filters?: AttritionAtRiskFilters,
  take = 5000
): Promise<EmployeeRow[]> {
  let rows = (await prisma.employee.findMany({
    where: activeEmployeeWhere(tenantId, filters) as any,
    take,
    select: employeeSelect,
  })) as EmployeeRow[];

  // If status codes don't match seed data, fall back to all non-deleted in tenant
  if (rows.length === 0) {
    const fallbackWhere: Record<string, unknown> = {
      isDeleted: false,
      company: { tenantId },
    };
    if (filters?.departmentId) fallbackWhere.departmentId = filters.departmentId;
    if (filters?.locationId) fallbackWhere.locationId = filters.locationId;
    if (filters?.managerId) fallbackWhere.managerId = filters.managerId;
    rows = (await prisma.employee.findMany({
      where: fallbackWhere as any,
      take,
      select: employeeSelect,
    })) as EmployeeRow[];
  }

  return rows;
}

export async function getEmployeeForTenant(
  tenantId: string,
  employeeId: string
): Promise<EmployeeRow | null> {
  return prisma.employee.findFirst({
    where: {
      id: employeeId,
      isDeleted: false,
      company: { tenantId },
    },
    select: employeeSelect,
  }) as Promise<EmployeeRow | null>;
}

async function loadAggregateSignals(tenantId: string, employeeIds: string[]) {
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const empty = {
    recognition: new Map<string, number>(),
    leaveCount: new Map<string, number>(),
    leaveDays: new Map<string, number>(),
    overtime: new Map<string, number>(),
    salary: new Map<string, { amount: number; effectiveFrom: Date }>(),
    performance: new Map<string, number>(),
  };

  if (employeeIds.length === 0) return empty;

  const [recs, leaves, ot, salaries, reviews] = await Promise.all([
    prisma.recognition
      .groupBy({
        by: ['receiverId'],
        where: {
          tenantId,
          receiverId: { in: employeeIds },
          createdAt: { gte: since90 },
          isDeleted: false,
        },
        _count: { _all: true },
      })
      .catch(() => [] as Array<{ receiverId: string; _count: { _all: number } }>),
    prisma.leaveRequest
      .groupBy({
        by: ['employeeId'],
        where: {
          tenantId,
          employeeId: { in: employeeIds },
          createdAt: { gte: since90 },
          isDeleted: false,
        },
        _count: { _all: true },
        _sum: { totalDays: true },
      })
      .catch(
        () =>
          [] as Array<{
            employeeId: string;
            _count: { _all: number };
            _sum: { totalDays: unknown };
          }>
      ),
    prisma.overtimeRequest
      .groupBy({
        by: ['employeeId'],
        where: {
          tenantId,
          employeeId: { in: employeeIds },
          overtimeDate: { gte: since90 },
          isDeleted: false,
          status: { in: ['APPROVED', 'Approved', 'VERIFIED'] },
        },
        _sum: { totalHours: true },
      })
      .catch(() => [] as Array<{ employeeId: string; _sum: { totalHours: number | null } }>),
    prisma.employeeSalaryStructure
      .findMany({
        where: {
          tenantId,
          employeeId: { in: employeeIds },
          isActive: true,
          isDeleted: false,
        },
        select: {
          employeeId: true,
          grossSalary: true,
          ctc: true,
          basicSalary: true,
          effectiveFrom: true,
        },
        orderBy: { effectiveFrom: 'desc' },
      })
      .catch(
        () =>
          [] as Array<{
            employeeId: string;
            grossSalary: unknown;
            ctc: unknown;
            basicSalary: unknown;
            effectiveFrom: Date;
          }>
      ),
    prisma.performanceReview
      .findMany({
        where: {
          tenantId,
          employeeId: { in: employeeIds },
          isDeleted: false,
          OR: [{ finalRating: { not: null } }, { managerRating: { not: null } }],
        },
        select: {
          employeeId: true,
          finalRating: true,
          managerRating: true,
          completedAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      })
      .catch(
        () =>
          [] as Array<{
            employeeId: string;
            finalRating: number | null;
            managerRating: number | null;
            completedAt: Date | null;
            updatedAt: Date;
          }>
      ),
  ]);

  // YTD leave days (separate soft query)
  const leaveYtd = await prisma.leaveRequest
    .groupBy({
      by: ['employeeId'],
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        status: { in: ['APPROVED', 'Approved'] },
        startDate: { gte: yearStart },
        isDeleted: false,
      },
      _sum: { totalDays: true },
    })
    .catch(() => [] as Array<{ employeeId: string; _sum: { totalDays: unknown } }>);

  const recognition = new Map(recs.map((r) => [r.receiverId, r._count._all]));
  const leaveCount = new Map(leaves.map((l) => [l.employeeId, l._count._all]));
  const leaveDays = new Map(leaveYtd.map((l) => [l.employeeId, num(l._sum.totalDays)]));
  const overtime = new Map(ot.map((o) => [o.employeeId, o._sum.totalHours || 0]));

  const salary = new Map<string, { amount: number; effectiveFrom: Date }>();
  for (const s of salaries) {
    if (salary.has(s.employeeId)) continue;
    const amount = num(s.ctc) || num(s.grossSalary) || num(s.basicSalary);
    salary.set(s.employeeId, { amount, effectiveFrom: s.effectiveFrom });
  }

  const performance = new Map<string, number>();
  for (const r of reviews) {
    if (performance.has(r.employeeId)) continue;
    const rating = r.finalRating ?? r.managerRating;
    if (rating != null) performance.set(r.employeeId, rating);
  }

  return { recognition, leaveCount, leaveDays, overtime, salary, performance };
}

function toVector(
  emp: EmployeeRow,
  signals: Awaited<ReturnType<typeof loadAggregateSignals>>
): AttritionFeatureVector {
  const now = new Date();
  const tenureYears = Math.max(
    0,
    (now.getTime() - new Date(emp.joiningDate).getTime()) / (365.25 * 24 * 3600 * 1000)
  );
  const sal = signals.salary.get(emp.id);
  const performanceRating = signals.performance.get(emp.id) ?? null;
  const recentRecognitions = signals.recognition.get(emp.id) || 0;
  const recentLeaveRequests = signals.leaveCount.get(emp.id) || 0;
  const leaveDaysYtd = signals.leaveDays.get(emp.id) || 0;
  const overtimeHours90d = signals.overtime.get(emp.id) || 0;

  let available = 3; // tenure, identity, dept always present
  if (sal) available += 1;
  if (performanceRating != null) available += 1;
  if (signals.recognition.has(emp.id) || recentRecognitions === 0) available += 1; // queried
  available += 1; // leave queried
  available += 1; // OT queried

  return {
    employeeId: emp.id,
    employeeName: `${emp.firstName} ${emp.lastName}`.trim(),
    department: emp.department?.name || 'Unknown',
    departmentId: emp.departmentId,
    location: emp.location?.name,
    role: emp.jobProfile?.title,
    managerId: emp.managerId,
    joiningDate: emp.joiningDate,
    tenureYears,
    estimatedSalary: sal?.amount || 0,
    monthsSinceLastIncrease: sal ? monthsBetween(sal.effectiveFrom, now) : null,
    recentRecognitions,
    recentLeaveRequests,
    leaveDaysYtd,
    performanceRating,
    overtimeHours90d,
    directReports: emp._count?.reports || 0,
    availableFeatureCount: available,
    totalFeatureSlots: TOTAL_FEATURE_SLOTS,
  };
}

export async function buildFeatureVectors(
  tenantId: string,
  filters?: AttritionAtRiskFilters
): Promise<AttritionFeatureVector[]> {
  const employees = await listActiveEmployeesForTenant(tenantId, filters);
  const ids = employees.map((e) => e.id);
  const signals = await loadAggregateSignals(tenantId, ids);
  return employees.map((e) => toVector(e, signals));
}

export async function buildFeatureVectorForEmployee(
  tenantId: string,
  employeeId: string
): Promise<AttritionFeatureVector | null> {
  const emp = await getEmployeeForTenant(tenantId, employeeId);
  if (!emp) return null;
  const signals = await loadAggregateSignals(tenantId, [employeeId]);
  return toVector(emp, signals);
}
