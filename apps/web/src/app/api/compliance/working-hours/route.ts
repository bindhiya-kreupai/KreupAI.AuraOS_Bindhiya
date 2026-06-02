/**
 * Working Hours Engine API Routes
 * Ramadan-aware scheduling, overtime calculation, compliance validation
 *
 * @swagger
 * /api/compliance/working-hours:
 *   post:
 *     summary: Calculate working hours, overtime, or validate compliance
 *     tags: [Compliance - Working Hours]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { WorkingHoursEngine } from '@/lib/services/compliance/working-hours-engine.service';
import { z } from 'zod';

const CountryCodeEnum = z.enum(['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN']);

const OvertimeSchema = z.object({
  countryCode: CountryCodeEnum,
  actualHours: z.number(),
  shiftHours: z.number(),
  date: z.string().optional(),
  overtimeType: z.enum(['normal', 'night', 'friday', 'holiday']).optional(),
});

const DailyComplianceSchema = z.object({
  countryCode: CountryCodeEnum,
  hoursWorked: z.number(),
  overtimeHours: z.number(),
  date: z.string().optional(),
});

const WeeklyComplianceSchema = z.object({
  countryCode: CountryCodeEnum,
  weeklyHours: z.number(),
  restDays: z.number(),
});

const FridayCompensationSchema = z.object({
  countryCode: CountryCodeEnum,
  hoursWorked: z.number(),
  baseSalary: z.number(),
});

// GET - Get working hours config for a country
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPLIANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const countryCode = searchParams.get('countryCode') as 'AE' | 'SA' | 'BH' | 'QA' | 'OM' | 'KW' | 'IN';
      const dateStr = searchParams.get('date');

      if (!countryCode) {
        return NextResponse.json(
          { error: 'Missing countryCode parameter', errorAr: 'معامل رمز الدولة مفقود' },
          { status: 400 }
        );
      }

      const date = dateStr ? new Date(dateStr) : new Date();
      const dailyHours = WorkingHoursEngine.calculateDailyWorkingHours(countryCode, date);
      const scheduleConfig = WorkingHoursEngine.getWorkScheduleConfig(countryCode);
      const nightConfig = WorkingHoursEngine.getNightShiftConfig(countryCode);

      return NextResponse.json({
        success: true,
        data: {
          countryCode,
          dailyHours,
          scheduleConfig,
          nightShiftConfig: nightConfig,
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch working hours config' },
        { status: 500 }
      );
    }
  }
);

// POST - Calculate working hours, overtime, or validate compliance
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPLIANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { action } = body;

      if (!action) {
        return NextResponse.json(
          { error: 'Missing action field', errorAr: 'حقل الإجراء مفقود' },
          { status: 400 }
        );
      }

      switch (action) {
        case 'calculateDailyHours': {
          const { countryCode, date } = body;
          if (!countryCode) {
            return NextResponse.json(
              { error: 'Missing countryCode', errorAr: 'رمز الدولة مفقود' },
              { status: 400 }
            );
          }
          const result = WorkingHoursEngine.calculateDailyWorkingHours(
            countryCode,
            date ? new Date(date) : new Date()
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'calculateOvertime': {
          const data = OvertimeSchema.parse(body);
          const result = WorkingHoursEngine.calculateOvertime(
            data.countryCode,
            data.actualHours,
            data.shiftHours,
            data.date ? new Date(data.date) : new Date(),
            data.overtimeType
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'validateDaily': {
          const data = DailyComplianceSchema.parse(body);
          const result = WorkingHoursEngine.validateDailyCompliance(
            data.countryCode,
            data.hoursWorked,
            data.overtimeHours,
            data.date ? new Date(data.date) : new Date()
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'validateWeekly': {
          const data = WeeklyComplianceSchema.parse(body);
          const result = WorkingHoursEngine.validateWeeklyCompliance(
            data.countryCode,
            data.weeklyHours,
            data.restDays
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'fridayCompensation': {
          const data = FridayCompensationSchema.parse(body);
          const result = WorkingHoursEngine.calculateFridayCompensation(
            data.countryCode,
            data.hoursWorked,
            data.baseSalary
          );
          return NextResponse.json({ success: true, data: result });
        }

        case 'breakRequirements': {
          const { countryCode, consecutiveHours } = body;
          if (!countryCode || consecutiveHours === undefined) {
            return NextResponse.json(
              { error: 'Missing countryCode or consecutiveHours', errorAr: 'رمز الدولة أو ساعات العمل المتواصلة مفقودة' },
              { status: 400 }
            );
          }
          const result = WorkingHoursEngine.getBreakRequirements(countryCode, consecutiveHours);
          return NextResponse.json({ success: true, data: result });
        }

        case 'isNightShift': {
          const { countryCode, startTime, endTime } = body;
          if (!countryCode || !startTime || !endTime) {
            return NextResponse.json(
              { error: 'Missing required fields', errorAr: 'حقول مطلوبة مفقودة' },
              { status: 400 }
            );
          }
          const result = WorkingHoursEngine.isNightShift(countryCode, startTime, endTime);
          return NextResponse.json({ success: true, data: { isNightShift: result } });
        }

        default:
          return NextResponse.json(
            { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
            { status: 400 }
          );
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to process working hours request' },
        { status: 500 }
      );
    }
  }
);
