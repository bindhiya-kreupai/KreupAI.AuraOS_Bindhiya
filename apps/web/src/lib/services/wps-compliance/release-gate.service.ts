/**
 * EPIC-11 WPS release gate (preparer ≠ releaser).
 *
 * Closes the audit gap "No release gate (preparer ≠ releaser)" for
 * EPIC-11 WPS. Anyone with submission rights could previously both
 * prepare AND release the WPS file in a single session — the audit
 * called this out as a control-effectiveness failure.
 *
 * This service wraps WpsSubmissionService.submit() with a
 * segregation-of-duties (SoD) check:
 *
 *  - When createdBy / updatedBy on the WpsPeriodSubmission row, or
 *    any AuditLog row with resourceType='wps_submission_prepared'
 *    for the same submissionId, names the releasing user — the
 *    release is REFUSED.
 *  - Otherwise the release is recorded into AuditLog with
 *    resourceType='wps_submission_released' (the immutable evidence
 *    that the two roles were separate) and submit() is invoked.
 *
 * Optional `force=true` allows the COMPLIANCE_OFFICER role to
 * bypass the SoD check for emergency releases, but the bypass is
 * itself logged with a HIGH-severity audit row carrying the
 * justification — auditors can later query for forced releases.
 *
 * No schema change required.
 */

import { prisma } from '@aura/database';
import { auditService, AuditAction, AuditSeverity } from '@/lib/audit/audit.service';
import { WpsSubmissionService } from './submission.service';

export interface AuthContext {
  tenantId: string;
  userId: string;
  userEmail?: string;
  /** Roles assigned to the user — used for emergency-bypass eligibility. */
  roles?: string[];
}

export interface ReleaseInput {
  submissionId: string;
  submittedAt?: Date;
  /** Set true on emergency releases; allowed only for COMPLIANCE_OFFICER. */
  force?: boolean;
  /** Required when force=true. */
  bypassJustification?: string;
}

export type ReleaseRefusalReason =
  | 'PREPARER_IS_RELEASER'
  | 'PREPARER_AUDIT_HIT'
  | 'STATUS_NOT_RELEASABLE'
  | 'FORCE_DENIED_ROLE'
  | 'FORCE_MISSING_JUSTIFICATION';

export interface ReleaseRefusal {
  released: false;
  reason: ReleaseRefusalReason;
  reasonEn: string;
  reasonAr: string;
  preparedBy?: string;
}

export interface ReleaseAccepted {
  released: true;
  submissionId: string;
  releasedBy: string;
  releasedAt: Date;
  forced: boolean;
}

export type ReleaseOutcome = ReleaseAccepted | ReleaseRefusal;

const REASON: Record<ReleaseRefusalReason, { en: string; ar: string }> = {
  PREPARER_IS_RELEASER: {
    en: 'Segregation of duties: the preparer cannot release the same submission',
    ar: 'فصل الواجبات: لا يمكن لمن أعدّ الكشف أن يطلقه',
  },
  PREPARER_AUDIT_HIT: {
    en: 'Segregation of duties: a prior preparer action by this user is on record for this submission',
    ar: 'فصل الواجبات: يوجد سجل سابق لإعداد هذا الكشف من قبل المستخدم نفسه',
  },
  STATUS_NOT_RELEASABLE: {
    en: 'Submission is not in a releasable status (must be VALIDATED or GENERATED)',
    ar: 'الكشف ليس في حالة قابلة للإطلاق (يجب أن يكون VALIDATED أو GENERATED)',
  },
  FORCE_DENIED_ROLE: {
    en: 'Force-release is allowed only for the COMPLIANCE_OFFICER role',
    ar: 'الإطلاق القسري مسموح فقط لدور مسؤول الامتثال',
  },
  FORCE_MISSING_JUSTIFICATION: {
    en: 'Force-release requires a written justification (min 10 chars)',
    ar: 'الإطلاق القسري يتطلب مبرراً مكتوباً (10 أحرف على الأقل)',
  },
};

const RELEASABLE_STATUSES = new Set(['VALIDATED', 'GENERATED']);
const PREPARER_AUDIT_RESOURCE = 'wps_submission_prepared';
const RELEASE_AUDIT_RESOURCE = 'wps_submission_released';

export class WpsReleaseGateService {
  constructor(private readonly submissionService = new WpsSubmissionService()) {}

