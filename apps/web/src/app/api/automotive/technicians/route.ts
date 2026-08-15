import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = createProtectedRoute(async () => {
  try {
    const technicians = await db.technician.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ technicians });
  } catch (error) {
    console.error('Failed to fetch technicians:', error);
    return NextResponse.json({ error: 'Failed to fetch technicians' }, { status: 500 });
  }
});

export const POST = createProtectedRoute(async (request: Request) => {
  try {
    const body = await request.json();
    const technician = await db.technician.create({
      data: {
        technicianId: body.technicianId || `tech-${Date.now()}`,
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        status: body.status || 'active',
        certifications: body.certifications || [],
        skills: body.skills || [],
        hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
        hourlyRate: body.hourlyRate || 0,
        availability: body.availability || {},
        performance: body.performance || {},
      },
    });
    return NextResponse.json({ technician }, { status: 201 });
  } catch (error) {
    console.error('Failed to create technician:', error);
    return NextResponse.json({ error: 'Failed to create technician' }, { status: 500 });
  }
});
