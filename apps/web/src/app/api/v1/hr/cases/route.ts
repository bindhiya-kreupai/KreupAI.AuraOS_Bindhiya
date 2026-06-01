import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/hr/cases
 * List Employee Relations (ER) cases
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('hr/cases:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing hr/cases:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined;
    const caseType = searchParams.get('caseType') || undefined;
    const employeeId = searchParams.get('employeeId') || undefined;
    const assignedTo = searchParams.get('assignedTo') || undefined;
    const priority = searchParams.get('priority') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;
    if (caseType) where.caseType = caseType;
    if (employeeId) where.employeeId = employeeId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (priority) where.priority = priority;

    const [data, total] = await Promise.all([
      prisma.eRCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        },
      }),
      prisma.eRCase.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[HR Cases API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch ER cases' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/hr/cases
 * Create a new ER case
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('hr/cases:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing hr/cases:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.employeeId || !body.caseType || !body.subject) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'employeeId, caseType and subject are required' },
        },
        { status: 400 }
      );
    }

    const caseNumber = `ER-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const erCase = await prisma.eRCase.create({
      data: {
        tenantId: user.tenantId,
        caseNumber,
        employeeId: body.employeeId,
        caseType: body.caseType,
        subject: body.subject,
        description: body.description || null,
        priority: body.priority || 'MEDIUM',
        status: 'OPEN',
        assignedTo: body.assignedTo || user.id,
        reportedBy: user.id,
        incidentDate: body.incidentDate ? new Date(body.incidentDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        isConfidential: body.isConfidential ?? false,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: erCase,
        message: 'ER case created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[HR Cases API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create ER case',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
