/**
 * CareerService
 *
 * Tenant-scoped persistence for the entire career-planning domain. Every entity
 * kind (ladders, paths, mobility opportunities/applications, preferences,
 * succession plans, goals, discussions, aspirations, mentorship requests,
 * skill assessments, learning pathways) is stored in a single generic table
 * (`aura_career_entity`) with a `kind` discriminator and a JSON `data` payload.
 * Frequently-filtered fields (employeeId, status, department) are promoted to
 * indexed columns.
 *
 * The dashboard/career service layer (services.ts) calls the matching
 * `/api/career/*` routes and consumes the returned value directly (raw array
 * for lists, raw object for items), so the routes return the merged
 * `{ ...data, <idKey> }` shape rather than a wrapped envelope.
 */

import type { Prisma } from '@prisma/client';
import { BaseService } from '@/lib/services/base.service';
import { ValidationError } from '@/lib/errors';

/**
 * Career entity kinds and the JSON key each surfaces its identifier under.
 * The dashboard types use kind-specific id keys (e.g. `ladderId`, `goalId`).
 */
export const CAREER_KINDS = {
  ladder: 'ladderId',
  path: 'pathId',
  'mobility-opportunity': 'opportunityId',
  'mobility-application': 'applicationId',
  'mobility-preference': 'preferenceId',
  'succession-plan': 'planId',
  goal: 'goalId',
  'development-discussion': 'discussionId',
  aspiration: 'aspirationId',
  'mentorship-request': 'requestId',
  'skill-assessment': 'assessmentId',
  'learning-pathway': 'pathwayId',
} as const;

export type CareerKind = keyof typeof CAREER_KINDS;

export interface CareerContext {
  tenantId: string;
  userId: string;
  employeeId?: string;
}

type JsonRecord = Record<string, unknown>;

export class CareerService extends BaseService {
  constructor() {
    super('CareerService');
  }

  private get delegate() {
    return this.prisma.careerEntity;
  }

  private idKey(kind: CareerKind): string {
    return CAREER_KINDS[kind];
  }

  /** Merge the stored JSON with the row id under the kind's id key. */
  private serialize(kind: CareerKind, row: { id: string; data: unknown }): JsonRecord {
    const data = (row.data as JsonRecord) ?? {};
    return { ...data, id: row.id, [this.idKey(kind)]: row.id };
  }

