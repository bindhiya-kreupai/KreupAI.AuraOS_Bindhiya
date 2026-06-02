import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('tax-documents:download')) return forbidden('tax-documents:download');
    const row: any = await prisma.taxDocument.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!row) return notFound('Tax document');
    // Return signed URL pointer; actual streaming is handled by the storage layer
    return successItem({
      id: row.id,
      documentType: row.documentType,
      fileName: row.fileName || `${row.documentType}-${row.id}.pdf`,
      downloadUrl: row.downloadUrl || row.storageKey || null,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    return serverError(error, 'fetch download url');
  }
});
