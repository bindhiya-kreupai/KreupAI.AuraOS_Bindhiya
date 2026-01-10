import { NextRequest, NextResponse } from 'next/server';
import { remoteWorkService } from '@/lib/services/engagement';

/**
 * GET /api/engagement/remote-work
 * Get remote work policies, assignments, and statistics
 */
export async function GET(request: NextRequest) {
    try {
        const tenantId = request.headers.get('x-tenant-id') || 'default';
        const type = request.nextUrl.searchParams.get('type');

        switch (type) {
            case 'policies':
                const policiesResult = await remoteWorkService.getPolicies(tenantId);
                return NextResponse.json({ policies: policiesResult.data });

            case 'assignments':
                const assignmentsResult = await remoteWorkService.getAssignments(tenantId);
                return NextResponse.json({ assignments: assignmentsResult.data });

            case 'equipment':
                const equipmentResult = await remoteWorkService.getEquipmentInventory(tenantId);
                return NextResponse.json({ equipment: equipmentResult.data });

            case 'metrics':
                const metricsResult = await remoteWorkService.getTeamMetrics(tenantId);
                return NextResponse.json({ teamMetrics: metricsResult.data });

            case 'requests':
                const status = request.nextUrl.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
                const requestsResult = await remoteWorkService.getRequests(tenantId, status || undefined);
                return NextResponse.json({ requests: requestsResult.data });

            case 'statistics':
                const statsResult = await remoteWorkService.getStatistics(tenantId);
                return NextResponse.json({ statistics: statsResult.data });

            default:
                // Return all overview data
                const [policies, assignments, stats] = await Promise.all([
                    remoteWorkService.getPolicies(tenantId),
                    remoteWorkService.getAssignments(tenantId),
                    remoteWorkService.getStatistics(tenantId),
                ]);
                return NextResponse.json({
                    policies: policies.data,
                    assignments: assignments.data?.slice(0, 5),
                    statistics: stats.data,
                });
        }
    } catch (error) {
        console.error('Remote Work API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/engagement/remote-work
 * Submit remote work request
 */
export async function POST(request: NextRequest) {
    try {
        const tenantId = request.headers.get('x-tenant-id') || 'default';
        const userId = request.headers.get('x-user-id') || 'system';
        const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

        const body = await request.json();

        const result = await remoteWorkService.submitRequest(tenantId, body, userId, ipAddress);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ request: result.data }, { status: 201 });
    } catch (error) {
        console.error('Remote Work Request API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PUT /api/engagement/remote-work
 * Review remote work request (approve/reject)
 */
export async function PUT(request: NextRequest) {
    try {
        const tenantId = request.headers.get('x-tenant-id') || 'default';
        const userId = request.headers.get('x-user-id') || 'system';
        const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

        const body = await request.json();
        const { requestId, decision, comments } = body;

        if (!requestId || !decision) {
            return NextResponse.json({ error: 'Request ID and decision are required' }, { status: 400 });
        }

        const result = await remoteWorkService.reviewRequest(
            tenantId,
            requestId,
            decision,
            comments || '',
            userId,
            ipAddress
        );

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ request: result.data });
    } catch (error) {
        console.error('Remote Work Review API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
