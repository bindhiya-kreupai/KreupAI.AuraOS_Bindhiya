/**
 * EPIC-24: Health, Safety & Welfare Compliance.
 *
 * Risk assessment register with likelihood × severity matrix and
 * hierarchy-of-controls JSON. Incident register handles NEAR_MISS /
 * FIRST_AID / MTC / LTI / FATALITY with severity-banded reporting,
 * lost-time tracking, GOSI/authority notification flags, and root-
 * cause + corrective actions. Permit-to-work for HOT_WORK /
 * CONFINED_SPACE / WORK_AT_HEIGHT / ELECTRICAL / EXCAVATION with
 * PPE checklist, isolations, RAMS attachment. Training register with
 * expiry. Monthly certificate computes LTIFR (lost-time injury
 * frequency rate) and refuses to sign while open fatalities,
 * unclosed high-risk assessments, overdue permits, or expired training
 * remain.
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type RiskCategory =
  | 'PHYSICAL'
  | 'CHEMICAL'
  | 'BIOLOGICAL'
  | 'ERGONOMIC'
  | 'PSYCHOSOCIAL'
  | 'FIRE'
  | 'ELECTRICAL'
  | 'WORKING_AT_HEIGHT'
  | 'CONFINED_SPACE'
  | 'HEAT_STRESS';

export type IncidentType =
  | 'NEAR_MISS'
  | 'FIRST_AID'
  | 'MEDICAL_TREATMENT'
  | 'LOST_TIME_INJURY'
  | 'FATALITY'
  | 'PROPERTY_DAMAGE'
  | 'ENVIRONMENTAL'
  | 'OCCUPATIONAL_DISEASE';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'FATAL';

export type PermitWorkType =
  | 'HOT_WORK'
  | 'CONFINED_SPACE'
  | 'WORK_AT_HEIGHT'
  | 'ELECTRICAL'
  | 'EXCAVATION'
  | 'LOCKOUT_TAGOUT'
  | 'CHEMICAL_HANDLING'
  | 'CRANE_LIFT';

/** EPIC-24-S03: pure risk scoring. likelihood × severity → score (1–25). */
export function calculateRiskScore(likelihood: number, severity: number): number {
  return Math.max(1, Math.min(5, likelihood)) * Math.max(1, Math.min(5, severity));
}

/** Categorise residual risk score into band. */
export function riskBand(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6) return 'MEDIUM';
  return 'LOW';
}

export class HseRiskService {
  async upsert(
    input: {
      id?: string;
      title: string;
      location?: string;
      category: RiskCategory;
      hazardDescription?: string;
      likelihood: number;
      severity: number;
      controls?: Array<Record<string, unknown>>;
      residualLikelihood?: number;
      residualSeverity?: number;
      nextReviewAt?: Date;
    },
    auth: AuthContext
  ) {
    const inherentRisk = calculateRiskScore(input.likelihood, input.severity);
    const residualRisk = calculateRiskScore(
      input.residualLikelihood ?? input.likelihood,
      input.residualSeverity ?? input.severity
    );
    const data = {
      tenantId: auth.tenantId,
      title: input.title,
      location: input.location,
      category: input.category,
      hazardDescription: input.hazardDescription,
      likelihood: input.likelihood,
      severity: input.severity,
      inherentRisk,
      residualRisk,
      controlsJson: input.controls ?? [],
      nextReviewAt: input.nextReviewAt,
    };
    if (input.id) {
      return (prisma as any).hseRiskAssessment.update({ where: { id: input.id }, data });
    }
    return (prisma as any).hseRiskAssessment.create({ data });
  }

  async review(id: string, _auth: AuthContext) {
    const next = new Date();
    next.setMonth(next.getMonth() + 6);
    return (prisma as any).hseRiskAssessment.update({
      where: { id },
      data: { reviewedAt: new Date(), reviewedBy: _auth.userId, nextReviewAt: next },
    });
  }

  async close(id: string, _auth: AuthContext) {
    return (prisma as any).hseRiskAssessment.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async list(tenantId: string, filter: { status?: string; minResidualRisk?: number } = {}) {
    return (prisma as any).hseRiskAssessment.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.minResidualRisk != null
          ? { residualRisk: { gte: filter.minResidualRisk } }
          : {}),
      },
      orderBy: { residualRisk: 'desc' },
      take: 500,
    });
  }
}

