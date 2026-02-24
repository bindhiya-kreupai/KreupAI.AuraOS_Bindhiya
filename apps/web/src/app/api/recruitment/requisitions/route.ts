import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/requisitions
 * Fetch all job requisitions for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;
        const tenantId = user.tenantId;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const department = searchParams.get('departmentId') || searchParams.get('department');

        const where: Record<string, unknown> = { tenantId };
        if (status) where.status = status;
        if (department) where.department = department;

        const requisitions = await prisma.jobRequisition.findMany({
            where,
            orderBy: { requestedDate: 'desc' },
        });

        return NextResponse.json({ success: true, data: requisitions, items: requisitions }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch requisitions' },
            { status: 500 }
        );
    }
});

/**
 * POST /api/recruitment/requisitions
 * Create a new job requisition
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;
        const body = await request.json();

        const requisition = await prisma.jobRequisition.create({
            data: {
                tenantId: user.tenantId,
                jobTitle: body.jobTitle || body.title,
                department: body.department,
                requestedBy: body.requestedBy || user.userId,
                requestedDate: body.requestedDate ? new Date(body.requestedDate) : new Date(),
                numberOfPositions: body.numberOfPositions || 1,
                employmentType: body.employmentType || null,
                priority: body.priority || 'Medium',
                status: body.status || 'Draft',
                location: body.location || null,
                salaryRange: body.salaryRange || null,
                requiredSkills: body.requiredSkills || [],
                description: body.description || null,
                justification: body.justification || null,
                approvalStatus: 'Pending',
            },
        });

        return NextResponse.json({ success: true, data: requisition, items: [requisition] }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to create requisition' },
            { status: 500 }
        );
    }
});

/**
 * PUT /api/recruitment/requisitions
 * Update an existing job requisition
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Requisition ID is required' },
                { status: 400 }
            );
        }

        // Verify the requisition belongs to the tenant
        const existing = await prisma.jobRequisition.findFirst({
            where: { id, tenantId: user.tenantId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Requisition not found' },
                { status: 404 }
            );
        }

        // Build update data, only including fields that are provided
        const updateData: Record<string, unknown> = {};
        if (updates.jobTitle !== undefined) updateData.jobTitle = updates.jobTitle;
        if (updates.department !== undefined) updateData.department = updates.department;
        if (updates.numberOfPositions !== undefined) updateData.numberOfPositions = updates.numberOfPositions;
        if (updates.employmentType !== undefined) updateData.employmentType = updates.employmentType;
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.location !== undefined) updateData.location = updates.location;
        if (updates.salaryRange !== undefined) updateData.salaryRange = updates.salaryRange;
        if (updates.requiredSkills !== undefined) updateData.requiredSkills = updates.requiredSkills;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.justification !== undefined) updateData.justification = updates.justification;
        if (updates.approvalStatus !== undefined) updateData.approvalStatus = updates.approvalStatus;
        if (updates.approvedBy !== undefined) updateData.approvedBy = updates.approvedBy;
        if (updates.approvedDate !== undefined) updateData.approvedDate = new Date(updates.approvedDate);
        if (updates.rejectionReason !== undefined) updateData.rejectionReason = updates.rejectionReason;

        const requisition = await prisma.jobRequisition.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, data: requisition }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update requisition' },
            { status: 500 }
        );
    }
});
