/**
 * GCC Compliance Cron Job
 *
 * Runs the periodic compliance tasks that the dashboards depend on:
 *  1. Materialises upcoming compliance tasks from recurrence rules
 *     (so the calendar workspace always has the next 3 months populated).
 *  2. Escalates overdue OPEN/IN_PROGRESS tasks (sets OVERDUE +
 *     escalatedToRole from the rule's escalation role).
 *  3. Re-derives future task due dates after holiday or rule changes.
 *
 * Runs across every tenant in the system. Designed for the existing
 * node-cron scheduler at `apps/web/src/lib/queue/scheduler.ts`.
 */

import { complianceCalendarService } from '@/lib/services/compliance-calendar';
import { prisma } from '@aura/database';

export interface JobResult {
  success: boolean;
  processedCount: number;
  errors: string[];
}

interface TenantSummary {
  tenantId: string;
  created: number;
  skipped: number;
  escalated: number;
  rederived: number;
}

export async function runGccComplianceMaintenance(
  tenantId?: string
): Promise<JobResult & { tenants: TenantSummary[] }> {
  const errors: string[] = [];
  const tenants: TenantSummary[] = [];

  console.log('[GccComplianceJob] Starting GCC compliance maintenance run...');

  const tenantIds = tenantId
    ? [tenantId]
    : await prisma.company
        .findMany({ select: { tenantId: true }, distinct: ['tenantId'] })
        .then((rows) => rows.map((r) => r.tenantId));

  if (tenantIds.length === 0) {
    console.log('[GccComplianceJob] No tenants found. Skipping.');
    return { success: true, processedCount: 0, errors: [], tenants: [] };
  }

  console.log(`[GccComplianceJob] Processing ${tenantIds.length} tenant(s)`);

  let processedCount = 0;

  for (const tid of tenantIds) {
    const summary: TenantSummary = {
      tenantId: tid,
      created: 0,
      skipped: 0,
      escalated: 0,
      rederived: 0,
    };
    const auth = { tenantId: tid, userId: 'system-cron' };

    try {
      const gen = await complianceCalendarService.generateTasks({ monthsAhead: 3 }, auth);
      summary.created = gen.created;
      summary.skipped = gen.skipped;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`[${tid}] generateTasks failed: ${msg}`);
      console.error(`[GccComplianceJob] Tenant ${tid} generateTasks failed:`, msg);
    }

    try {
      const esc = await complianceCalendarService.escalateOverdue(auth);
      summary.escalated = esc.escalated.length;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`[${tid}] escalateOverdue failed: ${msg}`);
      console.error(`[GccComplianceJob] Tenant ${tid} escalateOverdue failed:`, msg);
    }

    try {
      const red = await complianceCalendarService.rederiveFutureTasks(auth);
      summary.rederived = red.updated;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`[${tid}] rederiveFutureTasks failed: ${msg}`);
      console.error(`[GccComplianceJob] Tenant ${tid} rederiveFutureTasks failed:`, msg);
    }

    tenants.push(summary);
    processedCount += summary.created + summary.escalated + summary.rederived;

    console.log(
      `[GccComplianceJob] Tenant ${tid}: ${summary.created} created, ` +
        `${summary.skipped} skipped, ${summary.escalated} escalated, ` +
        `${summary.rederived} re-derived`
    );
  }

  const success = errors.length === 0;
  console.log(
    `[GccComplianceJob] Maintenance complete. tenants=${tenants.length} ` +
      `processed=${processedCount} errors=${errors.length}`
  );

  return { success, processedCount, errors, tenants };
}
