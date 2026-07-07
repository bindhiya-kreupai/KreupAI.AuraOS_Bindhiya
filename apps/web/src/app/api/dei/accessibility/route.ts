import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../_shared';

const db = prisma as any;

/**
 * GET /api/dei/accessibility — list accommodation requests with type counts.
 * POST /api/dei/accessibility — create a new accommodation request for the
 * authenticated employee (employeeId from auth context, not the client).
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;

    const requests = await db.deiAccessibilityRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const counts = { visual: 0, hearing: 0, physical: 0, cognitive: 0, digital: 0, other: 0 };
    for (const r of requests as { requestType: string }[]) {
      if (r.requestType in counts) {
        counts[r.requestType as keyof typeof counts] += 1;
      } else {
        counts.other += 1;
      }
    }

    return NextResponse.json({
      items: requests,
      counts,
      total: requests.length,
      page: 1,
      pageSize: requests.length,
      hasNextPage: false,
    });
  } catch (error) {
    console.error('DEI accessibility GET error:', error);
    return DEI_ERRORS.server();
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, employeeId } = context;
    if (!employeeId) {
      return DEI_ERRORS.badRequest(
        'No employee profile linked to this user',
        'لا يوجد ملف موظف مرتبط'
      );
    }
    const body = await request.json().catch(() => ({}));
    if (!body.title || typeof body.title !== 'string') {
      return DEI_ERRORS.badRequest('Request title is required', 'عنوان الطلب مطلوب');
    }

    const req = await db.deiAccessibilityRequest.create({
      data: {
        tenantId: user.tenantId,
        employeeId,
        requestType: body.requestType || 'physical',
        title: body.title,
        description: body.description ?? null,
        status: 'pending',
      },
    });

    return NextResponse.json(
      { success: true, data: req, message: 'Request submitted', messageAr: 'تم تقديم الطلب' },
      { status: 201 }
    );
  } catch (error) {
    console.error('DEI accessibility POST error:', error);
    return DEI_ERRORS.server();
  }
});
