/**
 * Themes G + H — HSE sub-domains + visa-exit deep gaps.
 *
 * G (HSE) — closes EPIC-24-S02 (safety officer registry), S04
 *   (heat-stress / midday-break rule per country×month), S07 (toolbox
 *   talk log), S11 (emergency drill tracker), S12 (first-aid station
 *   register), S14 (welfare inspection separate from accommodation).
 *
 * H (Visa-exit) — closes EPIC-29-S04 (TRANSFER scenario PRO chain via
 *   seed), S06 (per-dependent visa register), S10 (benefits closure
 *   cascade), S12 (employee comms templates).
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

// ---------------------------------------------------------------------------
// G — HSE
// ---------------------------------------------------------------------------

/**
 * EPIC-29-S04 — TRANSFER scenario PRO action chain.
 * Used by visa-exit-compliance to seed actions when scenario = TRANSFER.
 */
export const TRANSFER_PRO_ACTIONS = [
  { code: 'OBTAIN_NOC', label: 'Obtain No-Objection Certificate from current sponsor' },
  { code: 'NEW_LABOUR_CARD', label: 'Apply for new labour card under target sponsor' },
  { code: 'VISA_TRANSFER_FILING', label: 'File visa transfer with immigration authority' },
  { code: 'EMIRATES_ID_AMEND', label: 'Update Emirates ID / national-ID employer record' },
  { code: 'INSURANCE_TRANSFER', label: 'Transfer medical insurance enrollment' },
  { code: 'GPSSA_TRANSFER', label: 'Notify GPSSA / GOSI of employer change' },
  { code: 'BANK_PAYROLL_UPDATE', label: 'Update salary credit to new employer payroll' },
] as const;

