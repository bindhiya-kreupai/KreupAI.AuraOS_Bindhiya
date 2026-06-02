import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('benefits:providers:read'))
      return forbidden('benefits:providers:read');
    const provider = await prisma.healthcareProvider.findFirst({
      where: { tenantId: user.tenantId, OR: [{ npiNumber: params.npi }, { id: params.npi }] },
    });
    if (!provider) return notFound('Provider');
    return successItem(provider);
  } catch (error: any) {
    return serverError(error, 'fetch provider');
  }
});
