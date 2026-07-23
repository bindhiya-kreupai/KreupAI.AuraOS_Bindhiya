import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const pensions = await db.pensionScheme.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(pensions);
  } catch (error) {
    console.error('Failed to fetch pension schemes:', error);
    return NextResponse.json({ error: 'Failed to fetch pension schemes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const enrollmentDate = body.enrollmentDate || new Date().toISOString();
    const employeeAge = parseInt(body.employeeAge) || 30;
    const baseSalary = parseFloat(body.baseSalary) || 75000;

    const retirementEligibility = body.retirementEligibility || {};
    const contributions = body.contributions || {};
    const projections = body.projections || {};
    const thriftSavingsPlan = body.thriftSavingsPlan || {};

    const pension = await db.pensionScheme.create({
      data: {
        pensionId: body.pensionId || `pension-${Date.now()}`,
        employeeId: body.employeeId || `emp-${Date.now()}`,
        employeeName: body.employeeName || 'New Employee',
        department: body.department || 'Department of Defense',
        pensionType: body.pensionType || 'fers',
        enrollmentDate: new Date(enrollmentDate),
        serviceComputationDate: new Date(enrollmentDate),
        yearsOfService: 0,
        vestingStatus: 'not_vested',
        retirementEligibility,
        contributions,
        projections,
        beneficiaries: [],
        thriftSavingsPlan,
        status: 'active',
      },
    });

    return NextResponse.json(pension, { status: 201 });
  } catch (error) {
    console.error('Failed to create pension scheme:', error);
    return NextResponse.json({ error: 'Failed to create pension scheme' }, { status: 500 });
  }
}
