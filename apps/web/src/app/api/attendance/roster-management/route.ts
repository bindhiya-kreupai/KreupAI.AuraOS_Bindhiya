/**
 * Roster Management API Routes
 * Auto-generation, shift swap, conflict detection, cost calculation
 *
 * @swagger
 * /api/attendance/roster-management:
 *   get:
 *     summary: Get roster for a date range
 *   post:
 *     summary: Generate roster, assign shifts, request swap
 *     tags: [Attendance - Roster]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { RosterManagementService } from '@/lib/services/attendance/roster-management.service';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const GenerateRosterSchema = z.object({
  tenantId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  departmentId: z.string().optional(),
  templateId: z.string().optional(),
  countryCode: z.enum(['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN']).optional(),
});

const ShiftSwapSchema = z.object({
  requesterId: z.string(),
  targetId: z.string(),
  requesterShiftDate: z.string(),
  targetShiftDate: z.string(),
  reason: z.string().optional(),
});

// GET - Get roster data
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'summary';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const departmentId = searchParams.get('departmentId');

      switch (action) {
        case 'summary': {
          if (!startDate || !endDate) {
            return NextResponse.json(
              { error: 'Missing startDate/endDate', errorAr: 'تاريخ البداية/النهاية مفقود' },
              { status: 400 }
            );
          }
          const summary = await RosterManagementService.getRosterSummary(
            user.tenantId, startDate, endDate, departmentId || undefined
          );
          return NextResponse.json({ success: true, data: summary });
        }

        case 'available': {
          const date = searchParams.get('date');
          const shiftId = searchParams.get('shiftId');
          if (!date || !shiftId) {
            return NextResponse.json(
              { error: 'Missing date/shiftId', errorAr: 'التاريخ/معرف الوردية مفقود' },
              { status: 400 }
            );
          }
          const available = await RosterManagementService.getAvailableEmployees(
            user.tenantId, date, shiftId, departmentId || undefined
          );
          return NextResponse.json({ success: true, data: available });
        }

        case 'cost': {
          if (!startDate || !endDate) {
            return NextResponse.json(
              { error: 'Missing startDate/endDate' },
              { status: 400 }
            );
          }
          const cost = await RosterManagementService.calculateRosterCost(
            user.tenantId, startDate, endDate, departmentId || undefined
          );
          return NextResponse.json({ success: true, data: cost });
        }

        default:
          return NextResponse.json(
            { error: `Unknown action: ${action}` },
            { status: 400 }
          );
      }
    } catch (error) {
      logger.error({ error }, 'Error fetching roster');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch roster data' },
        { status: 500 }
      );
    }
  }
);

// POST - Generate roster, assign shifts, swap, validate, copy
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { action } = body;

      switch (action || 'generate') {
        case 'generate': {
          const data = GenerateRosterSchema.parse(body);
          const result = await RosterManagementService.generateRoster({
            tenantId: user.tenantId,
            startDate: data.startDate,
            endDate: data.endDate,
            departmentId: data.departmentId,
            templateId: data.templateId,
            countryCode: data.countryCode,
          });
          return NextResponse.json({ success: true, data: result }, { status: 201 });
        }

        case 'assignShift': {
          const { employeeId, shiftId, date, countryCode } = body;
          if (!employeeId || !shiftId || !date) {
            return NextResponse.json(
              { error: 'Missing employeeId, shiftId, or date', errorAr: 'معرف الموظف أو الوردية أو التاريخ مفقود' },
              { status: 400 }
            );
          }
          const result = await RosterManagementService.assignShift(
            user.tenantId, employeeId, shiftId, date, countryCode
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'bulkAssign': {
          const { assignments, countryCode } = body;
          if (!assignments || !Array.isArray(assignments)) {
            return NextResponse.json(
              { error: 'Missing assignments array' },
              { status: 400 }
            );
          }
          const result = await RosterManagementService.bulkAssignShifts(
            user.tenantId, assignments, countryCode
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'requestSwap': {
          const data = ShiftSwapSchema.parse(body);
          const result = await RosterManagementService.requestShiftSwap(
            user.tenantId, data.requesterId, data.targetId,
            data.requesterShiftDate, data.targetShiftDate, data.reason
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'approveSwap': {
          const { swapId, approverId } = body;
          if (!swapId) {
            return NextResponse.json(
              { error: 'Missing swapId' },
              { status: 400 }
            );
          }
          const result = await RosterManagementService.approveShiftSwap(
            swapId, approverId || user.userId
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'validate': {
          const { startDate: vs, endDate: ve, departmentId: vd, countryCode: vc } = body;
          if (!vs || !ve) {
            return NextResponse.json(
              { error: 'Missing startDate/endDate' },
              { status: 400 }
            );
          }
          const result = await RosterManagementService.validateRoster(
            user.tenantId, vs, ve, vd, vc
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'copy': {
          const { sourceStart, sourceEnd, targetStart, departmentId: cd } = body;
          if (!sourceStart || !sourceEnd || !targetStart) {
            return NextResponse.json(
              { error: 'Missing source/target dates' },
              { status: 400 }
            );
          }
          const result = await RosterManagementService.copyRoster(
            user.tenantId, sourceStart, sourceEnd, targetStart, cd
          );
          return NextResponse.json({ success: true, data: result });
        }

        default:
          return NextResponse.json(
            { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
            { status: 400 }
          );
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, 'Error in roster management');
      return NextResponse.json(
        { success: false, error: 'Failed to process roster request' },
        { status: 500 }
      );
    }
  }
);
