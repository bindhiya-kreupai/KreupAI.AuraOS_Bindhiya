import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// Exit surveys are derived from ExitRequest data. Since no dedicated
// ExitSurvey model exists, survey responses are associated with the
// exit request. Future model additions can extend this.

// ===== GET Handler =====
export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
    };

    const offboardingId = searchParams.get('offboardingId');
    if (offboardingId) where.id = offboardingId;

    const status = searchParams.get('status');
    if (status) where.status = status.toUpperCase();

    const exitRequests = await prisma.exitRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const surveys = exitRequests.map((req) => ({
      id: `SURV-${req.id}`,
      offboardingId: req.id,
      employeeId: req.employeeId,
      employeeName: req.employee
        ? `${req.employee.firstName} ${req.employee.lastName}`
        : '',
      sentDate: req.createdAt.toISOString(),
      completedDate: req.status === 'COMPLETED'
        ? req.updatedAt.toISOString()
        : null,
      status: req.status === 'COMPLETED' ? 'completed' : 'sent',
      surveyType: 'standard' as const,
      isAnonymous: false,
      questions: [],
      overallRating: null,
      wouldReturn: req.rehireEligible,
      wouldRecommend: req.rehireEligible,
      npsScore: null,
      comments: req.reason || '',
    }));

    return NextResponse.json(
      { success: true, surveys },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching exit surveys:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exit surveys' },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    const survey = {
      id: body.id || `SURV-${body.offboardingId || Date.now()}`,
      offboardingId: body.offboardingId,
      employeeId: body.employeeId,
      employeeName: body.employeeName || '',
      sentDate: new Date().toISOString(),
      status: 'sent',
      surveyType: body.surveyType || 'standard',
      isAnonymous: body.isAnonymous ?? false,
      questions: body.questions || [],
      createdDate: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, survey },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating exit survey:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create exit survey' },
      { status: 500 }
    );
  }
});

// ===== PUT Handler =====
export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    // If submitting survey results, update the associated exit request
    const exitRequestId = id.startsWith('SURV-')
      ? id.replace('SURV-', '')
      : id;

    if (updates.status === 'completed' || updates.comments) {
      const existing = await prisma.exitRequest.findFirst({
        where: { id: exitRequestId, tenantId: user.tenantId },
      });

      if (existing && updates.comments) {
        await prisma.exitRequest.update({
          where: { id: exitRequestId },
          data: {
            reason: updates.comments || existing.reason,
          },
        });
      }
    }

    const survey = {
      id,
      offboardingId: exitRequestId,
      ...updates,
      lastModified: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, survey },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating exit survey:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update exit survey' },
      { status: 500 }
    );
  }
});
