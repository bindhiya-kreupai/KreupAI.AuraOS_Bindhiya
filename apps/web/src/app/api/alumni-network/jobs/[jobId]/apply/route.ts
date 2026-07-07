import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

const db = prisma as any;

function mapJob(j: any) {
  return {
    jobId: j.id,
    jobTitle: j.jobTitle,
    companyName: j.companyName,
    jobStatus: j.status,
    applicationCount: j.applicationCount ?? 0,
    savedCount: j.savedCount ?? 0,
    viewCount: j.viewCount ?? 0,
    tags: j.tags || [],
    postedDate: j.createdAt,
    lastUpdatedDate: j.updatedAt,
  };
}

// Apply — the authenticated alumnus applies for a job.
export const POST = withEnhancedAuth<{ params: Promise<{ jobId: string }> }>(
  async (request, context) => {
    try {
      const { user } = context;
      // The enhanced-auth context exposes the resolved employee id at the top
      // level; fall back to the user id (employeeId === userId today).
      const authEmployeeId = context.employeeId ?? user.userId;
      const { jobId } = await context.params;
      const body = await request.json().catch(() => ({}));

      const job = await db.alumniJob.findFirst({
        where: { id: jobId, tenantId: user.tenantId },
      });
      if (!job) {
        return NextResponse.json(
          { message: 'Job not found', messageAr: 'الوظيفة غير موجودة' },
          { status: 404 }
        );
      }

      // Never trust a client-sent applicant id — bind to the authenticated user.
      const applicantId = authEmployeeId;

      const existing = await db.alumniJobApplication.findFirst({
        where: { tenantId: user.tenantId, jobId, applicantId },
      });
      if (existing) {
        return NextResponse.json(
          {
            message: 'You have already applied for this job',
            messageAr: 'لقد تقدمت بالفعل لهذه الوظيفة',
          },
          { status: 409 }
        );
      }

      const application = body.application || {};
      await db.alumniJobApplication.create({
        data: {
          tenantId: user.tenantId,
          jobId,
          applicantId,
          applicantName: application.applicantName || null,
          applicantEmail: application.applicantEmail || user.email || null,
          applicationStatus: 'submitted',
          coverLetter: application.coverLetter || null,
          resumeUrl: application.resume || application.resumeUrl || null,
        },
      });

      const updated = await db.alumniJob.update({
        where: { id: jobId },
        data: { applicationCount: { increment: 1 } },
      });

      return NextResponse.json(mapJob(updated), { status: 201 });
    } catch (error) {
      console.error('Error applying for job:', error);
      return NextResponse.json(
        {
          message: 'Failed to apply for job',
          messageAr: 'فشل في التقديم للوظيفة',
        },
        { status: 500 }
      );
    }
  }
);
