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
    employeeId: s.employeeId,
    fiscalYear: s.fiscalYear,
    generatedDate: s.generatedDate?.toISOString() || null,
    directCompensation: s.directCompensation ?? {},
    benefits: s.benefits ?? {},
    stockCompensation: s.stockCompensation ?? {},
    otherCompensation: s.otherCompensation ?? {},
    totalRewards: Number(s.totalRewards),
    currency: s.currency,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (employeeId) where.employeeId = employeeId;

    const statements = await prisma.totalRewardsStatement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: statements.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching total rewards statements:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch total rewards statements',
        message: 'Failed to fetch total rewards statements',
        messageAr: 'فشل جلب بيانات إجمالي المكافآت',
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
    if (!body.employeeId || !body.fiscalYear) {
      return NextResponse.json(
        {
          success: false,
          error: 'employeeId and fiscalYear are required',
          message: 'employeeId and fiscalYear are required',
          messageAr: 'معرّف الموظف والسنة المالية مطلوبان',
        },
        { status: 400 }
      );
    }

    const employeeId = body.employeeId as string;
    const fiscalYear = String(body.fiscalYear);

    // Base salary + allowances from the active salary structure
    const salaryStructure = await prisma.employeeSalaryStructure.findFirst({
      where: { tenantId: user.tenantId, employeeId, isActive: true, isDeleted: false },
      orderBy: { effectiveFrom: 'desc' },
    });
    const baseSalary = salaryStructure ? Number(salaryStructure.basicSalary) : 0;
    const allowances = salaryStructure
      ? Number(salaryStructure.houseRentAllowance) + Number(salaryStructure.transportAllowance)
      : 0;
    const healthInsurance = salaryStructure ? Number(salaryStructure.medicalInsurance) : 0;
    const lifeInsurance = salaryStructure ? Number(salaryStructure.lifeInsurance) : 0;

    // Bonus total from payroll adjustments
    const bonusAdjustments = await prisma.payrollAdjustment.findMany({
      where: { tenantId: user.tenantId, employeeId, category: 'BONUS', isDeleted: false },
    });
    const bonus = bonusAdjustments.reduce((sum, a) => sum + Number(a.amount), 0);

    // Stock grants value + vested value
    const stockGrants = await prisma.stockGrant.findMany({
      where: { tenantId: user.tenantId, employeeId, isDeleted: false },
    });
    const stockGrantsValue = stockGrants.reduce((sum, g) => sum + Number(g.totalValue), 0);
    const vestedValue = stockGrants.reduce(
      (sum, g) => sum + g.vestedUnits * Number(g.fairMarketValue),
      0
    );
    const unvestedValue = Math.max(0, stockGrantsValue - vestedValue);

    const directTotal = baseSalary + allowances + bonus + 0 + 0;
    const directCompensation = {
      baseSalary,
      allowances,
      bonus,
      incentives: 0,
      overtime: 0,
      total: directTotal,
    };

    const benefitsTotal = healthInsurance + lifeInsurance + 0 + 0 + 0;
    const benefits = {
      healthInsurance,
      lifeInsurance,
      retirementContributions: 0,
      paidTimeOff: 0,
      otherBenefits: 0,
      total: benefitsTotal,
    };

    const stockTotal = stockGrantsValue;
    const stockCompensation = {
      stockGrantsValue,
      vestedValue,
      unvestedValue,
      total: stockTotal,
    };

    const otherCompensation = {
      loans: 0,
      advances: 0,
      reimbursements: 0,
      perquisites: 0,
      total: 0,
    };

    const totalRewards = directTotal + benefitsTotal + stockTotal + 0;
    const currency = body.currency || (salaryStructure ? 'USD' : 'USD');

    const existing = await prisma.totalRewardsStatement.findFirst({
      where: { tenantId: user.tenantId, employeeId, fiscalYear, isDeleted: false },
    });

    let statement;
    if (existing) {
      // tenant-ok: id-based update preceded by tenant-scoped findFirst above
      statement = await prisma.totalRewardsStatement.update({
        where: { id: existing.id },
        data: {
          generatedDate: new Date(),
          directCompensation,
          benefits,
          stockCompensation,
          otherCompensation,
          totalRewards,
          currency,
          updatedBy: user.userId,
        },
      });
    } else {
      statement = await prisma.totalRewardsStatement.create({
        data: {
          tenantId: user.tenantId,
          employeeId,
          fiscalYear,
          generatedDate: new Date(),
          directCompensation,
          benefits,
          stockCompensation,
          otherCompensation,
          totalRewards,
          currency,
          createdBy: user.userId,
        },
      });
    }

    return NextResponse.json(
      { success: true, data: serialize(statement) },
      { status: existing ? 200 : 201 }
    );
  } catch (error: any) {
    logger.error('Error generating total rewards statement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate total rewards statement',
        message: 'Failed to generate total rewards statement',
        messageAr: 'فشل إنشاء بيان إجمالي المكافآت',
      },
      { status: 500 }
    );
  }
});
