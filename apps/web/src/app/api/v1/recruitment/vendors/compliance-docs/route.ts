import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import {
  assertVendor,
  badRequest,
  forbidden,
  listResponse,
  notFound,
  ok,
  parsePaging,
  serverError,
  toDate,
} from '../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// New-model added via defensive migration; access untyped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorComplianceDoc = (prisma as any).vendorComplianceDoc;

/** GET /api/v1/recruitment/vendors/compliance-docs — tenant-scoped list. */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:read')) return forbidden('read');

    const { page, pageSize, skip, searchParams } = parsePaging(request);
    const vendorId = searchParams.get('vendorId') || undefined;
    const status = searchParams.get('status') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      vendorComplianceDoc.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      vendorComplianceDoc.count({ where }),
    ]);

    return listResponse(items, total, page, pageSize);
  } catch (error) {
    console.error('[Vendor Compliance Docs API] GET Error:', error);
    return serverError('vendor compliance documents');
  }
});

/** POST /api/v1/recruitment/vendors/compliance-docs — create a compliance document. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:create')) return forbidden('create');

    const body = await request.json();
    if (!body?.vendorId || !body?.documentType || !body?.title) {
      return badRequest(
        'vendorId, documentType and title are required',
        'معرّف المورّد ونوع المستند والعنوان مطلوبة'
      );
    }
    if (!(await assertVendor(user.tenantId, body.vendorId))) {
      return notFound('Vendor not found', 'المورّد غير موجود');
    }

    const created = await vendorComplianceDoc.create({
      data: {
        tenantId: user.tenantId,
        vendorId: body.vendorId,
        documentType: String(body.documentType),
        title: String(body.title),
        documentNumber: body.documentNumber ?? null,
        status: body.status ?? 'pending',
        issueDate: toDate(body.issueDate),
        expiryDate: toDate(body.expiryDate),
        documentUrl: body.documentUrl ?? null,
        notes: body.notes ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    return ok(created, 201, 'Compliance document created successfully');
  } catch (error) {
    console.error('[Vendor Compliance Docs API] POST Error:', error);
    return serverError('vendor compliance document');
  }
});
