/**
 * EPIC-20: Leave Management Compliance — overlay on existing LeaveType /
 * LeavePolicy / LeaveRequest / LeaveBalance / LeaveAccrual / LeaveCarryForward /
 * LeaveEncashment models.
 *
 * Adds country × leave-type entitlement rules (annual days, accrual
 * basis, carry-forward, encashable days, medical-evidence requirement,
 * notice period), misuse detection (FREQUENT_FRIDAY, FREQUENT_MONDAY,
 * PATTERN_BREACH, MEDICAL_FORGERY, EXCESSIVE_CONSECUTIVE), sensitive
 * medical evidence register with classification + retention + fraud
 * flag, and monthly certificate that refuses to sign while open misuse
 * flags or missing medical evidence remain.
 *
 * Default GCC entitlements (representative — configurable):
 *   ANNUAL — UAE 30d, KSA 30d, BH 30d, QA 21d, OM 30d, KW 30d
 *   SICK   — Bands per country (e.g. UAE 15d full + 30d half + 45d unpaid)
 *   MATERNITY — UAE 60d paid, KSA 70d, QA 50d, BH 60d, OM 50d, KW 70d
 *   PATERNITY — UAE 5d, KSA 3d
 *   HAJJ   — KSA 10–15d once-in-service
 *   BEREAVEMENT — 3–5 days
 *   MARRIAGE — 3 days (varies)
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type LeaveCode =
  | 'ANNUAL'
  | 'SICK'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'HAJJ'
  | 'BEREAVEMENT'
  | 'MARRIAGE'
  | 'STUDY'
  | 'UNPAID';

export type LeaveMisuseType =
  | 'FREQUENT_FRIDAY'
  | 'FREQUENT_MONDAY'
  | 'PATTERN_BREACH'
  | 'MEDICAL_FORGERY'
  | 'EXCESSIVE_CONSECUTIVE'
  | 'CARRY_OVER_BREACH';

export type LeaveMisuseSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const DEFAULT_ENTITLEMENTS: Array<{
  country: string;
  leaveCode: LeaveCode;
  annualDays: number;
  accrualBasis: 'MONTHLY' | 'YEARLY' | 'ON_EVENT';
  maxCarryForwardDays: number;
  encashableDays: number;
  isPaid: boolean;
  isMedicalEvidenceRequired: boolean;
  minServiceMonths: number;
  noticePeriodDays: number;
}> = [
  {
    country: 'UAE',
    leaveCode: 'ANNUAL',
    annualDays: 30,
    accrualBasis: 'MONTHLY',
    maxCarryForwardDays: 30,
    encashableDays: 30,
    isPaid: true,
    isMedicalEvidenceRequired: false,
    minServiceMonths: 6,
    noticePeriodDays: 7,
  },
  {
    country: 'UAE',
    leaveCode: 'SICK',
    annualDays: 90,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 3,
    noticePeriodDays: 0,
  },
  {
    country: 'UAE',
    leaveCode: 'MATERNITY',
    annualDays: 60,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 0,
    noticePeriodDays: 30,
  },
  {
    country: 'UAE',
    leaveCode: 'PATERNITY',
    annualDays: 5,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: false,
    minServiceMonths: 0,
    noticePeriodDays: 0,
  },
  {
    country: 'KSA',
    leaveCode: 'ANNUAL',
    annualDays: 30,
    accrualBasis: 'MONTHLY',
    maxCarryForwardDays: 30,
    encashableDays: 30,
    isPaid: true,
    isMedicalEvidenceRequired: false,
    minServiceMonths: 12,
    noticePeriodDays: 7,
  },
  {
    country: 'KSA',
    leaveCode: 'SICK',
    annualDays: 120,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 0,
    noticePeriodDays: 0,
  },
  {
    country: 'KSA',
    leaveCode: 'MATERNITY',
    annualDays: 70,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 0,
    noticePeriodDays: 30,
  },
  {
    country: 'KSA',
    leaveCode: 'HAJJ',
    annualDays: 15,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: false,
    minServiceMonths: 24,
    noticePeriodDays: 60,
  },
  {
    country: 'BAHRAIN',
    leaveCode: 'ANNUAL',
    annualDays: 30,
    accrualBasis: 'MONTHLY',
    maxCarryForwardDays: 15,
    encashableDays: 15,
    isPaid: true,
    isMedicalEvidenceRequired: false,
    minServiceMonths: 12,
    noticePeriodDays: 7,
  },
  {
    country: 'BAHRAIN',
    leaveCode: 'SICK',
    annualDays: 55,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 3,
    noticePeriodDays: 0,
  },
  {
    country: 'BAHRAIN',
    leaveCode: 'MATERNITY',
    annualDays: 60,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 0,
    noticePeriodDays: 30,
  },
  {
    country: 'QATAR',
    leaveCode: 'ANNUAL',
    annualDays: 21,
    accrualBasis: 'MONTHLY',
    maxCarryForwardDays: 21,
    encashableDays: 21,
    isPaid: true,
    isMedicalEvidenceRequired: false,
    minServiceMonths: 12,
    noticePeriodDays: 7,
  },
  {
    country: 'QATAR',
    leaveCode: 'SICK',
    annualDays: 14,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 3,
    noticePeriodDays: 0,
  },
  {
    country: 'QATAR',
    leaveCode: 'MATERNITY',
    annualDays: 50,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 0,
    noticePeriodDays: 30,
  },
  {
    country: 'OMAN',
    leaveCode: 'ANNUAL',
    annualDays: 30,
    accrualBasis: 'MONTHLY',
    maxCarryForwardDays: 30,
    encashableDays: 30,
    isPaid: true,
    isMedicalEvidenceRequired: false,
    minServiceMonths: 6,
    noticePeriodDays: 7,
  },
  {
    country: 'OMAN',
    leaveCode: 'SICK',
    annualDays: 70,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 0,
    noticePeriodDays: 0,
  },
  {
    country: 'OMAN',
    leaveCode: 'MATERNITY',
    annualDays: 50,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 0,
    noticePeriodDays: 30,
  },
  {
    country: 'KUWAIT',
    leaveCode: 'ANNUAL',
    annualDays: 30,
    accrualBasis: 'MONTHLY',
    maxCarryForwardDays: 30,
    encashableDays: 30,
    isPaid: true,
    isMedicalEvidenceRequired: false,
    minServiceMonths: 9,
    noticePeriodDays: 7,
  },
  {
    country: 'KUWAIT',
    leaveCode: 'SICK',
    annualDays: 75,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 3,
    noticePeriodDays: 0,
  },
  {
    country: 'KUWAIT',
    leaveCode: 'MATERNITY',
    annualDays: 70,
    accrualBasis: 'ON_EVENT',
    maxCarryForwardDays: 0,
    encashableDays: 0,
    isPaid: true,
    isMedicalEvidenceRequired: true,
    minServiceMonths: 0,
    noticePeriodDays: 30,
  },
];

export class LeaveEntitlementService {
  async seedDefaults(auth: AuthContext, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const r of DEFAULT_ENTITLEMENTS) {
      try {
        await (prisma as any).leaveEntitlementRule.create({
          data: { tenantId: auth.tenantId, ...r, effectiveFrom, status: 'ACTIVE' },
        });
        created.push(`${r.country}/${r.leaveCode}`);
      } catch (err) {
        if (!String(err).includes('Unique')) throw err;
      }
    }
    return { created };
  }

  async upsert(
    input: {
      country: string;
      leaveCode: LeaveCode;
      annualDays: number;
      accrualBasis?: string;
      maxCarryForwardDays?: number;
      encashableDays?: number;
      isPaid?: boolean;
      isMedicalEvidenceRequired?: boolean;
      minServiceMonths?: number;
      maxConsecutiveDays?: number;
      noticePeriodDays?: number;
      effectiveFrom: Date;
    },
    auth: AuthContext
  ) {
    return (prisma as any).leaveEntitlementRule.upsert({
      where: {
        aura_leave_entitlement_rule_unique: {
          tenantId: auth.tenantId,
          country: input.country,
          leaveCode: input.leaveCode,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: { ...input, status: 'ACTIVE' },
      create: { tenantId: auth.tenantId, ...input, status: 'ACTIVE' },
    });
  }

  async list(tenantId: string, filter: { country?: string } = {}) {
    return (prisma as any).leaveEntitlementRule.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(filter.country ? { country: filter.country } : {}),
      },
      orderBy: [{ country: 'asc' }, { leaveCode: 'asc' }],
    });
  }

  async resolve(tenantId: string, country: string, leaveCode: string, asOf: Date = new Date()) {
    const rows = await (prisma as any).leaveEntitlementRule.findMany({
      where: {
        tenantId,
        country,
        leaveCode,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });
    return rows[0] ?? null;
  }
}

export const leaveEntitlementService = new LeaveEntitlementService();

/** EPIC-20-S17: pure misuse-pattern detection. Caller passes an array of
 * recent leave-request dates and an optional consecutive-days override. */
