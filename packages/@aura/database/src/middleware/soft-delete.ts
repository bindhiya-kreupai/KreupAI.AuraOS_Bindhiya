/**
 * @module SoftDeleteMiddleware
 * @description Prisma middleware that intercepts delete operations and converts
 * them to soft-deletes by setting `deletedAt` and `isDeleted` fields.
 * Also filters out soft-deleted records on find operations by default.
 *
 * @project AuraOS Enterprise HCM
 * @section 25.1 - Schema Governance
 */

import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Models that support soft-delete (i.e. have deletedAt + isDeleted fields).
 * Only these models will have the soft-delete behaviour applied.
 */
export const SOFT_DELETE_MODELS: Readonly<Set<string>> = new Set([
  'Employee',
  'Department',
  'Location',
  'JobPosting',
  'LeaveRequest',
  'Position',
  'EmploymentHistory',
]);

/**
 * Determines whether a given Prisma model supports soft-delete.
 */
function isSoftDeleteModel(model: string | undefined): boolean {
  if (!model) return false;
  return SOFT_DELETE_MODELS.has(model);
}

/**
 * Soft-delete middleware function.
 *
 * Behaviour:
 *  - `delete`      → converted to `update` with `{ deletedAt: now, isDeleted: true }`
 *  - `deleteMany`  → converted to `updateMany` with the same patch, scoped to the
 *                    original `where` clause
 *  - `findUnique`  → converted to `findFirst` with an added `isDeleted: false` filter
 *  - `findFirst`   → adds `isDeleted: false` to the `where` clause
 *  - `findMany`    → adds `isDeleted: false` to the `where` clause
 *  - `count`       → adds `isDeleted: false` to the `where` clause
 *  - `aggregate`   → adds `isDeleted: false` to the `where` clause
 *
 * Callers that intentionally need to include soft-deleted records can bypass this
 * middleware by passing `{ where: { isDeleted: undefined } }` — Prisma will then
 * see the field as absent and skip the injected filter.
 */
export function createSoftDeleteMiddleware(): Prisma.Middleware {
  return async function softDeleteMiddleware(
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<unknown>
  ): Promise<unknown> {
    if (!isSoftDeleteModel(params.model)) {
      return next(params);
    }

    // ------------------------------------------------------------------ //
    //  Write interception: delete → soft-delete                           //
    // ------------------------------------------------------------------ //
    if (params.action === 'delete') {
      // Convert hard-delete into a soft-delete update
      params.action = 'update';
      params.args = {
        ...(params.args || {}),
        data: {
          deletedAt: new Date(),
          isDeleted: true,
        },
      };
      return next(params);
    }

    if (params.action === 'deleteMany') {
      // Convert hard-deleteMany into a soft-deleteMany (updateMany)
      params.action = 'updateMany';
      params.args = {
        where: params.args?.where ?? {},
        data: {
          deletedAt: new Date(),
          isDeleted: true,
        },
      };
      return next(params);
    }

    // ------------------------------------------------------------------ //
    //  Read interception: inject isDeleted: false unless already filtered //
    // ------------------------------------------------------------------ //
    const READ_ACTIONS = new Set([
      'findUnique',
      'findFirst',
      'findMany',
      'count',
      'aggregate',
      'groupBy',
    ]);

    if (READ_ACTIONS.has(params.action)) {
      // If the caller has not already provided an explicit isDeleted filter,
      // add the default "exclude soft-deleted rows" filter.
      const where = params.args?.where;

      if (where === undefined || where === null) {
        params.args = {
          ...(params.args || {}),
          where: { isDeleted: false },
        };
      } else if (typeof where === 'object' && !('isDeleted' in where)) {
        params.args = {
          ...params.args,
          where: { ...where, isDeleted: false },
        };
      }

      // `findUnique` with an extra filter must be promoted to `findFirst`
      if (params.action === 'findUnique') {
        params.action = 'findFirst';
      }

      return next(params);
    }

    return next(params);
  };
}

/**
 * Applies the soft-delete middleware to a PrismaClient instance and returns
 * the same client (for chaining with other middleware helpers).
 *
 * @example
 * ```ts
 * import { prisma } from './index';
 * import { withSoftDelete } from './middleware/soft-delete';
 *
 * withSoftDelete(prisma);
 * ```
 */
export function withSoftDelete(client: PrismaClient): PrismaClient {
  client.$use(createSoftDeleteMiddleware());
  return client;
}
