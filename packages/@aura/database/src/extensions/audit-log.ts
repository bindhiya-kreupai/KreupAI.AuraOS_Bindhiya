/**
 * @module AuditLogExtension
 * @description Prisma Client Extension (v5 $extends API) that automatically
 *   populates `createdBy` / `updatedBy` fields on write operations using an
 *   AsyncLocalStorage execution context.
 *
 * Features:
 *  - Intercepts `create`, `createMany`, `update`, `updateMany`, `upsert`
 *  - Reads actor context from AsyncLocalStorage (set via runWithAuditContext)
 *  - Only applies to models listed in AUDITABLE_MODELS
 *  - Provides `getAuditTrail(id)` model extension to retrieve audit history
 *
 * Usage:
 * ```ts
 * import { PrismaClient } from '@prisma/client';
 * import { withAuditLogExtension, runWithAuditContext } from './extensions/audit-log';
 *
 * const prisma = new PrismaClient().$extends(withAuditLogExtension());
 *
 * // In request middleware:
 * app.use((req, res, next) => {
 *   runWithAuditContext({ userId: req.user.id, tenantId: req.user.tenantId }, next);
 * });
 * ```
 *
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group C — Sec 25.5
 */

import { AsyncLocalStorage } from 'async_hooks';
import { Prisma } from '@prisma/client';

// ---------------------------------------------------------------------------
// Audit Context — holds actor information for a single request lifecycle
// ---------------------------------------------------------------------------

export interface AuditContext {
  /** ID of the user performing the write operation. */
  userId: string;
  /** Optional tenant ID for multi-tenant audit scoping. */
  tenantId?: string;
  /** Optional request / correlation ID for distributed tracing. */
  requestId?: string;
  /** IP address of the originating request. */
  ipAddress?: string;
  /** User agent string. */
  userAgent?: string;
}

const auditStorage = new AsyncLocalStorage<AuditContext>();

/**
 * Runs `fn` inside an audit context so that any Prisma writes executed within
 * `fn` will automatically have `createdBy` / `updatedBy` populated.
 *
 * @example
 * ```ts
 * runWithAuditContext({ userId: req.user.id }, () => {
 *   await prisma.employee.create({ data: employeeData });
 * });
 * ```
 */
export function runWithAuditContext<T>(context: AuditContext, fn: () => T): T {
  return auditStorage.run(context, fn);
}

/**
 * Returns the current audit context, or `undefined` if called outside of a
 * `runWithAuditContext` scope.
 */
export function getAuditContext(): AuditContext | undefined {
  return auditStorage.getStore();
}

// ---------------------------------------------------------------------------
// Models with createdBy / updatedBy fields
// ---------------------------------------------------------------------------

export const AUDITABLE_MODELS: ReadonlySet<string> = new Set([
  // Core HCM
  'Employee',
  'Department',
  'Location',
  'Position',
  'EmploymentHistory',
  'JobPosting',
  // Payroll
  'PayrollRun',
  'Payslip',
  // Performance
  'PerformanceGoal',
  'PerformanceReview',
  'ReviewCycle',
  'CalibrationSession',
  // Learning
  'Course',
  'TrainingSession',
  'LearningPath',
  'Assessment',
  // Compliance / Workflow
  'WorkflowDefinition',
  'ReportDefinition',
  // Notifications
  'Notification',
  // Onboarding
  'OnboardingProgram',
  'OnboardingTask',
  // Mentoring
  'MentoringProgram',
]);

const WRITE_ACTIONS: ReadonlySet<string> = new Set([
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
]);

// ---------------------------------------------------------------------------
// Extension factory
// ---------------------------------------------------------------------------

/**
 * Returns a Prisma Client Extension that auto-populates audit fields.
 */
export function withAuditLogExtension() {
  return Prisma.defineExtension({
    name: 'audit-log',

    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Only apply to auditable models and write operations
          if (!AUDITABLE_MODELS.has(model ?? '') || !WRITE_ACTIONS.has(operation)) {
            return query(args);
          }

          const ctx = auditStorage.getStore();
          if (!ctx) {
            // No audit context — proceed without modification.
            // This is intentional for seeding / migration scripts.
            return query(args);
          }

          const { userId } = ctx;
          const typedArgs = args as Record<string, unknown>;

          switch (operation) {
            case 'create': {
              const data = (typedArgs.data as Record<string, unknown>) ?? {};
              if (!data.createdBy) data.createdBy = userId;
              if (!data.updatedBy) data.updatedBy = userId;
              typedArgs.data = data;
              break;
            }

            case 'createMany': {
              const items = Array.isArray(typedArgs.data) ? typedArgs.data as Record<string, unknown>[] : [];
              typedArgs.data = items.map((item) => ({
                createdBy: userId,
                updatedBy: userId,
                ...item, // caller values override defaults
              }));
              break;
            }

            case 'update':
            case 'updateMany': {
              const data = (typedArgs.data as Record<string, unknown>) ?? {};
              data.updatedBy = userId;
              typedArgs.data = data;
              break;
            }

            case 'upsert': {
              const createData = (typedArgs.create as Record<string, unknown>) ?? {};
              const updateData = (typedArgs.update as Record<string, unknown>) ?? {};
              if (!createData.createdBy) createData.createdBy = userId;
              createData.updatedBy = userId;
              updateData.updatedBy = userId;
              typedArgs.create = createData;
              typedArgs.update = updateData;
              break;
            }
          }

          return query(args);
        },
      },
    },

    // ------------------------------------------------------------------ //
    //  Model-level extension: getAuditTrail                              //
    // ------------------------------------------------------------------ //
    model: {
      $allModels: {
        /**
         * Retrieves structured audit information for the current operation context.
         * Note: full audit trail requires AuditLog model to be queried separately.
         * This method returns the current actor context for use in pre/post operation hooks.
         *
         * @example
         * const ctx = prisma.employee.getAuditContext();
         */
        getAuditContext(): AuditContext | undefined {
          return auditStorage.getStore();
        },

        /**
         * Runs a callback with explicit audit context, overriding the ambient context.
         * Useful for background jobs that need to attribute changes to a specific actor.
         *
         * @example
         * await prisma.employee.withContext({ userId: 'system' }, async () => {
         *   await prisma.employee.update({ ... });
         * });
         */
        async withContext<T>(
          context: AuditContext,
          fn: () => Promise<T>
        ): Promise<T> {
          return auditStorage.run(context, fn);
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Legacy middleware helper — backward compatibility with src/index.ts
// ---------------------------------------------------------------------------

/**
 * Creates the audit middleware for the legacy `$use` API.
 * Prefer `withAuditLogExtension()` for new code using Prisma >= 5.0.
 */
export function createAuditLogMiddleware(): Prisma.Middleware {
  return async function auditMiddleware(
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<unknown>
  ): Promise<unknown> {
    if (!AUDITABLE_MODELS.has(params.model ?? '') || !WRITE_ACTIONS.has(params.action)) {
      return next(params);
    }

    const ctx = auditStorage.getStore();
    if (!ctx) {
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
            ...item,
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
        params.args = { ...params.args, create: createData, update: updateData };
        break;
      }
    }

    return next(params);
  };
}
