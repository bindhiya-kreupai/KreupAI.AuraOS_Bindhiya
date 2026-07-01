/**
 * ConstructionService
 *
 * Tenant-scoped persistence for the Construction & Real Estate module. Each
 * entity kind (projects, tasks, safety inspections/incidents/training/hazards,
 * equipment leases, subcontractors, bids, bid-invitations, contracts, invoices,
 * alerts, staffing allocations) is stored in its own tenant-scoped table with a
 * stable set of promoted/indexed columns plus a JSON `data` payload carrying the
 * rich nested shape defined in
 * apps/web/src/app/dashboard/construction/types.ts.
 *
 * The dashboard service layer (services.ts) calls the matching
 * `/api/construction/*` routes and consumes the returned value directly (raw
 * array for lists, raw object for items), so the routes return the merged
 * `{ ...data, id, <idKey> }` shape rather than a wrapped envelope.
 *
 * New models are not yet in the generated Prisma client type surface at author
 * time, so delegates are resolved via `(this.prisma as any)`. The orchestrator
 * merges the schema fragment and regenerates the client afterward.
 */

import type { Prisma } from '@prisma/client';
import { BaseService } from '@/lib/services/base.service';
import { ValidationError } from '@/lib/errors';

type JsonRecord = Record<string, unknown>;

/** How each entity kind is stored: delegate name, its id key, promoted cols. */
interface KindConfig {
  /** camelCase Prisma model accessor. */
  delegate: string;
  /** id key surfaced in the JSON payload (e.g. `projectId`). */
  idKey: string;
  /**
   * Columns promoted out of `data` into indexed table columns, keyed by column
   * name → list of candidate JSON keys (first non-empty string wins).
   */
  columns?: Record<string, string[]>;
  /** Numeric promoted columns (column → candidate keys). */
  numberColumns?: Record<string, string[]>;
}

export const CONSTRUCTION_KINDS = {
  project: {
    delegate: 'constructionProject',
    idKey: 'projectId',
    columns: {
      projectName: ['projectName'],
      projectNumber: ['projectNumber'],
      projectType: ['projectType'],
      status: ['status'],
      clientName: ['clientName'],
    },
  },
  task: {
    delegate: 'constructionTask',
    idKey: 'taskId',
    columns: {
      projectId: ['projectId'],
      taskName: ['taskName'],
      status: ['status'],
      priority: ['priority'],
    },
  },
  'safety-inspection': {
    delegate: 'constructionSafetyInspection',
    idKey: 'inspectionId',
    columns: {
      projectId: ['projectId'],
      inspectionType: ['inspectionType'],
      status: ['status'],
    },
    numberColumns: { overallScore: ['overallScore'] },
  },
  'safety-incident': {
    delegate: 'constructionSafetyIncident',
    idKey: 'incidentId',
    columns: {
      projectId: ['projectId'],
      incidentType: ['incidentType'],
      severity: ['severity'],
      status: ['status'],
    },
  },
  'safety-training': {
    delegate: 'constructionSafetyTraining',
    idKey: 'trainingId',
    columns: {
      trainingName: ['trainingName'],
      trainingType: ['trainingType'],
    },
  },
  hazard: {
    delegate: 'constructionHazard',
    idKey: 'hazardId',
    columns: {
      projectId: ['projectId'],
      hazardType: ['hazardType'],
      hazardLevel: ['hazardLevel'],
      status: ['status'],
    },
  },
  'equipment-lease': {
    delegate: 'constructionEquipmentLease',
    idKey: 'leaseId',
    columns: {
      projectId: ['projectId'],
      equipmentName: ['equipmentName'],
      status: ['status'],
    },
  },
  subcontractor: {
    delegate: 'constructionSubcontractor',
    idKey: 'subcontractorId',
    columns: {
      companyName: ['companyName'],
      status: ['status'],
    },
  },
  'bid-invitation': {
    delegate: 'constructionBidInvitation',
    idKey: 'invitationId',
    columns: {
      projectId: ['projectId'],
      status: ['status'],
    },
  },
  bid: {
    delegate: 'constructionBid',
    idKey: 'bidId',
    columns: {
      projectId: ['projectId'],
      subcontractorId: ['subcontractorId'],
      status: ['status'],
    },
  },
  contract: {
    delegate: 'constructionContract',
    idKey: 'contractId',
    columns: {
      projectId: ['projectId'],
      subcontractorId: ['subcontractorId'],
      status: ['status'],
    },
  },
  invoice: {
    delegate: 'constructionInvoice',
    idKey: 'invoiceId',
    columns: {
      contractId: ['contractId'],
      status: ['status'],
    },
  },
  alert: {
    delegate: 'constructionAlert',
    idKey: 'alertId',
    columns: {
      alertType: ['alertType'],
      severity: ['severity'],
      status: ['status'],
    },
  },
  staffing: {
    delegate: 'constructionStaffingAllocation',
    idKey: 'allocationId',
    columns: {
      projectName: ['projectName', 'project'],
      location: ['location'],
      workType: ['workType', 'type'],
      status: ['status'],
    },
    numberColumns: { crewSize: ['crewSize', 'crew'] },
  },
} as const satisfies Record<string, KindConfig>;

