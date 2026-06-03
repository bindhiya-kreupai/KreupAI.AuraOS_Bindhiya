import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

const STAGE_MAP: Record<string, string> = {
  APPLIED: 'applied',
  SCREENING: 'screening',
  PHONE_INTERVIEW: 'phone_screen',
  TECHNICAL_INTERVIEW: 'technical',
  HIRING_MANAGER_INTERVIEW: 'hr_interview',
  FINAL_INTERVIEW: 'hr_interview',
  OFFER: 'offer',
  OFFER_ACCEPTED: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'rejected',
};

const STAGE_LABELS: Record<string, string> = {
  applied: 'Applied',
  screening: 'Screening',
  phone_screen: 'Phone Screen',
  technical: 'Technical',
  hr_interview: 'HR Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

async function getTenantUserIds(tenantId: string): Promise<string[]> {
  // tenant-ok: helper takes tenantId as a typed parameter
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true },
  });

  return users.map((user) => user.id);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing recruitment:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantUserIds = await getTenantUserIds(user.tenantId);

    if (tenantUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalOpenPositions: 0,
          totalApplications: 0,
          totalInterviewsScheduled: 0,
          totalOffersMade: 0,
          totalHired: 0,
          averageTimeToHire: 0,
          offerAcceptanceRate: 0,
          pipelineFunnel: [],
          sourceEffectiveness: [],
          departmentHiring: [],
          monthlyActivity: [],
        },
      });
    }

    const tenantCreatedBy = { in: tenantUserIds };

    const [jobPostings, applications, interviewCount, offers] = await Promise.all([
      prisma.jobPosting.findMany({
        where: { isDeleted: false, createdBy: tenantCreatedBy },
        select: { id: true, department: true, status: true },
      }),
      prisma.candidateApplication.findMany({
        where: { jobPosting: { createdBy: tenantCreatedBy } },
        select: {
          id: true,
          source: true,
          status: true,
          currentStage: true,
          appliedDate: true,
          updatedAt: true,
          jobPosting: { select: { department: true } },
        },
      }),
      prisma.interview.count({
        where: { application: { jobPosting: { createdBy: tenantCreatedBy } } },
      }),
      prisma.jobOffer.findMany({
        where: { application: { jobPosting: { createdBy: tenantCreatedBy } } },
        select: { status: true, createdAt: true },
      }),
    ]);

    const openPositions = jobPostings.filter(
      (job) => String(job.status).toLowerCase() === 'active'
    ).length;
    const totalApplications = applications.length;
    const totalOffersMade = offers.length;
    const totalHired = applications.filter((application) => {
      const stage = String(application.currentStage).toUpperCase();
      const status = String(application.status).toUpperCase();
      return stage === 'HIRED' || status === 'HIRED';
    }).length;

    const hiredDurations = applications
      .filter((application) => {
        const stage = String(application.currentStage).toUpperCase();
        const status = String(application.status).toUpperCase();
        return stage === 'HIRED' || status === 'HIRED';
      })
      .map((application) =>
        Math.max(
          Math.round(
            (application.updatedAt.getTime() - application.appliedDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          0
        )
      );

    const acceptedOffers = offers.filter((offer) => {
      const status = String(offer.status).toUpperCase();
      return status === 'ACCEPTED' || status === 'OFFER_ACCEPTED';
    }).length;

    const stageCounts = new Map<string, number>();
    for (const application of applications) {
      const normalizedStage =
        STAGE_MAP[String(application.currentStage).toUpperCase()] || 'applied';
      stageCounts.set(normalizedStage, (stageCounts.get(normalizedStage) || 0) + 1);
    }

    const funnelStages = [
      'applied',
      'screening',
      'phone_screen',
      'technical',
      'hr_interview',
      'offer',
      'hired',
      'rejected',
    ];
    let previousCount = totalApplications;
    const pipelineFunnel = funnelStages.map((stage) => {
      const count = stageCounts.get(stage) || 0;
      const conversionRate = previousCount > 0 ? Math.round((count / previousCount) * 100) : 0;
      previousCount = count || previousCount;

      return {
        stage,
        label: STAGE_LABELS[stage],
        count,
        conversionRate,
      };
    });

    const sourceCounts = new Map<string, { count: number; hired: number }>();
    for (const application of applications) {
      const source = application.source || 'direct';
      const current = sourceCounts.get(source) || { count: 0, hired: 0 };
      current.count += 1;
      if (
        String(application.currentStage).toUpperCase() === 'HIRED' ||
        String(application.status).toUpperCase() === 'HIRED'
      ) {
        current.hired += 1;
      }
      sourceCounts.set(source, current);
    }

    const sourceEffectiveness = Array.from(sourceCounts.entries()).map(([source, counts]) => ({
      source,
      count: counts.count,
      hireRate: counts.count > 0 ? Math.round((counts.hired / counts.count) * 100) : 0,
    }));

    const departmentStats = new Map<string, { openPositions: number; hired: number }>();
    for (const job of jobPostings) {
      const current = departmentStats.get(job.department) || { openPositions: 0, hired: 0 };
      if (String(job.status).toLowerCase() === 'active') {
        current.openPositions += 1;
      }
      departmentStats.set(job.department, current);
    }
    for (const application of applications) {
      if (
        String(application.currentStage).toUpperCase() !== 'HIRED' &&
        String(application.status).toUpperCase() !== 'HIRED'
      ) {
        continue;
      }
      const department = application.jobPosting.department;
      const current = departmentStats.get(department) || { openPositions: 0, hired: 0 };
      current.hired += 1;
      departmentStats.set(department, current);
    }

    const monthlyStats = new Map<
      string,
      { applications: number; interviews: number; offers: number; hires: number }
    >();
    for (const application of applications) {
      const key = monthKey(application.appliedDate);
      const current = monthlyStats.get(key) || {
        applications: 0,
        interviews: 0,
        offers: 0,
        hires: 0,
      };
      current.applications += 1;
      if (
        String(application.currentStage).toUpperCase() === 'HIRED' ||
        String(application.status).toUpperCase() === 'HIRED'
      ) {
        current.hires += 1;
      }
      monthlyStats.set(key, current);
    }
    for (const offer of offers) {
      const key = monthKey(offer.createdAt);
      const current = monthlyStats.get(key) || {
        applications: 0,
        interviews: 0,
        offers: 0,
        hires: 0,
      };
      current.offers += 1;
      monthlyStats.set(key, current);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalOpenPositions: openPositions,
        totalApplications,
        totalInterviewsScheduled: interviewCount,
        totalOffersMade,
        totalHired,
        averageTimeToHire:
          hiredDurations.length > 0
            ? Math.round(
                hiredDurations.reduce((sum, days) => sum + days, 0) / hiredDurations.length
              )
            : 0,
        offerAcceptanceRate:
          totalOffersMade > 0 ? Math.round((acceptedOffers / totalOffersMade) * 100) : 0,
        pipelineFunnel,
        sourceEffectiveness,
        departmentHiring: Array.from(departmentStats.entries()).map(([department, stats]) => ({
          department,
          openPositions: stats.openPositions,
          hired: stats.hired,
        })),
        monthlyActivity: Array.from(monthlyStats.entries())
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([month, stats]) => ({
            month,
            applications: stats.applications,
            interviews: 0,
            offers: stats.offers,
            hires: stats.hires,
          })),
      },
    });
  } catch (error: any) {
    console.error('[RecruitmentStats API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recruitment statistics' },
      { status: 500 }
    );
  }
});
