import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                tenant: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, tenantId } = body;

        if (!email || !password || !tenantId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // In a real app, hash the password here.
        // For this demo/prototype, we are storing it plain text or simple hash.
        // TODO: Implement proper bcrypt hashing
        const hashedPassword = password;

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                tenantId,
            },
            include: {
                tenant: true,
            },
        });

        return NextResponse.json(newUser);
    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, email, password, tenantId } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = { email, tenantId };
        if (password) {
            updateData.password = password; // TODO: Hash this
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                tenant: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
