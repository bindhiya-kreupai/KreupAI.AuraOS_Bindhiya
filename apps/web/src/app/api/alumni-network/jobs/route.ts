import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

const db = prisma as any;

function mapJob(j: any) {
  return {
    jobId: j.id,
    jobTitle: j.jobTitle,
    companyName: j.companyName,
    jobType: j.jobType,
    workLocation: j.workLocation,
    locationCity: j.locationCity || undefined,
    locationCountry: j.locationCountry || undefined,
    jobDescription: j.jobDescription || '',
    applicationUrl: j.applicationUrl || undefined,
    applicationEmail: j.applicationEmail || undefined,
    salaryRange:
      j.salaryMin != null || j.salaryMax != null
        ? {
            min: j.salaryMin != null ? Number(j.salaryMin) : 0,
            max: j.salaryMax != null ? Number(j.salaryMax) : 0,
            currency: j.currency || 'USD',
            period: 'yearly',
          }
        : undefined,
    currency: j.currency || undefined,
    jobStatus: j.status,
    isReferralAvailable: j.isReferralAvailable,
    postedBy: j.postedByEmployeeId,
    postedByName: j.postedByName || '',
    viewCount: j.viewCount ?? 0,
    applicationCount: j.applicationCount ?? 0,
    savedCount: j.savedCount ?? 0,
    tags: j.tags || [],
    postedDate: j.createdAt,
    createdDate: j.createdAt,
    lastUpdatedDate: j.updatedAt,
    expiryDate: j.expiryDate || undefined,
  };
}

export const GET = withEnhancedAuth(async (_request: NextRequest, context) => {
  try {
    const { user } = context;
    const jobs = await db.alumniJob.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(jobs.map(mapJob), { status: 200 });
  } catch (error) {
    console.error('Error fetching alumni jobs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch jobs', messageAr: 'فشل في جلب الوظائف' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.jobTitle || !body.companyName) {
      return NextResponse.json(
        {
          message: 'jobTitle and companyName are required',
          messageAr: 'المسمى الوظيفي واسم الشركة مطلوبان',
        },
        { status: 400 }
      );
    }

    const salary = body.salaryRange || {};
    const created = await db.alumniJob.create({
      data: {
        tenantId: user.tenantId,
        jobTitle: body.jobTitle,
        companyName: body.companyName,
        jobType: body.jobType || 'full_time',
        workLocation: body.workLocation || 'on_site',
        locationCity: body.locationCity || null,
        locationCountry: body.locationCountry || null,
        jobDescription: body.jobDescription || null,
        applicationUrl: body.applicationUrl || null,
        applicationEmail: body.applicationEmail || null,
        salaryMin: body.salaryMin ?? salary.min ?? null,
        salaryMax: body.salaryMax ?? salary.max ?? null,
        currency: body.currency || salary.currency || null,
        status: body.jobStatus || body.status || 'active',
        isReferralAvailable: Boolean(body.isReferralAvailable),
        // Never trust a client-sent poster id — bind to the authenticated user.
        postedByEmployeeId: context.employeeId ?? user.userId,
        postedByName: body.postedByName || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      },
    });

    return NextResponse.json(mapJob(created), { status: 201 });
  } catch (error) {
    console.error('Error creating alumni job:', error);
    return NextResponse.json(
      { message: 'Failed to create job', messageAr: 'فشل في إنشاء الوظيفة' },
      { status: 500 }
    );
  }
});
