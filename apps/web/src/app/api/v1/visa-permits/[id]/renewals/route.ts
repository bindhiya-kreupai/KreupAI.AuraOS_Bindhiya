import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { visaPermitService } from '@/lib/services/visa-permit.service';

export const dynamic = 'force-dynamic';

export const POST = withAudit(
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
        if (!context.permissions.includes('employee:update')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing employee:update' } },
            { status: 403 }
          );
        }
        const visaPermitId = context.params?.id;
        if (!visaPermitId) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Visa/permit not found' } },
            { status: 404 }
          );
        }
        const body = await request.json().catch(() => ({}));
        const renewal = await visaPermitService.startRenewal(
          visaPermitId,
          context.user.tenantId,
          context.user.id,
          {
            assignedTo: body.assignedTo,
            vendorName: body.vendorName,
            estimatedCost: body.estimatedCost,
            notes: body.notes,
          }
        );
        if (!renewal) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Visa/permit not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { success: true, data: renewal, message: 'Renewal started' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Renewal start failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.EMPLOYEE_UPDATED, resourceType: 'visa_renewal', captureRequestBody: true }
);
