import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch statutory deductions / payments
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const statutoryType = searchParams.get('type') || searchParams.get('statutoryType');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: Record<string, unknown> = { tenantId };
    if (month) where.paymentMonth = month;
    if (statutoryType) where.statutoryType = statutoryType;
    if (status) where.status = status;

    const [total, payments] = await Promise.all([
      prisma.statutoryPayment.count({ where }),
      prisma.statutoryPayment.findMany({
        where,
        orderBy: { paymentMonth: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Compute summary
    const summary = {
      totalPayments: total,
      totalPF: payments
        .filter((p) => p.statutoryType === 'PF')
        .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0),
      totalESI: payments
        .filter((p) => p.statutoryType === 'ESI')
        .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0),
      totalPT: payments
        .filter((p) => p.statutoryType === 'PT')
        .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0),
      totalTDS: payments
        .filter((p) => p.statutoryType === 'TDS')
        .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0),
      totalGOSI: payments
        .filter((p) => p.statutoryType === 'GOSI')
        .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0),
    };

    // Map to frontend shape
    const reports = payments.map((p) => ({
      id: p.id,
      payrollRunId: p.payrollRunId,
      paymentMonth: p.paymentMonth,
      statutoryType: p.statutoryType,
      employeeContribution: Number(p.employeeContribution || 0),
      employerContribution: Number(p.employerContribution || 0),
      totalAmount: Number(p.totalAmount || 0),
      challanNumber: p.challanNumber,
      paymentDate: p.paymentDate?.toISOString(),
      paymentReference: p.paymentReference,
      status: p.status,
      isPaid: p.isPaid,
      bankName: p.bankName,
      accountNumber: p.accountNumber,
      ifscCode: p.ifscCode,
    }));

    return NextResponse.json({
      success: true,
      data: { payments: reports, summary, month: month || new Date().toISOString().slice(0, 7) },
      reports,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Error fetching statutory deductions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statutory deductions' },
      { status: 500 }
    );
  }
});

// POST - Mark statutory payment as filed/paid
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const body = await request.json();
    const { id, challanNumber, paymentReference, bankName, accountNumber, ifscCode } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Payment id is required' },
        { status: 400 }
      );
    }

    // Verify the payment belongs to this tenant
    const existing = await prisma.statutoryPayment.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Statutory payment not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.statutoryPayment.update({
      where: { id },
      data: {
        status: 'PAID',
        isPaid: true,
        paymentDate: new Date(),
        challanNumber: challanNumber || existing.challanNumber,
        paymentReference: paymentReference || existing.paymentReference,
        bankName: bankName || existing.bankName,
        accountNumber: accountNumber || existing.accountNumber,
        ifscCode: ifscCode || existing.ifscCode,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'UPDATE',
        module: 'Payroll - Statutory Deductions',
        resourceType: 'Payroll - Statutory Deductions',
        metadata: {
          description: `Marked ${existing.statutoryType} payment as PAID for ${existing.paymentMonth}${challanNumber ? ` - Challan: ${challanNumber}` : ''}`,
        } as any,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error('Error filing statutory payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to file statutory payment' },
      { status: 500 }
    );
  }
});
