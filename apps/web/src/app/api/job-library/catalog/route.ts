
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export async function GET() {
    try {
        const jobs = await prisma.jobProfile.findMany({
            include: {
                family: true,
                grade: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(jobs);
    } catch (error) {
        console.error('Error fetching job catalog:', error);
        return NextResponse.json({ error: 'Failed to fetch job catalog' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, title, familyId, gradeId, description, status } = body;

        const job = await prisma.jobProfile.create({
            data: {
                code,
                title,
                description,
                familyId,
                gradeId,
                status: status || 'Active'
            }
        });
        return NextResponse.json(job);
    } catch (error) {
        console.error('Error creating job profile:', error);
        return NextResponse.json({ error: 'Failed to create job profile' }, { status: 500 });
    }
}
