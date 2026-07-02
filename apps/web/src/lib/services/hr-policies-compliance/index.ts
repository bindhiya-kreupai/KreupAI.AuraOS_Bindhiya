/**
 * EPIC-32: HR Policies Compliance — layer over existing PolicyDocument +
 * PolicyAcknowledgement models.
 *
 * Adds:
 *   - publish lifecycle (DRAFT → PUBLISHED → ARCHIVED) using existing
 *     PolicyDocument.status; auto-creates a HrPolicyReview when published
 *     (intervalMonths default 12)
 *   - HR policy exception register with PENDING → APPROVED → CLOSED
 *   - Scheduled review register with overdue detection
 *   - Monthly compliance certificate aggregating publish state,
 *     acknowledgement coverage (PolicyAcknowledgement rows / population),
 *     overdue reviews, and pending exceptions — refusing to sign while
 *     overdue reviews, pending exceptions, or below-threshold ack
 *     coverage remain.
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

const ACK_COVERAGE_THRESHOLD = 90; // %

function addMonths(d: Date, months: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

/**
 * Resolve a { policyId → title } map for a tenant so list rows can display a
 * human-readable policy name/link instead of a bare UUID.
 */
async function policyTitleMap(
  tenantId: string,
  policyIds: string[]
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(policyIds.filter(Boolean)));
  if (unique.length === 0) return {};
  const docs: Array<{ id: string; title: string }> = await (prisma as any).policyDocument.findMany({
    where: { tenantId, id: { in: unique } },
    select: { id: true, title: true },
  });
  return Object.fromEntries(docs.map((d) => [d.id, d.title]));
}

export interface CreatePolicyInput {
  title: string;
  category: string;
  version?: string;
  applicableTo?: string;
  summary?: string;
  contentMarkdown?: string;
  acknowledgementsRequired?: boolean;
  effectiveDate?: Date;
  ownerName?: string;
}

export type UpdatePolicyInput = Partial<CreatePolicyInput>;

export class HrPolicyService {
  async getById(policyId: string, tenantId: string) {
    const policy = await (prisma as any).policyDocument.findUnique({
      where: { id: policyId },
    });
    if (!policy || policy.tenantId !== tenantId || policy.isDeleted) return null;
    return policy;
  }

  async create(input: CreatePolicyInput, auth: AuthContext) {
    if (!input.title?.trim() || !input.category?.trim()) {
      throw new Error('title and category are required');
    }
    return (prisma as any).policyDocument.create({
      data: {
        tenantId: auth.tenantId,
        title: input.title.trim(),
        category: input.category.trim(),
        version: input.version?.trim() || '1.0',
        status: 'DRAFT',
        applicableTo: input.applicableTo?.trim() || 'ALL_EMPLOYEES',
        summary: input.summary ?? null,
        contentMarkdown: input.contentMarkdown ?? null,
        acknowledgementsRequired: input.acknowledgementsRequired ?? true,
        effectiveDate: input.effectiveDate ?? null,
        ownerId: auth.userId,
        ownerName: input.ownerName ?? null,
        createdBy: auth.userId,
      },
    });
  }

  async update(policyId: string, input: UpdatePolicyInput, auth: AuthContext) {
    const existing = await this.getById(policyId, auth.tenantId);
    if (!existing) throw new Error('policy not found');
    const data: Record<string, unknown> = { updatedBy: auth.userId };
    if (input.title !== undefined) data.title = input.title.trim();
    if (input.category !== undefined) data.category = input.category.trim();
    if (input.version !== undefined) data.version = input.version.trim();
    if (input.applicableTo !== undefined) data.applicableTo = input.applicableTo.trim();
    if (input.summary !== undefined) data.summary = input.summary;
    if (input.contentMarkdown !== undefined) data.contentMarkdown = input.contentMarkdown;
    if (input.acknowledgementsRequired !== undefined)
      data.acknowledgementsRequired = input.acknowledgementsRequired;
    if (input.effectiveDate !== undefined) data.effectiveDate = input.effectiveDate;
    if (input.ownerName !== undefined) data.ownerName = input.ownerName;
    return (prisma as any).policyDocument.update({ where: { id: policyId }, data });
  }