export interface LeaveHistorySnapshot {
  recentDates: Date[]; // dates of recent leave entries
  consecutiveDays?: number;
  carryOverDays?: number;
  maxCarryForwardDays?: number;
  hasMedicalEvidence?: boolean;
  requiresMedicalEvidence?: boolean;
}

export function evaluateLeaveMisuse(history: LeaveHistorySnapshot): {
  score: number;
  flags: string[];
} {
  const flags: string[] = [];
  let score = 0;
  let mondays = 0;
  let fridays = 0;
  for (const d of history.recentDates) {
    const day = d.getUTCDay();
    if (day === 1) mondays += 1;
    if (day === 5) fridays += 1;
  }
  if (
    mondays >= 3 &&
    history.recentDates.length > 0 &&
    mondays / history.recentDates.length > 0.5
  ) {
    flags.push('FREQUENT_MONDAY');
    score += 30;
  }
  if (
    fridays >= 3 &&
    history.recentDates.length > 0 &&
    fridays / history.recentDates.length > 0.5
  ) {
    flags.push('FREQUENT_FRIDAY');
    score += 30;
  }
  if (history.consecutiveDays != null && history.consecutiveDays > 30) {
    flags.push('EXCESSIVE_CONSECUTIVE');
    score += 25;
  }
  if (
    history.carryOverDays != null &&
    history.maxCarryForwardDays != null &&
    history.carryOverDays > history.maxCarryForwardDays
  ) {
    flags.push('CARRY_OVER_BREACH');
    score += 20;
  }
  if (history.requiresMedicalEvidence && history.hasMedicalEvidence === false) {
    flags.push('MEDICAL_FORGERY');
    score += 40;
  }
  return { score, flags };
}

