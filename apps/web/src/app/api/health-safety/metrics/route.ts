import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

const CLOSED_STATUSES = ['RESOLVED', 'CLOSED'];

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('health-safety/incidents:read'))
      return forbidden('health-safety/incidents:read');
    const where = { tenantId: user.tenantId };

    const [incidents, totalCheckups, totalContacts, totalTrainings, lastIncident] =
      await Promise.all([
        (prisma as any).healthSafetyIncident.findMany({
          where,
          select: { status: true, incidentDate: true },
        }),
        (prisma as any).healthSafetyCheckup.count({ where }),
        (prisma as any).healthSafetyEmergencyContact.count({ where }),
        (prisma as any).healthSafetyTraining.count({ where }),
        (prisma as any).healthSafetyIncident.findFirst({
          where,
          orderBy: { incidentDate: 'desc' },
          select: { incidentDate: true },
        }),
      ]);

    const totalIncidents = incidents.length;
    const closedIncidents = incidents.filter((i: any) => CLOSED_STATUSES.includes(i.status)).length;
    const openIncidents = totalIncidents - closedIncidents;
    const resolutionRate =
      totalIncidents > 0 ? Math.round((closedIncidents / totalIncidents) * 100) : 0;

    let daysWithoutIncident = 0;
    if (lastIncident?.incidentDate) {
      const diffMs = Date.now() - new Date(lastIncident.incidentDate).getTime();
      daysWithoutIncident = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    return successItem({
      totalIncidents,
      openIncidents,
      closedIncidents,
      resolutionRate,
      daysWithoutIncident,
      totalCheckups,
      totalContacts,
      totalTrainings,
    });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'health-safety/metrics/route.ts' },
      'Failed to compute metrics'
    );
    return serverError(error, 'compute metrics');
  }
});
