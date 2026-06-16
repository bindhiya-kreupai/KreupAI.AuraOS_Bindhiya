import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export interface AlertThreshold {
  days: number;
  channel: 'EMAIL' | 'IN_APP' | 'SMS';
  recipientRole?: string;
}

export interface CreateAlertRuleInput {
  code: string;
  name: string;
  description?: string;
  eventType: string;
  countryScope?: string[];
  entityScope?: string[];
  thresholds: AlertThreshold[];
  recipientRoles?: string[];
  channels?: Array<'EMAIL' | 'IN_APP' | 'SMS'>;
}

export interface FireAlertInput {
  ruleCode: string;
  resourceType: string;
  resourceId: string;
  triggeredFor: Date;
  currentDate?: Date;
  recipientUserId?: string;
  payload?: Record<string, unknown>;
}

export const DEFAULT_THRESHOLD_LADDER: AlertThreshold[] = [
  { days: 60, channel: 'EMAIL' },
  { days: 30, channel: 'EMAIL' },
  { days: 7, channel: 'IN_APP' },
];

/**
 * EPIC-01-S04: Platform automation backbone (event bus + immutable audit + alerts).
 *
 * Audit + event bus already exist (AuditService, packages/@aura/events). This service
 * delivers the alert-rule / alert-instance piece: configurable thresholds with idempotent
 * per-threshold firing (one row per resource × threshold).
 */
export class PlatformAlertService {
  async listRules(tenantId: string, filter: { eventType?: string; isActive?: boolean } = {}) {
    return (prisma as any).platformAlertRule.findMany({
      where: {
        tenantId,
        ...(filter.eventType ? { eventType: filter.eventType } : {}),
        ...(filter.isActive != null ? { isActive: filter.isActive } : {}),
      },
      orderBy: { code: 'asc' },
    });
  }

  async upsertRule(input: CreateAlertRuleInput, auth: AuthContext) {
    if (!input.thresholds.length) {
      throw new Error('at least one threshold is required');
    }
    for (const t of input.thresholds) {
      if (typeof t.days !== 'number' || t.days <= 0) {
        throw new Error(`threshold days must be > 0 (got ${t.days})`);
      }
    }
    return (prisma as any).platformAlertRule.upsert({
      where: { tenantId_code: { tenantId: auth.tenantId, code: input.code } },
      update: {
        name: input.name,
        description: input.description,
        eventType: input.eventType,
        countryScope: input.countryScope ?? [],
        entityScope: input.entityScope ?? [],
        thresholds: input.thresholds,
        recipientRoles: input.recipientRoles ?? [],
        channels: input.channels ?? ['EMAIL'],
        updatedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        code: input.code,
        name: input.name,
        description: input.description,
        eventType: input.eventType,
        countryScope: input.countryScope ?? [],
        entityScope: input.entityScope ?? [],
        thresholds: input.thresholds,
        recipientRoles: input.recipientRoles ?? [],
        channels: input.channels ?? ['EMAIL'],
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async seedDefaultLadders(auth: AuthContext) {
    const seeds: CreateAlertRuleInput[] = [
      {
        code: 'VISA_EXPIRY',
        name: 'Visa / Work Permit Expiry',
        eventType: 'visa.expiry',
        thresholds: DEFAULT_THRESHOLD_LADDER,
        recipientRoles: ['PRO_OFFICER', 'HR_MANAGER'],
        channels: ['EMAIL', 'IN_APP'],
      },
      {
        code: 'WPS_SALARY_DELAY',
        name: 'WPS / Salary Delay Window',
        eventType: 'salary.delay',
        thresholds: [
          { days: 7, channel: 'EMAIL' },
          { days: 14, channel: 'EMAIL' },
          { days: 15, channel: 'IN_APP' },
        ],
        recipientRoles: ['PAYROLL_OFFICER', 'COMPLIANCE_OFFICER'],
        channels: ['EMAIL', 'IN_APP'],
      },
      {
        code: 'EMIRATES_ID_EXPIRY',
        name: 'Emirates ID Expiry',
        eventType: 'emirates_id.expiry',
        thresholds: DEFAULT_THRESHOLD_LADDER,
        recipientRoles: ['PRO_OFFICER'],
        channels: ['EMAIL'],
      },
    ];
    const out: string[] = [];
    for (const seed of seeds) {
      await this.upsertRule(seed, auth);
      out.push(seed.code);
    }
    return { seeded: out };
  }

  /**
   * Fire an alert idempotently — at-most-once per (rule, threshold, resource).
   * `triggeredFor` is the deadline date (e.g., visa expiry). `currentDate` is the
   * evaluation reference (defaults to now).
   */
  async fireIfDue(input: FireAlertInput, auth: AuthContext) {
    const rule = await (prisma as any).platformAlertRule.findUnique({
      where: { tenantId_code: { tenantId: auth.tenantId, code: input.ruleCode } },
    });
    if (!rule || !rule.isActive) return { fired: [] as string[] };

    const now = input.currentDate ?? new Date();
    const due = input.triggeredFor;
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysToDue = Math.ceil((due.getTime() - now.getTime()) / msPerDay);
    const thresholds = (rule.thresholds as AlertThreshold[]) ?? [];

    const fired: string[] = [];
    for (const threshold of thresholds) {
      if (daysToDue <= threshold.days) {
        try {
          await (prisma as any).platformAlertInstance.create({
            data: {
              tenantId: auth.tenantId,
              alertRuleId: rule.id,
              thresholdDays: threshold.days,
              resourceType: input.resourceType,
              resourceId: input.resourceId,
              triggeredFor: due,
              firedAt: now,
              channel: threshold.channel,
              recipientRole: threshold.recipientRole ?? rule.recipientRoles?.[0] ?? null,
              recipientUserId: input.recipientUserId ?? null,
              payload: input.payload ?? {},
              status: 'FIRED',
            },
          });
          fired.push(String(threshold.days));
        } catch (err) {
          // Unique constraint => already fired for this threshold/resource. Skip.
          if (!String(err).includes('Unique')) throw err;
        }
      }
    }
    return { fired };
  }

  async listInstances(
    tenantId: string,
    filter: { ruleCode?: string; status?: string; limit?: number } = {}
  ) {
    const where: Record<string, unknown> = { tenantId };
    if (filter.status) where.status = filter.status;
    if (filter.ruleCode) {
      const rule = await (prisma as any).platformAlertRule.findFirst({
        where: { tenantId, code: filter.ruleCode },
      });
      if (!rule) return [];
      where.alertRuleId = rule.id;
    }
    return (prisma as any).platformAlertInstance.findMany({
      where,
      orderBy: { firedAt: 'desc' },
      take: filter.limit ?? 100,
    });
  }
}

export const platformAlertService = new PlatformAlertService();
