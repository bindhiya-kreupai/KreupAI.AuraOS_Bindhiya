import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const FieldVisitSchema = z.object({
  employeeId: z.string(),
  visitType: z.enum(['CLIENT_VISIT', 'SITE_VISIT', 'DELIVERY', 'INSPECTION', 'OTHER']),
  clientName: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }),
  checkIn: z.string(),
  checkOut: z.string().optional(),
  purpose: z.string().min(1),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
  distanceTraveled: z.number().optional(),
});

// GET - Fetch field force attendance
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;
      const date = searchParams.get('date');
      const visitType = searchParams.get('visitType');
      const status = searchParams.get('status');

      const mockFieldVisits = [
        {
          id: '1',
          employeeId,
          employeeName: 'John Doe',
          department: 'Sales',
          visitType: 'CLIENT_VISIT',
          clientName: 'ABC Corporation',
          location: {
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'Connaught Place, New Delhi',
          },
          checkIn: '2024-08-26T10:30:00',
          checkOut: '2024-08-26T12:45:00',
          duration: 135, // minutes
          purpose: 'Product demonstration and contract discussion',
          notes: 'Client expressed interest in premium package',
          photos: ['photo1.jpg', 'photo2.jpg'],
          distanceTraveled: 15.5, // km
          status: 'COMPLETED',
          createdAt: '2024-08-26T10:30:00',
        },
        {
          id: '2',
          employeeId,
          employeeName: 'John Doe',
          department: 'Sales',
          visitType: 'SITE_VISIT',
          clientName: 'XYZ Industries',
          location: {
            latitude: 28.5355,
            longitude: 77.3910,
            address: 'Noida Sector 62',
          },
          checkIn: '2024-08-26T14:15:00',
          checkOut: null,
          duration: null,
          purpose: 'Site survey for new installation',
          notes: null,
          photos: ['site1.jpg'],
          distanceTraveled: null,
          status: 'IN_PROGRESS',
          createdAt: '2024-08-26T14:15:00',
        },
        {
          id: '3',
          employeeId,
          employeeName: 'John Doe',
          department: 'Sales',
          visitType: 'DELIVERY',
          clientName: 'DEF Enterprises',
          location: {
            latitude: 28.4595,
            longitude: 77.0266,
            address: 'Gurgaon Cyber City',
          },
          checkIn: '2024-08-25T11:00:00',
          checkOut: '2024-08-25T11:30:00',
          duration: 30,
          purpose: 'Product delivery and setup',
          notes: 'Delivery completed successfully, invoice signed',
          photos: ['delivery1.jpg'],
          distanceTraveled: 22.3,
          status: 'COMPLETED',
          createdAt: '2024-08-25T11:00:00',
        },
      ];

      let filteredData = mockFieldVisits.filter(v => v.employeeId === employeeId);
      if (date) filteredData = filteredData.filter(v => v.checkIn.startsWith(date));
      if (visitType) filteredData = filteredData.filter(v => v.visitType === visitType);
      if (status) filteredData = filteredData.filter(v => v.status === status);

      const summary = {
        total: filteredData.length,
        completed: filteredData.filter(v => v.status === 'COMPLETED').length,
        inProgress: filteredData.filter(v => v.status === 'IN_PROGRESS').length,
        totalDistance: filteredData.reduce((sum, v) => sum + (v.distanceTraveled || 0), 0),
        totalDuration: filteredData.reduce((sum, v) => sum + (v.duration || 0), 0),
        byType: {
          clientVisit: filteredData.filter(v => v.visitType === 'CLIENT_VISIT').length,
          siteVisit: filteredData.filter(v => v.visitType === 'SITE_VISIT').length,
          delivery: filteredData.filter(v => v.visitType === 'DELIVERY').length,
          inspection: filteredData.filter(v => v.visitType === 'INSPECTION').length,
          other: filteredData.filter(v => v.visitType === 'OTHER').length,
        },
      };

      return NextResponse.json({
        success: true,
        data: { visits: filteredData, summary },
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error({ error }, 'Error fetching field force data:');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch field force data' },
        { status: 500 }
      );
    }
  }
);

// POST - Check-in for field visit
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();

      // If action is checkout, update existing visit
      if (body.action === 'checkout') {
        const { visitId, checkOut, notes, photos, distanceTraveled } = body;

        if (!visitId || !checkOut) {
          return NextResponse.json(
            { success: false, error: 'visitId and checkOut are required' },
            { status: 400 }
          );
        }

        const updated = {
          id: visitId,
          checkOut,
          notes,
          photos,
          distanceTraveled,
          status: 'COMPLETED',
          updatedAt: new Date().toISOString(),
        };

        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.userId,
            action: 'UPDATE',
            entityType: 'Attendance - Field Force',
            details: `Checked out from field visit: ${visitId}`,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          },
        });

        return NextResponse.json({ success: true, data: updated });
      }

      // Create new field visit (check-in)
      const data = FieldVisitSchema.parse(body);

      const newVisit = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          entityType: 'Attendance - Field Force',
          details: `Checked in for field visit: ${data.visitType} at ${data.location.address}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newVisit }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, 'Error creating field visit:');
      return NextResponse.json(
        { success: false, error: 'Failed to create field visit' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update field visit
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Visit ID is required' },
          { status: 400 }
        );
      }

      const updated = {
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'UPDATE',
          entityType: 'Attendance - Field Force',
          details: `Updated field visit: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      logger.error({ error }, 'Error updating field visit:');
      return NextResponse.json(
        { success: false, error: 'Failed to update field visit' },
        { status: 500 }
      );
    }
  }
);
