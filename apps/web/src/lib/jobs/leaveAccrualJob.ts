/**
 * Leave Accrual Job
 * Processes monthly leave accruals for all active employees
 */

import { LeaveAccrualService } from '@/lib/services/leave/leave-accrual.service';
import { prisma } from '@aura/database';

export interface JobResult {
  success: boolean;
  processedCount: number;
  errors: string[];
}

export async function processLeaveAccruals(tenantId?: string): Promise<JobResult> {
  const errors: string[] = [];
  let processedCount = 0;

  console.log('[LeaveAccrualJob] Starting leave accrual processing...');

  try {
    // Resolve tenant IDs to process
    const tenantIds = tenantId
      ? [tenantId]
      : await prisma.company
          .findMany({ select: { tenantId: true }, distinct: ['tenantId'] })
          .then(rows => rows.map(r => r.tenantId));

    if (tenantIds.length === 0) {
      console.log('[LeaveAccrualJob] No tenants found. Skipping.');
      return { success: true, processedCount: 0, errors: [] };
    }

    console.log(`[LeaveAccrualJob] Processing ${tenantIds.length} tenant(s)`);

    const processDate = new Date();

    for (const tid of tenantIds) {
      try {
        const result = await LeaveAccrualService.processMonthlyAccrual({
          tenantId: tid,
          processDate,
        });

        processedCount += result.totalEmployees;

        if (result.errors.length > 0) {
          for (const err of result.errors) {
            errors.push(`[${tid}] ${err.employeeName}: ${err.message}`);
          }
        }

        console.log(
          `[LeaveAccrualJob] Tenant ${tid}: ${result.totalEmployees} employees, ` +
          `${result.totalAccrued.toFixed(1)} days accrued, status=${result.status}`
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`[${tid}] Tenant processing failed: ${msg}`);
        console.error(`[LeaveAccrualJob] Tenant ${tid} failed:`, msg);
      }
    }

    console.log(
      `[LeaveAccrualJob] Complete. ${processedCount} employees processed, ${errors.length} errors.`
    );

    return {
      success: errors.length === 0,
      processedCount,
      errors,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[LeaveAccrualJob] Fatal error:', msg);
    return { success: false, processedCount, errors: [msg] };
  }
}
