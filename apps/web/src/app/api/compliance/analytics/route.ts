/**
 * Compliance Analytics API — derived metrics across labor-relations entities.
 * Tenant-scoped. Read-only aggregation; no dedicated table.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth, Resource, Action, requirePermission } from '@/lib/auth';
import { ERR, errorResponse, model } from '../_shared/route-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, { user, permissions }) => {
  const permErr = requirePermission(Resource.COMPLIANCE, Action.READ, permissions);
  if (permErr) return permErr;
  try {
    const tenantId = user.tenantId;
    const grievanceWhere = { tenantId, isDeleted: false };

    // Each metric is independent; a missing table or schema drift on one model
    // should not fail the whole dashboard. Wrap each count so it returns 0.
    const safe = async (fn: () => Promise<number>): Promise<number> => {
      try {
        return await fn();
      } catch {
        return 0;
      }
    };

    const [
      totalRecords,
      compliantRecords,
      nonCompliantRecords,
      pendingRecords,
      activeGrievances,
      resolvedGrievances,
      activePosh,
      resolvedPosh,
      activeDisciplinary,
      upcomingAudits,
      completedAudits,
      activeUnions,
      activeArbitrations,
      activeStrikes,
      whistleblowerReports,
    ] = await Promise.all([
      safe(() => model('complianceRecordEntry').count({ where: { tenantId } })),
      safe(() =>
        model('complianceRecordEntry').count({ where: { tenantId, status: 'compliant' } })
      ),
      safe(() =>
        model('complianceRecordEntry').count({ where: { tenantId, status: 'non_compliant' } })
      ),
      safe(() =>
        model('complianceRecordEntry').count({ where: { tenantId, status: 'pending_review' } })
      ),
      safe(() =>
        prisma.erGrievanceCase.count({
          where: { ...grievanceWhere, status: { in: ['OPEN', 'IN_PROGRESS'] } },
        })
      ),
      safe(() =>
        prisma.erGrievanceCase.count({ where: { ...grievanceWhere, status: 'RESOLVED' } })
      ),
      safe(() =>
        model('poshComplaint').count({
          where: { tenantId, status: { notIn: ['resolved', 'closed'] } },
        })
      ),
      safe(() =>
        model('poshComplaint').count({
          where: { tenantId, status: { in: ['resolved', 'closed'] } },
        })
      ),
      safe(() =>
        prisma.erDisciplinaryAction.count({
          where: { tenantId, isDeleted: false, status: { notIn: ['CLOSED', 'CANCELLED'] } },
        })
      ),
      safe(() =>
        model('complianceAuditEntry').count({
          where: { tenantId, status: { in: ['scheduled', 'in_progress'] } },
        })
      ),
      safe(() => model('complianceAuditEntry').count({ where: { tenantId, status: 'completed' } })),
      safe(() => model('unionEntry').count({ where: { tenantId, status: 'active' } })),
      safe(() =>
        model('arbitrationCase').count({ where: { tenantId, status: { notIn: ['completed'] } } })
      ),
      safe(() =>
        model('strikeEntry').count({
          where: { tenantId, status: { in: ['notice_received', 'in_negotiation', 'active'] } },
        })
      ),
      safe(() => model('whistleblowerReport').count({ where: { tenantId } })),
    ]);

    const complianceRate =
      totalRecords > 0 ? Math.round((compliantRecords / totalRecords) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalComplianceItems: totalRecords,
        compliantItems: compliantRecords,
        nonCompliantItems: nonCompliantRecords,
        pendingReviewItems: pendingRecords,
        complianceRate,
        activeGrievances,
        resolvedGrievances,
        activePOSHComplaints: activePosh,
        resolvedPOSHComplaints: resolvedPosh,
        activeDisciplinaryRecords: activeDisciplinary,
        upcomingAudits,
        completedAudits,
        activeUnions,
        activeArbitrations,
        activeStrikes,
        whistleblowerReports,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch {
    return errorResponse(ERR.server);
  }
});
