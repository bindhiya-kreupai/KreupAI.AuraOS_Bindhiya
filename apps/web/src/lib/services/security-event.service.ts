import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type EventSource = 'WAF' | 'SIEM' | 'CLOUDTRAIL' | 'IDS' | 'AUTH' | 'API_GATEWAY';

export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityEventType =
  | 'SQL_INJECTION'
  | 'XSS'
  | 'RATE_LIMIT_HIT'
  | 'LOGIN_ANOMALY'
  | 'PRIV_ESCAL'
  | 'BRUTE_FORCE'
  | 'GEO_ANOMALY'
  | 'MFA_BYPASS_ATTEMPT'
  | 'DATA_EXFIL_SUSPICION'
  | 'TOKEN_REPLAY';

export interface SecurityEventInput {
  tenantId?: string | null;
  source: EventSource;
  eventType: SecurityEventType;
  severity: EventSeverity;
  detectedAt?: Date;
  sourceIp?: string;
  userId?: string;
  resourceId?: string;
  ruleId?: string;
  blocked?: boolean;
  rawPayload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ThreatHotspot {
  sourceIp: string;
  eventCount: number;
  severitiesSeen: EventSeverity[];
  firstSeen: Date;
  lastSeen: Date;
}

// Severities that should auto-page an incident on ingest.
const AUTO_INCIDENT_SEVERITIES = new Set<EventSeverity>(['HIGH', 'CRITICAL']);

// Event types that, regardless of severity, should always be escalated.
const ALWAYS_ESCALATE = new Set<SecurityEventType>([
  'PRIV_ESCAL',
  'MFA_BYPASS_ATTEMPT',
  'DATA_EXFIL_SUSPICION',
]);

export class SecurityEventService extends BaseService {
  constructor() {
    super('SecurityEventService');
  }

  /**
   * Pure: returns true when an event must be escalated to an Incident
   * record (HIGH/CRITICAL severity OR specific event types regardless
   * of severity). Used by ingest() and exposed for SIEM webhooks that
   * want to render the gate before forwarding.
   */
  shouldEscalate(severity: EventSeverity, eventType: SecurityEventType): boolean {
    return AUTO_INCIDENT_SEVERITIES.has(severity) || ALWAYS_ESCALATE.has(eventType);
  }

  /**
   * Pure: rank source IPs by event count. Used by the SOC dashboard's
   * top-threat tile and by the IP-block trigger.
   */
  rankHotspots(
    events: Array<{
      sourceIp: string | null;
      severity: string;
      detectedAt: Date;
    }>,
    limit = 10
  ): ThreatHotspot[] {
    const bucket = new Map<string, ThreatHotspot>();
    for (const e of events) {
      if (!e.sourceIp) continue;
      const existing = bucket.get(e.sourceIp);
      if (existing) {
        existing.eventCount += 1;
        if (e.detectedAt < existing.firstSeen) existing.firstSeen = e.detectedAt;
        if (e.detectedAt > existing.lastSeen) existing.lastSeen = e.detectedAt;
        if (!existing.severitiesSeen.includes(e.severity as EventSeverity)) {
          existing.severitiesSeen.push(e.severity as EventSeverity);
        }
      } else {
        bucket.set(e.sourceIp, {
          sourceIp: e.sourceIp,
          eventCount: 1,
          severitiesSeen: [e.severity as EventSeverity],
          firstSeen: e.detectedAt,
          lastSeen: e.detectedAt,
        });
      }
    }
    return [...bucket.values()].sort((a, b) => b.eventCount - a.eventCount).slice(0, limit);
  }

  async ingest(input: SecurityEventInput) {
    return prisma.securityEvent.create({
      data: {
        tenantId: input.tenantId ?? null,
        source: input.source,
        eventType: input.eventType,
        severity: input.severity,
        detectedAt: input.detectedAt ?? new Date(),
        sourceIp: input.sourceIp ?? null,
        userId: input.userId ?? null,
        resourceId: input.resourceId ?? null,
        ruleId: input.ruleId ?? null,
        blocked: input.blocked ?? false,
        rawPayload: (input.rawPayload ?? {}) as never,
        metadata: (input.metadata ?? {}) as never,
      },
    });
  }

  async ingestBatch(events: SecurityEventInput[]) {
    if (events.length === 0) return { count: 0 };
    return prisma.securityEvent.createMany({
      data: events.map((e) => ({
        tenantId: e.tenantId ?? null,
        source: e.source,
        eventType: e.eventType,
        severity: e.severity,
        detectedAt: e.detectedAt ?? new Date(),
        sourceIp: e.sourceIp ?? null,
        userId: e.userId ?? null,
        resourceId: e.resourceId ?? null,
        ruleId: e.ruleId ?? null,
        blocked: e.blocked ?? false,
        rawPayload: (e.rawPayload ?? {}) as never,
        metadata: (e.metadata ?? {}) as never,
      })),
    });
  }

  async linkToIncident(eventId: string, tenantId: string | null, incidentId: string) {
    return prisma.securityEvent.update({
      where: { id: eventId },
      data: { incidentId },
    });
  }

  /**
   * Aggregate hotspots for a recent window — drives the SOC top-threats tile.
   */
  async recentHotspots(tenantId: string | null, withinHours = 24, limit = 10) {
    const since = new Date();
    since.setHours(since.getHours() - withinHours);
    const events = await prisma.securityEvent.findMany({
      where: {
        tenantId: tenantId ?? null,
        detectedAt: { gte: since },
        sourceIp: { not: null },
      },
      select: { sourceIp: true, severity: true, detectedAt: true },
    });
    return this.rankHotspots(events, limit);
  }

  async list(params: {
    tenantId?: string | null;
    source?: EventSource;
    severity?: EventSeverity;
    eventType?: SecurityEventType;
    sourceIp?: string;
    userId?: string;
    blocked?: boolean;
    incidentId?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (params.tenantId !== undefined) where.tenantId = params.tenantId;
    if (params.source) where.source = params.source;
    if (params.severity) where.severity = params.severity;
    if (params.eventType) where.eventType = params.eventType;
    if (params.sourceIp) where.sourceIp = params.sourceIp;
    if (params.userId) where.userId = params.userId;
    if (params.blocked !== undefined) where.blocked = params.blocked;
    if (params.incidentId) where.incidentId = params.incidentId;
    if (params.fromDate || params.toDate) {
      const detectedAt: Record<string, Date> = {};
      if (params.fromDate) detectedAt.gte = params.fromDate;
      if (params.toDate) detectedAt.lte = params.toDate;
      where.detectedAt = detectedAt;
    }
    const [items, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { detectedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.securityEvent.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const securityEventService = new SecurityEventService();
