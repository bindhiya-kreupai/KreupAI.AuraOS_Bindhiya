import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const logs = await prisma.auditLog.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { timestamp: 'desc' },
            take: 100, // Limit to last 100 logs for performance
        });
        return NextResponse.json(logs);
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