export class HseSafetyOfficerService {
  async list(tenantId: string, filter: { siteId?: string; status?: string } = {}) {
    return (prisma as any).hseSafetyOfficer.findMany({
      where: {
        tenantId,
        ...(filter.siteId ? { siteId: filter.siteId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: [{ siteId: 'asc' }, { name: 'asc' }],
      take: 500,
    });
  }
  async upsert(
    input: {
      employeeId: string;
      name: string;
      role?: string;
      siteId?: string;
      certificationCode?: string;
      certificationIssuedAt?: Date;
      certificationExpiresAt?: Date;
      scope?: string;
      isPrimary?: boolean;
    },
    auth: AuthContext
  ) {
    if (
      input.certificationExpiresAt &&
      input.certificationIssuedAt &&
      input.certificationExpiresAt < input.certificationIssuedAt
    ) {
      throw new Error('certificationExpiresAt cannot precede certificationIssuedAt');
    }
    const scope = input.scope ?? 'SITE';
    return (prisma as any).hseSafetyOfficer.upsert({
      where: {
        aura_hse_safety_officer_unique: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          scope,
        },
      },
      update: {
        name: input.name,
        role: input.role ?? 'SAFETY_OFFICER',
        siteId: input.siteId ?? null,
        certificationCode: input.certificationCode ?? null,
        certificationIssuedAt: input.certificationIssuedAt ?? null,
        certificationExpiresAt: input.certificationExpiresAt ?? null,
        isPrimary: input.isPrimary ?? false,
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        name: input.name,
        role: input.role ?? 'SAFETY_OFFICER',
        siteId: input.siteId ?? null,
        scope,
        certificationCode: input.certificationCode ?? null,
        certificationIssuedAt: input.certificationIssuedAt ?? null,
        certificationExpiresAt: input.certificationExpiresAt ?? null,
        isPrimary: input.isPrimary ?? false,
      },
    });
  }
}
export const hseSafetyOfficerService = new HseSafetyOfficerService();

export class HseHeatStressRuleService {
  async list(tenantId: string, country?: string) {
    return (prisma as any).hseHeatStressRule.findMany({
      where: { tenantId, ...(country ? { country } : {}) },
      orderBy: [{ country: 'asc' }, { month: 'asc' }, { effectiveFrom: 'desc' }],
      take: 500,
    });
  }
  async upsert(
    input: {
      country: string;
      month: number;
      noOutdoorWorkFromHour: number;
      noOutdoorWorkToHour: number;
      effectiveFrom: Date;
      effectiveTo?: Date;
      regulatorRef?: string;
      notes?: string;
    },
    auth: AuthContext
  ) {
    if (input.month < 1 || input.month > 12) throw new Error('month must be 1-12');
    if (input.noOutdoorWorkFromHour < 0 || input.noOutdoorWorkFromHour > 23) {
      throw new Error('noOutdoorWorkFromHour must be 0-23');
    }
    if (input.noOutdoorWorkToHour < 0 || input.noOutdoorWorkToHour > 23) {
      throw new Error('noOutdoorWorkToHour must be 0-23');
    }
    return (prisma as any).hseHeatStressRule.upsert({
      where: {
        aura_hse_heat_stress_rule_unique: {
          tenantId: auth.tenantId,
          country: input.country,
          month: input.month,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: {
        noOutdoorWorkFromHour: input.noOutdoorWorkFromHour,
        noOutdoorWorkToHour: input.noOutdoorWorkToHour,
        effectiveTo: input.effectiveTo ?? null,
        regulatorRef: input.regulatorRef ?? null,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        country: input.country,
        month: input.month,
        noOutdoorWorkFromHour: input.noOutdoorWorkFromHour,
        noOutdoorWorkToHour: input.noOutdoorWorkToHour,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
        regulatorRef: input.regulatorRef ?? null,
        notes: input.notes ?? null,
      },
    });
  }
  /** Pure helper: is the given hour banned for outdoor work? */
  static isOutdoorWorkBanned(
    rule: { noOutdoorWorkFromHour: number; noOutdoorWorkToHour: number },
    hour: number
  ): boolean {
    if (rule.noOutdoorWorkFromHour <= rule.noOutdoorWorkToHour) {
      return hour >= rule.noOutdoorWorkFromHour && hour < rule.noOutdoorWorkToHour;
    }
    // Wraps midnight
    return hour >= rule.noOutdoorWorkFromHour || hour < rule.noOutdoorWorkToHour;
  }
}
export const hseHeatStressRuleService = new HseHeatStressRuleService();

export class HseToolboxTalkService {
  async list(tenantId: string, filter: { siteId?: string; from?: Date; to?: Date } = {}) {
    return (prisma as any).hseToolboxTalk.findMany({
      where: {
        tenantId,
        ...(filter.siteId ? { siteId: filter.siteId } : {}),
        ...(filter.from || filter.to
          ? {
              deliveredAt: {
                ...(filter.from ? { gte: filter.from } : {}),
                ...(filter.to ? { lte: filter.to } : {}),
              },
            }
          : {}),
      },
      orderBy: { deliveredAt: 'desc' },
      take: 500,
    });
  }
  async record(
    input: {
      talkCode: string;
      topic: string;
      siteId?: string;
      deliveredAt: Date;
      attendeeCount?: number;
      attendees?: string[];
      summary?: string;
    },
    auth: AuthContext
  ) {
    if (input.attendeeCount !== undefined && input.attendeeCount < 0) {
      throw new Error('attendeeCount cannot be negative');
    }
    return (prisma as any).hseToolboxTalk.create({
      data: {
        tenantId: auth.tenantId,
        siteId: input.siteId ?? null,
        talkCode: input.talkCode,
        topic: input.topic,
        deliveredAt: input.deliveredAt,
        deliveredBy: auth.userId,
        attendeeCount: input.attendeeCount ?? input.attendees?.length ?? 0,
        attendeesJson: (input.attendees ?? null) as any,
        summary: input.summary ?? null,
      },
    });
  }
}
export const hseToolboxTalkService = new HseToolboxTalkService();

export class HseEmergencyDrillService {
  async list(tenantId: string, filter: { siteId?: string; result?: string } = {}) {
    return (prisma as any).hseEmergencyDrill.findMany({
      where: {
        tenantId,
        ...(filter.siteId ? { siteId: filter.siteId } : {}),
        ...(filter.result ? { result: filter.result } : {}),
      },
      orderBy: { scheduledAt: 'desc' },
      take: 500,
    });
  }
  async schedule(
    input: {
      siteId: string;
      drillCode: string;
      drillType: string;
      scheduledAt: Date;
    },
    auth: AuthContext
  ) {
    return (prisma as any).hseEmergencyDrill.create({
      data: {
        tenantId: auth.tenantId,
        siteId: input.siteId,
        drillCode: input.drillCode,
        drillType: input.drillType,
        scheduledAt: input.scheduledAt,
      },
    });
  }
  async recordResult(
    id: string,
    input: {
      conductedAt: Date;
      evacuationTimeSeconds?: number;
      participantCount?: number;
      findings?: Record<string, unknown>;
      result: 'PASS' | 'FAIL';
    },
    _auth: AuthContext
  ) {
    return (prisma as any).hseEmergencyDrill.update({
      where: { id },
      data: {
        conductedAt: input.conductedAt,
        evacuationTimeSeconds: input.evacuationTimeSeconds ?? null,
        participantCount: input.participantCount ?? 0,
        findingsJson: (input.findings ?? null) as any,
        result: input.result,
      },
    });
  }
}
export const hseEmergencyDrillService = new HseEmergencyDrillService();

export class HseFirstAidStationService {
  async list(tenantId: string, siteId?: string) {
    return (prisma as any).hseFirstAidStation.findMany({
      where: { tenantId, ...(siteId ? { siteId } : {}) },
      orderBy: [{ siteId: 'asc' }, { stationCode: 'asc' }],
      take: 500,
    });
  }
  async upsert(
    input: {
      siteId: string;
      stationCode: string;
      label: string;
      certifiedFirstAiderCount?: number;
      isActive?: boolean;
    },
    auth: AuthContext
  ) {
    if (input.certifiedFirstAiderCount !== undefined && input.certifiedFirstAiderCount < 0) {
      throw new Error('certifiedFirstAiderCount cannot be negative');
    }
    return (prisma as any).hseFirstAidStation.upsert({
      where: {
        aura_hse_first_aid_station_unique: {
          tenantId: auth.tenantId,
          siteId: input.siteId,
          stationCode: input.stationCode,
        },
      },
      update: {
        label: input.label,
        certifiedFirstAiderCount: input.certifiedFirstAiderCount ?? 0,
        isActive: input.isActive ?? true,
      },
      create: {
        tenantId: auth.tenantId,
        siteId: input.siteId,
        stationCode: input.stationCode,
        label: input.label,
        certifiedFirstAiderCount: input.certifiedFirstAiderCount ?? 0,
        isActive: input.isActive ?? true,
      },
    });
  }
  async recordInspection(id: string, result: string, _auth: AuthContext) {
    return (prisma as any).hseFirstAidStation.update({
      where: { id },
      data: { lastInspectionAt: new Date(), lastInspectionResult: result },
    });
  }
  async restock(id: string, _auth: AuthContext) {
    return (prisma as any).hseFirstAidStation.update({
      where: { id },
      data: { lastRestockedAt: new Date() },
    });
  }
}
export const hseFirstAidStationService = new HseFirstAidStationService();

export class HseWelfareInspectionService {
  async list(tenantId: string, filter: { siteId?: string; result?: string } = {}) {
    return (prisma as any).hseWelfareInspection.findMany({
      where: {
        tenantId,
        ...(filter.siteId ? { siteId: filter.siteId } : {}),
        ...(filter.result ? { result: filter.result } : {}),
      },
      orderBy: { inspectedAt: 'desc' },
      take: 500,
    });
  }
  async record(
    input: {
      siteId: string;
      inspectionCode: string;
      scope: string;
      inspectedAt: Date;
      findings?: Array<{ code: string; severity: string; note: string }>;
      result: 'PASS' | 'FAIL' | 'PENDING';
    },
    auth: AuthContext
  ) {
    const criticalFindings = (input.findings ?? []).filter((f) => f.severity === 'CRITICAL').length;
    return (prisma as any).hseWelfareInspection.upsert({
      where: {
        aura_hse_welfare_inspection_unique: {
          tenantId: auth.tenantId,
          siteId: input.siteId,
          inspectionCode: input.inspectionCode,
        },
      },
      update: {
        scope: input.scope,
        inspectedAt: input.inspectedAt,
        inspectedBy: auth.userId,
        findingsJson: (input.findings ?? null) as any,
        criticalFindings,
        result: input.result,
      },
      create: {
        tenantId: auth.tenantId,
        siteId: input.siteId,
        inspectionCode: input.inspectionCode,
        scope: input.scope,
        inspectedAt: input.inspectedAt,
        inspectedBy: auth.userId,
        findingsJson: (input.findings ?? null) as any,
        criticalFindings,
        result: input.result,
      },
    });
  }
}
export const hseWelfareInspectionService = new HseWelfareInspectionService();

// ---------------------------------------------------------------------------
// H — Visa-exit deep gaps
// ---------------------------------------------------------------------------

export class VisaExitDependentService {
  async list(tenantId: string, filter: { visaExitCaseId?: string } = {}) {
    return (prisma as any).visaExitDependent.findMany({
      where: {
        tenantId,
        ...(filter.visaExitCaseId ? { visaExitCaseId: filter.visaExitCaseId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }
  async addDependent(
    input: {
      visaExitCaseId: string;
      dependentName: string;
      relationship: string;
      visaNumber?: string;
    },
    auth: AuthContext
  ) {
    return (prisma as any).visaExitDependent.create({
      data: {
        tenantId: auth.tenantId,
        visaExitCaseId: input.visaExitCaseId,
        dependentName: input.dependentName,
        relationship: input.relationship,
        visaNumber: input.visaNumber ?? null,
        cancellationStatus: 'PENDING',
      },
    });
  }
  async markCancelled(id: string, evidenceUrl: string | undefined, _auth: AuthContext) {
    return (prisma as any).visaExitDependent.update({
      where: { id },
      data: {
        cancellationStatus: 'CANCELLED',
        cancelledAt: new Date(),
        evidenceUrl: evidenceUrl ?? null,
      },
    });
  }
  async openDependentCount(tenantId: string, visaExitCaseId: string): Promise<number> {
    return (prisma as any).visaExitDependent.count({
      where: {
        tenantId,
        visaExitCaseId,
        cancellationStatus: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });
  }
}
export const visaExitDependentService = new VisaExitDependentService();

const DEFAULT_BENEFITS = ['INSURANCE', 'ACCOMMODATION', 'EOS', 'LOAN'] as const;

export class VisaExitBenefitsClosureService {
  async list(tenantId: string, visaExitCaseId?: string) {
    return (prisma as any).visaExitBenefitsClosure.findMany({
      where: { tenantId, ...(visaExitCaseId ? { visaExitCaseId } : {}) },
      orderBy: [{ visaExitCaseId: 'asc' }, { benefitCategory: 'asc' }],
      take: 500,
    });
  }
  /** Seeds the 4 default benefit closure rows for a case. */
  async seedDefaults(visaExitCaseId: string, auth: AuthContext) {
    const created: string[] = [];
    for (const cat of DEFAULT_BENEFITS) {
      try {
        await (prisma as any).visaExitBenefitsClosure.create({
          data: {
            tenantId: auth.tenantId,
            visaExitCaseId,
            benefitCategory: cat,
            status: 'PENDING',
          },
        });
        created.push(cat);
      } catch {
        // already seeded
      }
    }
    return { created };
  }
  async close(id: string, input: { amountSettled?: number; notes?: string }, auth: AuthContext) {
    return (prisma as any).visaExitBenefitsClosure.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: auth.userId,
        amountSettled: input.amountSettled ?? null,
        notes: input.notes ?? null,
      },
    });
  }
  async openCount(tenantId: string, visaExitCaseId: string): Promise<number> {
    return (prisma as any).visaExitBenefitsClosure.count({
      where: {
        tenantId,
        visaExitCaseId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });
  }
}
export const visaExitBenefitsClosureService = new VisaExitBenefitsClosureService();

export class VisaExitCommTemplateService {
  async list(tenantId: string, trigger?: string) {
    return (prisma as any).visaExitCommTemplate.findMany({
      where: { tenantId, ...(trigger ? { trigger } : {}) },
      orderBy: { templateCode: 'asc' },
      take: 200,
    });
  }
  async upsert(
    input: {
      templateCode: string;
      trigger: string;
      label: string;
      channels?: string[];
      subjectEn?: string;
      subjectAr?: string;
      bodyEn?: string;
      bodyAr?: string;
      isActive?: boolean;
    },
    auth: AuthContext
  ) {
    return (prisma as any).visaExitCommTemplate.upsert({
      where: {
        aura_visa_exit_comm_template_unique: {
          tenantId: auth.tenantId,
          templateCode: input.templateCode,
        },
      },
      update: {
        trigger: input.trigger,
        label: input.label,
        channelsJson: (input.channels ?? null) as any,
        subjectEn: input.subjectEn ?? null,
        subjectAr: input.subjectAr ?? null,
        bodyEn: input.bodyEn ?? null,
        bodyAr: input.bodyAr ?? null,
        isActive: input.isActive ?? true,
      },
      create: {
        tenantId: auth.tenantId,
        templateCode: input.templateCode,
        trigger: input.trigger,
        label: input.label,
        channelsJson: (input.channels ?? null) as any,
        subjectEn: input.subjectEn ?? null,
        subjectAr: input.subjectAr ?? null,
        bodyEn: input.bodyEn ?? null,
        bodyAr: input.bodyAr ?? null,
        isActive: input.isActive ?? true,
      },
    });
  }
}
export const visaExitCommTemplateService = new VisaExitCommTemplateService();
