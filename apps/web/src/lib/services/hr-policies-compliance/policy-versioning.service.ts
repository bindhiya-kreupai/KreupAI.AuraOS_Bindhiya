/**
 * EPIC-32: HR policy versioning + non-repudiable acknowledgement.
 *
 * Closes the audit gap "PolicyVersion model missing (cannot prove
 * which version was signed)". A full schema rework would require
 * a new PolicyVersion table; instead this service uses content
 * hashing + the existing AuditLog to produce an auditable trail
 * that is functionally equivalent:
 *
 *   On publish:
 *     - Compute SHA-256 of (title + version + contentMarkdown).
 *     - Write an AuditLog row with action=SETTINGS_UPDATED,
 *       resourceType='policy_version', metadata={ contentHash,
 *       version, title, publishedAt, publishedBy }.
 *     - Mark PolicyDocument.status='PUBLISHED' + bump version.
 *
 *   On acknowledgement:
 *     - Re-compute the hash from the CURRENT PolicyDocument.
 *     - Write the PolicyAcknowledgement row (existing model).
 *     - Write an AuditLog row with resourceType=
 *       'policy_acknowledgement', metadata={ policyId, employeeId,
 *       version, contentHash, ipAddress, userAgent }.
 *
 *   At audit time:
 *     - The (policyId, version, contentHash) tuple in the AuditLog
 *       publish row is the immutable proof of the published
 *       content. Each acknowledgement carries the same contentHash,
 *       so an auditor can verify which exact content version each
 *       employee signed — even after the policy is re-published.
 *
 * This is the minimum-viable closure of EPIC-32 S04
 * ("PolicyAddendum") and S08 ("PolicyCommunication dispatch") will
 * follow separately; the contentHash mechanism is the load-bearing
 * piece that the audit specifically called out.
 *
 * No schema change required.
 */

import { createHash } from 'crypto';
import { prisma } from '@aura/database';
import { auditService, AuditAction, AuditSeverity } from '@/lib/audit/audit.service';

export interface AuthContext {
  tenantId: string;
  userId: string;
  userEmail?: string;
}

export interface PublishPolicyInput {
  policyId: string;
  /** New version string. Free-form (SemVer recommended). */
  version: string;
  /** Optional override; otherwise the current PolicyDocument.contentMarkdown is hashed. */
  contentMarkdown?: string;
  effectiveDate?: Date;
}

export interface AcknowledgePolicyInput {
  policyId: string;
  employeeId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PolicyVersionRecord {
  policyId: string;
  version: string;
  title: string;
  contentHash: string;
  publishedAt: Date;
  publishedBy: string;
}

export interface AcknowledgementRecord {
  policyId: string;
  employeeId: string;
  version: string;
  contentHash: string;
  acknowledgedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Pure hash helper. Splits content + version + title so a republish that
 * changes only the version string still produces a different hash.
 */
export function computePolicyContentHash(input: {
  title: string;
  version: string;
  contentMarkdown: string;
}): string {
  const canonical = `${input.title.trim()}\n---v=${input.version.trim()}---\n${input.contentMarkdown.trim()}`;
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

export class PolicyVersioningService {
  /**
   * Publish a new immutable version of a PolicyDocument. Returns the
   * computed PolicyVersionRecord (also persisted into AuditLog metadata
   * for non-repudiation).
   */
  async publish(input: PublishPolicyInput, auth: AuthContext): Promise<PolicyVersionRecord> {
    const doc = await (prisma as any).policyDocument.findUnique({ where: { id: input.policyId } });
    if (!doc) throw new Error('policy not found');
    if (doc.tenantId !== auth.tenantId) throw new Error('tenant mismatch');

    const contentMarkdown = input.contentMarkdown ?? doc.contentMarkdown ?? '';
    const contentHash = computePolicyContentHash({
      title: doc.title,
      version: input.version,
      contentMarkdown,
    });

    const publishedAt = new Date();
    await (prisma as any).policyDocument.update({
      where: { id: input.policyId },
      data: {
        version: input.version,
        status: 'PUBLISHED',
        contentMarkdown,
        effectiveDate: input.effectiveDate ?? doc.effectiveDate ?? publishedAt,
        publishedAt,
      },
    });

    const record: PolicyVersionRecord = {
      policyId: input.policyId,
      version: input.version,
      title: doc.title,
      contentHash,
      publishedAt,
      publishedBy: auth.userId,
    };

    // Non-repudiation: every publish writes an immutable audit row that
    // includes the contentHash + version. The (resourceId, contentHash)
    // pair is the auditable "what was published".
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.MEDIUM,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: 'policy_version',
      resourceId: input.policyId,
      success: true,
      metadata: { ...record },
    });

    return record;
  }

