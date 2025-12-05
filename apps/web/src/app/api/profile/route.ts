import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        // In a real app, get userId from session/token
        // For now, we'll accept a query param or return a mock/first user
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            // Fallback to first user for demo
            const firstUser = await prisma.user.findFirst({
                include: { employee: true }
            });
            if (!firstUser) return NextResponse.json({ error: 'No user found' }, { status: 404 });
            return NextResponse.json(firstUser);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, firstName, lastName, email } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Update User and Employee if linked
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                email, // Assuming email update is allowed
                employee: {
                    update: {
                        firstName,
                        lastName,
                        email,
                    }
                }
            },
            include: { employee: true },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Failed to update profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
