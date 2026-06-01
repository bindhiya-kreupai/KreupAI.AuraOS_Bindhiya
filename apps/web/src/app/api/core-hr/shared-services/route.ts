import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createSharedServiceRequestSchema = z.object({
  category: z.enum(['hr_letter', 'it_access', 'equipment', 'travel', 'other']),
  subject: z.string().min(1, 'Subject is required'),
  details: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedToId: z.string().uuid().optional().nullable(),
});

function mapSharedServiceRequest(request: any) {
  return {
    requestId: request.id,
    requestorId: request.requestorId,
    requestorName:
      request.requestor?.firstName && request.requestor?.lastName
        ? `${request.requestor.firstName} ${request.requestor.lastName}`
        : request.requestorName || 'Unknown Requestor',
    category: String(request.category || 'OTHER').toLowerCase(),
    subject: request.subject,
    details: request.details || undefined,
    priority: String(request.priority || 'MEDIUM').toLowerCase(),
    status: String(request.status || 'OPEN').toLowerCase(),
    assignedToId: request.assignedToId || undefined,
    assignedToName:
      request.assignedTo?.firstName && request.assignedTo?.lastName
        ? `${request.assignedTo.firstName} ${request.assignedTo.lastName}`
        : undefined,
    createdDate: new Date(request.createdAt),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status.toUpperCase();
    if (category) where.category = category.toUpperCase();

    const [requests, total] = await Promise.all([
      prisma.sharedServiceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requestor: { select: { id: true, firstName: true, lastName: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.sharedServiceRequest.count({ where }),
    ]);

    return NextResponse.json(
      {
        requests: requests.map(mapSharedServiceRequest),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/core-hr/shared-services error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, employeeId } = context;

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee context is required' }, { status: 400 });
    }

    const body = await request.json();
    const validation = createSharedServiceRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;

    const created = await prisma.sharedServiceRequest.create({
      data: {
        tenantId: user.tenantId,
        requestorId: employeeId,
        category: data.category.toUpperCase(),
        subject: data.subject,
        details: data.details,
        priority: (data.priority || 'medium').toUpperCase(),
        status: 'OPEN',
        assignedToId: data.assignedToId ?? undefined,
      },
      include: {
        requestor: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ request: mapSharedServiceRequest(created) }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/core-hr/shared-services error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});