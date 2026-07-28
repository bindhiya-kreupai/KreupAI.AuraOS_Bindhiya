import { NextRequest, NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const GET = createProtectedRoute(
  async (request, { auth }) => {
    try {
      const commissions = await prisma.automotiveSalesCommission.findMany({
        where: {
          tenantId: auth!.tenantId,
          isDeleted: false,
        },
        orderBy: {
          periodStart: 'desc',
        },
      });

      return {
        data: commissions.map((comm) => ({
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
        })),
      };
    } catch (error: any) {
      console.error('Error fetching commissions:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch commissions', details: error.message }),
        { status: 500 }
      );
    }
  },
  {
    requiredPermissions: [],
    rateLimit: 'API_DEFAULT',
  }
);

export const POST = createProtectedRoute(
  async (request, { auth }) => {
    try {
      const body = await request.json();

      const comm = await prisma.automotiveSalesCommission.create({
        data: {
          tenantId: auth!.tenantId,
          salesPersonId: body.salesPersonId || `SP-${Date.now()}`,
          salesPersonName: body.salesPersonName || 'Unknown',
          periodStart: body.period?.start ? new Date(body.period.start) : new Date(),
          periodEnd: body.period?.end ? new Date(body.period.end) : new Date(),
          totalVehicleSales: body.totalVehicleSales || 0,
          totalServiceSales: body.totalServiceSales || 0,
          totalSalesAmount: body.totalSalesAmount || 0,
          baseCommission: body.baseCommission || 0,
          totalBonuses: body.totalBonuses || 0,
          totalDeductions: body.totalDeductions || 0,
          netCommission: body.netCommission || 0,
          commissionRate: body.commissionRate || 0,
          status: body.status || 'pending',
          calculatedDate: body.calculatedDate ? new Date(body.calculatedDate) : new Date(),
          paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
          createdBy: auth!.userId,
          updatedBy: auth!.userId,
        },
      });

      return {
        data: {
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
      };
    } catch (error: any) {
      console.error('Error creating commission:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create commission', details: error.message }),
        { status: 500 }
      );
    }
  },
  {
    requiredPermissions: [],
    rateLimit: 'API_DEFAULT',
  }
);
