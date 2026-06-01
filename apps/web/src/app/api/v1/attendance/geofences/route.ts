export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

/**
 * GET /api/v1/attendance/geofences
 * List all geofence locations for the tenant
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('attendance:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing attendance:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const tenantId = context.user.tenantId;

    const geofences = await prisma.geofenceLocation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = geofences.map((g) => ({
      id: g.id,
      name: g.name,
      lat: g.latitude,
      lng: g.longitude,
      radius: g.radius,
      address: g.address,
      isActive: g.isActive,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        geofences: mapped,
        total: mapped.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Geofences API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch geofences',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});

/**
 * POST /api/v1/attendance/geofences
 * Create a new geofence location
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  const { permissions } = context;
  if (!permissions.includes('attendance:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing attendance:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const tenantId = context.user.tenantId;
    const body = await request.json();

    if (!body.name || body.lat === undefined || body.lng === undefined || !body.radius) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'name, lat, lng, and radius are required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    const geofence = await prisma.geofenceLocation.create({
      data: {
        tenantId,
        name: body.name,
        latitude: body.lat,
        longitude: body.lng,
        radius: body.radius,
        address: body.address || null,
        isActive: true,
      },
    });

    const mapped = {
      id: geofence.id,
      name: geofence.name,
      lat: geofence.latitude,
      lng: geofence.longitude,
      radius: geofence.radius,
      address: geofence.address,
      isActive: geofence.isActive,
      createdAt: geofence.createdAt.toISOString(),
      updatedAt: geofence.updatedAt.toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mapped,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('[Geofences API] POST Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create geofence',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
});