  async publish(input: { policyId: string; intervalMonths?: number }, auth: AuthContext) {
    const policy = await (prisma as any).policyDocument.findUnique({
      where: { id: input.policyId },
    });
    if (!policy || policy.tenantId !== auth.tenantId) throw new Error('policy not found');
    await (prisma as any).policyDocument.update({
      where: { id: input.policyId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
    const interval = input.intervalMonths ?? 12;
    const dueAt = addMonths(new Date(), interval);
    await (prisma as any).hrPolicyReview.upsert({
      where: {
        aura_hr_policy_review_unique: {
          tenantId: auth.tenantId,
          policyId: input.policyId,
        },
      },
      update: { dueAt, intervalMonths: interval, status: 'OPEN' },
      create: {
        tenantId: auth.tenantId,
        policyId: input.policyId,
        dueAt,
        intervalMonths: interval,
        status: 'OPEN',
      },
    });
    return { ok: true, nextReviewAt: dueAt };
  }

  async archive(policyId: string, _auth: AuthContext) {
    return (prisma as any).policyDocument.update({
      where: { id: policyId },
      data: { status: 'ARCHIVED' },
    });
  }

  async list(
    tenantId: string,
    filter: { status?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      isDeleted: false,
      ...(filter.status ? { status: filter.status } : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).policyDocument.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).policyDocument.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const hrPolicyService = new HrPolicyService();

export class HrPolicyExceptionService {
  async raise(
    input: {
      policyId: string;
      employeeId?: string;
      scopeLabel?: string;
      reason: string;
      expiresAt?: Date;
    },
    auth: AuthContext
  ) {
    return (prisma as any).hrPolicyException.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        raisedBy: auth.userId,
        status: 'PENDING',
      },
    });
  }

  async approve(id: string, auth: AuthContext) {
    return (prisma as any).hrPolicyException.update({
      where: { id },
      data: { status: 'APPROVED', approverId: auth.userId, approvedAt: new Date() },
    });
  }

  async reject(id: string, auth: AuthContext) {
    return (prisma as any).hrPolicyException.update({
      where: { id },
      data: { status: 'REJECTED', approverId: auth.userId, approvedAt: new Date() },
    });
  }

  async close(id: string, _auth: AuthContext) {
    return (prisma as any).hrPolicyException.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async list(tenantId: string, filter: { status?: string; policyId?: string } = {}) {
    const rows: Array<{ policyId: string }> = await (prisma as any).hrPolicyException.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.policyId ? { policyId: filter.policyId } : {}),
      },
      orderBy: { raisedAt: 'desc' },
    });
    const titles = await policyTitleMap(
      tenantId,
      rows.map((r) => r.policyId)
    );
    return rows.map((r) => ({ ...r, policyTitle: titles[r.policyId] ?? null }));
  }
}

export const hrPolicyExceptionService = new HrPolicyExceptionService();

export class HrPolicyReviewService {
  async complete(
    input: {
      policyId: string;
      outcome: 'NO_CHANGE' | 'MINOR_UPDATE' | 'MAJOR_REWRITE';
      notes?: string;
    },
    auth: AuthContext
  ) {
    const current = await (prisma as any).hrPolicyReview.findUnique({
      where: {
        aura_hr_policy_review_unique: { tenantId: auth.tenantId, policyId: input.policyId },
      },
    });
    if (!current) throw new Error('no review for policy');
    const nextDue = addMonths(new Date(), current.intervalMonths);
    return (prisma as any).hrPolicyReview.update({
      where: {
        aura_hr_policy_review_unique: { tenantId: auth.tenantId, policyId: input.policyId },
      },
      data: {
        lastReviewedAt: new Date(),
        lastReviewedBy: auth.userId,
        reviewerNotes: input.notes,
        outcome: input.outcome,
        dueAt: nextDue,
        status: 'OPEN',
      },
    });
  }

