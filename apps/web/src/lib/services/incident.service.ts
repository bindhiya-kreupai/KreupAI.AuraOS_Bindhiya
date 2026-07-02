import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';

export type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'MITIGATED'
  | 'RESOLVED'
  | 'POSTMORTEM_PUBLISHED';

const STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: ['INVESTIGATING', 'MITIGATED', 'RESOLVED'],
  INVESTIGATING: ['MITIGATED', 'RESOLVED'],
  MITIGATED: ['RESOLVED', 'INVESTIGATING'],
  RESOLVED: ['POSTMORTEM_PUBLISHED'],
  POSTMORTEM_PUBLISHED: [],
};

export class InvalidIncidentTransitionError extends Error {
  constructor(from: IncidentStatus, to: IncidentStatus) {
    super(`Invalid incident transition: ${from} → ${to}`);
    this.name = 'InvalidIncidentTransitionError';
  }
}

export class PostmortemRequiredError extends Error {
  constructor(severity: IncidentSeverity) {
    super(`${severity} incidents require a postmortem URL before POSTMORTEM_PUBLISHED.`);
    this.name = 'PostmortemRequiredError';
  }
}

// SEV1/SEV2 are the paging tiers that require a postmortem write-up.
const POSTMORTEM_REQUIRED_SEVERITIES = new Set<IncidentSeverity>(['SEV1', 'SEV2']);

export class IncidentService extends BaseService {
  constructor() {
    super('IncidentService');
  }

  canTransition(from: IncidentStatus, to: IncidentStatus): boolean {
    return (STATUS_TRANSITIONS[from] ?? []).includes(to);
  }

  assertTransition(from: IncidentStatus, to: IncidentStatus): void {
    if (!this.canTransition(from, to)) throw new InvalidIncidentTransitionError(from, to);
  }

  /**
   * Pure: returns the next sequential incident number for a given year.
   * The caller passes the existing max; we don't query here so the helper
   * stays testable.
   */
  formatIncidentNumber(year: number, sequence: number): string {
    return `INC-${year}-${String(sequence).padStart(3, '0')}`;
  }

  /**
   * Pure: minutes-to-acknowledge and minutes-to-resolve. Returns null when
   * a timestamp is missing so dashboards can show "in progress" cleanly.
   */
  computeMTTR(detectedAt: Date, resolvedAt?: Date | null): number | null {
    if (!resolvedAt) return null;
    return Math.round((resolvedAt.getTime() - detectedAt.getTime()) / 60000);
  }

  computeMTTA(detectedAt: Date, acknowledgedAt?: Date | null): number | null {
    if (!acknowledgedAt) return null;
    return Math.round((acknowledgedAt.getTime() - detectedAt.getTime()) / 60000);
  }

  async open(input: {
    tenantId?: string | null;
    incidentNumber: string;
    title: string;
    severity: IncidentSeverity;
    detectedAt?: Date;
    commanderUserId?: string;
    affectedServices?: string[];
    customerImpact?: string;
    actorId: string;
  }) {
    return (prisma as any).incident.create({
      data: {
        tenantId: input.tenantId ?? null,
        incidentNumber: input.incidentNumber,
        title: input.title,
        severity: input.severity,
        status: 'OPEN',
        detectedAt: input.detectedAt ?? new Date(),
        commanderUserId: input.commanderUserId ?? null,
        affectedServices: input.affectedServices ?? [],
        customerImpact: input.customerImpact ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async acknowledge(id: string, tenantId: string | null, actorId: string) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as IncidentStatus, 'INVESTIGATING');
    return (prisma as any).incident.update({
      where: { id },
      data: {
        status: 'INVESTIGATING',
        acknowledgedAt: existing.acknowledgedAt ?? new Date(),
        updatedBy: actorId,
      },
    });
  }

  async mitigate(id: string, tenantId: string | null, actorId: string, notes?: string) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as IncidentStatus, 'MITIGATED');
    return (prisma as any).incident.update({
      where: { id },
      data: {
        status: 'MITIGATED',
        mitigatedAt: new Date(),
        rootCause: notes ?? existing.rootCause,
        updatedBy: actorId,
      },
    });
  }

  async resolve(id: string, tenantId: string | null, actorId: string, rootCause?: string) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as IncidentStatus, 'RESOLVED');
    return (prisma as any).incident.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        rootCause: rootCause ?? existing.rootCause,
        updatedBy: actorId,
      },
    });
  }

  async publishPostmortem(id: string, tenantId: string | null, actorId: string, url: string) {
    const existing = await this.assertExists(id, tenantId);
    if (!existing) return null;
    this.assertTransition(existing.status as IncidentStatus, 'POSTMORTEM_PUBLISHED');
    if (
      POSTMORTEM_REQUIRED_SEVERITIES.has(existing.severity as IncidentSeverity) &&
      (!url || url.trim().length < 8)
    ) {
      throw new PostmortemRequiredError(existing.severity as IncidentSeverity);
    }
    return (prisma as any).incident.update({
      where: { id },
      data: { status: 'POSTMORTEM_PUBLISHED', postmortemUrl: url, updatedBy: actorId },
    });
  }

  async list(params: {
    tenantId?: string | null;
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    openOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (params.tenantId !== undefined) where.tenantId = params.tenantId;
    if (params.status) where.status = params.status;
    if (params.severity) where.severity = params.severity;
    if (params.openOnly) {
      where.status = { notIn: ['RESOLVED', 'POSTMORTEM_PUBLISHED'] };
    }
    const [items, total] = await Promise.all([
      (prisma as any).incident.findMany({
        where,
        orderBy: { detectedAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).incident.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  private async assertExists(id: string, tenantId: string | null) {
    return (prisma as any).incident.findFirst({
      where: { id, tenantId: tenantId ?? null },
    });
  }
}

export const incidentService = new IncidentService();
