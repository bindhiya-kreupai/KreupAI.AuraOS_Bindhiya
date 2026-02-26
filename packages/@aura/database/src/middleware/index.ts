/**
 * @module Middleware
 * @description Re-exports all Prisma middleware helpers for AuraOS.
 *
 * @project AuraOS Enterprise HCM
 * @section 25.1 - Schema Governance
 */

export {
  createSoftDeleteMiddleware,
  withSoftDelete,
  SOFT_DELETE_MODELS,
} from './soft-delete';

export {
  createAuditMiddleware,
  withAudit,
  runWithAuditContext,
  getAuditContext,
  AUDITABLE_MODELS,
} from './audit';

export type { AuditContext } from './audit';
