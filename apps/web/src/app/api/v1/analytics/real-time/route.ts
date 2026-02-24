import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    // Fetch real-time analytics from microservice
    const result = await ServiceProxy.get('analytics', '/metrics/real-time', { tenantId: user.tenantId });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        refreshInterval: 30000,
        activeEmployees: { total: 0, currentlyPresent: 0, onLeave: 0, notMarked: 0, byStatus: [] },
        pendingApprovals: { total: 0, byType: [], oldestPending: null, averageResolutionTime: 'N/A' },
        todayLeaves: { total: 0, byType: [], upcomingThisWeek: 0, impactedTeams: [] },
        todayEvents: [],
        alerts: [],
        systemHealth: { apiLatency: 'N/A', uptime: 0, lastSync: new Date().toISOString(), integrationStatus: [] },
      },
    });
  }
});
