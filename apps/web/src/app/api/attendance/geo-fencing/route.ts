import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const GeoFenceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['OFFICE', 'BRANCH', 'SITE', 'CUSTOM']),
  latitude: z.number(),
  longitude: z.number(),
  radiusMeters: z.number(),
  address: z.string().optional(),
  allowedEmployees: z.array(z.string()).optional(),
  allowedDepartments: z.array(z.string()).optional(),
  allowedDesignations: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  strictMode: z.boolean().default(false), // If true, punch outside fence is rejected
});

// GET - Fetch geo-fences
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type');
      const isActive = searchParams.get('isActive');

      const mockGeoFences = [
        {
          id: '1',
          name: 'Head Office',
          description: 'Main office location in downtown',
          type: 'OFFICE',
          latitude: 28.6139,
          longitude: 77.2090,
          radiusMeters: 200,
          address: 'Connaught Place, New Delhi, India',
          allowedEmployees: [],
          allowedDepartments: ['ALL'],
          isActive: true,
          strictMode: false,
          totalEmployees: 250,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        },
        {
          id: '2',
          name: 'Branch Office - Bangalore',
          description: 'South India operations branch',
          type: 'BRANCH',
          latitude: 12.9716,
          longitude: 77.5946,
          radiusMeters: 150,
          address: 'MG Road, Bangalore, India',
          allowedEmployees: [],
          allowedDepartments: ['Engineering', 'Sales'],
          isActive: true,
          strictMode: true,
          totalEmployees: 85,
          createdAt: '2024-02-01T00:00:00',
          updatedAt: '2024-02-01T00:00:00',
        },
        {
          id: '3',
          name: 'Construction Site - Project Alpha',
          description: 'Temporary site for ongoing project',
          type: 'SITE',
          latitude: 19.0760,
          longitude: 72.8777,
          radiusMeters: 500,
          address: 'Andheri, Mumbai, India',
          allowedDepartments: ['Construction', 'Site Management'],
          isActive: true,
          strictMode: false,
          totalEmployees: 45,
          createdAt: '2024-03-15T00:00:00',
          updatedAt: '2024-03-15T00:00:00',
        },
        {
          id: '4',
          name: 'Client Site - TechCorp',
          description: 'On-site deployment team location',
          type: 'CUSTOM',
          latitude: 22.5726,
          longitude: 88.3639,
          radiusMeters: 100,
          address: 'Salt Lake, Kolkata, India',
          allowedDesignations: ['Consultant', 'Project Manager'],
          isActive: true,
          strictMode: true,
          totalEmployees: 12,
          createdAt: '2024-04-01T00:00:00',
          updatedAt: '2024-04-01T00:00:00',
        },
      ];

      let filteredData = mockGeoFences;
      if (type) filteredData = filteredData.filter(g => g.type === type);
      if (isActive !== null) filteredData = filteredData.filter(g => g.isActive === (isActive === 'true'));

      const summary = {
        total: filteredData.length,
        active: filteredData.filter(g => g.isActive).length,
        inactive: filteredData.filter(g => !g.isActive).length,
        byType: {
          office: filteredData.filter(g => g.type === 'OFFICE').length,
          branch: filteredData.filter(g => g.type === 'BRANCH').length,
          site: filteredData.filter(g => g.type === 'SITE').length,
          custom: filteredData.filter(g => g.type === 'CUSTOM').length,
        },
        totalCoverage: filteredData.reduce((sum, g) => sum + (g.totalEmployees || 0), 0),
      };

      return NextResponse.json({
        success: true,
        data: { geoFences: filteredData, summary },
        meta: { total: filteredData.length },
      });
    } catch {
      logger.error('Error fetching geo-fences:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch geo-fences' },
        { status: 500 }
      );
    }
  }
);

// POST - Create geo-fence or validate location
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();

      // If action is validate, check if location is within any geo-fence
      if (body.action === 'validate') {
        const { latitude, longitude, employeeId } = body;

        if (!latitude || !longitude) {
          return NextResponse.json(
            { success: false, error: 'latitude and longitude are required' },
            { status: 400 }
          );
        }

        // Mock validation - calculate distance using Haversine formula
        const mockGeoFence = {
          id: '1',
          name: 'Head Office',
          latitude: 28.6139,
          longitude: 77.2090,
          radiusMeters: 200,
        };

        const R = 6371e3; // Earth's radius in meters
        const φ1 = (latitude * Math.PI) / 180;
        const φ2 = (mockGeoFence.latitude * Math.PI) / 180;
        const Δφ = ((mockGeoFence.latitude - latitude) * Math.PI) / 180;
        const Δλ = ((mockGeoFence.longitude - longitude) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in meters

        const isWithinFence = distance <= mockGeoFence.radiusMeters;

        return NextResponse.json({
          success: true,
          data: {
            isValid: isWithinFence,
            distance: Math.round(distance),
            geoFence: isWithinFence ? mockGeoFence : null,
            message: isWithinFence
              ? 'Location is within allowed geo-fence'
              : `Location is ${Math.round(distance - mockGeoFence.radiusMeters)}m outside the nearest geo-fence`,
          },
        });
      }

      // Create new geo-fence
      const data = GeoFenceSchema.parse(body);

      const newGeoFence = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Attendance - Geo-Fencing',
          details: `Created geo-fence: ${data.name}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newGeoFence }, { status: 201 });
    } catch {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating geo-fence:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create geo-fence' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update geo-fence
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Geo-fence ID is required' },
          { status: 400 }
        );
      }

      const updated = {
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'UPDATE',
          module: 'Attendance - Geo-Fencing',
          details: `Updated geo-fence: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch {
      logger.error('Error updating geo-fence:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update geo-fence' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete geo-fence
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Geo-fence ID is required' },
          { status: 400 }
        );
      }

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'DELETE',
          module: 'Attendance - Geo-Fencing',
          details: `Deleted geo-fence: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, message: 'Geo-fence deleted successfully' });
    } catch {
      logger.error('Error deleting geo-fence:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete geo-fence' },
        { status: 500 }
      );
    }
  }
);
