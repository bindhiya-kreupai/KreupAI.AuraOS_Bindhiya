import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const GET = withEnhancedAuth(async (request, context) => {
    try {
        const { user } = context;
        const tenantId = user.tenantId;

        // Proxy to analytics-service or recruitment-service
        // Based on Phase 3 plan, all consolidated dashboard metrics (including recruitment) 
        // should ideally be aggregated by the analytics-service.
        const result = await ServiceProxy.get('analytics', '/api/v1/recruitment/stats', {
            tenantId,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('[RecruitmentStats API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recruitment statistics' },
            { status: 500 }
        );
    }
});
