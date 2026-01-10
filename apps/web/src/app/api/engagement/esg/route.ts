import { NextRequest, NextResponse } from 'next/server';
import { esgService } from '@/lib/services/engagement';

/**
 * GET /api/engagement/esg
 * Get ESG metrics, initiatives, and goals
 */
export async function GET(request: NextRequest) {
    try {
        const tenantId = request.headers.get('x-tenant-id') || 'default';
        const category = request.nextUrl.searchParams.get('category') as 'environmental' | 'social' | 'governance' | null;

        const [metricsResult, initiativesResult, goalsResult] = await Promise.all([
            esgService.getMetrics(tenantId),
            esgService.getInitiatives(tenantId, category || undefined),
            esgService.getGoals(tenantId),
        ]);

        if (!metricsResult.success) {
            return NextResponse.json({ error: metricsResult.error }, { status: 500 });
        }

        return NextResponse.json({
            metrics: metricsResult.data,
            initiatives: initiativesResult.data,
            goals: goalsResult.data,
        });
    } catch (error) {
        console.error('ESG API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/engagement/esg/report
 * Generate ESG report
 */
export async function POST(request: NextRequest) {
    try {
        const tenantId = request.headers.get('x-tenant-id') || 'default';
        const userId = request.headers.get('x-user-id') || 'system';
        const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

        const body = await request.json();
        const { period } = body;

        if (!period) {
            return NextResponse.json({ error: 'Period is required' }, { status: 400 });
        }

        const result = await esgService.generateReport(tenantId, period, userId, ipAddress);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ report: result.data }, { status: 201 });
    } catch (error) {
        console.error('ESG Report API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
