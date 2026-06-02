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

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:write')) return forbidden('ai-automation:write');
    const body = await safeJson(request);
    if (!body?.applicationId) return validationError({ message: 'applicationId required' });
    const app: any = await prisma.candidateApplication.findFirst({
      where: { id: body.applicationId },
      include: { candidate: true } as any,
    });
    if (!app) return validationError({ message: 'Application not found' });
    const candidate = app.candidate;
    const required: string[] = body.requiredSkills || [];
    const candidateSkills: string[] = (candidate?.skills as string[]) || [];
    const overlap = required.filter((s) => candidateSkills.includes(s)).length;
    const score = required.length ? Math.round((overlap / required.length) * 100) : 0;
    await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'resume_screening',
        inputContext: { applicationId: body.applicationId } as any,
        output: { score, overlap } as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successItem({
      applicationId: body.applicationId,
      score,
      overlap,
      requiredSkills: required.length,
      candidateSkills,
    });
  } catch (error: any) {
    return serverError(error, 'screen resume');
  }
});
