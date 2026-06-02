import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { safeJson, serverError, successItem, validationError } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user } = context;
    let prefs = await prisma.userPreferences.findUnique({ where: { userId: user.userId } });
    if (!prefs) {
      prefs = await prisma.userPreferences.create({
        data: { userId: user.userId, tenantId: user.tenantId, prefs: {} },
      });
    }
    return successItem(prefs);
  } catch (error: any) {
    return serverError(error, 'fetch dashboard preferences');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const updated = await prisma.userPreferences.upsert({
      where: { userId: user.userId },
      create: { userId: user.userId, tenantId: user.tenantId, prefs: body },
      update: { prefs: body },
    });
    return successItem(updated);
  } catch (error: any) {
    return serverError(error, 'update dashboard preferences');
  }
});
