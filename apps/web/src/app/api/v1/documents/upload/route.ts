import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('documents:create')) return forbidden('documents:create');
    const body = await safeJson(request);
    if (!body?.fileName || !body?.storageKey)
      return validationError({ message: 'fileName + storageKey required' });
    const row = await prisma.documentUpload.create({
      data: {
        tenantId: user.tenantId,
        uploadedById: user.userId,
        fileName: body.fileName,
        contentType: body.contentType || null,
        sizeBytes: body.sizeBytes || 0,
        storageKey: body.storageKey,
        metadata: body.metadata || null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return successItem(row, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'register upload');
  }
});
