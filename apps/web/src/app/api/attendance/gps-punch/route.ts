/**
 * GPS Punch API Routes
 * GPS-validated attendance punch with geofencing and fraud detection
 *
 * @swagger
 * /api/attendance/gps-punch:
 *   post:
 *     summary: Validate and record GPS-based attendance punch
 *     tags: [Attendance - GPS]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { GPSGeofenceService } from '@/lib/services/attendance/gps-geofence.service';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const GPSPunchSchema = z.object({
  employeeId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().max(180).min(-180),
  accuracy: z.number().optional(),
  altitude: z.number().optional(),
  punchType: z.enum(['IN', 'OUT']),
  deviceId: z.string().optional(),
});

const GeofenceCreateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['circular', 'polygon']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radiusMeters: z.number().optional(),
  polygon: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(),
  isActive: z.boolean().default(true),
});

// GET - Get nearby offices / active geofences
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'geofences';
      const lat = searchParams.get('latitude');
      const lng = searchParams.get('longitude');

      switch (action) {
        case 'geofences': {
          const geofences = await GPSGeofenceService.getActiveGeofences(user.tenantId);
          return NextResponse.json({ success: true, data: geofences });
        }

        case 'nearby': {
          if (!lat || !lng) {
            return NextResponse.json(
              { error: 'Missing latitude/longitude', errorAr: 'خط العرض/الطول مفقود' },
              { status: 400 }
            );
          }
          const nearby = await GPSGeofenceService.getNearbyOffices(
            user.tenantId, parseFloat(lat), parseFloat(lng)
          );
          return NextResponse.json({ success: true, data: nearby });
        }

        default:
          return NextResponse.json(
            { error: `Unknown action: ${action}` },
            { status: 400 }
          );
      }
    } catch (error) {
      logger.error({ error }, 'Error fetching GPS data');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch GPS data' },
        { status: 500 }
      );
    }
  }
);

// POST - Validate GPS punch or create geofence
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const body = await request.json();
      const { action } = body;

      if (action === 'createGeofence') {
        const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
        if (permissionError) return permissionError;

        const data = GeofenceCreateSchema.parse(body);
        return NextResponse.json({
          success: true,
          data: { id: crypto.randomUUID(), ...data, tenantId: user.tenantId, createdAt: new Date().toISOString() },
        }, { status: 201 });
      }

      // Default: validate GPS punch
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const data = GPSPunchSchema.parse(body);
      const result = await GPSGeofenceService.validateGPSPunch(
        user.tenantId,
        data.employeeId,
        data.latitude,
        data.longitude,
        { accuracy: data.accuracy, altitude: data.altitude, deviceId: data.deviceId }
      );

      const status = result.decision === 'BLOCK' ? 403 : 200;
      return NextResponse.json({ success: result.decision !== 'BLOCK', data: result }, { status });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, 'Error processing GPS punch');
      return NextResponse.json(
        { success: false, error: 'Failed to process GPS punch' },
        { status: 500 }
      );
    }
  }
);
