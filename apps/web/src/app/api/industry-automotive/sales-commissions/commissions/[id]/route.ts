import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const PUT = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const id = context.params.id;
      const body = await request.json();

      const existing = await prisma.automotiveSalesCommission.findFirst({
        where: { tenantId, id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      // Handle nested period object in body if present
      const dataToUpdate = { ...body };
      if (body.period) {
        dataToUpdate.periodStart = body.period.start
          ? new Date(body.period.start)
          : existing.periodStart;
        dataToUpdate.periodEnd = body.period.end ? new Date(body.period.end) : existing.periodEnd;
        delete dataToUpdate.period;
      }

      const comm = await prisma.automotiveSalesCommission.update({
        where: { id: existing.id },
        data: {
          ...dataToUpdate,
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json(
        {
          commission: {
            commissionId: comm.id,
            salesPersonId: comm.salesPersonId,
            salesPersonName: comm.salesPersonName,
            period: { start: comm.periodStart, end: comm.periodEnd },
            totalVehicleSales: comm.totalVehicleSales,
            totalServiceSales: comm.totalServiceSales,
            totalSalesAmount: comm.totalSalesAmount,
            baseCommission: comm.baseCommission,
            totalBonuses: comm.totalBonuses,
            totalDeductions: comm.totalDeductions,
            netCommission: comm.netCommission,
            commissionRate: comm.commissionRate,
            status: comm.status,
            calculatedDate: comm.calculatedDate,
            paymentDate: comm.paymentDate,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error updating commission:', error);
      return NextResponse.json(
        { error: 'Failed to update commission', details: error.message },
        { status: 500 }
      );
    }
  },
  { requiredPermissions: [] }
);

export const DELETE = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const tenantId = context.auth!.tenantId;
      const id = context.params.id;

      const existing = await prisma.automotiveSalesCommission.findFirst({
        where: { tenantId, id, isDeleted: false },
      });

      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      await prisma.automotiveSalesCommission.update({
        where: { id: existing.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: context.auth!.userId,
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting commission:', error);
      return NextResponse.json(
        { error: 'Failed to delete commission', details: error.message },
        { status: 500 }
      );
    }
  },
  { requiredPermissions: [] }
);
