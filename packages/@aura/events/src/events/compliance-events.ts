/**
 * Compliance Domain Events
 *
 * @module @aura/events
 */

import { DomainEvent } from '../lib/event-bus';

// ---------------------------------------------------------------------------
// Event type union
// ---------------------------------------------------------------------------

export type ComplianceEventType =
  | 'ComplianceDeadlineApproaching'
  | 'ComplianceFilingCompleted'
  | 'ComplianceViolationDetected'
  | 'ComplianceAuditInitiated'
  | 'ComplianceAuditCompleted';

// ---------------------------------------------------------------------------
// Payloads
// ---------------------------------------------------------------------------

export interface ComplianceDeadlineApproachingPayload {
  complianceId: string;
  country: string;
  regulation: string;          // e.g. 'WPS', 'GOSI', 'VAT', 'TDS'
  deadline: Date;
  daysRemaining: number;
  period: string;              // e.g. '2025-01'
  responsibleParty?: string;
  description: string;
}

export interface ComplianceFilingCompletedPayload {
  complianceId: string;
  country: string;
  regulation: string;
  period: string;
  filedAt: Date;
  filedBy: string;
  referenceNumber?: string;
  acknowledgementNumber?: string;
  amount?: number;
  currency?: string;
}

export interface ComplianceViolationDetectedPayload {
  violationId: string;
  complianceId: string;
  country: string;
  regulation: string;
  period: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  affectedEmployeeCount?: number;
  estimatedPenalty?: number;
  currency?: string;
}

// ---------------------------------------------------------------------------
// Event creators
// ---------------------------------------------------------------------------

export function createComplianceDeadlineApproachingEvent(
  tenantId: string,
  userId: string,
  payload: ComplianceDeadlineApproachingPayload
): Omit<DomainEvent<ComplianceDeadlineApproachingPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'ComplianceDeadlineApproaching',
    aggregateId: payload.complianceId,
    aggregateType: 'Compliance',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createComplianceFilingCompletedEvent(
  tenantId: string,
  userId: string,
  payload: ComplianceFilingCompletedPayload
): Omit<DomainEvent<ComplianceFilingCompletedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'ComplianceFilingCompleted',
    aggregateId: payload.complianceId,
    aggregateType: 'Compliance',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createComplianceViolationDetectedEvent(
  tenantId: string,
  userId: string,
  payload: ComplianceViolationDetectedPayload
): Omit<DomainEvent<ComplianceViolationDetectedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'ComplianceViolationDetected',
    aggregateId: payload.violationId,
    aggregateType: 'Compliance',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}
