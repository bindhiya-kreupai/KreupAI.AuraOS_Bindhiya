import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

const ROSTER_STATUS_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED: ['CONFIRMED', 'CANCELLED', 'SWAPPED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'SWAPPED'],
  OPEN: ['SCHEDULED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: ['SCHEDULED'],
  SWAPPED: [],
};

const UPDATABLE_ROSTER_FIELDS = [
  'shiftId',
  'rosterDate',
  'customStartTime',
  'customEndTime',
  'isWeekOff',
  'isHoliday',
  'status',
] as const;

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('attendance:read')) return forbidden('attendance:read');
    const row = await prisma.shiftRoster.findFirst({
      where: { id: params.id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!row) return notFound('Schedule');
    return successItem(row);
  } catch (error: any) {
    return serverError(error, 'fetch schedule');
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('attendance:write')) return forbidden('attendance:write');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });

    // Only allow known fields to be updated (prevents mass-assignment)
    const updateData: Record<string, unknown> = {};
    for (const key of UPDATABLE_ROSTER_FIELDS) {
      if (key in body) updateData[key] = body[key];
    }

    if (Object.keys(updateData).length === 0) {
      return validationError({ message: 'No valid fields to update' });
    }

    // Enforce roster status state machine
    if (updateData.status) {
      const existing = await prisma.shiftRoster.findFirst({
        where: { id: params.id, tenantId: user.tenantId, isDeleted: false },
      });
      if (!existing) return notFound('Schedule');

      const newStatus = updateData.status as string;
      const currentStatus = existing.status;
      const allowed = ROSTER_STATUS_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(newStatus)) {
        return validationError({
          message: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed: ${allowed.length > 0 ? allowed.join(', ') : 'none'}`,
        });
      }
    }

    if (updateData.rosterDate) {
      updateData.rosterDate = new Date(updateData.rosterDate as string);
    }

    const result = await prisma.shiftRoster.updateMany({
      where: { id: params.id, tenantId: user.tenantId, isDeleted: false },
      data: { ...updateData, updatedBy: user.userId || user.id } as any,
    });
    if (result.count === 0) return notFound('Schedule');
    const updated = await prisma.shiftRoster.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    return successItem(updated);
  } catch (error: any) {
    return serverError(error, 'update schedule');
  }
});

export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('attendance:write')) return forbidden('attendance:write');
    // Soft delete instead of hard delete — preserves audit trail
    const result = await prisma.shiftRoster.updateMany({
      where: { id: params.id, tenantId: user.tenantId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date(), status: 'CANCELLED' },
    });
    if (result.count === 0) return notFound('Schedule');
    return successItem({ deleted: true, id: params.id });
  } catch (error: any) {
    return serverError(error, 'delete schedule');
  }
});
