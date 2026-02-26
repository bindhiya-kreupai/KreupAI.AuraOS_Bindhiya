import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/jobs/[id]
 * Get a specific job posting
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;

    const job = await prisma.jobPosting.findFirst({
      where: { id, isDeleted: false },
      include: {
        candidateApplications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            candidate: { select: { id: true, firstName: true, lastName: true } },
          },
          take: 10,
          orderBy: { appliedAt: 'desc' },
        },
        _count: { select: { candidateApplications: true } },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Job posting not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch job posting' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/recruitment/jobs/[id]
 * Update a job posting
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params;
    const body = await request.json();

    const job = await prisma.jobPosting.findFirst({ where: { id, isDeleted: false } });

    if (!job) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Job posting not found' } },
        { status: 404 }
      );
    }

    const updated = await prisma.jobPosting.update({
      where: { id },
      data: {
        title: body.title,
        department: body.department,
        location: body.location,
        type: body.type,
        status: body.status,
        description: body.description,
        channels: body.channels,
        updatedBy: user.id,
        postedDate: body.status === 'Active' && !job.postedDate ? new Date() : job.postedDate,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update job posting' } },
      { status: 500 }
    );
  }
});
