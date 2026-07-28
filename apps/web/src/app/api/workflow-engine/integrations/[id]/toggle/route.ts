import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const POST = createProtectedRoute(
  async (_request: NextRequest, { params, auth }) => {
    const definition = await prisma.workflowDefinition.findFirst({
      where: {
        id: params.id as string,
        tenantId: auth!.tenantId,
        isDeleted: false,
        processType: 'INTEGRATION',
      },
    });
    if (!definition) return { success: false, error: 'Integration not found', status: 404 };

    const newActive = !definition.isActive;
    const updated = await prisma.workflowDefinition.update({
      where: { id: definition.id },
      data: {
        isActive: newActive,
        status: newActive ? 'ACTIVE' : 'DRAFT',
        updatedBy: auth!.userId,
        updatedAt: new Date(),
      },
    });

    return { success: true, data: { ...updated, isActive: newActive } };
  },
  { requiredPermissions: ['workflow:write'], rateLimit: 'API_USER' }
);
