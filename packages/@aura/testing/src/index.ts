/**
 * @aura/testing
 * Shared Testing Utilities for AuraOS
 *
 * Exports:
 *  - Factories: createEmployee, createLeaveRequest, createPayrollRun
 *  - Mocks:     createPrismaMock, InMemoryRedisMock, InMemoryRabbitMQMock
 *  - Helpers:   wait, assertRejects, createMockRequest, createMockResponse
 *  - API:       assertPagination, assertValidation, buildPaginatedResponse
 */

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------
export * from './factories/employee-factory';
export * from './factories/leave-factory';
export * from './factories/payroll-factory';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
export * from './mocks/prisma-mock';
export * from './mocks/redis-mock';
export * from './mocks/rabbitmq-mock';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export * from './helpers/test-helpers';
export * from './helpers/api-test-helpers';
