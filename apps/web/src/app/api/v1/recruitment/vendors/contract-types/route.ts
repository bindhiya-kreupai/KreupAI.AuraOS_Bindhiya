import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import {
  badRequest,
  forbidden,
  listResponse,
  ok,
  parsePaging,
  serverError,
} from '../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorContractType = (prisma as any).vendorContractType;

function generateCode() {
  return `VCT-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

/** GET /api/v1/recruitment/vendors/contract-types — tenant-scoped list of templates. */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:read')) return forbidden('read');

    const { page, pageSize, skip, searchParams } = parsePaging(request);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (activeOnly) where.isActive = true;

    const [items, total] = await Promise.all([
      vendorContractType.findMany({ where, skip, take: pageSize, orderBy: { name: 'asc' } }),
      vendorContractType.count({ where }),
    ]);

    return listResponse(items, total, page, pageSize);
  } catch (error) {
    console.error('[Vendor Contract Types API] GET Error:', error);
    return serverError('vendor contract types');
  }
});

/** POST /api/v1/recruitment/vendors/contract-types — create a contract type template. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:create')) return forbidden('create');

    const body = await request.json();
    if (!body?.name) {
      return badRequest('name is required', 'الاسم مطلوب');
    }

    const created = await vendorContractType.create({
      data: {
        tenantId: user.tenantId,
        code: body.code || generateCode(),
        name: String(body.name),
        engagementModel: body.engagementModel ?? 'staff_augmentation',
        noticePeriodDays: Number(body.noticePeriodDays ?? 30),
        paymentTermsDays: Number(body.paymentTermsDays ?? 30),
        description: body.description ?? null,
        isActive: body.isActive ?? true,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    return ok(created, 201, 'Contract type created successfully');
  } catch (error) {
    console.error('[Vendor Contract Types API] POST Error:', error);
    return serverError('vendor contract type');
  }
});
