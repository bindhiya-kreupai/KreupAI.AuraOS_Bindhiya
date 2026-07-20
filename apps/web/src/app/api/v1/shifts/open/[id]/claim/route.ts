import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';
import { notificationService } from '@/lib/services/notification.service';
import { ShiftManagementService } from '@/lib/services/shift-management.service';

/**
 * POST /api/v1/shifts/open/[id]/claim
 * Claim an open shift roster slot by assigning the requesting employee.
 * Uses an atomic update with a WHERE condition to prevent race conditions (TOCTOU).
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('shifts:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shifts:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;
      const body = await request.json();
      const { employeeId } = body;

      if (!employeeId) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'Validation failed: employeeId is required' },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 400 }
        );
      }

      // Fetch the roster to get the date for conflict checking
      const targetRoster = await prisma.shiftRoster.findFirst({
        where: { id, tenantId: user.tenantId, isDeleted: false },
        select: { rosterDate: true },
      });
      if (targetRoster) {
        const conflicts = await ShiftManagementService.checkConflicts({
          employeeId,
          date: targetRoster.rosterDate.toISOString().slice(0, 10),
          tenantId: user.tenantId,
        });
        const errors = conflicts.filter((c) => c.severity === 'error');
        if (errors.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E3001',
                message: errors.map((e) => e.message).join(' '),
                messageAr: 'تعارض في الجدول',
              },
            },
            { status: 409 }
          );
        }
      }

      // Atomic claim: only update if status is OPEN. This prevents race conditions
      // where two concurrent requests both read OPEN and both succeed.
      const result = await prisma.shiftRoster.updateMany({
        where: {
          id,
          tenantId: user.tenantId,
          status: 'OPEN',
          isDeleted: false,
        },
        data: {
          employeeId,
          status: 'CLAIMED',
          updatedBy: user.userId || user.id,
        },
      });

      if (result.count === 0) {
        // Either the roster doesn't exist or it's no longer OPEN
        const roster = await prisma.shiftRoster.findFirst({
          where: { id, tenantId: user.tenantId, isDeleted: false },
          include: { shift: true },
        });

        if (!roster) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'E4001', message: `Open shift with id '${id}' not found` },
              meta: {
                timestamp: new Date().toISOString(),
                requestId: crypto.randomUUID(),
                apiVersion: 'v1',
              },
            },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: { code: 'E3001', message: 'This shift has already been claimed or is not open' },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 409 }
        );
      }

      // Fetch the updated roster for the response
      const updated = await prisma.shiftRoster.findFirst({
        where: { id, tenantId: user.tenantId },
        include: { shift: true },
      });

      // Fire notification to claiming employee
      if (updated && employeeId) {
        notificationService
          .notifyShiftOpenClaimed(employeeId, {
            rosterId: updated.id,
            shiftId: updated.shiftId,
            shiftName: (updated.shift as any)?.name || 'Unknown',
            rosterDate: updated.rosterDate.toISOString().slice(0, 10),
          })
          .catch(() => {});
      }

      return NextResponse.json({
        success: true,
        data: {
          id: updated!.id,
          tenantId: updated!.tenantId,
          employeeId: updated!.employeeId,
          shiftId: updated!.shiftId,
          shiftName: (updated!.shift as any)?.name,
          rosterDate: updated!.rosterDate,
          status: updated!.status,
          claimedAt: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to claim shift' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'shift_roster',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
