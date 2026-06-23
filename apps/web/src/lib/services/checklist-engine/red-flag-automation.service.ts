/**
 * EPIC-37-S09: Event-driven red-flag automation.
 *
 * Closes the audit gap "no event-driven automation (S09 missing)".
 *
 * Wires the existing in-process compliance event bus to the existing
 * RedFlagService.evaluateAndRaise() so that ACTIVE RedFlagRule rows
 * with a matching `thresholdJson.triggerOn` are automatically
 * evaluated whenever the named event fires. The event payload is
 * exposed to the expression as the `event` namespace; the rule's
 * `thresholdJson` is exposed as `thresholds` (as before).
 *
 * Convention:
 *   RedFlagRule.thresholdJson = {
 *     "triggerOn": "payroll.run.completed",  // ComplianceEventType
 *     "ruleEvaluationKey": "RUN_SIZE_SPIKE", // optional, for telemetry
 *     ...any custom threshold fields used by the expression
 *   }
 *
 *   RedFlagRule.expression =
 *     "event.payload.totalNet > thresholds.netCap"
 *
 * When the event fires, every ACTIVE rule whose
 * thresholdJson.triggerOn matches the event type is evaluated against
 * a context of
 *   { event, payload, thresholds }
 *
 * Truthy → red-flag instance raised via redFlagService.raiseFlag().
 *
 * Multi-tenant: events carry `tenantId`, so the automation only loads
 * rules for the firing tenant. Subscriber errors are logged and
 * swallowed — a misbehaving rule can never block the bus.
 *
 * The wiring is opt-in: call `installRedFlagAutomation()` once during
 * service bootstrap (or in a test setUp). Returns an `uninstall()`
 * disposer for tests.
 */

import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';
import {
  subscribeComplianceEvent,
  type ComplianceEvent,
  type ComplianceEventType,
  type ComplianceEventPayloadMap,
} from '@/lib/services/compliance-events';
import { redFlagService } from './red-flag.service';
import {
  evaluateRule,
  type EvaluationContext,
} from '@/lib/services/expression-dsl/expression.service';

/** Event types we currently install automation hooks for. */
const AUTOMATED_EVENT_TYPES: ComplianceEventType[] = [
  'employee.hired',
  'employee.salaryChanged',
  'employee.separationInitiated',
  'payroll.run.completed',
  'visa.cancelled',
  'policy.published',
  'offer.accepted',
  'offer.declined',
  'bgv.passed',
  'bgv.failed',
  'recruitment.case.transitioned',
];

interface AutomationStats {
  rulesEvaluated: number;
  flagsRaised: number;
  errored: number;
}

/**
 * Pure helper (exported for tests): given a set of candidate rules and
 * an event, returns the codes of those whose expression evaluates
 * truthy. Does NOT raise any flags or touch IO.
 */
export function selectFiringRules(
  rules: Array<{
    code: string;
    expression: string;
    isActive: boolean;
    thresholdJson?: Record<string, unknown> | null;
  }>,
  event: { type: string; tenantId: string; payload: unknown }
): Array<{ code: string; thresholds: Record<string, unknown> }> {
  const firing: Array<{ code: string; thresholds: Record<string, unknown> }> = [];
  for (const rule of rules) {
    if (!rule.isActive) continue;
    const thresholds = (rule.thresholdJson ?? {}) as Record<string, unknown>;
    if (thresholds.triggerOn !== event.type) continue;
    const ctx: EvaluationContext = {
      event,
      payload: event.payload,
      thresholds,
    };
    const fired = evaluateRule(rule.expression, ctx, (err) => {
      logger.warn(
        { err, ruleCode: rule.code, expression: rule.expression },
        'red-flag automation rule expression failed to evaluate'
      );
    });
    if (fired) firing.push({ code: rule.code, thresholds });
  }
  return firing;
}

