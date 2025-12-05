import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const config = await prisma.sSOConfig.findFirst();
        return NextResponse.json(config || {});
    } catch (error) {
        console.error('Failed to fetch SSO config:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const existing = await prisma.sSOConfig.findFirst();

        let result;
        if (existing) {
            result = await prisma.sSOConfig.update({
                where: { id: existing.id },
                data: body,
            });
        } else {
            result = await prisma.sSOConfig.create({
                data: body,
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to save SSO config:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
