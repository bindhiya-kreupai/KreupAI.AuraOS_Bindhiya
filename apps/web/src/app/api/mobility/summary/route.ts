import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

/**
 * GET /api/mobility/summary
 * Live KPI counts powering the Global Mobility hub dashboard. Visa data comes
 * from the shared VisaPermit table (queried via the aura_visa_permit relation)
 * with a graceful fallback to 0 when that table is not present.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;

    const [activeRelocations, completedRelocations, pendingFilings, totalTaxProfiles] =
      await Promise.all([
        prisma.relocationPackage.count({
          where: {
            tenantId,
            isDeleted: false,
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
        }),
        prisma.relocationPackage.count({
          where: { tenantId, isDeleted: false, status: 'COMPLETED' },
        }),
        prisma.expatTaxProfile.count({
          where: { tenantId, isDeleted: false, filingStatus: { in: ['PENDING', 'IN_REVIEW'] } },
        }),
        prisma.expatTaxProfile.count({ where: { tenantId, isDeleted: false } }),
      ]);

    // Visa counts are best-effort: the visa/permit table is provisioned by a
    // separate compliance module and may be absent in some environments.
    let activeVisas = 0;
    let expiringVisas = 0;
    try {
      const visaClient = (prisma as unknown as Record<string, any>).visaPermit;
      if (visaClient) {
        [activeVisas, expiringVisas] = await Promise.all([
          visaClient.count({ where: { tenantId, isDeleted: false, status: 'ACTIVE' } }),
          visaClient.count({
            where: {
              tenantId,
              isDeleted: false,
              status: 'ACTIVE',
              expiryDate: { lte: daysFromNow(30), gte: new Date() },
            },
          }),
        ]);
      }
    } catch {
      // Table not present — keep zero counts.
    }

    return NextResponse.json({
      success: true,
      data: {
        activeVisas,
        expiringVisas,
        activeRelocations,
        completedRelocations,
        pendingFilings,
        totalTaxProfiles,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load mobility summary',
        message: 'Failed to load mobility summary',
        messageAr: 'فشل في تحميل ملخص التنقل العالمي',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
