import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultAnalytics = {
      analyticsId: `analytics-${user.tenantId}`,
      period: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
      ticketMetrics: {
        totalTickets: 0,
        newTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0,
        reopenedTickets: 0,
        averageFirstResponseTime: 0,
        averageResolutionTime: 0,
        backlog: 0,
      },
      slaMetrics: {
        totalSLAs: 0,
        slaMet: 0,
        slaBreached: 0,
        slaAtRisk: 0,
        complianceRate: 0,
        averageBreachTime: 0,
      },
      agentMetrics: {
        totalAgents: 0,
        activeAgents: 0,
        averageTicketsPerAgent: 0,
        topPerformers: [],
      },
      categoryBreakdown: [],
      satisfactionMetrics: {
        totalSurveys: 0,
        responseRate: 0,
        averageRating: 0,
        ratingDistribution: [],
        netPromoterScore: 0,
      },
      trends: [],
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: defaultAnalytics },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching helpdesk analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