export const hseRiskService = new HseRiskService();

export class HseIncidentService {
  async raise(
    input: {
      incidentNumber: string;
      incidentDate: Date;
      incidentType: IncidentType;
      severity: IncidentSeverity;
      location?: string;
      employeeId?: string;
      contractorId?: string;
      description?: string;
      lostTimeDays?: number;
    },
    auth: AuthContext
  ) {
    return (prisma as any).hseIncident.upsert({
      where: {
        aura_hse_incident_unique: {
          tenantId: auth.tenantId,
          incidentNumber: input.incidentNumber,
        },
      },
      update: { ...input, status: 'OPEN' },
      create: {
        tenantId: auth.tenantId,
        ...input,
        lostTimeDays: input.lostTimeDays ?? 0,
        status: 'OPEN',
      },
    });
  }

  async setRootCause(
    id: string,
    rootCause: string,
    actions: Array<Record<string, unknown>>,
    _auth: AuthContext
  ) {
    return (prisma as any).hseIncident.update({
      where: { id },
      data: { rootCause, correctiveActions: actions },
    });
  }

  async notifyAuthority(id: string, kind: 'gosi' | 'authority', _auth: AuthContext) {
    const data: Record<string, boolean> = {};
    if (kind === 'gosi') data.gosiNotified = true;
    else data.authorityNotified = true;
    return (prisma as any).hseIncident.update({ where: { id }, data });
  }

  async close(id: string, auth: AuthContext) {
    return (prisma as any).hseIncident.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date(), closedBy: auth.userId },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string; severity?: string; incidentType?: string } = {}
  ) {
    return (prisma as any).hseIncident.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.severity ? { severity: filter.severity } : {}),
        ...(filter.incidentType ? { incidentType: filter.incidentType } : {}),
      },
      orderBy: { incidentDate: 'desc' },
      take: 500,
    });
  }
}

export const hseIncidentService = new HseIncidentService();

export class HsePermitService {
  async issue(
    input: {
      permitNumber: string;
      workType: PermitWorkType;
      location: string;
      startAt: Date;
      endAt: Date;
      issuerId?: string;
      supervisorId?: string;
      ppeChecklist?: Array<string>;
      isolations?: Array<string>;
      ramsAttached?: boolean;
    },
    auth: AuthContext
  ) {
    return (prisma as any).hsePermitToWork.upsert({
      where: {
        aura_hse_permit_to_work_unique: {
          tenantId: auth.tenantId,
          permitNumber: input.permitNumber,
        },
      },
      update: {
        workType: input.workType,
        location: input.location,
        startAt: input.startAt,
        endAt: input.endAt,
        issuerId: input.issuerId,
        supervisorId: input.supervisorId,
        ppeChecklistJson: input.ppeChecklist ?? [],
        isolationsJson: input.isolations ?? [],
        ramsAttached: input.ramsAttached ?? false,
        status: 'OPEN',
      },
      create: {
        tenantId: auth.tenantId,
        ...input,
        ppeChecklistJson: input.ppeChecklist ?? [],
        isolationsJson: input.isolations ?? [],
        ramsAttached: input.ramsAttached ?? false,
        status: 'OPEN',
      },
    });
  }

  async close(id: string, auth: AuthContext) {
    return (prisma as any).hsePermitToWork.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date(), closedBy: auth.userId },
    });
  }

  async list(tenantId: string, filter: { status?: string } = {}) {
    return (prisma as any).hsePermitToWork.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: { startAt: 'desc' },
      take: 500,
    });
  }
}

export const hsePermitService = new HsePermitService();

export class HseTrainingService {
  async record(
    input: {
      employeeId: string;
      trainingCode: string;
      trainingType: string;
      completedAt: Date;
      validityMonths?: number;
      trainerName?: string;
      certificateUrl?: string;
      score?: number;
    },
    auth: AuthContext
  ) {
    let validUntil: Date | undefined;
    if (input.validityMonths) {
      validUntil = new Date(input.completedAt);
      validUntil.setMonth(validUntil.getMonth() + input.validityMonths);
    }
    return (prisma as any).hseTrainingRecord.create({
      data: { tenantId: auth.tenantId, ...input, validUntil },
    });
  }

