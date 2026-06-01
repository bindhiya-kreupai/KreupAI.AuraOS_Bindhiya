import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { CareerPortalService } from '@/lib/services/recruitment/career-portal.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const scheduleInterviewSchema = z.object({
  action: z.literal('scheduleInterview'),
  candidateId: z.string().min(1),
  jobPostingId: z.string().min(1),
  interviewType: z.enum(['PHONE_SCREEN', 'VIDEO', 'IN_PERSON', 'PANEL', 'TECHNICAL', 'HR_ROUND']),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.number().default(60),
  interviewerIds: z.array(z.string()).min(1),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
});

const generateOfferSchema = z.object({
  action: z.literal('generateOffer'),
  candidateId: z.string().min(1),
  jobPostingId: z.string().min(1),
  salary: z.number().positive(),
  currency: z.string().default('AED'),
  startDate: z.coerce.date(),
  probationDays: z.number().default(90),
  benefits: z.array(z.string()).default([]),
  reportingTo: z.string().min(1),
  location: z.string().min(1),
  expiryDays: z.number().optional(),
  specialTerms: z.array(z.string()).optional(),
});

const applicationSubmitSchema = z.object({
  action: z.literal('apply'),
  jobPostingId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedInUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  coverLetter: z.string().optional(),
  currentCompany: z.string().optional(),
  currentTitle: z.string().optional(),
  totalExperience: z.coerce.number().optional(),
  expectedSalary: z.coerce.number().optional(),
  expectedSalaryCurrency: z.string().default('AED'),
  noticePeriod: z.string().optional(),
  source: z.enum(['CAREER_PORTAL', 'LINKEDIN', 'INDEED', 'BAYT', 'NAUKRI', 'REFERRAL', 'OTHER']).default('CAREER_PORTAL'),
  referredBy: z.string().optional(),
  resumeFileUrl: z.string().optional(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })).optional(),
  tenantId: z.string().min(1),
});

// ============================================================================
// GET /api/recruitment/career-portal
// Handles: searchJobs (public), applicationStatus (public), funnel (auth)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { error: 'action query parameter is required', errorAr: 'معامل الإجراء مطلوب' },
        { status: 400 }
      );
    }

    switch (action) {
      // ------------------------------------------------------------------
      // Public: Search jobs (no auth required)
      // ------------------------------------------------------------------
      case 'searchJobs': {
        const tenantId = searchParams.get('tenantId');
        if (!tenantId) {
          return NextResponse.json(
            { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
            { status: 400 }
          );
        }

        const filters = {
          keyword: searchParams.get('keyword') || undefined,
          department: searchParams.get('department') || undefined,
          location: searchParams.get('location') || undefined,
          employmentType: searchParams.get('employmentType') || undefined,
          experienceLevel: searchParams.get('experienceLevel') || undefined,
          postedAfter: searchParams.get('postedAfter') || undefined,
          page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
          limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
          sortBy: searchParams.get('sortBy') || 'postedAt',
          sortOrder: searchParams.get('sortOrder') || 'desc',
        };

        const result = await CareerPortalService.searchPublicJobs(tenantId, filters as any);

        return NextResponse.json({ success: true, data: result });
      }

      // ------------------------------------------------------------------
      // Public: Check application status (no auth required)
      // ------------------------------------------------------------------
      case 'applicationStatus': {
        const applicationId = searchParams.get('applicationId');
        const email = searchParams.get('email');

        if (!applicationId || !email) {
          return NextResponse.json(
            { error: 'applicationId and email are required', errorAr: 'معرف الطلب والبريد الإلكتروني مطلوبان' },
            { status: 400 }
          );
        }

        const result = await CareerPortalService.getApplicationStatus(applicationId, email);

        if (!result) {
          return NextResponse.json(
            { error: 'Application not found', errorAr: 'لم يتم العثور على الطلب' },
            { status: 404 }
          );
        }

        return NextResponse.json({ success: true, data: result });
      }

      // ------------------------------------------------------------------
      // Auth required: Recruitment funnel metrics
      // ------------------------------------------------------------------
      case 'funnel': {
        return await authenticatedGetHandler(request, undefined as any);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: 'إجراء غير معروف' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('Career portal GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process career portal request', errorAr: 'فشل في معالجة طلب بوابة التوظيف' },
      { status: 500 }
    );
  }
}

/**
 * Authenticated GET handler for funnel metrics
 */
const authenticatedGetHandler = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    const permissionError = requirePermission(Resource.RECRUITMENT, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const jobPostingId = searchParams.get('jobPostingId');

    if (!jobPostingId) {
      return NextResponse.json(
        { error: 'jobPostingId is required', errorAr: 'معرف الوظيفة مطلوب' },
        { status: 400 }
      );
    }

    const result = await CareerPortalService.getRecruitmentFunnel(user.tenantId, jobPostingId);

    return NextResponse.json({ success: true, data: result });
  }
);

// ============================================================================
// POST /api/recruitment/career-portal
// Handles: apply (public), scheduleInterview (auth), generateOffer (auth)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Clone the request so the body can be read again by the auth handler
    const clonedRequest = request.clone();
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required', errorAr: 'حقل الإجراء مطلوب' },
        { status: 400 }
      );
    }

    switch (action) {
      // ------------------------------------------------------------------
      // Public: Submit application (no auth required)
      // ------------------------------------------------------------------
      case 'apply': {
        const parsed = applicationSubmitSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.errors[0].message, errorAr: 'خطأ في التحقق من البيانات' },
            { status: 400 }
          );
        }

        const { tenantId, action: _action, ...applicationData } = parsed.data;

        const result = await CareerPortalService.submitApplication(tenantId, applicationData as any);

        return NextResponse.json({ success: true, data: result }, { status: 201 });
      }

      // ------------------------------------------------------------------
      // Auth required: Schedule interview, Generate offer
      // ------------------------------------------------------------------
      case 'scheduleInterview':
      case 'generateOffer': {
        return await authenticatedPostHandler(clonedRequest, undefined as any);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: 'إجراء غير معروف' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('Career portal POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process career portal request';
    return NextResponse.json(
      { error: message, errorAr: 'فشل في معالجة طلب بوابة التوظيف' },
      { status: 500 }
    );
  }
}

/**
 * Authenticated POST handler for scheduleInterview and generateOffer
 */
const authenticatedPostHandler = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    const permissionError = requirePermission(Resource.RECRUITMENT, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'scheduleInterview': {
        const parsed = scheduleInterviewSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.errors[0].message, errorAr: 'خطأ في التحقق من البيانات' },
            { status: 400 }
          );
        }

        const { action: _action, ...data } = parsed.data;

        const result = await CareerPortalService.scheduleInterview({
          tenantId: user.tenantId,
          ...data,
        });

        return NextResponse.json({ success: true, data: result }, { status: 201 });
      }

      case 'generateOffer': {
        const parsed = generateOfferSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.errors[0].message, errorAr: 'خطأ في التحقق من البيانات' },
            { status: 400 }
          );
        }

        const { action: _action, candidateId, jobPostingId, ...offerDetails } = parsed.data;

        const result = await CareerPortalService.generateOfferData(
          user.tenantId,
          candidateId,
          jobPostingId,
          offerDetails
        );

        return NextResponse.json({ success: true, data: result }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { error: `Unknown authenticated action: ${action}`, errorAr: 'إجراء غير معروف' },
          { status: 400 }
        );
    }
  }
);
