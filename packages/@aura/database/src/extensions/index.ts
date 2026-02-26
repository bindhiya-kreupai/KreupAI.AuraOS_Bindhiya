/**
 * @module ExtensionsBarrel
 * @description Barrel export for all Prisma Client extensions.
 *
 * Available extensions:
 *  - `withSoftDeleteExtension()` — converts delete to soft-delete and filters deleted records
 *  - `withAuditLogExtension()` — auto-populates createdBy/updatedBy from async context
 *  - `runWithAuditContext()` — sets the actor for the current async execution chain
 *  - `getAuditContext()` — retrieves the current actor context
 *
 * Usage (combining extensions):
 * ```ts
 * import { PrismaClient } from '@prisma/client';
 * import { withSoftDeleteExtension, withAuditLogExtension } from '@aura/database/extensions';
 *
 * const prisma = new PrismaClient()
 *   .$extends(withSoftDeleteExtension())
 *   .$extends(withAuditLogExtension());
 *
 * export { prisma };
 * ```
 *
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group C — Sec 25.5
 */

// Soft-delete extension
export {
  withSoftDeleteExtension,
  createSoftDeleteExtensionMiddleware,
  SOFT_DELETE_MODELS,
} from './soft-delete';

// Audit-log extension
export {
  withAuditLogExtension,
  createAuditLogMiddleware,
  runWithAuditContext,
  getAuditContext,
  AUDITABLE_MODELS,
} from './audit-log';

export type { AuditContext } from './audit-log';
