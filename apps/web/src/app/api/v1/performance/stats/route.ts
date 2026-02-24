import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const GET = withEnhancedAuth(async (request, context) => {
    try {
        const { user } = context;
        const tenantId = user.tenantId;

        // Proxy to analytics-service for performance-related dashboard metrics
        const result = await ServiceProxy.get('analytics', '/api/v1/performance/stats', {
            tenantId,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[PerformanceStats API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch performance statistics' },
            { status: 500 }
        );
    }
});