  /**
   * List entities of a kind for a tenant, with optional filters. Filters map to
   * indexed columns where possible (employeeId, status, department); any other
   * filter is ignored (the JSON payload is not indexed for arbitrary keys).
   */
  async list(
    kind: CareerKind,
    ctx: CareerContext,
    filters: JsonRecord = {}
  ): Promise<JsonRecord[]> {
    const where: Prisma.CareerEntityWhereInput = {
      tenantId: ctx.tenantId,
      kind,
      isDeleted: false,
    };
    if (typeof filters.employeeId === 'string') where.employeeId = filters.employeeId;
    if (typeof filters.status === 'string') where.status = filters.status;
    if (typeof filters.department === 'string') where.department = filters.department;

    const rows = await this.delegate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.serialize(kind, r));
  }

  /** Fetch a single entity, verifying tenant scope. Returns null if absent. */
  async get(kind: CareerKind, ctx: CareerContext, id: string): Promise<JsonRecord | null> {
    const row = await this.delegate.findFirst({
      where: { id, tenantId: ctx.tenantId, kind, isDeleted: false },
    });
    return row ? this.serialize(kind, row) : null;
  }

  /** Fetch the first entity of a kind for a given employee (tenant-scoped). */
  async getByEmployee(
    kind: CareerKind,
    ctx: CareerContext,
    employeeId: string
  ): Promise<JsonRecord | null> {
    const row = await this.delegate.findFirst({
      where: { tenantId: ctx.tenantId, kind, employeeId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.serialize(kind, row) : null;
  }

  /** Create a new entity of a kind. Server-derived tenant/user; ids ignored. */
  async create(kind: CareerKind, ctx: CareerContext, input: JsonRecord): Promise<JsonRecord> {
    const { id: _id, tenantId: _t, [this.idKey(kind)]: _idk, ...rest } = input as JsonRecord;
    const employeeId = this.pickString(rest, 'employeeId', 'menteeId') ?? ctx.employeeId ?? null;
    const status = this.pickString(rest, 'status', 'applicationStatus') ?? null;
    const department = this.pickString(rest, 'department', 'targetDepartment') ?? null;
    const now = new Date().toISOString();

    const created = await this.delegate.create({
      data: {
        tenantId: ctx.tenantId,
        kind,
        employeeId,
        status,
        department,
        data: { ...rest, createdDate: now, lastUpdatedDate: now } as Prisma.InputJsonValue,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      },
    });

    await this.audit(ctx, 'CAREER_ENTITY_CREATED', created.id, `Created career ${kind}`);
    return this.serialize(kind, created);
  }

  /** Update an existing entity (tenant-scoped). Throws if not found. */
  async update(
    kind: CareerKind,
    ctx: CareerContext,
    id: string,
    updates: JsonRecord
  ): Promise<JsonRecord> {
    const existing = await this.delegate.findFirst({
      where: { id, tenantId: ctx.tenantId, kind, isDeleted: false },
    });
    if (!existing) throw new ValidationError(`Career ${kind} ${id} not found.`);

    const { id: _id, tenantId: _t, [this.idKey(kind)]: _idk, ...rest } = updates as JsonRecord;
    const merged = {
      ...((existing.data as JsonRecord) ?? {}),
      ...rest,
      lastUpdatedDate: new Date().toISOString(),
    };

    const nextEmployeeId = this.pickString(rest, 'employeeId', 'menteeId') ?? existing.employeeId;
    const nextStatus = this.pickString(rest, 'status', 'applicationStatus') ?? existing.status;
    const nextDepartment =
      this.pickString(rest, 'department', 'targetDepartment') ?? existing.department;

    const updated = await this.delegate.update({
      where: { id },
      data: {
        employeeId: nextEmployeeId,
        status: nextStatus,
        department: nextDepartment,
        data: merged as Prisma.InputJsonValue,
        updatedBy: ctx.userId,
      },
    });

    await this.audit(ctx, 'CAREER_ENTITY_UPDATED', id, `Updated career ${kind}`);
    return this.serialize(kind, updated);
  }

  /** Soft-delete an entity (tenant-scoped). No-op if already absent. */
  async remove(kind: CareerKind, ctx: CareerContext, id: string): Promise<void> {
    const existing = await this.delegate.findFirst({
      where: { id, tenantId: ctx.tenantId, kind, isDeleted: false },
    });
    if (!existing) return;
    await this.delegate.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: ctx.userId },
    });
    await this.audit(ctx, 'CAREER_ENTITY_DELETED', id, `Deleted career ${kind}`);
  }

  // ── Settings (one row per tenant) ──────────────────────────────────────────

  private static readonly DEFAULT_SETTINGS: JsonRecord = {
    enableCareerLadders: true,
    enableInternalMobility: true,
    enableMentorship: true,
    requireManagerApprovalForMobility: true,
    minimumTenureForMobility: 12,
    noticePeriodrequired: 4,
    allowCrossDepartmentMobility: true,
    allowCrossLocationMobility: true,
    enableSuccessionPlanning: true,
    enableSkillAssessments: true,
    assessmentFrequency: 6,
    enableCareerGoals: true,
    maxActiveGoalsPerEmployee: 5,
    goalReviewFrequency: 3,
  };

  async getSettings(ctx: CareerContext): Promise<JsonRecord> {
    const row = await this.prisma.careerSetting.findUnique({ where: { tenantId: ctx.tenantId } });
    const data = (row?.data as JsonRecord) ?? {};
    return {
      ...CareerService.DEFAULT_SETTINGS,
      ...data,
      settingsId: row?.id ?? ctx.tenantId,
      lastUpdatedDate: (row?.updatedAt ?? new Date()).toISOString(),
      lastUpdatedBy: row?.updatedBy ?? ctx.userId,
    };
  }

  async updateSettings(ctx: CareerContext, updates: JsonRecord): Promise<JsonRecord> {
    const {
      settingsId: _s,
      lastUpdatedBy: _b,
      lastUpdatedDate: _d,
      ...rest
    } = updates as JsonRecord;
    const existing = await this.prisma.careerSetting.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    const nextData = {
      ...CareerService.DEFAULT_SETTINGS,
      ...((existing?.data as JsonRecord) ?? {}),
      ...rest,
    };

    const row = await this.prisma.careerSetting.upsert({
      where: { tenantId: ctx.tenantId },
      create: {
        tenantId: ctx.tenantId,
        data: nextData as Prisma.InputJsonValue,
        updatedBy: ctx.userId,
      },
      update: { data: nextData as Prisma.InputJsonValue, updatedBy: ctx.userId },
    });

    await this.audit(ctx, 'CAREER_SETTINGS_UPDATED', row.id, 'Updated career settings');
    return {
      ...nextData,
      settingsId: row.id,
      lastUpdatedDate: row.updatedAt.toISOString(),
      lastUpdatedBy: row.updatedBy,
    };
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private pickString(obj: JsonRecord, ...keys: string[]): string | undefined {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'string' && v.length > 0) return v;
    }
    return undefined;
  }

  private async audit(ctx: CareerContext, action: string, resourceId: string, details: string) {
    try {
      await this.createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        action,
        module: 'career-planning',
        resourceId,
        details,
      });
    } catch (err) {
      this.logger.warn({ err }, 'career audit log failed (non-fatal)');
    }
  }
}

export const careerService = new CareerService();
