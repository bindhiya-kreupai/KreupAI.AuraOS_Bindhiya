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

// Haversine in km
function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('attendance:punch')) return forbidden('attendance:punch');
    const body = await safeJson(request);
    if (typeof body?.latitude !== 'number' || typeof body?.longitude !== 'number') {
      return validationError({ message: 'latitude + longitude required' });
    }
    const fences = await prisma.geofenceConfig.findMany({
      where: { tenantId: user.tenantId, isActive: true, isDeleted: false } as any,
    });
    const matches = fences
      .map((f: any) => {
        const d = distance(f.latitude, f.longitude, body.latitude, body.longitude) * 1000;
        return {
          id: f.id,
          name: f.name,
          distanceMeters: d,
          radiusMeters: f.radiusMeters,
          withinRadius: d <= f.radiusMeters,
        };
      })
      .filter((m) => m.withinRadius);
    return successItem({ valid: matches.length > 0, matches, totalFences: fences.length });
  } catch (error: any) {
    return serverError(error, 'validate geofence');
  }
});