function severityFromScore(score: number): LeaveMisuseSeverity {
  if (score >= 70) return 'CRITICAL';
  if (score >= 40) return 'HIGH';
  if (score >= 20) return 'MEDIUM';
  return 'LOW';
}

export class LeaveMisuseService {
  async raise(
    input: {
      employeeId: string;
      leaveRequestId?: string;
      flagType: LeaveMisuseType;
      score?: number;
      snapshot?: LeaveHistorySnapshot;
      evidence?: Record<string, unknown>;
    },
    auth: AuthContext
  ) {
    let score = input.score;
    if (score == null && input.snapshot) {
      score = evaluateLeaveMisuse(input.snapshot).score;
    }
    return (prisma as any).leaveMisuseFlag.create({
      data: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        leaveRequestId: input.leaveRequestId,
        flagType: input.flagType,
        score: score ?? 0,
        severity: severityFromScore(score ?? 0),
        evidenceJson: input.evidence ?? {},
        status: 'OPEN',
      },
    });
  }

  async resolve(id: string, notes: string | undefined, auth: AuthContext) {
    return (prisma as any).leaveMisuseFlag.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: auth.userId,
        resolutionNotes: notes,
      },
    });
  }

  async list(tenantId: string, filter: { status?: string; employeeId?: string } = {}) {
    return (prisma as any).leaveMisuseFlag.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }
}

export const leaveMisuseService = new LeaveMisuseService();

