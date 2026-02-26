/**
 * @aura/events
 * Event-Driven Architecture Package
 *
 * Exports:
 *  - In-process EventBus (pub/sub, no external dependencies)
 *  - RabbitMQ-backed event bus for cross-service messaging
 *  - Domain event types & creators for all AuraOS domains
 *  - Saga orchestrator for distributed transactions
 */

// ---------------------------------------------------------------------------
// Event Bus (in-process)
// ---------------------------------------------------------------------------
export * from './lib/event-bus';

// ---------------------------------------------------------------------------
// RabbitMQ Event Bus
// ---------------------------------------------------------------------------
export * from './lib/rabbitmq-bus';

// ---------------------------------------------------------------------------
// Domain Events
// ---------------------------------------------------------------------------
export * from './events/employee-events';
export * from './events/leave-events';
export * from './events/payroll-events';
export * from './events/attendance-events';
export * from './events/compliance-events';
export * from './events/workflow-events';

// ---------------------------------------------------------------------------
// Saga Orchestration (distributed transactions)
// ---------------------------------------------------------------------------
export * from './saga/saga-orchestrator';
export * from './saga/saga-definitions';
export * from './saga/saga-store';
