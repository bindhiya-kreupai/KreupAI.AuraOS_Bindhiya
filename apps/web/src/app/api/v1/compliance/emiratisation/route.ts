import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/compliance/emiratisation
 * Get Emiratisation / Nitaqat ratio data
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('compliance/emiratisation:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing compliance/emiratisation:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('companyId') || undefined;
    const asOfDate = searchParams.get('asOfDate') || new Date().toISOString().split('T')[0];

    // Get Nitaqat configuration for this tenant
    const nitaqatConfigs = await prisma.nitaqatConfiguration.findMany({
      where: {
        tenantId: user.tenantId,
        ...(companyId ? { companyId } : {}),
        isActive: true,
      },
      include: {
        snapshots: {
          orderBy: { snapshotDate: 'desc' },
          take: 1,
        },
      },
    });

    const results = await Promise.all(
      nitaqatConfigs.map(async (config) => {
        const latestSnapshot = config.snapshots[0];

        // Get current employee counts
        const [totalEmployees, saudiEmployees] = await Promise.all([
          prisma.employee.count({
            where: { companyId: config.companyId, isDeleted: false },
          }),
          // In a real implementation, you'd filter by nationality
          prisma.employee
            .count({
              where: { companyId: config.companyId, isDeleted: false },
            })
            .then((count) => Math.floor(count * 0.3)), // Simplified mock: 30% Saudi
        ]);

        const nonSaudiEmployees = totalEmployees - saudiEmployees;
        const currentRatio = totalEmployees > 0 ? (saudiEmployees / totalEmployees) * 100 : 0;
        const requiredRatio = Number(config.requiredSaudiRatio);

        const deficit = Math.max(
          0,
          Math.ceil((requiredRatio / 100) * totalEmployees) - saudiEmployees
        );
        const surplus = Math.max(
          0,
          saudiEmployees - Math.ceil((requiredRatio / 100) * totalEmployees)
        );

        // Determine Nitaqat band
        let nitaqatBand: string;
        if (currentRatio >= requiredRatio * 1.2) nitaqatBand = 'PLATINUM';
        else if (currentRatio >= requiredRatio) nitaqatBand = 'GREEN_HIGH';
        else if (currentRatio >= requiredRatio * 0.9) nitaqatBand = 'GREEN_MEDIUM';
        else if (currentRatio >= requiredRatio * 0.75) nitaqatBand = 'GREEN_LOW';
        else if (currentRatio >= requiredRatio * 0.6) nitaqatBand = 'YELLOW';
        else nitaqatBand = 'RED';

        return {
          companyId: config.companyId,
          industryCode: config.industryCode,
          industryName: config.industryName,
          companySizeBand: config.companySizeBand,
          requiredSaudiRatio: requiredRatio,
          currentSaudiRatio: Math.round(currentRatio * 100) / 100,
          nitaqatBand,
          headcount: {
            total: totalEmployees,
            saudi: saudiEmployees,
            nonSaudi: nonSaudiEmployees,
          },
          compliance: {
            isCompliant: currentRatio >= requiredRatio,
            deficit,
            surplus,
            targetRatio: Number(config.targetRatio || config.requiredSaudiRatio),
          },
          lastSnapshot: latestSnapshot
            ? {
                date: latestSnapshot.snapshotDate,
                band: latestSnapshot.nitaqatBand,
                ratio: Number(latestSnapshot.currentRatio),
              }
            : null,
          asOfDate,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        total: results.length,
        asOfDate,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Emiratisation API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch emiratisation data' } },
      { status: 500 }
    );
  }
});