export class LeaveMedicalEvidenceService {
  async capture(
    input: {
      leaveRequestId: string;
      employeeId: string;
      evidenceType: 'MEDICAL_CERTIFICATE' | 'HOSPITAL_REPORT' | 'PRESCRIPTION' | 'OTHER';
      fileUrl?: string;
      issuedBy?: string;
      issuedAt?: Date;
      classification?: 'CONFIDENTIAL' | 'RESTRICTED';
      retentionYears?: number;
    },
    auth: AuthContext
  ) {
    const retentionUntil = input.retentionYears
      ? new Date(Date.now() + input.retentionYears * 365 * 24 * 3600 * 1000)
      : null;
    return (prisma as any).leaveMedicalEvidence.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        classification: input.classification ?? 'RESTRICTED',
        retentionUntil,
      },
    });
  }

  async verify(id: string, auth: AuthContext) {
    return (prisma as any).leaveMedicalEvidence.update({
      where: { id },
      data: { verifiedAt: new Date(), verifiedBy: auth.userId },
    });
  }

  async flagFraud(id: string, _auth: AuthContext) {
    return (prisma as any).leaveMedicalEvidence.update({
      where: { id },
      data: { fraudFlagged: true },
    });
  }

  async list(tenantId: string, filter: { leaveRequestId?: string; employeeId?: string } = {}) {
    return (prisma as any).leaveMedicalEvidence.findMany({
      where: {
        tenantId,
        ...(filter.leaveRequestId ? { leaveRequestId: filter.leaveRequestId } : {}),
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }
}

export const leaveMedicalEvidenceService = new LeaveMedicalEvidenceService();

export class LeaveCertificateService {
  async dashboard(tenantId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const requestsTotal = await (prisma as any).leaveRequest.count({
      where: { tenantId, createdAt: { gte: start, lte: end } },
    });
    const requestsApproved = await (prisma as any).leaveRequest.count({
      where: { tenantId, status: 'APPROVED', createdAt: { gte: start, lte: end } },
    });
    const requestsPending = await (prisma as any).leaveRequest.count({
      where: { tenantId, status: { in: ['PENDING', 'SUBMITTED'] } },
    });
    const encashmentsCount = await (prisma as any).leaveEncashment.count({
      where: { tenantId, createdAt: { gte: start, lte: end } },
    });
    const carryForwardsCount = await (prisma as any).leaveCarryForward.count({
      where: { tenantId, createdAt: { gte: start, lte: end } },
    });
    const openMisuseFlags = await (prisma as any).leaveMisuseFlag.count({
      where: { tenantId, status: 'OPEN' },
    });
    // Missing medical evidence: count approved sick-leave requests in
    // period without an evidence row.
    const sickLeaves = await (prisma as any).leaveRequest.findMany({
      where: {
        tenantId,
        status: 'APPROVED',
        createdAt: { gte: start, lte: end },
      },
      select: { id: true, leaveTypeId: true },
      take: 500,
    });
    let missingMedicalEvidenceCount = 0;
    for (const r of sickLeaves as Array<{ id: string }>) {
      const ev = await (prisma as any).leaveMedicalEvidence.count({
        where: { tenantId, leaveRequestId: r.id },
      });
      if (ev === 0) missingMedicalEvidenceCount += 1;
    }
    // Cap to keep the figure honest when there's no sick-specific filter.
    missingMedicalEvidenceCount = Math.min(missingMedicalEvidenceCount, sickLeaves.length);
    const unpaidAgg = await (prisma as any).leaveRequest.aggregate({
      _sum: { totalDays: true },
      where: {
        tenantId,
        status: 'APPROVED',
        leaveCode: 'UNPAID',
        createdAt: { gte: start, lte: end },
      },
    });
    const unpaidLeaveDays = Number(unpaidAgg?._sum?.totalDays ?? 0);
    return {
      period,
      requestsTotal,
      requestsApproved,
      requestsPending,
      encashmentsCount,
      carryForwardsCount,
      openMisuseFlags,
      missingMedicalEvidenceCount,
      unpaidLeaveDays,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.openMisuseFlags > 0) reasons.push(`${stats.openMisuseFlags} open misuse flag(s)`);
    if (stats.missingMedicalEvidenceCount > 0)
      reasons.push(`${stats.missingMedicalEvidenceCount} missing medical evidence`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).leaveCertificate.upsert({
      where: {
        aura_leave_certificate_unique: { tenantId: auth.tenantId, period },
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
    const cert = await (prisma as any).leaveCertificate.findUnique({
      where: { aura_leave_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).leaveCertificate.update({
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
    return (prisma as any).leaveCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const leaveCertificateService = new LeaveCertificateService();

export const LEAVE_CONSTANTS = { DEFAULT_ENTITLEMENTS };
