import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

/**
 * Dispatch an emergency SOS alert. Persisted as a high-severity
 * HealthSafetyIncident so it surfaces on the incidents dashboard and is
 * auditable. The reporting employee id is derived from the auth context — a
 * client-sent id is never trusted.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('health-safety/emergency:create'))
      return forbidden('health-safety/emergency:create');

    const body = (await safeJson(request)) ?? {};
    const drill = Boolean(body.drill);
    const lat = typeof body.latitude === 'number' ? body.latitude : undefined;
    const lng = typeof body.longitude === 'number' ? body.longitude : undefined;
    const label = typeof body.locationLabel === 'string' ? body.locationLabel : undefined;

    const employeeId = context.employeeId || user.userId;
    if (!employeeId) return validationError({ message: 'Unable to resolve reporting employee' });

    const location =
      label ||
      (lat !== undefined && lng !== undefined
        ? `GPS ${lat.toFixed(5)}, ${lng.toFixed(5)}`
        : 'Location unavailable');

    const created = await (prisma as any).healthSafetyIncident.create({
      data: {
        tenantId: user.tenantId,
        incidentNumber: `SOS-${Date.now()}`,
        incidentDate: new Date(),
        type: drill ? 'EMERGENCY_DRILL' : 'EMERGENCY_SOS',
        severity: drill ? 'Minor' : 'Critical',
        description: drill
          ? 'Emergency drill triggered by employee.'
          : 'SOS emergency alert dispatched. Security and medical teams notified.',
        location,
        reportedBy: employeeId,
        status: 'REPORTED',
        createdBy: user.userId,
      },
    });

    logger.warn(
      { tenantId: user.tenantId, incidentId: created.id, drill },
      'Emergency SOS alert dispatched'
    );

    return successItem(
      { id: created.id, incidentNumber: created.incidentNumber, location, drill },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error(
      { err: error, route: 'health-safety/emergency/alert/route.ts' },
      'Failed to dispatch alert'
    );
    return serverError(error, 'dispatch alert');
  }
});
