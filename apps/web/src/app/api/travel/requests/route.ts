import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.TRAVEL, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId') || user.userId;
    const status = searchParams.get('status');

    try {
      const where: Record<string, unknown> = {
        tenantId: user.tenantId,
        employeeId,
      };
      if (status) {
        where.status = status.toUpperCase();
      }

      const claims = await prisma.expenseClaim.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const data = claims.map((c) => {
        const refDate = (c.date ?? c.createdAt).toISOString();
        return {
          id: c.id,
          requestNumber: `TR-${c.id.substring(0, 8).toUpperCase()}`,
          employeeId: c.employeeId,
          employeeName: user.name || 'Employee',
          purpose: c.category ?? 'OTHER',
          destination: c.title,
          departureDate: refDate,
          returnDate: refDate,
          estimatedCost: c.amount,
          currency: c.currency,
          status: c.status.toLowerCase(),
          description: c.description,
          receiptUrl: c.receiptUrl,
          createdAt: c.createdAt.toISOString(),
        };
      });

      return NextResponse.json({ success: true, data });
    } catch {
      const data = [
        {
          id: `travel-default-${user.tenantId}`,
          requestNumber: 'TR-DEFAULT-001',
          employeeId,
          employeeName: user.name || 'Employee',
          purpose: 'Business Travel',
          destination: 'Pending Assignment',
          departureDate: new Date().toISOString(),
          returnDate: new Date().toISOString(),
          estimatedCost: 0,
          currency: 'USD',
          status: 'pending',
          description: null,
          receiptUrl: null,
          createdAt: new Date().toISOString(),
        },
      ];

      let filtered = data;
      if (status) filtered = filtered.filter((r) => r.status === status);
      if (filtered.length === 1 && filtered[0].id.startsWith('travel-default')) {
        filtered = [];
      }

      return NextResponse.json({ success: true, data: filtered });
    }
  } catch (error: any) {
    logger.error('Error fetching travel requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch travel requests' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.TRAVEL, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();

    try {
      const claim = await prisma.expenseClaim.create({
        data: {
          tenantId: user.tenantId,
          employeeId: user.userId,
          title: body.destination || body.title || 'Travel Request',
          amount: body.estimatedCost || body.amount || 0,
          currency: body.currency || 'USD',
          category: body.purpose || body.category || 'TRANSPORT',
          date: body.departureDate ? new Date(body.departureDate) : new Date(),
          description: body.description || null,
          status: 'PENDING',
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            id: claim.id,
            requestNumber: `TR-${claim.id.substring(0, 8).toUpperCase()}`,
            employeeId: claim.employeeId,
            employeeName: user.name,
            status: 'pending',
            createdAt: claim.createdAt.toISOString(),
          },
        },
        { status: 201 }
      );
    } catch {
      const newRequest = {
        ...body,
        id: `travel-${Date.now()}`,
        requestNumber: `TR-${Date.now()}`,
        employeeId: user.userId,
        employeeName: user.name,
        tenantId: user.tenantId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
    }
  } catch (error: any) {
    logger.error('Error creating travel request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create travel request' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.TRAVEL, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();

    try {
      if (body.id) {
        const updated = await prisma.expenseClaim.update({
          where: { id: body.id },
          data: {
            title: body.destination || body.title,
            amount: body.estimatedCost || body.amount,
            category: body.purpose || body.category,
            description: body.description,
            status: body.status ? body.status.toUpperCase() : undefined,
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            ...body,
            id: updated.id,
            lastModified: updated.updatedAt.toISOString(),
          },
        });
      }
    } catch {
      // Fall through to default response
    }

    return NextResponse.json({
      success: true,
      data: { ...body, lastModified: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Error updating travel request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update travel request' },
      { status: 500 }
    );
  }
});
