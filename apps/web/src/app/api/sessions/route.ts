import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const sessions = await prisma.userSession.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { lastActive: 'desc' },
        });
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Failed to fetch sessions:', error);
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

        // Soft delete or update status
        await prisma.userSession.update({
            where: { id },
            data: { status: 'Revoked' },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to revoke session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
