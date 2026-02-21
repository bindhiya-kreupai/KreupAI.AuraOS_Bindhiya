import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * Default pipeline stages definition.
 * Used when building pipeline data from application stage counts.
 */
const DEFAULT_PIPELINE_STAGES = [
    { name: 'Application Received', order: 1, type: 'Application', key: 'applied' },
    { name: 'Screening', order: 2, type: 'Screening', key: 'screening' },
    { name: 'Interview', order: 3, type: 'Interview', key: 'interview' },
    { name: 'Assessment', order: 4, type: 'Assessment', key: 'assessment' },
    { name: 'Offer', order: 5, type: 'Offer', key: 'offer' },
    { name: 'Hired', order: 6, type: 'Onboarding', key: 'hired' },
    { name: 'Rejected', order: 7, type: 'Terminal', key: 'rejected' },
];

/**
 * GET /api/recruitment/pipeline
 * Fetch hiring pipeline data derived from real application stage counts
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;

        // Group candidate applications by currentStage to derive pipeline data
        const stageGroups = await prisma.candidateApplication.groupBy({
            by: ['currentStage'],
            _count: { id: true },
        });

        // Build a map of stage -> count
        const stageCountMap: Record<string, number> = {};
        stageGroups.forEach((entry) => {
            stageCountMap[entry.currentStage.toLowerCase()] = entry._count.id;
        });

        // Build pipeline stages with real counts
        const stages = DEFAULT_PIPELINE_STAGES.map((stage) => ({
            id: `stage_${stage.order}`,
            name: stage.name,
            order: stage.order,
            type: stage.type,
            count: stageCountMap[stage.key] || 0,
            isRequired: true,
        }));

        const totalCandidates = stageGroups.reduce((sum, g) => sum + g._count.id, 0);

        // Build the pipeline object
        const pipeline = {
            id: 'default-pipeline',
            tenantId: user.tenantId,
            name: 'Default Hiring Pipeline',
            description: 'Standard hiring pipeline derived from application stages',
            isDefault: true,
            isActive: true,
            stages,
            totalCandidates,
            createdBy: 'system',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, items: [pipeline] }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch pipeline data' },
            { status: 500 }
        );
    }
});

/**
 * POST /api/recruitment/pipeline
 * Create a new hiring pipeline (placeholder - pipeline structure is system-defined)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
    try {
        const { user } = context;
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.stages || !Array.isArray(body.stages)) {
            return NextResponse.json(
                { error: 'name and stages array are required' },
                { status: 400 }
            );
        }

        // Since there is no HiringPipeline model in the schema, return the submitted
        // data with an ID. In a future iteration, a dedicated model can be added.
        const newPipeline = {
            id: `pipeline_${Date.now()}`,
            tenantId: user.tenantId,
            createdBy: user.userId,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            isActive: true,
            ...body,
        };

        return NextResponse.json({ success: true, data: newPipeline, items: [newPipeline] }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create pipeline' },
            { status: 500 }
        );
    }
});