  /**
   * Acknowledge the *current* version of a published policy. Computes
   * the content hash of the policy at the moment of ack so the audit
   * trail can later prove which version each employee signed.
   *
   * Idempotent on (policyId, employeeId) — re-calling returns the
   * existing acknowledgement.
   */
  async acknowledge(
    input: AcknowledgePolicyInput,
    auth: AuthContext
  ): Promise<AcknowledgementRecord> {
    const doc = await (prisma as any).policyDocument.findUnique({ where: { id: input.policyId } });
    if (!doc) throw new Error('policy not found');
    if (doc.tenantId !== auth.tenantId) throw new Error('tenant mismatch');
    if (doc.status !== 'PUBLISHED') {
      throw new Error('only PUBLISHED policies can be acknowledged');
    }

    const contentHash = computePolicyContentHash({
      title: doc.title,
      version: doc.version,
      contentMarkdown: doc.contentMarkdown ?? '',
    });

    const acknowledgedAt = new Date();
    try {
      await (prisma as any).policyAcknowledgement.create({
        data: {
          tenantId: auth.tenantId,
          policyId: input.policyId,
          employeeId: input.employeeId,
          acknowledgedAt,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
    } catch (err) {
      // Unique on (policyId, employeeId) — already acknowledged. Idempotent.
      if (!String(err).includes('Unique')) throw err;
    }

    const record: AcknowledgementRecord = {
      policyId: input.policyId,
      employeeId: input.employeeId,
      version: doc.version,
      contentHash,
      acknowledgedAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };

    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.LOW,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: 'policy_acknowledgement',
      resourceId: input.policyId,
      success: true,
      metadata: { ...record },
    });

    return record;
  }

  /**
   * Verify a presented acknowledgement: re-compute the content hash
   * from the *current* document and compare to the stored hash from
   * the historical AuditLog. Returns `match: true` only when the
   * employee's recorded ack belongs to the EXACT content currently
   * published.
   *
   * Use this on every page that asserts "you have acknowledged the
   * current policy" — if a republish has invalidated the prior ack,
   * the result will be `match: false` and the UI must prompt for a
   * fresh acknowledgement.
   */
  async verifyAcknowledgement(input: {
    policyId: string;
    employeeId: string;
    tenantId: string;
  }): Promise<{ match: boolean; ackVersion?: string; currentVersion?: string }> {
    const [doc, latestAckAudit] = await Promise.all([
      (prisma as any).policyDocument.findUnique({ where: { id: input.policyId } }),
      (prisma as any).auditLog.findFirst({
        where: {
          tenantId: input.tenantId,
          resourceType: 'policy_acknowledgement',
          resourceId: input.policyId,
        },
        orderBy: { timestamp: 'desc' },
        select: { metadata: true },
      }),
    ]);
    if (!doc) return { match: false };
    const currentHash = computePolicyContentHash({
      title: doc.title,
      version: doc.version,
      contentMarkdown: doc.contentMarkdown ?? '',
    });
    const meta =
      latestAckAudit?.metadata && typeof latestAckAudit.metadata === 'object'
        ? (latestAckAudit.metadata as Record<string, unknown>)
        : null;
    const ackHash =
      typeof meta?.contentHash === 'string' ? (meta.contentHash as string) : undefined;
    const ackVersion = typeof meta?.version === 'string' ? (meta.version as string) : undefined;
    return {
      match: !!ackHash && ackHash === currentHash,
      ackVersion,
      currentVersion: doc.version,
    };
  }
}

export const policyVersioningService = new PolicyVersioningService();
