import { NextResponse } from 'next/server';
import { prisma as db } from '@aura/database';

export async function GET() {
  try {
    const policies = await db.insurancePolicy.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Failed to fetch insurance policies:', error);
    return NextResponse.json({ error: 'Failed to fetch insurance policies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const policy = await db.insurancePolicy.create({
      data: {
        policyId: body.policyId || `pol-${Date.now()}`,
        policyType: body.policyType,
        policyNumber: body.policyNumber,
        status: body.status || 'active',
        holder: body.holder || {},
        riskProfile: body.riskProfile || null,
        coverage: body.coverage || {},
        riders: body.riders || [],
        premium: body.premium || {},
        deductible: body.deductible,
        beneficiaries: body.beneficiaries || [],
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : new Date(),
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : new Date(),
        documents: body.documents || [],
      },
    });
    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Failed to create insurance policy:', error);
    return NextResponse.json({ error: 'Failed to create insurance policy' }, { status: 500 });
  }
}
