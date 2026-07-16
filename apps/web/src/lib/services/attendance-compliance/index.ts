/**
 * EPIC-19: Attendance Compliance.
 *
 * Layered over existing AttendancePunch / AttendanceRecord / Shift /
 * Roster / AttendanceRegularization models. Adds country × grade
 * attendance policy (tolerances, SLAs, fraud thresholds, biometric and
 * consent flags), fraud-flag register (BUDDY_PUNCH / GEO_MISMATCH /
 * SUSPICIOUS_TIME / SHARED_IP / TIME_DRIFT) with severity and audit
 * resolution, biometric/geolocation consent register, and monthly
 * compliance certificate that refuses to sign while open fraud flags,
 * absconding cases (3+ days unauthorized absence), missing consents,
 * or pending regularizations remain.
 */

import { prisma } from '@aura/database';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type AttendanceConsentType = 'BIOMETRIC' | 'GEOLOCATION' | 'PHOTO_VERIFICATION';

export type FraudFlagType =
  | 'BUDDY_PUNCH'
  | 'GEO_MISMATCH'
  | 'SUSPICIOUS_TIME'
  | 'SHARED_IP'
  | 'TIME_DRIFT'
  | 'GHOST_PRESENCE';

export type FraudSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const DEFAULT_POLICIES: Array<{
  country: string;
  lateToleranceMin: number;
  earlyDepartureToleranceMin: number;
  missingPunchSlaHours: number;
  regularizationSlaDays: number;
  ramadanReducedHours: number;
  biometricRequired: boolean;
}> = [
  {
    country: 'UAE',
    lateToleranceMin: 15,
    earlyDepartureToleranceMin: 10,
    missingPunchSlaHours: 24,
    regularizationSlaDays: 3,
    ramadanReducedHours: 6,
    biometricRequired: true,
  },
  {
    country: 'KSA',
    lateToleranceMin: 10,
    earlyDepartureToleranceMin: 10,
    missingPunchSlaHours: 24,
    regularizationSlaDays: 3,
    ramadanReducedHours: 6,
    biometricRequired: true,
  },
  {
    country: 'BAHRAIN',
    lateToleranceMin: 15,
    earlyDepartureToleranceMin: 15,
    missingPunchSlaHours: 48,
    regularizationSlaDays: 5,
    ramadanReducedHours: 6,
    biometricRequired: false,
  },
  {
    country: 'QATAR',
    lateToleranceMin: 10,
    earlyDepartureToleranceMin: 10,
    missingPunchSlaHours: 24,
    regularizationSlaDays: 3,
    ramadanReducedHours: 6,
    biometricRequired: true,
  },
  {
    country: 'OMAN',
    lateToleranceMin: 10,
    earlyDepartureToleranceMin: 10,
    missingPunchSlaHours: 48,
    regularizationSlaDays: 5,
    ramadanReducedHours: 6,
    biometricRequired: false,
  },
  {
    country: 'KUWAIT',
    lateToleranceMin: 10,
    earlyDepartureToleranceMin: 10,
    missingPunchSlaHours: 24,
    regularizationSlaDays: 3,
    ramadanReducedHours: 6,
    biometricRequired: false,
  },
];

