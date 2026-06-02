import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('tax-documents:read')) return forbidden('tax-documents:read');
    const row = await prisma.taxDocument.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!row) return notFound('Tax document');
    return successItem(row);
  } catch (error: any) {
    return serverError(error, 'fetch tax document');
  }
});