  /**
   * Mark the actor as a preparer for `submissionId`. Should be called
   * by every UI / API action that builds or edits the file (VALIDATE,
   * GENERATE, RE-GENERATE). Idempotent on (submissionId, userId).
   */
  async markPrepared(submissionId: string, auth: AuthContext): Promise<void> {
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: AuditSeverity.LOW,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: PREPARER_AUDIT_RESOURCE,
      resourceId: submissionId,
      success: true,
      metadata: { submissionId, preparedBy: auth.userId, preparedAt: new Date().toISOString() },
    });
  }

  /**
   * Release a submission. Refuses when the releaser was a preparer
   * (either via the WpsPeriodSubmission.createdBy/updatedBy stamps or
   * an explicit AuditLog mark) unless force=true is invoked by a
   * COMPLIANCE_OFFICER with a written justification.
   */
  async release(input: ReleaseInput, auth: AuthContext): Promise<ReleaseOutcome> {
    const sub = await (prisma as any).wpsPeriodSubmission.findUnique({
      where: { id: input.submissionId },
      select: { id: true, status: true, createdBy: true, updatedBy: true, tenantId: true },
    });
    if (!sub) throw new Error('submission not found');
    if (sub.tenantId !== auth.tenantId) throw new Error('tenant mismatch');

    if (!RELEASABLE_STATUSES.has(sub.status)) {
      return {
        released: false,
        reason: 'STATUS_NOT_RELEASABLE',
        reasonEn: REASON.STATUS_NOT_RELEASABLE.en,
        reasonAr: REASON.STATUS_NOT_RELEASABLE.ar,
      };
    }

    if (input.force) {
      if (!(auth.roles ?? []).includes('COMPLIANCE_OFFICER')) {
        return {
          released: false,
          reason: 'FORCE_DENIED_ROLE',
          reasonEn: REASON.FORCE_DENIED_ROLE.en,
          reasonAr: REASON.FORCE_DENIED_ROLE.ar,
        };
      }
      if (!input.bypassJustification || input.bypassJustification.trim().length < 10) {
        return {
          released: false,
          reason: 'FORCE_MISSING_JUSTIFICATION',
          reasonEn: REASON.FORCE_MISSING_JUSTIFICATION.en,
          reasonAr: REASON.FORCE_MISSING_JUSTIFICATION.ar,
        };
      }
    } else {
      // Standard path: enforce preparer != releaser.
      if (sub.createdBy === auth.userId || sub.updatedBy === auth.userId) {
        return {
          released: false,
          reason: 'PREPARER_IS_RELEASER',
          reasonEn: REASON.PREPARER_IS_RELEASER.en,
          reasonAr: REASON.PREPARER_IS_RELEASER.ar,
          preparedBy: sub.createdBy ?? sub.updatedBy ?? undefined,
        };
      }
      const audit = await (prisma as any).auditLog.findFirst({
        where: {
          tenantId: auth.tenantId,
          resourceType: PREPARER_AUDIT_RESOURCE,
          resourceId: input.submissionId,
          userId: auth.userId,
        },
        select: { id: true },
      });
      if (audit) {
        return {
          released: false,
          reason: 'PREPARER_AUDIT_HIT',
          reasonEn: REASON.PREPARER_AUDIT_HIT.en,
          reasonAr: REASON.PREPARER_AUDIT_HIT.ar,
          preparedBy: auth.userId,
        };
      }
    }

    const releasedAt = input.submittedAt ?? new Date();
    await auditService.log({
      action: AuditAction.SETTINGS_UPDATED,
      severity: input.force ? AuditSeverity.HIGH : AuditSeverity.MEDIUM,
      userId: auth.userId,
      userEmail: auth.userEmail,
      tenantId: auth.tenantId,
      resourceType: RELEASE_AUDIT_RESOURCE,
      resourceId: input.submissionId,
      success: true,
      metadata: {
        submissionId: input.submissionId,
        releasedBy: auth.userId,
        releasedAt: releasedAt.toISOString(),
        forced: !!input.force,
        bypassJustification: input.bypassJustification,
      },
    });

    await this.submissionService.submit(input.submissionId, releasedAt, auth);
    return {
      released: true,
      submissionId: input.submissionId,
      releasedBy: auth.userId,
      releasedAt,
      forced: !!input.force,
    };
  }
}

export const wpsReleaseGateService = new WpsReleaseGateService();
