/**
 * Resume Parser API Routes
 * Phase 3: Intelligence Layer - Recruitment AI
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ResumeParserService } from '@/lib/services/ai';

/**
 * POST /api/ai/resume
 * Parse resume and extract structured data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    const action = body.action || 'parse';

    switch (action) {
      case 'parse':
        // Parse resume text
        if (!body.resumeText) {
          return NextResponse.json(
            { error: 'resumeText is required', errorAr: 'نص السيرة الذاتية مطلوب' },
            { status: 400 }
          );
        }

        const resumeData = await ResumeParserService.parseResume(
          body.resumeText,
          body.fileName
        );

        return NextResponse.json({
          success: true,
          data: resumeData,
        });

      case 'score':
        // Score candidate against job requirements
        if (!body.resume || !body.jobRequirements) {
          return NextResponse.json(
            {
              error: 'resume and jobRequirements are required',
              errorAr: 'السيرة الذاتية ومتطلبات الوظيفة مطلوبة',
            },
            { status: 400 }
          );
        }

        const score = await ResumeParserService.scoreCandidate(
          body.resume,
          body.jobRequirements
        );

        return NextResponse.json({
          success: true,
          data: score,
        });

      case 'match-jobs':
        // Match candidate to multiple jobs
        if (!body.resume || !body.jobs) {
          return NextResponse.json(
            {
              error: 'resume and jobs array are required',
              errorAr: 'السيرة الذاتية ومصفوفة الوظائف مطلوبة',
            },
            { status: 400 }
          );
        }

        const matches = await ResumeParserService.matchToJobs(body.resume, body.jobs);

        return NextResponse.json({
          success: true,
          data: {
            matches,
            bestMatch: matches[0] || null,
          },
        });

      case 'extract-keywords':
        // Extract ATS keywords from resume
        if (!body.resume) {
          return NextResponse.json(
            { error: 'resume is required', errorAr: 'السيرة الذاتية مطلوبة' },
            { status: 400 }
          );
        }

        const keywords = ResumeParserService.extractATSKeywords(body.resume);

        return NextResponse.json({
          success: true,
          data: {
            keywords,
            count: keywords.length,
          },
        });

      case 'batch-parse':
        // Parse multiple resumes
        if (!body.resumes || !Array.isArray(body.resumes)) {
          return NextResponse.json(
            { error: 'resumes array is required', errorAr: 'مصفوفة السير الذاتية مطلوبة' },
            { status: 400 }
          );
        }

        const parsedResumes = await Promise.all(
          body.resumes.map(async (r: { text: string; fileName?: string }) => {
            try {
              return await ResumeParserService.parseResume(r.text, r.fileName);
            } catch (error) {
              return {
                error: true,
                fileName: r.fileName,
                message: error instanceof Error ? error.message : 'Parse failed',
              };
            }
          })
        );

        const successful = parsedResumes.filter((r: any) => !r.error);
        const failed = parsedResumes.filter((r: any) => r.error);

        return NextResponse.json({
          success: true,
          data: {
            parsed: successful,
            failed,
            summary: {
              total: body.resumes.length,
              successful: successful.length,
              failed: failed.length,
            },
          },
        });

      case 'rank-candidates':
        // Rank multiple candidates against a job
        if (!body.resumes || !body.jobRequirements) {
          return NextResponse.json(
            {
              error: 'resumes array and jobRequirements are required',
              errorAr: 'مصفوفة السير الذاتية ومتطلبات الوظيفة مطلوبة',
            },
            { status: 400 }
          );
        }

        const scores = await Promise.all(
          body.resumes.map(async (resume: any) => {
            const candidateScore = await ResumeParserService.scoreCandidate(
              resume,
              body.jobRequirements
            );
            return {
              candidateName: resume.contact?.name || 'Unknown',
              ...candidateScore,
              candidateId: resume.id, // Move to end to ensure it's not overwritten incorrectly if that was the intent
            };
          })
        );

        // Sort by overall score
        const ranked = scores.sort((a: any, b: any) => b.overallScore - a.overallScore);

        return NextResponse.json({
          success: true,
          data: {
            rankings: ranked.map((r: any, i: number) => ({ ...r, rank: i + 1 })),
            topCandidate: ranked[0] || null,
            summary: {
              total: ranked.length,
              strongFit: ranked.filter((r: any) => r.recommendation === 'STRONG_FIT').length,
              goodFit: ranked.filter((r: any) => r.recommendation === 'GOOD_FIT').length,
              partialFit: ranked.filter((r: any) => r.recommendation === 'PARTIAL_FIT').length,
              notRecommended: ranked.filter((r: any) => r.recommendation === 'NOT_RECOMMENDED').length,
            },
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process resume',
        errorAr: 'فشل في معالجة السيرة الذاتية',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/resume
 * Get parsed resumes summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // In production, fetch from database
    return NextResponse.json({
      success: true,
      data: {
        tenantId,
        resumes: [],
        summary: {
          total: 0,
          parsed: 0,
          pending: 0,
        },
        filters: {
          jobId,
          status,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch resume data', errorAr: 'فشل في جلب بيانات السيرة الذاتية' },
      { status: 500 }
    );
  }
}
