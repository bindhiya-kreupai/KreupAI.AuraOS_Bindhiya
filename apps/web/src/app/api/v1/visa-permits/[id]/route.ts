import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { visaPermitService } from '@/lib/services/visa-permit.service';

export const dynamic = 'force-dynamic';

const notFound = () =>
  NextResponse.json(
    { success: false, error: { code: 'E4040', message: 'Visa/permit not found' } },
    { status: 404 }
  );

const forbidden = (m: string) =>
  NextResponse.json(
    { success: false, error: { code: 'E4030', message: m, messageAr: 'ممنوع' } },
    { status: 403 }
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
    if (!context.permissions.includes('employee:read')) return forbidden('missing employee:read');
    const id = context.params?.id;
    if (!id) return notFound();
    const item = await visaPermitService.getById(id, context.user.tenantId);
    if (!item) return notFound();
    return NextResponse.json({ success: true, data: item });
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
        const updated = await visaPermitService.update(id, context.user.tenantId, context.user.id, {
          documentNumber: body.documentNumber,
          issuingAuthority: body.issuingAuthority,
          issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
          status: body.status,
          attachmentIds: body.attachmentIds,
          notes: body.notes,
          metadata: body.metadata,
          category: body.category,
        });
        if (!updated) return notFound();
        return NextResponse.json({ success: true, data: updated, message: 'Updated' });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Update failed',
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

export const DELETE = withAudit(
  withEnhancedAuth(
    async (
      _request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params?: { id?: string };
      }
    ) => {
      if (!context.permissions.includes('employee:delete'))
        return forbidden('missing employee:delete');
      const id = context.params?.id;
      if (!id) return notFound();
      const removed = await visaPermitService.softDelete(
        id,
        context.user.tenantId,
        context.user.id
      );
      if (!removed) return notFound();
      return NextResponse.json({ success: true, message: 'Archived' });
    }
  ),
  { action: AuditAction.EMPLOYEE_DELETED, resourceType: 'visa_permit' }
);