export type ConstructionKind = keyof typeof CONSTRUCTION_KINDS;

export interface ConstructionContext {
  tenantId: string;
  userId: string;
  employeeId?: string;
}

export class ConstructionService extends BaseService {
  constructor() {
    super('ConstructionService');
  }

  private cfg(kind: ConstructionKind): KindConfig {
    const cfg = CONSTRUCTION_KINDS[kind];
    if (!cfg) throw new ValidationError(`Unknown construction kind: ${kind}`);
    return cfg;
  }

  private delegate(kind: ConstructionKind): any {
    // New models are resolved dynamically until the client is regenerated.
    return (this.prisma as any)[this.cfg(kind).delegate];
  }

  /** Merge the stored JSON with the row id under the kind's id key. */
  private serialize(kind: ConstructionKind, row: { id: string; data: unknown }): JsonRecord {
    const data = (row.data as JsonRecord) ?? {};
    return { ...data, id: row.id, [this.cfg(kind).idKey]: row.id };
  }

  private pickString(obj: JsonRecord, ...keys: string[]): string | undefined {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'string' && v.length > 0) return v;
      if (typeof v === 'number') return String(v);
    }
    return undefined;
  }

  private pickNumber(obj: JsonRecord, ...keys: string[]): number | undefined {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
    }
    return undefined;
  }

  /** Build the promoted-column values from an input payload. */
  private promotedColumns(
    kind: ConstructionKind,
    input: JsonRecord,
    existing?: Record<string, unknown>
  ): Record<string, unknown> {
    const cfg = this.cfg(kind);
    const out: Record<string, unknown> = {};
    for (const [col, keys] of Object.entries(cfg.columns ?? {})) {
      const v = this.pickString(input, ...keys);
      if (v !== undefined) out[col] = v;
      else if (existing && existing[col] !== undefined) out[col] = existing[col];
    }
    for (const [col, keys] of Object.entries(cfg.numberColumns ?? {})) {
      const v = this.pickNumber(input, ...keys);
      if (v !== undefined) out[col] = v;
      else if (existing && existing[col] !== undefined) out[col] = existing[col];
    }
    return out;
  }

  async list(
    kind: ConstructionKind,
    ctx: ConstructionContext,
    filters: JsonRecord = {}
  ): Promise<JsonRecord[]> {
    const cfg = this.cfg(kind);
    const where: Record<string, unknown> = { tenantId: ctx.tenantId, isDeleted: false };
    const filterable = new Set([
      ...Object.keys(cfg.columns ?? {}),
      ...Object.keys(cfg.numberColumns ?? {}),
    ]);
    for (const [key, value] of Object.entries(filters)) {
      if (filterable.has(key) && typeof value === 'string' && value.length > 0) {
        where[key] = value;
      }
    }
    const rows = await this.delegate(kind).findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r: { id: string; data: unknown }) => this.serialize(kind, r));
  }

  async get(
    kind: ConstructionKind,
    ctx: ConstructionContext,
    id: string
  ): Promise<JsonRecord | null> {
    const row = await this.delegate(kind).findFirst({
      where: { id, tenantId: ctx.tenantId, isDeleted: false },
    });
    return row ? this.serialize(kind, row) : null;
  }

  async create(
    kind: ConstructionKind,
    ctx: ConstructionContext,
    input: JsonRecord
  ): Promise<JsonRecord> {
    const cfg = this.cfg(kind);
    const { id: _id, tenantId: _t, [cfg.idKey]: _idk, ...rest } = input as JsonRecord;
    const now = new Date().toISOString();
    const created = await this.delegate(kind).create({
      data: {
        tenantId: ctx.tenantId,
        ...this.promotedColumns(kind, rest),
        data: { ...rest, createdAt: now, updatedAt: now } as Prisma.InputJsonValue,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      },
    });
    await this.audit(ctx, 'CONSTRUCTION_CREATED', created.id, `Created construction ${kind}`);
    return this.serialize(kind, created);
  }

  async update(
    kind: ConstructionKind,
    ctx: ConstructionContext,
    id: string,
    updates: JsonRecord
  ): Promise<JsonRecord> {
    const cfg = this.cfg(kind);
    const existing = await this.delegate(kind).findFirst({
      where: { id, tenantId: ctx.tenantId, isDeleted: false },
    });
    if (!existing) throw new ValidationError(`Construction ${kind} ${id} not found.`);

    const { id: _id, tenantId: _t, [cfg.idKey]: _idk, ...rest } = updates as JsonRecord;
    const merged = {
      ...((existing.data as JsonRecord) ?? {}),
      ...rest,
      updatedAt: new Date().toISOString(),
    };
    const updated = await this.delegate(kind).update({
      where: { id },
      data: {
        ...this.promotedColumns(kind, merged, existing),
        data: merged as Prisma.InputJsonValue,
        updatedBy: ctx.userId,
      },
    });
    await this.audit(ctx, 'CONSTRUCTION_UPDATED', id, `Updated construction ${kind}`);
    return this.serialize(kind, updated);
  }

  async remove(kind: ConstructionKind, ctx: ConstructionContext, id: string): Promise<void> {
    const existing = await this.delegate(kind).findFirst({
      where: { id, tenantId: ctx.tenantId, isDeleted: false },
    });
    if (!existing) return;
    await this.delegate(kind).update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: ctx.userId },
    });
    await this.audit(ctx, 'CONSTRUCTION_DELETED', id, `Deleted construction ${kind}`);
  }

  // ── Settings (one row per tenant) ──────────────────────────────────────────

  private static readonly DEFAULT_SETTINGS: JsonRecord = {
    projectSettings: {
      defaultContingency: 10,
      defaultRetainage: 5,
      budgetThresholds: { warning: 85, critical: 95 },
      scheduleThresholds: { warning: 7, critical: 14 },
    },
    safetySettings: {
      inspectionFrequency: { daily: 1, weekly: 7, monthly: 30 },
      incidentReportingDeadline: 24,
      trainingRequirements: [],
      ppeRequirements: [],
    },
    equipmentSettings: {
      inspectionFrequency: 7,
      maintenanceAlertDays: 3,
      utilizationTarget: 75,
    },
    subcontractorSettings: {
      minimumRating: 3,
      backgroundCheckRequired: true,
      bondingRequired: false,
      retainagePercentage: 5,
    },
    notifications: {
      budgetAlerts: true,
      scheduleAlerts: true,
      safetyAlerts: true,
      equipmentAlerts: true,
      paymentReminders: true,
      permitExpiry: true,
      advanceNoticeDays: 7,
    },
  };

  async getSettings(ctx: ConstructionContext): Promise<JsonRecord> {
    const row = await (this.prisma as any).constructionSettings.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    const data = (row?.data as JsonRecord) ?? {};
    return {
      ...ConstructionService.DEFAULT_SETTINGS,
      ...data,
      settingsId: row?.id ?? ctx.tenantId,
      organizationId: ctx.tenantId,
      updatedAt: (row?.updatedAt ?? new Date()).toISOString(),
    };
  }

  async updateSettings(ctx: ConstructionContext, updates: JsonRecord): Promise<JsonRecord> {
    const { settingsId: _s, organizationId: _o, updatedAt: _u, ...rest } = updates as JsonRecord;
    const existing = await (this.prisma as any).constructionSettings.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    const nextData = {
      ...ConstructionService.DEFAULT_SETTINGS,
      ...((existing?.data as JsonRecord) ?? {}),
      ...rest,
    };
    const row = await (this.prisma as any).constructionSettings.upsert({
      where: { tenantId: ctx.tenantId },
      create: {
        tenantId: ctx.tenantId,
        data: nextData as Prisma.InputJsonValue,
        updatedBy: ctx.userId,
      },
      update: { data: nextData as Prisma.InputJsonValue, updatedBy: ctx.userId },
    });
    await this.audit(ctx, 'CONSTRUCTION_SETTINGS_UPDATED', row.id, 'Updated construction settings');
    return {
      ...(row.data as JsonRecord),
      settingsId: row.id,
      organizationId: ctx.tenantId,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private async audit(
    ctx: ConstructionContext,
    action: string,
    resourceId: string,
    details: string
  ) {
    try {
      await this.createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        action,
        module: 'construction',
        resourceId,
        details,
      });
    } catch (err) {
      this.logger.warn({ err }, 'construction audit log failed (non-fatal)');
    }
  }
}

export const constructionService = new ConstructionService();
