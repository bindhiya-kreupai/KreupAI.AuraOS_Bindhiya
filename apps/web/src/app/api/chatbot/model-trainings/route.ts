import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    return successList([], 1, 20, 0);
  } catch (error: any) {
    return serverError(error, 'list model trainings');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { tenantId, userId } = context.user;
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Request body required' });
    const record = {
      id: crypto.randomUUID(),
      tenantId,
      datasetId: body.datasetId ?? null,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
    };
    return successItem(record, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'create model training');
  }
});
