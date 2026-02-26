/**
 * @module AuditMiddleware
 * @description Prisma middleware that automatically populates `createdBy` and
 * `updatedBy` fields on write operations using a per-request execution context.
 *
 * The actor (user ID) is provided via the AsyncLocalStorage context so that
 * middleware does not need to be threaded through every service call manually.
 *
 * @project AuraOS Enterprise HCM
 * @section 25.1 - Schema Governance
 */

import { AsyncLocalStorage } from 'async_hooks';
import { Prisma, PrismaClient } from '@prisma/client';

// ============================================================================
// Audit context – holds the current actor ID for the lifecycle of a request
// ============================================================================

export interface AuditContext {
  /** The ID of the user performing the write operation. */
  userId: string;
  /** Optional tenant ID for multi-tenant audit scoping. */
  tenantId?: string;
}

const auditStorage = new AsyncLocalStorage<AuditContext>();

/**
 * Runs `fn` inside an audit context so that any Prisma writes executed within
 * `fn` will automatically have `createdBy` / `updatedBy` populated.
 *
 * @example
 * ```ts
 * import { runWithAuditContext } from '@aura/database/middleware/audit';
 *
 * // In an Express handler:
 * app.use((req, res, next) => {
 *   runWithAuditContext({ userId: req.user.id, tenantId: req.user.tenantId }, next);
 * });
 * ```
 */
export function runWithAuditContext<T>(
  context: AuditContext,
  fn: () => T
): T {
  return auditStorage.run(context, fn);
}

/**
 * Returns the current audit context, or `undefined` if called outside of a
 * `runWithAuditContext` scope.
 */
export function getAuditContext(): AuditContext | undefined {
  return auditStorage.getStore();
}

// ============================================================================
// Models that carry createdBy / updatedBy
// ============================================================================

/**
 * Models where `createdBy` / `updatedBy` should be auto-populated.
 * Add a model name here as soon as it gains those fields in the schema.
 */
export const AUDITABLE_MODELS: Readonly<Set<string>> = new Set([
  'Employee',
  'Department',
  'Location',
  'JobPosting',
  'LeaveRequest',
  'Position',
  'EmploymentHistory',
  // Extended models that already carry createdBy in schema:
  'PayrollRun',
  'PerformanceGoal',
  'PerformanceReview',
  'ReviewCycle',
  'CalibrationSession',
  'WorkflowDefinition',
  'ReportDefinition',
  'Notification',
  'Course',
  'TrainingSession',
  'LearningPath',
  'Assessment',
  'MentoringProgram',
  'OnboardingProgram',
  'OnboardingTask',
]);

const WRITE_ACTIONS = new Set([
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
]);

function isAuditableModel(model: string | undefined): boolean {
  if (!model) return false;
  return AUDITABLE_MODELS.has(model);
}

// ============================================================================
// Middleware factory
// ============================================================================

/**
 * Creates the audit middleware function.
 *
 * On `create` / `upsert` (create branch): sets both `createdBy` and `updatedBy`.
 * On `update` / `updateMany` / `upsert` (update branch): sets only `updatedBy`.
 * On `createMany`: injects `createdBy` and `updatedBy` into every item in the
 * `data` array (items that already have a value are left untouched).
 */
export function createAuditMiddleware(): Prisma.Middleware {
  return async function auditMiddleware(
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<unknown>
  ): Promise<unknown> {
    if (!isAuditableModel(params.model) || !WRITE_ACTIONS.has(params.action)) {
      return next(params);
    }

    const ctx = auditStorage.getStore();
    if (!ctx) {
      // No audit context – proceed without modification.
      // This is intentional for seeding / migration scripts.
      return next(params);
    }

    const { userId } = ctx;

    switch (params.action) {
      case 'create': {
        const data = params.args?.data ?? {};
        if (!data.createdBy) data.createdBy = userId;
        if (!data.updatedBy) data.updatedBy = userId;
        params.args = { ...params.args, data };
        break;
      }

      case 'createMany': {
        const items: Record<string, unknown>[] = Array.isArray(params.args?.data)
          ? params.args.data
          : [];
        params.args = {
          ...params.args,
          data: items.map((item) => ({
            createdBy: userId,
            updatedBy: userId,
            ...item, // item values override defaults so explicit data is preserved
          })),
        };
        break;
      }

      case 'update':
      case 'updateMany': {
        const data = params.args?.data ?? {};
        data.updatedBy = userId;
        params.args = { ...params.args, data };
        break;
      }

      case 'upsert': {
        const createData = params.args?.create ?? {};
        const updateData = params.args?.update ?? {};
        if (!createData.createdBy) createData.createdBy = userId;
        createData.updatedBy = userId;
        updateData.updatedBy = userId;
        params.args = {
          ...params.args,
          create: createData,
          update: updateData,
        };
        break;
      }
    }

    return next(params);
  };
}

// ============================================================================
// Public helper
// ============================================================================

/**
 * Applies the audit middleware to a PrismaClient instance and returns the same
 * client for chaining with other middleware helpers.
 *
 * @example
 * ```ts
 * import { prisma } from '../index';
 * import { withAudit } from './middleware/audit';
 * import { withSoftDelete } from './middleware/soft-delete';
 *
 * withSoftDelete(withAudit(prisma));
 * ```
 */
export function withAudit(client: PrismaClient): PrismaClient {
  client.$use(createAuditMiddleware());
  return client;
}
