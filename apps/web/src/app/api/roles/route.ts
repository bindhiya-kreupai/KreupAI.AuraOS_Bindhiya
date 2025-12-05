import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(roles);
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, status } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const existing = await prisma.role.findUnique({ where: { name } });
        if (existing) {
            return NextResponse.json({ error: 'Role already exists' }, { status: 409 });
        }

        const newRole = await prisma.role.create({
            data: { name, description, status },
        });

        return NextResponse.json(newRole);
    } catch (error) {
        console.error('Failed to create role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, description, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const updatedRole = await prisma.role.update({
            where: { id },
            data: { name, description, status },
        });

        return NextResponse.json(updatedRole);
    } catch (error) {
        console.error('Failed to update role:', error);
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

        await prisma.role.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
