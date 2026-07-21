/**
 * Resume Screening API
 * GET  — list recent screenings + open jobs + stats (+ ?type=config)
 * POST — single or bulk LLM screen + rank (JSON or multipart file upload)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';
import { canReadAiAutomation, canWriteAiAutomation } from '@/lib/ai/ai-automation-auth';
import {
  getResumeScreeningConfig,
  screenResumeWithAI,
  screenResumesBatchAndRank,
  ResumeScreeningAIError,
} from '@/lib/ai/resume-screening-ai';
import {
  listOpenJobsForTenant,
  listRecentScreenings,
  resolveJobRequirements,
  screeningStats,
} from '@/lib/ai/resume-screening-retrieval';
import {
  extractResumeTextFromBuffer,
  MAX_BULK_RESUMES,
  ResumeExtractError,
} from '@/lib/ai/resume-text-extract';
import type { JobRequirementsInput, ResumeInput } from '@/lib/ai/resume-screening-types';
import { randomUUID } from 'crypto';

async function resolveAuth(request: NextRequest) {
  const { context, error } = await authenticateWithPermissions(request);
  if (error || !context?.user?.tenantId) return null;
  return {
    tenantId: context.user.tenantId as string,
    userId: context.user.userId as string,
    permissions: context.permissions as string[],
    roles: context.roles as string[],
  };
}

function parseSkills(raw: unknown): string[] | undefined {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

async function resolveJobFromFields(
  tenantId: string,
  fields: Record<string, unknown>
): Promise<JobRequirementsInput> {
  return resolveJobRequirements(tenantId, {
    jobId: fields.jobId ? String(fields.jobId) : undefined,
    jobTitle: fields.jobTitle ? String(fields.jobTitle) : undefined,
    requiredSkills: parseSkills(fields.requiredSkills),
    preferredSkills: parseSkills(fields.preferredSkills),
    minYearsExperience:
      fields.minYearsExperience != null ? Number(fields.minYearsExperience) : undefined,
    educationLevel: fields.educationLevel ? String(fields.educationLevel) : undefined,
    description: fields.description ? String(fields.description) : undefined,
  });
}

async function persistBatchResults(
  tenantId: string,
  userId: string,
  job: JobRequirementsInput,
  batch: Awaited<ReturnType<typeof screenResumesBatchAndRank>>
) {
  await prisma.aIRunRecord.create({
    data: {
      tenantId,
      runType: 'resume_screening_batch',
      inputContext: {
        batchId: batch.batchId,
        jobId: job.jobId,
        jobTitle: job.jobTitle,
        requiredSkills: job.requiredSkills,
        total: batch.total,
        source: 'ai-resume-screening-bulk',
      } as object,
      output: {
        batchId: batch.batchId,
        succeeded: batch.succeeded,
        failed: batch.failed,
        rankings: batch.rankings.map((r) => ({
          rank: r.rank,
          screeningId: r.screeningId,
          candidateName: r.extracted.name,
          overallScore: r.overallScore,
          fileName: r.fileName,
        })),
        failures: batch.failures,
      } as object,
      modelVersion: batch.rankings[0]?.model || batch.rankings[0]?.provider || 'llm',
      completedAt: new Date(),
      durationMs: batch.processingTimeMs,
      createdBy: userId,
    },
  });

  for (const ranking of batch.rankings) {
    await prisma.aIRunRecord.create({
      data: {
        tenantId,
        runType: 'resume_screening',
        inputContext: {
          batchId: batch.batchId,
          jobId: job.jobId,
          jobTitle: job.jobTitle,
          requiredSkills: job.requiredSkills,
          fileName: ranking.fileName || null,
          source: 'ai-resume-screening-bulk-item',
        } as object,
        output: ranking as object,
        modelVersion: ranking.model || ranking.provider,
        completedAt: new Date(ranking.screenedAt),
        durationMs: ranking.processingTimeMs,
        createdBy: userId,
      },
    });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('type') === 'config') {
      return NextResponse.json({ success: true, data: getResumeScreeningConfig() });
    }

    const auth = await resolveAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Sign in required', errorAr: 'يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }
    if (!canReadAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden', errorAr: 'ممنوع' },
        { status: 403 }
      );
    }

    // Isolate DB lookups so a single Prisma blip doesn't 500 the whole page
    const [screeningsResult, jobsResult, statsResult] = await Promise.allSettled([
      listRecentScreenings(auth.tenantId),
      listOpenJobsForTenant(auth.tenantId),
      screeningStats(auth.tenantId),
    ]);

    if (screeningsResult.status === 'rejected') {
      console.error('[resume] screenings query failed:', screeningsResult.reason);
    }
    if (jobsResult.status === 'rejected') {
      console.error('[resume] jobs query failed:', jobsResult.reason);
    }
    if (statsResult.status === 'rejected') {
      console.error('[resume] stats query failed:', statsResult.reason);
    }

    const screenings = screeningsResult.status === 'fulfilled' ? screeningsResult.value : [];
    const jobs = jobsResult.status === 'fulfilled' ? jobsResult.value : [];
    const stats =
      statsResult.status === 'fulfilled'
        ? statsResult.value
        : {
            processed: screenings.length,
            avgMatchScore: 0,
            biasFlags: 0,
            interviewReady: 0,
            fairnessStatus: 'Pass',
          };

    return NextResponse.json({
      success: true,
      data: {
        screenings,
        jobs,
        stats,
        config: getResumeScreeningConfig(),
      },
    });
  } catch (error) {
    console.error('[resume] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load resume screenings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Sign in to screen resumes', errorAr: 'يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }
    if (!canWriteAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to screen resumes',
          errorAr: 'ليس لديك صلاحية فحص السير الذاتية',
        },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let jobFields: Record<string, unknown> = {};
    let resumes: ResumeInput[] = [];
    const extractFailures: { fileName?: string; error: string }[] = [];

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      jobFields = {
        jobId: form.get('jobId') || undefined,
        jobTitle: form.get('jobTitle') || undefined,
        requiredSkills: form.get('requiredSkills') || undefined,
        preferredSkills: form.get('preferredSkills') || undefined,
        minYearsExperience: form.get('minYearsExperience') || undefined,
        educationLevel: form.get('educationLevel') || undefined,
        description: form.get('description') || undefined,
      };

      const files = form.getAll('files').filter((f): f is File => typeof f !== 'string' && !!f);
      const single = form.get('file');
      if (single && typeof single !== 'string') files.push(single);

      if (files.length > MAX_BULK_RESUMES) {
        return NextResponse.json(
          { success: false, error: `Maximum ${MAX_BULK_RESUMES} resumes per batch` },
          { status: 400 }
        );
      }

      for (const file of files) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const text = await extractResumeTextFromBuffer(buffer, file.name, file.type);
          resumes.push({ resumeText: text, fileName: file.name });
        } catch (err) {
          extractFailures.push({
            fileName: file.name,
            error: err instanceof Error ? err.message : 'Failed to extract text',
          });
        }
      }

      // Optional pasted text alongside files
      const pasted = String(form.get('resumeText') || '').trim();
      if (pasted.length >= 40) {
        resumes.push({ resumeText: pasted, fileName: 'pasted-resume.txt' });
      }

      if (!resumes.length && extractFailures.length) {
        return NextResponse.json(
          {
            success: false,
            error: extractFailures.map((f) => `${f.fileName}: ${f.error}`).join('; '),
          },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      jobFields = body;

      if (Array.isArray(body.resumes) && body.resumes.length > 0) {
        if (body.resumes.length > MAX_BULK_RESUMES) {
          return NextResponse.json(
            { success: false, error: `Maximum ${MAX_BULK_RESUMES} resumes per batch` },
            { status: 400 }
          );
        }
        resumes = body.resumes.map((r: { resumeText?: string; fileName?: string }, i: number) => ({
          resumeText: String(r.resumeText || '').trim(),
          fileName: r.fileName || `resume-${i + 1}.txt`,
        }));
      } else if (body.resumeText) {
        resumes = [
          {
            resumeText: String(body.resumeText).trim(),
            fileName: body.fileName ? String(body.fileName) : undefined,
          },
        ];
      }
    }

    if (!resumes.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Upload one or more resume files (.txt, .pdf, .docx) or provide resume text',
        },
        { status: 400 }
      );
    }

    const job = await resolveJobFromFields(auth.tenantId, jobFields);

    // Bulk / rank path (2+ resumes) — also use batch when extract failures exist
    if (resumes.length > 1 || extractFailures.length > 0) {
      const batch = await screenResumesBatchAndRank(resumes, job);
      if (extractFailures.length) {
        batch.failures = [...extractFailures, ...batch.failures];
        batch.failed = batch.failures.length;
        batch.total = resumes.length + extractFailures.length;
      }
      await persistBatchResults(auth.tenantId, auth.userId, job, batch);
      return NextResponse.json({ success: true, data: batch });
    }

    // Single resume
    const only = resumes[0];
    const result = await screenResumeWithAI(only.resumeText, job, only.fileName);
    const screeningId = randomUUID();
    const screenedAt = new Date().toISOString();
    const payload = {
      ...result,
      screeningId,
      screenedAt,
      rank: 1,
      fileName: only.fileName,
    };

    await prisma.aIRunRecord.create({
      data: {
        tenantId: auth.tenantId,
        runType: 'resume_screening',
        inputContext: {
          jobId: job.jobId,
          jobTitle: job.jobTitle,
          requiredSkills: job.requiredSkills,
          resumeChars: only.resumeText.length,
          fileName: only.fileName || null,
          source: 'ai-resume-screening',
        } as object,
        output: payload as object,
        modelVersion: result.model || result.provider,
        completedAt: new Date(),
        durationMs: result.processingTimeMs,
        createdBy: auth.userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        batchId: screeningId,
        job,
        total: 1,
        succeeded: 1,
        failed: 0,
        rankings: [payload],
        failures: [],
        processingTimeMs: result.processingTimeMs,
        screenedAt,
      },
    });
  } catch (error) {
    console.error('[resume] POST error:', error);
    if (error instanceof ResumeScreeningAIError || error instanceof ResumeExtractError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorAr: 'فشل فحص السيرة الذاتية بالذكاء الاصطناعي',
        },
        { status: error instanceof ResumeExtractError ? 400 : 503 }
      );
    }
    return NextResponse.json({ success: false, error: 'Failed to screen resume' }, { status: 500 });
  }
}
