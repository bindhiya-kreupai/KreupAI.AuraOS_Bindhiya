import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  sessionRevocationService,
  InvalidRevocationScopeError,
  type RevocationReason,
  type RevocationScope,
} from '@/lib/services/session-revocation.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/security/sessions/revoke
 *
 * Cuts active sessions. Scope is one of:
 *   - USER         (requires userId; admin only)
 *   - TENANT       (admin or tenant owner)
 *   - ALL_TENANTS  (SUPER_ADMIN only — JWT_SECRET rotation)
 *
 * Returns the count + a formatted audit summary that the rotation runbook
 * pastes into the incident channel.
 */
export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { id: string; tenantId: string }; permissions: string[]; roles: string[] }
    ) => {
      try {
        const body = await request.json();
        const scope = body?.scope as RevocationScope | undefined;
        const reason = (body?.reason as RevocationReason | undefined) ?? 'INCIDENT_RESPONSE';

        if (!scope) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'scope required' } },
            { status: 400 }
          );
        }

        // Authz: SUPER_ADMIN gates the platform-wide flush
        if (scope === 'ALL_TENANTS' && !context.roles.includes('SUPER_ADMIN')) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E4030', message: 'ALL_TENANTS revoke requires SUPER_ADMIN' },
            },
            { status: 403 }
          );
        }
        if (scope !== 'ALL_TENANTS' && !context.permissions.includes('security:revoke')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing security:revoke' } },
            { status: 403 }
          );
        }

        let result;
        switch (scope) {
          case 'USER':
            if (!body?.userId) {
              return NextResponse.json(
                { success: false, error: { code: 'E2001', message: 'userId required' } },
                { status: 400 }
              );
            }
            result = await sessionRevocationService.revokeForUser(
              body.userId,
              context.user.id,
              reason
            );
            break;
          case 'TENANT':
            result = await sessionRevocationService.revokeForTenant(
              body.tenantId ?? context.user.tenantId,
              context.user.id,
              reason
            );
            break;
          case 'ALL_TENANTS':
            result = await sessionRevocationService.revokeAll(context.user.id, reason);
            break;
          default:
            return NextResponse.json(
              { success: false, error: { code: 'E2001', message: `unknown scope ${scope}` } },
              { status: 400 }
            );
        }

        return NextResponse.json({
          success: true,
          data: result,
          auditSummary: sessionRevocationService.formatAuditSummary(result),
        });
      } catch (error) {
        if (error instanceof InvalidRevocationScopeError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4220', message: error.message } },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to revoke sessions',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.SETTINGS_UPDATED,
    resourceType: 'user_session',
    captureRequestBody: true,
  }
);
