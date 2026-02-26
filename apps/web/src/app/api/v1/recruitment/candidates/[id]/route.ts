import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/candidates/[id]
 * Get a specific candidate with full details
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            jobPosting: { select: { id: true, title: true, department: true } },
            interviews: {
              select: { id: true, scheduledAt: true, status: true, interviewType: true },
              orderBy: { scheduledAt: 'desc' },
            },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Candidate not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: candidate,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch candidate' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/recruitment/candidates/[id]
 * Update candidate information
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params;
    const body = await request.json();

    const candidate = await prisma.candidate.findUnique({ where: { id } });

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Candidate not found' } },
        { status: 404 }
      );
    }

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        currentTitle: body.currentTitle,
        currentCompany: body.currentCompany,
        experienceYears: body.experienceYears,
        skills: body.skills,
        linkedinUrl: body.linkedinUrl,
        portfolioUrl: body.portfolioUrl,
        expectedSalary: body.expectedSalary,
        noticePeriodDays: body.noticePeriodDays,
        notes: body.notes,
        tags: body.tags,
        updatedAt: new Date(),
        updatedBy: user.id,
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
      { success: false, error: { code: 'E5001', message: 'Failed to update candidate' } },
      { status: 500 }
    );
  }
});
