import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  profileChangeService,
  type ProfileChangeCategory,
  type ProfileChangeStatus,
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

const badRequest = (m: string) =>
  NextResponse.json({ success: false, error: { code: 'E2001', message: m } }, { status: 400 });

export const GET = withEnhancedAuth(
  async (
    request: NextRequest,
    context: { user: { id: string; tenantId: string }; permissions: string[] }
  ) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('employee:read')) return forbidden('missing employee:read');

      const url = new URL(request.url);
      const result = await profileChangeService.list({
        tenantId: user.tenantId,
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        status: (url.searchParams.get('status') as ProfileChangeStatus) ?? undefined,
        category: (url.searchParams.get('category') as ProfileChangeCategory) ?? undefined,
        page: Number(url.searchParams.get('page')) || 1,
        limit: Number(url.searchParams.get('limit')) || 20,
      });

      return NextResponse.json({ success: true, ...result, meta: meta() });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to list profile change requests',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        const { user, permissions } = context;
        if (!permissions.includes('employee:update')) return forbidden('missing employee:update');

        const body = await request.json();
        if (!body.employeeId || !body.category || !body.afterValues) {
          return badRequest('employeeId, category, afterValues are required');
        }

        const created = await profileChangeService.create({
          tenantId: user.tenantId,
          employeeId: body.employeeId,
          requestedById: user.id,
          category: body.category,
          fieldPath: body.fieldPath,
          beforeValues: body.beforeValues,
          afterValues: body.afterValues,
          justification: body.justification,
          attachmentIds: body.attachmentIds,
          effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
        });

        return NextResponse.json(
          {
            success: true,
            data: created,
            message: 'Profile change request created',
            meta: meta(),
          },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create profile change request',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'profile_change_request',
    captureRequestBody: true,
  }
);
