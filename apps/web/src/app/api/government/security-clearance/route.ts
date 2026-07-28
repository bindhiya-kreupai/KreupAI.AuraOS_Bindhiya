import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const clearances = await db.securityClearance.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clearances);
  } catch (error) {
    console.error('Failed to fetch security clearances:', error);
    return NextResponse.json({ error: 'Failed to fetch security clearances' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const grantedDate = body.grantedDate || new Date().toISOString();

    // Calculate expiry 10 years later for Secret, 5 for Top Secret
    const expiryYears = body.clearanceLevel?.toLowerCase() === 'top secret' ? 5 : 10;
    const expiryDate = new Date(
      new Date(grantedDate).getTime() + expiryYears * 365 * 24 * 60 * 60 * 1000
    ).toISOString();

    const investigationType =
      body.clearanceLevel?.toLowerCase() === 'top secret'
        ? 'Tier 5 Investigation'
        : 'Tier 3 Investigation';

    const investigationDetails = body.investigationDetails || {};
    const continuousEvaluation = body.continuousEvaluation || {};
    const accessAuthorizations = body.accessAuthorizations || [];

    const clearance = await db.securityClearance.create({
      data: {
        clearanceId: body.clearanceId || `clearance-${Date.now()}`,
        employeeId: body.employeeId || `emp-${Date.now()}`,
        employeeName: body.employeeName || 'New Clearance Holder',
        department: body.department || 'Department of Defense',
        position: body.position || 'Analyst',
        clearanceLevel: body.clearanceLevel || 'Secret',
        status: body.status || 'active',
        grantedDate: new Date(grantedDate),
        expiryDate: new Date(expiryDate),
        investigationType,
        investigationDetails,
        polygraphRequired: body.polygraphRequired ?? false,
        continuousEvaluation,
        accessAuthorizations,
        suspensionHistory: [],
        debriefRequired: true,
      },
    });

    return NextResponse.json(clearance, { status: 201 });
  } catch (error) {
    console.error('Failed to create security clearance:', error);
    return NextResponse.json({ error: 'Failed to create security clearance' }, { status: 500 });
  }
}
