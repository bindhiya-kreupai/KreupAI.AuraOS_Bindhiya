import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  profileChangeService,
  InvalidTransitionError,
} from '@/lib/services/profile-change.service';

export const dynamic = 'force-dynamic';

const meta = () => ({
  timestamp: new Date().toISOString(),
  requestId: crypto.randomUUID(),
  apiVersion: 'v1',
});

const forbidden = (m: string) =>
  NextResponse.json(
    { success: false, error: { code: 'E4030', message: m, messageAr: 'ممنوع' } },
    { status: 403 }
  );

const notFound = () =>
  NextResponse.json(
    { success: false, error: { code: 'E4040', message: 'Request not found' } },
    { status: 404 }
  );

const conflict = (m: string) =>
  NextResponse.json({ success: false, error: { code: 'E4090', message: m } }, { status: 409 });

const serverError = (error: unknown) =>
  NextResponse.json(
    {
      success: false,
      error: {
        code: 'E5001',
        message: 'Profile change operation failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
    },
    { status: 500 }
  );

export const GET = withEnhancedAuth(
  async (
    _request: NextRequest,
    context: {
      user: { tenantId: string };
      permissions: string[];
      params?: { id?: string };
    }
  ) => {
    try {
      if (!context.permissions.includes('employee:read')) return forbidden('missing employee:read');
      const id = context.params?.id;
      if (!id) return notFound();
      const item = await profileChangeService.getById(id, context.user.tenantId);
      if (!item) return notFound();
      return NextResponse.json({ success: true, data: item, meta: meta() });
    } catch (error) {
      return serverError(error);
    }
  }
);

export const PUT = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params?: { id?: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('employee:update'))
          return forbidden('missing employee:update');
        const id = context.params?.id;
        if (!id) return notFound();

        const body = await request.json();
        const updated = await profileChangeService.updateDraft(
          id,
          context.user.tenantId,
          context.user.id,
          {
            afterValues: body.afterValues,
            justification: body.justification,
            attachmentIds: body.attachmentIds,
            effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
            fieldPath: body.fieldPath,
          }
        );
        if (!updated) return notFound();
        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Request updated',
          meta: meta(),
        });
      } catch (error) {
        if (error instanceof InvalidTransitionError) return conflict(error.message);
        return serverError(error);
      }
    }
  ),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'profile_change_request',
    captureRequestBody: true,
  }
);
