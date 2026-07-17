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
