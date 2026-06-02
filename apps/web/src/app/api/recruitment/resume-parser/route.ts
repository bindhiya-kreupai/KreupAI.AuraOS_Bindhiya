import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { ResumeParserService } from '@/lib/services/recruitment/resume-parser.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const parseSchema = z.object({
  action: z.literal('parse'),
  text: z.string().min(1, 'Resume text is required'),
  language: z.enum(['en', 'ar', 'mixed']).optional(),
});

const scoreSchema = z.object({
  action: z.literal('score'),
  resume: z.object({
    candidateName: z.string(),
    totalExperienceYears: z.number(),
    education: z.array(z.any()),
    certifications: z.array(z.any()),
    experience: z.array(z.any()),
    skills: z.array(z.any()),
    languages: z.array(z.any()),
    parseConfidence: z.number(),
    rawTextLength: z.number(),
    detectedLanguage: z.enum(['en', 'ar', 'mixed']),
    parseWarnings: z.array(z.string()),
  }).passthrough(),
  requirements: z.object({
    title: z.string(),
    requiredSkills: z.array(z.string()),
    minExperienceYears: z.number(),
  }).passthrough(),
});

const batchParseAndScoreSchema = z.object({
  action: z.literal('batchParseAndScore'),
  texts: z.array(z.object({
    candidateId: z.string(),
    text: z.string(),
  })).min(1, 'At least one resume text is required'),
  jobId: z.string().min(1, 'Job ID is required'),
  tenantId: z.string().optional(),
});

const rankSchema = z.object({
  action: z.literal('rank'),
  resumes: z.array(z.object({
    id: z.string(),
    score: z.object({
      overallScore: z.number(),
      experienceScore: z.number(),
      educationScore: z.number(),
      skillMatchScore: z.number(),
      locationScore: z.number(),
      salaryfitScore: z.number(),
      breakdown: z.array(z.any()),
      recommendation: z.enum(['STRONG_FIT', 'GOOD_FIT', 'PARTIAL_FIT', 'NOT_FIT']),
      recommendationAr: z.string(),
    }),
  })).min(1, 'At least one candidate is required'),
  requirements: z.object({
    title: z.string(),
    requiredSkills: z.array(z.string()),
    minExperienceYears: z.number(),
  }).passthrough().optional(),
  limit: z.number().min(1).optional(),
});

// ============================================================================
// POST /api/recruitment/resume-parser
// Handles: parse, score, batchParseAndScore, rank
// ============================================================================

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.RECRUITMENT, Action.READ, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { action } = body;

      if (!action) {
        return NextResponse.json(
          { error: 'action is required', errorAr: 'حقل الإجراء مطلوب' },
          { status: 400 }
        );
      }

      switch (action) {
        case 'parse': {
          const parsed = parseSchema.safeParse(body);
          if (!parsed.success) {
            return NextResponse.json(
              { error: parsed.error.errors[0].message, errorAr: 'خطأ في التحقق من البيانات' },
              { status: 400 }
            );
          }

          const result = ResumeParserService.parseResume(parsed.data.text);

          return NextResponse.json({ success: true, data: result });
        }

        case 'score': {
          const parsed = scoreSchema.safeParse(body);
          if (!parsed.success) {
            return NextResponse.json(
              { error: parsed.error.errors[0].message, errorAr: 'خطأ في التحقق من البيانات' },
              { status: 400 }
            );
          }

          const result = ResumeParserService.scoreCandidate(
            parsed.data.resume as any,
            parsed.data.requirements as any
          );

          return NextResponse.json({ success: true, data: result });
        }

        case 'batchParseAndScore': {
          const parsed = batchParseAndScoreSchema.safeParse(body);
          if (!parsed.success) {
            return NextResponse.json(
              { error: parsed.error.errors[0].message, errorAr: 'خطأ في التحقق من البيانات' },
              { status: 400 }
            );
          }

          const result = await ResumeParserService.batchParseAndScore(
            user.tenantId,
            parsed.data.jobId,
            parsed.data.texts
          );

          return NextResponse.json({ success: true, data: result });
        }

        case 'rank': {
          const parsed = rankSchema.safeParse(body);
          if (!parsed.success) {
            return NextResponse.json(
              { error: parsed.error.errors[0].message, errorAr: 'خطأ في التحقق من البيانات' },
              { status: 400 }
            );
          }

          const result = ResumeParserService.rankCandidates(
            parsed.data.resumes as any
          );

          const limited = parsed.data.limit
            ? result.slice(0, parsed.data.limit)
            : result;

          return NextResponse.json({ success: true, data: limited });
        }

        default:
          return NextResponse.json(
            { error: `Unknown action: ${action}`, errorAr: 'إجراء غير معروف' },
            { status: 400 }
          );
      }
    } catch (error: any) {
      logger.error('Resume parser API error:', error);
      return NextResponse.json(
        { error: 'Failed to process resume parser request', errorAr: 'فشل في معالجة طلب تحليل السيرة الذاتية' },
        { status: 500 }
      );
    }
  }
);
