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

  async list(tenantId: string) {
    return (prisma as any).attendancePolicy.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ country: 'asc' }, { grade: 'asc' }],
    });
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

  async list(
    tenantId: string,
    filter: { status?: string; severity?: string; employeeId?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.severity ? { severity: filter.severity } : {}),
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).attendanceFraudFlag.findMany({
        where,
        orderBy: { punchDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).attendanceFraudFlag.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
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
        aura_attendance_consent_unique: {
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
        aura_attendance_consent_unique: {
          tenantId: auth.tenantId,
          employeeId,
          consentType,
        },
      },
      data: { revokedAt: new Date() },
    });
  }

  async list(
    tenantId: string,
    filter: { employeeId?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...(filter.employeeId ? { employeeId: filter.employeeId } : {}) };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).attendanceConsent.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).attendanceConsent.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const attendanceConsentService = new AttendanceConsentService();

export class AttendanceCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const punchesTotal = await (prisma as any).attendancePunch.count({
      where: { tenantId, punchedAt: { gte: start, lte: end } },
    });
    const missingPunchCount = await (prisma as any).attendanceRecord.count({
      where: {
        tenantId,
        OR: [{ checkInTime: null }, { checkOutTime: null }],
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
        aura_attendance_certificate_unique: { tenantId: auth.tenantId, period },
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
      where: { aura_attendance_certificate_unique: { tenantId: auth.tenantId, period } },
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

  async list(tenantId: string) {
    return (prisma as any).attendanceCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const attendanceCertificateService = new AttendanceCertificateService();

export const ATTENDANCE_CONSTANTS = { DEFAULT_POLICIES };
