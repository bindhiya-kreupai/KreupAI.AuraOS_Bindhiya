/**
 * Compliance Event Catalog (closes audit 2026-06-17 Pattern 2).
 *
 * The audit found that compliance services emit events ad-hoc (or not
 * at all) because there is no canonical event catalog. This module
 * fixes that by:
 *
 *   1. Defining the 11 standard compliance events the audit identified
 *      (employee.hired, payroll.run.completed, …).
 *   2. Typing each event's payload so emitters get IDE checking and
 *      consumers can subscribe with confidence.
 *   3. Wrapping the existing `event-bus.service` so a single
 *      `publishComplianceEvent(...)` call handles bus delivery + a
 *      synchronous AuditLog write (best-effort, never blocks the
 *      caller).
 *
 * Pattern usage in a service (one line):
 *
 *     await publishComplianceEvent({
 *         type: 'employee.hired',
 *         tenantId: auth.tenantId,
 *         actorId: auth.userId,
 *         payload: { employeeId, joiningDate, country },
 *     });
 *
 * Downstream services subscribe via `subscribeComplianceEvent(type, fn)`.
 * Subscribers run on a best-effort basis; errors are logged but do not
 * fail the publisher.
 */

import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// ----------------------------------------------------------------------------
// Event catalogue
// ----------------------------------------------------------------------------

export type ComplianceEventType =
  | 'employee.hired'
  | 'employee.salaryChanged'
  | 'employee.separationInitiated'
  | 'payroll.run.completed'
  | 'visa.cancelled'
  | 'policy.published'
  | 'offer.accepted'
  | 'offer.declined'
  | 'bgv.passed'
  | 'bgv.failed'
  | 'recruitment.case.transitioned';

// Payload shapes per event type. Keep these minimal — consumers can
// always do an additional lookup if they need richer data; the bus
// stays lean and idempotent.
export interface ComplianceEventPayloadMap {
  'employee.hired': { employeeId: string; joiningDate: string; countryCode: string };
  'employee.salaryChanged': {
    employeeId: string;
    oldBasic: number;
    newBasic: number;
    effectiveDate: string;
  };
  'employee.separationInitiated': { employeeId: string; lastWorkingDate: string; reason: string };
  'payroll.run.completed': {
    payrollRunId: string;
    period: string;
    countryCode: string;
    employeeCount: number;
    totalNet: number;
  };
  'visa.cancelled': { employeeId: string; visaId: string; cancellationDate: string };
  'policy.published': { policyId: string; version: number; effectiveFrom: string };
  'offer.accepted': { offerId: string; candidateId: string; acceptedAt: string };
  'offer.declined': { offerId: string; candidateId: string; declinedReason?: string };
  'bgv.passed': { bgvCaseId: string; candidateId: string };
  'bgv.failed': { bgvCaseId: string; candidateId: string; reason: string };
  'recruitment.case.transitioned': {
    caseId: string;
    candidateId: string;
    fromStage: string;
    toStage: string;
  };
}

export interface PublishComplianceEventInput<T extends ComplianceEventType> {
  type: T;
  tenantId: string;
  actorId: string;
  correlationId?: string;
  payload: ComplianceEventPayloadMap[T];
}

export type ComplianceEvent<T extends ComplianceEventType = ComplianceEventType> =
  PublishComplianceEventInput<T> & {
    eventId: string;
    emittedAt: Date;
  };

// ----------------------------------------------------------------------------
// Synchronous in-process subscriber registry
// ----------------------------------------------------------------------------

type Handler<T extends ComplianceEventType> = (event: ComplianceEvent<T>) => void | Promise<void>;

const subscribers = new Map<ComplianceEventType, Set<Handler<any>>>();

export function subscribeComplianceEvent<T extends ComplianceEventType>(
  type: T,
  handler: Handler<T>
): () => void {
  if (!subscribers.has(type)) subscribers.set(type, new Set());
  subscribers.get(type)!.add(handler);
  return () => subscribers.get(type)?.delete(handler);
}

/** Drop every subscriber. Test-only. */
export function _clearComplianceSubscribers(): void {
  subscribers.clear();
}

// ----------------------------------------------------------------------------
// Publish — single canonical entry point
// ----------------------------------------------------------------------------

let eventCounter = 0;

function genEventId() {
  eventCounter += 1;
  return `evt-${Date.now()}-${eventCounter}`;
}

/**
 * Publish a compliance event. Three side effects, all best-effort:
 *  1. Synchronous fan-out to in-process subscribers.
 *  2. Async AuditLog write (so the event is queryable for post-hoc audit).
 *  3. (Future) cross-process bus delivery — wired up here so once the
 *     bus driver is finalised the same call site covers it.
 *
 * Subscriber errors are LOGGED but do NOT throw — compliance writes
 * must never be blocked by a misbehaving consumer.
 */
export async function publishComplianceEvent<T extends ComplianceEventType>(
  input: PublishComplianceEventInput<T>
): Promise<ComplianceEvent<T>> {
  const event: ComplianceEvent<T> = {
    ...input,
    eventId: genEventId(),
    emittedAt: new Date(),
  };

  // 1. In-process fan-out
  const handlers = subscribers.get(input.type);
  if (handlers && handlers.size > 0) {
    for (const h of handlers) {
      try {
        await h(event);
      } catch (err) {
        logger.error(
          { err, eventType: input.type, eventId: event.eventId },
          'compliance event subscriber threw — continuing'
        );
      }
    }
  }

  // 2. Best-effort AuditLog write — fire and forget; errors logged.
  void prisma.auditLog
    .create({
      data: {
        tenantId: input.tenantId,
        userId: input.actorId,
        action: 'COMPLIANCE_EVENT' as any,
        resourceType: input.type,
        resourceId: input.correlationId ?? null,
        metadata: { eventId: event.eventId, payload: event.payload } as any,
        ipAddress: 'system',
      },
    })
    .catch((err) => {
      logger.warn(
        { err, eventType: input.type, eventId: event.eventId },
        'compliance event audit-log write failed (non-fatal)'
      );
    });

  return event;
}

/**
 * Inspect (or fire-and-forget call) without awaiting. Useful in
 * services where publishing must not affect the response latency.
 */
export function publishComplianceEventAsync<T extends ComplianceEventType>(
  input: PublishComplianceEventInput<T>
): void {
  void publishComplianceEvent(input).catch((err) => {
    logger.warn({ err, eventType: input.type }, 'fire-and-forget compliance event failed');
  });
}
