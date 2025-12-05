import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const deactivations = await prisma.userDeactivation.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { deactivatedAt: 'desc' },
        });
        return NextResponse.json(deactivations);
    } catch (error) {
        console.error('Failed to fetch deactivations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, reason, deactivatedBy } = body;

        if (!userId || !deactivatedBy) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Transaction to create deactivation record and update user status
        const [deactivation, user] = await prisma.$transaction([
            prisma.userDeactivation.create({
                data: { userId, reason, deactivatedBy },
            }),
            prisma.user.update({
                where: { id: userId },
                data: { status: 'Inactive' },
            }),
        ]);

        return NextResponse.json(deactivation);
    } catch (error) {
        console.error('Failed to deactivate user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