/**
 * Load all ACTIVE RedFlagRule rows for the tenant whose
 * thresholdJson.triggerOn matches `eventType`. We use a JSON-path
 * filter when prisma supports it; otherwise we load by tenant and
 * post-filter (acceptable — rule counts per tenant are bounded).
 */
async function loadCandidateRules(tenantId: string, eventType: string) {
  const rules = await (prisma as any).redFlagRule.findMany({
    where: { tenantId, isActive: true },
    select: {
      id: true,
      code: true,
      expression: true,
      isActive: true,
      thresholdJson: true,
      domain: true,
      severity: true,
    },
  });
  return rules.filter((r: any) => {
    const t = (r.thresholdJson ?? {}) as Record<string, unknown>;
    return t.triggerOn === eventType;
  });
}

async function handleEvent(event: ComplianceEvent): Promise<AutomationStats> {
  const stats: AutomationStats = { rulesEvaluated: 0, flagsRaised: 0, errored: 0 };
  const candidates = await loadCandidateRules(event.tenantId, event.type);
  stats.rulesEvaluated = candidates.length;

  for (const rule of candidates) {
    const thresholds = (rule.thresholdJson ?? {}) as Record<string, unknown>;
    const ctx: EvaluationContext = {
      event: { type: event.type, tenantId: event.tenantId },
      payload: event.payload,
      thresholds,
    };
    let fired = false;
    try {
      fired = evaluateRule(rule.expression, ctx, (err) => {
        stats.errored += 1;
        logger.warn(
          { err, ruleCode: rule.code, expression: rule.expression, eventType: event.type },
          'red-flag automation rule expression failed to evaluate'
        );
      });
    } catch (err) {
      stats.errored += 1;
      logger.warn({ err, ruleCode: rule.code }, 'red-flag automation rule threw');
      continue;
    }
    if (!fired) continue;

    try {
      await redFlagService.raiseFlag(
        {
          ruleCode: rule.code,
          domain: rule.domain,
          severity: rule.severity,
          sourceType: 'compliance-event',
          sourceId: event.eventId,
          details: {
            eventType: event.type,
            correlationId: event.correlationId,
            payload: event.payload,
          },
        },
        { tenantId: event.tenantId, userId: event.actorId ?? 'system' }
      );
      stats.flagsRaised += 1;
    } catch (err) {
      stats.errored += 1;
      logger.error({ err, ruleCode: rule.code }, 'failed to raise red-flag from event');
    }
  }

  return stats;
}

let installedDisposers: Array<() => void> = [];

/**
 * Install red-flag automation hooks on the compliance event bus.
 * Returns an `uninstall()` disposer that removes every hook. Calling
 * `install()` twice is idempotent — duplicates are tracked and
 * removed by the first uninstall.
 */
export function installRedFlagAutomation(): () => void {
  if (installedDisposers.length > 0) {
    // Already installed.
    return uninstallRedFlagAutomation;
  }
  for (const type of AUTOMATED_EVENT_TYPES) {
    const dispose = subscribeComplianceEvent(type, async (event) => {
      try {
        await handleEvent(event as ComplianceEvent);
      } catch (err) {
        logger.error({ err, eventType: type }, 'red-flag automation handler crashed');
      }
    });
    installedDisposers.push(dispose);
  }
  return uninstallRedFlagAutomation;
}

export function uninstallRedFlagAutomation(): void {
  for (const dispose of installedDisposers) {
    try {
      dispose();
    } catch {
      // best effort
    }
  }
  installedDisposers = [];
}

/**
 * Test-only: directly drive the handler with a synthetic event. Useful
 * for unit tests so they do not need to publish through the bus and
 * deal with cross-event subscriber bleed.
 */
export async function _handleEventForTest(event: ComplianceEvent): Promise<AutomationStats> {
  return handleEvent(event);
}

export type { ComplianceEvent, ComplianceEventType, ComplianceEventPayloadMap };
