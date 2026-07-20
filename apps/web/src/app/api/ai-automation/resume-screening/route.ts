/**
 * Legacy alias — prefer /api/ai/resume (LLM-only Phase 3 Recruitment AI).
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';
import { canWriteAiAutomation } from '@/lib/ai/ai-automation-auth';
import { screenResumeWithAI, ResumeScreeningAIError } from '@/lib/ai/resume-screening-ai';
import { resolveJobRequirements } from '@/lib/ai/resume-screening-retrieval';
import { randomUUID } from 'crypto';

export const POST = async (request: NextRequest) => {
  try {
    const { context, error } = await authenticateWithPermissions(request);
    if (error || !context?.user?.tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const permissions = context.permissions as string[];
    const roles = context.roles as string[];
    if (!canWriteAiAutomation(permissions, roles)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    let resumeText = String(body.resumeText || '').trim();

    // If only applicationId is provided, build resume text from candidate profile for LLM scoring
    if (resumeText.length < 40 && body.applicationId) {
      const app = await prisma.candidateApplication.findFirst({
        where: { id: body.applicationId, isDeleted: false },
        include: { candidate: true, jobPosting: true },
      });
      if (!app) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 400 }
        );
      }
      const c = app.candidate;
      const skills = (c.skills || []).join(', ');
      resumeText = [
        `${c.firstName} ${c.lastName}`,
        c.email,
        c.phone || '',
        c.location || '',
        skills ? `Skills: ${skills}` : '',
        c.notes || '',
        typeof c.experience === 'string' ? c.experience : JSON.stringify(c.experience || ''),
        typeof c.education === 'string' ? c.education : JSON.stringify(c.education || ''),
      ]
        .filter(Boolean)
        .join('\n');

      if (!body.jobTitle && app.jobPosting?.title) {
        body.jobTitle = app.jobPosting.title;
      }
      if (!body.requiredSkills?.length && skills) {
        body.requiredSkills = c.skills;
      }
    }

    if (resumeText.length < 40) {
      return NextResponse.json(
        { success: false, error: 'resumeText required (LLM screening only — no rules path)' },
        { status: 400 }
      );
    }

    const job = await resolveJobRequirements(context.user.tenantId, {
      jobId: body.jobId,
      jobTitle: body.jobTitle,
      requiredSkills: body.requiredSkills,
      minYearsExperience: body.minYearsExperience,
    });
    const result = await screenResumeWithAI(resumeText, job, body.fileName);
    const payload = {
      ...result,
      screeningId: randomUUID(),
      screenedAt: new Date().toISOString(),
    };
    await prisma.aIRunRecord.create({
      data: {
        tenantId: context.user.tenantId,
        runType: 'resume_screening',
        inputContext: {
          source: 'legacy-ai-automation-route',
          jobTitle: job.jobTitle,
          applicationId: body.applicationId || null,
        } as object,
        output: payload as object,
        modelVersion: result.model || result.provider,
        completedAt: new Date(),
        durationMs: result.processingTimeMs,
        createdBy: context.user.userId,
      },
    });
    return NextResponse.json({ success: true, data: payload });
  } catch (error: unknown) {
    console.error('[ai-automation/resume-screening]', error);
    if (error instanceof ResumeScreeningAIError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: 'Failed to screen resume' }, { status: 500 });
  }
};
