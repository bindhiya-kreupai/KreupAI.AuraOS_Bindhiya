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
    if (!permissions.includes('benefits:life-event')) return forbidden('benefits:life-event');
    const body = await safeJson(request);
    if (!body?.eventType || !body?.eventDate)
      return validationError({ message: 'eventType + eventDate required' });
    const event: any = await (prisma as any).qualifyingEvent.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId || user.userId,
        eventType: body.eventType,
        eventDate: new Date(body.eventDate),
        description: body.description || null,
        supportingDocumentIds: body.documentIds || [],
        status: 'PENDING_REVIEW',
      },
    });
    return successItem(event, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'register life event');
  }
});
