import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const clearances = await db.securityClearance.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ clearances });
  } catch (error) {
    console.error('Failed to fetch security clearances:', error);
    return NextResponse.json({ error: 'Failed to fetch security clearances' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clearance = await db.securityClearance.create({
      data: {
        clearanceId: body.clearanceId || `sec-${Date.now()}`,
        employeeId: body.employeeId,
        employeeName: body.employeeName || 'Unknown Employee',
        department: body.department,
        position: body.position,
        clearanceLevel: body.clearanceLevel,
        status: body.status || 'active',
        grantedDate: body.grantedDate ? new Date(body.grantedDate) : new Date(),
        expiryDate: body.expiryDate
          ? new Date(body.expiryDate)
          : new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
        investigationType: body.investigationType,
        investigationDetails: body.investigationDetails || {},
        polygraphRequired: body.polygraphRequired || false,
        polygraphStatus: body.polygraphStatus || null,
        continuousEvaluation: body.continuousEvaluation || {},
        accessAuthorizations: body.accessAuthorizations || [],
        suspensionHistory: body.suspensionHistory || [],
        debriefRequired: body.debriefRequired || false,
      },
    });
    return NextResponse.json({ clearance }, { status: 201 });
  } catch (error) {
    console.error('Failed to create security clearance:', error);
    return NextResponse.json({ error: 'Failed to create security clearance' }, { status: 500 });
  }
}
