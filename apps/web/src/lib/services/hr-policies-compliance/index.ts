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

export class HrPolicyService {
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

  async list(tenantId: string, filter: { status?: string } = {}) {
    return (prisma as any).policyDocument.findMany({
      where: { tenantId, ...(filter.status ? { status: filter.status } : {}) },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });
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
    return (prisma as any).hrPolicyException.findMany({
      where: {
        tenantId,
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.policyId ? { policyId: filter.policyId } : {}),
      },
      orderBy: { raisedAt: 'desc' },
    });
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

  async list(tenantId: string, filter: { overdueOnly?: boolean } = {}) {
    return (prisma as any).hrPolicyReview.findMany({
      where: {
        tenantId,
        ...(filter.overdueOnly ? { dueAt: { lt: new Date() }, status: 'OPEN' } : {}),
      },
      orderBy: { dueAt: 'asc' },
      take: 500,
    });
  }
}

export const hrPolicyReviewService = new HrPolicyReviewService();

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
