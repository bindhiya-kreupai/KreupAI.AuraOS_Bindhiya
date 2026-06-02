import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/analytics
 * Fetch recruitment analytics and statistics computed from real data
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;
        const tenantId = user.tenantId;

        // Run all counts in parallel for performance
        const [
            totalJobs,
            activeJobs,
            totalApplications,
            totalInterviews,
            scheduledInterviews,
            completedInterviews,
            totalOffers,
            pendingOffers,
            acceptedOffers,
            declinedOffers,
            totalRequisitions,
            openRequisitions,
            backgroundChecks,
        ] = await Promise.all([
            prisma.jobPosting.count(),
            prisma.jobPosting.count({ where: { status: 'Active' } }),
            prisma.candidateApplication.count(),
            prisma.interview.count(),
            prisma.interview.count({ where: { status: 'scheduled' } }),
            prisma.interview.count({ where: { status: 'completed' } }),
            prisma.jobOffer.count(),
            prisma.jobOffer.count({ where: { status: 'pending' } }),
            prisma.jobOffer.count({ where: { status: 'accepted' } }),
            prisma.jobOffer.count({ where: { status: 'declined' } }),
            prisma.jobRequisition.count({ where: { tenantId } }),
            prisma.jobRequisition.count({ where: { tenantId, status: 'Open' } }),
            prisma.backgroundCheck.count({ where: { tenantId } }),
        ]);

        // Group applications by status
        const applicationsByStatus = await prisma.candidateApplication.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        const applicationsByStatusMap: Record<string, number> = {};
        applicationsByStatus.forEach((entry) => {
            applicationsByStatusMap[entry.status] = entry._count.id;
        });

        // Group applications by source
        const applicationsBySource = await prisma.candidateApplication.groupBy({
            by: ['source'],
            _count: { id: true },
        });

        const applicationsBySourceMap: Record<string, number> = {};
        applicationsBySource.forEach((entry) => {
            if (entry.source) {
                applicationsBySourceMap[entry.source] = entry._count.id;
            }
        });

        // Compute rates
        const offerAcceptanceRate = totalOffers > 0
            ? Math.round((acceptedOffers / totalOffers) * 10000) / 100
            : 0;

        const applicationToInterviewRate = totalApplications > 0
            ? Math.round((totalInterviews / totalApplications) * 10000) / 100
            : 0;

        const interviewToOfferRate = totalInterviews > 0
            ? Math.round((totalOffers / totalInterviews) * 10000) / 100
            : 0;

        const analytics = {
            tenantId,
            overview: {
                totalJobs,
                activeJobs,
                totalApplications,
                newApplicationsThisPeriod: applicationsByStatusMap['applied'] || 0,
                totalInterviews,
                interviewsScheduled: scheduledInterviews,
                interviewsCompleted: completedInterviews,
                totalOffers,
                offersPending: pendingOffers,
                offersAccepted: acceptedOffers,
                offersRejected: declinedOffers,
                totalHires: acceptedOffers,
                hiresThisPeriod: acceptedOffers,
            },
            pipelineMetrics: {
                averageTimeToHire: 0,
                averageTimeToFirstInterview: 0,
                averageTimeToOffer: 0,
                offerAcceptanceRate,
                applicationToInterviewRate,
                interviewToOfferRate,
            },
            sourceAnalytics: {
                sources: Object.entries(applicationsBySourceMap).map(([name, count]) => ({
                    name,
                    applications: count,
                    interviews: 0,
                    hires: 0,
                    conversionRate: 0,
                    averageCost: 0,
                })),
            },
            departmentAnalytics: {
                departments: [],
            },
            // Summary stats expected by RecruitmentAnalyticsService
            totalRequisitions,
            openRequisitions,
            totalApplications: totalApplications,
            applicationsBySource: applicationsBySourceMap,
            applicationsByStatus: applicationsByStatusMap,
            averageTimeToHire: 0,
            averageTimeToInterview: 0,
            offerAcceptanceRate,
            interviewsScheduled: scheduledInterviews,
            offersExtended: totalOffers,
            hires: acceptedOffers,
            backgroundChecks,
            generatedDate: new Date().toISOString(),
        };

        return NextResponse.json(analytics, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
});
