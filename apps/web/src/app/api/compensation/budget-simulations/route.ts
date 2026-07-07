import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function serialize(s: any) {
  return {
    id: s.id,
    tenantId: s.tenantId,
    simulationCode: s.simulationCode,
    simulationName: s.simulationName,
    description: s.description,
    fiscalYear: s.fiscalYear,
    scenarios: s.scenarios ?? [],
    comparison: s.comparison ?? {},
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (fiscalYear) where.fiscalYear = fiscalYear;

    const simulations = await prisma.budgetSimulation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: simulations.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching budget simulations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch budget simulations',
        message: 'Failed to fetch budget simulations',
        messageAr: 'فشل جلب محاكاة الميزانية',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    if (!body.simulationName) {
      return NextResponse.json(
        {
          success: false,
          error: 'simulationName is required',
          message: 'simulationName is required',
          messageAr: 'اسم المحاكاة مطلوب',
        },
        { status: 400 }
      );
    }

    const simulation = await prisma.budgetSimulation.create({
      data: {
        tenantId: user.tenantId,
        simulationCode: body.simulationCode || `BSM-${Date.now().toString(36).toUpperCase()}`,
        simulationName: body.simulationName,
        description: body.description || null,
        fiscalYear: body.fiscalYear || String(new Date().getFullYear()),
        scenarios: body.scenarios ?? undefined,
        comparison: body.comparison ?? undefined,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(simulation) }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating budget simulation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create budget simulation',
        message: 'Failed to create budget simulation',
        messageAr: 'فشل إنشاء محاكاة الميزانية',
      },
      { status: 500 }
    );
  }
});
