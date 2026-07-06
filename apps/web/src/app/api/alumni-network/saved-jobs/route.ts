import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

const db = prisma as any;

function mapSaved(s: any) {
  return {
    savedId: s.id,
    jobId: s.jobId,
    alumniId: s.employeeId,
    savedDate: s.createdAt,
    notes: s.notes || undefined,
  };
}

export const GET = withEnhancedAuth(async (_request: NextRequest, context) => {
  try {
    const { user } = context;
    const employeeId = context.employeeId ?? user.userId;
    // Always scope saved jobs to the authenticated employee.
    const saved = await db.alumniSavedJob.findMany({
      where: { tenantId: user.tenantId, employeeId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(saved.map(mapSaved), { status: 200 });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch saved jobs', messageAr: 'فشل في جلب الوظائف المحفوظة' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const employeeId = context.employeeId ?? user.userId;
    const body = await request.json();

    if (!body.jobId) {
      return NextResponse.json(
        { message: 'jobId is required', messageAr: 'معرّف الوظيفة مطلوب' },
        { status: 400 }
      );
    }

    const job = await db.alumniJob.findFirst({
      where: { id: body.jobId, tenantId: user.tenantId },
    });
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found', messageAr: 'الوظيفة غير موجودة' },
        { status: 404 }
      );
    }

    const existing = await db.alumniSavedJob.findFirst({
      where: { tenantId: user.tenantId, jobId: body.jobId, employeeId },
    });
    if (existing) {
      return NextResponse.json(mapSaved(existing), { status: 200 });
    }

    const saved = await db.alumniSavedJob.create({
      data: {
        tenantId: user.tenantId,
        jobId: body.jobId,
        employeeId,
        notes: body.notes || null,
      },
    });

    await db.alumniJob.update({
      where: { id: body.jobId },
      data: { savedCount: { increment: 1 } },
    });

    return NextResponse.json(mapSaved(saved), { status: 201 });
  } catch (error) {
    console.error('Error saving job:', error);
    return NextResponse.json(
      { message: 'Failed to save job', messageAr: 'فشل في حفظ الوظيفة' },
      { status: 500 }
    );
  }
});
