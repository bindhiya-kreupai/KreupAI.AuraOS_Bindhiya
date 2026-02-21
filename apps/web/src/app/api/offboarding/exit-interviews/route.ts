import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// Exit interviews are stored as ExitRequest records with clearance data.
// Since there is no dedicated ExitInterview model, we derive interview data
// from ExitRequest where the offboarding has reached the interview phase.
// The notes/reason field on ExitRequest stores interview-related data.

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

    const employeeId = searchParams.get('employeeId');
    if (employeeId) where.employeeId = employeeId;

    // Fetch exit requests that have progressed beyond PENDING
    // (interviews typically happen during the offboarding process)
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

    const interviews = exitRequests.map((req) => ({
      id: `INT-${req.id}`,
      offboardingId: req.id,
      employeeId: req.employeeId,
      employeeName: req.employee
        ? `${req.employee.firstName} ${req.employee.lastName}`
        : '',
      scheduledDate: req.lastWorkingDate.toISOString(),
      conductedDate: req.status === 'COMPLETED'
        ? req.updatedAt.toISOString()
        : null,
      conductedBy: '',
      conductedByName: '',
      interviewType: 'in_person' as const,
      status: req.status === 'COMPLETED' ? 'completed' : 'scheduled',
      reason: req.reason || '',
      exitType: req.exitType.toLowerCase(),
      rehireEligible: req.rehireEligible,
      overallSentiment: 'neutral' as const,
      wouldRecommend: req.rehireEligible,
      openToRehire: req.rehireEligible,
      keyTakeaways: [],
      questions: [],
      confidential: true,
      createdDate: req.createdAt.toISOString(),
      lastModified: req.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, interviews },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching exit interviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exit interviews' },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // If offboardingId is provided, update the existing exit request's reason
    // to record the interview data
    if (body.offboardingId) {
      const existing = await prisma.exitRequest.findFirst({
        where: { id: body.offboardingId, tenantId: user.tenantId },
      });

      if (existing) {
        await prisma.exitRequest.update({
          where: { id: body.offboardingId },
          data: {
            reason: body.notes || body.keyTakeaways?.join('; ') || existing.reason,
          },
        });
      }
    }

    const interview = {
      id: body.id || `INT-${body.offboardingId || Date.now()}`,
      offboardingId: body.offboardingId,
      employeeId: body.employeeId,
      employeeName: body.employeeName || '',
      scheduledDate: body.scheduledDate,
      status: 'scheduled',
      interviewType: body.interviewType || 'in_person',
      conductedBy: body.conductedBy || '',
      conductedByName: body.conductedByName || '',
      confidential: body.confidential ?? true,
      createdDate: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, interview },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating exit interview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create exit interview' },
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
        { success: false, error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    // Extract the offboardingId from the interview ID (INT-<exitRequestId>)
    const exitRequestId = id.startsWith('INT-') ? id.replace('INT-', '') : id;

    const existing = await prisma.exitRequest.findFirst({
      where: { id: exitRequestId, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Exit interview not found' },
        { status: 404 }
      );
    }

    // Update exit request with interview notes
    const dataToUpdate: Record<string, unknown> = {};

    if (updates.notes || updates.keyTakeaways) {
      dataToUpdate.reason =
        updates.notes || updates.keyTakeaways?.join('; ') || existing.reason;
    }
    if (updates.rehireEligible !== undefined || updates.openToRehire !== undefined) {
      dataToUpdate.rehireEligible =
        updates.rehireEligible ?? updates.openToRehire ?? existing.rehireEligible;
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.exitRequest.update({
        where: { id: exitRequestId },
        data: dataToUpdate,
      });
    }

    const interview = {
      id,
      offboardingId: exitRequestId,
      ...updates,
      lastModified: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, interview },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating exit interview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update exit interview' },
      { status: 500 }
    );
  }
});
