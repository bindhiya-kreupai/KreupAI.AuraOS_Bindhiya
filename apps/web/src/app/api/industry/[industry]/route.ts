import { NextRequest, NextResponse } from 'next/server';
import { createIndustryService } from '@/lib/services/industry';

// Supported industries
const INDUSTRIES = [
    'agriculture', 'automotive', 'aviation', 'construction',
    'energy', 'financial', 'government', 'healthcare',
    'hospitality', 'logistics', 'manufacturing', 'maritime',
    'media', 'mining', 'nonprofit', 'retail'
];

/**
 * GET /api/industry/[industry]
 * Get industry configuration and metrics
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { industry: string } }
) {
    try {
        const { industry } = params;

        if (!INDUSTRIES.includes(industry)) {
            return NextResponse.json(
                { error: 'Invalid industry code' },
                { status: 400 }
            );
        }

        const service = createIndustryService(industry);

        // Get tenant from headers (set by auth middleware)
        const tenantId = request.headers.get('x-tenant-id') || 'default';

        const [configResult, metricsResult, complianceResult] = await Promise.all([
            service.getConfig(tenantId),
            service.getMetrics(tenantId),
            service.getComplianceRequirements(tenantId),
        ]);

        if (!configResult.success || !metricsResult.success || !complianceResult.success) {
            return NextResponse.json(
                { error: 'Failed to fetch industry data' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            industry,
            config: configResult.data,
            metrics: metricsResult.data,
            complianceRequirements: complianceResult.data,
        });
    } catch (error) {
        console.error('Industry API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/industry/[industry]
 * Update industry configuration
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { industry: string } }
) {
    try {
        const { industry } = params;

        if (!INDUSTRIES.includes(industry)) {
            return NextResponse.json(
                { error: 'Invalid industry code' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const service = createIndustryService(industry);

        const tenantId = request.headers.get('x-tenant-id') || 'default';
        const userId = request.headers.get('x-user-id') || 'system';
        const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

        const result = await service.upsertConfig(tenantId, body, userId, ipAddress);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        console.error('Industry API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