  async list(
    tenantId: string,
    filter: { employeeId?: string; expiringSoonDays?: number; expiredOnly?: boolean } = {}
  ) {
    const now = new Date();
    const soon = new Date(now.getTime() + (filter.expiringSoonDays ?? 30) * 24 * 3600 * 1000);
    let dateFilter = {};
    if (filter.expiredOnly) {
      dateFilter = { validUntil: { lt: now } };
    } else if (filter.expiringSoonDays != null) {
      dateFilter = { validUntil: { gte: now, lte: soon } };
    }
    return (prisma as any).hseTrainingRecord.findMany({
      where: {
        tenantId,
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
        ...dateFilter,
      },
      orderBy: { completedAt: 'desc' },
      take: 500,
    });
  }
}

export const hseTrainingService = new HseTrainingService();

/** EPIC-24-S18: LTIFR per 1,000,000 worked hours. */
export function calculateLtifr(lostTimeIncidents: number, totalHoursWorked: number): number {
  if (totalHoursWorked === 0) return 0;
  return Number(((lostTimeIncidents * 1_000_000) / totalHoursWorked).toFixed(2));
}

export class HseCertificateService {
  async dashboard(tenantId: string, period: string, totalHoursWorked: number = 200000) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const openRiskAssessments = await (prisma as any).hseRiskAssessment.count({
      where: { tenantId, status: 'OPEN' },
    });
    const highRiskCount = await (prisma as any).hseRiskAssessment.count({
      where: { tenantId, status: 'OPEN', residualRisk: { gte: 12 } },
    });
    const incidentsOpen = await (prisma as any).hseIncident.count({
      where: { tenantId, status: 'OPEN' },
    });
    const lostTimeIncidents = await (prisma as any).hseIncident.count({
      where: { tenantId, incidentType: 'LOST_TIME_INJURY', incidentDate: { gte: start, lte: end } },
    });
    const fatalitiesCount = await (prisma as any).hseIncident.count({
      where: {
        tenantId,
        incidentType: 'FATALITY',
        incidentDate: { gte: start, lte: end },
      },
    });
    const permitsActive = await (prisma as any).hsePermitToWork.count({
      where: { tenantId, status: 'OPEN' },
    });
    const permitsOverdue = await (prisma as any).hsePermitToWork.count({
      where: { tenantId, status: 'OPEN', endAt: { lt: new Date() } },
    });
    const trainingExpired = await (prisma as any).hseTrainingRecord.count({
      where: { tenantId, validUntil: { lt: new Date() } },
    });
    const trainingExpiringSoon = await (prisma as any).hseTrainingRecord.count({
      where: {
        tenantId,
        validUntil: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
      },
    });
    const ltifr = calculateLtifr(lostTimeIncidents, totalHoursWorked);
    return {
      period,
      openRiskAssessments,
      highRiskCount,
      incidentsOpen,
      lostTimeIncidents,
      fatalitiesCount,
      permitsActive,
      permitsOverdue,
      trainingExpiringSoon,
      trainingExpired,
      ltifr,
    };
  }

  async generate(period: string, auth: AuthContext, totalHoursWorked: number = 200000) {
    const stats = await this.dashboard(auth.tenantId, period, totalHoursWorked);
    const reasons: string[] = [];
    if (stats.fatalitiesCount > 0) reasons.push(`${stats.fatalitiesCount} FATALITY incident(s)`);
    if (stats.highRiskCount > 0) reasons.push(`${stats.highRiskCount} HIGH/CRITICAL open risk(s)`);
    if (stats.permitsOverdue > 0) reasons.push(`${stats.permitsOverdue} overdue permit(s)`);
    if (stats.trainingExpired > 0)
      reasons.push(`${stats.trainingExpired} expired training certificate(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).hseCertificate.upsert({
      where: { aura_hse_certificate_unique: { tenantId: auth.tenantId, period } },
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
    const cert = await (prisma as any).hseCertificate.findUnique({
      where: { aura_hse_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).hseCertificate.update({
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
    return (prisma as any).hseCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const hseCertificateService = new HseCertificateService();
