import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const required = ['employeeId', 'punchType', 'latitude', 'longitude'];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    if (body.latitude < -90 || body.latitude > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude' },
        { status: 400 }
      );
    }

    if (body.longitude < -180 || body.longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid longitude' },
        { status: 400 }
      );
    }

    const now = new Date();

    const punch = await prisma.attendancePunch.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        punchDate: now,
        punchTime: now,
        punchType: body.punchType,
        location: `${body.latitude},${body.longitude}`,
        device: body.deviceId || 'GPS',
        ipAddress: request.headers.get('x-forwarded-for') || null,
        photo: body.photoUrl || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { punch },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record punch' },
      { status: 500 }
    );
  }
});

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      where.punchDate = { gte: targetDate, lt: nextDate };
    }

    const punches = await prisma.attendancePunch.findMany({
      where,
      orderBy: { punchTime: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        punches,
        date: date || new Date().toISOString().split('T')[0],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch punch history' },
      { status: 500 }
    );
  }
});
