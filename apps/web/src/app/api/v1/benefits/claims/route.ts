import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/benefits/claims
 * List benefit claims with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/claims:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/claims:read permission',
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

    const employeeId = searchParams.get('employeeId') || undefined;
    const status = searchParams.get('status') || undefined;
    const planId = searchParams.get('planId') || undefined;
    const claimType = searchParams.get('claimType') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (planId) where.planId = planId;
    if (claimType) where.claimType = claimType;

    const [data, total] = await Promise.all([
      prisma.benefitClaim.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
          plan: { select: { id: true, planName: true, category: true } },
        },
      }),
      prisma.benefitClaim.count({ where }),
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
    console.error('[Benefits Claims API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch benefit claims' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/benefits/claims
 * Submit a new benefit claim
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/claims:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/claims:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.employeeId || !body.planId || !body.claimType || !body.amount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'employeeId, planId, claimType and amount are required',
          },
        },
        { status: 400 }
      );
    }

    // Verify employee is enrolled in this plan
    const enrollment = await prisma.benefitEnrollment.findFirst({
      where: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        planId: body.planId,
        status: 'ACTIVE',
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: 'Employee is not actively enrolled in this benefit plan',
          },
        },
        { status: 422 }
      );
    }

    const claimNumber = `CLM-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const claim = await prisma.benefitClaim.create({
      data: {
        tenantId: user.tenantId,
        claimNumber,
        employeeId: body.employeeId,
        planId: body.planId,
        enrollmentId: enrollment.id,
        claimType: body.claimType,
        claimDate: body.claimDate ? new Date(body.claimDate) : new Date(),
        serviceDate: body.serviceDate ? new Date(body.serviceDate) : new Date(),
        amount: body.amount,
        description: body.description || null,
        providerName: body.providerName || null,
        receiptUrls: body.receiptUrls || [],
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submittedBy: user.id,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        plan: { select: { id: true, planName: true, category: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: claim,
        message: 'Benefit claim submitted successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Benefits Claims API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to submit benefit claim',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
