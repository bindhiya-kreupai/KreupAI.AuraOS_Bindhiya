import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/jobs
 * Fetch all job postings for the authenticated user's tenant
 */
export const GET = withEnhancedAuth(async (request: NextRequest, _context) => {
    try {
        const { searchParams } = new URL(request.url);
        const isActive = searchParams.get('isActive');

        const jobs = await prisma.jobPosting.findMany({
            where: {
                ...(isActive !== null && { status: isActive === 'true' ? 'Active' : 'Draft' })
            },
            orderBy: { postedDate: 'desc' }
        });

        // Transform database format to UI format
        const transformedJobs = jobs.map(job => ({
            ...job,
            isActive: job.status === 'Active',
            metrics: {
                views: job.views,
                clicks: job.clicks,
                applies: job.applies
            }
        }));

        return NextResponse.json({ data: transformedJobs }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
});

/**
 * POST /api/recruitment/jobs
 * Create a new job posting
 */
export const POST = withEnhancedAuth(async (request: NextRequest, _context) => {
    try {
        const body = await request.json();

        const job = await prisma.jobPosting.create({
            data: {
                title: body.title,
                department: body.department,
                location: body.location,
                type: body.type,
                status: body.status || 'Draft',
                description: body.description || null,
                postedDate: new Date(),
                views: 0,
                clicks: 0,
                applies: 0,
                channels: body.channels || null
            }
        });

        // Transform to UI format
        const transformedJob = {
            ...job,
            isActive: job.status === 'Active',
            metrics: {
                views: job.views,
                clicks: job.clicks,
                applies: job.applies
            }
        };

        return NextResponse.json({ data: transformedJob }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
});
