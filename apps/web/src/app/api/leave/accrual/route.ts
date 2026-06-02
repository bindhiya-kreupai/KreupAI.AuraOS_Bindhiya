/**
 * Leave Accrual API Routes
 * Phase 2: Core Enhancement - Advanced Leave System
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const AccrualSchema = z.object({
  employeeId: z.string().min(1),
  policyId: z.string().min(1),
  leaveYear: z.number().int(),
  accrualMonth: z.number().int().min(1).max(12).optional(),
  accrualDate: z.string(),
  accruedDays: z.coerce.number().positive(),
  runId: z.string().optional(),
  daysWorked: z.number().int().optional(),
  proRataFactor: z.coerce.number().optional(),
  calculationNote: z.string().optional(),
});

/**
 * GET /api/leave/accrual
 * Get accrual history from database
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const year = searchParams.get('year');
      const policyId = searchParams.get('policyId');

      const tenantId = user.tenantId;

      const where: Record<string, unknown> = { tenantId };
      if (employeeId) where.employeeId = employeeId;
      if (year) where.leaveYear = parseInt(year);
      if (policyId) where.policyId = policyId;

      const accruals = await prisma.leaveAccrual.findMany({
        where,
        orderBy: { accrualDate: 'desc' },
      });

      // Build summary from real data
      const totalAccrued = accruals.reduce((sum, a) => sum + Number(a.accruedDays), 0);
      const uniqueEmployees = new Set(accruals.map(a => a.employeeId));

      return NextResponse.json({
        success: true,
        data: {
          accruals,
          accrualRuns: accruals,
          summary: {
            totalAccrued,
            totalEmployees: uniqueEmployees.size,
            totalRecords: accruals.length,
          },
        },
      });
    } catch (error: any) {
      logger.error('Error fetching accrual history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch accrual history', errorAr: 'فشل في جلب سجل الاستحقاق' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/leave/accrual
 * Process leave accrual - create accrual records
 */
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const tenantId = user.tenantId;

      // If it's a batch accrual (processDate, employeeIds pattern)
      if (body.processDate || body.employeeIds) {
        const processDate = body.processDate ? new Date(body.processDate) : new Date();
        const leaveYear = processDate.getFullYear();
        const accrualMonth = processDate.getMonth() + 1;
        const runId = `accrual_${Date.now()}`;

        // Get active policies for this tenant
        const policies = await prisma.leavePolicy.findMany({
          where: {
            tenantId,
            isActive: true,
          },
        });

        // Get employee balances
        const balanceWhere: Record<string, unknown> = {
          tenantId,
          leaveYear,
        };
        if (body.employeeIds && body.employeeIds.length > 0) {
          balanceWhere.employeeId = { in: body.employeeIds };
        }

        const balances = await prisma.leaveBalance.findMany({
          where: balanceWhere,
          include: { policy: true },
        });

        let processedCount = 0;
        let totalAccrued = 0;

        for (const balance of balances) {
          const policy = balance.policy;
          if (!policy || !policy.isActive) continue;

          // Calculate accrual based on policy type
          let accruedDays = 0;
          if (policy.accrualType === 'MONTHLY') {
            accruedDays = policy.accrualRate
              ? Number(policy.accrualRate)
              : Number(policy.annualEntitlement) / 12;
          } else if (policy.accrualType === 'QUARTERLY') {
            accruedDays = Number(policy.annualEntitlement) / 4;
          } else if (policy.accrualType === 'ANNUAL') {
            accruedDays = Number(policy.annualEntitlement);
          }

          if (accruedDays <= 0) continue;

          // Create accrual record
          await prisma.leaveAccrual.create({
            data: {
              tenantId,
              employeeId: balance.employeeId,
              policyId: balance.policyId,
              leaveYear,
              accrualMonth,
              accrualDate: processDate,
              accruedDays,
              runId,
              proRataFactor: 1.0,
              calculationNote: `${policy.accrualType} accrual for ${accrualMonth}/${leaveYear}`,
            },
          });

          // Update balance
          const newAccrued = Number(balance.accrued) + accruedDays;
          const newCurrentBalance = Number(balance.currentBalance) + accruedDays;

          await prisma.leaveBalance.update({
            where: { id: balance.id },
            data: {
              accrued: newAccrued,
              currentBalance: newCurrentBalance,
              lastAccrualDate: processDate,
              lastUpdated: new Date(),
            },
          });

          processedCount++;
          totalAccrued += accruedDays;
        }

        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.userId,
            action: 'CREATE',
            resourceType: 'Leave - Accrual',
            metadata: { description: `Processed batch accrual: ${processedCount} records, ${totalAccrued} days accrued` } as any,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            runId,
            processDate: processDate.toISOString(),
            processedCount,
            totalAccrued,
            policiesProcessed: policies.length,
          },
        });
      }

      // Single accrual record creation
      const data = AccrualSchema.parse(body);

      const accrual = await prisma.leaveAccrual.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          policyId: data.policyId,
          leaveYear: data.leaveYear,
          accrualMonth: data.accrualMonth || null,
          accrualDate: new Date(data.accrualDate),
          accruedDays: data.accruedDays,
          runId: data.runId || null,
          daysWorked: data.daysWorked || null,
          proRataFactor: data.proRataFactor || 1.0,
          calculationNote: data.calculationNote || null,
        },
      });

      return NextResponse.json({
        success: true,
        data: accrual,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error processing leave accrual:', error);
      return NextResponse.json(
        { error: 'Failed to process leave accrual', errorAr: 'فشل في معالجة استحقاق الإجازات' },
        { status: 500 }
      );
    }
  }
);
