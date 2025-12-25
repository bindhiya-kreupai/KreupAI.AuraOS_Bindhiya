import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/analytics
 * Fetch recruitment analytics and statistics for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, week, month, quarter, year
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Mock data for recruitment analytics
    const mockAnalytics = {
      tenantId: user.tenantId,
      period,
      dateRange: {
        start: startDate || '2025-12-01T00:00:00Z',
        end: endDate || '2025-12-25T23:59:59Z',
      },
      overview: {
        totalJobs: 15,
        activeJobs: 8,
        totalApplications: 245,
        newApplicationsThisPeriod: 42,
        totalInterviews: 68,
        interviewsScheduled: 12,
        interviewsCompleted: 56,
        totalOffers: 18,
        offersPending: 3,
        offersAccepted: 12,
        offersRejected: 3,
        totalHires: 12,
        hiresThisPeriod: 5,
      },
      pipelineMetrics: {
        averageTimeToHire: 28, // days
        averageTimeToFirstInterview: 7,
        averageTimeToOffer: 21,
        offerAcceptanceRate: 66.67, // percentage
        applicationToInterviewRate: 27.76,
        interviewToOfferRate: 26.47,
      },
      sourceAnalytics: {
        sources: [
          {
            name: 'LinkedIn',
            applications: 98,
            interviews: 28,
            hires: 5,
            conversionRate: 5.1,
            averageCost: 2500,
          },
          {
            name: 'Company Website',
            applications: 65,
            interviews: 20,
            hires: 4,
            conversionRate: 6.15,
            averageCost: 0,
          },
          {
            name: 'Referral',
            applications: 42,
            interviews: 15,
            hires: 3,
            conversionRate: 7.14,
            averageCost: 1000,
          },
          {
            name: 'Indeed',
            applications: 30,
            interviews: 4,
            hires: 0,
            conversionRate: 0,
            averageCost: 1200,
          },
          {
            name: 'Glassdoor',
            applications: 10,
            interviews: 1,
            hires: 0,
            conversionRate: 0,
            averageCost: 800,
          },
        ],
      },
      departmentAnalytics: {
        departments: [
          {
            name: 'Engineering',
            openPositions: 4,
            applications: 142,
            interviews: 38,
            hires: 6,
            averageTimeToHire: 32,
          },
          {
            name: 'Product',
            openPositions: 2,
            applications: 48,
            interviews: 15,
            hires: 3,
            averageTimeToHire: 25,
          },
          {
            name: 'Sales',
            openPositions: 1,
            applications: 35,
            interviews: 10,
            hires: 2,
            averageTimeToHire: 20,
          },
          {
            name: 'Marketing',
            openPositions: 1,
            applications: 20,
            interviews: 5,
            hires: 1,
            averageTimeToHire: 28,
          },
        ],
      },
      costAnalytics: {
        totalRecruitmentCost: 45000,
        costPerHire: 3750,
        breakdown: {
          jobBoardFees: 15000,
          recruitingTools: 8000,
          backgroundChecks: 1200,
          agencyFees: 18000,
          referralBonuses: 2800,
        },
      },
      diversityMetrics: {
        genderDistribution: {
          male: 58,
          female: 38,
          nonBinary: 2,
          preferNotToSay: 2,
        },
        ethnicityDistribution: {
          asian: 32,
          white: 38,
          black: 15,
          hispanic: 10,
          other: 5,
        },
      },
      qualityOfHire: {
        averageRating: 4.3,
        retentionRate: 92, // percentage after 90 days
        performanceRating: 4.1,
      },
      topPerformers: {
        recruiters: [
          {
            id: 'recruiter_1',
            name: 'Bob Wilson',
            applicationsProcessed: 85,
            interviewsScheduled: 28,
            hires: 6,
            averageTimeToHire: 25,
          },
          {
            id: 'recruiter_2',
            name: 'Alice Johnson',
            applicationsProcessed: 72,
            interviewsScheduled: 24,
            hires: 4,
            averageTimeToHire: 30,
          },
        ],
        interviewers: [
          {
            id: 'emp_1',
            name: 'John Smith',
            interviewsConducted: 18,
            feedbackSubmissionRate: 100,
            averageRating: 4.5,
          },
          {
            id: 'emp_2',
            name: 'Jane Doe',
            interviewsConducted: 15,
            feedbackSubmissionRate: 93,
            averageRating: 4.3,
          },
        ],
      },
      trends: {
        applicationsByMonth: [
          { month: '2025-08', count: 35 },
          { month: '2025-09', count: 42 },
          { month: '2025-10', count: 58 },
          { month: '2025-11', count: 68 },
          { month: '2025-12', count: 42 },
        ],
        hiresByMonth: [
          { month: '2025-08', count: 2 },
          { month: '2025-09', count: 3 },
          { month: '2025-10', count: 4 },
          { month: '2025-11', count: 3 },
          { month: '2025-12', count: 5 },
        ],
      },
      generatedDate: new Date().toISOString(),
    };

    return NextResponse.json({ data: mockAnalytics }, { status: 200 });
  } catch {
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
