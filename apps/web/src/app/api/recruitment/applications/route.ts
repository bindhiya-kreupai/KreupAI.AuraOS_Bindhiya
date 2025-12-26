import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/applications
 * Fetch all candidate applications
 */
export const GET = withEnhancedAuth(async (request: NextRequest, _context) => {
  try {
    const { searchParams } = new URL(request.url);
    const jobPostingId = searchParams.get('jobPostingId');
    const status = searchParams.get('status');

    const applications = await prisma.candidateApplication.findMany({
      where: {
        ...(jobPostingId && { jobPostingId }),
        ...(status && { status }),
      },
      include: {
        candidate: true,
        jobPosting: {
          select: {
            title: true,
            department: true,
            location: true,
          },
        },
      },
      orderBy: { appliedDate: 'desc' },
    });

    // Transform to match UI expectations
    const transformedApplications = applications.map((app) => ({
      id: app.id,
      candidateId: app.candidateId,
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      candidateEmail: app.candidate.email,
      candidatePhone: app.candidate.phone,
      jobPostingId: app.jobPostingId,
      jobTitle: app.jobPosting.title,
      department: app.jobPosting.department,
      location: app.jobPosting.location,
      status: app.status,
      currentStage: app.currentStage,
      source: app.source,
      appliedDate: app.appliedDate.toISOString(),
      overallRating: app.overallRating,
      notes: app.notes,
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      rejectionReason: app.rejectionReason,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data: transformedApplications }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
});

/**
 * POST /api/recruitment/applications
 * Create a new candidate application
 */
export const POST = withEnhancedAuth(async (request: NextRequest, _context) => {
  try {
    const body = await request.json();

    // Create or find candidate
    let candidate = await prisma.candidate.findUnique({
      where: { email: body.candidateEmail },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          firstName: body.candidateFirstName || 'Unknown',
          lastName: body.candidateLastName || 'Candidate',
          email: body.candidateEmail,
          phone: body.candidatePhone,
          location: body.candidateLocation,
          linkedinUrl: body.linkedinUrl,
          resumeUrl: body.resumeUrl,
          source: body.source,
        },
      });
    }

    // Create application
    const application = await prisma.candidateApplication.create({
      data: {
        candidateId: candidate.id,
        jobPostingId: body.jobPostingId,
        status: body.status || 'applied',
        currentStage: body.currentStage || 'applied',
        source: body.source,
        coverLetter: body.coverLetter,
        resumeUrl: body.resumeUrl || candidate.resumeUrl,
      },
      include: {
        candidate: true,
        jobPosting: true,
      },
    });

    // Update job posting applies count
    await prisma.jobPosting.update({
      where: { id: body.jobPostingId },
      data: { applies: { increment: 1 } },
    });

    return NextResponse.json({ data: application }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
});

/**
 * PUT /api/recruitment/applications/:id
 * Update application
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, _context) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    const application = await prisma.candidateApplication.update({
      where: { id },
      data: {
        ...(updates.status && { status: updates.status }),
        ...(updates.currentStage && { currentStage: updates.currentStage }),
        ...(updates.overallRating !== undefined && { overallRating: updates.overallRating }),
        ...(updates.notes && { notes: updates.notes }),
        ...(updates.rejectionReason && { rejectionReason: updates.rejectionReason }),
        ...(updates.rejectionNotes && { rejectionNotes: updates.rejectionNotes }),
      },
      include: {
        candidate: true,
        jobPosting: true,
      },
    });

    return NextResponse.json({ data: application }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
});
