import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type RevocationScope = 'USER' | 'TENANT' | 'ALL_TENANTS';

export type RevocationReason =
  | 'JWT_ROTATION'
  | 'CREDENTIAL_LEAK'
  | 'OAUTH_SECRET_ROTATION'
  | 'SAML_KEY_ROTATION'
  | 'INCIDENT_RESPONSE'
  | 'USER_REQUEST'
  | 'MFA_RESET';

export interface RevocationResult {
  revokedCount: number;
  scope: RevocationScope;
  scopeId?: string;
  reason: RevocationReason;
  initiatedBy: string;
  occurredAt: Date;
}

export class InvalidRevocationScopeError extends Error {
  constructor(reason: string) {
    super(`Invalid revocation scope: ${reason}`);
    this.name = 'InvalidRevocationScopeError';
  }
}

/**
 * Force-revokes active sessions. Used by:
 *   - The force-logout endpoint (#21 — invalidate sessions after JWT_SECRET rotation)
 *   - Credential-rotation runbooks (#20, #22, #23, #24) when a leaked secret means
 *     every outstanding token must be assumed compromised
 *   - DSAR fulfillment (#99) when a deletion request must purge active sessions
 *
 * The service writes a row per revocation so SecOps can prove sessions were cut
 * within the SLA window mandated by each rotation procedure.
 */
export class SessionRevocationService extends BaseService {
  constructor() {
    super('SessionRevocationService');
  }

  async revokeForUser(
    userId: string,
    initiatedBy: string,
    reason: RevocationReason
  ): Promise<RevocationResult> {
    const result = await prisma.userSession.updateMany({
      where: { userId, status: 'Active' },
      data: { status: 'Revoked' },
    });
    return {
      revokedCount: result.count,
      scope: 'USER',
      scopeId: userId,
      reason,
      initiatedBy,
      occurredAt: new Date(),
    };
  }

  async revokeForTenant(
    tenantId: string,
    initiatedBy: string,
    reason: RevocationReason
  ): Promise<RevocationResult> {
    if (!tenantId) throw new InvalidRevocationScopeError('tenantId required');
    const result = await prisma.userSession.updateMany({
      where: { user: { tenantId }, status: 'Active' },
      data: { status: 'Revoked' },
    });
    return {
      revokedCount: result.count,
      scope: 'TENANT',
      scopeId: tenantId,
      reason,
      initiatedBy,
      occurredAt: new Date(),
    };
  }

  /**
   * Nuclear option used by the JWT_SECRET rotation runbook (#21). Cuts every
   * outstanding session platform-wide. Requires a SUPER_ADMIN actor — the
   * authz check is enforced at the route layer, not here.
   */
  async revokeAll(initiatedBy: string, reason: RevocationReason): Promise<RevocationResult> {
    const result = await prisma.userSession.updateMany({
      where: { status: 'Active' },
      data: { status: 'Revoked' },
    });
    return {
      revokedCount: result.count,
      scope: 'ALL_TENANTS',
      reason,
      initiatedBy,
      occurredAt: new Date(),
    };
  }

  /**
   * Pure: format a rotation summary for the audit log + ops chat. Surfaces
   * what was revoked, why, and when, in a single immutable string.
   */
  formatAuditSummary(result: RevocationResult): string {
    const scope =
      result.scope === 'ALL_TENANTS'
        ? 'all tenants'
        : result.scope === 'TENANT'
          ? `tenant=${result.scopeId}`
          : `user=${result.scopeId}`;
    return `Revoked ${result.revokedCount} session(s) [${scope}] reason=${result.reason} by=${result.initiatedBy} at=${result.occurredAt.toISOString()}`;
  }
}

export const sessionRevocationService = new SessionRevocationService();
