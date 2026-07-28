import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET(req: Request) {
  try {
    const locums = await (db as any).locumProvider.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        assignments: true,
      },
    });

    const mappedLocums = locums.map((l: any) => ({
      id: l.id,
      providerId: l.id,
      providerName: l.providerName,
      specialty: l.specialty,
      hourlyRate: l.hourlyRate ? parseFloat(l.hourlyRate) : 0,
      status: l.status,
      performanceRating: l.performanceRating != null ? parseFloat(l.performanceRating) : 0,
      assignments: (l.assignments || []).map((a: any) => ({
        assignmentId: a.id,
        facility: a.facilityId,
        specialty: l.specialty,
        startDate: a.startDate,
        endDate: a.endDate,
        rate: a.hourlyRate ? parseFloat(a.hourlyRate) : 0,
        totalHours: a.totalHours,
        totalCompensation: a.totalCost ? parseFloat(a.totalCost) : 0,
        status: a.status,
      })),
    }));

    return NextResponse.json({ locums: mappedLocums });
  } catch (error: any) {
    console.error('Failed to fetch locum providers:', error);
    return NextResponse.json({ error: 'Failed to fetch locum providers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newLocum = await (db as any).locumProvider.create({
      data: {
        tenantId: 'default-tenant',
        providerName: body.providerName,
        specialty: body.specialty || 'General',
        hourlyRate: parseFloat(body.hourlyRate) || 0,
        performanceRating:
          body.performanceRating != null ? parseFloat(body.performanceRating) : 5.0,
        status: 'ACTIVE',
        assignments: {
          create: (body.assignments || []).map((a: any) => ({
            tenantId: 'default-tenant',
            facilityId: a.facility || 'Hospital',
            startDate: a.startDate ? new Date(a.startDate) : new Date(),
            endDate: a.endDate ? new Date(a.endDate) : new Date(),
            hourlyRate: a.rate ? parseFloat(a.rate) : parseFloat(body.hourlyRate || 0),
            totalHours: a.totalHours ? parseFloat(a.totalHours) : 0,
            totalCost: a.totalCompensation ? parseFloat(a.totalCompensation) : 0,
            status: a.status || 'CONFIRMED',
          })),
        },
      },
      include: {
        assignments: true,
      },
    });

    const mappedLocum = {
      id: newLocum.id,
      providerId: newLocum.id,
      providerName: newLocum.providerName,
      specialty: newLocum.specialty,
      hourlyRate: newLocum.hourlyRate ? parseFloat(newLocum.hourlyRate) : 0,
      status: newLocum.status,
      performanceRating:
        newLocum.performanceRating != null ? parseFloat(newLocum.performanceRating) : 5.0,
      assignments: (newLocum.assignments || []).map((a: any) => ({
        assignmentId: a.id,
        facility: a.facilityId,
        specialty: newLocum.specialty,
        startDate: a.startDate,
        endDate: a.endDate,
        rate: a.hourlyRate ? parseFloat(a.hourlyRate) : 0,
        totalHours: a.totalHours,
        totalCompensation: a.totalCost ? parseFloat(a.totalCost) : 0,
        status: a.status,
      })),
    };

    return NextResponse.json({ locum: mappedLocum }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create locum provider:', error);
    return NextResponse.json({ error: 'Failed to create locum provider' }, { status: 500 });
  }
}
