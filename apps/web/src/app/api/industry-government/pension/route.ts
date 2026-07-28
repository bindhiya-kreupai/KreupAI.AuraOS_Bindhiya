import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const pensions = await db.pensionScheme.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ pensions });
  } catch (error) {
    console.error('Failed to fetch pension schemes:', error);
    return NextResponse.json({ error: 'Failed to fetch pension schemes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pension = await db.pensionScheme.create({
      data: {
        pensionId: body.pensionId || `pens-${Date.now()}`,
        employeeId: body.employeeId,
        employeeName: body.employeeName || 'Unknown Employee',
        department: body.department,
        pensionType: body.pensionType,
        enrollmentDate: body.enrollmentDate ? new Date(body.enrollmentDate) : new Date(),
        serviceComputationDate: body.serviceComputationDate
          ? new Date(body.serviceComputationDate)
          : new Date(),
        yearsOfService: body.yearsOfService || 0,
        vestingStatus: body.vestingStatus || 'unvested',
        retirementEligibility: body.retirementEligibility || {},
        contributions: body.contributions || {},
        projections: body.projections || {},
        beneficiaries: body.beneficiaries || [],
        thriftSavingsPlan: body.thriftSavingsPlan || {},
        status: body.status || 'active',
      },
    });
    return NextResponse.json({ pension }, { status: 201 });
  } catch (error) {
    console.error('Failed to create pension scheme:', error);
    return NextResponse.json({ error: 'Failed to create pension scheme' }, { status: 500 });
  }
}
