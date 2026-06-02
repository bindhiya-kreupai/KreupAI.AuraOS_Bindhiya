import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/employees/[id]/emergency-contacts
 * List emergency contacts for an employee
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('employees:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employees:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const employeeId = pathParts[pathParts.indexOf('employees') + 1];

    const { searchParams } = url;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Verify employee belongs to this tenant
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, company: { tenantId: user.tenantId } },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 404 }
      );
    }

    const [contacts, total] = await Promise.all([
      prisma.emergencyContact.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId,
        },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.emergencyContact.count({
        where: {
          tenantId: user.tenantId,
          employeeId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Emergency Contacts API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch emergency contacts',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/employees/[id]/emergency-contacts
 * Create a new emergency contact for an employee
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('employees:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employees:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const employeeId = pathParts[pathParts.indexOf('employees') + 1];

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.relationship || !body.phone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Fields name, relationship, and phone are required',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    // Verify employee belongs to this tenant
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, company: { tenantId: user.tenantId } },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 404 }
      );
    }

    // If this contact is marked as primary, unset any existing primary contact
    if (body.isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: {
          tenantId: user.tenantId,
          employeeId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const newContact = await prisma.emergencyContact.create({
      data: {
        tenantId: user.tenantId,
        employeeId,
        name: body.name,
        relationship: body.relationship,
        isPrimary: body.isPrimary || false,
        phone: body.phone,
        alternatePhone: body.alternatePhone || null,
        email: body.email || null,
        address: body.address
          ? typeof body.address === 'string'
            ? body.address
            : JSON.stringify(body.address)
          : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newContact,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Emergency Contacts API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create emergency contact',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
