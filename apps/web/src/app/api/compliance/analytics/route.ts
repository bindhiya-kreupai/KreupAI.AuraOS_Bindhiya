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
      model('complianceRecordEntry').count({ where: { tenantId } }),
      model('complianceRecordEntry').count({ where: { tenantId, status: 'compliant' } }),
      model('complianceRecordEntry').count({ where: { tenantId, status: 'non_compliant' } }),
      model('complianceRecordEntry').count({ where: { tenantId, status: 'pending_review' } }),
      prisma.erGrievanceCase.count({
        where: { ...grievanceWhere, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
      prisma.erGrievanceCase.count({ where: { ...grievanceWhere, status: 'RESOLVED' } }),
      model('poshComplaint').count({
        where: { tenantId, status: { notIn: ['resolved', 'closed'] } },
      }),
      model('poshComplaint').count({ where: { tenantId, status: { in: ['resolved', 'closed'] } } }),
      prisma.erDisciplinaryAction.count({
        where: { tenantId, isDeleted: false, status: { notIn: ['CLOSED', 'CANCELLED'] } },
      }),
      model('complianceAuditEntry').count({
        where: { tenantId, status: { in: ['scheduled', 'in_progress'] } },
      }),
      model('complianceAuditEntry').count({ where: { tenantId, status: 'completed' } }),
      model('unionEntry').count({ where: { tenantId, status: 'active' } }),
      model('arbitrationCase').count({ where: { tenantId, status: { notIn: ['completed'] } } }),
      model('strikeEntry').count({
        where: { tenantId, status: { in: ['notice_received', 'in_negotiation', 'active'] } },
      }),
      model('whistleblowerReport').count({ where: { tenantId } }),
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
