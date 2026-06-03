import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  fmlaService,
  type FMLAFramework,
  type FMLAStatus,
  IneligibleForFMLAError,
} from '@/lib/services/fmla.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    if (!context.permissions.includes('leave:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'missing leave:read' } },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const result = await fmlaService.list({
      tenantId: context.user.tenantId,
      employeeId: url.searchParams.get('employeeId') ?? undefined,
      status: (url.searchParams.get('status') as FMLAStatus) ?? undefined,
      framework: (url.searchParams.get('framework') as FMLAFramework) ?? undefined,
      page: Number(url.searchParams.get('page')) || 1,
      limit: Number(url.searchParams.get('limit')) || 50,
    });
    return NextResponse.json({ success: true, ...result });
  }
);

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: { user: { id: string; tenantId: string }; permissions: string[] }
    ) => {
      try {
        if (!context.permissions.includes('leave:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing leave:create' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        const required = [
          'employeeId',
          'reason',
          'tenureMonths',
          'hoursWorkedPrev12Mo',
          'startDate',
        ];
        for (const f of required) {
          if (body[f] === undefined || body[f] === null) {
            return NextResponse.json(
              { success: false, error: { code: 'E2001', message: `${f} required` } },
              { status: 400 }
            );
          }
        }
        const created = await fmlaService.openCase({
          tenantId: context.user.tenantId,
          employeeId: body.employeeId,
          framework: body.framework,
          reason: body.reason,
          tenureMonths: body.tenureMonths,
          hoursWorkedPrev12Mo: body.hoursWorkedPrev12Mo,
          trackingMethod: body.trackingMethod,
          startDate: new Date(body.startDate),
          expectedEndDate: body.expectedEndDate ? new Date(body.expectedEndDate) : undefined,
          joiningDate: body.joiningDate ? new Date(body.joiningDate) : undefined,
          fiscalStart: body.fiscalStart,
          notes: body.notes,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'FMLA case opened' },
          { status: 201 }
        );
      } catch (error) {
        if (error instanceof IneligibleForFMLAError) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E4220', message: error.message, details: { reason: error.reason } },
            },
            { status: 422 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to open FMLA case',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.LEAVE_REQUEST_CREATED, resourceType: 'fmla_case', captureRequestBody: true }
);
