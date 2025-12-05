import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const items = await prisma.accessControl.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to fetch access controls:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, value, status } = body;

        if (!name || !type || !value) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newItem = await prisma.accessControl.create({
            data: { name, type, value, status },
        });

        return NextResponse.json(newItem);
    } catch (error) {
        console.error('Failed to create access control:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, type, value, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updatedItem = await prisma.accessControl.update({
            where: { id },
            data: { name, type, value, status },
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error('Failed to update access control:', error);
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

        await prisma.accessControl.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete access control:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
