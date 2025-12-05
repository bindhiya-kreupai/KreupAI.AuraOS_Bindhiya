import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const licenses = await prisma.license.findMany();
        return NextResponse.json(licenses);
    } catch (error) {
        console.error('Failed to fetch licenses:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, total, type, status } = body;

        if (!name || !total || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newLicense = await prisma.license.create({
            data: { name, total: parseInt(total), type, status },
        });

        return NextResponse.json(newLicense);
    } catch (error) {
        console.error('Failed to create license:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
