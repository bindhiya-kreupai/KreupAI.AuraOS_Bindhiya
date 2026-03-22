import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/recruitment/candidates/match
 * Find candidates matching job requirements based on skills
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const body = await request.json();
    const { jobId, skills, limit: maxResults } = body;

    if (!jobId && (!skills || skills.length === 0)) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'jobId or skills array is required' } },
        { status: 400 }
      );
    }

    // Get required skills from job posting if jobId provided
    let requiredSkills: string[] = skills || [];
    let jobTitle = '';

    if (jobId) {
      const job = await prisma.jobPosting.findFirst({
        where: { id: jobId, isDeleted: false },
        select: { title: true, description: true },
      });

      if (!job) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Job posting not found' } },
          { status: 404 }
        );
      }

      jobTitle = job.title;

      // Also check JobRequisition for required skills
      if (requiredSkills.length === 0) {
        const requisition = await prisma.jobRequisition.findFirst({
          where: { jobTitle: job.title },
          select: { requiredSkills: true },
        });
        if (requisition) {
          requiredSkills = requisition.requiredSkills;
        }
      }
    }

    // Find candidates with matching skills
    const candidates = await prisma.candidate.findMany({
      where: {
        isDeleted: false,
        ...(requiredSkills.length > 0 ? { skills: { hasSome: requiredSkills } } : {}),
      },
      take: maxResults || 20,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        skills: true,
        experience: true,
        location: true,
        source: true,
        applications: {
          select: { id: true, status: true, currentStage: true, jobPostingId: true },
          take: 5,
          orderBy: { appliedDate: 'desc' },
        },
      },
    });

    // Score candidates by skill match
    const scored = candidates.map(candidate => {
      const matchedSkills = requiredSkills.filter(skill =>
        candidate.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
      const matchScore = requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 50;
      const alreadyApplied = jobId
        ? candidate.applications.some(a => a.jobPostingId === jobId)
        : false;

      return {
        candidateId: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        location: candidate.location,
        skills: candidate.skills,
        matchedSkills,
        matchScore,
        alreadyApplied,
        applicationCount: candidate.applications.length,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      data: {
        jobTitle: jobTitle || undefined,
        requiredSkills,
        matches: scored,
        totalMatches: scored.length,
      },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Candidate Match API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to match candidates' } },
      { status: 500 }
    );
  }
});
