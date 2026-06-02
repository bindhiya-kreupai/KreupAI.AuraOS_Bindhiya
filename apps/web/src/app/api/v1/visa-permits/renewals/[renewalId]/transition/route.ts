import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  visaPermitService,
  InvalidRenewalTransitionError,
  type RenewalStatus,
} from '@/lib/services/visa-permit.service';

export const dynamic = 'force-dynamic';

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params?: { renewalId?: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('employee:update')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing employee:update' } },
            { status: 403 }
          );
        }
        const renewalId = context.params?.renewalId;
        if (!renewalId) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Renewal not found' } },
            { status: 404 }
          );
        }
        const body = await request.json();
        const to = body.status as RenewalStatus;
        if (!to) {
          return NextResponse.json(
            { success: false, error: { code: 'E2001', message: 'status required' } },
            { status: 400 }
          );
        }
        const updated = await visaPermitService.transitionRenewal(
          renewalId,
          context.user.tenantId,
          context.user.id,
          to,
          to === 'COMPLETED'
            ? {
                newDocumentNumber: body.newDocumentNumber,
                newIssueDate: body.newIssueDate ? new Date(body.newIssueDate) : undefined,
                newExpiryDate: body.newExpiryDate ? new Date(body.newExpiryDate) : undefined,
                actualCost: body.actualCost,
                notes: body.notes,
              }
            : { notes: body.notes }
        );
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Renewal not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: `Renewal → ${to}` });
      } catch (error) {
        if (error instanceof InvalidRenewalTransitionError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Renewal transition failed',
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
