import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/background-checks
 * Fetch background checks for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;
        const tenantId = user.tenantId;
        const { searchParams } = new URL(request.url);
        const candidateId = searchParams.get('candidateId');
        const applicationId = searchParams.get('applicationId');
        const status = searchParams.get('status');

        const where: Record<string, unknown> = { tenantId };
        if (candidateId) where.candidateId = candidateId;
        if (applicationId) where.applicationId = applicationId;
        if (status) where.status = status;

        const backgroundChecks = await prisma.backgroundCheck.findMany({
            where,
            orderBy: { requestDate: 'desc' },
        });

        return NextResponse.json({ success: true, items: backgroundChecks }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch background checks' },
            { status: 500 }
        );
    }
});

/**
 * POST /api/recruitment/background-checks
 * Initiate a new background check
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;
        const body = await request.json();

        // Validate required fields
        if (!body.checkType) {
            return NextResponse.json(
                { error: 'checkType is required' },
                { status: 400 }
            );
        }

        const backgroundCheck = await prisma.backgroundCheck.create({
            data: {
                tenantId: user.tenantId,
                applicationId: body.applicationId || null,
                candidateId: body.candidateId || null,
                employeeId: body.employeeId || null,
                checkType: body.checkType,
                provider: body.provider || null,
                status: 'pending',
                requestDate: new Date(),
                notes: body.notes || null,
                initiatedBy: user.userId,
            },
        });

        return NextResponse.json({ success: true, data: backgroundCheck, items: [backgroundCheck] }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to initiate background check' },
            { status: 500 }
        );
    }
});

/**
 * PUT /api/recruitment/background-checks
 * Update background check status
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Background check ID is required' },
                { status: 400 }
            );
        }

        // Verify the background check belongs to the tenant
        const existing = await prisma.backgroundCheck.findFirst({
            where: { id, tenantId: user.tenantId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Background check not found' },
                { status: 404 }
            );
        }

        const updateData: Record<string, unknown> = {};
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.result !== undefined) updateData.result = updates.result;
        if (updates.findings !== undefined) updateData.findings = updates.findings;
        if (updates.completionDate !== undefined) updateData.completionDate = new Date(updates.completionDate);
        if (updates.documentUrl !== undefined) updateData.documentUrl = updates.documentUrl;
        if (updates.notes !== undefined) updateData.notes = updates.notes;

        const backgroundCheck = await prisma.backgroundCheck.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, data: backgroundCheck }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to update background check' },
            { status: 500 }
        );
    }
});
