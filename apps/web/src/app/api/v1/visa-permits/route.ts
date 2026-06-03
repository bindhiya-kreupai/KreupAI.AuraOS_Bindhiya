import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  visaPermitService,
  type DocumentType,
  type VisaPermitStatus,
} from '@/lib/services/visa-permit.service';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context: { user: { tenantId: string }; permissions: string[] }) => {
    try {
      if (!context.permissions.includes('employee:read')) {
        return NextResponse.json(
          { success: false, error: { code: 'E4030', message: 'missing employee:read' } },
          { status: 403 }
        );
      }
      const url = new URL(request.url);
      const expiring = url.searchParams.get('expiringWithinDays');
      const result = await visaPermitService.list({
        tenantId: context.user.tenantId,
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        documentType: (url.searchParams.get('documentType') as DocumentType) ?? undefined,
        status: (url.searchParams.get('status') as VisaPermitStatus) ?? undefined,
        countryCode: url.searchParams.get('countryCode') ?? undefined,
        expiringWithinDays: expiring ? Number(expiring) : undefined,
        page: Number(url.searchParams.get('page')) || 1,
        limit: Number(url.searchParams.get('limit')) || 50,
      });
      return NextResponse.json({ success: true, ...result });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to list visa/permit records',
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
        if (!context.permissions.includes('employee:update')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing employee:update' } },
            { status: 403 }
          );
        }
        const body = await request.json();
        const required = [
          'employeeId',
          'documentType',
          'documentNumber',
          'countryCode',
          'issueDate',
          'expiryDate',
        ];
        for (const f of required) {
          if (!body[f]) {
            return NextResponse.json(
              { success: false, error: { code: 'E2001', message: `${f} required` } },
              { status: 400 }
            );
          }
        }
        const created = await visaPermitService.create({
          tenantId: context.user.tenantId,
          employeeId: body.employeeId,
          documentType: body.documentType,
          documentNumber: body.documentNumber,
          countryCode: body.countryCode,
          issuingAuthority: body.issuingAuthority,
          issueDate: new Date(body.issueDate),
          expiryDate: new Date(body.expiryDate),
          category: body.category,
          attachmentIds: body.attachmentIds,
          notes: body.notes,
          metadata: body.metadata,
          actorId: context.user.id,
        });
        return NextResponse.json(
          { success: true, data: created, message: 'Visa/permit recorded' },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Failed to create visa/permit',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.EMPLOYEE_UPDATED, resourceType: 'visa_permit', captureRequestBody: true }
);
