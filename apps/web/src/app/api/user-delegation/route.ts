import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const delegations = await prisma.userDelegation.findMany({
            include: {
                delegator: { select: { email: true } },
                delegatee: { select: { email: true } },
            },
            orderBy: { startDate: 'desc' },
        });
        return NextResponse.json(delegations);
    } catch (error) {
        console.error('Failed to fetch delegations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { delegatorId, delegateeId, role, startDate, endDate, reason } = body;

        if (!delegatorId || !delegateeId || !role || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newDelegation = await prisma.userDelegation.create({
            data: {
                delegatorId,
                delegateeId,
                role,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                status: 'Scheduled',
            },
        });

        return NextResponse.json(newDelegation);
    } catch (error) {
        console.error('Failed to create delegation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.userDelegation.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete delegation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
