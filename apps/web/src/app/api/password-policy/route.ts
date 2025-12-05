import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const policy = await prisma.passwordPolicy.findFirst();
        return NextResponse.json(policy || {});
    } catch (error) {
        console.error('Failed to fetch password policy:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Upsert logic: update if exists, create if not
        // Since we don't have a unique key other than ID, and we want a singleton,
        // we'll check if one exists first.

        const existing = await prisma.passwordPolicy.findFirst();

        let result;
        if (existing) {
            result = await prisma.passwordPolicy.update({
                where: { id: existing.id },
                data: body,
            });
        } else {
            result = await prisma.passwordPolicy.create({
                data: body,
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to save password policy:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