  async list(
    tenantId: string,
    filter: { overdueOnly?: boolean } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.overdueOnly ? { dueAt: { lt: new Date() }, status: 'OPEN' } : {}),
    };
    const page = normalisePaging(paging);
    const [rawItems, total] = await Promise.all([
      (prisma as any).hrPolicyReview.findMany({
        where,
        orderBy: { dueAt: 'asc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).hrPolicyReview.count({ where }),
    ]);
    const titles = await policyTitleMap(
      tenantId,
      (rawItems as Array<{ policyId: string }>).map((r) => r.policyId)
    );
    const items = (rawItems as Array<{ policyId: string }>).map((r) => ({
      ...r,
      policyTitle: titles[r.policyId] ?? null,
    }));
    return buildPaginatedResult(items, total, page);
  }
}

export const hrPolicyReviewService = new HrPolicyReviewService();

/**
 * S08 — per-policy / per-employee acknowledgement tracking plus an employee
 * self-acknowledge workflow, backed by the existing PolicyAcknowledgement
 * model (aura_policy_acknowledgement).
 */
export class HrPolicyAcknowledgementService {
  /** Acknowledgement rows for a single policy (per-employee list). */
  async listForPolicy(
    tenantId: string,
    policyId: string,
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, policyId, isDeleted: false };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).policyAcknowledgement.findMany({
        where,
        orderBy: { acknowledgedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).policyAcknowledgement.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  /**
   * Published-policy summary with per-policy ack counts, so the coverage page
   * can show a real per-policy table (not just aggregate KPIs).
   */
  async coverageByPolicy(tenantId: string, totalEmployees = 100) {
    const policies: Array<{
      id: string;
      title: string;
      category: string;
      version: string;
      acknowledgementsRequired: boolean;
    }> = await (prisma as any).policyDocument.findMany({
      where: { tenantId, status: 'PUBLISHED', isDeleted: false },
      select: {
        id: true,
        title: true,
        category: true,
        version: true,
        acknowledgementsRequired: true,
      },
      orderBy: { title: 'asc' },
    });
    const rows = await Promise.all(
      policies.map(async (p) => {
        const acked = await (prisma as any).policyAcknowledgement.count({
          where: { tenantId, policyId: p.id, isDeleted: false },
        });
        const pct =
          !p.acknowledgementsRequired || totalEmployees <= 0
            ? 100
            : Number(((acked / totalEmployees) * 100).toFixed(2));
        return { ...p, acknowledged: acked, coveragePct: pct };
      })
    );
    return rows;
  }

  /** Policies the current employee still needs to acknowledge. */
  async pendingForEmployee(tenantId: string, employeeId: string) {
    const policies: Array<{
      id: string;
      title: string;
      category: string;
      version: string;
    }> = await (prisma as any).policyDocument.findMany({
      where: {
        tenantId,
        status: 'PUBLISHED',
        acknowledgementsRequired: true,
        isDeleted: false,
      },
      select: { id: true, title: true, category: true, version: true },
      orderBy: { title: 'asc' },
    });
    const acks: Array<{ policyId: string; acknowledgedAt: Date }> = await (
      prisma as any
    ).policyAcknowledgement.findMany({
      where: { tenantId, employeeId, isDeleted: false },
      select: { policyId: true, acknowledgedAt: true },
    });
    const ackedMap = new Map(acks.map((a) => [a.policyId, a.acknowledgedAt]));
    return policies.map((p) => ({
      ...p,
      acknowledged: ackedMap.has(p.id),
      acknowledgedAt: ackedMap.get(p.id) ?? null,
    }));
  }

  /**
   * Record an acknowledgement for the authenticated employee. Idempotent — a
   * repeat call for an already-acknowledged policy returns the existing row.
   */
  async acknowledge(
    input: { policyId: string; employeeId: string; ipAddress?: string; userAgent?: string },
    auth: AuthContext
  ) {
    const policy = await (prisma as any).policyDocument.findUnique({
      where: { id: input.policyId },
    });
    if (!policy || policy.tenantId !== auth.tenantId || policy.isDeleted) {
      throw new Error('policy not found');
    }
    if (policy.status !== 'PUBLISHED') {
      throw new Error('policy is not published');
    }
    const existing = await (prisma as any).policyAcknowledgement.findUnique({
      where: {
        policyId_employeeId: { policyId: input.policyId, employeeId: input.employeeId },
      },
    });
    if (existing) return existing;
    return (prisma as any).policyAcknowledgement.create({
      data: {
        tenantId: auth.tenantId,
        policyId: input.policyId,
        employeeId: input.employeeId,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        createdBy: auth.userId,
      },
    });
  }
}

export const hrPolicyAcknowledgementService = new HrPolicyAcknowledgementService();

export class HrPolicyCertificateService {
  async dashboard(tenantId: string, period: string, totalEmployees: number = 100) {
    const publishedCount = await (prisma as any).policyDocument.count({
      where: { tenantId, status: 'PUBLISHED' },
    });
    const draftCount = await (prisma as any).policyDocument.count({
      where: { tenantId, status: 'DRAFT' },
    });
    const overdueReviewsCount = await (prisma as any).hrPolicyReview.count({
      where: { tenantId, status: 'OPEN', dueAt: { lt: new Date() } },
    });
    const pendingExceptionsCount = await (prisma as any).hrPolicyException.count({
      where: { tenantId, status: 'PENDING' },
    });
    const policies = await (prisma as any).policyDocument.findMany({
      where: { tenantId, status: 'PUBLISHED', acknowledgementsRequired: true },
      select: { id: true },
    });
    let totalRequired = 0;
    let totalAcked = 0;
    let belowThreshold = 0;
    for (const p of policies as Array<{ id: string }>) {
      const acked = await (prisma as any).policyAcknowledgement.count({
        where: { tenantId, policyId: p.id },
      });
      totalRequired += totalEmployees;
      totalAcked += acked;
      const pct = totalEmployees > 0 ? (acked / totalEmployees) * 100 : 100;
      if (pct < ACK_COVERAGE_THRESHOLD) belowThreshold += 1;
    }
    const ackCoveragePct =
      totalRequired === 0 ? 100 : Number(((totalAcked / totalRequired) * 100).toFixed(2));
    return {
      period,
      publishedCount,
      draftCount,
      overdueReviewsCount,
      pendingExceptionsCount,
      ackCoveragePct,
      ackBelowThresholdCount: belowThreshold,
    };
  }

  async generate(period: string, auth: AuthContext, totalEmployees: number = 100) {
    const stats = await this.dashboard(auth.tenantId, period, totalEmployees);
    const reasons: string[] = [];
    if (stats.overdueReviewsCount > 0)
      reasons.push(`${stats.overdueReviewsCount} overdue review(s)`);
    if (stats.pendingExceptionsCount > 0)
      reasons.push(`${stats.pendingExceptionsCount} pending exception(s)`);
    if (stats.ackBelowThresholdCount > 0)
      reasons.push(
        `${stats.ackBelowThresholdCount} policy(ies) below ${ACK_COVERAGE_THRESHOLD}% ack coverage`
      );
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).hrPolicyCertificate.upsert({
      where: { aura_hr_policy_certificate_unique: { tenantId: auth.tenantId, period } },
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
    const cert = await (prisma as any).hrPolicyCertificate.findUnique({
      where: { aura_hr_policy_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    if (!Array.isArray(attestations) || attestations.length === 0) {
      throw new Error('at least one attestation is required to sign');
    }
    if (attestations.some((a) => !a || !a.field?.trim() || !a.value?.trim())) {
      throw new Error('every attestation must have a field and value');
    }
    return (prisma as any).hrPolicyCertificate.update({
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
    return (prisma as any).hrPolicyCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const hrPolicyCertificateService = new HrPolicyCertificateService();

export const HR_POLICY_CONSTANTS = { ACK_COVERAGE_THRESHOLD };
