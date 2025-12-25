
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        const jobs = await prisma.jobPosting.findMany({
            orderBy: { postedDate: 'desc' }
        });
        return NextResponse.json(jobs);
    } catch {
        logger.error('Error fetching jobs:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const job = await prisma.jobPosting.create({
            data: {
                ...body,
                postedDate: new Date(),
                metrics: {
                    views: 0,
                    clicks: 0,
                    applies: 0
                }
            }
        });
        return NextResponse.json(job);
    } catch {
        logger.error('Error creating job:', error);
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
}