export class AttendancePolicyService {
  async seedDefaults(auth: AuthContext, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const p of DEFAULT_POLICIES) {
      try {
        await (prisma as any).attendancePolicy.create({
          data: { tenantId: auth.tenantId, ...p, effectiveFrom, status: 'ACTIVE' },
        });
        created.push(p.country);
      } catch (err) {
        if (!String(err).includes('Unique')) throw err;
      }
    }
    return { created };
  }

  async upsert(
    input: {
      country: string;
      grade?: string;
      isEligible?: boolean;
      lateToleranceMin?: number;
      earlyDepartureToleranceMin?: number;
      missingPunchSlaHours?: number;
      regularizationSlaDays?: number;
      ramadanReducedHours?: number;
      remoteWorkAllowed?: boolean;
      fraudGeofenceRadiusM?: number;
      biometricRequired?: boolean;
      effectiveFrom: Date;
    },
    auth: AuthContext
  ) {
    return (prisma as any).attendancePolicy.upsert({
      where: {
        aura_attendance_policy_unique: {
          tenantId: auth.tenantId,
          country: input.country,
          grade: input.grade ?? null,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: { ...input, grade: input.grade ?? null, status: 'ACTIVE' },
      create: {
        tenantId: auth.tenantId,
        ...input,
        grade: input.grade ?? null,
        status: 'ACTIVE',
      },
    });
  }

  async create(input: any, auth: AuthContext) {
    return (prisma as any).attendancePolicy.create({
      data: {
        tenantId: auth.tenantId,
        country: input.country,
        grade: input.grade || null,
        isEligible: input.isEligible ?? true,
        lateToleranceMin: input.lateToleranceMin ?? 10,
        earlyDepartureToleranceMin: input.earlyDepartureToleranceMin ?? 10,
        missingPunchSlaHours: input.missingPunchSlaHours ?? 24,
        regularizationSlaDays: input.regularizationSlaDays ?? 3,
        ramadanReducedHours: input.ramadanReducedHours ?? 6,
        remoteWorkAllowed: input.remoteWorkAllowed ?? true,
        fraudGeofenceRadiusM: input.fraudGeofenceRadiusM ?? 200,
        biometricRequired: input.biometricRequired ?? false,
        effectiveFrom: new Date(input.effectiveFrom),
        effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
        status: 'ACTIVE',
      },
    });
  }

  async update(id: string, input: any, auth: AuthContext) {
    return (prisma as any).attendancePolicy.update({
      where: { id, tenantId: auth.tenantId },
      data: {
        country: input.country,
        grade: input.grade || null,
        isEligible: input.isEligible,
        lateToleranceMin: input.lateToleranceMin,
        earlyDepartureToleranceMin: input.earlyDepartureToleranceMin,
        missingPunchSlaHours: input.missingPunchSlaHours,
        regularizationSlaDays: input.regularizationSlaDays,
        ramadanReducedHours: input.ramadanReducedHours,
        remoteWorkAllowed: input.remoteWorkAllowed,
        fraudGeofenceRadiusM: input.fraudGeofenceRadiusM,
        biometricRequired: input.biometricRequired,
        effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : undefined,
        effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null,
        status: input.status,
      },
    });
  }

  async archive(id: string, auth: AuthContext) {
    return (prisma as any).attendancePolicy.update({
      where: { id, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date(), status: 'ARCHIVED' },
    });
  }

  async restore(id: string, auth: AuthContext) {
    return (prisma as any).attendancePolicy.update({
      where: { id, tenantId: auth.tenantId },
      data: { isDeleted: false, deletedAt: null, status: 'ACTIVE' },
    });
  }

  async hardDelete(id: string, auth: AuthContext) {
    return (prisma as any).attendancePolicy.delete({
      where: { id, tenantId: auth.tenantId },
    });
  }

  async bulkArchive(ids: string[], auth: AuthContext) {
    return (prisma as any).attendancePolicy.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date(), status: 'ARCHIVED' },
    });
  }

  async bulkRestore(ids: string[], auth: AuthContext) {
    return (prisma as any).attendancePolicy.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: false, deletedAt: null, status: 'ACTIVE' },
    });
  }

  async bulkDelete(ids: string[], auth: AuthContext) {
    return (prisma as any).attendancePolicy.deleteMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
    });
  }

  async list(
    tenantId: string,
    filter: {
      search?: string;
      country?: string;
      grade?: string;
      status?: string;
      isDeleted?: boolean;
      sortBy?: string;
      sortOrder?: string;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const page = normalisePaging(paging);
    const where: any = {
      tenantId,
      isDeleted: filter.isDeleted ?? false,
    };
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.country) {
      where.country = filter.country;
    }
    if (filter.grade) {
      where.grade = filter.grade;
    }
    if (filter.search) {
      where.OR = [
        { country: { contains: filter.search, mode: 'insensitive' } },
        { grade: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = [{ country: 'asc' }, { grade: 'asc' }];
    if (filter.sortBy) {
      orderBy = { [filter.sortBy]: filter.sortOrder ?? 'asc' };
    }

    const [items, total] = await Promise.all([
      (prisma as any).attendancePolicy.findMany({
        where,
        orderBy,
        ...prismaPageArgs(page),
      }),
      (prisma as any).attendancePolicy.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async resolve(tenantId: string, country: string, grade: string | null = null) {
    const rows = await (prisma as any).attendancePolicy.findMany({
      where: {
        tenantId,
        country,
        status: 'ACTIVE',
        OR: [{ grade: grade ?? null }, { grade: null }],
      },
      orderBy: [{ grade: 'desc' }, { effectiveFrom: 'desc' }],
      take: 1,
    });
    return rows[0] ?? null;
  }
}

export const attendancePolicyService = new AttendancePolicyService();

/** EPIC-19-S16: pure fraud-score function from raw signals. */
export interface FraudSignals {
  geoMismatch?: boolean;
  geoDistanceM?: number;
  geofenceRadiusM?: number;
  sharedIp?: boolean;
  identicalPunchSecond?: boolean;
  clockDriftSeconds?: number;
  noBiometric?: boolean;
}

export function evaluateAttendanceFraud(s: FraudSignals): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;
  if (s.identicalPunchSecond) {
    flags.push('BUDDY_PUNCH');
    score += 50;
  }
  if (
    s.geoMismatch ||
    (s.geoDistanceM != null && s.geofenceRadiusM != null && s.geoDistanceM > s.geofenceRadiusM)
  ) {
    flags.push('GEO_MISMATCH');
    score += 35;
  }
  if (s.sharedIp) {
    flags.push('SHARED_IP');
    score += 20;
  }
  if (s.clockDriftSeconds != null && Math.abs(s.clockDriftSeconds) > 300) {
    flags.push('TIME_DRIFT');
    score += 15;
  }
  if (s.noBiometric) {
    flags.push('GHOST_PRESENCE');
    score += 10;
  }
  return { score, flags };
}

function severityFromScore(score: number): FraudSeverity {
  if (score >= 70) return 'CRITICAL';
  if (score >= 40) return 'HIGH';
  if (score >= 20) return 'MEDIUM';
  return 'LOW';
}

export class AttendanceFraudService {
  async raise(
    input: {
      employeeId: string;
      punchDate: Date;
      flagType: FraudFlagType;
      score?: number;
      signals?: FraudSignals;
      evidence?: Record<string, unknown>;
    },
    auth: AuthContext
  ) {
    let score = input.score;
    if (score == null && input.signals) {
      score = evaluateAttendanceFraud(input.signals).score;
    }
    const sev = severityFromScore(score ?? 0);
    return (prisma as any).attendanceFraudFlag.create({
      data: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        punchDate: input.punchDate,
        flagType: input.flagType,
        score: score ?? 0,
        severity: sev,
        evidenceJson: input.evidence ?? {},
        status: 'OPEN',
      },
    });
  }

  async update(id: string, input: any, auth: AuthContext) {
    return (prisma as any).attendanceFraudFlag.update({
      where: { id, tenantId: auth.tenantId },
      data: {
        punchDate: input.punchDate ? new Date(input.punchDate) : undefined,
        flagType: input.flagType,
        score: input.score,
        severity: input.severity,
        evidenceJson: input.evidence || {},
        status: input.status,
      },
    });
  }

  async resolve(id: string, notes: string | undefined, auth: AuthContext) {
    return (prisma as any).attendanceFraudFlag.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: auth.userId,
        resolutionNotes: notes,
      },
    });
  }

  async archive(id: string, auth: AuthContext) {
    return (prisma as any).attendanceFraudFlag.update({
      where: { id, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async restore(id: string, auth: AuthContext) {
    return (prisma as any).attendanceFraudFlag.update({
      where: { id, tenantId: auth.tenantId },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async hardDelete(id: string, auth: AuthContext) {
    return (prisma as any).attendanceFraudFlag.delete({
      where: { id, tenantId: auth.tenantId },
    });
  }

  async bulkArchive(ids: string[], auth: AuthContext) {
    return (prisma as any).attendanceFraudFlag.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async bulkRestore(ids: string[], auth: AuthContext) {
    return (prisma as any).attendanceFraudFlag.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async bulkDelete(ids: string[], auth: AuthContext) {
    return (prisma as any).attendanceFraudFlag.deleteMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
    });
  }

  async list(
    tenantId: string,
    filter: {
      status?: string;
      severity?: string;
      employeeId?: string;
      flagType?: string;
      search?: string;
      isDeleted?: boolean;
      sortBy?: string;
      sortOrder?: string;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where: any = {
      tenantId,
      isDeleted: filter.isDeleted ?? false,
    };
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.severity) {
      where.severity = filter.severity;
    }
    if (filter.employeeId) {
      where.employeeId = filter.employeeId;
    }
    if (filter.flagType) {
      where.flagType = filter.flagType;
    }
    if (filter.search) {
      const matchedEmployees = await (prisma as any).employee.findMany({
        where: {
          tenantId,
          OR: [
            { employeeCode: { contains: filter.search, mode: 'insensitive' } },
            { firstName: { contains: filter.search, mode: 'insensitive' } },
            { lastName: { contains: filter.search, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      const matchedEmployeeIds = matchedEmployees.map((emp: any) => emp.id);
      where.employeeId = { in: matchedEmployeeIds };
    }
    const page = normalisePaging(paging);

    let orderBy: any = { punchDate: 'desc' };
    if (filter.sortBy) {
      orderBy = { [filter.sortBy]: filter.sortOrder ?? 'asc' };
    }

    const [items, total] = await Promise.all([
      (prisma as any).attendanceFraudFlag.findMany({
        where,
        orderBy,
        ...prismaPageArgs(page),
      }),
      (prisma as any).attendanceFraudFlag.count({ where }),
    ]);

    // Stitch employee data in-memory since relation is missing in prisma schema
    const employeeIds = Array.from(new Set(items.map((item: any) => item.employeeId)));
    const employees = await (prisma as any).employee.findMany({
      where: { id: { in: employeeIds } },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
      },
    });
    const employeeMap = new Map(employees.map((emp: any) => [emp.id, emp]));
    const itemsWithEmployee = items.map((item: any) => ({
      ...item,
      employee: employeeMap.get(item.employeeId) || null,
    }));

    return buildPaginatedResult(itemsWithEmployee, total, page);
  }
}

export const attendanceFraudService = new AttendanceFraudService();

export class AttendanceConsentService {
  async grant(
    employeeId: string,
    consentType: AttendanceConsentType,
    evidenceUrl: string | undefined,
    auth: AuthContext
  ) {
    return (prisma as any).attendanceConsent.upsert({
      where: {
        tenantId_employeeId_consentType: {
          tenantId: auth.tenantId,
          employeeId,
          consentType,
        },
      },
      update: { grantedAt: new Date(), revokedAt: null, evidenceUrl },
      create: {
        tenantId: auth.tenantId,
        employeeId,
        consentType,
        grantedAt: new Date(),
        evidenceUrl,
      },
    });
  }

  async revoke(employeeId: string, consentType: AttendanceConsentType, auth: AuthContext) {
    return (prisma as any).attendanceConsent.update({
      where: {
        tenantId_employeeId_consentType: {
          tenantId: auth.tenantId,
          employeeId,
          consentType,
        },
      },
      data: { revokedAt: new Date() },
    });
  }

  async update(id: string, input: any, auth: AuthContext) {
    return (prisma as any).attendanceConsent.update({
      where: { id, tenantId: auth.tenantId },
      data: {
        consentType: input.consentType,
        evidenceUrl: input.evidenceUrl || null,
        grantedAt: input.grantedAt ? new Date(input.grantedAt) : null,
        revokedAt: input.revokedAt ? new Date(input.revokedAt) : null,
      },
    });
  }

  async archive(id: string, auth: AuthContext) {
    return (prisma as any).attendanceConsent.update({
      where: { id, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async restore(id: string, auth: AuthContext) {
    return (prisma as any).attendanceConsent.update({
      where: { id, tenantId: auth.tenantId },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async hardDelete(id: string, auth: AuthContext) {
    return (prisma as any).attendanceConsent.delete({
      where: { id, tenantId: auth.tenantId },
    });
  }

  async bulkArchive(ids: string[], auth: AuthContext) {
    return (prisma as any).attendanceConsent.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async bulkRestore(ids: string[], auth: AuthContext) {
    return (prisma as any).attendanceConsent.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async bulkDelete(ids: string[], auth: AuthContext) {
    return (prisma as any).attendanceConsent.deleteMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
    });
  }

  async list(
    tenantId: string,
    filter: {
      employeeId?: string;
      consentType?: string;
      status?: string;
      search?: string;
      isDeleted?: boolean;
      sortBy?: string;
      sortOrder?: string;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const page = normalisePaging(paging);
    const where: any = {
      tenantId,
      isDeleted: filter.isDeleted ?? false,
    };
    if (filter.employeeId) {
      where.employeeId = filter.employeeId;
    }
    if (filter.consentType) {
      where.consentType = filter.consentType;
    }
    if (filter.status) {
      if (filter.status === 'GRANTED') {
        where.grantedAt = { not: null };
        where.revokedAt = null;
      } else if (filter.status === 'REVOKED') {
        where.revokedAt = { not: null };
      } else if (filter.status === 'MISSING') {
        where.grantedAt = null;
        where.revokedAt = null;
      }
    }
    if (filter.search) {
      const matchedEmployees = await (prisma as any).employee.findMany({
        where: {
          tenantId,
          OR: [
            { employeeCode: { contains: filter.search, mode: 'insensitive' } },
            { firstName: { contains: filter.search, mode: 'insensitive' } },
            { lastName: { contains: filter.search, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      const matchedEmployeeIds = matchedEmployees.map((emp: any) => emp.id);
      where.employeeId = { in: matchedEmployeeIds };
    }

    let orderBy: any = { updatedAt: 'desc' };
    if (filter.sortBy) {
      orderBy = { [filter.sortBy]: filter.sortOrder ?? 'asc' };
    }

    const [items, total] = await Promise.all([
      (prisma as any).attendanceConsent.findMany({
        where,
        orderBy,
        ...prismaPageArgs(page),
      }),
      (prisma as any).attendanceConsent.count({ where }),
    ]);

    // Stitch employee data in-memory since relation is missing in prisma schema
    const employeeIds = Array.from(new Set(items.map((item: any) => item.employeeId)));
    const employees = await (prisma as any).employee.findMany({
      where: { id: { in: employeeIds } },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
      },
    });
    const employeeMap = new Map(employees.map((emp: any) => [emp.id, emp]));
    const itemsWithEmployee = items.map((item: any) => ({
      ...item,
      employee: employeeMap.get(item.employeeId) || null,
    }));

    return buildPaginatedResult(itemsWithEmployee, total, page);
  }
}

export const attendanceConsentService = new AttendanceConsentService();

export class AttendanceCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const punchesTotal = await (prisma as any).attendancePunch.count({
      where: { tenantId, punchDate: { gte: start, lte: end } },
    });
    const missingPunchCount = await (prisma as any).attendanceRecord.count({
      where: {
        tenantId,
        OR: [{ clockIn: null }, { clockOut: null }],
        date: { gte: start, lte: end },
      },
    });
    const lateCount = await (prisma as any).attendanceRecord.count({
      where: { tenantId, status: 'LATE', date: { gte: start, lte: end } },
    });
    const regularizationsPending = await (prisma as any).attendanceRegularization.count({
      where: { tenantId, status: { in: ['PENDING', 'SUBMITTED', 'IN_REVIEW'] } },
    });
    const fraudFlagsOpen = await (prisma as any).attendanceFraudFlag.count({
      where: { tenantId, status: 'OPEN' },
    });
    // Detect absconding (3+ consecutive ABSENT) — sample lightweight: count
    // records flagged ABSCONDING upstream, falling back to 0 if not present.
    let absconding3DayCount = 0;
    try {
      absconding3DayCount = await (prisma as any).attendanceRecord.count({
        where: {
          tenantId,
          status: 'ABSCONDING',
          date: { gte: start, lte: end },
        },
      });
    } catch {
      absconding3DayCount = 0;
    }
    // Consent missing: count consent rows that need grant (BIOMETRIC/GEOLOCATION).
    const consentMissingCount = await (prisma as any).attendanceConsent.count({
      where: { tenantId, OR: [{ grantedAt: null }, { revokedAt: { not: null } }] },
    });
    return {
      period,
      punchesTotal,
      missingPunchCount,
      lateCount,
      regularizationsPending,
      fraudFlagsOpen,
      absconding3DayCount,
      consentMissingCount,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.fraudFlagsOpen > 0) reasons.push(`${stats.fraudFlagsOpen} open fraud flag(s)`);
    if (stats.absconding3DayCount > 0)
      reasons.push(`${stats.absconding3DayCount} absconding case(s)`);
    if (stats.consentMissingCount > 0)
      reasons.push(`${stats.consentMissingCount} missing consent(s)`);
    if (stats.regularizationsPending > 0)
      reasons.push(`${stats.regularizationsPending} pending regularization(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).attendanceCertificate.upsert({
      where: {
        tenantId_period: { tenantId: auth.tenantId, period },
      },
      update: { ...stats, gatingReason, generatedAt: new Date(), status: 'DRAFT' },
      create: {
        tenantId: auth.tenantId,
        ...stats,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
    });
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).attendanceCertificate.findUnique({
      where: { tenantId_period: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).attendanceCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }

  async archive(id: string, auth: AuthContext) {
    return (prisma as any).attendanceCertificate.update({
      where: { id, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async restore(id: string, auth: AuthContext) {
    return (prisma as any).attendanceCertificate.update({
      where: { id, tenantId: auth.tenantId },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async hardDelete(id: string, auth: AuthContext) {
    return (prisma as any).attendanceCertificate.delete({
      where: { id, tenantId: auth.tenantId },
    });
  }

  async bulkArchive(ids: string[], auth: AuthContext) {
    return (prisma as any).attendanceCertificate.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async bulkRestore(ids: string[], auth: AuthContext) {
    return (prisma as any).attendanceCertificate.updateMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async bulkDelete(ids: string[], auth: AuthContext) {
    return (prisma as any).attendanceCertificate.deleteMany({
      where: { id: { in: ids }, tenantId: auth.tenantId },
    });
  }

  async list(
    tenantId: string,
    filter: {
      status?: string;
      search?: string;
      isDeleted?: boolean;
      sortBy?: string;
      sortOrder?: string;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const page = normalisePaging(paging);
    const where: any = {
      tenantId,
      isDeleted: filter.isDeleted ?? false,
    };
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.search) {
      where.period = { contains: filter.search, mode: 'insensitive' };
    }

    let orderBy: any = { period: 'desc' };
    if (filter.sortBy) {
      orderBy = { [filter.sortBy]: filter.sortOrder ?? 'asc' };
    }

    const [items, total] = await Promise.all([
      (prisma as any).attendanceCertificate.findMany({
        where,
        orderBy,
        ...prismaPageArgs(page),
      }),
      (prisma as any).attendanceCertificate.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const attendanceCertificateService = new AttendanceCertificateService();

export const ATTENDANCE_CONSTANTS = { DEFAULT_POLICIES };
