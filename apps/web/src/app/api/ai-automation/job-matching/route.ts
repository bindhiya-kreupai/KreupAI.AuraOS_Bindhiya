import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

// Job ↔ Candidate match: simple skill-overlap score against existing Candidate
// + competency catalogue.
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const body = await safeJson(request);
    if (!body?.candidateId) return validationError({ message: 'candidateId required' });
    const candidate: any = await prisma.candidate.findFirst({ where: { id: body.candidateId } });
    if (!candidate) return validationError({ message: 'Candidate not found' });
    const jobs: any[] =
      (await (prisma as any).jobPosting?.findMany?.({
        where: { tenantId: user.tenantId, status: 'OPEN' as any },
      })) ?? [];
    const candidateSkills: string[] = (candidate.skills as string[]) || [];
    const matches = jobs.map((job: any) => {
      const required: string[] = (job.requiredSkills as string[]) || [];
      const overlap = required.filter((s) => candidateSkills.includes(s)).length;
      const score = required.length ? Math.round((overlap / required.length) * 100) : 0;
      return {
        jobId: job.id,
        jobTitle: job.title,
        overlap,
        requiredSkills: required.length,
        score,
      };
    });
    matches.sort((a, b) => b.score - a.score);
    await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'job_matching',
        output: { count: matches.length } as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successItem({ candidateId: body.candidateId, matches: matches.slice(0, 20) });
  } catch (error: any) {
    return serverError(error, 'match jobs');
  }
});
