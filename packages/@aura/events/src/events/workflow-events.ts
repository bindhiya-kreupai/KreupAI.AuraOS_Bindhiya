/**
 * Workflow Domain Events
 *
 * @module @aura/events
 */

import { DomainEvent } from '../lib/event-bus';

// ---------------------------------------------------------------------------
// Event type union
// ---------------------------------------------------------------------------

export type WorkflowEventType =
  | 'WorkflowStepCompleted'
  | 'WorkflowEscalated'
  | 'WorkflowTimeout'
  | 'WorkflowCompleted'
  | 'WorkflowRejected'
  | 'WorkflowCancelled';

// ---------------------------------------------------------------------------
// Payloads
// ---------------------------------------------------------------------------

export interface WorkflowStepCompletedPayload {
  workflowInstanceId: string;
  workflowDefinitionId: string;
  workflowType: string;          // e.g. 'LeaveApproval', 'ExpenseClaim'
  stepId: string;
  stepName: string;
  stepOrder: number;
  totalSteps: number;
  completedBy: string;
  completedByName: string;
  completedAt: Date;
  decision: 'approved' | 'rejected' | 'delegated';
  comments?: string;
  nextStepId?: string;
  nextAssignee?: string;
}

export interface WorkflowEscalatedPayload {
  workflowInstanceId: string;
  workflowType: string;
  stepId: string;
  stepName: string;
  originalAssignee: string;
  originalAssigneeName: string;
  escalatedTo: string;
  escalatedToName: string;
  escalatedAt: Date;
  reason: 'TIMEOUT' | 'MANUAL' | 'OUT_OF_OFFICE';
  pendingSinceHours: number;
}

export interface WorkflowTimeoutPayload {
  workflowInstanceId: string;
  workflowType: string;
  stepId: string;
  stepName: string;
  assignee: string;
  assigneeName: string;
  dueDate: Date;
  timedOutAt: Date;
  autoEscalated: boolean;
}

export interface WorkflowCompletedPayload {
  workflowInstanceId: string;
  workflowType: string;
  initiatedBy: string;
  initiatedByName: string;
  completedAt: Date;
  totalDurationMinutes: number;
  outcome: 'approved' | 'rejected';
  referenceId: string;           // ID of the entity this workflow acted upon
  referenceType: string;         // e.g. 'LeaveRequest', 'ExpenseClaim'
}

// ---------------------------------------------------------------------------
// Event creators
// ---------------------------------------------------------------------------

export function createWorkflowStepCompletedEvent(
  tenantId: string,
  userId: string,
  payload: WorkflowStepCompletedPayload
): Omit<DomainEvent<WorkflowStepCompletedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'WorkflowStepCompleted',
    aggregateId: payload.workflowInstanceId,
    aggregateType: 'Workflow',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createWorkflowEscalatedEvent(
  tenantId: string,
  userId: string,
  payload: WorkflowEscalatedPayload
): Omit<DomainEvent<WorkflowEscalatedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'WorkflowEscalated',
    aggregateId: payload.workflowInstanceId,
    aggregateType: 'Workflow',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createWorkflowTimeoutEvent(
  tenantId: string,
  userId: string,
  payload: WorkflowTimeoutPayload
): Omit<DomainEvent<WorkflowTimeoutPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'WorkflowTimeout',
    aggregateId: payload.workflowInstanceId,
    aggregateType: 'Workflow',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createWorkflowCompletedEvent(
  tenantId: string,
  userId: string,
  payload: WorkflowCompletedPayload
): Omit<DomainEvent<WorkflowCompletedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'WorkflowCompleted',
    aggregateId: payload.workflowInstanceId,
    aggregateType: 'Workflow',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}
